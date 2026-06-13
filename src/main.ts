import { Application, Assets, Container, Sprite, Text } from 'pixi.js';
import './styles.css';
import { APP_VERSION, regions, fishDex } from './data';
import type { FishingState, RegionKey, SaveData, Screen } from './types';
import { loadSave, saveGame, tryAnonymousServerLink } from './storage';
import { initAudio, playSound } from './audio';
import { ToastManager } from './toast';

const ASSET = {
  loginBg: './assets/art/login_ocean_fishing_25d.webp',
  bgOcean: './assets/art/bg_ocean.webp',
  player: './assets/art/player_boat.png',
  float: './assets/art/fishing_float.png',
  fish: './assets/art/fish_clown.png',
  gauge: './assets/art/gauge_frame.png',
  slot: './assets/art/fish_slot.png',
  ripple: './assets/art/water_ripple_overlay.webp',
  caustics: './assets/art/caustic_sparkle_overlay.webp',
  castButton: './assets/ui/button_cast.png',
};

const dom = {
  app: document.querySelector<HTMLDivElement>('#app')!,
  toastRoot: document.querySelector<HTMLDivElement>('#toast-root')!,
};

class AquaFantasiaGame {
  private save: SaveData = loadSave();
  private screen: Screen = 'login';
  private toast!: ToastManager;
  private pixi?: Application;
  private stageHost?: HTMLDivElement;
  private pixiLayer?: HTMLDivElement;
  private uiLayer?: HTMLDivElement;
  private bgSprite?: Sprite;
  private player?: Sprite;
  private bobber?: Sprite;
  private fish?: Sprite;
  private biteText?: Text;
  private waterLayer?: HTMLDivElement;
  private castBtn?: HTMLButtonElement;
  private reelPanel?: HTMLDivElement;
  private tensionFill?: HTMLDivElement;
  private safeFill?: HTMLDivElement;
  private holdPad?: HTMLButtonElement;
  private state: FishingState = 'idle';
  private tension = 42;
  private safeTimer = 0;
  private holding = false;
  private biteTimeout = 0;
  private castStart = 0;
  private lastTick = performance.now();
  private compact = false;

  async boot(): Promise<void> {
    this.compact = window.matchMedia('(max-width: 420px), (prefers-reduced-motion: reduce)').matches || navigator.hardwareConcurrency <= 4;
    document.documentElement.classList.toggle('perf-lite', this.compact);
    this.toast = new ToastManager(dom.toastRoot, (screen) => this.go(screen));
    initAudio();
    this.sweepCaches();
    this.bindFullscreenHint();
    this.screen = 'login';
    this.renderLogin();
    void this.registerServiceWorker();
  }

  private clear(): void {
    window.clearTimeout(this.biteTimeout);
    if (this.pixi) {
      this.pixi.destroy(true, { children: true, texture: false });
      this.pixi = undefined;
    }
    dom.app.innerHTML = '';
    document.body.dataset.screen = this.screen;
  }

  private go(screen: Screen): void {
    playSound('tap');
    this.screen = screen;
    this.save.screen = screen;
    saveGame(this.save);
    if (screen === 'login') this.renderLogin();
    if (screen === 'village') this.renderVillage();
    if (screen === 'fishing') void this.renderFishing();
    if (screen === 'dex') this.renderDex();
    if (screen === 'shop') this.renderShop();
    if (screen === 'mission') this.renderMission();
  }

  private async startGame(linkServer = false): Promise<void> {
    await this.requestFullscreenSoft();
    if (linkServer) {
      const result = await tryAnonymousServerLink(this.save);
      this.toast.show({ type: result.ok ? 'reward' : 'normal', title: result.ok ? '익명 서버연동 완료' : '로컬 저장 진행', message: result.message });
    }
    this.go('village');
  }

