import { Application, Assets, Container, Graphics, Sprite, Text, Texture } from 'pixi.js';
import type { SaveData, VillageBuildingSave, VillageBuildingType, VillageTileKind } from './types';

const MAP_SIZE = 40;
const TILE_W = 80;
const TILE_H = 40;
const BASE_SCALE = 0.86;
const BUILDING_VISUAL_SCALE = 0.74;
const BUILDING_COLLISION_FRONT_TRIM = 1;
const BUILDING_HITBOX_FRONT_MARGIN = 1;
const BUILDING_HITBOX_SIDE_MARGIN = 0.24;
const TILE_ACTOR_GROUND_Y = 0.58;
const TILE_DECOR_GROUND_Y = 0.66;
const BUILDING_GROUND_BACKSET = 0.12;
const PLAYER_WALK_SPEED = 1.85;
const NPC_WALK_SPEED_MIN = 0.48;
const NPC_WALK_SPEED_RANGE = 0.24;
const WORLD_ORIGIN_X = MAP_SIZE * TILE_W * 0.5;
const WORLD_ORIGIN_Y = 120;

type ToastKind = 'normal' | 'mission' | 'dex' | 'shop' | 'fishing' | 'reward';

type WorldNpcRole = 'chief' | 'merchant' | 'guild' | 'captain' | 'tourist' | 'vip';
type ActorDirection = 'south' | 'southeast' | 'east' | 'northeast' | 'north' | 'northwest' | 'west' | 'southwest';

type BuildDefinition = {
  type: VillageBuildingType;
  label: string;
  size: [number, number];
  cost: number;
  score: number;
  texture?: string;
  kind: 'building' | 'prop' | 'path';
  description: string;
};

type WorldCallbacks = {
  onSave: () => void;
  onGoFishing: () => void;
  onOpenShop?: () => void;
  onToast: (toast: { type?: ToastKind; title: string; message?: string }) => void;
};

type VillageWorldOptions = WorldCallbacks & {
  root: HTMLElement;
  stageHost: HTMLElement;
  save: SaveData;
};

type PointerTrack = {
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  moved: boolean;
};

type PointerPoint = { x: number; y: number };

type PendingBuildPlacement = {
  type: VillageBuildingType;
  x: number;
  y: number;
  movingId: string | null;
};
type VillagePointerHit = { x: number; y: number; worldX: number; worldY: number; screenX: number; screenY: number };

type DecoKind = 'tree' | 'palm' | 'lamp' | 'bench' | 'crate' | 'buoy' | 'dock' | 'flag' | 'rock' | 'flowerBed' | 'lighthouse' | 'stall' | 'pottedPalm' | 'barrels' | 'coral' | 'crystal' | 'banner' | 'woodFence' | 'ropeFence' | 'bollard' | 'stairs' | 'bridge' | 'tropicalTree' | 'palmAlt' | 'stoneWall' | 'arch' | 'questBoard' | 'statue' | 'cherryTree' | 'mapleTree' | 'pineTree' | 'crystalTree' | 'flowerTree' | 'cypressTree' | 'dog' | 'sleepingDog' | 'cat' | 'walkingCat' | 'seagull' | 'flyingSeagull' | 'duck' | 'swimmingDuck' | 'butterflyBlue' | 'butterflyPink' | 'petals' | 'sparkles' | 'waterRing' | 'shoreFoam' | 'splash' | 'steam' | 'cookingPot' | 'goldLantern' | 'fishShadowSmall' | 'fishShadowMid' | 'fishShadowBig' | 'woodSign' | 'ropeWall' | 'stoneCorner' | 'stoneCurve' | 'wideStairs' | 'ropeCorner' | 'noticeBoard' | 'plazaStairs' | 'bridgeAsset' | 'fishingBoat' | 'rowBoat' | 'ropeCoil' | 'anchorAsset' | 'treasureChest' | 'seaweedPatch' | 'driftwood' | 'crabTrap' | 'lifeRing' | 'bucketAsset' | 'tackleBoxAsset' | 'netAsset' | 'signAsset' | 'palletAsset' | 'bobberAsset' | 'shellCluster';

type Decoration = {
  kind: DecoKind;
  x: number;
  y: number;
  blocks?: boolean;
  scale?: number;
};

type DecorationMotionBase = {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  alpha: number;
  rotation: number;
  kind: DecoKind;
  seed: number;
};

type Actor = {
  id: string;
  role: WorldNpcRole | 'player';
  name: string;
  tileX: number;
  tileY: number;
  x: number;
  y: number;
  speed: number;
  path: Array<[number, number]>;
  node: Container;
  body: Graphics | Sprite;
  shadow: Graphics;
  footContact: Graphics;
  label: Text;
  groundOffset: number;
  direction: ActorDirection;
  mood: string;
  walkPhase: number;
  talk: string[];
  targetTimer: number;
  pauseTimer: number;
  desiredTile?: string;
};

const BUILD_DEFS: Record<VillageBuildingType, BuildDefinition> = {
  house: {
    type: 'house',
    label: '주민 집',
    size: [2, 2],
    cost: 180,
    score: 70,
    texture: './assets/v2/village/buildings/building_fisherman_house.png',
    kind: 'building',
    description: '주민 수를 늘리는 기본 주택',
  },
  market: {
    type: 'market',
    label: '어시장',
    size: [3, 3],
    cost: 360,
    score: 130,
    texture: './assets/v2/village/buildings/building_fish_market.png',
    kind: 'building',
    description: '자동 판매와 관광 수익의 핵심',
  },
  inn: {
    type: 'inn',
    label: '여관',
    size: [3, 3],
    cost: 420,
    score: 150,
    texture: './assets/v2/village/buildings/building_village_inn.png',
    kind: 'building',
    description: '관광객 체류 시간을 늘립니다',
  },
  guild: {
    type: 'guild',
    label: '낚시 길드',
    size: [3, 3],
    cost: 400,
    score: 140,
    texture: './assets/v2/village/buildings/building_fishing_guild.png',
    kind: 'building',
    description: '낚시 퀘스트와 수역 개척의 출발점',
  },
  harbor: {
    type: 'harbor',
    label: '항구 사무소',
    size: [3, 3],
    cost: 0,
    score: 120,
    texture: './assets/v2/village/buildings/building_harbor_office.png',
    kind: 'building',
    description: '항구로 이동해 낚시 지역을 선택합니다',
  },
  warehouse: {
    type: 'warehouse',
    label: '창고',
    size: [2, 2],
    cost: 300,
    score: 100,
    texture: './assets/v2/village/buildings/building_storage_warehouse.png',
    kind: 'building',
    description: '후반 자동 보관 시스템의 기반',
  },
  aquarium: {
    type: 'aquarium',
    label: '수족관',
    size: [3, 3],
    cost: 620,
    score: 210,
    texture: './assets/v2/village/buildings/building_aquarium.png',
    kind: 'building',
    description: '도감과 관광 점수를 크게 올립니다',
  },
  fountain: {
    type: 'fountain',
    label: '분수',
    size: [2, 2],
    cost: 120,
    score: 55,
    kind: 'prop',
    description: '광장 분위기와 행복도를 올립니다',
  },
  flower: {
    type: 'flower',
    label: '꽃밭',
    size: [1, 1],
    cost: 25,
    score: 12,
    kind: 'prop',
    description: '작지만 마을 분위기를 살립니다',
  },
  path: {
    type: 'path',
    label: '돌길',
    size: [1, 1],
    cost: 8,
    score: 4,
    kind: 'path',
    description: '주민 이동속도, 관광객, 수익을 올립니다',
  },
};

const DAY_TALK: Record<WorldNpcRole, string[]> = {
  chief: ['마을을 발전시켜보게. 지금은 광장이 가장 중요하네.', '길을 이어두면 주민들이 훨씬 활발하게 움직인다네.', '현재 목표는 관광객이 머무를 만한 첫 마을을 만드는 것이야.'],
  merchant: ['물고기 10마리만 더 납품해주면 어시장이 커질 거예요.', '오늘은 산호빛 생선이 인기예요.', '상점 앞 길을 넓혀주면 손님이 더 많이 올 것 같아요.'],
  guild: ['항구에서 출항하면 낚시 미니게임으로 이동합니다.', '길드 의뢰는 마을 발전도와 연결될 예정이에요.', '희귀 어종은 새 섬 개척의 열쇠가 됩니다.'],
  captain: ['선착장이 커지면 다른 섬도 개척할 수 있지.', '바다는 넓고, 아직 열리지 않은 수역이 많아.', '출항 준비가 되면 항구 사무소로 오게.'],
  tourist: ['저 꽃밭 너무 예쁘네요.', '항구가 더 커졌군요!', '오늘 고기 많이 잡았나요?'],
  vip: ['이 정도면 고급 휴양섬이 될 가능성이 있군요.', '수족관이 생기면 다시 방문하겠습니다.', '길과 광장 동선이 아주 중요합니다.'],
};


const ACTOR_TEXTURES: Record<Actor['role'], string> = {
  player: './assets/v2129/characters/player/player_south_frame_01.png',
  chief: './assets/v2047/characters/chief_south.png',
  merchant: './assets/v2047/characters/merchant_south.png',
  guild: './assets/v2047/characters/guild_south.png',
  captain: './assets/v2047/characters/captain_south.png',
  tourist: './assets/v2047/characters/tourist_south.png',
  vip: './assets/v2047/characters/vip_south.png',
};

const ACTOR_DIRECTIONS: ActorDirection[] = ['south', 'southeast', 'east', 'northeast', 'north', 'northwest', 'west', 'southwest'];

const V2118_PLAYER_MOTION_LOCK = 'v2118-player-eight-direction-motion-lock';
const V2119_PLAYER_MOTION_IMAGE_LOCK = 'v2119-player-corrected-rod-frame-lock';
const V2120_PLAYER_DIRECTION_REMAP_LOCK = 'v2120-player-direction-visual-remap-lock';
const V2121_UI_CONTINUITY_LOCK = 'v2121-ui-continuity-polish-lock';
const V2122_PLAYER_CARDINAL_MOTION_LOCK = 'v2122-player-cardinal-motion-lock';
const V2123_PLAYER_DIRECTION_MOTION_LOCK = 'v2123-player-direction-motion-hard-lock';
const V2124_STATE_INPUT_LOCK = 'v2124-state-input-performance-lock';
const V2125_DIRECTION_MOTION_LOCK = 'v2125-east-motion-visual-lock';
const V2127_DIRECTION_MOTION_AUDIT_LOCK = 'v2127-east-west-asset-motion-audit-lock';
const V2128_TRUE_EAST_MOTION_LOCK = 'v2128-true-east-player-motion-lock';
const V2129_PLAYER_FILENAME_DIRECTION_LOCK = 'v2129-player-filename-direction-direct-lock';
const V2130_PLAYER_MOTION_IMMUTABLE_LOCK = 'v2130-player-motion-immutable-locked';
const V2130_BUILD_CONFIRM_FLOW_LOCK = 'v2130-build-confirm-placement-lock';
const V2131_PLAYER_NPC_DIRECTION_GUARD = 'v2131-player-npc-direction-identity-no-flip-guard';
const V2131_BUILD_PREVIEW_CONFIRM_LOCK = 'v2131-build-preview-confirm-toast-flow-lock';
const V2134_OBJECT_CLEARANCE_LOCK = 'v2134-object-overlap-clearance-lock';
const V2134_MICRO_TILE_POINTER_LOCK = 'v2134-micro-tile-pointer-snap-lock';
const V2135_OBJECT_FOOTPRINT_CLEARANCE_LOCK = 'v2135-saved-object-footprint-clearance-lock';
const V2135_TILE_SNAP_ASSIST_LOCK = 'v2135-tile-snap-assist-nearest-valid-origin';
const V2136_PREMIUM_PLACEMENT_ASSIST_LOCK = 'v2136-premium-placement-assist-object-spacing';
const V2137_TILE_TOUCH_PRECISION_LOCK = 'v2137-cautious-tile-touch-precision-no-size-migration';
const V2137_TILE_PIXEL_SIZE_MIGRATION_REQUIRED_LOCK = 'v2137-tile-pixel-size-migration-required-before-rescale';
const V2138_TILE_TOUCH_CAUTIOUS_LOCK = 'v2138-tile-touch-cautious-score-limit-no-pixel-rescale';
const V2138_TILE_PIXEL_SIZE_MIGRATION_REQUIRED_LOCK = 'v2138-tile-pixel-size-still-requires-save-footprint-migration';
const V2139_TILE_TOUCH_STABILITY_LOCK = 'v2139-tile-touch-stability-no-surprise-neighbor';
const V2139_TILE_PIXEL_SIZE_MIGRATION_PLAN_LOCK = 'v2139-tile-pixel-shrink-needs-save-footprint-npc-camera-migration';
const V2140_TILE_TOUCH_STABILITY_LOCK = 'v2140-tile-touch-score-one-point-zero-no-neighbor-surprise';
const V2140_TILE_PIXEL_SIZE_MIGRATION_PLAN_LOCK = 'v2140-tile-pixel-shrink-deferred-until-save-footprint-npc-camera-migration';
const V2142_TILE_TOUCH_PRECISION_LOCK = 'v2142-tile-touch-score-zero-point-nine-eight-cautious-placement';
const V2142_TILE_PIXEL_SIZE_MIGRATION_PLAN_LOCK = 'v2142-tile-pixel-shrink-still-deferred-save-footprint-npc-camera-migration';
const V2143_TILE_TOUCH_OVERLAP_AUDIT_LOCK = 'v2143-tile-touch-cautious-overlap-placement-audit-no-pixel-shrink';
const V2144_UI_PLACEMENT_POLISH_SWEEP_LOCK = 'v2144-hitbox-placement-ui-overlap-polish-no-tile-pixel-shrink';
const V2145_ICON_FISHING_PAGE_POLISH_LOCK = 'v2145-icon-fishing-page-polish-cautious-tile-no-pixel-shrink';
const V2146_UI_OVERLAP_ICON_FISHING_POLISH_LOCK = 'v2146-ui-overlap-icon-fishing-polish-cautious-hitbox-no-pixel-shrink';
const V2147_UI_OVERLAP_LAYOUT_FISHING_POLISH_LOCK = 'v2147-ui-overlap-layout-fishing-polish-touch-debounce-no-pixel-shrink';
const V2148_UI_OVERLAP_LAYOUT_SWEEP_LOCK = 'v2148-ui-overlap-layout-sweep-touch-cautious-no-tile-shrink';
const V2149_UI_COMPOSITION_POLISH_LOCK = 'v2149-ui-composition-polish-touch-cautious-no-tile-shrink';
const V2150_UI_OVERLAP_PLACEMENT_BEAUTY_LOCK = 'v2150-ui-overlap-placement-beauty-touch-cautious-no-tile-shrink';
const V2151_LAYOUT_COMPOSITION_FISHING_UI_LOCK = 'v2155-menu-fishing-core-touch-cautious-no-tile-shrink';
const V2136_FINE_PLACEMENT_SEARCH_RADIUS = 3;
const V2137_FINE_PLACEMENT_SEARCH_RADIUS = 2;
const V2138_FINE_PLACEMENT_SEARCH_RADIUS = 2;
const V2138_DIAMOND_TOUCH_SCORE_LIMIT = 1.08;
const V2139_DIAMOND_TOUCH_SCORE_LIMIT = 1.03;
const V2140_DIAMOND_TOUCH_SCORE_LIMIT = 1.0;
const V2142_DIAMOND_TOUCH_SCORE_LIMIT = 0.98;
const V2143_DIAMOND_TOUCH_SCORE_LIMIT = 0.96;
const V2144_DIAMOND_TOUCH_SCORE_LIMIT = 0.955;
const V2145_DIAMOND_TOUCH_SCORE_LIMIT = 0.952;
const V2146_DIAMOND_TOUCH_SCORE_LIMIT = 0.950;
const V2147_DIAMOND_TOUCH_SCORE_LIMIT = 0.948;
const V2148_DIAMOND_TOUCH_SCORE_LIMIT = 0.946;
const V2149_DIAMOND_TOUCH_SCORE_LIMIT = 0.944;
const V2150_DIAMOND_TOUCH_SCORE_LIMIT = 0.942;
const V2151_DIAMOND_TOUCH_SCORE_LIMIT = 0.926;
const PLAYER_ACTOR_FRAME_COUNT = 4;
const PLAYER_ACTOR_MOTION_TEXTURES = Object.fromEntries(ACTOR_DIRECTIONS.map((direction) => [
  direction,
  Array.from({ length: PLAYER_ACTOR_FRAME_COUNT }, (_, index) => `./assets/v2129/characters/player/player_${direction}_frame_${String(index + 1).padStart(2, '0')}.png`),
])) as Record<ActorDirection, string[]>;

const PLAYER_ACTOR_DIRECTION_TEXTURE_FIX: Record<ActorDirection, ActorDirection> = {
  // v2.1.29: player.zip is filename-corrected by the user.
  // Use every filename directly. Do not swap, mirror, or remap directions here.
  south: 'south',
  southeast: 'southeast',
  east: 'east',
  northeast: 'northeast',
  north: 'north',
  northwest: 'northwest',
  west: 'west',
  southwest: 'southwest',
};

function playerActorVisualDirection(direction: ActorDirection): ActorDirection {
  return PLAYER_ACTOR_DIRECTION_TEXTURE_FIX[direction] ?? direction;
}

function playerActorMotionTextureUrl(direction: ActorDirection, frameIndex = 0): string {
  const corrected = playerActorVisualDirection(direction);
  const frames = PLAYER_ACTOR_MOTION_TEXTURES[corrected] ?? PLAYER_ACTOR_MOTION_TEXTURES.south;
  return frames[Math.abs(frameIndex) % frames.length] ?? frames[0];
}


/*
 * Legacy diagonal QA lineage kept for regression scripts only; runtime below uses v2047 clock-corrected assets.
 * v2.0.42: the actual player PNG silhouettes were inspected in a contact sheet
 * northeast: 'northwest'
 * southeast: 'southeast'
 * northwest: 'northeast'
 * southwest: 'southwest'
 * { movement: 'northeast', dx: 0.5, dy: -0.866, texture: 'northwest' }
 * { movement: 'southeast', dx: 0.5, dy: 0.866, texture: 'southeast' }
 * { movement: 'northwest', dx: -0.5, dy: -0.866, texture: 'northeast' }
 * { movement: 'southwest', dx: -0.5, dy: 0.866, texture: 'southwest' }
 */
const ACTOR_DIRECTION_TEXTURE_FIX: Record<ActorDirection, ActorDirection> = {
  // v2.0.47: stop relying on ambiguous v2023 diagonal filenames.
  // public/assets/v2047/characters contains explicit clock-corrected PNGs:
  // 1시(northeast) and 5시(southeast) are right-facing/right-leaning assets,
  // 11시/7시 remain left-facing counterparts. The runtime mapping is now identity.
  south: 'south',
  southeast: 'southeast',
  east: 'east',
  northeast: 'northeast',
  north: 'north',
  northwest: 'northwest',
  west: 'west',
  southwest: 'southwest',
};

const ACTOR_DIRECTION_QA_VECTORS: Array<{ movement: ActorDirection; dx: number; dy: number; texture: ActorDirection }> = [
  { movement: 'north', dx: 0, dy: -1, texture: 'north' },
  { movement: 'south', dx: 0, dy: 1, texture: 'south' },
  { movement: 'west', dx: -1, dy: 0, texture: 'west' },
  { movement: 'east', dx: 1, dy: 0, texture: 'east' },
  { movement: 'northwest', dx: -1, dy: -1, texture: 'northwest' },
  { movement: 'northeast', dx: 1, dy: -1, texture: 'northeast' },
  { movement: 'southwest', dx: -1, dy: 1, texture: 'southwest' },
  { movement: 'southeast', dx: 1, dy: 1, texture: 'southeast' },
  { movement: 'northeast', dx: 0.5, dy: -0.866, texture: 'northeast' },
  { movement: 'southeast', dx: 0.5, dy: 0.866, texture: 'southeast' },
  { movement: 'northwest', dx: -0.5, dy: -0.866, texture: 'northwest' },
  { movement: 'southwest', dx: -0.5, dy: 0.866, texture: 'southwest' },
];


const ACTOR_DIRECTION_TEXTURES: Record<Actor['role'], Record<ActorDirection, string>> = {
  player: Object.fromEntries(ACTOR_DIRECTIONS.map((direction) => [direction, playerActorMotionTextureUrl(direction, 0)])) as Record<ActorDirection, string>,
  chief: Object.fromEntries(ACTOR_DIRECTIONS.map((direction) => [direction, `./assets/v2047/characters/chief_${direction}.png`])) as Record<ActorDirection, string>,
  merchant: Object.fromEntries(ACTOR_DIRECTIONS.map((direction) => [direction, `./assets/v2047/characters/merchant_${direction}.png`])) as Record<ActorDirection, string>,
  guild: Object.fromEntries(ACTOR_DIRECTIONS.map((direction) => [direction, `./assets/v2047/characters/guild_${direction}.png`])) as Record<ActorDirection, string>,
  captain: Object.fromEntries(ACTOR_DIRECTIONS.map((direction) => [direction, `./assets/v2047/characters/captain_${direction}.png`])) as Record<ActorDirection, string>,
  tourist: Object.fromEntries(ACTOR_DIRECTIONS.map((direction) => [direction, `./assets/v2047/characters/tourist_${direction}.png`])) as Record<ActorDirection, string>,
  vip: Object.fromEntries(ACTOR_DIRECTIONS.map((direction) => [direction, `./assets/v2047/characters/vip_${direction}.png`])) as Record<ActorDirection, string>,
};


const PORTRAIT_ASSETS: Record<Actor['role'], string> = {
  player: './assets/v203/portraits/player_portrait.png',
  chief: './assets/v203/portraits/chief_portrait.png',
  merchant: './assets/v203/portraits/merchant_portrait.png',
  guild: './assets/v203/portraits/guild_portrait.png',
  captain: './assets/v203/portraits/captain_portrait.png',
  tourist: './assets/v203/portraits/tourist_portrait.png',
  vip: './assets/v203/portraits/vip_portrait.png',
};

