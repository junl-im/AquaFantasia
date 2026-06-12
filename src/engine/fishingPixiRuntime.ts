// Aqua Fantasia v5.2 Casual Refactor - Pixi.js 낚시 렌더링 엔진
// ----------------------------------------------------------------
// 목표:
// - 기본 도형(Graphics) 위주 연출을 버리고 Sprite/Container 중심 구조로 구성합니다.
// - 찌 투척은 포물선 Tween, 입질은 water_ripple 확산 + 카메라 셰이크를 사용합니다.
// - 모바일 해상도에 맞춰 stage가 유기적으로 스케일됩니다.

import { Application, Assets, Container, Sprite, Texture, Ticker } from 'pixi.js';

export type FishingPhase = 'READY' | 'CASTING' | 'WAITING' | 'BITE' | 'REELING' | 'CATCH' | 'FAIL';

export interface FishingPixiRuntimeOptions {
  host: HTMLElement;
  quality?: 'lite' | 'balanced' | 'quality';
  dprCap?: number;
}

export interface FishingRuntimeFrame {
  phase?: FishingPhase;
  tension?: number;
  progress?: number;
  isDown?: boolean;
  bitePosition?: { x: number; y: number };
}

const ASSET = {
  background: 'assets/art/v56_fishing_bg_lake.webp',
  ripple: 'assets/ui-kit/icons/water_ripple.png',
  bobber: 'assets/ui-kit/fishing_minigame/bobber_large.png',
  reelBar: 'assets/ui-kit/fishing_minigame/reel_bar_220px.png',
  tensionGauge: 'assets/ui-kit/icons/tension_gauge.png',
  fishIcons: [
    'assets/ui-kit/icons/fish_1.png',
    'assets/ui-kit/icons/fish_2.png',
    'assets/ui-kit/icons/fish_3.png',
    'assets/ui-kit/icons/fish_4.png',
    'assets/ui-kit/icons/fish_5.png',
    'assets/ui-kit/icons/fish_6.png',
  ],
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : 0));
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - clamp(t, 0, 1), 3);
}

function easeOutBack(t: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(clamp(t, 0, 1) - 1, 3) + c1 * Math.pow(clamp(t, 0, 1) - 1, 2);
}

function easeOutBounce(t: number) {
  const n1 = 7.5625;
  const d1 = 2.75;
  let x = clamp(t, 0, 1);
  if (x < 1 / d1) return n1 * x * x;
  if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + 0.75;
  if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + 0.9375;
  return n1 * (x -= 2.625 / d1) * x + 0.984375;
}

export class FishingPixiRuntime {
  private app?: Application;
  private host?: HTMLElement;
  private root = new Container();
  private waterLayer = new Container();
  private tackleLayer = new Container();
  private uiLayer = new Container();
  private effectLayer = new Container();
  private background?: Sprite;
  private bobber?: Sprite;
  private line?: Sprite;
  private reelBar?: Sprite;
  private tensionGauge?: Sprite;
  private fishMarker?: Sprite;
  private stageWidth = 390;
  private stageHeight = 720;
  private logicalWidth = 390;
  private logicalHeight = 720;
  private shakePower = 0;
  private bobberHome = { x: 195, y: 310 };
  private targetBite = { x: 0.5, y: 0.48 };
  private phase: FishingPhase = 'READY';
  private time = 0;
  private quality: 'lite' | 'balanced' | 'quality' = 'balanced';
  private textures = new Map<string, Texture>();

  async init(options: FishingPixiRuntimeOptions) {
    this.host = options.host;
    this.quality = options.quality || 'balanced';
    const dpr = clamp(window.devicePixelRatio || 1, 1, options.dprCap || (this.quality === 'lite' ? 1.1 : 1.6));

    this.app = new Application();
    await this.app.init({
      resizeTo: options.host,
      backgroundAlpha: 0,
      antialias: this.quality !== 'lite',
      autoDensity: true,
      resolution: dpr,
      powerPreference: this.quality === 'lite' ? 'low-power' : 'high-performance',
    });

    options.host.appendChild(this.app.canvas);
    this.app.stage.addChild(this.root);
    this.root.addChild(this.waterLayer, this.tackleLayer, this.effectLayer, this.uiLayer);

    await this.loadTextures();
    this.buildStage();
    this.resize();
    window.addEventListener('resize', () => this.resize(), { passive: true });
    this.app.ticker.add((ticker: Ticker) => this.tick(ticker.deltaMS / 1000));
  }

  private async loadTextures() {
    const urls = [ASSET.background, ASSET.ripple, ASSET.bobber, ASSET.reelBar, ASSET.tensionGauge, ...ASSET.fishIcons];
    await Promise.all(urls.map(async (url) => {
      try { this.textures.set(url, await Assets.load<Texture>(url)); }
      catch (error) { console.warn('[FishingPixiRuntime] 에셋 로드 실패', url, error); }
    }));
  }