  private renderLogin(): void {
    this.clear();
    const shell = document.createElement('main');
    shell.className = 'login-screen';
    shell.innerHTML = `
      <div class="login-bg" aria-hidden="true"></div>
      <div class="login-water water-ripple" aria-hidden="true"></div>
      <section class="login-card glass-card">
        <h1 class="game-logo">Aqua Fantasia</h1>
        <p class="login-copy">고퀄리티 원화풍 바다에서 시작하는 모바일 캐주얼 낚시</p>
        <div class="login-actions">
          <button class="image-btn primary" data-action="guest">🎣 로컬 게스트로 바로 시작</button>
          <button class="image-btn soft" data-action="new">✨ 처음부터 새 게임</button>
          <button class="image-btn soft" data-action="server">☁️ 익명 서버연동</button>
        </div>
        <label class="keep-login"><input type="checkbox" /> 이 기기에서 로그인 유지</label>
        <p class="small-note">서버 설정 전에도 로컬 저장으로 플레이됩니다.</p>
      </section>`;
    dom.app.appendChild(shell);
    shell.querySelector<HTMLButtonElement>('[data-action="guest"]')?.addEventListener('click', () => this.startGame(false));
    shell.querySelector<HTMLButtonElement>('[data-action="server"]')?.addEventListener('click', () => this.startGame(true));
    shell.querySelector<HTMLButtonElement>('[data-action="new"]')?.addEventListener('click', () => {
      this.save = { ...this.save, coins: 300, caught: {}, missions: {}, region: 'lake' };
      saveGame(this.save);
      this.toast.show({ type: 'reward', title: '새 게임 준비 완료', message: '잔잔한 해변에서 한 마리 잡아보세요.', actionScreen: 'fishing' });
      this.startGame(false);
    });
  }

