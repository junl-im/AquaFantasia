import type { FishInfo, RegionInfo, SaveData } from './types';

export const APP_VERSION = '6.4.0';
export const CACHE_NAME = 'aqua-fantasia-v6.4.0-massive-2-5d-system-polish';

export const regions: RegionInfo[] = [
  { key: 'lake', name: '잔잔한 해변', subtitle: '첫 출항 추천 · 부드러운 파도', bg: './assets/art/bg_lake.webp', difficulty: 1.00, waterSpeed: 0.65, color: '#54dfff' },
  { key: 'river', name: '산호숲 바다', subtitle: '수류가 빠른 중급 수역', bg: './assets/art/bg_river.webp', difficulty: 1.14, waterSpeed: 0.92, color: '#5cf4d9' },
  { key: 'harbor', name: '노을 항구', subtitle: '노을 반사광 속 희귀어', bg: './assets/art/bg_harbor.webp', difficulty: 1.23, waterSpeed: 0.75, color: '#ffb45d' },
  { key: 'deep', name: '깊은 바다', subtitle: '장력 변화가 큰 심해', bg: './assets/art/bg_deep.webp', difficulty: 1.38, waterSpeed: 0.58, color: '#4a79ff' },
  { key: 'palace', name: '용궁 정원', subtitle: '빛나는 유적과 고급 어종', bg: './assets/art/bg_palace.webp', difficulty: 1.50, waterSpeed: 0.84, color: '#89f3ff' },
  { key: 'dimension', name: '차원의 바다', subtitle: '보스 입질 확률 상승', bg: './assets/art/bg_dimension.webp', difficulty: 1.68, waterSpeed: 1.05, color: '#b487ff' },
  { key: 'glacier', name: '얼음 낚시터', subtitle: '차가운 수면과 미끄러운 장력', bg: './assets/art/bg_glacier.webp', difficulty: 1.42, waterSpeed: 0.46, color: '#b9f2ff' },
  { key: 'storm', name: '폭풍 외해', subtitle: '강한 파도와 높은 보상', bg: './assets/art/bg_storm.webp', difficulty: 1.78, waterSpeed: 1.18, color: '#6f8cff' },
];