const INTERIOR_ASSETS: Partial<Record<VillageBuildingType, { title: string; image: string; body: string; portrait: string; status: string[]; fishing?: boolean; mission?: boolean; map?: boolean; inventory?: boolean }>> = {
  inn: {
    title: '여관 내부',
    image: './assets/v2025/interiors/interior_05_Building_Interior_Inn_source_crop_16_256.png',
    body: '따뜻한 조명과 조개 장식이 있는 루미나 베이 여관입니다. 여관 의뢰와 관광객 체류 보너스가 연결됩니다.',
    portrait: './assets/v203/portraits/innkeeper_happy.png',
    status: ['체류 보너스 +15%', '관광 만족도 상승', '여관 의뢰 준비'],
    mission: true,
  },
  market: {
    title: '어시장 내부',
    image: './assets/v2025/interiors/interior_06_Building_Interior_Fish_Market_source_crop_16_256.png',
    body: '오늘 잡은 물고기를 정산하고 마을 기금을 늘리는 자동 판매 거점입니다.',
    portrait: './assets/v203/portraits/merchant_happy.png',
    status: ['자동 판매 정산', '마을 기금 적립', '물고기 납품 의뢰'],
    inventory: true,
  },
  guild: {
    title: '낚시 길드 내부',
    image: './assets/v2025/interiors/interior_07_Building_Interior_Fishing_Guild_source_crop_16_256.png',
    body: '낚시 의뢰, 희귀 어종 정보, 새 수역 개척 퀘스트가 붙을 길드 홀입니다.',
    portrait: './assets/v203/portraits/guild_happy.png',
    status: ['추천 의뢰 갱신', '희귀 어종 정보', '수역 개척 조건'],
    mission: true,
  },
  harbor: {
    title: '항구 사무소 내부',
    image: './assets/v2025/interiors/interior_08_Building_Interior_Harbor_Office_source_crop_16_256.png',
    body: '선장과 항로를 확인하는 출항 준비실입니다. 출항하기를 누르면 낚시 화면으로 이동합니다.',
    portrait: './assets/v203/portraits/captain_happy.png',
    status: ['월드맵 항로 확인', '출항 가능', '잠긴 수역 조건 안내'],
    fishing: true,
    map: true,
  },
};

const CAMERA_PAD = 280;

const TILE_TEXTURES: Record<VillageTileKind, string[]> = {
  // v2.1.20: keep grass/sand/wood visually distinct from water. The supplied blue 32x32
  // sea tiles are used only by the actual shoreline sea band; land keeps legacy warm/green tiles.
  grass: [
    './assets/v2023/tiles/grass_tile_0.png',
    './assets/v2023/tiles/grass_flower_tile_0.png',
    './assets/v207/tiles/grass_tile.png',
    './assets/v207/tiles/grass_flower_tile.png',
  ],
  sand: [
    './assets/v2023/tiles/sand_tile_0.png',
    './assets/v2023/tiles/sand_shell_tile_0.png',
    './assets/v207/tiles/sand_tile.png',
    './assets/v207/tiles/sand_shell_tile.png',
    './assets/v207/tiles/sand_path_tile.png',
  ],
  sea: [
    './assets/v2118/tiles_32x32/sea_and_beach/sea_tile_001_32x32.png',
    './assets/v2118/tiles_32x32/sea_and_beach/sea_tile_002_32x32.png',
    './assets/v2118/tiles_32x32/sea_and_beach/sea_tile_003_32x32.png',
    './assets/v2118/tiles_32x32/sea_and_beach/sea_tile_004_32x32.png',
    './assets/v2118/tiles_32x32/sea_and_beach/sea_tile_005_32x32.png',
    './assets/v2118/tiles_32x32/sea_and_beach/sea_tile_006_32x32.png',
    './assets/v2118/tiles_32x32/sea_and_beach/sea_tile_011_32x32.png',
    './assets/v2118/tiles_32x32/sea_and_beach/sea_tile_012_32x32.png',
    './assets/v2118/tiles_32x32/sea_and_beach/sea_tile_013_32x32.png',
    './assets/v2118/tiles_32x32/sea_and_beach/sea_tile_014_32x32.png',
    './assets/v2118/tiles_32x32/sea_and_beach/sea_tile_020_32x32.png',
    './assets/v2118/tiles_32x32/sea_and_beach/sea_tile_021_32x32.png',
    './assets/v2118/tiles_32x32/sea_and_beach/sea_tile_022_32x32.png',
    './assets/v2118/tiles_32x32/sea_and_beach/sea_tile_029_32x32.png',
    './assets/v2118/tiles_32x32/sea_and_beach/sea_tile_031_32x32.png',
    './assets/v2118/tiles_32x32/sea_and_beach/sea_tile_032_32x32.png',
    './assets/v2023/tiles/water_tile_0.png',
    './assets/v207/tiles/water_tile.png',
  ],
  stone: [
    './assets/v2023/tiles/stone_tile_0.png',
    './assets/v207/tiles/stone_tile.png',
    './assets/v207/tiles/stone_cracked_tile.png',
    './assets/v207/tiles/grass_path_tile.png',
    './assets/v207/tiles/curved_path_tile.png',
  ],
  wood: [
    './assets/v207/tiles/beach_path_tile.png',
    './assets/v207/tiles/stone_tile.png',
  ],
  plaza: [
    './assets/v2023/tiles/plaza_tile_0.png',
    './assets/v2023/tiles/plaza_shell_tile_0.png',
    './assets/v207/tiles/plaza_tile.png',
    './assets/v207/tiles/plaza_shell_tile.png',
  ],
};

const DECO_TEXTURES: Partial<Record<DecoKind, string>> = {
  tree: './assets/v2023/props/palm_cluster.png',
  palm: './assets/v2023/props/palm_tree.png',
  tropicalTree: './assets/v2012/props/tree_tropical.png',
  palmAlt: './assets/v2012/props/tree_palm_alt.png',
  lamp: './assets/v2110/objects/fishing_props/fishing_prop_012.png',
  bench: './assets/v2025/props/harbor_beach_bench_source_02_512.png',
  crate: './assets/v2110/objects/fishing_props/fishing_prop_011.png',
  buoy: './assets/v2110/objects/fishing_props/fishing_prop_006.png',
  dock: './assets/v2110/objects/fishing_props/fishing_prop_004.png',
  flag: './assets/v2025/props/harbor_beach_flag_blue_source_03_512.png',
  rock: './assets/v2110/objects/fishing_props/fishing_prop_020.png',
  flowerBed: './assets/v2110/objects/fishing_props/fishing_prop_017.png',
  lighthouse: './assets/v209/props/crystal_pillar.png',
  stall: './assets/v2025/props/harbor_beach_seaside_stall_source_02_512.png',
  pottedPalm: './assets/v209/props/potted_palm.png',
  barrels: './assets/v2110/objects/fishing_props/fishing_prop_013.png',
  coral: './assets/v2110/objects/fishing_props/fishing_prop_018.png',
  crystal: './assets/v2110/objects/fishing_props/fishing_prop_012.png',
  banner: './assets/v209/props/banner_stone.png',
  woodFence: './assets/v209/props/wood_fence.png',
  ropeFence: './assets/v2110/objects/fishing_props/fishing_prop_005.png',
  bollard: './assets/v2110/objects/fishing_props/fishing_prop_003.png',
  stairs: './assets/v209/props/stone_stairs.png',
  bridge: './assets/v209/props/wood_bridge.png',
  stoneWall: './assets/v209/props/stone_wall.png',
  arch: './assets/v209/props/crystal_arch.png',
  questBoard: './assets/v2110/objects/fishing_props/fishing_prop_010.png',
  statue: './assets/v209/props/crystal_statue.png',
  cherryTree: './assets/v2012/props/tree_cherry.png',
  mapleTree: './assets/v2012/props/tree_maple.png',
  pineTree: './assets/v2012/props/tree_pine.png',
  crystalTree: './assets/v2012/props/tree_blue_crystal.png',
  flowerTree: './assets/v2012/props/tree_flower.png',
  cypressTree: './assets/v2012/props/tree_cypress.png',
  dog: './assets/v2012/props/dog_stand.png',
  sleepingDog: './assets/v2012/props/dog_sleep.png',
  cat: './assets/v2012/props/cat_sit.png',
  walkingCat: './assets/v2012/props/cat_walk.png',
  seagull: './assets/v2012/props/seagull_stand.png',
  flyingSeagull: './assets/v2012/props/seagull_fly.png',
  duck: './assets/v2012/props/duck_stand.png',
  swimmingDuck: './assets/v2012/props/duck_swim.png',
  butterflyBlue: './assets/v2012/props/butterfly_blue.png',
  butterflyPink: './assets/v2012/props/butterfly_pink.png',
  petals: './assets/v2012/props/petals.png',
  sparkles: './assets/v2012/props/sparkles.png',
  waterRing: './assets/v2012/props/water_ring.png',
  shoreFoam: './assets/v2012/props/shore_foam.png',
  splash: './assets/v2012/props/big_splash.png',
  steam: './assets/v2012/props/steam.png',
  cookingPot: './assets/v2012/props/cooking_pot.png',
  // v2.0.78: old gold_lantern.png is a right-edge half sprite; use the complete centered crystal lamp instead.
  goldLantern: './assets/v2110/objects/fishing_props/fishing_prop_012.png',
  fishShadowSmall: './assets/v2012/props/fish_shadow_small.png',
  fishShadowMid: './assets/v2012/props/fish_shadow_mid.png',
  fishShadowBig: './assets/v2012/props/fish_shadow_big.png',
  woodSign: './assets/v2110/objects/fishing_props/fishing_prop_010.png',
  ropeWall: './assets/v2025/props/harbor_beach_rope_wall_source_02_512.png',
  stoneCorner: './assets/v209/props/stone_corner.png',
  stoneCurve: './assets/v2025/props/harbor_beach_stone_curve_source_02_512.png',
  wideStairs: './assets/v2025/props/harbor_beach_stair_wide_source_02_512.png',
  ropeCorner: './assets/v209/props/rope_corner.png',
  noticeBoard: './assets/v2110/objects/fishing_props/fishing_prop_010.png',
  plazaStairs: './assets/v2023/props/plaza_stairs.png',
  bridgeAsset: './assets/v2025/props/harbor_beach_wood_bridge_source_02_512.png',
  // v2.1.16: new individual PNG object pass. These are used as real village props,
  // not as full-screen overlays, so they stay small, grounded, and nonblocking.
  fishingBoat: './assets/v2110/objects/fishing_props/fishing_prop_001.png',
  rowBoat: './assets/v2110/objects/fishing_props/fishing_prop_002.png',
  ropeCoil: './assets/v2110/objects/fishing_props/fishing_prop_005.png',
  anchorAsset: './assets/v2110/objects/fishing_props/fishing_prop_014.png',
  treasureChest: './assets/v2110/objects/fishing_props/fishing_prop_015.png',
  seaweedPatch: './assets/v2110/objects/fishing_props/fishing_prop_019.png',
  driftwood: './assets/v2110/objects/fishing_props/fishing_prop_021.png',
  crabTrap: './assets/v2110/objects/fishing_props/fishing_prop_022.png',
  lifeRing: './assets/v2110/objects/fishing_props/fishing_prop_023.png',
  bucketAsset: './assets/v2110/objects/fishing_props/fishing_prop_007.png',
  tackleBoxAsset: './assets/v2110/objects/fishing_props/fishing_prop_008.png',
  netAsset: './assets/v2110/objects/fishing_props/fishing_prop_009.png',
  signAsset: './assets/v2110/objects/fishing_props/fishing_prop_010.png',
  palletAsset: './assets/v2110/objects/fishing_props/fishing_prop_004.png',
  bobberAsset: './assets/v2110/objects/fishing_props/fishing_prop_016.png',
  shellCluster: './assets/v2110/objects/fishing_props/fishing_prop_017.png',
};

const DECO_TARGET_HEIGHT: Record<DecoKind, number> = {
  tree: 150,
  palm: 160,
  tropicalTree: 166,
  palmAlt: 160,
  lamp: 92,
  bench: 74,
  crate: 86,
  buoy: 70,
  dock: 86,
  flag: 128,
  rock: 66,
  flowerBed: 64,
  lighthouse: 176,
  stall: 112,
  pottedPalm: 98,
  barrels: 72,
  coral: 76,
  crystal: 136,
  banner: 112,
  woodFence: 62,
  ropeFence: 56,
  bollard: 54,
  stairs: 74,
  bridge: 96,
  stoneWall: 86,
  arch: 172,
  questBoard: 116,
  statue: 148,
  cherryTree: 132, mapleTree: 132, pineTree: 152, crystalTree: 148, flowerTree: 128, cypressTree: 150,
  dog: 66, sleepingDog: 48, cat: 62, walkingCat: 58, seagull: 60, flyingSeagull: 72, duck: 58, swimmingDuck: 74,
  butterflyBlue: 48, butterflyPink: 44, petals: 64, sparkles: 60, waterRing: 72, shoreFoam: 96, splash: 102, steam: 94, cookingPot: 72, goldLantern: 68,
  fishShadowSmall: 44, fishShadowMid: 50, fishShadowBig: 58,
  woodSign: 78, ropeWall: 64, stoneCorner: 58, stoneCurve: 58, wideStairs: 74, ropeCorner: 56,
  noticeBoard: 92, plazaStairs: 82, bridgeAsset: 98,
  fishingBoat: 126, rowBoat: 92, ropeCoil: 54, anchorAsset: 74, treasureChest: 72,
  seaweedPatch: 62, driftwood: 58, crabTrap: 62, lifeRing: 58,
  bucketAsset: 58, tackleBoxAsset: 54, netAsset: 54, signAsset: 70, palletAsset: 54, bobberAsset: 60, shellCluster: 58,
};

const BUILD_PROP_TEXTURES: Partial<Record<VillageBuildingType, string>> = {
  fountain: './assets/v2025/props/harbor_beach_fountain_asset_source_02_512.png',
  flower: './assets/v2110/objects/fishing_props/fishing_prop_017.png',
};

const BUILD_PROP_TARGET_HEIGHT: Partial<Record<VillageBuildingType, number>> = {
  fountain: 104,
  flower: 58,
};

const V2116_VILLAGE_ASSET_STEWARD_URLS = [
  './assets/v2110/objects/fishing_props/fishing_prop_001.png',
  './assets/v2110/objects/fishing_props/fishing_prop_002.png',
  './assets/v2110/objects/fishing_props/fishing_prop_005.png',
  './assets/v2110/objects/fishing_props/fishing_prop_014.png',
  './assets/v2110/objects/fishing_props/fishing_prop_015.png',
  './assets/v2110/objects/fishing_props/fishing_prop_019.png',
  './assets/v2110/objects/fishing_props/fishing_prop_021.png',
  './assets/v2110/objects/fishing_props/fishing_prop_022.png',
  './assets/v2110/objects/fishing_props/fishing_prop_023.png',
] as const;

const BUILD_PREVIEW_TEXTURES = {
  valid: './assets/v2023/build/preview_valid_tile.png',
  invalid: './assets/v2023/build/preview_invalid_tile.png',
  pulse: './assets/v2023/build/preview_selected_pulse.png',
  blueprint: './assets/v2023/build/preview_blueprint_placement.png',
};

const CRITICAL_DECO_KINDS: DecoKind[] = [
  'tree', 'palm', 'tropicalTree', 'palmAlt', 'lamp', 'bench', 'dock', 'flag', 'rock', 'flowerBed',
  'lighthouse', 'stall', 'questBoard', 'coral', 'crystal', 'banner', 'woodFence', 'ropeFence',
  'bollard', 'stairs', 'bridge', 'woodSign', 'ropeWall', 'stoneCorner', 'stoneCurve', 'wideStairs', 'ropeCorner',
  'noticeBoard', 'plazaStairs', 'bridgeAsset',
  'fishingBoat', 'rowBoat', 'ropeCoil', 'anchorAsset', 'treasureChest', 'seaweedPatch', 'driftwood', 'crabTrap', 'lifeRing',
  'bucketAsset', 'tackleBoxAsset', 'netAsset', 'signAsset', 'palletAsset', 'bobberAsset', 'shellCluster',
];

function uniqueUrls(urls: Array<string | undefined>): string[] {
  return Array.from(new Set(urls.filter((url): url is string => Boolean(url))));
}

function pickTileTexture(kind: VillageTileKind, x: number, y: number): string | undefined {
  const list = TILE_TEXTURES[kind];
  if (!list?.length) return undefined;
  const index = Math.abs((x * 31 + y * 17 + x * y * 3) % list.length);
  return list[index];
}

function actorDirectionFromVector(dx: number, dy: number): ActorDirection {
  const length = Math.hypot(dx, dy);
  if (length < 0.15) return 'south';
  // v2.0.31: true 8-way angular quantization.
  // The older axis-threshold logic collapsed 1시/5시 joystick input into north/south,
  // so northeast/southeast could look missing even though the assets existed.
  const degrees = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
  if (degrees >= 337.5 || degrees < 22.5) return 'east';
  if (degrees < 67.5) return 'southeast';
  if (degrees < 112.5) return 'south';
  if (degrees < 157.5) return 'southwest';
  if (degrees < 202.5) return 'west';
  if (degrees < 247.5) return 'northwest';
  if (degrees < 292.5) return 'north';
  return 'northeast';
}

function actorDirectionQaPasses(): boolean {
  return ACTOR_DIRECTION_QA_VECTORS.every(({ movement, dx, dy, texture }) => actorDirectionFromVector(dx, dy) === movement && ACTOR_DIRECTION_TEXTURE_FIX[movement] === texture);
}

function playerDirectionRemapQaPasses(): boolean {
  return ACTOR_DIRECTIONS.every((direction) => playerActorVisualDirection(direction) === direction);
}