  private texture(url: string) {
    return this.textures.get(url) || Texture.WHITE;
  }

  private sprite(url: string, anchor = 0.5) {
    const item = new Sprite(this.texture(url));
    item.anchor.set(anchor);
    return item;
  }

  private buildStage() {
    this.background = this.sprite(ASSET.background, 0.5);
    this.background.alpha = 0.92;
    this.waterLayer.addChild(this.background);

    // 낚싯줄은 line_glow SVG 대신 Pixi Sprite를 길게 늘려 사용합니다. Graphics를 쓰지 않습니다.
    this.line = new Sprite(Texture.WHITE);
    this.line.anchor.set(0, 0.5);
    this.line.tint = 0x9beafe;
    this.line.alpha = 0.72;
    this.line.height = 3;
    this.tackleLayer.addChild(this.line);

    this.bobber = this.sprite(ASSET.bobber, 0.5);
    this.bobber.scale.set(0.72);
    this.tackleLayer.addChild(this.bobber);

    this.reelBar = this.sprite(ASSET.reelBar, 0.5);
    this.reelBar.alpha = 0.9;
    this.reelBar.scale.set(1.06);
    this.uiLayer.addChild(this.reelBar);

    this.tensionGauge = this.sprite(ASSET.tensionGauge, 0.5);
    this.tensionGauge.alpha = 0.95;
    this.tensionGauge.scale.set(0.75);
    this.uiLayer.addChild(this.tensionGauge);

    this.fishMarker = this.sprite(ASSET.fishIcons[0], 0.5);
    this.fishMarker.scale.set(0.46);
    this.fishMarker.alpha = 0;
    this.effectLayer.addChild(this.fishMarker);
  }

  private resize() {
    if (!this.host || !this.app) return;
    const rect = this.host.getBoundingClientRect();
    this.stageWidth = Math.max(320, rect.width || window.innerWidth || 390);
    this.stageHeight = Math.max(520, rect.height || window.innerHeight || 720);
    const scale = Math.min(this.stageWidth / this.logicalWidth, this.stageHeight / this.logicalHeight);
    this.root.scale.set(scale);
    this.root.x = (this.stageWidth - this.logicalWidth * scale) / 2;
    this.root.y = (this.stageHeight - this.logicalHeight * scale) / 2;
    this.layoutSprites();
  }

  private layoutSprites() {
    if (!this.background) return;
    this.background.x = this.logicalWidth / 2;
    this.background.y = this.logicalHeight / 2;
    const bgScale = Math.max(this.logicalWidth / this.background.texture.width, this.logicalHeight / this.background.texture.height) * 1.05;
    this.background.scale.set(bgScale);

    if (this.bobber) {
      this.bobber.x = this.bobberHome.x;
      this.bobber.y = this.bobberHome.y;
    }
    if (this.line) {
      this.line.x = 52;
      this.line.y = 160;
      this.line.width = Math.max(80, this.bobberHome.x - 52);
      this.line.rotation = Math.atan2(this.bobberHome.y - 160, this.bobberHome.x - 52);
    }
    if (this.reelBar) {
      this.reelBar.x = this.logicalWidth / 2;
      this.reelBar.y = this.logicalHeight - 92;
    }
    if (this.tensionGauge) {
      this.tensionGauge.x = this.logicalWidth - 58;
      this.tensionGauge.y = this.logicalHeight - 156;
    }
  }

  cast() {
    this.phase = 'CASTING';
    const start = { x: 54, y: 160 };
    const end = { x: this.logicalWidth * 0.5, y: this.logicalHeight * 0.42 };
    const height = 165;
    const duration = 760;
    const began = performance.now();

    const animate = () => {
      const t = clamp((performance.now() - began) / duration, 0, 1);
      const e = easeOutCubic(t);
      const arc = Math.sin(e * Math.PI) * height;
      if (this.bobber) {
        this.bobber.x = start.x + (end.x - start.x) * e;
        this.bobber.y = start.y + (end.y - start.y) * e - arc;
        this.bobber.rotation = -0.45 + e * 0.72;
        this.bobber.scale.set(0.55 + 0.25 * easeOutBack(e));
      }
      this.updateLineToBobber();
      if (t < 1) requestAnimationFrame(animate);
      else {
        this.bobberHome = end;
        this.spawnRipple(end.x, end.y, 0.45);
      }
    };
    animate();
  }

  wait() { this.phase = 'WAITING'; }

  bite(position = { x: 0.5, y: 0.48 }) {
    this.phase = 'BITE';
    this.targetBite = position;
    const x = this.logicalWidth * position.x;
    const y = this.logicalHeight * position.y;
    this.bobberHome = { x, y };
    if (this.bobber) { this.bobber.x = x; this.bobber.y = y; }
    this.spawnRipple(x, y, 1.18);
    this.shakePower = this.quality === 'lite' ? 4 : 9;
  }