export const fishDex: FishInfo[] = [
  { id: 'bubble', name: '방울꼬리', regionKey: 'lake', region: '잔잔한 해변', img: './assets/dex/fish_bubble_25d.png', rarity: 'COMMON', reward: 55, weight: 42 },
  { id: 'lake', name: '방울광대', regionKey: 'lake', region: '잔잔한 해변', img: './assets/dex/fish_lake_25d.png', rarity: 'COMMON', reward: 62, weight: 34 },
  { id: 'pearl', name: '진주몽글', regionKey: 'lake', region: '잔잔한 해변', img: './assets/dex/fish_pearl_25d.png', rarity: 'RARE', reward: 98, weight: 16 },
  { id: 'clown', name: '해맑은 광대', regionKey: 'lake', region: '잔잔한 해변', img: './assets/dex/fish_clown_card_25d.png', rarity: 'EPIC', reward: 135, weight: 8 },
  { id: 'river', name: '산호줄무늬', regionKey: 'river', region: '산호숲 바다', img: './assets/dex/fish_river_25d.png', rarity: 'COMMON', reward: 70, weight: 38 },
  { id: 'coral', name: '산호날개', regionKey: 'river', region: '산호숲 바다', img: './assets/dex/fish_coral_25d.png', rarity: 'RARE', reward: 115, weight: 22 },
  { id: 'leaf', name: '해초비늘', regionKey: 'river', region: '산호숲 바다', img: './assets/dex/fish_leaf_25d.png', rarity: 'RARE', reward: 122, weight: 16 },
  { id: 'harbor', name: '노을꼬리', regionKey: 'harbor', region: '노을 항구', img: './assets/dex/fish_harbor_25d.png', rarity: 'RARE', reward: 128, weight: 30 },
  { id: 'moon', name: '달빛비늘', regionKey: 'harbor', region: '노을 항구', img: './assets/dex/fish_moon_25d.png', rarity: 'EPIC', reward: 185, weight: 12 },
  { id: 'lantern', name: '항구등불', regionKey: 'harbor', region: '노을 항구', img: './assets/dex/fish_lantern_25d.png', rarity: 'RARE', reward: 145, weight: 18 },
  { id: 'deep', name: '심해등불', regionKey: 'deep', region: '깊은 바다', img: './assets/dex/fish_deep_25d.png', rarity: 'RARE', reward: 150, weight: 28 },
  { id: 'abyss', name: '푸른심연', regionKey: 'deep', region: '깊은 바다', img: './assets/dex/fish_abyss_25d.png', rarity: 'EPIC', reward: 230, weight: 13 },
  { id: 'shadow', name: '그림자돔', regionKey: 'deep', region: '깊은 바다', img: './assets/dex/fish_shadow_25d.png', rarity: 'EPIC', reward: 245, weight: 9 },
  { id: 'palace', name: '용궁비늘', regionKey: 'palace', region: '용궁 정원', img: './assets/dex/fish_palace_25d.png', rarity: 'EPIC', reward: 260, weight: 18 },
  { id: 'sun', name: '태양광대', regionKey: 'palace', region: '용궁 정원', img: './assets/dex/fish_sun_25d.png', rarity: 'EPIC', reward: 280, weight: 14 },
  { id: 'lotus', name: '연꽃비늘', regionKey: 'palace', region: '용궁 정원', img: './assets/dex/fish_lotus_25d.png', rarity: 'RARE', reward: 172, weight: 20 },
  { id: 'dimension', name: '차원광어', regionKey: 'dimension', region: '차원의 바다', img: './assets/dex/fish_dimension_25d.png', rarity: 'BOSS', reward: 420, weight: 8 },
  { id: 'king', name: '왕관돔', regionKey: 'dimension', region: '차원의 바다', img: './assets/dex/fish_king_25d.png', rarity: 'BOSS', reward: 520, weight: 5 },
  { id: 'nova', name: '노바베타', regionKey: 'dimension', region: '차원의 바다', img: './assets/dex/fish_nova_25d.png', rarity: 'EPIC', reward: 310, weight: 13 },
  { id: 'crystal', name: '수정빙어', regionKey: 'glacier', region: '얼음 낚시터', img: './assets/dex/fish_crystal_25d.png', rarity: 'RARE', reward: 168, weight: 28 },
  { id: 'aurora', name: '오로라핀', regionKey: 'glacier', region: '얼음 낚시터', img: './assets/dex/fish_aurora_25d.png', rarity: 'EPIC', reward: 285, weight: 13 },
  { id: 'storm', name: '폭풍참치', regionKey: 'storm', region: '폭풍 외해', img: './assets/dex/fish_storm_25d.png', rarity: 'EPIC', reward: 320, weight: 18 },
  { id: 'thunder', name: '번개돔', regionKey: 'storm', region: '폭풍 외해', img: './assets/dex/fish_thunder_25d.png', rarity: 'BOSS', reward: 560, weight: 6 },
  { id: 'unknown', name: '미발견', regionKey: 'lake', region: '???', img: './assets/dex/fish_unknown_25d.png', rarity: 'COMMON', reward: 0, weight: 0 },
];

export const navItems: Array<{ screen: SaveData['screen']; icon: string; label: string }> = [
  { screen: 'village', icon: './assets/ui/nav_village_25d.png', label: '마을' },
  { screen: 'fishing', icon: './assets/ui/nav_fishing_25d.png', label: '낚시' },
  { screen: 'gear', icon: './assets/ui/nav_gear_25d.png', label: '장비' },
  { screen: 'dex', icon: './assets/ui/nav_dex_25d.png', label: '도감' },
  { screen: 'shop', icon: './assets/ui/nav_shop_25d.png', label: '상점' },
  { screen: 'mission', icon: './assets/ui/nav_mission_25d.png', label: '미션' },
];

export function defaultSave(): SaveData {
  return {
    version: APP_VERSION,
    screen: 'login',
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
  };
}
