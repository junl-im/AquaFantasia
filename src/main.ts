import { Application, Assets, Container, Sprite, Text } from 'pixi.js';
import './styles.css';
import { APP_VERSION, CACHE_NAME, regions, fishDex, navItems } from './data';
import type { FishInfo, FishingState, RegionKey, SaveData, Screen } from './types';
import { loadSave, saveGame, tryAnonymousServerLink } from './storage';
import { initAudio, playSound } from './audio';
import { ToastManager } from './toast';
import { applyPortraitViewportMetrics, installPortraitCssGuards, requestHardPortraitLock } from './core/PortraitGuard';
import { UnderwaterWebglLayer, type UnderwaterLayerMood } from './core/UnderwaterWebglLayer';

const ASSET = {
  loginBg: './assets/v85/screens/start_screen_clean_v810.webp',
  player: './assets/v93/characters/fisher_boat_cute_action.png',
  float: './assets/v92/icons/bobber.png',
  fish: './assets/v92/fish/fish_01.png',
  gauge: './assets/v92/fx/gauge_050.png',
  slot: './assets/art/fish_slot.png',
  ripple: './assets/art/water_ripple_overlay.webp',
  caustics: './assets/art/caustic_sparkle_overlay.webp',
  castButton: './assets/ui/button_cast_clean.png',
  perfect: './assets/v12/fx/particle_sparkle_cluster_ref_a.png',
  touchRing: './assets/v92/fx/ring_aqua.png',
};

const V13_BG: Record<Exclude<Screen, 'login'>, string> = {
  village: './assets/v85/compositions/town.webp',
  fishing: './assets/v85/compositions/fishing.webp',
  gear: './assets/v85/compositions/gear.webp',
  inventory: './assets/v85/compositions/inventory.webp',
  dex: './assets/v85/compositions/dex.webp',
  shop: './assets/v85/compositions/shop.webp',
  mission: './assets/v85/compositions/mission.webp',
  ranking: './assets/v85/compositions/ranking.webp',
};

