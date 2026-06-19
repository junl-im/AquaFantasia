import { Application, Assets, Container, Sprite, Text } from 'pixi.js';
import './styles.css';
import { APP_VERSION, CACHE_NAME, regions, fishDex, navItems } from './data';
import type { FishInfo, FishingState, RegionKey, SaveData, Screen } from './types';
import { loadSave, saveGame, tryAnonymousServerLink } from './storage';
import { initAudio, playSound } from './audio';
import { ToastManager } from './toast';
import { applyPortraitViewportMetrics, installPortraitCssGuards, requestHardPortraitLock } from './core/PortraitGuard';
import { UnderwaterWebglLayer, type UnderwaterLayerMood } from './core/UnderwaterWebglLayer';
import { RuntimeQualityManager, type RuntimeQualityTier } from './core/RuntimeQualityManager';
import { VillageWorld } from './villageWorld';

const ASSET = {
  loginBg: './assets/v85/screens/start_screen_clean_v810.webp',
  player: './assets/v93/characters/fisher_boat_cute_action.png',
  float: './assets/v92/icons/bobber.png',
  fish: './assets/v92/fish/fish_01.png',
  gauge: './assets/v92/fx/gauge_050.png',
  slot: './assets/art/fish_slot.png',
  ripple: './assets/art/water_ripple_overlay.webp',
  caustics: './assets/art/caustic_sparkle_overlay.webp',
  homeBg: './assets/v1110/home/village_islands_user_bg.webp',
  homeBanner: './assets/v108/home/aqua_fantasia_banner.png',
  castButton: './assets/ui/button_cast_clean.png',
  perfect: './assets/v12/fx/particle_sparkle_cluster_ref_a.png',
  touchRing: './assets/v92/fx/ring_aqua.png',
  fishingGaugeVertical: './assets/v205/fishing/gauge_vertical.png',
  fishingGaugeHorizontal: './assets/v205/fishing/gauge_horizontal.png',
  fishingResistanceBar: './assets/v205/fishing/resistance_bar.png',
  fishingCatchWindow: './assets/v205/fishing/catch_window.png',
  fishingSlotRod: './assets/v205/fishing/slot_rod.png',
  fishingSlotBait: './assets/v205/fishing/slot_bait.png',
  fishingLineEffect: './assets/v205/fishing/line_effect.png',
  fishingWaveSplash: './assets/v205/fishing/wave_splash.png',
  fishingRipple: './assets/v205/fishing/water_ripple.png',
  fishingSplash: './assets/v205/fishing/water_splash.png',
  fishingShadowCommon: './assets/v205/fishing/fish_shadow_common.png',
  fishingShadowLarge: './assets/v205/fishing/fish_shadow_large.png',
  fishingPearl: './assets/v205/fishing/pearl_reward.png',
  fishingTreasure: './assets/v205/fishing/treasure_chest.png',
  fishingCrystal: './assets/v205/fishing/crystal_sparkle.png',
  fishingAlert: './assets/v205/fishing/alert_icon.png',
  fishingDanger: './assets/v205/fishing/danger_warning.png',
  fishingAmbientRing: './assets/v2012/props/water_ring.png',
  fishingAmbientFoam: './assets/v2012/props/shore_foam.png',
  fishingAmbientShadow: './assets/v2012/props/fish_shadow_mid.png',
  fishingAmbientSplash: './assets/v2012/props/big_splash.png',
  fishingCrystalSparkle: './assets/v205/fishing/crystal_sparkle.png',
  fishingCommonShadow: './assets/v205/fishing/fish_shadow_common.png',
  uiPanelAqua: './assets/v3d_underwater/ui/frames/panel_medium_aqua.png',
  uiCardAqua: './assets/v3d_underwater/ui/frames/card_aqua.png',
  uiHudCapsuleAqua: './assets/v3d_underwater/ui/frames/hud_capsule_aqua.png',
  uiButtonSmallAqua: './assets/v3d_underwater/ui/buttons/button_small_aqua_normal.png',
  uiProgressFrameAqua: './assets/v3d_underwater/ui/frames/progress_frame_aqua.png',
  uiBubbleRing: './assets/v3d_underwater/textures/particles/bubble_ring.png',
  uiPearlFlash: './assets/v3d_underwater/textures/particles/pearl_flash.png',
  uiSplashAqua: './assets/v3d_underwater/textures/particles/splash_aqua.png',
  uiModalAqua: './assets/v3d_underwater/ui/frames/modal_aqua.png',
  uiSlotSquareAqua: './assets/v3d_underwater/ui/frames/slot_square_aqua.png',
  uiTooltipAqua: './assets/v3d_underwater/ui/frames/tooltip_aqua.png',
  uiButtonPillAqua: './assets/v3d_underwater/ui/buttons/button_pill_aqua_normal.png',
  uiBubbleSoft: './assets/v3d_underwater/textures/particles/bubble_soft.png',
  uiGodrayStar: './assets/v3d_underwater/textures/particles/godray_star.png',
  uiPlanktonGlow: './assets/v3d_underwater/textures/particles/plankton_glow.png',
  uiMagicRingGold: './assets/v3d_underwater/textures/particles/magic_ring_gold.png',
  uiWarningPulse: './assets/v3d_underwater/textures/particles/warning_pulse.png',
  uiSurfaceFoam: './assets/v3d_underwater/textures/fx/surface_foam.png',
  uiCoralBranch: './assets/v3d_underwater/textures/fx/coral_branch_card.png',
  uiKelpLeaf: './assets/v3d_underwater/textures/fx/kelp_leaf_card.png',
  worldMapPremiumBg: './assets/v2023/worldmap/tropical_island_ui_safe.png',
  v2023ToastBanner: './assets/v2023/ui/toast_banner_aqua.png',
  v2023HudCapsule: './assets/v2023/ui/hud_capsule_aqua.png',
  v2025PanelLargeAqua: './assets/v2025/ui/panel_large_aqua_premium_sd2026.png',
  v2025PanelMediumAqua: './assets/v2025/ui/panel_medium_aqua_premium_sd2026.png',
  v2025HudCapsuleAqua: './assets/v2025/ui/hud_capsule_aqua_premium_sd2026.png',
  v2025ToastBannerAqua: './assets/v2025/ui/toast_banner_aqua_premium_sd2026.png',
  v2025TopStatusAqua: './assets/v2025/ui/top_status_aqua_premium_sd2026.png',
  v2025BottomNavAqua: './assets/v2025/ui/bottom_nav_aqua_premium_sd2026.png',
  v2025InventoryPage: './assets/v2025/ui/inventory_page_bg_aqua_premium_sd2026.png',
  v2025QuestPage: './assets/v2025/ui/quest_page_bg_royal_premium_sd2026.png',
  v2025WorldMapPage: './assets/v2025/ui/worldmap_page_bg_coral_premium_sd2026.png',
  v2025FishingPage: './assets/v2025/ui/fishing_page_bg_emerald_premium_sd2026.png',
  v2025BuildPage: './assets/v2025/ui/build_page_bg_deep_premium_sd2026.png',
};

const V13_BG: Record<Exclude<Screen, 'login'>, string> = {
  village: './assets/v85/compositions/town.webp',
  map: './assets/v85/compositions/fishing.webp',
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
  map: './assets/v92/bg/menu_town.webp',
  gear: './assets/v92/bg/menu_gear.webp',
  inventory: './assets/v92/bg/menu_inventory.webp',
  dex: './assets/v92/bg/menu_dex.webp',
  shop: './assets/v92/bg/menu_shop.webp',
  mission: './assets/v92/bg/menu_mission.webp',
  ranking: './assets/v92/bg/menu_ranking.webp',
};

const V101_WATER_BG: Record<Exclude<Screen, 'login'>, string> = {
  village: './assets/v101/water/water_clear_calm.webp',
  map: './assets/v101/water/water_coral_reef.webp',
  fishing: './assets/v101/water/water_sunlit.webp',
  gear: './assets/v101/water/water_quiet_path.webp',
  inventory: './assets/v101/water/water_kelp_forest.webp',
  dex: './assets/v101/water/water_coral_reef.webp',
  shop: './assets/v101/water/water_lily_dream.webp',
  mission: './assets/v101/water/water_deep_mystic.webp',
  ranking: './assets/v101/water/water_abyss_canyon.webp',
};

