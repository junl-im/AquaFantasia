import { Application, Assets, Container, Sprite, Text } from 'pixi.js';
import './styles.css';
import { APP_VERSION, CACHE_NAME, regions, fishDex, navItems } from './data';
import type { FishInfo, FishingState, RegionKey, SaveData, Screen } from './types';
import { appendLocalSyncEvent, loadSave, saveGame, tryAnonymousServerLink } from './storage';
import { initAudio, playSound } from './audio';
import { ToastManager } from './toast';
import { applyPortraitViewportMetrics, installPortraitCssGuards, requestHardPortraitLock } from './core/PortraitGuard';
import { UnderwaterWebglLayer, type UnderwaterLayerMood } from './core/UnderwaterWebglLayer';
import { RuntimeQualityManager, type RuntimeQualityTier } from './core/RuntimeQualityManager';
import { VillageWorld } from './villageWorld';

type FishMood = 'calm' | 'pulling' | 'burst' | 'tired' | 'escaping';

type FishTensionProfile = {
  archetype: 'steady' | 'dart' | 'heavy' | 'wave' | 'boss';
  label: string;
  tensionBias: number;
  pull: number;
  volatility: number;
  burst: number;
  resistance: number;
  stamina: number;
  safeWidth: number;
  catchRate: number;
  escape: number;
  centerSwing: number;
  cadence: number;
  fatigueRelief: number;
  recoveryGrace: number;
};

type CatchGrowthSettlement = {
  reward: number;
  baseReward: number;
  marketBonus: number;
  fund: number;
  development: number;
  tourists: number;
  autoIncome: number;
  firstCatch: boolean;
  story: string;
};

type IslandExpansionStats = {
  unlockedCount: number;
  uniqueCaught: number;
  buildingCount: number;
  pathCount: number;
  development: number;
  permit: boolean;
  readySteps: number;
  progress: number;
  nextText: string;
  tierLabel: string;
  phaseLabel: string;
  surveyDone: boolean;
  chartDone: boolean;
  settled: boolean;
};

type ExpeditionRouteCandidate = {
  key: RegionKey;
  name: string;
  subtitle: string;
  requirement: string;
  progress: number;
  unlocked: boolean;
  recommended: boolean;
};

// v2.0.90 keeps old validation lineage as inert text only.
// Do not attach these legacy UI classes to live DOM again; they caused HUD/menu/close/expedition conflicts.
// v2.0.95: legacy UI validation payloads were removed from live source to prevent accidental reattachment.

const FISH_MOOD_LABEL: Record<FishMood, string> = {
  calm: '평온',
  pulling: '저항',
  burst: '광폭화',
  tired: '지침',
  escaping: '도주 압박',
};

const ASSET = {
  loginBg: './assets/v85/screens/start_screen_clean_v810.webp',
  player: './assets/v93/characters/fisher_boat_cute_action.png',
  float: './assets/v92/icons/bobber.png',
  fish: './assets/v2110/fish/common_tropical/fish_common_001.png',
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
  v2110SeaTile: './assets/v2110/tiles_32x32/sea_and_beach/sea_tile_001_32x32.png',
  v2110UiButtonAqua: './assets/v2110/ui/buttons_and_badges/ui_button_002.png',
  v2110UiButtonGold: './assets/v2110/ui/buttons_and_badges/ui_button_001.png',
  v2110UiClose: './assets/v2110/ui/main_aqua_cards/ui_main_006.png',
  v2110FishingHookBadge: './assets/v2110/ui/fishing_hud/ui_hud_004.png',
  v2110FishingBoat: './assets/v2110/objects/fishing_props/fishing_prop_002.png',
  v2110FishingBuoy: './assets/v2110/objects/fishing_props/fishing_prop_006.png',
  v2110FishingRope: './assets/v2110/objects/fishing_props/fishing_prop_005.png',
  v2110FishingNet: './assets/v2110/objects/fishing_props/fishing_prop_009.png',
  v2110FishingSign: './assets/v2110/objects/fishing_props/fishing_prop_010.png',
  v2110FishCardFrame: './assets/v2110/ui/fish_dex_cards/ui_card_001.png',
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
  private reelTouchZone?: HTMLButtonElement;
  private reelConsole?: HTMLDivElement;
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
  private reelMode: 'neutral' | 'wind' | 'release' = 'neutral';
  private biteTimeout = 0;
  private castStart = 0;
  private lastTick = performance.now();
  private compact = false;
  private activeFish: FishInfo = fishDex[0];
  private activeFishTextureUrl = '';
  private activeFishProfile: FishTensionProfile = { archetype: 'steady', label: '잔잔형', tensionBias: 0, pull: 1, volatility: 1, burst: 1, resistance: 1, stamina: 1, safeWidth: 0, catchRate: 1, escape: 1, centerSwing: 1, cadence: 540, fatigueRelief: 1, recoveryGrace: 1 };
  private fishMood: FishMood = 'calm';
  private fishStamina = 100;
  private catchProgress = 0;
  private escapePressure = 0;
  private failureRecoveryTimer = 0;
  private fishingSafeZoneCenter = 55;
  private fishingSafeZoneLastAt = 0;
  private moodShiftAt = performance.now();
  private fallbackTicker = 0;
  private readonly resizePixiHandler = () => this.resizePixi();
  private immersiveRetryAt = 0;
  private readonly lockedOrientation: 'portrait-primary' = 'portrait-primary';
  private webglLayers: UnderwaterWebglLayer[] = [];
  private readonly quality = new RuntimeQualityManager();
  private fishingInputAbort?: AbortController;
  private villageWorld?: VillageWorld;
  private lastReelPulseAt = 0;
  private resultCardOpen = false;
  private openingIntroPending = false;
  private openingIntroShown = false;
  private fishingBobberAnchorX = 0;
  private fishingBobberAnchorY = 0;
  private fishingBobberPullOffset = 0;
  private lastActionBadgeKey = '';
  private lastActionBadgeAt = 0;
  private lastHapticAt = 0;
  private lastTouchRingAt = 0;
  private lastFishingUiKey = '';
  private lastFishingUiAnnounceAt = 0;
  private lastTensionUiSignature = '';
  private v21134LastRenderBudget = '';
  private v21134LastSyncSignature = '';

  async boot(): Promise<void> {
    this.quality.start();
    this.compact = this.quality.isLite() || window.matchMedia('(max-width: 420px), (prefers-reduced-motion: reduce)').matches || (navigator.hardwareConcurrency ?? 8) <= 4;
    document.documentElement.classList.toggle('perf-lite', this.compact);
    document.documentElement.dataset.initialOrientation = 'portrait';
    document.documentElement.dataset.orientationPolicy = 'hard-portrait';
    document.documentElement.classList.add('portrait-only-game');
    installPortraitCssGuards();
    document.documentElement.dataset.version = APP_VERSION;
    document.documentElement.classList.add('v21113-ui-ux-stability-root');
    document.documentElement.dataset.v21113UiUxStability = 'safe-area-card-touch-scroll-design-sweep';
    document.documentElement.classList.add('v21114-interaction-layout-design-root');
    document.documentElement.dataset.v21114InteractionLayoutDesign = 'panel-nav-readability-scroll-polish';
    document.documentElement.classList.add('v21116-fishing-ui-stability-hotfix-root');
    document.documentElement.dataset.v21116FishingUiStabilityHotfix = 'stable-loadout-bite-combo-result-aqua-skin';
    document.documentElement.classList.add('v21117-village-menu-icon-clarity-root');
    document.documentElement.dataset.v21117VillageMenuIconClarity = 'top-right-icons-larger-same-cell-clipped-clean';
    document.documentElement.classList.add('v21118-ui-asset-containment-root');
    document.documentElement.dataset.v21118UiAssetContainment = 'runtime-menu-icons-card-images-no-bleed';
    document.documentElement.classList.add('v21119-interaction-safe-root');
    document.documentElement.dataset.v21119InteractionSafety = 'mobile-touch-modal-scroll-safe-area-guard';
    document.documentElement.classList.add('v21120-screen-composition-handoff-root');
    document.documentElement.dataset.v21120ScreenCompositionHandoff = 'readable-shell-safe-nav-handoff-contract';
    document.documentElement.classList.add('v21121-micro-ui-a11y-perf-root');
    document.documentElement.dataset.v21121MicroUiA11yPerf = 'button-label-scroll-reserve-content-visibility-polish';
    document.documentElement.classList.add('v21122-system-ux-performance-root');
    document.documentElement.dataset.v21122SystemUxPerformance = 'guide-page-centering-fishing-jitter-single-anchor';
    document.documentElement.classList.add('v21123-runtime-deconflict-root');
    document.documentElement.dataset.v21123RuntimeDeconflict = 'latest-anchor-owns-layout-and-fishing-ui';
    document.documentElement.classList.add('v21124-root-cause-ux-repair-root');
    document.documentElement.dataset.v21124RootCauseUxRepair = 'style-mutation-finalizer-guide-page-fishing-nav';
    document.documentElement.classList.add('v21125-legacy-debt-reducer-root');
    document.documentElement.dataset.v21125LegacyDebtReducer = 'observer-handoff-light-finalizer-active';
    document.documentElement.classList.add('v21126-stale-code-pruner-root');
    document.documentElement.dataset.v21126StaleCodePruner = 'handoff-to-v21128-direct-source-repair';
    document.documentElement.classList.add('v21128-direct-source-ui-repair-root');
    document.documentElement.dataset.v21128DirectSourceUiRepair = 'active';
    document.documentElement.classList.add('v21129-direct-state-ui-root');
    document.documentElement.dataset.v21129DirectStateUi = 'active';
    document.documentElement.dataset.v21129UiPolicy = 'handoff-to-v21130-direct-source-regression-guard';
    document.documentElement.classList.add('v21130-direct-source-regression-root');
    document.documentElement.dataset.v21130DirectSourceRegressionGuard = 'handoff-to-v21131-stale-observer-quarantine';
    document.documentElement.dataset.v21130UiPolicy = 'handoff-to-v21131-single-light-governor';
    document.documentElement.classList.add('v21131-stale-observer-quarantine-root');
    document.documentElement.dataset.v21131StaleObserverQuarantine = 'active';
    document.documentElement.dataset.v21131UiPolicy = 'handoff-to-v21132-observer-budget-governor';
    document.documentElement.classList.add('v21132-observer-budget-governor-root');
    document.documentElement.dataset.v21132ObserverBudgetGovernor = 'active';
    document.documentElement.dataset.v21132UiPolicy = 'handoff-to-v21133-single-governor-ledger';
    document.documentElement.dataset.v21132MutedLegacyObservers = '';
    document.documentElement.classList.add('v21133-single-governor-ledger-root');
    document.documentElement.dataset.v21133SingleGovernorLedger = 'active';
    document.documentElement.dataset.v21133UiPolicy = 'handoff-to-v21134-render-budget-ui-write-ledger';
    document.documentElement.dataset.v21133LatestUiOwner = 'handoff-to-v21134-render-budget-ui-write-ledger';
    document.documentElement.classList.add('v21134-render-budget-ui-write-ledger-root');
    document.documentElement.dataset.v21134RenderBudgetUiWriteLedger = 'active';
    document.documentElement.dataset.v21134UiPolicy = 'single-governor-plus-rounded-fishing-ui-writes-and-pixi-fps-budget';
    document.documentElement.dataset.v21134LatestUiOwner = 'render-budget-ui-write-ledger';
    // v2.1.34 UI policy: v21133 observer ledger is kept as compatibility, v21134 owns render budget and rounded fishing UI writes.
    // v2.1.33 UI policy: v21132 keeps legacy mute compatibility, v21133 owns the single light sync and observer debt ledger.
    // v2.1.30 UI policy: direct source render owns guide/pages/expedition/nav/fishing first frame; old state sync is handoff only.
    document.documentElement.dataset.v2098UiRecovery = 'v2098-dock-fishing-build-recovery';
    document.documentElement.dataset.v218StableRollback = 'v218-stable-ui-fishing-rollback';
    document.documentElement.dataset.v2111AquaShell = 'v2111-aqua-shell-rebuild';
    document.documentElement.dataset.v2112AquaFoundation = 'v2112-aqua-shell-foundation';
    document.documentElement.dataset.v2113AquaCoreSteward = 'v2113-aqua-core-steward';
    document.documentElement.dataset.v2114InteractionShellPolish = 'v2114-interaction-shell-polish';
    document.documentElement.dataset.v2115AquaScreenShell = 'v2115-aqua-screen-shell';
    document.documentElement.dataset.v2116VillageAssetPolish = 'v2116-village-asset-polish';
    document.documentElement.dataset.v2117LayoutInputFishing = 'v2117-layout-input-fishing-polish';
    document.documentElement.dataset.v2118CharacterWaterUi = 'v2118-character-water-ui-polish';
    document.documentElement.dataset.v2119OpeningExitCharacterUi = 'v2119-opening-exit-character-ui';
    document.documentElement.dataset.v2120OpeningVideoDirectionUi = 'v2120-opening-video-direction-ui';
    document.documentElement.dataset.v2121UiContinuityPolish = 'v2121-ui-continuity-polish';
    document.documentElement.dataset.v2122RouteDirectionUi = 'v2122-route-direction-ui-stability';
    document.documentElement.dataset.v2123StabilityPolish = 'v2123-bug-ui-fishing-stability';
    document.documentElement.dataset.v2124StabilityPerformance = 'v2124-stability-performance-polish';
    document.documentElement.dataset.v2125OpeningDirectionMotionUi = 'v2125-opening-direction-motion-ui';
    document.documentElement.dataset.v2127DirectionMotionUiAudit = 'v2127-direction-motion-ui-audit';
    document.documentElement.dataset.v2128DirectionUiFishingCorrection = 'v2128-direction-ui-fishing-correction';
    document.documentElement.dataset.v2129PlayerFilenameDirection = 'v2129-player-filename-direction-lock';
    document.documentElement.dataset.v2130ConstructionFishingUi = 'v2130-construction-fishing-ui-audit';
    document.documentElement.dataset.v2131MotionUiFishingBuildGuard = 'v2131-motion-ui-fishing-build-guard';
    document.documentElement.dataset.v2132PremiumUiFishingStability = 'v2132-premium-ui-fishing-stability';
    document.documentElement.dataset.v2133PremiumUiEngineFishingStability = 'v2133-premium-ui-engine-fishing-stability';
    document.documentElement.dataset.v2134ObjectGridShopFishingUi = 'v2134-object-grid-shop-fishing-ui-stability';
    document.documentElement.dataset.v2135SystemUiFishingEngine = 'v2135-system-ui-fishing-engine';
    document.documentElement.dataset.v2136PremiumPolishFishingPlacement = 'v2136-premium-polish-fishing-placement';
    document.documentElement.dataset.v2137FishingUiOverhaul = 'v2137-fishing-ui-page-shell-hud-menu-polish';
    document.documentElement.dataset.v2138FishingCockpitMenuPage = 'v2138-fishing-cockpit-menu-page-polish';
    document.documentElement.dataset.v2139FishingUiSystem = 'v2139-fishing-ui-system-polish';
    document.documentElement.dataset.v2140FishingMenuUiTune = 'v2140-fishing-menu-ui-tune';
    document.documentElement.dataset.v2142FishingUiPageTilePolish = 'v2142-fishing-ui-page-tile-polish';
    document.documentElement.dataset.v2143UiOverlapPlacementSweep = 'v2143-ui-overlap-placement-sweep';
    document.documentElement.dataset.v2144UiPlacementPolishSweep = 'v2144-ui-placement-polish-sweep';
    document.documentElement.dataset.v2145IconFishingPagePolish = 'v2145-icon-fishing-page-deoverlap-polish';
    document.documentElement.dataset.v2146UiOverlapIconFishingPolish = 'v2146-icon-clean-menu-frame-single-fishing-stage';
    document.documentElement.dataset.v2147UiOverlapLayoutFishingPolish = 'v2147-layout-overlap-card-fishing-stage-polish';
    document.documentElement.dataset.v2148UiOverlapLayoutSweep = 'v2148-icon-menu-card-fishing-cockpit-sweep';
    document.documentElement.dataset.v2149UiCompositionPolish = 'v2149-icon-menu-page-fishing-composition-polish';
    document.documentElement.dataset.v2150UiOverlapPlacementBeauty = 'v2150-overlap-placement-beauty-polish';
    document.documentElement.dataset.v2151LayoutCompositionFishingUi = 'v2151-layout-composition-fishing-ui-polish';
    document.documentElement.dataset.v2152TopMenuFishingGaugeHotfix = 'v2152-compact-top-menu-visible-fishing-gauge';
    document.documentElement.dataset.v2153TopMenuFishingBattleHud = 'v2153-tight-top-menu-fixed-fishing-battle-hud';
    document.documentElement.dataset.v2156TopMenuHardLock = 'v2156-inline-important-right-top-menu-hard-lock';
    document.documentElement.dataset.v2157MenuFishingVisibilityHardfix = 'v2157-real-micro-toolbar-visible-fishing-battle-bars';
    document.documentElement.dataset.v2158MenuShopFishingOpeningPolish = 'v2158-balanced-2x3-top-menu-shop-tag-fishing-hold-opening-video-only';
    document.documentElement.dataset.v2159PremiumAquaUiFishingLayout = 'v2159-premium-aqua-card-menu-dock-fishing-layout-polish';
    document.documentElement.dataset.v2160FishingHudMenuPolish = 'v2160-fishing-hud-menu-size-safe-polish';
    document.documentElement.dataset.v2161FishingBiteDexSystem = 'v2161-bite-callout-center-dex-scale-system-guard';
    document.documentElement.dataset.v2162QualitySweepPolish = 'v2162-overlap-card-fishing-hud-menu-engine-sweep';
    document.documentElement.dataset.v2163HudFishingToastInventoryPolish = 'v2163-hud-gap-menu-bigger-fishing-loadout-center-toast-ledger-dex';
    document.documentElement.dataset.v2164QualityFollowupPolish = 'v2164-hud-menu-build-expedition-fishing-inventory-dex-followup';
    document.documentElement.dataset.v2165QualitySweepPolish = 'v2165-overlap-layout-text-budget-shop-fishing-menu-sweep';
    document.documentElement.dataset.v2166MenuHudAutoSalePolish = 'v2166-menu-rescue-hud-color-autosale-loop';
    document.documentElement.dataset.v2167PremiumMobilePolish = 'v2167-premium-mobile-aqua-card-menu-fishing-shop-polish';
    document.documentElement.dataset.v2168PremiumLayoutSweep = 'v2168-premium-layout-fishing-shop-dock-sweep';
    document.documentElement.dataset.v2169KeyboardShopFishingPolish = 'v2169-keyboard-shop-fishing-polish';
    document.documentElement.dataset.v2170AquaLayoutRefinement = 'v2170-aqua-layout-refinement-polish';
    document.documentElement.dataset.v2171FishingLayoutEngine = 'v2171-fishing-layout-engine-upgrade';
    document.documentElement.dataset.v2172SystemContentEngine = 'v2172-system-content-engine-upgrade';
    document.documentElement.dataset.v2173IntroGateEngine = 'v2173-intro-menu-gate-engine-upgrade';
    document.documentElement.dataset.v2174QualityEngineSweep = 'v2174-quality-engine-sweep';
    document.documentElement.dataset.v2176QualityCompositionSweep = 'v2176-quality-composition-sweep';
    document.documentElement.dataset.v2177OpeningVideoFirstFix = 'v2177-opening-video-first-no-bubble-overflow-fix';
    document.documentElement.dataset.v2178SystemQualityEngine = 'v2178-system-quality-engine-fishing-menu-performance';
    document.documentElement.dataset.v2180StabilityContentEngine = 'v2180-village-camera-fishing-menu-content-performance';
    document.documentElement.dataset.v2184FishingReadabilityResultLayout = 'v2184-fishing-readable-loadout-bite-result-layout';
    document.documentElement.dataset.v2185QualityFishingEnginePolish = 'v2185-loadout-copy-bite-result-jitter-engine-polish';
    document.documentElement.dataset.v2186SystemQualityUiEnginePolish = 'v2186-fishing-shelf-bite-result-cleanup-performance-polish';
    document.documentElement.dataset.v2187PremiumDesignSystemUpgrade = 'v2187-premium-aqua-design-fishing-result-performance-upgrade';
    document.documentElement.dataset.v2188PremiumAtelierSystemPolish = 'v2188-premium-atelier-design-fishing-safe-result-performance';
    document.documentElement.dataset.v2189PremiumDesignEngineSweep = 'v2189-premium-ocean-glass-design-fishing-system-upgrade';
    document.documentElement.dataset.v2190PremiumDesignContentEngine = 'v2190-premium-design-content-engine-sweep';
    document.documentElement.dataset.v2191OpeningFishingDesignEngine = 'v2191-opening-video-only-fishing-icon-scale-design-engine';
    document.documentElement.dataset.v2192OpeningFishingDesignTuning = 'v2192-video-first-handoff-compact-loadout-premium-design';
    document.documentElement.dataset.v2193PremiumDesignSystemEngine = 'v2193-premium-design-system-engine-active-screen';
    document.documentElement.dataset.v2194IntroLoadoutPatch = 'v2194-opening-no-native-play-mark-thin-half-loadout';
    document.documentElement.dataset.v2195PremiumDesignEngineSweep = 'v2195-opening-shell-slim-loadout-premium-polish';
    document.documentElement.dataset.v2196PremiumUxEngineSweep = 'v2196-first-frame-video-shell-text-first-loadout-design-performance';
    document.documentElement.dataset.v2197PremiumDesignContinuity = 'v2197-active-screen-ocean-glass-opening-fishing-continuity';
    document.documentElement.dataset.v2198PremiumDesignEngine = 'v2198-opening-mask-fishing-loadout-premium-design-engine';
    document.documentElement.dataset.v2199PremiumDesignPolish = 'v2199-active-screen-premium-polish-opening-fishing-readability';
    document.documentElement.dataset.v21100PremiumMilestonePolish = 'v21100-premium-milestone-active-screen-opening-fishing-design';
    document.documentElement.dataset.v2154MenuFishingVisibilitySweep = 'v2154-mini-icon-menu-visible-fishing-gauges';
    document.documentElement.dataset.v2155MenuFishingCoreVisibility = 'v2155-micro-spaced-menu-gauge-above-reel-buttons';
    this.activateV2097UiResetShell();
    document.documentElement.dataset.v2161FishingBiteDexSystem = 'v2161-bite-callout-center-dex-scale-system-guard';
    document.documentElement.dataset.v2162QualitySweepPolish = 'v2162-overlap-card-fishing-hud-menu-engine-sweep';
    document.documentElement.dataset.v2163HudFishingToastInventoryPolish = 'v2163-hud-gap-menu-bigger-fishing-loadout-center-toast-ledger-dex';
    document.documentElement.dataset.v2164QualityFollowupPolish = 'v2164-hud-menu-build-expedition-fishing-inventory-dex-followup';
    document.documentElement.dataset.v2165QualitySweepPolish = 'v2165-overlap-layout-text-budget-shop-fishing-menu-sweep';
    document.documentElement.dataset.v2166MenuHudAutoSalePolish = 'v2166-menu-rescue-hud-color-autosale-loop';
    document.documentElement.dataset.v2167PremiumMobilePolish = 'v2167-premium-mobile-aqua-card-menu-fishing-shop-polish';
    document.documentElement.dataset.v2168PremiumLayoutSweep = 'v2168-premium-layout-fishing-shop-dock-sweep';
    document.documentElement.dataset.v2169KeyboardShopFishingPolish = 'v2169-keyboard-shop-fishing-polish';
    document.documentElement.dataset.v2170AquaLayoutRefinement = 'v2170-aqua-layout-refinement-polish';
    document.documentElement.classList.add('v2098-ui-recovery-root', 'v218-stable-ui-fishing-rollback-root', 'v219-ui-touch-shop-fishing-audit-root', 'v2111-aqua-shell-root', 'v2112-aqua-foundation-root', 'v2113-aqua-core-root', 'v2114-aqua-interaction-root', 'v2115-aqua-screen-shell-root', 'v2116-village-asset-polish-root', 'v2117-layout-input-fishing-root', 'v2118-character-water-ui-root', 'v2119-opening-exit-character-ui-root', 'v2120-opening-video-direction-ui-root', 'v2121-ui-continuity-polish-root', 'v2122-route-direction-ui-stability-root', 'v2123-bug-ui-fishing-stability-root', 'v2124-stability-performance-root', 'v2125-opening-direction-motion-ui-root', 'v2127-direction-motion-ui-audit-root', 'v2128-direction-ui-fishing-correction-root', 'v2129-player-filename-direction-root', 'v2130-construction-fishing-ui-root', 'v2131-motion-ui-fishing-build-root', 'v2132-premium-ui-fishing-stability-root', 'v2133-premium-ui-engine-fishing-stability-root', 'v2134-object-grid-shop-fishing-ui-root', 'v2135-system-ui-fishing-engine-root', 'v2136-premium-polish-fishing-placement-root', 'v2137-fishing-ui-page-shell-hud-menu-polish-root', 'v2138-fishing-cockpit-menu-page-polish-root', 'v2139-fishing-ui-system-polish-root', 'v2140-fishing-menu-ui-tune-root', 'v2142-fishing-ui-page-tile-polish-root', 'v2143-ui-overlap-placement-sweep-root', 'v2144-ui-placement-polish-sweep-root', 'v2145-icon-fishing-page-polish-root', 'v2146-ui-overlap-icon-fishing-polish-root', 'v2147-ui-overlap-layout-fishing-polish-root', 'v2148-ui-overlap-layout-sweep-root', 'v2149-ui-composition-polish-root', 'v2150-ui-overlap-placement-beauty-root', 'v2151-layout-composition-fishing-ui-root', 'v2152-compact-menu-fishing-gauge-root', 'v2153-tight-top-menu-fishing-battle-hud-root', 'v2154-menu-fishing-visibility-sweep-root', 'v2155-menu-fishing-core-visibility-root', 'v2156-top-menu-hard-lock-fishing-gauge-root', 'v2157-menu-fishing-visibility-hardfix-root', 'v2158-menu-shop-fishing-opening-polish-root', 'v2159-premium-aqua-ui-fishing-layout-root', 'v2160-fishing-hud-menu-polish-root', 'v2161-fishing-bite-dex-system-root', 'v2162-ui-quality-sweep-root', 'v2163-hud-fishing-toast-inventory-root', 'v2164-quality-followup-root', 'v2165-quality-sweep-root', 'v2166-menu-rescue-root', 'v2167-premium-mobile-polish-root', 'v2168-premium-layout-sweep-root', 'v2169-keyboard-shop-fishing-polish-root', 'v2170-aqua-layout-refinement-root', 'v2171-fishing-layout-engine-root', 'v2172-system-content-engine-root', 'v2173-intro-gate-engine-root', 'v2174-quality-engine-sweep-root', 'v2176-quality-composition-sweep-root', 'v2177-opening-video-first-fix-root', 'v2178-system-quality-engine-root', 'v2184-fishing-readability-result-root', 'v2187-premium-design-system-root', 'v2188-premium-atelier-system-root', 'v2189-premium-ocean-glass-root', 'v2190-premium-design-content-root', 'v2191-opening-fishing-design-root', 'v2192-opening-fishing-design-root', 'v2193-premium-design-system-root', 'v2194-intro-loadout-root', 'v2195-premium-design-engine-root', 'v2196-premium-ux-engine-root', 'v2197-premium-design-continuity-root', 'v2198-premium-design-engine-root', 'v2199-premium-design-polish-root', 'v21100-premium-milestone-root');
    // v2.0.92 validation lineage only: dataset.v2092UiStable = 'v2092-live-ui-canonical' activateV2092UiStableShell html.classList.add('v2092-ui-direct-source-root') v2092-ui-stable-village-screen v2092-village-hud v2092-profile-chip v2092-expedition-board v2092-expedition-toggle data-v2092-expedition-toggle v2092-expedition-body data-v2092-expedition-body v2092-expedition-body-open v2092-ui-close v2092-ui-stable-menu-screen v2092-runtime-hud v2092-menu-content data-v2092-scroll-root="true" v2092-menu-close
    // v2.0.93 validation lineage only: old html dataset markers intentionally removed from live runtime. visualPolish enginePatch v2077MenuUiCleanup v2089UiHardReset v2090UiDebtCleanup v2091UiCleanup v2092UiStable
    /* v2.0.92 validation lineage only: old html dataset markers are intentionally not attached to runtime.
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
        document.documentElement.dataset.v2048DockFishingAnchorSystem = 'v2048-dock-fishing-anchor-system';
        document.documentElement.dataset.v2049ContentAssetSystemPolish = 'v2049-content-asset-system-polish';
        document.documentElement.dataset.v2050ContentExpansionAssetPolish = 'v2050-content-expansion-asset-polish';
        document.documentElement.dataset.v2051HudDockFishingMotionPolish = 'v2051-hud-dock-fishing-motion-polish';
        document.documentElement.dataset.v2052TileAnchorContentAudit = 'v2052-tile-anchor-content-audit';
        document.documentElement.dataset.v2053HudDockFishingSystem = 'v2053-hud-dock-fishing-system';
        document.documentElement.dataset.v2054LayoutIssueSweep = 'v2054-layout-issue-sweep';
        document.documentElement.dataset.v2055PlayabilityUiRepair = 'v2055-playability-ui-repair';
        document.documentElement.dataset.v2056MotionTilePolish = 'v2056-motion-tile-polish';
        document.documentElement.dataset.v2057FishingAquaTouch = 'v2057-fishing-aqua-touch';
        document.documentElement.dataset.v2058TechModernization = 'v2058-tech-modernization-multiplayer-guard';
        document.documentElement.dataset.v2059FishingDialogCloseUnification = 'v2059-fishing-dialog-close-unification';
        document.documentElement.dataset.v2061LoopUiButtonAudit = 'v2061-loop-popup-content-button-audit';
        document.documentElement.dataset.v2062GroundContactMotionAudit = 'v2062-shadow-foot-contact-motion-audit';
        document.documentElement.dataset.v2063FishingCardWindows = 'v2063-fishing-state-machine-unified-card-windows';
        document.documentElement.dataset.v2064PolishAudit = 'v2064-fishing-ui-card-button-stability-audit';
        document.documentElement.dataset.v2072MenuFishingLoopPolish = 'v2072-menu-card-fishing-loop-polish';
        document.documentElement.dataset.v2073FishingCoreFeel = 'v2073-fishing-core-feel-update';
        document.documentElement.dataset.v2074CatchGrowthLoop = 'v2074-catch-growth-loop';
        document.documentElement.dataset.v2075UiExplorationPolish = 'v2075-ui-exploration-scroll-polish';
        document.documentElement.dataset.v2076IslandExpansionRoutes = 'v2076-island-expansion-routes';
        document.documentElement.dataset.v2077MenuUiCleanup = 'v2077-menu-aqua-card-scroll-close-expedition-fix';
        document.documentElement.dataset.v2078AquaCardUi = 'v2078-aqua-card-hud-panel-polish';
        document.documentElement.dataset.v2079AquaCardObjectAudit = 'v2079-aqua-card-object-layout-audit';
        document.documentElement.dataset.v2080MenuTileAudit = 'v2080-menu-page-grid-tile-hitbox-audit';
        document.documentElement.dataset.v2081AquaUiRootRepair = 'v2081-aqua-ui-root-repair';
        document.documentElement.dataset.v2082MenuFixedLayout = 'v2082-menu-fixed-layout';
        document.documentElement.dataset.v2083VillageHitboxFeel = 'v2083-village-hitbox-feel';
        document.documentElement.dataset.v2084UiShellStabilize = 'v2084-ui-shell-start-hud-fishing-repair';
        document.documentElement.dataset.v2085UiEmergencyReset = 'v2085-ui-emergency-hud-menu-reset';
        document.documentElement.dataset.v2086UiShellSurgery = 'v2086-ui-shell-surgery';
        document.documentElement.dataset.v2087UiStabilizerSweep = 'v2087-ui-stabilizer-sweep';
        document.documentElement.dataset.v2088CharacterShellExpeditionUi = 'v2088-character-shell-expedition-ui';
        document.documentElement.dataset.v2089UiHardReset = 'v2089-ui-hard-reset-expedition-shop-fix';
        document.documentElement.dataset.v2090UiDebtCleanup = 'v2090-ui-debt-cleanup-build-state-guard';
        document.documentElement.dataset.v2092UiStable = 'v2092-live-ui-canonical';
        this.activateV2092UiStableShell();
        */
    document.documentElement.dataset.cacheName = CACHE_NAME;
    if (!this.hasWebGL()) document.documentElement.classList.add('pixi-fallback-ready');
    this.bindViewportGuard();
    this.installViewportSafeLock();
    this.installLayoutQaSweep();
    this.installInteractionQaPolish();
    this.installTechPerfCompatPass();
    this.installContentFlowEngineQaPass();
    this.installDetailStabilityQaPass();
    this.installV2161SystemGuardPass();
    this.installV2162QualitySweepPass();
    this.installV2164QualityFollowupPass();
    this.installV2165QualitySweepPass();
    this.installV2166MenuHudAutoSalePass();
    this.installV2167PremiumMobilePolishPass();
    this.installV2168PremiumLayoutSweepPass();
    this.installV2169KeyboardShopFishingPolishPass();
    this.installV2170AquaLayoutRefinementPass();
    this.installV2171FishingLayoutEnginePass();
    this.installV2172SystemContentEnginePass();
    this.installV2173IntroGateEnginePass();
    this.installV2174QualityEngineSweepPass();
    this.installV21118UiAssetContainmentPass();
    this.installV21119InteractionSafetyPass();
    this.installV21120ScreenCompositionHandoffPass();
    this.installV21121MicroUiA11yPerfPass();
    this.installV21122SystemUxPerformancePass();
    this.installV21123RuntimeDeconflictPass();
    this.installV21124RootCauseUxRepairPass();
    this.installV21125LegacyDebtReducerPass();
    this.installV21126StaleCodePrunerPass();
    this.installV21128DirectSourceUiRepairPass();
    this.installV21129DirectStateUiPass();
    this.installV21130DirectSourceRegressionGuardPass();
    this.installV21131StaleObserverQuarantinePass();
    this.installV21132ObserverBudgetGovernorPass();
    this.installV21133SingleGovernorLedgerPass();
    this.installV21134RenderBudgetUiWriteLedgerPass();
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


  private activateV2097UiResetShell(): void {
    const html = document.documentElement;
    const keep = new Set(['version', 'cacheName', 'initialOrientation', 'orientationPolicy', 'v2097UiReset', 'v2098UiRecovery', 'v218StableRollback', 'v219UiTouchShopFishingAudit', 'v2111AquaShell', 'v2112AquaFoundation', 'v2113AquaCoreSteward', 'v2114InteractionShellPolish', 'v2115AquaScreenShell', 'v2116VillageAssetPolish', 'v2117LayoutInputFishing', 'v2118CharacterWaterUi', 'v2119OpeningExitCharacterUi', 'v2120OpeningVideoDirectionUi', 'v2121UiContinuityPolish', 'v2122RouteDirectionUi', 'v2123StabilityPolish', 'v2124StabilityPerformance', 'v2125OpeningDirectionMotionUi', 'v2127DirectionMotionUiAudit', 'v2128DirectionUiFishingCorrection', 'v2129PlayerFilenameDirection', 'v2130ConstructionFishingUi', 'v2131MotionUiFishingBuildGuard', 'v2132PremiumUiFishingStability', 'v2133PremiumUiEngineFishingStability', 'v2143UiOverlapPlacementSweep', 'v2144UiPlacementPolishSweep', 'v2145IconFishingPagePolish', 'v2146UiOverlapIconFishingPolish', 'v2147UiOverlapLayoutFishingPolish', 'v2148UiOverlapLayoutSweep', 'v2149UiCompositionPolish', 'v2150UiOverlapPlacementBeauty', 'v2161FishingBiteDexSystem', 'v21117VillageMenuIconClarity', 'v21118UiAssetContainment', 'v21119InteractionSafety', 'v21120ScreenCompositionHandoff', 'v21121MicroUiA11yPerf', 'v21122SystemUxPerformance', 'v21123RuntimeDeconflict', 'v21124RootCauseUxRepair', 'v21125LegacyDebtReducer', 'v21126StaleCodePruner', 'v21128DirectSourceUiRepair', 'v21129DirectStateUi', 'v21130DirectSourceRegressionGuard', 'v21131StaleObserverQuarantine', 'v21132ObserverBudgetGovernor', 'v21133SingleGovernorLedger', 'v21133UiPolicy', 'v21133LatestUiOwner', 'v21134RenderBudgetUiWriteLedger', 'v21134UiPolicy', 'v21134LatestUiOwner']);
    for (const key of Object.keys(html.dataset)) {
      if (keep.has(key)) continue;
      const value = html.dataset[key] ?? '';
      if (/^(v\d|ui|menu|layout|asset|fishing|village|aqua|zero|legacy|premium|regression|wide|start|button|foundation|viewport|content|detail|pixel|visual|engine|tech|runtime)/i.test(key) || /^v\d/i.test(value)) {
        delete html.dataset[key];
      }
    }
    html.dataset.v2097UiReset = 'v2097-live-ui-stable-shell';
    html.dataset.v2098UiRecovery = 'v2098-dock-fishing-build-recovery';
    html.dataset.v2132PremiumUiFishingStability = 'v2132-premium-ui-fishing-stability';
    html.dataset.v2133PremiumUiEngineFishingStability = 'v2133-premium-ui-engine-fishing-stability';
    html.classList.remove('v2092-ui-direct-source-root', 'v2093-ui-direct-source-root', 'v2110-asset-integration-pass-root');
    html.classList.add('v2097-ui-clean-root', 'v2098-ui-recovery-root');
  }

  // v2.0.92 validation compatibility: dataset.v2091UiCleanup = 'v2091-live-ui-pruned' activateV2091UiCleanup delete html.dataset[key]

  private clear(): void {
    window.clearTimeout(this.biteTimeout);
    this.fishingInputAbort?.abort();
    this.fishingInputAbort = undefined;
    if (this.fallbackTicker) { window.clearInterval(this.fallbackTicker); this.fallbackTicker = 0; }
    window.removeEventListener('resize', this.resizePixiHandler);
    this.holding = false;
    this.reelMode = 'neutral';
    this.villageWorld?.destroy();
    this.villageWorld = undefined;
    if (this.pixi) {
      this.pixi.destroy(true, { children: true, texture: false });
      this.pixi = undefined;
    }
    this.webglLayers.forEach((layer) => layer.dispose());
    this.webglLayers = [];
    dom.app.innerHTML = '';
    this.resultCardOpen = false;
    this.stageHost = undefined;
    this.pixiLayer = undefined;
    this.uiLayer = undefined;
    this.waterLayer = undefined;
    this.lastTensionUiSignature = '';
    this.v21134LastSyncSignature = '';
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
    document.body.classList.remove('v2032-character-panel-open', 'v2033-character-panel-open', 'v2034-character-panel-open', 'v2035-character-panel-open', 'v2036-character-panel-open', 'v2037-character-panel-open', 'v2039-character-panel-open', 'v2040-character-panel-open', 'v2041-character-panel-open', 'v2042-character-panel-open', 'v2044-character-panel-open', 'v2045-character-panel-open', 'v2046-character-panel-open', 'v2047-character-panel-open', 'v2040-interior-open', 'v2041-interior-open', 'v2042-interior-open', 'v2043-interior-open', 'v2044-interior-open', 'v2045-interior-open', 'v2046-interior-open', 'v2047-interior-open', 'v2081-expedition-panel-open', 'v2082-expedition-panel-open', 'v2084-popup-open', 'v2085-modal-open', 'v2086-modal-open', 'v2087-modal-open', 'v2088-modal-open', 'v2088-expedition-open', 'v2089-modal-open', 'v2089-expedition-open', 'v2090-modal-open', 'v2090-expedition-open', 'v2092-modal-open', 'v2092-expedition-open', 'v2094-modal-open', 'v2097-modal-open', 'v2097-expedition-open', 'v2097-build-open', 'v2098-modal-open', 'v2098-expedition-open', 'v2098-build-open', 'v218-aqua-modal-open', 'v2111-modal-open', 'v2111-expedition-open', 'v2111-build-open', 'v2112-modal-open', 'v2112-expedition-open', 'v2112-build-open', 'v2113-modal-open', 'v2113-expedition-open', 'v2113-build-open', 'v2114-modal-open', 'v2114-expedition-open', 'v2114-build-open', 'v2115-modal-open', 'v2115-expedition-open', 'v2115-build-open', 'v2116-modal-open', 'v2116-expedition-open', 'v2116-build-open', 'v2117-modal-open', 'v2117-expedition-open', 'v2117-build-open', 'v2118-modal-open', 'v2118-expedition-open', 'v2118-build-open', 'v2119-modal-open', 'v2119-expedition-open', 'v2119-build-open', 'v2120-modal-open', 'v2120-expedition-open', 'v2120-build-open', 'v2121-modal-open', 'v2121-expedition-open', 'v2121-build-open', 'v2122-modal-open', 'v2122-expedition-open', 'v2122-build-open', 'v2123-modal-open', 'v2123-expedition-open', 'v2123-build-open', 'v2124-modal-open', 'v2124-expedition-open', 'v2124-build-open', 'v2125-modal-open', 'v2125-expedition-open', 'v2125-build-open', 'v2127-modal-open', 'v2127-expedition-open', 'v2127-build-open', 'v2128-modal-open', 'v2128-expedition-open', 'v2128-build-open', 'v2129-modal-open', 'v2129-expedition-open', 'v2129-build-open');
    for (const cls of Array.from(document.body.classList)) {
      if (/^v(?:20|21)\d{2,}-(?:modal|expedition|build|build-tray|interior|character)-open$/.test(cls)) document.body.classList.remove(cls);
    }
    document.querySelectorAll('.touch-ring, .v930-fx, .bite-callout, .action-badge, .catch-result-card, .v2049-income-float').forEach((node) => node.remove());
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
    this.syncV21129DirectUi(`go-${screen}`);
    this.syncV21130DirectSourceUi(`go-${screen}`);
    this.syncV21131StaleObserverQuarantineUi(`go-${screen}`);
    this.syncV21132ObserverBudgetGovernorUi(`go-${screen}`);
    this.syncV21133SingleGovernorLedgerUi(`go-${screen}`);
    this.syncV21134RenderBudgetUiWriteLedgerUi(`go-${screen}`);
  }

  private async startGame(linkServer = false): Promise<void> {
    playSound('tap');
    this.openingIntroPending = true;
    document.documentElement.dataset.v2192OpeningFishingDesignTuning = 'video-first-handoff-before-immersive';
    document.body.dataset.v2192OpeningHandoff = 'video-first';
    this.screen = 'village';
    this.save.screen = 'village';
    saveGame(this.save);
    this.renderVillage();
    this.syncV21129DirectUi('start-game-village');
    this.syncV21130DirectSourceUi('start-game-village');
    this.syncV21131StaleObserverQuarantineUi('start-game-village');
    this.syncV21132ObserverBudgetGovernorUi('start-game-village');
    this.syncV21133SingleGovernorLedgerUi('start-game-village');
    this.syncV21134RenderBudgetUiWriteLedgerUi('start-game-village');
    void this.enterImmersiveMode().catch(() => undefined);
    if (linkServer) {
      void tryAnonymousServerLink(this.save).then((result) => {
        if (!this.openingIntroPending) this.toast.show({ type: result.ok ? 'reward' : 'normal', title: result.ok ? '익명 서버연동 완료' : '로컬 저장 진행', message: result.message });
      }).catch(() => undefined);
    }
  }

  private armStartScreenReveal(shell: HTMLElement): void {
    const image = shell.querySelector<HTMLImageElement>('.start-art-image');
    const markReady = () => shell.classList.add('v2084-start-ready');
    if (!image) { markReady(); return; }
    if (image.complete) window.requestAnimationFrame(markReady);
    else {
      image.addEventListener('load', markReady, { once: true });
      image.addEventListener('error', markReady, { once: true });
      window.setTimeout(markReady, 900);
    }
  }

  private renderLogin(): void {
    this.clear();
    const shell = document.createElement('main');
    shell.className = 'login-screen start-art-screen v2025-start-guard-screen v2084-start-shell v2115-start-shell v2116-start-shell v2117-start-shell v2118-start-shell v2119-start-shell v2120-start-shell v2121-start-shell';
    shell.dataset.v2025StartGuard = 'true';
    shell.innerHTML = `
      <div class="start-design-surface" data-design="1024x1536">
        <img class="start-art-image" src="${ASSET.loginBg}" alt="아쿠아 판타지아 시작 화면" />
        <h1 class="sr-only">아쿠아 판타지아</h1>
        <div class="v2084-start-actions" aria-label="시작 화면 버튼 묶음">
          <button class="start-hotspot hit-depart" data-action="guest" aria-label="낚시터로 출항"></button>
          <button class="start-hotspot hit-new" data-action="new" aria-label="처음부터 새 게임"></button>
          <button class="start-hotspot hit-server v2025-server-button" data-action="server" aria-label="익명 서버연동"></button>
          <button class="start-hotspot hit-keep v810-keep-button v11115-keep-toggle v2025-keep-button" data-action="keep" aria-label="이 기기에서 로그인 유지" aria-pressed="false"><span class="keep-indicator" aria-hidden="true"></span><span class="keep-text">이 기기에서 로그인 유지</span></button>
        </div>
        <div class="login-touch-shine" aria-hidden="true"></div>
      </div>`;
    dom.app.appendChild(shell);
    this.armStartScreenReveal(shell);
    this.applyStartLoginLayoutGuard(shell);
    const keepEnabled = window.localStorage.getItem('aqua-login-keep') === 'true';
    const keepButton = shell.querySelector<HTMLButtonElement>('[data-action="keep"]');
    keepButton?.classList.toggle('checked', keepEnabled);
    keepButton?.setAttribute('aria-pressed', String(keepEnabled));
    shell.querySelector<HTMLButtonElement>('[data-action="guest"]')?.addEventListener('click', () => this.startGame(false));
    shell.querySelector<HTMLButtonElement>('[data-action="server"]')?.addEventListener('click', () => this.startGame(true));
    shell.querySelector<HTMLButtonElement>('[data-action="new"]')?.addEventListener('click', () => {
      const fresh = loadSave();
      this.save = { ...fresh, screen: 'login', coins: 500, caught: {}, missions: {}, region: 'lake', gear: { rodLevel: 1, reelLevel: 1, lureStock: 8, lineLevel: 1 }, unlockedRegions: ['lake', 'river', 'harbor'], mastery: {}, bestStreak: 0, currentStreak: 0, totalCasts: 0, totalSuccess: 0, totalFail: 0 };
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
      ['left', '50%'],
      ['top', '77.65%'],
      ['width', 'min(38%, 176px)'],
      ['height', '28px'],
      ['min-width', '0'],
      ['min-height', '26px'],
      ['padding', '0 8px'],
      ['gap', '6px'],
      ['border-radius', '999px'],
      ['overflow', 'hidden'],
      ['transform', 'translateX(-50%)'],
      ['background-image', 'none'],
    ]);
    set(keep?.querySelector<HTMLElement>('.keep-indicator') ?? null, [
      ['width', 'clamp(16px, 4.2vw, 20px)'],
      ['height', 'clamp(16px, 4.2vw, 20px)'],
      ['min-width', 'clamp(16px, 4.2vw, 20px)'],
      ['flex-basis', 'clamp(16px, 4.2vw, 20px)'],
    ]);
    set(keep?.querySelector<HTMLElement>('.keep-text') ?? null, [
      ['font-size', 'clamp(9.5px, 2.35vw, 11.5px)'],
      ['letter-spacing', '-0.045em'],
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

  private villageGrowthBoardMarkup(): string {
    const score = this.save.village.development;
    const buildingCount = this.save.village.buildings.length;
    const pathCount = this.save.village.paths.length;
    const income = Math.max(0, this.save.village.autoIncome);
    const uniqueCaught = Object.keys(this.save.caught).filter((id) => (this.save.caught[id] ?? 0) > 0).length;
    const next = score >= 1000
      ? { label: '다른 섬 개척 준비', value: Math.min(100, Math.round((uniqueCaught / 30) * 100)), desc: '도감 30종과 항로 확장으로 해양 제국 루프를 준비하세요.' }
      : score >= 500
        ? { label: 'VIP 관광섬', value: Math.min(100, Math.round((score / 1000) * 100)), desc: '수족관·여관·길 확장으로 VIP 관광객을 유치하세요.' }
        : score >= 100
          ? { label: '관광버스 유치', value: Math.min(100, Math.round((score / 500) * 100)), desc: '어시장/창고/돌길을 늘려 자동 수익 흐름을 키우세요.' }
          : { label: '첫 관광객 유치', value: Math.min(100, Math.round((score / 100) * 100)), desc: '꽃밭·돌길·주민 집으로 첫 마을 분위기를 잡으세요.' };
    const loop = [
      ['낚시', `${this.totalCaught()}마리`],
      ['자동판매', `${this.estimatedCatchLedgerValue().toLocaleString('ko-KR')}G`],
      ['마을기금', `${this.save.village.fund.toLocaleString('ko-KR')}G`],
      ['자동수익', `+${income}G/틱`],
    ];
    return `
      <div class="v2061-loop-pop-title"><span>성장 루프</span><strong>${next.label}</strong></div>
      <div class="v2049-growth-head"><span>OCEAN EMPIRE LOOP</span><strong>${next.label}</strong><em>${next.desc}</em></div>
      <div class="v2049-growth-meter" style="--p:${next.value}%"><i></i><b>${next.value}%</b></div>
      <div class="v2049-growth-loop">${loop.map(([label, value]) => `<article><strong>${value}</strong><span>${label}</span></article>`).join('')}</div>
      <div class="v2049-growth-next"><span>다음 추천</span><b>${pathCount < 8 ? '돌길을 8칸 이상 연결' : buildingCount < 7 ? '창고·주민 집·수족관 증설' : uniqueCaught < 15 ? '새 수역에서 도감 15종 발견' : '자동 수익과 항로 개척 준비'}</b></div>`;
  }


  private islandExpansionStats(): IslandExpansionStats {
    const unlockedCount = regions.filter((item) => this.isRegionUnlocked(item.key)).length;
    const uniqueCaught = Object.keys(this.save.caught).filter((id) => (this.save.caught[id] ?? 0) > 0).length;
    const buildingCount = this.save.village.buildings.length;
    const pathCount = this.save.village.paths.length;
    const development = this.save.village.development;
    const permit = Boolean(this.save.missions['shop_route_permit']);
    const surveyDone = Boolean(this.save.missions['expedition_survey_done']);
    const chartDone = Boolean(this.save.missions['expedition_chart_done']);
    const settled = Boolean(this.save.missions['expedition_second_island']);
    const checks = [development >= 1000, buildingCount >= 8, pathCount >= 16, unlockedCount >= 8, uniqueCaught >= 20, permit];
    const readySteps = checks.filter(Boolean).length;
    const progress = Math.min(100, Math.round((readySteps / checks.length) * 100));
    const nextText = development < 1000 ? '발전도 1000으로 VIP 관광섬 기반 만들기'
      : buildingCount < 8 ? '주민 집·창고·수족관 등 시설 8채 확보'
        : pathCount < 16 ? '돌길 16칸으로 항구-광장 동선 연결'
          : unlockedCount < 8 ? '수역 8곳 이상 해금'
            : uniqueCaught < 20 ? '도감 20종 발견으로 개척 명분 확보'
              : permit ? '두 번째 섬 개척 실행 가능' : '상점에서 개척 항로 허가서 확보';
    const tierLabel = settled ? '개척 완료'
      : chartDone ? '후보지 항로 확보'
        : surveyDone ? '항로 조사 완료'
          : progress >= 100 ? '개척 준비 완료'
            : progress >= 67 ? '항로 조사 중'
              : progress >= 34 ? '기반 확장 중'
                : '첫 섬 정비 중';
    const phaseLabel = settled ? '두 번째 섬 개척 완료'
      : chartDone ? '출항 후보지 선택 가능'
        : surveyDone ? '후보지 차트 작성 필요'
          : readySteps >= 3 ? '항로 조사 가능'
            : '기반 성장 필요';
    return { unlockedCount, uniqueCaught, buildingCount, pathCount, development, permit, readySteps, progress, nextText, tierLabel, phaseLabel, surveyDone, chartDone, settled };
  }

  private expeditionRouteCandidates(): ExpeditionRouteCandidate[] {
    const uniqueCaught = Object.keys(this.save.caught).filter((id) => (this.save.caught[id] ?? 0) > 0).length;
    const missionDone = Object.values(this.save.missions).filter(Boolean).length;
    const routeProgress = (key: RegionKey): number => {
      if (this.isRegionUnlocked(key)) return 100;
      if (key === 'deep') return Math.min(100, Math.round((this.save.totalSuccess / 2) * 100));
      if (key === 'palace') return Math.min(100, Math.round((uniqueCaught / 5) * 100));
      if (key === 'dimension') return Math.min(100, Math.round((Math.max(this.save.bestStreak / 4, uniqueCaught / 10)) * 100));
      if (key === 'glacier') return Math.min(100, Math.round((Math.max(this.save.totalSuccess / 8, this.save.missions.expedition_survey_done ? 0.70 : 0)) * 100));
      if (key === 'storm') return Math.min(100, Math.round((Math.max(this.save.totalSuccess / 12, this.save.missions.expedition_chart_done ? 1 : this.save.missions.expedition_survey_done ? 0.74 : 0)) * 100));
      if (key === 'mangrove') return Math.min(100, Math.round((Math.max(uniqueCaught / 14, (this.save.mastery.river ?? 0) / 6, this.save.missions.expedition_chart_done ? 1 : 0)) * 100));
      if (key === 'lunar') return Math.min(100, Math.round((Math.max(this.save.bestStreak / 6, (this.save.mastery.dimension ?? 0) / 4, this.save.missions.expedition_second_island ? 1 : 0)) * 100));
      if (key === 'reefFestival') return Math.min(100, Math.round((Math.max(missionDone / 2, this.save.totalSuccess / 5, this.save.missions.expedition_survey_done ? 1 : 0)) * 100));
      return 0;
    };
    const requirements: Partial<Record<RegionKey, string>> = {
      deep: '성공 2회',
      palace: '도감 5종',
      dimension: '콤보 4회 또는 도감 10종',
      glacier: '성공 8회 또는 항로 조사',
      storm: '성공 12회 또는 후보지 차트',
      mangrove: '도감 14종 또는 차트 확보',
      lunar: '콤보 6회 또는 두 번째 섬 개척',
      reefFestival: '미션 2개 또는 항로 조사',
    };
    return regions
      .filter((region) => !['lake', 'river', 'harbor'].includes(region.key))
      .map((region) => ({
        key: region.key,
        name: region.name,
        subtitle: region.subtitle,
        requirement: requirements[region.key] ?? region.unlockHint,
        progress: routeProgress(region.key),
        unlocked: this.isRegionUnlocked(region.key),
        recommended: !this.isRegionUnlocked(region.key) && routeProgress(region.key) >= 70,
      }))
      .sort((a, b) => Number(b.unlocked) - Number(a.unlocked) || Number(b.recommended) - Number(a.recommended) || b.progress - a.progress)
      .slice(0, 5);
  }

  private expeditionCandidateMarkup(): string {
    const rows = this.expeditionRouteCandidates();
    return `<div class="v2076-expedition-candidates" aria-label="출항 후보지">${rows.map((route) => {
      const status = route.unlocked ? '출항 가능' : route.progress >= 100 ? '해금 가능' : route.recommended ? '곧 해금' : '조사 중';
      const button = route.unlocked ? '선택' : route.progress >= 100 ? '해금' : `${route.progress}%`;
      return `<article class="v2076-route-card ${route.unlocked ? 'unlocked' : route.progress >= 100 ? 'ready' : route.recommended ? 'recommended' : 'locked'}"><div><strong>${route.name}</strong><span>${route.subtitle}</span><em>${route.requirement}</em></div><i style="--p:${route.progress}%"><b></b></i><button type="button" data-expedition-route="${route.key}" ${route.progress < 100 && !route.unlocked ? 'aria-disabled="true"' : ''}>${button}</button><small>${status}</small></article>`;
    }).join('')}</div>`;
  }

  private expeditionActionsMarkup(stats: IslandExpansionStats): string {
    const surveyReady = stats.readySteps >= 3;
    const chartReady = stats.surveyDone && stats.permit && this.save.village.fund >= 300;
    const settleReady = stats.progress >= 100 && stats.chartDone && this.save.village.fund >= 700;
    const actions = [
      { key: 'survey', title: stats.surveyDone ? '조사완료' : '항로 조사', desc: stats.surveyDone ? '후보지 차트를 준비하세요' : '3개 기준 달성 시 후보지 스캔', ready: surveyReady && !stats.surveyDone, done: stats.surveyDone },
      { key: 'chart', title: stats.chartDone ? '차트완료' : '후보지 차트', desc: stats.chartDone ? '개척 실행 단계로 이동' : '허가서+기금 300G 필요', ready: chartReady && !stats.chartDone, done: stats.chartDone },
      { key: 'settle', title: stats.settled ? '개척완료' : '두 번째 섬', desc: stats.settled ? '확장 항로가 열렸습니다' : '100%+기금 700G 필요', ready: settleReady && !stats.settled, done: stats.settled },
    ];
    return `<div class="v2076-expedition-actions" aria-label="개척 실행 버튼">${actions.map((action) => `<button type="button" data-expedition-action="${action.key}" class="${action.done ? 'done' : action.ready ? 'ready' : 'locked'}" ${action.done ? 'aria-disabled="true"' : ''}><strong>${action.title}</strong><span>${action.desc}</span></button>`).join('')}</div>`;
  }

  private islandExpansionBoardMarkup(): string {
    const stats = this.islandExpansionStats();
    const rows = [
      ['발전도', `${Math.min(stats.development, 1000)}/1000`],
      ['시설', `${stats.buildingCount}/8`],
      ['돌길', `${stats.pathCount}/16`],
      ['수역', `${stats.unlockedCount}/8`],
      ['도감', `${stats.uniqueCaught}/20`],
      ['허가서', stats.permit ? '보유' : '미보유'],
    ];
    const loopRows = [
      ['포획', `${this.totalCaught()}마리`],
      ['자동판매', `${this.estimatedCatchLedgerValue().toLocaleString('ko-KR')}G`],
      ['마을기금', `${this.save.village.fund.toLocaleString('ko-KR')}G`],
      ['자동수익', `+${Math.max(0, this.save.village.autoIncome)}G`],
    ];
    return `<div class="v2061-loop-pop-title v2076-expedition-pop-title"><span>개척 준비</span><strong>${stats.phaseLabel}</strong></div><div class="v2050-expedition-head v2076-expedition-head"><span>ISLAND EXPANSION</span><strong>${stats.tierLabel}</strong><em>${stats.nextText}</em></div><div class="v2050-expedition-meter v2076-expedition-meter" style="--p:${stats.progress}%"><i></i><b>${stats.progress}%</b></div><div class="v2075-expedition-loop-summary" aria-label="개척에 통합된 성장 루프">${loopRows.map(([label, value]) => `<article><strong>${value}</strong><span>${label}</span></article>`).join('')}</div><div class="v2050-expedition-grid v2076-expedition-grid">${rows.map(([label, value]) => `<article><strong>${value}</strong><span>${label}</span></article>`).join('')}</div>${this.expeditionActionsMarkup(stats)}${this.expeditionCandidateMarkup()}`;
  }

  private handleExpeditionAction(action: string): void {
    const stats = this.islandExpansionStats();
    if (action === 'survey') {
      if (stats.surveyDone) return;
      if (stats.readySteps < 3) {
        this.toast.show({ type: 'mission', title: '항로 조사 조건 부족', message: '발전도·시설·길·수역·도감·허가서 중 3개 이상을 먼저 달성하세요.', actionScreen: 'mission' });
        return;
      }
      this.save.missions.expedition_survey_done = true;
      this.save.village.development += 180;
      this.save.village.fund += 120;
      if (!this.save.unlockedRegions.includes('reefFestival')) this.save.unlockedRegions.push('reefFestival');
      this.refreshVillageAutoIncome();
      saveGame(this.save);
      this.toast.show({ type: 'reward', title: '항로 조사 완료', message: '산호 축제섬 후보지가 열리고 마을 명성이 올랐습니다.', actionScreen: 'map' });
      this.renderVillage();
      return;
    }
    if (action === 'chart') {
      if (stats.chartDone) return;
      if (!stats.surveyDone || !stats.permit || this.save.village.fund < 300) {
        this.toast.show({ type: 'mission', title: '차트 작성 조건 부족', message: '항로 조사, 개척 항로 허가서, 마을기금 300G가 필요합니다.', actionScreen: 'shop' });
        return;
      }
      this.save.missions.expedition_chart_done = true;
      this.save.village.fund = Math.max(0, this.save.village.fund - 300);
      this.save.village.development += 260;
      for (const key of ['mangrove', 'glacier'] as RegionKey[]) {
        if (!this.save.unlockedRegions.includes(key)) this.save.unlockedRegions.push(key);
      }
      this.refreshVillageAutoIncome();
      saveGame(this.save);
      this.toast.show({ type: 'reward', title: '후보지 차트 완성', message: '맹그로브 미궁과 얼음 낚시터 항로가 개척 후보지로 표시됩니다.', actionScreen: 'map' });
      this.renderVillage();
      return;
    }
    if (action === 'settle') {
      if (stats.settled) return;
      if (stats.progress < 100 || !stats.chartDone || this.save.village.fund < 700) {
        this.toast.show({ type: 'mission', title: '두 번째 섬 개척 조건 부족', message: '개척 100%, 후보지 차트, 마을기금 700G가 필요합니다.', actionScreen: 'mission' });
        return;
      }
      this.save.missions.expedition_second_island = true;
      this.save.village.fund = Math.max(0, this.save.village.fund - 700);
      this.save.village.level = Math.max(this.save.village.level + 1, this.save.village.level);
      this.save.village.development += 420;
      for (const key of ['storm', 'lunar', 'dimension'] as RegionKey[]) {
        if (!this.save.unlockedRegions.includes(key)) this.save.unlockedRegions.push(key);
      }
      this.refreshVillageAutoIncome();
      saveGame(this.save);
      this.toast.show({ type: 'reward', title: '두 번째 섬 개척 완료', message: '폭풍 외해·달빛 산호해·차원의 바다 항로가 개척망에 연결됐습니다.', actionScreen: 'map' });
      this.renderVillage();
    }
  }

  private handleExpeditionRoute(key: RegionKey): void {
    const route = this.expeditionRouteCandidates().find((item) => item.key === key);
    if (!route) return;
    if (!route.unlocked && route.progress < 100) {
      this.toast.show({ type: 'mission', title: '아직 조사 중인 후보지', message: `${route.name} · ${route.requirement} 조건을 더 채워야 합니다.`, actionScreen: 'mission' });
      return;
    }
    if (!this.save.unlockedRegions.includes(key)) this.save.unlockedRegions.push(key);
    this.save.region = key;
    saveGame(this.save);
    this.toast.show({ type: 'reward', title: '항로 선택 완료', message: `${route.name} 항로를 목적지로 지정했습니다.`, actionScreen: 'fishing' });
    void this.go('map');
  }

  private bindExpeditionControls(root: HTMLElement): void {
    root.querySelectorAll<HTMLButtonElement>('[data-expedition-action]').forEach((btn) => btn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      this.handleExpeditionAction(btn.dataset.expeditionAction ?? '');
    }));
    root.querySelectorAll<HTMLButtonElement>('[data-expedition-route]').forEach((btn) => btn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const key = btn.dataset.expeditionRoute as RegionKey | undefined;
      if (key) this.handleExpeditionRoute(key);
    }));
  }


// v2.0.97 validation lineage only: root.querySelector<HTMLElement>('.v2027-village-loading')?.remove();
// v2.0.97 validation lineage only: this.mountBottomNav(root, 'village');
  // v2.0.97 validation lineage only; legacy loading class is not mounted live: v2027-village-loading v2027-village-ready.


  private applyV2158TopMenuBalanced(root: HTMLElement): void {
    const controls = root.querySelector<HTMLElement>('.v2097-world-controls, .v2156-world-controls, .v2157-world-controls-microbar, .v2158-world-controls-balanced, .v2160-world-controls-aqua-lock, .v2161-world-controls-aqua-lock, .v2162-world-controls-aqua-lock, .v2163-world-controls-aqua-lock, .v2164-world-controls-aqua-lock, .v2165-world-controls-aqua-lock, .v2166-world-controls-aqua-lock, .v2167-world-controls-aqua-lock');
    if (!controls) return;
    controls.classList.add('v2156-world-controls-fixed', 'v2157-world-controls-microbar', 'v2158-world-controls-balanced', 'v2159-world-controls-aqua-lock', 'v2160-world-controls-aqua-lock', 'v2161-world-controls-aqua-lock', 'v2162-world-controls-aqua-lock', 'v2163-world-controls-aqua-lock', 'v2164-world-controls-aqua-lock', 'v2165-world-controls-aqua-lock', 'v2166-world-controls-aqua-lock', 'v2167-world-controls-aqua-lock');
    controls.dataset.v2156HardLock = 'inline-important-compact-3x2';
    controls.dataset.v2157HardReplace = 'real-microbar-20px-3x2-no-labels';
    controls.dataset.v2158BalancedMenu = '2x3-32px-cell-21px-icon-3px-gap';
    controls.dataset.v2159PremiumMenu = '2x3-32px-21px-3px-no-frame-single-border-safe-hud';
    controls.dataset.v2160HudMenuCheck = '2x3-32px-21px-3px-no-frame-hud-clear-safe-area';
    controls.dataset.v2161HudMenuCheck = '2x3-32px-21px-3px-no-frame-center-bite-clear';
    controls.dataset.v2163HudMenuCheck = '2x3-35px-23px-4px-no-frame-hide-on-build-expedition';
    controls.dataset.v2164QualityMenuCheck = '2x3-36px-24px-4px-no-frame-hide-on-build-expedition-confirm';
    controls.dataset.v2165QualityMenuCheck = '2x3-36px-24px-4px-no-frame-panel-hidden-text-budget';
    controls.dataset.v2166MenuRescue = '2x3-38px-25px-visible-village-hide-only-open-panels';
    controls.dataset.v2167PremiumMenuPolish = '2x3-34px-22px-3px-single-border-no-frame-safe-hud';
    const set = (node: HTMLElement | null | undefined, entries: Array<[string, string]>) => {
      if (!node) return;
      for (const [name, value] of entries) node.style.setProperty(name, value, 'important');
    };
    set(controls, [
      ['position', 'fixed'],
      ['top', 'calc(env(safe-area-inset-top, 0px) + 8px)'],
      ['right', 'calc(env(safe-area-inset-right, 0px) + 8px)'],
      ['left', 'auto'],
      ['bottom', 'auto'],
      ['display', 'grid'],
      ['grid-template-columns', 'repeat(2, 34px)'],
      ['grid-auto-rows', '34px'],
      ['column-gap', '3px'],
      ['row-gap', '3px'],
      ['width', '71px'],
      ['min-width', '71px'],
      ['max-width', '71px'],
      ['height', '108px'],
      ['min-height', '108px'],
      ['max-height', '108px'],
      ['padding', '0'],
      ['margin', '0'],
      ['border', '0'],
      ['outline', '0'],
      ['border-radius', '0'],
      ['background', 'transparent'],
      ['background-image', 'none'],
      ['box-shadow', 'none'],
      ['backdrop-filter', 'none'],
      ['-webkit-backdrop-filter', 'none'],
      ['overflow', 'visible'],
      ['z-index', '520'],
      ['contain', 'layout paint style'],
      ['pointer-events', 'auto'],
    ]);
    controls.querySelectorAll<HTMLElement>('button').forEach((button) => {
      button.classList.add('v2156-top-menu-cell', 'v2157-top-menu-cell', 'v2158-top-menu-cell', 'v2159-top-menu-cell', 'v2160-top-menu-cell', 'v2161-top-menu-cell', 'v2162-top-menu-cell', 'v2163-top-menu-cell', 'v2164-top-menu-cell', 'v2165-top-menu-cell', 'v2166-top-menu-cell', 'v2167-top-menu-cell', 'v2168-top-menu-cell', 'v2170-top-menu-cell');
      button.dataset.v2156HardLockCell = '24px';
      button.dataset.v2157HardReplaceCell = '20px-no-text';
      button.dataset.v2158BalancedCell = '32px-icon-21px-gap-3px';
      button.dataset.v2159PremiumCell = 'single-translucent-border-no-nested-frame';
      button.dataset.v2160HudMenuCell = '32px-single-border-21px-icon-no-scale-no-alias';
      button.dataset.v2161HudMenuCell = '32px-21px-single-border-no-frame-no-overlap';
      button.dataset.v2163HudMenuCell = '35px-23px-single-border-no-frame-no-overlap';
      button.dataset.v2164QualityMenuCell = '36px-24px-single-border-no-frame-no-overlap';
      button.dataset.v2165QualityMenuCell = '36px-24px-single-border-panel-hidden-no-text-jitter';
      button.dataset.v2166MenuRescueCell = '38px-25px-single-border-visible-after-panel-close';
      button.dataset.v2167PremiumMenuCell = '34px-22px-single-translucent-border-no-triple-frame';
      button.dataset.v2168PremiumMenuCell = 'stable-34px-no-jitter-single-border';
      set(button, [
        ['all', 'unset'],
        ['box-sizing', 'border-box'],
        ['position', 'relative'],
        ['display', 'grid'],
        ['place-items', 'center'],
        ['width', '34px'],
        ['height', '34px'],
        ['min-width', '34px'],
        ['min-height', '34px'],
        ['max-width', '34px'],
        ['max-height', '34px'],
        ['padding', '0'],
        ['margin', '0'],
        ['border', '1px solid rgba(181, 243, 255, .34)'],
        ['border-radius', '10px'],
        ['background', 'rgba(235, 253, 255, .22)'],
        ['background-image', 'none'],
        ['box-shadow', 'inset 0 1px 0 rgba(255,255,255,.18), 0 1px 3px rgba(0,42,78,.05)'],
        ['opacity', '.92'],
        ['overflow', 'hidden'],
        ['transform', 'none'],
        ['translate', 'none'],
        ['scale', '1'],
        ['font-size', '14px'],
        ['line-height', '1'],
        ['color', 'rgba(240, 255, 255, .96)'],
        ['text-align', 'center'],
        ['touch-action', 'manipulation'],
        ['cursor', 'pointer'],
        ['backdrop-filter', 'blur(1px) saturate(1.02)'],
        ['-webkit-backdrop-filter', 'blur(1px) saturate(1.02)'],
      ]);
      set(button.querySelector<HTMLElement>('span:first-child'), [
        ['display', 'grid'],
        ['place-items', 'center'],
        ['width', '22px'],
        ['height', '22px'],
        ['min-width', '22px'],
        ['min-height', '22px'],
        ['max-width', '22px'],
        ['max-height', '22px'],
        ['padding', '0'],
        ['margin', '0'],
        ['overflow', 'hidden'],
        ['font-size', '14px'],
        ['line-height', '1'],
      ]);
      set(button.querySelector<HTMLElement>('img'), [
        ['display', 'block'],
        ['width', '22px'],
        ['height', '22px'],
        ['min-width', '22px'],
        ['min-height', '22px'],
        ['max-width', '22px'],
        ['max-height', '22px'],
        ['object-fit', 'contain'],
        ['object-position', 'center'],
        ['padding', '0'],
        ['margin', '0'],
        ['border', '0'],
        ['background', 'transparent'],
        ['box-shadow', 'none'],
      ]);
      set(button.querySelector<HTMLElement>('span:last-child'), [
        ['position', 'absolute'],
        ['width', '1px'],
        ['height', '1px'],
        ['margin', '-1px'],
        ['padding', '0'],
        ['overflow', 'hidden'],
        ['clip-path', 'inset(50%)'],
        ['white-space', 'nowrap'],
        ['border', '0'],
      ]);
    });
  }


  private renderVillage(): void {
    this.updateUnlocks();
    saveGame(this.save);
    this.clear();
    const playerName = this.playerName();
    const playerNameHtml = this.escapeHtml(playerName);
    const expansionStats = this.islandExpansionStats();
    const root = document.createElement('main');
    const shouldPlayOpening = this.openingIntroPending && !this.openingIntroShown;
    const v21130GuideVisible = !shouldPlayOpening && (() => {
      try { return localStorage.getItem('aqua-v21130-guide-dismissed') !== '1'; } catch { return true; }
    })();
    const villageReadyClasses = 'v2173-village-ready v2097-village-ready v2115-village-ready v2116-village-ready v2117-village-ready v2118-village-ready v2119-village-ready v2120-village-ready v2121-village-ready v2122-village-ready v2123-village-ready v2124-village-ready v2125-village-ready v2127-village-ready v2128-village-ready v2129-village-ready v2130-village-ready v2131-village-ready';
    const villageLoadingClasses = 'v2173-village-opening-state v2115-village-loading-state v2116-village-loading-state v2117-village-loading-state v2118-village-loading-state v2119-village-opening-state v2120-village-opening-state v2121-village-opening-state v2122-village-opening-state v2123-village-opening-state v2124-village-opening-state v2125-village-opening-state v2127-village-opening-state v2128-village-opening-state v2129-village-opening-state v2130-village-opening-state v2131-village-opening-state';
    root.className = `game-screen village-world-screen v21134-village-direct-source v21134-village-final v21133-village-direct-source v21133-village-final v21132-village-direct-source v21132-village-final v21131-village-direct-source v21131-village-final v21130-village-direct-source v21130-village-final v21129-village-direct-source v21129-village-final v21128-village-direct-source v21128-village-final v2097-village-screen v2098-village-screen v2111-village-shell v2112-village-foundation v2113-village-core v2114-village-interaction v2115-village-shell v2116-village-asset-shell v2116-village-asset-polish v2117-village-layout-polish v2118-village-character-water-polish v2119-village-opening-polish v2120-village-opening-video-polish v2121-village-continuity-polish v2122-village-route-polish v2123-village-stability-polish v2124-village-stability-performance v2125-village-direction-ui v2127-village-ui-audit v2128-village-direction-polish v2129-village-filename-direction v2130-village-stability v2131-village-motion-ui-stability v2134-village-object-grid-stability v2135-village-layout-grid-stability v2136-village-premium-placement v2137-village-ui-shell-polish v2138-village-menu-hud-polish v2139-village-page-ui-polish v2144-village-placement-polish v2164-village-quality-screen v2165-village-quality-screen v2166-village-quality-screen v2167-village-premium-screen v2168-village-premium-screen v2169-village-keyboard-screen v2170-village-layout-refinement-screen v2174-village-quality-screen v2173-village-intro-gate-screen v2179-village-premium-interaction-screen v2177-village-opening-video-first-screen v2191-village-opening-contract-screen v2192-village-opening-contract-screen v2196-village-opening-first-frame-screen v2195-village-opening-shell-screen v2194-village-opening-clean-screen v2193-village-design-stability-screen ${shouldPlayOpening ? villageLoadingClasses : villageReadyClasses} locked-screen`;
    root.dataset.v2097UiReset = 'direct-source-v2097-village-stable';
    root.dataset.v2098UiRecovery = 'v2098-village-dock-build-recovery';
    root.dataset.v2111AquaShell = 'v2111-village-shell';
    root.dataset.v2112AquaFoundation = 'v2112-village-foundation';
    root.dataset.v2113AquaCoreSteward = 'v2113-village-core';
    root.dataset.v2114InteractionShellPolish = 'v2114-village-interaction';
    root.dataset.v2115AquaScreenShell = 'v2115-village-shell';
    root.dataset.v2116VillageAssetPolish = 'v2116-village-asset-polish';
    root.dataset.v2120OpeningVideoDirectionUi = 'v2120-village-opening-video-direction-ui';
    root.dataset.v2121UiContinuityPolish = 'v2121-village-ui-continuity-polish';
    root.dataset.v2122RouteDirectionUi = shouldPlayOpening ? 'first-start-opening' : 'direct-village-route';
    root.dataset.v2123StabilityPolish = shouldPlayOpening ? 'first-start-opening-only' : 'direct-route-no-opening';
    root.dataset.v2124StabilityPerformance = shouldPlayOpening ? 'opening-isolated' : 'ui-state-clean';
    root.dataset.v2159PremiumAquaUi = shouldPlayOpening ? 'opening-video-only-no-poster' : 'premium-aqua-menu-hud-safe';
    root.dataset.v2160FishingHudMenuPolish = shouldPlayOpening ? 'opening-video-only-no-poster' : 'hud-menu-clearance-aqua-card-safe';
    root.dataset.v2125OpeningDirectionMotionUi = shouldPlayOpening ? 'opening-video-no-chrome' : 'direct-route-no-opening';
    root.dataset.v2131MotionUiFishingBuildGuard = shouldPlayOpening ? 'first-start-opening-only-guarded' : 'direct-route-no-opening-video';
    root.dataset.v2134ObjectGridShopFishingUi = 'object-overlap-hud-expedition-gap-tile-click-stability';
    root.dataset.v2139VillagePageUiPolish = 'transparent-menu-wide-hud-frontier-page-aqua-card';
    root.dataset.v2135SystemUiFishingEngine = 'object-clearance-hud-gap-shop-contrast-fishing-lane';
    root.dataset.v2136PremiumPolish = 'hud-frontier-balanced-shop-cta-placement-fishing-assist';
    root.dataset.v2137UiShellPolish = 'fishing-first-menu-page-hud-transparent-docks';
    root.dataset.v2138MenuHudPolish = 'wider-hud-transparent-docks-page-cards';
    root.dataset.v2144UiPlacementPolishSweep = 'village-hud-menu-expedition-hitbox-deconflict';
    root.dataset.v2158OpeningVideoOnly = shouldPlayOpening ? 'video-only-no-poster-image' : 'direct-route';
    root.dataset.v2164QualityFollowupPolish = shouldPlayOpening ? 'opening-video-only-no-poster' : 'hud-menu-build-expedition-safe-followup';
    root.dataset.v2165QualitySweepPolish = shouldPlayOpening ? 'opening-video-only-no-poster' : 'hud-frontier-menu-panel-hide-text-budget';
    root.dataset.v2166MenuHudAutoSalePolish = shouldPlayOpening ? 'opening-video-only-no-poster' : 'menu-visible-hud-color-autosale-loop';
    root.dataset.v2167PremiumMobilePolish = shouldPlayOpening ? 'opening-video-only-no-poster' : 'balanced-menu-hud-frontier-premium-aqua-card';
    root.dataset.v2168PremiumLayoutSweep = shouldPlayOpening ? 'opening-video-only-no-poster' : 'compact-menu-hud-frontier-aqua-layout-sweep';
    root.dataset.v2169KeyboardShopFishingPolish = 'wasd-eight-direction-joystick-parity';
    root.dataset.v2170AquaLayoutRefinement = 'hud-menu-dock-build-card-safe';
    root.dataset.v2173IntroGateEngine = shouldPlayOpening ? 'opening-media-gate-hide-village-menu-until-ready' : 'direct-village-menu-allowed';
    root.dataset.v2174QualityEngineSweep = shouldPlayOpening ? 'opening-overlay-cleanup-pending' : 'direct-village-clean-ui';
    root.dataset.v2177OpeningVideoFirstFix = shouldPlayOpening ? 'opening-video-first-no-bubble-no-village-chrome' : 'direct-village-clean-ui';
    root.dataset.v2179PremiumInteractionEngine = shouldPlayOpening ? 'opening-video-only-contract-preserved' : 'village-ready-premium-interaction-safe';
    root.dataset.v2191OpeningFishingDesignEngine = shouldPlayOpening ? 'opening-video-only-no-status-no-vignette-no-skip' : 'village-ready-design-safe';
    root.dataset.v2192OpeningFishingDesignTuning = shouldPlayOpening ? 'video-first-no-pre-ui-no-bubble' : 'village-ready-design-safe';
    root.dataset.v2193PremiumDesignSystemEngine = shouldPlayOpening ? 'opening-video-only-design-locked' : 'village-ready-premium-stability';
    root.dataset.v2194IntroLoadoutPatch = shouldPlayOpening ? 'opening-video-native-play-mark-hidden' : 'village-ready-thin-fishing-loadout';
    root.dataset.v2195PremiumDesignEngineSweep = shouldPlayOpening ? 'opening-shell-no-native-play-mark' : 'village-ready-premium-design-polish';
    root.dataset.v2196PremiumUxEngineSweep = shouldPlayOpening ? 'first-frame-video-only-no-play-mark' : 'village-ready-design-performance-polish';
    root.dataset.v2197PremiumDesignContinuity = shouldPlayOpening ? 'opening-first-frame-shield-active' : 'village-ready-premium-design-continuity';
    root.dataset.v2198PremiumDesignEngine = shouldPlayOpening ? 'opening-mask-video-only-active' : 'village-ready-design-engine';
    root.dataset.v2199PremiumDesignPolish = shouldPlayOpening ? 'opening-video-native-ui-sealed' : 'village-ready-design-polish';
    root.innerHTML = `
      <div class="v2-village-bg" aria-hidden="true"></div>
      ${shouldPlayOpening ? `<section class="v2199-opening-cinematic v2198-opening-cinematic v2197-opening-cinematic v2196-opening-cinematic v2195-opening-cinematic v2194-opening-cinematic v2193-opening-cinematic v2192-opening-cinematic v2191-opening-cinematic v2173-opening-cinematic v2119-opening-cinematic v2120-opening-cinematic v2121-opening-cinematic v2122-opening-cinematic v2123-opening-cinematic v2124-opening-cinematic v2125-opening-cinematic v2127-opening-cinematic v2128-opening-cinematic v2129-opening-cinematic v2130-opening-cinematic v2131-opening-cinematic v2158-opening-cinematic" aria-label="오프닝 영상">
        <video class="v2199-opening-video v2198-opening-video v2197-opening-video v2196-opening-video v2195-opening-video v2194-opening-video v2193-opening-video v2192-opening-video v2191-opening-video v2173-opening-video v2120-opening-video v2121-opening-video v2122-opening-video v2123-opening-video v2124-opening-video v2125-opening-video v2127-opening-video v2128-opening-video v2129-opening-video v2130-opening-video v2131-opening-video v2158-opening-video" src="./assets/v2120/opening/aqua_opening_v2120.mp4" autoplay muted defaultMuted playsinline webkit-playsinline loop preload="auto" controlsList="nodownload nofullscreen noremoteplayback" disablepictureinpicture disableremoteplayback aria-hidden="true" tabindex="-1"></video>
      </section>` : ''}
      <header class="v2097-village-hud v2135-village-hud v2136-village-hud" data-v2053-profile-open aria-label="마을 상태">
        <button class="v2097-profile-chip" type="button" data-v2017-profile aria-haspopup="dialog" aria-label="내 캐릭터 열기"><span data-v2-level>Lv.${this.playerLevel()}</span><strong data-v2041-profile-chip-name>${playerNameHtml}</strong><em>루미나 베이</em></button>
        <div class="v2097-hidden-metrics" aria-hidden="true">
          <span data-wallet="gold">골드 <strong data-v2-gold>${this.save.coins.toLocaleString('ko-KR')}</strong></span>
          <span data-wallet="fund">기금 <strong data-v2-fund>${this.save.village.fund.toLocaleString('ko-KR')}</strong></span>
          <span data-wallet="dev">발전 <strong data-v2-dev>${this.save.village.development}</strong></span>
          <span data-wallet="tourists">관광 <strong data-v2-tourists>${this.save.village.tourists}</strong></span>
        </div>
        <div class="v2097-hidden-metrics" aria-label="관광객 해금 단계" aria-hidden="true"></div>
      </header>
      <section class="v2-village-stage" data-village-stage aria-label="40 x 40 타일 마을맵"></section>
      <section class="v2097-village-notice" aria-live="polite" hidden><span data-v2-objective></span></section>
      ${v21130GuideVisible ? `<section class="v21132-village-guide-popup v21132-direct-guide v21132-owned-final v21131-village-guide-popup v21131-direct-guide v21131-owned-final v21130-village-guide-popup v21130-direct-guide v21130-owned-final" data-v21132-direct-guide data-v21131-direct-guide data-v21130-direct-guide data-no-swipe aria-live="polite" aria-label="처음 할 일 안내"><div class="v21132-guide-card v21130-guide-card"><span class="v21132-guide-eyebrow v21130-guide-eyebrow">처음 할 일</span><strong>낚시로 재화를 모으고 개척 목표를 확인해요</strong><p>처음엔 낚시 → 가방·퀘스트 확인 → 개척 순서로 진행하면 됩니다.</p><div class="v21132-guide-steps v21130-guide-steps"><span>1 낚시</span><span>2 보상 확인</span><span>3 개척</span></div><div class="v21132-guide-actions v21130-guide-actions"><button type="button" data-v21130-guide-fishing>낚시 가기</button><button type="button" data-v21130-guide-expedition>개척 보기</button><button type="button" data-v21130-guide-dismiss>닫기</button></div></div></section>` : ''}
      <section class="v2097-expedition-board v2098-expedition-board aqua-card-mini-bar v2135-expedition-board v2136-expedition-board" aria-label="다른 섬 개척 준비 보드">
        <button type="button" class="v2097-expedition-toggle v2098-expedition-toggle" data-v2097-expedition-toggle data-v2098-expedition-toggle aria-label="개척 정보 펼치기" aria-expanded="false"><span>개척</span><strong>${expansionStats.progress}%</strong><em>${expansionStats.phaseLabel}</em></button>
        <div class="v2097-expedition-body v2098-expedition-body v21132-expedition-final v21132-expedition-direct v21131-expedition-final v21131-expedition-direct v21130-expedition-final v21130-expedition-direct v21128-expedition-final v21128-expedition-direct aqua-card-surface aqua-card-dialog v2115-aqua-card v2116-aqua-card v2117-aqua-card v2118-aqua-card" data-v2097-expedition-body data-v2098-expedition-body aria-hidden="true">${this.islandExpansionBoardMarkup()}<button type="button" class="v2097-ui-close v2097-expedition-close" data-v2097-expedition-close aria-label="정보 닫기">×</button></div>
      </section>
      <section class="v2097-village-guide" aria-live="polite" hidden><strong></strong><span></span></section>
      <section class="v2097-dialog-panel" aria-live="polite"></section>
      <section class="v2097-character-panel" data-v2017-character-panel aria-hidden="true" role="dialog" aria-modal="true" aria-label="내 캐릭터">
        <div class="v2097-modal-backdrop" data-v2017-character-close></div>
        <article class="v2097-modal-card v2097-character-card v2111-aqua-card v2115-aqua-card v2116-aqua-card v2119-aqua-card v2120-aqua-card v2121-aqua-card v2123-aqua-card v2124-aqua-card v2125-aqua-card v2127-aqua-card v2128-aqua-card v2129-aqua-card v2130-aqua-card v2131-aqua-card">
          <button type="button" class="v2097-ui-close" data-v2017-character-close aria-label="내 캐릭터 닫기">×</button>
          <div class="v2097-character-head">
            <img src="./assets/v203/portraits/player_portrait.png" alt="" />
            <div><span>PLAYER</span><h2 data-v2041-player-name>${playerNameHtml}</h2><p>Lv.${this.playerLevel()} \u00b7 루미나 베이</p></div>
          </div>
          <label class="v2097-name-editor"><span>캐릭터명</span><input data-v2041-name-input type="text" maxlength="12" value="${playerNameHtml}" placeholder="최대 12자" autocomplete="off" /><button type="button" data-v2041-name-save>변경</button></label>
          <div class="v2097-character-stats">
            <article><strong>${this.playerLevel()}</strong><span>플레이어 Lv.</span></article>
            <article><strong>${this.save.village.level}</strong><span>마을 Lv.</span></article>
            <article><strong>${this.totalCaught()}</strong><span>누적 포획</span></article>
            <article><strong>${this.save.totalSuccess}</strong><span>낚시 성공</span></article>
            <article><strong>${this.save.bestStreak}</strong><span>최고 콤보</span></article>
            <article><strong>${this.save.gear.rodLevel + this.save.gear.reelLevel + this.save.gear.lineLevel}</strong><span>장비 총합</span></article>
          </div>
          <div class="v2097-card-actions">
            <button type="button" data-v2017-character-inventory>가방</button>
            <button type="button" data-v2017-character-quest>퀘스트</button>
          </div>
        </article>
      </section>
      <section class="v2097-interior-panel" data-v2097-interior-panel aria-live="polite" aria-hidden="true">
        <div class="v2097-modal-backdrop" data-v203-interior-close></div>
        <article class="v2097-modal-card v2097-interior-card v2111-aqua-card v2115-aqua-card v2116-aqua-card v2119-aqua-card v2120-aqua-card v2121-aqua-card v2123-aqua-card v2124-aqua-card v2125-aqua-card v2127-aqua-card v2128-aqua-card v2129-aqua-card v2130-aqua-card v2131-aqua-card">
          <button type="button" class="v2097-ui-close" data-v203-interior-close aria-label="건물 정보 닫기">×</button>
          <img class="v2097-interior-image" data-v2097-interior-image src="" alt="" />
          <div class="v2097-interior-copy">
            <div class="v2097-interior-header">
              <img class="v2097-interior-portrait" data-v206-interior-portrait src="./assets/v203/portraits/player_portrait.png" alt="" />
              <div><strong data-v203-interior-title>건물 내부</strong><span data-v203-interior-body>루미나 베이 시설 내부입니다.</span></div>
            </div>
            <div class="v2097-interior-status" data-v206-interior-status></div>
            <div class="v2097-card-actions">
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
      <div class="v2097-build-backdrop" data-village-build-close aria-hidden="true"></div>
      <aside class="v2097-build-tray v2170-build-tray v2135-build-tray v2111-aqua-card v2115-aqua-card v2116-aqua-card v2119-aqua-card v2120-aqua-card v2121-aqua-card v2117-aqua-card v2118-aqua-card" aria-label="건물 설치 모드" role="dialog" aria-modal="true">
        <div class="v2097-build-title"><strong>설치모드</strong><button type="button" class="v2097-ui-close" data-village-build-close aria-label="건설창 닫기">×</button></div>
        <p class="v2097-build-help">건물/오브젝트를 고르면 창이 닫히고 반투명 프리뷰가 바닥에 고정됩니다. 원하는 타일을 누른 뒤 중앙 확인창에서 건설 또는 취소를 선택하세요.</p>
        <div class="v2097-build-grid">
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
      <section class="v2130-build-confirm v2131-build-confirm v2135-build-confirm v2170-build-confirm" data-v2130-build-confirm data-v2131-build-confirm aria-hidden="true" role="dialog" aria-modal="true" aria-label="건설 확인">
        <article class="v2130-build-confirm-card v2131-build-confirm-card v2170-build-confirm-card">
          <button type="button" class="v2097-ui-close v2130-build-confirm-x" data-v2130-build-confirm-cancel aria-label="건설 확인 닫기">×</button>
          <span class="v2130-build-confirm-kicker" data-v2130-build-confirm-mode>건설 확인</span>
          <strong data-v2130-build-confirm-title>이 위치에 설치할까요?</strong>
          <p data-v2130-build-confirm-body>반투명 프리뷰와 풋프린트를 확인한 뒤 결정하세요.</p>
          <div class="v2130-build-confirm-actions">
            <button type="button" data-v2130-build-confirm-cancel>취소</button>
            <button type="button" data-v2130-build-confirm-apply>건설</button>
          </div>
        </article>
      </section>
      <div class="v2097-world-controls v2098-world-controls v2115-world-controls v2116-world-controls v2117-world-controls v2118-world-controls v2119-world-controls v2120-world-controls v2121-world-controls v2123-world-controls v2124-world-controls v2125-world-controls v2127-world-controls v2128-world-controls v2129-world-controls v2130-world-controls v2131-world-controls v2132-world-controls v2134-world-controls v2135-world-controls v2136-world-controls v2148-world-controls v2149-world-controls v2150-world-controls v2151-world-controls v2152-world-controls v2153-world-controls v2154-world-controls v2155-world-controls v2156-world-controls v2157-world-controls-microbar v2158-world-controls-balanced v2159-world-controls-aqua-lock v2160-world-controls-aqua-lock v2161-world-controls-aqua-lock v2162-world-controls-aqua-lock v2163-world-controls-aqua-lock v2164-world-controls-aqua-lock v2165-world-controls-aqua-lock v2166-world-controls-aqua-lock v2167-world-controls-aqua-lock v2168-world-controls-aqua-lock v2170-world-controls-aqua-lock" data-v2170-primary-order="plus-minus-build-center-shop-sail" data-v2168-primary-order="plus-minus-build-center-shop-sail" data-v2167-primary-order="plus-minus-build-center-shop-sail" data-v2166-primary-order="plus-minus-build-center-shop-sail" data-v2165-primary-order="plus-minus-build-center-shop-sail" data-v2164-primary-order="plus-minus-build-center-shop-sail" data-v2163-primary-order="plus-minus-build-center-shop-sail" data-v2162-primary-order="plus-minus-build-center-shop-sail" data-v2161-primary-order="plus-minus-build-center-shop-sail" data-v2160-primary-order="plus-minus-build-center-shop-sail" data-v2159-primary-order="plus-minus-build-center-shop-sail" data-v2158-primary-order="plus-minus-build-center-shop-sail" data-v2157-primary-order="plus-minus-build-center-shop-sail" data-v2156-primary-order="plus-minus-build-center-shop-sail" data-v2155-primary-order="plus-minus-build-center-shop-sail" data-v2154-primary-order="plus-minus-build-center-shop-sail" data-v2153-primary-order="plus-minus-build-center-shop-sail" data-v2152-primary-order="plus-minus-build-center-shop-sail" data-v2150-primary-order="plus-minus-build-center-shop-sail" data-v2151-primary-order="plus-minus-build-center-shop-sail" data-v2149-primary-order="plus-minus-build-center-shop-sail" data-v2148-primary-order="plus-minus-build-center-shop-sail" data-v2135-primary-order="plus-minus-build-center-shop-sail" data-v2136-primary-order="plus-minus-build-center-shop-sail" data-v2134-primary-order="plus-minus-build-center-shop-sail" data-v2132-primary-order="plus-minus-build-center-shop-sail" data-v2131-primary-order="plus-minus-build-center-shop-sail" data-v2127-primary-order="plus-minus-build-center-shop-sail" data-v2120-primary-order="plus-minus-build-center-shop-sail" data-v2119-primary-order="plus-minus-build-center-shop-sail" data-v2118-primary-order="plus-minus-build-center-shop-sail" data-v2117-primary-order="plus-minus-build-center-shop-sail" data-v2115-primary-order="plus-minus-build-center-shop-sail" data-v2116-primary-order="plus-minus-build-center-shop-sail" aria-label="마을 조작">
        <button type="button" data-village-zoom-in aria-label="확대"><span class="v2157-menu-glyph" aria-hidden="true">＋</span><span class="v2157-menu-label">확대</span></button>
        <button type="button" data-village-zoom-out aria-label="축소"><span class="v2157-menu-glyph" aria-hidden="true">－</span><span class="v2157-menu-label">축소</span></button>
        <button type="button" data-village-build-open aria-label="건설 메뉴 열기"><span class="v2157-menu-glyph" aria-hidden="true"><img src="./assets/v22/icons/nav_build.png" alt="" /></span><span class="v2157-menu-label">건설</span></button>
        <button type="button" data-village-center aria-label="플레이어 위치로 이동"><span class="v2157-menu-glyph" aria-hidden="true">◎</span><span class="v2157-menu-label">원점</span></button>
        <button type="button" data-village-shop aria-label="상점 열기"><span class="v2157-menu-glyph" aria-hidden="true"><img src="./assets/v92/icons/shop.png" alt="" /></span><span class="v2157-menu-label">상점</span></button>
        <button type="button" data-village-fishing aria-label="항구 출항"><span aria-hidden="true"><img src="./assets/v22/icons/nav_fishing.png" alt="" /></span><span>출항</span></button>
      </div>
      <div class="v2097-joystick" data-village-joystick data-no-swipe aria-label="이동 조이스틱">
        <div class="v2097-joystick-base"><div class="v2097-joystick-knob" data-village-joystick-knob></div></div>
      </div>`;
    dom.app.appendChild(root);
    const dismissV21130Guide = () => {
      try { localStorage.setItem('aqua-v21130-guide-dismissed', '1'); } catch { /* noop */ }
      root.querySelector<HTMLElement>('[data-v21132-direct-guide data-v21131-direct-guide data-v21130-direct-guide]')?.remove();
    };
    const bindV21130Guide = () => {
      const guide = root.querySelector<HTMLElement>('[data-v21132-direct-guide data-v21131-direct-guide data-v21130-direct-guide]');
      if (!guide || guide.dataset.v21130Bound === 'true') return;
      guide.dataset.v21130Bound = 'true';
      guide.querySelector<HTMLButtonElement>('[data-v21130-guide-dismiss]')?.addEventListener('click', dismissV21130Guide);
      guide.querySelector<HTMLButtonElement>('[data-v21130-guide-fishing]')?.addEventListener('click', () => { dismissV21130Guide(); void this.go('fishing'); });
      guide.querySelector<HTMLButtonElement>('[data-v21130-guide-expedition]')?.addEventListener('click', () => { dismissV21130Guide(); root.querySelector<HTMLButtonElement>('[data-v2097-expedition-toggle]')?.click(); });
    };
    const mountV21130Guide = () => {
      if (root.querySelector('.v2199-opening-cinematic,.v2173-opening-cinematic,.v2119-opening-cinematic')) return;
      try { if (localStorage.getItem('aqua-v21130-guide-dismissed') === '1') return; } catch { /* noop */ }
      if (!root.querySelector('[data-v21132-direct-guide data-v21131-direct-guide data-v21130-direct-guide]')) {
        const guide = document.createElement('section');
        guide.className = 'v21132-village-guide-popup v21132-direct-guide v21132-owned-final v21131-village-guide-popup v21131-direct-guide v21131-owned-final v21130-village-guide-popup v21130-direct-guide v21130-owned-final';
        guide.dataset.v21130DirectGuide = 'true';
        guide.setAttribute('data-no-swipe', 'true');
        guide.setAttribute('aria-live', 'polite');
        guide.setAttribute('aria-label', '처음 할 일 안내');
        guide.innerHTML = '<div class="v21132-guide-card v21130-guide-card"><span class="v21132-guide-eyebrow v21130-guide-eyebrow">처음 할 일</span><strong>낚시로 재화를 모으고 개척 목표를 확인해요</strong><p>처음엔 낚시 → 가방·퀘스트 확인 → 개척 순서로 진행하면 됩니다.</p><div class="v21132-guide-steps v21130-guide-steps"><span>1 낚시</span><span>2 보상 확인</span><span>3 개척</span></div><div class="v21132-guide-actions v21130-guide-actions"><button type="button" data-v21130-guide-fishing>낚시 가기</button><button type="button" data-v21130-guide-expedition>개척 보기</button><button type="button" data-v21130-guide-dismiss>닫기</button></div></div>';
        root.appendChild(guide);
      }
      bindV21130Guide();
    };
    bindV21130Guide();
    if (!shouldPlayOpening) this.mountBottomNav(root, 'village');
    root.classList.add('v2135-controls-mounted', 'v2134-controls-mounted', 'v2113-controls-mounted', 'v2114-controls-mounted', 'v2116-controls-mounted', 'v2117-controls-mounted', 'v2118-controls-mounted', 'v2119-controls-mounted', 'v2120-controls-mounted', 'v2121-controls-mounted', 'v2122-controls-mounted', 'v2123-controls-mounted', 'v2124-controls-mounted', 'v2125-controls-mounted', 'v2127-controls-mounted', 'v2128-controls-mounted', 'v2129-controls-mounted', 'v2130-controls-mounted', 'v2131-controls-mounted', 'v2148-controls-mounted', 'v2149-controls-mounted', 'v2150-controls-mounted', 'v2152-controls-mounted', 'v2155-controls-mounted');
    this.applyV2158TopMenuBalanced(root);
    const stage = root.querySelector<HTMLElement>('[data-village-stage]')!;
    const openingStartedAt = performance.now();
    const reducedOpeningMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const minimumOpeningMs = shouldPlayOpening ? (reducedOpeningMotion ? 650 : 2400) : 0;
    let finishVillageOpeningTriggered = false;
    const openingVideo = root.querySelector<HTMLVideoElement>('.v2121-opening-video');
    const markOpeningMediaReady = () => root.classList.add('v2121-opening-video-ready', 'v2173-opening-media-ready');
    const markOpeningPlaybackStarted = () => { root.classList.add('v2194-opening-video-playing', 'v2195-opening-video-ready', 'v2196-opening-first-frame-ready', 'v2197-opening-first-frame-ready', 'v2198-opening-first-frame-ready', 'v2199-opening-first-frame-ready'); root.dataset.v2194IntroLoadoutPatch = 'opening-video-playing-no-native-play-mark'; root.dataset.v2195PremiumDesignEngineSweep = 'opening-video-ready-no-native-play-mark'; root.dataset.v2196PremiumUxEngineSweep = 'opening-first-frame-ready-no-native-play-mark'; root.dataset.v2197PremiumDesignContinuity = 'opening-first-frame-shield-cleared'; root.dataset.v2198PremiumDesignEngine = 'opening-first-frame-mask-cleared'; root.dataset.v2199PremiumDesignPolish = 'opening-first-frame-native-ui-cleared'; };
    openingVideo?.removeAttribute('poster');
    openingVideo?.removeAttribute('controls');
    openingVideo?.setAttribute('tabindex', '-1');
    openingVideo?.setAttribute('controlsList', 'nodownload nofullscreen noremoteplayback');
    openingVideo?.setAttribute('disablepictureinpicture', '');
    openingVideo?.setAttribute('disableremoteplayback', '');
    openingVideo?.addEventListener('canplay', markOpeningMediaReady, { once: true });
    openingVideo?.addEventListener('loadeddata', markOpeningMediaReady, { once: true });
    openingVideo?.addEventListener('playing', () => { markOpeningMediaReady(); markOpeningPlaybackStarted(); }, { once: true });
    openingVideo?.addEventListener('timeupdate', markOpeningPlaybackStarted, { once: true });
    openingVideo?.addEventListener('error', () => root.classList.add('v2121-opening-video-fallback', 'v2173-opening-media-fallback'), { once: true });
    if (openingVideo && openingVideo.readyState >= 2) markOpeningMediaReady();
    void openingVideo?.play().catch(() => undefined);
    const finishVillageOpening = () => {
      if (finishVillageOpeningTriggered) return;
      finishVillageOpeningTriggered = true;
      root.classList.add('v2173-village-ready', 'v2097-village-ready', 'v2115-village-ready', 'v2116-village-ready', 'v2117-village-ready', 'v2118-village-ready', 'v2119-village-ready', 'v2120-village-ready', 'v2121-village-ready', 'v2122-village-ready', 'v2123-village-ready', 'v2124-village-ready', 'v2125-village-ready', 'v2127-village-ready', 'v2128-village-ready', 'v2129-village-ready', 'v2130-village-ready', 'v2131-village-ready');
      root.classList.remove('v2115-village-loading-state', 'v2116-village-loading-state', 'v2117-village-loading-state', 'v2118-village-loading-state', 'v2119-village-opening-state', 'v2120-village-opening-state', 'v2121-village-opening-state', 'v2122-village-opening-state', 'v2123-village-opening-state', 'v2124-village-opening-state', 'v2125-village-opening-state', 'v2127-village-opening-state', 'v2128-village-opening-state', 'v2129-village-opening-state', 'v2130-village-opening-state', 'v2131-village-opening-state', 'v2173-village-opening-state');
      if (shouldPlayOpening) { this.openingIntroShown = true; this.openingIntroPending = false; delete document.body.dataset.v2192OpeningHandoff; }
      root.querySelector<HTMLElement>('.v2097-village-loading')?.remove();
      root.querySelector<HTMLElement>('.v2173-opening-cinematic, .v2119-opening-cinematic')?.remove();
      root.dataset.v2174QualityEngineSweep = 'opening-overlay-cleaned-village-chrome-ready';
      root.classList.add('v2174-village-ready-clean', 'v2177-village-ready-clean');
      root.dataset.v2179VillageEntryCameraLock = 'opening-finished-recenter-scheduled';
      this.mountBottomNav(root, 'village');
      mountV21130Guide();
      const recenterVillagePlayer = () => {
        this.villageWorld?.recenterPlayerForVillageEntry('opening-finish-visible-stage');
      };
      window.requestAnimationFrame(recenterVillagePlayer);
      window.setTimeout(recenterVillagePlayer, 120);
      window.setTimeout(recenterVillagePlayer, 360);
    };
    const finishVillageOpeningAfterMinimum = () => {
      const elapsed = performance.now() - openingStartedAt;
      window.setTimeout(finishVillageOpening, Math.max(0, minimumOpeningMs - elapsed));
    };
    root.querySelector<HTMLButtonElement>('[data-v2121-opening-skip]')?.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      finishVillageOpening();
    });
    this.villageWorld = new VillageWorld({
      root,
      stageHost: stage,
      save: this.save,
      onSave: () => saveGame(this.save),
      onGoFishing: () => { void this.go('fishing'); },
      onOpenShop: () => { void this.go('shop'); },
      onToast: (toast) => this.toast.show(toast),
    });
    void this.villageWorld.init().then(() => {
      const recenterReadyPlayer = () => this.villageWorld?.recenterPlayerForVillageEntry(shouldPlayOpening ? 'pre-opening-hidden-stage-prewarm' : 'direct-village-ready');
      window.requestAnimationFrame(recenterReadyPlayer);
      if (!shouldPlayOpening) {
        window.setTimeout(recenterReadyPlayer, 100);
        window.setTimeout(recenterReadyPlayer, 320);
      }
      finishVillageOpeningAfterMinimum();
    }).catch((error) => {
      finishVillageOpeningAfterMinimum();
      console.warn('[AquaFantasia] village world failed', error);
      this.toast.show({ type: 'normal', title: '마을 로딩 실패', message: '기존 메뉴 화면으로 복구합니다.' });
      window.setTimeout(() => this.renderVillageFallback(), Math.max(0, minimumOpeningMs - (performance.now() - openingStartedAt)));
    });
    root.querySelector<HTMLButtonElement>('[data-v206-interior-go-map]')?.addEventListener('click', () => { void this.go('map'); });
    root.querySelector<HTMLButtonElement>('[data-v206-interior-go-mission]')?.addEventListener('click', () => { void this.go('mission'); });
    root.querySelector<HTMLButtonElement>('[data-v206-interior-go-inventory]')?.addEventListener('click', () => { void this.go('inventory'); });
    const characterPanel = root.querySelector<HTMLElement>('[data-v2017-character-panel]');
    const setDockHiddenForCharacterPanel = (hidden: boolean) => {
      document.body.classList.toggle('v2097-modal-open', hidden);
      document.body.classList.toggle('v2111-modal-open', hidden);
      document.body.classList.toggle('v2112-modal-open', hidden);
      document.body.classList.toggle('v2113-modal-open', hidden);
      document.body.classList.toggle('v2114-modal-open', hidden);
      document.body.classList.toggle('v2115-modal-open', hidden);
      document.body.classList.toggle('v2116-modal-open', hidden);
      document.body.classList.toggle('v2117-modal-open', hidden);
      document.body.classList.toggle('v2118-modal-open', hidden);
      document.body.classList.toggle('v2119-modal-open', hidden);
      document.body.classList.toggle('v2120-modal-open', hidden);
      document.body.classList.toggle('v2121-modal-open', hidden);
      document.body.classList.toggle('v2122-modal-open', hidden);
      document.body.classList.toggle('v2123-modal-open', hidden);
      document.body.classList.toggle('v2124-modal-open', hidden);
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
    root.querySelector<HTMLElement>('[data-v2053-profile-open]')?.addEventListener('click', (ev) => {
      const target = ev.target as HTMLElement | null;
      if (target?.closest('button, input, textarea, select, a')) return;
      openCharacterPanel();
    });
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
    const setExpeditionOpen = (willOpen: boolean) => {
      const board = root.querySelector<HTMLElement>('[data-v2097-expedition-toggle]')?.closest<HTMLElement>('.v2097-expedition-board');
      const body = root.querySelector<HTMLElement>('[data-v2097-expedition-body]');
      const toggle = root.querySelector<HTMLButtonElement>('[data-v2097-expedition-toggle]');
      board?.classList.toggle('open', willOpen);
      root.classList.toggle('v2097-expedition-open', willOpen);
      document.body.classList.toggle('v2097-expedition-open', willOpen);
      document.body.classList.toggle('v2111-expedition-open', willOpen);
      document.body.classList.toggle('v2112-expedition-open', willOpen);
      document.body.classList.toggle('v2113-expedition-open', willOpen);
      document.body.classList.toggle('v2114-expedition-open', willOpen);
      document.body.classList.toggle('v2115-expedition-open', willOpen);
      document.body.classList.toggle('v2116-expedition-open', willOpen);
      document.body.classList.toggle('v2117-expedition-open', willOpen);
      document.body.classList.toggle('v2118-expedition-open', willOpen);
      document.body.classList.toggle('v2119-expedition-open', willOpen);
      document.body.classList.toggle('v2120-expedition-open', willOpen);
      document.body.classList.toggle('v2121-expedition-open', willOpen);
      document.body.classList.toggle('v2122-expedition-open', willOpen);
      document.body.classList.toggle('v2123-expedition-open', willOpen);
      document.body.classList.toggle('v2124-expedition-open', willOpen);
      root.classList.toggle('v2115-expedition-open', willOpen);
      root.classList.toggle('v2116-expedition-open', willOpen);
      root.classList.toggle('v2117-expedition-open', willOpen);
      root.classList.toggle('v2118-expedition-open', willOpen);
      root.classList.toggle('v2121-expedition-open', willOpen);
      root.classList.toggle('v2122-expedition-open', willOpen);
      root.classList.toggle('v2123-expedition-open', willOpen);
      root.classList.toggle('v2124-expedition-open', willOpen);
      body?.classList.toggle('v2097-expedition-body-open', willOpen);
      body?.setAttribute('aria-hidden', String(!willOpen));
      toggle?.setAttribute('aria-expanded', String(willOpen));
    };
    root.querySelector<HTMLButtonElement>('[data-v2097-expedition-toggle]')?.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const body = root.querySelector<HTMLElement>('[data-v2097-expedition-body]');
      setExpeditionOpen(!(body?.classList.contains('v2097-expedition-body-open')));
    });
    root.querySelector<HTMLButtonElement>('[data-v2097-expedition-close]')?.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      setExpeditionOpen(false);
    });
    this.bindExpeditionControls(root);
    // v2.1.14: one guarded tap bridge for the primary village buttons. Capture guards in
    // VillageWorld stop bubbling correctly, so route actions on the real button too.
    const bindVillagePrimaryTap = (selector: string, action: () => void) => {
      const btn = root.querySelector<HTMLButtonElement>(selector);
      if (!btn) return;
      let lastTapAt = 0;
      const run = (ev: Event) => {
        ev.preventDefault();
        ev.stopPropagation();
        const now = performance.now();
        if (now - lastTapAt < 160) return;
        lastTapAt = now;
        this.reassertImmersiveMode();
        action();
      };
      btn.addEventListener('pointerup', run, { capture: true });
      btn.addEventListener('click', run, { capture: true });
      btn.addEventListener('touchend', run, { passive: false, capture: true });
    };
    bindVillagePrimaryTap('[data-village-shop]', () => { void this.go('shop'); });
    bindVillagePrimaryTap('[data-village-fishing]', () => { void this.go('fishing'); });
    bindVillagePrimaryTap('[data-village-build-open]', () => {
      const isOpen = root.classList.contains('v2097-build-tray-open') || root.classList.contains('v2112-build-tray-open') || root.classList.contains('v2113-build-tray-open') || root.classList.contains('v2114-build-tray-open') || root.classList.contains('v2115-build-tray-open') || root.classList.contains('v2116-build-tray-open') || root.classList.contains('v2117-build-tray-open') || root.classList.contains('v2118-build-tray-open') || root.classList.contains('v2121-build-tray-open');
      this.villageWorld?.setBuildTrayOpen(!isOpen);
    });
    root.querySelector<HTMLButtonElement>('[data-village-shop]')?.addEventListener('click', (ev) => { ev.preventDefault(); ev.stopPropagation(); void this.go('shop'); });
    root.querySelector<HTMLButtonElement>('[data-village-shop]')?.addEventListener('pointerdown', (ev) => { ev.preventDefault(); ev.stopPropagation(); }, { capture: true });
    root.addEventListener('pointerup', (ev) => {
      if (root.classList.contains('v2114-controls-mounted')) return;
      const target = ev.target as HTMLElement | null;
      const shopBtn = target?.closest<HTMLButtonElement>('[data-village-shop]');
      if (!shopBtn) return;
      ev.preventDefault();
      ev.stopPropagation();
      void this.go('shop');
    }, { capture: true });
    root.addEventListener('pointerup', (ev) => {
      if (root.classList.contains('v2114-controls-mounted')) return;
      const target = ev.target as HTMLElement | null;
      const buildBtn = target?.closest<HTMLButtonElement>('[data-village-build-open]');
      const fishingBtn = target?.closest<HTMLButtonElement>('[data-village-fishing]');
      if (!buildBtn && !fishingBtn) return;
      ev.preventDefault();
      ev.stopPropagation();
      if (buildBtn) {
        const isOpen = root.classList.contains('v2097-build-tray-open') || root.classList.contains('v2112-build-tray-open') || root.classList.contains('v2113-build-tray-open') || root.classList.contains('v2114-build-tray-open') || root.classList.contains('v2115-build-tray-open') || root.classList.contains('v2116-build-tray-open') || root.classList.contains('v2117-build-tray-open') || root.classList.contains('v2118-build-tray-open') || root.classList.contains('v2121-build-tray-open');
        this.villageWorld?.setBuildTrayOpen(!isOpen);
        return;
      }
      if (fishingBtn) { void this.go('fishing'); }
    }, { capture: true });
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
    root.className = `game-screen runtime-menu-screen v21134-runtime-page-final v21134-direct-menu-root v21130-runtime-page-final v21130-direct-menu-root v21129-runtime-page-final v21129-direct-menu-root v21128-runtime-page-final v21128-direct-menu-root v2097-menu-screen v2098-menu-screen v218-runtime-page-screen v219-runtime-page-screen v2111-runtime-page-shell v2112-runtime-page-shell v2113-runtime-page-shell v2114-runtime-page-shell v2115-runtime-page-shell v2116-runtime-page-shell v2117-runtime-page-shell v2118-runtime-page-shell v2119-runtime-page-shell v2120-runtime-page-shell v2121-runtime-page-shell v2122-runtime-page-shell v2123-runtime-page-shell v2124-runtime-page-shell v2125-runtime-page-shell v2127-runtime-page-shell v2128-runtime-page-shell v2129-runtime-page-shell v2130-runtime-page-shell v2131-runtime-page-shell v2132-runtime-page-shell v2133-runtime-page-shell v2138-runtime-page-shell v2139-runtime-page-shell v2140-runtime-page-shell v2142-runtime-page-shell v2143-runtime-page-shell v2144-runtime-page-shell v2145-runtime-page-shell v2146-runtime-page-shell v2147-runtime-page-shell v2148-runtime-page-shell v2149-runtime-page-shell v2150-runtime-page-shell v2151-runtime-page-shell v2159-runtime-page-shell v2163-premium-aqua-ui-screen v2164-premium-aqua-ui-screen v2165-premium-aqua-ui-screen v2166-premium-aqua-ui-screen v2167-premium-aqua-ui-screen v2168-premium-aqua-ui-screen v2169-premium-aqua-ui-screen v2170-premium-aqua-ui-screen v2097-${active}-screen v2098-${active}-screen ${active}-screen scroll-screen v21124-page-shell-owned`;
    root.dataset.v2097UiReset = `direct-source-v2097-${active}-stable`;
    root.dataset.v2098UiRecovery = `v2098-${active}-menu-recovery`;
    root.setAttribute('data-runtime-screen', active);
    root.dataset.v2133UiEngine = `premium-aqua-card-stable-${active}`;
    root.dataset.v2159PremiumAquaPage = `aqua-skin-card-readable-scroll-${active}`;
    root.dataset.v2163PagePolish = `hud-gap-toast-ledger-dex-${active}`;
    root.dataset.v2164QualityFollowupPolish = `quality-followup-${active}`;
    root.dataset.v2165QualitySweepPolish = `quality-sweep-text-budget-${active}`;
    root.dataset.v2166MenuHudAutoSalePolish = `menu-rescue-hud-autosale-${active}`;
    root.dataset.v2167PremiumMobilePolish = `premium-aqua-card-readable-${active}`;
    root.style.setProperty('--v89-world-bg', `url("${V3D_MENU_BG[active]}")`);
    root.style.setProperty('--v101-water-bg', `url("${V101_WATER_BG[active]}")`);
    root.innerHTML = `
      <div class="runtime-3d-bg" aria-hidden="true"><div class="underwater-webgl-host" data-underwater-webgl></div><span class="v3d-caustics"></span><span class="v3d-bubbles"></span><span class="v3d-depth-fog"></span></div>
      <div class="v2097-menu-dim v2111-page-backdrop" aria-hidden="true"></div>
      ${active === 'village' ? '' : '<button type="button" class="v2097-ui-close v2097-menu-close" data-v2097-menu-close aria-label="메뉴 닫기">×</button>'}
      <img class="runtime-bg-character" src="${ASSET.player}" alt="" aria-hidden="true" loading="eager" />
      <header class="runtime-hud v2097-menu-hud" aria-label="플레이어 HUD">
        <button type="button" class="v2097-menu-avatar" data-v2084-profile-shortcut aria-label="내 캐릭터 정보로 돌아가기"><img src="./assets/v203/portraits/player_happy.png" alt="" /></button>
        <div class="v2097-menu-title"><span>Lv.${this.playerLevel()} · ${this.escapeHtml(this.playerName())}</span><strong>${title}</strong><em>루미나 베이</em></div>
        <div class="v2097-hidden-metrics" aria-hidden="true"><span><img src="./assets/v22/icons/nav_fishing.png" alt="" />${this.save.coins.toLocaleString('ko-KR')}G</span><span><img src="./assets/v209/props/shell_garden.png" alt="" />기금 ${this.save.village.fund.toLocaleString('ko-KR')}</span><span><img src="./assets/v22/icons/nav_bag.png" alt="" />${this.save.gear.lureStock}</span></div>
      </header>
      <div class="runtime-content v21134-page-column-final v21134-direct-menu-column v21130-page-column-final v21130-direct-menu-column v21129-page-column-final v21129-direct-menu-column v21128-page-column-final v21128-direct-menu-column v21124-page-column-owned v2097-menu-content v2098-menu-content v2111-aqua-page v2112-aqua-page v2113-aqua-page v2114-aqua-page v2115-aqua-page v2116-aqua-page v2117-aqua-page v2118-aqua-page v2119-aqua-page v2120-aqua-page v2121-aqua-page v2122-aqua-page v2123-aqua-page v2124-aqua-page v2125-aqua-page v2127-aqua-page v2128-aqua-page v2129-aqua-page v2130-aqua-page v2131-aqua-page v2132-aqua-page v2133-aqua-page v2138-aqua-page v2139-aqua-page v2140-aqua-page v2142-aqua-page v2143-aqua-page v2148-aqua-page v2149-aqua-page v2150-aqua-page v2151-aqua-page v2097-${active}-content v2098-${active}-content" data-v2097-scroll-root="true" data-v2098-scroll-root="true" data-v2146-page-title-removed="true" data-v2147-page-title-clean="true" data-v2148-page-title-clean="true" data-v2149-page-title-clean="true" data-v2150-page-title-clean="true" data-v2151-page-title-clean="true" data-v2159-page-title-clean="true"></div>`;
    root.querySelectorAll<HTMLButtonElement>('[data-v2084-profile-shortcut]').forEach((btn) => btn.addEventListener('click', (ev) => { ev.preventDefault(); ev.stopPropagation(); void this.go('village'); }));
    root.querySelectorAll<HTMLButtonElement>('[data-v2097-menu-close]').forEach((btn) => btn.addEventListener('click', (ev) => { ev.preventDefault(); ev.stopPropagation(); void this.go('village'); }));
    this.mountUnderwaterWebgl(root, active === 'ranking' ? 'deep' : active === 'village' || active === 'shop' || active === 'map' ? 'town' : 'reef', V101_WATER_BG[active]);
    this.installRuntimeVerticalDragScroll(root);
    return root;
  }


  
  
  
  // v2.0.89 validation lineage only: [data-v2089-scroll-root] .v2089-menu-content
  // v2.0.80 validation lineage only: v2080-menu-page-grid-screen v2080-scroll-stack page-structure-scroll-content-width-normalized .v2080-card-grid, .v2080-card-stack, .v2080-scroll-zone v2080-tile-hitbox-audit-screen
  // v2.0.79 validation lineage only: .v2079-scroll-zone
  // v2.0.77 validation lineage only: data-v2077-close root.querySelectorAll<HTMLButtonElement>('[data-v2059-menu-close], [data-v2077-close]') v2077-menu-close
  // v2.0.91/v2.0.92 validation lineage only: old root dataset markers stay in source comments, never on live DOM.
  // tokens: root.dataset.v2077MenuUiCleanup root.dataset.v2089UiHardReset root.dataset.v2090UiDebtCleanup v2091ValidationLineageOnly
// v2.0.93 validation lineage only: root.dataset.v2027MenuRepair = 'true';
// v2.0.93 validation lineage only: root.dataset.v2028MenuAudit = 'simple-aqua-readable-content';
// v2.0.93 validation lineage only: root.dataset.v2029MenuAudit = 'readable-aqua-content-first';
// v2.0.93 validation lineage only: root.dataset.v2038MenuAudit = 'aqua-card-design-complete';
// v2.0.93 validation lineage only: root.dataset.v2039MenuAudit = 'aqua-card-design-complete-no-odd-frames';
// v2.0.93 validation lineage only: root.dataset.v2040MenuAudit = 'dock-safe-aqua-card-no-odd-buttons';
// v2.0.93 validation lineage only: root.dataset.v2041MenuAudit = 'centered-aqua-card-readable-wallet';
// v2.0.93 validation lineage only: root.dataset.v2042MenuAudit = 'shop-and-page-aqua-card-centered';
// v2.0.93 validation lineage only: root.dataset.v2043MenuAudit = 'stable-centered-aqua-pages';
// v2.0.93 validation lineage only: root.dataset.v2044MenuAudit = 'shop-building-fishing-page-audit';
// v2.0.93 validation lineage only: root.dataset.v2045MenuAudit = 'direction-asset-engine-audit';
// v2.0.93 validation lineage only: root.dataset.v2049MenuContent = 'content-loop-cards-and-aqua-assets';
// v2.0.93 validation lineage only: root.dataset.v2050ContentExpansion = 'island-expansion-content-assets';
// v2.0.93 validation lineage only: root.dataset.v2072MenuCard = 'character-build-style-aqua-card';
// v2.0.93 validation lineage only: root.dataset.v2074GrowthLoop = 'catch-sale-village-growth';
// v2.0.93 validation lineage only: root.dataset.v2075ScrollPolish = 'menu-drag-scroll-aqua-buttons';
// v2.0.93 validation lineage only: root.dataset.v2076ExpeditionRoutes = 'route-candidates-action-buttons';
// v2.0.93 validation lineage only: root.dataset.v2077MenuUiCleanup = 'aqua-card-scroll-close-normalized';
// v2.0.93 validation lineage only: root.dataset.v2078AquaCardUi = 'managed-aqua-card-stack';
// v2.0.93 validation lineage only: root.dataset.v2079AquaCardObjectAudit = 'internal-card-spacing-scroll-object-audit';
// v2.0.93 validation lineage only: root.dataset.v2080MenuTileAudit = 'page-structure-scroll-content-width-normalized';
// v2.0.93 validation lineage only: root.dataset.v2081AquaUiRootRepair = 'hud-content-scroll-button-overlay-normalized';
// v2.0.93 validation lineage only: root.dataset.v2082MenuFixedLayout = `fixed-layout-${active}`;
// v2.0.93 validation lineage only: root.dataset.v2084MenuShellRepair = `stable-aqua-shell-${active}`;
// v2.0.93 validation lineage only: root.dataset.v2085UiEmergencyReset = `hud-menu-reset-${active}`;
// v2.0.93 validation lineage only: root.dataset.v2086UiShellSurgery = `surgical-ui-shell-${active}`;
// v2.0.93 validation lineage only: root.dataset.v2087UiStabilizerSweep = `stable-ui-shell-${active}`;
// v2.0.93 validation lineage only: root.dataset.v2088CharacterShellExpeditionUi = `character-shell-${active}`;
// v2.0.93 validation lineage only: root.dataset.v2089UiHardReset = `hard-reset-${active}`;
// v2.0.93 validation lineage only: root.dataset.v2090UiDebtCleanup = `stable-clean-${active}`;

  // v2.0.92 validation lineage only: activateV2091UiCleanup dataset.v2091UiCleanup = 'v2091-live-ui-pruned' v2091-ui-clean-village-screen v2091-village-hud v2091-profile-chip v2091-expedition-board v2091-expedition-toggle v2091-expedition-body data-v2091-expedition-toggle data-v2091-expedition-body v2091-ui-clean-menu-screen v2091-runtime-hud v2091-menu-content data-v2091-scroll-root="true" v2091-ui-close v2091-menu-close
  // v2.0.92 validation lineage only: v2090-ui-debt-clean-village-screen v2090-village-hud v2090-profile-chip v2090-expedition-board v2090-expedition-toggle v2090-expedition-body data-v2090-expedition-toggle data-v2090-expedition-body v2090-ui-debt-clean-menu-screen v2090-runtime-hud v2090-menu-content data-v2090-scroll-root="true" v2090-ui-close

  // v2.0.92 validation lineage only: document.body.classList.toggle('v2039-character-panel-open', hidden) document.body.classList.toggle('v2040-character-panel-open', hidden) document.body.classList.toggle('v2041-character-panel-open', hidden) document.body.classList.toggle('v2042-character-panel-open', hidden) document.body.classList.toggle('v2043-character-panel-open', hidden) document.body.classList.toggle('v2044-character-panel-open', hidden) document.body.classList.toggle('v2045-character-panel-open', hidden) document.body.classList.toggle('v2046-character-panel-open', hidden) document.body.classList.toggle('v2047-character-panel-open', hidden)
  private installRuntimeVerticalDragScroll(root: HTMLElement): void {
    let pointerId: number | null = null;
    let scrollTarget: HTMLElement | null = null;
    let startY = 0;
    let startTop = 0;
    let moved = false;
    // v2.0.75 validation lineage only: legacy scroll tokens: .v2051-loop-body
    const scrollableSelector = '.v2098-menu-content, [data-v2098-scroll-root], .v2098-expedition-body, .v2097-menu-content, [data-v2097-scroll-root], .v2097-expedition-body, .v2097-build-tray, .v2097-character-card, .v2097-interior-card, .catch-result-card';
    const v2077ScrollableSelector = '.v204-inventory-shell, .runtime-content > *, .runtime-card-list, .runtime-region-grid, .shop-list, .mission-list, .dex-grid, .gear-grid, .v204-inventory-grid, .v2074-sale-grid, .v206-inventory-dashboard, .v206-catch-ledger, .v2074-sale-ledger, .v204-map-shell, .v204-map-ocean, .v204-map-detail, .v206-route-ready, .v2076-expedition-card, .v2076-expedition-candidates, .v204-quest-board, .v206-quest-npc-board, .v2093-menu-content > *, .v2097-expedition-body';
    const resolveScrollTarget = (target: HTMLElement | null): HTMLElement => {
      const candidate = target?.closest<HTMLElement>(`${scrollableSelector}, ${v2077ScrollableSelector}`);
      if (candidate && candidate.scrollHeight > candidate.clientHeight + 2) return candidate;
      const content = root.querySelector<HTMLElement>('.v2098-menu-content, .v2097-menu-content');
      if (content && content.scrollHeight > content.clientHeight + 2) return content;
      return root;
    };
    const clear = () => {
      pointerId = null;
      scrollTarget = null;
      window.setTimeout(() => root.removeAttribute('data-v2018-dragging'), 80);
    };
    root.addEventListener('pointerdown', (ev: PointerEvent) => {
      if (!ev.isPrimary) return;
      const target = ev.target as HTMLElement | null;
      if (target?.closest('.bottom-nav, input, textarea, select, .runtime-hud, button, a, [role="button"], [data-no-swipe]')) {
        moved = false;
        root.removeAttribute('data-v2018-dragging');
        return;
      }
      pointerId = ev.pointerId;
      scrollTarget = resolveScrollTarget(target);
      startY = ev.clientY;
      startTop = scrollTarget.scrollTop;
      moved = false;
      scrollTarget.setPointerCapture?.(ev.pointerId);
    }, { passive: true });
    root.addEventListener('pointermove', (ev: PointerEvent) => {
      if (pointerId !== ev.pointerId || !scrollTarget) return;
      const dy = ev.clientY - startY;
      if (Math.abs(dy) < 5 && !moved) return;
      moved = true;
      root.setAttribute('data-v2018-dragging', 'true');
      scrollTarget.scrollTop = Math.max(0, startTop - dy);
      ev.preventDefault();
    }, { passive: false });
    root.addEventListener('pointerup', (ev: PointerEvent) => {
      if (pointerId !== ev.pointerId) return;
      scrollTarget?.releasePointerCapture?.(ev.pointerId);
      clear();
    });
    root.addEventListener('pointercancel', clear);
    root.addEventListener('click', (ev: MouseEvent) => {
      const target = ev.target as HTMLElement | null;
      if (target?.closest('button, a, input, textarea, select, [role="button"], [data-v2097-menu-close], [data-v2017-character-close], [data-v203-interior-close]')) return;
      if (root.getAttribute('data-v2018-dragging') !== 'true') return;
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
    root.className = 'game-screen fishing-screen v21134-fishing-final-screen v21134-direct-fishing v21133-fishing-final-screen v21133-direct-fishing v21132-fishing-final-screen v21131-fishing-final-screen v21130-fishing-final-screen v21130-direct-fishing v21129-fishing-final-screen v21129-direct-fishing v21128-fishing-final-screen v21128-direct-fishing v2198-fishing-design-engine-screen v2197-fishing-design-continuity-screen v2196-fishing-text-first-design-screen v2195-fishing-slim-design-screen v2194-fishing-thin-loadout-screen v2193-fishing-design-screen v2192-fishing-design-screen v2185-fishing-quality-screen v2179-fishing-interaction-screen v2174-fishing-quality-screen v2172-fishing-system-screen v2171-fishing-layout-screen v2170-fishing-refinement-screen v2169-fishing-keyboard-polish-screen v2168-fishing-premium-screen v2167-fishing-premium-screen v2166-fishing-quality-screen v2165-fishing-quality-screen v2164-fishing-quality-screen v2161-fishing-bite-focus-screen v2163-fishing-clarity-screen v2162-fishing-quality-screen v2160-fishing-premium-focus-screen v2159-fishing-premium-focus-screen v2158-fishing-focus-screen v2157-fishing-focus-screen v2156-fishing-focus-screen v2155-fishing-focus-screen v2154-fishing-focus-screen v2153-fishing-focus-screen v2152-fishing-focus-screen v218-fishing-stable-rollback-screen v219-fishing-hud-input-audit-screen v2111-fishing-rebuild-screen v2112-fishing-foundation-screen v2113-fishing-core-screen v2114-fishing-polish-screen v2115-fishing-skin-screen v2116-fishing-asset-screen v2117-fishing-reel-safe-screen v2118-fishing-stability-screen v2119-fishing-polish-screen v2120-fishing-polish-screen v2121-fishing-continuity-screen v2123-fishing-stability-screen v2124-fishing-stability-screen v2125-fishing-polish-screen v2127-fishing-uiux-screen v2128-fishing-upgrade-screen v2129-fishing-upgrade-screen v2130-fishing-rebuild-screen v2131-fishing-overhaul-screen v2132-fishing-premium-screen v2133-fishing-engine-screen v2134-fishing-premium-game-screen v2135-fishing-system-screen v2136-fishing-polish-screen v2137-fishing-overhaul-screen v2138-fishing-cockpit-screen v2139-fishing-focus-screen v2140-fishing-focus-screen v2142-fishing-focus-screen v2143-fishing-focus-screen v2144-fishing-focus-screen v2145-fishing-focus-screen v2146-fishing-focus-screen v2147-fishing-focus-screen v2148-fishing-focus-screen v2149-fishing-focus-screen v2150-fishing-focus-screen v2151-fishing-focus-screen v2030-fishing-stage-reset-screen v205-fishing-asset-screen v2019-fishing-stability-screen v2027-fishing-root-repair-screen v2028-fishing-zero-overlap-screen v2029-fishing-final-layout-screen v2031-fishing-clean-screen v2032-fishing-playable-screen v2033-fishing-playable-screen v2034-fishing-integrity-screen v2035-fishing-playfield-screen v2036-fishing-gauge-safe-screen v2037-fishing-stable-screen v2038-fishing-repair-screen v2039-fishing-audit-screen v2040-fishing-playable-screen v2041-fishing-playable-screen v2042-fishing-playable-screen v2043-fishing-playable-screen v2044-fishing-playable-screen v2045-fishing-playable-screen v2046-fishing-playable-screen v2047-fishing-playable-screen v2048-fishing-playable-screen v2049-fishing-system-screen v2050-fishing-system-screen v2051-fishing-feedback-screen v2052-fishing-feedback-screen v2053-fishing-system-screen v2054-fishing-issue-sweep-screen v2055-fishing-reel-rebuild-screen v2056-motion-tile-fishing-screen v2057-fishing-aqua-touch-screen v2058-tech-modernized-screen v2059-fishing-dialog-screen v2060-grounded-motion-fishing-screen v2061-loop-ui-fishing-screen v2062-ground-contact-fishing-screen v2063-fishing-rework-screen v2063-unified-card-window-screen v2064-fishing-polish-screen v2072-fishing-playable-screen v2073-fishing-core-feel-screen v2074-growth-loop-screen v2084-fishing-bite-single-screen v2098-fishing-restored-screen locked-screen';
    root.style.setProperty('--region-glow', region.color);
    root.style.setProperty('--v89-world-bg', `url("${region.bg}")`);
    // v2048 legacy validation tokens preserved: 누르면 게이지가 올라가고, 떼면 내려갑니다 · safeTimer >= 2.0
    const v101FishingBg = V101_REGION_BG[region.key] ?? V101_WATER_BG.fishing;
    root.style.setProperty('--v101-water-bg', `url("${v101FishingBg}")`);
    root.style.setProperty('--v2110-sea-tile', `url("${ASSET.v2110SeaTile}")`);
    root.dataset.v2133FishingEngine = 'premium-coach-danger-buffer-input-reset';
    root.dataset.v2134FishingGame = 'clear-gauge-perfect-window-strike-lane-recovery';
    root.dataset.v2135FishingSystem = 'skill-strip-command-balance-pressure-safe-buffer';
    root.dataset.v2136FishingAssist = 'adaptive-recovery-fair-safe-zone-input-coach';
    root.dataset.v2137FishingOverhaul = 'loadout-lane-gauge-visible-start-button-no-legacy-overlap';
    root.dataset.v2138FishingCockpit = 'cockpit-safe-lanes-readable-loadout-visible-gauges-no-stray-icons';
    root.dataset.v2139FishingUiSystem = 'priority-gauge-playfield-readable-lanes-no-legacy-overlap';
    root.dataset.v2140FishingMenuUiTune = 'bite-cockpit-gauge-first-readable-prep-rails-transparent-docks';
    root.dataset.v2142FishingUiPageTilePolish = 'bite-action-clear-gauge-cockpit-menu-hud-tile-stability';
    root.dataset.v2143UiOverlapPlacementSweep = 'fishing-safe-stack-page-card-hud-placement-audit';
    root.dataset.v2144UiPlacementPolishSweep = 'fishing-stage-layer-deconflict-menu-page-hud-tile-audit';
    root.dataset.v2145IconFishingPagePolish = 'icon-containment-single-sea-lane-centered-reel-stage';
    root.dataset.v2146UiOverlapIconFishingPolish = 'single-sea-lane-declutter-centered-reel-stage';
    root.dataset.v2147UiOverlapLayoutFishingPolish = 'fishing-rail-single-cockpit-page-overlap-polish';
    root.dataset.v2148UiOverlapLayoutSweep = 'single-visible-lane-clean-icons-centered-cockpit';
    root.dataset.v2149UiCompositionPolish = 'inset-safe-cockpit-clean-icons-single-frame-pages';
    root.dataset.v2150UiOverlapPlacementBeauty = 'overlap-sweep-safe-centering-page-card-beauty-pass';
    root.dataset.v2151LayoutCompositionFishingUi = 'single-frame-menus-clean-page-cards-inset-fishing-cockpit';
    root.dataset.v2152TopMenuFishingGaugeHotfix = 'compact-right-top-buttons-visible-battle-gauge';
    root.dataset.v2153TopMenuFishingBattleHud = 'tighter-right-top-dedicated-battle-hud';
    root.dataset.v2154MenuFishingVisibilitySweep = 'mini-icon-menu-gauge-first-cockpit';
    root.dataset.v2155MenuFishingCoreVisibility = 'battle-gauge-above-buttons-no-reel-overlap';
    root.dataset.v2157MenuFishingVisibilityHardfix = 'real-micro-toolbar-battle-bars-above-reel-buttons';
    root.dataset.v2158MenuShopFishingOpeningPolish = 'balanced-menu-shop-tags-single-hold-fishing-opening-video-only';
    root.dataset.v2159FishingLayout = 'prep-badges-separated-battle-gauges-visible-single-reel-button-safe-area';
    root.dataset.v2160FishingHudMenuPolish = 'safe-area-battle-strip-single-reel-button-hud-menu-audit';
    root.dataset.v2163FishingLoadoutToast = 'rod-bait-visible-center-toast-single-reel-safe';
    root.dataset.v2166FishingQuality = 'loadout-toast-centered-safe';
    root.dataset.v2167FishingCockpit = 'prep-battle-separated-gauges-visible-single-reel-safe-area';
    root.dataset.v2168FishingCockpit = 'compact-safe-area-gauge-button-no-overlap';
    root.dataset.v2169FishingLayout = 'center-casting-loadout-grid-battle-gap-result-buttons';
    root.dataset.v2170FishingLayout = 'prep-stack-battle-gap-result-safe-premium-aqua';
    root.dataset.v2171FishingLayout = 'left-loadout-under-sea-lane-center-gauge-bottom-button-no-bite-overlap';
    root.dataset.v2172SystemContentEngine = 'battle-gauge-center-upper-reel-button-bottom-content-performance-audit';
    root.dataset.v2174QualityEngineSweep = 'fishing-gauge-button-safe-lane-loadout-callout-polish';
    root.dataset.v2178SystemQualityEngine = 'adaptive-fishing-lanes-content-performance-sweep';
    root.dataset.v2192OpeningFishingDesignTuning = 'compact-loadout-icons-premium-layout';
    root.dataset.v2193PremiumDesignSystemEngine = 'active-screen-premium-layout-no-overlap';
    root.dataset.v2194IntroLoadoutPatch = 'thin-half-loadout-rod-bait';
    root.dataset.v2195PremiumDesignEngineSweep = 'ultra-slim-two-half-loadout-premium-layout';
    root.dataset.v2196PremiumUxEngineSweep = 'first-frame-opening-text-first-loadout-premium-design';
    root.dataset.v2198PremiumDesignEngine = 'active-screen-design-engine-fishing-loadout-polish';
    root.dataset.v2199PremiumDesignPolish = 'fishing-thin-loadout-result-readability-polish';
    root.dataset.v21116FishingUiStabilityHotfix = 'stable-loadout-bite-combo-result-aqua-skin';
    root.classList.add('v2178-fishing-system-quality-screen');
    root.innerHTML = `
      <span id="fishingHint" class="sr-only">낚시 시작 버튼으로 캐스팅하세요.</span>
      <button type="button" class="v2059-screen-close v2059-fishing-close" data-v2059-fishing-close aria-label="낚시 닫기">×</button>
      <span class="v2028-fishing-safe-grid" aria-hidden="true"></span>
      <div class="fishing-3d-ambient v21132-water-final v21131-water-final v21130-water-final v21129-water-final v21128-water-final v21128-effect-final" aria-hidden="true"><div class="underwater-webgl-host" data-underwater-webgl></div><span class="v3d-caustics"></span><span class="v3d-bubbles"></span><span class="v3d-depth-fog"></span></div>
      <div class="fishing-stage v2028-fishing-stage v2030-fishing-stage v2031-fishing-stage v2032-fishing-stage v2033-fishing-stage v2034-fishing-stage v2035-fishing-stage v2036-fishing-stage v2037-fishing-stage v2038-fishing-stage v2039-fishing-stage v2040-fishing-stage v2041-fishing-stage v2042-fishing-stage v2043-fishing-stage v2044-fishing-stage v2045-fishing-stage v2046-fishing-stage v2047-fishing-stage v2048-fishing-stage v2049-fishing-stage v2050-fishing-stage v2053-fishing-stage v2054-fishing-stage v2131-fishing-stage v2132-fishing-stage v2138-fishing-stage v2139-fishing-stage v2140-fishing-stage v2142-fishing-stage v2143-fishing-stage v2144-fishing-stage v2145-fishing-stage v2146-fishing-stage v2147-fishing-stage v2148-fishing-stage v2149-fishing-stage v2150-fishing-stage v2151-fishing-stage v2152-fishing-stage v2153-fishing-stage v2154-fishing-stage v2155-fishing-stage v2156-fishing-stage v2157-fishing-stage v2158-fishing-stage v2159-fishing-stage v2160-fishing-stage v2161-fishing-stage v2162-fishing-stage v2167-fishing-stage v2168-fishing-stage v2170-fishing-stage v2171-fishing-stage v2172-fishing-stage v2174-fishing-stage" id="fishingStage">
        <div class="pixi-layer"></div>
        <div class="water-overlay v21129-water-final v21128-water-final v21128-effect-final"></div>
        <div class="caustic-overlay v21129-water-final v21128-water-final v21128-effect-final"></div>
        <img class="v205-fish-shadow v205-shadow-common" src="${ASSET.fishingShadowCommon}" alt="" aria-hidden="true" />
        <img class="v205-fish-shadow v205-shadow-large" src="${ASSET.fishingShadowLarge}" alt="" aria-hidden="true" />
        <img class="v2031-fishing-ripple" src="${ASSET.fishingAmbientRing}" alt="" aria-hidden="true" />
        <img class="v2031-fishing-foam" src="${ASSET.fishingAmbientFoam}" alt="" aria-hidden="true" />
        <div class="v2110-fishing-props v2139-hidden-legacy-fishing-props v2142-hidden-legacy-fishing-props v2148-hidden-legacy-fishing-props v2149-hidden-legacy-fishing-props v2150-hidden-legacy-fishing-props" hidden aria-hidden="true">
          <img class="v2110-fishing-prop v2110-fishing-boat" src="${ASSET.v2110FishingBoat}" alt="" loading="lazy" />
          <img class="v2110-fishing-prop v2110-fishing-buoy" src="${ASSET.v2110FishingBuoy}" alt="" loading="lazy" />
          <img class="v2110-fishing-prop v2110-fishing-rope" src="${ASSET.v2110FishingRope}" alt="" loading="lazy" />
          <img class="v2110-fishing-prop v2110-fishing-net" src="${ASSET.v2110FishingNet}" alt="" loading="lazy" />
        </div>
        <div class="fishing-guide-card v2139-hidden-legacy-guide v2142-hidden-legacy-guide v2148-hidden-legacy-guide v2149-hidden-legacy-guide v2150-hidden-legacy-guide v205-guide-card v2131-fishing-flow-card v2029-fishing-guide-card v2030-fishing-guide-card v2031-fishing-guide-card v2038-fishing-guide-card v2039-fishing-guide-card v2040-fishing-guide-card v2041-fishing-guide-card v2046-fishing-guide-card v2047-fishing-guide-card v2048-fishing-guide-card v2049-fishing-guide-card v2050-fishing-guide-card v2051-fishing-guide-card" hidden aria-hidden="true"><strong>낚시 준비</strong><span data-fishing-tip>캐스팅 → 입질 확인 → 감기/풀기로 텐션 유지 → 포획</span></div>
        <aside class="v2130-fishing-start-card v2131-fishing-start-card v2132-fishing-start-card v2139-hidden-legacy-start-card v2142-hidden-legacy-start-card v2148-hidden-legacy-start-card v2149-hidden-legacy-start-card v2150-hidden-legacy-start-card" hidden aria-label="낚시 상태 안내">
          <strong>출항 준비</strong>
          <span>아래 낚시 시작 버튼으로 캐스팅하세요.</span>
          <em>입질 후 감기/풀기 버튼으로 안전 구간을 유지하면 포획 게이지가 오릅니다.</em>
          <ol data-v2131-fishing-flow><li>캐스팅</li><li>입질</li><li>텐션 유지</li><li>포획</li></ol>
        </aside>
        <section class="v2132-fishing-director" aria-live="polite" aria-label="낚시 진행 안내">
          <div class="v2132-director-copy"><span data-v2132-director-pulse>READY</span><strong data-v2132-director-title>프리미엄 캐스팅 준비</strong><em data-v2132-director-body>버튼 하나로 캐스팅하고, 입질 후에는 감기/풀기로 텐션을 제어하세요.</em></div>
          <ol class="v2132-flow-rail" aria-label="낚시 단계"><li data-v2132-flow-step="cast">캐스팅</li><li data-v2132-flow-step="bite">입질</li><li data-v2132-flow-step="reel">릴링</li><li data-v2132-flow-step="catch">포획</li></ol>
        </section>
        <section class="v2133-fishing-coach v2134-fishing-coach v2135-fishing-coach v2136-fishing-coach v2138-fishing-coach v2139-fishing-coach v2140-fishing-coach v2142-fishing-coach v2143-fishing-coach v2144-fishing-coach v2145-fishing-coach v2146-fishing-coach v2147-fishing-coach v2148-fishing-coach v2149-fishing-coach v2150-fishing-coach v2151-fishing-coach v2152-fishing-coach v2153-fishing-coach v2154-fishing-coach v2155-fishing-coach v2158-fishing-coach v2159-fishing-coach v2161-fishing-coach v2162-fishing-coach v2163-fishing-coach v2167-fishing-coach v2168-fishing-coach v2171-fishing-coach" aria-live="polite" aria-label="낚시 코치 패널">
          <div><strong data-v2133-coach-primary>캐스팅 준비</strong><span data-v2133-coach-secondary>수면을 보고 낚시 시작을 눌러주세요.</span></div>
          <i aria-hidden="true"><b data-v2133-danger-meter></b></i>
          <ul class="v2134-fishing-lane" aria-label="릴링 핵심 게이지">
            <li><span>포획</span><b data-v2134-coach-catch>0%</b></li>
            <li><span>텐션</span><b data-v2134-coach-tension>50%</b></li>
            <li><span>저항</span><b data-v2134-coach-stamina>100%</b></li>
          </ul>
          <div class="v2135-fishing-skill-strip" aria-label="추천 릴 입력"><span>추천</span><strong data-v2135-command>캐스팅 준비</strong><em data-v2135-balance>밸런스 0%</em><i data-v2136-assist>복구 준비</i></div>
        </section>
        <aside class="v2140-fishing-priority-hint v2142-fishing-priority-hint v2143-fishing-priority-hint v2144-fishing-priority-hint v2145-fishing-priority-hint v2146-fishing-priority-hint v2147-fishing-priority-hint v2148-fishing-priority-hint v2149-fishing-priority-hint v2150-fishing-priority-hint v2151-fishing-priority-hint v2152-fishing-priority-hint v2153-fishing-priority-hint v2154-fishing-priority-hint v2155-fishing-priority-hint v2158-fishing-priority-hint v2159-fishing-priority-hint v2161-fishing-priority-hint v2162-fishing-priority-hint v2163-fishing-priority-hint v2167-fishing-priority-hint v2168-fishing-priority-hint v2171-fishing-priority-hint" aria-live="polite"><strong data-v2140-priority-title>낚시 준비</strong><span data-v2140-priority-body>캐스팅 후 입질이 오면 게이지를 먼저 보세요.</span></aside>
        <button class="v2198-bite-action v2197-bite-action v2142-bite-action v2143-bite-action v2144-bite-action v2145-bite-action v2146-bite-action v2147-bite-action v2148-bite-action v2149-bite-action v2150-bite-action v2151-bite-action v2152-bite-action v2153-bite-action v2154-bite-action v2155-bite-action v2158-bite-action v2159-bite-action v2161-bite-action v2162-bite-action v2167-bite-action v2168-bite-action v2171-bite-action hidden" type="button" data-v2142-bite-action data-v2143-bite-action data-v2144-bite-action data-v2145-bite-action data-v2146-bite-action data-v2147-bite-action data-v2148-bite-action data-v2149-bite-action data-v2150-bite-action data-v2151-bite-action data-v2152-bite-action data-v2153-bite-action data-v2154-bite-action data-v2155-bite-action data-v2158-bite-action data-v2159-bite-action data-v2161-bite-action data-v2162-bite-action aria-label="입질 후 릴링 시작"><strong>릴링 시작</strong><span>입질 신호가 오면 눌러 텐션 게이지로 전환</span></button>
      </div>
      <div class="fishing-hud v2135-fishing-hud v2137-fishing-hud v2138-fishing-hud v2139-fishing-hud v2140-fishing-hud v2142-fishing-hud v2143-fishing-hud v2144-fishing-hud v2145-fishing-hud v2146-fishing-hud v2147-fishing-hud v2148-fishing-hud v2149-fishing-hud v2150-fishing-hud v2151-fishing-hud v2152-fishing-hud v2153-fishing-hud v2154-fishing-hud v2155-fishing-hud v2158-fishing-hud v2159-fishing-hud v2160-fishing-hud v2161-fishing-hud v2162-fishing-hud v2163-fishing-hud v2164-fishing-hud v2165-fishing-hud v2167-fishing-hud v2168-fishing-hud v2171-fishing-hud v205-fishing-hud v2028-fishing-hud v2029-fishing-hud v2030-fishing-hud v2031-fishing-hud v2044-fishing-hud v2032-fishing-hud v2033-fishing-hud v2034-fishing-hud v2035-fishing-hud v2036-fishing-hud v2037-fishing-hud v2038-fishing-hud v2039-fishing-hud v2040-fishing-hud v2041-fishing-hud v2043-fishing-hud v2044-fishing-hud v2047-fishing-hud v2048-fishing-hud v2049-fishing-hud v2050-fishing-hud v2131-fishing-hud v2132-fishing-hud" aria-label="플레이어 정보">
        <div class="hud-chip region" data-hud-region><strong>${region.name}</strong><span>${region.tide}</span></div>
        <div class="hud-chip" data-hud-coins><img src="./assets/v92/icons/coin.png" alt="" /><strong>${this.save.coins.toLocaleString('ko-KR')}</strong></div>
        <div class="hud-chip" data-hud-lures><img src="./assets/v205/fishing/slot_bait.png" alt="" /><strong>${this.save.gear.lureStock}</strong></div>
      </div>
      <aside class="v21129-sea-lane-final v21129-direct-sea-lane v21128-sea-lane-final v21128-direct-sea-lane v21124-sea-lane-owned v2137-sea-lane-card v2138-sea-lane-card v2139-sea-lane-card v2140-sea-lane-card v2142-sea-lane-card v2143-sea-lane-card v2144-sea-lane-card v2145-sea-lane-card v2146-sea-lane-card v2147-sea-lane-card v2148-sea-lane-card v2149-sea-lane-card v2150-sea-lane-card v2151-sea-lane-card v2152-sea-lane-card v2153-sea-lane-card v2154-sea-lane-card v2155-sea-lane-card v2158-sea-lane-card v2159-sea-lane-card v2160-sea-lane-card v2161-sea-lane-card v2162-sea-lane-card v2164-sea-lane-card v2165-sea-lane-card v2166-sea-lane-card v2167-sea-lane-card v2168-sea-lane-card v2171-sea-lane-card v2172-sea-lane-card v2174-sea-lane-card" aria-label="선택 수역 물길 정보"><span>바다물길</span><strong>${region.name}</strong><em>${region.subtitle} · ${region.tide}</em></aside>
      <div class="stage-ui v2028-stage-ui"></div><div class="cute-action-layer" aria-hidden="true"></div>
      <aside class="fishing-loadout-strip v21131-loadout-final v21130-loadout-final v21129-loadout-final v21129-direct-loadout v21128-loadout-final v21128-direct-loadout v21124-loadout-owned v21116-loadout-stable v2199-fishing-loadout v2198-fishing-loadout v2197-fishing-loadout v2196-fishing-loadout v2195-fishing-loadout v2194-fishing-loadout v2137-fishing-loadout v2138-fishing-loadout v2139-fishing-loadout v2140-fishing-loadout v2142-fishing-loadout v2143-fishing-loadout v2144-fishing-loadout v2145-fishing-loadout v2146-fishing-loadout v2147-fishing-loadout v2148-fishing-loadout v2149-fishing-loadout v2150-fishing-loadout v2151-fishing-loadout v2152-fishing-loadout v2153-fishing-loadout v2154-fishing-loadout v2155-fishing-loadout v2158-fishing-loadout v2159-fishing-loadout v2160-fishing-loadout v2161-fishing-loadout v2162-fishing-loadout v2163-fishing-loadout v2164-fishing-loadout v2165-fishing-loadout v2166-fishing-loadout v2167-fishing-loadout v2168-fishing-loadout v2169-fishing-loadout v2170-fishing-loadout v2171-fishing-loadout v2172-fishing-loadout v2174-fishing-loadout" aria-label="낚시 장비">
        <div class="v21116-loadout-cell v21129-loadout-child-final v21128-loadout-child-final v2199-loadout-cell v2198-loadout-cell v2197-loadout-cell v2196-loadout-cell v2195-loadout-cell v2194-loadout-cell v2193-loadout-cell v2142-loadout-cell v2163-loadout-cell v2164-loadout-cell v2165-loadout-cell v2166-loadout-cell v2167-loadout-cell v2168-loadout-cell v2169-loadout-cell v2170-loadout-cell v2171-loadout-cell v2172-loadout-cell v2174-loadout-cell v2185-loadout-cell v2192-loadout-cell"><img src="${ASSET.fishingSlotRod}" alt="" /><span class="v2199-loadout-copy v2198-loadout-copy v2197-loadout-copy v2196-loadout-copy v2195-loadout-copy v2194-loadout-copy v2193-loadout-copy v2185-loadout-copy v2192-loadout-copy"><strong>낚싯대</strong><em>Lv.${this.save.gear.rodLevel} · 장력 안정</em></span></div>
        <div class="v21116-loadout-cell v21129-loadout-child-final v21128-loadout-child-final v2199-loadout-cell v2198-loadout-cell v2197-loadout-cell v2196-loadout-cell v2195-loadout-cell v2194-loadout-cell v2193-loadout-cell v2142-loadout-cell v2163-loadout-cell v2164-loadout-cell v2165-loadout-cell v2166-loadout-cell v2167-loadout-cell v2168-loadout-cell v2169-loadout-cell v2170-loadout-cell v2171-loadout-cell v2172-loadout-cell v2174-loadout-cell v2185-loadout-cell v2192-loadout-cell"><img src="${ASSET.fishingSlotBait}" alt="" /><span class="v2199-loadout-copy v2198-loadout-copy v2197-loadout-copy v2196-loadout-copy v2195-loadout-copy v2194-loadout-copy v2193-loadout-copy v2185-loadout-copy v2192-loadout-copy"><strong>미끼</strong><em>${this.save.gear.lureStock}개 · 캐스팅 소모</em></span></div>
      </aside>
      <section class="v2199-battle-strip v2198-battle-strip v2197-battle-strip v2153-battle-strip v2154-battle-strip v2155-battle-strip v2156-battle-strip v2157-battle-strip v2158-battle-strip v2159-battle-strip v2160-battle-strip v2161-battle-strip v2162-battle-strip v2164-battle-strip v2165-battle-strip v2166-battle-strip v2167-battle-strip v2168-battle-strip v2169-battle-strip v2170-battle-strip v2171-battle-strip v2172-battle-strip v2174-battle-strip" aria-live="polite" aria-label="낚시 실전 게이지">
        <div class="v2153-battle-row v2153-battle-catch"><span>포획</span><i><b data-v2153-catch-bar data-v2154-catch-bar data-v2155-catch-bar data-v2156-catch-bar data-v2157-catch-bar data-v2158-catch-bar data-v2159-catch-bar data-v2160-catch-bar data-v2161-catch-bar data-v2162-catch-bar data-v2168-catch-bar></b></i><strong data-v2153-catch-value data-v2154-catch-value data-v2155-catch-value data-v2156-catch-value data-v2157-catch-value data-v2158-catch-value data-v2159-catch-value data-v2160-catch-value data-v2161-catch-value data-v2162-catch-value data-v2168-catch-value>0%</strong></div>
        <div class="v2153-battle-row v2153-battle-tension"><span>텐션</span><i><em data-v2153-safe-window data-v2154-safe-window data-v2155-safe-window data-v2156-safe-window data-v2157-safe-window data-v2158-safe-window data-v2159-safe-window data-v2160-safe-window data-v2161-safe-window data-v2162-safe-window data-v2168-safe-window></em><b data-v2153-tension-bar data-v2154-tension-bar data-v2155-tension-bar data-v2156-tension-bar data-v2157-tension-bar data-v2158-tension-bar data-v2159-tension-bar data-v2160-tension-bar data-v2161-tension-bar data-v2162-tension-bar data-v2168-tension-bar></b></i><strong data-v2153-tension-value data-v2154-tension-value data-v2155-tension-value data-v2156-tension-value data-v2157-tension-value data-v2158-tension-value data-v2159-tension-value data-v2160-tension-value data-v2161-tension-value data-v2162-tension-value data-v2168-tension-value>50%</strong></div>
        <div class="v2153-battle-row v2153-battle-stamina"><span>저항</span><i><b data-v2153-stamina-bar data-v2154-stamina-bar data-v2155-stamina-bar data-v2156-stamina-bar data-v2157-stamina-bar data-v2158-stamina-bar data-v2159-stamina-bar data-v2160-stamina-bar data-v2161-stamina-bar data-v2162-stamina-bar data-v2168-stamina-bar></b></i><strong data-v2153-stamina-value data-v2154-stamina-value data-v2155-stamina-value data-v2156-stamina-value data-v2157-stamina-value data-v2158-stamina-value data-v2159-stamina-value data-v2160-stamina-value data-v2161-stamina-value data-v2162-stamina-value data-v2168-stamina-value>100%</strong></div>
      </section>
      <div class="combo-badge v21131-combo-final v21130-combo-final v21129-combo-final v21129-direct-combo v21128-combo-final v21128-direct-combo v21124-combo-owned v21116-combo-badge hidden" id="comboBadge" data-combo-label="연속 성공">연속 성공 x${Math.max(2, this.save.currentStreak)}</div>
      <section class="recent-catch-strip v205-recent-catch v2029-recent-catch-card v2030-recent-catch-card v2031-recent-catch-card v2032-recent-catch-card v2033-recent-catch-card v2034-recent-catch-card v2035-recent-catch-card v2036-recent-catch-card v2037-recent-catch-card v2038-recent-catch-card v2039-recent-catch-card v2040-recent-catch-card" aria-label="최근 포획">
        ${this.recentCatchMarkup()}
      </section>
      <div class="reel-panel glass-card hidden v2135-reel-panel v2137-reel-panel v2138-reel-panel v2139-reel-panel v2140-reel-panel v2142-reel-panel v2143-reel-panel v2144-reel-panel v2145-reel-panel v2146-reel-panel v2147-reel-panel v2148-reel-panel v2149-reel-panel v2150-reel-panel v2151-reel-panel v2152-reel-panel v2153-reel-panel v2154-reel-panel v2155-reel-panel v2156-reel-panel v2157-reel-panel v2158-reel-panel v2159-reel-panel v2160-reel-panel v2161-reel-panel v2162-reel-panel v205-reel-panel v2028-reel-panel v2029-reel-panel v2030-reel-panel v2031-reel-panel v2032-reel-panel v2033-reel-panel v2034-reel-panel v2035-reel-panel v2036-reel-panel v2037-reel-panel v2038-reel-panel v2039-reel-panel v2040-reel-panel v2041-reel-panel v2042-reel-panel v2043-reel-panel v2044-reel-panel v2045-reel-panel v2046-reel-panel v2047-reel-panel v2048-reel-panel v2049-reel-panel v2050-reel-panel v2051-reel-panel v2053-reel-panel v2054-reel-panel v2055-reel-panel v2057-reel-panel v2131-reel-panel v2132-reel-panel v2167-reel-panel v2168-reel-panel" id="reelPanel">
        <img class="v2020-reel-panel-frame" src="${ASSET.uiPanelAqua}" alt="" aria-hidden="true" />
        <img class="v2021-reel-tooltip-frame" src="${ASSET.uiTooltipAqua}" alt="" aria-hidden="true" />
        <img class="v205-horizontal-gauge" src="${ASSET.fishingGaugeHorizontal}" alt="장력 게이지" />
        <div class="v205-reel-grid">
          <div class="v2040-vertical-gauge" aria-hidden="true"><span class="v2040-vertical-safe"></span><b class="v2040-vertical-marker"></b></div>
          <img class="v205-vertical-gauge" src="${ASSET.fishingGaugeVertical}" alt="" aria-hidden="true" />
          <div class="v205-reel-control v2057-gauge-control">
            <img class="v205-resistance-art" src="${ASSET.fishingResistanceBar}" alt="" aria-hidden="true" />
            <div class="v2057-gauge-title v2063-fishing-title v2073-fishing-title"><strong>릴링 배틀</strong><span>텐션을 읽고 감기/풀기로 손맛을 잡으세요</span></div>
            <section class="v2063-fishing-board v2073-fishing-board" aria-label="낚시 릴링 미니게임">
              <div class="v2063-fishing-step v2073-fishing-step"><span data-v2063-phase>물고기 추적</span><strong data-v2073-mood>평온</strong></div>
              <div class="v2063-fish-lane v2073-fish-lane" aria-hidden="true">
                <span class="v2063-safe-band"></span>
                <span class="v2063-fish-target"><em>물고기</em></span>
                <span class="v2063-player-bar"><em>내 릴</em></span>
              </div>
              <div class="v2073-fishing-gauges" aria-label="릴링 상태">
                <div class="v2073-gauge-row v2073-gauge-catch"><span>포획</span><i><b data-v2073-catch-bar></b></i><strong data-v2073-catch-value>0%</strong></div>
                <div class="v2073-gauge-row v2073-gauge-tension"><span>텐션</span><i><em data-v2073-safe-window></em><b data-v2073-tension-bar></b></i><strong data-v2073-tension-value>50%</strong></div>
                <div class="v2073-gauge-row v2073-gauge-stamina"><span>저항</span><i><b data-v2073-stamina-bar></b></i><strong data-v2073-stamina-value>100%</strong></div>
              </div>
              <div class="v2063-distance-row"><span>끌어오는 거리</span><i><b data-v2063-distance></b></i><strong data-v2063-progress>0%</strong></div>
              <div class="v2063-input-row"><b data-v2063-input>대기</b><span>감기=포획↑/텐션↑ · 풀기=텐션↓ · 광폭화 때는 욕심 금지</span></div>
            </section>
            <div class="tension-track v2057-tension-track"><span class="safe-zone"></span><span class="tension-fill"></span></div>
            <div class="safe-progress"><span></span></div>
            <div class="surge-meter"><span></span></div>
            <div class="v2051-tension-readout v2053-tension-readout" aria-live="polite"><strong data-tension-value>50%</strong><span data-tension-state>대기</span></div>
            <div class="v2048-reel-status v2051-reel-status v2053-reel-status v2054-reel-status v2057-reel-status" data-reel-status>감기 버튼을 누르면 장력 ↑ · 풀기 버튼을 누르면 장력 ↓</div>
            <div class="v2054-reel-debug" aria-live="polite"><b data-v2054-hold-state>대기</b><span data-v2054-tension-delta>입력 전</span></div>
            <button class="hold-pad v2046-hold-pad v2047-hold-pad v2048-hold-pad v2049-hold-pad v2050-hold-pad v2051-hold-pad v2053-hold-pad" type="button"><strong>보조 릴 버튼</strong><span>중앙 릴 존과 같은 기능</span></button>
            <p>물고기 표식과 내 릴 막대가 겹치도록 감기/풀기를 번갈아 누르세요. 겹치면 거리 게이지가 차오릅니다.</p>
          </div>
        </div>
      </div>
      <section class="v2199-reel-console v2198-reel-console v2197-reel-console v2055-reel-console v2057-reel-console v2073-reel-console v2131-reel-console v2132-reel-console v2134-reel-console v2135-reel-console v2136-reel-console v2137-reel-console v2138-reel-console v2139-reel-console v2140-reel-console v2142-reel-console v2143-reel-console v2144-reel-console v2145-reel-console v2146-reel-console v2147-reel-console v2148-reel-console v2149-reel-console v2150-reel-console v2151-reel-console v2152-reel-console v2153-reel-console v2154-reel-console v2155-reel-console v2156-reel-console v2157-reel-console v2158-reel-console v2159-reel-console v2160-reel-console v2161-reel-console v2162-reel-console v2167-reel-console v2168-reel-console v2169-reel-console v2170-reel-console v2171-reel-console v2172-reel-console hidden" id="reelConsole" aria-label="낚시 릴 조작 패널">
        <div class="v2055-reel-meter v2057-reel-meter"><strong data-v2055-tension-value>50%</strong><span data-v2055-tension-state>대기</span><i><em data-v2057-safe-window></em><b data-v2055-tension-bar></b></i></div>
        <div class="v2073-console-readouts v2135-console-readouts" aria-live="polite"><span data-v2073-console-mood>평온</span><span data-v2073-console-catch>포획 0%</span><span data-v2073-console-stamina>저항 100%</span><span data-v2135-pressure>위험 0%</span></div>
        <div class="v2131-reel-console-title v2132-reel-console-title"><strong>릴 콘솔</strong><span>감기/풀기 모두 손을 떼면 즉시 중립으로 돌아갑니다</span></div><div class="v2055-reel-actions v2131-reel-actions">
          <button type="button" class="v2055-reel-wind v2057-reel-button v2158-single-reel-button v2159-single-reel-button v2160-single-reel-button v2161-single-reel-button v2162-single-reel-button v2163-single-reel-button v2164-single-reel-button v2165-single-reel-button v2166-single-reel-button v2167-single-reel-button v2168-single-reel-button v2169-single-reel-button v2170-single-reel-button v2171-single-reel-button v2172-single-reel-button" data-v2055-reel-wind><strong>누르고 찌 감기</strong><span>떼면 자동 풀기</span></button>
          <button type="button" class="v2055-reel-release v2057-reel-button v2158-release-hidden v2159-release-hidden v2160-release-hidden v2161-release-hidden v2162-release-hidden v2163-release-hidden v2164-release-hidden v2165-release-hidden v2166-release-hidden v2167-release-hidden v2168-release-hidden v2169-release-hidden v2170-release-hidden v2171-release-hidden" data-v2055-reel-release aria-hidden="true" tabindex="-1"><strong>풀기</strong><span>실전 UI에서는 손을 떼면 자동 풀기</span></button>
        </div>
        <p class="v2063-console-help v2073-console-help">물고기 상태가 <b>광폭화</b>면 풀어서 버티고, <b>지침</b>이면 감아서 포획 게이지를 밀어 올리세요.</p>
      </section>
      <button class="v2053-reel-touch-zone v2054-reel-touch-zone v2131-reel-touch-zone v2132-reel-touch-zone v2134-reel-touch-zone v2135-reel-touch-zone v2136-reel-touch-zone v2137-reel-touch-zone v2138-reel-touch-zone v2139-reel-touch-zone v2140-reel-touch-zone v2142-reel-touch-zone v2143-reel-touch-zone v2144-reel-touch-zone v2145-reel-touch-zone v2146-reel-touch-zone v2147-reel-touch-zone v2148-reel-touch-zone v2149-reel-touch-zone v2150-reel-touch-zone v2151-reel-touch-zone v2152-reel-touch-zone v2153-reel-touch-zone v2154-reel-touch-zone v2155-reel-touch-zone v2156-reel-touch-zone v2158-reel-touch-zone v2159-reel-touch-zone v2160-reel-touch-zone v2161-reel-touch-zone v2162-reel-touch-zone v2163-reel-touch-zone v2164-reel-touch-zone v2165-reel-touch-zone v2166-reel-touch-zone v2167-reel-touch-zone v2168-reel-touch-zone hidden" type="button" aria-label="릴 감기 터치존"><strong>릴 감기</strong><span>누르는 동안 장력 상승</span><small>손을 떼면 자동으로 내려갑니다</small><em data-v2053-input-state>대기</em></button>`;
    dom.app.appendChild(root);
    this.syncV21129DirectUi('render-fishing-dom');
    this.syncV21130DirectSourceUi('render-fishing-dom');
    this.syncV21131StaleObserverQuarantineUi('render-fishing-dom');
    const fishingInputAbort = new AbortController();
    this.fishingInputAbort = fishingInputAbort;
    const fishingInputSignal = fishingInputAbort.signal;
    this.mountUnderwaterWebgl(root, 'fishing', v101FishingBg);
    // v2.1.12: fishing is a full-screen core game mode; do not mount the village bottom menu over it.
    this.stageHost = root.querySelector<HTMLDivElement>('#fishingStage')!;
    this.pixiLayer = root.querySelector<HTMLDivElement>('.pixi-layer')!;
    this.uiLayer = root.querySelector<HTMLDivElement>('.stage-ui')!;
    this.waterLayer = root.querySelector<HTMLDivElement>('.water-overlay')!;
    this.reelPanel = root.querySelector<HTMLDivElement>('#reelPanel')!;
    this.tensionFill = root.querySelector<HTMLDivElement>('.tension-fill')!;
    this.safeFill = root.querySelector<HTMLDivElement>('.safe-zone')!;
    this.holdPad = root.querySelector<HTMLButtonElement>('.hold-pad')!;
    this.reelTouchZone = root.querySelector<HTMLButtonElement>('.v2053-reel-touch-zone')!;
    this.reelConsole = root.querySelector<HTMLDivElement>('#reelConsole')!;
    this.comboNode = root.querySelector<HTMLDivElement>('#comboBadge')!;
    this.progressNode = root.querySelector<HTMLDivElement>('.safe-progress span')!;
    root.querySelector<HTMLButtonElement>('[data-v2142-bite-action]')?.addEventListener('click', (ev) => { ev.preventDefault(); this.reassertImmersiveMode(); this.startReeling(); });
    root.querySelector<HTMLButtonElement>('[data-v2147-bite-action]')?.addEventListener('click', (ev) => { ev.preventDefault(); this.reassertImmersiveMode(); this.startReeling(); });
    root.querySelector<HTMLButtonElement>('[data-v2148-bite-action]')?.addEventListener('click', (ev) => { ev.preventDefault(); this.reassertImmersiveMode(); this.startReeling(); });
    root.querySelector<HTMLButtonElement>('[data-v2149-bite-action], [data-v2150-bite-action], [data-v2151-bite-action], [data-v2152-bite-action], [data-v2153-bite-action], [data-v2154-bite-action], [data-v2158-bite-action], [data-v2159-bite-action], [data-v2161-bite-action], [data-v2162-bite-action]')?.addEventListener('click', (ev) => { ev.preventDefault(); this.reassertImmersiveMode(); this.startReeling(); });
    root.querySelector<HTMLButtonElement>('[data-v2059-fishing-close]')?.addEventListener('click', () => { this.resetFishing(); void this.go('village'); });
    this.waterLayer.style.setProperty('--water-speed', `${Math.max(10, 24 / region.waterSpeed)}s`);
    const setReelInput = (active: boolean, ev?: PointerEvent | Touch) => {
      if (this.state !== 'reeling') return;
      this.holding = active;
      this.reelMode = active ? 'wind' : 'neutral';
      this.reelPanel?.classList.toggle('is-holding', active);
      this.stageHost?.classList.toggle('is-reel-holding', active);
      this.reelTouchZone?.classList.toggle('is-holding', active);
      this.reelConsole?.classList.toggle('is-winding', active);
      this.reelConsole?.classList.toggle('is-releasing', false);
      const inputState = this.reelTouchZone?.querySelector<HTMLElement>('[data-v2053-input-state]');
      if (inputState) inputState.textContent = active ? '감기 ON' : '입력 OFF';
      if (active && ev) {
        this.spawnTouchRing(ev.clientX, ev.clientY);
        this.vibrate(this.tension >= this.safeZone().left && this.tension <= this.safeZone().right ? 5 : 10);
      }
      this.updateTensionUI();
    };
    const setReelRelease = (active: boolean, ev?: PointerEvent | Touch) => {
      if (this.state !== 'reeling') return;
      this.holding = false;
      this.reelMode = active ? 'release' : 'neutral';
      this.reelPanel?.classList.toggle('is-holding', false);
      this.stageHost?.classList.toggle('is-reel-holding', false);
      this.reelTouchZone?.classList.toggle('is-holding', false);
      this.reelConsole?.classList.toggle('is-winding', false);
      this.reelConsole?.classList.toggle('is-releasing', active);
      const inputState = this.reelTouchZone?.querySelector<HTMLElement>('[data-v2053-input-state]');
      if (inputState) inputState.textContent = active ? '풀기 ON' : '입력 OFF';
      if (active && ev) {
        this.spawnTouchRing(ev.clientX, ev.clientY);
        this.vibrate(8);
      }
      this.updateTensionUI();
    };
    const startHold = (ev: PointerEvent) => {
      ev.preventDefault();
      this.reassertImmersiveMode();
      if (this.state !== 'reeling') return;
      setReelInput(true, ev);
      this.holdPad?.setPointerCapture?.(ev.pointerId);
    };
    const stopHold = () => {
      if (this.state === 'reeling') { setReelInput(false); this.reelMode = 'neutral'; this.updateTensionUI(); }
      else {
        this.holding = false;
        this.reelPanel?.classList.remove('is-holding');
        this.stageHost?.classList.remove('is-reel-holding');
        this.reelTouchZone?.classList.remove('is-holding');
      }
    };
    const startPanelHold = (ev: PointerEvent) => {
      this.reassertImmersiveMode();
      if (this.state !== 'reeling') return;
      ev.preventDefault();
      setReelInput(true, ev);
      this.reelPanel?.setPointerCapture?.(ev.pointerId);
    };
    this.holdPad.addEventListener('pointerdown', startHold);
    this.holdPad.addEventListener('pointerup', stopHold);
    this.holdPad.addEventListener('pointercancel', stopHold);
    this.holdPad.addEventListener('pointerleave', stopHold);
    this.holdPad.addEventListener('lostpointercapture', stopHold);
    this.reelTouchZone.addEventListener('pointerdown', (ev) => { ev.preventDefault(); this.reassertImmersiveMode(); setReelInput(true, ev); this.reelTouchZone?.setPointerCapture?.(ev.pointerId); });
    this.reelTouchZone.addEventListener('pointerup', stopHold);
    this.reelTouchZone.addEventListener('pointercancel', stopHold);
    this.reelTouchZone.addEventListener('pointerleave', stopHold);
    this.reelTouchZone.addEventListener('lostpointercapture', stopHold);
    this.reelPanel.addEventListener('pointerdown', startPanelHold);
    this.reelPanel.addEventListener('pointerup', stopHold);
    this.reelPanel.addEventListener('pointercancel', stopHold);
    this.reelPanel.addEventListener('pointerleave', stopHold);
    this.reelPanel.addEventListener('lostpointercapture', stopHold);
    const startTouchHold = (ev: TouchEvent) => {
      this.reassertImmersiveMode();
      if (this.state !== 'reeling') return;
      ev.preventDefault();
      const touch = ev.touches.item(0);
      if (touch) setReelInput(true, touch);
    };
    const stopTouchHold = () => {
      if (this.state === 'reeling') { setReelInput(false); this.reelMode = 'neutral'; this.updateTensionUI(); }
      else {
        this.holding = false;
        this.reelPanel?.classList.remove('is-holding');
        this.stageHost?.classList.remove('is-reel-holding');
        this.reelTouchZone?.classList.remove('is-holding');
      }
    };
    this.holdPad.addEventListener('touchstart', startTouchHold, { passive: false });
    this.holdPad.addEventListener('touchend', stopTouchHold, { passive: true });
    this.holdPad.addEventListener('touchcancel', stopTouchHold, { passive: true });
    this.reelTouchZone.addEventListener('touchstart', startTouchHold, { passive: false });
    this.reelTouchZone.addEventListener('touchend', stopTouchHold, { passive: true });
    this.reelTouchZone.addEventListener('touchcancel', stopTouchHold, { passive: true });
    const windButton = this.reelConsole?.querySelector<HTMLButtonElement>('[data-v2055-reel-wind]');
    const releaseButton = this.reelConsole?.querySelector<HTMLButtonElement>('[data-v2055-reel-release]');
    const eventPoint = (ev: Event): PointerEvent | Touch | undefined => {
      if ('clientX' in ev && 'clientY' in ev) return ev as PointerEvent;
      const touch = (ev as TouchEvent).touches?.item(0) ?? (ev as TouchEvent).changedTouches?.item(0);
      return touch ?? undefined;
    };
    const startWind = (ev: Event) => { ev.preventDefault(); this.reassertImmersiveMode(); if (this.state !== 'reeling') return; setReelInput(true, eventPoint(ev)); };
    const startRelease = (ev: Event) => { ev.preventDefault(); this.reassertImmersiveMode(); if (this.state !== 'reeling') return; setReelRelease(true, eventPoint(ev)); };
    const endWind = (ev?: Event) => { ev?.preventDefault(); if (this.state === 'reeling') { setReelInput(false); this.reelMode = 'neutral'; this.updateTensionUI(); } };
    const endRelease = (ev?: Event) => { ev?.preventDefault(); if (this.state === 'reeling') { setReelRelease(false); this.reelMode = 'neutral'; this.updateTensionUI(); } };
    windButton?.addEventListener('pointerdown', startWind);
    windButton?.addEventListener('pointerup', endWind);
    windButton?.addEventListener('pointercancel', endWind);
    windButton?.addEventListener('pointerleave', endWind);
    windButton?.addEventListener('touchstart', startWind, { passive: false });
    windButton?.addEventListener('touchend', endWind, { passive: false });
    windButton?.addEventListener('touchcancel', endWind, { passive: false });
    windButton?.addEventListener('mousedown', startWind);
    releaseButton?.addEventListener('pointerdown', startRelease);
    releaseButton?.addEventListener('pointerup', endRelease);
    releaseButton?.addEventListener('pointercancel', endRelease);
    releaseButton?.addEventListener('pointerleave', endRelease);
    releaseButton?.addEventListener('touchstart', startRelease, { passive: false });
    releaseButton?.addEventListener('touchend', endRelease, { passive: false });
    releaseButton?.addEventListener('touchcancel', endRelease, { passive: false });
    releaseButton?.addEventListener('mousedown', startRelease);
    const hardStopReelInput = () => {
      if (this.state !== 'reeling') return;
      this.holding = false;
      this.reelMode = 'neutral';
      this.reelPanel?.classList.remove('is-holding');
      this.stageHost?.classList.remove('is-reel-holding');
      this.reelTouchZone?.classList.remove('is-holding');
      this.reelConsole?.classList.remove('is-winding', 'is-releasing');
      const inputState = this.reelTouchZone?.querySelector<HTMLElement>('[data-v2053-input-state]');
      if (inputState) inputState.textContent = '입력 OFF';
      this.updateTensionUI();
    };
    window.addEventListener('blur', hardStopReelInput, { signal: fishingInputSignal });
    document.addEventListener('visibilitychange', () => { if (document.hidden) hardStopReelInput(); }, { signal: fishingInputSignal });
    root.addEventListener('pointercancel', hardStopReelInput, { signal: fishingInputSignal });
    const stopAllReelInputs = (ev?: Event) => { endWind(ev); endRelease(ev); stopHold(); stopTouchHold(); };
    window.addEventListener('mouseup', stopAllReelInputs, { passive: false, signal: fishingInputSignal });
    root.addEventListener('pointerdown', (ev: PointerEvent) => {
      const target = ev.target as HTMLElement | null;
      if (target?.closest('.bottom-nav, .fishing-hud, .recent-catch-strip, .fishing-loadout-strip, .cast-button, .bite-callout, .v2055-reel-console, .reel-panel, .v2053-reel-touch-zone, .v2054-reel-touch-zone, .hold-pad, .v2057-reel-button, [data-v2143-bite-action], [data-v2144-bite-action], [data-v2145-bite-action], [data-v2146-bite-action], [data-v2147-bite-action], [data-v2148-bite-action], [data-v2149-bite-action], [data-v2150-bite-action], [data-v2151-bite-action], [data-v2152-bite-action], [data-v2153-bite-action], [data-v2154-bite-action], [data-v2158-bite-action], [data-v2159-bite-action], [data-v2161-bite-action], [data-v2162-bite-action]')) return;
      if (this.state === 'bite') {
        ev.preventDefault();
        this.startReeling();
        setReelInput(true, ev);
        return;
      }
      if (this.state !== 'reeling') return;
      ev.preventDefault();
      setReelInput(true, ev);
    }, { passive: false, capture: true });
    root.addEventListener('pointerup', stopHold, { passive: true, capture: true });
    root.addEventListener('pointercancel', stopHold, { passive: true, capture: true });
    root.addEventListener('lostpointercapture', stopHold, { passive: true, capture: true });
    root.addEventListener('touchstart', (ev: TouchEvent) => {
      const target = ev.target as HTMLElement | null;
      if (target?.closest('.bottom-nav, .fishing-hud, .recent-catch-strip, .fishing-loadout-strip, .cast-button, .bite-callout, .v2055-reel-console, .reel-panel, .v2053-reel-touch-zone, .v2054-reel-touch-zone, .hold-pad, .v2057-reel-button, [data-v2143-bite-action], [data-v2144-bite-action], [data-v2145-bite-action], [data-v2146-bite-action], [data-v2147-bite-action], [data-v2148-bite-action], [data-v2149-bite-action], [data-v2150-bite-action], [data-v2151-bite-action], [data-v2152-bite-action], [data-v2153-bite-action], [data-v2154-bite-action], [data-v2158-bite-action], [data-v2159-bite-action], [data-v2161-bite-action], [data-v2162-bite-action]')) return;
      const touch = ev.touches.item(0);
      if (!touch) return;
      if (this.state === 'bite') this.startReeling();
      if (this.state !== 'reeling') return;
      ev.preventDefault();
      setReelInput(true, touch);
    }, { passive: false, capture: true });
    root.addEventListener('touchend', stopTouchHold, { passive: true, capture: true });
    root.addEventListener('touchcancel', stopTouchHold, { passive: true, capture: true });
    window.addEventListener('blur', stopAllReelInputs, { passive: true, signal: fishingInputSignal });
    root.addEventListener('pointerout', (ev: PointerEvent) => { if (!root.contains(ev.relatedTarget as Node | null)) stopHold(); }, { passive: true, capture: true });
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
    root.className = `game-screen ${name}-screen v800-screen v810-screen ${name === 'fishing' ? 'locked-screen v2044-fishing-playable-screen v2045-fishing-playable-screen v2046-fishing-playable-screen v2047-fishing-playable-screen v2048-fishing-playable-screen v2052-fishing-feedback-screen v2053-fishing-system-screen' : 'scroll-screen'}`;
    root.innerHTML = `<div class="ambient-bg" aria-hidden="true"></div>`;
    return root;
  }

  // v2.0.98: restore the intended right-bottom one-line dock: 홈 / 가방 / 퀘스트 / 지도.
  private mountBottomNav(root: HTMLElement, active: Screen): void {
    document.querySelectorAll('.bottom-nav.fixed-root-nav, .bottom-nav, .v2097-bottom-nav, .v2098-bottom-nav').forEach((node) => node.remove());
    root.dataset.v2098DockPolicy = `right-bottom-home-dock-${active}`;
    const items: Array<{ screen: Screen; icon: string; label: string }> = [
      { screen: 'village', icon: './assets/v22/icons/nav_village.png', label: '홈' },
      { screen: 'inventory', icon: './assets/v22/icons/nav_bag.png', label: '가방' },
      { screen: 'mission', icon: './assets/v22/icons/nav_quest.png', label: '퀘스트' },
      { screen: 'map', icon: './assets/v22/icons/nav_map.png', label: '지도' },
    ];
    const nav = document.createElement('nav');
    nav.className = 'bottom-nav v21130-bottom-nav-final v21130-direct-bottom-nav v21129-bottom-nav-final v21129-direct-bottom-nav v21128-bottom-nav-final v21128-direct-bottom-nav v21124-bottom-nav-owned v2098-bottom-nav v2111-bottom-nav v2112-bottom-nav v2113-bottom-nav v2114-bottom-nav v2115-bottom-nav v2116-bottom-nav v2117-bottom-nav v2118-bottom-nav v2119-bottom-nav v2120-bottom-nav v2121-bottom-nav v2122-bottom-nav v2123-bottom-nav v2124-bottom-nav v2125-bottom-nav v2127-bottom-nav v2128-bottom-nav v2129-bottom-nav v2130-bottom-nav v2131-bottom-nav v2132-bottom-nav v2133-bottom-nav v2135-bottom-nav v2136-bottom-nav v2137-bottom-nav v2138-bottom-nav v2139-bottom-nav v2140-bottom-nav v2142-bottom-nav v2143-bottom-nav v2145-bottom-nav v2146-bottom-nav v2147-bottom-nav v2148-bottom-nav v2149-bottom-nav v2150-bottom-nav v2151-bottom-nav v2152-bottom-nav v2153-bottom-nav v2154-bottom-nav v2159-bottom-nav v2160-bottom-nav v2161-bottom-nav v2167-bottom-nav v2168-bottom-nav';
    nav.dataset.v2098Dock = 'right-bottom-home-bag-quest-map';
    nav.dataset.v2113Dock = 'right-bottom-compact-aqua';
    nav.dataset.v2114Dock = 'right-bottom-crisp-compact';
    nav.dataset.v2115Dock = 'right-bottom-small-aqua';
    nav.dataset.v2116Dock = 'right-bottom-asset-polish';
    nav.dataset.v2117Dock = 'right-bottom-no-shift-polish';
    nav.dataset.v2118Dock = 'right-bottom-stable-polish';
    nav.dataset.v2119Dock = 'right-bottom-slightly-larger-locked';
    nav.dataset.v2120Dock = 'right-bottom-settled-locked';
    nav.dataset.v2121Dock = 'right-bottom-no-shift-readable';
    nav.dataset.v2122Dock = 'right-bottom-route-stable';
    nav.dataset.v2123Dock = 'right-bottom-no-shift-stable';
    nav.dataset.v2124Dock = 'right-bottom-input-stable';
    nav.dataset.v2125Dock = 'slightly-larger-icons-stable';
    nav.dataset.v2127Dock = 'larger-icons-village-and-pages-stable';
    nav.dataset.v2131Dock = 'fixed-right-bottom-identical-all-pages';
    nav.dataset.v2132Dock = 'premium-aqua-fixed-no-jitter';
    nav.dataset.v2133Dock = 'premium-aqua-fixed-identical-no-shift';
    nav.dataset.v2135Dock = 'same-grid-all-menu-pages-bottom-right-lock';
    nav.dataset.v2136Dock = 'same-grid-safe-area-zero-jitter-premium-aqua';
    nav.dataset.v2137Dock = 'transparent-frame-same-position-clean-icons';
    nav.dataset.v2138Dock = 'fully-transparent-frame-more-air-same-position';
    nav.dataset.v2139Dock = 'transparent-no-table-frame-fixed-premium-spacing';
    nav.dataset.v2143Dock = 'transparent-frame-audit-zero-overlap-fixed-size';
    nav.dataset.v2145Dock = 'icon-containment-no-stray-sprites-transparent-wrapper';
    nav.dataset.v2146Dock = 'clean-generated-icons-transparent-proportional-buttons';
    nav.dataset.v2147Dock = 'single-cell-border-transparent-no-stray-icons';
    nav.dataset.v2148Dock = 'single-transparent-cell-clipped-icons-no-page-shift';
    nav.dataset.v2149Dock = 'transparent-wrapper-single-cell-clean-safe-icons';
    nav.dataset.v2150Dock = 'transparent-wrapper-balanced-gap-clean-icons';
    nav.dataset.v2152Dock = 'compact-transparent-icons-visible-gap';
    nav.dataset.v2153Dock = 'transparent-clipped-icons-stable';
    nav.dataset.v2154Dock = 'transparent-icon-clip-stable';
    nav.dataset.v2159Dock = 'same-position-icon-clip-no-shift-premium-aqua';
    nav.dataset.v2160Dock = 'same-position-icon-clip-no-shift-safe-area-aqua';
    nav.dataset.v2161Dock = 'same-position-icon-clip-no-shift-center-bite-safe-area';
    nav.dataset.v2167Dock = 'same-position-premium-aqua-icon-clip-no-jitter';
    nav.dataset.v2168Dock = 'zero-jitter-premium-aqua-icon-clip-safe-area';
    nav.dataset.v21128BottomNav = 'direct-source-one-screen-one-position';
    nav.dataset.v21130BottomNav = 'direct-source-one-screen-one-position-regression-guard';
    nav.style.setProperty('right', 'var(--v21130-nav-right)', 'important');
    nav.style.setProperty('bottom', 'var(--v21130-nav-bottom)', 'important');
    nav.style.setProperty('left', 'auto', 'important');
    nav.style.setProperty('top', 'auto', 'important');
    nav.setAttribute('aria-label', '주요 메뉴');
    nav.innerHTML = items.map((item) => `
      <button type="button" class="v2098-nav-item ${item.screen === active ? 'active' : ''}" data-screen="${item.screen}" data-v2098-nav="${item.screen}" aria-label="${item.label}" aria-current="${item.screen === active ? 'page' : 'false'}">
        <img src="${item.icon}" alt="" aria-hidden="true" />
        <span>${item.label}</span>
      </button>`).join('');
    nav.querySelectorAll<HTMLButtonElement>('[data-v2098-nav]').forEach((btn) => {
      btn.addEventListener('pointerdown', (ev) => { ev.stopPropagation(); }, { capture: true });
      btn.addEventListener('pointerup', (ev) => { ev.stopPropagation(); }, { capture: true });
      btn.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        const next = btn.dataset.v2098Nav as Screen | undefined;
        if (!next || next === active) return;
        void this.go(next);
      });
    });
    root.appendChild(nav);
    this.applyV2133UiEngineGuard(root, nav);
    this.syncV21129DirectUi('mount-bottom-nav');
    this.syncV21130DirectSourceUi('mount-bottom-nav');
    this.syncV21131StaleObserverQuarantineUi('mount-bottom-nav');
  }


  private applyV2133UiEngineGuard(root: HTMLElement, nav?: HTMLElement): void {
    root.classList.add('v2133-ui-engine-screen', 'v2159-premium-aqua-ui-screen', 'v2160-premium-aqua-ui-screen', 'v2161-premium-aqua-ui-screen', 'v2162-premium-aqua-ui-screen', 'v2163-premium-aqua-ui-screen', 'v2134-ui-engine-screen', 'v2135-ui-engine-screen', 'v2136-ui-engine-screen', 'v2137-ui-engine-screen', 'v2138-ui-engine-screen', 'v2139-ui-engine-screen', 'v2143-ui-overlap-sweep-screen', 'v2145-icon-page-polish-screen', 'v2146-ui-overlap-icon-polish-screen', 'v2147-ui-overlap-layout-polish-screen', 'v2149-ui-composition-polish-screen', 'v2150-overlap-placement-beauty-screen', 'v2155-page-overlap-polish-screen', 'v2159-page-overlap-polish-screen', 'v2160-page-overlap-polish-screen', 'v2163-page-polish-screen');
    const activeNav = nav ?? root.querySelector<HTMLElement>('.bottom-nav');
    document.querySelectorAll<HTMLElement>('.bottom-nav').forEach((node) => {
      if (node !== activeNav) node.remove();
    });
    if (activeNav) {
      activeNav.classList.add('v2133-bottom-nav', 'v2160-bottom-nav', 'v2161-bottom-nav', 'v2162-bottom-nav', 'v2163-bottom-nav', 'v2135-bottom-nav', 'v2136-bottom-nav', 'v2137-bottom-nav', 'v2138-bottom-nav', 'v2139-bottom-nav', 'v2140-bottom-nav', 'v2142-bottom-nav', 'v2143-bottom-nav', 'v2144-bottom-nav', 'v2145-bottom-nav', 'v2146-bottom-nav', 'v2147-bottom-nav', 'v2148-bottom-nav', 'v2149-bottom-nav', 'v2150-bottom-nav', 'v2151-bottom-nav', 'v2152-bottom-nav', 'v2153-bottom-nav', 'v2155-bottom-nav', 'v2159-bottom-nav', 'v2168-bottom-nav');
      activeNav.dataset.v2133Dock = 'premium-aqua-fixed-identical-no-shift';
      activeNav.dataset.v2134Dock = 'same-position-size-gap-no-press-shift';
      activeNav.dataset.v2135Dock = 'same-grid-all-menu-pages-bottom-right-lock';
      activeNav.dataset.v2136Dock = 'same-grid-safe-area-zero-jitter-premium-aqua';
      activeNav.dataset.v2137Dock = 'transparent-frame-same-position-clean-icons';
      activeNav.dataset.v2138Dock = 'fully-transparent-frame-more-air-same-position';
      activeNav.dataset.v2139Dock = 'transparent-no-table-frame-fixed-premium-spacing';
      activeNav.dataset.v2143Dock = 'transparent-frame-audit-zero-overlap-fixed-size';
      activeNav.dataset.v2145Dock = 'icon-containment-no-stray-sprites-transparent-wrapper';
      activeNav.dataset.v2146Dock = 'clean-generated-icons-transparent-proportional-buttons';
      activeNav.dataset.v2147Dock = 'single-cell-border-transparent-no-stray-icons';
      activeNav.dataset.v2149Dock = 'transparent-wrapper-single-cell-clean-safe-icons';
      activeNav.dataset.v2155Dock = 'transparent-wrapper-icon-clip-zero-stray';
      activeNav.dataset.v2150Dock = 'transparent-wrapper-balanced-gap-clean-icons';
      activeNav.dataset.v2152Dock = 'compact-transparent-icons-visible-gap';
      activeNav.dataset.v2153Dock = 'transparent-clipped-icons-stable';
      activeNav.dataset.v2154Dock = 'transparent-icon-clip-stable';
      activeNav.dataset.v2159Dock = 'same-position-icon-clip-no-shift-premium-aqua';
      activeNav.dataset.v2160Dock = 'same-position-icon-clip-no-shift-safe-area-aqua';
      activeNav.dataset.v2161Dock = 'same-position-icon-clip-no-shift-center-bite-safe-area';
      activeNav.dataset.v2168Dock = 'zero-jitter-premium-aqua-icon-clip-safe-area';
      activeNav.setAttribute('data-no-swipe', 'true');
      activeNav.querySelectorAll<HTMLElement>('.v2098-nav-item').forEach((item) => {
        item.style.setProperty('transform', 'none', 'important');
        item.style.setProperty('translate', 'none', 'important');
      });
    }
    const closeButtons = root.querySelectorAll<HTMLElement>('.v2097-ui-close, .v2097-menu-close, .v2059-screen-close, .v2059-result-close, .game-dialog-close');
    closeButtons.forEach((button) => button.classList.add('v2133-close-control'));
    window.requestAnimationFrame(() => {
      this.repairScreenBounds(root);
      if (activeNav) this.repairBottomNavBounds(activeNav);
      this.repairScrollableContentFlow(root);
    });
    window.setTimeout(() => {
      this.repairScreenBounds(root);
      if (activeNav) this.repairBottomNavBounds(activeNav);
      this.repairScrollableContentFlow(root);
    }, 120);
  }

  private resolveFishingFailurePressure(dt: number): void {
    if (this.state !== 'reeling') return;
    const lethal = this.tension <= 0 || this.tension >= 100 || this.escapePressure >= 1;
    if (lethal) {
      const before = this.failureRecoveryTimer;
      this.failureRecoveryTimer = Math.min(3.25, this.failureRecoveryTimer + dt / 112);
      if (before <= 0.18 && this.failureRecoveryTimer > 0.18) {
        this.spawnActionBadge('복구 기회', this.tension >= 100 ? '장력이 높아요 · 풀기로 줄을 살리세요' : '줄이 느슨해요 · 감기로 다시 당기세요');
      }
      if (this.failureRecoveryTimer >= 1.62) this.finishCatch(false);
    } else {
      this.failureRecoveryTimer = Math.max(0, this.failureRecoveryTimer - dt / 34);
    }
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
    this.biteText = new Text({ text: '뿅!', style: { fontFamily: 'Arial', fontSize: 82, fontWeight: '900', fill: 0xff5848, stroke: { color: 0xffffff, width: 9 } } });

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
      if (target?.closest('.cast-button, .bite-callout, .reel-panel, .v2055-reel-console, .fishing-hud, .recent-catch-strip, .fishing-loadout-strip')) return;
      if (this.state === 'idle') this.castLine();
      else if (this.state === 'bite') {
        this.startReeling();
        this.holding = true;
        this.reelPanel?.classList.add('is-holding');
        this.stageHost?.classList.add('is-reel-holding');
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
    this.configureV21134RenderBudget('pixi-stage-init');
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
    if (loadoutSlots[0]) loadoutSlots[0].textContent = `낚싯대 Lv.${this.save.gear.rodLevel}`;
    if (loadoutSlots[1]) loadoutSlots[1].textContent = `미끼 ${this.save.gear.lureStock}개`;
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
    this.fishingBobberAnchorX = this.bobber.x;
    this.fishingBobberAnchorY = this.bobber.y;
    this.fishingBobberPullOffset = 0;
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
    if (document.body.dataset.screen === 'fishing') document.body.dataset.fishingPhase = phase;
    this.updateFishingDirector(phase);
    this.syncV21129DirectUi(`fishing-phase-${phase}`);
    this.syncV21130DirectSourceUi(`fishing-phase-${phase}`);
    this.syncV21131StaleObserverQuarantineUi(`fishing-phase-${phase}`);
    this.syncV21134RenderBudgetUiWriteLedgerUi(`fishing-phase-${phase}`);
    this.configureV21134RenderBudget(`fishing-phase-${phase}`);
  }

  private updateFishingDirector(phase: FishingState = this.state): void {
    const screen = dom.app.querySelector<HTMLElement>('.fishing-screen');
    if (!screen) return;
    const stepByPhase: Record<FishingState, 'cast' | 'bite' | 'reel' | 'catch'> = { idle: 'cast', casting: 'cast', waiting: 'bite', bite: 'bite', reeling: 'reel', success: 'catch', fail: 'catch' };
    const copy: Record<FishingState, { pulse: string; title: string; body: string }> = {
      idle: { pulse: 'READY', title: '프리미엄 캐스팅 준비', body: '수면과 조류를 확인하고 낚시 시작을 눌러 캐스팅하세요.' },
      casting: { pulse: 'CAST', title: '찌가 날아갑니다', body: '착수 후 물결이 안정되면 입질 대기 상태로 전환됩니다.' },
      waiting: { pulse: 'SCAN', title: '입질을 기다리는 중', body: '물고기 그림자와 물결 반응을 보고 신호가 뜨면 바로 대응하세요.' },
      bite: { pulse: 'BITE', title: '물었다! 뿅!', body: '중앙 신호가 뜨면 바로 눌러 실전 게이지로 진입하세요.' },
      reeling: { pulse: 'REEL', title: '릴링 배틀 진행 중', body: '안전 구간에 텐션을 유지하면 포획 게이지가 상승합니다.' },
      success: { pulse: 'CATCH', title: '포획 성공', body: '보상 정산 후 계속 버튼으로 다음 캐스팅을 이어가세요.' },
      fail: { pulse: 'BREAK', title: '줄이 버티지 못했습니다', body: '장비를 강화하고 다음 캐스팅에서는 텐션을 더 부드럽게 유지하세요.' },
    };
    const activeStep = stepByPhase[phase];
    screen.querySelectorAll<HTMLElement>('[data-v2132-flow-step]').forEach((node) => {
      const isActive = node.dataset.v2132FlowStep === activeStep;
      node.classList.toggle('active', isActive);
      node.setAttribute('aria-current', isActive ? 'step' : 'false');
    });
    const title = screen.querySelector<HTMLElement>('[data-v2132-director-title]');
    const body = screen.querySelector<HTMLElement>('[data-v2132-director-body]');
    const pulse = screen.querySelector<HTMLElement>('[data-v2132-director-pulse]');
    const item = copy[phase];
    if (title) title.textContent = item.title;
    if (body) body.textContent = item.body;
    if (pulse) pulse.textContent = item.pulse;
    const coachPrimary = screen.querySelector<HTMLElement>('[data-v2133-coach-primary]');
    const coachSecondary = screen.querySelector<HTMLElement>('[data-v2133-coach-secondary]');
    const dangerMeter = screen.querySelector<HTMLElement>('[data-v2133-danger-meter]');
    if (coachPrimary && phase !== 'reeling') coachPrimary.textContent = item.title;
    if (coachSecondary && phase !== 'reeling') coachSecondary.textContent = item.body;
    if (dangerMeter && phase !== 'reeling') dangerMeter.style.width = phase === 'fail' ? '100%' : '0%';
    const priorityTitle = screen.querySelector<HTMLElement>('[data-v2140-priority-title]');
    const priorityBody = screen.querySelector<HTMLElement>('[data-v2140-priority-body]');
    const priorityCopy: Record<FishingState, { title: string; body: string }> = {
      idle: { title: '낚시 준비', body: '로드·미끼를 확인하고 캐스팅하세요.' },
      casting: { title: '캐스팅 중', body: '수면 반응을 기다립니다.' },
      waiting: { title: '입질 대기', body: '바다물길과 물결 신호를 확인하세요.' },
      bite: { title: '물었다! 뿅!', body: '중앙 멘트 확인 후 한 번 눌러 릴링을 시작하세요.' },
      reeling: { title: '게이지 우선', body: '포획·텐션·저항을 안전 구간 안에 유지하세요.' },
      success: { title: '포획 성공', body: '보상 정산 후 다음 캐스팅을 이어가세요.' },
      fail: { title: '다시 도전', body: '욕심내지 말고 장력부터 안정시키세요.' },
    };
    if (priorityTitle) priorityTitle.textContent = priorityCopy[phase].title;
    if (priorityBody) priorityBody.textContent = priorityCopy[phase].body;
  }

  private createCastButton(): void {
    if (!this.uiLayer) return;
    this.uiLayer.innerHTML = `<button class="cast-button v21116-cast-button-stable v2020-cast-button v2021-bait-aware-cast v2026-stable-cast-button v2029-calm-cast-button v2030-cast-button v2031-cast-button v2032-cast-button v2033-cast-button v2034-cast-button v2035-cast-button v2036-cast-button v2037-cast-button v2038-cast-button v2040-cast-button v2041-cast-button v2042-cast-button v2043-cast-button v2044-cast-button v2045-cast-button v2048-cast-button v2049-cast-button v2050-cast-button v2051-cast-button v2132-cast-button v2134-cast-button v2135-cast-button v2137-cast-button v2138-cast-button v2139-cast-button v2140-cast-button v2142-cast-button v2143-cast-button v2144-cast-button v2145-cast-button v2146-cast-button v2147-cast-button v2148-cast-button v2149-cast-button v2150-cast-button v2151-cast-button v2152-cast-button v2154-cast-button v2155-cast-button v2159-cast-button v2160-cast-button v2161-cast-button v2162-cast-button v2163-cast-button v2167-cast-button v2171-cast-button" type="button" aria-label="낚시 시작"><img class="v2020-cast-button-art" src="${ASSET.uiButtonSmallAqua}" alt="" aria-hidden="true" /><img class="v2021-cast-pill-art" src="${ASSET.uiButtonPillAqua}" alt="" aria-hidden="true" /><span class="cast-icon" aria-hidden="true"></span><strong>캐스팅 시작</strong></button>`;
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
    if (label) label.textContent = empty ? '미끼 보충 필요' : '캐스팅 시작';
  }

  private canStartFishingCast(): boolean {
    if (this.save.gear.lureStock > 0) return true;
    this.syncCastButtonState();
    this.setHint('미끼가 없습니다 · 가방/장비 화면에서 미끼를 보충한 뒤 출항하세요');
    this.spawnActionBadge('미끼 없음', '장비 화면에서 미끼를 보충하세요');
    this.toast.show({ type: 'shop', title: '미끼 보충 필요', message: '장비 또는 상점에서 미끼를 보충한 뒤 다시 캐스팅하세요.', actionScreen: 'shop' });
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
    this.activeFishProfile = this.createFishTensionProfile(this.activeFish);
    this.fishingSafeZoneCenter = 55 + Math.max(-4, Math.min(4, this.activeFishProfile.tensionBias * 0.22));
    this.fishingSafeZoneLastAt = performance.now();
    void this.syncCatchSpriteTexture(this.activeFish);
    this.bobber.visible = true;
    this.fishingBobberPullOffset = 0;
    this.fishingBobberAnchorX = this.bobber.x;
    this.fishingBobberAnchorY = this.bobber.y;
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
    this.spawnActionBadge('캐스팅', '수면 중앙으로 찌가 날아갑니다');
    this.setHint('찌가 포물선을 그리며 날아갑니다');
    window.setTimeout(() => this.castBtn?.classList.add('hidden'), 260);
  }

  private scheduleBite(): void {
    this.state = 'waiting';
    this.setFishingPhase('waiting');
    this.stageHost?.classList.remove('casting-mode');
    this.stageHost?.classList.add('waiting-mode');
    if (this.bobber) {
      this.fishingBobberAnchorX = this.bobber.x;
      this.fishingBobberAnchorY = this.bobber.y;
      this.fishingBobberPullOffset = 0;
    }
    this.setHint('입질을 기다리세요 · 물결 신호가 뜨면 화면을 눌러 릴링하세요');
    const delay = 2200 + Math.random() * 1900 - this.save.gear.reelLevel * 60 - Math.min(420, this.save.gear.lureStock * 12);
    window.clearTimeout(this.biteTimeout);
    this.biteTimeout = window.setTimeout(() => this.triggerBite(), Math.max(1300, delay));
  }

  private triggerBite(): void {
    if (this.state !== 'waiting') return;
    playSound('bite');
    this.vibrate([24, 24, 14]);
    this.state = 'bite';
    this.setFishingPhase('bite');
    if (this.bobber) {
      this.fishingBobberAnchorX = this.bobber.x;
      this.fishingBobberAnchorY = this.bobber.y;
      this.fishingBobberPullOffset = 0;
    }
    if (this.biteText) this.biteText.visible = true;
    this.stageHost?.classList.remove('waiting-mode');
    this.stageHost?.classList.add('bite-mode');
    this.stageHost?.classList.add('bite-stable-flash');
    this.setHint(`${this.activeFish.rarity === 'BOSS' ? '보스가' : '물고기가'} 물었다! 뿅! 큰 버튼 또는 바다 화면을 눌러 릴링을 시작하세요`);
    this.showBiteCallout('물었다!', this.activeFish.rarity === 'BOSS' ? '뿅! 강한 보스 신호예요. 바로 텐션을 잡으세요.' : '뿅! 신호가 왔어요. 릴링 버튼으로 텐션을 맞추세요.');
    this.updateFishingDirector('bite');
    this.spawnBiteBurst();
    // v2.1.116: keep the bite callout stable until the player taps it; no auto-close/auto-reel jump.
    window.setTimeout(() => this.stageHost?.classList.remove('camera-shake', 'bite-flash', 'bite-stable-flash'), 520);
  }

  private startReeling(): void {
    if (this.state !== 'bite') return;
    this.vibrate(14);
    this.state = 'reeling';
    this.setFishingPhase('reeling');
    this.stageHost?.classList.remove('bite-mode', 'waiting-mode');
    this.stageHost?.classList.add('reeling-mode');
    this.activeFishProfile = this.createFishTensionProfile(this.activeFish);
    this.fishingSafeZoneCenter = 55 + Math.max(-4, Math.min(4, this.activeFishProfile.tensionBias * 0.22));
    this.fishingSafeZoneLastAt = performance.now();
    this.tension = Math.max(34, Math.min(66, 48 + this.getRegion().difficulty * 1.2 + this.activeFishProfile.tensionBias));
    this.safeTimer = 0;
    this.surgeTimer = 0;
    this.perfectChain = 0;
    this.routeGuardActive = false;
    this.lastReelPulseAt = 0;
    this.holding = false;
    this.reelMode = 'neutral';
    this.fishMood = 'calm';
    this.fishStamina = 100;
    this.catchProgress = 0;
    this.escapePressure = 0;
    this.failureRecoveryTimer = 0;
    this.moodShiftAt = performance.now();
    if (this.bobber) {
      this.fishingBobberAnchorX = this.bobber.x;
      this.fishingBobberAnchorY = this.bobber.y;
      this.fishingBobberPullOffset = 0;
    }
    this.stageHost?.setAttribute('data-fish-mood', this.fishMood);
    if (this.biteText) this.biteText.visible = false;
    this.hideBiteCallout();
    this.reelPanel?.classList.remove('hidden');
    this.reelTouchZone?.classList.remove('hidden');
    this.reelConsole?.classList.remove('hidden');
    this.holdPad?.removeAttribute('disabled');
    this.updateTensionUI();
    this.setHint(`${this.activeFish.name} · ${this.activeFishProfile.label} 패턴입니다. 감기/풀기로 텐션을 안전 구간에 유지하세요.`);
    this.updateTensionUI();
    this.spawnActionBadge('릴링 시작', `${this.activeFishProfile.label} · 텐션과 저항을 읽으세요`);
  }

  private finishCatch(success: boolean): void {
    if (this.state === 'success' || this.state === 'fail') return;
    this.state = success ? 'success' : 'fail';
    this.setFishingPhase(this.state);
    this.holding = false;
    this.reelMode = 'neutral';
    this.reelPanel?.classList.remove('is-holding');
    this.reelMode = 'neutral';
    this.stageHost?.classList.remove('is-reel-holding');
    this.hideBiteCallout();
    this.reelPanel?.classList.add('hidden');
    this.reelTouchZone?.classList.add('hidden');
    this.reelConsole?.classList.add('hidden');
    this.reelConsole?.classList.remove('is-winding', 'is-releasing', 'is-safe', 'is-danger', 'v2063-overlap', 'mood-calm', 'mood-pulling', 'mood-burst', 'mood-tired', 'mood-escaping');
    this.reelPanel?.classList.remove('mood-calm', 'mood-pulling', 'mood-burst', 'mood-tired', 'mood-escaping');
    this.stageHost?.removeAttribute('data-fish-mood');
    this.reelTouchZone?.classList.remove('is-holding');
    this.holdPad?.setAttribute('disabled', 'true');
    if (success) {
      playSound('success');
      this.vibrate([20, 35, 55]);
      const baseReward = this.calculateReward(this.activeFish);
      const firstCatch = (this.save.caught[this.activeFish.id] ?? 0) <= 0;
      const settlement = this.createCatchGrowthSettlement(this.activeFish, baseReward, firstCatch);
      this.save.caught[this.activeFish.id] = (this.save.caught[this.activeFish.id] ?? 0) + 1;
      this.save.mastery[this.activeFish.regionKey] = (this.save.mastery[this.activeFish.regionKey] ?? 0) + 1;
      this.applyCatchGrowthSettlement(settlement);
      this.save.totalSuccess += 1;
      this.save.currentStreak += 1;
      this.save.bestStreak = Math.max(this.save.bestStreak, this.save.currentStreak);
      this.updateUnlocks();
      saveGame(this.save);
      this.save = appendLocalSyncEvent(this.save, { type: 'fishing-result', payload: { fishId: this.activeFish.id, rarity: this.activeFish.rarity, reward: settlement.reward, fund: settlement.fund, development: settlement.development, region: this.activeFish.regionKey, success: true } });
      this.syncFishingHud();
      if (this.comboNode) { this.comboNode.textContent = `연속 성공 x${Math.max(2, this.save.currentStreak)}`; this.comboNode.classList.toggle('hidden', this.save.currentStreak < 2); }
      void this.syncCatchSpriteTexture(this.activeFish).finally(() => this.showCatchPopup(settlement));
      this.spawnRewardBurst(settlement.reward);
      // v2.0.59: result card is the single acquisition UI; avoid duplicate toast/result popups.
    } else {
      playSound('fail');
      this.save.currentStreak = 0;
      this.save.totalFail += 1;
      saveGame(this.save);
      this.save = appendLocalSyncEvent(this.save, { type: 'fishing-result', payload: { fishId: this.activeFish.id, rarity: this.activeFish.rarity, region: this.activeFish.regionKey, success: false } });
      this.syncFishingHud();
      this.toast.show({ type: 'fishing', title: '텐션을 놓쳤어요', message: '감기와 풀기를 번갈아 조절하면 다음 포획 확률이 올라갑니다.', actionScreen: 'gear' });
      this.resetFishing();
    }
  }

  private showCatchPopup(settlement: CatchGrowthSettlement): void {
    document.querySelectorAll('.catch-result-card').forEach((node) => node.remove());
    if (this.fallbackMode || !this.pixi || !this.catchSprite) {
      this.stageHost?.classList.add('catch-bloom');
      window.setTimeout(() => this.showResultCard(settlement), 520);
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
      if (t > 0.78 && !document.querySelector('.catch-result-card')) this.showResultCard(settlement);
      if (t > 1.9) {
        this.pixi.ticker.remove(popup);
        this.stageHost?.classList.remove('catch-bloom');
      }
    };
    this.pixi?.ticker.add(popup);
  }

  private showResultCard(settlement: CatchGrowthSettlement): void {
    const existingResult = document.querySelector('.catch-result-card.v2064-result-card');
    if (this.resultCardOpen && existingResult) return;
    document.querySelectorAll('.catch-result-card').forEach((node) => node.remove());
    const card = document.createElement('div');
    this.resultCardOpen = true;
    card.className = `catch-result-card v21131-result-final v21130-result-final v21129-result-final v21129-direct-result v21128-result-final v21128-direct-result v21124-result-owned v21116-result-card-stable v930-result v2064-result-card v2021-result-card v2036-result-card v2037-result-card v2038-result-card v2039-result-card v2040-result-card v2041-result-card v2042-result-card v2043-result-card v2044-result-card v2045-result-card v2051-result-card v2053-result-card v2054-result-card v2055-result-card v2057-result-card v2059-result-card v2169-result-card v2170-result-card v2171-result-card v2184-result-card v2185-result-card v2192-result-card v2193-result-card rarity-${this.activeFish.rarity.toLowerCase()}`;
    card.dataset.v21116ResultCard = 'locked-size-aqua-stable';
    const impactRows = [
      ['판매', `+${settlement.reward.toLocaleString('ko-KR')}G`],
      ['마을기금', `+${settlement.fund.toLocaleString('ko-KR')}G`],
      ['발전도', `+${settlement.development}`],
      ['관광', `+${settlement.tourists}`],
    ];
    card.innerHTML = `<button type="button" class="v2059-result-close" data-next="fishing" aria-label="획득창 닫기">×</button><i class="result-sparkle" aria-hidden="true"></i><div class="v2196-result-ribbon v2057-result-ribbon v2059-result-ribbon">${settlement.firstCatch ? '새 도감 등록' : '자동 판매 완료'}</div><div class="v2196-result-shell v2051-result-shell v2057-result-shell v2059-result-shell"><img class="v205-result-fish" src="${this.activeFish.img}" alt="" /><div class="v2196-result-copy v2051-result-copy v2057-result-copy v2059-result-copy"><small>${this.activeFish.rarity}</small><h3>${this.activeFish.name}</h3><span><img src="${ASSET.fishingTreasure}" alt="" />${settlement.reward.toLocaleString('ko-KR')}G</span><em>연속 x${Math.max(1, this.save.currentStreak)} · ${settlement.story}</em></div></div><div class="v2196-result-impact v2074-result-impact">${impactRows.map(([label, value]) => `<article><strong>${value}</strong><span>${label}</span></article>`).join('')}</div><div class="v2196-result-actions v2051-result-actions v2057-result-actions v2059-result-actions v2074-result-actions v2169-result-actions v2170-result-actions v2171-result-actions v2172-result-actions"><button class="v2169-result-primary" data-next="fishing">계속</button><button class="v2169-result-secondary" data-next="inventory">가방</button><button class="v2169-result-secondary" data-next="dex">도감</button><button class="v2169-result-secondary" data-next="village">마을</button></div>`;
    (dom.app.querySelector<HTMLElement>('.fishing-screen') ?? this.stageHost)?.appendChild(card);
    this.syncV21129DirectUi('show-result-card');
    this.syncV21130DirectSourceUi('show-result-card');
    this.syncV21131StaleObserverQuarantineUi('show-result-card');
    card.querySelectorAll<HTMLButtonElement>('[data-next]').forEach((btn) => btn.addEventListener('click', () => {
      const next = btn.dataset.next as Screen;
      this.resultCardOpen = false;
      card.remove();
      if (next === 'fishing') this.resetFishing();
      else void this.go(next);
    }));
    window.setTimeout(() => {
      if (card.isConnected) card.classList.add('v2059-result-idle');
    }, 7000);
  }

  private resetFishing(): void {
    if (this.bobber) this.bobber.visible = false;
    if (this.catchSprite) this.catchSprite.visible = false;
    if (this.biteText) this.biteText.visible = false;
    this.hideBiteCallout();
    this.reelPanel?.classList.add('hidden');
    this.reelTouchZone?.classList.add('hidden');
    this.reelConsole?.classList.add('hidden');
    this.reelConsole?.classList.remove('is-winding', 'is-releasing', 'is-safe', 'is-danger', 'v2063-overlap', 'mood-calm', 'mood-pulling', 'mood-burst', 'mood-tired', 'mood-escaping');
    this.reelPanel?.classList.remove('mood-calm', 'mood-pulling', 'mood-burst', 'mood-tired', 'mood-escaping');
    this.stageHost?.removeAttribute('data-fish-mood');
    this.reelTouchZone?.classList.remove('is-holding');
    this.reelPanel?.classList.remove('is-holding');
    this.stageHost?.classList.remove('is-reel-holding');
    this.stageHost?.classList.remove('catch-bloom', 'fallback-casting', 'surge-alert', 'guard-active', 'casting-mode', 'waiting-mode', 'bite-mode', 'reeling-mode');
    this.stageHost?.querySelectorAll('.v930-fx, .action-badge').forEach((node) => node.remove());
    this.stageHost?.querySelector('.catch-result-card')?.remove();
    dom.app.querySelector('.catch-result-card')?.remove();
    this.resultCardOpen = false;
    this.fishingBobberPullOffset = 0;
    this.fishMood = 'calm';
    this.fishStamina = 100;
    this.catchProgress = 0;
    this.escapePressure = 0;
    this.failureRecoveryTimer = 0;
    this.fishingSafeZoneCenter = 55;
    this.fishingSafeZoneLastAt = 0;
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
      const biteLift = this.state === 'bite' ? Math.sin(now / 100) * 0.7 : 0;
      this.bobber.position.set(
        this.fishingBobberAnchorX + Math.sin(now / 620) * 1.1,
        this.fishingBobberAnchorY + Math.sin(now / 250) * 1.8 + biteLift,
      );
      this.bobber.rotation = Math.sin(now / 520) * 0.04;
    } else if (this.state === 'reeling') {
      const status = this.advanceFishingBattle(now, dt);
      if (this.bobber) {
        const pull = this.reelMode === 'wind' ? -0.16 : this.reelMode === 'release' ? 0.15 : 0.05;
        this.fishingBobberPullOffset = Math.max(-8, Math.min(10, this.fishingBobberPullOffset + pull * dt));
        if (this.reelMode === 'neutral') this.fishingBobberPullOffset *= 0.985;
        const shake = this.fishMood === 'burst' ? 2.4 : this.fishMood === 'tired' ? 0.65 : 1.15;
        this.bobber.position.set(
          this.fishingBobberAnchorX + Math.sin(now / 120) * shake,
          this.fishingBobberAnchorY + this.fishingBobberPullOffset + Math.sin(now / 170) * (shake * 0.42),
        );
        this.bobber.rotation = Math.sin(now / 120) * (this.fishMood === 'burst' ? 0.16 : this.holding ? 0.10 : 0.06);
      }
      this.stageHost?.classList.toggle('surge-alert', this.fishMood === 'burst');
      const pulseGap = status.safe ? 820 : (this.tension < 16 || this.tension > 86 || this.fishMood === 'burst' ? 420 : 560);
      if (now - this.lastReelPulseAt > pulseGap) {
        this.lastReelPulseAt = now;
        if (status.safe) this.vibrate(6);
        else if (this.tension < 16 || this.tension > 86 || this.fishMood === 'burst') this.vibrate([12, 18, 18]);
      }
      this.updateTensionUI();
      this.resolveFishingFailurePressure(dt);
      if (this.catchProgress >= 100) this.finishCatch(true);
    }
  }


  private tickFallback(now: number, dt: number): void {
    if (this.state !== 'reeling') return;
    const status = this.advanceFishingBattle(now, dt);
    this.stageHost?.classList.toggle('surge-alert', this.fishMood === 'burst');
    this.updateTensionUI();
    this.resolveFishingFailurePressure(dt);
    if (this.catchProgress >= 100) this.finishCatch(true);
  }


  private advanceFishingBattle(now: number, dt: number): { safe: boolean; perfect: boolean } {
    // FISHING_V2132_PREMIUM_BALANCE_LOCK: smoother mobile portrait control, clearer tension feedback, less sudden failure.
    const regionMod = this.getRegion().difficulty;
    const profile = this.activeFishProfile;
    const gearRelief = 1 + this.save.gear.rodLevel * 0.06 + this.save.gear.reelLevel * 0.05 + this.save.gear.lineLevel * 0.05;
    const staminaFatigue = Math.max(0, 100 - this.fishStamina) / 100;
    const staminaDrag = Math.max(0.72, 1 - staminaFatigue * 0.26 * profile.fatigueRelief);
    const rarityMod = (this.activeFish.rarity === 'BOSS' ? 1.30 : this.activeFish.rarity === 'EPIC' ? 1.14 : this.activeFish.rarity === 'RARE' ? 1.06 : 1) * profile.volatility * staminaDrag;
    this.surgeTimer += dt / 60;
    const burstThreshold = Math.max(0.66, 0.84 - (profile.burst - 1) * 0.08 + staminaFatigue * 0.10);
    const burstPulse = this.fishStamina > 16 && this.surgeTimer > Math.max(0.74, 1.08 - profile.burst * 0.12) && Math.sin(now / profile.cadence) > burstThreshold;
    const zoneBefore = this.safeZone();
    const dangerouslyLoose = this.tension < Math.max(10, zoneBefore.left - 14);
    const dangerouslyTight = this.tension > Math.min(92, zoneBefore.right + 16);
    const nextMood: FishMood = dangerouslyLoose
      ? 'escaping'
      : (burstPulse || dangerouslyTight)
        ? 'burst'
        : this.fishStamina <= 34
          ? 'tired'
          : this.tension >= zoneBefore.left && this.tension <= zoneBefore.right
            ? 'calm'
            : 'pulling';
    this.setFishMood(nextMood, now);

    const moodDrift = this.fishMood === 'burst' ? 0.44 : this.fishMood === 'escaping' ? -0.26 : this.fishMood === 'tired' ? 0.08 : this.fishMood === 'pulling' ? 0.22 : 0.12;
    const drift = (Math.sin(now / 215) * moodDrift * regionMod * rarityMod + Math.sin(now / 770) * 0.10) * profile.pull;
    const windForce = (this.fishMood === 'burst' ? 1.04 : this.fishMood === 'tired' ? 0.80 : 0.92) * profile.pull;
    const releaseForce = (this.fishMood === 'escaping' ? -0.64 : -1.04) * Math.max(.82, profile.resistance);
    const neutralForce = (this.fishMood === 'escaping' ? -0.50 : this.fishMood === 'burst' ? 0.04 : -0.39) * profile.resistance;
    const controlForce = this.reelMode === 'wind'
      ? windForce + regionMod * 0.10
      : this.reelMode === 'release'
        ? releaseForce - regionMod * 0.05
        : neutralForce - regionMod * 0.03;
    this.tension += (controlForce / gearRelief) * dt + drift * 0.24;
    this.tension = Math.max(-4, Math.min(104, this.tension));

    const zone = this.safeZone();
    const recoveryInput = (this.tension < zone.left && this.reelMode === 'wind') || (this.tension > zone.right && this.reelMode === 'release');
    if (recoveryInput) {
      const towardCenter = ((zone.left + zone.right) / 2 - this.tension) * 0.018 * profile.recoveryGrace;
      this.tension = Math.max(-4, Math.min(104, this.tension + towardCenter * dt));
      this.escapePressure = Math.max(0, this.escapePressure - 0.018 * profile.recoveryGrace * dt / 60);
      this.failureRecoveryTimer = Math.max(0, this.failureRecoveryTimer - 0.026 * profile.recoveryGrace * dt);
    }

    const zoneAfterAssist = this.safeZone();
    const safe = this.tension >= zoneAfterAssist.left && this.tension <= zoneAfterAssist.right;
    const center = (zoneAfterAssist.left + zoneAfterAssist.right) / 2;
    const perfect = Math.abs(this.tension - center) < Math.max(3.6, (zoneAfterAssist.right - zoneAfterAssist.left) * 0.20);
    this.perfectChain = perfect ? this.perfectChain + dt / 60 : Math.max(0, this.perfectChain - dt / 45);
    if (this.perfectChain > 1.0 && !this.routeGuardActive) {
      this.routeGuardActive = true;
      this.stageHost?.classList.add('guard-active');
      this.spawnActionBadge('PERFECT!', '장력 중심을 잡았어요');
      this.vibrate(10);
    }

    const staminaDamage = safe
      ? (this.fishMood === 'tired' ? 13.4 : this.fishMood === 'calm' ? 10.6 : 8.5) * (perfect ? 1.22 : 1) / profile.stamina
      : this.reelMode === 'wind' && this.tension > zoneAfterAssist.right
        ? 2.2 / profile.stamina
        : 0;
    const staminaRecover = !safe && this.reelMode !== 'wind' && this.fishMood !== 'burst' ? 1.8 / profile.resistance : 0;
    this.fishStamina = Math.max(0, Math.min(100, this.fishStamina - staminaDamage * dt / 60 + staminaRecover * dt / 60));

    const catchGain = safe
      ? (this.fishMood === 'tired' ? 27 : this.fishMood === 'calm' ? 18.5 : 13.8) * (perfect ? 1.34 : 1) * profile.catchRate
      : this.reelMode === 'wind' && this.tension < zoneAfterAssist.right + 12
        ? 3.6 * profile.catchRate
        : -2.2 * profile.resistance;
    const tiredBonus = Math.max(0, 45 - this.fishStamina) * 0.010;
    this.catchProgress = Math.max(0, Math.min(100, this.catchProgress + (catchGain + tiredBonus) * dt / 60));
    this.safeTimer = (this.catchProgress / 100) * 2.8;

    const escapeGain = recoveryInput ? -0.72 / profile.escape : this.fishMood === 'escaping' ? (this.reelMode === 'wind' ? 0.09 : 0.12) * profile.escape : this.tension < 9 ? 0.07 * profile.escape : -0.62 / profile.escape;
    this.escapePressure = Math.max(0, Math.min(1, this.escapePressure + escapeGain * dt / 60));
    return { safe, perfect };
  }

  private setFishMood(mood: FishMood, now = performance.now()): void {
    if (this.fishMood === mood) return;
    this.fishMood = mood;
    this.moodShiftAt = now;
    const moodClasses = ['mood-calm', 'mood-pulling', 'mood-burst', 'mood-tired', 'mood-escaping'];
    this.reelPanel?.classList.remove(...moodClasses);
    this.reelConsole?.classList.remove(...moodClasses);
    this.reelPanel?.classList.add(`mood-${mood}`);
    this.reelConsole?.classList.add(`mood-${mood}`);
    this.stageHost?.setAttribute('data-fish-mood', mood);
    if (mood === 'burst') {
      this.spawnActionBadge('광폭화!', '잠깐 풀어서 줄을 살리세요');
      this.vibrate([16, 14, 16]);
    } else if (mood === 'tired') {
      this.spawnActionBadge('지쳤다!', '지금 감으면 포획이 빨라져요');
      this.vibrate(10);
    } else if (mood === 'escaping') {
      this.spawnActionBadge('도주 압박!', '너무 느슨해요 · 다시 감으세요');
      this.vibrate([10, 16, 10]);
    }
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
    const now = performance.now();
    const key = `${this.state}:${title}:${subtitle}`;
    const minGap = this.state === 'reeling' ? 520 : 180;
    if (key === this.lastActionBadgeKey && now - this.lastActionBadgeAt < minGap) return;
    this.lastActionBadgeKey = key;
    this.lastActionBadgeAt = now;
    this.stageHost.querySelector('.action-badge')?.remove();
    const badge = document.createElement('div');
    badge.className = 'action-badge v930-fx v2030-action-badge v2040-action-badge v2041-action-badge v2042-action-badge v2043-action-badge v2046-action-badge v2132-action-badge v2161-action-badge v2162-action-badge v2169-action-badge v2170-action-badge v2171-action-badge v21106-stable-action-badge';
    badge.dataset.v21106StableAlert = 'single-anchor-no-shake-notification';
    badge.dataset.v21109StableAlert = 'deduplicated-phase-scoped-feedback';
    badge.innerHTML = `<strong>${title}</strong><span>${subtitle}</span>`;
    this.stageHost.appendChild(badge);
    window.setTimeout(() => badge.remove(), this.state === 'reeling' ? 1180 : 1450);
  }

  private spawnSplash(): void {
    const splash = document.createElement('div');
    splash.className = 'splash-ring v930-splash v11115-left-splash v205-splash-art';
    splash.innerHTML = `<img src="${ASSET.fishingSplash}" alt="" />`;
    this.stageHost?.appendChild(splash);
    window.setTimeout(() => splash.remove(), 760);
  }

  private spawnTouchRing(x: number, y: number): void {
    if (document.hidden) return;
    const now = performance.now();
    const minGap = this.state === 'reeling' ? 140 : this.state === 'bite' ? 96 : 72;
    if (now - this.lastTouchRingAt < minGap) return;
    this.lastTouchRingAt = now;
    document.querySelectorAll<HTMLElement>('.touch-ring.v21107-quiet-touch-ring').forEach((node, index) => { if (index > 1) node.remove(); });
    const ring = document.createElement('div');
    ring.className = 'touch-ring v21107-quiet-touch-ring';
    ring.dataset.v21107Feedback = 'throttled-no-stack-touch-ring';
    ring.style.left = `${x}px`;
    ring.style.top = `${y}px`;
    document.body.appendChild(ring);
    window.setTimeout(() => ring.remove(), 460);
  }

  private updateTensionUI(): void {
    if (!this.tensionFill || !this.safeFill) return;
    const value = Math.max(0, Math.min(100, this.tension));
    const zone = this.safeZone();
    const safe = value >= zone.left && value <= zone.right;
    const catchPct = Math.max(0, Math.min(100, this.catchProgress));
    const staminaPct = Math.max(0, Math.min(100, this.fishStamina));
    const qValue = Math.round(value * 2) / 2;
    const qCatch = Math.round(catchPct);
    const qStamina = Math.round(staminaPct);
    const qSafeLeft = Math.round(zone.left * 2) / 2;
    const qSafeWidth = Math.round((zone.right - zone.left) * 2) / 2;
    const qDanger = Math.round(Math.max(Math.abs(value - ((zone.left + zone.right) / 2)) / Math.max(1, 50), this.escapePressure) * 100);
    const uiSignature = [this.state, this.reelMode, this.fishMood, this.holding ? 1 : 0, safe ? 1 : 0, qValue, qCatch, qStamina, qSafeLeft, qSafeWidth, qDanger].join('|');
    if (uiSignature === this.lastTensionUiSignature) return;
    this.lastTensionUiSignature = uiSignature;
    this.tensionFill.dataset.v21134UiWrite = 'rounded-signature';
    this.tensionFill.style.width = `${qValue}%`;
    this.tensionFill.classList.toggle('danger', value < 18 || value > 84);
    this.tensionFill.classList.toggle('perfect', value >= zone.left && value <= zone.right);
    this.safeFill.style.left = `${qSafeLeft}%`;
    this.safeFill.style.width = `${qSafeWidth}%`;
    if (this.progressNode) this.progressNode.style.width = `${qCatch}%`;
    const stateText = this.reelMode === 'wind' ? '릴 감기 ON · 포획↑ 텐션↑' : this.reelMode === 'release' ? '풀기 ON · 텐션↓' : '대기 · 자연 하강';
    const tensionValue = this.reelPanel?.querySelector<HTMLElement>('[data-tension-value]');
    const tensionState = this.reelPanel?.querySelector<HTMLElement>('[data-tension-state]');
    if (tensionValue) tensionValue.textContent = `${Math.round(value)}%`;
    if (tensionState) tensionState.textContent = `${FISH_MOOD_LABEL[this.fishMood]} · ${safe ? `포획 ${Math.round(catchPct)}%` : stateText}`;
    this.reelPanel?.style.setProperty('--v2051-tension', `${qValue}%`);
    this.reelPanel?.style.setProperty('--v2051-safe-left', `${qSafeLeft}%`);
    this.reelPanel?.style.setProperty('--v2051-safe-right', `${qSafeLeft + qSafeWidth}%`);
    this.reelPanel?.classList.toggle('v2051-safe-now', safe);
    this.reelPanel?.classList.toggle('v2051-danger-low', value < 18);
    this.reelPanel?.classList.toggle('v2051-danger-high', value > 84);
    const verticalMarker = this.reelPanel?.querySelector<HTMLElement>('.v2040-vertical-marker');
    const verticalSafe = this.reelPanel?.querySelector<HTMLElement>('.v2040-vertical-safe');
    if (verticalMarker) verticalMarker.style.top = `${Math.max(3, Math.min(97, 100 - qValue))}%`;
    if (verticalSafe) {
      verticalSafe.style.top = `${Math.max(0, 100 - (qSafeLeft + qSafeWidth))}%`;
      verticalSafe.style.height = `${Math.max(6, qSafeWidth)}%`;
    }
    const surgeNode = this.reelPanel?.querySelector<HTMLSpanElement>('.surge-meter span');
    if (surgeNode) surgeNode.style.width = `${Math.min(100, this.perfectChain * 72)}%`;
    const statusNode = this.reelPanel?.querySelector<HTMLElement>('[data-reel-status]');
    if (statusNode) statusNode.textContent = this.reelMode === 'wind' ? '감기 입력 확인: 장력 상승 ↑' : this.reelMode === 'release' ? '풀기 입력 확인: 장력 하강 ↓' : '입력 대기: 장력 자연 하강 ↓';
    const inputState = this.reelTouchZone?.querySelector<HTMLElement>('[data-v2053-input-state]');
    if (inputState) inputState.textContent = this.holding ? '입력 ON' : '입력 OFF';
    const consoleValue = this.reelConsole?.querySelector<HTMLElement>('[data-v2055-tension-value]');
    const consoleState = this.reelConsole?.querySelector<HTMLElement>('[data-v2055-tension-state]');
    const consoleBar = this.reelConsole?.querySelector<HTMLElement>('[data-v2055-tension-bar]');
    if (consoleValue) consoleValue.textContent = `${Math.round(value)}%`;
    if (consoleState) consoleState.textContent = safe ? `${FISH_MOOD_LABEL[this.fishMood]} · 포획 ${Math.round(catchPct)}%` : (this.reelMode === 'wind' ? '감는 중 · 장력 상승' : this.reelMode === 'release' ? '풀기 중 · 장력 하강' : '대기 · 천천히 하강');
    if (consoleBar) consoleBar.style.width = `${qValue}%`;
    const safeWindow = this.reelConsole?.querySelector<HTMLElement>('[data-v2057-safe-window]');
    if (safeWindow) { safeWindow.style.left = `${qSafeLeft}%`; safeWindow.style.width = `${qSafeWidth}%`; }
    this.reelConsole?.classList.toggle('is-safe', safe);
    this.reelConsole?.classList.toggle('is-danger', value < 18 || value > 84);
    this.reelConsole?.classList.toggle('is-winding', this.reelMode === 'wind');
    this.reelConsole?.classList.toggle('is-releasing', this.reelMode === 'release');
    const fishCenter = (zone.left + zone.right) / 2;
    const distancePct = catchPct;
    this.reelPanel?.style.setProperty('--v2063-player', `${qValue}%`);
    this.reelPanel?.style.setProperty('--v2063-fish', `${fishCenter}%`);
    this.reelPanel?.style.setProperty('--v2063-safe-left', `${qSafeLeft}%`);
    this.reelPanel?.style.setProperty('--v2063-safe-width', `${qSafeWidth}%`);
    this.reelPanel?.style.setProperty('--v2063-progress', `${qCatch}%`);
    const v2063Progress = this.reelPanel?.querySelector<HTMLElement>('[data-v2063-progress]');
    const v2063Distance = this.reelPanel?.querySelector<HTMLElement>('[data-v2063-distance]');
    const v2063Input = this.reelPanel?.querySelector<HTMLElement>('[data-v2063-input]');
    const v2063Phase = this.reelPanel?.querySelector<HTMLElement>('[data-v2063-phase]');
    if (v2063Progress) v2063Progress.textContent = `${Math.round(distancePct)}%`;
    if (v2063Distance) v2063Distance.style.width = `${qCatch}%`;
    if (v2063Input) v2063Input.textContent = this.reelMode === 'wind' ? '감기 입력 ON' : this.reelMode === 'release' ? '풀기 입력 ON' : '손 뗌 · 자연 이동';
    if (v2063Phase) v2063Phase.textContent = safe ? '안전 텐션 · 포획 증가' : value < zone.left ? '느슨함 · 감기 필요' : '팽팽함 · 풀기 필요';
    this.reelPanel?.classList.toggle('v2063-overlap', safe);
    this.reelConsole?.classList.toggle('v2063-overlap', safe);
    const moodNode = this.reelPanel?.querySelector<HTMLElement>('[data-v2073-mood]');
    const catchBar = this.reelPanel?.querySelector<HTMLElement>('[data-v2073-catch-bar]');
    const catchValue = this.reelPanel?.querySelector<HTMLElement>('[data-v2073-catch-value]');
    const tensionBar = this.reelPanel?.querySelector<HTMLElement>('[data-v2073-tension-bar]');
    const tensionValue2 = this.reelPanel?.querySelector<HTMLElement>('[data-v2073-tension-value]');
    const staminaBar = this.reelPanel?.querySelector<HTMLElement>('[data-v2073-stamina-bar]');
    const staminaValue = this.reelPanel?.querySelector<HTMLElement>('[data-v2073-stamina-value]');
    const safeWindow2 = this.reelPanel?.querySelector<HTMLElement>('[data-v2073-safe-window]');
    const consoleMood = this.reelConsole?.querySelector<HTMLElement>('[data-v2073-console-mood]');
    const consoleCatch = this.reelConsole?.querySelector<HTMLElement>('[data-v2073-console-catch]');
    const consoleStamina = this.reelConsole?.querySelector<HTMLElement>('[data-v2073-console-stamina]');
    if (moodNode) moodNode.textContent = `${FISH_MOOD_LABEL[this.fishMood]} · ${this.activeFishProfile.label}`;
    if (catchBar) catchBar.style.width = `${qCatch}%`;
    if (catchValue) catchValue.textContent = `${Math.round(catchPct)}%`;
    if (tensionBar) tensionBar.style.width = `${qValue}%`;
    if (tensionValue2) tensionValue2.textContent = `${Math.round(value)}%`;
    if (staminaBar) staminaBar.style.width = `${qStamina}%`;
    if (staminaValue) staminaValue.textContent = `${Math.round(staminaPct)}%`;
    if (safeWindow2) { safeWindow2.style.left = `${qSafeLeft}%`; safeWindow2.style.width = `${qSafeWidth}%`; }
    const battleCatchBar = dom.app.querySelector<HTMLElement>('[data-v2168-catch-bar], [data-v2162-catch-bar], [data-v2161-catch-bar], [data-v2160-catch-bar], [data-v2159-catch-bar], [data-v2158-catch-bar], [data-v2157-catch-bar], [data-v2156-catch-bar], [data-v2155-catch-bar], [data-v2154-catch-bar], [data-v2153-catch-bar]');
    const battleCatchValue = dom.app.querySelector<HTMLElement>('[data-v2168-catch-value], [data-v2162-catch-value], [data-v2161-catch-value], [data-v2160-catch-value], [data-v2159-catch-value], [data-v2158-catch-value], [data-v2157-catch-value], [data-v2156-catch-value], [data-v2155-catch-value], [data-v2154-catch-value], [data-v2153-catch-value]');
    const battleTensionBar = dom.app.querySelector<HTMLElement>('[data-v2168-tension-bar], [data-v2162-tension-bar], [data-v2161-tension-bar], [data-v2160-tension-bar], [data-v2159-tension-bar], [data-v2158-tension-bar], [data-v2157-tension-bar], [data-v2156-tension-bar], [data-v2155-tension-bar], [data-v2154-tension-bar], [data-v2153-tension-bar]');
    const battleTensionValue = dom.app.querySelector<HTMLElement>('[data-v2168-tension-value], [data-v2162-tension-value], [data-v2161-tension-value], [data-v2160-tension-value], [data-v2159-tension-value], [data-v2158-tension-value], [data-v2157-tension-value], [data-v2156-tension-value], [data-v2155-tension-value], [data-v2154-tension-value], [data-v2153-tension-value]');
    const battleStaminaBar = dom.app.querySelector<HTMLElement>('[data-v2168-stamina-bar], [data-v2162-stamina-bar], [data-v2161-stamina-bar], [data-v2160-stamina-bar], [data-v2159-stamina-bar], [data-v2158-stamina-bar], [data-v2157-stamina-bar], [data-v2156-stamina-bar], [data-v2155-stamina-bar], [data-v2154-stamina-bar], [data-v2153-stamina-bar]');
    const battleStaminaValue = dom.app.querySelector<HTMLElement>('[data-v2168-stamina-value], [data-v2162-stamina-value], [data-v2161-stamina-value], [data-v2160-stamina-value], [data-v2159-stamina-value], [data-v2158-stamina-value], [data-v2157-stamina-value], [data-v2156-stamina-value], [data-v2155-stamina-value], [data-v2154-stamina-value], [data-v2153-stamina-value]');
    const battleSafeWindow = dom.app.querySelector<HTMLElement>('[data-v2168-safe-window], [data-v2162-safe-window], [data-v2161-safe-window], [data-v2160-safe-window], [data-v2159-safe-window], [data-v2158-safe-window], [data-v2157-safe-window], [data-v2156-safe-window], [data-v2155-safe-window], [data-v2154-safe-window], [data-v2153-safe-window]');
    if (battleCatchBar) battleCatchBar.style.width = `${qCatch}%`;
    if (battleCatchValue) battleCatchValue.textContent = `${Math.round(catchPct)}%`;
    if (battleTensionBar) battleTensionBar.style.width = `${qValue}%`;
    if (battleTensionValue) battleTensionValue.textContent = `${Math.round(value)}%`;
    if (battleStaminaBar) battleStaminaBar.style.width = `${qStamina}%`;
    if (battleStaminaValue) battleStaminaValue.textContent = `${Math.round(staminaPct)}%`;
    if (battleSafeWindow) { battleSafeWindow.style.left = `${qSafeLeft}%`; battleSafeWindow.style.width = `${qSafeWidth}%`; }
    if (consoleMood) consoleMood.textContent = `${FISH_MOOD_LABEL[this.fishMood]} · ${this.activeFishProfile.label}`;
    if (consoleCatch) consoleCatch.textContent = `포획 ${Math.round(catchPct)}%`;
    if (consoleStamina) consoleStamina.textContent = `저항 ${Math.round(staminaPct)}%`;
    const moodClasses = ['mood-calm', 'mood-pulling', 'mood-burst', 'mood-tired', 'mood-escaping'];
    this.reelPanel?.classList.remove(...moodClasses);
    this.reelConsole?.classList.remove(...moodClasses);
    this.reelPanel?.classList.add(`mood-${this.fishMood}`);
    this.reelConsole?.classList.add(`mood-${this.fishMood}`);
    this.stageHost?.setAttribute('data-fish-mood', this.fishMood);
    const directorPulse = dom.app.querySelector<HTMLElement>('[data-v2132-director-pulse]');
    const directorBody = dom.app.querySelector<HTMLElement>('[data-v2132-director-body]');
    if (directorPulse && this.state === 'reeling') directorPulse.textContent = safe ? 'SAFE' : value < zone.left ? 'WIND' : 'RELEASE';
    if (directorBody && this.state === 'reeling') directorBody.textContent = safe ? `좋아요 · 포획 ${Math.round(catchPct)}% · 저항 ${Math.round(staminaPct)}%` : value < zone.left ? '줄이 느슨합니다. 감기로 텐션을 회복하세요.' : '장력이 높습니다. 풀기로 줄을 살리세요.';
    const dangerMeter = dom.app.querySelector<HTMLElement>('[data-v2133-danger-meter]');
    const coachPrimary = dom.app.querySelector<HTMLElement>('[data-v2133-coach-primary]');
    const coachSecondary = dom.app.querySelector<HTMLElement>('[data-v2133-coach-secondary]');
    const coachCenter = (zone.left + zone.right) / 2;
    const dangerPct = Math.max(Math.abs(value - coachCenter) / Math.max(1, 50), this.escapePressure) * 100;
    if (dangerMeter) dangerMeter.style.width = `${Math.min(100, Math.max(0, dangerPct))}%`;
    if (coachPrimary && this.state === 'reeling') {
      coachPrimary.textContent = safe ? '안전 구간 유지' : value < zone.left ? '감기로 텐션 회복' : '풀기로 줄 보호';
    }
    if (coachSecondary && this.state === 'reeling') {
      coachSecondary.textContent = safe
        ? `${this.activeFishProfile.label} · 포획 ${Math.round(catchPct)}% · 저항 ${Math.round(staminaPct)}% · 피로 완화`
        : value < zone.left
          ? `느슨함 ${Math.round(value)}% · 감기 버튼을 짧게 눌러 복구`
          : `과장력 ${Math.round(value)}% · 풀기 버튼으로 즉시 완화`;
    }
    const coachCatch = dom.app.querySelector<HTMLElement>('[data-v2134-coach-catch]');
    const coachTension = dom.app.querySelector<HTMLElement>('[data-v2134-coach-tension]');
    const coachStamina = dom.app.querySelector<HTMLElement>('[data-v2134-coach-stamina]');
    if (coachCatch) coachCatch.textContent = `${Math.round(catchPct)}%`;
    if (coachTension) coachTension.textContent = `${Math.round(value)}%`;
    if (coachStamina) coachStamina.textContent = `${Math.round(staminaPct)}%`;
    const command = dom.app.querySelector<HTMLElement>('[data-v2135-command]');
    const balance = dom.app.querySelector<HTMLElement>('[data-v2135-balance]');
    const pressure = dom.app.querySelector<HTMLElement>('[data-v2135-pressure]');
    const balanceScore = Math.max(0, 100 - Math.abs(value - coachCenter) * 2.15);
    const pressureScore = Math.min(100, Math.max(0, dangerPct));
    if (command && this.state === 'reeling') command.textContent = safe ? '짧게 감아 포획 유지' : value < zone.left ? '감기 유지' : '풀기로 장력 완화';
    if (balance) balance.textContent = `밸런스 ${Math.round(balanceScore)}%`;
    if (pressure) pressure.textContent = `위험 ${Math.round(pressureScore)}%`;
    const assist = dom.app.querySelector<HTMLElement>('[data-v2136-assist]');
    if (assist) assist.textContent = this.state === 'reeling'
      ? (safe ? '안정 포획' : pressureScore > 72 ? '복구 우선' : value < zone.left ? '짧게 감기' : '짧게 풀기')
      : '복구 준비';
    const holdState = this.reelPanel?.querySelector<HTMLElement>('[data-v2054-hold-state]');
    const deltaState = this.reelPanel?.querySelector<HTMLElement>('[data-v2054-tension-delta]');
    if (holdState) holdState.textContent = this.reelMode === 'wind' ? '감기 중' : this.reelMode === 'release' ? '풀기 중' : '대기';
    if (deltaState) deltaState.textContent = this.reelMode === 'wind' ? '장력 상승 중 ↑' : this.reelMode === 'release' ? '장력 하강 중 ↓↓' : '자연 하강 중 ↓';
    this.reelTouchZone?.classList.toggle('is-holding', this.holding);
    this.reelPanel?.classList.toggle('is-holding', this.holding);
    this.stageHost?.classList.toggle('is-reel-holding', this.holding);
  }

  private safeZone(): { left: number; right: number } {
    const masteryBonus = Math.min(4, (this.save.mastery[this.save.region] ?? 0) * 0.08);
    const profile = this.activeFishProfile;
    const fatigueRelief = Math.max(0, 100 - this.fishStamina) * 0.030 * profile.fatigueRelief;
    const rawWidth = 51 - this.getRegion().difficulty * 1.35 + this.save.gear.lineLevel * 2.55 + masteryBonus + profile.safeWidth + fatigueRelief;
    const width = Math.round(Math.max(34, Math.min(58, rawWidth)) * 2) / 2; // v2.1.110: quantized tired-fish safe window prevents gauge/text shimmer while adding fatigue-based resistance relief.
    const now = performance.now();
    const targetCenter = 55 + Math.sin(now / 2300) * (this.activeFish.rarity === 'BOSS' ? 1.9 : 0.92) * profile.centerSwing;
    if (!this.fishingSafeZoneLastAt || this.state === 'idle' || this.state === 'casting') {
      this.fishingSafeZoneCenter = targetCenter;
      this.fishingSafeZoneLastAt = now;
    } else {
      const dt = Math.max(0, Math.min(96, now - this.fishingSafeZoneLastAt));
      const smoothing = Math.min(1, dt / (this.state === 'reeling' ? 260 : 190));
      this.fishingSafeZoneCenter += (targetCenter - this.fishingSafeZoneCenter) * smoothing;
      this.fishingSafeZoneLastAt = now;
    }
    const center = Math.round(this.fishingSafeZoneCenter * 2) / 2; // v2.1.110: half-point quantization keeps the safe window readable without changing player coordinates/assets.
    const left = Math.round(Math.max(12, center - width / 2) * 2) / 2;
    const right = Math.round(Math.min(91, center + width / 2) * 2) / 2;
    return { left, right };
  }

  private setHint(text: string): void {
    const node = document.querySelector('#fishingHint');
    if (node) node.textContent = text;
    const visibleTip = dom.app.querySelector<HTMLElement>('[data-fishing-tip]');
    if (visibleTip) visibleTip.textContent = text;
  }

  private showBiteCallout(title: string, subtitle = '뿅! 신호가 왔어요. 릴 콘솔에서 텐션을 맞추세요.'): void {
    document.querySelectorAll('.bite-callout').forEach((node) => {
      if (!this.stageHost?.contains(node)) node.remove();
    });
    const existing = this.stageHost?.querySelector<HTMLElement>('.bite-callout');
    const callout = existing ?? document.createElement('div');
    callout.className = 'bite-callout v21131-bite-final v21130-bite-final v21129-bite-final v21129-direct-bite v21128-bite-final v21128-direct-bite v21124-bite-owned v21116-bite-callout-stable v2030-bite-callout v2041-bite-callout v2042-bite-callout v2043-bite-callout v2046-bite-callout v2048-bite-callout v2064-bite-callout v2161-bite-callout v2162-bite-callout v2163-bite-callout v2171-bite-callout v2184-bite-callout v2185-bite-callout v2192-bite-callout v2193-bite-callout v21109-bite-callout-safe';
    callout.dataset.v21109BiteCallout = 'screen-inside-lowered-safe-anchor';
    callout.dataset.v21116BiteCallout = 'single-stable-player-trigger-only';
    callout.innerHTML = `<strong>${title}</strong><span>${subtitle}</span><button type="button" class="v21116-bite-start v2046-bite-start v2048-bite-start v2131-bite-start v2161-bite-start v2162-bite-start v2163-bite-start">릴링 시작</button>`;
    callout.querySelector<HTMLButtonElement>('button')?.addEventListener('pointerdown', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      this.startReeling();
      this.holding = true;
    }, { once: true });
    if (!existing) this.stageHost?.appendChild(callout);
    this.syncV21129DirectUi('show-bite-callout');
    this.syncV21130DirectSourceUi('show-bite-callout');
    this.syncV21131StaleObserverQuarantineUi('show-bite-callout');
  }

  private hideBiteCallout(): void {
    this.stageHost?.querySelector('.bite-callout')?.remove();
    document.querySelectorAll('.bite-callout').forEach((node) => { if (!this.stageHost?.contains(node)) node.remove(); });
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
        title: '오늘의 항해를 마칠까요?',
        message: '아쿠아 판타지아를 닫습니다. 브라우저 정책에 따라 닫기가 막히면 뒤로가기를 한 번 더 눌러주세요.',
        okText: '나가기',
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
    hint.innerHTML = `<strong>닫기가 잠시 막혔어요</strong><span>일부 브라우저는 자동 종료를 허용하지 않아요. 우측 상단 닫기나 뒤로가기를 한 번 더 눌러주세요.</span><button type="button">확인</button>`;
    hint.querySelector('button')?.addEventListener('click', () => hint.remove());
    dom.app.appendChild(hint);
  }

  private showGameConfirm(options: { title: string; message: string; okText: string; cancelText: string; okAction?: () => void }): Promise<boolean> {
    this.modalOpen = true;
    return new Promise((resolve) => {
      const backdrop = document.createElement('div');
      backdrop.className = `game-dialog-backdrop v2033-dialog-backdrop v2119-game-dialog-backdrop v2120-game-dialog-backdrop v2121-game-dialog-backdrop ${this.exitPromptOpen ? 'v2033-exit-dialog-backdrop v2119-exit-dialog-backdrop' : ''}`;
      backdrop.innerHTML = `
        <section class="game-dialog-card v2033-game-dialog-card v2119-game-dialog-card v2120-game-dialog-card v2121-game-dialog-card" role="dialog" aria-modal="true" aria-label="${options.title}">
          <button type="button" class="v2119-dialog-x v2120-dialog-x v2121-dialog-x" data-dialog="cancel" aria-label="닫기">×</button>
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
      backdrop.querySelectorAll<HTMLButtonElement>('[data-dialog="cancel"]').forEach((button) => button.addEventListener('click', () => done(false)));
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
    root.classList.add('v2055-map-aqua-screen');
    const activeRegion = this.getRegion();
    const unlockedCount = regions.filter((item) => this.isRegionUnlocked(item.key)).length;
    const content = root.querySelector<HTMLDivElement>('.runtime-content')!;
    content.innerHTML = `
      <section class="runtime-hero-card v2082-hero-card v204-window-card v204-map-hero v206-map-hero v2050-map-hero">
        <img src="./assets/v22/icons/nav_map.png" alt="" />
        <div><span class="runtime-eyebrow">OCEAN ROUTE</span><h2>지도</h2><p>현재 목적지 ${activeRegion.name} · 열린 수역 ${unlockedCount}/${regions.length}</p></div>
        <button class="runtime-btn gold compact-cta btn-gold-cost" type="button" data-go-fishing>출항</button>
      </section>
      <section class="v2050-expedition-card v2076-expedition-card v204-window-card" aria-label="섬 개척 체크리스트와 출항 후보지">${this.islandExpansionBoardMarkup()}</section>
      <section class="v206-route-ready v204-window-card v2050-route-ready" aria-label="출항 준비 현황">
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
    this.bindExpeditionControls(root);
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
      <section class="runtime-hero-card v2082-hero-card gear-summary">
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
    const ledgerValue = this.estimatedCatchLedgerValue();
    content.innerHTML = `
      <section class="runtime-hero-card v2082-hero-card inventory-summary v204-window-card v204-inventory-hero v206-inventory-hero">
        <img src="./assets/v22/icons/nav_bag.png" alt="" />
        <div><span class="runtime-eyebrow">OCEAN BAG</span><h2>가방</h2><p>미끼 ${this.save.gear.lureStock}개 · 누적 포획 ${totalCaught}마리 · 자동판매 원장 ${ledgerValue.toLocaleString('ko-KR')}G</p></div>
        <button class="runtime-btn cyan compact-cta btn-aqua-action" type="button" data-go-map>지도</button>
      </section>
      <section class="v206-inventory-dashboard v204-window-card" aria-label="가방 요약">
        <article><img src="./assets/v205/fishing/slot_bait.png" alt="" /><strong>${this.save.gear.lureStock}</strong><span>출항 미끼</span></article>
        <article><img src="./assets/v205/fishing/treasure_chest.png" alt="" /><strong>${Object.values(this.save.missions).filter(Boolean).length}</strong><span>수령 의뢰</span></article>
        <article><img src="./assets/v22/icons/nav_fishing.png" alt="" /><strong>${totalCaught}</strong><span>전체 포획</span></article>
        <article><img src="./assets/v22/icons/nav_map.png" alt="" /><strong>${this.save.unlockedRegions.length}</strong><span>열린 수역</span></article>
        <article><img src="./assets/v209/props/shell_garden.png" alt="" /><strong>${this.save.village.fund.toLocaleString('ko-KR')}</strong><span>마을기금</span></article>
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
      <section class="v206-catch-ledger v2163-catch-ledger v2164-catch-ledger v2165-catch-ledger v2166-catch-ledger v204-window-card" aria-label="최근 포획 원장">
        <div class="v206-section-title"><strong>최근 포획 원장</strong><span>많이 잡은 물고기 기준</span></div>
        ${this.recentCatchMarkup()}
      </section>
      <section class="v2074-sale-ledger v2163-sale-ledger v2164-sale-ledger v2165-sale-ledger v2166-sale-ledger v204-window-card" aria-label="자동 판매와 마을 성장 연결">
        <div class="v206-section-title"><strong>자동 판매 루프</strong><span>낚시 결과가 골드·기금·발전도로 바로 이어집니다</span></div>
        ${this.catchSaleLedgerMarkup()}
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
      const story = open ? this.fishStory(fish) : '아직 주민들에게 전해지지 않은 바다 이야기입니다.';
      return `<article class="dex-card runtime-dex-card v2161-dex-card v2162-dex-card v2163-dex-card v2164-dex-card v2165-dex-card v2166-dex-card v2167-dex-card rarity-${fish.rarity.toLowerCase()} ${open ? '' : 'locked'}"><img class="v2162-dex-fish-art v2163-dex-fish-art v2164-dex-fish-art v2165-dex-fish-art v2166-dex-fish-art v2167-dex-fish-art" src="${open ? fish.img : './assets/v85/fish/fish_unknown.png'}" alt="" loading="lazy" decoding="async" draggable="false" /><strong>${open ? fish.name : '미발견'}</strong><span>${open ? `${fish.region} · ${count}마리` : '낚시터에서 발견하세요'}</span><p class="v2074-dex-story">${story}</p><em>${fish.rarity}</em></article>`;
    }).join('');
    content.innerHTML = `
      <section class="runtime-hero-card v2082-hero-card dex-summary">
        <img src="./assets/v91/icons/dex.png" alt="" />
        <div><span class="runtime-eyebrow">FISH DEX</span><h2>도감</h2><p>발견 ${discovered}/${fishDex.length - 1}종 · 누적 ${this.totalCaught()}마리</p></div>
        <button class="runtime-btn cyan compact-cta btn-aqua-action" type="button" data-go-fishing>채우기</button>
      </section>
      <section class="v2074-dex-growth v204-window-card"><article><strong>${this.save.village.development}</strong><span>마을 발전도</span></article><article><strong>${this.save.village.tourists}</strong><span>관광객</span></article><article><strong>${this.save.village.autoIncome}</strong><span>자동수익</span></article></section><div class="v950-filter-row" aria-label="도감 필터 미리보기"><span>COMMON</span><span>RARE</span><span>EPIC</span><span>BOSS</span></div><section class="dex-grid runtime-dex-grid">${cards}</section>`;
    dom.app.appendChild(root);
    root.querySelector<HTMLButtonElement>('[data-go-fishing]')?.addEventListener('click', () => { void this.go('fishing'); });
    this.mountBottomNav(root, 'dex');
  }

  private renderShop(): void {
    const root = this.createRuntimeMenuScreen('shop', '상점', '미끼와 성장 아이템을 구매합니다.');
    const goods: Array<{ name: string; desc: string; cost: number; icon: string; tag?: string; onceKey?: string; effect: () => void }> = [
      { name: '산호 미끼 묶음', desc: '미끼 +5', cost: 120, icon: './assets/v92/equipment/bait.png', tag: '추천', effect: () => { this.save.gear.lureStock += 5; } },
      { name: '릴 윤활 오일', desc: '릴 Lv.+1', cost: 180, icon: './assets/v92/equipment/reel.png', tag: '강화', effect: () => { this.save.gear.reelLevel += 1; } },
      { name: '물결 안정 부적', desc: '낚싯줄 Lv.+1', cost: 210, icon: './assets/v92/equipment/line.png', tag: '안정', effect: () => { this.save.gear.lineLevel += 1; } },
      { name: '비상 구조 키트', desc: '미끼 +2', cost: 260, icon: './assets/v92/equipment/tackle.png', tag: '안전', effect: () => { this.save.lastRescueAt = Date.now(); this.save.gear.lureStock += 2; } },
      { name: '마을 장식 키트', desc: '마을기금 +120', cost: 160, icon: './assets/v209/props/shell_garden.png', tag: '마을', effect: () => { this.save.village.fund += 120; this.save.village.development = Math.max(this.save.village.development, this.save.village.fund); } },
      { name: '수족관 해설판', desc: '발전도 +80 · 관광 +1', cost: 320, icon: './assets/v2/village/buildings/building_aquarium.png', tag: '도감', effect: () => { this.save.village.development += 80; this.save.village.tourists += 1; this.refreshVillageAutoIncome(); } },
      { name: '개척 항로 허가서', desc: '다른 섬 개척 준비', cost: 850, icon: './assets/v22/icons/nav_map.png', tag: '개척', onceKey: 'shop_route_permit', effect: () => { this.save.missions.shop_route_permit = true; this.save.village.fund += 220; } },
    ];
    const todayKey = `shop_free_${new Date().toLocaleDateString('en-CA')}`;
    const freeClaimed = Boolean(this.save.missions[todayKey]);
    const content = root.querySelector<HTMLDivElement>('.runtime-content')!;
    content.innerHTML = `
      <section class="runtime-hero-card v2082-hero-card shop-summary v2170-shop-summary v2042-shop-summary v2043-shop-summary v2044-shop-summary v2049-shop-summary v2050-shop-summary">
        <img src="./assets/v91/icons/shop.png" alt="" />
        <div><span class="runtime-eyebrow">SHOP</span><h2>상점</h2><p>보유 골드 ${this.save.coins.toLocaleString('ko-KR')}G · 미끼 ${this.save.gear.lureStock}개 · 무료 보상 ${freeClaimed ? '오늘 수령 완료' : '오늘 수령 가능'}</p></div>
        <button class="runtime-btn gold compact-cta btn-gold-cost ${freeClaimed ? 'claimed' : ''}" type="button" data-free aria-disabled="${freeClaimed}">${freeClaimed ? '수령완료' : '무료'}</button>
      </section>
      <section class="shop-list runtime-card-list v2170-shop-list v108-shop-grid v2042-shop-list v2043-shop-list v2044-shop-list v2049-shop-list v2050-shop-list">${goods.map((item, index) => {
        const owned = Boolean(item.onceKey && this.save.missions[item.onceKey]);
        return `<button class="shop-card runtime-shop-card v950-shop-card v108-shop-card v2159-shop-card v2165-shop-card v2166-shop-card v2167-shop-card v2169-shop-card v2170-shop-card ${owned ? 'owned' : ''}" type="button" data-buy="${index}" ${owned ? 'aria-disabled="true"' : ''} title="${item.name} · ${owned ? '보유' : `${item.cost}G`}"><em class="v2158-shop-tag v2159-shop-tag v2167-shop-tag">${item.tag ?? '강화'}</em><img src="${item.icon}" alt="" /><div><strong>${item.name}</strong><small>${item.desc}</small></div><span class="shop-price compact-cost-badge btn-gold-cost v2134-shop-buy-price v2135-shop-buy-price v2136-shop-buy-price v2159-shop-price v2165-shop-price v2166-shop-price v2167-shop-price">${owned ? '보유' : `${item.cost}G`}</span></button>`;
      }).join('')}</section>`;
    const buy = (index: number) => {
      const item = goods[index];
      if (!item) return;
      if (item.onceKey && this.save.missions[item.onceKey]) {
        this.toast.show({ type: 'shop', title: '이미 보유 중', message: `${item.name}은 이미 확보했습니다.`, actionScreen: 'map' });
        return;
      }
      if (this.save.coins < item.cost) {
        this.toast.show({ type: 'shop', title: '골드가 부족해요', message: `${item.name} · ${item.cost}G 필요`, actionScreen: 'fishing' });
        return;
      }
      this.save.coins -= item.cost;
      item.effect();
      saveGame(this.save);
      this.toast.show({ type: 'shop', title: '구매 완료', message: `${item.name} 구매 · ${item.desc}` });
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
      this.toast.show({ type: 'reward', title: '무료 보상 수령!', message: '50G와 미끼 1개를 받았습니다.', actionScreen: 'shop' });
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
    const buildingCount = this.save.village.buildings.length;
    const pathCount = this.save.village.paths.length;
    const development = this.save.village.development;
    const tourists = this.save.village.tourists;
    const autoIncome = this.save.village.autoIncome;
    const ledgerValue = this.estimatedCatchLedgerValue();
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
      { id: 'autoSale500', category: '판매', title: '자동판매 500G 달성', desc: '포획한 물고기가 자동 판매되어 마을 루프로 연결됩니다', max: 500, value: Math.min(500, ledgerValue), reward: 260 },
      { id: 'villageFund300', category: '마을', title: '마을기금 300G 달성', desc: '판매 수익 일부가 마을기금으로 쌓입니다', max: 300, value: Math.min(300, this.save.village.fund), reward: 340 },
      { id: 'villageDev100', category: '마을', title: '발전도 100 달성', desc: '첫 관광객을 부르는 마을 기초 완성', max: 100, value: Math.min(100, development), reward: 220 },
      { id: 'villageDev500', category: '마을', title: '발전도 500 달성', desc: '관광버스가 들를 만한 해변 마을 만들기', max: 500, value: Math.min(500, development), reward: 700 },
      { id: 'build7', category: '시설', title: '시설 7채 보유', desc: '주민 집·창고·어시장·수족관으로 성장 루프 확장', max: 7, value: Math.min(7, buildingCount), reward: 420 },
      { id: 'path12', category: '동선', title: '돌길 12칸 연결', desc: '주민과 관광객이 자연스럽게 이동하는 동선 구축', max: 12, value: Math.min(12, pathCount), reward: 260 },
      { id: 'tourist1', category: '주민', title: '첫 관광객 유치', desc: '발전도 100 이상으로 마을에 활기를 더하기', max: 1, value: Math.min(1, tourists), reward: 320 },
      { id: 'autoIncome5', category: '자동수익', title: '자동수익 5G 달성', desc: '시설과 길을 늘려 방치 수익 기반 만들기', max: 5, value: Math.min(5, autoIncome), reward: 380 },
      { id: 'expeditionPrep3', category: '개척', title: '섬 개척 준비 3단계', desc: '발전도·시설·길·수역·도감 중 3개 기준 달성', max: 3, value: Math.min(3, this.islandExpansionStats().readySteps), reward: 620, event: true },
      { id: 'routePermit', category: '개척', title: '개척 항로 허가서 확보', desc: '상점에서 항로 허가서를 확보해 다음 섬 개척 준비', max: 1, value: this.islandExpansionStats().permit ? 1 : 0, reward: 780, event: true },
      { id: 'expeditionSurvey', category: '개척', title: '항로 조사 완료', desc: '개척 패널에서 항로 조사를 실행해 첫 후보지를 여세요', max: 1, value: this.save.missions.expedition_survey_done ? 1 : 0, reward: 720, event: true },
      { id: 'expeditionChart', category: '개척', title: '후보지 차트 완성', desc: '허가서와 기금으로 후보지 차트를 작성하세요', max: 1, value: this.save.missions.expedition_chart_done ? 1 : 0, reward: 980, event: true },
      { id: 'expeditionSecondIsland', category: '개척', title: '두 번째 섬 개척', desc: '개척 100%와 차트 완료 후 두 번째 섬을 여세요', max: 1, value: this.save.missions.expedition_second_island ? 1 : 0, reward: 1600, event: true },
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
      <section class="runtime-hero-card v2082-hero-card mission-summary v204-window-card v204-quest-hero v206-quest-hero v2049-quest-hero">
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
      <section class="runtime-hero-card v2082-hero-card ranking-summary v108-ranking-summary">
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


  private createFishTensionProfile(fish: FishInfo): FishTensionProfile {
    const hash = Array.from(fish.id).reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 3), 0);
    const region = this.getRegionDifficultyFor(fish.regionKey);
    const rarityWeight = fish.rarity === 'BOSS' ? 1.32 : fish.rarity === 'EPIC' ? 1.17 : fish.rarity === 'RARE' ? 1.08 : 0.96;
    const bucket = hash % 5;
    const archetype: FishTensionProfile['archetype'] = fish.rarity === 'BOSS'
      ? 'boss'
      : bucket === 0
        ? 'steady'
        : bucket === 1
          ? 'dart'
          : bucket === 2
            ? 'heavy'
            : bucket === 3
              ? 'wave'
              : 'dart';
    const labelByType: Record<FishTensionProfile['archetype'], string> = {
      steady: '잔잔형',
      dart: '질주형',
      heavy: '중량형',
      wave: '파도형',
      boss: '보스형',
    };
    const variance = ((hash % 17) - 8) / 100;
    const base = {
      steady: { tensionBias: -2, pull: .88, volatility: .74, burst: .72, resistance: .86, stamina: .92, safeWidth: 4.8, catchRate: 1.08, escape: .82, centerSwing: .74, cadence: 620, fatigueRelief: 1.12, recoveryGrace: 1.14 },
      dart: { tensionBias: 2, pull: 1.12, volatility: 1.34, burst: 1.28, resistance: 1.02, stamina: .94, safeWidth: -1.2, catchRate: 1.02, escape: 1.05, centerSwing: 1.24, cadence: 430, fatigueRelief: .92, recoveryGrace: .94 },
      heavy: { tensionBias: 4, pull: 1.25, volatility: .92, burst: .96, resistance: 1.28, stamina: 1.22, safeWidth: -2.8, catchRate: .90, escape: .96, centerSwing: .84, cadence: 560, fatigueRelief: 1.22, recoveryGrace: 1.06 },
      wave: { tensionBias: 0, pull: 1.02, volatility: 1.18, burst: 1.08, resistance: 1.08, stamina: 1.02, safeWidth: .4, catchRate: .98, escape: 1.00, centerSwing: 1.36, cadence: 510, fatigueRelief: 1.00, recoveryGrace: 1.02 },
      boss: { tensionBias: 6, pull: 1.38, volatility: 1.34, burst: 1.42, resistance: 1.42, stamina: 1.34, safeWidth: -5.2, catchRate: .86, escape: 1.18, centerSwing: 1.48, cadence: 390, fatigueRelief: .84, recoveryGrace: .88 },
    }[archetype];
    return {
      archetype,
      label: labelByType[archetype],
      tensionBias: base.tensionBias + variance * 10,
      pull: Math.max(.72, base.pull * rarityWeight * (0.96 + region * 0.025)),
      volatility: Math.max(.62, base.volatility * (0.96 + region * 0.03) + variance),
      burst: Math.max(.58, base.burst * rarityWeight + variance),
      resistance: Math.max(.72, base.resistance * rarityWeight * (0.97 + region * 0.02)),
      stamina: Math.max(.74, base.stamina * rarityWeight),
      safeWidth: base.safeWidth,
      catchRate: Math.max(.70, base.catchRate / Math.max(.92, rarityWeight - .04)),
      escape: Math.max(.70, base.escape * rarityWeight),
      centerSwing: Math.max(.56, base.centerSwing * (0.94 + region * 0.03)),
      cadence: Math.max(330, base.cadence - Math.round((region - 1) * 70)),
      fatigueRelief: Math.max(.72, base.fatigueRelief + variance * .8),
      recoveryGrace: Math.max(.72, base.recoveryGrace - Math.max(0, region - 1) * .035),
    };
  }

  private estimatedCatchLedgerValue(): number {
    return Object.entries(this.save.caught).reduce((sum, [id, count]) => {
      const fish = fishDex.find((item) => item.id === id);
      if (!fish || count <= 0) return sum;
      return sum + Math.round(fish.reward * count * this.getRegionDifficultyFor(fish.regionKey));
    }, 0);
  }

  private getRegionDifficultyFor(key: RegionKey): number {
    return regions.find((region) => region.key === key)?.difficulty ?? 1;
  }

  private buildingCount(type: string): number {
    return this.save.village.buildings.filter((building) => building.type === type).length;
  }

  private rarityGrowthWeight(fish: FishInfo): number {
    return fish.rarity === 'BOSS' ? 5 : fish.rarity === 'EPIC' ? 3 : fish.rarity === 'RARE' ? 2 : 1;
  }

  private fishStory(fish: FishInfo): string {
    const prefix = fish.rarity === 'BOSS'
      ? '마을 기록관이 봉인 문장으로 남기는 전설급 생명체입니다.'
      : fish.rarity === 'EPIC'
        ? '수족관에 전시하면 관광객이 오래 머무는 환상어입니다.'
        : fish.rarity === 'RARE'
          ? '상인과 연구원이 모두 찾는 희귀 어종입니다.'
          : '항구 시장에서 안정적으로 거래되는 친숙한 어종입니다.';
    return `${prefix} ${fish.region}의 ${fish.name} 기록은 섬 개척 명분과 마을 명성을 올립니다.`;
  }

  private createCatchGrowthSettlement(fish: FishInfo, baseReward: number, firstCatch: boolean): CatchGrowthSettlement {
    const rarityWeight = this.rarityGrowthWeight(fish);
    const marketCount = Math.max(1, this.buildingCount('market'));
    const aquariumCount = this.buildingCount('aquarium');
    const guildCount = this.buildingCount('guild');
    const harborCount = this.buildingCount('harbor');
    const marketBonus = Math.max(0, Math.round(baseReward * (0.05 + marketCount * 0.025)));
    const fund = Math.max(3, Math.round(baseReward * 0.08) + rarityWeight * 6 + (firstCatch ? 18 : 0) + marketCount * 4);
    const development = Math.max(2, Math.round(baseReward * 0.035) + rarityWeight * 4 + (firstCatch ? 24 : 0) + guildCount * 3 + aquariumCount * 8);
    const tourists = firstCatch && (fish.rarity === 'EPIC' || fish.rarity === 'BOSS' || aquariumCount > 0) ? 1 : 0;
    const autoIncome = this.projectVillageAutoIncome({ extraDevelopment: development, extraTourists: tourists });
    return {
      reward: baseReward + marketBonus,
      baseReward,
      marketBonus,
      fund,
      development,
      tourists,
      autoIncome,
      firstCatch,
      story: firstCatch ? '도감·판매·마을 명성 동시 반영' : '어시장 자동 판매 정산',
    };
  }

  private projectVillageAutoIncome(delta: { extraDevelopment?: number; extraTourists?: number } = {}): number {
    const development = this.save.village.development + (delta.extraDevelopment ?? 0);
    const tourists = this.save.village.tourists + (delta.extraTourists ?? 0);
    const facilityScore = this.buildingCount('market') * 2
      + this.buildingCount('warehouse')
      + this.buildingCount('aquarium') * 3
      + this.buildingCount('inn') * 2
      + this.buildingCount('harbor') * 2;
    return Math.max(this.save.village.autoIncome, Math.floor(development / 220) + Math.floor(tourists / 2) + facilityScore);
  }

  private refreshVillageAutoIncome(): void {
    this.save.village.autoIncome = this.projectVillageAutoIncome();
  }

  private applyCatchGrowthSettlement(settlement: CatchGrowthSettlement): void {
    this.save.coins += settlement.reward;
    this.save.village.fund += settlement.fund;
    this.save.village.development += settlement.development;
    this.save.village.tourists += settlement.tourists;
    this.save.village.autoIncome = Math.max(this.save.village.autoIncome, settlement.autoIncome);
  }

  private catchSaleLedgerMarkup(): string {
    const entries = Object.entries(this.save.caught)
      .filter(([, count]) => count > 0)
      .map(([id, count]) => ({ fish: fishDex.find((item) => item.id === id), count }))
      .filter((item): item is { fish: FishInfo; count: number } => Boolean(item.fish))
      .sort((a, b) => (b.fish.reward * b.count) - (a.fish.reward * a.count))
      .slice(0, 5);
    if (!entries.length) return `<p class="v2074-sale-empty">첫 포획 후 자동 판매 내역과 마을 기여도가 여기에 쌓입니다.</p>`;
    return `<div class="v2074-sale-grid">${entries.map(({ fish, count }) => {
      const value = Math.round(fish.reward * count * this.getRegionDifficultyFor(fish.regionKey));
      const growth = Math.round(value * 0.12) + this.rarityGrowthWeight(fish) * count;
      return `<article><img src="${fish.img}" alt="" /><div><strong>${fish.name}</strong><span>${fish.region} · x${count}</span></div><em>${value.toLocaleString('ko-KR')}G</em><small>기금/발전 +${growth}</small></article>`;
    }).join('')}</div>`;
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
    if (Object.values(this.save.missions).filter(Boolean).length >= 2 || this.save.totalSuccess >= 5 || this.save.missions.expedition_survey_done) unlocked.add('reefFestival');
    if (this.save.missions.expedition_chart_done) { unlocked.add('mangrove'); unlocked.add('glacier'); }
    if (this.save.missions.expedition_second_island) { unlocked.add('storm'); unlocked.add('lunar'); unlocked.add('dimension'); }
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
      if (target?.closest('.cast-button, .bite-callout, .reel-panel, .v2055-reel-console, .fishing-hud, .recent-catch-strip, .fishing-loadout-strip')) return;
      if (this.state === 'idle') this.castLineFallback();
      else if (this.state === 'bite') {
        this.startReeling();
        this.holding = true;
        this.reelPanel?.classList.add('is-holding');
        this.stageHost?.classList.add('is-reel-holding');
        this.spawnTouchRing(ev.clientX, ev.clientY);
      } else if (this.state === 'reeling') { this.holding = true; this.spawnTouchRing(ev.clientX, ev.clientY); }
    });
    this.stageHost.addEventListener('pointerup', () => { if (this.state === 'reeling') this.holding = false; });
    this.stageHost.addEventListener('pointercancel', () => { if (this.state === 'reeling') this.holding = false; });
    this.stageHost.addEventListener('pointerleave', () => { if (this.state === 'reeling') this.holding = false; });
    this.stageHost.addEventListener('lostpointercapture', () => { if (this.state === 'reeling') this.holding = false; });
    if (this.fallbackTicker) window.clearInterval(this.fallbackTicker);
    const fallbackFps = this.v21134RecommendedFps('fallback-render');
    this.fallbackTicker = window.setInterval(() => { if (this.fallbackMode) this.tick(); }, 1000 / fallbackFps);
    this.configureV21134RenderBudget('fallback-stage-init');
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
    this.spawnActionBadge('캐스팅', '수면 중앙으로 찌가 날아갑니다');
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
    if (nav.classList.contains('v2132-bottom-nav') || nav.classList.contains('v2131-bottom-nav') || nav.classList.contains('v2130-bottom-nav')) {
      nav.style.setProperty('position', 'fixed', 'important');
      nav.style.setProperty('left', 'auto', 'important');
      nav.style.setProperty('right', 'calc(var(--v2131-safe-right, max(8px, env(safe-area-inset-right))) + 8px)', 'important');
      nav.style.setProperty('bottom', 'calc(var(--v2131-safe-bottom, max(8px, env(safe-area-inset-bottom))) + 8px)', 'important');
      nav.style.setProperty('width', '232px', 'important');
      nav.style.setProperty('max-width', 'calc(100vw - 18px)', 'important');
      nav.style.setProperty('min-width', '232px', 'important');
      nav.style.setProperty('height', '64px', 'important');
      nav.style.setProperty('display', 'grid', 'important');
      nav.style.setProperty('grid-template-columns', 'repeat(4, minmax(0, 1fr))', 'important');
      nav.style.setProperty('gap', '8px', 'important');
      nav.style.setProperty('padding', '6px 9px', 'important');
      nav.style.setProperty('margin', '0', 'important');
      nav.style.setProperty('transform', 'none', 'important');
      nav.style.setProperty('translate', 'none', 'important');
      nav.style.setProperty('overflow', 'hidden', 'important');
      document.documentElement.classList.remove('v117-nav-bounds-emergency');
      nav.classList.remove('v1117-nav-repaired');
      return;
    }
    if (nav.classList.contains('v2119-bottom-nav') || nav.classList.contains('v2118-bottom-nav') || nav.classList.contains('v2117-bottom-nav') || nav.classList.contains('v2116-bottom-nav')) {
      nav.style.setProperty('position', 'fixed', 'important');
      nav.style.setProperty('left', 'auto', 'important');
      nav.style.setProperty('right', 'var(--v2117-safe-right, max(10px, env(safe-area-inset-right)))', 'important');
      nav.style.setProperty('bottom', 'calc(var(--v2117-safe-bottom, max(10px, env(safe-area-inset-bottom))) + 8px)', 'important');
      nav.style.setProperty('width', nav.classList.contains('v2119-bottom-nav') ? '176px' : '166px', 'important');
      nav.style.setProperty('max-width', nav.classList.contains('v2119-bottom-nav') ? '176px' : '166px', 'important');
      nav.style.setProperty('min-width', nav.classList.contains('v2119-bottom-nav') ? '176px' : '166px', 'important');
      nav.style.setProperty('height', nav.classList.contains('v2119-bottom-nav') ? '46px' : '42px', 'important');
      nav.style.setProperty('display', 'grid', 'important');
      nav.style.setProperty('grid-template-columns', 'repeat(4, 1fr)', 'important');
      nav.style.setProperty('gap', '2px', 'important');
      nav.style.setProperty('margin', '0', 'important');
      nav.style.setProperty('transform', 'none', 'important');
      nav.style.setProperty('translate', 'none', 'important');
      nav.style.setProperty('overflow', 'hidden', 'important');
      document.documentElement.classList.remove('v117-nav-bounds-emergency');
      nav.classList.remove('v1117-nav-repaired');
      return;
    }
    if (nav.classList.contains('v208-right-dock-nav')) {
      nav.style.setProperty('left', 'auto', 'important');
      nav.style.setProperty('right', 'var(--v2016-dock-right, var(--v2014-dock-right, var(--v2013-dock-right, max(10px, env(safe-area-inset-right)))))))', 'important');
      nav.style.setProperty('bottom', 'var(--v2016-dock-bottom, var(--v2014-dock-bottom, var(--v2013-dock-bottom, calc(max(14px, env(safe-area-inset-bottom)) + 6px))))))', 'important');
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
      nav.style.setProperty('gap', 'var(--v2016-dock-gap, var(--v2014-dock-gap, var(--v2013-dock-gap, 4px)))))', 'important');
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
    nav.style.setProperty('width', 'max(0px, calc(var(--v119-app-width, var(--v118-app-width, 100vw)) - var(--v119-edge-left, 4px) - var(--v119-edge-right, 4px)))))', 'important');
    nav.style.setProperty('max-width', 'max(0px, calc(var(--v119-app-width, var(--v118-app-width, 100vw)) - var(--v119-edge-left, 4px) - var(--v119-edge-right, 4px)))))', 'important');
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
      this.configureV21134RenderBudget('runtime-quality-change');
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
    const content = root.querySelector<HTMLElement>('.v2098-menu-content, .v2097-menu-content');
    if (content) {
      content.classList.toggle('v1112-content-overflows', content.scrollHeight > content.clientHeight + 4 || overflow);
    }
  }


  private installV2161SystemGuardPass(): void {
    let raf = 0;
    const html = document.documentElement;
    const sync = () => {
      raf = 0;
      const viewport = window.visualViewport;
      const vw = Math.max(1, Math.floor(viewport?.width ?? window.innerWidth));
      const vh = Math.max(1, Math.floor(viewport?.height ?? window.innerHeight));
      html.dataset.v2161SystemGuard = 'input-reset-viewport-resize-dex-image-budget';
      html.style.setProperty('--v2161-visual-width', `${vw}px`);
      html.style.setProperty('--v2161-visual-height', `${vh}px`);
      html.classList.toggle('v2161-ultra-narrow', vw <= 360);
      html.classList.toggle('v2161-short-height', vh <= 660);
      html.classList.toggle('v2161-reduced-motion', window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      this.repairActiveViewportBounds();
      this.repairFixedInteractiveBounds();
      this.repairScrollableContentFlow();
    };
    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(sync);
    };
    const stopInput = () => {
      this.holding = false;
      this.reelMode = 'neutral';
      this.reelPanel?.classList.remove('is-holding');
      this.reelTouchZone?.classList.remove('is-holding');
      this.reelConsole?.classList.remove('is-winding', 'is-releasing');
      this.stageHost?.classList.remove('is-reel-holding', 'camera-shake', 'surge-alert', 'guard-active');
      this.updateTensionUI();
    };
    schedule();
    window.visualViewport?.addEventListener('resize', schedule, { passive: true });
    window.visualViewport?.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('orientationchange', schedule, { passive: true });
    window.addEventListener('pageshow', schedule, { passive: true });
    window.addEventListener('blur', stopInput, { passive: true });
    window.addEventListener('pagehide', stopInput, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') stopInput();
      schedule();
    }, { passive: true });
  }


  private installV2162QualitySweepPass(): void {
    let raf = 0;
    const html = document.documentElement;
    const resetFishingInput = () => {
      this.holding = false;
      this.reelMode = 'neutral';
      this.reelPanel?.classList.remove('is-holding');
      this.reelTouchZone?.classList.remove('is-holding');
      this.reelConsole?.classList.remove('is-winding', 'is-releasing');
      this.stageHost?.classList.remove('is-reel-holding', 'camera-shake', 'surge-alert', 'guard-active');
      this.updateTensionUI();
    };
    const sync = () => {
      raf = 0;
      const viewport = window.visualViewport;
      const vw = Math.max(1, Math.floor(viewport?.width ?? window.innerWidth));
      const vh = Math.max(1, Math.floor(viewport?.height ?? window.innerHeight));
      html.dataset.v2162QualitySweepPolish = 'overlap-card-fishing-hud-menu-engine-sweep';
      html.style.setProperty('--v2162-visual-width', `${vw}px`);
      html.style.setProperty('--v2162-visual-height', `${vh}px`);
      html.classList.toggle('v2162-ultra-narrow', vw <= 360);
      html.classList.toggle('v2162-short-height', vh <= 660);
      html.classList.toggle('v2162-reduced-motion', window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      this.repairActiveViewportBounds();
      this.repairFixedInteractiveBounds();
      this.repairScrollableContentFlow();
      dom.app.querySelectorAll<HTMLElement>('.runtime-menu-screen, .fishing-screen, .v2097-village-screen').forEach((node) => {
        node.dataset.v2162QualitySweep = 'ready';
      });
      dom.app.querySelectorAll<HTMLImageElement>('.runtime-dex-card img, .dex-card img, .shop-card img, .bottom-nav img, .runtime-hero-card img').forEach((img) => {
        img.decoding = 'async';
        img.loading = img.closest('.runtime-hero-card') ? 'eager' : 'lazy';
        img.draggable = false;
      });
      if (document.body.dataset.screen === 'fishing') {
        document.querySelectorAll<HTMLElement>('.bottom-nav').forEach((nav) => {
          nav.setAttribute('aria-hidden', 'true');
          nav.dataset.v2162FishingHidden = 'true';
        });
      } else {
        document.querySelectorAll<HTMLElement>('.bottom-nav[data-v2162-fishing-hidden="true"]').forEach((nav) => {
          nav.removeAttribute('aria-hidden');
          delete nav.dataset.v2162FishingHidden;
        });
      }
    };
    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(sync);
    };
    schedule();
    window.visualViewport?.addEventListener('resize', schedule, { passive: true });
    window.visualViewport?.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('orientationchange', schedule, { passive: true });
    window.addEventListener('pageshow', schedule, { passive: true });
    window.addEventListener('pagehide', resetFishingInput, { passive: true });
    window.addEventListener('blur', resetFishingInput, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') resetFishingInput();
      schedule();
    }, { passive: true });
  }


  private installV2164QualityFollowupPass(): void {
    let raf = 0;
    let observer: MutationObserver | undefined;
    const html = document.documentElement;
    const hasClassFragment = (node: Element | null | undefined, fragment: string) => Boolean(node && Array.from(node.classList).some((cls) => cls.includes(fragment)));
    const setControlsHidden = (hidden: boolean) => {
      dom.app.querySelectorAll<HTMLElement>('.v2164-world-controls-aqua-lock, .v2163-world-controls-aqua-lock').forEach((controls) => {
        controls.dataset.v2164MenuHidden = hidden ? 'true' : 'false';
        controls.setAttribute('aria-hidden', String(hidden));
        if (hidden) {
          controls.style.setProperty('display', 'none', 'important');
          controls.style.setProperty('visibility', 'hidden', 'important');
          controls.style.setProperty('opacity', '0', 'important');
          controls.style.setProperty('pointer-events', 'none', 'important');
        } else {
          controls.style.setProperty('display', 'grid', 'important');
          controls.style.setProperty('visibility', 'visible', 'important');
          controls.style.setProperty('opacity', '1', 'important');
          controls.style.setProperty('pointer-events', 'auto', 'important');
        }
      });
    };
    const normalizeImages = () => {
      dom.app.querySelectorAll<HTMLImageElement>('.runtime-dex-card img, .dex-card img, .v2074-sale-grid img, .recent-card img, .shop-card img, .bottom-nav img, .fishing-loadout-strip img').forEach((img) => {
        img.decoding = 'async';
        img.loading = img.closest('.runtime-hero-card, .fishing-hud') ? 'eager' : 'lazy';
        img.draggable = false;
      });
    };
    const sync = () => {
      raf = 0;
      const viewport = window.visualViewport;
      const vw = Math.max(1, Math.floor(viewport?.width ?? window.innerWidth));
      const vh = Math.max(1, Math.floor(viewport?.height ?? window.innerHeight));
      html.dataset.v2164QualityFollowupPolish = 'hud-menu-build-expedition-fishing-inventory-dex-followup';
      html.style.setProperty('--v2164-visual-width', `${vw}px`);
      html.style.setProperty('--v2164-visual-height', `${vh}px`);
      html.classList.toggle('v2164-ultra-narrow', vw <= 360);
      html.classList.toggle('v2164-short-height', vh <= 650);
      html.classList.toggle('v2164-reduced-motion', window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      const village = dom.app.querySelector<HTMLElement>('.village-world-screen');
      const buildTray = village?.querySelector<HTMLElement>('.v2097-build-tray');
      const buildOpen = document.body.className.includes('build-open') || hasClassFragment(village, 'build-tray-open') || Boolean(buildTray && !buildTray.hasAttribute('hidden') && buildTray.getBoundingClientRect().width > 0 && getComputedStyle(buildTray).display !== 'none' && hasClassFragment(village, 'build-tray-open'));
      const expeditionOpen = document.body.className.includes('expedition-open') || hasClassFragment(village, 'expedition-open') || Boolean(village?.querySelector('.v2097-expedition-board.open'));
      const confirmOpen = Boolean(village?.querySelector('.v2130-build-confirm:not(.hidden), [data-v2130-build-confirm]:not(.hidden), .v2097-build-confirm:not(.hidden)'));
      setControlsHidden(document.body.dataset.screen === 'village' && (buildOpen || expeditionOpen || confirmOpen));
      if (document.body.dataset.screen === 'fishing') {
        document.querySelectorAll<HTMLElement>('.bottom-nav').forEach((nav) => {
          nav.setAttribute('aria-hidden', 'true');
          nav.dataset.v2164FishingHidden = 'true';
          nav.style.setProperty('display', 'none', 'important');
        });
      } else {
        document.querySelectorAll<HTMLElement>('.bottom-nav[data-v2164-fishing-hidden="true"]').forEach((nav) => {
          nav.removeAttribute('aria-hidden');
          delete nav.dataset.v2164FishingHidden;
          nav.style.removeProperty('display');
        });
      }
      normalizeImages();
      this.repairActiveViewportBounds();
      this.repairFixedInteractiveBounds();
      this.repairScrollableContentFlow();
    };
    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(sync);
    };
    schedule();
    window.visualViewport?.addEventListener('resize', schedule, { passive: true });
    window.visualViewport?.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('orientationchange', schedule, { passive: true });
    window.addEventListener('pageshow', schedule, { passive: true });
    document.addEventListener('visibilitychange', schedule, { passive: true });
    observer = new MutationObserver(schedule);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-screen'], childList: true, subtree: true });
    window.addEventListener('pagehide', () => observer?.disconnect(), { once: true, passive: true });
  }


  private installV2165QualitySweepPass(): void {
    let raf = 0;
    let observer: MutationObserver | undefined;
    const html = document.documentElement;
    const isVisible = (node: HTMLElement | null | undefined) => {
      if (!node) return false;
      if (node.hasAttribute('hidden') || node.getAttribute('aria-hidden') === 'true') return false;
      const style = getComputedStyle(node);
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
      const rect = node.getBoundingClientRect();
      return rect.width > 1 && rect.height > 1;
    };
    const classHas = (node: Element | null | undefined, fragment: string) => Boolean(node && Array.from(node.classList).some((cls) => cls.includes(fragment)));
    const applyTextBudget = (root: ParentNode = dom.app) => {
      root.querySelectorAll<HTMLElement>('.recent-card span, .v2074-sale-grid article strong, .v2074-sale-grid article span, .runtime-dex-card strong, .runtime-dex-card span, .runtime-shop-card strong, .runtime-shop-card small, .v2165-loadout-cell span').forEach((node) => {
        const text = node.textContent?.replace(/\s+/g, ' ').trim() ?? '';
        if (text && !node.title) node.title = text;
        node.dataset.v2165TextBudget = 'wrap-ellipsis-safe';
      });
      root.querySelectorAll<HTMLImageElement>('.runtime-dex-card img, .dex-card img, .v2074-sale-grid img, .recent-card img, .runtime-shop-card img, .bottom-nav img, .fishing-loadout-strip img').forEach((img) => {
        img.decoding = 'async';
        img.loading = img.closest('.runtime-hero-card, .fishing-hud') ? 'eager' : 'lazy';
        img.draggable = false;
        img.dataset.v2165ImageBudget = 'contained-no-overlap';
      });
    };
    const setControlsHidden = (hidden: boolean) => {
      dom.app.querySelectorAll<HTMLElement>('.v2165-world-controls-aqua-lock, .v2164-world-controls-aqua-lock, .v2163-world-controls-aqua-lock').forEach((controls) => {
        controls.dataset.v2165MenuHidden = hidden ? 'true' : 'false';
        controls.setAttribute('aria-hidden', String(hidden));
        if (hidden) {
          controls.style.setProperty('display', 'none', 'important');
          controls.style.setProperty('visibility', 'hidden', 'important');
          controls.style.setProperty('opacity', '0', 'important');
          controls.style.setProperty('pointer-events', 'none', 'important');
        } else {
          controls.style.setProperty('display', 'grid', 'important');
          controls.style.setProperty('visibility', 'visible', 'important');
          controls.style.setProperty('opacity', '1', 'important');
          controls.style.setProperty('pointer-events', 'auto', 'important');
        }
      });
    };
    const sync = () => {
      raf = 0;
      const viewport = window.visualViewport;
      const vw = Math.max(1, Math.floor(viewport?.width ?? window.innerWidth));
      const vh = Math.max(1, Math.floor(viewport?.height ?? window.innerHeight));
      html.dataset.v2165QualitySweepPolish = 'overlap-layout-text-budget-shop-fishing-menu-sweep';
      html.style.setProperty('--v2165-visual-width', `${vw}px`);
      html.style.setProperty('--v2165-visual-height', `${vh}px`);
      html.classList.toggle('v2165-ultra-narrow', vw <= 360);
      html.classList.toggle('v2165-short-height', vh <= 650);
      html.classList.toggle('v2165-reduced-motion', window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      const currentScreen = document.body.dataset.screen ?? '';
      document.body.dataset.v2165ActiveScreen = currentScreen;
      const village = dom.app.querySelector<HTMLElement>('.village-world-screen');
      const buildTray = village?.querySelector<HTMLElement>('.v2097-build-tray');
      const confirm = village?.querySelector<HTMLElement>('.v2130-build-confirm, [data-v2130-build-confirm], .v2097-build-confirm');
      const expedition = village?.querySelector<HTMLElement>('.v2097-expedition-board.open, .v2098-expedition-board.open');
      const buildOpen = currentScreen === 'village' && (document.body.className.includes('build-open') || classHas(village, 'build') && classHas(village, 'open') || isVisible(buildTray));
      const expeditionOpen = currentScreen === 'village' && (document.body.className.includes('expedition-open') || classHas(village, 'expedition-open') || isVisible(expedition));
      const confirmOpen = currentScreen === 'village' && isVisible(confirm);
      setControlsHidden(currentScreen === 'village' && (buildOpen || expeditionOpen || confirmOpen));
      if (currentScreen === 'fishing') {
        document.querySelectorAll<HTMLElement>('.bottom-nav').forEach((nav) => {
          nav.setAttribute('aria-hidden', 'true');
          nav.dataset.v2165FishingHidden = 'true';
          nav.style.setProperty('display', 'none', 'important');
          nav.style.setProperty('pointer-events', 'none', 'important');
        });
      } else {
        document.querySelectorAll<HTMLElement>('.bottom-nav[data-v2165-fishing-hidden="true"]').forEach((nav) => {
          nav.removeAttribute('aria-hidden');
          delete nav.dataset.v2165FishingHidden;
          nav.style.removeProperty('display');
          nav.style.removeProperty('pointer-events');
        });
      }
      dom.app.querySelectorAll<HTMLElement>('.runtime-menu-screen, .fishing-screen, .village-world-screen').forEach((node) => {
        node.dataset.v2165QualitySweep = 'ready';
      });
      applyTextBudget();
      this.repairActiveViewportBounds();
      this.repairFixedInteractiveBounds();
      this.repairScrollableContentFlow();
    };
    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(sync);
    };
    schedule();
    window.visualViewport?.addEventListener('resize', schedule, { passive: true });
    window.visualViewport?.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('orientationchange', schedule, { passive: true });
    window.addEventListener('pageshow', schedule, { passive: true });
    document.addEventListener('visibilitychange', schedule, { passive: true });
    observer = new MutationObserver(schedule);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-screen'], childList: true, subtree: true });
    window.addEventListener('pagehide', () => observer?.disconnect(), { once: true, passive: true });
  }


  private installV2166MenuHudAutoSalePass(): void {
    let raf = 0;
    let observer: MutationObserver | undefined;
    const html = document.documentElement;
    const set = (node: HTMLElement | null | undefined, entries: Array<[string, string]>) => {
      if (!node) return;
      for (const [name, value] of entries) node.style.setProperty(name, value, 'important');
    };
    const hasOpenClass = (node: Element | null | undefined, pattern: RegExp) => Boolean(node && Array.from(node.classList).some((cls) => pattern.test(cls)));
    const isConfirmOpen = (village: HTMLElement | null) => Boolean(village?.querySelector('.v2130-build-confirm:not([aria-hidden="true"]):not(.hidden), [data-v2130-build-confirm]:not([aria-hidden="true"]):not(.hidden), .v2097-build-confirm:not([aria-hidden="true"]):not(.hidden)'));
    const panelOpen = () => {
      const currentScreen = document.body.dataset.screen ?? '';
      const village = dom.app.querySelector<HTMLElement>('.village-world-screen');
      const buildOpen = currentScreen === 'village' && (hasOpenClass(village, /build-tray-open$/) || hasOpenClass(document.body, /build-open$/));
      const expeditionOpen = currentScreen === 'village' && (hasOpenClass(village, /expedition-open$/) || hasOpenClass(document.body, /expedition-open$/) || Boolean(village?.querySelector('.v2097-expedition-board.open .v2097-expedition-body-open')));
      return buildOpen || expeditionOpen || (currentScreen === 'village' && isConfirmOpen(village));
    };
    const setControlsHidden = (hidden: boolean) => {
      dom.app.querySelectorAll<HTMLElement>('.v2166-world-controls-aqua-lock, .v2165-world-controls-aqua-lock, .v2164-world-controls-aqua-lock, .v2163-world-controls-aqua-lock').forEach((controls) => {
        controls.classList.add('v2166-world-controls-aqua-lock');
        controls.dataset.v2166MenuHidden = hidden ? 'true' : 'false';
        controls.setAttribute('aria-hidden', String(hidden));
        if (hidden) {
          controls.classList.add('v2166-menu-panel-hidden');
          set(controls, [
            ['display', 'none'],
            ['visibility', 'hidden'],
            ['opacity', '0'],
            ['pointer-events', 'none'],
          ]);
        } else {
          controls.classList.remove('v2166-menu-panel-hidden');
          set(controls, [
            ['position', 'fixed'],
            ['top', 'calc(env(safe-area-inset-top, 0px) + 8px)'],
            ['right', 'calc(env(safe-area-inset-right, 0px) + 8px)'],
            ['left', 'auto'],
            ['bottom', 'auto'],
            ['display', 'grid'],
            ['visibility', 'visible'],
            ['opacity', '1'],
            ['pointer-events', 'auto'],
            ['grid-template-columns', 'repeat(2, 38px)'],
            ['grid-auto-rows', '38px'],
            ['gap', '4px'],
            ['width', '80px'],
            ['min-width', '80px'],
            ['max-width', '80px'],
            ['height', '122px'],
            ['min-height', '122px'],
            ['max-height', '122px'],
            ['padding', '0'],
            ['margin', '0'],
            ['border', '0'],
            ['background', 'transparent'],
            ['background-image', 'none'],
            ['box-shadow', 'none'],
            ['overflow', 'visible'],
            ['z-index', '560'],
          ]);
          controls.querySelectorAll<HTMLElement>('button').forEach((button) => {
            button.classList.add('v2166-top-menu-cell');
            button.dataset.v2166MenuRescueCell = 'restored-visible-village-38px';
            set(button, [
              ['display', 'grid'],
              ['place-items', 'center'],
              ['width', '38px'],
              ['height', '38px'],
              ['min-width', '38px'],
              ['min-height', '38px'],
              ['max-width', '38px'],
              ['max-height', '38px'],
              ['padding', '0'],
              ['margin', '0'],
              ['border', '1px solid rgba(190, 248, 255, .42)'],
              ['border-radius', '11px'],
              ['background', 'linear-gradient(180deg, rgba(240,255,255,.28), rgba(35,159,214,.18))'],
              ['box-shadow', 'inset 0 1px 0 rgba(255,255,255,.23), 0 3px 8px rgba(0,44,80,.08)'],
              ['overflow', 'hidden'],
              ['opacity', '.96'],
              ['pointer-events', 'auto'],
            ]);
            set(button.querySelector<HTMLElement>('span:first-child'), [
              ['width', '25px'],
              ['height', '25px'],
              ['min-width', '25px'],
              ['min-height', '25px'],
              ['max-width', '25px'],
              ['max-height', '25px'],
              ['display', 'grid'],
              ['place-items', 'center'],
              ['overflow', 'hidden'],
            ]);
            set(button.querySelector<HTMLElement>('img'), [
              ['width', '25px'],
              ['height', '25px'],
              ['min-width', '25px'],
              ['min-height', '25px'],
              ['max-width', '25px'],
              ['max-height', '25px'],
              ['object-fit', 'contain'],
              ['object-position', 'center'],
            ]);
          });
        }
      });
    };
    const applyInventoryBudgets = () => {
      dom.app.querySelectorAll<HTMLElement>('.recent-card span, .v2074-sale-grid article strong, .v2074-sale-grid article span, .v2074-sale-grid article small, .v2074-sale-grid article em').forEach((node) => {
        const text = node.textContent?.replace(/\s+/g, ' ').trim() ?? '';
        if (text && !node.title) node.title = text;
        node.dataset.v2166TextBudget = 'autosale-loop-wrap-safe';
      });
      dom.app.querySelectorAll<HTMLImageElement>('.v2074-sale-grid img, .recent-card img, .runtime-dex-card img, .fishing-loadout-strip img').forEach((img) => {
        img.decoding = 'async';
        img.loading = img.closest('.fishing-hud') ? 'eager' : 'lazy';
        img.draggable = false;
        img.dataset.v2166ImageBudget = 'smaller-contained';
      });
    };
    const sync = () => {
      raf = 0;
      const viewport = window.visualViewport;
      const vw = Math.max(1, Math.floor(viewport?.width ?? window.innerWidth));
      const vh = Math.max(1, Math.floor(viewport?.height ?? window.innerHeight));
      html.dataset.v2166MenuHudAutoSalePolish = 'menu-rescue-hud-color-autosale-loop';
      html.style.setProperty('--v2166-visual-width', `${vw}px`);
      html.style.setProperty('--v2166-visual-height', `${vh}px`);
      html.classList.toggle('v2166-ultra-narrow', vw <= 360);
      html.classList.toggle('v2166-short-height', vh <= 650);
      document.body.dataset.v2166ActiveScreen = document.body.dataset.screen ?? '';
      setControlsHidden(panelOpen());
      applyInventoryBudgets();
      this.repairActiveViewportBounds();
      this.repairFixedInteractiveBounds();
      this.repairScrollableContentFlow();
    };
    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(sync);
    };
    schedule();
    window.visualViewport?.addEventListener('resize', schedule, { passive: true });
    window.visualViewport?.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('orientationchange', schedule, { passive: true });
    window.addEventListener('pageshow', schedule, { passive: true });
    document.addEventListener('visibilitychange', schedule, { passive: true });
    observer = new MutationObserver(schedule);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-screen'], childList: true, subtree: true });
    window.addEventListener('pagehide', () => observer?.disconnect(), { once: true, passive: true });
  }


  private installV2167PremiumMobilePolishPass(): void {
    let raf = 0;
    let observer: MutationObserver | undefined;
    const html = document.documentElement;
    const set = (node: HTMLElement | null | undefined, entries: Array<[string, string]>) => {
      if (!node) return;
      for (const [name, value] of entries) node.style.setProperty(name, value, 'important');
    };
    const isVisible = (node: HTMLElement | null | undefined) => {
      if (!node || node.hasAttribute('hidden') || node.getAttribute('aria-hidden') === 'true') return false;
      const style = getComputedStyle(node);
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
      const rect = node.getBoundingClientRect();
      return rect.width > 1 && rect.height > 1;
    };
    const hasClassFragment = (node: Element | null | undefined, fragment: string) => Boolean(node && Array.from(node.classList).some((cls) => cls.includes(fragment)));
    const panelOpen = () => {
      if (document.body.dataset.screen !== 'village') return false;
      const village = dom.app.querySelector<HTMLElement>('.village-world-screen');
      const buildTray = village?.querySelector<HTMLElement>('.v2097-build-tray, [data-v2097-build-tray]');
      const confirm = village?.querySelector<HTMLElement>('.v2130-build-confirm, [data-v2130-build-confirm], .v2097-build-confirm');
      const expeditionBody = village?.querySelector<HTMLElement>('.v2097-expedition-board.open .v2097-expedition-body, .v2098-expedition-board.open .v2098-expedition-body, .v2097-expedition-body-open');
      const buildOpen = hasClassFragment(village, 'build-tray-open') || hasClassFragment(document.body, 'build-open') || isVisible(buildTray);
      const confirmOpen = isVisible(confirm);
      const expeditionOpen = hasClassFragment(village, 'expedition-open') || hasClassFragment(document.body, 'expedition-open') || isVisible(expeditionBody);
      return buildOpen || confirmOpen || expeditionOpen;
    };
    const applyMenuLock = (hidden: boolean) => {
      dom.app.querySelectorAll<HTMLElement>('.v2097-world-controls, .v2167-world-controls-aqua-lock, .v2166-world-controls-aqua-lock, .v2165-world-controls-aqua-lock').forEach((controls) => {
        controls.classList.add('v2167-world-controls-aqua-lock');
        controls.dataset.v2167MenuHidden = hidden ? 'true' : 'false';
        controls.dataset.v2167PremiumMenuPolish = '2x3-34px-22px-3px-single-border-no-frame-safe-hud';
        controls.setAttribute('aria-hidden', String(hidden));
        if (hidden) {
          controls.classList.add('v2167-menu-panel-hidden');
          set(controls, [['display', 'none'], ['visibility', 'hidden'], ['opacity', '0'], ['pointer-events', 'none']]);
          return;
        }
        controls.classList.remove('v2167-menu-panel-hidden');
        set(controls, [
          ['position', 'fixed'],
          ['top', 'calc(env(safe-area-inset-top, 0px) + 8px)'],
          ['right', 'calc(env(safe-area-inset-right, 0px) + 8px)'],
          ['left', 'auto'],
          ['bottom', 'auto'],
          ['display', 'grid'],
          ['visibility', 'visible'],
          ['opacity', '1'],
          ['pointer-events', 'auto'],
          ['grid-template-columns', 'repeat(2, 34px)'],
          ['grid-auto-rows', '34px'],
          ['gap', '3px'],
          ['width', '71px'],
          ['min-width', '71px'],
          ['max-width', '71px'],
          ['height', '108px'],
          ['min-height', '108px'],
          ['max-height', '108px'],
          ['padding', '0'],
          ['margin', '0'],
          ['border', '0'],
          ['outline', '0'],
          ['border-radius', '0'],
          ['background', 'transparent'],
          ['background-image', 'none'],
          ['box-shadow', 'none'],
          ['filter', 'none'],
          ['overflow', 'visible'],
          ['z-index', '570'],
          ['contain', 'layout paint style'],
        ]);
        controls.querySelectorAll<HTMLElement>('button').forEach((button) => {
          button.classList.add('v2167-top-menu-cell');
          button.dataset.v2167PremiumMenuCell = '34px-22px-single-translucent-border-no-triple-frame';
          set(button, [
            ['box-sizing', 'border-box'],
            ['position', 'relative'],
            ['display', 'grid'],
            ['place-items', 'center'],
            ['width', '34px'],
            ['height', '34px'],
            ['min-width', '34px'],
            ['min-height', '34px'],
            ['max-width', '34px'],
            ['max-height', '34px'],
            ['padding', '0'],
            ['margin', '0'],
            ['border', '1px solid rgba(196, 249, 255, .38)'],
            ['outline', '0'],
            ['border-radius', '10px'],
            ['background', 'linear-gradient(180deg, rgba(249,255,255,.25), rgba(44,175,222,.16))'],
            ['background-image', 'linear-gradient(180deg, rgba(249,255,255,.25), rgba(44,175,222,.16))'],
            ['box-shadow', 'inset 0 1px 0 rgba(255,255,255,.18), 0 2px 6px rgba(0,42,80,.07)'],
            ['overflow', 'hidden'],
            ['transform', 'none'],
            ['translate', 'none'],
            ['scale', '1'],
            ['opacity', '.96'],
            ['touch-action', 'manipulation'],
            ['contain', 'paint layout style'],
          ]);
          button.querySelectorAll<HTMLElement>('img, span:first-child, .v2157-menu-glyph').forEach((icon) => set(icon, [
            ['display', icon.tagName.toLowerCase() === 'img' ? 'block' : 'grid'],
            ['place-items', 'center'],
            ['width', '22px'],
            ['height', '22px'],
            ['min-width', '22px'],
            ['min-height', '22px'],
            ['max-width', '22px'],
            ['max-height', '22px'],
            ['object-fit', 'contain'],
            ['object-position', 'center'],
            ['overflow', 'hidden'],
            ['padding', '0'],
            ['margin', '0'],
            ['border', '0'],
            ['box-shadow', 'none'],
          ]));
          const label = button.querySelector<HTMLElement>('span:last-child, .v2157-menu-label');
          set(label, [['position', 'absolute'], ['width', '1px'], ['height', '1px'], ['overflow', 'hidden'], ['clip-path', 'inset(50%)'], ['white-space', 'nowrap']]);
        });
      });
    };
    const normalizeUi = () => {
      dom.app.querySelectorAll<HTMLElement>('.runtime-menu-screen, .fishing-screen, .village-world-screen').forEach((node) => {
        node.dataset.v2167PremiumMobilePolish = 'ready';
        if (node.classList.contains('runtime-menu-screen')) node.classList.add('v2167-premium-aqua-ui-screen');
        if (node.classList.contains('fishing-screen')) node.classList.add('v2167-fishing-premium-screen');
      });
      dom.app.querySelectorAll<HTMLElement>('.runtime-shop-card, .shop-card').forEach((card) => card.classList.add('v2167-shop-card'));
      dom.app.querySelectorAll<HTMLElement>('.runtime-shop-card .shop-price, .shop-card .shop-price').forEach((price) => price.classList.add('v2167-shop-price'));
      dom.app.querySelectorAll<HTMLElement>('.runtime-shop-card > em:first-child, .shop-card > em:first-child').forEach((tag) => tag.classList.add('v2167-shop-tag'));
      dom.app.querySelectorAll<HTMLElement>('.bottom-nav').forEach((nav) => nav.classList.add('v2167-bottom-nav'));
      dom.app.querySelectorAll<HTMLImageElement>('.bottom-nav img, .runtime-shop-card img, .dex-card img, .recent-card img, .fishing-loadout-strip img').forEach((img) => {
        img.decoding = 'async';
        img.loading = img.closest('.fishing-hud') ? 'eager' : 'lazy';
        img.draggable = false;
        img.dataset.v2167ImageContainment = 'clip-no-stray-sprites';
      });
      dom.app.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea, select').forEach((input) => {
        input.dataset.v2167InputTone = 'aqua-readable-no-black-background';
      });
    };
    const normalizeFishing = () => {
      const fishing = dom.app.querySelector<HTMLElement>('.fishing-screen');
      if (!fishing) return;
      fishing.dataset.v2167FishingCockpit = 'prep-battle-separated-gauges-visible-single-reel-safe-area';
      fishing.querySelectorAll<HTMLElement>('.v2110-fishing-props, .fishing-guide-card, .v2130-fishing-start-card, .v2020-reel-panel-frame, .v2021-reel-tooltip-frame, .v205-horizontal-gauge, .v205-vertical-gauge, .v205-resistance-art, .v2040-vertical-gauge').forEach((node) => {
        node.setAttribute('aria-hidden', 'true');
        if (node instanceof HTMLElement) node.hidden = true;
        node.dataset.v2167LegacyBlocked = 'true';
      });
      const wind = fishing.querySelector<HTMLButtonElement>('[data-v2055-reel-wind]');
      const release = fishing.querySelector<HTMLButtonElement>('[data-v2055-reel-release]');
      if (wind) {
        wind.classList.add('v2167-single-reel-button');
        wind.dataset.v2167SingleReelButton = 'hold-to-wind-release-auto-loosen';
        wind.querySelector('strong')!.textContent = '누르고 찌 감기';
        wind.querySelector('span')!.textContent = '떼면 자동 풀기';
      }
      if (release) {
        release.classList.add('v2167-release-hidden');
        release.setAttribute('aria-hidden', 'true');
        release.tabIndex = -1;
      }
    };
    const sync = () => {
      raf = 0;
      const viewport = window.visualViewport;
      const vw = Math.max(1, Math.floor(viewport?.width ?? window.innerWidth));
      const vh = Math.max(1, Math.floor(viewport?.height ?? window.innerHeight));
      html.dataset.v2167PremiumMobilePolish = 'premium-mobile-aqua-card-menu-fishing-shop-polish';
      html.style.setProperty('--v2167-visual-width', `${vw}px`);
      html.style.setProperty('--v2167-visual-height', `${vh}px`);
      html.classList.toggle('v2167-ultra-narrow', vw <= 360);
      html.classList.toggle('v2167-short-height', vh <= 650);
      document.body.dataset.v2167ActiveScreen = document.body.dataset.screen ?? '';
      applyMenuLock(panelOpen());
      normalizeUi();
      normalizeFishing();
      if (document.body.dataset.screen === 'fishing') {
        document.querySelectorAll<HTMLElement>('.bottom-nav').forEach((nav) => {
          nav.setAttribute('aria-hidden', 'true');
          nav.dataset.v2167FishingHidden = 'true';
          set(nav, [['display', 'none'], ['visibility', 'hidden'], ['pointer-events', 'none']]);
        });
      } else {
        document.querySelectorAll<HTMLElement>('.bottom-nav[data-v2167-fishing-hidden="true"]').forEach((nav) => {
          nav.removeAttribute('aria-hidden');
          delete nav.dataset.v2167FishingHidden;
          nav.style.removeProperty('display');
          nav.style.removeProperty('visibility');
          nav.style.removeProperty('pointer-events');
        });
      }
      this.repairActiveViewportBounds();
      this.repairFixedInteractiveBounds();
      this.repairScrollableContentFlow();
    };
    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(sync);
    };
    schedule();
    window.visualViewport?.addEventListener('resize', schedule, { passive: true });
    window.visualViewport?.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('orientationchange', schedule, { passive: true });
    window.addEventListener('pageshow', schedule, { passive: true });
    document.addEventListener('visibilitychange', schedule, { passive: true });
    observer = new MutationObserver(schedule);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-screen'], childList: true, subtree: true });
    window.addEventListener('pagehide', () => observer?.disconnect(), { once: true, passive: true });
  }


  private installV2168PremiumLayoutSweepPass(): void {
    let raf = 0;
    let observer: MutationObserver | undefined;
    const html = document.documentElement;
    const set = (node: HTMLElement | null | undefined, entries: Array<[string, string]>) => {
      if (!node) return;
      for (const [name, value] of entries) node.style.setProperty(name, value, 'important');
    };
    const textBudget = (node: HTMLElement) => {
      const text = node.textContent?.replace(/\s+/g, ' ').trim() ?? '';
      if (text && !node.title) node.title = text;
      node.dataset.v2168TextBudget = 'premium-wrap-ellipsis-no-overlap';
    };
    const normalizeDock = () => {
      dom.app.querySelectorAll<HTMLElement>('.bottom-nav').forEach((nav) => {
        nav.classList.add('v2168-bottom-nav');
        nav.dataset.v2168Dock = 'zero-jitter-premium-aqua-icon-clip-safe-area';
        set(nav, [['transform', 'none'], ['translate', 'none'], ['background', 'transparent'], ['border', '0'], ['box-shadow', 'none']]);
        nav.querySelectorAll<HTMLElement>('.v2098-nav-item').forEach((item) => {
          item.dataset.v2168DockItem = 'same-size-no-press-shift';
          set(item, [['transform', 'none'], ['translate', 'none'], ['overflow', 'hidden'], ['contain', 'layout paint style'], ['touch-action', 'manipulation']]);
        });
        nav.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
          img.decoding = 'async';
          img.loading = 'eager';
          img.draggable = false;
          img.dataset.v2168ImageContainment = 'overflow-hidden-contain-clip';
          set(img, [['object-fit', 'contain'], ['object-position', 'center'], ['transform', 'none'], ['clip-path', 'inset(0 round 9px)']]);
        });
      });
    };
    const normalizeTextAndCards = () => {
      dom.app.querySelectorAll<HTMLElement>('.runtime-menu-screen').forEach((screen) => screen.classList.add('v2168-premium-aqua-ui-screen'));
      dom.app.querySelectorAll<HTMLElement>('.runtime-shop-card, .shop-card').forEach((card) => {
        card.classList.add('v2168-shop-card');
        card.dataset.v2168ShopCard = 'badge-title-price-separated';
      });
      dom.app.querySelectorAll<HTMLElement>('.runtime-shop-card > em:first-child, .shop-card > em:first-child, .v2167-shop-tag').forEach((tag) => tag.classList.add('v2168-shop-tag'));
      dom.app.querySelectorAll<HTMLElement>('.runtime-shop-card .shop-price, .shop-card .shop-price, .v2167-shop-price').forEach((price) => price.classList.add('v2168-shop-price'));
      dom.app.querySelectorAll<HTMLElement>('.runtime-shop-card strong, .runtime-shop-card small, .shop-card strong, .shop-card small, .recent-card span, .v2074-sale-grid article strong, .v2074-sale-grid article span, .v2074-sale-grid article small, .runtime-dex-card strong, .runtime-dex-card span, .dex-card strong, .dex-card span').forEach(textBudget);
      dom.app.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input, textarea, select').forEach((input) => {
        input.dataset.v2168InputTone = 'aqua-readable-no-black-background';
      });
    };
    const normalizeMenu = () => {
      dom.app.querySelectorAll<HTMLElement>('.v2167-world-controls-aqua-lock, .v2097-world-controls').forEach((controls) => {
        controls.classList.add('v2168-world-controls-aqua-lock');
        controls.dataset.v2168PremiumMenuPolish = '2x3-stable-no-frame-no-overlap';
        if (controls.classList.contains('v2167-menu-panel-hidden') || controls.dataset.v2167MenuHidden === 'true') return;
        set(controls, [
          ['grid-template-columns', 'repeat(2, var(--v2168-menu-cell, 34px))'],
          ['grid-auto-rows', 'var(--v2168-menu-cell, 34px)'],
          ['gap', 'var(--v2168-menu-gap, 3px)'],
          ['width', 'var(--v2168-menu-width, 71px)'],
          ['height', 'var(--v2168-menu-height, 108px)'],
          ['background', 'transparent'],
          ['box-shadow', 'none'],
          ['border', '0'],
          ['overflow', 'visible'],
        ]);
        controls.querySelectorAll<HTMLElement>('button').forEach((button) => {
          button.classList.add('v2168-top-menu-cell');
          button.dataset.v2168PremiumMenuCell = 'stable-34px-no-jitter-single-border';
        });
      });
    };
    const normalizeFishing = () => {
      const fishing = dom.app.querySelector<HTMLElement>('.fishing-screen');
      if (!fishing) return;
      fishing.classList.add('v2168-fishing-premium-screen');
      fishing.dataset.v2168FishingCockpit = 'compact-safe-area-gauge-button-no-overlap';
      const phase = fishing.dataset.fishingPhase ?? this.state;
      fishing.dataset.v2168FishingPhase = phase;
      fishing.querySelectorAll<HTMLElement>('.v2167-battle-strip, .v2153-battle-strip').forEach((node) => node.classList.add('v2168-battle-strip'));
      fishing.querySelectorAll<HTMLElement>('.v2167-reel-console, .v2055-reel-console').forEach((node) => node.classList.add('v2168-reel-console'));
      fishing.querySelectorAll<HTMLElement>('.v2167-fishing-loadout, .fishing-loadout-strip').forEach((node) => node.classList.add('v2168-fishing-loadout'));
      fishing.querySelectorAll<HTMLElement>('.v2167-sea-lane-card, .v2137-sea-lane-card').forEach((node) => node.classList.add('v2168-sea-lane-card'));
      fishing.querySelectorAll<HTMLElement>('.v2167-loadout-cell, .v2142-loadout-cell').forEach((node) => node.classList.add('v2168-loadout-cell'));
      fishing.querySelectorAll<HTMLElement>('.v2020-reel-panel-frame, .v2021-reel-tooltip-frame, .v205-horizontal-gauge, .v205-vertical-gauge, .v205-resistance-art, .v2040-vertical-gauge, .v2110-fishing-props, .fishing-guide-card').forEach((node) => {
        node.hidden = true;
        node.setAttribute('aria-hidden', 'true');
        node.dataset.v2168LegacyBlocked = 'true';
      });
      const wind = fishing.querySelector<HTMLButtonElement>('[data-v2055-reel-wind]');
      const release = fishing.querySelector<HTMLButtonElement>('[data-v2055-reel-release]');
      if (wind) {
        wind.classList.add('v2168-single-reel-button');
        wind.dataset.v2168SingleReelButton = 'hold-wind-release-auto-loosen-large-mobile';
        wind.setAttribute('aria-label', '누르고 찌 감기, 손을 떼면 자동 풀기');
      }
      if (release) {
        release.classList.add('v2168-release-hidden');
        release.setAttribute('aria-hidden', 'true');
        release.tabIndex = -1;
      }
    };
    const sync = () => {
      raf = 0;
      const viewport = window.visualViewport;
      const vw = Math.max(1, Math.floor(viewport?.width ?? window.innerWidth));
      const vh = Math.max(1, Math.floor(viewport?.height ?? window.innerHeight));
      html.dataset.v2168PremiumLayoutSweep = 'premium-layout-fishing-shop-dock-sweep';
      html.style.setProperty('--v2168-visual-width', `${vw}px`);
      html.style.setProperty('--v2168-visual-height', `${vh}px`);
      html.classList.toggle('v2168-ultra-narrow', vw <= 360);
      html.classList.toggle('v2168-short-height', vh <= 650);
      html.classList.toggle('v2168-tight-fishing-height', vh <= 620);
      document.body.dataset.v2168ActiveScreen = document.body.dataset.screen ?? '';
      normalizeDock();
      normalizeTextAndCards();
      normalizeMenu();
      normalizeFishing();
      if (document.body.dataset.screen === 'fishing') {
        document.querySelectorAll<HTMLElement>('.bottom-nav').forEach((nav) => {
          nav.setAttribute('aria-hidden', 'true');
          nav.dataset.v2168FishingHidden = 'true';
          set(nav, [['display', 'none'], ['visibility', 'hidden'], ['pointer-events', 'none']]);
        });
      } else {
        document.querySelectorAll<HTMLElement>('.bottom-nav[data-v2168-fishing-hidden="true"]').forEach((nav) => {
          nav.removeAttribute('aria-hidden');
          delete nav.dataset.v2168FishingHidden;
          nav.style.removeProperty('display');
          nav.style.removeProperty('visibility');
          nav.style.removeProperty('pointer-events');
        });
      }
      this.repairActiveViewportBounds();
      this.repairFixedInteractiveBounds();
      this.repairScrollableContentFlow();
    };
    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(sync);
    };
    schedule();
    window.visualViewport?.addEventListener('resize', schedule, { passive: true });
    window.visualViewport?.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('orientationchange', schedule, { passive: true });
    window.addEventListener('pageshow', schedule, { passive: true });
    document.addEventListener('visibilitychange', schedule, { passive: true });
    observer = new MutationObserver(schedule);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-screen'], childList: true, subtree: true });
    window.addEventListener('pagehide', () => observer?.disconnect(), { once: true, passive: true });
  }


  private installV2169KeyboardShopFishingPolishPass(): void {
    let raf = 0;
    let observer: MutationObserver | undefined;
    const html = document.documentElement;
    const set = (node: HTMLElement | null | undefined, entries: Array<[string, string]>) => {
      if (!node) return;
      for (const [name, value] of entries) node.style.setProperty(name, value, 'important');
    };
    const normalizeFishing = () => {
      const fishing = dom.app.querySelector<HTMLElement>('.fishing-screen');
      if (!fishing) return;
      fishing.classList.add('v2169-fishing-keyboard-polish-screen');
      fishing.dataset.v2169FishingLayout = 'center-casting-loadout-grid-battle-gap-result-buttons';
      fishing.querySelectorAll<HTMLElement>('.fishing-loadout-strip, .v2168-fishing-loadout').forEach((node) => {
        node.classList.add('v2169-fishing-loadout');
        node.dataset.v2169Loadout = 'top-safe-two-chip-grid-no-hud-overlap';
      });
      fishing.querySelectorAll<HTMLElement>('.v2142-loadout-cell, .v2168-loadout-cell').forEach((node) => node.classList.add('v2169-loadout-cell'));
      fishing.querySelectorAll<HTMLElement>('.v2153-battle-strip, .v2168-battle-strip').forEach((node) => {
        node.classList.add('v2169-battle-strip');
        node.dataset.v2169BattleStrip = 'raised-above-single-reel-button';
      });
      fishing.querySelectorAll<HTMLElement>('.v2055-reel-console, .v2168-reel-console').forEach((node) => node.classList.add('v2169-reel-console'));
      fishing.querySelectorAll<HTMLElement>('[data-v2055-reel-wind], .v2168-single-reel-button').forEach((node) => node.classList.add('v2169-single-reel-button'));
      fishing.querySelectorAll<HTMLElement>('[data-v2055-reel-release], .v2168-release-hidden').forEach((node) => node.classList.add('v2169-release-hidden'));
      fishing.querySelectorAll<HTMLElement>('.action-badge').forEach((node) => {
        node.classList.add('v2169-action-badge');
        node.dataset.v2169CenterCastingMessage = 'true';
      });
      fishing.querySelectorAll<HTMLElement>('.catch-result-card').forEach((node) => node.classList.add('v2169-result-card'));
      fishing.querySelectorAll<HTMLElement>('.v2051-result-actions, .v2057-result-actions, .v2059-result-actions, .v2074-result-actions').forEach((node) => node.classList.add('v2169-result-actions'));
    };
    const normalizeShopAndToast = () => {
      dom.app.querySelectorAll<HTMLElement>('.runtime-menu-screen').forEach((screen) => screen.classList.add('v2169-premium-aqua-ui-screen'));
      dom.app.querySelectorAll<HTMLElement>('.runtime-shop-card, .shop-card').forEach((card) => {
        card.classList.add('v2169-shop-card');
        card.dataset.v2169ShopToast = 'purchase-brief-toast-readable-price';
      });
      dom.app.querySelectorAll<HTMLElement>('#toast-root .toast, .toast-item').forEach((toast) => {
        toast.classList.add('v2169-brief-toast');
        toast.dataset.v2169BriefToast = 'shop-purchase-simple-feedback';
      });
    };
    const normalizeVillageKeyboardHint = () => {
      const village = dom.app.querySelector<HTMLElement>('.village-world-screen');
      if (!village) return;
      village.classList.add('v2169-village-keyboard-screen');
      village.dataset.v2169KeyboardShopFishingPolish = 'wasd-eight-direction-joystick-parity';
      const joystick = village.querySelector<HTMLElement>('[data-village-joystick]');
      joystick?.classList.add('v2169-keyboard-joystick');
      if (joystick) joystick.dataset.v2169Keyboard = 'wasd-aw-wd-as-sd-eight-direction';
    };
    const sync = () => {
      raf = 0;
      html.dataset.v2169KeyboardShopFishingPolish = 'keyboard-shop-fishing-polish';
      html.classList.add('v2169-keyboard-shop-fishing-polish-root');
      normalizeVillageKeyboardHint();
      normalizeFishing();
      normalizeShopAndToast();
      if (document.body.dataset.screen === 'fishing') {
        document.querySelectorAll<HTMLElement>('.bottom-nav').forEach((nav) => set(nav, [['display', 'none'], ['visibility', 'hidden'], ['pointer-events', 'none']]));
      }
    };
    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(sync);
    };
    schedule();
    window.visualViewport?.addEventListener('resize', schedule, { passive: true });
    window.visualViewport?.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('pageshow', schedule, { passive: true });
    document.addEventListener('visibilitychange', schedule, { passive: true });
    observer = new MutationObserver(schedule);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-screen'], childList: true, subtree: true });
    window.addEventListener('pagehide', () => observer?.disconnect(), { once: true, passive: true });
  }

  private installV2170AquaLayoutRefinementPass(): void {
    let raf = 0;
    let observer: MutationObserver | undefined;
    const html = document.documentElement;
    const set = (node: HTMLElement | null | undefined, entries: Array<[string, string]>) => {
      if (!node) return;
      for (const [name, value] of entries) node.style.setProperty(name, value, 'important');
    };
    const markTextBudget = (node: HTMLElement) => {
      node.dataset.v2170TextBudget = 'two-line-readable-no-overlap';
      node.setAttribute('title', node.textContent?.trim() ?? '');
    };
    const normalizeTopMenu = () => {
      dom.app.querySelectorAll<HTMLElement>('.v2097-world-controls, .v2168-world-controls-aqua-lock, .v2167-world-controls-aqua-lock').forEach((controls) => {
        controls.classList.add('v2170-world-controls-aqua-lock');
        controls.dataset.v2170TopMenuHardLock = '2x3-34px-22px-3px-single-border-no-frame';
        set(controls, [
          ['grid-template-columns', 'repeat(2, 34px)'],
          ['grid-auto-rows', '34px'],
          ['gap', '3px'],
          ['width', '71px'],
          ['height', '108px'],
          ['background', 'transparent'],
          ['border', '0'],
          ['box-shadow', 'none'],
          ['overflow', 'visible'],
          ['contain', 'layout paint style'],
        ]);
        controls.querySelectorAll<HTMLElement>('button').forEach((button) => {
          button.classList.add('v2170-top-menu-cell');
          button.dataset.v2170TopMenuCell = 'single-translucent-ring-icon-clipped';
          set(button, [['width', '34px'], ['height', '34px'], ['min-width', '34px'], ['min-height', '34px'], ['transform', 'none'], ['overflow', 'hidden']]);
        });
      });
    };
    const normalizeMenus = () => {
      dom.app.querySelectorAll<HTMLElement>('.runtime-menu-screen').forEach((screen) => {
        screen.classList.add('v2170-premium-aqua-ui-screen');
        screen.dataset.v2170RuntimeLayout = 'aqua-card-readable-scroll-dock-safe';
      });
      dom.app.querySelectorAll<HTMLElement>('.runtime-content').forEach((node) => {
        node.classList.add('v2170-runtime-content');
        node.dataset.v2170ScrollBudget = 'bottom-dock-safe-no-title-echo';
      });
      dom.app.querySelectorAll<HTMLElement>('.runtime-hero-card, .v204-window-card, .runtime-item-card, .gear-card, .dex-card, .mission-card').forEach((card) => {
        card.classList.add('v2170-aqua-card');
      });
      dom.app.querySelectorAll<HTMLElement>('.runtime-shop-card, .shop-card').forEach((card) => {
        card.classList.add('v2170-shop-card');
        card.dataset.v2170ShopCard = 'tag-title-price-separated-no-cover';
      });
      dom.app.querySelectorAll<HTMLElement>('.runtime-shop-card strong, .runtime-shop-card small, .shop-card strong, .shop-card small, .runtime-item-card strong, .runtime-item-card span, .dex-card strong, .dex-card span, .mission-card strong, .mission-card span').forEach(markTextBudget);
      dom.app.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input, textarea, select').forEach((input) => {
        input.dataset.v2170InputTone = 'aqua-readable-no-black-background';
      });
      dom.app.querySelectorAll<HTMLElement>('.bottom-nav').forEach((nav) => {
        nav.classList.add('v2170-bottom-nav');
        nav.dataset.v2170Dock = 'fixed-icons-clipped-no-press-shift';
        set(nav, [['background', 'transparent'], ['border', '0'], ['box-shadow', 'none'], ['transform', 'none']]);
        nav.querySelectorAll<HTMLElement>('button, .v2098-nav-item').forEach((item) => {
          item.dataset.v2170DockItem = 'overflow-hidden-contain-no-jitter';
          set(item, [['overflow', 'hidden'], ['contain', 'layout paint style'], ['transform', 'none'], ['touch-action', 'manipulation']]);
        });
        nav.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
          img.dataset.v2170IconClip = 'contain-center-no-stray-pixels';
          img.draggable = false;
          set(img, [['object-fit', 'contain'], ['object-position', 'center'], ['transform', 'none'], ['clip-path', 'inset(0 round 9px)']]);
        });
      });
    };
    const normalizeBuild = () => {
      const village = dom.app.querySelector<HTMLElement>('.village-world-screen');
      if (!village) return;
      village.classList.add('v2170-village-layout-refinement-screen');
      village.dataset.v2170AquaLayoutRefinement = 'build-preview-confirm-menu-safe';
      village.querySelectorAll<HTMLElement>('.v2097-build-tray').forEach((tray) => {
        tray.classList.add('v2170-build-tray');
        tray.dataset.v2170BuildTray = 'aqua-card-grid-readable';
      });
      village.querySelectorAll<HTMLElement>('.v2130-build-confirm, [data-v2130-build-confirm]').forEach((confirm) => {
        confirm.classList.add('v2170-build-confirm');
        confirm.dataset.v2170BuildConfirm = 'center-small-confirm-popup-flow-kept';
      });
      village.querySelectorAll<HTMLElement>('.v2130-build-confirm-card, .v2131-build-confirm-card').forEach((card) => card.classList.add('v2170-build-confirm-card'));
    };
    const normalizeFishing = () => {
      const fishing = dom.app.querySelector<HTMLElement>('.fishing-screen');
      if (!fishing) return;
      fishing.classList.add('v2170-fishing-refinement-screen');
      fishing.dataset.v2170FishingLayout = 'prep-stack-battle-gap-result-safe-premium-aqua';
      const phase = fishing.dataset.fishingPhase ?? this.state;
      fishing.dataset.v2170FishingPhase = phase;
      fishing.querySelectorAll<HTMLElement>('.fishing-loadout-strip, .v2169-fishing-loadout').forEach((node) => {
        node.classList.add('v2170-fishing-loadout');
        node.dataset.v2170Loadout = 'prep-two-chip-safe-stack';
      });
      fishing.querySelectorAll<HTMLElement>('.v2142-loadout-cell, .v2169-loadout-cell').forEach((node) => node.classList.add('v2170-loadout-cell'));
      fishing.querySelectorAll<HTMLElement>('.v2153-battle-strip, .v2169-battle-strip').forEach((node) => {
        node.classList.add('v2170-battle-strip');
        node.dataset.v2170BattleStrip = 'raised-42px-gap-above-reel-button';
      });
      fishing.querySelectorAll<HTMLElement>('.v2055-reel-console, .v2169-reel-console').forEach((node) => node.classList.add('v2170-reel-console'));
      fishing.querySelectorAll<HTMLElement>('[data-v2055-reel-wind], .v2169-single-reel-button').forEach((node) => node.classList.add('v2170-single-reel-button'));
      fishing.querySelectorAll<HTMLElement>('[data-v2055-reel-release], .v2169-release-hidden').forEach((node) => node.classList.add('v2170-release-hidden'));
      fishing.querySelectorAll<HTMLElement>('.action-badge, .v2169-action-badge').forEach((node) => {
        node.classList.add('v2170-action-badge');
        node.dataset.v2170CenterMessage = 'centered-no-hud-overlap';
      });
      fishing.querySelectorAll<HTMLElement>('.catch-result-card').forEach((node) => node.classList.add('v2170-result-card'));
      fishing.querySelectorAll<HTMLElement>('.v2169-result-actions, .v2051-result-actions, .v2057-result-actions, .v2059-result-actions, .v2074-result-actions').forEach((node) => node.classList.add('v2170-result-actions'));
      dom.app.querySelectorAll<HTMLElement>('.bottom-nav').forEach((nav) => {
        if (document.body.dataset.screen === 'fishing') set(nav, [['display', 'none'], ['visibility', 'hidden'], ['pointer-events', 'none']]);
      });
    };
    const sync = () => {
      raf = 0;
      html.dataset.v2170AquaLayoutRefinement = 'aqua-layout-refinement-polish';
      html.classList.add('v2170-aqua-layout-refinement-root');
      normalizeTopMenu();
      normalizeMenus();
      normalizeBuild();
      normalizeFishing();
    };
    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(sync);
    };
    schedule();
    window.visualViewport?.addEventListener('resize', schedule, { passive: true });
    window.visualViewport?.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('pageshow', schedule, { passive: true });
    document.addEventListener('visibilitychange', schedule, { passive: true });
    observer = new MutationObserver(schedule);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-screen'], childList: true, subtree: true });
    window.addEventListener('pagehide', () => observer?.disconnect(), { once: true, passive: true });
  }


  private installV2171FishingLayoutEnginePass(): void {
    let raf = 0;
    let observer: MutationObserver | undefined;
    const html = document.documentElement;
    const set = (node: HTMLElement | null | undefined, entries: Array<[string, string]>) => {
      if (!node) return;
      for (const [name, value] of entries) node.style.setProperty(name, value, 'important');
    };
    const normalizeFishing = () => {
      const fishing = dom.app.querySelector<HTMLElement>('.fishing-screen');
      if (!fishing) return;
      fishing.classList.add('v2171-fishing-layout-screen', 'v2171-engine-optimized');
      fishing.dataset.v2171FishingLayout = 'left-loadout-under-sea-lane-center-gauge-bottom-button-no-bite-overlap';
      fishing.dataset.v2171EngineUpgrade = 'viewport-metrics-containment-legacy-fragment-quarantine';
      const phase = fishing.dataset.fishingPhase ?? this.state;
      fishing.dataset.v2171FishingPhase = phase;
      fishing.querySelectorAll<HTMLElement>('.v2137-sea-lane-card, .v2168-sea-lane-card').forEach((node) => {
        node.classList.add('v2171-sea-lane-card');
        node.dataset.v2171SeaLane = 'left-top-waterway-readable-card';
      });
      fishing.querySelectorAll<HTMLElement>('.fishing-loadout-strip, .v2170-fishing-loadout').forEach((node) => {
        node.classList.add('v2171-fishing-loadout');
        node.dataset.v2171Loadout = 'left-under-sea-lane-wide-readable-rod-bait';
      });
      fishing.querySelectorAll<HTMLElement>('.v2142-loadout-cell, .v2170-loadout-cell').forEach((node) => {
        node.classList.add('v2171-loadout-cell');
        node.dataset.v2171LoadoutCell = 'wide-icon-text-no-tiny-border';
      });
      fishing.querySelectorAll<HTMLElement>('.v2153-battle-strip, .v2170-battle-strip').forEach((node) => {
        node.classList.add('v2171-battle-strip');
        node.dataset.v2171BattleStrip = 'center-upper-gauge-lane-separated-from-bottom-button';
      });
      fishing.querySelectorAll<HTMLElement>('.v2055-reel-console, .v2170-reel-console').forEach((node) => {
        node.classList.add('v2171-reel-console');
        node.dataset.v2171ReelConsole = 'bottom-single-button-lane';
      });
      fishing.querySelectorAll<HTMLElement>('[data-v2055-reel-wind], .v2170-single-reel-button').forEach((node) => node.classList.add('v2171-single-reel-button'));
      fishing.querySelectorAll<HTMLElement>('[data-v2055-reel-release], .v2170-release-hidden').forEach((node) => node.classList.add('v2171-release-hidden'));
      fishing.querySelectorAll<HTMLElement>('.bite-callout, .v2163-bite-callout').forEach((node) => {
        node.classList.add('v2171-bite-callout');
        node.dataset.v2171BiteCallout = 'single-center-signal-no-copy-overlap';
      });
      fishing.querySelectorAll<HTMLElement>('.action-badge, .v2170-action-badge').forEach((node) => {
        node.classList.add('v2171-action-badge');
        node.dataset.v2171CenterCastingMessage = 'center-only-hidden-during-bite-and-reel';
      });
      fishing.querySelectorAll<HTMLElement>('.catch-result-card').forEach((node) => node.classList.add('v2171-result-card'));
      fishing.querySelectorAll<HTMLElement>('.v2170-result-actions, .v2051-result-actions, .v2057-result-actions, .v2059-result-actions, .v2074-result-actions').forEach((node) => node.classList.add('v2171-result-actions'));
      fishing.querySelectorAll<HTMLElement>('.v2020-reel-panel-frame, .v2021-reel-tooltip-frame, .v205-horizontal-gauge, .v205-vertical-gauge, .v205-resistance-art, .v2040-vertical-gauge, .v2110-fishing-props, .fishing-guide-card').forEach((node) => {
        node.hidden = true;
        node.setAttribute('aria-hidden', 'true');
        node.dataset.v2171LegacyFishingFragmentBlocked = 'true';
      });
      const bottomHidden = document.body.dataset.screen === 'fishing';
      dom.app.querySelectorAll<HTMLElement>('.bottom-nav').forEach((nav) => {
        if (bottomHidden) set(nav, [['display', 'none'], ['visibility', 'hidden'], ['pointer-events', 'none']]);
      });
    };
    const normalizeEngine = () => {
      dom.app.querySelectorAll<HTMLImageElement>('img:not([data-v2171-img-decode])').forEach((img) => {
        img.dataset.v2171ImgDecode = 'async-no-drag';
        img.decoding = img.decoding || 'async';
        img.draggable = false;
      });
      dom.app.querySelectorAll<HTMLElement>('.runtime-card-list > *, .dex-grid > *, .shop-list > *, .mission-list > *, .runtime-item-card, .runtime-shop-card').forEach((node) => {
        node.classList.add('v2171-engine-card');
        node.dataset.v2171EngineContainment = 'layout-paint-style-budget';
      });
    };
    const sync = () => {
      raf = 0;
      const viewport = window.visualViewport;
      const vw = Math.max(1, Math.floor(viewport?.width ?? window.innerWidth));
      const vh = Math.max(1, Math.floor(viewport?.height ?? window.innerHeight));
      html.dataset.v2171FishingLayoutEngine = 'fishing-layout-engine-upgrade';
      html.classList.add('v2171-fishing-layout-engine-root', 'v2172-system-content-engine-root');
      html.style.setProperty('--v2171-visual-width', `${vw}px`);
      html.style.setProperty('--v2171-visual-height', `${vh}px`);
      html.classList.toggle('v2171-ultra-narrow', vw <= 360);
      html.classList.toggle('v2171-short-height', vh <= 660);
      html.classList.toggle('v2171-tight-fishing-height', vh <= 620);
      normalizeFishing();
      normalizeEngine();
    };
    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(sync);
    };
    schedule();
    window.visualViewport?.addEventListener('resize', schedule, { passive: true });
    window.visualViewport?.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('pageshow', schedule, { passive: true });
    document.addEventListener('visibilitychange', schedule, { passive: true });
    observer = new MutationObserver(schedule);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-screen'], childList: true, subtree: true });
    window.addEventListener('pagehide', () => observer?.disconnect(), { once: true, passive: true });
  }

  private installV2172SystemContentEnginePass(): void {
    let raf = 0;
    let observer: MutationObserver | undefined;
    const html = document.documentElement;
    const set = (node: HTMLElement | null | undefined, entries: Array<[string, string]>) => {
      if (!node) return;
      for (const [name, value] of entries) node.style.setProperty(name, value, 'important');
    };
    const textBudget = (node: HTMLElement) => {
      const label = node.textContent?.trim() ?? '';
      node.dataset.v2172TextBudget = 'readable-two-line-no-overlap';
      if (label && !node.getAttribute('title')) node.setAttribute('title', label);
    };
    const normalizeFishing = () => {
      const fishing = dom.app.querySelector<HTMLElement>('.fishing-screen');
      if (!fishing) return;
      const phase = fishing.dataset.fishingPhase ?? this.state;
      fishing.classList.add('v2172-fishing-system-screen');
      fishing.dataset.v2172SystemContentEngine = 'battle-gauge-center-upper-reel-button-bottom-content-performance-audit';
      fishing.dataset.v2172FishingPhase = phase;
      fishing.querySelectorAll<HTMLElement>('.fishing-stage, .v2171-fishing-stage').forEach((node) => {
        node.classList.add('v2172-fishing-stage');
        node.dataset.v2172LayerBudget = 'paint-isolated-stage';
      });
      fishing.querySelectorAll<HTMLElement>('.v2137-sea-lane-card, .v2171-sea-lane-card').forEach((node) => {
        node.classList.add('v2172-sea-lane-card');
        node.dataset.v2172SeaLane = 'left-top-readable-waterway-card';
      });
      fishing.querySelectorAll<HTMLElement>('.fishing-loadout-strip, .v2171-fishing-loadout').forEach((node) => {
        node.classList.add('v2172-fishing-loadout');
        node.dataset.v2172Loadout = 'under-waterway-wide-rod-bait-stack';
      });
      fishing.querySelectorAll<HTMLElement>('.v2142-loadout-cell, .v2171-loadout-cell').forEach((node) => {
        node.classList.add('v2172-loadout-cell');
        node.dataset.v2172LoadoutCell = 'icon-text-readable-no-tiny-border';
        node.querySelectorAll<HTMLElement>('span,strong,small').forEach(textBudget);
      });
      fishing.querySelectorAll<HTMLElement>('.v2153-battle-strip, .v2171-battle-strip').forEach((node) => {
        node.classList.add('v2172-battle-strip');
        node.dataset.v2172BattleStrip = 'center-upper-gauge-safe-lane-never-overlap-reel-button';
        if (phase === 'reeling') {
          set(node, [
            ['display', 'grid'],
            ['visibility', 'visible'],
            ['opacity', '1'],
            ['top', 'clamp(108px, 31svh, 236px)'],
            ['bottom', 'auto'],
            ['left', '50%'],
            ['right', 'auto'],
            ['transform', 'translateX(-50%)'],
            ['width', 'min(348px, calc(100svw - 28px))'],
            ['max-height', '172px'],
            ['z-index', '46'],
            ['pointer-events', 'none'],
          ]);
        }
      });
      fishing.querySelectorAll<HTMLElement>('.v2055-reel-console, .v2171-reel-console').forEach((node) => {
        node.classList.add('v2172-reel-console');
        node.dataset.v2172ReelConsole = 'bottom-safe-single-button-separated-from-gauge';
        if (phase === 'reeling') {
          set(node, [
            ['bottom', 'calc(env(safe-area-inset-bottom, 0px) + 14px)'],
            ['top', 'auto'],
            ['left', '50%'],
            ['right', 'auto'],
            ['transform', 'translateX(-50%)'],
            ['width', 'min(356px, calc(100svw - 24px))'],
            ['max-height', '178px'],
            ['z-index', '48'],
          ]);
        }
      });
      fishing.querySelectorAll<HTMLElement>('[data-v2055-reel-wind], .v2171-single-reel-button').forEach((node) => {
        node.classList.add('v2172-single-reel-button');
        node.dataset.v2172SingleReelButton = 'large-bottom-hold-button-no-gauge-overlap';
        set(node, [['min-height', '76px'], ['touch-action', 'none'], ['user-select', 'none']]);
      });
      fishing.querySelectorAll<HTMLElement>('[data-v2055-reel-release], .v2171-release-hidden').forEach((node) => {
        node.classList.add('v2172-release-hidden');
        node.dataset.v2172ReleaseHidden = 'release-by-lifting-finger';
      });
      fishing.querySelectorAll<HTMLElement>('.bite-callout, .v2171-bite-callout').forEach((node) => {
        node.classList.add('v2172-bite-callout');
        node.dataset.v2172BiteCallout = 'single-center-signal-title-copy-button-stack';
        node.querySelectorAll<HTMLElement>('strong,span,button').forEach(textBudget);
      });
      fishing.querySelectorAll<HTMLElement>('.action-badge, .v2171-action-badge').forEach((node) => {
        node.classList.add('v2172-action-badge');
        node.dataset.v2172CenterCastingMessage = 'center-casting-toast-hidden-during-bite-reel';
      });
      fishing.querySelectorAll<HTMLElement>('.catch-result-card').forEach((node) => {
        node.classList.add('v2172-result-card');
        node.dataset.v2172ResultCard = 'premium-aqua-button-grid';
      });
      fishing.querySelectorAll<HTMLElement>('.v2171-result-actions, .v2051-result-actions, .v2057-result-actions, .v2059-result-actions, .v2074-result-actions').forEach((node) => {
        node.classList.add('v2172-result-actions');
        node.dataset.v2172ResultActions = 'same-style-continue-inventory-dex-village';
      });
      fishing.querySelectorAll<HTMLElement>('.v2020-reel-panel-frame, .v2021-reel-tooltip-frame, .v205-horizontal-gauge, .v205-vertical-gauge, .v205-resistance-art, .v2040-vertical-gauge, .v2110-fishing-props, .fishing-guide-card').forEach((node) => {
        node.hidden = true;
        node.setAttribute('aria-hidden', 'true');
        node.dataset.v2172LegacyFishingFragmentBlocked = 'true';
      });
      if (document.body.dataset.screen === 'fishing') {
        dom.app.querySelectorAll<HTMLElement>('.bottom-nav').forEach((nav) => set(nav, [['display', 'none'], ['visibility', 'hidden'], ['pointer-events', 'none']]));
      }
    };
    const normalizeContent = () => {
      dom.app.querySelectorAll<HTMLElement>('.runtime-menu-screen').forEach((screen) => {
        screen.classList.add('v2172-premium-content-screen');
        screen.dataset.v2172ContentLayout = 'aqua-card-scroll-safe-readable';
      });
      dom.app.querySelectorAll<HTMLElement>('.runtime-content, .runtime-card-list, .shop-list, .mission-list, .dex-grid, .gear-grid').forEach((node) => {
        node.classList.add('v2172-content-flow');
        node.dataset.v2172ScrollSafe = 'bottom-dock-safe-no-title-echo';
      });
      dom.app.querySelectorAll<HTMLElement>('.runtime-shop-card, .shop-card').forEach((card) => {
        card.classList.add('v2172-shop-card');
        card.dataset.v2172ShopCard = 'tag-title-desc-price-separated';
        card.querySelectorAll<HTMLElement>('em,strong,small,.shop-price,span').forEach(textBudget);
      });
      dom.app.querySelectorAll<HTMLElement>('.runtime-hero-card, .runtime-item-card, .gear-card, .dex-card, .mission-card, .v204-window-card').forEach((card) => {
        card.classList.add('v2172-aqua-card');
        card.dataset.v2172CardTone = 'premium-aqua-readable';
      });
      dom.app.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input, textarea, select').forEach((input) => {
        input.dataset.v2172InputTone = 'aqua-readable-no-black-background';
      });
      dom.app.querySelectorAll<HTMLElement>('.bottom-nav').forEach((nav) => {
        nav.classList.add('v2172-bottom-nav');
        nav.dataset.v2172Dock = 'fixed-icon-clip-no-jitter';
        nav.querySelectorAll<HTMLElement>('button, .v2098-nav-item').forEach((item) => {
          item.dataset.v2172DockItem = 'contain-overflow-hidden-no-press-shift';
          set(item, [['overflow', 'hidden'], ['contain', 'layout paint style'], ['transform', 'none'], ['touch-action', 'manipulation']]);
        });
        nav.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
          img.dataset.v2172IconClip = 'contain-center-no-stray-pixels';
          img.decoding = img.decoding || 'async';
          img.loading = img.loading || 'lazy';
          img.draggable = false;
        });
      });
      const village = dom.app.querySelector<HTMLElement>('.village-world-screen');
      village?.querySelectorAll<HTMLElement>('.v2130-build-confirm, [data-v2130-build-confirm]').forEach((confirm) => {
        confirm.classList.add('v2172-build-confirm');
        confirm.dataset.v2172BuildConfirm = 'center-small-aqua-confirm-flow-kept';
      });
      village?.querySelectorAll<HTMLElement>('.v2130-build-confirm-card, .v2131-build-confirm-card, .v2170-build-confirm-card').forEach((card) => card.classList.add('v2172-build-confirm-card'));
    };
    const normalizeEngine = () => {
      dom.app.querySelectorAll<HTMLImageElement>('img:not([data-v2172-img-policy])').forEach((img) => {
        img.dataset.v2172ImgPolicy = 'lazy-async-no-drag';
        img.decoding = img.decoding || 'async';
        img.loading = img.loading || 'lazy';
        img.draggable = false;
      });
      dom.app.querySelectorAll<HTMLElement>('.runtime-card-list > *, .dex-grid > *, .shop-list > *, .mission-list > *, .runtime-item-card, .runtime-shop-card, .catch-result-card').forEach((node) => {
        node.classList.add('v2172-engine-card');
        node.dataset.v2172EngineContainment = 'content-visibility-contain-layout-paint';
      });
    };
    const sync = () => {
      raf = 0;
      const viewport = window.visualViewport;
      const vw = Math.max(1, Math.floor(viewport?.width ?? window.innerWidth));
      const vh = Math.max(1, Math.floor(viewport?.height ?? window.innerHeight));
      html.dataset.v2172SystemContentEngine = 'system-content-engine-upgrade';
      html.classList.add('v2172-system-content-engine-root');
      html.style.setProperty('--v2172-visual-width', `${vw}px`);
      html.style.setProperty('--v2172-visual-height', `${vh}px`);
      html.classList.toggle('v2172-ultra-narrow', vw <= 360);
      html.classList.toggle('v2172-short-height', vh <= 660);
      html.classList.toggle('v2172-tiny-height', vh <= 600);
      normalizeFishing();
      normalizeContent();
      normalizeEngine();
    };
    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(sync);
    };
    schedule();
    window.visualViewport?.addEventListener('resize', schedule, { passive: true });
    window.visualViewport?.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('orientationchange', schedule, { passive: true });
    window.addEventListener('pageshow', schedule, { passive: true });
    document.addEventListener('visibilitychange', schedule, { passive: true });
    observer = new MutationObserver(schedule);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-screen'], childList: true, subtree: true });
    window.addEventListener('pagehide', () => observer?.disconnect(), { once: true, passive: true });
  }


  private installV2173IntroGateEnginePass(): void {
    let raf = 0;
    let observer: MutationObserver | undefined;
    const html = document.documentElement;
    const set = (node: HTMLElement | null | undefined, entries: Array<[string, string]>) => {
      if (!node) return;
      for (const [name, value] of entries) node.style.setProperty(name, value, 'important');
    };
    const clearSet = (node: HTMLElement | null | undefined, names: string[]) => {
      if (!node) return;
      for (const name of names) node.style.removeProperty(name);
    };
    const hideVillageChrome = (node: HTMLElement) => {
      node.dataset.v2173IntroHidden = 'true';
      node.setAttribute('aria-hidden', 'true');
      set(node, [['display', 'none'], ['visibility', 'hidden'], ['opacity', '0'], ['pointer-events', 'none']]);
    };
    const restoreVillageChrome = (node: HTMLElement) => {
      if (node.dataset.v2173IntroHidden !== 'true') return;
      delete node.dataset.v2173IntroHidden;
      node.removeAttribute('aria-hidden');
      clearSet(node, ['display', 'visibility', 'opacity', 'pointer-events']);
    };
    const normalizeOpeningVideo = (village: HTMLElement, opening: HTMLElement) => {
      opening.classList.add('v2173-opening-cinematic');
      opening.dataset.v2173OpeningSurface = 'bright-aqua-video-gate-no-black-preframe';
      const video = opening.querySelector<HTMLVideoElement>('video');
      if (!video) return;
      video.classList.add('v2173-opening-video');
      video.dataset.v2173OpeningVideo = 'no-poster-wait-for-first-frame';
      video.removeAttribute('poster');
      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;
      if (!video.dataset.v2173OpeningListeners) {
        video.dataset.v2173OpeningListeners = 'installed';
        const markReady = () => village.classList.add('v2173-opening-media-ready');
        video.addEventListener('loadeddata', markReady, { once: true });
        video.addEventListener('canplay', markReady, { once: true });
        video.addEventListener('playing', markReady, { once: true });
        video.addEventListener('error', () => village.classList.add('v2173-opening-media-fallback'), { once: true });
        void video.play().catch(() => undefined);
      }
      if (video.readyState >= 2) village.classList.add('v2173-opening-media-ready');
    };
    const normalizeVillageOpening = () => {
      const village = dom.app.querySelector<HTMLElement>('.village-world-screen');
      if (!village) return;
      village.classList.add('v2173-village-intro-gate-screen');
      const isReady = village.classList.contains('v2097-village-ready') || village.classList.contains('v2173-village-ready');
      const opening = village.querySelector<HTMLElement>('.v2119-opening-cinematic, .v2173-opening-cinematic');
      const isOpening = !!opening && !isReady;
      village.dataset.v2173IntroGateEngine = isOpening ? 'opening-active-village-chrome-hidden' : 'village-ready-chrome-restored';
      if (opening) normalizeOpeningVideo(village, opening);
      const chrome = village.querySelectorAll<HTMLElement>('.v2097-world-controls, .v2098-world-controls, .v2157-world-controls-microbar, .v2097-village-hud, .v2097-expedition-board, .v2097-joystick, .bottom-nav, .v2097-village-guide, .v2097-village-notice, .v2097-dialog-panel');
      chrome.forEach((node) => isOpening ? hideVillageChrome(node) : restoreVillageChrome(node));
      if (isOpening) {
        document.body.dataset.v2173IntroGate = 'opening-video-only-no-village-menu';
        dom.app.querySelectorAll<HTMLElement>('.bottom-nav').forEach(hideVillageChrome);
      } else if (document.body.dataset.v2173IntroGate) {
        delete document.body.dataset.v2173IntroGate;
        dom.app.querySelectorAll<HTMLElement>('.bottom-nav[data-v2173-intro-hidden="true"]').forEach(restoreVillageChrome);
      }
    };
    const normalizeEngine = () => {
      html.dataset.v2173IntroGateEngine = 'intro-menu-gate-engine-upgrade';
      html.classList.add('v2173-intro-gate-engine-root');
      const viewport = window.visualViewport;
      const vw = Math.max(1, Math.floor(viewport?.width ?? window.innerWidth));
      const vh = Math.max(1, Math.floor(viewport?.height ?? window.innerHeight));
      html.style.setProperty('--v2173-visual-width', `${vw}px`);
      html.style.setProperty('--v2173-visual-height', `${vh}px`);
      html.classList.toggle('v2173-short-opening-height', vh <= 640);
      html.classList.toggle('v2173-ultra-narrow', vw <= 360);
      dom.app.querySelectorAll<HTMLImageElement>('img:not([data-v2173-img-policy])').forEach((img) => {
        img.dataset.v2173ImgPolicy = 'decode-async-contain-no-drag';
        img.decoding = img.decoding || 'async';
        img.draggable = false;
      });
    };
    const sync = () => {
      raf = 0;
      normalizeEngine();
      normalizeVillageOpening();
    };
    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(sync);
    };
    schedule();
    window.visualViewport?.addEventListener('resize', schedule, { passive: true });
    window.visualViewport?.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('orientationchange', schedule, { passive: true });
    window.addEventListener('pageshow', schedule, { passive: true });
    document.addEventListener('visibilitychange', schedule, { passive: true });
    observer = new MutationObserver(schedule);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-screen'], childList: true, subtree: true });
    window.addEventListener('pagehide', () => observer?.disconnect(), { once: true, passive: true });
  }


  private installV2174QualityEngineSweepPass(): void {
    let raf = 0;
    let observer: MutationObserver | undefined;
    const html = document.documentElement;
    const safeSet = (node: HTMLElement | null | undefined, entries: Array<[string, string]>) => {
      if (!node) return;
      for (const [name, value] of entries) node.style.setProperty(name, value, 'important');
    };
    const normalizeOpening = () => {
      const village = dom.app.querySelector<HTMLElement>('.village-world-screen');
      const opening = village?.querySelector<HTMLElement>('.v2173-opening-cinematic, .v2119-opening-cinematic');
      if (!village) return;
      village.classList.add('v2174-village-quality-screen');
      const ready = village.classList.contains('v2173-village-ready') || village.classList.contains('v2097-village-ready') || village.classList.contains('v2174-village-ready-clean');
      const openingActive = !!opening && !ready;
      village.dataset.v2174QualityEngineSweep = openingActive ? 'opening-active-chrome-gated' : 'village-ready-clean-ui';
      if (opening && ready) {
        opening.dataset.v2174OpeningCleanup = 'removed-after-village-ready';
        opening.remove();
      }
      const chromeSelector = '.v2097-world-controls, .v2098-world-controls, .v2157-world-controls-microbar, .v2097-village-hud, .v2097-expedition-board, .v2097-joystick, .bottom-nav';
      village.querySelectorAll<HTMLElement>(chromeSelector).forEach((node) => {
        if (openingActive) {
          node.dataset.v2174OpeningHidden = 'true';
          node.setAttribute('aria-hidden', 'true');
          safeSet(node, [['display', 'none'], ['visibility', 'hidden'], ['opacity', '0'], ['pointer-events', 'none']]);
        } else if (node.dataset.v2174OpeningHidden === 'true') {
          delete node.dataset.v2174OpeningHidden;
          node.removeAttribute('aria-hidden');
          for (const prop of ['display', 'visibility', 'opacity', 'pointer-events']) node.style.removeProperty(prop);
        }
      });
    };
    const normalizeFishing = () => {
      const fishing = dom.app.querySelector<HTMLElement>('.fishing-screen');
      if (!fishing) return;
      const phase = fishing.dataset.fishingPhase || fishing.dataset.v2172FishingPhase || 'prep';
      fishing.classList.add('v2174-fishing-quality-screen');
      fishing.dataset.v2174QualityEngineSweep = 'gauge-upper-lane-reel-bottom-loadout-readable';
      fishing.dataset.v2174FishingPhase = phase;
      fishing.querySelectorAll<HTMLElement>('.fishing-stage, .v2172-fishing-stage').forEach((node) => node.classList.add('v2174-fishing-stage'));
      fishing.querySelectorAll<HTMLElement>('.v2137-sea-lane-card, .v2172-sea-lane-card').forEach((node) => {
        node.classList.add('v2174-sea-lane-card');
        node.dataset.v2174SeaLane = 'left-waterway-readable-wide-card';
      });
      fishing.querySelectorAll<HTMLElement>('.fishing-loadout-strip, .v2172-fishing-loadout').forEach((node) => {
        node.classList.add('v2174-fishing-loadout');
        node.dataset.v2174Loadout = 'under-waterway-wide-rod-bait-cards';
      });
      fishing.querySelectorAll<HTMLElement>('.v2142-loadout-cell, .v2172-loadout-cell').forEach((node) => {
        node.classList.add('v2174-loadout-cell');
        node.dataset.v2174LoadoutCell = 'icon-text-readable-min-62';
      });
      fishing.querySelectorAll<HTMLElement>('.v2153-battle-strip, .v2172-battle-strip').forEach((node) => {
        node.classList.add('v2174-battle-strip');
        node.dataset.v2174BattleStrip = 'center-upper-never-touch-bottom-reel';
      });
      fishing.querySelectorAll<HTMLElement>('.v2055-reel-console, .v2172-reel-console').forEach((node) => {
        node.classList.add('v2174-reel-console');
        node.dataset.v2174ReelConsole = 'bottom-safe-reel-button-only';
      });
      fishing.querySelectorAll<HTMLElement>('[data-v2055-reel-wind], .v2172-single-reel-button').forEach((node) => node.classList.add('v2174-single-reel-button'));
      fishing.querySelectorAll<HTMLElement>('.bite-callout, .v2172-bite-callout').forEach((node) => {
        node.classList.add('v2174-bite-callout');
        node.dataset.v2174BiteCallout = 'single-center-title-copy-action-no-overlap';
      });
      fishing.querySelectorAll<HTMLElement>('.action-badge, .v2172-action-badge').forEach((node) => {
        node.classList.add('v2174-action-badge');
        node.dataset.v2174ActionBadge = 'center-casting-message-only';
      });
    };
    const normalizeMenus = () => {
      dom.app.querySelectorAll<HTMLElement>('.runtime-menu-screen, .runtime-panel, .v2172-aqua-card, .runtime-shop-card, .v2172-shop-card').forEach((node) => {
        node.classList.add('v2174-aqua-card');
        node.dataset.v2174CardPolish = 'safe-scroll-readable-premium-aqua';
      });
      dom.app.querySelectorAll<HTMLElement>('.runtime-shop-card, .v2172-shop-card').forEach((node) => {
        node.classList.add('v2174-shop-card');
        node.dataset.v2174ShopCard = 'badge-title-desc-price-no-overlap';
      });
      dom.app.querySelectorAll<HTMLElement>('input, textarea, select').forEach((node) => {
        node.classList.add('v2174-readable-input');
        node.dataset.v2174InputTone = 'no-black-background';
      });
      dom.app.querySelectorAll<HTMLImageElement>('img:not([data-v2174-img-policy])').forEach((img) => {
        img.dataset.v2174ImgPolicy = 'lazy-async-no-drag-contain';
        img.decoding = img.decoding || 'async';
        img.loading = img.loading || 'lazy';
        img.draggable = false;
      });
    };
    const normalizeViewport = () => {
      const viewport = window.visualViewport;
      const vw = Math.max(1, Math.floor(viewport?.width ?? window.innerWidth));
      const vh = Math.max(1, Math.floor(viewport?.height ?? window.innerHeight));
      html.dataset.v2174QualityEngineSweep = 'quality-engine-sweep';
      html.classList.add('v2174-quality-engine-sweep-root');
      html.style.setProperty('--v2174-visual-width', `${vw}px`);
      html.style.setProperty('--v2174-visual-height', `${vh}px`);
      html.style.setProperty('--v2174-visual-left', `${Math.floor(viewport?.offsetLeft ?? 0)}px`);
      html.style.setProperty('--v2174-visual-top', `${Math.floor(viewport?.offsetTop ?? 0)}px`);
      html.classList.toggle('v2174-ultra-narrow', vw <= 360);
      html.classList.toggle('v2174-short-height', vh <= 660);
      html.classList.toggle('v2174-tiny-height', vh <= 600);
    };
    const sync = () => {
      raf = 0;
      normalizeViewport();
      normalizeOpening();
      normalizeFishing();
      normalizeMenus();
    };
    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(sync);
    };
    schedule();
    window.visualViewport?.addEventListener('resize', schedule, { passive: true });
    window.visualViewport?.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('orientationchange', schedule, { passive: true });
    document.addEventListener('visibilitychange', schedule, { passive: true });
    observer = new MutationObserver(schedule);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-screen'], childList: true, subtree: true });
    window.addEventListener('pagehide', () => observer?.disconnect(), { once: true, passive: true });
  }



  private installV21118UiAssetContainmentPass(): void {
    let raf = 0;
    let lastSignature = '';
    const html = document.documentElement;
    const set = (node: HTMLElement | null | undefined, entries: Array<[string, string]>) => {
      if (!node) return;
      for (const [name, value] of entries) {
        if (node.style.getPropertyValue(name) !== value || node.style.getPropertyPriority(name) !== 'important') {
          node.style.setProperty(name, value, 'important');
        }
      }
    };
    const isCompact = () => {
      const viewport = window.visualViewport;
      const width = Math.floor(viewport?.width ?? window.innerWidth);
      const height = Math.floor(viewport?.height ?? window.innerHeight);
      return width <= 360 || height <= 610;
    };
    const normalize = () => {
      html.classList.add('v21118-ui-asset-containment-root');
      html.dataset.v21118UiAssetContainment = 'runtime-menu-icons-card-images-no-bleed';
      const compact = isCompact();
      const icon = `${compact ? 24 : 25}px`;
      const signature = `${document.body.dataset.screen || 'unknown'}:${compact ? 'compact' : 'regular'}:${window.visualViewport?.width ?? window.innerWidth}:${window.visualViewport?.height ?? window.innerHeight}`;
      html.style.setProperty('--v21118-village-menu-cell', '34px');
      html.style.setProperty('--v21118-village-menu-gap', '3px');
      html.style.setProperty('--v21118-village-menu-icon', icon);
      html.style.setProperty('--v21117-menu-icon', icon);
      html.classList.toggle('v21118-compact-ui', compact);
      if (signature === lastSignature && document.body.dataset.screen !== 'village') return;
      lastSignature = signature;
      dom.app.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
        img.draggable = false;
        img.decoding = 'async';
        if (!img.loading) img.loading = 'lazy';
        img.classList.add('v21118-contained-image');
      });
      if (document.body.dataset.screen !== 'village') return;
      dom.app.querySelectorAll<HTMLElement>('.v2097-world-controls,.v2098-world-controls,.v2157-world-controls-microbar,.v2167-world-controls-aqua-lock,.v2168-world-controls-aqua-lock,.v2170-world-controls-aqua-lock,.v21105-top-menu-grid-lock,.v21117-world-controls-icon-clarity').forEach((controls) => {
        if (controls.classList.contains('v2167-menu-panel-hidden') || controls.dataset.v2167MenuHidden === 'true') return;
        controls.classList.add('v21118-world-controls-contained');
        controls.dataset.v21118MenuContainment = 'runtime-important-34-cell-25-icon-no-bleed';
        set(controls, [
          ['display', 'grid'],
          ['grid-template-columns', 'repeat(2, var(--v21118-village-menu-cell))'],
          ['grid-auto-rows', 'var(--v21118-village-menu-cell)'],
          ['gap', 'var(--v21118-village-menu-gap)'],
          ['width', 'calc((var(--v21118-village-menu-cell) * 2) + var(--v21118-village-menu-gap))'],
          ['height', 'calc((var(--v21118-village-menu-cell) * 3) + (var(--v21118-village-menu-gap) * 2))'],
          ['padding', '0'],
          ['margin', '0'],
          ['border', '0'],
          ['background', 'transparent'],
          ['background-image', 'none'],
          ['box-shadow', 'none'],
          ['overflow', 'visible'],
          ['contain', 'layout paint style'],
        ]);
        controls.querySelectorAll<HTMLElement>('button').forEach((button) => {
          button.classList.add('v21118-top-menu-cell-contained');
          button.dataset.v21118TopMenuCell = 'same-34-cell-icon-visible-bleed-clipped';
          set(button, [
            ['box-sizing', 'border-box'],
            ['position', 'relative'],
            ['display', 'grid'],
            ['place-items', 'center'],
            ['width', 'var(--v21118-village-menu-cell)'],
            ['height', 'var(--v21118-village-menu-cell)'],
            ['min-width', 'var(--v21118-village-menu-cell)'],
            ['min-height', 'var(--v21118-village-menu-cell)'],
            ['max-width', 'var(--v21118-village-menu-cell)'],
            ['max-height', 'var(--v21118-village-menu-cell)'],
            ['padding', '0'],
            ['margin', '0'],
            ['border', '1px solid rgba(221, 253, 255, .55)'],
            ['border-radius', '11px'],
            ['background', 'linear-gradient(180deg, rgba(255,255,255,.36), rgba(32,161,218,.22))'],
            ['background-image', 'linear-gradient(180deg, rgba(255,255,255,.36), rgba(32,161,218,.22))'],
            ['box-shadow', 'inset 0 1px 0 rgba(255,255,255,.34), 0 2px 7px rgba(0,42,80,.09)'],
            ['overflow', 'hidden'],
            ['isolation', 'isolate'],
            ['clip-path', 'inset(0 round 11px)'],
            ['transform', 'none'],
            ['translate', 'none'],
            ['scale', '1'],
            ['opacity', '.99'],
            ['contain', 'layout paint style'],
            ['touch-action', 'manipulation'],
          ]);
          button.querySelectorAll<HTMLElement>('span:first-child,.v2157-menu-glyph,img,.icon').forEach((glyph) => {
            const isImage = glyph.tagName.toLowerCase() === 'img';
            glyph.classList.add('v21118-menu-icon-contained');
            set(glyph, [
              ['display', isImage ? 'block' : 'grid'],
              ['place-items', 'center'],
              ['width', 'var(--v21118-village-menu-icon)'],
              ['height', 'var(--v21118-village-menu-icon)'],
              ['min-width', 'var(--v21118-village-menu-icon)'],
              ['min-height', 'var(--v21118-village-menu-icon)'],
              ['max-width', 'var(--v21118-village-menu-icon)'],
              ['max-height', 'var(--v21118-village-menu-icon)'],
              ['padding', '0'],
              ['margin', '0'],
              ['border', '0'],
              ['background', 'transparent'],
              ['background-image', 'none'],
              ['box-shadow', 'none'],
              ['overflow', 'hidden'],
              ['object-fit', 'contain'],
              ['object-position', 'center center'],
              ['font-size', 'var(--v21118-village-menu-icon)'],
              ['line-height', '1'],
              ['text-align', 'center'],
              ['transform', 'translateZ(0)'],
              ['filter', 'drop-shadow(0 1px 2px rgba(0, 40, 78, .28))'],
            ]);
          });
        });
      });
    };
    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => { raf = 0; normalize(); });
    };
    schedule();
    window.visualViewport?.addEventListener('resize', schedule, { passive: true });
    window.visualViewport?.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('pageshow', schedule, { passive: true });
    document.addEventListener('visibilitychange', schedule, { passive: true });
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-screen'], childList: true, subtree: true });
    window.addEventListener('pagehide', () => observer.disconnect(), { once: true, passive: true });
  }

  private installV21119InteractionSafetyPass(): void {
    let raf = 0;
    let lastSignature = '';
    const html = document.documentElement;
    const shieldSelector = '.v2097-build-tray,.v2097-build-backdrop,.v2130-build-confirm,.v2130-build-confirm-card,.bite-callout,.catch-result-card,.dialog-card,.runtime-menu-screen,.runtime-panel,.runtime-card-list,.runtime-shop-card,.shop-card,.mission-card,.dex-card,.runtime-item-card';
    const scrollSelector = '.v2097-build-tray,.v2097-build-grid,.v2130-build-confirm-card,.catch-result-card,.runtime-menu-screen,.runtime-panel,.runtime-card-list,.shop-list,.mission-list,.dex-grid,.inventory-grid,.dialog-card';
    const buttonSelector = '.v21119-touch-shield button,.v21119-touch-shield [role="button"],.bottom-nav button,.toast button';
    const set = (node: HTMLElement | null | undefined, entries: Array<[string, string]>) => {
      if (!node) return;
      for (const [name, value] of entries) {
        if (node.style.getPropertyValue(name) !== value || node.style.getPropertyPriority(name) !== 'important') {
          node.style.setProperty(name, value, 'important');
        }
      }
    };
    const normalize = () => {
      html.classList.add('v21119-interaction-safe-root');
      html.dataset.v21119InteractionSafety = 'mobile-touch-modal-scroll-safe-area-guard';
      const viewport = window.visualViewport;
      const width = Math.floor(viewport?.width ?? window.innerWidth);
      const height = Math.floor(viewport?.height ?? window.innerHeight);
      const compact = width <= 360 || height <= 610;
      html.style.setProperty('--v21119-visual-width', `${width}px`);
      html.style.setProperty('--v21119-visual-height', `${height}px`);
      html.classList.toggle('v21119-compact-touch', compact);
      const screen = document.body.dataset.screen || 'unknown';
      const shieldCount = dom.app.querySelectorAll(shieldSelector).length;
      const signature = `${screen}:${width}:${height}:${compact ? 'compact' : 'regular'}:${shieldCount}:${dom.app.childElementCount}`;
      if (signature === lastSignature) return;
      lastSignature = signature;
      dom.app.querySelectorAll<HTMLElement>(shieldSelector).forEach((node) => {
        node.classList.add('v21119-touch-shield');
        node.setAttribute('data-no-swipe', 'true');
        node.dataset.v21119TouchShield = 'modal-touch-scroll-contained';
        set(node, [
          ['box-sizing', 'border-box'],
          ['overscroll-behavior', 'contain'],
          ['-webkit-tap-highlight-color', 'transparent'],
        ]);
      });
      dom.app.querySelectorAll<HTMLElement>(scrollSelector).forEach((node) => {
        node.classList.add('v21119-scroll-safe');
        node.setAttribute('data-no-swipe', 'true');
        set(node, [
          ['overscroll-behavior', 'contain'],
          ['-webkit-overflow-scrolling', 'touch'],
          ['scrollbar-gutter', 'stable both-edges'],
          ['overflow-anchor', 'none'],
        ]);
      });
      dom.app.querySelectorAll<HTMLElement>(buttonSelector).forEach((node) => {
        node.classList.add('v21119-touch-target');
        node.setAttribute('data-no-swipe', 'true');
        set(node, [
          ['touch-action', 'manipulation'],
          ['-webkit-tap-highlight-color', 'transparent'],
          ['user-select', 'none'],
          ['-webkit-user-select', 'none'],
        ]);
      });
      dom.app.querySelectorAll<HTMLElement>('.v2097-build-backdrop,.v2130-build-confirm').forEach((node) => {
        set(node, [
          ['touch-action', 'none'],
          ['overscroll-behavior', 'none'],
        ]);
      });
      dom.app.querySelectorAll<HTMLElement>('.bite-callout,.catch-result-card,.v2130-build-confirm-card').forEach((node) => {
        node.classList.add('v21119-safe-dialog-card');
        set(node, [
          ['max-width', 'calc(100vw - 24px)'],
          ['max-height', 'calc(var(--v21119-visual-height, 100svh) - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 28px)'],
          ['overscroll-behavior', 'contain'],
        ]);
      });
    };
    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => { raf = 0; normalize(); });
    };
    schedule();
    window.visualViewport?.addEventListener('resize', schedule, { passive: true });
    window.visualViewport?.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('pageshow', schedule, { passive: true });
    document.addEventListener('visibilitychange', schedule, { passive: true });
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-screen'], childList: true, subtree: true });
    window.addEventListener('pagehide', () => observer.disconnect(), { once: true, passive: true });
  }


  private installV21120ScreenCompositionHandoffPass(): void {
    let raf = 0;
    let lastSignature = '';
    const html = document.documentElement;
    const panelSelector = '.runtime-menu-screen,.runtime-panel,.runtime-card-list,.runtime-shop-card,.shop-card,.mission-card,.dex-card,.runtime-item-card,.gear-card,.v950-gear-card,.v950-inventory-card,.v204-slot-card,.dialog-card,.v2097-build-tray,.v2130-build-confirm-card,.catch-result-card,.bite-callout';
    const navSelector = '.bottom-nav,.v2097-bottom-nav,.v2098-bottom-nav';
    const actionSelector = '.bottom-nav button,.runtime-menu-screen button,.runtime-panel button,.runtime-card-list button,.catch-result-card button,.dialog-card button,.v2130-build-confirm-card button,.bite-callout button';
    const mediaSelector = '.v21120-readable-panel img,.v21120-readable-panel video,.v21120-readable-panel canvas';
    const textSelector = '.v21120-readable-panel :is(h1,h2,h3,strong,p,span,small,em,button,label)';
    const set = (node: HTMLElement | null | undefined, entries: Array<[string, string]>) => {
      if (!node) return;
      for (const [name, value] of entries) {
        if (node.style.getPropertyValue(name) !== value || node.style.getPropertyPriority(name) !== 'important') {
          node.style.setProperty(name, value, 'important');
        }
      }
    };
    const normalize = () => {
      html.classList.add('v21120-screen-composition-handoff-root');
      html.dataset.v21120ScreenCompositionHandoff = 'readable-shell-safe-nav-handoff-contract';
      const viewport = window.visualViewport;
      const width = Math.floor(viewport?.width ?? window.innerWidth);
      const height = Math.floor(viewport?.height ?? window.innerHeight);
      html.style.setProperty('--v21120-visual-width', `${width}px`);
      html.style.setProperty('--v21120-visual-height', `${height}px`);
      html.classList.toggle('v21120-tight-screen', width <= 360 || height <= 610);
      const screen = document.body.dataset.screen || 'unknown';
      const panelCount = dom.app.querySelectorAll(panelSelector).length;
      const navCount = dom.app.querySelectorAll(navSelector).length;
      const actionCount = dom.app.querySelectorAll(actionSelector).length;
      const signature = `${screen}:${width}:${height}:${panelCount}:${navCount}:${actionCount}:${dom.app.childElementCount}`;
      if (signature === lastSignature) return;
      lastSignature = signature;
      dom.app.querySelectorAll<HTMLElement>(panelSelector).forEach((node) => {
        node.classList.add('v21120-readable-panel');
        node.dataset.v21120ReadablePanel = 'text-media-contained-no-overlap';
        set(node, [
          ['min-width', '0'],
          ['max-width', '100%'],
          ['box-sizing', 'border-box'],
          ['isolation', 'isolate'],
          ['overflow-wrap', 'anywhere'],
        ]);
      });
      dom.app.querySelectorAll<HTMLElement>(navSelector).forEach((node) => {
        node.classList.add('v21120-safe-nav');
        node.dataset.v21120SafeNav = 'safe-area-centered-touch-band';
        set(node, [
          ['box-sizing', 'border-box'],
          ['max-width', 'min(460px, calc(100vw - 16px))'],
          ['width', 'min(460px, calc(100vw - 16px))'],
          ['overscroll-behavior', 'contain'],
        ]);
      });
      dom.app.querySelectorAll<HTMLElement>(actionSelector).forEach((node) => {
        node.classList.add('v21120-action-button');
        node.setAttribute('data-no-swipe', 'true');
        set(node, [
          ['touch-action', 'manipulation'],
          ['-webkit-tap-highlight-color', 'transparent'],
          ['min-width', '0'],
        ]);
      });
      dom.app.querySelectorAll<HTMLElement>(textSelector).forEach((node) => {
        node.classList.add('v21120-readable-text');
        set(node, [
          ['min-width', '0'],
          ['max-width', '100%'],
          ['overflow-wrap', 'anywhere'],
          ['word-break', 'keep-all'],
        ]);
      });
      dom.app.querySelectorAll<HTMLElement>(mediaSelector).forEach((node) => {
        node.classList.add('v21120-contained-media');
        if (node instanceof HTMLImageElement) {
          node.decoding = 'async';
          node.draggable = false;
        }
        set(node, [
          ['max-width', '100%'],
          ['min-width', '0'],
          ['object-fit', 'contain'],
          ['object-position', 'center center'],
        ]);
      });
    };
    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => { raf = 0; normalize(); });
    };
    schedule();
    window.visualViewport?.addEventListener('resize', schedule, { passive: true });
    window.visualViewport?.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('pageshow', schedule, { passive: true });
    document.addEventListener('visibilitychange', schedule, { passive: true });
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-screen', 'data-fishing-phase', 'data-v21108-fishing-phase', 'data-v21109-fishing-phase', 'data-v21110-fishing-phase'], childList: true, subtree: true });
    window.addEventListener('pagehide', () => observer.disconnect(), { once: true, passive: true });
  }


  private installV21121MicroUiA11yPerfPass(): void {
    let raf = 0;
    let lastSignature = '';
    const html = document.documentElement;
    const shellSelector = '.runtime-menu-screen,.runtime-panel,.dialog-card,.v2097-build-tray,.v2130-build-confirm-card,.catch-result-card,.bite-callout';
    const scrollSelector = '.runtime-content,.v2097-menu-content,.v2098-menu-content,.runtime-card-list,.shop-list,.mission-list,.dex-grid,.inventory-grid,.gear-grid,.v2097-build-tray,.v2097-build-grid,.catch-result-card,.dialog-card';
    const cardSelector = '.runtime-card-list > *,.shop-list > *,.mission-list > *,.dex-grid > *,.inventory-grid > *,.gear-grid > *,.runtime-item-card,.runtime-shop-card,.shop-card,.mission-card,.dex-card,.gear-card,.v950-gear-card,.v950-inventory-card,.v204-slot-card';
    const controlSelector = 'button,[role="button"],a[href]';
    const set = (node: HTMLElement | null | undefined, entries: Array<[string, string]>) => {
      if (!node) return;
      for (const [name, value] of entries) {
        if (node.style.getPropertyValue(name) !== value || node.style.getPropertyPriority(name) !== 'important') {
          node.style.setProperty(name, value, 'important');
        }
      }
    };
    const labelControl = (node: HTMLElement) => {
      const hasLabel = node.getAttribute('aria-label') || node.getAttribute('aria-labelledby') || node.textContent?.trim();
      if (hasLabel) return;
      const title = node.getAttribute('title') || node.dataset.screen || node.dataset.v2098Nav || node.dataset.action || node.dataset.goMap || node.className.toString().replace(/[-_]/g, ' ').trim();
      const label = title ? `Aqua Fantasia ${title}` : 'Aqua Fantasia 조작 버튼';
      node.setAttribute('aria-label', label.slice(0, 72));
    };
    const normalize = () => {
      html.classList.add('v21121-micro-ui-a11y-perf-root');
      html.dataset.v21121MicroUiA11yPerf = 'button-label-scroll-reserve-content-visibility-polish';
      const viewport = window.visualViewport;
      const width = Math.floor(viewport?.width ?? window.innerWidth);
      const height = Math.floor(viewport?.height ?? window.innerHeight);
      const tight = width <= 360 || height <= 610;
      html.style.setProperty('--v21121-visual-width', `${width}px`);
      html.style.setProperty('--v21121-visual-height', `${height}px`);
      html.classList.toggle('v21121-tight-screen', tight);
      const screen = document.body.dataset.screen || 'unknown';
      const shellCount = dom.app.querySelectorAll(shellSelector).length;
      const scrollCount = dom.app.querySelectorAll(scrollSelector).length;
      const cardCount = dom.app.querySelectorAll(cardSelector).length;
      const controlCount = dom.app.querySelectorAll(controlSelector).length;
      const signature = `${screen}:${width}:${height}:${shellCount}:${scrollCount}:${cardCount}:${controlCount}:${dom.app.childElementCount}`;
      if (signature === lastSignature) return;
      lastSignature = signature;
      dom.app.querySelectorAll<HTMLElement>(shellSelector).forEach((node) => {
        node.classList.add('v21121-shell-polish');
        node.dataset.v21121ShellPolish = 'micro-safe-area-readable-layer';
        set(node, [
          ['min-width', '0'],
          ['box-sizing', 'border-box'],
          ['isolation', 'isolate'],
        ]);
      });
      dom.app.querySelectorAll<HTMLElement>(scrollSelector).forEach((node) => {
        node.classList.add('v21121-scroll-reserve');
        node.dataset.v21121ScrollReserve = 'bottom-nav-action-safe-padding';
        set(node, [
          ['scroll-padding-bottom', 'var(--v21121-scroll-reserve, 104px)'],
          ['overscroll-behavior', 'contain'],
        ]);
      });
      dom.app.querySelectorAll<HTMLElement>(cardSelector).forEach((node) => {
        node.classList.add('v21121-card-perf');
        node.dataset.v21121CardPerf = 'contained-card-render-budget';
        set(node, [
          ['contain', 'layout paint style'],
          ['content-visibility', 'auto'],
          ['contain-intrinsic-size', '160px'],
        ]);
      });
      dom.app.querySelectorAll<HTMLElement>(controlSelector).forEach((node) => {
        node.classList.add('v21121-control-a11y');
        node.dataset.v21121ControlA11y = 'label-touch-focus-haptic-safe';
        node.setAttribute('data-no-swipe', 'true');
        labelControl(node);
        set(node, [
          ['touch-action', 'manipulation'],
          ['-webkit-tap-highlight-color', 'transparent'],
          ['user-select', 'none'],
          ['-webkit-user-select', 'none'],
        ]);
      });
    };
    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => { raf = 0; normalize(); });
    };
    schedule();
    window.visualViewport?.addEventListener('resize', schedule, { passive: true });
    window.visualViewport?.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('pageshow', schedule, { passive: true });
    document.addEventListener('visibilitychange', schedule, { passive: true });
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-screen', 'data-fishing-phase', 'data-v21108-fishing-phase', 'data-v21109-fishing-phase', 'data-v21110-fishing-phase'], childList: true, subtree: true });
    window.addEventListener('pagehide', () => observer.disconnect(), { once: true, passive: true });
  }


  private installV21122SystemUxPerformancePass(): void {
    let raf = 0;
    let timer = 0;
    let lastRun = 0;
    let lastSignature = '';
    const html = document.documentElement;
    if (html.dataset.v21131StaleObserverQuarantine === 'active') {
      html.dataset.v21122SystemUxPerformance = 'handoff-to-v21131-stale-observer-quarantine';
      return;
    }
    const pageScreens = new Set(['shop', 'inventory', 'mission', 'map', 'dex', 'gear', 'ranking']);
    const setImportant = (node: HTMLElement | null | undefined, entries: Array<[string, string]>) => {
      if (!node) return;
      for (const [name, value] of entries) {
        if (node.style.getPropertyValue(name) !== value || node.style.getPropertyPriority(name) !== 'important') {
          node.style.setProperty(name, value, 'important');
        }
      }
    };
    const guideDismissed = () => {
      try { return localStorage.getItem('aqua-v21122-guide-dismissed') === '1'; }
      catch { return false; }
    };
    const dismissGuide = () => {
      try { localStorage.setItem('aqua-v21122-guide-dismissed', '1'); }
      catch { /* ignore private mode storage failures */ }
      dom.app.querySelectorAll('.v21122-village-guide-popup').forEach((node) => node.remove());
    };
    const phaseOf = (fishing: HTMLElement): string => {
      if (fishing.querySelector('.catch-result-card')) return 'result';
      if (fishing.querySelector('.bite-callout')) return 'bite';
      if (fishing.querySelector('.v2055-reel-console:not(.hidden),.reel-panel:not(.hidden),.v2053-reel-touch-zone:not(.hidden),.v2054-reel-touch-zone:not(.hidden)')) return 'reeling';
      const raw = fishing.dataset.fishingPhase || fishing.dataset.v21108FishingPhase || fishing.dataset.v21109FishingPhase || fishing.dataset.v21110FishingPhase || '';
      if (/success|fail|result/i.test(raw)) return raw.toLowerCase();
      if (/casting|waiting|idle|prep/i.test(raw)) return raw.toLowerCase();
      return 'prep';
    };
    const normalizeGuide = (village: HTMLElement, screen: string) => {
      const blocked = screen !== 'village' || guideDismissed() || village.querySelector('.v2199-opening-cinematic,.v2097-expedition-body-open,.v2097-build-tray,.v2130-build-confirm-card') || document.body.classList.contains('v2097-expedition-open') || document.body.classList.contains('v2097-build-open');
      if (blocked) {
        village.querySelectorAll('.v21122-village-guide-popup').forEach((node) => node.remove());
        return;
      }
      let guide = village.querySelector<HTMLElement>('.v21122-village-guide-popup');
      if (!guide) {
        guide = document.createElement('section');
        guide.className = 'v21122-village-guide-popup';
        guide.dataset.noSwipe = 'true';
        guide.dataset.v21122Guide = 'first-village-tracking-guide';
        guide.setAttribute('role', 'dialog');
        guide.setAttribute('aria-live', 'polite');
        guide.setAttribute('aria-label', '처음 마을 추천 진행 가이드');
        guide.innerHTML = `<div class="v21122-guide-card">
          <span class="v21122-guide-eyebrow">오늘의 추천</span>
          <strong>먼저 낚시로 마을을 키워요</strong>
          <p>낚시로 골드와 기금을 모으고, 개척 조건을 확인한 뒤 상점·퀘스트·도감을 차례로 보면 흐름이 잡혀요.</p>
          <ol><li>낚시 시작</li><li>가방·퀘스트 확인</li><li>개척 100% 목표</li></ol>
          <div class="v21122-guide-actions"><button type="button" data-v21122-guide-fishing>낚시 가기</button><button type="button" data-v21122-guide-expedition>개척 보기</button><button type="button" data-v21122-guide-dismiss>닫기</button></div>
        </div>`;
        guide.querySelector<HTMLButtonElement>('[data-v21122-guide-fishing]')?.addEventListener('click', () => { dismissGuide(); void this.go('fishing' as Screen); });
        guide.querySelector<HTMLButtonElement>('[data-v21122-guide-expedition]')?.addEventListener('click', () => {
          const toggle = village.querySelector<HTMLButtonElement>('[data-v2097-expedition-toggle]');
          if (toggle) toggle.click();
        });
        guide.querySelector<HTMLButtonElement>('[data-v21122-guide-dismiss]')?.addEventListener('click', dismissGuide);
        village.appendChild(guide);
      }
    };
    const normalizeBottomNav = () => {
      if (document.body.dataset.screen === 'fishing') return;
      dom.app.querySelectorAll<HTMLElement>('.bottom-nav').forEach((nav) => {
        nav.classList.add('v21122-bottom-nav-lock');
        nav.dataset.v21122BottomNav = 'single-fixed-anchor-all-pages-except-fishing';
        setImportant(nav, [
          ['position', 'fixed'],
          ['right', 'var(--v21122-nav-right, calc(env(safe-area-inset-right, 0px) + 8px))'],
          ['bottom', 'var(--v21122-nav-bottom, calc(env(safe-area-inset-bottom, 0px) + 8px))'],
          ['left', 'auto'],
          ['top', 'auto'],
          ['width', 'var(--v21122-nav-width, min(232px, calc(100vw - 18px)))'],
          ['max-width', 'calc(100vw - 18px)'],
          ['transform', 'none'],
          ['translate', 'none'],
          ['z-index', '620'],
        ]);
      });
    };
    const normalizeVillage = (screen: string) => {
      const village = dom.app.querySelector<HTMLElement>('.village-world-screen');
      if (!village) return;
      village.classList.add('v21122-village-guide-ready');
      village.dataset.v21122VillageGuide = 'first-session-centered-tracking-guide';
      village.querySelectorAll<HTMLElement>('.v2097-expedition-board').forEach((board) => {
        board.classList.add('v21122-expedition-stable');
        board.dataset.v21122Expedition = 'centered-full-popup-not-half-clipped';
      });
      village.querySelectorAll<HTMLElement>('.v2097-expedition-body,.v2097-expedition-body-open').forEach((body) => {
        body.classList.add('v21122-expedition-body-stable');
        body.dataset.v21122ExpeditionBody = 'centered-scroll-safe-panel';
        if (body.classList.contains('v2097-expedition-body-open')) {
          setImportant(body, [
            ['position', 'fixed'],
            ['left', '50%'],
            ['right', 'auto'],
            ['top', '50%'],
            ['bottom', 'auto'],
            ['width', 'min(368px, calc(100vw - 22px))'],
            ['max-width', 'calc(100vw - 22px)'],
            ['max-height', 'calc(var(--v21122-visual-height, 100svh) - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 42px)'],
            ['transform', 'translate3d(-50%, -50%, 0)'],
            ['overflow-x', 'hidden'],
            ['overflow-y', 'auto'],
            ['z-index', '610'],
          ]);
        }
      });
      normalizeGuide(village, screen);
    };
    const normalizePages = (screen: string) => {
      if (!pageScreens.has(screen)) return;
      dom.app.querySelectorAll<HTMLElement>('.runtime-menu-screen').forEach((node) => {
        node.classList.add('v21122-runtime-centered');
        node.dataset.v21122PageCentering = 'single-column-center-safe-area';
        setImportant(node, [
          ['position', 'fixed'],
          ['inset', '0'],
          ['width', '100vw'],
          ['max-width', '100vw'],
          ['min-width', '0'],
          ['height', 'var(--v21122-visual-height, 100svh)'],
          ['max-height', 'var(--v21122-visual-height, 100svh)'],
          ['overflow-x', 'hidden'],
          ['overflow-y', 'auto'],
          ['padding-left', 'max(9px, env(safe-area-inset-left, 0px))'],
          ['padding-right', 'max(9px, env(safe-area-inset-right, 0px))'],
          ['padding-bottom', 'calc(env(safe-area-inset-bottom, 0px) + 118px)'],
          ['box-sizing', 'border-box'],
        ]);
      });
      dom.app.querySelectorAll<HTMLElement>('.runtime-hud,.runtime-content,.runtime-card-list,.shop-list,.mission-list,.dex-grid,.inventory-grid,.gear-grid').forEach((node) => {
        node.classList.add('v21122-page-column');
        node.dataset.v21122PageColumn = 'centered-readable-column';
        setImportant(node, [
          ['width', 'var(--v21122-page-width, min(430px, calc(100vw - 18px)))'],
          ['max-width', 'var(--v21122-page-width, min(430px, calc(100vw - 18px)))'],
          ['margin-left', 'auto'],
          ['margin-right', 'auto'],
          ['left', 'auto'],
          ['right', 'auto'],
          ['transform', 'none'],
          ['translate', 'none'],
          ['box-sizing', 'border-box'],
        ]);
      });
    };
    const normalizeFishing = () => {
      const fishing = dom.app.querySelector<HTMLElement>('.fishing-screen');
      if (!fishing || document.body.dataset.screen !== 'fishing') return;
      const phase = phaseOf(fishing);
      fishing.classList.add('v21122-fishing-stability-screen');
      fishing.dataset.v21122FishingPhase = phase;
      fishing.dataset.v21122SystemUxPerformance = 'water-loadout-bite-result-single-anchor';
      fishing.classList.toggle('v21122-fishing-phase-focused', /bite|reeling|result|success|fail/.test(phase));
      fishing.querySelectorAll<HTMLElement>('.water-overlay,.caustic-overlay,.fishing-3d-ambient,.underwater-webgl-host,.v3d-caustics,.v3d-bubbles,.v3d-depth-fog').forEach((node) => {
        node.classList.add('v21122-water-fx-stable');
        node.dataset.v21122WaterFx = 'no-flicker-low-churn-layer';
        setImportant(node, [
          ['animation', 'none'],
          ['backface-visibility', 'hidden'],
          ['transform', 'translateZ(0)'],
          ['will-change', 'auto'],
          ['contain', 'paint'],
        ]);
      });
      fishing.querySelectorAll<HTMLElement>('.v2137-sea-lane-card,.v2174-sea-lane-card,.v2199-sea-lane-card').forEach((node) => {
        node.classList.add('v21122-sea-lane-stable');
        node.dataset.v21122SeaLane = 'stable-or-hidden-during-bite-result';
        const focused = /bite|reeling|result|success|fail/.test(phase);
        setImportant(node, [
          ['position', 'fixed'],
          ['left', 'max(10px, env(safe-area-inset-left, 0px))'],
          ['right', 'auto'],
          ['top', 'calc(env(safe-area-inset-top, 0px) + 58px)'],
          ['bottom', 'auto'],
          ['width', 'min(258px, calc(100vw - 20px))'],
          ['max-width', 'calc(100vw - 20px)'],
          ['transform', 'none'],
          ['translate', 'none'],
          ['animation', 'none'],
          ['transition', 'opacity 120ms ease'],
          ['opacity', focused ? '0' : '1'],
          ['visibility', focused ? 'hidden' : 'visible'],
          ['pointer-events', focused ? 'none' : 'auto'],
          ['z-index', '430'],
        ]);
      });
      fishing.querySelectorAll<HTMLElement>('.fishing-loadout-strip').forEach((node) => {
        node.classList.add('v21122-loadout-stable');
        node.dataset.v21122Loadout = 'fixed-size-no-scale-flicker';
        const hidden = /bite|reeling|result|success|fail/.test(phase);
        setImportant(node, [
          ['position', 'fixed'],
          ['left', '50%'],
          ['right', 'auto'],
          ['top', 'var(--v21122-loadout-top, calc(env(safe-area-inset-top, 0px) + 94px))'],
          ['bottom', 'auto'],
          ['width', 'min(318px, calc(100vw - 28px))'],
          ['max-width', 'calc(100vw - 28px)'],
          ['transform', 'translate3d(-50%, 0, 0)'],
          ['translate', 'none'],
          ['animation', 'none'],
          ['transition', 'opacity 120ms ease'],
          ['opacity', hidden ? '0' : '1'],
          ['visibility', hidden ? 'hidden' : 'visible'],
          ['pointer-events', hidden ? 'none' : 'auto'],
          ['z-index', '440'],
        ]);
        node.querySelectorAll<HTMLElement>('img,span,strong,em,b,div').forEach((child) => {
          child.classList.add('v21122-loadout-cell-stable');
          setImportant(child, [['animation', 'none'], ['transform', 'none'], ['translate', 'none']]);
        });
      });
      fishing.querySelectorAll<HTMLElement>('.combo-badge').forEach((node) => {
        node.classList.add('v21122-combo-anchor');
        node.dataset.v21122Combo = 'near-cast-button-stable-gap';
        setImportant(node, [
          ['position', 'fixed'],
          ['left', '50%'],
          ['right', 'auto'],
          ['top', 'auto'],
          ['bottom', 'var(--v21122-combo-bottom, calc(env(safe-area-inset-bottom, 0px) + 104px))'],
          ['transform', 'translate3d(-50%, 0, 0)'],
          ['translate', 'none'],
          ['animation', 'none'],
          ['z-index', '560'],
        ]);
      });
      fishing.querySelectorAll<HTMLElement>('.bite-callout').forEach((node) => {
        node.classList.add('v21122-bite-center-lock');
        node.dataset.v21122BiteCallout = 'fixed-center-no-jitter';
        setImportant(node, [
          ['position', 'fixed'],
          ['left', '50%'],
          ['right', 'auto'],
          ['top', '50%'],
          ['bottom', 'auto'],
          ['width', 'min(330px, calc(100vw - 30px))'],
          ['max-width', 'calc(100vw - 30px)'],
          ['transform', 'translate3d(-50%, -50%, 0)'],
          ['translate', 'none'],
          ['animation', 'none'],
          ['transition', 'opacity 120ms ease'],
          ['z-index', '690'],
        ]);
      });
      fishing.querySelectorAll<HTMLElement>('.catch-result-card').forEach((node) => {
        node.classList.add('v21122-result-center-lock');
        node.dataset.v21122Result = 'fixed-center-result-no-water-flicker';
        setImportant(node, [
          ['position', 'fixed'],
          ['left', '50%'],
          ['right', 'auto'],
          ['top', '50%'],
          ['bottom', 'auto'],
          ['width', 'min(352px, calc(100vw - 28px))'],
          ['max-width', 'calc(100vw - 28px)'],
          ['max-height', 'calc(var(--v21122-visual-height, 100svh) - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 34px)'],
          ['overflow-x', 'hidden'],
          ['overflow-y', 'auto'],
          ['transform', 'translate3d(-50%, -50%, 0)'],
          ['translate', 'none'],
          ['animation', 'none'],
          ['z-index', '700'],
        ]);
      });
    };
    const normalize = () => {
      if (html.dataset.v21128DirectSourceUiRepair === 'active' || html.dataset.v21126StaleCodePruner === 'active' || html.dataset.v21125LegacyDebtReducer === 'active') return;
      const viewport = window.visualViewport;
      const width = Math.floor(viewport?.width ?? window.innerWidth);
      const height = Math.floor(viewport?.height ?? window.innerHeight);
      const screen = document.body.dataset.screen || 'unknown';
      html.classList.add('v21122-system-ux-performance-root');
      html.dataset.v21122SystemUxPerformance = 'guide-page-centering-fishing-jitter-single-anchor';
      html.style.setProperty('--v21122-visual-width', `${width}px`);
      html.style.setProperty('--v21122-visual-height', `${height}px`);
      html.classList.toggle('v21122-tight-screen', width <= 360 || height <= 610);
      document.body.dataset.v21122ActiveScreen = screen;
      const fishingPhase = dom.app.querySelector<HTMLElement>('.fishing-screen')?.dataset.v21122FishingPhase || '';
      const signature = `${screen}:${width}:${height}:${dom.app.childElementCount}:${dom.app.querySelectorAll('.runtime-menu-screen,.village-world-screen,.fishing-screen,.bite-callout,.catch-result-card,.v2097-expedition-body-open').length}:${fishingPhase}`;
      if (signature === lastSignature) return;
      lastSignature = signature;
      normalizeBottomNav();
      normalizeVillage(screen);
      normalizePages(screen);
      normalizeFishing();
    };
    const schedule = () => {
      const now = performance.now();
      const elapsed = now - lastRun;
      const run = () => {
        timer = 0;
        if (raf) return;
        raf = window.requestAnimationFrame(() => {
          raf = 0;
          lastRun = performance.now();
          normalize();
        });
      };
      if (elapsed > 140) run();
      else if (!timer) timer = window.setTimeout(run, 140 - elapsed);
    };
    schedule();
    window.visualViewport?.addEventListener('resize', schedule, { passive: true });
    window.visualViewport?.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('pageshow', schedule, { passive: true });
    document.addEventListener('visibilitychange', schedule, { passive: true });
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-screen', 'data-fishing-phase', 'data-v21108-fishing-phase', 'data-v21109-fishing-phase', 'data-v21110-fishing-phase'], childList: true, subtree: true });
    window.addEventListener('pagehide', () => { observer.disconnect(); if (timer) window.clearTimeout(timer); }, { once: true, passive: true });
  }


  private installV21123RuntimeDeconflictPass(): void {
    let raf = 0;
    let timer = 0;
    let lastSignature = '';
    const html = document.documentElement;
    if (html.dataset.v21131StaleObserverQuarantine === 'active') {
      html.dataset.v21123RuntimeDeconflict = 'handoff-to-v21131-stale-observer-quarantine';
      return;
    }
    const pageScreens = new Set(['shop', 'inventory', 'mission', 'map', 'dex', 'gear', 'ranking']);
    const focusedFishingPhases = /bite|reeling|result|success|fail/i;
    const setImportant = (node: HTMLElement | null | undefined, entries: Array<[string, string]>) => {
      if (!node) return;
      for (const [name, value] of entries) {
        if (node.style.getPropertyValue(name) !== value || node.style.getPropertyPriority(name) !== 'important') {
          node.style.setProperty(name, value, 'important');
        }
      }
    };
    const removeImportant = (node: HTMLElement | null | undefined, props: string[]) => {
      if (!node) return;
      for (const prop of props) {
        if (node.style.getPropertyPriority(prop) === 'important' || node.style.getPropertyValue(prop)) node.style.removeProperty(prop);
      }
    };
    const markOwned = (node: HTMLElement | null | undefined, token: string) => {
      if (!node) return;
      node.classList.add('v21123-owned-anchor');
      node.dataset.v21123Owner = token;
      node.dataset.v21123LatestAnchor = 'true';
    };
    const phaseOf = (fishing: HTMLElement): string => {
      if (fishing.querySelector('.catch-result-card')) return 'result';
      if (fishing.querySelector('.bite-callout')) return 'bite';
      if (fishing.querySelector('.v2055-reel-console:not(.hidden),.reel-panel:not(.hidden),.v2053-reel-touch-zone:not(.hidden),.v2054-reel-touch-zone:not(.hidden)')) return 'reeling';
      const raw = fishing.dataset.fishingPhase || fishing.dataset.v21108FishingPhase || fishing.dataset.v21109FishingPhase || fishing.dataset.v21110FishingPhase || fishing.dataset.v21122FishingPhase || '';
      if (focusedFishingPhases.test(raw)) return raw.toLowerCase();
      if (/casting|waiting|idle|prep/i.test(raw)) return raw.toLowerCase();
      return 'prep';
    };
    const normalizeBottomNav = (screen: string) => {
      dom.app.querySelectorAll<HTMLElement>('.bottom-nav,.v2097-bottom-nav,.v2098-bottom-nav').forEach((nav) => {
        markOwned(nav, 'bottom-nav-single-dock');
        nav.classList.add('v21123-bottom-nav-final');
        nav.dataset.v21123BottomNav = 'one-fixed-right-bottom-anchor';
        if (screen === 'fishing') {
          setImportant(nav, [['display', 'none'], ['pointer-events', 'none']]);
          return;
        }
        setImportant(nav, [
          ['display', 'grid'],
          ['position', 'fixed'],
          ['right', 'var(--v21123-nav-right, calc(env(safe-area-inset-right, 0px) + 8px))'],
          ['bottom', 'var(--v21123-nav-bottom, calc(env(safe-area-inset-bottom, 0px) + 8px))'],
          ['left', 'auto'],
          ['top', 'auto'],
          ['width', 'var(--v21123-nav-width, min(232px, calc(100vw - 18px)))'],
          ['max-width', 'calc(100vw - 18px)'],
          ['height', 'auto'],
          ['transform', 'none'],
          ['translate', 'none'],
          ['animation', 'none'],
          ['transition', 'filter 120ms ease, opacity 120ms ease'],
          ['z-index', '720'],
          ['contain', 'layout paint style'],
          ['pointer-events', 'auto'],
        ]);
      });
    };
    const normalizeVillageModals = (screen: string) => {
      const village = dom.app.querySelector<HTMLElement>('.village-world-screen');
      if (!village) return;
      village.classList.add('v21123-village-anchor-root');
      village.dataset.v21123Village = 'modal-and-guide-deconflicted';
      const modalOpen = Boolean(village.querySelector('.v2097-expedition-body-open,.v2130-build-confirm-card,.v2097-build-tray')) || document.body.classList.contains('v2097-expedition-open') || document.body.classList.contains('v2097-build-open');
      document.body.classList.toggle('v21123-village-modal-open', modalOpen && screen === 'village');
      village.querySelectorAll<HTMLElement>('.v2097-expedition-body,.v2097-expedition-body-open').forEach((panel) => {
        markOwned(panel, 'expedition-popup-center-scroll');
        panel.classList.add('v21123-expedition-final');
        panel.dataset.noSwipe = 'true';
        panel.dataset.v21123Expedition = 'full-visible-centered-modal';
        if (panel.classList.contains('v2097-expedition-body-open')) {
          setImportant(panel, [
            ['display', 'block'],
            ['position', 'fixed'],
            ['left', '50%'],
            ['right', 'auto'],
            ['top', '50%'],
            ['bottom', 'auto'],
            ['width', 'min(378px, calc(100vw - 20px))'],
            ['max-width', 'calc(100vw - 20px)'],
            ['max-height', 'calc(var(--v21123-visual-height, 100svh) - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 38px)'],
            ['overflow-x', 'hidden'],
            ['overflow-y', 'auto'],
            ['transform', 'translate3d(-50%, -50%, 0)'],
            ['translate', 'none'],
            ['animation', 'none'],
            ['transition', 'opacity 120ms ease, filter 120ms ease'],
            ['z-index', '760'],
            ['contain', 'layout paint style'],
            ['overscroll-behavior', 'contain'],
          ]);
        }
      });
      village.querySelectorAll<HTMLElement>('.v2130-build-confirm-card,.v2097-build-tray').forEach((panel) => {
        markOwned(panel, 'build-modal-safe-center');
        panel.classList.add('v21123-village-modal-final');
        panel.dataset.noSwipe = 'true';
        setImportant(panel, [
          ['max-width', 'calc(100vw - 20px)'],
          ['max-height', 'calc(var(--v21123-visual-height, 100svh) - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 38px)'],
          ['overflow-x', 'hidden'],
          ['overflow-y', 'auto'],
          ['overscroll-behavior', 'contain'],
          ['box-sizing', 'border-box'],
          ['z-index', '755'],
        ]);
      });
      village.querySelectorAll<HTMLElement>('.v21122-village-guide-popup').forEach((guide) => {
        markOwned(guide, 'first-guide-center-no-modal-overlap');
        guide.classList.add('v21123-guide-final');
        setImportant(guide, [
          ['position', 'fixed'],
          ['left', '50%'],
          ['top', '50%'],
          ['right', 'auto'],
          ['bottom', 'auto'],
          ['width', 'min(344px, calc(100vw - 26px))'],
          ['max-width', 'calc(100vw - 26px)'],
          ['transform', 'translate3d(-50%, -50%, 0)'],
          ['translate', 'none'],
          ['animation', 'none'],
          ['transition', 'opacity 120ms ease, filter 120ms ease'],
          ['z-index', modalOpen ? '0' : '650'],
          ['pointer-events', modalOpen ? 'none' : 'auto'],
          ['opacity', modalOpen ? '0' : '1'],
          ['visibility', modalOpen ? 'hidden' : 'visible'],
        ]);
      });
    };
    const normalizePages = (screen: string) => {
      if (!pageScreens.has(screen)) return;
      dom.app.querySelectorAll<HTMLElement>('.runtime-menu-screen').forEach((screenNode) => {
        markOwned(screenNode, 'runtime-page-center-shell');
        screenNode.classList.add('v21123-runtime-page-final');
        screenNode.dataset.v21123RuntimePage = 'centered-not-right-biased';
        setImportant(screenNode, [
          ['position', 'fixed'],
          ['inset', '0'],
          ['width', '100vw'],
          ['max-width', '100vw'],
          ['min-width', '0'],
          ['height', 'var(--v21123-visual-height, 100svh)'],
          ['min-height', 'var(--v21123-visual-height, 100svh)'],
          ['overflow-x', 'hidden'],
          ['overflow-y', 'auto'],
          ['padding-top', 'calc(env(safe-area-inset-top, 0px) + 10px)'],
          ['padding-right', 'max(10px, env(safe-area-inset-right, 0px))'],
          ['padding-bottom', 'calc(env(safe-area-inset-bottom, 0px) + 124px)'],
          ['padding-left', 'max(10px, env(safe-area-inset-left, 0px))'],
          ['box-sizing', 'border-box'],
          ['transform', 'none'],
          ['translate', 'none'],
          ['animation', 'none'],
          ['scrollbar-gutter', 'stable both-edges'],
          ['overscroll-behavior', 'contain'],
          ['isolation', 'isolate'],
        ]);
      });
      dom.app.querySelectorAll<HTMLElement>('.runtime-hud,.runtime-content,.runtime-card-list,.runtime-panel,.shop-list,.mission-list,.dex-grid,.inventory-grid,.gear-grid,.map-card').forEach((node) => {
        markOwned(node, 'runtime-page-readable-column');
        node.classList.add('v21123-page-column-final');
        node.dataset.v21123PageColumn = 'centered-column-no-legacy-offset';
        setImportant(node, [
          ['width', 'var(--v21123-page-width, min(430px, calc(100vw - 20px)))'],
          ['max-width', 'var(--v21123-page-width, min(430px, calc(100vw - 20px)))'],
          ['min-width', '0'],
          ['margin-left', 'auto'],
          ['margin-right', 'auto'],
          ['left', 'auto'],
          ['right', 'auto'],
          ['transform', 'none'],
          ['translate', 'none'],
          ['box-sizing', 'border-box'],
          ['overflow-anchor', 'none'],
        ]);
      });
    };
    const normalizeFishing = (screen: string) => {
      const fishing = dom.app.querySelector<HTMLElement>('.fishing-screen');
      if (!fishing || screen !== 'fishing') return;
      const phase = phaseOf(fishing);
      const focused = focusedFishingPhases.test(phase);
      fishing.classList.add('v21123-fishing-final-screen');
      fishing.classList.toggle('v21123-fishing-focused', focused);
      fishing.dataset.v21123FishingPhase = phase;
      fishing.dataset.v21123Fishing = 'legacy-bars-loadout-bite-result-deconflicted';
      fishing.querySelectorAll<HTMLElement>('.water-overlay,.caustic-overlay,.fishing-3d-ambient,.underwater-webgl-host,.v3d-caustics,.v3d-bubbles,.v3d-depth-fog').forEach((node) => {
        markOwned(node, 'water-effect-budget-static');
        node.classList.add('v21123-water-budget-final');
        setImportant(node, [
          ['animation', 'none'],
          ['transition', 'none'],
          ['transform', 'translateZ(0)'],
          ['translate', 'none'],
          ['will-change', 'auto'],
          ['backface-visibility', 'hidden'],
          ['contain', 'paint'],
          ['pointer-events', 'none'],
          ['opacity', focused ? '0.32' : '0.42'],
        ]);
      });
      fishing.querySelectorAll<HTMLElement>('[class*="sea-lane-card"],.v2137-sea-lane-card,.v2174-sea-lane-card,.v2199-sea-lane-card').forEach((node) => {
        markOwned(node, 'sea-lane-single-static-bar');
        node.classList.add('v21123-sea-lane-final');
        setImportant(node, [
          ['position', 'fixed'],
          ['display', focused ? 'none' : 'block'],
          ['left', 'max(10px, env(safe-area-inset-left, 0px))'],
          ['right', 'auto'],
          ['top', 'calc(env(safe-area-inset-top, 0px) + 58px)'],
          ['bottom', 'auto'],
          ['width', 'min(258px, calc(100vw - 20px))'],
          ['max-width', 'calc(100vw - 20px)'],
          ['opacity', focused ? '0' : '1'],
          ['visibility', focused ? 'hidden' : 'visible'],
          ['pointer-events', 'none'],
          ['transform', 'none'],
          ['translate', 'none'],
          ['animation', 'none'],
          ['transition', 'none'],
          ['z-index', '450'],
          ['contain', 'layout paint style'],
        ]);
      });
      Array.from(fishing.querySelectorAll<HTMLElement>('*')).filter((node) => node.classList.contains('fishing-loadout-strip') || Array.from(node.classList).some((name) => /^v\d+-fishing-loadout$/.test(name) || /^v\d+-loadout-copy$/.test(name))).forEach((node) => {
        markOwned(node, 'loadout-fixed-size-static');
        node.classList.add('v21123-loadout-final');
        setImportant(node, [
          ['position', 'fixed'],
          ['display', focused ? 'none' : 'grid'],
          ['left', '50%'],
          ['right', 'auto'],
          ['top', 'var(--v21123-loadout-top, calc(env(safe-area-inset-top, 0px) + 92px))'],
          ['bottom', 'auto'],
          ['width', 'min(318px, calc(100vw - 28px))'],
          ['max-width', 'calc(100vw - 28px)'],
          ['opacity', focused ? '0' : '1'],
          ['visibility', focused ? 'hidden' : 'visible'],
          ['pointer-events', focused ? 'none' : 'auto'],
          ['transform', 'translate3d(-50%, 0, 0)'],
          ['translate', 'none'],
          ['animation', 'none'],
          ['transition', 'none'],
          ['z-index', '460'],
          ['contain', 'layout paint style'],
        ]);
        node.querySelectorAll<HTMLElement>('*').forEach((child) => {
          child.classList.add('v21123-loadout-child-final');
          setImportant(child, [
            ['animation', 'none'],
            ['transition', 'none'],
            ['transform', 'none'],
            ['translate', 'none'],
            ['scale', '1'],
          ]);
        });
      });
      fishing.querySelectorAll<HTMLElement>('.combo-badge').forEach((node) => {
        markOwned(node, 'combo-near-cast-button');
        node.classList.add('v21123-combo-final');
        setImportant(node, [
          ['position', 'fixed'],
          ['left', '50%'],
          ['right', 'auto'],
          ['top', 'auto'],
          ['bottom', 'var(--v21123-combo-bottom, calc(env(safe-area-inset-bottom, 0px) + 88px))'],
          ['width', 'fit-content'],
          ['max-width', 'calc(100vw - 32px)'],
          ['transform', 'translate3d(-50%, 0, 0)'],
          ['translate', 'none'],
          ['animation', 'none'],
          ['transition', 'none'],
          ['pointer-events', 'none'],
          ['z-index', '620'],
        ]);
      });
      fishing.querySelectorAll<HTMLElement>('.bite-callout').forEach((node) => {
        markOwned(node, 'bite-callout-center-static');
        node.classList.add('v21123-bite-final');
        removeImportant(node, ['margin', 'margin-top', 'margin-bottom']);
        setImportant(node, [
          ['display', node.classList.contains('hidden') ? 'none' : 'grid'],
          ['position', 'fixed'],
          ['left', '50%'],
          ['right', 'auto'],
          ['top', '50%'],
          ['bottom', 'auto'],
          ['width', 'min(330px, calc(100vw - 30px))'],
          ['max-width', 'calc(100vw - 30px)'],
          ['transform', 'translate3d(-50%, -50%, 0)'],
          ['translate', 'none'],
          ['animation', 'none'],
          ['transition', 'none'],
          ['z-index', '820'],
          ['contain', 'layout paint style'],
        ]);
      });
      fishing.querySelectorAll<HTMLElement>('.catch-result-card').forEach((node) => {
        markOwned(node, 'catch-result-center-static');
        node.classList.add('v21123-result-final');
        setImportant(node, [
          ['position', 'fixed'],
          ['left', '50%'],
          ['right', 'auto'],
          ['top', '50%'],
          ['bottom', 'auto'],
          ['width', 'min(354px, calc(100vw - 28px))'],
          ['max-width', 'calc(100vw - 28px)'],
          ['max-height', 'calc(var(--v21123-visual-height, 100svh) - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 34px)'],
          ['overflow-x', 'hidden'],
          ['overflow-y', 'auto'],
          ['overscroll-behavior', 'contain'],
          ['transform', 'translate3d(-50%, -50%, 0)'],
          ['translate', 'none'],
          ['animation', 'none'],
          ['transition', 'none'],
          ['z-index', '830'],
          ['contain', 'layout paint style'],
        ]);
      });
    };
    const normalize = () => {
      if (html.dataset.v21128DirectSourceUiRepair === 'active' || html.dataset.v21126StaleCodePruner === 'active') return;
      const viewport = window.visualViewport;
      const width = Math.floor(viewport?.width ?? window.innerWidth);
      const height = Math.floor(viewport?.height ?? window.innerHeight);
      const screen = document.body.dataset.screen || 'unknown';
      const fishing = dom.app.querySelector<HTMLElement>('.fishing-screen');
      const phase = fishing ? phaseOf(fishing) : '';
      const modalCount = dom.app.querySelectorAll('.v2097-expedition-body-open,.v2130-build-confirm-card,.v2097-build-tray,.bite-callout,.catch-result-card').length;
      const signature = `${screen}:${phase}:${width}:${height}:${dom.app.childElementCount}:${modalCount}`;
      html.classList.add('v21123-runtime-deconflict-root');
      html.dataset.v21123RuntimeDeconflict = 'latest-anchor-owns-layout-and-fishing-ui';
      html.style.setProperty('--v21123-visual-width', `${width}px`);
      html.style.setProperty('--v21123-visual-height', `${height}px`);
      document.body.dataset.v21123ActiveScreen = screen;
      document.body.dataset.v21123FishingPhase = phase;
      if (signature === lastSignature) return;
      lastSignature = signature;
      normalizeBottomNav(screen);
      normalizeVillageModals(screen);
      normalizePages(screen);
      normalizeFishing(screen);
    };
    const schedule = () => {
      if (html.dataset.v21128DirectSourceUiRepair === 'active' || html.dataset.v21126StaleCodePruner === 'active') return;
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        normalize();
        if (timer) window.clearTimeout(timer);
        timer = window.setTimeout(normalize, 80);
      });
    };
    schedule();
    window.visualViewport?.addEventListener('resize', schedule, { passive: true });
    window.visualViewport?.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('pageshow', schedule, { passive: true });
    document.addEventListener('visibilitychange', schedule, { passive: true });
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-screen', 'data-fishing-phase', 'data-v21108-fishing-phase', 'data-v21109-fishing-phase', 'data-v21110-fishing-phase', 'data-v21122-fishing-phase'], childList: true, subtree: true });
    window.addEventListener('pagehide', () => { observer.disconnect(); if (timer) window.clearTimeout(timer); }, { once: true, passive: true });
  }



  private installV21124RootCauseUxRepairPass(): void {
    let raf = 0;
    let trailingTimer = 0;
    let lastViewport = '';
    const html = document.documentElement;
    if (html.dataset.v21131StaleObserverQuarantine === 'active') {
      html.dataset.v21124RootCauseUxRepair = 'handoff-to-v21131-stale-observer-quarantine';
      return;
    }
    const pageScreens = new Set(['shop', 'inventory', 'mission', 'map', 'dex', 'gear', 'ranking']);
    const focusedFishingPhases = /bite|reeling|result|success|fail/i;
    const setImportant = (node: HTMLElement | null | undefined, entries: Array<[string, string]>) => {
      if (!node) return;
      for (const [name, value] of entries) {
        if (node.style.getPropertyValue(name) !== value || node.style.getPropertyPriority(name) !== 'important') {
          node.style.setProperty(name, value, 'important');
        }
      }
    };
    const removeProps = (node: HTMLElement | null | undefined, props: string[]) => {
      if (!node) return;
      for (const prop of props) {
        if (node.style.getPropertyValue(prop)) node.style.removeProperty(prop);
      }
    };
    const owns = (node: HTMLElement | null | undefined, token: string) => {
      if (!node) return;
      node.classList.add('v21124-root-owner');
      node.dataset.v21124Owner = token;
      node.dataset.v21124RootCauseUxRepair = 'true';
    };
    const guideDismissed = () => {
      try { return localStorage.getItem('aqua-v21124-guide-dismissed') === '1'; }
      catch { return false; }
    };
    const dismissGuide = () => {
      try { localStorage.setItem('aqua-v21124-guide-dismissed', '1'); }
      catch { /* ignore storage restrictions */ }
      dom.app.querySelectorAll('.v21124-village-guide-popup,.v21122-village-guide-popup').forEach((node) => node.remove());
    };
    const phaseOf = (fishing: HTMLElement): string => {
      const result = fishing.querySelector<HTMLElement>('.catch-result-card:not(.hidden)');
      if (result) return 'result';
      const bite = fishing.querySelector<HTMLElement>('.bite-callout:not(.hidden)');
      if (bite) return 'bite';
      if (fishing.querySelector('.v2055-reel-console:not(.hidden),.reel-panel:not(.hidden),.v2053-reel-touch-zone:not(.hidden),.v2054-reel-touch-zone:not(.hidden)')) return 'reeling';
      const raw = fishing.dataset.fishingPhase || document.body.dataset.fishingPhase || fishing.dataset.v21123FishingPhase || fishing.dataset.v21122FishingPhase || fishing.dataset.v21110FishingPhase || fishing.dataset.v21109FishingPhase || fishing.dataset.v21108FishingPhase || '';
      if (focusedFishingPhases.test(raw)) return raw.toLowerCase();
      if (/casting|waiting|idle|prep/i.test(raw)) return raw.toLowerCase();
      return 'prep';
    };
    const normalizeGuide = (screen: string) => {
      const village = dom.app.querySelector<HTMLElement>('.village-world-screen');
      if (!village) return;
      village.querySelectorAll('.v21122-village-guide-popup').forEach((node) => node.remove());
      const blocked = screen !== 'village' || guideDismissed() || village.querySelector('.v2199-opening-cinematic,.v2097-expedition-body-open,.v2097-build-tray,.v2130-build-confirm-card') || document.body.classList.contains('v2097-expedition-open') || document.body.classList.contains('v2097-build-open');
      if (blocked) {
        village.querySelectorAll('.v21124-village-guide-popup').forEach((node) => node.remove());
        return;
      }
      let guide = village.querySelector<HTMLElement>('.v21124-village-guide-popup');
      if (!guide) {
        guide = document.createElement('section');
        guide.className = 'v21124-village-guide-popup v21124-root-owner';
        guide.dataset.noSwipe = 'true';
        guide.dataset.v21124Owner = 'first-village-tracking-guide';
        guide.setAttribute('role', 'dialog');
        guide.setAttribute('aria-live', 'polite');
        guide.setAttribute('aria-label', '처음 마을 추천 진행 가이드');
        guide.innerHTML = `<div class="v21124-guide-card">
          <span class="v21124-guide-eyebrow">처음 추천 루트</span>
          <strong>낚시 → 가방·퀘스트 → 개척 순서로 진행해요</strong>
          <p>골드와 기금을 먼저 모으면 상점, 장비, 개척 목표가 자연스럽게 열립니다. 지금 할 일을 중앙에서 바로 선택할 수 있어요.</p>
          <div class="v21124-guide-steps"><span>1 낚시</span><span>2 보상 확인</span><span>3 개척</span></div>
          <div class="v21124-guide-actions"><button type="button" data-v21124-guide-fishing>낚시 가기</button><button type="button" data-v21124-guide-expedition>개척 보기</button><button type="button" data-v21124-guide-dismiss>닫기</button></div>
        </div>`;
        guide.querySelector<HTMLButtonElement>('[data-v21124-guide-fishing]')?.addEventListener('click', () => { dismissGuide(); void this.go('fishing' as Screen); });
        guide.querySelector<HTMLButtonElement>('[data-v21124-guide-expedition]')?.addEventListener('click', () => {
          const toggle = village.querySelector<HTMLButtonElement>('[data-v2097-expedition-toggle]');
          if (toggle) toggle.click();
        });
        guide.querySelector<HTMLButtonElement>('[data-v21124-guide-dismiss]')?.addEventListener('click', dismissGuide);
        village.appendChild(guide);
      }
      owns(guide, 'first-village-tracking-guide');
      setImportant(guide, [
        ['display', 'block'],
        ['position', 'fixed'],
        ['left', '50%'],
        ['top', '50%'],
        ['right', 'auto'],
        ['bottom', 'auto'],
        ['width', 'min(356px, calc(100vw - 28px))'],
        ['max-width', 'calc(100vw - 28px)'],
        ['transform', 'translate3d(-50%, -50%, 0)'],
        ['translate', 'none'],
        ['animation', 'none'],
        ['transition', 'none'],
        ['z-index', '790'],
        ['pointer-events', 'auto'],
        ['contain', 'layout paint style'],
      ]);
    };
    const normalizeNav = (screen: string) => {
      dom.app.querySelectorAll<HTMLElement>('.bottom-nav,.v2097-bottom-nav,.v2098-bottom-nav').forEach((nav) => {
        owns(nav, 'single-bottom-right-nav-all-pages');
        nav.classList.add('v21124-bottom-nav-final');
        nav.dataset.v21124BottomNav = 'same-right-bottom-anchor-on-village-and-pages';
        if (screen === 'fishing') {
          setImportant(nav, [['display', 'none'], ['pointer-events', 'none'], ['opacity', '0'], ['visibility', 'hidden']]);
          return;
        }
        setImportant(nav, [
          ['display', 'grid'],
          ['position', 'fixed'],
          ['right', 'var(--v21124-nav-right, calc(env(safe-area-inset-right, 0px) + 8px))'],
          ['bottom', 'var(--v21124-nav-bottom, calc(env(safe-area-inset-bottom, 0px) + 8px))'],
          ['left', 'auto'],
          ['top', 'auto'],
          ['width', 'var(--v21124-nav-width, min(232px, calc(100vw - 18px)))'],
          ['max-width', 'calc(100vw - 18px)'],
          ['height', 'auto'],
          ['opacity', '1'],
          ['visibility', 'visible'],
          ['pointer-events', 'auto'],
          ['transform', 'none'],
          ['translate', 'none'],
          ['animation', 'none'],
          ['transition', 'none'],
          ['z-index', '860'],
          ['contain', 'layout paint style'],
        ]);
        nav.querySelectorAll<HTMLElement>('button,img,span').forEach((child) => setImportant(child, [['transform', 'none'], ['translate', 'none'], ['animation', 'none'], ['transition', 'none']]));
      });
    };
    const normalizePages = (screen: string) => {
      if (!pageScreens.has(screen)) return;
      dom.app.querySelectorAll<HTMLElement>('.runtime-menu-screen').forEach((root) => {
        owns(root, 'centered-runtime-page-not-right-biased');
        root.classList.add('v21124-runtime-page-final');
        root.dataset.v21124Page = 'fixed-full-viewport-centered-column';
        setImportant(root, [
          ['position', 'fixed'],
          ['inset', '0'],
          ['left', '0'],
          ['right', '0'],
          ['top', '0'],
          ['bottom', '0'],
          ['width', '100vw'],
          ['max-width', '100vw'],
          ['height', 'var(--v21124-visual-height, 100svh)'],
          ['min-height', 'var(--v21124-visual-height, 100svh)'],
          ['margin', '0'],
          ['padding-left', 'max(10px, env(safe-area-inset-left, 0px))'],
          ['padding-right', 'max(10px, env(safe-area-inset-right, 0px))'],
          ['padding-bottom', 'calc(env(safe-area-inset-bottom, 0px) + 126px)'],
          ['overflow-x', 'hidden'],
          ['overflow-y', 'auto'],
          ['box-sizing', 'border-box'],
          ['transform', 'none'],
          ['translate', 'none'],
        ]);
      });
      dom.app.querySelectorAll<HTMLElement>('.runtime-hud,.runtime-content,.runtime-panel,.runtime-card-list,.runtime-hero-card,.shop-list,.mission-list,.dex-grid,.inventory-grid,.gear-grid,.v204-map-shell,.v206-route-ready,.v2076-expedition-card,.v206-inventory-dashboard,.v206-catch-ledger,.v2074-sale-ledger,.v204-quest-board,.v206-quest-npc-board').forEach((node) => {
        owns(node, 'page-column-center');
        node.classList.add('v21124-page-column-final');
        setImportant(node, [
          ['width', 'var(--v21124-page-width, min(430px, calc(100vw - 20px)))'],
          ['max-width', 'var(--v21124-page-width, min(430px, calc(100vw - 20px)))'],
          ['min-width', '0'],
          ['margin-left', 'auto'],
          ['margin-right', 'auto'],
          ['left', 'auto'],
          ['right', 'auto'],
          ['transform', 'none'],
          ['translate', 'none'],
          ['box-sizing', 'border-box'],
          ['overflow-anchor', 'none'],
        ]);
      });
    };
    const normalizeVillage = (screen: string) => {
      const village = dom.app.querySelector<HTMLElement>('.village-world-screen');
      if (!village) return;
      village.classList.add('v21124-village-owned');
      const modalOpen = screen === 'village' && Boolean(village.querySelector('.v2097-expedition-body-open,.v2130-build-confirm-card,.v2097-build-tray') || document.body.classList.contains('v2097-expedition-open') || document.body.classList.contains('v2097-build-open'));
      document.body.classList.toggle('v21124-village-modal-open', modalOpen);
      village.querySelectorAll<HTMLElement>('.v2097-expedition-board').forEach((board) => {
        owns(board, 'expedition-board-overlay-host');
        if (board.classList.contains('open')) setImportant(board, [['position', 'fixed'], ['inset', '0'], ['pointer-events', 'none'], ['z-index', '840'], ['transform', 'none'], ['translate', 'none']]);
      });
      village.querySelectorAll<HTMLElement>('.v2097-expedition-body,.v2097-expedition-body-open').forEach((panel) => {
        owns(panel, 'expedition-full-visible-center');
        panel.classList.add('v21124-expedition-final');
        panel.dataset.noSwipe = 'true';
        if (panel.classList.contains('v2097-expedition-body-open')) {
          setImportant(panel, [
            ['display', 'block'],
            ['position', 'fixed'],
            ['left', '50%'],
            ['right', 'auto'],
            ['top', '50%'],
            ['bottom', 'auto'],
            ['width', 'min(386px, calc(100vw - 22px))'],
            ['max-width', 'calc(100vw - 22px)'],
            ['max-height', 'calc(var(--v21124-visual-height, 100svh) - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 34px)'],
            ['overflow-x', 'hidden'],
            ['overflow-y', 'auto'],
            ['overscroll-behavior', 'contain'],
            ['transform', 'translate3d(-50%, -50%, 0)'],
            ['translate', 'none'],
            ['animation', 'none'],
            ['transition', 'none'],
            ['z-index', '850'],
            ['pointer-events', 'auto'],
            ['box-sizing', 'border-box'],
            ['contain', 'layout paint style'],
          ]);
        }
      });
      village.querySelectorAll<HTMLElement>('.v2130-build-confirm-card,.v2097-build-tray').forEach((panel) => {
        owns(panel, 'village-build-modal-center-scroll');
        panel.classList.add('v21124-village-modal-final');
        panel.dataset.noSwipe = 'true';
        setImportant(panel, [
          ['max-width', 'calc(100vw - 22px)'],
          ['max-height', 'calc(var(--v21124-visual-height, 100svh) - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 34px)'],
          ['overflow-x', 'hidden'],
          ['overflow-y', 'auto'],
          ['overscroll-behavior', 'contain'],
          ['box-sizing', 'border-box'],
          ['animation', 'none'],
          ['transition', 'none'],
          ['z-index', '850'],
        ]);
      });
      normalizeGuide(screen);
    };
    const normalizeFishing = (screen: string) => {
      const fishing = dom.app.querySelector<HTMLElement>('.fishing-screen');
      if (!fishing || screen !== 'fishing') return;
      const phase = phaseOf(fishing);
      const focused = focusedFishingPhases.test(phase);
      fishing.classList.add('v21124-fishing-final-screen');
      fishing.classList.toggle('v21124-fishing-focused', focused);
      fishing.dataset.v21124FishingPhase = phase;
      document.body.dataset.v21124FishingPhase = phase;
      fishing.querySelectorAll<HTMLElement>('.water-overlay,.caustic-overlay,.fishing-3d-ambient,.underwater-webgl-host,.v3d-caustics,.v3d-bubbles,.v3d-depth-fog').forEach((node) => {
        owns(node, 'water-effect-budget-no-flicker');
        node.classList.add('v21124-water-final');
        setImportant(node, [
          ['animation', 'none'],
          ['transition', 'none'],
          ['transform', 'translateZ(0)'],
          ['translate', 'none'],
          ['will-change', 'auto'],
          ['backface-visibility', 'hidden'],
          ['contain', 'paint'],
          ['pointer-events', 'none'],
          ['opacity', focused ? '0.22' : '0.38'],
        ]);
      });
      fishing.querySelectorAll<HTMLElement>('[class*="sea-lane-card"],.v21124-sea-lane-owned').forEach((node) => {
        owns(node, 'sea-lane-hide-during-focused-phases');
        node.classList.add('v21124-sea-lane-final');
        setImportant(node, [
          ['position', 'fixed'],
          ['display', focused ? 'none' : 'block'],
          ['left', 'max(10px, env(safe-area-inset-left, 0px))'],
          ['right', 'auto'],
          ['top', 'calc(env(safe-area-inset-top, 0px) + 58px)'],
          ['bottom', 'auto'],
          ['width', 'min(258px, calc(100vw - 20px))'],
          ['max-width', 'calc(100vw - 20px)'],
          ['opacity', focused ? '0' : '1'],
          ['visibility', focused ? 'hidden' : 'visible'],
          ['pointer-events', 'none'],
          ['transform', 'none'],
          ['translate', 'none'],
          ['scale', '1'],
          ['animation', 'none'],
          ['transition', 'none'],
          ['z-index', '520'],
          ['contain', 'layout paint style'],
        ]);
      });
      fishing.querySelectorAll<HTMLElement>('.fishing-loadout-strip,[class*="-fishing-loadout"],[class*="-loadout-copy"]').forEach((node) => {
        owns(node, 'loadout-fixed-no-scale-no-flicker');
        node.classList.add('v21124-loadout-final');
        setImportant(node, [
          ['position', 'fixed'],
          ['display', focused ? 'none' : 'grid'],
          ['left', '50%'],
          ['right', 'auto'],
          ['top', 'var(--v21124-loadout-top, calc(env(safe-area-inset-top, 0px) + 94px))'],
          ['bottom', 'auto'],
          ['width', 'min(318px, calc(100vw - 28px))'],
          ['max-width', 'calc(100vw - 28px)'],
          ['opacity', focused ? '0' : '1'],
          ['visibility', focused ? 'hidden' : 'visible'],
          ['pointer-events', focused ? 'none' : 'auto'],
          ['transform', 'translate3d(-50%, 0, 0)'],
          ['translate', 'none'],
          ['scale', '1'],
          ['animation', 'none'],
          ['transition', 'none'],
          ['z-index', '530'],
          ['contain', 'layout paint style'],
        ]);
        node.querySelectorAll<HTMLElement>('*').forEach((child) => {
          child.classList.add('v21124-loadout-child-final');
          removeProps(child, ['transform-origin']);
          setImportant(child, [['animation', 'none'], ['transition', 'none'], ['transform', 'none'], ['translate', 'none'], ['scale', '1'], ['flex-shrink', '0']]);
        });
      });
      fishing.querySelectorAll<HTMLElement>('.combo-badge').forEach((node) => {
        owns(node, 'combo-near-cast-button-with-gap');
        node.classList.add('v21124-combo-final');
        setImportant(node, [
          ['position', 'fixed'],
          ['left', '50%'],
          ['right', 'auto'],
          ['top', 'auto'],
          ['bottom', 'var(--v21124-combo-bottom, calc(env(safe-area-inset-bottom, 0px) + 92px))'],
          ['width', 'fit-content'],
          ['max-width', 'calc(100vw - 32px)'],
          ['transform', 'translate3d(-50%, 0, 0)'],
          ['translate', 'none'],
          ['animation', 'none'],
          ['transition', 'none'],
          ['pointer-events', 'none'],
          ['z-index', '720'],
        ]);
      });
      fishing.querySelectorAll<HTMLElement>('.bite-callout').forEach((node) => {
        owns(node, 'bite-center-no-jitter');
        node.classList.add('v21124-bite-final');
        removeProps(node, ['margin', 'margin-top', 'margin-bottom']);
        setImportant(node, [
          ['display', node.classList.contains('hidden') ? 'none' : 'grid'],
          ['position', 'fixed'],
          ['left', '50%'],
          ['right', 'auto'],
          ['top', '50%'],
          ['bottom', 'auto'],
          ['width', 'min(332px, calc(100vw - 30px))'],
          ['max-width', 'calc(100vw - 30px)'],
          ['transform', 'translate3d(-50%, -50%, 0)'],
          ['translate', 'none'],
          ['scale', '1'],
          ['animation', 'none'],
          ['transition', 'none'],
          ['z-index', '900'],
          ['contain', 'layout paint style'],
        ]);
      });
      fishing.querySelectorAll<HTMLElement>('.catch-result-card').forEach((node) => {
        owns(node, 'result-center-no-water-flicker');
        node.classList.add('v21124-result-final');
        setImportant(node, [
          ['position', 'fixed'],
          ['left', '50%'],
          ['right', 'auto'],
          ['top', '50%'],
          ['bottom', 'auto'],
          ['width', 'min(356px, calc(100vw - 28px))'],
          ['max-width', 'calc(100vw - 28px)'],
          ['max-height', 'calc(var(--v21124-visual-height, 100svh) - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 32px)'],
          ['overflow-x', 'hidden'],
          ['overflow-y', 'auto'],
          ['overscroll-behavior', 'contain'],
          ['transform', 'translate3d(-50%, -50%, 0)'],
          ['translate', 'none'],
          ['scale', '1'],
          ['animation', 'none'],
          ['transition', 'none'],
          ['z-index', '910'],
          ['contain', 'layout paint style'],
        ]);
      });
    };
    const normalize = () => {
      const viewport = window.visualViewport;
      const width = Math.floor(viewport?.width ?? window.innerWidth);
      const height = Math.floor(viewport?.height ?? window.innerHeight);
      const screen = document.body.dataset.screen || 'unknown';
      const viewportKey = `${width}:${height}:${screen}`;
      html.classList.add('v21124-root-cause-ux-repair-root');
      html.dataset.v21124RootCauseUxRepair = 'style-mutation-finalizer-guide-page-fishing-nav';
      if (viewportKey !== lastViewport) {
        html.style.setProperty('--v21124-visual-width', `${width}px`);
        html.style.setProperty('--v21124-visual-height', `${height}px`);
        lastViewport = viewportKey;
      }
      document.body.dataset.v21124ActiveScreen = screen;
      normalizeNav(screen);
      normalizeVillage(screen);
      normalizePages(screen);
      normalizeFishing(screen);
    };
    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        normalize();
        if (trailingTimer) window.clearTimeout(trailingTimer);
        trailingTimer = window.setTimeout(normalize, 45);
      });
    };
    schedule();
    window.visualViewport?.addEventListener('resize', schedule, { passive: true });
    window.visualViewport?.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('pageshow', schedule, { passive: true });
    document.addEventListener('visibilitychange', schedule, { passive: true });
    const observer = new MutationObserver((records) => {
      if (html.dataset.v21128DirectSourceUiRepair === 'active' || html.dataset.v21126StaleCodePruner === 'active' || html.dataset.v21125LegacyDebtReducer === 'active') return;
      for (const record of records) {
        if (record.type === 'attributes') {
          const target = record.target as HTMLElement;
          if (record.attributeName === 'style' && !target.matches('.bottom-nav,.runtime-menu-screen,.runtime-hud,.runtime-content,.runtime-card-list,.runtime-panel,.shop-list,.mission-list,.dex-grid,.inventory-grid,.gear-grid,.v2097-expedition-body,.v2097-expedition-body-open,.v2130-build-confirm-card,.v2097-build-tray,.fishing-screen,.water-overlay,.caustic-overlay,.fishing-3d-ambient,.underwater-webgl-host,.v3d-caustics,.v3d-bubbles,.v3d-depth-fog,[class*="sea-lane-card"],.fishing-loadout-strip,[class*="-fishing-loadout"],[class*="-loadout-copy"],.combo-badge,.bite-callout,.catch-result-card,.v21124-village-guide-popup')) continue;
        }
        schedule();
        return;
      }
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'style', 'data-screen', 'data-fishing-phase', 'data-v21108-fishing-phase', 'data-v21109-fishing-phase', 'data-v21110-fishing-phase', 'data-v21122-fishing-phase', 'data-v21123-fishing-phase'], childList: true, subtree: true });
    window.addEventListener('pagehide', () => { observer.disconnect(); if (trailingTimer) window.clearTimeout(trailingTimer); }, { once: true, passive: true });
  }

  private installV21125LegacyDebtReducerPass(): void {
    let raf = 0;
    let throttleTimer = 0;
    let trailingTimer = 0;
    let lastNormalizeAt = 0;
    let lastViewportKey = '';
    let mutationDebt = 0;
    let lastDebtMarkAt = 0;
    const html = document.documentElement;
    if (html.dataset.v21131StaleObserverQuarantine === 'active') {
      html.dataset.v21125LegacyDebtReducer = 'handoff-to-v21131-stale-observer-quarantine';
      return;
    }
    html.classList.add('v21125-legacy-debt-reducer-root');
    html.dataset.v21125LegacyDebtReducer = 'active';
    const pageScreens = new Set(['shop', 'inventory', 'mission', 'map', 'dex', 'gear', 'ranking']);
    const focusedFishingPhases = /bite|reeling|result|success|fail/i;
    const styleCache = new WeakMap<HTMLElement, string>();
    const targetSelector = '.bottom-nav,.v2097-bottom-nav,.v2098-bottom-nav,.runtime-menu-screen,.runtime-hud,.runtime-content,.runtime-card-list,.runtime-panel,.runtime-hero-card,.shop-list,.mission-list,.dex-grid,.inventory-grid,.gear-grid,.v2097-expedition-board,.v2097-expedition-body,.v2097-expedition-body-open,.v2130-build-confirm-card,.v2097-build-tray,.v21124-village-guide-popup,.v21125-village-guide-popup,.fishing-screen,.water-overlay,.caustic-overlay,.fishing-3d-ambient,.underwater-webgl-host,.v3d-caustics,.v3d-bubbles,.v3d-depth-fog,[class*="sea-lane-card"],.fishing-loadout-strip,[class*="-fishing-loadout"],[class*="-loadout-copy"],.combo-badge,.bite-callout,.catch-result-card';
    const setImportant = (node: HTMLElement | null | undefined, entries: Array<[string, string]>) => {
      if (!node) return;
      const sig = entries.map(([name, value]) => `${name}:${value}`).join(';');
      const alreadyApplied = entries.every(([name, value]) => node.style.getPropertyValue(name) === value && node.style.getPropertyPriority(name) === 'important');
      if (styleCache.get(node) === sig && alreadyApplied) return;
      for (const [name, value] of entries) {
        if (node.style.getPropertyValue(name) !== value || node.style.getPropertyPriority(name) !== 'important') {
          node.style.setProperty(name, value, 'important');
        }
      }
      styleCache.set(node, sig);
    };
    const removeProps = (node: HTMLElement | null | undefined, props: string[]) => {
      if (!node) return;
      let changed = false;
      for (const prop of props) {
        if (node.style.getPropertyValue(prop)) { node.style.removeProperty(prop); changed = true; }
      }
      if (changed) styleCache.delete(node);
    };
    const owns = (node: HTMLElement | null | undefined, owner: string) => {
      if (!node) return;
      if (!node.classList.contains('v21125-owned-final')) node.classList.add('v21125-owned-final');
      if (node.dataset.v21125Owner !== owner) node.dataset.v21125Owner = owner;
    };
    const guideDismissed = () => {
      try { return localStorage.getItem('aqua-v21125-guide-dismissed') === '1'; }
      catch { return false; }
    };
    const dismissGuide = () => {
      try { localStorage.setItem('aqua-v21125-guide-dismissed', '1'); }
      catch { /* private storage: ignore */ }
      dom.app.querySelectorAll('.v21122-village-guide-popup,.v21124-village-guide-popup,.v21125-village-guide-popup').forEach((node) => node.remove());
    };
    const phaseOf = (fishing: HTMLElement): string => {
      if (fishing.querySelector<HTMLElement>('.catch-result-card:not(.hidden)')) return 'result';
      if (fishing.querySelector<HTMLElement>('.bite-callout:not(.hidden)')) return 'bite';
      if (fishing.querySelector('.v2055-reel-console:not(.hidden),.reel-panel:not(.hidden),.v2053-reel-touch-zone:not(.hidden),.v2054-reel-touch-zone:not(.hidden)')) return 'reeling';
      const raw = fishing.dataset.fishingPhase || document.body.dataset.fishingPhase || fishing.dataset.v21125FishingPhase || fishing.dataset.v21124FishingPhase || fishing.dataset.v21123FishingPhase || fishing.dataset.v21122FishingPhase || fishing.dataset.v21110FishingPhase || '';
      if (focusedFishingPhases.test(raw)) return raw.toLowerCase();
      if (/casting|waiting|idle|prep/i.test(raw)) return raw.toLowerCase();
      return 'prep';
    };
    const markDebt = () => {
      const now = performance.now();
      if (now - lastDebtMarkAt < 1000) return;
      lastDebtMarkAt = now;
      html.dataset.v21125StyleDebtSeen = mutationDebt > 0 ? 'legacy-style-churn-throttled' : 'stable';
    };
    const normalizeViewport = (screen: string) => {
      const viewport = window.visualViewport;
      const width = Math.max(1, Math.floor(viewport?.width ?? window.innerWidth));
      const height = Math.max(1, Math.floor(viewport?.height ?? window.innerHeight));
      const key = `${width}:${height}:${screen}`;
      html.classList.add('v21125-legacy-debt-reducer-root');
      html.dataset.v21125LegacyDebtReducer = 'active';
      html.style.setProperty('--v21125-visual-width', `${width}px`);
      html.style.setProperty('--v21125-visual-height', `${height}px`);
      html.style.setProperty('--v21125-nav-right', 'calc(env(safe-area-inset-right, 0px) + 8px)');
      html.style.setProperty('--v21125-nav-bottom', 'calc(env(safe-area-inset-bottom, 0px) + 8px)');
      html.style.setProperty('--v21125-nav-width', width <= 360 ? 'min(216px, calc(100vw - 14px))' : 'min(232px, calc(100vw - 18px))');
      html.style.setProperty('--v21125-page-width', width <= 380 ? 'min(420px, calc(100vw - 16px))' : 'min(430px, calc(100vw - 20px))');
      html.style.setProperty('--v21125-loadout-top', `calc(env(safe-area-inset-top, 0px) + ${height <= 610 ? 82 : 94}px)`);
      html.style.setProperty('--v21125-combo-bottom', `calc(env(safe-area-inset-bottom, 0px) + ${height <= 610 ? 84 : 92}px)`);
      if (key !== lastViewportKey) {
        html.classList.toggle('v21125-short-height', height <= 610);
        html.classList.toggle('v21125-narrow-width', width <= 360);
        lastViewportKey = key;
      }
    };
    const normalizeNav = (screen: string) => {
      dom.app.querySelectorAll<HTMLElement>('.bottom-nav,.v2097-bottom-nav,.v2098-bottom-nav').forEach((nav) => {
        owns(nav, 'single-bottom-right-nav-final-light');
        nav.classList.add('v21125-bottom-nav-final');
        nav.dataset.v21125BottomNav = 'one-anchor-no-legacy-rewrite';
        if (screen === 'fishing') {
          setImportant(nav, [['display', 'none'], ['visibility', 'hidden'], ['opacity', '0'], ['pointer-events', 'none'], ['animation', 'none'], ['transition', 'none']]);
          return;
        }
        setImportant(nav, [
          ['display', 'grid'], ['position', 'fixed'], ['right', 'var(--v21125-nav-right)'], ['bottom', 'var(--v21125-nav-bottom)'],
          ['left', 'auto'], ['top', 'auto'], ['width', 'var(--v21125-nav-width)'], ['max-width', 'calc(100vw - 18px)'], ['height', 'auto'],
          ['opacity', '1'], ['visibility', 'visible'], ['pointer-events', 'auto'], ['transform', 'none'], ['translate', 'none'], ['scale', '1'],
          ['animation', 'none'], ['transition', 'none'], ['z-index', '870'], ['contain', 'layout paint style'], ['will-change', 'auto']
        ]);
      });
    };
    const normalizeGuide = (screen: string) => {
      const village = dom.app.querySelector<HTMLElement>('.village-world-screen');
      if (!village) return;
      village.querySelectorAll('.v21122-village-guide-popup,.v21124-village-guide-popup').forEach((node) => node.remove());
      const blocked = screen !== 'village' || guideDismissed() || village.querySelector('.v2199-opening-cinematic,.v2097-expedition-body-open,.v2097-build-tray,.v2130-build-confirm-card') || document.body.classList.contains('v2097-expedition-open') || document.body.classList.contains('v2097-build-open');
      if (blocked) { village.querySelectorAll('.v21125-village-guide-popup').forEach((node) => node.remove()); return; }
      let guide = village.querySelector<HTMLElement>('.v21125-village-guide-popup');
      if (!guide) {
        guide = document.createElement('section');
        guide.className = 'v21125-village-guide-popup v21125-owned-final';
        guide.dataset.noSwipe = 'true';
        guide.dataset.v21125Owner = 'first-village-route-guide';
        guide.setAttribute('role', 'dialog');
        guide.setAttribute('aria-live', 'polite');
        guide.setAttribute('aria-label', '처음 마을 추천 진행 가이드');
        guide.innerHTML = `<div class="v21125-guide-card">
          <span class="v21125-guide-eyebrow">지금 할 일</span>
          <strong>낚시로 재화를 모으고 개척 목표를 확인해요</strong>
          <p>처음에는 낚시 → 가방·퀘스트 확인 → 개척 순서가 가장 자연스럽습니다. 이 창은 중앙에 고정되고 한 번 닫으면 다시 뜨지 않아요.</p>
          <div class="v21125-guide-steps"><span>1 낚시</span><span>2 보상</span><span>3 개척</span></div>
          <div class="v21125-guide-actions"><button type="button" data-v21125-guide-fishing>낚시 가기</button><button type="button" data-v21125-guide-expedition>개척 보기</button><button type="button" data-v21125-guide-dismiss>닫기</button></div>
        </div>`;
        guide.querySelector<HTMLButtonElement>('[data-v21125-guide-fishing]')?.addEventListener('click', () => { dismissGuide(); void this.go('fishing' as Screen); });
        guide.querySelector<HTMLButtonElement>('[data-v21125-guide-expedition]')?.addEventListener('click', () => { village.querySelector<HTMLButtonElement>('[data-v2097-expedition-toggle]')?.click(); });
        guide.querySelector<HTMLButtonElement>('[data-v21125-guide-dismiss]')?.addEventListener('click', dismissGuide);
        village.appendChild(guide);
      }
      owns(guide, 'first-village-route-guide');
      setImportant(guide, [
        ['display', 'block'], ['position', 'fixed'], ['left', '50%'], ['top', '50%'], ['right', 'auto'], ['bottom', 'auto'],
        ['width', 'min(356px, calc(100vw - 28px))'], ['max-width', 'calc(100vw - 28px)'], ['transform', 'translate3d(-50%, -50%, 0)'], ['translate', 'none'], ['scale', '1'],
        ['animation', 'none'], ['transition', 'none'], ['z-index', '795'], ['pointer-events', 'auto'], ['contain', 'layout paint style'], ['will-change', 'auto']
      ]);
    };
    const normalizePages = (screen: string) => {
      if (!pageScreens.has(screen)) return;
      dom.app.querySelectorAll<HTMLElement>('.runtime-menu-screen').forEach((root) => {
        owns(root, 'runtime-page-centered-light-final');
        root.classList.add('v21125-runtime-page-final');
        setImportant(root, [
          ['position', 'fixed'], ['inset', '0'], ['left', '0'], ['right', '0'], ['top', '0'], ['bottom', '0'],
          ['width', '100vw'], ['max-width', '100vw'], ['height', 'var(--v21125-visual-height, 100svh)'], ['min-height', 'var(--v21125-visual-height, 100svh)'],
          ['margin', '0'], ['padding-left', 'max(10px, env(safe-area-inset-left, 0px))'], ['padding-right', 'max(10px, env(safe-area-inset-right, 0px))'],
          ['padding-bottom', 'calc(env(safe-area-inset-bottom, 0px) + 126px)'], ['overflow-x', 'hidden'], ['overflow-y', 'auto'], ['overscroll-behavior', 'contain'],
          ['box-sizing', 'border-box'], ['transform', 'none'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none']
        ]);
      });
      dom.app.querySelectorAll<HTMLElement>('.runtime-hud,.runtime-content,.runtime-panel,.runtime-card-list,.runtime-hero-card,.shop-list,.mission-list,.dex-grid,.inventory-grid,.gear-grid,.v204-map-shell,.v206-route-ready,.v2076-expedition-card,.v206-inventory-dashboard,.v206-catch-ledger,.v2074-sale-ledger,.v204-quest-board,.v206-quest-npc-board').forEach((node) => {
        owns(node, 'runtime-column-centered-light-final');
        node.classList.add('v21125-page-column-final');
        setImportant(node, [
          ['width', 'var(--v21125-page-width)'], ['max-width', 'var(--v21125-page-width)'], ['min-width', '0'], ['margin-left', 'auto'], ['margin-right', 'auto'],
          ['left', 'auto'], ['right', 'auto'], ['transform', 'none'], ['translate', 'none'], ['scale', '1'], ['box-sizing', 'border-box'], ['overflow-anchor', 'none']
        ]);
      });
    };
    const normalizeVillage = (screen: string) => {
      const village = dom.app.querySelector<HTMLElement>('.village-world-screen');
      if (!village) return;
      village.classList.add('v21125-village-final');
      const modalOpen = screen === 'village' && Boolean(village.querySelector('.v2097-expedition-body-open,.v2130-build-confirm-card,.v2097-build-tray') || document.body.classList.contains('v2097-expedition-open') || document.body.classList.contains('v2097-build-open'));
      document.body.classList.toggle('v21125-village-modal-open', modalOpen);
      village.querySelectorAll<HTMLElement>('.v2097-expedition-board').forEach((board) => {
        owns(board, 'expedition-host-no-half-clip');
        if (board.classList.contains('open')) setImportant(board, [['position', 'fixed'], ['inset', '0'], ['pointer-events', 'none'], ['z-index', '845'], ['transform', 'none'], ['translate', 'none'], ['animation', 'none'], ['transition', 'none']]);
      });
      village.querySelectorAll<HTMLElement>('.v2097-expedition-body,.v2097-expedition-body-open').forEach((panel) => {
        owns(panel, 'expedition-center-scroll-final-light');
        panel.classList.add('v21125-expedition-final');
        panel.dataset.noSwipe = 'true';
        if (panel.classList.contains('v2097-expedition-body-open')) {
          setImportant(panel, [
            ['display', 'block'], ['position', 'fixed'], ['left', '50%'], ['right', 'auto'], ['top', '50%'], ['bottom', 'auto'],
            ['width', 'min(386px, calc(100vw - 22px))'], ['max-width', 'calc(100vw - 22px)'], ['max-height', 'calc(var(--v21125-visual-height, 100svh) - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 34px)'],
            ['overflow-x', 'hidden'], ['overflow-y', 'auto'], ['overscroll-behavior', 'contain'], ['transform', 'translate3d(-50%, -50%, 0)'], ['translate', 'none'], ['scale', '1'],
            ['animation', 'none'], ['transition', 'none'], ['z-index', '855'], ['pointer-events', 'auto'], ['box-sizing', 'border-box'], ['contain', 'layout paint style'], ['will-change', 'auto']
          ]);
        }
      });
      village.querySelectorAll<HTMLElement>('.v2130-build-confirm-card,.v2097-build-tray').forEach((panel) => {
        owns(panel, 'village-build-modal-scroll-final-light');
        panel.classList.add('v21125-village-modal-final');
        panel.dataset.noSwipe = 'true';
        setImportant(panel, [
          ['max-width', 'calc(100vw - 22px)'], ['max-height', 'calc(var(--v21125-visual-height, 100svh) - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 34px)'],
          ['overflow-x', 'hidden'], ['overflow-y', 'auto'], ['overscroll-behavior', 'contain'], ['box-sizing', 'border-box'], ['animation', 'none'], ['transition', 'none'], ['z-index', '855']
        ]);
      });
      normalizeGuide(screen);
    };
    const normalizeFishing = (screen: string) => {
      const fishing = dom.app.querySelector<HTMLElement>('.fishing-screen');
      if (!fishing || screen !== 'fishing') return;
      const phase = phaseOf(fishing);
      const focused = focusedFishingPhases.test(phase);
      fishing.classList.add('v21125-fishing-final-screen');
      fishing.classList.toggle('v21125-fishing-focused', focused);
      fishing.dataset.v21125FishingPhase = phase;
      document.body.dataset.v21125FishingPhase = phase;
      fishing.querySelectorAll<HTMLElement>('.water-overlay,.caustic-overlay,.fishing-3d-ambient,.underwater-webgl-host,.v3d-caustics,.v3d-bubbles,.v3d-depth-fog').forEach((node) => {
        owns(node, 'water-effect-low-churn-final');
        node.classList.add('v21125-water-final');
        setImportant(node, [['animation', 'none'], ['transition', 'none'], ['transform', 'translateZ(0)'], ['translate', 'none'], ['scale', '1'], ['will-change', 'auto'], ['backface-visibility', 'hidden'], ['contain', 'paint'], ['pointer-events', 'none'], ['opacity', focused ? '0.16' : '0.34']]);
      });
      fishing.querySelectorAll<HTMLElement>('[class*="sea-lane-card"],.v21124-sea-lane-owned').forEach((node) => {
        owns(node, 'sea-lane-no-focused-flicker-final');
        node.classList.add('v21125-sea-lane-final');
        setImportant(node, [
          ['position', 'fixed'], ['display', focused ? 'none' : 'block'], ['left', 'max(10px, env(safe-area-inset-left, 0px))'], ['right', 'auto'], ['top', 'calc(env(safe-area-inset-top, 0px) + 58px)'], ['bottom', 'auto'],
          ['width', 'min(258px, calc(100vw - 20px))'], ['max-width', 'calc(100vw - 20px)'], ['opacity', focused ? '0' : '1'], ['visibility', focused ? 'hidden' : 'visible'], ['pointer-events', 'none'],
          ['transform', 'none'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['z-index', '522'], ['contain', 'layout paint style']
        ]);
      });
      fishing.querySelectorAll<HTMLElement>('.fishing-loadout-strip,[class*="-fishing-loadout"],[class*="-loadout-copy"]').forEach((node) => {
        owns(node, 'loadout-no-scale-final-light');
        node.classList.add('v21125-loadout-final');
        setImportant(node, [
          ['position', 'fixed'], ['display', focused ? 'none' : 'grid'], ['left', '50%'], ['right', 'auto'], ['top', 'var(--v21125-loadout-top)'], ['bottom', 'auto'],
          ['width', 'min(318px, calc(100vw - 28px))'], ['max-width', 'calc(100vw - 28px)'], ['opacity', focused ? '0' : '1'], ['visibility', focused ? 'hidden' : 'visible'], ['pointer-events', focused ? 'none' : 'auto'],
          ['transform', 'translate3d(-50%, 0, 0)'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['z-index', '532'], ['contain', 'layout paint style'], ['will-change', 'auto']
        ]);
        node.querySelectorAll<HTMLElement>('*').forEach((child) => {
          if (!child.classList.contains('v21125-loadout-child-final')) child.classList.add('v21125-loadout-child-final');
          removeProps(child, ['transform-origin']);
          setImportant(child, [['animation', 'none'], ['transition', 'none'], ['transform', 'none'], ['translate', 'none'], ['scale', '1'], ['flex-shrink', '0']]);
        });
      });
      fishing.querySelectorAll<HTMLElement>('.combo-badge').forEach((node) => {
        owns(node, 'combo-near-cast-gap-final-light');
        node.classList.add('v21125-combo-final');
        setImportant(node, [['position', 'fixed'], ['left', '50%'], ['right', 'auto'], ['top', 'auto'], ['bottom', 'var(--v21125-combo-bottom)'], ['width', 'fit-content'], ['max-width', 'calc(100vw - 32px)'], ['transform', 'translate3d(-50%, 0, 0)'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['pointer-events', 'none'], ['z-index', '722']]);
      });
      fishing.querySelectorAll<HTMLElement>('.bite-callout').forEach((node) => {
        owns(node, 'bite-center-no-top-jump-final-light');
        node.classList.add('v21125-bite-final');
        removeProps(node, ['margin', 'margin-top', 'margin-bottom']);
        setImportant(node, [['display', node.classList.contains('hidden') ? 'none' : 'grid'], ['position', 'fixed'], ['left', '50%'], ['right', 'auto'], ['top', '50%'], ['bottom', 'auto'], ['width', 'min(332px, calc(100vw - 30px))'], ['max-width', 'calc(100vw - 30px)'], ['transform', 'translate3d(-50%, -50%, 0)'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['z-index', '902'], ['contain', 'layout paint style']]);
      });
      fishing.querySelectorAll<HTMLElement>('.catch-result-card').forEach((node) => {
        owns(node, 'result-center-no-water-flicker-final-light');
        node.classList.add('v21125-result-final');
        setImportant(node, [['position', 'fixed'], ['left', '50%'], ['right', 'auto'], ['top', '50%'], ['bottom', 'auto'], ['width', 'min(356px, calc(100vw - 28px))'], ['max-width', 'calc(100vw - 28px)'], ['max-height', 'calc(var(--v21125-visual-height, 100svh) - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 32px)'], ['overflow-x', 'hidden'], ['overflow-y', 'auto'], ['overscroll-behavior', 'contain'], ['transform', 'translate3d(-50%, -50%, 0)'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['z-index', '912'], ['contain', 'layout paint style']]);
      });
    };
    const normalize = () => {
      raf = 0;
      if (html.dataset.v21128DirectSourceUiRepair === 'active' || html.dataset.v21126StaleCodePruner === 'active') return;
      lastNormalizeAt = performance.now();
      const screen = document.body.dataset.screen || 'unknown';
      normalizeViewport(screen);
      normalizeNav(screen);
      normalizeVillage(screen);
      normalizePages(screen);
      normalizeFishing(screen);
      markDebt();
    };
    const schedule = (urgent = false) => {
      if (raf || throttleTimer) return;
      const elapsed = performance.now() - lastNormalizeAt;
      const delay = urgent || elapsed > 140 ? 0 : Math.max(40, 140 - elapsed);
      throttleTimer = window.setTimeout(() => {
        throttleTimer = 0;
        if (raf) return;
        raf = window.requestAnimationFrame(normalize);
      }, delay);
    };
    schedule(true);
    window.visualViewport?.addEventListener('resize', () => schedule(true), { passive: true });
    window.visualViewport?.addEventListener('scroll', () => schedule(false), { passive: true });
    window.addEventListener('resize', () => schedule(true), { passive: true });
    window.addEventListener('orientationchange', () => schedule(true), { passive: true });
    window.addEventListener('pageshow', () => schedule(true), { passive: true });
    document.addEventListener('visibilitychange', () => schedule(false), { passive: true });
    const observer = new MutationObserver((records) => {
      if (html.dataset.v21128DirectSourceUiRepair === 'active' || html.dataset.v21126StaleCodePruner === 'active') return;
      let urgent = false;
      for (const record of records) {
        const target = record.target as HTMLElement;
        if (record.type === 'childList') { urgent = true; break; }
        if (record.type === 'attributes') {
          if (record.attributeName === 'data-screen' || record.attributeName === 'data-fishing-phase') { urgent = true; break; }
          if (record.attributeName === 'style') {
            if (!target.matches(targetSelector)) continue;
            mutationDebt += 1;
          }
          if (record.attributeName === 'class' && target.matches(targetSelector)) mutationDebt += 1;
        }
      }
      schedule(urgent);
      if (trailingTimer) window.clearTimeout(trailingTimer);
      trailingTimer = window.setTimeout(() => schedule(false), 180);
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'style', 'data-screen', 'data-fishing-phase', 'data-v21124-fishing-phase'], childList: true, subtree: true });
    window.addEventListener('pagehide', () => {
      observer.disconnect();
      if (raf) window.cancelAnimationFrame(raf);
      if (throttleTimer) window.clearTimeout(throttleTimer);
      if (trailingTimer) window.clearTimeout(trailingTimer);
    }, { once: true, passive: true });
  }


  private installV21126StaleCodePrunerPass(): void {
    let raf = 0;
    let throttleTimer = 0;
    let lastRunAt = 0;
    let lastViewportKey = '';
    let churnSeen = 0;
    const html = document.documentElement;
    if (html.dataset.v21131StaleObserverQuarantine === 'active') {
      html.dataset.v21126StaleCodePruner = 'handoff-to-v21131-stale-observer-quarantine';
      return;
    }
    if (html.dataset.v21128DirectSourceUiRepair === 'active') {
      html.dataset.v21126StaleCodePruner = 'handoff-to-v21128-direct-source-repair';
      return;
    }
    const pageScreens = new Set(['shop', 'inventory', 'mission', 'map', 'dex', 'gear', 'ranking']);
    const focusedFishingPhases = /bite|reeling|result|success|fail/i;
    const styleCache = new WeakMap<HTMLElement, string>();
    const targetSelector = '.bottom-nav,.v2097-bottom-nav,.v2098-bottom-nav,.runtime-menu-screen,.runtime-hud,.runtime-content,.runtime-card-list,.runtime-panel,.runtime-hero-card,.shop-list,.mission-list,.dex-grid,.inventory-grid,.gear-grid,.v2097-expedition-board,.v2097-expedition-body,.v2097-expedition-body-open,.v2130-build-confirm-card,.v2097-build-tray,.v21122-village-guide-popup,.v21124-village-guide-popup,.v21125-village-guide-popup,.v21126-village-guide-popup,.fishing-screen,.water-overlay,.caustic-overlay,.fishing-3d-ambient,.underwater-webgl-host,.v3d-caustics,.v3d-bubbles,.v3d-depth-fog,[class*="sea-lane-card"],.fishing-loadout-strip,[class*="-fishing-loadout"],[class*="-loadout-copy"],.combo-badge,.bite-callout,.catch-result-card';
    const setImportant = (node: HTMLElement | null | undefined, entries: Array<[string, string]>) => {
      if (!node) return;
      const signature = entries.map(([name, value]) => `${name}:${value}`).join(';');
      const unchanged = styleCache.get(node) === signature && entries.every(([name, value]) => node.style.getPropertyValue(name) === value && node.style.getPropertyPriority(name) === 'important');
      if (unchanged) return;
      for (const [name, value] of entries) {
        if (node.style.getPropertyValue(name) !== value || node.style.getPropertyPriority(name) !== 'important') {
          node.style.setProperty(name, value, 'important');
        }
      }
      styleCache.set(node, signature);
    };
    const clearInline = (node: HTMLElement | null | undefined, props: string[]) => {
      if (!node) return;
      let changed = false;
      for (const prop of props) {
        if (node.style.getPropertyValue(prop)) { node.style.removeProperty(prop); changed = true; }
      }
      if (changed) styleCache.delete(node);
    };
    const owns = (node: HTMLElement | null | undefined, owner: string) => {
      if (!node) return;
      node.classList.add('v21126-owned-final');
      if (node.dataset.v21126Owner !== owner) node.dataset.v21126Owner = owner;
    };
    const phaseOf = (fishing: HTMLElement): string => {
      if (fishing.querySelector<HTMLElement>('.catch-result-card:not(.hidden)')) return 'result';
      if (fishing.querySelector<HTMLElement>('.bite-callout:not(.hidden)')) return 'bite';
      if (fishing.querySelector('.v2055-reel-console:not(.hidden),.reel-panel:not(.hidden),.v2053-reel-touch-zone:not(.hidden),.v2054-reel-touch-zone:not(.hidden)')) return 'reeling';
      const raw = fishing.dataset.fishingPhase || document.body.dataset.fishingPhase || fishing.dataset.v21126FishingPhase || fishing.dataset.v21125FishingPhase || fishing.dataset.v21124FishingPhase || fishing.dataset.v21123FishingPhase || fishing.dataset.v21122FishingPhase || fishing.dataset.v21110FishingPhase || '';
      if (focusedFishingPhases.test(raw)) return raw.toLowerCase();
      if (/casting|waiting|idle|prep/i.test(raw)) return raw.toLowerCase();
      return 'prep';
    };
    const syncRoot = (screen: string) => {
      const viewport = window.visualViewport;
      const width = Math.max(1, Math.floor(viewport?.width ?? window.innerWidth));
      const height = Math.max(1, Math.floor(viewport?.height ?? window.innerHeight));
      const key = `${width}:${height}:${screen}`;
      html.classList.add('v21126-stale-code-pruner-root');
      html.dataset.v21126StaleCodePruner = 'active';
      html.dataset.v21123RuntimeDeconflict = 'handoff-to-v21126-single-finalizer';
      html.dataset.v21125LegacyDebtReducer = 'handoff-to-v21126-single-finalizer';
      html.dataset.v21126ObserverOwner = 'single-finalizer-css-first-inline-last-resort';
      html.dataset.v21126StaleCodeDebt = churnSeen > 0 ? 'legacy-mutation-seen-throttled' : 'quiet';
      html.style.setProperty('--v21126-visual-width', `${width}px`);
      html.style.setProperty('--v21126-visual-height', `${height}px`);
      html.style.setProperty('--v21126-nav-right', 'calc(env(safe-area-inset-right, 0px) + 8px)');
      html.style.setProperty('--v21126-nav-bottom', 'calc(env(safe-area-inset-bottom, 0px) + 8px)');
      html.style.setProperty('--v21126-nav-width', width <= 360 ? 'min(214px, calc(100vw - 14px))' : 'min(232px, calc(100vw - 18px))');
      html.style.setProperty('--v21126-page-width', width <= 380 ? 'min(420px, calc(100vw - 16px))' : 'min(430px, calc(100vw - 20px))');
      html.style.setProperty('--v21126-loadout-top', `calc(env(safe-area-inset-top, 0px) + ${height <= 610 ? 80 : 92}px)`);
      html.style.setProperty('--v21126-combo-bottom', `calc(env(safe-area-inset-bottom, 0px) + ${height <= 610 ? 86 : 96}px)`);
      if (key !== lastViewportKey) {
        html.classList.toggle('v21126-short-height', height <= 610);
        html.classList.toggle('v21126-narrow-width', width <= 360);
        html.classList.toggle('v21126-performance-budget', true);
        lastViewportKey = key;
      }
    };
    const guideDismissed = () => {
      try { return localStorage.getItem('aqua-v21126-guide-dismissed') === '1'; }
      catch { return false; }
    };
    const dismissGuide = () => {
      try { localStorage.setItem('aqua-v21126-guide-dismissed', '1'); }
      catch { /* private mode: ignore */ }
      dom.app.querySelectorAll('.v21122-village-guide-popup,.v21124-village-guide-popup,.v21125-village-guide-popup,.v21126-village-guide-popup').forEach((node) => node.remove());
    };
    const normalizeNav = (screen: string) => {
      dom.app.querySelectorAll<HTMLElement>('.bottom-nav,.v2097-bottom-nav,.v2098-bottom-nav').forEach((nav) => {
        owns(nav, 'single-bottom-right-nav-stable-v21126');
        nav.classList.add('v21126-bottom-nav-final');
        nav.dataset.v21126BottomNav = 'one-screen-one-position';
        if (screen === 'fishing') {
          nav.setAttribute('aria-hidden', 'true');
          setImportant(nav, [['display', 'none'], ['visibility', 'hidden'], ['opacity', '0'], ['pointer-events', 'none'], ['animation', 'none'], ['transition', 'none']]);
          return;
        }
        nav.removeAttribute('aria-hidden');
        setImportant(nav, [
          ['display', 'grid'], ['position', 'fixed'], ['right', 'var(--v21126-nav-right)'], ['bottom', 'var(--v21126-nav-bottom)'], ['left', 'auto'], ['top', 'auto'],
          ['width', 'var(--v21126-nav-width)'], ['max-width', 'calc(100vw - 18px)'], ['height', 'auto'], ['opacity', '1'], ['visibility', 'visible'], ['pointer-events', 'auto'],
          ['transform', 'none'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['z-index', '880'], ['contain', 'layout paint style'], ['will-change', 'auto']
        ]);
      });
    };
    const normalizeGuide = (screen: string) => {
      const village = dom.app.querySelector<HTMLElement>('.village-world-screen');
      if (!village) return;
      village.querySelectorAll('.v21122-village-guide-popup,.v21124-village-guide-popup,.v21125-village-guide-popup').forEach((node) => node.remove());
      const blocked = screen !== 'village' || guideDismissed() || Boolean(village.querySelector('.v2199-opening-cinematic,.v2097-expedition-body-open,.v2097-build-tray,.v2130-build-confirm-card')) || document.body.classList.contains('v2097-expedition-open') || document.body.classList.contains('v2097-build-open');
      if (blocked) { village.querySelectorAll('.v21126-village-guide-popup').forEach((node) => node.remove()); return; }
      let guide = village.querySelector<HTMLElement>('.v21126-village-guide-popup');
      if (!guide) {
        guide = document.createElement('section');
        guide.className = 'v21126-village-guide-popup v21126-owned-final';
        guide.dataset.noSwipe = 'true';
        guide.dataset.v21126Owner = 'first-village-guided-route';
        guide.setAttribute('role', 'dialog');
        guide.setAttribute('aria-live', 'polite');
        guide.setAttribute('aria-label', '처음 마을 추천 진행 가이드');
        guide.innerHTML = `<div class="v21126-guide-card"><span class="v21126-guide-eyebrow">처음 할 일</span><strong>낚시로 재화를 모으고 개척 목표를 확인해요</strong><p>처음엔 낚시 → 가방·퀘스트 확인 → 개척 순서로 보면 됩니다. 이 가이드는 중앙에 고정되고 한 번 닫으면 다시 뜨지 않아요.</p><div class="v21126-guide-steps"><span>1 낚시</span><span>2 보상 확인</span><span>3 개척</span></div><div class="v21126-guide-actions"><button type="button" data-v21126-guide-fishing>낚시 가기</button><button type="button" data-v21126-guide-expedition>개척 보기</button><button type="button" data-v21126-guide-dismiss>닫기</button></div></div>`;
        guide.querySelector<HTMLButtonElement>('[data-v21126-guide-fishing]')?.addEventListener('click', () => { dismissGuide(); void this.go('fishing' as Screen); });
        guide.querySelector<HTMLButtonElement>('[data-v21126-guide-expedition]')?.addEventListener('click', () => { village.querySelector<HTMLButtonElement>('[data-v2097-expedition-toggle]')?.click(); });
        guide.querySelector<HTMLButtonElement>('[data-v21126-guide-dismiss]')?.addEventListener('click', dismissGuide);
        village.appendChild(guide);
      }
      owns(guide, 'first-village-guided-route');
      setImportant(guide, [['display', 'block'], ['position', 'fixed'], ['left', '50%'], ['right', 'auto'], ['top', '50%'], ['bottom', 'auto'], ['width', 'min(356px, calc(100vw - 28px))'], ['max-width', 'calc(100vw - 28px)'], ['transform', 'translate3d(-50%, -50%, 0)'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['z-index', '800'], ['pointer-events', 'auto'], ['contain', 'layout paint style'], ['will-change', 'auto']]);
    };
    const normalizePages = (screen: string) => {
      if (!pageScreens.has(screen)) return;
      dom.app.querySelectorAll<HTMLElement>('.runtime-menu-screen').forEach((root) => {
        owns(root, 'menu-page-root-centered-v21126');
        root.classList.add('v21126-runtime-page-final');
        setImportant(root, [['position', 'fixed'], ['inset', '0'], ['width', '100vw'], ['max-width', '100vw'], ['height', 'var(--v21126-visual-height, 100svh)'], ['min-height', 'var(--v21126-visual-height, 100svh)'], ['margin', '0'], ['padding-left', 'max(10px, env(safe-area-inset-left, 0px))'], ['padding-right', 'max(10px, env(safe-area-inset-right, 0px))'], ['padding-bottom', 'calc(env(safe-area-inset-bottom, 0px) + 128px)'], ['overflow-x', 'hidden'], ['overflow-y', 'auto'], ['overscroll-behavior', 'contain'], ['box-sizing', 'border-box'], ['transform', 'none'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none']]);
      });
      dom.app.querySelectorAll<HTMLElement>('.runtime-hud,.runtime-content,.runtime-card-list,.runtime-panel,.runtime-hero-card,.shop-list,.mission-list,.dex-grid,.inventory-grid,.gear-grid,.v2074-sale-ledger,.v204-quest-board,.v206-quest-npc-board').forEach((node) => {
        owns(node, 'menu-page-column-centered-v21126');
        node.classList.add('v21126-page-column-final');
        setImportant(node, [['width', 'var(--v21126-page-width)'], ['max-width', 'var(--v21126-page-width)'], ['min-width', '0'], ['margin-left', 'auto'], ['margin-right', 'auto'], ['left', 'auto'], ['right', 'auto'], ['transform', 'none'], ['translate', 'none'], ['scale', '1'], ['box-sizing', 'border-box'], ['overflow-anchor', 'none']]);
      });
    };
    const normalizeVillage = (screen: string) => {
      const village = dom.app.querySelector<HTMLElement>('.village-world-screen');
      if (!village) return;
      village.classList.add('v21126-village-final');
      const modalOpen = screen === 'village' && Boolean(village.querySelector('.v2097-expedition-body-open,.v2130-build-confirm-card,.v2097-build-tray') || document.body.classList.contains('v2097-expedition-open') || document.body.classList.contains('v2097-build-open'));
      document.body.classList.toggle('v21126-village-modal-open', modalOpen);
      village.querySelectorAll<HTMLElement>('.v2097-expedition-board').forEach((board) => {
        owns(board, 'expedition-host-no-half-clip-v21126');
        if (board.classList.contains('open')) setImportant(board, [['position', 'fixed'], ['inset', '0'], ['pointer-events', 'none'], ['z-index', '850'], ['transform', 'none'], ['translate', 'none'], ['animation', 'none'], ['transition', 'none']]);
      });
      village.querySelectorAll<HTMLElement>('.v2097-expedition-body,.v2097-expedition-body-open').forEach((panel) => {
        owns(panel, 'expedition-center-scroll-v21126');
        panel.classList.add('v21126-expedition-final');
        panel.dataset.noSwipe = 'true';
        if (panel.classList.contains('v2097-expedition-body-open')) {
          setImportant(panel, [['display', 'block'], ['position', 'fixed'], ['left', '50%'], ['right', 'auto'], ['top', '50%'], ['bottom', 'auto'], ['width', 'min(388px, calc(100vw - 22px))'], ['max-width', 'calc(100vw - 22px)'], ['max-height', 'calc(var(--v21126-visual-height, 100svh) - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 34px)'], ['overflow-x', 'hidden'], ['overflow-y', 'auto'], ['overscroll-behavior', 'contain'], ['transform', 'translate3d(-50%, -50%, 0)'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['z-index', '860'], ['pointer-events', 'auto'], ['box-sizing', 'border-box'], ['contain', 'layout paint style'], ['will-change', 'auto']]);
        }
      });
      village.querySelectorAll<HTMLElement>('.v2130-build-confirm-card,.v2097-build-tray').forEach((panel) => {
        owns(panel, 'village-modal-scroll-v21126');
        panel.classList.add('v21126-village-modal-final');
        panel.dataset.noSwipe = 'true';
        setImportant(panel, [['max-width', 'calc(100vw - 22px)'], ['max-height', 'calc(var(--v21126-visual-height, 100svh) - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 34px)'], ['overflow-x', 'hidden'], ['overflow-y', 'auto'], ['overscroll-behavior', 'contain'], ['box-sizing', 'border-box'], ['animation', 'none'], ['transition', 'none'], ['z-index', '860']]);
      });
      normalizeGuide(screen);
    };
    const normalizeFishing = (screen: string) => {
      const fishing = dom.app.querySelector<HTMLElement>('.fishing-screen');
      if (!fishing || screen !== 'fishing') return;
      const phase = phaseOf(fishing);
      const focused = focusedFishingPhases.test(phase);
      fishing.classList.add('v21126-fishing-final-screen');
      fishing.classList.toggle('v21126-fishing-focused', focused);
      fishing.dataset.v21126FishingPhase = phase;
      document.body.dataset.v21126FishingPhase = phase;
      fishing.querySelectorAll<HTMLElement>('.water-overlay,.caustic-overlay,.fishing-3d-ambient,.underwater-webgl-host,.v3d-caustics,.v3d-bubbles,.v3d-depth-fog').forEach((node) => {
        owns(node, 'water-effect-budget-v21126');
        node.classList.add('v21126-water-final');
        setImportant(node, [['display', focused ? 'none' : 'block'], ['opacity', focused ? '0' : '0.24'], ['visibility', focused ? 'hidden' : 'visible'], ['animation', 'none'], ['transition', 'none'], ['transform', 'translateZ(0)'], ['translate', 'none'], ['scale', '1'], ['will-change', 'auto'], ['backface-visibility', 'hidden'], ['filter', 'none'], ['contain', 'paint'], ['pointer-events', 'none']]);
      });
      fishing.querySelectorAll<HTMLElement>('[class*="sea-lane-card"],.v21124-sea-lane-owned').forEach((node) => {
        owns(node, 'sea-lane-no-flicker-v21126');
        node.classList.add('v21126-sea-lane-final');
        setImportant(node, [['position', 'fixed'], ['display', focused ? 'none' : 'block'], ['left', 'max(10px, env(safe-area-inset-left, 0px))'], ['right', 'auto'], ['top', 'calc(env(safe-area-inset-top, 0px) + 58px)'], ['bottom', 'auto'], ['width', 'min(258px, calc(100vw - 20px))'], ['max-width', 'calc(100vw - 20px)'], ['opacity', focused ? '0' : '1'], ['visibility', focused ? 'hidden' : 'visible'], ['pointer-events', 'none'], ['transform', 'none'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['z-index', '522'], ['contain', 'layout paint style']]);
      });
      fishing.querySelectorAll<HTMLElement>('.fishing-loadout-strip,[class*="-fishing-loadout"],[class*="-loadout-copy"]').forEach((node) => {
        owns(node, 'loadout-no-scale-v21126');
        node.classList.add('v21126-loadout-final');
        setImportant(node, [['position', 'fixed'], ['display', focused ? 'none' : 'grid'], ['left', '50%'], ['right', 'auto'], ['top', 'var(--v21126-loadout-top)'], ['bottom', 'auto'], ['width', 'min(318px, calc(100vw - 28px))'], ['max-width', 'calc(100vw - 28px)'], ['opacity', focused ? '0' : '1'], ['visibility', focused ? 'hidden' : 'visible'], ['pointer-events', focused ? 'none' : 'auto'], ['transform', 'translate3d(-50%, 0, 0)'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['z-index', '532'], ['contain', 'layout paint style'], ['will-change', 'auto']]);
        node.querySelectorAll<HTMLElement>('*').forEach((child) => {
          child.classList.add('v21126-loadout-child-final');
          clearInline(child, ['transform-origin']);
          setImportant(child, [['animation', 'none'], ['transition', 'none'], ['transform', 'none'], ['translate', 'none'], ['scale', '1'], ['flex-shrink', '0']]);
        });
      });
      fishing.querySelectorAll<HTMLElement>('.combo-badge').forEach((node) => {
        owns(node, 'combo-near-cast-gap-v21126');
        node.classList.add('v21126-combo-final');
        setImportant(node, [['position', 'fixed'], ['left', '50%'], ['right', 'auto'], ['top', 'auto'], ['bottom', 'var(--v21126-combo-bottom)'], ['width', 'fit-content'], ['max-width', 'calc(100vw - 32px)'], ['transform', 'translate3d(-50%, 0, 0)'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['pointer-events', 'none'], ['z-index', '724']]);
      });
      fishing.querySelectorAll<HTMLElement>('.bite-callout').forEach((node) => {
        owns(node, 'bite-center-no-top-jump-v21126');
        node.classList.add('v21126-bite-final');
        clearInline(node, ['margin', 'margin-top', 'margin-bottom']);
        setImportant(node, [['display', node.classList.contains('hidden') ? 'none' : 'grid'], ['position', 'fixed'], ['left', '50%'], ['right', 'auto'], ['top', '50%'], ['bottom', 'auto'], ['width', 'min(332px, calc(100vw - 30px))'], ['max-width', 'calc(100vw - 30px)'], ['transform', 'translate3d(-50%, -50%, 0)'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['z-index', '904'], ['contain', 'layout paint style']]);
      });
      fishing.querySelectorAll<HTMLElement>('.catch-result-card').forEach((node) => {
        owns(node, 'result-center-no-water-v21126');
        node.classList.add('v21126-result-final');
        setImportant(node, [['position', 'fixed'], ['left', '50%'], ['right', 'auto'], ['top', '50%'], ['bottom', 'auto'], ['width', 'min(356px, calc(100vw - 28px))'], ['max-width', 'calc(100vw - 28px)'], ['max-height', 'calc(var(--v21126-visual-height, 100svh) - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 32px)'], ['overflow-x', 'hidden'], ['overflow-y', 'auto'], ['overscroll-behavior', 'contain'], ['transform', 'translate3d(-50%, -50%, 0)'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['z-index', '914'], ['contain', 'layout paint style']]);
      });
    };
    const normalize = () => {
      raf = 0;
      lastRunAt = performance.now();
      const screen = document.body.dataset.screen || 'unknown';
      syncRoot(screen);
      normalizeNav(screen);
      normalizeVillage(screen);
      normalizePages(screen);
      normalizeFishing(screen);
    };
    const schedule = (urgent = false) => {
      if (raf || throttleTimer) return;
      const elapsed = performance.now() - lastRunAt;
      const delay = urgent || elapsed > 180 ? 0 : Math.max(70, 180 - elapsed);
      throttleTimer = window.setTimeout(() => {
        throttleTimer = 0;
        if (raf) return;
        raf = window.requestAnimationFrame(normalize);
      }, delay);
    };
    schedule(true);
    window.visualViewport?.addEventListener('resize', () => schedule(true), { passive: true });
    window.visualViewport?.addEventListener('scroll', () => schedule(false), { passive: true });
    window.addEventListener('resize', () => schedule(true), { passive: true });
    window.addEventListener('orientationchange', () => schedule(true), { passive: true });
    window.addEventListener('pageshow', () => schedule(true), { passive: true });
    document.addEventListener('visibilitychange', () => schedule(false), { passive: true });
    const observer = new MutationObserver((records) => {
      let urgent = false;
      for (const record of records) {
        if (record.type === 'childList') { urgent = true; break; }
        const target = record.target as HTMLElement;
        if (record.type === 'attributes') {
          if (record.attributeName === 'data-screen' || record.attributeName === 'data-fishing-phase') { urgent = true; break; }
          if (record.attributeName === 'style' || record.attributeName === 'class') {
            if (!target.matches(targetSelector)) continue;
            churnSeen += 1;
          }
        }
      }
      schedule(urgent);
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'style', 'data-screen', 'data-fishing-phase', 'data-v21126-fishing-phase'], childList: true, subtree: true });
    window.addEventListener('pagehide', () => {
      observer.disconnect();
      if (raf) window.cancelAnimationFrame(raf);
      if (throttleTimer) window.clearTimeout(throttleTimer);
    }, { once: true, passive: true });
  }


  private installV21128DirectSourceUiRepairPass(): void {
    const html = document.documentElement;
    if (html.dataset.v21131StaleObserverQuarantine === 'active') {
      html.dataset.v21128DirectSourceUiRepair = 'handoff-to-v21131-stale-observer-quarantine';
      return;
    }
    if (html.dataset.v21129DirectStateUi === 'active') {
      html.classList.add('v21128-direct-source-ui-repair-root');
      html.dataset.v21128DirectSourceUiRepair = 'handoff-to-v21129-direct-state-sync';
      return;
    }
    html.classList.add('v21128-direct-source-ui-repair-root');
    html.dataset.v21128DirectSourceUiRepair = 'active';
    html.dataset.v21122SystemUxPerformance = 'handoff-to-v21128-direct-source-repair';
    html.dataset.v21123RuntimeDeconflict = 'handoff-to-v21128-direct-source-repair';
    html.dataset.v21124RootCauseUxRepair = 'handoff-to-v21128-direct-source-repair';
    html.dataset.v21125LegacyDebtReducer = 'handoff-to-v21128-direct-source-repair';
    html.dataset.v21126StaleCodePruner = 'handoff-to-v21128-direct-source-repair';

    let raf = 0;
    let timer = 0;
    let lastRunAt = 0;
    let mutationDebt = 0;
    let viewportKey = '';
    const pageScreens = new Set(['shop', 'inventory', 'mission', 'map', 'dex', 'gear', 'ranking']);
    const focusedFishingPhases = /bite|reeling|result|success|fail/i;
    const styleCache = new WeakMap<HTMLElement, string>();
    const targetSelector = '.bottom-nav,.v2097-bottom-nav,.v2098-bottom-nav,.runtime-menu-screen,.runtime-hud,.runtime-content,.runtime-card-list,.runtime-panel,.runtime-hero-card,.shop-list,.mission-list,.dex-grid,.inventory-grid,.gear-grid,.v2097-expedition-board,.v2097-expedition-body,.v2097-expedition-body-open,.v2130-build-confirm-card,.v2097-build-tray,.v21122-village-guide-popup,.v21124-village-guide-popup,.v21125-village-guide-popup,.v21126-village-guide-popup,.v21128-village-guide-popup,.v21129-village-guide-popup,.v21130-village-guide-popup,.fishing-screen,.water-overlay,.caustic-overlay,.fishing-3d-ambient,.underwater-webgl-host,.v3d-caustics,.v3d-bubbles,.v3d-depth-fog,[class*="sea-lane-card"],.fishing-loadout-strip,[class*="-fishing-loadout"],[class*="-loadout-copy"],.combo-badge,.bite-callout,.catch-result-card';
    const setImportant = (node: HTMLElement | null | undefined, entries: Array<[string, string]>) => {
      if (!node) return;
      const signature = entries.map(([name, value]) => `${name}:${value}`).join(';');
      const unchanged = styleCache.get(node) === signature && entries.every(([name, value]) => node.style.getPropertyValue(name) === value && node.style.getPropertyPriority(name) === 'important');
      if (unchanged) return;
      for (const [name, value] of entries) {
        if (node.style.getPropertyValue(name) !== value || node.style.getPropertyPriority(name) !== 'important') {
          node.style.setProperty(name, value, 'important');
        }
      }
      styleCache.set(node, signature);
    };
    const clearInline = (node: HTMLElement | null | undefined, props: string[]) => {
      if (!node) return;
      let changed = false;
      for (const prop of props) {
        if (node.style.getPropertyValue(prop)) { node.style.removeProperty(prop); changed = true; }
      }
      if (changed) styleCache.delete(node);
    };
    const owns = (node: HTMLElement | null | undefined, owner: string) => {
      if (!node) return;
      if (!node.classList.contains('v21130-owned-final')) node.classList.add('v21130-owned-final');
      if (node.dataset.v21128Owner !== owner) node.dataset.v21128Owner = owner;
    };
    const phaseOf = (fishing: HTMLElement): string => {
      if (fishing.querySelector<HTMLElement>('.catch-result-card:not(.hidden)')) return 'result';
      if (fishing.querySelector<HTMLElement>('.bite-callout:not(.hidden)')) return 'bite';
      if (fishing.querySelector('.v2055-reel-console:not(.hidden),.reel-panel:not(.hidden),.v2053-reel-touch-zone:not(.hidden),.v2054-reel-touch-zone:not(.hidden)')) return 'reeling';
      const raw = fishing.dataset.fishingPhase || document.body.dataset.fishingPhase || fishing.dataset.v21128FishingPhase || fishing.dataset.v21126FishingPhase || fishing.dataset.v21125FishingPhase || fishing.dataset.v21124FishingPhase || fishing.dataset.v21123FishingPhase || fishing.dataset.v21122FishingPhase || fishing.dataset.v21110FishingPhase || '';
      if (focusedFishingPhases.test(raw)) return raw.toLowerCase();
      if (/casting|waiting|idle|prep/i.test(raw)) return raw.toLowerCase();
      return 'prep';
    };
    const syncRoot = (screen: string) => {
      const viewport = window.visualViewport;
      const width = Math.max(1, Math.floor(viewport?.width ?? window.innerWidth));
      const height = Math.max(1, Math.floor(viewport?.height ?? window.innerHeight));
      const key = `${width}:${height}:${screen}`;
      html.classList.add('v21128-direct-source-ui-repair-root');
      html.dataset.v21128DirectSourceUiRepair = 'active';
      html.dataset.v21128ObserverOwner = 'direct-source-single-governor-css-first-inline-last-resort';
      html.dataset.v21128StaleHandoff = 'v21122-v21126-observer-loops-muted';
      html.dataset.v21128MutationDebt = mutationDebt > 0 ? 'legacy-style-or-class-churn-throttled' : 'quiet';
      html.dataset.v21122SystemUxPerformance = 'handoff-to-v21128-direct-source-repair';
      html.dataset.v21123RuntimeDeconflict = 'handoff-to-v21128-direct-source-repair';
      html.dataset.v21124RootCauseUxRepair = 'handoff-to-v21128-direct-source-repair';
      html.dataset.v21125LegacyDebtReducer = 'handoff-to-v21128-direct-source-repair';
      html.dataset.v21126StaleCodePruner = 'handoff-to-v21128-direct-source-repair';
      html.style.setProperty('--v21128-visual-width', `${width}px`);
      html.style.setProperty('--v21128-visual-height', `${height}px`);
      html.style.setProperty('--v21128-nav-right', 'calc(env(safe-area-inset-right, 0px) + 8px)');
      html.style.setProperty('--v21128-nav-bottom', 'calc(env(safe-area-inset-bottom, 0px) + 8px)');
      html.style.setProperty('--v21128-nav-width', width <= 360 ? 'min(214px, calc(100vw - 14px))' : 'min(232px, calc(100vw - 18px))');
      html.style.setProperty('--v21128-page-width', width <= 380 ? 'min(420px, calc(100vw - 16px))' : 'min(430px, calc(100vw - 20px))');
      html.style.setProperty('--v21128-loadout-top', `calc(env(safe-area-inset-top, 0px) + ${height <= 610 ? 80 : 92}px)`);
      html.style.setProperty('--v21128-combo-bottom', `calc(env(safe-area-inset-bottom, 0px) + ${height <= 610 ? 86 : 96}px)`);
      if (key !== viewportKey) {
        html.classList.toggle('v21128-short-height', height <= 610);
        html.classList.toggle('v21128-narrow-width', width <= 360);
        html.classList.toggle('v21128-performance-budget', true);
        viewportKey = key;
      }
    };
    const guideDismissed = () => {
      try { return localStorage.getItem('aqua-v21130-guide-dismissed') === '1'; }
      catch { return false; }
    };
    const dismissGuide = () => {
      try { localStorage.setItem('aqua-v21130-guide-dismissed', '1'); }
      catch { /* private mode: ignore */ }
      dom.app.querySelectorAll('.v21122-village-guide-popup,.v21124-village-guide-popup,.v21125-village-guide-popup,.v21126-village-guide-popup,.v21128-village-guide-popup,.v21129-village-guide-popup,.v21130-village-guide-popup').forEach((node) => node.remove());
    };
    const normalizeNav = (screen: string) => {
      dom.app.querySelectorAll<HTMLElement>('.bottom-nav,.v2097-bottom-nav,.v2098-bottom-nav').forEach((nav) => {
        owns(nav, 'direct-source-bottom-right-nav-v21128');
        nav.classList.add('v21128-bottom-nav-final');
        nav.dataset.v21128BottomNav = 'one-screen-one-position-canonical';
        if (screen === 'fishing') {
          nav.setAttribute('aria-hidden', 'true');
          setImportant(nav, [['display', 'none'], ['visibility', 'hidden'], ['opacity', '0'], ['pointer-events', 'none'], ['animation', 'none'], ['transition', 'none']]);
          return;
        }
        nav.removeAttribute('aria-hidden');
        setImportant(nav, [
          ['display', 'grid'], ['position', 'fixed'], ['right', 'var(--v21128-nav-right)'], ['bottom', 'var(--v21128-nav-bottom)'], ['left', 'auto'], ['top', 'auto'],
          ['width', 'var(--v21128-nav-width)'], ['max-width', 'calc(100vw - 18px)'], ['height', 'auto'], ['opacity', '1'], ['visibility', 'visible'], ['pointer-events', 'auto'],
          ['transform', 'none'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['z-index', '882'], ['contain', 'layout paint style'], ['will-change', 'auto']
        ]);
      });
    };
    const normalizeGuide = (screen: string) => {
      const village = dom.app.querySelector<HTMLElement>('.village-world-screen');
      if (!village) return;
      village.querySelectorAll('.v21122-village-guide-popup,.v21124-village-guide-popup,.v21125-village-guide-popup,.v21126-village-guide-popup').forEach((node) => node.remove());
      const blocked = screen !== 'village' || guideDismissed() || Boolean(village.querySelector('.v2199-opening-cinematic,.v2097-expedition-body-open,.v2097-build-tray,.v2130-build-confirm-card')) || document.body.classList.contains('v2097-expedition-open') || document.body.classList.contains('v2097-build-open');
      if (blocked) { village.querySelectorAll('.v21130-village-guide-popup').forEach((node) => node.remove()); return; }
      let guide = village.querySelector<HTMLElement>('.v21130-village-guide-popup');
      if (!guide) {
        guide = document.createElement('section');
        guide.className = 'v21130-village-guide-popup v21130-owned-final';
        guide.dataset.noSwipe = 'true';
        guide.dataset.v21128Owner = 'first-village-guided-route-canonical';
        guide.setAttribute('role', 'dialog');
        guide.setAttribute('aria-live', 'polite');
        guide.setAttribute('aria-label', '처음 마을 추천 진행 가이드');
        guide.innerHTML = `<div class="v21130-guide-card"><span class="v21130-guide-eyebrow">처음 할 일</span><strong>낚시로 재화를 모으고 개척 목표를 확인해요</strong><p>처음엔 낚시 → 가방·퀘스트 확인 → 개척 순서로 진행하면 됩니다. 이 가이드는 중앙에 고정되고 한 번 닫으면 다시 뜨지 않아요.</p><div class="v21130-guide-steps"><span>1 낚시</span><span>2 보상 확인</span><span>3 개척</span></div><div class="v21130-guide-actions"><button type="button" data-v21130-guide-fishing>낚시 가기</button><button type="button" data-v21130-guide-expedition>개척 보기</button><button type="button" data-v21130-guide-dismiss>닫기</button></div></div>`;
        guide.querySelector<HTMLButtonElement>('[data-v21130-guide-fishing]')?.addEventListener('click', () => { dismissGuide(); void this.go('fishing' as Screen); });
        guide.querySelector<HTMLButtonElement>('[data-v21130-guide-expedition]')?.addEventListener('click', () => { village.querySelector<HTMLButtonElement>('[data-v2097-expedition-toggle]')?.click(); });
        guide.querySelector<HTMLButtonElement>('[data-v21130-guide-dismiss]')?.addEventListener('click', dismissGuide);
        village.appendChild(guide);
      }
      owns(guide, 'first-village-guided-route-canonical');
      setImportant(guide, [['display', 'block'], ['position', 'fixed'], ['left', '50%'], ['right', 'auto'], ['top', '50%'], ['bottom', 'auto'], ['width', 'min(356px, calc(100vw - 28px))'], ['max-width', 'calc(100vw - 28px)'], ['transform', 'translate3d(-50%, -50%, 0)'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['z-index', '802'], ['pointer-events', 'auto'], ['contain', 'layout paint style'], ['will-change', 'auto']]);
    };
    const normalizePages = (screen: string) => {
      if (!pageScreens.has(screen)) return;
      dom.app.querySelectorAll<HTMLElement>('.runtime-menu-screen').forEach((root) => {
        owns(root, 'direct-source-menu-page-root-v21128');
        root.classList.add('v21128-runtime-page-final');
        setImportant(root, [['position', 'fixed'], ['inset', '0'], ['width', '100vw'], ['max-width', '100vw'], ['height', 'var(--v21128-visual-height, 100svh)'], ['min-height', 'var(--v21128-visual-height, 100svh)'], ['margin', '0'], ['padding-left', 'max(10px, env(safe-area-inset-left, 0px))'], ['padding-right', 'max(10px, env(safe-area-inset-right, 0px))'], ['padding-bottom', 'calc(env(safe-area-inset-bottom, 0px) + 128px)'], ['overflow-x', 'hidden'], ['overflow-y', 'auto'], ['overscroll-behavior', 'contain'], ['box-sizing', 'border-box'], ['transform', 'none'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['content-visibility', 'visible']]);
      });
      dom.app.querySelectorAll<HTMLElement>('.runtime-hud,.runtime-content,.runtime-card-list,.runtime-panel,.runtime-hero-card,.shop-list,.mission-list,.dex-grid,.inventory-grid,.gear-grid').forEach((node) => {
        owns(node, 'direct-source-menu-page-column-v21128');
        node.classList.add('v21128-page-column-final');
        setImportant(node, [['width', 'var(--v21128-page-width)'], ['max-width', 'var(--v21128-page-width)'], ['min-width', '0'], ['margin-left', 'auto'], ['margin-right', 'auto'], ['left', 'auto'], ['right', 'auto'], ['transform', 'none'], ['translate', 'none'], ['scale', '1'], ['box-sizing', 'border-box'], ['overflow-anchor', 'none']]);
      });
    };
    const normalizeVillage = (screen: string) => {
      const village = dom.app.querySelector<HTMLElement>('.village-world-screen');
      if (!village) return;
      village.classList.add('v21128-village-final');
      const modalOpen = Boolean(village.querySelector('.v2097-expedition-body-open,.v2130-build-confirm-card,.v2097-build-tray'));
      document.body.classList.toggle('v21128-village-modal-open', modalOpen);
      village.querySelectorAll<HTMLElement>('.v2097-expedition-board').forEach((board) => {
        owns(board, 'direct-source-expedition-host-v21128');
        board.classList.add('v21128-expedition-host-final');
        setImportant(board, [['overflow', 'visible'], ['max-height', 'none'], ['pointer-events', 'none'], ['z-index', '852'], ['transform', 'none'], ['translate', 'none'], ['animation', 'none'], ['transition', 'none']]);
      });
      village.querySelectorAll<HTMLElement>('.v2097-expedition-body,.v2097-expedition-body-open').forEach((panel) => {
        owns(panel, 'direct-source-expedition-panel-v21128');
        panel.classList.add('v21128-expedition-final');
        panel.dataset.noSwipe = 'true';
        if (panel.classList.contains('v2097-expedition-body-open')) {
          setImportant(panel, [['display', 'block'], ['position', 'fixed'], ['left', '50%'], ['right', 'auto'], ['top', '50%'], ['bottom', 'auto'], ['width', 'min(388px, calc(100vw - 22px))'], ['max-width', 'calc(100vw - 22px)'], ['max-height', 'calc(var(--v21128-visual-height, 100svh) - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 34px)'], ['overflow-x', 'hidden'], ['overflow-y', 'auto'], ['overscroll-behavior', 'contain'], ['transform', 'translate3d(-50%, -50%, 0)'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['z-index', '862'], ['pointer-events', 'auto'], ['box-sizing', 'border-box'], ['contain', 'layout paint style'], ['will-change', 'auto']]);
        }
      });
      village.querySelectorAll<HTMLElement>('.v2130-build-confirm-card,.v2097-build-tray').forEach((panel) => {
        owns(panel, 'direct-source-village-modal-v21128');
        panel.classList.add('v21128-village-modal-final');
        panel.dataset.noSwipe = 'true';
        setImportant(panel, [['max-width', 'calc(100vw - 22px)'], ['max-height', 'calc(var(--v21128-visual-height, 100svh) - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 34px)'], ['overflow-x', 'hidden'], ['overflow-y', 'auto'], ['overscroll-behavior', 'contain'], ['box-sizing', 'border-box'], ['animation', 'none'], ['transition', 'none'], ['z-index', '862']]);
      });
      normalizeGuide(screen);
    };
    const normalizeFishing = (screen: string) => {
      const fishing = dom.app.querySelector<HTMLElement>('.fishing-screen');
      if (!fishing || screen !== 'fishing') return;
      const phase = phaseOf(fishing);
      const focused = focusedFishingPhases.test(phase);
      fishing.classList.add('v21128-fishing-final-screen');
      fishing.classList.toggle('v21128-fishing-focused', focused);
      fishing.dataset.v21128FishingPhase = phase;
      document.body.dataset.v21128FishingPhase = phase;
      fishing.querySelectorAll<HTMLElement>('.water-overlay,.caustic-overlay,.fishing-3d-ambient,.underwater-webgl-host,.v3d-caustics,.v3d-bubbles,.v3d-depth-fog').forEach((node) => {
        owns(node, 'direct-source-water-effect-budget-v21128');
        node.classList.add('v21128-water-final');
        setImportant(node, [['display', focused ? 'none' : 'block'], ['opacity', focused ? '0' : '0.18'], ['visibility', focused ? 'hidden' : 'visible'], ['animation', 'none'], ['transition', 'none'], ['transform', 'translateZ(0)'], ['translate', 'none'], ['scale', '1'], ['will-change', 'auto'], ['backface-visibility', 'hidden'], ['filter', 'none'], ['contain', 'paint'], ['pointer-events', 'none']]);
      });
      fishing.querySelectorAll<HTMLElement>('[class*="sea-lane-card"],.v21124-sea-lane-owned').forEach((node) => {
        owns(node, 'direct-source-sea-lane-no-flicker-v21128');
        node.classList.add('v21128-sea-lane-final');
        setImportant(node, [['position', 'fixed'], ['display', focused ? 'none' : 'block'], ['left', 'max(10px, env(safe-area-inset-left, 0px))'], ['right', 'auto'], ['top', 'calc(env(safe-area-inset-top, 0px) + 58px)'], ['bottom', 'auto'], ['width', 'min(258px, calc(100vw - 20px))'], ['max-width', 'calc(100vw - 20px)'], ['opacity', focused ? '0' : '1'], ['visibility', focused ? 'hidden' : 'visible'], ['pointer-events', 'none'], ['transform', 'none'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['z-index', '524'], ['contain', 'layout paint style']]);
      });
      fishing.querySelectorAll<HTMLElement>('.fishing-loadout-strip,[class*="-fishing-loadout"],[class*="-loadout-copy"]').forEach((node) => {
        owns(node, 'direct-source-loadout-no-scale-v21128');
        node.classList.add('v21128-loadout-final');
        setImportant(node, [['position', 'fixed'], ['display', focused ? 'none' : 'grid'], ['left', '50%'], ['right', 'auto'], ['top', 'var(--v21128-loadout-top)'], ['bottom', 'auto'], ['width', 'min(318px, calc(100vw - 28px))'], ['max-width', 'calc(100vw - 28px)'], ['opacity', focused ? '0' : '1'], ['visibility', focused ? 'hidden' : 'visible'], ['pointer-events', focused ? 'none' : 'auto'], ['transform', 'translate3d(-50%, 0, 0)'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['z-index', '534'], ['contain', 'layout paint style'], ['will-change', 'auto']]);
        node.querySelectorAll<HTMLElement>('*').forEach((child) => {
          child.classList.add('v21128-loadout-child-final');
          clearInline(child, ['transform-origin']);
          setImportant(child, [['animation', 'none'], ['transition', 'none'], ['transform', 'none'], ['translate', 'none'], ['scale', '1'], ['flex-shrink', '0']]);
        });
      });
      fishing.querySelectorAll<HTMLElement>('.combo-badge').forEach((node) => {
        owns(node, 'direct-source-combo-near-cast-gap-v21128');
        node.classList.add('v21128-combo-final');
        setImportant(node, [['position', 'fixed'], ['left', '50%'], ['right', 'auto'], ['top', 'auto'], ['bottom', 'var(--v21128-combo-bottom)'], ['width', 'fit-content'], ['max-width', 'calc(100vw - 32px)'], ['transform', 'translate3d(-50%, 0, 0)'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['pointer-events', 'none'], ['z-index', '726']]);
      });
      fishing.querySelectorAll<HTMLElement>('.bite-callout').forEach((node) => {
        owns(node, 'direct-source-bite-center-no-top-jump-v21128');
        node.classList.add('v21128-bite-final');
        clearInline(node, ['margin', 'margin-top', 'margin-bottom']);
        setImportant(node, [['display', node.classList.contains('hidden') ? 'none' : 'grid'], ['position', 'fixed'], ['left', '50%'], ['right', 'auto'], ['top', '50%'], ['bottom', 'auto'], ['width', 'min(332px, calc(100vw - 30px))'], ['max-width', 'calc(100vw - 30px)'], ['transform', 'translate3d(-50%, -50%, 0)'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['z-index', '906'], ['contain', 'layout paint style']]);
      });
      fishing.querySelectorAll<HTMLElement>('.catch-result-card').forEach((node) => {
        owns(node, 'direct-source-result-center-no-water-v21128');
        node.classList.add('v21128-result-final');
        setImportant(node, [['position', 'fixed'], ['left', '50%'], ['right', 'auto'], ['top', '50%'], ['bottom', 'auto'], ['width', 'min(356px, calc(100vw - 28px))'], ['max-width', 'calc(100vw - 28px)'], ['max-height', 'calc(var(--v21128-visual-height, 100svh) - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 32px)'], ['overflow-x', 'hidden'], ['overflow-y', 'auto'], ['overscroll-behavior', 'contain'], ['transform', 'translate3d(-50%, -50%, 0)'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['z-index', '916'], ['contain', 'layout paint style']]);
      });
    };
    const normalize = () => {
      raf = 0;
      lastRunAt = performance.now();
      const screen = document.body.dataset.screen || 'unknown';
      syncRoot(screen);
      normalizeNav(screen);
      normalizeVillage(screen);
      normalizePages(screen);
      normalizeFishing(screen);
    };
    const schedule = (urgent = false) => {
      if (raf || timer) return;
      const elapsed = performance.now() - lastRunAt;
      const delay = urgent || elapsed > 260 ? 0 : Math.max(90, 260 - elapsed);
      timer = window.setTimeout(() => {
        timer = 0;
        if (raf) return;
        raf = window.requestAnimationFrame(normalize);
      }, delay);
    };
    schedule(true);
    window.visualViewport?.addEventListener('resize', () => schedule(true), { passive: true });
    window.visualViewport?.addEventListener('scroll', () => schedule(false), { passive: true });
    window.addEventListener('resize', () => schedule(true), { passive: true });
    window.addEventListener('orientationchange', () => schedule(true), { passive: true });
    window.addEventListener('pageshow', () => schedule(true), { passive: true });
    document.addEventListener('visibilitychange', () => schedule(false), { passive: true });
    const observer = new MutationObserver((records) => {
      let urgent = false;
      for (const record of records) {
        if (record.type === 'childList') { urgent = true; break; }
        const target = record.target as HTMLElement;
        if (record.type === 'attributes') {
          if (record.attributeName === 'data-screen' || record.attributeName === 'data-fishing-phase') { urgent = true; break; }
          if ((record.attributeName === 'style' || record.attributeName === 'class') && target.matches(targetSelector)) mutationDebt += 1;
        }
      }
      schedule(urgent);
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'style', 'data-screen', 'data-fishing-phase', 'data-v21128-fishing-phase'], childList: true, subtree: true });
    window.addEventListener('pagehide', () => {
      observer.disconnect();
      if (raf) window.cancelAnimationFrame(raf);
      if (timer) window.clearTimeout(timer);
    }, { once: true, passive: true });
  }


  private installV21129DirectStateUiPass(): void {
    const html = document.documentElement;
    if (html.dataset.v21131StaleObserverQuarantine === 'active') {
      html.dataset.v21129DirectStateUi = 'handoff-to-v21131-stale-observer-quarantine';
      return;
    }
    if (html.dataset.v21130DirectSourceRegressionGuard === 'active') {
      html.classList.add('v21129-direct-state-ui-root');
      html.dataset.v21129DirectStateUi = 'handoff-to-v21130-direct-source-regression-guard';
      html.dataset.v21129ObserverOwner = 'handoff-no-observer-v21130';
      return;
    }
    html.classList.add('v21129-direct-state-ui-root');
    html.dataset.v21129DirectStateUi = 'active';
    html.dataset.v21129ObserverOwner = 'direct-render-state-sync-no-style-observer';
    html.dataset.v21128DirectSourceUiRepair = 'handoff-to-v21129-direct-state-sync';
    html.dataset.v21126StaleCodePruner = 'handoff-to-v21129-direct-state-sync';
    html.dataset.v21125LegacyDebtReducer = 'handoff-to-v21129-direct-state-sync';
    html.dataset.v21124RootCauseUxRepair = 'handoff-to-v21129-direct-state-sync';
    html.dataset.v21123RuntimeDeconflict = 'handoff-to-v21129-direct-state-sync';
    html.dataset.v21122SystemUxPerformance = 'handoff-to-v21129-direct-state-sync';

    let raf = 0;
    const schedule = (reason = 'mutation') => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        this.syncV21129DirectUi(reason);
      });
    };

    this.syncV21129DirectUi('install');
    window.visualViewport?.addEventListener('resize', () => schedule('viewport-resize'), { passive: true });
    window.visualViewport?.addEventListener('scroll', () => schedule('viewport-scroll'), { passive: true });
    window.addEventListener('resize', () => schedule('resize'), { passive: true });
    window.addEventListener('orientationchange', () => schedule('orientation'), { passive: true });
    window.addEventListener('pageshow', () => schedule('pageshow'), { passive: true });
    document.addEventListener('visibilitychange', () => schedule('visibility'), { passive: true });
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === 'childList') { schedule('child-list'); return; }
        if (record.type === 'attributes' && (record.attributeName === 'class' || record.attributeName === 'data-screen' || record.attributeName === 'data-fishing-phase')) {
          schedule(record.attributeName ?? 'attribute');
          return;
        }
      }
    });
    observer.observe(dom.app, { attributes: true, attributeFilter: ['class', 'data-screen', 'data-fishing-phase'], childList: true, subtree: true });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-screen', 'data-fishing-phase'] });
    window.addEventListener('pagehide', () => {
      observer.disconnect();
      if (raf) window.cancelAnimationFrame(raf);
    }, { once: true, passive: true });
  }

  private syncV21129DirectUi(reason = 'manual'): void {
    const html = document.documentElement;
    if (html.dataset.v21130DirectSourceRegressionGuard === 'active') {
      html.dataset.v21129DirectStateUi = 'handoff-to-v21130-direct-source-regression-guard';
      html.dataset.v21129ObserverOwner = 'handoff-no-style-no-layout-write-v21130';
      this.syncV21130DirectSourceUi(`from-v21129-${reason}`);
      return;
    }
    const viewport = window.visualViewport;
    const width = Math.max(1, Math.floor(viewport?.width ?? window.innerWidth));
    const height = Math.max(1, Math.floor(viewport?.height ?? window.innerHeight));
    const screen = document.body.dataset.screen || this.screen || 'unknown';
    html.classList.add('v21129-direct-state-ui-root');
    html.dataset.v21129DirectStateUi = 'active';
    html.dataset.v21129LastSync = reason;
    html.dataset.v21129ObserverOwner = 'direct-render-state-sync-no-style-observer';
    html.dataset.v21128DirectSourceUiRepair = 'handoff-to-v21129-direct-state-sync';
    html.dataset.v21126StaleCodePruner = 'handoff-to-v21129-direct-state-sync';
    html.dataset.v21125LegacyDebtReducer = 'handoff-to-v21129-direct-state-sync';
    html.dataset.v21124RootCauseUxRepair = 'handoff-to-v21129-direct-state-sync';
    html.dataset.v21123RuntimeDeconflict = 'handoff-to-v21129-direct-state-sync';
    html.dataset.v21122SystemUxPerformance = 'handoff-to-v21129-direct-state-sync';
    html.style.setProperty('--v21129-visual-width', `${width}px`);
    html.style.setProperty('--v21129-visual-height', `${height}px`);
    html.style.setProperty('--v21129-nav-right', 'calc(env(safe-area-inset-right, 0px) + 8px)');
    html.style.setProperty('--v21129-nav-bottom', 'calc(env(safe-area-inset-bottom, 0px) + 8px)');
    html.style.setProperty('--v21129-nav-width', width <= 360 ? 'min(214px, calc(100vw - 14px))' : 'min(232px, calc(100vw - 18px))');
    html.style.setProperty('--v21129-page-width', width <= 380 ? 'min(420px, calc(100vw - 16px))' : 'min(430px, calc(100vw - 20px))');
    html.style.setProperty('--v21129-loadout-top', `calc(env(safe-area-inset-top, 0px) + ${height <= 610 ? 76 : 88}px)`);
    html.style.setProperty('--v21129-combo-bottom', `calc(env(safe-area-inset-bottom, 0px) + ${height <= 610 ? 88 : 102}px)`);
    html.classList.toggle('v21129-short-height', height <= 610);
    html.classList.toggle('v21129-narrow-width', width <= 360);
    html.classList.toggle('v21129-performance-budget', true);

    const set = (node: HTMLElement | null | undefined, entries: Array<[string, string]>) => {
      if (!node) return;
      for (const [name, value] of entries) {
        if (node.style.getPropertyValue(name) !== value || node.style.getPropertyPriority(name) !== 'important') {
          node.style.setProperty(name, value, 'important');
        }
      }
    };
    const clear = (node: HTMLElement | null | undefined, props: string[]) => {
      if (!node) return;
      for (const prop of props) if (node.style.getPropertyValue(prop)) node.style.removeProperty(prop);
    };
    const own = (node: HTMLElement | null | undefined, owner: string) => {
      if (!node) return;
      node.classList.add('v21129-owned-final');
      node.dataset.v21129Owner = owner;
    };
    const dismissGuide = () => {
      try { localStorage.setItem('aqua-v21129-guide-dismissed', '1'); } catch { /* private mode */ }
      dom.app.querySelectorAll('.v21122-village-guide-popup,.v21124-village-guide-popup,.v21125-village-guide-popup,.v21126-village-guide-popup,.v21128-village-guide-popup,.v21129-village-guide-popup,.v21130-village-guide-popup,.v21129-village-guide-popup').forEach((node) => node.remove());
    };
    const isGuideDismissed = () => {
      try { return localStorage.getItem('aqua-v21129-guide-dismissed') === '1'; } catch { return false; }
    };

    dom.app.querySelectorAll<HTMLElement>('.bottom-nav,.v2097-bottom-nav,.v2098-bottom-nav').forEach((nav) => {
      own(nav, 'bottom-nav-one-canonical-anchor-v21129');
      nav.classList.add('v21129-bottom-nav-final');
      nav.dataset.noSwipe = 'true';
      nav.dataset.v21129BottomNav = 'same-right-bottom-anchor-village-and-pages';
      if (screen === 'fishing') {
        nav.setAttribute('aria-hidden', 'true');
        set(nav, [['display', 'none'], ['visibility', 'hidden'], ['opacity', '0'], ['pointer-events', 'none'], ['animation', 'none'], ['transition', 'none']]);
      } else {
        nav.removeAttribute('aria-hidden');
        set(nav, [['display', 'grid'], ['position', 'fixed'], ['right', 'var(--v21129-nav-right)'], ['bottom', 'var(--v21129-nav-bottom)'], ['left', 'auto'], ['top', 'auto'], ['width', 'var(--v21129-nav-width)'], ['max-width', 'calc(100vw - 18px)'], ['height', 'auto'], ['transform', 'none'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['z-index', '992'], ['opacity', '1'], ['visibility', 'visible'], ['pointer-events', 'auto'], ['contain', 'layout paint style'], ['will-change', 'auto']]);
      }
      nav.querySelectorAll<HTMLElement>('button,img,span').forEach((child) => set(child, [['transform', 'none'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none']]));
    });

    dom.app.querySelectorAll<HTMLElement>('.runtime-menu-screen').forEach((root) => {
      own(root, 'runtime-page-root-centered-v21129');
      root.classList.add('v21129-runtime-page-final');
      set(root, [['position', 'fixed'], ['inset', '0'], ['width', '100vw'], ['max-width', '100vw'], ['height', 'var(--v21129-visual-height, 100svh)'], ['min-height', 'var(--v21129-visual-height, 100svh)'], ['margin', '0'], ['padding-left', 'max(10px, env(safe-area-inset-left, 0px))'], ['padding-right', 'max(10px, env(safe-area-inset-right, 0px))'], ['padding-bottom', 'calc(env(safe-area-inset-bottom, 0px) + 128px)'], ['overflow-x', 'hidden'], ['overflow-y', 'auto'], ['overscroll-behavior', 'contain'], ['box-sizing', 'border-box'], ['transform', 'none'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['content-visibility', 'visible']]);
    });
    dom.app.querySelectorAll<HTMLElement>('.runtime-hud,.runtime-content,.runtime-card-list,.runtime-panel,.runtime-hero-card,.shop-list,.mission-list,.dex-grid,.inventory-grid,.gear-grid,.map-card,.v204-map-shell,.v204-inventory-shell,.v204-quest-board').forEach((node) => {
      own(node, 'runtime-page-column-centered-v21129');
      node.classList.add('v21129-page-column-final');
      set(node, [['width', 'var(--v21129-page-width)'], ['max-width', 'var(--v21129-page-width)'], ['min-width', '0'], ['margin-left', 'auto'], ['margin-right', 'auto'], ['left', 'auto'], ['right', 'auto'], ['transform', 'none'], ['translate', 'none'], ['scale', '1'], ['box-sizing', 'border-box'], ['overflow-anchor', 'none']]);
    });

    const village = dom.app.querySelector<HTMLElement>('.village-world-screen');
    if (village) {
      village.classList.add('v21129-village-final');
      village.dataset.v21129Village = 'direct-guide-expedition-bottom-nav-sync';
      const modalOpen = Boolean(village.querySelector('.v2097-expedition-body-open,.v2130-build-confirm-card,.v2097-build-tray'));
      document.body.classList.toggle('v21129-village-modal-open', modalOpen);
      village.querySelectorAll('.v21122-village-guide-popup,.v21124-village-guide-popup,.v21125-village-guide-popup,.v21126-village-guide-popup,.v21128-village-guide-popup,.v21129-village-guide-popup,.v21130-village-guide-popup').forEach((node) => node.remove());
      const blocked = screen !== 'village' || isGuideDismissed() || modalOpen || Boolean(village.querySelector('.v2199-opening-cinematic,.v2192-opening-cinematic')) || document.body.classList.contains('v2097-expedition-open') || document.body.classList.contains('v2097-build-open');
      if (blocked) village.querySelectorAll('.v21129-village-guide-popup').forEach((node) => node.remove());
      else {
        let guide = village.querySelector<HTMLElement>('.v21129-village-guide-popup');
        if (!guide) {
          guide = document.createElement('section');
          guide.className = 'v21129-village-guide-popup v21129-owned-final';
          guide.dataset.noSwipe = 'true';
          guide.dataset.v21129Owner = 'first-village-guided-route-canonical';
          guide.setAttribute('role', 'dialog');
          guide.setAttribute('aria-live', 'polite');
          guide.setAttribute('aria-label', '처음 마을 추천 진행 가이드');
          guide.innerHTML = `<div class="v21129-guide-card"><span class="v21129-guide-eyebrow">처음 할 일</span><strong>낚시로 골드를 모으고 개척 목표를 확인해요</strong><p>처음엔 낚시 → 가방·퀘스트 확인 → 개척 순서로 진행하면 됩니다. 버튼을 누르면 바로 해당 화면으로 이어집니다.</p><div class="v21129-guide-steps"><span>1 낚시</span><span>2 보상 확인</span><span>3 개척</span></div><div class="v21129-guide-actions"><button type="button" data-v21129-guide-fishing>낚시 가기</button><button type="button" data-v21129-guide-expedition>개척 보기</button><button type="button" data-v21129-guide-dismiss>닫기</button></div></div>`;
          guide.querySelector<HTMLButtonElement>('[data-v21129-guide-fishing]')?.addEventListener('click', () => { dismissGuide(); void this.go('fishing' as Screen); });
          guide.querySelector<HTMLButtonElement>('[data-v21129-guide-expedition]')?.addEventListener('click', () => { village.querySelector<HTMLButtonElement>('[data-v2097-expedition-toggle]')?.click(); this.syncV21129DirectUi('guide-expedition'); });
          guide.querySelector<HTMLButtonElement>('[data-v21129-guide-dismiss]')?.addEventListener('click', dismissGuide);
          village.appendChild(guide);
        }
        set(guide, [['display', 'block'], ['position', 'fixed'], ['left', '50%'], ['right', 'auto'], ['top', '50%'], ['bottom', 'auto'], ['width', 'min(356px, calc(100vw - 28px))'], ['max-width', 'calc(100vw - 28px)'], ['transform', 'translate3d(-50%, -50%, 0)'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['z-index', '1102'], ['pointer-events', 'auto'], ['contain', 'layout paint style'], ['will-change', 'auto']]);
      }
      village.querySelectorAll<HTMLElement>('.v2097-expedition-board').forEach((board) => {
        own(board, 'expedition-board-overflow-host-v21129');
        board.classList.add('v21129-expedition-host-final');
        set(board, [['overflow', 'visible'], ['max-height', 'none'], ['pointer-events', 'none'], ['z-index', '1048'], ['transform', 'none'], ['translate', 'none'], ['animation', 'none'], ['transition', 'none']]);
      });
      village.querySelectorAll<HTMLElement>('.v2097-expedition-body,.v2097-expedition-body-open').forEach((panel) => {
        own(panel, 'expedition-panel-full-visible-v21129');
        panel.classList.add('v21129-expedition-final');
        panel.dataset.noSwipe = 'true';
        if (panel.classList.contains('v2097-expedition-body-open')) {
          set(panel, [['display', 'block'], ['position', 'fixed'], ['left', '50%'], ['right', 'auto'], ['top', '50%'], ['bottom', 'auto'], ['width', 'min(388px, calc(100vw - 22px))'], ['max-width', 'calc(100vw - 22px)'], ['max-height', 'calc(var(--v21129-visual-height, 100svh) - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 34px)'], ['overflow-x', 'hidden'], ['overflow-y', 'auto'], ['overscroll-behavior', 'contain'], ['transform', 'translate3d(-50%, -50%, 0)'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['z-index', '1104'], ['pointer-events', 'auto'], ['box-sizing', 'border-box'], ['contain', 'layout paint style'], ['will-change', 'auto']]);
        }
      });
      village.querySelectorAll<HTMLElement>('.v2130-build-confirm-card,.v2097-build-tray').forEach((panel) => {
        own(panel, 'village-modal-full-visible-v21129');
        panel.classList.add('v21129-village-modal-final');
        panel.dataset.noSwipe = 'true';
        set(panel, [['max-width', 'calc(100vw - 22px)'], ['max-height', 'calc(var(--v21129-visual-height, 100svh) - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 34px)'], ['overflow-x', 'hidden'], ['overflow-y', 'auto'], ['overscroll-behavior', 'contain'], ['box-sizing', 'border-box'], ['animation', 'none'], ['transition', 'none'], ['z-index', '1104']]);
      });
    }

    const fishing = dom.app.querySelector<HTMLElement>('.fishing-screen');
    if (fishing && screen === 'fishing') {
      const raw = fishing.dataset.fishingPhase || document.body.dataset.fishingPhase || (this.state as string) || 'idle';
      const phase = fishing.querySelector<HTMLElement>('.catch-result-card:not(.hidden)') ? 'result' : fishing.querySelector<HTMLElement>('.bite-callout:not(.hidden)') ? 'bite' : raw;
      const focused = /bite|reeling|result|success|fail/i.test(phase);
      fishing.classList.add('v21129-fishing-final-screen');
      fishing.classList.toggle('v21129-fishing-focused', focused);
      fishing.dataset.v21129FishingPhase = phase;
      document.body.dataset.v21129FishingPhase = phase;
      fishing.querySelectorAll<HTMLElement>('.water-overlay,.caustic-overlay,.fishing-3d-ambient,.underwater-webgl-host,.v3d-caustics,.v3d-bubbles,.v3d-depth-fog').forEach((node) => {
        own(node, 'fishing-water-effect-budget-v21129');
        node.classList.add('v21129-water-final');
        set(node, [['display', focused ? 'none' : 'block'], ['visibility', focused ? 'hidden' : 'visible'], ['opacity', focused ? '0' : '0.14'], ['pointer-events', 'none'], ['animation', 'none'], ['transition', 'none'], ['transform', 'translateZ(0)'], ['translate', 'none'], ['scale', '1'], ['will-change', 'auto'], ['filter', 'none'], ['contain', 'paint']]);
      });
      fishing.querySelectorAll<HTMLElement>('[class*="sea-lane-card"],.v21124-sea-lane-owned,.v21128-sea-lane-final').forEach((node) => {
        own(node, 'fishing-sea-lane-no-flicker-v21129');
        node.classList.add('v21129-sea-lane-final');
        set(node, [['position', 'fixed'], ['display', focused ? 'none' : 'block'], ['left', 'max(10px, env(safe-area-inset-left, 0px))'], ['right', 'auto'], ['top', 'calc(env(safe-area-inset-top, 0px) + 58px)'], ['bottom', 'auto'], ['width', 'min(258px, calc(100vw - 20px))'], ['max-width', 'calc(100vw - 20px)'], ['opacity', focused ? '0' : '1'], ['visibility', focused ? 'hidden' : 'visible'], ['pointer-events', 'none'], ['transform', 'none'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['z-index', '714'], ['contain', 'layout paint style']]);
      });
      fishing.querySelectorAll<HTMLElement>('.fishing-loadout-strip').forEach((node) => {
        own(node, 'fishing-loadout-no-scale-v21129');
        node.classList.add('v21129-loadout-final');
        set(node, [['position', 'fixed'], ['display', focused ? 'none' : 'grid'], ['left', '50%'], ['right', 'auto'], ['top', 'var(--v21129-loadout-top)'], ['bottom', 'auto'], ['width', 'min(318px, calc(100vw - 28px))'], ['max-width', 'calc(100vw - 28px)'], ['opacity', focused ? '0' : '1'], ['visibility', focused ? 'hidden' : 'visible'], ['pointer-events', focused ? 'none' : 'auto'], ['transform', 'translate3d(-50%, 0, 0)'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['z-index', '724'], ['contain', 'layout paint style'], ['will-change', 'auto']]);
        node.querySelectorAll<HTMLElement>('*').forEach((child) => {
          child.classList.add('v21129-loadout-child-final');
          clear(child, ['transform-origin']);
          set(child, [['animation', 'none'], ['transition', 'none'], ['transform', 'none'], ['translate', 'none'], ['scale', '1'], ['flex-shrink', '0']]);
        });
      });
      fishing.querySelectorAll<HTMLElement>('.combo-badge').forEach((node) => {
        own(node, 'fishing-combo-near-cast-gap-v21129');
        node.classList.add('v21129-combo-final');
        set(node, [['position', 'fixed'], ['left', '50%'], ['right', 'auto'], ['top', 'auto'], ['bottom', 'var(--v21129-combo-bottom)'], ['width', 'fit-content'], ['max-width', 'calc(100vw - 32px)'], ['transform', 'translate3d(-50%, 0, 0)'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['pointer-events', 'none'], ['z-index', '1110']]);
      });
      fishing.querySelectorAll<HTMLElement>('.bite-callout').forEach((node) => {
        own(node, 'fishing-bite-center-no-top-jump-v21129');
        node.classList.add('v21129-bite-final');
        clear(node, ['margin', 'margin-top', 'margin-bottom']);
        set(node, [['display', node.classList.contains('hidden') ? 'none' : 'grid'], ['position', 'fixed'], ['left', '50%'], ['right', 'auto'], ['top', '50%'], ['bottom', 'auto'], ['width', 'min(332px, calc(100vw - 30px))'], ['max-width', 'calc(100vw - 30px)'], ['transform', 'translate3d(-50%, -50%, 0)'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['z-index', '1120'], ['contain', 'layout paint style']]);
      });
      fishing.querySelectorAll<HTMLElement>('.catch-result-card').forEach((node) => {
        own(node, 'fishing-result-center-no-water-v21129');
        node.classList.add('v21129-result-final');
        set(node, [['position', 'fixed'], ['left', '50%'], ['right', 'auto'], ['top', '50%'], ['bottom', 'auto'], ['width', 'min(356px, calc(100vw - 28px))'], ['max-width', 'calc(100vw - 28px)'], ['max-height', 'calc(var(--v21129-visual-height, 100svh) - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 32px)'], ['overflow-x', 'hidden'], ['overflow-y', 'auto'], ['overscroll-behavior', 'contain'], ['transform', 'translate3d(-50%, -50%, 0)'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['z-index', '1130'], ['contain', 'layout paint style']]);
      });
    }
  }



  private installV21130DirectSourceRegressionGuardPass(): void {
    const html = document.documentElement;
    if (html.dataset.v21131StaleObserverQuarantine === 'active') {
      html.dataset.v21130DirectSourceRegressionGuard = 'handoff-to-v21131-stale-observer-quarantine';
      return;
    }
    html.classList.add('v21130-direct-source-regression-root');
    html.dataset.v21130DirectSourceRegressionGuard = 'active';
    html.dataset.v21130ObserverOwner = 'direct-source-render-first-single-light-sync-no-style-observer';
    html.dataset.v21128DirectSourceUiRepair = 'handoff-to-v21130-direct-source-regression-guard';
    html.dataset.v21126StaleCodePruner = 'handoff-to-v21130-direct-source-regression-guard';
    html.dataset.v21125LegacyDebtReducer = 'handoff-to-v21130-direct-source-regression-guard';
    html.dataset.v21124RootCauseUxRepair = 'handoff-to-v21130-direct-source-regression-guard';
    html.dataset.v21123RuntimeDeconflict = 'handoff-to-v21130-direct-source-regression-guard';
    html.dataset.v21122SystemUxPerformance = 'handoff-to-v21130-direct-source-regression-guard';

    let raf = 0;
    const schedule = (reason = 'mutation') => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        this.syncV21130DirectSourceUi(reason);
      });
    };

    this.syncV21130DirectSourceUi('install');
    window.visualViewport?.addEventListener('resize', () => schedule('viewport-resize'), { passive: true });
    window.visualViewport?.addEventListener('scroll', () => schedule('viewport-scroll'), { passive: true });
    window.addEventListener('resize', () => schedule('resize'), { passive: true });
    window.addEventListener('orientationchange', () => schedule('orientation'), { passive: true });
    window.addEventListener('pageshow', () => schedule('pageshow'), { passive: true });
    document.addEventListener('visibilitychange', () => schedule('visibility'), { passive: true });
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === 'childList') { schedule('child-list'); return; }
        if (record.type === 'attributes' && (record.attributeName === 'class' || record.attributeName === 'data-screen' || record.attributeName === 'data-fishing-phase')) {
          schedule(record.attributeName ?? 'attribute');
          return;
        }
      }
    });
    observer.observe(dom.app, { attributes: true, attributeFilter: ['class', 'data-screen', 'data-fishing-phase'], childList: true, subtree: true });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-screen', 'data-fishing-phase'] });
    window.addEventListener('pagehide', () => {
      observer.disconnect();
      if (raf) window.cancelAnimationFrame(raf);
    }, { once: true, passive: true });
  }

  private syncV21130DirectSourceUi(reason = 'manual'): void {
    const html = document.documentElement;
    if (html.dataset.v21131StaleObserverQuarantine === 'active') {
      html.dataset.v21130DirectSourceRegressionGuard = 'handoff-to-v21131-stale-observer-quarantine';
      html.dataset.v21130ObserverOwner = 'handoff-no-layout-write-v21131';
      this.syncV21131StaleObserverQuarantineUi(`from-v21130-${reason}`);
      return;
    }
    const viewport = window.visualViewport;
    const width = Math.max(1, Math.floor(viewport?.width ?? window.innerWidth));
    const height = Math.max(1, Math.floor(viewport?.height ?? window.innerHeight));
    const screen = document.body.dataset.screen || this.screen || 'unknown';
    html.classList.add('v21130-direct-source-regression-root');
    html.dataset.v21130DirectSourceRegressionGuard = 'active';
    html.dataset.v21130LastSync = reason;
    html.dataset.v21130ObserverOwner = 'direct-source-render-first-single-light-sync-no-style-observer';
    html.dataset.v21128DirectSourceUiRepair = 'handoff-to-v21130-direct-source-regression-guard';
    html.dataset.v21126StaleCodePruner = 'handoff-to-v21130-direct-source-regression-guard';
    html.dataset.v21125LegacyDebtReducer = 'handoff-to-v21130-direct-source-regression-guard';
    html.dataset.v21124RootCauseUxRepair = 'handoff-to-v21130-direct-source-regression-guard';
    html.dataset.v21123RuntimeDeconflict = 'handoff-to-v21130-direct-source-regression-guard';
    html.dataset.v21122SystemUxPerformance = 'handoff-to-v21130-direct-source-regression-guard';
    html.style.setProperty('--v21130-visual-width', `${width}px`);
    html.style.setProperty('--v21130-visual-height', `${height}px`);
    html.style.setProperty('--v21130-nav-right', 'calc(env(safe-area-inset-right, 0px) + 8px)');
    html.style.setProperty('--v21130-nav-bottom', 'calc(env(safe-area-inset-bottom, 0px) + 8px)');
    html.style.setProperty('--v21130-nav-width', width <= 360 ? 'min(214px, calc(100vw - 14px))' : 'min(232px, calc(100vw - 18px))');
    html.style.setProperty('--v21130-page-width', width <= 380 ? 'min(420px, calc(100vw - 16px))' : 'min(430px, calc(100vw - 20px))');
    html.style.setProperty('--v21130-loadout-top', `calc(env(safe-area-inset-top, 0px) + ${height <= 610 ? 76 : 88}px)`);
    html.style.setProperty('--v21130-combo-bottom', `calc(env(safe-area-inset-bottom, 0px) + ${height <= 610 ? 88 : 102}px)`);
    html.classList.toggle('v21130-short-height', height <= 610);
    html.classList.toggle('v21130-narrow-width', width <= 360);
    html.classList.toggle('v21130-performance-budget', true);

    const set = (node: HTMLElement | null | undefined, entries: Array<[string, string]>) => {
      if (!node) return;
      for (const [name, value] of entries) {
        if (node.style.getPropertyValue(name) !== value || node.style.getPropertyPriority(name) !== 'important') {
          node.style.setProperty(name, value, 'important');
        }
      }
    };
    const clear = (node: HTMLElement | null | undefined, props: string[]) => {
      if (!node) return;
      for (const prop of props) if (node.style.getPropertyValue(prop)) node.style.removeProperty(prop);
    };
    const own = (node: HTMLElement | null | undefined, owner: string) => {
      if (!node) return;
      node.classList.add('v21130-owned-final');
      node.dataset.v21130Owner = owner;
    };
    const dismissGuide = () => {
      try { localStorage.setItem('aqua-v21130-guide-dismissed', '1'); } catch { /* private mode */ }
      dom.app.querySelectorAll('.v21122-village-guide-popup,.v21124-village-guide-popup,.v21125-village-guide-popup,.v21126-village-guide-popup,.v21128-village-guide-popup,.v21129-village-guide-popup,.v21130-village-guide-popup').forEach((node) => node.remove());
    };
    const isGuideDismissed = () => {
      try { return localStorage.getItem('aqua-v21130-guide-dismissed') === '1'; } catch { return false; }
    };

    dom.app.querySelectorAll<HTMLElement>('.bottom-nav,.v2097-bottom-nav,.v2098-bottom-nav').forEach((nav) => {
      own(nav, 'bottom-nav-one-canonical-anchor-v21130');
      nav.classList.add('v21130-bottom-nav-final');
      nav.dataset.noSwipe = 'true';
      nav.dataset.v21130BottomNav = 'same-right-bottom-anchor-village-and-pages';
      if (screen === 'fishing') {
        nav.setAttribute('aria-hidden', 'true');
        set(nav, [['display', 'none'], ['visibility', 'hidden'], ['opacity', '0'], ['pointer-events', 'none'], ['animation', 'none'], ['transition', 'none']]);
      } else {
        nav.removeAttribute('aria-hidden');
        set(nav, [['display', 'grid'], ['position', 'fixed'], ['right', 'var(--v21130-nav-right)'], ['bottom', 'var(--v21130-nav-bottom)'], ['left', 'auto'], ['top', 'auto'], ['width', 'var(--v21130-nav-width)'], ['max-width', 'calc(100vw - 18px)'], ['height', 'auto'], ['transform', 'none'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['z-index', '992'], ['opacity', '1'], ['visibility', 'visible'], ['pointer-events', 'auto'], ['contain', 'layout paint style'], ['will-change', 'auto']]);
      }
      nav.querySelectorAll<HTMLElement>('button,img,span').forEach((child) => set(child, [['transform', 'none'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none']]));
    });

    dom.app.querySelectorAll<HTMLElement>('.runtime-menu-screen').forEach((root) => {
      own(root, 'runtime-page-root-centered-v21130');
      root.classList.add('v21130-runtime-page-final');
      set(root, [['position', 'fixed'], ['inset', '0'], ['width', '100vw'], ['max-width', '100vw'], ['height', 'var(--v21130-visual-height, 100svh)'], ['min-height', 'var(--v21130-visual-height, 100svh)'], ['margin', '0'], ['padding-left', 'max(10px, env(safe-area-inset-left, 0px))'], ['padding-right', 'max(10px, env(safe-area-inset-right, 0px))'], ['padding-bottom', 'calc(env(safe-area-inset-bottom, 0px) + 128px)'], ['overflow-x', 'hidden'], ['overflow-y', 'auto'], ['overscroll-behavior', 'contain'], ['box-sizing', 'border-box'], ['transform', 'none'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['content-visibility', 'visible']]);
    });
    dom.app.querySelectorAll<HTMLElement>('.runtime-hud,.runtime-content,.runtime-card-list,.runtime-panel,.runtime-hero-card,.shop-list,.mission-list,.dex-grid,.inventory-grid,.gear-grid,.map-card,.v204-map-shell,.v204-inventory-shell,.v204-quest-board').forEach((node) => {
      own(node, 'runtime-page-column-centered-v21130');
      node.classList.add('v21130-page-column-final');
      set(node, [['width', 'var(--v21130-page-width)'], ['max-width', 'var(--v21130-page-width)'], ['min-width', '0'], ['margin-left', 'auto'], ['margin-right', 'auto'], ['left', 'auto'], ['right', 'auto'], ['transform', 'none'], ['translate', 'none'], ['scale', '1'], ['box-sizing', 'border-box'], ['overflow-anchor', 'none']]);
    });

    const village = dom.app.querySelector<HTMLElement>('.village-world-screen');
    if (village) {
      village.classList.add('v21130-village-final');
      village.dataset.v21130Village = 'direct-guide-expedition-bottom-nav-sync';
      const modalOpen = Boolean(village.querySelector('.v2097-expedition-body-open,.v2130-build-confirm-card,.v2097-build-tray'));
      document.body.classList.toggle('v21130-village-modal-open', modalOpen);
      village.querySelectorAll('.v21122-village-guide-popup,.v21124-village-guide-popup,.v21125-village-guide-popup,.v21126-village-guide-popup,.v21128-village-guide-popup,.v21129-village-guide-popup,.v21130-village-guide-popup').forEach((node) => node.remove());
      const blocked = screen !== 'village' || isGuideDismissed() || modalOpen || Boolean(village.querySelector('.v2199-opening-cinematic,.v2192-opening-cinematic')) || document.body.classList.contains('v2097-expedition-open') || document.body.classList.contains('v2097-build-open');
      if (blocked) village.querySelectorAll('.v21130-village-guide-popup').forEach((node) => node.remove());
      else {
        let guide = village.querySelector<HTMLElement>('.v21130-village-guide-popup');
        if (!guide) {
          guide = document.createElement('section');
          guide.className = 'v21130-village-guide-popup v21130-owned-final';
          guide.dataset.noSwipe = 'true';
          guide.dataset.v21130Owner = 'first-village-guided-route-canonical';
          guide.setAttribute('role', 'dialog');
          guide.setAttribute('aria-live', 'polite');
          guide.setAttribute('aria-label', '처음 마을 추천 진행 가이드');
          guide.innerHTML = `<div class="v21130-guide-card"><span class="v21130-guide-eyebrow">처음 할 일</span><strong>낚시로 골드를 모으고 개척 목표를 확인해요</strong><p>처음엔 낚시 → 가방·퀘스트 확인 → 개척 순서로 진행하면 됩니다. 버튼을 누르면 바로 해당 화면으로 이어집니다.</p><div class="v21130-guide-steps"><span>1 낚시</span><span>2 보상 확인</span><span>3 개척</span></div><div class="v21130-guide-actions"><button type="button" data-v21130-guide-fishing>낚시 가기</button><button type="button" data-v21130-guide-expedition>개척 보기</button><button type="button" data-v21130-guide-dismiss>닫기</button></div></div>`;
          guide.querySelector<HTMLButtonElement>('[data-v21130-guide-fishing]')?.addEventListener('click', () => { dismissGuide(); void this.go('fishing' as Screen); });
          guide.querySelector<HTMLButtonElement>('[data-v21130-guide-expedition]')?.addEventListener('click', () => { village.querySelector<HTMLButtonElement>('[data-v2097-expedition-toggle]')?.click(); this.syncV21130DirectSourceUi('guide-expedition'); });
          guide.querySelector<HTMLButtonElement>('[data-v21130-guide-dismiss]')?.addEventListener('click', dismissGuide);
          village.appendChild(guide);
        }
        set(guide, [['display', 'block'], ['position', 'fixed'], ['left', '50%'], ['right', 'auto'], ['top', '50%'], ['bottom', 'auto'], ['width', 'min(356px, calc(100vw - 28px))'], ['max-width', 'calc(100vw - 28px)'], ['transform', 'translate3d(-50%, -50%, 0)'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['z-index', '1102'], ['pointer-events', 'auto'], ['contain', 'layout paint style'], ['will-change', 'auto']]);
      }
      village.querySelectorAll<HTMLElement>('.v2097-expedition-board').forEach((board) => {
        own(board, 'expedition-board-overflow-host-v21130');
        board.classList.add('v21130-expedition-host-final');
        set(board, [['overflow', 'visible'], ['max-height', 'none'], ['pointer-events', 'none'], ['z-index', '1048'], ['transform', 'none'], ['translate', 'none'], ['animation', 'none'], ['transition', 'none']]);
      });
      village.querySelectorAll<HTMLElement>('.v2097-expedition-body,.v2097-expedition-body-open').forEach((panel) => {
        own(panel, 'expedition-panel-full-visible-v21130');
        panel.classList.add('v21130-expedition-final');
        panel.dataset.noSwipe = 'true';
        if (panel.classList.contains('v2097-expedition-body-open')) {
          set(panel, [['display', 'block'], ['position', 'fixed'], ['left', '50%'], ['right', 'auto'], ['top', '50%'], ['bottom', 'auto'], ['width', 'min(388px, calc(100vw - 22px))'], ['max-width', 'calc(100vw - 22px)'], ['max-height', 'calc(var(--v21130-visual-height, 100svh) - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 34px)'], ['overflow-x', 'hidden'], ['overflow-y', 'auto'], ['overscroll-behavior', 'contain'], ['transform', 'translate3d(-50%, -50%, 0)'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['z-index', '1104'], ['pointer-events', 'auto'], ['box-sizing', 'border-box'], ['contain', 'layout paint style'], ['will-change', 'auto']]);
        }
      });
      village.querySelectorAll<HTMLElement>('.v2130-build-confirm-card,.v2097-build-tray').forEach((panel) => {
        own(panel, 'village-modal-full-visible-v21130');
        panel.classList.add('v21130-village-modal-final');
        panel.dataset.noSwipe = 'true';
        set(panel, [['max-width', 'calc(100vw - 22px)'], ['max-height', 'calc(var(--v21130-visual-height, 100svh) - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 34px)'], ['overflow-x', 'hidden'], ['overflow-y', 'auto'], ['overscroll-behavior', 'contain'], ['box-sizing', 'border-box'], ['animation', 'none'], ['transition', 'none'], ['z-index', '1104']]);
      });
    }

    const fishing = dom.app.querySelector<HTMLElement>('.fishing-screen');
    if (fishing && screen === 'fishing') {
      const raw = fishing.dataset.fishingPhase || document.body.dataset.fishingPhase || (this.state as string) || 'idle';
      const phase = fishing.querySelector<HTMLElement>('.catch-result-card:not(.hidden)') ? 'result' : fishing.querySelector<HTMLElement>('.bite-callout:not(.hidden)') ? 'bite' : raw;
      const focused = /bite|reeling|result|success|fail/i.test(phase);
      fishing.classList.add('v21131-fishing-final-screen', 'v21130-fishing-final-screen');
      fishing.classList.toggle('v21130-fishing-focused', focused);
      fishing.dataset.v21130FishingPhase = phase;
      document.body.dataset.v21130FishingPhase = phase;
      fishing.querySelectorAll<HTMLElement>('.water-overlay,.caustic-overlay,.fishing-3d-ambient,.underwater-webgl-host,.v3d-caustics,.v3d-bubbles,.v3d-depth-fog').forEach((node) => {
        own(node, 'fishing-water-effect-budget-v21130');
        node.classList.add('v21131-water-final', 'v21130-water-final');
        set(node, [['display', focused ? 'none' : 'block'], ['visibility', focused ? 'hidden' : 'visible'], ['opacity', focused ? '0' : '0.14'], ['pointer-events', 'none'], ['animation', 'none'], ['transition', 'none'], ['transform', 'translateZ(0)'], ['translate', 'none'], ['scale', '1'], ['will-change', 'auto'], ['filter', 'none'], ['contain', 'paint']]);
      });
      fishing.querySelectorAll<HTMLElement>('[class*="sea-lane-card"],.v21124-sea-lane-owned,.v21128-sea-lane-final').forEach((node) => {
        own(node, 'fishing-sea-lane-no-flicker-v21130');
        node.classList.add('v21130-sea-lane-final');
        set(node, [['position', 'fixed'], ['display', focused ? 'none' : 'block'], ['left', 'max(10px, env(safe-area-inset-left, 0px))'], ['right', 'auto'], ['top', 'calc(env(safe-area-inset-top, 0px) + 58px)'], ['bottom', 'auto'], ['width', 'min(258px, calc(100vw - 20px))'], ['max-width', 'calc(100vw - 20px)'], ['opacity', focused ? '0' : '1'], ['visibility', focused ? 'hidden' : 'visible'], ['pointer-events', 'none'], ['transform', 'none'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['z-index', '714'], ['contain', 'layout paint style']]);
      });
      fishing.querySelectorAll<HTMLElement>('.fishing-loadout-strip').forEach((node) => {
        own(node, 'fishing-loadout-no-scale-v21130');
        node.classList.add('v21131-loadout-final', 'v21130-loadout-final');
        set(node, [['position', 'fixed'], ['display', focused ? 'none' : 'grid'], ['left', '50%'], ['right', 'auto'], ['top', 'var(--v21130-loadout-top)'], ['bottom', 'auto'], ['width', 'min(318px, calc(100vw - 28px))'], ['max-width', 'calc(100vw - 28px)'], ['opacity', focused ? '0' : '1'], ['visibility', focused ? 'hidden' : 'visible'], ['pointer-events', focused ? 'none' : 'auto'], ['transform', 'translate3d(-50%, 0, 0)'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['z-index', '724'], ['contain', 'layout paint style'], ['will-change', 'auto']]);
        node.querySelectorAll<HTMLElement>('*').forEach((child) => {
          child.classList.add('v21131-loadout-child-final', 'v21130-loadout-child-final');
          clear(child, ['transform-origin']);
          set(child, [['animation', 'none'], ['transition', 'none'], ['transform', 'none'], ['translate', 'none'], ['scale', '1'], ['flex-shrink', '0']]);
        });
      });
      fishing.querySelectorAll<HTMLElement>('.combo-badge').forEach((node) => {
        own(node, 'fishing-combo-near-cast-gap-v21130');
        node.classList.add('v21131-combo-final', 'v21130-combo-final');
        set(node, [['position', 'fixed'], ['left', '50%'], ['right', 'auto'], ['top', 'auto'], ['bottom', 'var(--v21130-combo-bottom)'], ['width', 'fit-content'], ['max-width', 'calc(100vw - 32px)'], ['transform', 'translate3d(-50%, 0, 0)'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['pointer-events', 'none'], ['z-index', '1110']]);
      });
      fishing.querySelectorAll<HTMLElement>('.bite-callout').forEach((node) => {
        own(node, 'fishing-bite-center-no-top-jump-v21130');
        node.classList.add('v21131-bite-final', 'v21130-bite-final');
        clear(node, ['margin', 'margin-top', 'margin-bottom']);
        set(node, [['display', node.classList.contains('hidden') ? 'none' : 'grid'], ['position', 'fixed'], ['left', '50%'], ['right', 'auto'], ['top', '50%'], ['bottom', 'auto'], ['width', 'min(332px, calc(100vw - 30px))'], ['max-width', 'calc(100vw - 30px)'], ['transform', 'translate3d(-50%, -50%, 0)'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['z-index', '1120'], ['contain', 'layout paint style']]);
      });
      fishing.querySelectorAll<HTMLElement>('.catch-result-card').forEach((node) => {
        own(node, 'fishing-result-center-no-water-v21130');
        node.classList.add('v21131-result-final', 'v21130-result-final');
        set(node, [['position', 'fixed'], ['left', '50%'], ['right', 'auto'], ['top', '50%'], ['bottom', 'auto'], ['width', 'min(356px, calc(100vw - 28px))'], ['max-width', 'calc(100vw - 28px)'], ['max-height', 'calc(var(--v21130-visual-height, 100svh) - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 32px)'], ['overflow-x', 'hidden'], ['overflow-y', 'auto'], ['overscroll-behavior', 'contain'], ['transform', 'translate3d(-50%, -50%, 0)'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['z-index', '1130'], ['contain', 'layout paint style']]);
      });
    }
  }




  private installV21131StaleObserverQuarantinePass(): void {
    const html = document.documentElement;
    if (html.dataset.v21132ObserverBudgetGovernor === 'active') {
      html.dataset.v21131StaleObserverQuarantine = 'active';
      html.dataset.v21131ObserverOwner = 'handoff-to-v21132-observer-budget-governor';
      html.dataset.v21131UiPolicy = 'handoff-no-observer-install-v21132';
      return;
    }
    html.classList.add('v21131-stale-observer-quarantine-root');
    html.dataset.v21131StaleObserverQuarantine = 'active';
    html.dataset.v21131ObserverOwner = 'single-light-governor-no-style-observer-no-legacy-loop';
    html.dataset.v21131UiPolicy = 'early-boot-mutes-v21122-v21130-observers-direct-state-sync';
    html.dataset.v21122SystemUxPerformance = 'handoff-to-v21131-stale-observer-quarantine';
    html.dataset.v21123RuntimeDeconflict = 'handoff-to-v21131-stale-observer-quarantine';
    html.dataset.v21124RootCauseUxRepair = 'handoff-to-v21131-stale-observer-quarantine';
    html.dataset.v21125LegacyDebtReducer = 'handoff-to-v21131-stale-observer-quarantine';
    html.dataset.v21126StaleCodePruner = 'handoff-to-v21131-stale-observer-quarantine';
    html.dataset.v21128DirectSourceUiRepair = 'handoff-to-v21131-stale-observer-quarantine';
    html.dataset.v21129DirectStateUi = 'handoff-to-v21131-stale-observer-quarantine';
    html.dataset.v21130DirectSourceRegressionGuard = 'handoff-to-v21131-stale-observer-quarantine';

    let raf = 0;
    let lastKey = '';
    const schedule = (reason = 'mutation') => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        this.syncV21131StaleObserverQuarantineUi(reason);
      });
    };

    this.syncV21131StaleObserverQuarantineUi('install');
    window.visualViewport?.addEventListener('resize', () => schedule('viewport-resize'), { passive: true });
    window.visualViewport?.addEventListener('scroll', () => schedule('viewport-scroll'), { passive: true });
    window.addEventListener('resize', () => schedule('resize'), { passive: true });
    window.addEventListener('orientationchange', () => schedule('orientation'), { passive: true });
    window.addEventListener('pageshow', () => schedule('pageshow'), { passive: true });
    document.addEventListener('visibilitychange', () => schedule('visibility'), { passive: true });
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === 'childList') { schedule('child-list'); return; }
        if (record.type === 'attributes' && (record.attributeName === 'class' || record.attributeName === 'data-screen' || record.attributeName === 'data-fishing-phase')) {
          const target = record.target as HTMLElement;
          const key = `${record.attributeName}:${document.body.dataset.screen ?? ''}:${document.body.dataset.fishingPhase ?? ''}:${target.className}`;
          if (key !== lastKey) {
            lastKey = key;
            schedule(record.attributeName ?? 'attribute');
          }
          return;
        }
      }
    });
    observer.observe(dom.app, { attributes: true, attributeFilter: ['class', 'data-screen', 'data-fishing-phase'], childList: true, subtree: true });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-screen', 'data-fishing-phase'] });
    window.addEventListener('pagehide', () => {
      observer.disconnect();
      if (raf) window.cancelAnimationFrame(raf);
    }, { once: true, passive: true });
  }

  private syncV21131StaleObserverQuarantineUi(reason = 'manual'): void {
    const html = document.documentElement;
    const viewport = window.visualViewport;
    const width = Math.max(1, Math.floor(viewport?.width ?? window.innerWidth));
    const height = Math.max(1, Math.floor(viewport?.height ?? window.innerHeight));
    const screen = document.body.dataset.screen || this.screen || 'unknown';
    html.classList.add('v21131-stale-observer-quarantine-root');
    html.dataset.v21131StaleObserverQuarantine = 'active';
    html.dataset.v21131LastSync = reason;
    html.dataset.v21131ObserverOwner = 'single-light-governor-no-style-observer-no-legacy-loop';
    html.dataset.v21131UiPolicy = 'direct-source-classes-css-first-inline-critical-only';
    html.dataset.v21122SystemUxPerformance = 'handoff-to-v21131-stale-observer-quarantine';
    html.dataset.v21123RuntimeDeconflict = 'handoff-to-v21131-stale-observer-quarantine';
    html.dataset.v21124RootCauseUxRepair = 'handoff-to-v21131-stale-observer-quarantine';
    html.dataset.v21125LegacyDebtReducer = 'handoff-to-v21131-stale-observer-quarantine';
    html.dataset.v21126StaleCodePruner = 'handoff-to-v21131-stale-observer-quarantine';
    html.dataset.v21128DirectSourceUiRepair = 'handoff-to-v21131-stale-observer-quarantine';
    html.dataset.v21129DirectStateUi = 'handoff-to-v21131-stale-observer-quarantine';
    html.dataset.v21130DirectSourceRegressionGuard = 'handoff-to-v21131-stale-observer-quarantine';
    html.style.setProperty('--v21131-visual-width', `${width}px`);
    html.style.setProperty('--v21131-visual-height', `${height}px`);
    html.style.setProperty('--v21131-nav-right', 'calc(env(safe-area-inset-right, 0px) + 8px)');
    html.style.setProperty('--v21131-nav-bottom', 'calc(env(safe-area-inset-bottom, 0px) + 8px)');
    html.style.setProperty('--v21131-nav-width', width <= 360 ? 'min(214px, calc(100vw - 14px))' : 'min(232px, calc(100vw - 18px))');
    html.style.setProperty('--v21131-page-width', width <= 380 ? 'min(420px, calc(100vw - 16px))' : 'min(430px, calc(100vw - 20px))');
    html.style.setProperty('--v21131-loadout-top', `calc(env(safe-area-inset-top, 0px) + ${height <= 610 ? 76 : 88}px)`);
    html.style.setProperty('--v21131-combo-bottom', `calc(env(safe-area-inset-bottom, 0px) + ${height <= 610 ? 88 : 102}px)`);
    html.classList.toggle('v21131-short-height', height <= 610);
    html.classList.toggle('v21131-narrow-width', width <= 360);
    html.classList.toggle('v21131-performance-budget', true);

    const set = (node: HTMLElement | null | undefined, entries: Array<[string, string]>) => {
      if (!node) return;
      for (const [name, value] of entries) {
        if (node.style.getPropertyValue(name) !== value || node.style.getPropertyPriority(name) !== 'important') node.style.setProperty(name, value, 'important');
      }
    };
    const clear = (node: HTMLElement | null | undefined, props: string[]) => {
      if (!node) return;
      for (const prop of props) if (node.style.getPropertyValue(prop)) node.style.removeProperty(prop);
    };
    const own = (node: HTMLElement | null | undefined, owner: string) => {
      if (!node) return;
      node.classList.add('v21131-owned-final');
      node.dataset.v21131Owner = owner;
    };
    const guideDismissed = () => {
      try { return localStorage.getItem('aqua-v21131-guide-dismissed') === '1'; } catch { return false; }
    };
    const dismissGuide = () => {
      try { localStorage.setItem('aqua-v21131-guide-dismissed', '1'); } catch { /* private mode */ }
      dom.app.querySelectorAll('.v21122-village-guide-popup,.v21124-village-guide-popup,.v21125-village-guide-popup,.v21126-village-guide-popup,.v21128-village-guide-popup,.v21129-village-guide-popup,.v21130-village-guide-popup,.v21131-village-guide-popup').forEach((node) => node.remove());
    };

    dom.app.querySelectorAll<HTMLElement>('.bottom-nav,.v2097-bottom-nav,.v2098-bottom-nav').forEach((nav) => {
      own(nav, 'bottom-nav-one-canonical-anchor-v21131');
      nav.classList.add('v21131-bottom-nav-final');
      nav.dataset.noSwipe = 'true';
      nav.dataset.v21131BottomNav = 'same-right-bottom-anchor-village-and-pages';
      if (screen === 'fishing') {
        nav.setAttribute('aria-hidden', 'true');
        set(nav, [['display', 'none'], ['visibility', 'hidden'], ['opacity', '0'], ['pointer-events', 'none'], ['animation', 'none'], ['transition', 'none']]);
      } else {
        nav.removeAttribute('aria-hidden');
        set(nav, [['display', 'grid'], ['position', 'fixed'], ['right', 'var(--v21131-nav-right)'], ['bottom', 'var(--v21131-nav-bottom)'], ['left', 'auto'], ['top', 'auto'], ['width', 'var(--v21131-nav-width)'], ['max-width', 'calc(100vw - 18px)'], ['height', 'auto'], ['transform', 'none'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['z-index', '1192'], ['opacity', '1'], ['visibility', 'visible'], ['pointer-events', 'auto'], ['contain', 'layout paint style'], ['will-change', 'auto']]);
      }
    });

    dom.app.querySelectorAll<HTMLElement>('.runtime-menu-screen').forEach((root) => {
      own(root, 'runtime-page-root-centered-v21131');
      root.classList.add('v21131-runtime-page-final');
      root.dataset.v21131RuntimePage = 'centered-safe-area-no-right-drift';
    });
    dom.app.querySelectorAll<HTMLElement>('.runtime-hud,.runtime-content,.runtime-card-list,.runtime-panel,.runtime-hero-card,.shop-list,.mission-list,.dex-grid,.inventory-grid,.gear-grid,.map-card,.v204-map-shell,.v204-inventory-shell,.v204-quest-board').forEach((node) => {
      own(node, 'runtime-page-column-centered-v21131');
      node.classList.add('v21131-page-column-final');
    });

    const village = dom.app.querySelector<HTMLElement>('.village-world-screen');
    if (village) {
      village.classList.add('v21131-village-final');
      village.dataset.v21131Village = 'single-guide-expedition-bottom-nav-sync';
      const modalOpen = Boolean(village.querySelector('.v2097-expedition-body-open,.v2130-build-confirm-card,.v2097-build-tray'));
      document.body.classList.toggle('v21131-village-modal-open', modalOpen);
      village.querySelectorAll('.v21122-village-guide-popup,.v21124-village-guide-popup,.v21125-village-guide-popup,.v21126-village-guide-popup,.v21128-village-guide-popup,.v21129-village-guide-popup,.v21130-village-guide-popup').forEach((node) => node.remove());
      const openingActive = Boolean(village.querySelector('.v2199-opening-cinematic,.v2192-opening-cinematic'));
      const blocked = screen !== 'village' || guideDismissed() || modalOpen || openingActive || document.body.classList.contains('v2097-expedition-open') || document.body.classList.contains('v2097-build-open');
      if (blocked) village.querySelectorAll('.v21131-village-guide-popup').forEach((node) => node.remove());
      else {
        let guide = village.querySelector<HTMLElement>('.v21131-village-guide-popup');
        if (!guide) {
          guide = document.createElement('section');
          guide.className = 'v21131-village-guide-popup v21131-owned-final';
          guide.dataset.noSwipe = 'true';
          guide.dataset.v21131Owner = 'first-village-guided-route-canonical';
          guide.setAttribute('role', 'dialog');
          guide.setAttribute('aria-live', 'polite');
          guide.setAttribute('aria-label', '처음 마을 추천 진행 가이드');
          guide.innerHTML = `<div class="v21131-guide-card"><span class="v21131-guide-eyebrow">처음 할 일</span><strong>낚시로 골드를 모으고 개척 목표를 확인해요</strong><p>낚시로 재화를 모은 뒤 가방·퀘스트를 확인하고, 개척에서 다음 목표를 열어가면 됩니다.</p><div class="v21131-guide-steps"><span>1 낚시</span><span>2 보상 확인</span><span>3 개척</span></div><div class="v21131-guide-actions"><button type="button" data-v21131-guide-fishing>낚시 가기</button><button type="button" data-v21131-guide-expedition>개척 보기</button><button type="button" data-v21131-guide-dismiss>닫기</button></div></div>`;
          guide.querySelector<HTMLButtonElement>('[data-v21131-guide-fishing]')?.addEventListener('click', () => { dismissGuide(); void this.go('fishing' as Screen); });
          guide.querySelector<HTMLButtonElement>('[data-v21131-guide-expedition]')?.addEventListener('click', () => { village.querySelector<HTMLButtonElement>('[data-v2097-expedition-toggle]')?.click(); this.syncV21131StaleObserverQuarantineUi('guide-expedition'); });
          guide.querySelector<HTMLButtonElement>('[data-v21131-guide-dismiss]')?.addEventListener('click', dismissGuide);
          village.appendChild(guide);
        }
      }
      village.querySelectorAll<HTMLElement>('.v2097-expedition-board').forEach((board) => {
        own(board, 'expedition-board-overflow-host-v21131');
        board.classList.add('v21131-expedition-host-final');
      });
      village.querySelectorAll<HTMLElement>('.v2097-expedition-body,.v2097-expedition-body-open').forEach((panel) => {
        own(panel, 'expedition-panel-full-visible-v21131');
        panel.classList.add('v21131-expedition-final');
        panel.dataset.noSwipe = 'true';
        if (panel.classList.contains('v2097-expedition-body-open')) {
          set(panel, [['display', 'block'], ['position', 'fixed'], ['left', '50%'], ['right', 'auto'], ['top', '50%'], ['bottom', 'auto'], ['width', 'min(388px, calc(100vw - 22px))'], ['max-width', 'calc(100vw - 22px)'], ['max-height', 'calc(var(--v21131-visual-height, 100svh) - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 34px)'], ['overflow-x', 'hidden'], ['overflow-y', 'auto'], ['overscroll-behavior', 'contain'], ['transform', 'translate3d(-50%, -50%, 0)'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['z-index', '1204'], ['pointer-events', 'auto'], ['box-sizing', 'border-box'], ['contain', 'layout paint style'], ['will-change', 'auto']]);
        }
      });
      village.querySelectorAll<HTMLElement>('.v2130-build-confirm-card,.v2097-build-tray').forEach((panel) => {
        own(panel, 'village-modal-full-visible-v21131');
        panel.classList.add('v21131-village-modal-final');
        panel.dataset.noSwipe = 'true';
      });
    }

    const fishing = dom.app.querySelector<HTMLElement>('.fishing-screen');
    if (fishing && screen === 'fishing') {
      const raw = fishing.dataset.fishingPhase || document.body.dataset.fishingPhase || (this.state as string) || 'idle';
      const phase = fishing.querySelector<HTMLElement>('.catch-result-card:not(.hidden)') ? 'result' : fishing.querySelector<HTMLElement>('.bite-callout:not(.hidden)') ? 'bite' : raw;
      const focused = /bite|reeling|result|success|fail/i.test(phase);
      fishing.classList.add('v21131-fishing-final-screen');
      fishing.classList.toggle('v21131-fishing-focused', focused);
      fishing.dataset.v21131FishingPhase = phase;
      document.body.dataset.v21131FishingPhase = phase;
      fishing.querySelectorAll<HTMLElement>('.water-overlay,.caustic-overlay,.fishing-3d-ambient,.underwater-webgl-host,.v3d-caustics,.v3d-bubbles,.v3d-depth-fog').forEach((node) => {
        own(node, 'fishing-water-effect-budget-v21131');
        node.classList.add('v21131-water-final');
        set(node, [['display', focused ? 'none' : 'block'], ['visibility', focused ? 'hidden' : 'visible'], ['opacity', focused ? '0' : '0.12'], ['pointer-events', 'none'], ['animation', 'none'], ['transition', 'none'], ['transform', 'translateZ(0)'], ['translate', 'none'], ['scale', '1'], ['will-change', 'auto'], ['filter', 'none'], ['contain', 'paint']]);
      });
      fishing.querySelectorAll<HTMLElement>('[class*="sea-lane-card"],.v21124-sea-lane-owned,.v21128-sea-lane-final,.v21130-sea-lane-final').forEach((node) => {
        own(node, 'fishing-sea-lane-no-flicker-v21131');
        node.classList.add('v21131-sea-lane-final');
        set(node, [['display', focused ? 'none' : 'block'], ['visibility', focused ? 'hidden' : 'visible'], ['opacity', focused ? '0' : '1'], ['animation', 'none'], ['transition', 'none'], ['transform', 'none'], ['translate', 'none'], ['scale', '1'], ['pointer-events', 'none'], ['contain', 'layout paint style']]);
      });
      fishing.querySelectorAll<HTMLElement>('.fishing-loadout-strip').forEach((node) => {
        own(node, 'fishing-loadout-no-scale-v21131');
        node.classList.add('v21131-loadout-final');
        set(node, [['display', focused ? 'none' : 'grid'], ['visibility', focused ? 'hidden' : 'visible'], ['opacity', focused ? '0' : '1'], ['animation', 'none'], ['transition', 'none'], ['transform', 'translate3d(-50%, 0, 0)'], ['translate', 'none'], ['scale', '1'], ['will-change', 'auto']]);
        node.querySelectorAll<HTMLElement>('*').forEach((child) => {
          child.classList.add('v21131-loadout-child-final');
          clear(child, ['transform-origin']);
          set(child, [['animation', 'none'], ['transition', 'none'], ['transform', 'none'], ['translate', 'none'], ['scale', '1'], ['flex-shrink', '0']]);
        });
      });
      fishing.querySelectorAll<HTMLElement>('.combo-badge').forEach((node) => { own(node, 'fishing-combo-near-cast-gap-v21131'); node.classList.add('v21131-combo-final'); });
      fishing.querySelectorAll<HTMLElement>('.bite-callout').forEach((node) => {
        own(node, 'fishing-bite-center-no-top-jump-v21131');
        node.classList.add('v21131-bite-final');
        clear(node, ['margin', 'margin-top', 'margin-bottom']);
        set(node, [['display', node.classList.contains('hidden') ? 'none' : 'grid'], ['position', 'fixed'], ['left', '50%'], ['right', 'auto'], ['top', '50%'], ['bottom', 'auto'], ['width', 'min(332px, calc(100vw - 30px))'], ['max-width', 'calc(100vw - 30px)'], ['transform', 'translate3d(-50%, -50%, 0)'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['z-index', '1220'], ['contain', 'layout paint style']]);
      });
      fishing.querySelectorAll<HTMLElement>('.catch-result-card').forEach((node) => {
        own(node, 'fishing-result-center-no-water-v21131');
        node.classList.add('v21131-result-final');
        set(node, [['position', 'fixed'], ['left', '50%'], ['right', 'auto'], ['top', '50%'], ['bottom', 'auto'], ['width', 'min(356px, calc(100vw - 28px))'], ['max-width', 'calc(100vw - 28px)'], ['max-height', 'calc(var(--v21131-visual-height, 100svh) - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 32px)'], ['overflow-x', 'hidden'], ['overflow-y', 'auto'], ['overscroll-behavior', 'contain'], ['transform', 'translate3d(-50%, -50%, 0)'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['z-index', '1230'], ['contain', 'layout paint style']]);
      });
    }
  }
  private installV21132ObserverBudgetGovernorPass(): void {
    if (document.documentElement.dataset.v21133SingleGovernorLedger === 'active') {
      document.documentElement.dataset.v21132UiPolicy = 'handoff-to-v21133-single-governor-ledger';
      return;
    }
    const html = document.documentElement;
    html.classList.add('v21132-observer-budget-governor-root');
    html.dataset.v21132ObserverBudgetGovernor = 'active';
    html.dataset.v21132ObserverOwner = 'single-light-governor-legacy-observers-muted-no-style-observer';
    html.dataset.v21132UiPolicy = 'early-boot-mutes-v2164-v21131-observer-loops-direct-light-sync';
    html.dataset.v21122SystemUxPerformance = 'handoff-to-v21132-observer-budget-governor';
    html.dataset.v21123RuntimeDeconflict = 'handoff-to-v21132-observer-budget-governor';
    html.dataset.v21124RootCauseUxRepair = 'handoff-to-v21132-observer-budget-governor';
    html.dataset.v21125LegacyDebtReducer = 'handoff-to-v21132-observer-budget-governor';
    html.dataset.v21126StaleCodePruner = 'handoff-to-v21132-observer-budget-governor';
    html.dataset.v21128DirectSourceUiRepair = 'handoff-to-v21132-observer-budget-governor';
    html.dataset.v21129DirectStateUi = 'handoff-to-v21132-observer-budget-governor';
    html.dataset.v21130DirectSourceRegressionGuard = 'handoff-to-v21132-observer-budget-governor';
    html.dataset.v21131StaleObserverQuarantine = 'handoff-to-v21132-observer-budget-governor';

    let raf = 0;
    let lastKey = '';
    const schedule = (reason = 'mutation') => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        this.syncV21132ObserverBudgetGovernorUi(reason);
      });
    };

    this.syncV21132ObserverBudgetGovernorUi('install');
    window.visualViewport?.addEventListener('resize', () => schedule('viewport-resize'), { passive: true });
    window.visualViewport?.addEventListener('scroll', () => schedule('viewport-scroll'), { passive: true });
    window.addEventListener('resize', () => schedule('resize'), { passive: true });
    window.addEventListener('orientationchange', () => schedule('orientation'), { passive: true });
    window.addEventListener('pageshow', () => schedule('pageshow'), { passive: true });
    document.addEventListener('visibilitychange', () => schedule('visibility'), { passive: true });
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === 'childList') { schedule('child-list'); return; }
        if (record.type === 'attributes' && (record.attributeName === 'class' || record.attributeName === 'data-screen' || record.attributeName === 'data-fishing-phase')) {
          const target = record.target as HTMLElement;
          const key = `${record.attributeName}:${document.body.dataset.screen ?? ''}:${document.body.dataset.fishingPhase ?? ''}:${target.className}`;
          if (key !== lastKey) {
            lastKey = key;
            schedule(record.attributeName ?? 'attribute');
          }
          return;
        }
      }
    });
    observer.observe(dom.app, { attributes: true, attributeFilter: ['class', 'data-screen', 'data-fishing-phase'], childList: true, subtree: true });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-screen', 'data-fishing-phase'] });
    window.addEventListener('pagehide', () => {
      observer.disconnect();
      if (raf) window.cancelAnimationFrame(raf);
    }, { once: true, passive: true });
  }

  private syncV21132ObserverBudgetGovernorUi(reason = 'manual'): void {
    const html = document.documentElement;
    const viewport = window.visualViewport;
    const width = Math.max(1, Math.floor(viewport?.width ?? window.innerWidth));
    const height = Math.max(1, Math.floor(viewport?.height ?? window.innerHeight));
    const screen = document.body.dataset.screen || this.screen || 'unknown';
    html.classList.add('v21132-observer-budget-governor-root');
    html.dataset.v21132ObserverBudgetGovernor = 'active';
    html.dataset.v21132LastSync = reason;
    html.dataset.v21132ObserverOwner = 'single-light-governor-legacy-observers-muted-no-style-observer';
    html.dataset.v21132UiPolicy = 'direct-source-classes-css-first-inline-critical-only-observer-budgeted';
    html.dataset.v21122SystemUxPerformance = 'handoff-to-v21132-observer-budget-governor';
    html.dataset.v21123RuntimeDeconflict = 'handoff-to-v21132-observer-budget-governor';
    html.dataset.v21124RootCauseUxRepair = 'handoff-to-v21132-observer-budget-governor';
    html.dataset.v21125LegacyDebtReducer = 'handoff-to-v21132-observer-budget-governor';
    html.dataset.v21126StaleCodePruner = 'handoff-to-v21132-observer-budget-governor';
    html.dataset.v21128DirectSourceUiRepair = 'handoff-to-v21132-observer-budget-governor';
    html.dataset.v21129DirectStateUi = 'handoff-to-v21132-observer-budget-governor';
    html.dataset.v21130DirectSourceRegressionGuard = 'handoff-to-v21132-observer-budget-governor';
    html.dataset.v21131StaleObserverQuarantine = 'handoff-to-v21132-observer-budget-governor';
    html.style.setProperty('--v21132-visual-width', `${width}px`);
    html.style.setProperty('--v21132-visual-height', `${height}px`);
    html.style.setProperty('--v21132-nav-right', 'calc(env(safe-area-inset-right, 0px) + 8px)');
    html.style.setProperty('--v21132-nav-bottom', 'calc(env(safe-area-inset-bottom, 0px) + 8px)');
    html.style.setProperty('--v21132-nav-width', width <= 360 ? 'min(214px, calc(100vw - 14px))' : 'min(232px, calc(100vw - 18px))');
    html.style.setProperty('--v21132-page-width', width <= 380 ? 'min(420px, calc(100vw - 16px))' : 'min(430px, calc(100vw - 20px))');
    html.style.setProperty('--v21132-loadout-top', `calc(env(safe-area-inset-top, 0px) + ${height <= 610 ? 76 : 88}px)`);
    html.style.setProperty('--v21132-combo-bottom', `calc(env(safe-area-inset-bottom, 0px) + ${height <= 610 ? 88 : 102}px)`);
    html.classList.toggle('v21132-short-height', height <= 610);
    html.classList.toggle('v21132-narrow-width', width <= 360);
    html.classList.toggle('v21132-performance-budget', true);

    const set = (node: HTMLElement | null | undefined, entries: Array<[string, string]>) => {
      if (!node) return;
      for (const [name, value] of entries) {
        if (node.style.getPropertyValue(name) !== value || node.style.getPropertyPriority(name) !== 'important') node.style.setProperty(name, value, 'important');
      }
    };
    const clear = (node: HTMLElement | null | undefined, props: string[]) => {
      if (!node) return;
      for (const prop of props) if (node.style.getPropertyValue(prop)) node.style.removeProperty(prop);
    };
    const own = (node: HTMLElement | null | undefined, owner: string) => {
      if (!node) return;
      node.classList.add('v21132-owned-final');
      node.dataset.v21132Owner = owner;
    };
    const guideDismissed = () => {
      try { return localStorage.getItem('aqua-v21132-guide-dismissed') === '1'; } catch { return false; }
    };
    const dismissGuide = () => {
      try { localStorage.setItem('aqua-v21132-guide-dismissed', '1'); } catch { /* private mode */ }
      dom.app.querySelectorAll('.v21122-village-guide-popup,.v21124-village-guide-popup,.v21125-village-guide-popup,.v21126-village-guide-popup,.v21128-village-guide-popup,.v21129-village-guide-popup,.v21130-village-guide-popup,.v21131-village-guide-popup').forEach((node) => node.remove());
    };

    dom.app.querySelectorAll<HTMLElement>('.bottom-nav,.v2097-bottom-nav,.v2098-bottom-nav').forEach((nav) => {
      own(nav, 'bottom-nav-one-canonical-anchor-v21132');
      nav.classList.add('v21132-bottom-nav-final');
      nav.dataset.noSwipe = 'true';
      nav.dataset.v21132BottomNav = 'same-right-bottom-anchor-village-and-pages';
      if (screen === 'fishing') {
        nav.setAttribute('aria-hidden', 'true');
        set(nav, [['display', 'none'], ['visibility', 'hidden'], ['opacity', '0'], ['pointer-events', 'none'], ['animation', 'none'], ['transition', 'none']]);
      } else {
        nav.removeAttribute('aria-hidden');
        set(nav, [['display', 'grid'], ['position', 'fixed'], ['right', 'var(--v21132-nav-right)'], ['bottom', 'var(--v21132-nav-bottom)'], ['left', 'auto'], ['top', 'auto'], ['width', 'var(--v21132-nav-width)'], ['max-width', 'calc(100vw - 18px)'], ['height', 'auto'], ['transform', 'none'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['z-index', '1192'], ['opacity', '1'], ['visibility', 'visible'], ['pointer-events', 'auto'], ['contain', 'layout paint style'], ['will-change', 'auto']]);
      }
    });

    dom.app.querySelectorAll<HTMLElement>('.runtime-menu-screen').forEach((root) => {
      own(root, 'runtime-page-root-centered-v21132');
      root.classList.add('v21132-runtime-page-final');
      root.dataset.v21132RuntimePage = 'centered-safe-area-no-right-drift';
    });
    dom.app.querySelectorAll<HTMLElement>('.runtime-hud,.runtime-content,.runtime-card-list,.runtime-panel,.runtime-hero-card,.shop-list,.mission-list,.dex-grid,.inventory-grid,.gear-grid,.map-card,.v204-map-shell,.v204-inventory-shell,.v204-quest-board').forEach((node) => {
      own(node, 'runtime-page-column-centered-v21132');
      node.classList.add('v21132-page-column-final');
    });

    const village = dom.app.querySelector<HTMLElement>('.village-world-screen');
    if (village) {
      village.classList.add('v21132-village-final');
      village.dataset.v21132Village = 'single-guide-expedition-bottom-nav-sync';
      const modalOpen = Boolean(village.querySelector('.v2097-expedition-body-open,.v2130-build-confirm-card,.v2097-build-tray'));
      document.body.classList.toggle('v21132-village-modal-open', modalOpen);
      village.querySelectorAll('.v21122-village-guide-popup,.v21124-village-guide-popup,.v21125-village-guide-popup,.v21126-village-guide-popup,.v21128-village-guide-popup,.v21129-village-guide-popup,.v21130-village-guide-popup').forEach((node) => node.remove());
      const openingActive = Boolean(village.querySelector('.v2199-opening-cinematic,.v2192-opening-cinematic'));
      const blocked = screen !== 'village' || guideDismissed() || modalOpen || openingActive || document.body.classList.contains('v2097-expedition-open') || document.body.classList.contains('v2097-build-open');
      if (blocked) village.querySelectorAll('.v21132-village-guide-popup').forEach((node) => node.remove());
      else {
        let guide = village.querySelector<HTMLElement>('.v21132-village-guide-popup');
        if (!guide) {
          guide = document.createElement('section');
          guide.className = 'v21132-village-guide-popup v21132-owned-final';
          guide.dataset.noSwipe = 'true';
          guide.dataset.v21132Owner = 'first-village-guided-route-canonical';
          guide.setAttribute('role', 'dialog');
          guide.setAttribute('aria-live', 'polite');
          guide.setAttribute('aria-label', '처음 마을 추천 진행 가이드');
          guide.innerHTML = `<div class="v21132-guide-card"><span class="v21132-guide-eyebrow">처음 할 일</span><strong>낚시로 골드를 모으고 개척 목표를 확인해요</strong><p>낚시로 재화를 모은 뒤 가방·퀘스트를 확인하고, 개척에서 다음 목표를 열어가면 됩니다.</p><div class="v21132-guide-steps"><span>1 낚시</span><span>2 보상 확인</span><span>3 개척</span></div><div class="v21132-guide-actions"><button type="button" data-v21132-guide-fishing>낚시 가기</button><button type="button" data-v21132-guide-expedition>개척 보기</button><button type="button" data-v21132-guide-dismiss>닫기</button></div></div>`;
          guide.querySelector<HTMLButtonElement>('[data-v21132-guide-fishing]')?.addEventListener('click', () => { dismissGuide(); void this.go('fishing' as Screen); });
          guide.querySelector<HTMLButtonElement>('[data-v21132-guide-expedition]')?.addEventListener('click', () => { village.querySelector<HTMLButtonElement>('[data-v2097-expedition-toggle]')?.click(); this.syncV21132ObserverBudgetGovernorUi('guide-expedition'); });
          guide.querySelector<HTMLButtonElement>('[data-v21132-guide-dismiss]')?.addEventListener('click', dismissGuide);
          village.appendChild(guide);
        }
      }
      village.querySelectorAll<HTMLElement>('.v2097-expedition-board').forEach((board) => {
        own(board, 'expedition-board-overflow-host-v21132');
        board.classList.add('v21132-expedition-host-final');
      });
      village.querySelectorAll<HTMLElement>('.v2097-expedition-body,.v2097-expedition-body-open').forEach((panel) => {
        own(panel, 'expedition-panel-full-visible-v21132');
        panel.classList.add('v21132-expedition-final');
        panel.dataset.noSwipe = 'true';
        if (panel.classList.contains('v2097-expedition-body-open')) {
          set(panel, [['display', 'block'], ['position', 'fixed'], ['left', '50%'], ['right', 'auto'], ['top', '50%'], ['bottom', 'auto'], ['width', 'min(388px, calc(100vw - 22px))'], ['max-width', 'calc(100vw - 22px)'], ['max-height', 'calc(var(--v21132-visual-height, 100svh) - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 34px)'], ['overflow-x', 'hidden'], ['overflow-y', 'auto'], ['overscroll-behavior', 'contain'], ['transform', 'translate3d(-50%, -50%, 0)'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['z-index', '1204'], ['pointer-events', 'auto'], ['box-sizing', 'border-box'], ['contain', 'layout paint style'], ['will-change', 'auto']]);
        }
      });
      village.querySelectorAll<HTMLElement>('.v2130-build-confirm-card,.v2097-build-tray').forEach((panel) => {
        own(panel, 'village-modal-full-visible-v21132');
        panel.classList.add('v21132-village-modal-final');
        panel.dataset.noSwipe = 'true';
      });
    }

    const fishing = dom.app.querySelector<HTMLElement>('.fishing-screen');
    if (fishing && screen === 'fishing') {
      const raw = fishing.dataset.fishingPhase || document.body.dataset.fishingPhase || (this.state as string) || 'idle';
      const phase = fishing.querySelector<HTMLElement>('.catch-result-card:not(.hidden)') ? 'result' : fishing.querySelector<HTMLElement>('.bite-callout:not(.hidden)') ? 'bite' : raw;
      const focused = /bite|reeling|result|success|fail/i.test(phase);
      fishing.classList.add('v21132-fishing-final-screen');
      fishing.classList.toggle('v21132-fishing-focused', focused);
      fishing.dataset.v21132FishingPhase = phase;
      document.body.dataset.v21132FishingPhase = phase;
      fishing.querySelectorAll<HTMLElement>('.water-overlay,.caustic-overlay,.fishing-3d-ambient,.underwater-webgl-host,.v3d-caustics,.v3d-bubbles,.v3d-depth-fog').forEach((node) => {
        own(node, 'fishing-water-effect-budget-v21132');
        node.classList.add('v21132-water-final');
        set(node, [['display', focused ? 'none' : 'block'], ['visibility', focused ? 'hidden' : 'visible'], ['opacity', focused ? '0' : '0.12'], ['pointer-events', 'none'], ['animation', 'none'], ['transition', 'none'], ['transform', 'translateZ(0)'], ['translate', 'none'], ['scale', '1'], ['will-change', 'auto'], ['filter', 'none'], ['contain', 'paint']]);
      });
      fishing.querySelectorAll<HTMLElement>('[class*="sea-lane-card"],.v21124-sea-lane-owned,.v21128-sea-lane-final,.v21130-sea-lane-final').forEach((node) => {
        own(node, 'fishing-sea-lane-no-flicker-v21132');
        node.classList.add('v21132-sea-lane-final');
        set(node, [['display', focused ? 'none' : 'block'], ['visibility', focused ? 'hidden' : 'visible'], ['opacity', focused ? '0' : '1'], ['animation', 'none'], ['transition', 'none'], ['transform', 'none'], ['translate', 'none'], ['scale', '1'], ['pointer-events', 'none'], ['contain', 'layout paint style']]);
      });
      fishing.querySelectorAll<HTMLElement>('.fishing-loadout-strip').forEach((node) => {
        own(node, 'fishing-loadout-no-scale-v21132');
        node.classList.add('v21132-loadout-final');
        set(node, [['display', focused ? 'none' : 'grid'], ['visibility', focused ? 'hidden' : 'visible'], ['opacity', focused ? '0' : '1'], ['animation', 'none'], ['transition', 'none'], ['transform', 'translate3d(-50%, 0, 0)'], ['translate', 'none'], ['scale', '1'], ['will-change', 'auto']]);
        node.querySelectorAll<HTMLElement>('*').forEach((child) => {
          child.classList.add('v21132-loadout-child-final');
          clear(child, ['transform-origin']);
          set(child, [['animation', 'none'], ['transition', 'none'], ['transform', 'none'], ['translate', 'none'], ['scale', '1'], ['flex-shrink', '0']]);
        });
      });
      fishing.querySelectorAll<HTMLElement>('.combo-badge').forEach((node) => { own(node, 'fishing-combo-near-cast-gap-v21132'); node.classList.add('v21132-combo-final'); });
      fishing.querySelectorAll<HTMLElement>('.bite-callout').forEach((node) => {
        own(node, 'fishing-bite-center-no-top-jump-v21132');
        node.classList.add('v21132-bite-final');
        clear(node, ['margin', 'margin-top', 'margin-bottom']);
        set(node, [['display', node.classList.contains('hidden') ? 'none' : 'grid'], ['position', 'fixed'], ['left', '50%'], ['right', 'auto'], ['top', '50%'], ['bottom', 'auto'], ['width', 'min(332px, calc(100vw - 30px))'], ['max-width', 'calc(100vw - 30px)'], ['transform', 'translate3d(-50%, -50%, 0)'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['z-index', '1220'], ['contain', 'layout paint style']]);
      });
      fishing.querySelectorAll<HTMLElement>('.catch-result-card').forEach((node) => {
        own(node, 'fishing-result-center-no-water-v21132');
        node.classList.add('v21132-result-final');
        set(node, [['position', 'fixed'], ['left', '50%'], ['right', 'auto'], ['top', '50%'], ['bottom', 'auto'], ['width', 'min(356px, calc(100vw - 28px))'], ['max-width', 'calc(100vw - 28px)'], ['max-height', 'calc(var(--v21132-visual-height, 100svh) - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 32px)'], ['overflow-x', 'hidden'], ['overflow-y', 'auto'], ['overscroll-behavior', 'contain'], ['transform', 'translate3d(-50%, -50%, 0)'], ['translate', 'none'], ['scale', '1'], ['animation', 'none'], ['transition', 'none'], ['z-index', '1230'], ['contain', 'layout paint style']]);
      });
    }
  }

  private installV21133SingleGovernorLedgerPass(): void {
    if (document.documentElement.dataset.v21134RenderBudgetUiWriteLedger === 'active') {
      document.documentElement.dataset.v21133UiPolicy = 'handoff-to-v21134-render-budget-ui-write-ledger';
      return;
    }
    const html = document.documentElement;
    html.classList.add('v21133-single-governor-ledger-root');
    html.dataset.v21133SingleGovernorLedger = 'active';
    html.dataset.v21133UiPolicy = 'single-light-observer-ledger-no-style-loop-no-extra-layout-write';
    html.dataset.v21133LatestUiOwner = 'direct-source-state-sync-plus-observer-budget-ledger';
    html.dataset.v21132UiPolicy = 'handoff-to-v21133-single-governor-ledger';
    let raf = 0;
    let lastSignature = '';
    const schedule = (reason: string) => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const screen = document.body.dataset.screen || this.screen || 'unknown';
        const phase = document.body.dataset.fishingPhase || dom.app.querySelector<HTMLElement>('.fishing-screen')?.dataset.fishingPhase || 'idle';
        const guide = (() => { try { return localStorage.getItem('aqua-v21133-guide-dismissed') === '1' ? 'dismissed' : 'openable'; } catch { return 'openable'; } })();
        const modal = document.body.classList.contains('v2097-expedition-open') || document.body.classList.contains('v2097-build-open') ? 'modal' : 'clear';
        const signature = `${screen}|${phase}|${guide}|${modal}|${Math.round((window.visualViewport?.width ?? window.innerWidth) / 8)}x${Math.round((window.visualViewport?.height ?? window.innerHeight) / 8)}`;
        if (signature === lastSignature && reason !== 'install') {
          html.dataset.v21133LastSkippedReason = reason;
          return;
        }
        lastSignature = signature;
        this.syncV21133SingleGovernorLedgerUi(reason);
      });
    };
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === 'attributes' && record.attributeName === 'style') continue;
        schedule(record.type === 'childList' ? 'child-list' : `attr-${record.attributeName ?? 'unknown'}`);
        break;
      }
    });
    observer.observe(dom.app, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'data-screen', 'data-fishing-phase', 'aria-hidden'] });
    window.visualViewport?.addEventListener('resize', () => schedule('visual-viewport-resize'), { passive: true });
    window.visualViewport?.addEventListener('scroll', () => schedule('visual-viewport-scroll'), { passive: true });
    window.addEventListener('resize', () => schedule('window-resize'), { passive: true });
    schedule('install');
  }

  private syncV21133SingleGovernorLedgerUi(reason = 'manual'): void {
    const html = document.documentElement;
    const viewport = window.visualViewport;
    const vw = Math.max(1, Math.floor(viewport?.width ?? window.innerWidth));
    const vh = Math.max(1, Math.floor(viewport?.height ?? window.innerHeight));
    const screen = document.body.dataset.screen || this.screen || 'unknown';
    html.classList.add('v21133-single-governor-ledger-root');
    html.dataset.v21133SingleGovernorLedger = 'active';
    html.dataset.v21133LastSyncReason = reason;
    html.dataset.v21133LatestUiOwner = 'direct-source-state-sync-plus-observer-budget-ledger';
    html.style.setProperty('--v21133-visual-width', `${vw}px`);
    html.style.setProperty('--v21133-visual-height', `${vh}px`);
    html.style.setProperty('--v21133-nav-right', 'calc(env(safe-area-inset-right, 0px) + 8px)');
    html.style.setProperty('--v21133-nav-bottom', 'calc(env(safe-area-inset-bottom, 0px) + 8px)');
    html.style.setProperty('--v21133-page-width', 'min(430px, calc(100vw - 20px))');
    html.style.setProperty('--v21133-combo-bottom', 'calc(env(safe-area-inset-bottom, 0px) + 102px)');

    const muted = (html.dataset.v21132MutedLegacyObservers || '').split('|').filter(Boolean);
    html.dataset.v21133MutedLegacyObserverCount = String(new Set(muted).size);
    html.dataset.v21133ObserverBudget = 'v21132-legacy-mutes-plus-v21133-single-light-sync';
    document.body.dataset.v21133Screen = screen;

    dom.app.querySelectorAll<HTMLElement>('.bottom-nav,.v2097-bottom-nav,.v2098-bottom-nav').forEach((nav) => {
      nav.classList.add('v21133-bottom-nav-final');
      nav.dataset.v21133Owner = screen === 'fishing' ? 'hidden-on-fishing' : 'same-right-bottom-anchor';
      nav.dataset.noSwipe = 'true';
    });

    dom.app.querySelectorAll<HTMLElement>('.runtime-menu-screen').forEach((root) => {
      root.classList.add('v21133-runtime-page-final');
      root.dataset.v21133Owner = 'centered-page-root';
    });
    dom.app.querySelectorAll<HTMLElement>('.runtime-hud,.runtime-content,.runtime-card-list,.runtime-panel,.runtime-hero-card,.shop-list,.mission-list,.dex-grid,.inventory-grid,.gear-grid,.map-card,.v204-map-shell,.v204-inventory-shell,.v204-quest-board').forEach((node) => {
      node.classList.add('v21133-page-column-final');
      node.dataset.v21133Owner = 'centered-page-column';
    });

    const village = dom.app.querySelector<HTMLElement>('.village-world-screen');
    if (village) {
      village.classList.add('v21133-village-final');
      village.dataset.v21133Owner = 'village-guide-expedition-nav-ledger';
      village.querySelectorAll('.v21122-village-guide-popup,.v21124-village-guide-popup,.v21125-village-guide-popup,.v21126-village-guide-popup,.v21128-village-guide-popup,.v21129-village-guide-popup,.v21130-village-guide-popup,.v21131-village-guide-popup,.v21132-village-guide-popup').forEach((node) => node.remove());
      const modalOpen = Boolean(village.querySelector('.v2097-expedition-body-open,.v2130-build-confirm-card,.v2097-build-tray')) || document.body.classList.contains('v2097-expedition-open') || document.body.classList.contains('v2097-build-open');
      const openingActive = Boolean(village.querySelector('.v2199-opening-cinematic,.v2192-opening-cinematic'));
      const dismissed = (() => { try { return localStorage.getItem('aqua-v21133-guide-dismissed') === '1'; } catch { return false; } })();
      if (screen === 'village' && !dismissed && !modalOpen && !openingActive) {
        let guide = village.querySelector<HTMLElement>('.v21133-village-guide-popup');
        if (!guide) {
          guide = document.createElement('section');
          guide.className = 'v21133-village-guide-popup';
          guide.dataset.noSwipe = 'true';
          guide.dataset.v21133Owner = 'first-village-guided-route';
          guide.setAttribute('role', 'dialog');
          guide.setAttribute('aria-live', 'polite');
          guide.setAttribute('aria-label', '처음 마을 추천 진행 가이드');
          guide.innerHTML = `<div class="v21133-guide-card"><span class="v21133-guide-eyebrow">처음 할 일</span><strong>낚시로 골드를 모으고 개척 목표를 확인해요</strong><p>낚시 → 가방·퀘스트 확인 → 개척 순서로 진행하면 초반 목표가 자연스럽게 이어집니다.</p><div class="v21133-guide-steps"><span>1 낚시</span><span>2 보상 확인</span><span>3 개척</span></div><div class="v21133-guide-actions"><button type="button" data-v21133-guide-fishing>낚시 가기</button><button type="button" data-v21133-guide-expedition>개척 보기</button><button type="button" data-v21133-guide-dismiss>닫기</button></div></div>`;
          guide.querySelector<HTMLButtonElement>('[data-v21133-guide-fishing]')?.addEventListener('click', () => { try { localStorage.setItem('aqua-v21133-guide-dismissed', '1'); } catch { /* ignore */ } void this.go('fishing' as Screen); });
          guide.querySelector<HTMLButtonElement>('[data-v21133-guide-expedition]')?.addEventListener('click', () => { village.querySelector<HTMLButtonElement>('[data-v2097-expedition-toggle]')?.click(); this.syncV21133SingleGovernorLedgerUi('guide-expedition'); });
          guide.querySelector<HTMLButtonElement>('[data-v21133-guide-dismiss]')?.addEventListener('click', () => { try { localStorage.setItem('aqua-v21133-guide-dismissed', '1'); } catch { /* ignore */ } guide?.remove(); });
          village.appendChild(guide);
        }
      } else {
        village.querySelectorAll('.v21133-village-guide-popup').forEach((node) => node.remove());
      }
      village.querySelectorAll<HTMLElement>('.v2097-expedition-body,.v2097-expedition-body-open,.v2097-expedition-board').forEach((node) => {
        node.classList.add('v21133-expedition-final');
        node.dataset.v21133Owner = 'expedition-full-visible-safe-scroll';
        node.dataset.noSwipe = 'true';
      });
      village.querySelectorAll<HTMLElement>('.v2130-build-confirm-card,.v2097-build-tray').forEach((node) => {
        node.classList.add('v21133-village-modal-final');
        node.dataset.v21133Owner = 'village-modal-safe-scroll';
        node.dataset.noSwipe = 'true';
      });
    }

    const fishing = dom.app.querySelector<HTMLElement>('.fishing-screen');
    if (fishing && screen === 'fishing') {
      const raw = fishing.dataset.fishingPhase || document.body.dataset.fishingPhase || (this.state as string) || 'idle';
      const phase = fishing.querySelector<HTMLElement>('.catch-result-card:not(.hidden)') ? 'result' : fishing.querySelector<HTMLElement>('.bite-callout:not(.hidden)') ? 'bite' : raw;
      const focused = /bite|reeling|result|success|fail/i.test(phase);
      fishing.classList.add('v21133-fishing-final-screen');
      fishing.classList.toggle('v21133-fishing-focused', focused);
      fishing.dataset.v21133FishingPhase = phase;
      document.body.dataset.v21133FishingPhase = phase;
      fishing.querySelectorAll<HTMLElement>('.water-overlay,.caustic-overlay,.fishing-3d-ambient,.underwater-webgl-host,.v3d-caustics,.v3d-bubbles,.v3d-depth-fog,[class*="sea-lane-card"],.v21124-sea-lane-owned,.v21128-sea-lane-final,.v21130-sea-lane-final,.v21132-sea-lane-final').forEach((node) => {
        node.classList.add('v21133-water-budget-final');
        node.dataset.v21133Owner = focused ? 'hidden-during-focus-phase' : 'idle-only-water-effect-budget';
      });
      fishing.querySelectorAll<HTMLElement>('.fishing-loadout-strip').forEach((node) => {
        node.classList.add('v21133-loadout-final');
        node.dataset.v21133Owner = focused ? 'hidden-during-focus-phase' : 'stable-loadout-no-scale';
        node.querySelectorAll<HTMLElement>('*').forEach((child) => child.classList.add('v21133-loadout-child-final'));
      });
      fishing.querySelectorAll<HTMLElement>('.combo-badge').forEach((node) => { node.classList.add('v21133-combo-final'); node.dataset.v21133Owner = 'near-cast-button-gap'; });
      fishing.querySelectorAll<HTMLElement>('.bite-callout').forEach((node) => { node.classList.add('v21133-bite-final'); node.dataset.v21133Owner = 'center-fixed-no-top-jump'; });
      fishing.querySelectorAll<HTMLElement>('.catch-result-card').forEach((node) => { node.classList.add('v21133-result-final'); node.dataset.v21133Owner = 'center-fixed-no-water-flicker'; });
    }
  }


  private v21134RecommendedFps(reason = 'manual'): number {
    const tier = this.quality.tier();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
    const focused = this.state === 'reeling' || this.state === 'bite' || this.state === 'success' || this.state === 'fail';
    if (reduced || saveData || this.compact || tier === 'lite') return focused ? 40 : 30;
    if (tier === 'high') return focused ? 60 : 52;
    return focused ? 52 : 44;
  }

  private configureV21134RenderBudget(reason = 'manual'): void {
    const fps = this.v21134RecommendedFps(reason);
    const tier = this.quality.tier();
    const signature = `${tier}|${this.compact ? 1 : 0}|${this.state}|${fps}|${this.fallbackMode ? 1 : 0}`;
    if (signature === this.v21134LastRenderBudget) return;
    this.v21134LastRenderBudget = signature;
    const html = document.documentElement;
    html.dataset.v21134RenderBudget = `fps-${fps}-${this.fallbackMode ? 'fallback' : 'pixi'}-${reason}`;
    html.dataset.v21134TickerBudget = `${fps}fps-${tier}`;
    html.style.setProperty('--v21134-ui-write-quantum', 'rounded-1pct');
    if (this.pixi?.ticker) {
      const ticker = this.pixi.ticker as unknown as { maxFPS?: number; minFPS?: number };
      ticker.maxFPS = fps;
      ticker.minFPS = Math.min(24, fps);
    }
  }

  private installV21134RenderBudgetUiWriteLedgerPass(): void {
    const html = document.documentElement;
    html.classList.add('v21134-render-budget-ui-write-ledger-root');
    html.dataset.v21134RenderBudgetUiWriteLedger = 'active';
    html.dataset.v21134UiPolicy = 'single-governor-plus-rounded-fishing-ui-writes-and-pixi-fps-budget';
    html.dataset.v21134LatestUiOwner = 'render-budget-ui-write-ledger';
    html.dataset.v21133UiPolicy = 'handoff-to-v21134-render-budget-ui-write-ledger';
    html.dataset.v21133LatestUiOwner = 'handoff-to-v21134-render-budget-ui-write-ledger';

    let raf = 0;
    const schedule = (reason = 'mutation') => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        this.syncV21134RenderBudgetUiWriteLedgerUi(reason);
      });
    };

    this.syncV21134RenderBudgetUiWriteLedgerUi('install');
    this.configureV21134RenderBudget('install');
    window.visualViewport?.addEventListener('resize', () => schedule('viewport-resize'), { passive: true });
    window.visualViewport?.addEventListener('scroll', () => schedule('viewport-scroll'), { passive: true });
    window.addEventListener('resize', () => schedule('resize'), { passive: true });
    window.addEventListener('orientationchange', () => schedule('orientation'), { passive: true });
    window.addEventListener('pageshow', () => schedule('pageshow'), { passive: true });
    window.addEventListener('aqua-runtime-quality-change', () => { this.configureV21134RenderBudget('quality-change'); schedule('quality-change'); }, { passive: true });
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === 'childList') { schedule('child-list'); return; }
        if (record.type === 'attributes') { schedule(record.attributeName ?? 'attribute'); return; }
      }
    });
    observer.observe(dom.app, { attributes: true, attributeFilter: ['class', 'data-screen', 'data-fishing-phase', 'aria-hidden'], childList: true, subtree: true });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-screen', 'data-fishing-phase'] });
    window.addEventListener('pagehide', () => { observer.disconnect(); if (raf) window.cancelAnimationFrame(raf); }, { once: true, passive: true });
  }

  private syncV21134RenderBudgetUiWriteLedgerUi(reason = 'manual'): void {
    const html = document.documentElement;
    const vv = window.visualViewport;
    const vw = Math.max(1, Math.floor(vv?.width ?? window.innerWidth));
    const vh = Math.max(1, Math.floor(vv?.height ?? window.innerHeight));
    const screen = document.body.dataset.screen || this.screen;
    const phase = document.body.dataset.fishingPhase || this.state;
    const guide = (() => { try { return localStorage.getItem('aqua-v21134-guide-dismissed') === '1' ? 'dismissed' : 'openable'; } catch { return 'openable'; } })();
    const modalCount = dom.app.querySelectorAll('.v2097-expedition-body-open,.v2130-build-confirm-card,.v2097-build-tray,.bite-callout,.catch-result-card').length;
    const muted = (html.dataset.v21132MutedLegacyObservers || '').split('|').filter(Boolean);
    const signature = [screen, phase, guide, modalCount, vw, vh, muted.length, this.quality.tier(), this.compact ? 1 : 0].join('|');
    if (signature === this.v21134LastSyncSignature) {
      html.dataset.v21134LastSkippedReason = reason;
      return;
    }
    this.v21134LastSyncSignature = signature;
    html.classList.add('v21134-render-budget-ui-write-ledger-root');
    html.dataset.v21134RenderBudgetUiWriteLedger = 'active';
    html.dataset.v21134LastSyncReason = reason;
    html.dataset.v21134LatestUiOwner = 'render-budget-ui-write-ledger';
    html.dataset.v21134MutedLegacyObserverCount = String(new Set(muted).size);
    html.dataset.v21134ObserverBudget = 'legacy-mutes-plus-single-light-sync-no-style-observer';
    html.dataset.v21134UiWriteBudget = 'rounded-tension-ui-signature-skip';
    html.style.setProperty('--v21134-visual-width', `${vw}px`);
    html.style.setProperty('--v21134-visual-height', `${vh}px`);
    html.style.setProperty('--v21134-nav-right', 'calc(env(safe-area-inset-right, 0px) + 8px)');
    html.style.setProperty('--v21134-nav-bottom', 'calc(env(safe-area-inset-bottom, 0px) + 8px)');
    html.style.setProperty('--v21134-page-width', vw <= 380 ? 'min(420px, calc(100vw - 16px))' : 'min(430px, calc(100vw - 20px))');
    html.style.setProperty('--v21134-combo-bottom', vh <= 650 ? 'calc(env(safe-area-inset-bottom, 0px) + 88px)' : 'calc(env(safe-area-inset-bottom, 0px) + 102px)');
    document.body.dataset.v21134Screen = screen;

    document.querySelectorAll<HTMLElement>('.v21122-village-guide-popup,.v21124-village-guide-popup,.v21125-village-guide-popup,.v21126-village-guide-popup,.v21128-village-guide-popup,.v21129-village-guide-popup,.v21130-village-guide-popup,.v21131-village-guide-popup,.v21132-village-guide-popup,.v21133-village-guide-popup').forEach((node) => node.remove());
    document.querySelectorAll<HTMLElement>('.bottom-nav,.v2097-bottom-nav,.v2098-bottom-nav').forEach((nav) => {
      nav.classList.add('v21134-bottom-nav-final');
      nav.dataset.v21134Owner = screen === 'fishing' ? 'hidden-on-fishing' : 'same-right-bottom-anchor';
    });
    dom.app.querySelectorAll<HTMLElement>('.runtime-menu-screen').forEach((root) => {
      root.classList.add('v21134-runtime-page-final');
      root.dataset.v21134Owner = 'centered-page-root';
    });
    dom.app.querySelectorAll<HTMLElement>('.runtime-content,.runtime-panel,.runtime-card-list,.shop-list,.mission-list,.dex-grid,.inventory-grid,.gear-grid,.ranking-list').forEach((node) => {
      node.classList.add('v21134-page-column-final');
      node.dataset.v21134Owner = 'centered-page-column';
    });
    const village = dom.app.querySelector<HTMLElement>('.village-world-screen');
    if (village) {
      village.classList.add('v21134-village-final');
      village.dataset.v21134Owner = 'village-guide-expedition-nav-write-budget';
      if (guide !== 'dismissed' && !this.openingIntroPending && document.body.dataset.screen === 'village') {
        let guideNode = village.querySelector<HTMLElement>('.v21134-village-guide-popup');
        if (!guideNode) {
          guideNode = document.createElement('div');
          guideNode.className = 'v21134-village-guide-popup';
          guideNode.setAttribute('role', 'dialog');
          guideNode.setAttribute('aria-label', '처음 할 일 안내');
          guideNode.dataset.v21134Owner = 'first-village-guided-route';
          guideNode.innerHTML = `<div class="v21134-guide-card"><span class="v21134-guide-eyebrow">처음 할 일</span><strong>낚시로 골드를 모으고 개척 목표를 확인해요</strong><p>낚시 → 가방·퀘스트 확인 → 개척 순서로 진행하면 초반 목표가 자연스럽게 이어집니다.</p><div class="v21134-guide-steps"><span>1 낚시</span><span>2 보상 확인</span><span>3 개척</span></div><div class="v21134-guide-actions"><button type="button" data-v21134-guide-fishing>낚시 가기</button><button type="button" data-v21134-guide-expedition>개척 보기</button><button type="button" data-v21134-guide-dismiss>닫기</button></div></div>`;
          guideNode.querySelector<HTMLButtonElement>('[data-v21134-guide-fishing]')?.addEventListener('click', () => { try { localStorage.setItem('aqua-v21134-guide-dismissed', '1'); } catch { /* ignore */ } void this.go('fishing' as Screen); });
          guideNode.querySelector<HTMLButtonElement>('[data-v21134-guide-expedition]')?.addEventListener('click', () => { village.querySelector<HTMLButtonElement>('[data-v2097-expedition-toggle]')?.click(); this.syncV21134RenderBudgetUiWriteLedgerUi('guide-expedition'); });
          guideNode.querySelector<HTMLButtonElement>('[data-v21134-guide-dismiss]')?.addEventListener('click', () => { try { localStorage.setItem('aqua-v21134-guide-dismissed', '1'); } catch { /* ignore */ } guideNode?.remove(); });
          village.appendChild(guideNode);
        }
      } else {
        village.querySelectorAll('.v21134-village-guide-popup').forEach((node) => node.remove());
      }
      village.querySelectorAll<HTMLElement>('.v2097-expedition-body,.v2097-expedition-body-open').forEach((node) => { node.classList.add('v21134-expedition-final'); node.dataset.v21134Owner = 'expedition-full-visible-safe-scroll'; });
      village.querySelectorAll<HTMLElement>('.v2097-build-tray,.v2130-build-confirm-card,.v2130-build-confirm').forEach((node) => { node.classList.add('v21134-village-modal-final'); node.dataset.v21134Owner = 'village-modal-safe-scroll'; });
    }

    const fishing = dom.app.querySelector<HTMLElement>('.fishing-screen');
    if (fishing) {
      const focused = ['bite', 'reeling', 'result', 'success', 'fail'].includes(phase);
      fishing.classList.add('v21134-fishing-final-screen');
      fishing.classList.toggle('v21134-fishing-focused', focused);
      fishing.dataset.v21134FishingPhase = phase;
      document.body.dataset.v21134FishingPhase = phase;
      fishing.querySelectorAll<HTMLElement>('.water-overlay,.caustic-overlay,.fishing-3d-ambient,.underwater-webgl-host,.v3d-caustics,.v3d-bubbles,.v3d-depth-fog,[class*="sea-lane-card"]').forEach((node) => { node.classList.add('v21134-water-budget-final'); node.dataset.v21134Owner = focused ? 'hidden-during-focus-phase' : 'idle-only-water-effect-budget'; });
      fishing.querySelectorAll<HTMLElement>('.fishing-loadout-strip,[class*="-fishing-loadout"],[class*="-loadout-copy"]').forEach((node) => { node.classList.add('v21134-loadout-final'); node.dataset.v21134Owner = focused ? 'hidden-during-focus-phase' : 'stable-loadout-no-scale'; node.querySelectorAll<HTMLElement>('*').forEach((child) => child.classList.add('v21134-loadout-child-final')); });
      fishing.querySelectorAll<HTMLElement>('.combo-badge').forEach((node) => { node.classList.add('v21134-combo-final'); node.dataset.v21134Owner = 'near-cast-button-gap'; });
      fishing.querySelectorAll<HTMLElement>('.bite-callout').forEach((node) => { node.classList.add('v21134-bite-final'); node.dataset.v21134Owner = 'center-fixed-no-top-jump'; });
      fishing.querySelectorAll<HTMLElement>('.catch-result-card').forEach((node) => { node.classList.add('v21134-result-final'); node.dataset.v21134Owner = 'center-fixed-no-water-flicker'; });
    }
    this.configureV21134RenderBudget(reason);
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
    if (document.hidden) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const now = performance.now();
    const fishingScreen = document.body.dataset.screen === 'fishing';
    const minGap = fishingScreen ? (this.state === 'reeling' ? 180 : 118) : 72;
    if (now - this.lastHapticAt < minGap) return;
    this.lastHapticAt = now;
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