const V3D_MENU_BG: Record<Exclude<Screen, 'login' | 'fishing'>, string> = {
  village: './assets/v92/bg/menu_town.webp',
  gear: './assets/v92/bg/menu_gear.webp',
  inventory: './assets/v92/bg/menu_inventory.webp',
  dex: './assets/v92/bg/menu_dex.webp',
  shop: './assets/v92/bg/menu_shop.webp',
  mission: './assets/v92/bg/menu_mission.webp',
  ranking: './assets/v92/bg/menu_ranking.webp',
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
  private webglLayers: UnderwaterWebglLayer[] = [];

  async boot(): Promise<void> {
    this.compact = window.matchMedia('(max-width: 420px), (prefers-reduced-motion: reduce)').matches || (navigator.hardwareConcurrency ?? 8) <= 4;
    document.documentElement.classList.toggle('perf-lite', this.compact);
    document.documentElement.dataset.initialOrientation = 'portrait';
    document.documentElement.dataset.orientationPolicy = 'hard-portrait';
    document.documentElement.classList.add('portrait-only-game');
    installPortraitCssGuards();
    document.documentElement.dataset.version = APP_VERSION;
    document.documentElement.dataset.visualPolish = 'v950-cute-ui-harmony';
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
    this.webglLayers.forEach((layer) => layer.dispose());
    this.webglLayers = [];
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
    root.innerHTML = `<div class="v13-design-surface" data-design="1080x1920"><img class="v13-bg" src="${V13_BG[active]}" alt="${active} 탭 UI 구성" loading="eager" /><div class="v13-top-action-cleaner" aria-hidden="true"></div><div class="v13-bottom-nav-cleaner" aria-hidden="true"></div><div class="v13-hot-layer" aria-hidden="false"></div></div>`;
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
    this.clear();
    const region = this.getRegion();
    const root = this.createRuntimeMenuScreen('village', '마을', '오늘의 조류와 수역을 고르고 바로 출항하세요.');
    const content = root.querySelector<HTMLDivElement>('.runtime-content')!;
    content.innerHTML = `
      <section class="runtime-hero-card tide-card v950-tide-card" aria-label="오늘의 조류">
        <img class="tide-mascot" src="./assets/v91/characters/chibi_fisher_face_icon.png" alt="" />
        <div>
          <span class="runtime-eyebrow">TODAY TIDE</span>
          <h2>오늘의 조류</h2>
          <p><strong>${region.name}</strong> · ${region.tide}<br>${region.subtitle}</p>
          <div class="v950-mini-chips"><span>보유 ${this.save.coins.toLocaleString('ko-KR')}G</span><span>미끼 ${this.save.gear.lureStock}개</span></div>
        </div>
        <button class="runtime-btn gold v950-primary-cta" type="button" data-go-fishing>출항</button>
      </section>
      <section class="runtime-quick-grid" aria-label="빠른 메뉴">
        <button class="runtime-menu-card" type="button" data-go="fishing"><img src="./assets/v91/icons/fishing.png" alt="" /><strong>낚시터</strong><span>바로 출항</span></button>
        <button class="runtime-menu-card" type="button" data-go="gear"><img src="./assets/v91/icons/gear.png" alt="" /><strong>장비</strong><span>강화 관리</span></button>
        <button class="runtime-menu-card" type="button" data-go="shop"><img src="./assets/v91/icons/shop.png" alt="" /><strong>상점</strong><span>미끼 보충</span></button>
        <button class="runtime-menu-card" type="button" data-go="mission"><img src="./assets/v91/icons/mission.png" alt="" /><strong>미션</strong><span>보상 회수</span></button>
      </section>
      <section class="runtime-panel region-panel" aria-label="수역 선택">
        <div class="runtime-panel-title"><span>FISHING AREA</span><strong>수역 선택</strong></div>
        <div class="region-grid runtime-region-grid">${regions.slice(0, 8).map((item) => this.regionCard(item.key)).join('')}</div>
      </section>`;
    dom.app.appendChild(root);
    root.querySelector<HTMLButtonElement>('[data-go-fishing]')?.addEventListener('click', () => { void this.go('fishing'); });
    root.querySelectorAll<HTMLButtonElement>('[data-go]').forEach((btn) => btn.addEventListener('click', () => { void this.go(btn.dataset.go as Screen); }));
    root.querySelectorAll<HTMLButtonElement>('[data-region]').forEach((btn) => btn.addEventListener('click', () => {
      const key = btn.dataset.region as RegionKey;
      if (!this.isRegionUnlocked(key)) {
        const item = regions.find((r) => r.key === key);
        this.toast.show({ type: 'normal', title: '잠긴 수역', message: item?.unlockHint ?? '조건을 달성하면 열립니다.', actionScreen: 'mission' });
        return;
      }
      this.save.region = key;
      saveGame(this.save);
      this.renderVillage();
    }));
    this.mountBottomNav(root, 'village');
  }

  private createRuntimeMenuScreen(active: Exclude<Screen, 'login' | 'fishing'>, title: string, subtitle: string): HTMLElement {
    this.clear();
    const root = document.createElement('main');
    root.className = `game-screen runtime-menu-screen v880-runtime-screen v890-v3d-screen v950-cute-ui-screen ${active}-screen scroll-screen`;
    root.setAttribute('data-runtime-screen', active);
    root.style.setProperty('--v89-world-bg', `url("${V3D_MENU_BG[active]}")`);
    root.innerHTML = `
      <div class="runtime-3d-bg" aria-hidden="true"><div class="underwater-webgl-host" data-underwater-webgl></div><span class="v3d-caustics"></span><span class="v3d-bubbles"></span><span class="v3d-depth-fog"></span></div>
      <img class="runtime-bg-character" src="${ASSET.player}" alt="" aria-hidden="true" loading="eager" />
      <header class="runtime-hud" aria-label="플레이어 HUD">
        <img class="runtime-hud-mascot" src="./assets/v91/characters/chibi_fisher_face_icon.png" alt="" />
        <div class="runtime-title"><span>AQUA FANTASIA</span><strong>${title}</strong><em>${subtitle}</em></div>
        <div class="runtime-wallet"><span><img src="./assets/v92/icons/coin.png" alt="" />${this.save.coins.toLocaleString('ko-KR')}</span><span><img src="./assets/v92/icons/bait.png" alt="" />${this.save.gear.lureStock}</span></div>
      </header>
      <div class="runtime-content"></div>`;
    this.mountUnderwaterWebgl(root, active === 'ranking' ? 'deep' : active === 'village' || active === 'shop' ? 'town' : 'reef');
    return root;
  }

  private mountUnderwaterWebgl(root: HTMLElement, mood: UnderwaterLayerMood): void {
    const host = root.querySelector<HTMLElement>('[data-underwater-webgl]');
    if (!host || document.documentElement.classList.contains('pixi-fallback-ready')) return;
    const layer = new UnderwaterWebglLayer(host, { mood, compact: this.compact });
    if (layer.start()) this.webglLayers.push(layer);
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
    root.className = 'game-screen fishing-screen v840-fishing-screen v890-fishing-screen v930-action-screen v950-cute-fishing-screen locked-screen';
    root.style.setProperty('--region-glow', region.color);
    root.style.setProperty('--v89-world-bg', `url("${region.bg}")`);
    root.innerHTML = `
      <span id="fishingHint" class="sr-only">낚시 시작 버튼으로 캐스팅하세요.</span>
      <div class="fishing-3d-ambient" aria-hidden="true"><div class="underwater-webgl-host" data-underwater-webgl></div><span class="v3d-caustics"></span><span class="v3d-bubbles"></span><span class="v3d-depth-fog"></span></div>
      <div class="fishing-stage v840-fishing-stage" id="fishingStage">
        <div class="pixi-layer"></div>
        <div class="water-overlay"></div>
        <div class="caustic-overlay"></div>
      </div>
      <div class="fishing-hud v840-fishing-hud" aria-label="플레이어 정보">
        <div class="hud-chip region"><strong>${region.name}</strong><span>${region.tide}</span></div>
        <div class="hud-chip"><img src="./assets/v92/icons/coin.png" alt="" /><strong>${this.save.coins.toLocaleString('ko-KR')}</strong></div>
        <div class="hud-chip"><img src="./assets/v92/icons/bait.png" alt="" /><strong>${this.save.gear.lureStock}</strong></div>
      </div>
      <div class="stage-ui v840-stage-ui"></div><div class="cute-action-layer" aria-hidden="true"></div>
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
    this.mountUnderwaterWebgl(root, 'fishing');
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
    await app.init({ resizeTo: this.stageHost, backgroundAlpha: 0, antialias: true, resolution: Math.min(window.devicePixelRatio || 1, this.compact ? 2 : 3), autoDensity: true, powerPreference: 'high-performance' });
    this.pixi = app;
    this.pixiLayer.appendChild(app.canvas);

    this.activeFish = this.pickFish();
    const textures = await Assets.load([this.getRegion().bg, ASSET.player, ASSET.float, this.activeFish.img]);
    this.applyTextureFidelity([textures[this.getRegion().bg], textures[ASSET.player], textures[ASSET.float], textures[this.activeFish.img]]);
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

  private applyTextureFidelity(textures: unknown[]): void {
    for (const texture of textures) {
      const maybeTexture = texture as { source?: { scaleMode?: string; autoGenerateMipmaps?: boolean; antialias?: boolean } };
      if (maybeTexture?.source) {
        maybeTexture.source.scaleMode = 'linear';
        maybeTexture.source.autoGenerateMipmaps = true;
        maybeTexture.source.antialias = true;
      }
    }
  }

  private resizePixi(): void {
    if (!this.pixi || !this.bgSprite || !this.player || !this.bobber || !this.catchSprite || !this.biteText) return;
    const w = this.pixi.screen.width;
    const h = this.pixi.screen.height;
    const bgScale = Math.max(w / this.bgSprite.texture.width, h / this.bgSprite.texture.height);
    this.bgSprite.scale.set(bgScale);
    this.bgSprite.position.set((w - this.bgSprite.texture.width * bgScale) / 2, (h - this.bgSprite.texture.height * bgScale) / 2);
    const playerTargetH = Math.min(h * 0.52, w * 1.08);
    this.player.scale.set(playerTargetH / Math.max(1, this.player.texture.height));
    this.player.position.set(w * 0.36, h * 0.80);
    const bobberTarget = Math.max(34, Math.min(58, w * 0.105));
    this.bobber.scale.set(bobberTarget / Math.max(1, this.bobber.texture.width));
    this.bobber.position.set(w * 0.68, h * 0.58);
    const fishTargetW = Math.min(w * 0.50, 260);
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
    this.spawnCastTrail();
    this.spawnActionBadge('퐁!', '찌를 던졌어요');
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
    this.spawnBiteBurst();
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
    this.spawnActionBadge('릴링!', '초록 안전지대를 유지해요');
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
      this.spawnRewardBurst(reward);
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
    card.className = `catch-result-card v930-result rarity-${this.activeFish.rarity.toLowerCase()}`;
    const firstCatch = (this.save.caught[this.activeFish.id] ?? 0) <= 1;
    card.innerHTML = `<i class="result-sparkle" aria-hidden="true"></i><img src="${this.activeFish.img}" alt="" /><small>${firstCatch ? 'NEW!' : this.activeFish.rarity}</small><h3>${this.activeFish.name}</h3><span>${this.activeFish.rarity} · ${reward}G · 연속 성공 x${Math.max(1, this.save.currentStreak)}</span><div><button data-next="fishing">계속 낚시</button><button data-next="dex">도감 보기</button></div>`;
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
    this.stageHost?.querySelectorAll('.v930-fx, .action-badge').forEach((node) => node.remove());
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
      const sx = w * 0.42, sy = h * 0.49;
      const ex = w * 0.68, ey = h * 0.58;
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
        this.spawnActionBadge('PERFECT!', '장력 중심을 잡았어요');
        this.vibrate(10);
      }
      this.safeTimer = safe ? this.safeTimer + dt / 60 * (perfect ? 1.16 : 1) : Math.max(0, this.safeTimer - dt / 70);
      this.stageHost?.classList.toggle('surge-alert', surgeActive);
      this.updateTensionUI();
      if (this.tension <= 2 || this.tension >= 98) this.finishCatch(false);
      if (this.safeTimer >= 3) this.finishCatch(true);
    }
  }


  private spawnCastTrail(): void {
    if (!this.stageHost) return;
    const trail = document.createElement('div');
    trail.className = 'v930-fx cast-trail-cute';
    trail.innerHTML = '<i></i><i></i><i></i><i></i><i></i>';
    this.stageHost.appendChild(trail);
    window.setTimeout(() => trail.remove(), 980);
  }

  private spawnBiteBurst(): void {
    if (!this.stageHost) return;
    const burst = document.createElement('div');
    burst.className = 'v930-fx bite-burst-cute';
    burst.innerHTML = '<span>!</span>';
    this.stageHost.appendChild(burst);
    window.setTimeout(() => burst.remove(), 980);
  }

  private spawnRewardBurst(reward: number): void {
    if (!this.stageHost) return;
    const burst = document.createElement('div');
    burst.className = 'v930-fx reward-burst-cute';
    burst.innerHTML = `<strong>+${reward}G</strong><span></span><span></span><span></span><span></span>`;
    this.stageHost.appendChild(burst);
    window.setTimeout(() => burst.remove(), 1400);
  }

  private spawnActionBadge(title: string, subtitle: string): void {
    if (!this.stageHost) return;
    this.stageHost.querySelector('.action-badge')?.remove();
    const badge = document.createElement('div');
    badge.className = 'action-badge v930-fx';
    badge.innerHTML = `<strong>${title}</strong><span>${subtitle}</span>`;
    this.stageHost.appendChild(badge);
    window.setTimeout(() => badge.remove(), 1550);
  }

  private spawnSplash(): void {
    const splash = document.createElement('div');
    splash.className = 'splash-ring v930-splash';
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
        message: '종료를 선택하면 현재 인앱 브라우저/탭 닫기를 즉시 시도합니다.',
        okText: '종료',
        cancelText: '취소',
        okAction: () => this.releaseBrowserBack(),
      });
      this.exitPromptOpen = false;
      if (!exit) this.allowBrowserLeave = false;
      return;
    }
    void this.go('village');
  }

  private releaseBrowserBack(): void {
    this.allowBrowserLeave = true;
    const ua = navigator.userAgent || '';
    const isKakao = /KAKAOTALK|KakaoTalk|KAKAOSTORY|KAKAOBIZ/i.test(ua);
    const isIOS = /iPhone|iPad|iPod/i.test(ua);

    try { window.open('', '_self')?.close(); } catch { /* optional browser close path */ }
    try { window.close(); } catch { /* optional browser close path */ }

    if (isKakao) {
      window.setTimeout(() => {
        try {
          window.location.href = isIOS ? 'kakaoweb://closeBrowser' : 'kakaotalk://inappbrowser/close';
        } catch {
          // Kakao scheme may be blocked by version or platform policy.
        }
      }, 35);
      window.setTimeout(() => this.showExitFallbackHint(), 820);
      return;
    }

    window.setTimeout(() => {
      try { history.length > 1 ? history.back() : window.close(); } catch { /* ignored */ }
    }, 100);
    window.setTimeout(() => this.showExitFallbackHint(), 820);
  }

  private showExitFallbackHint(): void {
    if (!this.allowBrowserLeave || this.screen === 'login') return;
    if (dom.app.querySelector('.exit-fallback-hint')) return;
    const hint = document.createElement('div');
    hint.className = 'exit-fallback-hint';
    hint.innerHTML = `<strong>브라우저 닫기가 차단됐어요</strong><span>카카오/일부 브라우저 정책상 자동 닫기가 막힐 수 있습니다. 우측 상단 닫기 또는 뒤로가기를 한 번 더 눌러주세요.</span><button type="button">확인</button>`;
    hint.querySelector('button')?.addEventListener('click', () => hint.remove());
    dom.app.appendChild(hint);
  }

  private showGameConfirm(options: { title: string; message: string; okText: string; cancelText: string; okAction?: () => void }): Promise<boolean> {
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
      backdrop.querySelector<HTMLButtonElement>('[data-dialog="ok"]')?.addEventListener('click', () => { options.okAction?.(); done(true); });
      backdrop.addEventListener('pointerdown', (ev) => {
        if (ev.target === backdrop) done(false);
      });
      dom.app.appendChild(backdrop);
    });
  }

  private renderGear(): void {
    const root = this.createRuntimeMenuScreen('gear', '장비', '낚싯대·릴·줄을 실제 수치에 맞춰 강화합니다.');
    const content = root.querySelector<HTMLDivElement>('.runtime-content')!;
    content.innerHTML = `
      <section class="runtime-hero-card gear-summary">
        <img src="./assets/v91/icons/gear.png" alt="" />
        <div><span class="runtime-eyebrow">EQUIPMENT</span><h2>장비 관리</h2><p>총합 Lv.${this.save.gear.rodLevel + this.save.gear.reelLevel + this.save.gear.lineLevel} · 미끼 ${this.save.gear.lureStock}개</p></div>
        <button class="runtime-btn cyan" type="button" data-go-fishing>낚시터</button>
      </section>
      <section class="gear-grid runtime-card-list">
        ${this.gearCard('rod', '낚싯대', './assets/v92/equipment/rod.png', this.save.gear.rodLevel, 120, '입질 반응 안정')}
        ${this.gearCard('reel', '릴', './assets/v92/equipment/reel.png', this.save.gear.reelLevel, 140, '릴링 반응 향상')}
        ${this.gearCard('line', '낚싯줄', './assets/v92/equipment/line.png', this.save.gear.lineLevel, 130, '안전지대 보정')}
        ${this.gearCard('lure', '미끼', './assets/v92/equipment/bait.png', this.save.gear.lureStock, 60, '입질 대기 감소')}
      </section>`;
    dom.app.appendChild(root);
    root.querySelector<HTMLButtonElement>('[data-go-fishing]')?.addEventListener('click', () => { void this.go('fishing'); });
    root.querySelectorAll<HTMLButtonElement>('[data-upgrade]').forEach((btn) => btn.addEventListener('click', () => this.buyUpgrade(btn.dataset.upgrade as 'rod' | 'reel' | 'line' | 'lure')));
    this.mountBottomNav(root, 'gear');
  }

  private gearCard(kind: 'rod' | 'reel' | 'line' | 'lure', name: string, icon: string, level: number, baseCost: number, desc: string): string {
    const cost = kind === 'lure' ? baseCost : baseCost + level * 90;
    const pct = Math.min(100, kind === 'lure' ? Math.max(18, level * 8) : level * 13 + 12);
    return `<article class="gear-card glass-card v950-gear-card"><div class="v950-item-orb"><img src="${icon}" alt="" /></div><div class="v950-card-main"><strong>${name}</strong><span>Lv.${level} · ${desc}</span><i class="v950-stat-bar" style="--p:${pct}%"><b></b></i></div><button class="image-btn soft v950-price-btn" data-upgrade="${kind}">${cost}G</button></article>`;
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
    const root = this.createRuntimeMenuScreen('inventory', '가방', '보유 아이템과 낚시 준비 상태를 확인합니다.');
    const content = root.querySelector<HTMLDivElement>('.runtime-content')!;
    content.innerHTML = `
      <section class="runtime-hero-card inventory-summary">
        <img src="./assets/v91/icons/bag.png" alt="" />
        <div><span class="runtime-eyebrow">INVENTORY</span><h2>가방</h2><p>미끼 ${this.save.gear.lureStock}개 · 구조 키트 ${this.save.lastRescueAt ? '준비됨' : '없음'}</p></div>
        <button class="runtime-btn gold" type="button" data-go-shop>상점</button>
      </section>
      <section class="runtime-item-grid">
        <article class="runtime-item-card v950-inventory-card"><em class="v950-count">x${this.save.gear.lureStock}</em><img src="./assets/v92/equipment/bait.png" alt="" /><strong>새우 미끼</strong><span>입질 대기시간을 줄여줘요</span><button class="runtime-btn cyan" data-go-fishing>사용하러 가기</button></article>
        <article class="runtime-item-card v950-inventory-card"><em class="v950-count">∞</em><img src="./assets/v92/equipment/ticket.png" alt="" /><strong>출항 티켓</strong><span>언제든 바로 출항 가능</span><button class="runtime-btn blue" data-go-fishing>낚시터</button></article>
        <article class="runtime-item-card v950-inventory-card"><em class="v950-count">NEW</em><img src="./assets/v92/equipment/chest.png" alt="" /><strong>보상 상자</strong><span>미션 보상으로 열 수 있어요</span><button class="runtime-btn blue" data-go-mission>미션 보기</button></article>
      </section>`;
    dom.app.appendChild(root);
    root.querySelector<HTMLButtonElement>('[data-go-shop]')?.addEventListener('click', () => { void this.go('shop'); });
    root.querySelectorAll<HTMLButtonElement>('[data-go-fishing]').forEach((btn) => btn.addEventListener('click', () => { void this.go('fishing'); }));
    root.querySelector<HTMLButtonElement>('[data-go-mission]')?.addEventListener('click', () => { void this.go('mission'); });
    this.mountBottomNav(root, 'inventory');
  }

  private renderDex(): void {
    const root = this.createRuntimeMenuScreen('dex', '도감', '실제 포획 기록 기준으로 물고기 카드를 표시합니다.');
    const content = root.querySelector<HTMLDivElement>('.runtime-content')!;
    const discovered = fishDex.filter((fish) => fish.id !== 'unknown' && ((this.save.caught[fish.id] ?? 0) > 0 || fish.rarity === 'COMMON')).length;
    const cards = fishDex.filter((fish) => fish.id !== 'unknown').slice(0, 18).map((fish) => {
      const count = this.save.caught[fish.id] ?? 0;
      const open = count > 0 || fish.rarity === 'COMMON';
      return `<article class="dex-card runtime-dex-card rarity-${fish.rarity.toLowerCase()} ${open ? '' : 'locked'}"><img src="${open ? fish.img : './assets/v85/fish/fish_unknown.png'}" alt="" /><strong>${open ? fish.name : '미발견'}</strong><span>${open ? `${fish.region} · ${count}마리` : '낚시터에서 발견하세요'}</span><em>${fish.rarity}</em></article>`;
    }).join('');
    content.innerHTML = `
      <section class="runtime-hero-card dex-summary">
        <img src="./assets/v91/icons/dex.png" alt="" />
        <div><span class="runtime-eyebrow">FISH DEX</span><h2>도감</h2><p>발견 ${discovered}/${fishDex.length - 1}종 · 누적 ${this.totalCaught()}마리</p></div>
        <button class="runtime-btn gold" type="button" data-go-fishing>채우러 가기</button>
      </section>
      <div class="v950-filter-row" aria-label="도감 필터 미리보기"><span>COMMON</span><span>RARE</span><span>EPIC</span><span>BOSS</span></div><section class="dex-grid runtime-dex-grid">${cards}</section>`;
    dom.app.appendChild(root);
    root.querySelector<HTMLButtonElement>('[data-go-fishing]')?.addEventListener('click', () => { void this.go('fishing'); });
    this.mountBottomNav(root, 'dex');
  }

  private renderShop(): void {
    const root = this.createRuntimeMenuScreen('shop', '상점', '미끼와 성장 아이템을 구매합니다.');
    const goods = [
      { name: '산호 미끼 묶음', desc: '미끼 +5', cost: 120, icon: './assets/v92/equipment/bait.png', effect: () => { this.save.gear.lureStock += 5; } },
      { name: '릴 윤활 오일', desc: '릴 Lv.+1', cost: 180, icon: './assets/v92/equipment/reel.png', effect: () => { this.save.gear.reelLevel += 1; } },
      { name: '물결 안정 부적', desc: '낚싯줄 Lv.+1', cost: 210, icon: './assets/v92/equipment/line.png', effect: () => { this.save.gear.lineLevel += 1; } },
      { name: '비상 구조 키트', desc: '미끼 +2', cost: 260, icon: './assets/v92/equipment/tackle.png', effect: () => { this.save.lastRescueAt = Date.now(); this.save.gear.lureStock += 2; } },
    ];
    const content = root.querySelector<HTMLDivElement>('.runtime-content')!;
    content.innerHTML = `
      <section class="runtime-hero-card shop-summary">
        <img src="./assets/v91/icons/shop.png" alt="" />
        <div><span class="runtime-eyebrow">SHOP</span><h2>상점</h2><p>보유 골드 ${this.save.coins.toLocaleString('ko-KR')}G · 미끼 ${this.save.gear.lureStock}개</p></div>
        <button class="runtime-btn cyan" type="button" data-free>무료 50G</button>
      </section>
      <section class="shop-list runtime-card-list">${goods.map((item, index) => `<button class="shop-card runtime-shop-card v950-shop-card" type="button" data-buy="${index}"><em>${index === 0 ? '추천' : index === 3 ? '안전' : '강화'}</em><img src="${item.icon}" alt="" /><div><strong>${item.name}</strong><small>${item.desc}</small></div><span>${item.cost}G</span></button>`).join('')}</section>`;
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
      this.renderShop();
    };
    dom.app.appendChild(root);
    root.querySelectorAll<HTMLButtonElement>('[data-buy]').forEach((btn) => btn.addEventListener('click', () => buy(Number(btn.dataset.buy))));
    root.querySelector<HTMLButtonElement>('[data-free]')?.addEventListener('click', () => { this.save.coins += 50; saveGame(this.save); this.toast.show({ type: 'reward', title: '무료 보상', message: '50G를 받았습니다.', actionScreen: 'shop' }); this.renderShop(); });
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
    const root = this.createRuntimeMenuScreen('mission', '미션', '실제 플레이 기록 기준으로 보상을 수령합니다.');
    const goals = this.missionGoals();
    const doneCount = Object.values(this.save.missions).filter(Boolean).length;
    const readyCount = goals.filter((goal) => goal.value >= goal.max && !this.save.missions[goal.id]).length;
    const content = root.querySelector<HTMLDivElement>('.runtime-content')!;
    content.innerHTML = `
      <section class="runtime-hero-card mission-summary">
        <img src="./assets/v91/icons/mission.png" alt="" />
        <div><span class="runtime-eyebrow">MISSION</span><h2>미션</h2><p>완료 ${doneCount}/${goals.length} · 수령 가능 ${readyCount}개</p></div>
        <button class="runtime-btn gold" type="button" data-go-fishing>진행하기</button>
      </section>
      <section class="mission-list runtime-card-list">${goals.slice(0, 12).map((goal) => `<article class="mission-card runtime-mission-card v950-mission-card ${goal.event ? 'event' : ''} ${this.save.missions[goal.id] ? 'done' : goal.value >= goal.max ? 'ready' : ''}"><div><small>${goal.category}</small><strong>${goal.title}</strong><span>${goal.desc}</span></div><progress value="${goal.value}" max="${goal.max}"></progress><button class="runtime-btn ${goal.value >= goal.max && !this.save.missions[goal.id] ? 'gold' : 'blue'}" data-mission="${goal.id}">${this.save.missions[goal.id] ? '완료' : goal.value >= goal.max ? `${goal.reward}G 받기` : `${goal.value}/${goal.max}`}</button></article>`).join('')}</section>`;
    dom.app.appendChild(root);
    root.querySelector<HTMLButtonElement>('[data-go-fishing]')?.addEventListener('click', () => { void this.go('fishing'); });
    root.querySelectorAll<HTMLButtonElement>('[data-mission]').forEach((btn) => btn.addEventListener('click', () => this.tapMissionCard(btn.dataset.mission ?? '')));
    this.mountBottomNav(root, 'mission');
  }

  private renderRanking(): void {
    this.clear();
    const score = this.save.bestStreak * 1000 + this.save.totalSuccess * 120 + this.totalCaught() * 35;
    const caught = this.totalCaught();
    const linkedLabel = this.save.serverLinked ? '익명 서버 연동 계정' : '로컬 테스트 계정';
    const root = this.createRuntimeMenuScreen('ranking', '랭킹', '가짜 데이터 없이 내 실제 기록만 표시합니다.');
    const content = root.querySelector<HTMLDivElement>('.runtime-content')!;
    content.innerHTML = `
      <section class="runtime-hero-card ranking-summary">
        <img src="./assets/v91/icons/ranking.png" alt="" />
        <div><span class="runtime-eyebrow">REAL USER RANKING</span><h2>랭킹</h2><p>${linkedLabel}</p></div>
        <button class="runtime-btn gold" type="button" data-go-fishing>기록 올리기</button>
      </section>
      <section class="runtime-panel ranking-panel">
        <div class="ranking-live-card v950-ranking-card"><img class="rank-avatar" src="./assets/v91/characters/chibi_fisher_face_icon.png" alt="" /><div class="rank-medal">#1</div><div class="rank-user"><strong>나</strong><span>${linkedLabel}</span><em>테스트 리그</em></div><div class="rank-score"><strong>${score.toLocaleString('ko-KR')}</strong><span>점</span></div></div>
        <div class="ranking-stats-grid"><div><strong>${this.save.bestStreak}</strong><span>최고 콤보</span></div><div><strong>${this.save.totalSuccess}</strong><span>성공</span></div><div><strong>${caught}</strong><span>누적 포획</span></div><div><strong>${this.save.coins.toLocaleString('ko-KR')}</strong><span>골드</span></div></div>
        <p class="ranking-note">Firebase 리더보드 연결 전까지는 현재 테스트 계정의 실제 로컬/서버 연동 기록만 보여줍니다.</p>
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
    this.spawnCastTrail();
    this.spawnActionBadge('퐁!', '찌를 던졌어요');
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
