import { Application, Assets, Container, Sprite, Text } from 'pixi.js';
import './styles.css';
import { APP_VERSION, CACHE_NAME, regions, fishDex, navItems } from './data';
import type { FishInfo, FishingState, RegionKey, SaveData, Screen } from './types';
import { loadSave, saveGame, tryAnonymousServerLink } from './storage';
import { initAudio, playSound } from './audio';
import { ToastManager } from './toast';
import { applyPortraitViewportMetrics, installPortraitCssGuards, requestHardPortraitLock } from './core/PortraitGuard';

const ASSET = {
  loginBg: './assets/v12/screens/start_screen_clean_v810.webp',
  player: './assets/v84/characters/chibi_fisher_01_hd.png',
  float: './assets/v12/icons/bobber.png',
  fish: './assets/v12/fish/fish_01.png',
  gauge: './assets/v12/icons/gauge_level.png',
  slot: './assets/art/fish_slot.png',
  ripple: './assets/art/water_ripple_overlay.webp',
  caustics: './assets/art/caustic_sparkle_overlay.webp',
  castButton: './assets/ui/button_cast_clean.png',
  perfect: './assets/v12/fx/particle_sparkle_cluster_ref_a.png',
  touchRing: './assets/v12/icons/sparkle.png',
};

const V13_BG: Record<Exclude<Screen, 'login'>, string> = {
  village: './assets/v13/compositions/town.webp',
  fishing: './assets/v13/compositions/fishing.webp',
  gear: './assets/v13/compositions/gear.webp',
  inventory: './assets/v13/compositions/inventory.webp',
  dex: './assets/v13/compositions/dex.webp',
  shop: './assets/v13/compositions/shop.webp',
  mission: './assets/v13/compositions/mission.webp',
  ranking: './assets/v13/compositions/ranking.webp',
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
  private immersiveRetryAt = 0;
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
    this.installImmersiveRetryHooks();
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
    this.reassertImmersiveMode();
    this.screen = screen;
    this.save.screen = screen;
    saveGame(this.save);
    if (screen === 'login') this.renderLogin();
    if (screen === 'village') this.renderVillage();
    if (screen === 'fishing') void this.renderFishing();
    if (screen === 'gear') this.renderGear();
    if (screen === 'inventory') this.renderInventory();
    if (screen === 'dex') this.renderDex();
    if (screen === 'shop') this.renderShop();
    if (screen === 'mission') this.renderMission();
    if (screen === 'ranking') this.renderRanking();
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
      <div class="start-design-surface" data-design="1024x1536">
        <img class="start-art-image" src="${ASSET.loginBg}" alt="아쿠아 판타지아 시작 화면" />
        <h1 class="sr-only">아쿠아 판타지아</h1>
        <button class="start-hotspot hit-depart" data-action="guest" aria-label="낚시터로 출항"></button>
        <button class="start-hotspot hit-new" data-action="new" aria-label="처음부터 새 게임"></button>
        <button class="start-hotspot hit-server" data-action="server" aria-label="익명 서버연동"></button>
        <button class="start-hotspot hit-keep v810-keep-button" data-action="keep" aria-label="이 기기에서 로그인 유지" aria-pressed="false"><span class="keep-indicator" aria-hidden="true"></span><span class="keep-text">이 기기에서 로그인 유지</span></button>
        <div class="login-touch-shine" aria-hidden="true"></div>
      </div>`;
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

  private createV13Screen(active: Exclude<Screen, 'login'>): HTMLElement {
    this.clear();
    const root = document.createElement('main');
    root.className = `game-screen v13-screen v820-screen v840-menu-screen ${active}-screen locked-screen`;
    root.setAttribute('data-v13-tab', active);
    root.innerHTML = `<div class="v13-design-surface" data-design="1080x1920"><img class="v13-bg" src="${V13_BG[active]}" alt="${active} 탭 UI 구성" loading="eager" /><div class="v13-top-action-cleaner" aria-hidden="true"></div><div class="v13-hot-layer" aria-hidden="false"></div></div>`;
    return root;
  }

  private addV13Hotspot(root: HTMLElement, className: string, label: string, rect: [number, number, number, number], onClick: () => void): HTMLButtonElement {
    const layer = root.querySelector<HTMLDivElement>('.v13-hot-layer')!;
    const [x, y, w, h] = rect;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `v13-hotspot ${className}`;
    btn.setAttribute('aria-label', label);
    btn.style.setProperty('--x', `${(x / 1080) * 100}%`);
    btn.style.setProperty('--y', `${(y / 1920) * 100}%`);
    btn.style.setProperty('--w', `${(w / 1080) * 100}%`);
    btn.style.setProperty('--h', `${(h / 1920) * 100}%`);
    btn.addEventListener('click', (ev) => {
      ev.preventDefault();
      onClick();
    });
    layer.appendChild(btn);
    return btn;
  }

  private tapMissionCard(id: string): void {
    const goal = this.missionGoals().find((item) => item.id === id);
    if (!goal) return;
    if (this.save.missions[id]) {
      this.toast.show({ type: 'mission', title: '이미 완료한 미션', message: goal.title, actionScreen: 'mission' });
      return;
    }
    if (goal.value < goal.max) {
      this.toast.show({ type: 'mission', title: '아직 진행 중', message: `${goal.title} · ${goal.value}/${goal.max}`, actionScreen: 'fishing' });
      return;
    }
    this.claimMission(id);
  }

  private renderVillage(): void {
    const root = this.createV13Screen('village');
    this.addV13Hotspot(root, 'v13-town-fish-cta', '낚시터로 출항', [290, 1455, 500, 104], () => { void this.go('fishing'); });
    this.addV13Hotspot(root, 'v13-town-gear', '장비 탭으로 이동', [70, 690, 450, 235], () => { void this.go('gear'); });
    this.addV13Hotspot(root, 'v13-town-mission', '미션 탭으로 이동', [560, 690, 450, 235], () => { void this.go('mission'); });
    this.addV13Hotspot(root, 'v13-town-shop', '상점 탭으로 이동', [70, 955, 450, 235], () => { void this.go('shop'); });
    this.addV13Hotspot(root, 'v13-town-dex', '도감 탭으로 이동', [560, 955, 450, 235], () => { void this.go('dex'); });
    this.addV13Hotspot(root, 'v13-town-notice', '오늘의 수역 안내', [70, 300, 940, 150], () => {
      const region = this.getRegion();
      this.toast.show({ type: 'fishing', title: region.name, message: `${region.subtitle} · ${region.tide}`, actionScreen: 'fishing' });
    });
    dom.app.appendChild(root);
    this.mountBottomNav(root, 'village');
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
    const region = this.getRegion();
    this.clear();
    const root = document.createElement('main');
    root.className = 'game-screen fishing-screen v840-fishing-screen locked-screen';
    root.style.setProperty('--region-glow', region.color);
    root.innerHTML = `
      <span id="fishingHint" class="sr-only">낚시 시작 버튼으로 캐스팅하세요.</span>
      <div class="fishing-stage v840-fishing-stage" id="fishingStage">
        <div class="pixi-layer"></div>
        <div class="water-overlay"></div>
        <div class="caustic-overlay"></div>
      </div>
      <div class="fishing-hud v840-fishing-hud" aria-label="플레이어 정보">
        <div class="hud-chip region"><strong>${region.name}</strong><span>${region.tide}</span></div>
        <div class="hud-chip"><img src="./assets/v12/icons/coin.png" alt="" /><strong>${this.save.coins.toLocaleString('ko-KR')}</strong></div>
        <div class="hud-chip"><img src="./assets/v12/icons/bait_shrimp.png" alt="" /><strong>${this.save.gear.lureStock}</strong></div>
      </div>
      <div class="stage-ui v840-stage-ui"></div>
      <div class="combo-badge ${this.save.currentStreak > 1 ? '' : 'hidden'}" id="comboBadge">연속 성공 x${Math.max(2, this.save.currentStreak)}</div>
      <section class="recent-catch-strip" aria-label="최근 포획">
        ${this.recentCatchMarkup()}
      </section>
      <div class="reel-panel glass-card hidden v840-reel-panel" id="reelPanel">
        <img src="${ASSET.gauge}" alt="장력 게이지" />
        <div class="tension-track"><span class="safe-zone"></span><span class="tension-fill"></span></div>
        <div class="safe-progress"><span></span></div>
        <div class="surge-meter"><span></span></div>
        <button class="hold-pad">꾹 눌러 릴 감기</button>
        <p>녹색 안전지대를 3초 유지하세요.</p>
      </div>`;
    dom.app.appendChild(root);
    this.mountBottomNav(root, 'fishing');
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
    const startHold = (ev: PointerEvent) => { this.reassertImmersiveMode(); this.holding = true; this.holdPad?.setPointerCapture?.(ev.pointerId); this.spawnTouchRing(ev.clientX, ev.clientY); this.vibrate(8); };
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

  private recentCatchMarkup(): string {
    const entries = Object.entries(this.save.caught)
      .filter(([, count]) => count > 0)
      .map(([id, count]) => ({ fish: fishDex.find((item) => item.id === id), count }))
      .filter((item): item is { fish: FishInfo; count: number } => Boolean(item.fish))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
    if (!entries.length) {
      return `<div class="recent-empty"><strong>최근 포획</strong><span>아직 기록이 없어요. 낚시 시작으로 첫 포획을 노려보세요.</span></div>`;
    }
    return `<strong class="recent-title">최근 포획</strong><div class="recent-cards">${entries.map(({ fish, count }) => `<div class="recent-card rarity-${fish.rarity.toLowerCase()}"><img src="${fish.img}" alt="" /><span>${fish.name}</span><em>x${count}</em></div>`).join('')}</div>`;
  }

  private baseGameShell(name: string): HTMLElement {
    const root = document.createElement('main');
    root.className = `game-screen ${name}-screen v800-screen v810-screen ${name === 'fishing' ? 'locked-screen' : 'scroll-screen'}`;
    root.innerHTML = `<div class="ambient-bg" aria-hidden="true"></div>`;
    return root;
  }

  private mountBottomNav(root: HTMLElement, active: Screen): void {
    dom.app.querySelector('.bottom-nav')?.remove();
    const nav = document.createElement('nav');
    const v13 = false;
    nav.className = 'bottom-nav glass-card premium-bottom-nav fixed-root-nav v840-bottom-nav';
    nav.setAttribute('aria-label', '하단 메뉴');
    nav.setAttribute('data-fixed-root', 'true');
    nav.innerHTML = navItems.map(({ screen, icon, label }) => {
      if (v13) return `<button class="${screen === active ? 'active' : ''}" data-screen="${screen}" aria-label="${label}"><span>${label}</span></button>`;
      return `<button class="${screen === active ? 'active' : ''}" data-screen="${screen}"><img src="${icon}" alt="" /><span>${label}</span></button>`;
    }).join('');
    dom.app.appendChild(nav);
    root.classList.add('has-fixed-root-nav');
    nav.querySelectorAll<HTMLButtonElement>('[data-screen]').forEach((btn) => btn.addEventListener('click', () => { this.reassertImmersiveMode(); void this.go(btn.dataset.screen as Screen); }));
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
    const playerTargetH = Math.min(h * 0.26, w * 0.58);
    this.player.scale.set(playerTargetH / Math.max(1, this.player.texture.height));
    this.player.position.set(w * 0.24, h * 0.64);
    const bobberTarget = Math.max(34, Math.min(58, w * 0.105));
    this.bobber.scale.set(bobberTarget / Math.max(1, this.bobber.texture.width));
    this.bobber.position.set(w * 0.68, h * 0.58);
    const fishTargetW = Math.min(w * 0.44, 210);
    this.catchSprite.scale.set(fishTargetW / Math.max(1, this.catchSprite.texture.width));
    this.catchSprite.position.set(w * 0.55, h * 0.48);
    this.biteText.position.set(w * 0.69, h * 0.40);
  }

  private createCastButton(): void {
    if (!this.uiLayer) return;
    this.uiLayer.innerHTML = `<button class="cast-button" type="button" aria-label="낚시 시작"><span class="cast-icon" aria-hidden="true"></span><strong>낚시 시작</strong></button>`;
    this.castBtn = this.uiLayer.querySelector<HTMLButtonElement>('.cast-button')!;
    this.castBtn.addEventListener('click', () => { this.reassertImmersiveMode(); this.castLine(); });
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
      this.catchSprite.scale.set((Math.min(this.pixi.screen.width, this.pixi.screen.height) / 1120) * s);
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
    const root = this.createV13Screen('gear');
    this.addV13Hotspot(root, 'v13-gear-rod-main', '낚싯대 강화', [70, 300, 940, 390], () => this.buyUpgrade('rod'));
    this.addV13Hotspot(root, 'v13-gear-slot-rod', '낚싯대 슬롯 강화', [75, 750, 445, 145], () => this.buyUpgrade('rod'));
    this.addV13Hotspot(root, 'v13-gear-slot-reel', '릴 슬롯 강화', [555, 750, 445, 145], () => this.buyUpgrade('reel'));
    this.addV13Hotspot(root, 'v13-gear-slot-line', '낚싯줄 슬롯 강화', [75, 920, 445, 145], () => this.buyUpgrade('line'));
    this.addV13Hotspot(root, 'v13-gear-slot-lure', '미끼 보충', [555, 920, 445, 145], () => this.buyUpgrade('lure'));
    this.addV13Hotspot(root, 'v13-gear-slot-balance', '장비 균형 안내', [75, 1090, 925, 140], () => {
      this.toast.show({ type: 'fishing', title: '장비 효과 합계', message: `낚싯대 Lv.${this.save.gear.rodLevel} · 릴 Lv.${this.save.gear.reelLevel} · 줄 Lv.${this.save.gear.lineLevel}`, actionScreen: 'fishing' });
    });
    dom.app.appendChild(root);
    this.mountBottomNav(root, 'gear');
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

  private renderInventory(): void {
    const root = this.createV13Screen('inventory');
    this.addV13Hotspot(root, 'v13-inventory-bait', '미끼 사용하고 낚시로 이동', [70, 405, 220, 220], () => { void this.go('fishing'); });
    this.addV13Hotspot(root, 'v13-inventory-ticket', '상점에서 아이템 보충', [315, 405, 220, 220], () => { void this.go('shop'); });
    this.addV13Hotspot(root, 'v13-inventory-use', '선택 아이템 사용', [690, 1435, 310, 125], () => {
      this.toast.show({ type: 'shop', title: '아이템 가방', message: `보유 미끼 ${this.save.gear.lureStock}개 · 낚시 화면에서 자동 사용됩니다.`, actionScreen: 'fishing' });
    });
    dom.app.appendChild(root);
    this.mountBottomNav(root, 'inventory');
  }

  private renderDex(): void {
    const root = this.createV13Screen('dex');
    this.addV13Hotspot(root, 'v13-dex-progress', '도감 진행도 보기', [70, 300, 940, 145], () => {
      const caughtCount = this.totalCaught();
      const discovered = fishDex.filter((fish) => fish.id !== 'unknown' && ((this.save.caught[fish.id] ?? 0) > 0 || fish.rarity === 'COMMON')).length;
      this.toast.show({ type: 'dex', title: '도감 진행도', message: `수집 ${caughtCount}마리 · 발견 ${discovered}/${fishDex.length - 1}종`, actionScreen: 'fishing' });
    });
    this.addV13Hotspot(root, 'v13-dex-fishing', '도감 채우러 낚시하기', [70, 585, 940, 820], () => { void this.go('fishing'); });
    dom.app.appendChild(root);
    this.mountBottomNav(root, 'dex');
  }

  private renderShop(): void {
    const root = this.createV13Screen('shop');
    const goods = [
      { name: '산호 미끼 묶음', desc: '미끼 +5', cost: 120, effect: () => { this.save.gear.lureStock += 5; } },
      { name: '릴 윤활 오일', desc: '릴 Lv.+1', cost: 180, effect: () => { this.save.gear.reelLevel += 1; } },
      { name: '물결 안정 부적', desc: '낚싯줄 Lv.+1', cost: 210, effect: () => { this.save.gear.lineLevel += 1; } },
      { name: '비상 구조 키트', desc: '미끼 +2', cost: 260, effect: () => { this.save.lastRescueAt = Date.now(); this.save.gear.lureStock += 2; } },
    ];
    const buy = (index: number) => {
      const item = goods[index];
      if (!item) return;
      if (this.save.coins < item.cost) {
        this.toast.show({ type: 'shop', title: '골드가 부족해요', message: `${item.name} · ${item.cost}G 필요`, actionScreen: 'fishing' });
        return;
      }
      this.save.coins -= item.cost;
      item.effect();
      saveGame(this.save);
      this.toast.show({ type: 'shop', title: '구매 완료', message: `${item.name} · ${item.desc}`, actionScreen: 'inventory' });
    };
    this.addV13Hotspot(root, 'v13-shop-featured', '추천 상품 구매', [70, 300, 940, 180], () => buy(0));
    this.addV13Hotspot(root, 'v13-shop-card-a', '산호 미끼 묶음 구매', [70, 630, 455, 360], () => buy(0));
    this.addV13Hotspot(root, 'v13-shop-card-b', '릴 윤활 오일 구매', [555, 630, 455, 360], () => buy(1));
    this.addV13Hotspot(root, 'v13-shop-card-c', '물결 안정 부적 구매', [70, 1040, 455, 360], () => buy(2));
    this.addV13Hotspot(root, 'v13-shop-card-d', '비상 구조 키트 구매', [555, 1040, 455, 360], () => buy(3));
    this.addV13Hotspot(root, 'v13-shop-free', '무료 보상 받기', [70, 1470, 940, 130], () => {
      this.save.coins += 50;
      saveGame(this.save);
      this.toast.show({ type: 'reward', title: '무료 보상', message: '50G를 받았습니다.', actionScreen: 'shop' });
    });
    dom.app.appendChild(root);
    this.mountBottomNav(root, 'shop');
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
    const root = this.createV13Screen('mission');
    const goals = this.missionGoals();
    const readyCount = goals.filter((goal) => goal.value >= goal.max && !this.save.missions[goal.id]).length;
    this.addV13Hotspot(root, 'v13-mission-dashboard', '미션 진행도 안내', [70, 300, 940, 160], () => {
      const doneCount = Object.values(this.save.missions).filter(Boolean).length;
      this.toast.show({ type: 'mission', title: '오늘의 미션', message: `완료 ${doneCount}/${goals.length} · 수령 가능 ${readyCount}개`, actionScreen: 'mission' });
    });
    goals.slice(0, 5).forEach((goal, index) => {
      this.addV13Hotspot(root, `v13-mission-row-${index}`, `${goal.title} 미션`, [70, 510 + index * 178, 940, 150], () => this.tapMissionCard(goal.id));
    });
    this.addV13Hotspot(root, 'v13-mission-weekly', '주간 미션 안내', [70, 1450, 940, 130], () => {
      this.toast.show({ type: 'mission', title: '주간 미션', message: '도감과 장비 성장 미션을 계속 누적하세요.', actionScreen: 'fishing' });
    });
    dom.app.appendChild(root);
    this.mountBottomNav(root, 'mission');
  }

  private renderRanking(): void {
    this.clear();
    const score = this.save.bestStreak * 1000 + this.save.totalSuccess * 120 + this.totalCaught() * 35;
    const caught = this.totalCaught();
    const linkedLabel = this.save.serverLinked ? '익명 서버 연동 계정' : '로컬 테스트 계정';
    const root = document.createElement('main');
    root.className = 'game-screen ranking-screen v840-ranking-screen scroll-screen';
    root.innerHTML = `
      <div class="ambient-bg" aria-hidden="true"></div>
      <section class="v840-page-panel ranking-panel" aria-label="랭킹">
        <header class="v840-panel-head">
          <span>REAL USER RANKING</span>
          <h2>랭킹</h2>
          <p>가짜 유저 데이터는 제거했습니다. 지금은 실제 저장 기록 기준으로 내 계정만 표시합니다.</p>
        </header>
        <div class="ranking-live-card">
          <div class="rank-medal">#1</div>
          <div class="rank-user">
            <strong>나</strong>
            <span>${linkedLabel}</span>
          </div>
          <div class="rank-score"><strong>${score.toLocaleString('ko-KR')}</strong><span>점</span></div>
        </div>
        <div class="ranking-stats-grid">
          <div><strong>${this.save.bestStreak}</strong><span>최고 콤보</span></div>
          <div><strong>${this.save.totalSuccess}</strong><span>성공</span></div>
          <div><strong>${caught}</strong><span>누적 포획</span></div>
          <div><strong>${this.save.coins.toLocaleString('ko-KR')}</strong><span>골드</span></div>
        </div>
        <button class="image-btn ranking-cta" type="button" data-go-fishing>낚시터에서 기록 올리기</button>
        <p class="ranking-note">Firebase 리더보드 쓰기/읽기 규칙을 연결하면 이 영역을 실제 서버 상위 유저 목록으로 확장합니다.</p>
      </section>`;
    dom.app.appendChild(root);
    root.querySelector<HTMLButtonElement>('[data-go-fishing]')?.addEventListener('click', () => { this.reassertImmersiveMode(); void this.go('fishing'); });
    this.mountBottomNav(root, 'ranking');
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

  private installImmersiveRetryHooks(): void {
    const retry = () => this.reassertImmersiveMode();
    window.addEventListener('pointerdown', retry, { passive: true });
    window.addEventListener('touchend', retry, { passive: true });
    window.addEventListener('pageshow', retry, { passive: true });
    document.addEventListener('visibilitychange', retry, { passive: true });
  }

  private reassertImmersiveMode(): void {
    const now = performance.now();
    applyPortraitViewportMetrics();
    window.scrollTo?.(0, 0);
    if (now - this.immersiveRetryAt < 900) return;
    this.immersiveRetryAt = now;
    void requestHardPortraitLock();
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