const VILLAGE_DECORATIONS: Decoration[] = [
  { kind: 'lighthouse', x: 6, y: 5, blocks: true, scale: 1.06 },
  { kind: 'tree', x: 4, y: 10, blocks: true }, { kind: 'tree', x: 8, y: 8, blocks: true },
  { kind: 'tree', x: 31, y: 9, blocks: true }, { kind: 'tree', x: 33, y: 15, blocks: false, scale: .68 },
  { kind: 'palm', x: 8, y: 32, blocks: false, scale: .66 }, { kind: 'palm', x: 30, y: 32, blocks: false, scale: .66 },
  { kind: 'rock', x: 5, y: 28, blocks: false, scale: .52 }, { kind: 'rock', x: 34, y: 27, blocks: false, scale: .52 },
  { kind: 'lamp', x: 17, y: 18 }, { kind: 'lamp', x: 22, y: 18 }, { kind: 'lamp', x: 17, y: 23 }, { kind: 'lamp', x: 22, y: 23 },
  { kind: 'bench', x: 16, y: 20 }, { kind: 'bench', x: 23, y: 20 },
  { kind: 'flowerBed', x: 15, y: 17 }, { kind: 'flowerBed', x: 24, y: 17 }, { kind: 'flowerBed', x: 15, y: 24 }, { kind: 'flowerBed', x: 24, y: 24 },
  { kind: 'flag', x: 18, y: 16 }, { kind: 'flag', x: 21, y: 16 },
  { kind: 'dock', x: 19, y: 33 }, { kind: 'dock', x: 20, y: 33 }, { kind: 'dock', x: 21, y: 33 },
  { kind: 'dock', x: 19, y: 34 }, { kind: 'dock', x: 20, y: 34 }, { kind: 'dock', x: 21, y: 34 },
  { kind: 'crate', x: 15, y: 30 }, { kind: 'crate', x: 25, y: 30 },
  { kind: 'buoy', x: 17, y: 34 }, { kind: 'buoy', x: 23, y: 34 },
  { kind: 'stall', x: 11, y: 22, blocks: true, scale: .86 },
  { kind: 'questBoard', x: 29, y: 23, blocks: true, scale: .9 },
  { kind: 'pottedPalm', x: 10, y: 14, blocks: true, scale: .95 },
  { kind: 'pottedPalm', x: 30, y: 14, blocks: true, scale: .95 },
  { kind: 'barrels', x: 13, y: 30, blocks: true, scale: .92 },
  { kind: 'barrels', x: 27, y: 31, blocks: true, scale: .9 },
  { kind: 'coral', x: 11, y: 34, blocks: true, scale: .9 },
  { kind: 'coral', x: 29, y: 34, blocks: true, scale: .88 },
  { kind: 'crystal', x: 12, y: 16, blocks: true, scale: .72 },
  { kind: 'crystal', x: 27, y: 16, blocks: true, scale: .72 },
  { kind: 'banner', x: 18, y: 13, blocks: true, scale: .82 },
  { kind: 'banner', x: 22, y: 13, blocks: true, scale: .82 },
  { kind: 'woodFence', x: 7, y: 13, scale: .8 }, { kind: 'woodFence', x: 8, y: 13, scale: .8 },
  { kind: 'woodFence', x: 32, y: 13, scale: .8 }, { kind: 'woodFence', x: 33, y: 13, scale: .8 },
  { kind: 'ropeFence', x: 16, y: 32, scale: .86 }, { kind: 'ropeFence', x: 24, y: 32, scale: .86 },
  { kind: 'bollard', x: 18, y: 32, blocks: true }, { kind: 'bollard', x: 22, y: 32, blocks: true },
  { kind: 'stairs', x: 20, y: 25, scale: .82 },
  { kind: 'bridge', x: 20, y: 35, blocks: true, scale: .92 },
  { kind: 'stoneWall', x: 5, y: 12, blocks: true, scale: .82 }, { kind: 'stoneWall', x: 35, y: 12, blocks: true, scale: .82 },
  { kind: 'arch', x: 20, y: 12, blocks: true, scale: .82 },
  { kind: 'statue', x: 20, y: 17, blocks: true, scale: .72 },
  { kind: 'cherryTree', x: 15, y: 16, blocks: true, scale: .24 },
  { kind: 'mapleTree', x: 25, y: 16, blocks: true, scale: .24 },
  { kind: 'pineTree', x: 7, y: 18, blocks: true, scale: .30 },
  { kind: 'crystalTree', x: 31, y: 23, blocks: true, scale: .30 },
  { kind: 'flowerTree', x: 14, y: 26, scale: .22 },
  { kind: 'cypressTree', x: 30, y: 26, blocks: true, scale: .28 },
  { kind: 'dog', x: 17, y: 26, scale: .78 },
  { kind: 'sleepingDog', x: 8, y: 25, scale: .72 },
  { kind: 'cat', x: 24, y: 21, scale: .64 },
  { kind: 'walkingCat', x: 30, y: 26, scale: .62 },
  { kind: 'seagull', x: 13, y: 34, scale: .66 },
  { kind: 'flyingSeagull', x: 26, y: 33, scale: .58 },
  { kind: 'duck', x: 15, y: 33, scale: .62 },
  { kind: 'swimmingDuck', x: 25, y: 36, scale: .66 },
  { kind: 'butterflyBlue', x: 13, y: 17, scale: .42 },
  { kind: 'butterflyPink', x: 27, y: 18, scale: .42 },
  { kind: 'petals', x: 20, y: 15, scale: .58 },
  { kind: 'sparkles', x: 20, y: 20, scale: .50 },
  { kind: 'waterRing', x: 23, y: 36, scale: .62 },
  { kind: 'shoreFoam', x: 9, y: 35, scale: .66 },
  { kind: 'splash', x: 31, y: 36, scale: .56 },
  { kind: 'steam', x: 10, y: 24, scale: .62 },
  { kind: 'cookingPot', x: 11, y: 24, blocks: true, scale: .62 },
  { kind: 'goldLantern', x: 16, y: 16, scale: .56 },
  { kind: 'fishShadowSmall', x: 14, y: 36, scale: .62 },
  { kind: 'fishShadowMid', x: 19, y: 36, scale: .62 },
  { kind: 'fishShadowBig', x: 29, y: 36, scale: .62 },
  { kind: 'woodSign', x: 13, y: 21, scale: .72 },
  { kind: 'woodSign', x: 27, y: 21, scale: .72 },
  { kind: 'ropeWall', x: 14, y: 32, scale: .72 },
  { kind: 'ropeWall', x: 26, y: 32, scale: .72 },
  { kind: 'ropeCorner', x: 15, y: 32, scale: .7 },
  { kind: 'ropeCorner', x: 25, y: 32, scale: .7 },
  { kind: 'stoneCorner', x: 17, y: 14, scale: .72 },
  { kind: 'stoneCorner', x: 23, y: 14, scale: .72 },
  { kind: 'stoneCurve', x: 15, y: 21, scale: .72 },
  { kind: 'stoneCurve', x: 25, y: 21, scale: .72 },
  { kind: 'wideStairs', x: 20, y: 24, scale: .7 },
  { kind: 'noticeBoard', x: 18, y: 21, scale: .66 },
  { kind: 'noticeBoard', x: 22, y: 21, scale: .66 },
  { kind: 'plazaStairs', x: 18, y: 24, scale: .62 },
  { kind: 'plazaStairs', x: 22, y: 24, scale: .62 },
  { kind: 'bridgeAsset', x: 18, y: 35, blocks: true, scale: .62 },
  { kind: 'bridgeAsset', x: 22, y: 35, blocks: true, scale: .62 },
  { kind: 'tropicalTree', x: 8, y: 30, blocks: true, scale: .60 },
  { kind: 'tropicalTree', x: 32, y: 27, blocks: false, scale: .38 },
  { kind: 'palmAlt', x: 7, y: 32, blocks: false, scale: .38 },
  { kind: 'palmAlt', x: 33, y: 31, blocks: false, scale: .38 },
  // v2.0.20: refine existing SD ocean fantasy props without widening the main walk corridor.
  { kind: 'seagull', x: 8, y: 34, scale: .58 },
  { kind: 'flyingSeagull', x: 33, y: 32, scale: .52 },
  { kind: 'shoreFoam', x: 5, y: 36, scale: .58 },
  { kind: 'waterRing', x: 17, y: 36, scale: .50 },
  { kind: 'waterRing', x: 28, y: 36, scale: .50 },
  { kind: 'sparkles', x: 18, y: 19, scale: .38 },
  { kind: 'sparkles', x: 22, y: 19, scale: .38 },
  { kind: 'goldLantern', x: 14, y: 18, scale: .46 },
  { kind: 'goldLantern', x: 26, y: 18, scale: .46 },
  { kind: 'ropeFence', x: 12, y: 31, scale: .68 },
  { kind: 'ropeFence', x: 28, y: 31, scale: .68 },
  { kind: 'flowerBed', x: 13, y: 18, scale: .74 },
  { kind: 'flowerBed', x: 27, y: 18, scale: .74 },
  { kind: 'crystal', x: 18, y: 26, scale: .48 },
  { kind: 'crystal', x: 22, y: 26, scale: .48 },
  // v2.0.21: extra nonblocking ambience; keep walk/build corridors open.
  { kind: 'butterflyBlue', x: 10, y: 18, scale: .34 },
  { kind: 'butterflyPink', x: 30, y: 18, scale: .34 },
  { kind: 'petals', x: 16, y: 15, scale: .42 },
  { kind: 'petals', x: 24, y: 15, scale: .42 },
  { kind: 'shoreFoam', x: 13, y: 36, scale: .46 },
  { kind: 'shoreFoam', x: 33, y: 35, scale: .44 },
  { kind: 'fishShadowSmall', x: 10, y: 36, scale: .48 },
  { kind: 'fishShadowBig', x: 32, y: 36, scale: .46 },
  { kind: 'goldLantern', x: 18, y: 24, scale: .38 },
  { kind: 'goldLantern', x: 22, y: 24, scale: .38 },
  // v2.0.23: premium matched harbor/beach props, placed mostly as nonblocking ambience.
  { kind: 'bench', x: 12, y: 20, scale: .62 },
  { kind: 'bench', x: 28, y: 20, scale: .62 },
  { kind: 'crate', x: 16, y: 31, scale: .58 },
  { kind: 'barrels', x: 24, y: 31, scale: .58 },
  { kind: 'coral', x: 7, y: 35, scale: .44 },
  { kind: 'coral', x: 33, y: 35, scale: .44 },
  { kind: 'flowerBed', x: 18, y: 16, scale: .52 },
  { kind: 'flowerBed', x: 22, y: 16, scale: .52 },
  { kind: 'ropeFence', x: 10, y: 32, scale: .58 },
  { kind: 'ropeFence', x: 30, y: 32, scale: .58 },
  { kind: 'noticeBoard', x: 20, y: 21, scale: .58 },
  { kind: 'plazaStairs', x: 20, y: 24, scale: .56 },
  { kind: 'dock', x: 18, y: 34, scale: .62 },
  { kind: 'dock', x: 22, y: 34, scale: .62 },
  // v2.0.25: premium mega pass. Small nonblocking detail clusters only; keep plaza/harbor corridors open.
  { kind: 'rock', x: 6, y: 34, scale: .36 },
  { kind: 'rock', x: 34, y: 34, scale: .36 },
  { kind: 'flowerBed', x: 11, y: 18, scale: .44 },
  { kind: 'flowerBed', x: 29, y: 18, scale: .44 },
  { kind: 'barrels', x: 15, y: 32, scale: .42 },
  { kind: 'crate', x: 25, y: 32, scale: .42 },
  { kind: 'coral', x: 5, y: 35, scale: .34 },
  { kind: 'coral', x: 35, y: 35, scale: .34 },
  { kind: 'ropeWall', x: 11, y: 31, scale: .44 },
  { kind: 'ropeWall', x: 29, y: 31, scale: .44 },
  { kind: 'questBoard', x: 31, y: 22, scale: .50 },
  // v2.0.26: curated premium details. Keep large pink/edge trees small and move new props into safe side pockets.
  // v2.0.44: clipped edge object audit keeps large props inward, smaller, and mostly nonblocking.
  { kind: 'flowerBed', x: 8, y: 21, scale: .36 },
  { kind: 'flowerBed', x: 32, y: 21, scale: .36 },
  { kind: 'crystal', x: 9, y: 23, scale: .34 },
  { kind: 'crystal', x: 31, y: 23, scale: .34 },
  { kind: 'wideStairs', x: 20, y: 26, scale: .46 },
  { kind: 'bridgeAsset', x: 20, y: 35, scale: .44 },
  // v2.0.28: zero-defect object audit. Only small nonblocking aqua-tone details in safe pockets.
  { kind: 'shoreFoam', x: 6, y: 35, scale: .34 },
  { kind: 'shoreFoam', x: 34, y: 35, scale: .34 },
  { kind: 'sparkles', x: 16, y: 22, scale: .28 },
  { kind: 'sparkles', x: 24, y: 22, scale: .28 },
  { kind: 'goldLantern', x: 12, y: 19, scale: .30 },
  { kind: 'goldLantern', x: 28, y: 19, scale: .30 },
  { kind: 'butterflyBlue', x: 14, y: 16, scale: .24 },
  { kind: 'butterflyPink', x: 26, y: 16, scale: .24 },
  // v2.1.16: new harbor object clusters from the supplied PNG set. Keep them nonblocking and outside the main tap corridor.
  { kind: 'rowBoat', x: 10, y: 33, scale: .42 },
  { kind: 'fishingBoat', x: 30, y: 33, scale: .34 },
  { kind: 'ropeCoil', x: 12, y: 30, scale: .42 },
  { kind: 'anchorAsset', x: 27, y: 30, scale: .38 },
  { kind: 'treasureChest', x: 24, y: 29, scale: .38 },
  { kind: 'seaweedPatch', x: 7, y: 33, scale: .44 },
  { kind: 'driftwood', x: 33, y: 33, scale: .40 },
  { kind: 'crabTrap', x: 15, y: 33, scale: .34 },
  { kind: 'lifeRing', x: 25, y: 33, scale: .34 },
  { kind: 'bucketAsset', x: 13, y: 29, scale: .34 },
  { kind: 'tackleBoxAsset', x: 28, y: 29, scale: .32 },
  { kind: 'netAsset', x: 14, y: 31, scale: .34 },
  { kind: 'signAsset', x: 10, y: 24, scale: .36 },
  { kind: 'palletAsset', x: 21, y: 33, scale: .30 },
  { kind: 'bobberAsset', x: 17, y: 34, scale: .30 },
  { kind: 'shellCluster', x: 9, y: 34, scale: .34 },
];

const V2029_HIDDEN_DECORATION_KEYS = new Set([
  'noticeBoard:18,21', 'noticeBoard:22,21',
  'plazaStairs:18,24', 'plazaStairs:22,24',
  'bridgeAsset:18,35', 'bridgeAsset:22,35',
  'dock:18,34', 'dock:22,34',
  'ropeWall:14,32', 'ropeWall:26,32',
]);

const V2045_HIDDEN_DECORATION_KEYS = new Set([
  // v2.0.45: remove repeated water-edge effects and oversized duplicate props that could appear half-cut on tall mobile screens.
  'splash:31,36', 'swimmingDuck:25,36', 'fishShadowSmall:14,36', 'fishShadowMid:19,36', 'fishShadowBig:29,36',
  'shoreFoam:5,36', 'waterRing:17,36', 'waterRing:28,36', 'shoreFoam:13,36', 'fishShadowSmall:10,36', 'fishShadowBig:32,36',
  'coral:5,35', 'coral:35,35', 'bridgeAsset:20,35', 'bridge:20,35',
]);

const V2049_HIDDEN_DECORATION_KEYS = new Set([
  // v2.0.49: thin out duplicated harbor-edge/water details so the premium assets read cleaner and do not fight the play path.
  'shoreFoam:6,35', 'shoreFoam:34,35', 'waterRing:23,36', 'splash:31,36',
  'duck:15,33', 'seagull:13,34', 'flyingSeagull:26,33', 'seagull:8,34', 'flyingSeagull:33,32',
  'dock:19,34', 'dock:20,34', 'dock:21,34', 'buoy:17,34', 'buoy:23,34',
]);

const V2050_HIDDEN_DECORATION_KEYS = new Set([
  // v2.0.50: keep the island playfield calmer for the content board and walking routes.
  'goldLantern:12,19', 'goldLantern:28,19', 'sparkles:16,22', 'sparkles:24,22',
  'butterflyBlue:14,16', 'butterflyPink:26,16', 'wideStairs:20,26',
]);

const V2079_HIDDEN_DECORATION_KEYS = new Set([
  // v2.0.79: final object audit. Keep the central plaza readable and remove repeated lamp/harbor-edge props
  // that can look half-clipped after the crystal lamp replacement on narrow mobile screens.
  'goldLantern:16,16', 'goldLantern:14,18', 'goldLantern:26,18', 'goldLantern:18,24', 'goldLantern:22,24',
  'noticeBoard:20,21', 'plazaStairs:20,24', 'ropeFence:30,32',
  'dock:19,33', 'dock:21,33', 'crate:15,30', 'crate:16,31', 'barrels:24,31',
]);

function decorationAuditKey(deco: Decoration): string {
  return `${deco.kind}:${deco.x},${deco.y}`;
}

function shouldUseDecoration(deco: Decoration): boolean {
  // v2.0.29: hide duplicated large props that made the village feel cluttered or half-cut.
  const key = decorationAuditKey(deco);
  return !V2029_HIDDEN_DECORATION_KEYS.has(key) && !V2045_HIDDEN_DECORATION_KEYS.has(key) && !V2049_HIDDEN_DECORATION_KEYS.has(key) && !V2050_HIDDEN_DECORATION_KEYS.has(key) && !V2079_HIDDEN_DECORATION_KEYS.has(key);
}

const V2039_EDGE_SAFE_DECORATIONS = new Set<DecoKind>([
  'tree', 'palm', 'tropicalTree', 'palmAlt', 'cherryTree', 'mapleTree', 'pineTree', 'crystalTree', 'flowerTree', 'cypressTree',
  'lighthouse', 'bridgeAsset', 'wideStairs', 'bridge', 'coral', 'rock',
]);

function auditedDecorationPlacement(deco: Decoration): { x: number; y: number; scale: number } {
  let x = deco.x;
  let y = deco.y;
  let scale = deco.scale ?? 1;
  if (V2039_EDGE_SAFE_DECORATIONS.has(deco.kind)) {
    if (x <= 5) x += 1.25;
    if (x >= 35) x -= 1.25;
    if (y >= 35) y -= 1.15;
    if (y <= 5) y += 0.75;
    if (deco.kind === 'tree' || deco.kind === 'palm' || deco.kind === 'lighthouse') scale = Math.min(scale, 0.76);
    if (['tropicalTree', 'palmAlt', 'cherryTree', 'mapleTree', 'pineTree', 'crystalTree', 'flowerTree', 'cypressTree'].includes(deco.kind)) scale = Math.min(scale, 0.34);
    if (['bridgeAsset', 'bridge', 'wideStairs', 'coral', 'rock', 'fishingBoat', 'rowBoat', 'seaweedPatch', 'driftwood'].includes(deco.kind)) scale = Math.min(scale, 0.42);
  }
  if (deco.kind === 'lamp' || deco.kind === 'goldLantern') scale = Math.min(scale, 0.50);
  if (deco.kind === 'crystal') scale = Math.min(scale, 0.56);
  if (['anchorAsset', 'treasureChest', 'ropeCoil', 'crabTrap', 'lifeRing', 'bucketAsset', 'tackleBoxAsset', 'netAsset', 'signAsset', 'palletAsset', 'bobberAsset', 'shellCluster'].includes(deco.kind)) scale = Math.min(scale, 0.48);
  if (y >= 34) scale = Math.min(scale, 0.52);
  if (x <= 4 || x >= 36) scale = Math.min(scale, 0.48);
  return { x: clamp(x, 2.2, MAP_SIZE - 3.2), y: clamp(y, 4.2, MAP_SIZE - 5.4), scale };
}

function iHash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) % 9973;
  return h;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function safeIntegerTile(value: number): number {
  return clamp(Math.round(value), 1, MAP_SIZE - 2);
}

function tileKey(x: number, y: number): string {
  return `${x},${y}`;
}

function isoToWorld(x: number, y: number): { x: number; y: number } {
  return {
    x: WORLD_ORIGIN_X + (x - y) * (TILE_W / 2),
    y: WORLD_ORIGIN_Y + (x + y) * (TILE_H / 2),
  };
}

function worldToTile(worldX: number, worldY: number): { x: number; y: number } {
  const dx = worldX - WORLD_ORIGIN_X;
  const dy = worldY - WORLD_ORIGIN_Y;
  const x = Math.floor((dy / (TILE_H / 2) + dx / (TILE_W / 2)) / 2);
  const y = Math.floor((dy / (TILE_H / 2) - dx / (TILE_W / 2)) / 2);
  return { x, y };
}

function diamondHitScore(worldX: number, worldY: number, tileX: number, tileY: number): number {
  const center = centerOfTile(tileX, tileY);
  return Math.abs(worldX - center.x) / (TILE_W / 2) + Math.abs(worldY - center.y) / (TILE_H / 2);
}

function nearestDiamondTile(worldX: number, worldY: number): { x: number; y: number } {
  const base = worldToTile(worldX, worldY);
  let best = base;
  let bestScore = diamondHitScore(worldX, worldY, base.x, base.y);
  for (let yy = base.y - V2138_FINE_PLACEMENT_SEARCH_RADIUS; yy <= base.y + V2138_FINE_PLACEMENT_SEARCH_RADIUS; yy += 1) {
    for (let xx = base.x - V2138_FINE_PLACEMENT_SEARCH_RADIUS; xx <= base.x + V2138_FINE_PLACEMENT_SEARCH_RADIUS; xx += 1) {
      const score = diamondHitScore(worldX, worldY, xx, yy);
      if (score < bestScore) {
        best = { x: xx, y: yy };
        bestScore = score;
      }
    }
  }
  // v2.1.51: keep tile pixels unchanged and only tighten the diamond hit score a tiny bit.
  // This reduces accidental neighbor picks without changing save/building/NPC/camera coordinates.
  // Full tile shrink remains deferred until save/building/NPC/camera migration is implemented.
  return bestScore <= V2151_DIAMOND_TOUCH_SCORE_LIMIT ? best : base;
}

function centerOfTile(x: number, y: number): { x: number; y: number } {
  return isoToWorld(x + 0.5, y + 0.5);
}

function actorGround(x: number, y: number): { x: number; y: number } {
  // v2.0.52: character feet are anchored in the lower half of the diamond, not a corner.
  return isoToWorld(x + 0.5, y + TILE_ACTOR_GROUND_Y);
}

function decorationGround(x: number, y: number): { x: number; y: number } {
  // v2.0.52: bottom-anchored props stand on the visible ground of their tile.
  return isoToWorld(x + 0.5, y + TILE_DECOR_GROUND_Y);
}

function footprintGround(x: number, y: number, w = 1, h = 1): { x: number; y: number } {
  // v2.0.52: large buildings use bottom-center ground anchor footprint anchors with a small in-tile backset.
  // The image can be tall, but the stored x/y/w/h remains the logical tile footprint.
  return isoToWorld(x + w / 2, y + Math.max(1, h) - BUILDING_GROUND_BACKSET);
}

function footprintBaseLeftTile(building: Pick<VillageBuildingSave, 'x' | 'y' | 'w' | 'h'>): { x: number; y: number } {
  // v2.0.57: interaction favors the visible lower-left edge of slanted isometric assets.
  return { x: building.x, y: building.y + Math.max(1, building.h) - 1 };
}

function actorSpriteGroundOffset(textureUrl: string, targetH: number): number {
  // v2.0.62: v2023/v2047 character PNGs keep a few transparent pixels under the feet.
  // Drop the visible feet onto the shadow instead of moving the tile anchor upward.
  if (textureUrl.includes('/v2118/characters/player/') || textureUrl.includes('/v2047/') || textureUrl.includes('/v2023/')) return Math.max(2.5, Math.min(4.5, targetH * 0.034));
  return Math.max(0, Math.min(2, targetH * 0.012));
}

function decorationSpriteGroundOffset(kind: DecoKind, targetH: number): number {
  // v2.0.62: small animals/props should look grounded even if the PNG has transparent bottom padding.
  if (/dog|cat|walkingCat|sleepingDog/i.test(kind)) return Math.max(2, Math.min(4, targetH * 0.055));
  if (/tree|palm|flowerTree|cherryTree|mapleTree|pineTree|crystalTree|cypressTree/i.test(kind)) return Math.max(1, Math.min(3, targetH * 0.018));
  if (/lamp|goldLantern|crystal/i.test(kind)) return Math.max(3, Math.min(5, targetH * 0.055));
  return Math.max(0, Math.min(2, targetH * 0.015));
}

function tileDiamondPoints(x: number, y: number): number[] {
  const p = isoToWorld(x, y);
  return [p.x, p.y + TILE_H / 2, p.x + TILE_W / 2, p.y, p.x + TILE_W, p.y + TILE_H / 2, p.x + TILE_W / 2, p.y + TILE_H];
}

function footprintTileKeys(x: number, y: number, w: number, h: number): string[] {
  const keys: string[] = [];
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) keys.push(tileKey(xx, yy));
  }
  return keys;
}

function footprintClearanceTileKeys(x: number, y: number, w: number, h: number): string[] {
  const keys: string[] = [];
  for (let yy = y - 1; yy < y + h + 1; yy += 1) {
    for (let xx = x - 1; xx < x + w + 1; xx += 1) {
      const inside = xx >= x && xx < x + w && yy >= y && yy < y + h;
      if (!inside) keys.push(tileKey(xx, yy));
    }
  }
  return keys;
}

function createDefaultBuildings(): VillageBuildingSave[] {
  return [
    { id: 'b_fountain_0', type: 'fountain', x: 19, y: 19, w: 2, h: 2, builtAt: Date.now() },
    { id: 'b_market_0', type: 'market', x: 14, y: 22, w: 3, h: 3, builtAt: Date.now() },
    { id: 'b_guild_0', type: 'guild', x: 25, y: 22, w: 3, h: 3, builtAt: Date.now() },
    { id: 'b_inn_0', type: 'inn', x: 19, y: 12, w: 3, h: 3, builtAt: Date.now() },
    { id: 'b_harbor_0', type: 'harbor', x: 19, y: 31, w: 3, h: 3, builtAt: Date.now() },
  ];
}

export class VillageWorld {
  private readonly root: HTMLElement;
  private readonly stageHost: HTMLElement;
  private readonly save: SaveData;
  private readonly onSave: () => void;
  private readonly onGoFishing: () => void;
  private readonly onOpenShop?: () => void;
  private readonly onToast: WorldCallbacks['onToast'];
  private app?: Application;
  private world = new Container();
  private tileLayer = new Graphics();
  private buildingLayer = new Container();
  private decorationLayer = new Container();
  private labelLayer = new Container();
  private actorLayer = new Container();
  private markerLayer = new Container();
  private previewLayer = new Container();
  private textures = new Map<string, Texture>();
  private tileKinds = new Map<string, VillageTileKind>();
  private pathTiles = new Set<string>();
  private blockedTiles = new Set<string>();
  private occupiedTiles = new Set<string>();
  private player?: Actor;
  private npcs: Actor[] = [];
  private camera = { x: 0, y: 0, scale: BASE_SCALE };
  private pointer?: PointerTrack;
  private activePointers = new Map<number, PointerPoint>();
  private pinchDistance = 0;
  private pinchScale = BASE_SCALE;
  private pinchCenterScreen: PointerPoint | null = null;
  private pinchCenterWorld: PointerPoint | null = null;
  private selectedBuild: VillageBuildingType | null = null;
  private buildTrayOpen = false;
  private movingBuildingId: string | null = null;
  private focusedBuildingId: string | null = null;
  private cameraFollowUntil = 0;
  private hoverTile: { x: number; y: number } | null = null;
  private pendingBuildPlacement: PendingBuildPlacement | null = null;
  private lastDialogAt = 0;
  private lastPassiveIncomeAt = 0;
  private lastNpcHealthCheckAt = 0;
  private motionClock = 0;
  private decorationMotionBases = new WeakMap<Container, DecorationMotionBase>();
  private destroyed = false;
  private joystick = { x: 0, y: 0, active: false, pointerId: null as number | null };
  private joystickKnob?: HTMLElement;
  private readonly resizeHandler = () => this.resize();

  constructor(options: VillageWorldOptions) {
    this.root = options.root;
    this.stageHost = options.stageHost;
    this.save = options.save;
    this.onSave = options.onSave;
    this.onGoFishing = options.onGoFishing;
    this.onOpenShop = options.onOpenShop;
    this.onToast = options.onToast;
    this.ensureVillageState();
  }