const V101_REGION_BG: Partial<Record<RegionKey, string>> = {
  lake: './assets/v101/water/water_clear_calm.webp',
  river: './assets/v101/water/water_coral_reef.webp',
  harbor: './assets/v101/water/water_sunlit.webp',
  deep: './assets/v101/water/water_deep_light.webp',
  palace: './assets/v101/water/water_lily_dream.webp',
  dimension: './assets/v101/water/water_dark_mystic.webp',
  glacier: './assets/v101/water/water_quiet_path.webp',
  storm: './assets/v101/water/water_abyss_canyon.webp',
  mangrove: './assets/v101/water/water_kelp_forest.webp',
  lunar: './assets/v101/water/water_deep_mystic.webp',
  reefFestival: './assets/v101/water/water_coral_reef.webp',
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
  private activeFishTextureUrl = '';
  private fallbackTicker = 0;
  private readonly resizePixiHandler = () => this.resizePixi();
  private immersiveRetryAt = 0;
  private readonly lockedOrientation: 'portrait-primary' = 'portrait-primary';
  private webglLayers: UnderwaterWebglLayer[] = [];
  private readonly quality = new RuntimeQualityManager();
  private villageWorld?: VillageWorld;

  async boot(): Promise<void> {
    this.quality.start();
    this.compact = this.quality.isLite() || window.matchMedia('(max-width: 420px), (prefers-reduced-motion: reduce)').matches || (navigator.hardwareConcurrency ?? 8) <= 4;
    document.documentElement.classList.toggle('perf-lite', this.compact);
    document.documentElement.dataset.initialOrientation = 'portrait';
    document.documentElement.dataset.orientationPolicy = 'hard-portrait';
    document.documentElement.classList.add('portrait-only-game');
    installPortraitCssGuards();
    document.documentElement.dataset.version = APP_VERSION;
    document.documentElement.dataset.visualPolish = 'v1111-quality-engine-ui-audit';
    document.documentElement.dataset.enginePatch = 'v1112-premium-25d-engine';
    document.documentElement.dataset.detailPolish = 'v1113-micro-detail-polish';
    document.documentElement.dataset.pixelPolish = 'v1114-pixel-perfect-polish';
    document.documentElement.dataset.layoutRescue = 'v1115-ui-layout-rescue';
    document.documentElement.dataset.uiBounds = 'v1116-ui-bounds-polish';
    document.documentElement.dataset.viewportSafe = 'v1117-viewport-safe-lock';
    document.documentElement.dataset.layoutQa = 'v1118-layout-qa-sweep';
    document.documentElement.dataset.layoutStability = 'v1119-interaction-qa-polish';
    document.documentElement.dataset.villageFlow = 'v1110-village-flow-swipe-polish';
    document.documentElement.dataset.techPerfCompat = 'v1111-tech-perf-compat';
    document.documentElement.dataset.contentFlowEngine = 'v1112-content-flow-engine-qa';
    document.documentElement.dataset.detailStabilityQa = 'v11113-detail-stability-qa';
    document.documentElement.dataset.buttonStyleQa = 'v11114-button-style-hotfix';
    document.documentElement.dataset.foundationFrameRescue = 'v11115-foundation-frame-rescue';
    document.documentElement.dataset.villagePolish = 'v2018-build-asset-polish';
    document.documentElement.dataset.fishingPolish = 'v2019-fishing-stability-polish';
    document.documentElement.dataset.assetPolish = 'v2021-ui-fishing-build-polish';
    document.documentElement.dataset.uiFix = 'v2024-fishing-menu-content-repair';
    document.documentElement.dataset.premiumAssets = 'v2023-premium-matched-assets';
    document.documentElement.dataset.fishingMenuRepair = 'v2024-fishing-menu-content-repair';
    document.documentElement.dataset.regressionGuard = 'v2025-persistent-ui-guard';
    document.documentElement.dataset.wideStabilityGuard = 'v2026-wide-ui-audit';
    document.documentElement.dataset.startScreenGuard = 'v2025-persistent-start-layout';
    document.documentElement.dataset.menuDockGuard = 'v2025-dock-same-every-screen';
    document.documentElement.dataset.assetMegaPatch = 'v2025-premium-asset-mega-pass';
    document.documentElement.dataset.assetCuration = 'v2026-curated-asset-pass';
    document.documentElement.dataset.uiRootCauseRepair = 'v2027-ui-root-cause-repair';
    document.documentElement.dataset.aquaToneReset = 'v2027-aqua-tone-reset';
    document.documentElement.dataset.zeroDefectUiAudit = 'v2028-zero-defect-ui-audit';
    document.documentElement.dataset.legacyCssQuarantine = 'v2028-legacy-css-quarantine';
    document.documentElement.dataset.v2029PerfectAudit = 'v2029-pixel-perfect-multi-audit';
    document.documentElement.dataset.v2029AquaSimplicity = 'v2029-readable-aqua-tone';
    document.documentElement.dataset.v2030RootRepair = 'v2030-no-overlap-root-repair';
    document.documentElement.dataset.v2030FishingRepair = 'v2030-fishing-stage-reset';
    document.documentElement.dataset.v2031FinalAudit = 'v2031-final-screen-audit';
    document.documentElement.dataset.v2031DirectionAudit = 'v2031-eight-direction-clock-audit';
    document.documentElement.dataset.v2032PlayabilityRepair = 'v2032-fishing-hud-dock-playable-repair';
    document.documentElement.dataset.v2032DockRepair = 'v2032-identical-dock-visible-safe-area';
    document.documentElement.dataset.v2033FishingUiAudit = 'v2033-fishing-ui-direction-dialog-audit';
    document.documentElement.dataset.v2033TransparentControls = 'v2033-transparent-dock-controls';
    document.documentElement.dataset.v2034ScreenIntegrity = 'v2034-screen-integrity-polish';
    document.documentElement.dataset.v2034FishingPlayability = 'v2034-fishing-reel-dock-final-layout';
    document.documentElement.dataset.v2035FinalPolish = 'v2035-direction-fishing-menu-repair';
    document.documentElement.dataset.v2035FishingPlayable = 'v2035-fishing-playfield-rebuild';
    document.documentElement.dataset.v2036FishingGaugeRepair = 'v2036-fishing-gauge-result-safe-layout';
    document.documentElement.dataset.v2037UiPolish = 'v2037-spacing-fishing-menu-polish';
    document.documentElement.dataset.v2038UiPolish = 'v2038-gauge-direction-menu-polish';
    document.documentElement.dataset.v2039AuditPolish = 'v2039-village-menu-fishing-audit-polish';
    document.documentElement.dataset.v2040FullAuditPolish = 'v2040-full-screen-engine-ui-audit';
    document.documentElement.dataset.v2041UiFishingProfilePolish = 'v2041-ui-fishing-profile-polish';
    document.documentElement.dataset.v2042BuildShopDirectionPolish = 'v2042-build-placement-shop-direction-polish';
    document.documentElement.dataset.v2043StabilityUiAudit = 'v2043-stability-ui-build-control-audit';
    document.documentElement.dataset.v2044FishingShopVillageAudit = 'v2044-fishing-shop-village-audit';
    document.documentElement.dataset.v2045DirectionAssetEngineAudit = 'v2045-direction-asset-engine-audit';
    document.documentElement.dataset.v2046FishingDockReelRepair = 'v2046-fishing-dock-reel-repair';
    document.documentElement.dataset.v2047DirectionFishingRepair = 'v2047-direction-fishing-final-repair';
    document.documentElement.dataset.cacheName = CACHE_NAME;
    if (!this.hasWebGL()) document.documentElement.classList.add('pixi-fallback-ready');
    this.bindViewportGuard();
    this.installViewportSafeLock();
    this.installLayoutQaSweep();
    this.installInteractionQaPolish();
    this.installTechPerfCompatPass();
    this.installContentFlowEngineQaPass();
    this.installDetailStabilityQaPass();
    this.preloadCriticalImages();
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
    if (this.fallbackTicker) { window.clearInterval(this.fallbackTicker); this.fallbackTicker = 0; }
    window.removeEventListener('resize', this.resizePixiHandler);
    this.holding = false;
    this.villageWorld?.destroy();
    this.villageWorld = undefined;
    if (this.pixi) {
      this.pixi.destroy(true, { children: true, texture: false });
      this.pixi = undefined;
    }
    this.webglLayers.forEach((layer) => layer.dispose());
    this.webglLayers = [];
    dom.app.innerHTML = '';
    this.stageHost = undefined;
    this.pixiLayer = undefined;
    this.uiLayer = undefined;
    this.waterLayer = undefined;
    this.bgSprite = undefined;
    this.player = undefined;
    this.bobber = undefined;
    this.catchSprite = undefined;
    this.biteText = undefined;
    this.castBtn = undefined;
    this.reelPanel = undefined;
    this.tensionFill = undefined;
    this.safeFill = undefined;
    this.progressNode = undefined;
    document.body.dataset.screen = this.screen;
    document.body.classList.remove('v2032-character-panel-open', 'v2033-character-panel-open', 'v2034-character-panel-open', 'v2035-character-panel-open', 'v2036-character-panel-open', 'v2037-character-panel-open', 'v2039-character-panel-open', 'v2040-character-panel-open', 'v2041-character-panel-open', 'v2042-character-panel-open', 'v2044-character-panel-open', 'v2045-character-panel-open', 'v2046-character-panel-open', 'v2047-character-panel-open', 'v2040-interior-open', 'v2041-interior-open', 'v2042-interior-open', 'v2043-interior-open', 'v2044-interior-open', 'v2045-interior-open', 'v2046-interior-open', 'v2047-interior-open');
    document.querySelectorAll('.touch-ring, .v930-fx, .bite-callout, .action-badge, .catch-result-card').forEach((node) => node.remove());
    document.querySelectorAll('.bottom-nav.fixed-root-nav').forEach((node) => node.remove());
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
    if (screen === 'map') this.renderMap();
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
    shell.className = 'login-screen start-art-screen v2025-start-guard-screen';
    shell.dataset.v2025StartGuard = 'true';
    shell.innerHTML = `
      <div class="start-design-surface" data-design="1024x1536">
        <img class="start-art-image" src="${ASSET.loginBg}" alt="아쿠아 판타지아 시작 화면" />
        <h1 class="sr-only">아쿠아 판타지아</h1>
        <button class="start-hotspot hit-depart" data-action="guest" aria-label="낚시터로 출항"></button>
        <button class="start-hotspot hit-new" data-action="new" aria-label="처음부터 새 게임"></button>
        <button class="start-hotspot hit-server v2025-server-button" data-action="server" aria-label="익명 서버연동"></button>
        <button class="start-hotspot hit-keep v810-keep-button v11115-keep-toggle v2025-keep-button" data-action="keep" aria-label="이 기기에서 로그인 유지" aria-pressed="false"><span class="keep-indicator" aria-hidden="true"></span><span class="keep-text">이 기기에서 로그인 유지</span></button>
        <div class="login-touch-shine" aria-hidden="true"></div>
      </div>`;
    dom.app.appendChild(shell);
    this.applyStartLoginLayoutGuard(shell);
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


  private applyStartLoginLayoutGuard(shell: HTMLElement): void {
    shell.dataset.v2025StartGuard = 'true';
    const keep = shell.querySelector<HTMLElement>('[data-action="keep"]');
    const server = shell.querySelector<HTMLElement>('[data-action="server"]');
    const set = (node: HTMLElement | null, entries: Array<[string, string]>) => {
      if (!node) return;
      for (const [key, value] of entries) node.style.setProperty(key, value, 'important');
    };
    // v2.0.25: persistent layout guard. Do not scope this to APP_VERSION; it must survive future patch numbers.
    set(server, [
      ['top', '65.9%'],
      ['height', '4.9%'],
    ]);
    set(keep, [
      ['left', '31.0%'],
      ['top', '79.05%'],
      ['width', '38.0%'],
      ['height', '4.10%'],
      ['min-width', '0'],
      ['min-height', '30px'],
      ['padding', '0 7px'],
      ['gap', '4px'],
      ['border-radius', '999px'],
      ['overflow', 'hidden'],
    ]);
    set(keep?.querySelector<HTMLElement>('.keep-indicator') ?? null, [
      ['width', 'clamp(16px, 4.2vw, 20px)'],
      ['height', 'clamp(16px, 4.2vw, 20px)'],
      ['min-width', 'clamp(16px, 4.2vw, 20px)'],
      ['flex-basis', 'clamp(16px, 4.2vw, 20px)'],
    ]);
    set(keep?.querySelector<HTMLElement>('.keep-text') ?? null, [
      ['font-size', 'clamp(10px, 2.55vw, 12.5px)'],
      ['letter-spacing', '-0.065em'],
      ['white-space', 'nowrap'],
    ]);
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

  private playerName(): string {
    return this.normalizePlayerName(this.save.playerName);
  }

  private normalizePlayerName(input: unknown): string {
    const raw = typeof input === 'string' ? input : '';
    const cleaned = raw.replace(/[<>{}"'`\\]/g, '').replace(/\s+/g, ' ').trim().slice(0, 12);
    return cleaned || '나';
  }

  private escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] ?? char));
  }

  private renderVillage(): void {
    this.updateUnlocks();
    saveGame(this.save);
    this.clear();
    const playerName = this.playerName();
    const playerNameHtml = this.escapeHtml(playerName);
    const root = document.createElement('main');
    root.className = 'game-screen village-world-screen v2-village-screen v202-mobile-rpg-screen v203-asset-pass-screen v204-asset-ui-screen v206-village-detail-screen v207-layout-bugfix-screen v208-right-dock-screen v209-asset-qa-screen v2010-village-clean-screen v2011-dock-safe-screen v2012-world-asset-screen v2013-world-safe-screen v2014-clean-village-screen v2016-world-stability-screen v2017-direction-ui-screen v2018-build-ux-screen v2020-village-asset-screen v2021-village-asset-screen v2022-hud-control-screen v2023-premium-village-screen v2024-village-object-repair-screen v2026-wide-stability-screen v2027-village-root-repair-screen v2039-village-object-audit-screen v2040-village-engine-audit-screen v2041-village-ui-screen v2042-village-ui-screen v2043-village-ui-screen v2044-village-ui-screen locked-screen';
    root.classList.add('v108-home-main', 'v1110-village-flow');
    root.dataset.legacyVillageFlow = 'v1110-home-banner v1110-tide-card before v1110-region-panel';
    root.innerHTML = `
      <div class="v2-village-bg" aria-hidden="true"></div>
      <section class="v2027-village-loading" aria-live="polite"><div><strong>Aqua Fantasia 접속 중</strong><span>해양 판타지 마을과 주민을 불러오는 중입니다...</span><i></i></div></section>
      <header class="v2-village-hud glass-card" aria-label="마을 상태">
        <button class="v2-profile-chip v2017-profile-button" type="button" data-v2017-profile aria-haspopup="dialog" aria-label="내 캐릭터 열기"><span data-v2-level>마을 Lv.${this.save.village.level}</span><strong data-v2041-profile-chip-name>${playerNameHtml}</strong><em>플레이어 Lv.${this.playerLevel()}</em></button>
        <div class="v2-wallet-row">
          <span>골드 <strong data-v2-gold>${this.save.coins.toLocaleString('ko-KR')}</strong></span>
          <span>마을기금 <strong data-v2-fund>${this.save.village.fund.toLocaleString('ko-KR')}</strong></span>
          <span>발전도 <strong data-v2-dev>${this.save.village.development}</strong></span>
          <span>관광객 <strong data-v2-tourists>${this.save.village.tourists}</strong></span>
        </div>
        <div class="v2-milestone-line" aria-label="관광객 해금 단계"></div>
      </header>
      <section class="v2-village-stage" data-village-stage aria-label="40 x 40 타일 마을맵"></section>
      <section class="v204-mini-map" aria-label="루미나 베이 미니맵"><strong>루미나 베이</strong><span>광장 · 항구 · 길드</span><i></i><b></b></section>
      <section class="v206-village-status glass-card" aria-label="마을 요약"><article><strong>${this.save.village.buildings.length}</strong><span>시설</span></article><article><strong>${this.save.village.paths.length}</strong><span>길</span></article><article><strong>${this.totalCaught()}</strong><span>포획</span></article></section>
      <section class="v2-objective-card glass-card" aria-live="polite"><strong>오늘의 목표</strong><span data-v2-objective>길·꽃·벤치를 배치해서 관광객 100점을 먼저 열기</span></section>
      <section class="v2-village-guide glass-card" aria-live="polite"><strong>첫 마을</strong><span>좌측 조이스틱 이동 · 탭 이동 · 우측 하단 메뉴 · +/− 캐릭터 시점 줌</span></section>
      <section class="v2-dialog-panel glass-card" aria-live="polite"></section>
      <section class="v2017-character-panel" data-v2017-character-panel aria-hidden="true" role="dialog" aria-modal="true" aria-label="내 캐릭터">
        <div class="v2017-character-backdrop" data-v2017-character-close></div>
        <article class="v2017-character-card glass-card">
          <button type="button" class="v2017-character-close" data-v2017-character-close aria-label="내 캐릭터 닫기">×</button>
          <div class="v2017-character-head v2041-character-head">
            <img src="./assets/v203/portraits/player_portrait.png" alt="" />
            <div><span>PLAYER</span><h2 data-v2041-player-name>${playerNameHtml}</h2><p>Lv.${this.playerLevel()} \u00b7 루미나 베이</p></div>
          </div>
          <label class="v2041-name-editor"><span>캐릭터명</span><input data-v2041-name-input type="text" maxlength="12" value="${playerNameHtml}" placeholder="최대 12자" autocomplete="off" /><button type="button" data-v2041-name-save>변경</button></label>
          <div class="v2017-character-stats">
            <article><strong>${this.playerLevel()}</strong><span>플레이어 Lv.</span></article>
            <article><strong>${this.save.village.level}</strong><span>마을 Lv.</span></article>
            <article><strong>${this.totalCaught()}</strong><span>누적 포획</span></article>
            <article><strong>${this.save.totalSuccess}</strong><span>낚시 성공</span></article>
            <article><strong>${this.save.bestStreak}</strong><span>최고 콤보</span></article>
            <article><strong>${this.save.gear.rodLevel + this.save.gear.reelLevel + this.save.gear.lineLevel}</strong><span>장비 총합</span></article>
          </div>
          <div class="v2017-character-actions">
            <button type="button" data-v2017-character-inventory>가방</button>
            <button type="button" data-v2017-character-quest>퀘스트</button>
            <button type="button" data-v2017-character-close>닫기</button>
          </div>
        </article>
      </section>
      <section class="v203-interior-panel v206-interior-panel" aria-live="polite" aria-hidden="true">
        <div class="v203-interior-backdrop" data-v203-interior-close></div>
        <article class="v203-interior-card v206-interior-card glass-card">
          <img class="v203-interior-image" src="" alt="" />
          <div class="v203-interior-copy v206-interior-copy">
            <div class="v206-interior-header">
              <img class="v206-interior-portrait" data-v206-interior-portrait src="./assets/v203/portraits/player_portrait.png" alt="" />
              <div><strong data-v203-interior-title>건물 내부</strong><span data-v203-interior-body>루미나 베이 시설 내부입니다.</span></div>
            </div>
            <div class="v206-interior-status" data-v206-interior-status></div>
            <div class="v203-interior-actions v206-interior-actions">
              <button type="button" data-v203-interior-go-fishing>출항하기</button>
              <button type="button" data-v206-interior-go-map>지도</button>
              <button type="button" data-v206-interior-go-mission>의뢰</button>
              <button type="button" data-v206-interior-go-inventory>가방</button>
              <button type="button" data-v2044-interior-move>건물 이동</button>
              <button type="button" data-v203-interior-close>나가기</button>
            </div>
          </div>
        </article>
      </section>
      <div class="v2-build-backdrop" data-village-build-close aria-hidden="true"></div>
      <aside class="v2-build-tray glass-card" aria-label="건물 설치 모드" role="dialog" aria-modal="true">
        <div class="v2-build-title"><strong>설치모드</strong><button type="button" data-village-build-close>닫기</button></div>
        <p class="v2018-build-help">건물을 고르면 창이 닫히고, 반투명 건물 프리뷰만 나타납니다. 손가락으로 원하는 위치까지 끌어 초록/빨강 판정을 확인한 뒤 손을 떼면 설치됩니다.</p>
        <div class="v2-build-grid">
          <button type="button" data-build-type="path"><img src="./assets/v207/tiles/stone_tile.png" alt="" /><strong>돌길</strong><span>8G · 속도/관광</span></button>
          <button type="button" data-build-type="flower"><img src="./assets/v209/props/shell_garden.png" alt="" /><strong>꽃밭</strong><span>25G · 분위기</span></button>
          <button type="button" data-build-type="house"><img src="./assets/v2/village/buildings/building_fisherman_house.png" alt="" /><strong>주민 집</strong><span>180G · 주민</span></button>
          <button type="button" data-build-type="warehouse"><img src="./assets/v2/village/buildings/building_storage_warehouse.png" alt="" /><strong>창고</strong><span>300G · 자동보관</span></button>
          <button type="button" data-build-type="market"><img src="./assets/v2/village/buildings/building_fish_market.png" alt="" /><strong>어시장</strong><span>360G · 자동판매</span></button>
          <button type="button" data-build-type="inn"><img src="./assets/v2/village/buildings/building_village_inn.png" alt="" /><strong>여관</strong><span>420G · 관광</span></button>
          <button type="button" data-build-type="guild"><img src="./assets/v2/village/buildings/building_fishing_guild.png" alt="" /><strong>낚시 길드</strong><span>400G · 퀘스트</span></button>
          <button type="button" data-build-type="aquarium"><img src="./assets/v2/village/buildings/building_aquarium.png" alt="" /><strong>수족관</strong><span>620G · 도감/관광</span></button>
        </div>
      </aside>
      <div class="v2-world-controls" aria-label="마을 조작">
        <button type="button" data-village-zoom-in aria-label="확대"><span class="v2043-control-icon v2044-control-icon" aria-hidden="true">＋</span><span class="v2043-control-label v2044-control-label">확대</span></button>
        <button type="button" data-village-zoom-out aria-label="축소"><span class="v2043-control-icon v2044-control-icon" aria-hidden="true">－</span><span class="v2043-control-label v2044-control-label">축소</span></button>
        <button type="button" data-village-center aria-label="플레이어 위치로 이동"><span class="v2043-control-icon v2044-control-icon" aria-hidden="true">◎</span><span class="v2043-control-label v2044-control-label">원점</span></button>
        <button type="button" data-village-build-open aria-label="건설 메뉴 열기"><span class="v2043-control-icon v2044-control-icon" aria-hidden="true"><img src="./assets/v22/icons/nav_build.png" alt="" /></span><span class="v2043-control-label v2044-control-label">건설</span></button>
        <button type="button" data-village-shop aria-label="상점 열기"><span class="v2043-control-icon v2044-control-icon" aria-hidden="true"><img src="./assets/v92/icons/shop.png" alt="" /></span><span class="v2043-control-label v2044-control-label">상점</span></button>
        <button type="button" data-village-fishing aria-label="항구 출항"><span class="v2043-control-icon v2044-control-icon" aria-hidden="true"><img src="./assets/v22/icons/nav_fishing.png" alt="" /></span><span class="v2043-control-label v2044-control-label">출항</span></button>
      </div>
      <div class="v2-joystick" data-village-joystick data-no-swipe aria-label="이동 조이스틱">
        <div class="v2-joystick-base"><div class="v2-joystick-knob" data-village-joystick-knob></div></div>
        <span>MOVE</span>
      </div>`;
    dom.app.appendChild(root);
    const stage = root.querySelector<HTMLElement>('[data-village-stage]')!;
    this.villageWorld = new VillageWorld({
      root,
      stageHost: stage,
      save: this.save,
      onSave: () => saveGame(this.save),
      onGoFishing: () => { void this.go('fishing'); },
      onToast: (toast) => this.toast.show(toast),
    });
    void this.villageWorld.init().then(() => {
      root.classList.add('v2027-village-ready');
      root.querySelector<HTMLElement>('.v2027-village-loading')?.remove();
      this.mountBottomNav(root, 'village');
    }).catch((error) => {
      root.classList.add('v2027-village-ready');
      root.querySelector<HTMLElement>('.v2027-village-loading')?.remove();
      console.warn('[AquaFantasia] village world failed', error);
      this.toast.show({ type: 'normal', title: '마을 로딩 실패', message: '기존 메뉴 화면으로 복구합니다.' });
      this.renderVillageFallback();
    });
    root.querySelector<HTMLButtonElement>('[data-v206-interior-go-map]')?.addEventListener('click', () => { void this.go('map'); });
    root.querySelector<HTMLButtonElement>('[data-v206-interior-go-mission]')?.addEventListener('click', () => { void this.go('mission'); });
    root.querySelector<HTMLButtonElement>('[data-v206-interior-go-inventory]')?.addEventListener('click', () => { void this.go('inventory'); });
    const characterPanel = root.querySelector<HTMLElement>('[data-v2017-character-panel]');
    const setDockHiddenForCharacterPanel = (hidden: boolean) => {
      document.body.classList.toggle('v2032-character-panel-open', hidden);
      document.body.classList.toggle('v2033-character-panel-open', hidden);
      document.body.classList.toggle('v2034-character-panel-open', hidden);
      document.body.classList.toggle('v2035-character-panel-open', hidden);
      document.body.classList.toggle('v2036-character-panel-open', hidden);
      document.body.classList.toggle('v2037-character-panel-open', hidden);
      document.body.classList.toggle('v2039-character-panel-open', hidden);
      document.body.classList.toggle('v2040-character-panel-open', hidden);
      document.body.classList.toggle('v2041-character-panel-open', hidden);
      document.body.classList.toggle('v2044-character-panel-open', hidden);
      document.body.classList.toggle('v2045-character-panel-open', hidden);
      document.body.classList.toggle('v2046-character-panel-open', hidden);
      document.body.classList.toggle('v2047-character-panel-open', hidden);
      document.body.classList.toggle('v2042-character-panel-open', hidden);
      document.body.classList.toggle('v2043-character-panel-open', hidden);
      const nav = document.querySelector<HTMLElement>('.bottom-nav');
      if (!nav) return;
      if (hidden) {
        nav.style.setProperty('display', 'none', 'important');
        nav.setAttribute('aria-hidden', 'true');
      } else {
        nav.style.setProperty('display', 'grid', 'important');
        nav.removeAttribute('aria-hidden');
      }
    };
    const openCharacterPanel = () => {
      characterPanel?.classList.add('open');
      characterPanel?.setAttribute('aria-hidden', 'false');
      setDockHiddenForCharacterPanel(true);
    };
    const closeCharacterPanel = () => {
      characterPanel?.classList.remove('open');
      characterPanel?.setAttribute('aria-hidden', 'true');
      setDockHiddenForCharacterPanel(false);
    };
    root.querySelector<HTMLButtonElement>('[data-v2017-profile]')?.addEventListener('click', openCharacterPanel);
    root.querySelectorAll<HTMLElement>('[data-v2017-character-close]').forEach((node) => node.addEventListener('click', closeCharacterPanel));
    const nameInput = root.querySelector<HTMLInputElement>('[data-v2041-name-input]');
    const savePlayerName = () => {
      const next = this.normalizePlayerName(nameInput?.value ?? '');
      this.save.playerName = next;
      saveGame(this.save);
      root.querySelectorAll<HTMLElement>('[data-v2041-player-name], [data-v2041-profile-chip-name]').forEach((node) => { node.textContent = next; });
      this.villageWorld?.setPlayerName(next);
      if (nameInput) nameInput.value = next;
      this.toast.show({ type: 'normal', title: '캐릭터명 변경', message: `${next} 이름으로 표시합니다.` });
    };
    root.querySelector<HTMLButtonElement>('[data-v2041-name-save]')?.addEventListener('click', savePlayerName);
    nameInput?.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); savePlayerName(); } });
    root.querySelector<HTMLButtonElement>('[data-v2017-character-inventory]')?.addEventListener('click', () => { closeCharacterPanel(); void this.go('inventory'); });
    root.querySelector<HTMLButtonElement>('[data-v2017-character-quest]')?.addEventListener('click', () => { closeCharacterPanel(); void this.go('mission'); });
    root.querySelector<HTMLButtonElement>('[data-village-shop]')?.addEventListener('click', () => { void this.go('shop'); });
  }

  private renderVillageFallback(): void {
    const root = this.createRuntimeMenuScreen('village', '마을', '메인 항구에서 오늘의 조류와 수역을 확인하세요.');
    const region = this.getRegion();
    const content = root.querySelector<HTMLDivElement>('.runtime-content')!;
    content.innerHTML = `
      <section class="runtime-hero-card tide-card" aria-label="오늘의 조류">
        <img class="tide-mascot" src="./assets/v91/characters/chibi_fisher_face_icon.png" alt="" />
        <div>
          <span class="runtime-eyebrow">TODAY TIDE</span>
          <h2>오늘의 조류</h2>
          <p><strong>${region.name}</strong> · ${region.tide}<br>${region.subtitle}</p>
        </div>
        <button class="runtime-btn gold compact-cta" type="button" data-go-fishing>출항</button>
      </section>
      <section class="runtime-panel region-panel" aria-label="수역 선택">
        <div class="runtime-panel-title"><span>FISHING AREA</span><strong>수역 선택</strong></div>
        <div class="region-grid runtime-region-grid">${regions.map((item) => this.regionCard(item.key)).join('')}</div>
      </section>`;
    dom.app.appendChild(root);
    root.querySelector<HTMLButtonElement>('[data-go-fishing]')?.addEventListener('click', () => { void this.go('fishing'); });
    root.querySelectorAll<HTMLButtonElement>('[data-region]').forEach((btn) => btn.addEventListener('click', () => {
      const key = btn.dataset.region as RegionKey;
      if (!this.isRegionUnlocked(key)) return;
      this.save.region = key;
      saveGame(this.save);
      this.renderVillageFallback();
    }));
    this.mountBottomNav(root, 'village');
  }

  private createRuntimeMenuScreen(active: Exclude<Screen, 'login' | 'fishing'>, title: string, subtitle: string): HTMLElement {
    this.clear();
    const root = document.createElement('main');
    root.className = `game-screen runtime-menu-screen v204-asset-ui-screen v2018-menu-drag-screen v2024-menu-content-repair-screen v2027-menu-content-repair-screen v2028-menu-aqua-reset-screen v2029-menu-clean-page v2038-menu-aqua-card-screen v2039-menu-aqua-card-screen v2040-menu-aqua-card-screen v2041-menu-aqua-center-screen v2042-menu-aqua-center-screen v2043-menu-aqua-center-screen v2044-menu-aqua-center-screen v2045-menu-aqua-center-screen ${active}-screen scroll-screen`;
    root.setAttribute('data-runtime-screen', active);
    root.dataset.v2027MenuRepair = 'true';
    root.dataset.v2028MenuAudit = 'simple-aqua-readable-content';
    root.dataset.v2029MenuAudit = 'readable-aqua-content-first';
    root.dataset.v2038MenuAudit = 'aqua-card-design-complete';
    root.dataset.v2039MenuAudit = 'aqua-card-design-complete-no-odd-frames';
    root.dataset.v2040MenuAudit = 'dock-safe-aqua-card-no-odd-buttons';
    root.dataset.v2041MenuAudit = 'centered-aqua-card-readable-wallet';
    root.dataset.v2042MenuAudit = 'shop-and-page-aqua-card-centered';
    root.dataset.v2043MenuAudit = 'stable-centered-aqua-pages';
    root.dataset.v2044MenuAudit = 'shop-building-fishing-page-audit';
    root.dataset.v2045MenuAudit = 'direction-asset-engine-audit';
    root.style.setProperty('--v89-world-bg', `url("${V3D_MENU_BG[active]}")`);
    root.style.setProperty('--v101-water-bg', `url("${V101_WATER_BG[active]}")`);
    root.innerHTML = `
      <div class="runtime-3d-bg" aria-hidden="true"><div class="underwater-webgl-host" data-underwater-webgl></div><span class="v3d-caustics"></span><span class="v3d-bubbles"></span><span class="v3d-depth-fog"></span></div>
      <img class="runtime-bg-character" src="${ASSET.player}" alt="" aria-hidden="true" loading="eager" />
      <header class="runtime-hud" aria-label="플레이어 HUD">
        <img class="runtime-hud-mascot" src="./assets/v203/portraits/player_happy.png" alt="" />
        <div class="runtime-title"><span>AQUA FANTASIA</span><strong>${title}</strong><em>${subtitle}</em></div>
        <div class="runtime-wallet"><span><img src="./assets/v22/icons/nav_fishing.png" alt="" />${this.save.coins.toLocaleString('ko-KR')}G</span><span><img src="./assets/v22/icons/nav_bag.png" alt="" />${this.save.gear.lureStock}</span></div>
      </header>
      <div class="runtime-content"></div>`;
    this.mountUnderwaterWebgl(root, active === 'ranking' ? 'deep' : active === 'village' || active === 'shop' || active === 'map' ? 'town' : 'reef', V101_WATER_BG[active]);
    this.installRuntimeVerticalDragScroll(root);
    return root;
  }

  private installRuntimeVerticalDragScroll(root: HTMLElement): void {
    let pointerId: number | null = null;
    let startY = 0;
    let startTop = 0;
    let moved = false;
    const clear = () => {
      pointerId = null;
      window.setTimeout(() => root.removeAttribute('data-v2018-dragging'), 80);
    };
    root.addEventListener('pointerdown', (ev: PointerEvent) => {
      if (!ev.isPrimary) return;
      const target = ev.target as HTMLElement | null;
      if (target?.closest('.bottom-nav, input, textarea, select, .runtime-hud')) return;
      pointerId = ev.pointerId;
      startY = ev.clientY;
      startTop = root.scrollTop;
      moved = false;
      root.setPointerCapture?.(ev.pointerId);
    }, { passive: true });
    root.addEventListener('pointermove', (ev: PointerEvent) => {
      if (pointerId !== ev.pointerId) return;
      const dy = ev.clientY - startY;
      if (Math.abs(dy) < 5 && !moved) return;
      moved = true;
      root.setAttribute('data-v2018-dragging', 'true');
      root.scrollTop = Math.max(0, startTop - dy);
      ev.preventDefault();
    }, { passive: false });
    root.addEventListener('pointerup', (ev: PointerEvent) => {
      if (pointerId !== ev.pointerId) return;
      root.releasePointerCapture?.(ev.pointerId);
      clear();
    });
    root.addEventListener('pointercancel', clear);
    root.addEventListener('click', (ev: MouseEvent) => {
      if (!moved && root.getAttribute('data-v2018-dragging') !== 'true') return;
      ev.preventDefault();
      ev.stopPropagation();
    }, true);
  }

  private mountUnderwaterWebgl(root: HTMLElement, mood: UnderwaterLayerMood, sceneUrl?: string): void {
    const host = root.querySelector<HTMLElement>('[data-underwater-webgl]');
    if (!host || document.documentElement.classList.contains('pixi-fallback-ready')) return;
    const layer = new UnderwaterWebglLayer(host, { mood, compact: this.compact || this.quality.isLite(), sceneUrl, quality: this.quality.tier() });
    if (layer.start()) {
      layer.setQuality(this.quality.tier(), this.compact || this.quality.isLite());
      this.webglLayers.push(layer);
    }
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
    root.className = 'game-screen fishing-screen v2030-fishing-stage-reset-screen v205-fishing-asset-screen v2019-fishing-stability-screen v2027-fishing-root-repair-screen v2028-fishing-zero-overlap-screen v2029-fishing-final-layout-screen v2031-fishing-clean-screen v2032-fishing-playable-screen v2033-fishing-playable-screen v2034-fishing-integrity-screen v2035-fishing-playfield-screen v2036-fishing-gauge-safe-screen v2037-fishing-stable-screen v2038-fishing-repair-screen v2039-fishing-audit-screen v2040-fishing-playable-screen v2041-fishing-playable-screen v2042-fishing-playable-screen v2043-fishing-playable-screen v2044-fishing-playable-screen v2045-fishing-playable-screen v2046-fishing-playable-screen v2047-fishing-playable-screen locked-screen';
    root.style.setProperty('--region-glow', region.color);
    root.style.setProperty('--v89-world-bg', `url("${region.bg}")`);
    const v101FishingBg = V101_REGION_BG[region.key] ?? V101_WATER_BG.fishing;
    root.style.setProperty('--v101-water-bg', `url("${v101FishingBg}")`);
    root.innerHTML = `
      <span id="fishingHint" class="sr-only">낚시 시작 버튼으로 캐스팅하세요.</span>
      <span class="v2028-fishing-safe-grid" aria-hidden="true"></span>
      <div class="fishing-3d-ambient" aria-hidden="true"><div class="underwater-webgl-host" data-underwater-webgl></div><span class="v3d-caustics"></span><span class="v3d-bubbles"></span><span class="v3d-depth-fog"></span></div>
      <div class="fishing-stage v2028-fishing-stage v2030-fishing-stage v2031-fishing-stage v2032-fishing-stage v2033-fishing-stage v2034-fishing-stage v2035-fishing-stage v2036-fishing-stage v2037-fishing-stage v2038-fishing-stage v2039-fishing-stage v2040-fishing-stage v2041-fishing-stage v2042-fishing-stage v2043-fishing-stage v2044-fishing-stage v2045-fishing-stage v2046-fishing-stage v2047-fishing-stage" id="fishingStage">
        <div class="pixi-layer"></div>
        <div class="water-overlay"></div>
        <div class="caustic-overlay"></div>
        <img class="v205-fish-shadow v205-shadow-common" src="${ASSET.fishingShadowCommon}" alt="" aria-hidden="true" />
        <img class="v205-fish-shadow v205-shadow-large" src="${ASSET.fishingShadowLarge}" alt="" aria-hidden="true" />
        <img class="v2031-fishing-ripple" src="${ASSET.fishingAmbientRing}" alt="" aria-hidden="true" />
        <img class="v2031-fishing-foam" src="${ASSET.fishingAmbientFoam}" alt="" aria-hidden="true" />
        <div class="fishing-guide-card v205-guide-card v2029-fishing-guide-card v2030-fishing-guide-card v2031-fishing-guide-card v2038-fishing-guide-card v2039-fishing-guide-card v2040-fishing-guide-card v2041-fishing-guide-card v2046-fishing-guide-card v2047-fishing-guide-card" aria-hidden="true"><strong>낚시 준비</strong><span data-fishing-tip>낚시 시작 → 물었다! → 화면을 누르는 동안 릴 감기</span></div>
      </div>
      <div class="fishing-hud v205-fishing-hud v2028-fishing-hud v2029-fishing-hud v2030-fishing-hud v2031-fishing-hud v2044-fishing-hud v2032-fishing-hud v2033-fishing-hud v2034-fishing-hud v2035-fishing-hud v2036-fishing-hud v2037-fishing-hud v2038-fishing-hud v2039-fishing-hud v2040-fishing-hud v2041-fishing-hud v2043-fishing-hud v2044-fishing-hud v2047-fishing-hud" aria-label="플레이어 정보">
        <div class="hud-chip region" data-hud-region><strong>${region.name}</strong><span>${region.tide}</span></div>
        <div class="hud-chip" data-hud-coins><img src="./assets/v92/icons/coin.png" alt="" /><strong>${this.save.coins.toLocaleString('ko-KR')}</strong></div>
        <div class="hud-chip" data-hud-lures><img src="./assets/v205/fishing/slot_bait.png" alt="" /><strong>${this.save.gear.lureStock}</strong></div>
      </div>
      <div class="stage-ui v2028-stage-ui"></div><div class="cute-action-layer" aria-hidden="true"></div>
      <aside class="fishing-loadout-strip" aria-label="낚시 장비">
        <div><img src="${ASSET.fishingSlotRod}" alt="" /><span>로드 Lv.${this.save.gear.rodLevel}</span></div>
        <div><img src="${ASSET.fishingSlotBait}" alt="" /><span>미끼 ${this.save.gear.lureStock}</span></div>
      </aside>
      <div class="combo-badge hidden" id="comboBadge" data-combo-label="연속 성공">연속 성공 x${Math.max(2, this.save.currentStreak)}</div>
      <section class="recent-catch-strip v205-recent-catch v2029-recent-catch-card v2030-recent-catch-card v2031-recent-catch-card v2032-recent-catch-card v2033-recent-catch-card v2034-recent-catch-card v2035-recent-catch-card v2036-recent-catch-card v2037-recent-catch-card v2038-recent-catch-card v2039-recent-catch-card v2040-recent-catch-card" aria-label="최근 포획">
        ${this.recentCatchMarkup()}
      </section>
      <div class="reel-panel glass-card hidden v205-reel-panel v2028-reel-panel v2029-reel-panel v2030-reel-panel v2031-reel-panel v2032-reel-panel v2033-reel-panel v2034-reel-panel v2035-reel-panel v2036-reel-panel v2037-reel-panel v2038-reel-panel v2039-reel-panel v2040-reel-panel v2041-reel-panel v2042-reel-panel v2043-reel-panel v2044-reel-panel v2045-reel-panel v2046-reel-panel v2047-reel-panel" id="reelPanel">
        <img class="v2020-reel-panel-frame" src="${ASSET.uiPanelAqua}" alt="" aria-hidden="true" />
        <img class="v2021-reel-tooltip-frame" src="${ASSET.uiTooltipAqua}" alt="" aria-hidden="true" />
        <img class="v205-horizontal-gauge" src="${ASSET.fishingGaugeHorizontal}" alt="장력 게이지" />
        <div class="v205-reel-grid">
          <div class="v2040-vertical-gauge" aria-hidden="true"><span class="v2040-vertical-safe"></span><b class="v2040-vertical-marker"></b></div>
          <img class="v205-vertical-gauge" src="${ASSET.fishingGaugeVertical}" alt="" aria-hidden="true" />
          <div class="v205-reel-control">
            <img class="v205-resistance-art" src="${ASSET.fishingResistanceBar}" alt="" aria-hidden="true" />
            <div class="tension-track"><span class="safe-zone"></span><span class="tension-fill"></span></div>
            <div class="safe-progress"><span></span></div>
            <div class="surge-meter"><span></span></div>
            <button class="hold-pad v2046-hold-pad v2047-hold-pad" type="button"><strong>누르는 동안 릴 감기</strong><span>떼면 장력이 내려가요</span></button>
            <p>버튼 또는 바다 화면을 누른 채 초록 안전지대를 3초 유지하세요.</p>
          </div>
        </div>
      </div>`;
    dom.app.appendChild(root);
    this.mountUnderwaterWebgl(root, 'fishing', v101FishingBg);
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
    const startHold = (ev: PointerEvent) => {
      ev.preventDefault();
      this.reassertImmersiveMode();
      if (this.state !== 'reeling') return;
      this.holding = true;
      this.holdPad?.setPointerCapture?.(ev.pointerId);
      this.spawnTouchRing(ev.clientX, ev.clientY);
      this.vibrate(8);
    };
    const stopHold = () => { this.holding = false; };
    const startPanelHold = (ev: PointerEvent) => {
      this.reassertImmersiveMode();
      if (this.state !== 'reeling') return;
      ev.preventDefault();
      this.holding = true;
      this.reelPanel?.setPointerCapture?.(ev.pointerId);
      this.spawnTouchRing(ev.clientX, ev.clientY);
      this.vibrate(8);
    };
    this.holdPad.addEventListener('pointerdown', startHold);
    this.holdPad.addEventListener('pointerup', stopHold);
    this.holdPad.addEventListener('pointercancel', stopHold);
    this.holdPad.addEventListener('pointerleave', stopHold);
    this.holdPad.addEventListener('lostpointercapture', stopHold);
    this.reelPanel.addEventListener('pointerdown', startPanelHold);
    this.reelPanel.addEventListener('pointerup', stopHold);
    this.reelPanel.addEventListener('pointercancel', stopHold);
    this.reelPanel.addEventListener('pointerleave', stopHold);
    this.reelPanel.addEventListener('lostpointercapture', stopHold);
    const startTouchHold = (ev: TouchEvent) => {
      this.reassertImmersiveMode();
      if (this.state !== 'reeling') return;
      ev.preventDefault();
      this.holding = true;
      const touch = ev.touches.item(0);
      if (touch) this.spawnTouchRing(touch.clientX, touch.clientY);
      this.vibrate(8);
    };
    const stopTouchHold = () => { this.holding = false; };
    this.holdPad.addEventListener('touchstart', startTouchHold, { passive: false });
    this.holdPad.addEventListener('touchend', stopTouchHold, { passive: true });
    this.holdPad.addEventListener('touchcancel', stopTouchHold, { passive: true });
    root.addEventListener('pointerdown', (ev: PointerEvent) => {
      const target = ev.target as HTMLElement | null;
      if (target?.closest('.bottom-nav, .fishing-hud, .recent-catch-strip, .fishing-loadout-strip, .cast-button')) return;
      if (this.state === 'bite') {
        ev.preventDefault();
        this.startReeling();
        this.holding = true;
        this.spawnTouchRing(ev.clientX, ev.clientY);
        this.vibrate(8);
        return;
      }
      if (this.state !== 'reeling') return;
      ev.preventDefault();
      this.holding = true;
      this.spawnTouchRing(ev.clientX, ev.clientY);
    }, { passive: false, capture: true });
    root.addEventListener('pointerup', stopHold, { passive: true, capture: true });
    root.addEventListener('pointercancel', stopHold, { passive: true, capture: true });
    root.addEventListener('lostpointercapture', stopHold, { passive: true, capture: true });
    this.reelPanel.addEventListener('touchstart', startTouchHold, { passive: false });
    this.reelPanel.addEventListener('touchend', stopTouchHold, { passive: true });
    this.reelPanel.addEventListener('touchcancel', stopTouchHold, { passive: true });
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
    root.className = `game-screen ${name}-screen v800-screen v810-screen ${name === 'fishing' ? 'locked-screen v2044-fishing-playable-screen v2045-fishing-playable-screen v2046-fishing-playable-screen v2047-fishing-playable-screen' : 'scroll-screen'}`;
    root.innerHTML = `<div class="ambient-bg" aria-hidden="true"></div>`;
    return root;
  }

  private mountBottomNav(root: HTMLElement, active: Screen): void {
    document.querySelectorAll('.bottom-nav.fixed-root-nav').forEach((node) => node.remove());
    const nav = document.createElement('nav');
    const v13 = false;
    nav.className = 'bottom-nav fixed-root-nav v2016-safe-dock-nav v2026-unified-dock-nav v2027-aqua-dock-nav v2029-home-dock-nav v2031-identical-dock-nav v2032-identical-dock-nav v2033-identical-dock-nav v2034-identical-dock-nav v2035-identical-dock-nav v2036-identical-dock-nav v2037-identical-dock-nav v2038-identical-dock-nav v2039-identical-dock-nav v2040-identical-dock-nav v2041-identical-dock-nav v2042-identical-dock-nav v2043-identical-dock-nav v2044-identical-dock-nav v2045-identical-dock-nav v2046-identical-dock-nav v2047-identical-dock-nav';
    nav.setAttribute('aria-label', '우측 하단 메뉴');
    nav.setAttribute('data-fixed-root', 'true');
    nav.dataset.menuDock = 'right-bottom-wing-v2016';
    nav.dataset.dockGuard = 'v2029-home-fishing-menu-identical-dock';
    nav.dataset.v2031DockGuard = 'v2031-home-fishing-menu-identical-dock';
    nav.dataset.v2032DockGuard = 'v2032-home-fishing-menu-identical-visible-dock';
    nav.dataset.v2033DockGuard = 'v2033-home-fishing-menu-identical-transparent-dock';
    nav.dataset.v2034DockGuard = 'v2034-home-fishing-menu-transparent-safe-dock';
    nav.dataset.v2035DockGuard = 'v2035-home-fishing-menu-exact-dock';
    nav.dataset.v2036DockGuard = 'v2036-home-fishing-menu-exact-dock';
    nav.dataset.v2037DockGuard = 'v2037-home-fishing-menu-exact-dock';
    nav.dataset.v2038DockGuard = 'v2038-home-fishing-menu-exact-dock';
    nav.dataset.v2039DockGuard = 'v2039-home-fishing-menu-exact-dock';
    nav.dataset.v2040DockGuard = 'v2040-field-menu-fishing-identical-dock';
    nav.dataset.v2041DockGuard = 'v2041-transparent-identical-dock';
    nav.dataset.v2042DockGuard = 'v2042-transparent-uniform-dock';
    nav.dataset.v2043DockGuard = 'v2043-transparent-safe-uniform-dock';
    nav.dataset.v2044DockGuard = 'v2044-fishing-safe-area-dock';
    nav.dataset.v2045DockGuard = 'v2045-fishing-safe-area-dock-final';
    nav.dataset.v2046DockGuard = 'v2046-body-portal-aqua-frame-dock';
    nav.dataset.v2047DockGuard = 'v2047-fixed-visible-aqua-dock';
    const dockInlineStyles: Array<[string, string]> = [
      ['position', 'fixed'], ['left', 'auto'], ['right', 'var(--v2047-dock-right, var(--v2046-dock-right, var(--v2045-dock-right, var(--v2044-dock-right, max(10px, env(safe-area-inset-right)))))'],
      ['bottom', 'var(--v2047-dock-bottom, var(--v2046-dock-bottom, var(--v2045-dock-bottom, var(--v2044-dock-bottom, calc(max(14px, env(safe-area-inset-bottom)) + 6px))))'], ['width', 'auto'], ['height', 'auto'],
      ['min-width', '0'], ['max-width', 'calc(100vw - 16px)'], ['display', 'grid'],
      ['grid-template-columns', 'repeat(3, var(--v2047-dock-button, var(--v2046-dock-button, var(--v2045-dock-button, var(--v2044-dock-button, 52px)))))'],
      ['grid-template-rows', 'repeat(2, var(--v2047-dock-button, var(--v2046-dock-button, var(--v2045-dock-button, var(--v2044-dock-button, 52px)))))'], ['gap', 'var(--v2047-dock-gap, var(--v2046-dock-gap, var(--v2045-dock-gap, var(--v2044-dock-gap, 4px))))'],
      ['padding', 'var(--v2047-dock-padding, var(--v2046-dock-padding, 5px))'], ['margin', '0'], ['border', '1px solid rgba(126, 238, 255, .30)'], ['border-radius', '20px'],
      ['background', 'rgba(6, 85, 120, .20)'], ['background-image', 'none'], ['box-shadow', '0 8px 20px rgba(0, 55, 92, .14), inset 0 1px 0 rgba(255,255,255,.18)'],
      ['filter', 'none'], ['overflow', 'visible'], ['transform', 'none'], ['translate', 'none'], ['pointer-events', 'none'], ['z-index', '1240'],
    ];
    dockInlineStyles.forEach(([key, value]) => nav.style.setProperty(key, value, 'important'));
    if (active === 'fishing') {
      nav.style.setProperty('bottom', 'max(112px, calc(env(safe-area-inset-bottom) + 112px))', 'important');
      nav.style.setProperty('right', 'max(14px, env(safe-area-inset-right))', 'important');
      nav.dataset.v2047FishingDockLift = 'forced-visible-above-bottom-edge';
    }
    nav.innerHTML = navItems.map(({ screen, icon, label }) => {
      if (v13) return `<button class="${screen === active ? 'active' : ''}" data-screen="${screen}" aria-label="${label}"><span>${label}</span></button>`;
      return `<button class="${screen === active ? 'active' : ''}" data-screen="${screen}" data-dock-slot="${screen}" aria-label="${label}" data-label="${label}"><img src="${icon}" alt="" /><span>${label}</span></button>`;
    }).join('');
    document.body.appendChild(nav);
    root.classList.add('has-fixed-root-nav');
    this.applyViewportSafeGuards(root, nav);
    this.scheduleContentFlowRepair(root);
    this.scheduleDetailStabilityRepair(root);
    nav.querySelectorAll<HTMLButtonElement>('[data-screen]').forEach((btn) => btn.addEventListener('click', () => { this.reassertImmersiveMode(); void this.go(btn.dataset.screen as Screen); }));
    // v2.0.2: swipe tab routing is intentionally disabled. Village drag, joystick, and pinch zoom now own horizontal gestures.
  }

  private installTabSwipe(root: HTMLElement, active: Exclude<Screen, 'login' | 'fishing'>): void {
    const swipeOrder: Screen[] = ['village', 'inventory', 'mission', 'map', 'fishing'];
    if ((active as Screen) === 'fishing') return;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastY = 0;
    let startAt = 0;
    let tracking = false;
    let horizontalIntent = false;
    let lastSwipeAt = 0;
    let verticalIntent = false;
    let activePointerId: number | null = null;
    const reset = () => {
      tracking = false;
      horizontalIntent = false;
      verticalIntent = false;
      activePointerId = null;
      root.classList.remove('swipe-route-peek', 'swipe-route-out');
      root.style.removeProperty('--swipe-peek-x');
    };
    const canStart = (target: EventTarget | null) => {
      const el = target as HTMLElement | null;
      if (!el) return true;
      return !el.closest('.bottom-nav, input, textarea, select, [data-no-swipe], .hold-pad, .reel-panel, .fishing-stage');
    };
    const begin = (x: number, y: number, target: EventTarget | null, pointerId: number | null = null, primary = true) => {
      if (!primary || !canStart(target)) return;
      activePointerId = pointerId;
      tracking = true;
      horizontalIntent = false;
      startX = lastX = x;
      startY = lastY = y;
      startAt = performance.now();
      root.classList.remove('swipe-route-out');
      root.style.removeProperty('--swipe-peek-x');
    };
    const move = (x: number, y: number) => {
      if (!tracking) return;
      lastX = x;
      lastY = y;
      const dx = x - startX;
      const dy = y - startY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      if (!horizontalIntent && !verticalIntent && absY > 18 && absY > absX * 1.18) {
        verticalIntent = true;
        reset();
        return;
      }
      if (!horizontalIntent && !verticalIntent && absX > 18 && absX > absY * 1.35) {
        horizontalIntent = true;
        root.classList.add('swipe-route-peek');
      }
      if (horizontalIntent) {
        root.style.setProperty('--swipe-peek-x', `${Math.max(-8, Math.min(8, dx * 0.028))}px`);
      }
    };
    const finish = (x = lastX, y = lastY) => {
      if (!tracking) return;
      const dx = x - startX;
      const dy = y - startY;
      const elapsed = performance.now() - startAt;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      reset();
      const width = window.visualViewport?.width ?? window.innerWidth;
      const distancePass = absX > Math.max(42, Math.min(76, width * 0.14));
      const velocityPass = elapsed < 460 && absX > Math.max(34, width * 0.085);
      if (elapsed > 900 || (!distancePass && !velocityPass) || absX < absY * 1.45) return;
      const index = swipeOrder.indexOf(active);
      if (index < 0) return;
      const next = dx < 0 ? swipeOrder[Math.min(swipeOrder.length - 1, index + 1)] : swipeOrder[Math.max(0, index - 1)];
      if (!next || next === active) return;
      lastSwipeAt = performance.now();
      root.classList.add('swipe-route-out');
      window.setTimeout(() => { void this.go(next); }, 34);
    };
    root.classList.add('swipe-enabled-screen');
    root.addEventListener('click', (ev) => {
      if (performance.now() - lastSwipeAt < 360) {
        ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation();
      }
    }, true);

    // Prefer Pointer Events. Installing both pointer and touch handlers on mobile
    // caused duplicate swipe completions on some WebViews, which made the whole
    // route feel shifted or unstable.
    if ('PointerEvent' in window) {
      root.addEventListener('pointerdown', (ev) => begin(ev.clientX, ev.clientY, ev.target, ev.pointerId, ev.isPrimary), { passive: true, capture: true });
      root.addEventListener('pointermove', (ev) => { if (activePointerId === null || ev.pointerId === activePointerId) move(ev.clientX, ev.clientY); }, { passive: true, capture: true });
      root.addEventListener('pointerup', (ev) => { if (activePointerId === null || ev.pointerId === activePointerId) finish(ev.clientX, ev.clientY); }, { passive: true, capture: true });
      root.addEventListener('pointercancel', reset, { passive: true, capture: true });
      return;
    }

    root.addEventListener('touchstart', (ev) => {
      const t = ev.changedTouches[0];
      if (ev.touches.length > 1) { reset(); return; }
      if (t) begin(t.clientX, t.clientY, ev.target);
    }, { passive: true, capture: true });
    root.addEventListener('touchmove', (ev) => {
      const t = ev.changedTouches[0];
      if (!t) return;
      if (ev.touches.length > 1) { reset(); return; }
      move(t.clientX, t.clientY);
      if (horizontalIntent) ev.preventDefault();
    }, { passive: false, capture: true });
    root.addEventListener('touchend', (ev) => {
      const t = ev.changedTouches[0];
      if (t) finish(t.clientX, t.clientY);
      else finish();
    }, { passive: true, capture: true });
    root.addEventListener('touchcancel', reset, { passive: true, capture: true });
  }

  private async initPixiStage(): Promise<void> {
    this.fallbackMode = false;
    if (!this.pixiLayer || !this.stageHost || !this.hasWebGL()) throw new Error('WebGL unavailable');
    const app = new Application();
    await app.init({ resizeTo: this.stageHost, backgroundAlpha: 0, antialias: true, resolution: Math.min(window.devicePixelRatio || 1, this.quality.recommendedDprCap()), autoDensity: true, powerPreference: this.quality.isLite() ? 'low-power' : 'high-performance' });
    this.pixi = app;
    this.pixiLayer.appendChild(app.canvas);

    this.activeFish = this.pickFish();
    const textures = await Assets.load([this.getRegion().bg, ASSET.player, ASSET.float, this.activeFish.img]);
    this.applyTextureFidelity([textures[this.getRegion().bg], textures[ASSET.player], textures[ASSET.float], textures[this.activeFish.img]]);
    this.bgSprite = new Sprite(textures[this.getRegion().bg]);
    this.player = new Sprite(textures[ASSET.player]);
    this.bobber = new Sprite(textures[ASSET.float]);
    this.catchSprite = new Sprite(textures[this.activeFish.img]);
    this.activeFishTextureUrl = this.activeFish.img;
    this.biteText = new Text({ text: '!', style: { fontFamily: 'Arial', fontSize: 82, fontWeight: '900', fill: 0xff5848, stroke: { color: 0xffffff, width: 9 } } });

    const world = new Container();
    world.sortableChildren = true;
    app.stage.addChild(world);
    world.addChild(this.bgSprite, this.player, this.bobber, this.catchSprite, this.biteText);
    this.bgSprite.zIndex = 0;
    this.bgSprite.alpha = 0.78;
    this.player.zIndex = 20;
    this.bobber.zIndex = 26;
    this.catchSprite.zIndex = 32;
    this.biteText.zIndex = 40;
    this.player.anchor.set(0.5, 0.9);
    this.bobber.anchor.set(0.5, 0.5);
    this.bobber.visible = false;
    this.catchSprite.anchor.set(0.5, 0.5);
    this.biteText.anchor.set(0.5);
    this.catchSprite.visible = false;
    this.biteText.visible = false;
    this.resizePixi();
    window.addEventListener('resize', this.resizePixiHandler, { passive: true });

    this.createCastButton();
    this.stageHost.addEventListener('pointerdown', (ev) => {
      const target = ev.target as HTMLElement | null;
      if (target?.closest('.cast-button, .reel-panel, .fishing-hud, .recent-catch-strip, .fishing-loadout-strip')) return;
      if (this.state === 'idle') this.castLine();
      else if (this.state === 'bite') {
        this.startReeling();
        this.holding = true;
        this.spawnTouchRing(ev.clientX, ev.clientY);
      } else if (this.state === 'reeling') {
        this.holding = true;
        this.stageHost?.setPointerCapture?.(ev.pointerId);
        this.spawnTouchRing(ev.clientX, ev.clientY);
      }
    });
    this.stageHost.addEventListener('pointerup', () => { if (this.state === 'reeling') this.holding = false; });
    this.stageHost.addEventListener('pointercancel', () => { if (this.state === 'reeling') this.holding = false; });
    this.stageHost.addEventListener('pointerleave', () => { if (this.state === 'reeling') this.holding = false; });
    this.stageHost.addEventListener('lostpointercapture', () => { if (this.state === 'reeling') this.holding = false; });
    app.ticker.add(() => this.tick());
    this.state = 'idle';
    this.setFishingPhase('idle');
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


  private async syncCatchSpriteTexture(fish: FishInfo): Promise<void> {
    if (this.fallbackMode || !this.catchSprite || this.activeFishTextureUrl === fish.img) return;
    try {
      const texture = await Assets.load(fish.img);
      this.applyTextureFidelity([texture]);
      if (!this.catchSprite || this.fallbackMode) return;
      this.catchSprite.texture = texture;
      this.activeFishTextureUrl = fish.img;
      this.resizePixi();
    } catch (error) {
      console.warn('[AquaFantasia] fish texture sync skipped', error);
    }
  }

  private syncFishingHud(): void {
    const root = dom.app.querySelector<HTMLElement>('.fishing-screen');
    if (!root) return;
    const coins = root.querySelector<HTMLElement>('[data-hud-coins] strong');
    const lures = root.querySelector<HTMLElement>('[data-hud-lures] strong');
    const recent = root.querySelector<HTMLElement>('.recent-catch-strip');
    const loadoutSlots = root.querySelectorAll<HTMLElement>('.fishing-loadout-strip span');
    if (coins) coins.textContent = this.save.coins.toLocaleString('ko-KR');
    if (lures) lures.textContent = String(this.save.gear.lureStock);
    if (loadoutSlots[0]) loadoutSlots[0].textContent = `로드 Lv.${this.save.gear.rodLevel}`;
    if (loadoutSlots[1]) loadoutSlots[1].textContent = `미끼 ${this.save.gear.lureStock}`;
    if (recent) recent.innerHTML = this.recentCatchMarkup();
    this.syncCastButtonState();
  }

  private resizePixi(): void {
    if (!this.pixi || !this.bgSprite || !this.player || !this.bobber || !this.catchSprite || !this.biteText) return;
    const w = this.pixi.screen.width;
    const h = this.pixi.screen.height;
    const bgScale = Math.max(w / this.bgSprite.texture.width, h / this.bgSprite.texture.height);
    this.bgSprite.scale.set(bgScale);
    this.bgSprite.position.set((w - this.bgSprite.texture.width * bgScale) / 2, (h - this.bgSprite.texture.height * bgScale) / 2);
    const playerTargetH = Math.min(h * 0.34, w * 0.60);
    this.player.scale.set(playerTargetH / Math.max(1, this.player.texture.height));
    const playerScaledW = this.player.texture.width * this.player.scale.x;
    this.player.position.set(w - playerScaledW * 0.18, h * 0.735);
    const bobberTarget = Math.max(28, Math.min(50, w * 0.09));
    this.bobber.scale.set(bobberTarget / Math.max(1, this.bobber.texture.width));
    this.bobber.position.set(w * 0.34, h * 0.57);
    const fishTargetW = Math.min(w * 0.50, 260);
    this.catchSprite.scale.set(fishTargetW / Math.max(1, this.catchSprite.texture.width));
    this.catchSprite.position.set(w * 0.38, h * 0.51);
    this.biteText.position.set(w * 0.34, h * 0.36);
  }

  private setFishingPhase(phase: FishingState): void {
    const screen = dom.app.querySelector<HTMLElement>('.fishing-screen');
    const phases: FishingState[] = ['idle', 'casting', 'waiting', 'bite', 'reeling', 'success', 'fail'];
    for (const item of phases) {
      this.stageHost?.classList.toggle(`fishing-phase-${item}`, item === phase);
      screen?.classList.toggle(`fishing-phase-${item}`, item === phase);
    }
    screen?.setAttribute('data-fishing-phase', phase);
  }

  private createCastButton(): void {
    if (!this.uiLayer) return;
    this.uiLayer.innerHTML = `<button class="cast-button v2020-cast-button v2021-bait-aware-cast v2026-stable-cast-button v2029-calm-cast-button v2030-cast-button v2031-cast-button v2032-cast-button v2033-cast-button v2034-cast-button v2035-cast-button v2036-cast-button v2037-cast-button v2038-cast-button v2040-cast-button v2041-cast-button v2042-cast-button v2043-cast-button v2044-cast-button v2045-cast-button" type="button" aria-label="낚시 시작"><img class="v2020-cast-button-art" src="${ASSET.uiButtonSmallAqua}" alt="" aria-hidden="true" /><img class="v2021-cast-pill-art" src="${ASSET.uiButtonPillAqua}" alt="" aria-hidden="true" /><span class="cast-icon" aria-hidden="true"></span><strong>낚시 시작</strong></button>`;
    this.castBtn = this.uiLayer.querySelector<HTMLButtonElement>('.cast-button')!;
    this.syncCastButtonState();
    this.castBtn.addEventListener('click', () => { this.reassertImmersiveMode(); this.castLine(); });
  }

  private syncCastButtonState(): void {
    if (!this.castBtn) return;
    const empty = this.save.gear.lureStock <= 0;
    this.castBtn.classList.toggle('no-bait', empty);
    this.castBtn.setAttribute('aria-label', empty ? '미끼가 없어 낚시를 시작할 수 없습니다' : '낚시 시작');
    const label = this.castBtn.querySelector<HTMLElement>('strong');
    if (label) label.textContent = empty ? '미끼 보충 필요' : '낚시 시작';
  }

  private canStartFishingCast(): boolean {
    if (this.save.gear.lureStock > 0) return true;
    this.syncCastButtonState();
    this.setHint('미끼가 없습니다 · 가방/장비 화면에서 미끼를 보충한 뒤 출항하세요');
    this.spawnActionBadge('미끼 없음', '장비 화면에서 미끼를 보충하세요');
    this.toast.show({ type: 'shop', title: '미끼가 부족해요', message: '장비 화면에서 미끼를 구매하면 다시 낚시할 수 있습니다.', actionScreen: 'gear' });
    this.vibrate(8);
    return false;
  }

  private castLine(): void {
    if (this.fallbackMode) { this.castLineFallback(); return; }
    if (this.state !== 'idle' || !this.castBtn || !this.pixi || !this.bobber) return;
    if (!this.canStartFishingCast()) return;
    playSound('cast');
    this.vibrate(12);
    this.save.totalCasts += 1;
    this.save.gear.lureStock -= 1;
    saveGame(this.save);
    this.syncFishingHud();
    this.activeFish = this.pickFish();
    void this.syncCatchSpriteTexture(this.activeFish);
    this.bobber.visible = true;
    this.state = 'casting';
    this.setFishingPhase('casting');
    this.stageHost?.classList.add('casting-mode');
    this.stageHost?.classList.remove('reeling-mode');
    this.castStart = performance.now();
    this.castBtn.classList.add('pop-out');
    if (this.comboNode) {
      this.comboNode.textContent = `연속 성공 x${Math.max(2, this.save.currentStreak)}`;
      this.comboNode.classList.toggle('hidden', this.save.currentStreak < 2);
    }
    this.spawnCastTrail();
    this.spawnActionBadge('퐁!', '찌를 던졌어요');
    this.setHint('찌가 포물선을 그리며 날아갑니다');
    window.setTimeout(() => this.castBtn?.classList.add('hidden'), 260);
  }

  private scheduleBite(): void {
    this.state = 'waiting';
    this.setFishingPhase('waiting');
    this.stageHost?.classList.remove('casting-mode');
    this.stageHost?.classList.add('waiting-mode');
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
    this.setFishingPhase('bite');
    if (this.biteText) this.biteText.visible = true;
    this.stageHost?.classList.remove('waiting-mode');
    this.stageHost?.classList.add('bite-mode');
    this.stageHost?.classList.add('camera-shake');
    this.stageHost?.classList.add('bite-flash');
    this.setHint(`${this.activeFish.rarity === 'BOSS' ? '보스 입질!' : '물었다!'} 큰 버튼 또는 바다 화면을 눌러 릴링을 시작하세요`);
    this.showBiteCallout(this.activeFish.rarity === 'BOSS' ? '보스가 물었다!' : '물었다!');
    this.spawnBiteBurst();
    window.setTimeout(() => {
      if (this.state === 'bite') this.startReeling();
    }, 1200);
    window.setTimeout(() => this.stageHost?.classList.remove('camera-shake', 'bite-flash'), 520);
  }

  private startReeling(): void {
    if (this.state !== 'bite') return;
    this.vibrate(20);
    this.state = 'reeling';
    this.setFishingPhase('reeling');
    this.stageHost?.classList.remove('bite-mode', 'waiting-mode');
    this.stageHost?.classList.add('reeling-mode');
    this.tension = 50 + this.getRegion().difficulty * 2;
    this.safeTimer = 0;
    this.surgeTimer = 0;
    this.perfectChain = 0;
    this.routeGuardActive = false;
    this.holding = false;
    if (this.biteText) this.biteText.visible = false;
    this.hideBiteCallout();
    this.reelPanel?.classList.remove('hidden');
    this.holdPad?.removeAttribute('disabled');
    this.setHint('릴 감기! 아래 큰 노란 버튼을 꾹 누르거나 바다 화면을 누르며 초록 안전지대를 2.4초 유지하세요');
    this.updateTensionUI();
    this.spawnActionBadge('릴링!', '누르는 동안 장력이 올라가요');
  }

  private finishCatch(success: boolean): void {
    if (this.state === 'success' || this.state === 'fail') return;
    this.state = success ? 'success' : 'fail';
    this.setFishingPhase(this.state);
    this.holding = false;
    this.hideBiteCallout();
    this.reelPanel?.classList.add('hidden');
    this.holdPad?.setAttribute('disabled', 'true');
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
      this.syncFishingHud();
      if (this.comboNode) { this.comboNode.textContent = `연속 성공 x${Math.max(2, this.save.currentStreak)}`; this.comboNode.classList.toggle('hidden', this.save.currentStreak < 2); }
      void this.syncCatchSpriteTexture(this.activeFish).finally(() => this.showCatchPopup(reward));
      this.spawnRewardBurst(reward);
      this.toast.show({ type: 'dex', title: `${this.activeFish.name} 획득!`, message: `도감 카드와 보상 ${reward}G가 추가되었습니다.`, actionScreen: 'dex' });
    } else {
      playSound('fail');
      this.save.currentStreak = 0;
      this.save.totalFail += 1;
      saveGame(this.save);
      this.syncFishingHud();
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
      if (!this.pixi || !this.catchSprite) return;
      if (this.state !== 'success') {
        this.pixi.ticker.remove(popup);
        this.stageHost?.classList.remove('catch-bloom');
        return;
      }
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
    card.className = `catch-result-card v930-result v2021-result-card v2036-result-card v2037-result-card v2038-result-card v2039-result-card v2040-result-card v2041-result-card v2042-result-card v2043-result-card v2044-result-card v2045-result-card rarity-${this.activeFish.rarity.toLowerCase()}`;
    const firstCatch = (this.save.caught[this.activeFish.id] ?? 0) <= 1;
    card.innerHTML = `<i class="result-sparkle" aria-hidden="true"></i><img class="v2021-result-modal-frame" src="${ASSET.uiModalAqua}" alt="" aria-hidden="true" /><img class="v205-result-frame" src="${ASSET.fishingCatchWindow}" alt="" aria-hidden="true" /><img class="v205-result-fish" src="${this.activeFish.img}" alt="" /><small>${firstCatch ? 'NEW!' : this.activeFish.rarity}</small><h3>${this.activeFish.name}</h3><span><img src="${ASSET.fishingTreasure}" alt="" />${this.activeFish.rarity} · ${reward}G · 연속 성공 x${Math.max(1, this.save.currentStreak)}</span><div><button data-next="fishing">계속 낚시</button><button data-next="dex">도감 보기</button></div>`;
    (dom.app.querySelector<HTMLElement>('.fishing-screen') ?? this.stageHost)?.appendChild(card);
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
    if (this.bobber) this.bobber.visible = false;
    if (this.catchSprite) this.catchSprite.visible = false;
    if (this.biteText) this.biteText.visible = false;
    this.hideBiteCallout();
    this.reelPanel?.classList.add('hidden');
    this.stageHost?.classList.remove('catch-bloom', 'fallback-casting', 'surge-alert', 'guard-active', 'casting-mode', 'waiting-mode', 'bite-mode', 'reeling-mode');
    this.stageHost?.querySelectorAll('.v930-fx, .action-badge').forEach((node) => node.remove());
    this.stageHost?.querySelector('.catch-result-card')?.remove();
    dom.app.querySelector('.catch-result-card')?.remove();
    this.state = 'idle';
    this.setFishingPhase('idle');
    this.castBtn?.classList.remove('hidden', 'pop-out');
    this.syncCastButtonState();
    this.resizePixi();
    this.setHint('좋아요! 찌 던지기로 다음 물고기를 노려보세요');
    if (this.comboNode) { this.comboNode.textContent = `연속 성공 x${Math.max(2, this.save.currentStreak)}`; this.comboNode.classList.toggle('hidden', this.save.currentStreak < 2); }
  }

  private tick(): void {
    const now = performance.now();
    const dt = Math.min(2, (now - this.lastTick) / 16.666);
    this.lastTick = now;
    if (this.fallbackMode) { this.tickFallback(now, dt); return; }
    if (!this.pixi || !this.bobber) return;
    const w = this.pixi.screen.width;
    const h = this.pixi.screen.height;
    if (this.state === 'casting') {
      const t = Math.min(1, (now - this.castStart) / 760);
      const sx = w * 0.82, sy = h * 0.52;
      const ex = w * 0.34, ey = h * 0.58;
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
      this.tension += ((this.holding ? 0.52 + regionMod * 0.08 : -0.34) / gearRelief) * dt + drift * 0.72;
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
      if (this.tension <= 0 || this.tension >= 100) this.finishCatch(false);
      if (this.safeTimer >= 2.4) this.finishCatch(true);
    }
  }


  private tickFallback(now: number, dt: number): void {
    if (this.state !== 'reeling') return;
    const regionMod = this.getRegion().difficulty;
    const gearRelief = 1 + this.save.gear.rodLevel * 0.06 + this.save.gear.reelLevel * 0.05 + this.save.gear.lineLevel * 0.05;
    const bossMod = this.activeFish.rarity === 'BOSS' ? 1.28 : this.activeFish.rarity === 'EPIC' ? 1.13 : 1;
    this.surgeTimer += dt / 60;
    const surgeActive = this.surgeTimer > 1.25 && Math.sin(now / 520) > 0.82;
    const drift = Math.sin(now / 215) * 0.28 * regionMod * bossMod + Math.sin(now / 770) * 0.10 + (surgeActive ? Math.sin(now / 84) * 0.34 : 0);
    this.tension += ((this.holding ? 0.50 + regionMod * 0.08 : -0.32) / gearRelief) * dt + drift * 0.72;
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
    if (this.tension <= 0 || this.tension >= 100) this.finishCatch(false);
    if (this.safeTimer >= 2.4) this.finishCatch(true);
  }


  private spawnCastTrail(): void {
    if (!this.stageHost) return;
    const trail = document.createElement('div');
    trail.className = 'v930-fx cast-trail-cute';
    trail.innerHTML = `<i></i><i></i><i></i><i></i><i></i>`;
    this.stageHost.appendChild(trail);
    window.setTimeout(() => trail.remove(), 980);
  }

  private spawnBiteBurst(): void {
    if (!this.stageHost) return;
    const burst = document.createElement('div');
    burst.className = 'v930-fx bite-burst-cute v2041-bite-burst v2042-bite-burst v2043-bite-burst';
    burst.innerHTML = `<span>!</span>`;
    this.stageHost.appendChild(burst);
    window.setTimeout(() => burst.remove(), 980);
  }

  private spawnRewardBurst(reward: number): void {
    if (!this.stageHost) return;
    const burst = document.createElement('div');
    burst.className = 'v930-fx reward-burst-cute';
    burst.innerHTML = `<img src="${ASSET.fishingPearl}" alt="" /><strong>+${reward}G</strong><span></span><span></span><span></span><span></span>`;
    this.stageHost.appendChild(burst);
    window.setTimeout(() => burst.remove(), 1400);
  }

  private spawnActionBadge(title: string, subtitle: string): void {
    if (!this.stageHost) return;
    this.stageHost.querySelector('.action-badge')?.remove();
    const badge = document.createElement('div');
    badge.className = 'action-badge v930-fx v2030-action-badge v2040-action-badge v2041-action-badge v2042-action-badge v2043-action-badge v2046-action-badge';
    badge.innerHTML = `<strong>${title}</strong><span>${subtitle}</span>`;
    this.stageHost.appendChild(badge);
    window.setTimeout(() => badge.remove(), 1550);
  }

  private spawnSplash(): void {
    const splash = document.createElement('div');
    splash.className = 'splash-ring v930-splash v11115-left-splash v205-splash-art';
    splash.innerHTML = `<img src="${ASSET.fishingSplash}" alt="" />`;
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
    if (this.progressNode) this.progressNode.style.width = `${Math.min(100, (this.safeTimer / 2.4) * 100)}%`;
    const verticalMarker = this.reelPanel?.querySelector<HTMLElement>('.v2040-vertical-marker');
    const verticalSafe = this.reelPanel?.querySelector<HTMLElement>('.v2040-vertical-safe');
    if (verticalMarker) verticalMarker.style.top = `${Math.max(3, Math.min(97, 100 - value))}%`;
    if (verticalSafe) {
      verticalSafe.style.top = `${Math.max(0, 100 - zone.right)}%`;
      verticalSafe.style.height = `${Math.max(6, zone.right - zone.left)}%`;
    }
    const surgeNode = this.reelPanel?.querySelector<HTMLSpanElement>('.surge-meter span');
    if (surgeNode) surgeNode.style.width = `${Math.min(100, this.perfectChain * 72)}%`;
  }

  private safeZone(): { left: number; right: number } {
    const masteryBonus = Math.min(4, (this.save.mastery[this.save.region] ?? 0) * 0.08);
    const width = Math.max(24, 36 - this.getRegion().difficulty * 2.5 + this.save.gear.lineLevel * 1.8 + masteryBonus);
    const center = 55 + Math.sin(performance.now() / 1800) * (this.activeFish.rarity === 'BOSS' ? 2.6 : 1.2);
    return { left: center - width / 2, right: center + width / 2 };
  }

  private setHint(text: string): void {
    const node = document.querySelector('#fishingHint');
    if (node) node.textContent = text;
    const visibleTip = dom.app.querySelector<HTMLElement>('[data-fishing-tip]');
    if (visibleTip) visibleTip.textContent = text;
  }

  private showBiteCallout(title: string): void {
    this.hideBiteCallout();
    const callout = document.createElement('div');
    callout.className = 'bite-callout v2030-bite-callout v2041-bite-callout v2042-bite-callout v2043-bite-callout v2046-bite-callout';
    callout.innerHTML = `<strong>${title}</strong><span>여기를 누르면 릴링 시작!</span><button type="button" class="v2046-bite-start">릴링 시작</button>`;
    callout.addEventListener('pointerdown', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      this.startReeling();
      this.holding = true;
    });
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
      backdrop.className = `game-dialog-backdrop v2033-dialog-backdrop ${this.exitPromptOpen ? 'v2033-exit-dialog-backdrop' : ''}`;
      backdrop.innerHTML = `
        <section class="game-dialog-card v2033-game-dialog-card" role="dialog" aria-modal="true" aria-label="${options.title}">
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

  private renderMap(): void {
    this.updateUnlocks();
    const root = this.createRuntimeMenuScreen('map', '월드맵', '수역을 선택하고 출항 준비를 합니다.');
    const activeRegion = this.getRegion();
    const unlockedCount = regions.filter((item) => this.isRegionUnlocked(item.key)).length;
    const content = root.querySelector<HTMLDivElement>('.runtime-content')!;
    content.innerHTML = `
      <section class="runtime-hero-card v204-window-card v204-map-hero v206-map-hero">
        <img src="./assets/v22/icons/nav_map.png" alt="" />
        <div><span class="runtime-eyebrow">OCEAN ROUTE</span><h2>지도</h2><p>현재 목적지 ${activeRegion.name} · 열린 수역 ${unlockedCount}/${regions.length}</p></div>
        <button class="runtime-btn gold compact-cta btn-gold-cost" type="button" data-go-fishing>출항</button>
      </section>
      <section class="v206-route-ready v204-window-card" aria-label="출항 준비 현황">
        <article><strong>${this.save.gear.lureStock}</strong><span>미끼</span></article>
        <article><strong>Lv.${this.save.gear.rodLevel}</strong><span>로드</span></article>
        <article><strong>${this.save.totalSuccess}</strong><span>성공 항해</span></article>
        <article><strong>${unlockedCount}/${regions.length}</strong><span>열린 수역</span></article>
      </section>
      <section class="v204-map-shell v206-map-shell" aria-label="AquaFantasia 월드맵">
        <div class="v204-map-ocean v206-map-ocean v2023-world-map-ocean">
          <img class="v2023-world-map-bg" src="${ASSET.worldMapPremiumBg}" alt="" aria-hidden="true" loading="lazy" />
          ${regions.map((item, index) => {
            const locked = !this.isRegionUnlocked(item.key);
            const active = item.key === this.save.region;
            return `<button type="button" class="v204-island v206-island ${active ? 'active' : ''} ${locked ? 'locked' : ''}" data-region="${item.key}" style="--x:${12 + (index % 3) * 32}%;--y:${13 + Math.floor(index / 3) * 21}%"><img src="${item.bg}" alt="" /><strong>${locked ? '잠긴 섬' : item.name}</strong><span>${locked ? item.unlockHint : item.tide}</span></button>`;
          }).join('')}
          <i class="v204-route-line one"></i><i class="v204-route-line two"></i><i class="v204-route-line three"></i>
        </div>
        <div class="v204-map-detail v206-map-detail"><strong>${activeRegion.name}</strong><span>${activeRegion.subtitle} · ${activeRegion.tide}</span><p>선장: 항로를 고르면 바로 낚시터로 이동합니다. 잠긴 수역은 도감, 성공 횟수, 마을 의뢰를 통해 열립니다.</p><button class="runtime-btn cyan compact-cta btn-aqua-action" data-go-fishing>선택 수역 출항</button></div>
      </section>`;
    dom.app.appendChild(root);
    root.querySelectorAll<HTMLButtonElement>('[data-region]').forEach((btn) => btn.addEventListener('click', () => {
      const key = btn.dataset.region as RegionKey;
      if (!this.isRegionUnlocked(key)) {
        const region = regions.find((item) => item.key === key);
        this.toast.show({ type: 'normal', title: '아직 잠긴 수역', message: region?.unlockHint ?? '마을 발전과 도감 수집이 필요합니다.', actionScreen: 'mission' });
        return;
      }
      this.save.region = key;
      saveGame(this.save);
      this.renderMap();
    }));
    root.querySelectorAll<HTMLButtonElement>('[data-go-fishing]').forEach((btn) => btn.addEventListener('click', () => { void this.go('fishing'); }));
    this.mountBottomNav(root, 'map');
  }

  private renderGear(): void {
    const root = this.createRuntimeMenuScreen('gear', '장비', '낚싯대·릴·줄을 실제 수치에 맞춰 강화합니다.');
    const content = root.querySelector<HTMLDivElement>('.runtime-content')!;
    content.innerHTML = `
      <section class="runtime-hero-card gear-summary">
        <img src="./assets/v91/icons/gear.png" alt="" />
        <div><span class="runtime-eyebrow">EQUIPMENT</span><h2>장비 관리</h2><p>총합 Lv.${this.save.gear.rodLevel + this.save.gear.reelLevel + this.save.gear.lineLevel} · 미끼 ${this.save.gear.lureStock}개</p></div>
        <button class="runtime-btn cyan compact-cta btn-aqua-action" type="button" data-go-fishing>낚시터</button>
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
    return `<article class="gear-card glass-card v950-gear-card"><div class="v950-item-orb"><img src="${icon}" alt="" /></div><div class="v950-card-main"><strong>${name}</strong><span>Lv.${level} · ${desc}</span><i class="v950-stat-bar" style="--p:${pct}%"><b></b></i></div><button class="image-btn gold v950-price-btn compact-cost-btn btn-gold-cost" data-upgrade="${kind}">${cost}G</button></article>`;
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
    const root = this.createRuntimeMenuScreen('inventory', '가방', '보유 아이템과 출항 준비 상태를 확인합니다.');
    const content = root.querySelector<HTMLDivElement>('.runtime-content')!;
    const totalCaught = this.totalCaught();
    const rareCaught = Object.entries(this.save.caught).filter(([id, count]) => count > 0 && fishDex.find((fish) => fish.id === id)?.rarity !== 'COMMON').length;
    content.innerHTML = `
      <section class="runtime-hero-card inventory-summary v204-window-card v204-inventory-hero v206-inventory-hero">
        <img src="./assets/v22/icons/nav_bag.png" alt="" />
        <div><span class="runtime-eyebrow">OCEAN BAG</span><h2>가방</h2><p>미끼 ${this.save.gear.lureStock}개 · 누적 포획 ${totalCaught}마리 · 희귀 기록 ${rareCaught}종</p></div>
        <button class="runtime-btn cyan compact-cta btn-aqua-action" type="button" data-go-map>지도</button>
      </section>
      <section class="v206-inventory-dashboard v204-window-card" aria-label="가방 요약">
        <article><img src="./assets/v205/fishing/slot_bait.png" alt="" /><strong>${this.save.gear.lureStock}</strong><span>출항 미끼</span></article>
        <article><img src="./assets/v205/fishing/treasure_chest.png" alt="" /><strong>${Object.values(this.save.missions).filter(Boolean).length}</strong><span>수령 의뢰</span></article>
        <article><img src="./assets/v22/icons/nav_fishing.png" alt="" /><strong>${totalCaught}</strong><span>전체 포획</span></article>
        <article><img src="./assets/v22/icons/nav_map.png" alt="" /><strong>${this.save.unlockedRegions.length}</strong><span>열린 수역</span></article>
      </section>
      <section class="v204-inventory-shell v206-inventory-shell" aria-label="가방 슬롯">
        <div class="v206-section-title"><strong>장비 & 소모품</strong><span>출항 전에 확인하세요</span></div>
        <div class="v204-inventory-grid v206-inventory-grid">
          <article class="runtime-item-card v950-inventory-card v204-slot-card"><em class="v950-count">x${this.save.gear.lureStock}</em><img src="./assets/v205/fishing/slot_bait.png" alt="" /><strong>새우 미끼</strong><span>입질 대기시간을 줄여줘요</span><button class="runtime-btn cyan compact-cta btn-aqua-action" data-go-map>사용</button></article>
          <article class="runtime-item-card v950-inventory-card v204-slot-card"><em class="v950-count">∞</em><img src="./assets/v92/equipment/ticket.png" alt="" /><strong>출항 티켓</strong><span>월드맵에서 바로 수역을 선택</span><button class="runtime-btn cyan compact-cta btn-aqua-action" data-go-map>지도</button></article>
          <article class="runtime-item-card v950-inventory-card v204-slot-card"><em class="v950-count">NEW</em><img src="./assets/v205/fishing/treasure_chest.png" alt="" /><strong>보상 상자</strong><span>미션 보상으로 열 수 있어요</span><button class="runtime-btn cyan compact-cta btn-aqua-action" data-go-mission>미션</button></article>
          <article class="runtime-item-card v950-inventory-card v204-slot-card"><em class="v950-count">Lv.${this.save.gear.rodLevel}</em><img src="./assets/v205/fishing/slot_rod.png" alt="" /><strong>낚싯대</strong><span>장력 안정과 희귀어 대응</span><button class="runtime-btn cyan compact-cta btn-aqua-action" data-go-shop>강화</button></article>
        </div>
      </section>
      <section class="v206-catch-ledger v204-window-card" aria-label="최근 포획 원장">
        <div class="v206-section-title"><strong>최근 포획 원장</strong><span>많이 잡은 물고기 기준</span></div>
        ${this.recentCatchMarkup()}
      </section>`;
    dom.app.appendChild(root);
    root.querySelectorAll<HTMLButtonElement>('[data-go-map]').forEach((btn) => btn.addEventListener('click', () => { void this.go('map'); }));
    root.querySelector<HTMLButtonElement>('[data-go-shop]')?.addEventListener('click', () => { void this.go('shop'); });
    root.querySelector<HTMLButtonElement>('[data-go-mission]')?.addEventListener('click', () => { void this.go('mission'); });
    this.mountBottomNav(root, 'inventory');
  }

  private renderDex(): void {
    const root = this.createRuntimeMenuScreen('dex', '도감', '실제 포획 기록 기준으로 물고기 카드를 표시합니다.');
    const content = root.querySelector<HTMLDivElement>('.runtime-content')!;
    const discovered = fishDex.filter((fish) => fish.id !== 'unknown' && ((this.save.caught[fish.id] ?? 0) > 0 || fish.rarity === 'COMMON')).length;
    const cards = fishDex.filter((fish) => fish.id !== 'unknown').map((fish) => {
      const count = this.save.caught[fish.id] ?? 0;
      const open = count > 0 || fish.rarity === 'COMMON';
      return `<article class="dex-card runtime-dex-card rarity-${fish.rarity.toLowerCase()} ${open ? '' : 'locked'}"><img src="${open ? fish.img : './assets/v85/fish/fish_unknown.png'}" alt="" /><strong>${open ? fish.name : '미발견'}</strong><span>${open ? `${fish.region} · ${count}마리` : '낚시터에서 발견하세요'}</span><em>${fish.rarity}</em></article>`;
    }).join('');
    content.innerHTML = `
      <section class="runtime-hero-card dex-summary">
        <img src="./assets/v91/icons/dex.png" alt="" />
        <div><span class="runtime-eyebrow">FISH DEX</span><h2>도감</h2><p>발견 ${discovered}/${fishDex.length - 1}종 · 누적 ${this.totalCaught()}마리</p></div>
        <button class="runtime-btn cyan compact-cta btn-aqua-action" type="button" data-go-fishing>채우기</button>
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
    const todayKey = `shop_free_${new Date().toLocaleDateString('en-CA')}`;
    const freeClaimed = Boolean(this.save.missions[todayKey]);
    const content = root.querySelector<HTMLDivElement>('.runtime-content')!;
    content.innerHTML = `
      <section class="runtime-hero-card shop-summary v2042-shop-summary v2043-shop-summary v2044-shop-summary">
        <img src="./assets/v91/icons/shop.png" alt="" />
        <div><span class="runtime-eyebrow">SHOP</span><h2>상점</h2><p>보유 골드 ${this.save.coins.toLocaleString('ko-KR')}G · 미끼 ${this.save.gear.lureStock}개 · 무료 보상 ${freeClaimed ? '오늘 수령 완료' : '오늘 수령 가능'}</p></div>
        <button class="runtime-btn gold compact-cta btn-gold-cost ${freeClaimed ? 'claimed' : ''}" type="button" data-free aria-disabled="${freeClaimed}">${freeClaimed ? '수령완료' : '무료'}</button>
      </section>
      <section class="shop-list runtime-card-list v108-shop-grid v2042-shop-list v2043-shop-list v2044-shop-list">${goods.map((item, index) => `<button class="shop-card runtime-shop-card v950-shop-card v108-shop-card" type="button" data-buy="${index}"><em>${index === 0 ? '추천' : index === 3 ? '안전' : '강화'}</em><img src="${item.icon}" alt="" /><div><strong>${item.name}</strong><small>${item.desc}</small></div><span class="shop-price compact-cost-badge btn-gold-cost">${item.cost}G</span></button>`).join('')}</section>`;
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
    root.querySelector<HTMLButtonElement>('[data-free]')?.addEventListener('click', () => {
      if (this.save.missions[todayKey]) {
        this.toast.show({ type: 'shop', title: '무료 보상은 하루 1번', message: '오늘 보상은 이미 수령했습니다.', actionScreen: 'shop' });
        return;
      }
      this.save.missions[todayKey] = true;
      this.save.coins += 50;
      this.save.gear.lureStock += 1;
      saveGame(this.save);
      this.toast.show({ type: 'reward', title: '무료 보상', message: '50G와 미끼 1개를 받았습니다.', actionScreen: 'shop' });
      this.renderShop();
    });
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
    const root = this.createRuntimeMenuScreen('mission', '퀘스트', '실제 플레이 기록 기준으로 보상을 수령합니다.');
    const goals = this.missionGoals();
    const doneCount = Object.values(this.save.missions).filter(Boolean).length;
    const readyCount = goals.filter((goal) => goal.value >= goal.max && !this.save.missions[goal.id]).length;
    const featured = goals.filter((goal) => !this.save.missions[goal.id]).slice(0, 4);
    const content = root.querySelector<HTMLDivElement>('.runtime-content')!;
    content.innerHTML = `
      <section class="runtime-hero-card mission-summary v204-window-card v204-quest-hero v206-quest-hero">
        <img src="./assets/v22/icons/nav_quest.png" alt="" />
        <div><span class="runtime-eyebrow">VILLAGE QUEST</span><h2>퀘스트</h2><p>완료 ${doneCount}/${goals.length} · 수령 가능 ${readyCount}개 · 마을 성장과 연결</p></div>
        <button class="runtime-btn cyan compact-cta btn-aqua-action" type="button" data-go-map>진행</button>
      </section>
      <section class="v206-quest-npc-board v204-window-card" aria-label="NPC 의뢰 보드">
        <article><img src="./assets/v203/portraits/chief_happy.png" alt="" /><strong>촌장</strong><span>마을 발전도와 시설 건설</span></article>
        <article><img src="./assets/v203/portraits/guild_happy.png" alt="" /><strong>낚시 길드</strong><span>성공 횟수와 도감 발견</span></article>
        <article><img src="./assets/v203/portraits/captain_happy.png" alt="" /><strong>선장</strong><span>수역 해금과 항로 개척</span></article>
      </section>
      <section class="v204-quest-board v206-quest-board" aria-label="추천 퀘스트">
        <div class="v204-board-title"><strong>추천 의뢰</strong><span>가장 가까운 성장 목표</span></div>
        ${featured.map((goal) => {
          const pct = Math.min(100, Math.round((goal.value / goal.max) * 100));
          const buttonLabel = this.save.missions[goal.id] ? '완료' : goal.value >= goal.max ? '수령' : `${goal.value}/${goal.max}`;
          return `<article class="mission-card runtime-mission-card v950-mission-card v108-mission-card v204-quest-card ${goal.event ? 'event' : ''} ${goal.value >= goal.max ? 'ready' : ''}"><div><small>${goal.category}</small><strong>${goal.title}</strong><span>${goal.desc}</span></div><div class="v108-mission-progress" style="--p:${pct}%"><i></i><b>${pct}%</b></div><button class="runtime-btn cyan compact-cta btn-aqua-action" data-mission="${goal.id}">${buttonLabel}</button></article>`;
        }).join('')}
      </section>
      <section class="mission-list runtime-card-list v108-mission-list v204-full-quest-list v206-full-quest-list">${goals.slice(4).map((goal) => {
        const pct = Math.min(100, Math.round((goal.value / goal.max) * 100));
        const buttonLabel = this.save.missions[goal.id] ? '완료' : goal.value >= goal.max ? '수령' : `${goal.value}/${goal.max}`;
        return `<article class="mission-card runtime-mission-card v950-mission-card v108-mission-card ${goal.event ? 'event' : ''} ${this.save.missions[goal.id] ? 'done' : goal.value >= goal.max ? 'ready' : ''}"><div><small>${goal.category}</small><strong>${goal.title}</strong><span>${goal.desc}</span></div><div class="v108-mission-progress" style="--p:${pct}%"><i></i><b>${pct}%</b></div><button class="runtime-btn cyan compact-cta btn-aqua-action" data-mission="${goal.id}">${buttonLabel}</button></article>`;
      }).join('')}</section>`;
    dom.app.appendChild(root);
    root.querySelector<HTMLButtonElement>('[data-go-map]')?.addEventListener('click', () => { void this.go('map'); });
    root.querySelectorAll<HTMLButtonElement>('[data-mission]').forEach((btn) => btn.addEventListener('click', () => this.tapMissionCard(btn.dataset.mission ?? '')));
    this.mountBottomNav(root, 'mission');
  }

  private renderRanking(): void {
    this.clear();
    const score = this.save.bestStreak * 1000 + this.save.totalSuccess * 120 + this.totalCaught() * 35;
    const caught = this.totalCaught();
    const linkedLabel = this.save.serverLinked ? '익명 서버 연동' : '로컬 테스트';
    const botRows = [
      { name: '코코 선장', tag: '연습봇', score: Math.max(420, score + 180), combo: Math.max(2, this.save.bestStreak + 1), catch: Math.max(5, caught + 4) },
      { name: '루루 낚시단', tag: '연습봇', score: Math.max(260, score - 90), combo: Math.max(1, this.save.bestStreak), catch: Math.max(3, caught + 1) },
      { name: '산호냥', tag: '연습봇', score: Math.max(180, score - 210), combo: Math.max(1, this.save.bestStreak - 1), catch: Math.max(2, caught) },
    ];
    const rows = [
      { name: this.playerName(), tag: linkedLabel, score, combo: this.save.bestStreak, catch: caught, me: true },
      ...botRows.map((row) => ({ ...row, me: false })),
    ].sort((a, b) => b.score - a.score).map((row, index) => ({ ...row, rank: index + 1 }));
    const root = this.createRuntimeMenuScreen('ranking', '랭킹', '내 실제 기록과 연습봇 기록을 간단히 비교합니다.');
    const content = root.querySelector<HTMLDivElement>('.runtime-content')!;
    content.innerHTML = `
      <section class="runtime-hero-card ranking-summary v108-ranking-summary">
        <img src="./assets/v91/icons/ranking.png" alt="" />
        <div><span class="runtime-eyebrow">TRAINING LEAGUE</span><h2>랭킹</h2><p>${linkedLabel} · 연습봇 포함 테스트 리그</p></div>
        <button class="runtime-btn cyan compact-cta btn-aqua-action" type="button" data-go-fishing>도전</button>
      </section>
      <section class="runtime-panel ranking-panel v108-ranking-panel">
        <div class="v108-ranking-list">${rows.map((row) => `<div class="v108-rank-row ${row.me ? 'me' : ''}"><b>#${row.rank}</b><strong>${row.name}</strong><span>${row.tag}</span><em>${row.score.toLocaleString('ko-KR')}점</em><i>${row.combo}콤보 · ${row.catch}마리</i></div>`).join('')}</div>
        <div class="ranking-stats-grid"><div><strong>${this.save.bestStreak}</strong><span>최고 콤보</span></div><div><strong>${this.save.totalSuccess}</strong><span>성공</span></div><div><strong>${caught}</strong><span>누적 포획</span></div><div><strong>${this.save.coins.toLocaleString('ko-KR')}</strong><span>골드</span></div></div>
        <p class="ranking-note">연습봇은 화면 밀도 확인용 가상 기록입니다. 내 기록은 실제 저장 데이터만 사용합니다.</p>
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
    const uniqueCaught = Object.keys(this.save.caught).filter((id) => (this.save.caught[id] ?? 0) > 0).length;
    if (this.save.totalSuccess >= 2) unlocked.add('deep');
    if (uniqueCaught >= 5) unlocked.add('palace');
    if (this.save.totalSuccess >= 8 || this.save.missions.stormUnlock) unlocked.add('glacier');
    if (this.save.totalSuccess >= 12 || this.save.missions.stormUnlock) unlocked.add('storm');
    if (this.save.bestStreak >= 4 || uniqueCaught >= 10) unlocked.add('dimension');
    if (uniqueCaught >= 14 || (this.save.mastery.river ?? 0) >= 6) unlocked.add('mangrove');
    if (this.save.bestStreak >= 6 || (this.save.mastery.dimension ?? 0) >= 4) unlocked.add('lunar');
    if (Object.values(this.save.missions).filter(Boolean).length >= 2 || this.save.totalSuccess >= 5) unlocked.add('reefFestival');
    this.save.unlockedRegions = Array.from(unlocked);
  }

  private playerLevel(): number {
    const uniqueCaught = Object.keys(this.save.caught).filter((id) => (this.save.caught[id] ?? 0) > 0).length;
    const totalCaught = this.totalCaught();
    const gearTotal = this.save.gear.rodLevel + this.save.gear.reelLevel + this.save.gear.lineLevel;
    const progress = this.save.totalSuccess * 2 + uniqueCaught * 3 + Math.floor(totalCaught / 4) + Math.max(0, gearTotal - 3);
    return Math.max(1, Math.min(99, 1 + Math.floor(progress / 12)));
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
    this.pixiLayer.innerHTML = `<div class="fallback-scene v11115-left-cast-scene" style="background-image:url('${region.bg}')"><img class="fallback-player" src="${ASSET.player}" alt="" /><img class="fallback-bobber" src="${ASSET.float}" alt="" /><div class="fallback-bite">!</div></div>`;
    this.createCastButton();
    this.stageHost.addEventListener('pointerdown', (ev) => {
      const target = ev.target as HTMLElement | null;
      if (target?.closest('.cast-button, .reel-panel, .fishing-hud, .recent-catch-strip, .fishing-loadout-strip')) return;
      if (this.state === 'idle') this.castLineFallback();
      else if (this.state === 'bite') {
        this.startReeling();
        this.holding = true;
        this.spawnTouchRing(ev.clientX, ev.clientY);
      } else if (this.state === 'reeling') { this.holding = true; this.spawnTouchRing(ev.clientX, ev.clientY); }
    });
    this.stageHost.addEventListener('pointerup', () => { if (this.state === 'reeling') this.holding = false; });
    this.stageHost.addEventListener('pointercancel', () => { if (this.state === 'reeling') this.holding = false; });
    this.stageHost.addEventListener('pointerleave', () => { if (this.state === 'reeling') this.holding = false; });
    this.stageHost.addEventListener('lostpointercapture', () => { if (this.state === 'reeling') this.holding = false; });
    if (this.fallbackTicker) window.clearInterval(this.fallbackTicker);
    this.fallbackTicker = window.setInterval(() => { if (this.fallbackMode) this.tick(); }, 1000 / 30);
    this.state = 'idle';
    this.setFishingPhase('idle');
    this.setHint('HTML 대체 렌더로 안정 실행 중입니다');
  }

  private castLineFallback(): void {
    if (this.state !== 'idle' || !this.castBtn) return;
    if (!this.canStartFishingCast()) return;
    playSound('cast');
    this.vibrate(12);
    this.save.totalCasts += 1;
    this.save.gear.lureStock -= 1;
    saveGame(this.save);
    this.syncFishingHud();
    this.activeFish = this.pickFish();
    void this.syncCatchSpriteTexture(this.activeFish);
    this.state = 'casting';
    this.setFishingPhase('casting');
    this.castBtn.classList.add('pop-out');
    if (this.comboNode) {
      this.comboNode.textContent = `연속 성공 x${Math.max(2, this.save.currentStreak)}`;
      this.comboNode.classList.toggle('hidden', this.save.currentStreak < 2);
    }
    this.spawnCastTrail();
    this.spawnActionBadge('퐁!', '찌를 던졌어요');
    this.stageHost?.classList.add('fallback-casting');
    this.setHint('찌가 수면으로 날아갑니다');
    window.setTimeout(() => this.castBtn?.classList.add('hidden'), 260);
    window.setTimeout(() => { this.stageHost?.classList.remove('fallback-casting'); this.spawnSplash(); this.scheduleBite(); }, 820);
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

  private installViewportSafeLock(): void {
    const sync = () => {
      const metrics = applyPortraitViewportMetrics();
      const root = document.documentElement;
      const vw = Math.max(1, Math.floor(window.visualViewport?.width ?? window.innerWidth));
      const vh = Math.max(1, Math.floor(window.visualViewport?.height ?? window.innerHeight));
      root.style.setProperty('--v117-viewport-width', `${vw}px`);
      root.style.setProperty('--v117-viewport-height', `${vh}px`);
      root.style.setProperty('--v117-app-width', `${Math.min(vw, metrics.appWidth)}px`);
      root.style.setProperty('--v117-app-height', `${Math.min(vh, metrics.appHeight)}px`);
      root.classList.toggle('v117-ultra-narrow', vw <= 360);
      root.classList.toggle('v117-tablet-portrait', vw >= 540 && vh >= vw);
      this.repairActiveViewportBounds();
    };
    sync();
    window.visualViewport?.addEventListener('resize', sync, { passive: true });
    window.visualViewport?.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync, { passive: true });
    window.addEventListener('orientationchange', sync, { passive: true });
    window.addEventListener('pageshow', sync, { passive: true });
  }


  private installLayoutQaSweep(): void {
    const sync = () => {
      const metrics = applyPortraitViewportMetrics();
      const root = document.documentElement;
      const vw = Math.max(1, Math.floor(window.visualViewport?.width ?? window.innerWidth));
      const vh = Math.max(1, Math.floor(window.visualViewport?.height ?? window.innerHeight));
      root.style.setProperty('--v118-visual-width', `${vw}px`);
      root.style.setProperty('--v118-visual-height', `${vh}px`);
      root.style.setProperty('--v118-app-width', `${Math.min(vw, metrics.appWidth)}px`);
      root.style.setProperty('--v118-app-height', `${Math.min(vh, metrics.appHeight)}px`);
      root.classList.toggle('v118-short-height', vh <= 640);
      root.classList.toggle('v118-ultra-narrow', vw <= 360);
      root.classList.toggle('v118-compact-menu', vw <= 390 || vh <= 680);
      this.repairActiveViewportBounds();
      this.repairInteractiveBounds();
    };
    sync();
    window.visualViewport?.addEventListener('resize', sync, { passive: true });
    window.visualViewport?.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync, { passive: true });
    window.addEventListener('orientationchange', sync, { passive: true });
    window.addEventListener('pageshow', sync, { passive: true });
    document.addEventListener('visibilitychange', sync, { passive: true });
  }

  private installInteractionQaPolish(): void {
    const sync = () => {
      const metrics = applyPortraitViewportMetrics();
      const root = document.documentElement;
      const viewport = window.visualViewport;
      const vw = Math.max(1, Math.floor(viewport?.width ?? window.innerWidth));
      const vh = Math.max(1, Math.floor(viewport?.height ?? window.innerHeight));
      const offsetLeft = Math.max(0, Math.floor(viewport?.offsetLeft ?? 0));
      const offsetTop = Math.max(0, Math.floor(viewport?.offsetTop ?? 0));
      const appWidth = Math.min(vw, metrics.appWidth);
      const appHeight = Math.min(vh, metrics.appHeight);
      root.style.setProperty('--v119-visual-left', `${offsetLeft}px`);
      root.style.setProperty('--v119-visual-top', `${offsetTop}px`);
      root.style.setProperty('--v119-visual-width', `${vw}px`);
      root.style.setProperty('--v119-visual-height', `${vh}px`);
      root.style.setProperty('--v119-app-width', `${appWidth}px`);
      root.style.setProperty('--v119-app-height', `${appHeight}px`);
      root.style.setProperty('--v119-edge-left', 'max(4px, env(safe-area-inset-left))');
      root.style.setProperty('--v119-edge-right', 'max(4px, env(safe-area-inset-right))');
      root.classList.toggle('v119-ultra-narrow', vw <= 360);
      root.classList.toggle('v119-compact-height', vh <= 680);
      root.classList.toggle('v119-short-height', vh <= 620);
      root.classList.toggle('v119-keyboard-safe', Math.max(0, window.innerHeight - vh) > 120);
      root.classList.toggle('v119-tablet-portrait', vw >= 540 && vh >= vw);
      this.repairActiveViewportBounds();
      this.repairInteractiveBounds();
      this.repairFixedInteractiveBounds();
    };
    sync();
    window.visualViewport?.addEventListener('resize', sync, { passive: true });
    window.visualViewport?.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync, { passive: true });
    window.addEventListener('orientationchange', sync, { passive: true });
    window.addEventListener('pageshow', sync, { passive: true });
    document.addEventListener('visibilitychange', sync, { passive: true });
  }

  private repairFixedInteractiveBounds(): void {
    const appRect = dom.app.getBoundingClientRect();
    if (!appRect.width || !appRect.height) return;
    const nodes = dom.app.querySelectorAll<HTMLElement>('.bottom-nav, .fishing-hud, .recent-catch-strip, .reel-panel, .catch-result-card, .bite-callout, .action-badge');
    let repaired = false;
    nodes.forEach((node) => {
      const rect = node.getBoundingClientRect();
      const outsideX = rect.width > appRect.width + 1 || rect.left < appRect.left - 1 || rect.right > appRect.right + 1;
      const outsideY = rect.top < appRect.top - 1 || rect.bottom > appRect.bottom + 1;
      const tooLarge = rect.height > appRect.height - 2;
      const needsRepair = outsideX || outsideY || tooLarge;
      node.classList.toggle('v1119-fixed-bounds-repaired', needsRepair);
      repaired ||= needsRepair;
    });
    document.documentElement.classList.toggle('v119-fixed-bounds-emergency', repaired);
  }


  private repairInteractiveBounds(): void {
    const appRect = dom.app.getBoundingClientRect();
    if (!appRect.width) return;
    const nodes = dom.app.querySelectorAll<HTMLElement>('.runtime-hud, .runtime-content, .runtime-panel, .runtime-hero-card, .ranking-panel, .bottom-nav, .fishing-hud, .recent-catch-strip, .reel-panel, .catch-result-card');
    let repaired = false;
    nodes.forEach((node) => {
      const rect = node.getBoundingClientRect();
      const tooWide = rect.width > appRect.width + 1 || rect.left < appRect.left - 1 || rect.right > appRect.right + 1;
      node.classList.toggle('v1118-bounds-repaired', tooWide);
      repaired ||= tooWide;
    });
    document.documentElement.classList.toggle('v118-interactive-bounds-emergency', repaired);
  }

  private applyViewportSafeGuards(root: HTMLElement, nav?: HTMLElement): void {
    root.classList.add('v1117-viewport-safe-screen', 'v1118-layout-qa-screen', 'v1119-interaction-qa-screen');
    const repair = () => {
      this.repairScreenBounds(root);
      if (nav) this.repairBottomNavBounds(nav);
    };
    window.requestAnimationFrame(repair);
    window.setTimeout(repair, 80);
    window.setTimeout(repair, 260);
  }

  private repairActiveViewportBounds(): void {
    const screen = dom.app.querySelector<HTMLElement>('.game-screen, .login-screen');
    const nav = document.querySelector<HTMLElement>('.bottom-nav');
    if (screen) this.repairScreenBounds(screen);
    if (nav) this.repairBottomNavBounds(nav);
  }

  private repairScreenBounds(root: HTMLElement): void {
    const appRect = dom.app.getBoundingClientRect();
    const rect = root.getBoundingClientRect();
    const tooWide = rect.width > appRect.width + 1 || rect.left < appRect.left - 1 || rect.right > appRect.right + 1;
    root.classList.toggle('v1117-bounds-repaired', tooWide);
    if (!tooWide) return;
    root.style.setProperty('width', '100%', 'important');
    root.style.setProperty('max-width', '100%', 'important');
    root.style.setProperty('min-width', '0', 'important');
    root.style.setProperty('left', '0', 'important');
    root.style.setProperty('right', '0', 'important');
    root.style.setProperty('margin-left', '0', 'important');
    root.style.setProperty('margin-right', '0', 'important');
    root.style.setProperty('overflow-x', 'hidden', 'important');
    root.style.setProperty('transform', 'none', 'important');
    root.style.setProperty('translate', 'none', 'important');
  }

  private repairBottomNavBounds(nav: HTMLElement): void {
    nav.classList.add('v1117-nav-safe', 'v1118-nav-safe', 'v1119-nav-safe');
    if (nav.classList.contains('v208-right-dock-nav')) {
      nav.style.setProperty('left', 'auto', 'important');
      nav.style.setProperty('right', 'var(--v2016-dock-right, var(--v2014-dock-right, var(--v2013-dock-right, max(10px, env(safe-area-inset-right))))))', 'important');
      nav.style.setProperty('bottom', 'var(--v2016-dock-bottom, var(--v2014-dock-bottom, var(--v2013-dock-bottom, calc(max(14px, env(safe-area-inset-bottom)) + 6px)))))', 'important');
      nav.style.setProperty('width', 'auto', 'important');
      nav.style.setProperty('max-width', 'calc(100vw - 16px)', 'important');
      nav.style.setProperty('min-width', '0', 'important');
      nav.style.setProperty('margin', '0', 'important');
      nav.style.setProperty('transform', 'none', 'important');
      nav.style.setProperty('translate', 'none', 'important');
      nav.style.setProperty('overflow', 'visible', 'important');
      nav.style.setProperty('display', 'grid', 'important');
      nav.style.setProperty('grid-template-columns', 'repeat(3, var(--v2016-dock-button, var(--v2014-dock-button, var(--v2013-dock-button, 50px))))', 'important');
      nav.style.setProperty('grid-template-rows', 'repeat(2, var(--v2016-dock-button, var(--v2014-dock-button, var(--v2013-dock-button, 50px))))', 'important');
      nav.style.setProperty('gap', 'var(--v2016-dock-gap, var(--v2014-dock-gap, var(--v2013-dock-gap, 4px))))', 'important');
      nav.style.setProperty('padding', '0', 'important');
      nav.style.setProperty('background', 'transparent', 'important');
      nav.style.setProperty('background-image', 'none', 'important');
      nav.style.setProperty('box-shadow', 'none', 'important');
      nav.style.setProperty('border', '0', 'important');
      nav.style.setProperty('outline', '0', 'important');
      document.documentElement.classList.remove('v117-nav-bounds-emergency');
      nav.classList.remove('v1117-nav-repaired');
      return;
    }
    const appRect = dom.app.getBoundingClientRect();
    const rect = nav.getBoundingClientRect();
    const tooWide = rect.width > appRect.width + 1 || rect.left < appRect.left - 1 || rect.right > appRect.right + 1;
    document.documentElement.classList.toggle('v117-nav-bounds-emergency', tooWide);
    nav.classList.toggle('v1117-nav-repaired', tooWide);
    if (!tooWide) return;
    nav.style.setProperty('left', 'calc(var(--v119-visual-left, 0px) + ((var(--v119-visual-width, var(--v118-visual-width, 100vw)) - var(--v119-app-width, var(--v118-app-width, 100vw))) / 2) + var(--v119-edge-left, 4px))', 'important');
    nav.style.setProperty('right', 'auto', 'important');
    nav.style.setProperty('width', 'max(0px, calc(var(--v119-app-width, var(--v118-app-width, 100vw)) - var(--v119-edge-left, 4px) - var(--v119-edge-right, 4px))))', 'important');
    nav.style.setProperty('max-width', 'max(0px, calc(var(--v119-app-width, var(--v118-app-width, 100vw)) - var(--v119-edge-left, 4px) - var(--v119-edge-right, 4px))))', 'important');
    nav.style.setProperty('min-width', '0', 'important');
    nav.style.setProperty('margin', '0', 'important');
    nav.style.setProperty('transform', 'none', 'important');
    nav.style.setProperty('translate', 'none', 'important');
    nav.style.setProperty('overflow', 'hidden', 'important');
  }

  private installTechPerfCompatPass(): void {
    const sync = () => {
      const metrics = applyPortraitViewportMetrics();
      const root = document.documentElement;
      const viewport = window.visualViewport;
      const vw = Math.max(1, Math.floor(viewport?.width ?? window.innerWidth));
      const vh = Math.max(1, Math.floor(viewport?.height ?? window.innerHeight));
      const appWidth = Math.min(vw, metrics.appWidth);
      const appHeight = Math.min(vh, metrics.appHeight);
      root.style.setProperty('--v1111-visual-width', `${vw}px`);
      root.style.setProperty('--v1111-visual-height', `${vh}px`);
      root.style.setProperty('--v1111-app-width', `${appWidth}px`);
      root.style.setProperty('--v1111-app-height', `${appHeight}px`);
      root.classList.toggle('v1111-low-memory', ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4) <= 2);
      root.classList.toggle('v1111-save-data', Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData));
      root.classList.toggle('v1111-touch-coarse', window.matchMedia('(pointer: coarse)').matches);
      this.repairActiveViewportBounds();
      this.repairInteractiveBounds();
      this.repairFixedInteractiveBounds();
    };
    sync();
    window.addEventListener('aqua-runtime-quality-change', ((event: Event) => {
      const detail = (event as CustomEvent<{ tier: RuntimeQualityTier }>).detail;
      const tier = detail?.tier ?? this.quality.tier();
      this.compact = tier === 'lite' || window.matchMedia('(max-width: 420px), (prefers-reduced-motion: reduce)').matches || (navigator.hardwareConcurrency ?? 8) <= 4;
      document.documentElement.classList.toggle('perf-lite', this.compact);
      this.webglLayers.forEach((layer) => layer.setQuality(tier, this.compact));
      this.resizePixi();
    }) as EventListener, { passive: true });
    const stopInteraction = () => {
      this.holding = false;
      this.stageHost?.classList.remove('camera-shake', 'surge-alert', 'guard-active');
    };
    window.visualViewport?.addEventListener('resize', sync, { passive: true });
    window.visualViewport?.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync, { passive: true });
    window.addEventListener('orientationchange', sync, { passive: true });
    window.addEventListener('pageshow', sync, { passive: true });
    window.addEventListener('blur', stopInteraction, { passive: true });
    window.addEventListener('pagehide', stopInteraction, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') stopInteraction();
      else sync();
    }, { passive: true });
  }


  private installContentFlowEngineQaPass(): void {
    const sync = () => {
      const metrics = applyPortraitViewportMetrics();
      const root = document.documentElement;
      const viewport = window.visualViewport;
      const vw = Math.max(1, Math.floor(viewport?.width ?? window.innerWidth));
      const vh = Math.max(1, Math.floor(viewport?.height ?? window.innerHeight));
      const appWidth = Math.min(vw, metrics.appWidth);
      const appHeight = Math.min(vh, metrics.appHeight);
      root.style.setProperty('--v1112-visual-width', `${vw}px`);
      root.style.setProperty('--v1112-visual-height', `${vh}px`);
      root.style.setProperty('--v1112-app-width', `${appWidth}px`);
      root.style.setProperty('--v1112-app-height', `${appHeight}px`);
      root.classList.toggle('v1112-ultra-narrow', vw <= 360);
      root.classList.toggle('v1112-short-height', vh <= 640);
      root.classList.toggle('v1112-reduced-motion', window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      this.repairActiveViewportBounds();
      this.repairInteractiveBounds();
      this.repairFixedInteractiveBounds();
      this.repairScrollableContentFlow();
    };
    sync();
    window.visualViewport?.addEventListener('resize', sync, { passive: true });
    window.visualViewport?.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync, { passive: true });
    window.addEventListener('orientationchange', sync, { passive: true });
    window.addEventListener('pageshow', sync, { passive: true });
    document.addEventListener('visibilitychange', sync, { passive: true });
  }

  private scheduleContentFlowRepair(root?: HTMLElement): void {
    const run = () => this.repairScrollableContentFlow(root);
    window.requestAnimationFrame(run);
    window.setTimeout(run, 90);
    window.setTimeout(run, 320);
  }

  private repairScrollableContentFlow(root = dom.app.querySelector<HTMLElement>('.runtime-menu-screen')): void {
    const nav = document.querySelector<HTMLElement>('.bottom-nav');
    const appRect = dom.app.getBoundingClientRect();
    const navRect = nav?.getBoundingClientRect();
    const navHeight = Math.max(0, Math.ceil(navRect?.height ?? 0));
    const navGap = Math.max(10, Math.ceil(appRect.bottom - (navRect?.top ?? appRect.bottom)) + 10);
    document.documentElement.style.setProperty('--v1112-nav-height', `${navHeight}px`);
    document.documentElement.style.setProperty('--v1112-scroll-bottom-space', `${navGap}px`);
    if (!root) return;
    const overflow = root.scrollHeight > root.clientHeight + 4;
    root.classList.toggle('v1112-scrollable-content', overflow);
    root.classList.add('v1112-content-flow-ready');
    const content = root.querySelector<HTMLElement>('.runtime-content');
    if (content) {
      content.classList.toggle('v1112-content-overflows', content.scrollHeight > content.clientHeight + 4 || overflow);
    }
  }


  private preloadCriticalImages(): void {
    const critical = [ASSET.homeBg, './assets/v1110/home/village_islands_user_bg.webp', './assets/v1110/home/village_islands_user_bg.png', ASSET.homeBanner, ASSET.player, ASSET.float, './assets/v91/characters/chibi_fisher_face_icon.png'];
    critical.forEach((src) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = src;
      void img.decode?.().catch(() => undefined);
    });
  }

  private scheduleDetailStabilityRepair(root?: HTMLElement): void {
    const run = () => this.repairDetailStability(root);
    window.requestAnimationFrame(run);
    window.setTimeout(run, 120);
    window.setTimeout(run, 420);
  }

  private repairDetailStability(root = dom.app.querySelector<HTMLElement>('.runtime-menu-screen, .fishing-screen')): void {
    const html = document.documentElement;
    const viewport = window.visualViewport;
    const metrics = applyPortraitViewportMetrics();
    const vw = Math.max(1, Math.floor(viewport?.width ?? window.innerWidth));
    const vh = Math.max(1, Math.floor(viewport?.height ?? window.innerHeight));
    const appWidth = Math.min(vw, metrics.appWidth);
    const appHeight = Math.min(vh, metrics.appHeight);
    html.style.setProperty('--v11113-visual-width', `${vw}px`);
    html.style.setProperty('--v11113-visual-height', `${vh}px`);
    html.style.setProperty('--v11113-visual-left', `${Math.floor(viewport?.offsetLeft ?? 0)}px`);
    html.style.setProperty('--v11113-visual-top', `${Math.floor(viewport?.offsetTop ?? 0)}px`);
    html.style.setProperty('--v11113-app-width', `${appWidth}px`);
    html.style.setProperty('--v11113-app-height', `${appHeight}px`);
    html.classList.toggle('v11113-ultra-narrow', vw <= 360);
    html.classList.toggle('v11113-short-height', vh <= 640);
    html.classList.toggle('v11113-keyboard-visible', vh < window.innerHeight * 0.78);
    if (root) root.classList.add('v11113-detail-stability-ready');
    this.repairImageFallbacks(root ?? dom.app);
    this.repairActiveViewportBounds();
    this.repairInteractiveBounds();
    this.repairFixedInteractiveBounds();
    this.repairScrollableContentFlow(root?.classList.contains('runtime-menu-screen') ? root : undefined);
  }

  private repairImageFallbacks(root: ParentNode = dom.app): void {
    root.querySelectorAll<HTMLImageElement>('img:not([data-v11113-img-guard])').forEach((img) => {
      img.dataset.v11113ImgGuard = 'true';
      img.draggable = false;
      img.decoding = img.decoding || 'async';
      img.addEventListener('error', () => {
        if (img.dataset.v11113FallbackApplied === 'true') return;
        img.dataset.v11113FallbackApplied = 'true';
        const fallback = img.closest('.dex-card, .runtime-dex-card') ? './assets/v85/fish/fish_unknown.png'
          : img.closest('.runtime-hud, .runtime-hero-card') ? './assets/v91/characters/chibi_fisher_face_icon.png'
          : './assets/art/fish_slot.png';
        img.src = fallback;
      }, { passive: true });
    });
  }

  private installDetailStabilityQaPass(): void {
    let raf = 0;
    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        this.repairDetailStability();
      });
    };
    schedule();
    window.visualViewport?.addEventListener('resize', schedule, { passive: true });
    window.visualViewport?.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('orientationchange', schedule, { passive: true });
    window.addEventListener('pageshow', schedule, { passive: true });
    document.addEventListener('visibilitychange', schedule, { passive: true });
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
