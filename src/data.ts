import type { FishInfo, RegionInfo, SaveData } from './types';

export const APP_VERSION = '2.1.67';
export const CACHE_NAME = 'aqua-fantasia-v2.1.67-premium-mobile-ui-fishing-polish';

export const regions: RegionInfo[] = [
  { key: 'lake', name: '잔잔한 해변', subtitle: '첫 출항 추천 · 부드러운 파도', bg: './assets/v101/water/water_clear_calm.webp', difficulty: 1.00, waterSpeed: 0.65, color: '#54dfff', tide: '잔물결', unlockHint: '기본 해금' },
  { key: 'river', name: '산호숲 바다', subtitle: '수류가 빠른 중급 수역', bg: './assets/v101/water/water_coral_reef.webp', difficulty: 1.14, waterSpeed: 0.92, color: '#5cf4d9', tide: '빠른 수류', unlockHint: '기본 해금' },
  { key: 'harbor', name: '노을 항구', subtitle: '노을 반사광 속 희귀어', bg: './assets/v101/water/water_sunlit.webp', difficulty: 1.23, waterSpeed: 0.75, color: '#ffb45d', tide: '노을 반사', unlockHint: '기본 해금' },
  { key: 'deep', name: '깊은 바다', subtitle: '장력 변화가 큰 심해', bg: './assets/v101/water/water_deep_light.webp', difficulty: 1.38, waterSpeed: 0.58, color: '#4a79ff', tide: '심해 압력', unlockHint: '성공 2회' },
  { key: 'palace', name: '용궁 정원', subtitle: '빛나는 유적과 고급 어종', bg: './assets/v101/water/water_lily_dream.webp', difficulty: 1.50, waterSpeed: 0.84, color: '#89f3ff', tide: '궁전 광류', unlockHint: '도감 5마리' },
  { key: 'dimension', name: '차원의 바다', subtitle: '보스 입질 확률 상승', bg: './assets/v101/water/water_dark_mystic.webp', difficulty: 1.68, waterSpeed: 1.05, color: '#b487ff', tide: '차원 파동', unlockHint: '콤보 4회 또는 도감 10마리' },
  { key: 'glacier', name: '얼음 낚시터', subtitle: '차가운 수면과 미끄러운 장력', bg: './assets/v101/water/water_quiet_path.webp', difficulty: 1.42, waterSpeed: 0.46, color: '#b9f2ff', tide: '빙판 장력', unlockHint: '성공 8회' },
  { key: 'storm', name: '폭풍 외해', subtitle: '강한 파도와 높은 보상', bg: './assets/v101/water/water_abyss_canyon.webp', difficulty: 1.78, waterSpeed: 1.18, color: '#6f8cff', tide: '폭풍 파도', unlockHint: '성공 12회' },
  { key: 'mangrove', name: '맹그로브 미궁', subtitle: '뿌리 사이로 숨은 희귀어', bg: './assets/v101/water/water_kelp_forest.webp', difficulty: 1.55, waterSpeed: 0.72, color: '#5cffbd', tide: '뿌리 소용돌이', unlockHint: '도감 14마리' },
  { key: 'lunar', name: '달빛 산호해', subtitle: '밤바다 광원과 보스 그림자', bg: './assets/v101/water/water_deep_mystic.webp', difficulty: 1.92, waterSpeed: 0.88, color: '#c7a6ff', tide: '달빛 너울', unlockHint: '최고 콤보 6회' },
  { key: 'reefFestival', name: '산호 축제섬', subtitle: '보너스 보상이 큰 이벤트 수역', bg: './assets/v101/water/water_coral_reef.webp', difficulty: 1.28, waterSpeed: 1.02, color: '#61ffe2', tide: '축제 파문', unlockHint: '미션 2개 완료' },
];