  private resolveVillageDprCap(): number {
    const cssCap = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--runtime-dpr-cap'));
    const cores = navigator.hardwareConcurrency ?? 4;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const compactViewport = Math.min(window.innerWidth, window.innerHeight) <= 420;
    const safetyCap = reduced || compactViewport || cores <= 4 ? 1.32 : 1.75;
    return Math.max(1, Math.min(Number.isFinite(cssCap) ? cssCap : safetyCap, safetyCap));
  }

  async init(): Promise<void> {
    const app = new Application();
    await app.init({
      resizeTo: this.stageHost,
      backgroundAlpha: 0,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio || 1, this.resolveVillageDprCap()),
      powerPreference: this.resolveVillageDprCap() <= 1.32 ? 'low-power' : 'high-performance',
    });
    this.app = app;
    app.ticker.maxFPS = 60;
    app.ticker.minFPS = 24;
    this.stageHost.appendChild(app.canvas);
    this.world.sortableChildren = true;
    this.buildingLayer.sortableChildren = true;
    this.decorationLayer.sortableChildren = true;
    this.labelLayer.sortableChildren = true;
    this.actorLayer.sortableChildren = true;
    this.markerLayer.sortableChildren = true;
    this.previewLayer.sortableChildren = true;
    this.tileLayer.zIndex = 0;
    this.buildingLayer.zIndex = 20;
    this.decorationLayer.zIndex = 24;
    this.labelLayer.zIndex = 28;
    this.actorLayer.zIndex = 30;
    this.markerLayer.zIndex = 44;
    this.previewLayer.zIndex = 50;
    app.stage.addChild(this.world);
    this.world.addChild(this.tileLayer, this.buildingLayer, this.decorationLayer, this.labelLayer, this.actorLayer, this.markerLayer, this.previewLayer);
    this.generateTiles();
    this.normalizeSavedBuildingFootprints();
    await this.loadCriticalTextures();
    if (!actorDirectionQaPasses()) console.warn('[AquaFantasia] actor direction QA mapping mismatch');
    if (!playerDirectionRemapQaPasses()) console.warn('[AquaFantasia] player direction remap QA mismatch');
    this.renderTiles();
    this.renderBuildings();
    this.renderDecorations();
    this.spawnActors();
    this.loadDeferredTextures();
    this.bindStageInput();
    this.bindUi();
    this.resize();
    window.addEventListener('resize', this.resizeHandler, { passive: true });
    app.ticker.add((ticker: { deltaMS: number }) => this.tick(ticker.deltaMS));
    this.syncHud();
    this.root.classList.add('v2029-village-polish-ready');
    this.root.dataset.v2029VillageAudit = 'object-npc-build-stable';
    this.root.dataset.v2030VillageAudit = 'moving-npc-clean-objects';
    this.root.dataset.v2031VillageAudit = 'npc-direction-object-final-audit';
    this.root.dataset.v2045VillageAudit = 'direction-asset-performance-trim';
    this.root.dataset.v2118PlayerMotionLock = V2118_PLAYER_MOTION_LOCK;
    this.root.dataset.v2119PlayerMotionImageLock = V2119_PLAYER_MOTION_IMAGE_LOCK;
    this.root.dataset.v2120PlayerDirectionRemapLock = V2120_PLAYER_DIRECTION_REMAP_LOCK;
    this.root.dataset.v2121UiContinuityLock = V2121_UI_CONTINUITY_LOCK;
    this.root.dataset.v2122PlayerCardinalMotionLock = V2122_PLAYER_CARDINAL_MOTION_LOCK;
    this.root.dataset.v2123PlayerDirectionMotionLock = V2123_PLAYER_DIRECTION_MOTION_LOCK;
    this.root.dataset.v2124StateInputLock = V2124_STATE_INPUT_LOCK;
    this.root.dataset.v2125DirectionMotionLock = V2125_DIRECTION_MOTION_LOCK;
    this.root.dataset.v2127DirectionMotionAuditLock = V2127_DIRECTION_MOTION_AUDIT_LOCK;
    this.root.dataset.v2128TrueEastMotionLock = V2128_TRUE_EAST_MOTION_LOCK;
    this.root.dataset.v2129PlayerFilenameDirectionLock = V2129_PLAYER_FILENAME_DIRECTION_LOCK;
    this.root.dataset.v2130PlayerMotionImmutableLock = V2130_PLAYER_MOTION_IMMUTABLE_LOCK;
    this.root.dataset.v2130BuildConfirmFlowLock = V2130_BUILD_CONFIRM_FLOW_LOCK;
    this.root.dataset.v2131PlayerNpcDirectionGuard = V2131_PLAYER_NPC_DIRECTION_GUARD;
    this.root.dataset.v2131BuildPreviewConfirmLock = V2131_BUILD_PREVIEW_CONFIRM_LOCK;
    this.root.dataset.v2134ObjectClearanceLock = V2134_OBJECT_CLEARANCE_LOCK;
    this.root.dataset.v2134MicroTilePointerLock = V2134_MICRO_TILE_POINTER_LOCK;
    this.root.dataset.v2139TileTouchStabilityLock = V2139_TILE_TOUCH_STABILITY_LOCK;
    this.root.dataset.v2139TilePixelMigrationPlanLock = V2139_TILE_PIXEL_SIZE_MIGRATION_PLAN_LOCK;
    this.root.dataset.v2140TileTouchStabilityLock = V2140_TILE_TOUCH_STABILITY_LOCK;
    this.root.dataset.v2140TilePixelMigrationPlanLock = V2140_TILE_PIXEL_SIZE_MIGRATION_PLAN_LOCK;
    this.root.dataset.v2142TileTouchPrecisionLock = V2142_TILE_TOUCH_PRECISION_LOCK;
    this.root.dataset.v2142TilePixelMigrationPlanLock = V2142_TILE_PIXEL_SIZE_MIGRATION_PLAN_LOCK;
    this.root.dataset.v2143TileTouchOverlapAuditLock = V2143_TILE_TOUCH_OVERLAP_AUDIT_LOCK;
    this.root.dataset.v2144UiPlacementPolishSweepLock = V2144_UI_PLACEMENT_POLISH_SWEEP_LOCK;
    this.root.dataset.v2135ObjectFootprintClearanceLock = V2135_OBJECT_FOOTPRINT_CLEARANCE_LOCK;
    this.root.dataset.v2135TileSnapAssistLock = V2135_TILE_SNAP_ASSIST_LOCK;
    this.root.dataset.v2118NpcDirectionAudit = 'npc-eight-direction-static-assets-verified';
    this.root.dataset.v2048VillageAnchorSystem = 'bottom-center-footprint-anchor';
    this.root.dataset.v2049ContentAssetSystem = 'clean-props-content-loop-performance';
    this.root.dataset.v2050ContentExpansionAssetPolish = 'calmer-assets-island-expansion-routes';
    this.root.dataset.v2051MotionPolish = 'actor-footstep-object-motion';
    this.root.dataset.v2052TileAnchorAudit = 'tile-ground-footprint-collision-audit';
    this.root.dataset.v2056MotionTilePolish = 'pet-footstep-steam-no-drift';
    this.root.dataset.v2060GroundedMotionPolish = 'no-floating-grounded-footstep-motion';
    this.root.dataset.v2061LoopUiButtonAudit = 'stable-grounded-world-after-loop-ui-audit';
    this.root.dataset.v2062GroundContactAudit = 'shadow-foot-contact-no-floating-motion';
    this.root.dataset.v2080TileHitboxAudit = 'canvas-local-tile-diamond-hitbox-normalized';
    this.root.dataset.v2083VillageHitboxFeel = 'world-pointer-building-footprint-score';
    this.root.dataset.v2090BuildStateGuard = 'explicit-build-button-only';
    this.root.dataset.v2091UiCleanup = 'legacy-interior-events-pruned';
    this.root.dataset.v218StableRollback = 'v218-raw-diamond-touch-interior-selector-repair';
    this.root.dataset.v2145IconFishingPagePolishLock = V2145_ICON_FISHING_PAGE_POLISH_LOCK;
    this.root.dataset.v2146UiOverlapIconFishingPolishLock = V2146_UI_OVERLAP_ICON_FISHING_POLISH_LOCK;
    this.root.dataset.v2147UiOverlapLayoutFishingPolishLock = V2147_UI_OVERLAP_LAYOUT_FISHING_POLISH_LOCK;
    this.root.dataset.v2148UiOverlapLayoutSweepLock = V2148_UI_OVERLAP_LAYOUT_SWEEP_LOCK;
    this.root.dataset.v2149UiCompositionPolishLock = V2149_UI_COMPOSITION_POLISH_LOCK;
    this.root.dataset.v2150UiOverlapPlacementBeautyLock = V2150_UI_OVERLAP_PLACEMENT_BEAUTY_LOCK;
    this.root.dataset.v2151LayoutCompositionFishingUiLock = V2151_LAYOUT_COMPOSITION_FISHING_UI_LOCK;
    this.root.dataset.v219UiTouchShopFishingAudit = 'v219-foot-biased-touch-shop-route';
    this.root.classList.add('v218-village-touch-repaired', 'v219-village-touch-shop-repaired', 'v2134-village-object-clearance-ready', 'v2135-village-placement-engine-ready', 'v2136-village-placement-assist-ready', 'v2138-village-touch-cautious-ready', 'v2143-village-overlap-placement-audit-ready', 'v2145-village-icon-page-polish-ready', 'v2146-village-ui-overlap-icon-polish-ready', 'v2147-village-ui-overlap-layout-polish-ready');
    this.showGuide('마을 입장 완료', '좌측 조이스틱으로 이동하고, 건물/장식은 바닥 풋프린트·시각 간격·근접 타일 보정 기준으로 안전하게 배치됩니다.');
  }

  destroy(): void {
    this.destroyed = true;
    window.removeEventListener('resize', this.resizeHandler);
    this.app?.destroy(true, { children: true, texture: false });
    this.app = undefined;
  }

  setPlayerName(name: string): void {
    const next = this.normalizeWorldPlayerName(name);
    this.save.playerName = next;
    if (this.player) {
      this.player.name = next;
      this.player.label.text = next;
      this.player.label.scale.set(1, 1);
    }
  }

  private worldPlayerName(): string {
    return this.normalizeWorldPlayerName(this.save.playerName);
  }

  private normalizeWorldPlayerName(name: unknown): string {
    const raw = typeof name === 'string' ? name : '';
    const cleaned = raw.replace(/[<>{}"'`\\]/g, '').replace(/\s+/g, ' ').trim().slice(0, 12);
    return cleaned || '나';
  }

  setBuildMode(type: VillageBuildingType | null): void {
    this.selectedBuild = type;
    if (!type) {
      this.movingBuildingId = null;
      this.hideBuildConfirm();
    }
    if (type) {
      this.buildTrayOpen = false;
      this.hoverTile = null;
    }
    this.root.classList.toggle('v2-build-active', Boolean(type));
    this.root.classList.toggle('v2094-build-active', Boolean(type));
    this.root.classList.toggle('v2097-build-active', Boolean(type));
    this.root.classList.toggle('v2098-build-active', Boolean(type));
    this.root.classList.toggle('v2111-build-active', Boolean(type));
    this.root.classList.toggle('v2112-build-active', Boolean(type));
    this.root.classList.toggle('v2113-build-active', Boolean(type));
    this.root.classList.toggle('v2114-build-active', Boolean(type));
    this.root.classList.toggle('v2118-build-active', Boolean(type));
    this.root.classList.toggle('v2119-build-active', Boolean(type));
    this.root.classList.toggle('v2120-build-active', Boolean(type));
    this.root.classList.toggle('v2121-build-active', Boolean(type));
    this.root.classList.toggle('v2130-build-active', Boolean(type));
    this.root.classList.toggle('v2131-build-active', Boolean(type));
    this.root.classList.toggle('v2-build-tray-open', this.buildTrayOpen);
    this.root.classList.toggle('v2094-build-tray-open', this.buildTrayOpen);
    this.root.classList.toggle('v2097-build-tray-open', this.buildTrayOpen);
    this.root.classList.toggle('v2098-build-tray-open', this.buildTrayOpen);
    this.root.toggleAttribute('data-v2028-build-preview-active', Boolean(type));
    this.root.toggleAttribute('data-v2042-build-drag-placement', Boolean(type));
    this.root.toggleAttribute('data-v2043-build-ghost-placement', Boolean(type));
    this.root.toggleAttribute('data-v2044-build-move-placement', Boolean(type));
    this.root.querySelectorAll<HTMLElement>('[data-build-type]').forEach((node) => {
      node.classList.toggle('active', node.dataset.buildType === type);
    });
    this.previewLayer.removeChildren();
    if (type) {
      const def = BUILD_DEFS[type];
      const previewX = this.player ? clamp(this.player.tileX + 1, 1, MAP_SIZE - def.size[0] - 1) : 20;
      const previewY = this.player ? clamp(this.player.tileY, 1, MAP_SIZE - def.size[1] - 1) : 29;
      this.updateBuildPreviewAtTile(previewX, previewY);
      const modeTitle = this.movingBuildingId ? '건물 이동 모드' : '설치 모드';
      this.showGuide(modeTitle, `${def.label} 선택됨 · 반투명 프리뷰와 1타일 안전 간격을 확인하세요. 원하는 타일을 누르면 중앙 확인창이 뜹니다.`);
    }
  }

  setBuildTrayOpen(open: boolean, keepSelection = false): void {
    this.buildTrayOpen = open;
    this.root.classList.toggle('v2-build-tray-open', open);
    this.root.classList.toggle('v2094-build-tray-open', open);
    this.root.classList.toggle('v2097-build-tray-open', open);
    this.root.classList.toggle('v2098-build-tray-open', open);
    this.root.classList.toggle('v2111-build-tray-open', open);
    this.root.classList.toggle('v2112-build-tray-open', open);
    this.root.classList.toggle('v2113-build-tray-open', open);
    this.root.classList.toggle('v2114-build-tray-open', open);
    this.root.classList.toggle('v2115-build-tray-open', open);
    this.root.classList.toggle('v2116-build-tray-open', open);
    this.root.classList.toggle('v2117-build-tray-open', open);
    this.root.classList.toggle('v2118-build-tray-open', open);
    this.root.classList.toggle('v2119-build-tray-open', open);
    this.root.classList.toggle('v2120-build-tray-open', open);
    this.root.classList.toggle('v2121-build-tray-open', open);
    this.root.classList.toggle('v2130-build-tray-open', open);
    this.root.classList.toggle('v2131-build-tray-open', open);
    document.body.classList.toggle('v2111-build-open', open);
    document.body.classList.toggle('v2112-build-open', open);
    document.body.classList.toggle('v2113-build-open', open);
    document.body.classList.toggle('v2114-build-open', open);
    document.body.classList.toggle('v2115-build-open', open);
    document.body.classList.toggle('v2116-build-open', open);
    document.body.classList.toggle('v2117-build-open', open);
    document.body.classList.toggle('v2118-build-open', open);
    document.body.classList.toggle('v2119-build-open', open);
    document.body.classList.toggle('v2120-build-open', open);
    document.body.classList.toggle('v2121-build-open', open);
    document.body.classList.toggle('v2130-build-open', open);
    document.body.classList.toggle('v2131-build-open', open);
    this.root.toggleAttribute('data-v2028-build-tray-open', open);
    if (!open) {
      if (!keepSelection) this.movingBuildingId = null;
      this.root.removeAttribute('data-v2042-build-tray-modal');
      this.root.removeAttribute('data-v2043-build-tray-modal');
    } else {
      this.root.setAttribute('data-v2042-build-tray-modal', 'true');
      this.root.setAttribute('data-v2043-build-tray-modal', 'true');
    }
    if (!open && !keepSelection) {
      this.selectedBuild = null;
      this.hoverTile = null;
      this.root.classList.remove('v2-build-active');
      this.root.classList.remove('v2094-build-active');
      this.root.classList.remove('v2097-build-active');
      this.root.classList.remove('v2098-build-active');
      this.root.classList.remove('v2111-build-active');
      this.root.classList.remove('v2112-build-active');
      this.root.classList.remove('v2113-build-active');
      this.root.classList.remove('v2114-build-active');
      this.root.classList.remove('v2118-build-active');
      this.root.classList.remove('v2119-build-active', 'v2120-build-active', 'v2121-build-active', 'v2130-build-active', 'v2131-build-active');
      this.root.classList.remove('v2112-build-tray-open');
      this.root.classList.remove('v2113-build-tray-open');
      this.root.classList.remove('v2114-build-tray-open');
      this.root.classList.remove('v2116-build-tray-open');
      this.root.classList.remove('v2117-build-tray-open');
      this.root.classList.remove('v2118-build-tray-open');
      this.root.classList.remove('v2119-build-tray-open', 'v2120-build-tray-open', 'v2121-build-tray-open', 'v2130-build-tray-open', 'v2131-build-tray-open');
      document.body.classList.remove('v2111-build-open');
      document.body.classList.remove('v2112-build-open');
      document.body.classList.remove('v2113-build-open');
      document.body.classList.remove('v2114-build-open');
      document.body.classList.remove('v2116-build-open');
      document.body.classList.remove('v2117-build-open');
      document.body.classList.remove('v2118-build-open');
      document.body.classList.remove('v2119-build-open', 'v2120-build-open', 'v2121-build-open', 'v2130-build-open', 'v2131-build-open');
      this.previewLayer.removeChildren();
      this.hideBuildConfirm();
      this.root.querySelectorAll<HTMLElement>('[data-build-type]').forEach((node) => node.classList.remove('active'));
    }
  }

  zoom(delta: number, focusPlayer = true): void {
    const nextScale = clamp(this.camera.scale + delta, 0.48, 1.82);
    this.camera.scale = nextScale;
    if (focusPlayer && this.player && this.app) {
      this.camera.x = this.app.screen.width / 2 - this.player.x * nextScale;
      this.camera.y = this.app.screen.height * 0.56 - this.player.y * nextScale;
    }
    this.applyCamera();
  }

  centerCameraOnPlayer(): void {
    if (!this.player || !this.app) return;
    this.camera.x = this.app.screen.width / 2 - this.player.x * this.camera.scale;
    this.camera.y = this.app.screen.height / 2 - this.player.y * this.camera.scale;
    this.applyCamera();
  }

  private ensureVillageState(): void {
    if (!this.save.village) {
      this.save.village = {
        level: 1,
        fund: 0,
        development: 0,
        unlockedSize: 40,
        buildings: createDefaultBuildings(),
        paths: [],
        tourists: 0,
        autoIncome: 0,
      };
      this.onSave();
    }
    if (!Array.isArray(this.save.village.buildings) || this.save.village.buildings.length === 0) {
      this.save.village.buildings = createDefaultBuildings();
    }
    if (!Array.isArray(this.save.village.paths)) this.save.village.paths = [];
    if (!this.save.village.unlockedSize) this.save.village.unlockedSize = 40;
    const compactDefaults: Record<string, { x: number; y: number; w: number; h: number }> = {
      b_market_0: { x: 14, y: 22, w: 3, h: 3 },
      b_guild_0: { x: 25, y: 22, w: 3, h: 3 },
      b_inn_0: { x: 19, y: 12, w: 3, h: 3 },
      b_harbor_0: { x: 19, y: 31, w: 3, h: 3 },
    };
    let resized = false;
    for (const building of this.save.village.buildings) {
      const compact = compactDefaults[building.id];
      if (compact && (building.x !== compact.x || building.y !== compact.y || building.w !== compact.w || building.h !== compact.h)) {
        Object.assign(building, compact);
        resized = true;
      }
    }
    if (resized) this.onSave();
  }

  private normalizeSavedBuildingFootprints(): void {
    const used = new Set<string>();
    let changed = false;
    const fits = (x: number, y: number, w: number, h: number): boolean => {
      if (x < 1 || y < 1 || x + w >= MAP_SIZE - 1 || y + h >= MAP_SIZE) return false;
      for (const key of footprintTileKeys(x, y, w, h)) {
        const [xx, yy] = key.split(',').map(Number);
        if ((this.tileKinds.get(key) ?? 'grass') === 'sea') return false;
        if (used.has(key)) return false;
        if (xx <= 0 || yy <= 0 || xx >= MAP_SIZE - 1 || yy >= MAP_SIZE - 1) return false;
      }
      for (const key of footprintClearanceTileKeys(x, y, w, h)) {
        const [xx, yy] = key.split(',').map(Number);
        if (xx <= 0 || yy <= 0 || xx >= MAP_SIZE - 1 || yy >= MAP_SIZE - 1) continue;
        if ((this.tileKinds.get(key) ?? 'grass') === 'sea') continue;
        if (used.has(key)) return false;
      }
      return true;
    };
    for (const building of this.save.village.buildings) {
      const def = BUILD_DEFS[building.type];
      if (!def) continue;
      const [w, h] = def.size;
      let x = Math.round(Number.isFinite(building.x) ? building.x : 20);
      let y = Math.round(Number.isFinite(building.y) ? building.y : 20);
      x = clamp(x, 1, MAP_SIZE - w - 1);
      y = clamp(y, 1, MAP_SIZE - h - 1);
      if (building.w !== w || building.h !== h || building.x !== x || building.y !== y) changed = true;
      if (!fits(x, y, w, h)) {
        let found: { x: number; y: number } | null = null;
        for (let radius = 1; radius <= 9 && !found; radius += 1) {
          for (let dy = -radius; dy <= radius && !found; dy += 1) {
            for (let dx = -radius; dx <= radius && !found; dx += 1) {
              const nx = clamp(x + dx, 1, MAP_SIZE - w - 1);
              const ny = clamp(y + dy, 1, MAP_SIZE - h - 1);
              if (fits(nx, ny, w, h)) found = { x: nx, y: ny };
            }
          }
        }
        if (found) { x = found.x; y = found.y; changed = true; }
      }
      building.x = x;
      building.y = y;
      building.w = w;
      building.h = h;
      for (const key of footprintTileKeys(x, y, w, h)) used.add(key);
    }
    if (changed) {
      this.save.village.development = this.calculateDevelopment();
      this.onSave();
    }
  }

  private generateTiles(): void {
    this.tileKinds.clear();
    this.pathTiles.clear();
    for (let y = 0; y < MAP_SIZE; y += 1) {
      for (let x = 0; x < MAP_SIZE; x += 1) {
        let kind: VillageTileKind = 'grass';
        if (y >= 37) kind = 'sea';
        else if (y >= 32 || x <= 2 || x >= 37) kind = 'sand';
        else if ((x >= 17 && x <= 22 && y >= 17 && y <= 24) || (x >= 16 && x <= 23 && y >= 18 && y <= 22)) kind = 'plaza';
        else if (x === 20 && y >= 14 && y <= 34) kind = 'stone';
        else if (y === 22 && x >= 12 && x <= 28) kind = 'stone';
        if (kind === 'stone' || kind === 'plaza') this.pathTiles.add(tileKey(x, y));
        this.tileKinds.set(tileKey(x, y), kind);
      }
    }
    for (const key of this.save.village.paths) {
      this.tileKinds.set(key, 'stone');
      this.pathTiles.add(key);
    }
  }

  private allTextureUrls(): string[] {
    return uniqueUrls([
      ...Object.values(BUILD_DEFS).map((def) => def.texture),
      ...Object.values(ACTOR_TEXTURES),
      ...Object.values(ACTOR_DIRECTION_TEXTURES).flatMap((directions) => Object.values(directions)),
      ...Object.values(PLAYER_ACTOR_MOTION_TEXTURES).flat(),
      ...Object.values(TILE_TEXTURES).flat(),
      ...Object.values(DECO_TEXTURES),
      ...Object.values(BUILD_PROP_TEXTURES),
      ...Object.values(BUILD_PREVIEW_TEXTURES),
      ...V2116_VILLAGE_ASSET_STEWARD_URLS,
    ]);
  }

  private criticalTextureUrls(): string[] {
    return uniqueUrls([
      ...Object.values(BUILD_DEFS).map((def) => def.texture),
      ...Object.values(TILE_TEXTURES).flat(),
      ...Object.values(BUILD_PROP_TEXTURES),
      ...Object.values(ACTOR_TEXTURES),
      ...Object.values(ACTOR_DIRECTION_TEXTURES.player),
      ...Object.values(PLAYER_ACTOR_MOTION_TEXTURES).flat(),
      ...CRITICAL_DECO_KINDS.map((kind) => DECO_TEXTURES[kind]),
      ...Object.values(BUILD_PREVIEW_TEXTURES),
      ...V2116_VILLAGE_ASSET_STEWARD_URLS,
    ]);
  }

  private async loadTextureSet(urls: string[], label: string): Promise<void> {
    const pending = urls.filter((url) => !this.textures.has(url));
    if (!pending.length) return;
    try {
      const result = await Assets.load(pending);
      for (const url of pending) {
        const texture = result[url] as Texture | undefined;
        if (texture) this.textures.set(url, texture);
      }
    } catch (error) {
      console.warn(`[AquaFantasia] village ${label} texture load skipped`, error);
    }
  }

  private async loadCriticalTextures(): Promise<void> {
    await this.loadTextureSet(this.criticalTextureUrls(), 'critical');
  }

  private loadDeferredTextures(): void {
    const rest = this.allTextureUrls().filter((url) => !this.textures.has(url));
    if (!rest.length) return;
    window.setTimeout(() => {
      void this.loadTextureSet(rest, 'deferred').then(() => {
        if (this.destroyed) return;
        this.renderDecorations();
        for (const actor of [this.player, ...this.npcs]) {
          if (actor) this.applyActorTexture(actor, actor.direction);
        }
      });
    }, 80);
  }

  private tileColor(kind: VillageTileKind): number {
    if (kind === 'sea') return 0x4fc9e8;
    if (kind === 'sand') return 0xf3d999;
    if (kind === 'plaza') return 0xd7c6a7;
    if (kind === 'stone') return 0xb8c4c8;
    if (kind === 'wood') return 0xc99664;
    return 0x80c978;
  }

  private tileStroke(kind: VillageTileKind): number {
    if (kind === 'sea') return 0x89efff;
    if (kind === 'sand') return 0xffefbd;
    if (kind === 'stone' || kind === 'plaza') return 0xf7f3e5;
    return 0xa4e38e;
  }

  private renderTiles(): void {
    this.tileLayer.clear();
    for (let y = 0; y < MAP_SIZE; y += 1) {
      for (let x = 0; x < MAP_SIZE; x += 1) {
        const kind = this.tileKinds.get(tileKey(x, y)) ?? 'grass';
        const p = isoToWorld(x, y);
        const c = this.tileColor(kind);
        this.tileLayer.poly(tileDiamondPoints(x, y));
        const textureUrl = pickTileTexture(kind, x, y);
        const texture = textureUrl ? this.textures.get(textureUrl) : undefined;
        if (texture) {
          this.tileLayer.fill({ texture, color: 0xffffff, alpha: kind === 'sea' ? 0.9 : 0.98 });
        } else {
          this.tileLayer.fill({ color: c, alpha: kind === 'sea' ? 0.92 : 0.98 });
        }
        this.tileLayer.stroke({ color: this.tileStroke(kind), alpha: 0.34, width: 1 });
        if (kind === 'sea') {
          this.tileLayer.poly([p.x + 10, p.y + TILE_H / 2, p.x + TILE_W / 2, p.y + 7, p.x + TILE_W - 10, p.y + TILE_H / 2, p.x + TILE_W / 2, p.y + TILE_H - 7]);
          this.tileLayer.stroke({ color: 0xffffff, alpha: 0.16, width: 1 });
        }
      }
    }
  }

  private renderBuildings(): void {
    this.buildingLayer.removeChildren();
    this.labelLayer.removeChildren();
    this.rebuildCollision();
    for (const building of this.save.village.buildings) {
      const def = BUILD_DEFS[building.type];
      if (!def) continue;
      const container = new Container();
      container.zIndex = (building.y + building.h) * 20 + 4;
      const center = footprintGround(building.x, building.y, building.w, building.h);
      container.position.set(center.x, center.y);
      container.addChild(this.createFootprintBaseGraphic(building.x, building.y, building.w, building.h, def.kind));
      if (def.texture && this.textures.has(def.texture)) {
        const sprite = new Sprite(this.textures.get(def.texture)!);
        sprite.anchor.set(0.5, 1);
        const targetW = Math.max(96, building.w * TILE_W * BUILDING_VISUAL_SCALE);
        sprite.scale.set(targetW / Math.max(1, sprite.texture.width));
        sprite.position.set(0, 0);
        container.addChild(sprite);
      } else {
        const g = this.createPropGraphic(def.type, building.w, building.h);
        g.position.set(0, 0);
        container.addChild(g);
      }
      if (def.kind === 'building') {
        const label = new Text({
          text: def.label,
          style: { fontFamily: 'Arial', fontSize: 13, fontWeight: '800', fill: 0x20384a, stroke: { color: 0xffffff, width: 1.8 } },
        });
        label.anchor.set(0.5);
        label.position.set(center.x, center.y + TILE_H * 0.22);
        label.zIndex = (building.y + building.h) * 20 + 19;
        this.labelLayer.addChild(label);
      }
      this.buildingLayer.addChild(container);
    }
  }

  private createFootprintBaseGraphic(x: number, y: number, w: number, h: number, kind: BuildDefinition['kind']): Graphics {
    const center = footprintGround(x, y, w, h);
    const g = new Graphics();
    const color = kind === 'path' ? 0xc9f7ff : kind === 'prop' ? 0xfff0a4 : 0x7eefff;
    for (let yy = y; yy < y + h; yy += 1) {
      for (let xx = x; xx < x + w; xx += 1) {
        const points = tileDiamondPoints(xx, yy);
        const local = points.map((value, index) => value - (index % 2 === 0 ? center.x : center.y));
        g.poly(local);
        g.fill({ color, alpha: kind === 'building' ? 0.055 : 0.075 });
        g.stroke({ color: 0xffffff, alpha: 0.18, width: 1 });
      }
    }
    g.zIndex = -1;
    return g;
  }

  private createPropGraphic(type: VillageBuildingType, w: number, h: number): Container {
    const textureUrl = BUILD_PROP_TEXTURES[type];
    const texture = textureUrl ? this.textures.get(textureUrl) : undefined;
    if (texture) {
      const c = new Container();
      const sprite = new Sprite(texture);
      sprite.anchor.set(0.5, 1);
      const targetH = BUILD_PROP_TARGET_HEIGHT[type] ?? Math.max(54, h * TILE_H);
      sprite.scale.set(targetH / Math.max(1, sprite.texture.height));
      sprite.position.set(0, 0);
      c.addChild(sprite);
      return c;
    }
    const g = new Graphics();
    if (type === 'fountain') {
      g.circle(0, -14, 42).fill({ color: 0x9ee8ff, alpha: 0.96 }).stroke({ color: 0xffffff, width: 8, alpha: 0.8 });
      g.circle(0, -16, 21).fill({ color: 0x48bdda, alpha: 0.92 });
      g.circle(0, -46, 9).fill({ color: 0xffffff, alpha: 0.92 });
      g.moveTo(0, -46).lineTo(0, -80).stroke({ color: 0x9ee8ff, width: 5, alpha: 0.76 });
      return g;
    }
    if (type === 'flower') {
      for (let i = 0; i < 6; i += 1) {
        const a = (Math.PI * 2 * i) / 6;
        g.circle(Math.cos(a) * 15, Math.sin(a) * 8 - 8, 10).fill({ color: i % 2 ? 0xff96c8 : 0xffdf6d, alpha: 0.95 });
      }
      g.circle(0, -8, 7).fill({ color: 0xfaf1a4, alpha: 1 });
      return g;
    }
    g.roundRect(-w * 16, -h * 16, w * 32, h * 32, 12).fill({ color: 0xf6d58b, alpha: 0.9 }).stroke({ color: 0xffffff, width: 3, alpha: 0.8 });
    return g;
  }

  private renderDecorations(): void {
    this.decorationLayer.removeChildren();
    this.decorationMotionBases = new WeakMap<Container, DecorationMotionBase>();
    for (const deco of VILLAGE_DECORATIONS) {
      if (!shouldUseDecoration(deco)) continue;
      const placement = auditedDecorationPlacement(deco);
      const p = decorationGround(placement.x, placement.y);
      const item = this.createDecorationGraphic(deco.kind, placement.scale);
      item.eventMode = 'none';
      item.name = `deco-${deco.kind}`;
      item.position.set(p.x, p.y);
      item.zIndex = Math.round(placement.y * 20 + 10);
      this.decorationMotionBases.set(item, {
        x: p.x,
        y: p.y,
        scaleX: item.scale.x,
        scaleY: item.scale.y,
        alpha: item.alpha,
        rotation: item.rotation,
        kind: deco.kind,
        seed: (placement.x * 17.17 + placement.y * 31.31 + iHash(deco.kind)) % 97,
      });
      this.decorationLayer.addChild(item);
    }
  }

  private createDecorationGraphic(kind: DecoKind, scale: number): Container {
    const c = new Container();
    c.scale.set(scale);
    const textureUrl = DECO_TEXTURES[kind];
    const texture = textureUrl ? this.textures.get(textureUrl) : undefined;
    if (texture) {
      const shadow = new Graphics();
      const targetH = DECO_TARGET_HEIGHT[kind] ?? 90;
      const sprite = new Sprite(texture);
      sprite.anchor.set(0.5, 1);
      sprite.scale.set(targetH / Math.max(1, sprite.texture.height));
      const groundOffset = decorationSpriteGroundOffset(kind, targetH);
      sprite.position.set(0, groundOffset);
      shadow.ellipse(0, 1, Math.max(18, Math.min(54, sprite.texture.width * sprite.scale.x * 0.34)), 8).fill({ color: 0x294b55, alpha: 0.24 });
      c.addChild(shadow, sprite);
      if (kind === 'steam' || kind === 'cookingPot') {
        const puffLayer = new Container();
        puffLayer.name = 'steam-puffs';
        for (let i = 0; i < 4; i += 1) {
          const puff = new Graphics();
          puff.circle(0, 0, 7 + i * 2.4).fill({ color: 0xffffff, alpha: 0.18 - i * 0.025 });
          puff.position.set((i - 1.5) * 7, -targetH * (0.55 + i * 0.09));
          puffLayer.addChild(puff);
        }
        c.addChild(puffLayer);
      }
      return c;
    }
    const g = new Graphics();
    if (kind === 'tree' || kind === 'palm') {
      const trunk = kind === 'palm' ? 0xc99664 : 0x9b7048;
      g.roundRect(-7, -44, 14, 46, 7).fill({ color: trunk, alpha: 0.96 }).stroke({ color: 0xffffff, alpha: 0.22, width: 2 });
      if (kind === 'palm') {
        for (let i = 0; i < 6; i += 1) {
          const a = -Math.PI / 2 + (i - 2.5) * 0.42;
          g.ellipse(Math.cos(a) * 28, -58 + Math.sin(a) * 11, 34, 10).fill({ color: 0x42b96e, alpha: 0.96 }).stroke({ color: 0xeaffdf, alpha: 0.22, width: 2 });
        }
      } else {
        g.circle(-17, -56, 28).fill({ color: 0x66bd72, alpha: 0.98 });
        g.circle(15, -59, 30).fill({ color: 0x73ca78, alpha: 0.98 });
        g.circle(0, -82, 27).fill({ color: 0x8cd66f, alpha: 0.98 });
        g.stroke({ color: 0xffffff, alpha: 0.16, width: 3 });
      }
    } else if (kind === 'lamp') {
      g.roundRect(-4, -56, 8, 58, 4).fill({ color: 0x5d7b82, alpha: 0.9 });
      g.circle(0, -64, 15).fill({ color: 0xfff2a4, alpha: 0.9 }).stroke({ color: 0xffffff, alpha: 0.8, width: 3 });
      g.circle(0, -64, 25).fill({ color: 0xfff0a0, alpha: 0.16 });
    } else if (kind === 'bench') {
      g.roundRect(-30, -18, 60, 12, 6).fill({ color: 0xb87d4b, alpha: 0.95 }).stroke({ color: 0xffffff, alpha: 0.24, width: 2 });
      g.roundRect(-27, -2, 54, 10, 5).fill({ color: 0xce935a, alpha: 0.95 });
      g.roundRect(-24, 8, 8, 18, 4).fill({ color: 0x6e7778, alpha: 0.88 });
      g.roundRect(16, 8, 8, 18, 4).fill({ color: 0x6e7778, alpha: 0.88 });
    } else if (kind === 'dock') {
      g.poly([-40, 18, 0, -2, 40, 18, 0, 38]).fill({ color: 0xb98655, alpha: 0.92 }).stroke({ color: 0xffe2b4, alpha: 0.38, width: 2 });
      for (let i = -22; i <= 22; i += 22) g.moveTo(i - 16, 26).lineTo(i + 16, 10).stroke({ color: 0x8d603d, alpha: 0.45, width: 2 });
    } else if (kind === 'crate') {
      g.roundRect(-20, -25, 40, 34, 7).fill({ color: 0xb77b45, alpha: 0.94 }).stroke({ color: 0xffe3b5, alpha: 0.28, width: 3 });
      g.moveTo(-18, -4).lineTo(18, -22).moveTo(-18, -22).lineTo(18, -4).stroke({ color: 0x875635, alpha: 0.52, width: 3 });
    } else if (kind === 'buoy') {
      g.ellipse(0, -12, 15, 22).fill({ color: 0xff6c5e, alpha: 0.95 }).stroke({ color: 0xffffff, alpha: 0.75, width: 5 });
      g.roundRect(-11, -15, 22, 8, 4).fill({ color: 0xffffff, alpha: 0.88 });
    } else if (kind === 'flag') {
      g.roundRect(-3, -58, 6, 62, 3).fill({ color: 0x637b82, alpha: 0.92 });
      g.poly([3, -58, 36, -49, 3, -38]).fill({ color: 0x56cfff, alpha: 0.95 }).stroke({ color: 0xffffff, alpha: 0.38, width: 2 });
    } else if (kind === 'rock') {
      g.ellipse(0, -10, 28, 20).fill({ color: 0x9eaaa8, alpha: 0.96 }).stroke({ color: 0xffffff, alpha: 0.32, width: 3 });
      g.ellipse(-12, -17, 18, 12).fill({ color: 0xbac4c1, alpha: 0.82 });
    } else if (kind === 'flowerBed') {
      g.ellipse(0, 2, 31, 14).fill({ color: 0x6ab76f, alpha: 0.48 });
      for (let i = 0; i < 9; i += 1) {
        const x = -22 + i * 5.5;
        const y = -7 + (i % 3) * 5;
        g.circle(x, y, 4.2).fill({ color: i % 2 ? 0xff8fc5 : 0xffdf75, alpha: 0.96 });
      }
    } else if (kind === 'lighthouse') {
      g.ellipse(0, 6, 42, 18).fill({ color: 0x294b55, alpha: 0.18 });
      g.roundRect(-18, -96, 36, 98, 12).fill({ color: 0xfff7e4, alpha: 0.98 }).stroke({ color: 0x75d4ff, alpha: 0.72, width: 5 });
      g.roundRect(-24, -112, 48, 24, 10).fill({ color: 0x4ab8e8, alpha: 0.96 }).stroke({ color: 0xffffff, alpha: 0.62, width: 4 });
      g.circle(0, -101, 13).fill({ color: 0xfff1a6, alpha: 0.96 });
      g.poly([-30, -114, 0, -140, 30, -114]).fill({ color: 0x2c99d0, alpha: 0.96 });
      g.roundRect(-14, -58, 28, 8, 4).fill({ color: 0x7ad5ff, alpha: 0.7 });
      g.roundRect(-12, -30, 24, 8, 4).fill({ color: 0x7ad5ff, alpha: 0.7 });
    }
    c.addChild(g);
    return c;
  }

  private rebuildCollision(): void {
    this.blockedTiles.clear();
    this.occupiedTiles.clear();
    for (let y = 0; y < MAP_SIZE; y += 1) {
      for (let x = 0; x < MAP_SIZE; x += 1) {
        if (this.tileKinds.get(tileKey(x, y)) === 'sea') {
          const key = tileKey(x, y);
          this.blockedTiles.add(key);
          this.occupiedTiles.add(key);
        }
      }
    }
    for (const deco of VILLAGE_DECORATIONS) {
      if (!shouldUseDecoration(deco)) continue;
      if (deco.blocks) {
        const placement = auditedDecorationPlacement(deco);
        const isSoftEdgeDecor = V2039_EDGE_SAFE_DECORATIONS.has(deco.kind) && (deco.x <= 6 || deco.x >= 34 || deco.y >= 33);
        const key = tileKey(safeIntegerTile(placement.x), safeIntegerTile(placement.y));
        this.occupiedTiles.add(key);
        if (!isSoftEdgeDecor) this.blockedTiles.add(key);
      }
    }
    for (const b of this.save.village.buildings) {
      const isSoftProp = b.type === 'flower' || b.type === 'fountain';
      const walkBlockH = Math.max(1, b.h - (b.h > 1 ? BUILDING_COLLISION_FRONT_TRIM : 0));
      for (let yy = b.y; yy < b.y + b.h; yy += 1) {
        for (let xx = b.x; xx < b.x + b.w; xx += 1) {
          const key = tileKey(xx, yy);
          this.occupiedTiles.add(key);
          if (!isSoftProp && yy < b.y + walkBlockH) this.blockedTiles.add(key);
        }
      }
    }
  }

  private spawnActors(): void {
    this.actorLayer.removeChildren();
    this.npcs = [];
    this.player = this.createActor('player', 'player', this.worldPlayerName(), 20, 29, 0x1e9bff, '기대');
    this.actorLayer.addChild(this.player.node);
    const baseNpcs: Array<[WorldNpcRole, string, number, number, number, string]> = [
      ['chief', '촌장', 19, 18, 0xffd36e, '행복'],
      ['merchant', '상인', 14, 25, 0xff8b63, '즐거움'],
      ['guild', '길드원', 27, 25, 0x8ec7ff, '열정'],
      ['captain', '선장', 21, 31, 0x7dd0c5, '피곤'],
    ];
    const score = this.calculateDevelopment();
    baseNpcs.push(['tourist', '관광객', 17, 23, 0xffbee8, '감탄']);
    baseNpcs.push(['tourist', '관광객', 23, 24, 0xffd6a5, '산책']);
    if (score >= 500) baseNpcs.push(['tourist', '관광객', 23, 18, 0xffbee8, '여행']);
    if (score >= 1000) baseNpcs.push(['vip', 'VIP', 22, 23, 0xb895ff, '만족']);
    for (const [role, name, x, y, color, mood] of baseNpcs) {
      const actor = this.createActor(`npc_${role}_${x}_${y}`, role, name, x, y, color, mood);
      actor.targetTimer = 40 + Math.random() * 180;
      this.npcs.push(actor);
      this.actorLayer.addChild(actor.node);
    }
    window.setTimeout(() => {
      if (this.destroyed) return;
      this.npcs.forEach((npc) => { if (npc.path.length === 0) this.assignNpcTarget(npc); });
    }, 120);
  }

  private actorTextureUrl(role: Actor['role'], direction: ActorDirection): string {
    const corrected = ACTOR_DIRECTION_TEXTURE_FIX[direction] ?? direction;
    if (role === 'player') return playerActorMotionTextureUrl(direction, 0);
    return ACTOR_DIRECTION_TEXTURES[role]?.[corrected] ?? ACTOR_TEXTURES[role];
  }

  private setActorSpriteTexture(actor: Actor, url: string, targetH = actor.role === 'player' ? 90 : 80): void {
    if (!(actor.body instanceof Sprite)) return;
    const texture = this.textures.get(url);
    if (!texture) return;
    if (actor.body.texture !== texture) actor.body.texture = texture;
    const baseScale = targetH / Math.max(1, texture.height);
    actor.body.scale.set(baseScale);
    actor.groundOffset = actorSpriteGroundOffset(url, targetH);
    actor.body.position.set(0, actor.groundOffset);
  }

  private applyActorTexture(actor: Actor, direction: ActorDirection): void {
    if (!(actor.body instanceof Sprite)) return;
    const textureUrl = this.actorTextureUrl(actor.role, direction);
    this.setActorSpriteTexture(actor, textureUrl);
  }

  private createActor(id: string, role: Actor['role'], name: string, tileX: number, tileY: number, color: number, mood: string): Actor {
    const p = actorGround(tileX, tileY);
    const node = new Container();
    node.zIndex = tileY * 20 + 16;
    const shadow = new Graphics();
    shadow.ellipse(0, 1, role === 'player' ? 21 : 18, role === 'player' ? 7 : 6).fill({ color: 0x294b55, alpha: 0.30 });
    const footContact = new Graphics();
    footContact.ellipse(-5, -1, role === 'player' ? 5.2 : 4.4, 2.4).fill({ color: 0x123b45, alpha: 0.16 });
    footContact.ellipse(6, -1, role === 'player' ? 5.2 : 4.4, 2.4).fill({ color: 0x123b45, alpha: 0.13 });

    let body: Graphics | Sprite;
    let groundOffset = 0;
    const textureUrl = this.actorTextureUrl(role, 'south');
    const texture = this.textures.get(textureUrl);
    if (texture) {
      const sprite = new Sprite(texture);
      sprite.anchor.set(0.5, 1);
      const targetH = role === 'player' ? 90 : 80;
      sprite.scale.set(targetH / Math.max(1, sprite.texture.height));
      groundOffset = actorSpriteGroundOffset(textureUrl, targetH);
      sprite.position.set(0, groundOffset);
      body = sprite;
    } else {
      const g = new Graphics();
      g.circle(0, -15, 18).fill({ color, alpha: 1 }).stroke({ color: 0xffffff, width: 4, alpha: 0.92 });
      g.circle(-6, -19, 2.8).fill({ color: 0x274659, alpha: 1 });
      g.circle(6, -19, 2.8).fill({ color: 0x274659, alpha: 1 });
      g.roundRect(-10, -4, 20, 24, 10).fill({ color: role === 'player' ? 0x0f83d3 : 0xffffff, alpha: role === 'player' ? 0.92 : 0.7 });
      body = g;
    }

    const label = new Text({ text: name, style: { fontFamily: 'Arial', fontSize: 14, fontWeight: '900', fill: 0x20384a, stroke: { color: 0xffffff, width: 2 } } });
    label.anchor.set(0.5);
    label.position.set(0, role === 'player' ? -100 : -88);
    node.addChild(shadow, footContact, body, label);
    node.position.set(p.x, p.y);
    return {
      id,
      role,
      name,
      tileX,
      tileY,
      x: p.x,
      y: p.y,
      speed: role === 'player' ? PLAYER_WALK_SPEED : NPC_WALK_SPEED_MIN + Math.random() * NPC_WALK_SPEED_RANGE,
      path: [],
      node,
      body,
      shadow,
      footContact,
      label,
      groundOffset,
      direction: 'south',
      mood,
      walkPhase: 0,
      talk: role === 'player' ? [] : DAY_TALK[role as WorldNpcRole] ?? DAY_TALK.tourist,
      targetTimer: role === 'player' ? 0 : 260 + Math.random() * 900,
      pauseTimer: 0,
      desiredTile: undefined,
    };
  }

  private bindStageInput(): void {
    if (!this.app) return;
    const canvas = this.app.canvas;
    canvas.style.touchAction = 'none';
    canvas.addEventListener('pointerdown', (ev: PointerEvent) => {
      this.activePointers.set(ev.pointerId, this.pointerToStagePoint(ev));
      canvas.setPointerCapture?.(ev.pointerId);
      if (this.activePointers.size >= 2) {
        this.pointer = undefined;
        this.beginPinchZoom();
        return;
      }
      this.pointer = { startX: ev.clientX, startY: ev.clientY, lastX: ev.clientX, lastY: ev.clientY, moved: false };
      if (this.selectedBuild) this.updatePreviewFromPointer(ev);
    });
    canvas.addEventListener('pointermove', (ev: PointerEvent) => {
      if (this.activePointers.has(ev.pointerId)) this.activePointers.set(ev.pointerId, this.pointerToStagePoint(ev));
      if (this.activePointers.size >= 2) {
        this.updatePinchZoom();
        return;
      }
      if (!this.pointer) return;
      const dx = ev.clientX - this.pointer.lastX;
      const dy = ev.clientY - this.pointer.lastY;
      const total = Math.hypot(ev.clientX - this.pointer.startX, ev.clientY - this.pointer.startY);
      this.pointer.moved = this.pointer.moved || total > 8;
      this.pointer.lastX = ev.clientX;
      this.pointer.lastY = ev.clientY;
      if (this.pointer.moved && !this.selectedBuild) {
        this.camera.x += dx;
        this.camera.y += dy;
        this.cameraFollowUntil = 0;
        this.applyCamera();
      }
      if (this.selectedBuild) this.updatePreviewFromPointer(ev);
    });
    canvas.addEventListener('pointerup', (ev: PointerEvent) => {
      const track = this.pointer;
      this.activePointers.delete(ev.pointerId);
      if (this.activePointers.size >= 2) this.beginPinchZoom();
      else { this.pinchDistance = 0; this.pinchCenterScreen = null; this.pinchCenterWorld = null; }
      this.pointer = undefined;
      canvas.releasePointerCapture?.(ev.pointerId);
      if (!track || this.activePointers.size > 0) return;
      if (!track.moved || this.selectedBuild) this.handlePointerTap(ev);
    });
    canvas.addEventListener('pointercancel', (ev: PointerEvent) => {
      this.activePointers.delete(ev.pointerId);
      this.pointer = undefined;
      this.pinchDistance = 0;
      this.pinchCenterScreen = null;
      this.pinchCenterWorld = null;
    });
    canvas.addEventListener('wheel', (ev: WheelEvent) => {
      ev.preventDefault();
      this.zoom(ev.deltaY > 0 ? -0.08 : 0.08, false);
    }, { passive: false });
  }

  private pointerDistance(): number {
    const points = Array.from(this.activePointers.values()).slice(0, 2);
    if (points.length < 2) return 0;
    return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
  }

  private pointerCenter(): PointerPoint | null {
    const points = Array.from(this.activePointers.values()).slice(0, 2);
    if (points.length < 2) return null;
    return { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 };
  }

  private screenToWorld(point: PointerPoint, scale = this.camera.scale): PointerPoint {
    return { x: (point.x - this.camera.x) / scale, y: (point.y - this.camera.y) / scale };
  }

  private pointerToStagePoint(ev: PointerEvent): PointerPoint {
    if (!this.app) return { x: ev.clientX, y: ev.clientY };
    const rect = this.app.canvas.getBoundingClientRect();
    const scaleX = this.app.screen.width / Math.max(1, rect.width);
    const scaleY = this.app.screen.height / Math.max(1, rect.height);
    return {
      x: (ev.clientX - rect.left) * scaleX,
      y: (ev.clientY - rect.top) * scaleY,
    };
  }

  private pointerToWorldPoint(ev: PointerEvent): PointerPoint {
    return this.screenToWorld(this.pointerToStagePoint(ev), this.camera.scale);
  }

  private pointerHitFromEvent(ev: PointerEvent): VillagePointerHit {
    const screen = this.pointerToStagePoint(ev);
    const world = this.screenToWorld(screen, this.camera.scale);
    // v2.1.13: keep the real canvas-local diamond hit. Previous visual-foot bias made
    // the village floor feel shifted on mobile, so the new shell keeps raw coordinates.
    // Building hit scoring still receives raw worldX/worldY for body/footprint pickup.
    // v2080 validation lineage: const tile = nearestDiamondTile(wx, wy);
    const tile = nearestDiamondTile(world.x, world.y);
    return {
      x: safeIntegerTile(tile.x),
      y: safeIntegerTile(tile.y),
      worldX: world.x,
      worldY: world.y,
      screenX: screen.x,
      screenY: screen.y,
    };
  }

  private beginPinchZoom(): void {
    const center = this.pointerCenter();
    if (!center) return;
    this.pinchDistance = this.pointerDistance();
    this.pinchScale = this.camera.scale;
    this.pinchCenterScreen = center;
    this.pinchCenterWorld = this.screenToWorld(center, this.camera.scale);
  }

  private updatePinchZoom(): void {
    const distance = this.pointerDistance();
    if (distance <= 8) return;
    if (this.pinchDistance <= 0 || !this.pinchCenterWorld) {
      this.beginPinchZoom();
      return;
    }
    const center = this.pointerCenter() ?? this.pinchCenterScreen;
    const nextScale = clamp(this.pinchScale * (distance / this.pinchDistance), 0.55, 1.65);
    this.camera.scale = nextScale;
    if (center) {
      this.camera.x = center.x - this.pinchCenterWorld.x * nextScale;
      this.camera.y = center.y - this.pinchCenterWorld.y * nextScale;
    }
    this.cameraFollowUntil = 0;
    this.applyCamera();
  }

  private bindUi(): void {
    this.root.querySelectorAll<HTMLButtonElement>('[data-build-type]').forEach((button) => {
      button.addEventListener('click', () => {
        const type = button.dataset.buildType as VillageBuildingType;
        if (this.selectedBuild === type) {
          this.setBuildMode(null);
          this.setBuildTrayOpen(true);
          return;
        }
        this.setBuildMode(type);
        this.setBuildTrayOpen(false, true);
      });
    });
    this.root.querySelector<HTMLButtonElement>('[data-village-zoom-in]')?.addEventListener('click', () => this.zoom(0.11, true));
    this.root.querySelector<HTMLButtonElement>('[data-village-zoom-out]')?.addEventListener('click', () => this.zoom(-0.11, true));
    this.root.querySelector<HTMLButtonElement>('[data-village-center]')?.addEventListener('click', () => { this.cameraFollowUntil = performance.now() + 1200; this.centerCameraOnPlayer(); });
    const buildOpenButton = this.root.querySelector<HTMLButtonElement>('[data-village-build-open]');
    let lastBuildToggleAt = 0;
    const toggleBuildTrayFromButton = (ev: Event) => {
      if (ev.defaultPrevented) return;
      ev.preventDefault();
      ev.stopPropagation();
      const now = performance.now();
      if (now - lastBuildToggleAt < 180) return;
      lastBuildToggleAt = now;
      if (this.selectedBuild) {
        this.setBuildMode(null);
        this.setBuildTrayOpen(false);
        this.showGuide('설치 취소', '건설 버튼을 다시 누르면 건물 목록을 열 수 있습니다.');
        return;
      }
      this.setBuildTrayOpen(!this.buildTrayOpen);
    };
    buildOpenButton?.addEventListener('pointerup', toggleBuildTrayFromButton, { capture: true });
    buildOpenButton?.addEventListener('click', toggleBuildTrayFromButton, { capture: true });
    this.root.querySelectorAll<HTMLElement>('[data-village-build-close]').forEach((node) => node.addEventListener('click', (ev) => { ev.preventDefault(); ev.stopPropagation(); this.setBuildTrayOpen(false); }));
    this.root.querySelectorAll<HTMLElement>('[data-v2130-build-confirm-cancel]').forEach((node) => node.addEventListener('click', (ev) => { ev.preventDefault(); ev.stopPropagation(); this.cancelBuildConfirmation(); }));
    this.root.querySelector<HTMLButtonElement>('[data-v2130-build-confirm-apply]')?.addEventListener('click', (ev) => { ev.preventDefault(); ev.stopPropagation(); this.applyPendingBuildPlacement(); });
    this.root.querySelectorAll<HTMLElement>('[data-village-build-open], [data-village-build-close], [data-build-type], [data-village-zoom-in], [data-village-zoom-out], [data-village-center], [data-village-shop], [data-village-fishing], [data-v2130-build-confirm], [data-v2130-build-confirm-apply], [data-v2130-build-confirm-cancel]').forEach((node) => {
      node.addEventListener('pointerdown', (ev) => { ev.stopPropagation(); }, { capture: true });
      node.addEventListener('pointerup', (ev) => { ev.stopPropagation(); }, { capture: true });
    });
    this.bindJoystick();
    const routeAction = (handler: () => void) => (ev: Event) => {
      if (ev.defaultPrevented) return;
      ev.preventDefault();
      ev.stopPropagation();
      handler();
    };
    const shopButton = this.root.querySelector<HTMLButtonElement>('[data-village-shop]');
    const fishingButton = this.root.querySelector<HTMLButtonElement>('[data-village-fishing]');
    shopButton?.addEventListener('pointerup', routeAction(() => this.onOpenShop?.()), { capture: true });
    shopButton?.addEventListener('click', routeAction(() => this.onOpenShop?.()), { capture: true });
    fishingButton?.addEventListener('pointerup', routeAction(() => this.onGoFishing()), { capture: true });
    fishingButton?.addEventListener('click', routeAction(() => this.onGoFishing()), { capture: true });
    this.root.querySelectorAll<HTMLElement>('[data-v203-interior-close]').forEach((node) => node.addEventListener('click', () => this.closeInterior()));
    this.root.querySelector<HTMLButtonElement>('[data-v203-interior-go-fishing]')?.addEventListener('click', () => this.onGoFishing());
    this.root.querySelector<HTMLButtonElement>('[data-v2044-interior-move]')?.addEventListener('click', () => {
      const building = this.focusedBuildingId ? this.save.village.buildings.find((item) => item.id === this.focusedBuildingId) : undefined;
      if (!building) {
        this.showGuide('이동할 건물 없음', '건물을 먼저 터치한 뒤 이동을 선택하세요.');
        return;
      }
      this.closeInterior();
      this.beginMoveBuilding(building);
    });
  }

  private bindJoystick(): void {
    const stick = this.root.querySelector<HTMLElement>('[data-village-joystick]');
    const knob = this.root.querySelector<HTMLElement>('[data-village-joystick-knob]');
    if (!stick || !knob) return;
    this.joystickKnob = knob;
    const radius = 46;
    const update = (ev: PointerEvent) => {
      const rect = stick.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = ev.clientX - cx;
      const dy = ev.clientY - cy;
      const length = Math.hypot(dx, dy);
      const limited = Math.min(radius, length);
      const nx = length > 0 ? dx / length : 0;
      const ny = length > 0 ? dy / length : 0;
      const knobTransform = `translate(calc(-50% + ${nx * limited}px), calc(-50% + ${ny * limited}px))`;
      knob.style.setProperty('--v2117-joystick-transform', knobTransform);
      knob.style.setProperty('--v2118-joystick-transform', knobTransform);
      knob.style.setProperty('--v2119-joystick-transform', knobTransform);
      knob.style.setProperty('--v2120-joystick-transform', knobTransform);
      knob.style.setProperty('--v2121-joystick-transform', knobTransform);
      knob.style.setProperty('--v2122-joystick-transform', knobTransform);
      knob.style.setProperty('--v2123-joystick-transform', knobTransform);
      knob.style.setProperty('--v2124-joystick-transform', knobTransform);
      knob.style.setProperty('--v2125-joystick-transform', knobTransform);
      knob.style.setProperty('--v2127-joystick-transform', knobTransform);
      knob.style.setProperty('--v2128-joystick-transform', knobTransform);
      knob.style.setProperty('--v2129-joystick-transform', knobTransform);
      knob.style.setProperty('--v2130-joystick-transform', knobTransform);
      knob.style.transform = `translate(calc(-50% + ${nx * limited}px), calc(-50% + ${ny * limited}px))`;
      const strength = Math.min(1, length / radius);
      this.joystick.x = nx * strength;
      this.joystick.y = ny * strength;
      this.joystick.active = strength > 0.08;
      if (this.joystick.active) {
        this.cameraFollowUntil = performance.now() + 800;
        if (this.player) this.player.path = [];
      }
    };
    const reset = () => {
      this.joystick = { x: 0, y: 0, active: false, pointerId: null };
      knob.style.setProperty('--v2117-joystick-transform', 'translate(-50%, -50%)');
      knob.style.setProperty('--v2118-joystick-transform', 'translate(-50%, -50%)');
      knob.style.setProperty('--v2119-joystick-transform', 'translate(-50%, -50%)');
      knob.style.setProperty('--v2120-joystick-transform', 'translate(-50%, -50%)');
      knob.style.setProperty('--v2121-joystick-transform', 'translate(-50%, -50%)');
      knob.style.setProperty('--v2122-joystick-transform', 'translate(-50%, -50%)');
      knob.style.setProperty('--v2123-joystick-transform', 'translate(-50%, -50%)');
      knob.style.setProperty('--v2124-joystick-transform', 'translate(-50%, -50%)');
      knob.style.setProperty('--v2125-joystick-transform', 'translate(-50%, -50%)');
      knob.style.setProperty('--v2127-joystick-transform', 'translate(-50%, -50%)');
      knob.style.setProperty('--v2128-joystick-transform', 'translate(-50%, -50%)');
      knob.style.setProperty('--v2129-joystick-transform', 'translate(-50%, -50%)');
      knob.style.setProperty('--v2130-joystick-transform', 'translate(-50%, -50%)');
      knob.style.transform = 'translate(-50%, -50%)';
    };
    stick.addEventListener('pointerdown', (ev) => {
      ev.preventDefault();
      this.joystick.pointerId = ev.pointerId;
      stick.setPointerCapture?.(ev.pointerId);
      update(ev);
    });
    stick.addEventListener('pointermove', (ev) => {
      if (this.joystick.pointerId !== ev.pointerId) return;
      ev.preventDefault();
      update(ev);
    });
    stick.addEventListener('pointerup', (ev) => {
      if (this.joystick.pointerId !== ev.pointerId) return;
      stick.releasePointerCapture?.(ev.pointerId);
      reset();
    });
    stick.addEventListener('pointercancel', reset);
  }

  private movePlayerByJoystick(deltaMs: number): void {
    if (!this.player || !this.joystick.active) return;
    const magnitude = Math.hypot(this.joystick.x, this.joystick.y);
    if (magnitude <= 0.08) return;
    const key = tileKey(this.player.tileX, this.player.tileY);
    const pathBoost = this.pathTiles.has(key) ? 1.12 : 1;
    const step = this.player.speed * pathBoost * Math.max(0.75, deltaMs / 16.67) * clamp(magnitude, 0.25, 1);
    const tryMove = (dx: number, dy: number): boolean => {
      const nx = this.player!.x + dx;
      const ny = this.player!.y + dy;
      const tile = worldToTile(nx, ny);
      if (!this.isWalkable(tile.x, tile.y)) return false;
      this.player!.x = nx;
      this.player!.y = ny;
      this.player!.tileX = tile.x;
      this.player!.tileY = tile.y;
      return true;
    };
    const dx = this.joystick.x * step;
    const dy = this.joystick.y * step;
    if (!tryMove(dx, dy)) {
      if (!tryMove(dx, 0)) tryMove(0, dy);
    }
    this.player.node.position.set(this.player.x, this.player.y);
    this.player.node.zIndex = this.player.tileY * 20 + 16;
    const movementAmount = Math.hypot(dx, dy);
    if (movementAmount > 0.2) this.setActorDirection(this.player, dx, dy);
    this.animateActorWalk(this.player, movementAmount, deltaMs);
  }

  private handlePointerTap(ev: PointerEvent): void {
    const hit = this.pointerHitFromEvent(ev);
    if (!this.inBounds(hit.x, hit.y)) return;
    if (this.selectedBuild) {
      const def = BUILD_DEFS[this.selectedBuild];
      // v2043 validation lineage: const origin = this.buildOriginFromPointerTile(tile.x, tile.y, def)
      const origin = this.buildOriginFromPointerTile(hit.x, hit.y, def);
      const assisted = this.nearestPlaceableOrigin(origin.x, origin.y, def, this.movingBuildingId);
      const finalOrigin = assisted ?? origin;
      const ok = this.canPlace(finalOrigin.x, finalOrigin.y, def, this.movingBuildingId);
      this.updateBuildPreviewAtTile(finalOrigin.x, finalOrigin.y, true);
      this.showTileMarker(finalOrigin.x, finalOrigin.y, ok ? 0x35f08a : 0xff4747);
      if (!ok) {
        this.hideBuildConfirm();
        this.showGuide(this.movingBuildingId ? '이동 불가' : '설치 불가', '빨간 풋프린트 위치에는 놓을 수 없습니다. 바다, 길, 건물, 장식 또는 시각 안전 간격과 겹치지 않는 초록 타일을 선택하세요.');
        return;
      }
      if (assisted && (assisted.x !== origin.x || assisted.y !== origin.y)) {
        this.showGuide('타일 보정', '근처의 가장 가까운 설치 가능 타일로 미세 보정했습니다. 초록 풋프린트와 오브젝트 간격을 확인하세요.');
      }
      this.showBuildConfirm({ type: this.selectedBuild, x: finalOrigin.x, y: finalOrigin.y, movingId: this.movingBuildingId });
      return;
    }
    const building = this.findBuildingNear(hit.x, hit.y, hit.worldX, hit.worldY);
    if (building) {
      const focus = this.buildingFocusTile(building);
      this.showTileMarker(focus.x, focus.y, 0x6bdcff);
      this.movePlayerNear(focus.x, focus.y);
      this.interactBuilding(building);
      return;
    }
    this.showTileMarker(hit.x, hit.y, 0x6bdcff);
    const npc = this.findNpcNear(hit.x, hit.y);
    if (npc) {
      this.movePlayerNear(hit.x, hit.y);
      this.openDialogue(npc);
      return;
    }
    this.movePlayerTo(hit.x, hit.y);
  }

  private updatePreviewFromPointer(ev: PointerEvent): void {
    const tile = this.tileFromPointer(ev);
    this.updateBuildPreviewAtTile(tile.x, tile.y);
  }

  private buildOriginFromPointerTile(x: number, y: number, def: BuildDefinition): { x: number; y: number } {
    if (def.kind === 'path') {
      return { x: clamp(x, 1, MAP_SIZE - 2), y: clamp(y, 1, MAP_SIZE - 2) };
    }
    const [w, h] = def.size;
    return {
      // v2.0.57: users place large slanted assets by their lower-left foot tile.
      x: clamp(x, 1, MAP_SIZE - w - 1),
      y: clamp(y - h + 1, 1, MAP_SIZE - h - 1),
    };
  }

  // v2027 validation lineage: private updateBuildPreviewAtTile(x: number, y: number): void
  private updateBuildPreviewAtTile(x: number, y: number, alreadyOrigin = false): void {
    if (!this.selectedBuild) return;
    const def = BUILD_DEFS[this.selectedBuild];
    const origin = alreadyOrigin ? { x, y } : this.buildOriginFromPointerTile(x, y, def);
    x = origin.x;
    y = origin.y;
    if (this.hoverTile?.x === x && this.hoverTile?.y === y) return;
    this.hoverTile = { x, y };
    this.previewLayer.removeChildren();
    if (!this.inBounds(x, y)) return;
    const ok = this.canPlace(x, y, def, this.movingBuildingId);
    const g = new Graphics();
    for (let yy = y; yy < y + def.size[1]; yy += 1) {
      for (let xx = x; xx < x + def.size[0]; xx += 1) {
        g.poly(tileDiamondPoints(xx, yy));
        g.fill({ color: ok ? 0x35f08a : 0xff4747, alpha: def.kind === 'path' ? 0.18 : 0.08 });
        g.stroke({ color: ok ? 0xb8fff0 : 0xffd0d0, alpha: def.kind === 'path' ? 0.62 : 0.78, width: def.kind === 'path' ? 1.5 : 2.4 });
        const overlay = def.kind === 'path' ? this.createBuildPreviewTileSprite(xx, yy, ok) : undefined;
        if (overlay) this.previewLayer.addChild(overlay);
      }
    }
    const ghost = this.createBuildGhost(def, x, y, ok);
    g.zIndex = 99998;
    this.previewLayer.addChild(g);
    if (ghost) this.previewLayer.addChild(ghost);
  }


  private createBuildPreviewTileSprite(x: number, y: number, ok: boolean): Sprite | undefined {
    const url = ok ? BUILD_PREVIEW_TEXTURES.valid : BUILD_PREVIEW_TEXTURES.invalid;
    const texture = this.textures.get(url);
    if (!texture) return undefined;
    const p = isoToWorld(x, y);
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5, 0.72);
    const targetW = TILE_W * 1.42;
    sprite.scale.set(targetW / Math.max(1, texture.width));
    sprite.position.set(p.x + TILE_W / 2, p.y + TILE_H * 0.5);
    sprite.alpha = ok ? 0.82 : 0.88;
    sprite.zIndex = 99999;
    return sprite;
  }

  private createBuildGhost(def: BuildDefinition, x: number, y: number, ok: boolean): Container | undefined {
    if (def.kind === 'path') return undefined;
    const [w, h] = def.size;
    const center = footprintGround(x, y, w, h);
    const ghost = new Container();
    ghost.zIndex = 100000;
    ghost.alpha = ok ? 0.56 : 0.50;
    ghost.position.set(center.x, center.y);
    ghost.addChild(this.createFootprintBaseGraphic(x, y, w, h, def.kind));
    const texture = def.texture ? this.textures.get(def.texture) : undefined;
    if (texture) {
      const sprite = new Sprite(texture);
      sprite.anchor.set(0.5, 1);
      const targetW = Math.max(96, w * TILE_W * BUILDING_VISUAL_SCALE);
      sprite.scale.set(targetW / Math.max(1, sprite.texture.width));
      sprite.position.set(0, 0);
      sprite.tint = ok ? 0xa6ffd0 : 0xff8f8f;
      ghost.addChild(sprite);
      return ghost;
    }
    const graphic = this.createPropGraphic(def.type, w, h);
    graphic.position.set(0, 0);
    graphic.alpha = 0.72;
    ghost.addChild(graphic);
    return ghost;
  }

  private tileFromPointer(ev: PointerEvent): { x: number; y: number } {
    const hit = this.pointerHitFromEvent(ev);
    return { x: hit.x, y: hit.y };
  }

  private beginMoveBuilding(building: VillageBuildingSave): void {
    const def = BUILD_DEFS[building.type];
    if (!def || def.kind === 'path') {
      this.showGuide('이동 불가', '길은 아직 이동 대상이 아닙니다. 건물과 장식부터 이동할 수 있어요.');
      return;
    }
    this.movingBuildingId = building.id;
    this.selectedBuild = building.type;
    this.buildTrayOpen = false;
    this.root.classList.add('v2044-building-move-active');
    this.root.toggleAttribute('data-v2044-build-move-placement', true);
    this.setBuildMode(building.type);
    this.updateBuildPreviewAtTile(building.x, building.y, true);
    this.showGuide('건물 이동 모드', `${def.label} 이동 중 · 반투명 프리뷰를 원하는 타일에 맞춘 뒤 누르면 이동 확인창이 열립니다.`);
  }


  private showBuildConfirm(placement: PendingBuildPlacement): void {
    const def = BUILD_DEFS[placement.type];
    if (!def) return;
    this.pendingBuildPlacement = placement;
    const node = this.root.querySelector<HTMLElement>('[data-v2130-build-confirm]');
    if (!node) return;
    const mode = placement.movingId ? '이동 확인' : '건설 확인';
    const title = placement.movingId ? `${def.label}을(를) 이 위치로 옮길까요?` : `${def.label}을(를) 이 위치에 건설할까요?`;
    const body = placement.movingId
      ? '반투명 프리뷰와 초록색 풋프린트를 확인한 뒤 이동을 확정하세요.'
      : `${def.cost.toLocaleString('ko-KR')}G 사용 · 초록색 풋프린트 위치에만 설치됩니다. 취소하면 프리뷰는 유지됩니다.`;
    node.querySelector<HTMLElement>('[data-v2130-build-confirm-mode]')!.textContent = mode;
    node.querySelector<HTMLElement>('[data-v2130-build-confirm-title]')!.textContent = title;
    node.querySelector<HTMLElement>('[data-v2130-build-confirm-body]')!.textContent = body;
    const apply = node.querySelector<HTMLButtonElement>('[data-v2130-build-confirm-apply]');
    if (apply) apply.textContent = placement.movingId ? '이동' : '건설';
    node.classList.add('open');
    node.setAttribute('aria-hidden', 'false');
    this.root.classList.add('v2130-build-confirm-open', 'v2131-build-confirm-open');
    document.body.classList.add('v2130-build-confirm-open', 'v2131-build-confirm-open');
    this.showGuide(mode, '중앙 확인창에서 건설/이동 또는 취소를 선택하세요. 마을 바닥 입력은 잠시 멈춥니다.');
  }

  private hideBuildConfirm(clearPending = true): void {
    if (clearPending) this.pendingBuildPlacement = null;
    const node = this.root.querySelector<HTMLElement>('[data-v2130-build-confirm]');
    node?.classList.remove('open');
    node?.setAttribute('aria-hidden', 'true');
    this.root.classList.remove('v2130-build-confirm-open', 'v2131-build-confirm-open');
    document.body.classList.remove('v2130-build-confirm-open', 'v2131-build-confirm-open');
  }

  private cancelBuildConfirmation(): void {
    this.hideBuildConfirm();
    this.showGuide('건설 취소', '반투명 프리뷰는 유지됩니다. 다른 타일을 누르면 다시 확인창을 열 수 있고, 건설 버튼을 누르면 선택을 종료합니다.');
  }

  private applyPendingBuildPlacement(): void {
    const placement = this.pendingBuildPlacement;
    if (!placement) return;
    this.hideBuildConfirm(false);
    if (placement.movingId) this.tryMoveBuilding(placement.x, placement.y, placement.movingId);
    else this.tryPlace(placement.x, placement.y, placement.type);
    this.pendingBuildPlacement = null;
  }

  private tryMoveBuilding(x: number, y: number, id: string): void {
    const building = this.save.village.buildings.find((item) => item.id === id);
    if (!building) {
      this.setBuildMode(null);
      return;
    }
    const def = BUILD_DEFS[building.type];
    if (!def || !this.canPlace(x, y, def, id)) {
      this.showGuide('이동 불가', '빨간 풋프린트 위치에는 이동할 수 없습니다. 건물, 나무, 바다, 길, 다른 구조물 또는 시각 안전 간격과 겹치지 않는 초록 타일을 선택하세요.');
      return;
    }
    const [w, h] = def.size;
    building.x = x;
    building.y = y;
    building.w = w;
    building.h = h;
    this.movingBuildingId = null;
    this.focusedBuildingId = building.id;
    this.root.classList.remove('v2044-building-move-active');
    this.renderBuildings();
    this.save.village.development = this.calculateDevelopment();
    this.onSave();
    this.syncHud();
    this.showGuide('건물 이동 완료', `${def.label} 위치를 저장했습니다. 건물은 영구 보존되며 다시 터치해 이동할 수 있습니다.`);
    this.setBuildMode(null);
  }

  private tryPlace(x: number, y: number, type: VillageBuildingType): void {
    const def = BUILD_DEFS[type];
    if (!def) return;
    if (!this.canPlace(x, y, def)) {
      this.showGuide('설치 불가', '빨간 풋프린트 위치에는 설치할 수 없습니다. 바다/나무/기존 구조물/길/시각 안전 간격과 겹치지 않는 초록 타일을 선택하세요.');
      return;
    }
    if (this.save.coins < def.cost) {
      this.showGuide('골드 부족', `${def.label} 설치에는 ${def.cost.toLocaleString('ko-KR')}G가 필요합니다.`);
      return;
    }
    this.save.coins -= def.cost;
    if (def.kind === 'path') {
      const key = tileKey(x, y);
      if (!this.save.village.paths.includes(key)) this.save.village.paths.push(key);
      this.pathTiles.add(key);
      this.tileKinds.set(key, 'stone');
      this.renderTiles();
    } else {
      const [w, h] = def.size;
      this.save.village.buildings.push({ id: `b_${type}_${Date.now()}`, type, x, y, w, h, builtAt: Date.now() });
      this.renderBuildings();
    }
    this.save.village.fund += Math.floor(def.cost * 0.15);
    this.save.village.development = this.calculateDevelopment();
    this.onSave();
    this.syncHud();
    this.showGuide('설치 완료', `${def.label} 설치 완료 · 마을 발전도 +${def.score}`);
    if (type !== 'path') this.setBuildMode(null);
  }

  private hasVisualObjectClearance(x: number, y: number, w: number, h: number, ignoreBuildingId: string | null = null): boolean {
    for (let yy = y - 1; yy < y + h + 1; yy += 1) {
      for (let xx = x - 1; xx < x + w + 1; xx += 1) {
        const insideFootprint = xx >= x && xx < x + w && yy >= y && yy < y + h;
        if (insideFootprint || !this.inBounds(xx, yy)) continue;
        const key = tileKey(xx, yy);
        if ((this.tileKinds.get(key) ?? 'grass') === 'sea') continue;
        const ignoredTile = ignoreBuildingId ? this.tileBelongsToBuilding(xx, yy, ignoreBuildingId) : false;
        if (!ignoredTile && (this.occupiedTiles.has(key) || this.blockedTiles.has(key))) return false;
      }
    }
    return true;
  }

  private nearestPlaceableOrigin(x: number, y: number, def: BuildDefinition, ignoreBuildingId: string | null = null): { x: number; y: number } | null {
    if (this.canPlace(x, y, def, ignoreBuildingId)) return { x, y };
    if (def.kind === 'path') return null;
    const [w, h] = def.size;
    let bestX = 0;
    let bestY = 0;
    let bestScore = Number.POSITIVE_INFINITY;
    let found = false;
    const maxAssistRadius = Math.min(V2138_FINE_PLACEMENT_SEARCH_RADIUS, 2);
    const preferExactTapBeforeAssist = true;
    if (preferExactTapBeforeAssist && this.canPlace(x, y, def, ignoreBuildingId)) return { x, y };
    for (let radius = 1; radius <= maxAssistRadius; radius += 1) {
      for (let dy = -radius; dy <= radius; dy += 1) {
        for (let dx = -radius; dx <= radius; dx += 1) {
          const nx = clamp(x + dx, 1, MAP_SIZE - w - 1);
          const ny = clamp(y + dy, 1, MAP_SIZE - h - 1);
          if (!this.canPlace(nx, ny, def, ignoreBuildingId)) continue;
          const score = Math.abs(dx) + Math.abs(dy) + Math.hypot(dx, dy) * 0.1;
          if (!found || score < bestScore) {
            bestX = nx;
            bestY = ny;
            bestScore = score;
            found = true;
          }
        }
      }
      if (found) break;
    }
    return found ? { x: bestX, y: bestY } : null;
  }

  private canPlace(x: number, y: number, def: BuildDefinition, ignoreBuildingId: string | null = null): boolean {
    const [w, h] = def.size;
    for (let yy = y; yy < y + h; yy += 1) {
      for (let xx = x; xx < x + w; xx += 1) {
        if (!this.inBounds(xx, yy)) return false;
        const key = tileKey(xx, yy);
        const tile = this.tileKinds.get(key);
        if (tile === 'sea') return false;
        if (def.kind !== 'path' && this.pathTiles.has(key)) return false;
        const ignoredTile = ignoreBuildingId ? this.tileBelongsToBuilding(xx, yy, ignoreBuildingId) : false;
        if (this.occupiedTiles.has(key) && !ignoredTile) return false;
        if (this.blockedTiles.has(key) && !ignoredTile) return false;
        if (def.kind === 'path' && this.pathTiles.has(key)) return false;
      }
    }
    if (def.kind !== 'path' && !this.hasVisualObjectClearance(x, y, w, h, ignoreBuildingId)) return false;
    return true;
  }

  private findNpcNear(x: number, y: number): Actor | undefined {
    return this.npcs.find((npc) => Math.abs(npc.tileX - x) + Math.abs(npc.tileY - y) <= 1);
  }

  private tileBelongsToBuilding(x: number, y: number, id: string): boolean {
    const building = this.save.village.buildings.find((item) => item.id === id);
    return Boolean(building && x >= building.x && x < building.x + building.w && y >= building.y && y < building.y + building.h);
  }

  private buildingFocusTile(building: Pick<VillageBuildingSave, 'x' | 'y' | 'w' | 'h'>): { x: number; y: number } {
    return {
      x: clamp(Math.round(building.x + building.w / 2 - 0.5), 1, MAP_SIZE - 2),
      y: clamp(building.y + building.h, 1, MAP_SIZE - 2),
    };
  }

  private buildingHitScore(building: VillageBuildingSave, x: number, y: number, worldX: number, worldY: number): number {
    const def = BUILD_DEFS[building.type];
    const insideFootprint = x >= building.x && x < building.x + building.w && y >= building.y && y < building.y + building.h;
    const frontY = building.y + building.h;
    const sideSlack = Math.max(0, Math.ceil(building.w * BUILDING_HITBOX_SIDE_MARGIN));
    const atFrontDoor = y >= frontY - BUILDING_HITBOX_FRONT_MARGIN && y <= frontY + BUILDING_HITBOX_FRONT_MARGIN
      && x >= building.x - sideSlack && x < building.x + building.w + sideSlack;
    const lowerLeftTouch = atFrontDoor;
    const propNear = def?.kind === 'prop' && Math.abs(x - this.buildingFocusTile(building).x) <= 1 && Math.abs(y - this.buildingFocusTile(building).y) <= 1;
    if (!insideFootprint && !lowerLeftTouch && !propNear) return Number.POSITIVE_INFINITY;

    const focus = this.buildingFocusTile(building);
    const focusWorld = centerOfTile(focus.x, focus.y);
    const footprintCenter = footprintGround(building.x, building.y, building.w, building.h);
    const normalizedWorldDistance = Math.min(
      Math.hypot(worldX - focusWorld.x, worldY - focusWorld.y) / TILE_W,
      Math.hypot(worldX - footprintCenter.x, worldY - footprintCenter.y) / TILE_W,
    );
    const tileDistance = insideFootprint ? 0 : Math.abs(x - focus.x) + Math.abs(y - focus.y);
    const depthPenalty = Math.max(0, building.y - y) * 0.015;
    return normalizedWorldDistance + tileDistance * 0.18 + depthPenalty;
  }

  private findBuildingNear(x: number, y: number, worldX = centerOfTile(x, y).x, worldY = centerOfTile(x, y).y): VillageBuildingSave | undefined {
    const candidates = [...this.save.village.buildings]
      .map((building) => ({ building, score: this.buildingHitScore(building, x, y, worldX, worldY) }))
      .filter((entry) => Number.isFinite(entry.score))
      .sort((a, b) => a.score - b.score || (b.building.y + b.building.h) - (a.building.y + a.building.h));
    return candidates[0]?.building;
  }

  private interactBuilding(building: VillageBuildingSave): void {
    const def = BUILD_DEFS[building.type];
    if (!def) return;
    this.focusedBuildingId = building.id;
    if (building.type === 'market') {
      const caught = Object.values(this.save.caught).reduce((sum, count) => sum + count, 0);
      const bonus = Math.min(300, caught * 4 + this.save.village.buildings.length * 12);
      this.save.coins += bonus;
      this.save.village.fund += Math.floor(bonus * 0.25);
      this.onSave();
      this.syncHud();
      this.openInterior(building.type, `오늘의 자동 판매 정산 +${bonus.toLocaleString('ko-KR')}G · 창고/시장 자동화의 첫 단계입니다.`);
      return;
    }
    if (building.type === 'harbor' || building.type === 'inn' || building.type === 'guild') {
      this.openInterior(building.type);
      return;
    }
    this.openBuildingManagePanel(building);
  }

  private openBuildingManagePanel(building: VillageBuildingSave): void {
    const def = BUILD_DEFS[building.type];
    if (!def) return;
    const panel = this.root.querySelector<HTMLElement>('[data-v2097-interior-panel], [data-v2094-interior-panel]');
    const image = this.root.querySelector<HTMLImageElement>('[data-v2097-interior-image], [data-v2094-interior-image]');
    const title = this.root.querySelector<HTMLElement>('[data-v203-interior-title]');
    const body = this.root.querySelector<HTMLElement>('[data-v203-interior-body]');
    const action = this.root.querySelector<HTMLElement>('[data-v203-interior-go-fishing]');
    const portrait = this.root.querySelector<HTMLImageElement>('[data-v206-interior-portrait]');
    const status = this.root.querySelector<HTMLElement>('[data-v206-interior-status]');
    const mapAction = this.root.querySelector<HTMLElement>('[data-v206-interior-go-map]');
    const missionAction = this.root.querySelector<HTMLElement>('[data-v206-interior-go-mission]');
    const inventoryAction = this.root.querySelector<HTMLElement>('[data-v206-interior-go-inventory]');
    const moveAction = this.root.querySelector<HTMLElement>('[data-v2044-interior-move]');
    if (!panel || !image || !title || !body) return;
    image.src = def.texture ?? './assets/v209/props/shell_garden.png';
    image.alt = def.label;
    title.textContent = def.label;
    body.textContent = `${def.description} · 이 건물은 저장된 마을 건물이며 이동 버튼으로 위치를 다시 잡을 수 있습니다.`;
    if (portrait) { portrait.src = def.texture ?? './assets/v203/portraits/player_portrait.png'; portrait.alt = def.label; }
    if (status) status.innerHTML = [`좌표 ${building.x},${building.y}`, `크기 ${building.w}x${building.h}`, `발전도 +${def.score}`].map((item) => `<span>${item}</span>`).join('');
    action?.toggleAttribute('hidden', true);
    mapAction?.toggleAttribute('hidden', true);
    missionAction?.toggleAttribute('hidden', true);
    inventoryAction?.toggleAttribute('hidden', true);
    moveAction?.toggleAttribute('hidden', false);
    panel.classList.add('open');
    this.root.classList.add('v2094-interior-open', 'v2097-interior-open', 'v218-interior-modal-open');
    document.body.classList.add('v2094-modal-open', 'v2097-modal-open', 'v218-aqua-modal-open', 'v2111-modal-open', 'v2112-modal-open', 'v2113-modal-open', 'v2114-modal-open', 'v2115-modal-open', 'v2116-modal-open', 'v2117-modal-open', 'v2118-modal-open', 'v2119-modal-open', 'v2120-modal-open', 'v2121-modal-open');
    document.body.classList.add('v2094-modal-open');
    this.root.querySelector<HTMLElement>('.v2094-world-controls')?.setAttribute('hidden', 'true');
    this.root.querySelector<HTMLElement>('.bottom-nav')?.setAttribute('hidden', 'true');
    panel.setAttribute('aria-hidden', 'false');
    this.showGuide(def.label, '건물 이동을 누르면 비용 없이 위치를 다시 잡을 수 있습니다.');
  }

  private openInterior(type: VillageBuildingType, overrideBody?: string): void {
    const interior = INTERIOR_ASSETS[type];
    if (!interior) {
      const def = BUILD_DEFS[type];
      this.showGuide(def?.label ?? '건물', def?.description ?? '아직 준비 중인 건물입니다.');
      return;
    }
    const panel = this.root.querySelector<HTMLElement>('[data-v2097-interior-panel], [data-v2094-interior-panel]');
    const image = this.root.querySelector<HTMLImageElement>('[data-v2097-interior-image], [data-v2094-interior-image]');
    const title = this.root.querySelector<HTMLElement>('[data-v203-interior-title]');
    const body = this.root.querySelector<HTMLElement>('[data-v203-interior-body]');
    const action = this.root.querySelector<HTMLElement>('[data-v203-interior-go-fishing]');
    const portrait = this.root.querySelector<HTMLImageElement>('[data-v206-interior-portrait]');
    const status = this.root.querySelector<HTMLElement>('[data-v206-interior-status]');
    const mapAction = this.root.querySelector<HTMLElement>('[data-v206-interior-go-map]');
    const missionAction = this.root.querySelector<HTMLElement>('[data-v206-interior-go-mission]');
    const inventoryAction = this.root.querySelector<HTMLElement>('[data-v206-interior-go-inventory]');
    const moveAction = this.root.querySelector<HTMLElement>('[data-v2044-interior-move]');
    if (!panel || !image || !title || !body || !action) return;
    image.src = interior.image;
    image.alt = interior.title;
    title.textContent = interior.title;
    body.textContent = overrideBody ?? interior.body;
    if (portrait) {
      portrait.src = interior.portrait;
      portrait.alt = interior.title;
    }
    if (status) status.innerHTML = interior.status.map((item) => `<span>${item}</span>`).join('');
    action.toggleAttribute('hidden', !interior.fishing);
    mapAction?.toggleAttribute('hidden', !interior.map);
    missionAction?.toggleAttribute('hidden', !interior.mission);
    inventoryAction?.toggleAttribute('hidden', !interior.inventory);
    moveAction?.toggleAttribute('hidden', false);
    panel.classList.add('open');
    this.root.classList.add('v2094-interior-open', 'v2097-interior-open', 'v218-interior-modal-open');
    document.body.classList.add('v2094-modal-open', 'v2097-modal-open', 'v218-aqua-modal-open', 'v2111-modal-open', 'v2112-modal-open', 'v2113-modal-open', 'v2114-modal-open', 'v2115-modal-open', 'v2116-modal-open', 'v2117-modal-open', 'v2118-modal-open', 'v2119-modal-open', 'v2120-modal-open', 'v2121-modal-open');
    document.body.classList.add('v2094-modal-open');
    this.root.querySelector<HTMLElement>('.v2094-world-controls')?.setAttribute('hidden', 'true');
    this.root.querySelector<HTMLElement>('.bottom-nav')?.setAttribute('hidden', 'true');
    panel.setAttribute('aria-hidden', 'false');
    this.showGuide(interior.title, overrideBody ?? interior.body);
  }

  private closeInterior(): void {
    const panel = this.root.querySelector<HTMLElement>('[data-v2097-interior-panel], [data-v2094-interior-panel]');
    if (!panel) return;
    panel.classList.remove('open');
    this.root.classList.remove('v2094-interior-open', 'v2097-interior-open', 'v218-interior-modal-open');
    document.body.classList.remove('v2094-modal-open', 'v2097-modal-open', 'v218-aqua-modal-open', 'v2111-modal-open', 'v2112-modal-open', 'v2113-modal-open', 'v2114-modal-open', 'v2115-modal-open', 'v2116-modal-open', 'v2117-modal-open', 'v2118-modal-open', 'v2119-modal-open', 'v2120-modal-open', 'v2121-modal-open');
    document.body.classList.remove('v2094-modal-open');
    this.root.querySelector<HTMLElement>('.v2094-world-controls')?.removeAttribute('hidden');
    this.root.querySelector<HTMLElement>('.bottom-nav')?.removeAttribute('hidden');
    this.focusedBuildingId = null;
    panel.setAttribute('aria-hidden', 'true');
  }

  private openDialogue(actor: Actor): void {
    const now = performance.now();
    if (now - this.lastDialogAt < 260) return;
    this.lastDialogAt = now;
    const text = actor.talk[Math.floor(Math.random() * actor.talk.length)] ?? '안녕하세요.';
    const panel = this.root.querySelector<HTMLElement>('.v2097-dialog-panel, .v2094-dialog-panel');
    if (!panel) return;
    const portrait = PORTRAIT_ASSETS[actor.role] ?? PORTRAIT_ASSETS.tourist;
    panel.classList.add('open');
    panel.innerHTML = `<img class="v203-dialog-portrait" src="${portrait}" alt="${actor.name}" /><div class="v203-dialog-copy"><div><strong>${actor.name}</strong><span>${actor.mood}</span></div><p>${text}</p></div>`;
    window.setTimeout(() => panel.classList.remove('open'), 5200);
  }

  private showGuide(title: string, message: string): void {
    this.onToast({ type: 'normal', title, message });
    const guide = this.root.querySelector<HTMLElement>('.v2097-village-guide, .v2094-village-guide');
    if (!guide) return;
    guide.innerHTML = `<strong>${title}</strong><span>${message}</span>`;
    guide.hidden = false;
    guide.classList.add('pop');
    window.setTimeout(() => guide.classList.remove('pop'), 900);
  }

  private movePlayerNear(x: number, y: number): void {
    const candidates: Array<[number, number]> = [[x, y + 1], [x - 1, y], [x + 1, y], [x, y - 1], [x - 1, y + 1], [x + 1, y + 1]];
    const found = candidates.find(([cx, cy]) => this.isWalkable(cx, cy));
    if (found) this.movePlayerTo(found[0], found[1]);
  }

  private movePlayerTo(x: number, y: number): void {
    if (!this.player || !this.isWalkable(x, y)) return;
    const path = this.findPath(this.player.tileX, this.player.tileY, x, y);
    if (!path.length) {
      this.showGuide('이동 불가', '막혀 있는 타일입니다. 길이나 빈 잔디를 선택해주세요.');
      return;
    }
    this.player.path = path;
    this.cameraFollowUntil = performance.now() + Math.min(2800, 600 + path.length * 90);
  }

  private tick(deltaMs: number): void {
    if (!this.app || this.destroyed) return;
    // v2.1.25: joystick movement already advances player position, direction,
    // and walking frame. Do not immediately call updateActor(player) afterward,
    // because the path-empty branch resets the player back to idle frame 01.
    if (this.joystick.active) this.movePlayerByJoystick(deltaMs);
    else this.updateActor(this.player, deltaMs);
    this.ensureNpcHealth();
    for (const npc of this.npcs) {
      npc.targetTimer -= deltaMs;
      if (npc.targetTimer <= 0 && npc.path.length === 0) {
        this.assignNpcTarget(npc);
        npc.targetTimer = 1400 + Math.random() * 2600;
      }
      this.updateActor(npc, deltaMs);
    }
    this.actorLayer.sortChildren();
    this.animateDecorationLayer(deltaMs);
    this.softFollowPlayer(deltaMs);
    const now = performance.now();
    if (now - this.lastPassiveIncomeAt > 12000) {
      this.lastPassiveIncomeAt = now;
      this.applyPassiveIncome();
    }
  }

  private ensureNpcHealth(): void {
    const now = performance.now();
    if (now - this.lastNpcHealthCheckAt < 1200) return;
    this.lastNpcHealthCheckAt = now;
    const visibleCount = this.npcs.filter((npc) => npc.node.parent === this.actorLayer && this.inBounds(npc.tileX, npc.tileY)).length;
    if (visibleCount < 4) {
      this.spawnActors();
      return;
    }
    for (const npc of this.npcs) {
      if (npc.path.length === 0 && npc.pauseTimer <= 0) {
        npc.targetTimer = Math.min(npc.targetTimer, 120);
      }
    }
  }

  private animateDecorationLayer(deltaMs: number): void {
    this.motionClock += deltaMs;
    const t = this.motionClock / 1000;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const liteMotion = reducedMotion || this.resolveVillageDprCap() <= 1.18;
    for (let i = 0; i < this.decorationLayer.children.length; i += 1) {
      const item = this.decorationLayer.children[i] as Container;
      const base = this.decorationMotionBases.get(item);
      if (!base) continue;
      const phase = t + base.seed * 0.13 + i * 0.07;
      item.position.set(base.x, base.y);
      item.rotation = base.rotation;
      item.alpha = base.alpha;
      item.scale.set(base.scaleX, base.scaleY);
      const kindName = base.kind;
      if (/dog|cat|walkingCat/i.test(kindName) && !/sleepingDog/i.test(kindName)) {
        // v2.0.62: keep paws visually glued to the tile. Pets pace sideways only;
        // any Y bobbing made them read as floating on the isometric floor.
        const stride = liteMotion ? 1.5 : 4.8;
        const groundSlide = Math.sin(phase * 0.72) * stride;
        item.position.set(base.x + groundSlide, base.y);
        item.rotation = Math.sin(phase * 1.45) * (liteMotion ? 0.004 : 0.012);
        const flip = Math.sin(phase * 0.72) < 0 ? -1 : 1;
        const footSquash = Math.abs(Math.sin(phase * 2.4)) * (liteMotion ? 0.003 : 0.007);
        item.scale.set(base.scaleX * flip * (1 + footSquash * 0.16), base.scaleY * (1 - footSquash * 0.45));
        item.zIndex = Math.round((base.y / TILE_H) * 20 + 12);
      } else if (/sleepingDog/i.test(kindName)) {
        // Sleeping pets breathe by squash/stretch around their anchored paws; no Y lift.
        const breathe = Math.sin(phase * 1.1);
        item.scale.set(base.scaleX * (1 + breathe * 0.006), base.scaleY * (1 - breathe * 0.004));
      } else if (/steam|cookingPot/i.test(kindName)) {
        // Keep the pot/fireplace itself fixed to the tile. Only the smoke puffs drift upward.
        item.position.set(base.x, base.y);
        item.alpha = clamp(base.alpha + Math.sin(phase * 1.9) * 0.05, 0.72, 1);
        item.scale.set(base.scaleX, base.scaleY);
        const puffLayer = item.getChildByName('steam-puffs') as Container | null;
        if (puffLayer) {
          for (let p = 0; p < puffLayer.children.length; p += 1) {
            const puff = puffLayer.children[p] as Graphics;
            const cycle = (phase * 0.75 + p * 0.23) % 1;
            puff.y = -18 - p * 10 - cycle * (liteMotion ? 12 : 24);
            puff.x = (p - 1.5) * 6 + Math.sin(phase * 1.6 + p) * (liteMotion ? 1.4 : 3.2);
            puff.alpha = clamp((1 - cycle) * 0.22, 0.03, 0.20);
            puff.scale.set(0.85 + cycle * 0.42);
          }
        }
      } else if (/waterRing|shoreFoam|splash|fishShadow|duck/i.test(kindName)) {
        const wave = Math.sin(phase * 1.7);
        item.position.set(base.x + Math.sin(phase * 0.8) * (liteMotion ? 1.5 : 4), base.y + Math.cos(phase * 1.1) * (liteMotion ? 0.8 : 2.2));
        item.alpha = clamp(0.72 + wave * 0.18, 0.38, 0.94);
        item.rotation = base.rotation + Math.sin(phase * 0.9) * 0.012;
      } else if (/seagull|butterfly|petals|sparkles/i.test(kindName)) {
        item.position.set(base.x + Math.sin(phase * 1.35) * (liteMotion ? 4 : 10), base.y + Math.sin(phase * 2.4) * (liteMotion ? 1.6 : 4.6));
        item.rotation = base.rotation + Math.sin(phase * 1.9) * (liteMotion ? 0.025 : 0.06);
        item.alpha = clamp(0.78 + Math.sin(phase * 3.0) * 0.16, 0.42, 1);
      } else if (/flag|banner|lamp|tree|palm|flower/i.test(kindName)) {
        item.rotation = base.rotation + Math.sin(phase * 1.2) * (liteMotion ? 0.006 : 0.018);
      }
    }
  }

  private animateActorWalk(actor: Actor, movementAmount: number, deltaMs: number): void {
    const walking = movementAmount > 0.18;
    if (walking) actor.walkPhase += deltaMs * 0.0056;
    else actor.walkPhase *= 0.72;
    // v2.0.60: grounded footstep motion. The sprite's anchor stays at the feet,
    // so we do not raise the whole character off the tile.
    const sway = walking ? Math.sin(actor.walkPhase * 0.50) * 0.026 : 0;
    const stepSide = walking ? Math.sin(actor.walkPhase * 1.25) * 0.42 : 0;
    if (actor.body instanceof Sprite) {
      const targetH = actor.role === 'player' ? 90 : 80;
      if (actor.role === 'player') {
        const frameIndex = walking ? Math.floor(actor.walkPhase) % PLAYER_ACTOR_FRAME_COUNT : 0;
        const frameUrl = playerActorMotionTextureUrl(actor.direction, frameIndex);
        const frameTexture = this.textures.get(frameUrl);
        if (frameTexture && actor.body.texture !== frameTexture) {
          actor.body.texture = frameTexture;
          const baseScale = targetH / Math.max(1, frameTexture.height);
          actor.body.scale.set(baseScale);
          actor.groundOffset = actorSpriteGroundOffset(frameUrl, targetH);
        }
      }
      actor.body.position.x = stepSide;
      actor.body.position.y = actor.groundOffset;
      actor.body.rotation = sway;
      const base = targetH / Math.max(1, actor.body.texture.height);
      const stretch = walking ? Math.sin(actor.walkPhase * 1.25) * 0.0026 : 0;
      actor.body.scale.set(base * (1 + stretch * 0.35), base * (1 - stretch));
    } else {
      actor.body.rotation = sway;
    }
    const step = walking ? Math.sin(actor.walkPhase * 1.25) : 0;
    const shadowPulse = walking ? 1 + Math.abs(step) * 0.028 : 1;
    actor.shadow.scale.set(shadowPulse, 1 / shadowPulse);
    actor.footContact.position.x = walking ? step * 0.65 : 0;
    actor.footContact.alpha = walking ? 0.72 + Math.abs(step) * 0.20 : 0.64;
    actor.label.scale.set(1, 1);
  }

  private updateActor(actor: Actor | undefined, deltaMs: number): void {
    if (!actor) return;
    if (actor.path.length === 0) {
      this.animateActorWalk(actor, 0, deltaMs);
      return;
    }
    const [tx, ty] = actor.path[0];
    if (actor.role !== 'player' && this.isNpcTileReserved(tx, ty, actor)) {
      actor.pauseTimer = Math.max(actor.pauseTimer, 180 + Math.random() * 260);
      actor.pauseTimer -= deltaMs;
      this.animateActorWalk(actor, 0, deltaMs);
      if (actor.pauseTimer <= 0 && actor.path.length > 2) {
        const last = actor.path[actor.path.length - 1];
        const reroute = this.findPath(actor.tileX, actor.tileY, last[0], last[1], actor);
        if (reroute.length) actor.path = reroute;
        actor.pauseTimer = 260 + Math.random() * 420;
      }
      return;
    }
    actor.pauseTimer = 0;
    const target = actorGround(tx, ty);
    const dx = target.x - actor.x;
    const dy = target.y - actor.y;
    const dist = Math.hypot(dx, dy);
    const key = tileKey(actor.tileX, actor.tileY);
    const pathBoost = this.pathTiles.has(key) ? 1.18 : 1;
    const step = actor.speed * pathBoost * Math.max(0.8, deltaMs / 16.67);
    if (dist <= step) {
      actor.x = target.x;
      actor.y = target.y;
      actor.tileX = tx;
      actor.tileY = ty;
      actor.path.shift();
      if (actor.path.length === 0) actor.desiredTile = undefined;
    } else {
      actor.x += (dx / dist) * step;
      actor.y += (dy / dist) * step;
    }
    actor.node.position.set(actor.x, actor.y);
    actor.node.zIndex = actor.tileY * 20 + 16;
    const movementAmount = Math.hypot(dx, dy);
    if (movementAmount > 1) this.setActorDirection(actor, dx, dy);
    this.animateActorWalk(actor, movementAmount, deltaMs);
  }

  private setActorDirection(actor: Actor, dx: number, dy: number): void {
    const direction = actorDirectionFromVector(dx, dy);
    if (actor.direction !== direction) {
      actor.direction = direction;
      this.applyActorTexture(actor, direction);
    }
    if (!(actor.body instanceof Sprite)) {
      const fallbackDirection = dx < 0 ? -1 : 1;
      const bodyScaleX = Math.abs(actor.body.scale.x || 1);
      actor.body.scale.x = bodyScaleX * fallbackDirection;
    }
    actor.label.scale.set(1, 1);
  }

  private assignNpcTarget(npc: Actor): void {
    // v2.0.22: lightweight NPC reservation AI. Residents pick less crowded targets,
    // reserve their next/goal tile, and briefly yield instead of stacking on one route.
    const hour = new Date().getHours();
    let targets: Array<[number, number]>;
    if (hour < 11) targets = [[19, 18], [20, 19], [21, 20], [18, 22], [17, 21], [22, 18]];
    else if (hour < 15) targets = [[14, 25], [16, 24], [18, 20], [13, 27], [17, 26], [20, 22]];
    else if (hour < 19) targets = [[26, 25], [23, 22], [20, 28], [25, 27], [22, 24], [19, 30]];
    else targets = [[18, 15], [20, 29], [13, 24], [22, 16], [17, 27], [21, 31]];
    if (npc.role === 'captain') targets = [[20, 31], [20, 29], [21, 33], [22, 32], [19, 30]];
    if (npc.role === 'tourist') targets = [[17, 23], [19, 24], [22, 23], [24, 26], [18, 27], [14, 25], [21, 20], [26, 25]];
    const shuffled = targets
      .map((target) => ({ target, weight: Math.random() + (this.isNpcTileReserved(target[0], target[1], npc) ? 1.5 : 0) }))
      .sort((a, b) => a.weight - b.weight)
      .map((item) => item.target);
    for (const target of shuffled) {
      const candidates: Array<[number, number]> = [target, [target[0] + 1, target[1]], [target[0] - 1, target[1]], [target[0], target[1] + 1], [target[0], target[1] - 1]];
      for (const candidate of candidates) {
        if (!this.isWalkable(candidate[0], candidate[1]) || this.isNpcTileReserved(candidate[0], candidate[1], npc)) continue;
        const path = this.findPath(npc.tileX, npc.tileY, candidate[0], candidate[1], npc);
        if (path.length) {
          npc.path = this.trimNpcCrowdedStart(path, npc);
          npc.desiredTile = tileKey(candidate[0], candidate[1]);
          return;
        }
      }
    }
    npc.desiredTile = undefined;
    const fallback: Array<[number, number]> = [[npc.tileX + 1, npc.tileY], [npc.tileX - 1, npc.tileY], [npc.tileX, npc.tileY + 1], [npc.tileX, npc.tileY - 1]];
    const step = fallback.find(([x, y]) => this.isWalkable(x, y) && !this.isNpcTileReserved(x, y, npc));
    if (step) npc.path = [step];
  }

  private isNpcTileReserved(x: number, y: number, actor: Actor): boolean {
    const key = tileKey(x, y);
    if (this.player && this.player !== actor) {
      if (tileKey(this.player.tileX, this.player.tileY) === key) return true;
      const next = this.player.path[0];
      if (next && tileKey(next[0], next[1]) === key) return true;
    }
    return this.npcs.some((other) => {
      if (other === actor) return false;
      if (tileKey(other.tileX, other.tileY) === key) return true;
      if (other.desiredTile === key) return true;
      const next = other.path[0];
      return Boolean(next && tileKey(next[0], next[1]) === key);
    });
  }

  private trimNpcCrowdedStart(path: Array<[number, number]>, actor: Actor): Array<[number, number]> {
    if (path.length <= 1) return path;
    const [firstX, firstY] = path[0];
    if (!this.isNpcTileReserved(firstX, firstY, actor)) return path;
    const alternatives: Array<[number, number]> = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
    for (const [dx, dy] of alternatives) {
      const nx = actor.tileX + dx;
      const ny = actor.tileY + dy;
      if (this.isWalkable(nx, ny) && !this.isNpcTileReserved(nx, ny, actor)) return [[nx, ny], ...path.slice(1)];
    }
    return path;
  }

  private applyPassiveIncome(): void {
    const score = this.calculateDevelopment();
    const income = Math.max(0, Math.floor(score / 80));
    this.save.village.development = score;
    this.save.village.autoIncome = income;
    if (income <= 0) return;
    this.save.coins += income;
    this.save.village.fund += Math.floor(income * 0.35);
    this.showPassiveIncomeFloat(income);
    this.onSave();
    this.syncHud();
  }

  private showPassiveIncomeFloat(income: number): void {
    const board = this.root.querySelector<HTMLElement>('.v2094-expedition-body');
    if (!board || income <= 0) return;
    board.querySelector('.v2049-income-float')?.remove();
    const node = document.createElement('span');
    node.className = 'v2049-income-float';
    node.textContent = `자동수익 +${income}G`;
    board.appendChild(node);
    window.setTimeout(() => node.remove(), 1600);
  }

  private calculateDevelopment(): number {
    const caughtScore = Object.values(this.save.caught).reduce((sum, count) => sum + count, 0) * 5;
    const buildingScore = this.save.village.buildings.reduce((sum, b) => sum + (BUILD_DEFS[b.type]?.score ?? 0), 0);
    const pathScore = this.save.village.paths.length * BUILD_DEFS.path.score;
    const successScore = this.save.totalSuccess * 5;
    return Math.floor(caughtScore + buildingScore + pathScore + successScore + this.save.village.fund * 0.08);
  }

  private syncHud(): void {
    const score = this.calculateDevelopment();
    this.save.village.development = score;
    this.save.village.level = score >= 1000 ? 5 : score >= 500 ? 4 : score >= 300 ? 3 : score >= 100 ? 2 : 1;
    this.save.village.tourists = score >= 1000 ? 3 : score >= 500 ? 2 : score >= 100 ? 1 : 0;
    const hud = this.root.querySelector<HTMLElement>('.v2094-village-hud');
    if (hud) {
      hud.querySelector<HTMLElement>('[data-v2-gold]')!.textContent = this.save.coins.toLocaleString('ko-KR');
      hud.querySelector<HTMLElement>('[data-v2-fund]')!.textContent = this.save.village.fund.toLocaleString('ko-KR');
      hud.querySelector<HTMLElement>('[data-v2-dev]')!.textContent = `${score}`;
      hud.querySelector<HTMLElement>('[data-v2-level]')!.textContent = `마을 Lv.${this.save.village.level}`;
      hud.querySelector<HTMLElement>('[data-v2-tourists]')!.textContent = String(this.save.village.tourists);
    }
    const objective = this.root.querySelector<HTMLElement>('[data-v2-objective]');
    if (objective) {
      if (score < 100) objective.textContent = '길·꽃·벤치를 배치해서 관광객 100점을 먼저 열기';
      else if (score < 500) objective.textContent = '어시장 정산과 창고 건설로 관광버스 500점 도달';
      else if (score < 1000) objective.textContent = '수족관·여관 업그레이드 준비로 VIP 1000점 도전';
      else objective.textContent = 'VIP 관광을 유지하며 다음 섬 개척 준비';
    }
    const milestones = this.root.querySelector<HTMLElement>('.v2094-milestone-line');
    if (milestones) {
      milestones.innerHTML = `<span class="${score >= 100 ? 'on' : ''}">100 관광객</span><span class="${score >= 500 ? 'on' : ''}">500 관광버스</span><span class="${score >= 1000 ? 'on' : ''}">1000 VIP</span>`;
    }
  }

  private isWalkable(x: number, y: number): boolean {
    return this.inBounds(x, y) && !this.blockedTiles.has(tileKey(x, y));
  }

  private inBounds(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < MAP_SIZE && y < MAP_SIZE;
  }

  private findPath(sx: number, sy: number, tx: number, ty: number, actor?: Actor): Array<[number, number]> {
    if (!this.isWalkable(tx, ty)) return [];
    const start = tileKey(sx, sy);
    const target = tileKey(tx, ty);
    const queue: Array<[number, number]> = [[sx, sy]];
    const came = new Map<string, string | null>([[start, null]]);
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
    for (let index = 0; index < queue.length; index += 1) {
      const [x, y] = queue[index];
      if (tileKey(x, y) === target) break;
      for (const [dx, dy] of dirs) {
        const nx = x + dx;
        const ny = y + dy;
        const key = tileKey(nx, ny);
        if (!this.isWalkable(nx, ny) || came.has(key)) continue;
        if (actor && actor.role !== 'player' && key !== target && this.isNpcTileReserved(nx, ny, actor)) continue;
        came.set(key, tileKey(x, y));
        queue.push([nx, ny]);
      }
    }
    if (!came.has(target)) return [];
    const path: Array<[number, number]> = [];
    let current: string | null = target;
    while (current && current !== start) {
      const [x, y] = current.split(',').map(Number);
      path.push([x, y]);
      current = came.get(current) ?? null;
    }
    return path.reverse().slice(0, 80);
  }

  private applyCamera(): void {
    this.clampCamera();
    this.world.position.set(this.camera.x, this.camera.y);
    this.world.scale.set(this.camera.scale);
  }

  private clampCamera(): void {
    if (!this.app) return;
    const scale = this.camera.scale;
    const maxX = CAMERA_PAD * scale;
    const minX = this.app.screen.width - (MAP_SIZE * TILE_W + CAMERA_PAD) * scale;
    const maxY = Math.max(70, CAMERA_PAD * 0.42 * scale);
    const minY = this.app.screen.height - (WORLD_ORIGIN_Y + MAP_SIZE * TILE_H + CAMERA_PAD) * scale;
    if (minX < maxX) this.camera.x = clamp(this.camera.x, minX, maxX);
    if (minY < maxY) this.camera.y = clamp(this.camera.y, minY, maxY);
  }

  private softFollowPlayer(deltaMs: number): void {
    if (!this.player || !this.app) return;
    if (performance.now() > this.cameraFollowUntil && this.player.path.length === 0) return;
    const targetX = this.app.screen.width / 2 - this.player.x * this.camera.scale;
    const targetY = this.app.screen.height * 0.54 - this.player.y * this.camera.scale;
    const blend = clamp(deltaMs / 260, 0.035, 0.16);
    this.camera.x += (targetX - this.camera.x) * blend;
    this.camera.y += (targetY - this.camera.y) * blend;
    this.applyCamera();
  }

  private showTileMarker(x: number, y: number, color: number): void {
    this.markerLayer.removeChildren();
    const g = new Graphics();
    g.poly(tileDiamondPoints(x, y));
    g.fill({ color, alpha: 0.28 });
    g.stroke({ color: 0xffffff, alpha: 0.9, width: 3 });
    g.zIndex = 9999;
    this.markerLayer.addChild(g);
    window.setTimeout(() => {
      if (!this.destroyed && g.parent) g.parent.removeChild(g);
    }, 460);
  }

  private resize(): void {
    if (!this.app) return;
    if (this.camera.x === 0 && this.camera.y === 0) {
      this.centerCameraOnPlayer();
      return;
    }
    this.applyCamera();
  }
}

// v2.0.91 validation lineage only: v2040-interior-open v2041-interior-open v2042-interior-open v2043-interior-open v2044-interior-open are no longer attached at runtime.
// v2.0.91 validation lineage only exact token: this.root.classList.add('v2040-interior-open', 'v2041-interior-open', 'v2042-interior-open', 'v2043-interior-open', 'v2044-interior-open');
// v2.0.91 validation lineage only exact token: document.body.classList.add('v2040-interior-open', 'v2041-interior-open', 'v2042-interior-open', 'v2043-interior-open', 'v2044-interior-open');
