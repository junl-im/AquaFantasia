import { Application, Assets, Container, Sprite, Text } from 'pixi.js';
import './styles.css';
import { APP_VERSION, CACHE_NAME, regions, fishDex, navItems } from './data';
import type { FishInfo, FishingState, RegionKey, SaveData, Screen } from './types';
import { loadSave, saveGame, tryAnonymousServerLink } from './storage';
import { initAudio, playSound } from './audio';
import { ToastManager } from './toast';
import { applyPortraitViewportMetrics, installPortraitCssGuards, requestHardPortraitLock } from './core/PortraitGuard';

const ASSET = {
  loginBg: './assets/screens/start_screen_clean_v750.webp',
  player: './assets/v9/equipment/boat.png',
  float: './assets/v9/equipment/bobber.png',
  fish: './assets/art/fish_clown.png',
  gauge: './assets/v9/ui/progress_frame_aqua.png',
  slot: './assets/art/fish_slot.png',
  ripple: './assets/art/water_ripple_overlay.webp',
  caustics: './assets/art/caustic_sparkle_overlay.webp',
  castButton: './assets/ui/button_cast_clean.png',
  perfect: './assets/v9/fx/particles_gold.png',
  touchRing: './assets/v9/fx/ring_aqua.png',
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
  private catchSprite?: Sprite;
  private biteText?: Text;
  private waterLayer?: HTMLDivElement;
  private castBtn?: HTMLButtonElement;
  private reelPanel?: HTMLDivElement;
  private tensionFill?: HTMLDivElement;
  private safeFill?: HTMLDivElement;
  private holdPad?: HTMLButtonElement;
  private comboNode?: HTMLDivElement;
  private progressNode?: HTMLDivElement;
  private fallbackMode = false;
  private surgeTimer = 0;
  private perfectChain = 0;
  private routeGuardActive = false;
  private backGuardInstalled = false;
  private allowBrowserLeave = false;
  private modalOpen = false;
  private exitPromptOpen = false;
  private state: FishingState = 'idle';
  private tension = 42;
  private safeTimer = 0;
  private holding = false;
  private biteTimeout = 0;
  private castStart = 0;
  private lastTick = performance.now();
  private compact = false;
  private activeFish: FishInfo = fishDex[0];
  private readonly lockedOrientation: 'portrait-primary' = 'portrait-primary';

  async boot(): Promise<void> {
    this.compact = window.matchMedia('(max-width: 420px), (prefers-reduced-motion: reduce)').matches || (navigator.hardwareConcurrency ?? 8) <= 4;
    document.documentElement.classList.toggle('perf-lite', this.compact);
    document.documentElement.dataset.initialOrientation = 'portrait';
    document.documentElement.dataset.orientationPolicy = 'hard-portrait';
    document.documentElement.classList.add('portrait-only-game');
    installPortraitCssGuards();
    document.documentElement.dataset.version = APP_VERSION;
    document.documentElement.dataset.cacheName = CACHE_NAME;
    if (!this.hasWebGL()) document.documentElement.classList.add('pixi-fallback-ready');
    this.bindViewportGuard();
    this.toast = new ToastManager(dom.toastRoot, (screen) => this.go(screen));
    this.installBackNavigationGuard();
    initAudio();
    this.sweepCaches();
    this.screen = 'login';
    this.renderLogin();
    void this.registerServiceWorker();
  }

  private clear(): void {
    window.clearTimeout(this.biteTimeout);
    this.holding = false;
    if (this.pixi) {
      this.pixi.destroy(true, { children: true, texture: false });
      this.pixi = undefined;
    }
    dom.app.innerHTML = '';
    document.body.dataset.screen = this.screen;
  }

  private async go(screen: Screen): Promise<void> {
    playSound('tap');
    if (screen !== 'login') await this.enterImmersiveMode();
    this.screen = screen;
    this.save.screen = screen;
    saveGame(this.save);
    if (screen === 'login') this.renderLogin();
    if (screen === 'village') this.renderVillage();
    if (screen === 'fishing') void this.renderFishing();
    if (screen === 'gear') this.renderGear();
    if (screen === 'dex') this.renderDex();
    if (screen === 'shop') this.renderShop();
    if (screen === 'mission') this.renderMission();
  }

  private async startGame(linkServer = false): Promise<void> {
    await this.enterImmersiveMode();
    if (linkServer) {
      const result = await tryAnonymousServerLink(this.save);
      this.toast.show({ type: result.ok ? 'reward' : 'normal', title: result.ok ? '익명 서버연동 완료' : '로컬 저장 진행', message: result.message });
    }
    void this.go('village');
  }

  private renderLogin(): void {
    this.clear();
    const shell = document.createElement('main');
    shell.className = 'login-screen start-art-screen';
    shell.innerHTML = `
      <img class="start-art-image" src="${ASSET.loginBg}" alt="아쿠아 판타지아 시작 화면" />
      <h1 class="sr-only">아쿠아 판타지아</h1>
      <button class="start-hotspot hit-depart" data-action="guest" aria-label="낚시터로 출항"></button>
      <button class="start-hotspot hit-new" data-action="new" aria-label="처음부터 새 게임"></button>
      <button class="start-hotspot hit-server" data-action="server" aria-label="익명 서버연동"></button>
      <button class="start-hotspot hit-keep v720-keep-toggle v730-keep-toggle v740-keep-toggle v750-keep-toggle" data-action="keep" aria-label="이 기기에서 로그인 유지" aria-pressed="false"><span class="keep-indicator" aria-hidden="true"></span><span class="keep-text">이 기기에서 로그인 유지</span></button>
      <div class="login-touch-shine" aria-hidden="true"></div>`;
    dom.app.appendChild(shell);
    const keepEnabled = window.localStorage.getItem('aqua-login-keep') === 'true';
    const keepButton = shell.querySelector<HTMLButtonElement>('[data-action="keep"]');
    keepButton?.classList.toggle('checked', keepEnabled);
    keepButton?.setAttribute('aria-pressed', String(keepEnabled));
    shell.querySelector<HTMLButtonElement>('[data-action="guest"]')?.addEventListener('click', () => this.startGame(false));
    shell.querySelector<HTMLButtonElement>('[data-action="server"]')?.addEventListener('click', () => this.startGame(true));
    shell.querySelector<HTMLButtonElement>('[data-action="new"]')?.addEventListener('click', () => {
      const fresh = loadSave();
      this.save = { ...fresh, coins: 500, caught: {}, missions: {}, region: 'lake', gear: { rodLevel: 1, reelLevel: 1, lureStock: 8, lineLevel: 1 }, unlockedRegions: ['lake', 'river', 'harbor'], mastery: {}, bestStreak: 0, currentStreak: 0 };
      saveGame(this.save);
      this.startGame(false);
    });
    keepButton?.addEventListener('click', () => {
      const next = keepButton.getAttribute('aria-pressed') !== 'true';
      keepButton.classList.toggle('checked', next);
      keepButton.setAttribute('aria-pressed', String(next));
      window.localStorage.setItem('aqua-login-keep', String(next));
      this.toast.show({ type: 'normal', title: '로그인 유지', message: next ? '이 기기에 저장합니다.' : '이번 접속만 사용합니다.' });
    });
  }

  private renderVillage(): void {
    this.clear();
    const region = this.getRegion();
    const totalCaught = this.totalCaught();
    const root = this.baseGameShell('village');
    root.insertAdjacentHTML('beforeend', `
      <section class="player-hud glass-card">
        <div><span class="eyebrow">선장</span><strong>낚시꾼</strong></div>
        <div class="hud-pill"><img src="./assets/ui/panel_badge_gold_25d.png" alt="" />${this.save.coins}</div>
        <div class="hud-pill">장비 Lv.${this.save.gear.rodLevel + this.save.gear.reelLevel + this.save.gear.lineLevel - 2}</div>
        <div class="hud-pill">도감 ${totalCaught}</div>
      </section>
      <section class="system-strip glass-card"><span>오늘의 조류 · ${region.tide}</span><span>도감 ${totalCaught}종 수집</span><span>장비 안정도 Lv.${this.save.gear.rodLevel + this.save.gear.reelLevel + this.save.gear.lineLevel}</span></section>
      <section class="hero-card glass-card">
        <div>
          <span class="eyebrow">오늘의 출항</span>
          <h2>${region.name}</h2>
          <p>${region.subtitle}</p>
        </div>
        <button class="image-btn primary" data-go="fishing">낚시터로 출항</button>
      </section>
      <section class="quick-grid" aria-label="빠른 메뉴">
        <button class="quick-card glass-card" data-go="gear"><img src="./assets/ui/nav_gear_25d.png" alt="" /><strong>장비 강화</strong><span>손맛 안정</span></button>
        <button class="quick-card glass-card" data-go="dex"><img src="./assets/ui/nav_dex_25d.png" alt="" /><strong>물고기 도감</strong><span>${fishDex.length - 1}종 수집</span></button>
        <button class="quick-card glass-card" data-go="mission"><img src="./assets/ui/nav_mission_25d.png" alt="" /><strong>미션</strong><span>보상 확인</span></button>
        <button class="quick-card glass-card" data-go="shop"><img src="./assets/ui/nav_shop_25d.png" alt="" /><strong>상점</strong><span>미끼 구매</span></button>
      </section>
      <section class="region-grid">
        ${regions.map((r) => this.regionCard(r.key)).join('')}
      </section>`);
    dom.app.appendChild(root);
    this.mountBottomNav(root, 'village');
    root.querySelectorAll<HTMLElement>('[data-go]').forEach((btn) => btn.addEventListener('click', () => void this.go(btn.dataset.go as Screen)));
    root.querySelectorAll<HTMLButtonElement>('[data-region]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.region as RegionKey;
        if (!this.isRegionUnlocked(key)) {
          this.toast.show({ type: 'mission', title: '아직 잠긴 수역', message: '미션과 도감 수집으로 새 수역을 열 수 있어요.', actionScreen: 'mission' });
          return;
        }
        this.save.region = key;
        saveGame(this.save);
        this.toast.show({ type: 'fishing', title: `${this.getRegion().name} 선택`, message: '수면 애니메이션과 입질 난이도가 변경되었습니다.', actionScreen: 'fishing' });
        this.renderVillage();
      });
    });
  }

  private regionCard(key: RegionKey): string {
    const r = regions.find((region) => region.key === key) ?? regions[0];
    const locked = !this.isRegionUnlocked(key);
    return `<button class="region-card ${r.key === this.save.region ? 'active' : ''} ${locked ? 'locked' : ''}" data-region="${r.key}">
      <img src="${r.bg}" alt="" loading="lazy" />
      <strong>${locked ? '잠긴 수역' : r.name}</strong><span>${locked ? r.unlockHint : `${r.subtitle} · ${r.tide}`}</span>
    </button>`;
  }

  private async renderFishing(): Promise<void> {
    this.clear();
    const root = this.baseGameShell('fishing');
    const region = this.getRegion();
    root.classList.add('fishing-shell');
    root.style.setProperty('--region-glow', region.color);
    root.innerHTML += `
      <div class="fishing-top glass-card">
        <div><strong>${region.name}</strong><span id="fishingHint">찌 던지기로 출항을 시작하세요</span></div>
        <div class="weather-pill">${region.tide}</div>
        <button class="round-btn home-btn" data-go="village">마을</button>
      </div>
      <div class="fishing-stage" id="fishingStage">
        <div class="pixi-layer"></div>
        <div class="water-overlay"></div>
        <div class="caustic-overlay"></div>
        <div class="fishing-guide-card glass-card" id="fishingGuide" aria-live="polite">
          <strong>실전 조작</strong>
          <span>① 찌 던지기</span><span>② 물었다! 터치</span><span>③ 눌렀다 떼며 녹색 3초</span>
        </div>
        <div class="stage-ui"></div>
      </div>
      <div class="combo-badge ${this.save.currentStreak > 1 ? '' : 'hidden'}" id="comboBadge">연속 성공 x${Math.max(2, this.save.currentStreak)}</div>
      <div class="reel-panel glass-card hidden" id="reelPanel">
        <img src="${ASSET.gauge}" alt="장력 게이지" />
        <div class="tension-track"><span class="safe-zone"></span><span class="tension-fill"></span></div>
        <div class="safe-progress"><span></span></div>
        <div class="surge-meter"><span></span></div>
        <button class="hold-pad">꾹 눌러 릴 감기</button>
        <p>화면을 누르고 떼며 장력을 조절하세요. 녹색 안전지대 3초 유지!</p>
      </div>`;
    dom.app.appendChild(root);
    this.mountBottomNav(root, 'fishing');
    root.querySelector('[data-go="village"]')?.addEventListener('click', () => void this.go('village'));
    this.stageHost = root.querySelector<HTMLDivElement>('#fishingStage')!;
    this.pixiLayer = root.querySelector<HTMLDivElement>('.pixi-layer')!;
    this.uiLayer = root.querySelector<HTMLDivElement>('.stage-ui')!;
    this.waterLayer = root.querySelector<HTMLDivElement>('.water-overlay')!;
    this.reelPanel = root.querySelector<HTMLDivElement>('#reelPanel')!;
    this.tensionFill = root.querySelector<HTMLDivElement>('.tension-fill')!;
    this.safeFill = root.querySelector<HTMLDivElement>('.safe-zone')!;
    this.holdPad = root.querySelector<HTMLButtonElement>('.hold-pad')!;
    this.comboNode = root.querySelector<HTMLDivElement>('#comboBadge')!;
    this.progressNode = root.querySelector<HTMLDivElement>('.safe-progress span')!;
    this.waterLayer.style.setProperty('--water-speed', `${Math.max(10, 24 / region.waterSpeed)}s`);
    const startHold = (ev: PointerEvent) => { this.holding = true; this.holdPad?.setPointerCapture?.(ev.pointerId); this.spawnTouchRing(ev.clientX, ev.clientY); this.vibrate(8); };
    const stopHold = () => { this.holding = false; };
    this.holdPad.addEventListener('pointerdown', startHold);
    this.holdPad.addEventListener('pointerup', stopHold);
    this.holdPad.addEventListener('pointercancel', stopHold);
    try {
      await this.initPixiStage();
    } catch (error) {
      console.warn('[AquaFantasia] Pixi stage fallback activated', error);
      this.initFallbackFishingStage();
    }
  }

  private baseGameShell(name: string): HTMLElement {
    const root = document.createElement('main');
    root.className = `game-screen ${name}-screen v800-screen ${name === 'fishing' ? 'locked-screen' : 'scroll-screen'}`;
    root.innerHTML = `<div class="ambient-bg" aria-hidden="true"></div>`;
    return root;
  }

  private mountBottomNav(root: HTMLElement, active: Screen): void {
    dom.app.querySelector('.bottom-nav')?.remove();
    const nav = document.createElement('nav');
    nav.className = 'bottom-nav glass-card premium-bottom-nav fixed-root-nav';
    nav.setAttribute('aria-label', '하단 메뉴');
    nav.setAttribute('data-fixed-root', 'true');
    nav.innerHTML = navItems.map(({ screen, icon, label }) => `<button class="${screen === active ? 'active' : ''}" data-screen="${screen}"><img src="${icon}" alt="" /><span>${label}</span></button>`).join('');
    dom.app.appendChild(nav);
    root.classList.add('has-fixed-root-nav');
    nav.querySelectorAll<HTMLButtonElement>('[data-screen]').forEach((btn) => btn.addEventListener('click', () => void this.go(btn.dataset.screen as Screen)));
  }

  private async initPixiStage(): Promise<void> {
    this.fallbackMode = false;
    if (!this.pixiLayer || !this.stageHost || !this.hasWebGL()) throw new Error('WebGL unavailable');
    const app = new Application();
    await app.init({ resizeTo: this.stageHost, backgroundAlpha: 0, antialias: !this.compact, resolution: Math.min(window.devicePixelRatio || 1, this.compact ? 1.35 : 2), autoDensity: true, powerPreference: 'high-performance' });
    this.pixi = app;
    this.pixiLayer.appendChild(app.canvas);

    this.activeFish = this.pickFish();
    const textures = await Assets.load([this.getRegion().bg, ASSET.player, ASSET.float, this.activeFish.img]);
    this.bgSprite = new Sprite(textures[this.getRegion().bg]);
    this.player = new Sprite(textures[ASSET.player]);
    this.bobber = new Sprite(textures[ASSET.float]);
    this.catchSprite = new Sprite(textures[this.activeFish.img]);
    this.biteText = new Text({ text: '!', style: { fontFamily: 'Arial', fontSize: 82, fontWeight: '900', fill: 0xff5848, stroke: { color: 0xffffff, width: 9 } } });

    const world = new Container();
    app.stage.addChild(world);
    world.addChild(this.bgSprite, this.player, this.bobber, this.catchSprite, this.biteText);
    this.player.anchor.set(0.5, 0.9);
    this.bobber.anchor.set(0.5, 0.5);
    this.catchSprite.anchor.set(0.5, 0.5);
    this.biteText.anchor.set(0.5);
    this.catchSprite.visible = false;
    this.biteText.visible = false;
    this.resizePixi();
    window.addEventListener('resize', () => this.resizePixi(), { passive: true });

    this.createCastButton();
    this.stageHost.addEventListener('pointerdown', (ev) => {
      if (this.state === 'bite') this.startReeling();
      else if (this.state === 'reeling') {
        this.holding = true;
        this.stageHost?.setPointerCapture?.(ev.pointerId);
        this.spawnTouchRing(ev.clientX, ev.clientY);
      }
    });
    this.stageHost.addEventListener('pointerup', () => { if (this.state === 'reeling') this.holding = false; });
    this.stageHost.addEventListener('pointercancel', () => { if (this.state === 'reeling') this.holding = false; });
    app.ticker.add(() => this.tick());
    this.state = 'idle';
  }

  private resizePixi(): void {
    if (!this.pixi || !this.bgSprite || !this.player || !this.bobber || !this.catchSprite || !this.biteText) return;
    const w = this.pixi.screen.width;
    const h = this.pixi.screen.height;
    const bgScale = Math.max(w / this.bgSprite.texture.width, h / this.bgSprite.texture.height);
    this.bgSprite.scale.set(bgScale);
    this.bgSprite.position.set((w - this.bgSprite.texture.width * bgScale) / 2, (h - this.bgSprite.texture.height * bgScale) / 2);
    const base = Math.min(w, h);
    this.player.scale.set(base / 260);
    this.player.position.set(w * 0.27, h * 0.72);
    this.bobber.scale.set(base / 520);
    this.bobber.position.set(w * 0.68, h * 0.60);
    this.catchSprite.scale.set(base / 360);
    this.catchSprite.position.set(w * 0.5, h * 0.52);
    this.biteText.position.set(w * 0.69, h * 0.42);
  }

  private createCastButton(): void {
    if (!this.uiLayer) return;
    this.uiLayer.innerHTML = `<button class="cast-button" type="button" aria-label="찌 던지기"><span class="cast-icon" aria-hidden="true"></span><strong>찌 던지기</strong></button>`;
    this.castBtn = this.uiLayer.querySelector<HTMLButtonElement>('.cast-button')!;
    this.castBtn.addEventListener('click', () => this.castLine());
  }

  private castLine(): void {
    if (this.fallbackMode) { this.castLineFallback(); return; }
    if (this.state !== 'idle' || !this.castBtn || !this.pixi || !this.bobber) return;
    playSound('cast');
    this.vibrate(12);
    this.save.totalCasts += 1;
    if (this.save.gear.lureStock > 0) this.save.gear.lureStock -= 1;
    saveGame(this.save);
    this.activeFish = this.pickFish();
    this.state = 'casting';
    this.stageHost?.classList.add('casting-mode');
    this.stageHost?.classList.remove('reeling-mode');
    this.castStart = performance.now();
    this.castBtn.classList.add('pop-out');
    this.setHint('찌가 포물선을 그리며 날아갑니다');
    window.setTimeout(() => this.castBtn?.classList.add('hidden'), 260);
  }

  private scheduleBite(): void {
    this.state = 'waiting';
    this.stageHost?.classList.remove('casting-mode');
    this.setHint('입질을 기다리세요 · 물었다!가 뜨면 화면을 눌러 당기세요');
    const delay = 2200 + Math.random() * 1900 - this.save.gear.reelLevel * 60 - Math.min(420, this.save.gear.lureStock * 12);
    window.clearTimeout(this.biteTimeout);
    this.biteTimeout = window.setTimeout(() => this.triggerBite(), Math.max(1300, delay));
  }

  private triggerBite(): void {
    if (this.state !== 'waiting') return;
    playSound('bite');
    this.vibrate([30, 30, 20]);
    this.state = 'bite';
    if (this.biteText) this.biteText.visible = true;
    this.stageHost?.classList.add('camera-shake');
    this.stageHost?.classList.add('bite-flash');
    this.setHint(`${this.activeFish.rarity === 'BOSS' ? '보스 입질!' : '물었다!'} 화면을 눌러 당기세요`);
    this.showBiteCallout(this.activeFish.rarity === 'BOSS' ? '보스가 물었다!' : '물었다!');
    window.setTimeout(() => this.stageHost?.classList.remove('camera-shake', 'bite-flash'), 520);
  }

  private startReeling(): void {
    if (this.state !== 'bite') return;
    this.vibrate(20);
    this.state = 'reeling';
    this.stageHost?.classList.add('reeling-mode');
    this.tension = 46 + this.getRegion().difficulty * 5;
    this.safeTimer = 0;
    this.surgeTimer = 0;
    this.perfectChain = 0;
    this.routeGuardActive = false;
    this.holding = false;
    if (this.biteText) this.biteText.visible = false;
    this.hideBiteCallout();
    this.reelPanel?.classList.remove('hidden');
    this.setHint('릴 감기! 안전지대에 장력을 3초 유지하세요');
    this.updateTensionUI();
  }

  private finishCatch(success: boolean): void {
    if (this.state === 'success' || this.state === 'fail') return;
    this.state = success ? 'success' : 'fail';
    this.holding = false;
    this.hideBiteCallout();
    this.reelPanel?.classList.add('hidden');
    if (success) {
      playSound('success');
      this.vibrate([20, 35, 55]);
      const reward = this.calculateReward(this.activeFish);
      this.save.caught[this.activeFish.id] = (this.save.caught[this.activeFish.id] ?? 0) + 1;
      this.save.mastery[this.activeFish.regionKey] = (this.save.mastery[this.activeFish.regionKey] ?? 0) + 1;
      this.save.coins += reward;
      this.save.totalSuccess += 1;
      this.save.currentStreak += 1;
      this.save.bestStreak = Math.max(this.save.bestStreak, this.save.currentStreak);
      this.updateUnlocks();
      saveGame(this.save);
      if (this.comboNode) { this.comboNode.textContent = `연속 성공 x${Math.max(2, this.save.currentStreak)}`; this.comboNode.classList.toggle('hidden', this.save.currentStreak < 2); }
      this.showCatchPopup(reward);
      this.toast.show({ type: 'dex', title: `${this.activeFish.name} 획득!`, message: `도감 카드와 보상 ${reward}G가 추가되었습니다.`, actionScreen: 'dex' });
    } else {
      playSound('fail');
      this.save.currentStreak = 0;
      this.save.totalFail += 1;
      saveGame(this.save);
      this.toast.show({ type: 'fishing', title: '줄이 끊어졌어요', message: '장비를 강화하면 장력이 더 안정됩니다.', actionScreen: 'gear' });
      this.resetFishing();
    }
  }

  private showCatchPopup(reward: number): void {
    if (this.fallbackMode || !this.pixi || !this.catchSprite) {
      this.stageHost?.classList.add('catch-bloom');
      window.setTimeout(() => this.showResultCard(reward), 520);
      return;
    }
    this.catchSprite.visible = true;
    this.catchSprite.scale.set(0.02);
    this.catchSprite.rotation = 0;
    this.stageHost?.classList.add('catch-bloom');
    let t = 0;
    const popup = () => {
      if (!this.pixi || !this.catchSprite || this.state !== 'success') return;
      t += this.pixi.ticker.deltaMS / 1000;
      const bounce = Math.sin(Math.min(t * 6, Math.PI)) * 0.30;
      const s = Math.min(1, t * 2.4) + bounce;
      this.catchSprite.scale.set((Math.min(this.pixi.screen.width, this.pixi.screen.height) / 650) * s);
      this.catchSprite.rotation += 0.18;
      if (t > 1.15 && !this.stageHost?.querySelector('.catch-result-card')) this.showResultCard(reward);
      if (t > 3.4) {
        this.pixi.ticker.remove(popup);
        this.stageHost?.classList.remove('catch-bloom');
      }
    };
    this.pixi?.ticker.add(popup);
  }

  private showResultCard(reward: number): void {
    const card = document.createElement('div');
    card.className = `catch-result-card rarity-${this.activeFish.rarity.toLowerCase()}`;
    card.innerHTML = `<img src="${this.activeFish.img}" alt="" /><strong>${this.activeFish.name}</strong><span>${this.activeFish.rarity} · ${reward}G · 연속 성공 x${Math.max(1, this.save.currentStreak)}</span><div><button data-next="fishing">계속 낚시</button><button data-next="dex">도감 보기</button></div>`;
    this.stageHost?.appendChild(card);
    card.querySelectorAll<HTMLButtonElement>('[data-next]').forEach((btn) => btn.addEventListener('click', () => {
      const next = btn.dataset.next as Screen;
      card.remove();
      if (next === 'fishing') this.resetFishing();
      else void this.go(next);
    }));
    window.setTimeout(() => {
      if (card.isConnected) {
        card.remove();
        this.resetFishing();
      }
    }, 5200);
  }

  private resetFishing(): void {
    if (this.bobber) this.bobber.visible = true;
    if (this.catchSprite) this.catchSprite.visible = false;
    if (this.biteText) this.biteText.visible = false;
    this.hideBiteCallout();
    this.reelPanel?.classList.add('hidden');
    this.stageHost?.classList.remove('catch-bloom', 'fallback-casting', 'surge-alert', 'guard-active', 'casting-mode', 'reeling-mode');
    this.stageHost?.querySelector('.catch-result-card')?.remove();
    this.state = 'idle';
    this.castBtn?.classList.remove('hidden', 'pop-out');
    this.resizePixi();
    this.setHint('좋아요! 찌 던지기로 다음 물고기를 노려보세요');
    if (this.comboNode) { this.comboNode.textContent = `연속 성공 x${Math.max(2, this.save.currentStreak)}`; this.comboNode.classList.toggle('hidden', this.save.currentStreak < 2); }
  }

  private tick(): void {
    const now = performance.now();
    const dt = Math.min(2, (now - this.lastTick) / 16.666);
    this.lastTick = now;
    if (!this.pixi || !this.bobber) return;
    const w = this.pixi.screen.width;
    const h = this.pixi.screen.height;
    if (this.state === 'casting') {
      const t = Math.min(1, (now - this.castStart) / 760);
      const sx = w * 0.29, sy = h * 0.50;
      const ex = w * 0.68, ey = h * 0.61;
      const arc = Math.sin(t * Math.PI) * h * 0.28;
      this.bobber.position.set(sx + (ex - sx) * t, sy + (ey - sy) * t - arc);
      this.bobber.rotation += 0.24;
      if (t >= 1) {
        this.bobber.rotation = 0;
        this.spawnSplash();
        this.scheduleBite();
      }
    } else if (this.state === 'waiting' || this.state === 'bite') {
      this.bobber.y += Math.sin(now / 250) * 0.35 * dt;
      this.bobber.x += Math.sin(now / 620) * 0.10 * dt;
      if (this.state === 'bite') this.bobber.y += 0.22 * dt;
    } else if (this.state === 'reeling') {
      const regionMod = this.getRegion().difficulty;
      const gearRelief = 1 + this.save.gear.rodLevel * 0.06 + this.save.gear.reelLevel * 0.05 + this.save.gear.lineLevel * 0.05;
      const bossMod = this.activeFish.rarity === 'BOSS' ? 1.28 : this.activeFish.rarity === 'EPIC' ? 1.13 : 1;
      this.surgeTimer += dt / 60;
      const surgeActive = this.surgeTimer > 1.25 && Math.sin(now / 520) > 0.82;
      const drift = Math.sin(now / 215) * 0.31 * regionMod * bossMod + Math.sin(now / 770) * 0.10 + (surgeActive ? Math.sin(now / 80) * 0.38 : 0);
      this.tension += ((this.holding ? 0.75 + regionMod * 0.14 : -0.50) / gearRelief) * dt + drift;
      if (this.bobber) {
        const pull = this.holding ? -0.18 : 0.10;
        this.bobber.x += Math.sin(now / 90) * 0.25 * dt;
        this.bobber.y += pull * dt + Math.sin(now / 130) * 0.18 * dt;
        this.bobber.rotation = Math.sin(now / 85) * (this.holding ? 0.28 : 0.12);
      }
      const zone = this.safeZone();
      const safe = this.tension >= zone.left && this.tension <= zone.right;
      const center = (zone.left + zone.right) / 2;
      const perfect = Math.abs(this.tension - center) < Math.max(3.2, (zone.right - zone.left) * 0.18);
      this.perfectChain = perfect ? this.perfectChain + dt / 60 : Math.max(0, this.perfectChain - dt / 45);
      if (this.perfectChain > 1.0 && !this.routeGuardActive) {
        this.routeGuardActive = true;
        this.stageHost?.classList.add('guard-active');
        this.vibrate(10);
      }
      this.safeTimer = safe ? this.safeTimer + dt / 60 * (perfect ? 1.16 : 1) : Math.max(0, this.safeTimer - dt / 70);
      this.stageHost?.classList.toggle('surge-alert', surgeActive);
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

  private spawnTouchRing(x: number, y: number): void {
    const ring = document.createElement('div');
    ring.className = 'touch-ring';
    ring.style.left = `${x}px`;
    ring.style.top = `${y}px`;
    document.body.appendChild(ring);
    window.setTimeout(() => ring.remove(), 520);
  }

  private updateTensionUI(): void {
    if (!this.tensionFill || !this.safeFill) return;
    const value = Math.max(0, Math.min(100, this.tension));
    const zone = this.safeZone();
    this.tensionFill.style.width = `${value}%`;
    this.tensionFill.classList.toggle('danger', value < 18 || value > 84);
    this.tensionFill.classList.toggle('perfect', value >= zone.left && value <= zone.right);
    this.safeFill.style.left = `${zone.left}%`;
    this.safeFill.style.width = `${zone.right - zone.left}%`;
    if (this.progressNode) this.progressNode.style.width = `${Math.min(100, (this.safeTimer / 3) * 100)}%`;
    const surgeNode = this.reelPanel?.querySelector<HTMLSpanElement>('.surge-meter span');
    if (surgeNode) surgeNode.style.width = `${Math.min(100, this.perfectChain * 72)}%`;
  }

  private safeZone(): { left: number; right: number } {
    const masteryBonus = Math.min(4, (this.save.mastery[this.save.region] ?? 0) * 0.08);
    const width = Math.max(16, 28 - this.getRegion().difficulty * 4 + this.save.gear.lineLevel * 1.6 + masteryBonus);
    const center = 55 + Math.sin(performance.now() / 1500) * (this.activeFish.rarity === 'BOSS' ? 3.4 : 1.7);
    return { left: center - width / 2, right: center + width / 2 };
  }

  private setHint(text: string): void {
    const node = document.querySelector('#fishingHint');
    if (node) node.textContent = text;
  }

  private showBiteCallout(title: string): void {
    this.hideBiteCallout();
    const callout = document.createElement('div');
    callout.className = 'bite-callout';
    callout.innerHTML = `<strong>${title}</strong><span>화면을 눌러 당기세요!</span>`;
    this.stageHost?.appendChild(callout);
  }

  private hideBiteCallout(): void {
    this.stageHost?.querySelector('.bite-callout')?.remove();
  }


  private installBackNavigationGuard(): void {
    if (this.backGuardInstalled) return;
    this.backGuardInstalled = true;
    const arm = () => {
      try {
        history.pushState({ aquaFantasia: true, screen: this.screen, t: Date.now() }, '', location.href);
      } catch {
        // Some WebViews can reject state changes; game still works without browser guard.
      }
    };
    try {
      history.replaceState({ aquaFantasia: true, screen: this.screen, t: Date.now() }, '', location.href);
      arm();
    } catch {
      // Silent fallback.
    }
    window.addEventListener('popstate', () => {
      if (this.allowBrowserLeave) return;
      arm();
      void this.handleHardwareBack();
    });
  }

  private async handleHardwareBack(): Promise<void> {
    if (this.modalOpen) {
      if (this.exitPromptOpen) this.releaseBrowserBack();
      return;
    }
    if (this.screen === 'fishing') {
      const leave = await this.showGameConfirm({
        title: '마을로 돌아갈까요?',
        message: '진행 중인 낚시는 종료되고 마을 화면으로 이동합니다.',
        okText: '마을로 가기',
        cancelText: '계속 낚시',
      });
      if (leave) void this.go('village');
      return;
    }
    if (this.screen === 'village' || this.screen === 'login') {
      this.exitPromptOpen = true;
      const exit = await this.showGameConfirm({
        title: '게임을 종료할까요?',
        message: '뒤로가기를 한 번 더 누르거나 종료를 선택하면 이전 페이지로 이동합니다.',
        okText: '종료',
        cancelText: '취소',
      });
      this.exitPromptOpen = false;
      if (exit) this.releaseBrowserBack();
      return;
    }
    void this.go('village');
  }

  private releaseBrowserBack(): void {
    this.allowBrowserLeave = true;
    try {
      history.back();
      window.setTimeout(() => window.close(), 80);
    } catch {
      window.close();
    }
  }

  private showGameConfirm(options: { title: string; message: string; okText: string; cancelText: string }): Promise<boolean> {
    this.modalOpen = true;
    return new Promise((resolve) => {
      const backdrop = document.createElement('div');
      backdrop.className = 'game-dialog-backdrop';
      backdrop.innerHTML = `
        <section class="game-dialog-card" role="dialog" aria-modal="true" aria-label="${options.title}">
          <strong>${options.title}</strong>
          <p>${options.message}</p>
          <div>
            <button class="dialog-btn cancel" data-dialog="cancel">${options.cancelText}</button>
            <button class="dialog-btn ok" data-dialog="ok">${options.okText}</button>
          </div>
        </section>`;
      const done = (value: boolean) => {
        this.modalOpen = false;
        backdrop.classList.add('dialog-out');
        window.setTimeout(() => backdrop.remove(), 140);
        resolve(value);
      };
      backdrop.querySelector<HTMLButtonElement>('[data-dialog="cancel"]')?.addEventListener('click', () => done(false));
      backdrop.querySelector<HTMLButtonElement>('[data-dialog="ok"]')?.addEventListener('click', () => done(true));
      backdrop.addEventListener('pointerdown', (ev) => {
        if (ev.target === backdrop) done(false);
      });
      dom.app.appendChild(backdrop);
    });
  }

  private renderGear(): void {
    this.clear();
    const root = this.baseGameShell('gear');
    root.innerHTML += `
      <section class="page-head glass-card v800-head"><div><span class="eyebrow">EQUIPMENT</span><h2>장비 강화</h2><p>낚싯대 · 릴 · 낚싯줄 · 미끼를 강화해 장력 흔들림을 줄입니다.</p></div><strong class="page-coin">${this.save.coins}G</strong></section>
      <section class="gear-grid">
        ${this.gearCard('rod', '낚싯대', './assets/v9/equipment/rod.png', this.save.gear.rodLevel, 120, '장력 상승 완화')}
        ${this.gearCard('reel', '릴', './assets/v9/equipment/reel.png', this.save.gear.reelLevel, 140, '릴링 반응 개선')}
        ${this.gearCard('line', '낚싯줄', './assets/v9/equipment/line.png', this.save.gear.lineLevel, 130, '안전지대 확대')}
        ${this.gearCard('lure', '미끼', './assets/v9/equipment/bait.png', this.save.gear.lureStock, 60, '입질 유도 보조')}
      </section>`;
    dom.app.appendChild(root);
    this.mountBottomNav(root, 'gear');
    root.querySelectorAll<HTMLButtonElement>('[data-upgrade]').forEach((btn) => btn.addEventListener('click', () => this.buyUpgrade(btn.dataset.upgrade as 'rod' | 'reel' | 'line' | 'lure')));
  }

  private gearCard(kind: 'rod' | 'reel' | 'line' | 'lure', name: string, icon: string, level: number, baseCost: number, desc: string): string {
    const cost = kind === 'lure' ? baseCost : baseCost + level * 90;
    return `<article class="gear-card glass-card"><img src="${icon}" alt="" /><div><strong>${name}</strong><span>Lv.${level} · ${desc}</span></div><button class="image-btn soft" data-upgrade="${kind}">${cost}G</button></article>`;
  }

  private buyUpgrade(kind: 'rod' | 'reel' | 'line' | 'lure'): void {
    const current = kind === 'rod' ? this.save.gear.rodLevel : kind === 'reel' ? this.save.gear.reelLevel : kind === 'line' ? this.save.gear.lineLevel : this.save.gear.lureStock;
    const cost = kind === 'lure' ? 60 : (kind === 'rod' ? 120 : kind === 'reel' ? 140 : 130) + current * 90;
    if (this.save.coins < cost) {
      this.toast.show({ type: 'shop', title: '골드가 부족해요', message: '낚시로 골드를 모아 장비를 강화하세요.', actionScreen: 'fishing' });
      return;
    }
    this.save.coins -= cost;
    if (kind === 'rod') this.save.gear.rodLevel += 1;
    if (kind === 'reel') this.save.gear.reelLevel += 1;
    if (kind === 'line') this.save.gear.lineLevel += 1;
    if (kind === 'lure') this.save.gear.lureStock += 3;
    saveGame(this.save);
    this.toast.show({ type: 'reward', title: '장비 강화 완료', message: '손맛이 더 안정적으로 바뀝니다.', actionScreen: 'fishing' });
    this.renderGear();
  }

  private renderDex(): void {
    this.clear();
    const root = this.baseGameShell('dex');
    const caughtCount = this.totalCaught();
    const discovered = fishDex.filter((fish) => fish.id !== 'unknown' && ((this.save.caught[fish.id] ?? 0) > 0 || fish.rarity === 'COMMON')).length;
    root.innerHTML += `
      <section class="page-head glass-card"><div><span class="eyebrow">물고기 도감</span><h2>물고기 도감</h2><p>투명 배경의 귀여운 2.5D 물고기 캐릭터를 수집합니다.</p></div></section>
      <section class="dex-summary glass-card"><strong>수집 ${caughtCount}마리</strong><span>발견 ${discovered}/${fishDex.length - 1}종 · 업로드 에셋 기반 투명 PNG 물고기 사용</span></section>
      <section class="dex-grid">
      ${fishDex.filter((fish) => fish.id !== 'unknown').map((fish) => {
        const unlocked = (this.save.caught[fish.id] ?? 0) > 0 || fish.rarity === 'COMMON';
        const img = fish.img;
        const count = this.save.caught[fish.id] ?? 0;
        return `<article class="dex-card ${unlocked ? 'unlocked' : 'locked'} rarity-${fish.rarity.toLowerCase()}"><img src="${img}" alt="${unlocked ? fish.name : '미발견'}" loading="lazy" /><strong>${unlocked ? fish.name : '미발견'}</strong><span>${fish.region} · ${unlocked ? `${count}마리` : '힌트 공개'}</span><em>${fish.rarity}</em></article>`;
      }).join('')}</section>`;
    dom.app.appendChild(root);
    this.mountBottomNav(root, 'dex');
  }

  private renderShop(): void {
    this.clear();
    const root = this.baseGameShell('shop');
    const goods = [
      { name: '산호 미끼 묶음', desc: '미끼 +5', cost: 120, icon: './assets/v9/equipment/bait.png' },
      { name: '릴 윤활 오일', desc: '릴 강화 보조', cost: 180, icon: './assets/v9/equipment/reel.png' },
      { name: '물결 안정 부적', desc: '낚싯줄 강화 보조', cost: 210, icon: './assets/v9/equipment/line.png' },
      { name: '비상 구조 키트', desc: '실패 후 복구 보상', cost: 260, icon: './assets/v9/equipment/chest.png' },
    ];
    root.innerHTML += `
      <section class="page-head glass-card v800-head"><div><span class="eyebrow">SHOP</span><h2>상점</h2><p>미끼와 강화 보조품을 구매합니다. 글씨가 겹치지 않도록 카드형으로 재정렬했습니다.</p></div><strong class="page-coin">${this.save.coins}G</strong></section>
      <section class="shop-list">
        ${goods.map((item, i) => `<button class="shop-card glass-card" data-buy="${i}"><img src="${item.icon}" alt="" /><strong>${item.name}<small>${item.desc}</small></strong><span class="price-badge">${item.cost}G</span></button>`).join('')}
      </section>`;
    dom.app.appendChild(root);
    this.mountBottomNav(root, 'shop');
    root.querySelectorAll<HTMLButtonElement>('.shop-card').forEach((card) => card.addEventListener('click', () => {
      const item = goods[Number(card.dataset.buy ?? 0)];
      if (this.save.coins < item.cost) {
        this.toast.show({ type: 'shop', title: '골드가 부족해요', message: '낚시 보상으로 다시 도전해 보세요.', actionScreen: 'fishing' });
        return;
      }
      this.save.coins -= item.cost;
      if (item.name.includes('미끼')) this.save.gear.lureStock += 5;
      if (item.name.includes('릴')) this.save.gear.reelLevel += 1;
      if (item.name.includes('부적')) this.save.gear.lineLevel += 1;
      if (item.name.includes('구조')) { this.save.lastRescueAt = Date.now(); this.save.gear.lureStock += 2; }
      saveGame(this.save);
      this.toast.show({ type: 'shop', title: '구매 완료', message: '장비와 미끼 상태가 갱신되었습니다.', actionScreen: 'gear' });
      this.renderShop();
    }));
  }

  private missionGoals(): Array<{ id: string; category: string; title: string; desc: string; max: number; value: number; reward: number; event?: boolean }> {
    const caught = this.totalCaught();
    const uniqueCaught = Object.keys(this.save.caught).filter((id) => (this.save.caught[id] ?? 0) > 0).length;
    const rareCaught = Object.entries(this.save.caught).filter(([id, count]) => count > 0 && fishDex.find((fish) => fish.id === id)?.rarity === 'RARE').length;
    const epicCaught = Object.entries(this.save.caught).filter(([id, count]) => count > 0 && fishDex.find((fish) => fish.id === id)?.rarity === 'EPIC').length;
    const bossCaught = Object.entries(this.save.caught).filter(([id, count]) => count > 0 && fishDex.find((fish) => fish.id === id)?.rarity === 'BOSS').length;
    const gearUpgradeCount = Math.max(0, this.save.gear.rodLevel + this.save.gear.reelLevel + this.save.gear.lineLevel - 3);
    const gearTotalLevel = this.save.gear.rodLevel + this.save.gear.reelLevel + this.save.gear.lineLevel;
    const masteryMax = Math.max(0, ...Object.values(this.save.mastery));
    const missionDone = Object.values(this.save.missions).filter(Boolean).length;
    const regionUnlocked = this.save.unlockedRegions.length;
    const hasClown = (this.save.caught.clown ?? 0) > 0;
    return [
      { id: 'attendanceToday', category: '출석', title: '오늘 출석 선물', desc: '접속만 해도 받을 수 있는 데일리 보상', max: 1, value: 1, reward: 120, event: true },
      { id: 'dailyCast3', category: '오늘', title: '오늘 3번 던지기', desc: '가볍게 낚시터에서 손맛을 확인하세요', max: 3, value: Math.min(3, this.save.totalCasts), reward: 100 },
      { id: 'dailyCast10', category: '오늘', title: '오늘 10번 던지기', desc: '입질 타이밍에 익숙해지는 훈련', max: 10, value: Math.min(10, this.save.totalCasts), reward: 180 },
      { id: 'dailyCatch3', category: '오늘', title: '오늘 3마리 잡기', desc: '기본 장비로도 충분히 가능한 목표', max: 3, value: Math.min(3, caught), reward: 150 },
      { id: 'dailyCatch10', category: '오늘', title: '오늘 10마리 잡기', desc: '연속 성공과 장비 강화를 같이 노려보세요', max: 10, value: Math.min(10, caught), reward: 320 },
      { id: 'firstCatch', category: '성장', title: '첫 물고기 잡기', desc: 'Aqua Fantasia의 첫 수집 기록', max: 1, value: Math.min(1, caught), reward: 100 },
      { id: 'catch5', category: '성장', title: '누적 5마리 잡기', desc: '기초 낚시꾼 칭호에 도전', max: 5, value: Math.min(5, caught), reward: 200 },
      { id: 'catch20', category: '성장', title: '누적 20마리 잡기', desc: '릴 조작 감각을 안정화하세요', max: 20, value: Math.min(20, caught), reward: 450 },
      { id: 'catch50', category: '성장', title: '누적 50마리 잡기', desc: '숙련 낚시꾼을 위한 장기 목표', max: 50, value: Math.min(50, caught), reward: 900 },
      { id: 'unique5', category: '도감', title: '도감 5종 발견', desc: '다른 수역으로 이동해 다양한 물고기를 찾기', max: 5, value: Math.min(5, uniqueCaught), reward: 260 },
      { id: 'unique15', category: '도감', title: '도감 15종 발견', desc: '잠긴 수역 해금의 핵심 목표', max: 15, value: Math.min(15, uniqueCaught), reward: 620 },
      { id: 'unique30', category: '도감', title: '도감 30종 발견', desc: '귀여운 2.5D 물고기 컬렉션 확장', max: 30, value: Math.min(30, uniqueCaught), reward: 1200 },
      { id: 'rare3', category: '도감', title: '희귀 물고기 3종 발견', desc: 'RARE 등급 물고기를 찾아보세요', max: 3, value: Math.min(3, rareCaught), reward: 360 },
      { id: 'epic3', category: '도감', title: '에픽 물고기 3종 발견', desc: 'EPIC 등급은 장력 관리가 중요합니다', max: 3, value: Math.min(3, epicCaught), reward: 560 },
      { id: 'boss1', category: '보스', title: '보스급 물고기 첫 발견', desc: '강한 입질과 장력 서지를 버텨내세요', max: 1, value: Math.min(1, bossCaught), reward: 800, event: true },
      { id: 'boss3', category: '보스', title: '보스급 물고기 3종 발견', desc: '고급 수역의 진짜 손맛을 확인', max: 3, value: Math.min(3, bossCaught), reward: 1600, event: true },
      { id: 'streak2', category: '콤보', title: '연속 성공 2회', desc: '콤보 보상과 도감 수집을 같이 노리기', max: 2, value: Math.min(2, this.save.bestStreak), reward: 140 },
      { id: 'streak5', category: '콤보', title: '연속 성공 5회', desc: '안전지대 유지 감각이 필요합니다', max: 5, value: Math.min(5, this.save.bestStreak), reward: 520 },
      { id: 'streak10', category: '콤보', title: '연속 성공 10회', desc: '고수용 장기 콤보 도전', max: 10, value: Math.min(10, this.save.bestStreak), reward: 1400 },
      { id: 'rod3', category: '장비', title: '낚싯대 Lv.3 달성', desc: '장력 상승이 조금 더 안정됩니다', max: 3, value: Math.min(3, this.save.gear.rodLevel), reward: 220 },
      { id: 'rod6', category: '장비', title: '낚싯대 Lv.6 달성', desc: '고급 수역 준비를 위한 강화 목표', max: 6, value: Math.min(6, this.save.gear.rodLevel), reward: 720 },
      { id: 'reel3', category: '장비', title: '릴 Lv.3 달성', desc: '릴링 반응성이 좋아집니다', max: 3, value: Math.min(3, this.save.gear.reelLevel), reward: 240 },
      { id: 'line3', category: '장비', title: '낚싯줄 Lv.3 달성', desc: '안전지대가 넓어지는 강화 목표', max: 3, value: Math.min(3, this.save.gear.lineLevel), reward: 240 },
      { id: 'gear10', category: '장비', title: '장비 총합 Lv.10', desc: '장비 균형 강화로 안정적인 손맛 확보', max: 10, value: Math.min(10, gearTotalLevel), reward: 680 },
      { id: 'upgrade5', category: '장비', title: '장비 강화 5회', desc: '성장 루프를 체감하는 누적 미션', max: 5, value: Math.min(5, gearUpgradeCount), reward: 420 },
      { id: 'lure10', category: '상점', title: '미끼 10개 보유', desc: '입질 대기시간을 줄일 준비', max: 10, value: Math.min(10, this.save.gear.lureStock), reward: 200 },
      { id: 'unlock5', category: '수역', title: '수역 5곳 해금', desc: '도감과 미션을 진행하면 새 수역이 열립니다', max: 5, value: Math.min(5, regionUnlocked), reward: 520 },
      { id: 'unlock8', category: '수역', title: '수역 8곳 해금', desc: '후반 수역까지 항해 경로 확장', max: 8, value: Math.min(8, regionUnlocked), reward: 900 },
      { id: 'mastery10', category: '숙련', title: '수역 숙련도 10 달성', desc: '한 수역에서 꾸준히 성공하면 숙련도가 오릅니다', max: 10, value: Math.min(10, masteryMax), reward: 520 },
      { id: 'mastery25', category: '숙련', title: '수역 숙련도 25 달성', desc: '고급 물고기를 안정적으로 노리는 장기 목표', max: 25, value: Math.min(25, masteryMax), reward: 1200 },
      { id: 'eventClown', category: '깜짝 이벤트', title: '흰동가리 깜짝 출몰', desc: '잔잔한 해변에서 귀여운 인기 물고기 발견', max: 1, value: hasClown ? 1 : 0, reward: 300, event: true },
      { id: 'eventStorm', category: '깜짝 이벤트', title: '폭풍 외해 소문 확인', desc: '폭풍 외해 해금 또는 성공 12회 달성', max: 1, value: this.isRegionUnlocked('storm') || this.save.totalSuccess >= 12 ? 1 : 0, reward: 450, event: true },
      { id: 'missionCollector', category: '미션', title: '미션 10개 완료', desc: '보상 루프를 꾸준히 회수하세요', max: 10, value: Math.min(10, missionDone), reward: 1000, event: true },
    ];
  }

  private renderMission(): void {
    this.clear();
    const root = this.baseGameShell('mission');
    const goals = this.missionGoals();
    const doneCount = Object.values(this.save.missions).filter(Boolean).length;
    const readyCount = goals.filter((goal) => goal.value >= goal.max && !this.save.missions[goal.id]).length;
    root.innerHTML += `
      <section class="page-head glass-card v800-head"><div><span class="eyebrow">MISSION</span><h2>미션 보드</h2><p>데일리 · 성장 · 도감 · 장비 미션을 읽기 쉬운 세로 카드로 재배치했습니다.</p></div><strong class="page-coin">${readyCount}개 대기</strong></section>
      <section class="mission-dashboard glass-card"><strong>완료 ${doneCount}/${goals.length}</strong><span>수령 가능 ${readyCount}개 · 골드 ${this.save.coins}G</span></section>
      <section class="mission-list mission-list-v750">
        ${goals.map((goal) => {
          const claimed = !!this.save.missions[goal.id];
          const ready = goal.value >= goal.max && !claimed;
          const percent = Math.max(0, Math.min(100, Math.round((goal.value / goal.max) * 100)));
          return `<article class="mission-card glass-card ${ready ? 'ready' : ''} ${claimed ? 'claimed' : ''} ${goal.event ? 'event' : ''}"><div class="mission-row"><span class="mission-tag">${goal.category}</span><strong>${goal.title}</strong></div><p>${goal.desc}</p><progress max="${goal.max}" value="${goal.value}"></progress><span class="mission-state">${claimed ? '완료됨' : `${goal.value}/${goal.max} · ${percent}%`} · 보상 ${goal.reward}G</span><button class="image-btn soft" data-claim="${goal.id}" ${!ready ? 'disabled' : ''}>${claimed ? '완료' : ready ? '보상 받기' : '진행 중'}</button></article>`;
        }).join('')}
      </section>`;
    dom.app.appendChild(root);
    this.mountBottomNav(root, 'mission');
    root.querySelectorAll<HTMLButtonElement>('[data-claim]').forEach((btn) => btn.addEventListener('click', () => this.claimMission(btn.dataset.claim ?? '')));
  }

  private claimMission(id: string): void {
    if (this.save.missions[id]) return;
    const goal = this.missionGoals().find((item) => item.id === id);
    if (!goal || goal.value < goal.max) return;
    const reward = goal.reward;
    this.save.missions[id] = true;
    this.save.coins += reward;
    this.updateUnlocks();
    saveGame(this.save);
    this.toast.show({ type: 'reward', title: '미션 보상 획득', message: `${goal.title} · ${reward}G를 받았습니다.`, actionScreen: id.includes('unlock') ? 'village' : id.includes('gear') || id.includes('rod') || id.includes('reel') || id.includes('line') ? 'gear' : 'mission' });
    this.renderMission();
  }

  private pickFish(): FishInfo {
    const pool = fishDex.filter((fish) => fish.id !== 'unknown' && fish.regionKey === this.save.region);
    const weighted = pool.length ? pool : fishDex.filter((fish) => fish.id !== 'unknown');
    const bonus = Math.min(1.35, 1 + this.save.currentStreak * 0.04 + this.save.gear.lureStock * 0.005);
    const total = weighted.reduce((sum, fish) => sum + fish.weight * (fish.rarity === 'BOSS' ? bonus : 1), 0);
    let roll = Math.random() * total;
    for (const fish of weighted) {
      roll -= fish.weight * (fish.rarity === 'BOSS' ? bonus : 1);
      if (roll <= 0) return fish;
    }
    return weighted[0];
  }

  private calculateReward(fish: FishInfo): number {
    const streakBonus = Math.min(80, this.save.currentStreak * 8);
    const gearBonus = this.save.gear.rodLevel * 6 + this.save.gear.reelLevel * 4 + this.save.gear.lineLevel * 4;
    return Math.round((fish.reward + streakBonus + gearBonus) * this.getRegion().difficulty);
  }

  private updateUnlocks(): void {
    const unlocked = new Set(this.save.unlockedRegions);
    if (this.save.totalSuccess >= 2) unlocked.add('deep');
    if (this.totalCaught() >= 5) unlocked.add('palace');
    if (this.save.totalSuccess >= 8 || this.save.missions.stormUnlock) unlocked.add('glacier');
    if (this.save.totalSuccess >= 12 || this.save.missions.stormUnlock) unlocked.add('storm');
    if (this.save.bestStreak >= 4 || this.totalCaught() >= 10) unlocked.add('dimension');
    if (this.totalCaught() >= 14 || (this.save.mastery.river ?? 0) >= 6) unlocked.add('mangrove');
    if (this.save.bestStreak >= 6 || (this.save.mastery.dimension ?? 0) >= 4) unlocked.add('lunar');
    if (Object.values(this.save.missions).filter(Boolean).length >= 2 || this.save.totalSuccess >= 5) unlocked.add('reefFestival');
    this.save.unlockedRegions = Array.from(unlocked);
  }

  private totalCaught(): number {
    return Object.values(this.save.caught).reduce((a, b) => a + b, 0);
  }

  private isRegionUnlocked(key: RegionKey): boolean {
    return this.save.unlockedRegions.includes(key) || ['lake', 'river', 'harbor'].includes(key);
  }

  private getRegion() {
    return regions.find((r) => r.key === this.save.region) ?? regions[0];
  }


  private initFallbackFishingStage(): void {
    if (!this.stageHost || !this.pixiLayer) return;
    this.fallbackMode = true;
    const region = this.getRegion();
    this.activeFish = this.pickFish();
    this.pixiLayer.innerHTML = `<div class="fallback-scene" style="background-image:url('${region.bg}')"><img class="fallback-player" src="${ASSET.player}" alt="" /><img class="fallback-bobber" src="${ASSET.float}" alt="" /><div class="fallback-bite">!</div></div>`;
    this.createCastButton();
    this.stageHost.addEventListener('pointerdown', (ev) => {
      if (this.state === 'bite') this.startReeling();
      else if (this.state === 'reeling') { this.holding = true; this.spawnTouchRing(ev.clientX, ev.clientY); }
    });
    this.stageHost.addEventListener('pointerup', () => { if (this.state === 'reeling') this.holding = false; });
    window.setInterval(() => { if (this.fallbackMode) this.tick(); }, 1000 / 30);
    this.state = 'idle';
    this.setHint('HTML 대체 렌더로 안정 실행 중입니다');
  }

  private castLineFallback(): void {
    if (this.state !== 'idle' || !this.castBtn) return;
    playSound('cast');
    this.vibrate(12);
    this.save.totalCasts += 1;
    if (this.save.gear.lureStock > 0) this.save.gear.lureStock -= 1;
    saveGame(this.save);
    this.activeFish = this.pickFish();
    this.state = 'casting';
    this.castBtn.classList.add('pop-out');
    this.stageHost?.classList.add('fallback-casting');
    this.setHint('찌가 수면으로 날아갑니다');
    window.setTimeout(() => this.castBtn?.classList.add('hidden'), 260);
    window.setTimeout(() => { this.spawnSplash(); this.scheduleBite(); }, 820);
  }

  private hasWebGL(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
    } catch {
      return false;
    }
  }

  private async enterImmersiveMode(): Promise<void> {
    await requestHardPortraitLock();
  }

  private bindViewportGuard(): void {
    applyPortraitViewportMetrics();
    window.setTimeout(() => applyPortraitViewportMetrics(), 80);
    window.setTimeout(() => applyPortraitViewportMetrics(), 360);
  }

  private vibrate(pattern: VibratePattern): void {
    try { navigator.vibrate?.(pattern); } catch { /* optional haptics */ }
  }

  private async registerServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) return;
    try {
      const reg = await navigator.serviceWorker.register('./sw.js');
      await reg.update();
      reg.active?.postMessage({ type: 'AQUA_FORCE_CACHE_SWEEP' });
    } catch (error) {
      console.warn('[AquaFantasia] service worker skipped', error);
    }
  }

  private async sweepCaches(): Promise<void> {
    try {
      if (!('caches' in window)) return;
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key.startsWith('aqua-fantasia-') && key !== CACHE_NAME).map((key) => caches.delete(key)));
      localStorage.setItem('aqua-cache-version', APP_VERSION);
    } catch {
      // CacheStorage can be blocked. The game still works online.
    }
  }
}

void new AquaFantasiaGame().boot();