  reel() {
    this.phase = 'REELING';
    if (this.fishMarker) {
      this.fishMarker.alpha = 0.92;
      this.fishMarker.texture = this.texture(ASSET.fishIcons[Math.floor(Math.random() * ASSET.fishIcons.length)]);
    }
  }

  fail() {
    this.phase = 'FAIL';
    this.shakePower = 6;
  }

  playVictory(iconUrl?: string) {
    this.phase = 'CATCH';
    const fish = this.sprite(iconUrl || ASSET.fishIcons[0], 0.5);
    fish.x = this.logicalWidth / 2;
    fish.y = this.logicalHeight * 0.42;
    fish.scale.set(0.2);
    this.effectLayer.addChild(fish);
    const started = performance.now();
    const duration = 920;
    const animate = () => {
      const t = clamp((performance.now() - started) / duration, 0, 1);
      const b = easeOutBounce(t);
      fish.scale.set(0.2 + b * 1.28);
      fish.rotation = t * Math.PI * 2.2;
      fish.alpha = 1 - Math.max(0, t - 0.72) / 0.28;
      if (t < 1) requestAnimationFrame(animate);
      else fish.destroy();
    };
    animate();
  }

  update(frame: FishingRuntimeFrame) {
    if (frame.phase) this.phase = frame.phase;
    if (frame.bitePosition) this.targetBite = frame.bitePosition;
    if (this.tensionGauge) {
      const tension = clamp(frame.tension ?? 50, 0, 100);
      this.tensionGauge.tint = tension < 30 || tension > 70 ? 0xff7474 : 0xffffff;
      this.tensionGauge.rotation = (tension - 50) / 100 * 0.7;
    }
    if (this.reelBar) {
      const progress = clamp(frame.progress ?? 0, 0, 100);
      this.reelBar.scale.x = 1.0 + progress / 1000;
      this.reelBar.tint = frame.isDown ? 0xfff0a6 : 0xffffff;
    }
  }

  private tick(delta: number) {
    this.time += delta;
    if (this.bobber && (this.phase === 'WAITING' || this.phase === 'BITE')) {
      this.bobber.y = this.bobberHome.y + Math.sin(this.time * 4.2) * (this.phase === 'BITE' ? 7 : 3);
      this.bobber.rotation = Math.sin(this.time * 2.3) * 0.06;
      this.updateLineToBobber();
    }
    if (this.fishMarker && this.phase === 'REELING') {
      this.fishMarker.x = this.logicalWidth * 0.5 + Math.sin(this.time * 2.6) * 84;
      this.fishMarker.y = this.logicalHeight * 0.36 + Math.cos(this.time * 2.1) * 28;
      this.fishMarker.rotation = Math.sin(this.time * 4) * 0.22;
    }
    if (this.shakePower > 0.01) {
      this.root.x += (Math.random() - 0.5) * this.shakePower;
      this.root.y += (Math.random() - 0.5) * this.shakePower;
      this.shakePower *= 0.86;
      if (this.shakePower <= 0.05) this.resize();
    }
  }

  private updateLineToBobber() {
    if (!this.line || !this.bobber) return;
    const sx = 52;
    const sy = 160;
    const dx = this.bobber.x - sx;
    const dy = this.bobber.y - sy;
    this.line.x = sx;
    this.line.y = sy;
    this.line.width = Math.max(16, Math.sqrt(dx * dx + dy * dy));
    this.line.rotation = Math.atan2(dy, dx);
  }

  private spawnRipple(x: number, y: number, power = 1) {
    const ripple = this.sprite(ASSET.ripple, 0.5);
    ripple.x = x;
    ripple.y = y;
    ripple.alpha = 0.78;
    ripple.scale.set(0.16);
    this.effectLayer.addChild(ripple);
    const started = performance.now();
    const duration = this.quality === 'lite' ? 520 : 820;
    const animate = () => {
      const t = clamp((performance.now() - started) / duration, 0, 1);
      const e = easeOutCubic(t);
      ripple.scale.set(0.16 + e * 2.15 * power);
      ripple.alpha = (1 - t) * 0.78;
      if (t < 1) requestAnimationFrame(animate);
      else ripple.destroy();
    };
    animate();
  }

  destroy() {
    window.removeEventListener('resize', () => this.resize());
    this.app?.destroy(true, { children: true, texture: false });
    this.app = undefined;
  }
}

export async function connectFishingPixiRuntime(options: FishingPixiRuntimeOptions) {
  const runtime = new FishingPixiRuntime();
  await runtime.init(options);
  return runtime;
}