export const fishDex: FishInfo[] = [
  { id: 'bubble', name: '바늘꼬리', regionKey: 'lake', region: '잔잔한 해변', img: './assets/v2110/fish/common_tropical/fish_common_001.png', rarity: 'COMMON', reward: 55, weight: 42 },
  { id: 'lake', name: '투명메기', regionKey: 'lake', region: '잔잔한 해변', img: './assets/v2110/fish/common_tropical/fish_common_002.png', rarity: 'COMMON', reward: 62, weight: 34 },
  { id: 'pearl', name: '화산쏨뱅이', regionKey: 'lake', region: '잔잔한 해변', img: './assets/v2110/fish/common_tropical/fish_common_003.png', rarity: 'RARE', reward: 98, weight: 16 },
  { id: 'clown', name: '하늘가오리', regionKey: 'lake', region: '잔잔한 해변', img: './assets/v2110/fish/common_tropical/fish_common_004.png', rarity: 'EPIC', reward: 135, weight: 8 },
  { id: 'river', name: '방울잉어', regionKey: 'river', region: '산호숲 바다', img: './assets/v2110/fish/common_tropical/fish_common_005.png', rarity: 'COMMON', reward: 70, weight: 38 },
  { id: 'coral', name: '작은 금붕어', regionKey: 'river', region: '산호숲 바다', img: './assets/v2110/fish/common_tropical/fish_common_006.png', rarity: 'RARE', reward: 115, weight: 22 },
  { id: 'leaf', name: '은비늘송어', regionKey: 'river', region: '산호숲 바다', img: './assets/v2110/fish/common_tropical/fish_common_007.png', rarity: 'RARE', reward: 122, weight: 16 },
  { id: 'harbor', name: '점박이잉어', regionKey: 'harbor', region: '노을 항구', img: './assets/v2110/fish/common_tropical/fish_common_008.png', rarity: 'RARE', reward: 128, weight: 30 },
  { id: 'moon', name: '줄무늬망둥어', regionKey: 'harbor', region: '노을 항구', img: './assets/v2110/fish/common_tropical/fish_common_009.png', rarity: 'EPIC', reward: 185, weight: 12 },
  { id: 'lantern', name: '비단잉어', regionKey: 'harbor', region: '노을 항구', img: './assets/v2110/fish/common_tropical/fish_common_010.png', rarity: 'RARE', reward: 145, weight: 18 },
  { id: 'deep', name: '녹색메기', regionKey: 'deep', region: '깊은 바다', img: './assets/v2110/fish/common_tropical/fish_common_011.png', rarity: 'RARE', reward: 150, weight: 28 },
  { id: 'abyss', name: '보라쏨뱅이', regionKey: 'deep', region: '깊은 바다', img: './assets/v2110/fish/common_tropical/fish_common_012.png', rarity: 'EPIC', reward: 230, weight: 13 },
  { id: 'shadow', name: '달빛줄무늬', regionKey: 'deep', region: '깊은 바다', img: './assets/v2110/fish/common_tropical/fish_common_013.png', rarity: 'EPIC', reward: 245, weight: 9 },
  { id: 'palace', name: '무지개해마', regionKey: 'palace', region: '용궁 정원', img: './assets/v2110/fish/common_tropical/fish_common_014.png', rarity: 'EPIC', reward: 260, weight: 18 },
  { id: 'sun', name: '심연불사조', regionKey: 'palace', region: '용궁 정원', img: './assets/v2110/fish/common_tropical/fish_common_015.png', rarity: 'EPIC', reward: 280, weight: 14 },
  { id: 'lotus', name: '황금피쉬', regionKey: 'palace', region: '용궁 정원', img: './assets/v2110/fish/common_tropical/fish_common_016.png', rarity: 'RARE', reward: 172, weight: 20 },
  { id: 'dimension', name: '불꽃쏨뱅이', regionKey: 'dimension', region: '차원의 바다', img: './assets/v2110/fish/rare_deepsea/fish_rare_001.png', rarity: 'BOSS', reward: 420, weight: 8 },
  { id: 'king', name: '푸른보석고기', regionKey: 'dimension', region: '차원의 바다', img: './assets/v2110/fish/rare_deepsea/fish_rare_002.png', rarity: 'BOSS', reward: 520, weight: 5 },
  { id: 'nova', name: '청룡피쉬', regionKey: 'dimension', region: '차원의 바다', img: './assets/v2110/fish/rare_deepsea/fish_rare_003.png', rarity: 'EPIC', reward: 310, weight: 13 },
  { id: 'crystal', name: '수정장어', regionKey: 'glacier', region: '얼음 낚시터', img: './assets/v2110/fish/rare_deepsea/fish_rare_004.png', rarity: 'RARE', reward: 168, weight: 28 },
  { id: 'aurora', name: '고대수호신', regionKey: 'glacier', region: '얼음 낚시터', img: './assets/v2110/fish/rare_deepsea/fish_rare_005.png', rarity: 'EPIC', reward: 285, weight: 13 },
  { id: 'storm', name: '별빛해파리', regionKey: 'storm', region: '폭풍 외해', img: './assets/v2110/fish/rare_deepsea/fish_rare_006.png', rarity: 'EPIC', reward: 320, weight: 18 },
  { id: 'thunder', name: '심해아귀', regionKey: 'storm', region: '폭풍 외해', img: './assets/v2110/fish/rare_deepsea/fish_rare_007.png', rarity: 'BOSS', reward: 560, weight: 6 },

  { id: 'mangrove', name: '환상인어', regionKey: 'mangrove', region: '맹그로브 미궁', img: './assets/v2110/fish/rare_deepsea/fish_rare_008.png', rarity: 'RARE', reward: 235, weight: 22 },
  { id: 'firefly', name: '투명메기', regionKey: 'mangrove', region: '맹그로브 미궁', img: './assets/v2110/fish/rare_deepsea/fish_rare_009.png', rarity: 'EPIC', reward: 340, weight: 12 },
  { id: 'turtleGuardian', name: '화산쏨뱅이', regionKey: 'mangrove', region: '맹그로브 미궁', img: './assets/v2110/fish/rare_deepsea/fish_rare_010.png', rarity: 'BOSS', reward: 610, weight: 5 },
  { id: 'lunar', name: '하늘가오리', regionKey: 'lunar', region: '달빛 산호해', img: './assets/v2110/fish/rare_deepsea/fish_rare_011.png', rarity: 'EPIC', reward: 370, weight: 16 },
  { id: 'manta', name: '유령복어', regionKey: 'lunar', region: '달빛 산호해', img: './assets/v2110/fish/rare_deepsea/fish_rare_012.png', rarity: 'EPIC', reward: 390, weight: 11 },
  { id: 'orcaBoss', name: '우뢰메기', regionKey: 'lunar', region: '달빛 산호해', img: './assets/v2110/fish/rare_deepsea/fish_rare_013.png', rarity: 'BOSS', reward: 760, weight: 4 },
  { id: 'reefStar', name: '보라상어', regionKey: 'reefFestival', region: '산호 축제섬', img: './assets/v2110/fish/rare_deepsea/fish_rare_014.png', rarity: 'RARE', reward: 190, weight: 25 },
  { id: 'prism', name: '금빛바늘', regionKey: 'reefFestival', region: '산호 축제섬', img: './assets/v2110/fish/rare_deepsea/fish_rare_015.png', rarity: 'EPIC', reward: 315, weight: 13 },
  { id: 'candyfin', name: '루비쏨뱅이', regionKey: 'reefFestival', region: '산호 축제섬', img: './assets/v2110/fish/rare_deepsea/fish_rare_016.png', rarity: 'RARE', reward: 225, weight: 18 },
  { id: 'bluesprite', name: '푸른가오리', regionKey: 'lake', region: '잔잔한 해변', img: './assets/v2110/fish/rare_deepsea/fish_rare_013.png', rarity: 'RARE', reward: 150, weight: 20 },
  { id: 'royal', name: '분홍비단잉어', regionKey: 'palace', region: '용궁 정원', img: './assets/v2110/fish/rare_deepsea/fish_rare_010.png', rarity: 'BOSS', reward: 690, weight: 4 },
  { id: 'melon', name: '금빛금붕어', regionKey: 'mangrove', region: '맹그로브 미궁', img: './assets/v2110/fish/common_tropical/fish_common_010.png', rarity: 'EPIC', reward: 330, weight: 12 },
  { id: 'unknown', name: '미발견', regionKey: 'lake', region: '???', img: './assets/v92/fish/fish_unknown.png', rarity: 'COMMON', reward: 0, weight: 0 },
];