  private renderVillage(): void {
    this.clear();
    const region = this.getRegion();
    const root = this.baseGameShell('village');
    root.insertAdjacentHTML('beforeend', `
      <section class="hero-card glass-card">
        <div>
          <span class="eyebrow">TODAY ROUTE</span>
          <h2>${region.name}</h2>
          <p>${region.subtitle}</p>
        </div>
        <button class="image-btn primary" data-go="fishing">낚시터로 출항</button>
      </section>
      <section class="region-grid">
        ${regions.map((r) => `<button class="region-card ${r.key === this.save.region ? 'active' : ''}" data-region="${r.key}">
          <img src="${r.bg}" alt="" loading="lazy" />
          <strong>${r.name}</strong><span>${r.subtitle}</span>
        </button>`).join('')}
      </section>`);
    dom.app.appendChild(root);
    this.mountBottomNav(root, 'village');
    root.querySelector('[data-go="fishing"]')?.addEventListener('click', () => this.go('fishing'));
    root.querySelectorAll<HTMLButtonElement>('[data-region]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.save.region = btn.dataset.region as RegionKey;
        saveGame(this.save);
        this.toast.show({ type: 'fishing', title: `${this.getRegion().name} 선택`, message: '지역 배경과 입질 난이도가 변경되었습니다.', actionScreen: 'fishing' });
        this.renderVillage();
      });
    });
  }

  private async renderFishing(): Promise<void> {
    this.clear();
    const root = this.baseGameShell('fishing');
    root.classList.add('fishing-shell');
    root.innerHTML += `
      <div class="fishing-top glass-card">
        <div><strong>${this.getRegion().name}</strong><span id="fishingHint">CAST를 눌러 찌를 던지세요</span></div>
        <button class="round-btn" data-go="dex">가방</button>
      </div>
      <div class="fishing-stage" id="fishingStage"><div class="pixi-layer"></div><div class="water-overlay"></div><div class="stage-ui"></div></div>
      <div class="reel-panel glass-card hidden" id="reelPanel">
        <img src="${ASSET.gauge}" alt="장력 게이지" />
        <div class="tension-track"><span class="safe-zone"></span><span class="tension-fill"></span></div>
        <button class="hold-pad">꾹 눌러 릴 감기</button>
        <p>녹색 안전지대를 3초 유지하세요. 0 또는 100이면 줄이 끊어집니다.</p>
      </div>`;
    dom.app.appendChild(root);
    root.querySelector('[data-go="dex"]')?.addEventListener('click', () => this.go('dex'));
    this.stageHost = root.querySelector<HTMLDivElement>('#fishingStage')!;
    this.pixiLayer = root.querySelector<HTMLDivElement>('.pixi-layer')!;
    this.uiLayer = root.querySelector<HTMLDivElement>('.stage-ui')!;
    this.waterLayer = root.querySelector<HTMLDivElement>('.water-overlay')!;
    this.reelPanel = root.querySelector<HTMLDivElement>('#reelPanel')!;
    this.tensionFill = root.querySelector<HTMLDivElement>('.tension-fill')!;
    this.safeFill = root.querySelector<HTMLDivElement>('.safe-zone')!;
    this.holdPad = root.querySelector<HTMLButtonElement>('.hold-pad')!;
    this.holdPad.addEventListener('pointerdown', (ev) => { this.holding = true; this.holdPad?.setPointerCapture(ev.pointerId); });
    this.holdPad.addEventListener('pointerup', () => { this.holding = false; });
    this.holdPad.addEventListener('pointercancel', () => { this.holding = false; });
    await this.initPixiStage();
  }

  private baseGameShell(name: string): HTMLElement {
    const root = document.createElement('main');
    root.className = `game-screen ${name}-screen`;
    root.innerHTML = `<div class="ambient-bg" aria-hidden="true"></div>`;
    return root;
  }

  private mountBottomNav(root: HTMLElement, active: Screen): void {
    const nav = document.createElement('nav');
    nav.className = 'bottom-nav glass-card';
    const items: Array<[Screen, string, string]> = [
      ['village', '🏠', '마을'], ['fishing', '🎣', '낚시'], ['dex', '🎒', '도감'], ['shop', '🛒', '상점'], ['mission', '📋', '미션'],
    ];
    nav.innerHTML = items.map(([screen, icon, label]) => `<button class="${screen === active ? 'active' : ''}" data-screen="${screen}"><b>${icon}</b><span>${label}</span></button>`).join('');
    root.appendChild(nav);
    nav.querySelectorAll<HTMLButtonElement>('[data-screen]').forEach((btn) => btn.addEventListener('click', () => this.go(btn.dataset.screen as Screen)));
  }

  private async initPixiStage(): Promise<void> {
    if (!this.pixiLayer || !this.stageHost) return;
    const app = new Application();
    await app.init({ resizeTo: this.stageHost, backgroundAlpha: 0, antialias: true, resolution: Math.min(window.devicePixelRatio || 1, 2), autoDensity: true });
    this.pixi = app;
    this.pixiLayer.appendChild(app.canvas);

    const textures = await Assets.load([this.getRegion().bg, ASSET.player, ASSET.float, ASSET.fish]);
    this.bgSprite = new Sprite(textures[this.getRegion().bg]);
    this.player = new Sprite(textures[ASSET.player]);
    this.bobber = new Sprite(textures[ASSET.float]);
    this.fish = new Sprite(textures[ASSET.fish]);
    this.biteText = new Text({ text: '!', style: { fontFamily: 'Arial', fontSize: 78, fontWeight: '900', fill: 0xff5848, stroke: { color: 0xffffff, width: 8 } } });

    const world = new Container();
    app.stage.addChild(world);
    world.addChild(this.bgSprite, this.player, this.bobber, this.fish, this.biteText);
    this.player.anchor.set(0.5, 0.9);
    this.bobber.anchor.set(0.5, 0.5);
    this.fish.anchor.set(0.5, 0.5);
    this.biteText.anchor.set(0.5);
    this.fish.visible = false;
    this.biteText.visible = false;
    this.resizePixi();
    window.addEventListener('resize', () => this.resizePixi(), { passive: true });

    this.createCastButton();
    this.stageHost.addEventListener('pointerdown', () => {
      if (this.state === 'bite') this.startReeling();
    });
    app.ticker.add(() => this.tick());
    this.state = 'idle';
  }

  private resizePixi(): void {
    if (!this.pixi || !this.bgSprite || !this.player || !this.bobber || !this.fish || !this.biteText) return;
    const w = this.pixi.screen.width;
    const h = this.pixi.screen.height;
    const bgScale = Math.max(w / this.bgSprite.texture.width, h / this.bgSprite.texture.height);
    this.bgSprite.scale.set(bgScale);
    this.bgSprite.position.set((w - this.bgSprite.texture.width * bgScale) / 2, (h - this.bgSprite.texture.height * bgScale) / 2);
    const base = Math.min(w, h);
    this.player.scale.set(base / 760);
    this.player.position.set(w * 0.27, h * 0.72);
    this.bobber.scale.set(base / 1120);
    this.bobber.position.set(w * 0.68, h * 0.60);
    this.fish.scale.set(base / 980);
    this.fish.position.set(w * 0.5, h * 0.52);
    this.biteText.position.set(w * 0.69, h * 0.42);
  }

  private createCastButton(): void {
    if (!this.uiLayer) return;
    this.uiLayer.innerHTML = `<button class="cast-button" type="button"><img src="${ASSET.castButton}" alt="CAST" /></button>`;
    this.castBtn = this.uiLayer.querySelector<HTMLButtonElement>('.cast-button')!;
    this.castBtn.addEventListener('click', () => this.castLine());
  }

  private castLine(): void {
    if (this.state !== 'idle' || !this.castBtn || !this.pixi || !this.bobber) return;
    playSound('cast');
    this.state = 'casting';
    this.castStart = performance.now();
    this.castBtn.classList.add('pop-out');
    this.setHint('포물선으로 찌를 던지는 중...');
    window.setTimeout(() => this.castBtn?.classList.add('hidden'), 260);
  }

  private scheduleBite(): void {
    this.state = 'waiting';
    this.setHint('입질을 기다리세요. 찌가 잠기면 화면을 터치!');
    const delay = 2000 + Math.random() * 1800;
    window.clearTimeout(this.biteTimeout);
    this.biteTimeout = window.setTimeout(() => this.triggerBite(), delay);
  }

  private triggerBite(): void {
    if (this.state !== 'waiting') return;
    playSound('bite');
    this.state = 'bite';
    this.biteText && (this.biteText.visible = true);
    this.stageHost?.classList.add('camera-shake');
    this.setHint('물었다! 화면을 터치해서 챔질하세요');
    window.setTimeout(() => this.stageHost?.classList.remove('camera-shake'), 450);
  }

  private startReeling(): void {
    if (this.state !== 'bite') return;
    this.state = 'reeling';
    this.tension = 46 + this.getRegion().difficulty * 4;
    this.safeTimer = 0;
    this.holding = false;
    if (this.biteText) this.biteText.visible = false;
    this.reelPanel?.classList.remove('hidden');
    this.setHint('릴 감기 시작! 안전지대를 3초 유지하세요');
    this.updateTensionUI();
  }

  private finishCatch(success: boolean): void {
    if (this.state === 'success' || this.state === 'fail') return;
    this.state = success ? 'success' : 'fail';
    this.holding = false;
    this.reelPanel?.classList.add('hidden');
    if (success) {
      playSound('success');
      const key = this.save.region;
      this.save.caught[key] = (this.save.caught[key] ?? 0) + 1;
      this.save.coins += 55;
      saveGame(this.save);
      this.showCatchPopup();
      this.toast.show({ type: 'dex', title: '도감 등록!', message: '가방에서 2.5D 물고기 카드를 확인하세요.', actionScreen: 'dex' });
    } else {
      playSound('fail');
      this.toast.show({ type: 'fishing', title: '줄이 끊어졌어요', message: '너무 세게 감으면 장력이 터집니다.' });
      this.resetFishing();
    }
  }

  private showCatchPopup(): void {
    if (!this.fish) return;
    this.fish.visible = true;
    this.fish.scale.set(0.02);
    this.fish.rotation = 0;
    let t = 0;
    const popup = () => {
      if (!this.pixi || !this.fish || this.state !== 'success') return;
      t += this.pixi.ticker.deltaMS / 1000;
      const bounce = Math.sin(Math.min(t * 6, Math.PI)) * 0.28;
      const s = Math.min(1, t * 2.4) + bounce;
      this.fish.scale.set((Math.min(this.pixi.screen.width, this.pixi.screen.height) / 720) * s);
      this.fish.rotation += 0.19;
      if (t > 2.2) {
        this.pixi.ticker.remove(popup);
        this.resetFishing();
      }
    };
    this.pixi?.ticker.add(popup);
  }

  private resetFishing(): void {
    if (this.bobber) this.bobber.visible = true;
    if (this.fish) this.fish.visible = false;
    if (this.biteText) this.biteText.visible = false;
    this.reelPanel?.classList.add('hidden');
    this.state = 'idle';
    this.castBtn?.classList.remove('hidden', 'pop-out');
    this.resizePixi();
    this.setHint('CAST를 눌러 다시 던지세요');
  }

  private tick(): void {
    const now = performance.now();
    const dt = Math.min(2, (now - this.lastTick) / 16.666);
    this.lastTick = now;
    if (!this.pixi || !this.bobber) return;
    const w = this.pixi.screen.width;
    const h = this.pixi.screen.height;
    if (this.state === 'casting') {
      const t = Math.min(1, (now - this.castStart) / 820);
      const sx = w * 0.31, sy = h * 0.50;
      const ex = w * 0.68, ey = h * 0.61;
      const arc = Math.sin(t * Math.PI) * h * 0.24;
      this.bobber.position.set(sx + (ex - sx) * t, sy + (ey - sy) * t - arc);
      this.bobber.rotation += 0.18;
      if (t >= 1) {
        this.bobber.rotation = 0;
        this.spawnSplash();
        this.scheduleBite();
      }
    } else if (this.state === 'waiting' || this.state === 'bite') {
      this.bobber.y += Math.sin(now / 260) * 0.35 * dt;
      if (this.state === 'bite') this.bobber.y += 0.18 * dt;
    } else if (this.state === 'reeling') {
      const regionMod = this.getRegion().difficulty;
      const drift = Math.sin(now / 280) * 0.22 * regionMod;
      this.tension += (this.holding ? 0.62 + regionMod * 0.12 : -0.46) * dt + drift;
      const safe = this.tension >= 42 && this.tension <= 68;
      this.safeTimer = safe ? this.safeTimer + dt / 60 : Math.max(0, this.safeTimer - dt / 80);
      this.updateTensionUI();
      if (this.tension <= 2 || this.tension >= 98) this.finishCatch(false);
      if (this.safeTimer >= 3) this.finishCatch(true);
    }
  }

  private spawnSplash(): void {
    const splash = document.createElement('div');
    splash.className = 'splash-ring';
    this.stageHost?.appendChild(splash);
    window.setTimeout(() => splash.remove(), 760);
  }

  private updateTensionUI(): void {
    if (!this.tensionFill || !this.safeFill) return;
    const value = Math.max(0, Math.min(100, this.tension));
    this.tensionFill.style.width = `${value}%`;
    this.tensionFill.classList.toggle('danger', value < 18 || value > 84);
    this.safeFill.style.left = '42%';
    this.safeFill.style.width = '26%';
  }

  private setHint(text: string): void {
    const node = document.querySelector('#fishingHint');
    if (node) node.textContent = text;
  }

  private renderDex(): void {
    this.clear();
    const root = this.baseGameShell('dex');
    root.innerHTML += `
      <section class="page-head glass-card"><div><span class="eyebrow">COLLECTION</span><h2>물고기 도감</h2><p>지역별 원화풍 2.5D 카드가 둥실 움직입니다.</p></div></section>
      <section class="dex-grid">
      ${Array.from({ length: 12 }).map((_, i) => {
        const fish = fishDex[i % fishDex.length];
        const unlocked = (this.save.caught[fish.id] ?? 0) > 0;
        const img = unlocked ? fish.img : './assets/dex/fish_unknown_25d.png';
        return `<article class="dex-card ${unlocked ? 'unlocked' : 'locked'}"><img src="${img}" alt="${unlocked ? fish.name : '미발견'}" loading="lazy" /><strong>${unlocked ? fish.name : '???'}</strong><span>${unlocked ? fish.region : '낚시로 발견'}</span><em>${fish.rarity}</em></article>`;
      }).join('')}</section>`;
    dom.app.appendChild(root);
    this.mountBottomNav(root, 'dex');
  }

  private renderShop(): void {
    this.clear();
    const root = this.baseGameShell('shop');
    root.innerHTML += `
      <section class="page-head glass-card"><div><span class="eyebrow">SHOP</span><h2>상점</h2><p>골드 ${this.save.coins} · 장비 강화는 다음 패치에서 서버 저장과 연결됩니다.</p></div></section>
      <section class="shop-list">
        ${['부드러운 초보 낚싯대', '산호 미끼 묶음', '장력 안정 코팅'].map((item, i) => `<button class="shop-card glass-card"><strong>${item}</strong><span>${120 + i * 80} 골드</span></button>`).join('')}
      </section>`;
    dom.app.appendChild(root);
    this.mountBottomNav(root, 'shop');
    root.querySelectorAll('.shop-card').forEach((card) => card.addEventListener('click', () => this.toast.show({ type: 'shop', title: '상점 준비 중', message: '구매/강화 데이터 연결 예정입니다.' })));
  }

  private renderMission(): void {
    this.clear();
    const root = this.baseGameShell('mission');
    const caught = Object.values(this.save.caught).reduce((a, b) => a + b, 0);
    root.innerHTML += `
      <section class="page-head glass-card"><div><span class="eyebrow">MISSION</span><h2>오늘의 미션</h2><p>알림을 누르면 이 화면으로 이동합니다.</p></div></section>
      <section class="mission-list">
        <article class="mission-card glass-card"><strong>첫 물고기 잡기</strong><progress max="1" value="${Math.min(1, caught)}"></progress><span>${caught >= 1 ? '완료' : '진행 중'}</span></article>
        <article class="mission-card glass-card"><strong>안전지대 3초 유지</strong><progress max="3" value="${caught > 0 ? 3 : 0}"></progress><span>보상 100 골드</span></article>
      </section>`;
    dom.app.appendChild(root);
    this.mountBottomNav(root, 'mission');
  }

  private getRegion() {
    return regions.find((r) => r.key === this.save.region) ?? regions[0];
  }

  private async requestFullscreenSoft(): Promise<void> {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
    } catch {
      // Mobile Safari exposes fullscreen only through installed PWA display modes.
    }
  }

  private bindFullscreenHint(): void {
    window.addEventListener('orientationchange', () => {
      this.toast.show({ title: '전체화면 팁', message: '홈 화면에 추가한 PWA로 실행하면 주소창 없이 플레이됩니다.' });
    }, { passive: true });
  }

  private async registerServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) return;
    try {
      const reg = await navigator.serviceWorker.register('./sw.js');
      await reg.update();
    } catch (error) {
      console.warn('[AquaFantasia] service worker skipped', error);
    }
  }

  private async sweepCaches(): Promise<void> {
    try {
      if (!('caches' in window)) return;
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key.startsWith('aqua-fantasia-') && !key.includes(APP_VERSION)).map((key) => caches.delete(key)));
      localStorage.setItem('aqua-cache-version', APP_VERSION);
    } catch {
      // CacheStorage can be blocked. The game still works online.
    }
  }
}

void new AquaFantasiaGame().boot();