const RANDOM_PLAYER_NAMES = ['루미', '마린', '코랄', '피오', '나루', '아린', '블루', '미르', '세라', '라군', '하린', '유나'];

function randomPlayerName(): string {
  return RANDOM_PLAYER_NAMES[Math.floor(Math.random() * RANDOM_PLAYER_NAMES.length)] ?? '루미';
}

export const navItems: Array<{ screen: Exclude<SaveData['screen'], 'login'>; icon: string; label: string }> = [
  { screen: 'inventory', icon: './assets/v22/icons/nav_bag.png', label: '가방' },
  { screen: 'mission', icon: './assets/v22/icons/nav_quest.png', label: '퀘스트' },
  { screen: 'map', icon: './assets/v22/icons/nav_map.png', label: '지도' },
  { screen: 'village', icon: './assets/v22/icons/nav_village.png', label: '마을' },
];

export function defaultSave(): SaveData {
  return {
    version: APP_VERSION,
    screen: 'login',
    playerName: randomPlayerName(),
    region: 'lake',
    coins: 500,
    caught: {},
    missions: {},
    serverLinked: false,
    gear: { rodLevel: 1, reelLevel: 1, lureStock: 8, lineLevel: 1 },
    bestStreak: 0,
    currentStreak: 0,
    totalCasts: 0,
    totalSuccess: 0,
    totalFail: 0,
    unlockedRegions: ['lake', 'river', 'harbor'],
    mastery: {},
    lastRescueAt: 0,
    multiplayer: {
      schemaVersion: 1,
      clientId: `local-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`,
      lastSyncAt: 0,
      pendingEvents: [],
    },
    village: {
      level: 1,
      fund: 0,
      development: 0,
      unlockedSize: 40,
      buildings: [
        { id: 'b_fountain_0', type: 'fountain', x: 19, y: 19, w: 2, h: 2, builtAt: 0 },
        { id: 'b_market_0', type: 'market', x: 14, y: 22, w: 3, h: 3, builtAt: 0 },
        { id: 'b_guild_0', type: 'guild', x: 25, y: 22, w: 3, h: 3, builtAt: 0 },
        { id: 'b_inn_0', type: 'inn', x: 19, y: 12, w: 3, h: 3, builtAt: 0 },
        { id: 'b_harbor_0', type: 'harbor', x: 19, y: 31, w: 3, h: 3, builtAt: 0 },
      ],
      paths: [],
      tourists: 0,
      autoIncome: 0,
    },
  };
}
