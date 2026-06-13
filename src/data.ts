import type { RegionInfo, SaveData } from './types';

export const APP_VERSION = '6.3.0';
export const CACHE_NAME = 'aqua-fantasia-v6.3.0-immersive-asset-runtime';

export const regions: RegionInfo[] = [
  { key: 'lake', name: '잔잔한 해변', subtitle: '초보 추천 · 안전한 첫 출항', bg: './assets/art/bg_lake.webp', difficulty: 1.0 },
  { key: 'river', name: '산호숲 바다', subtitle: '수류가 빠른 중급 수역', bg: './assets/art/bg_river.webp', difficulty: 1.15 },
  { key: 'harbor', name: '노을 항구', subtitle: '노을 반사광 속 희귀어', bg: './assets/art/bg_harbor.webp', difficulty: 1.22 },
  { key: 'deep', name: '깊은 바다', subtitle: '장력 변화가 큰 심해', bg: './assets/art/bg_deep.webp', difficulty: 1.36 },
  { key: 'palace', name: '용궁 정원', subtitle: '고급 장비 권장 수역', bg: './assets/art/bg_palace.webp', difficulty: 1.48 },
  { key: 'dimension', name: '차원의 바다', subtitle: '보스 입질 확률 상승', bg: './assets/art/bg_dimension.webp', difficulty: 1.62 },
];

export const fishDex = [
  { id: 'lake', name: '방울광대', region: '잔잔한 해변', img: './assets/dex/fish_lake_25d.png', rarity: 'COMMON' },
  { id: 'river', name: '산호줄무늬', region: '산호숲 바다', img: './assets/dex/fish_river_25d.png', rarity: 'COMMON' },
  { id: 'harbor', name: '노을꼬리', region: '노을 항구', img: './assets/dex/fish_harbor_25d.png', rarity: 'RARE' },
  { id: 'deep', name: '심해등불', region: '깊은 바다', img: './assets/dex/fish_deep_25d.png', rarity: 'RARE' },
  { id: 'palace', name: '용궁비늘', region: '용궁 정원', img: './assets/dex/fish_palace_25d.png', rarity: 'EPIC' },
  { id: 'dimension', name: '차원광어', region: '차원의 바다', img: './assets/dex/fish_dimension_25d.png', rarity: 'BOSS' },
  { id: 'abyss', name: '푸른심연', region: '깊은 바다', img: './assets/dex/fish_abyss_25d.png', rarity: 'RARE' },
  { id: 'bubble', name: '방울꼬리', region: '잔잔한 해변', img: './assets/dex/fish_bubble_25d.png', rarity: 'COMMON' },
  { id: 'coral', name: '산호날개', region: '산호숲 바다', img: './assets/dex/fish_coral_25d.png', rarity: 'RARE' },
  { id: 'moon', name: '달빛비늘', region: '노을 항구', img: './assets/dex/fish_moon_25d.png', rarity: 'EPIC' },
  { id: 'sun', name: '태양광대', region: '용궁 정원', img: './assets/dex/fish_sun_25d.png', rarity: 'EPIC' },
  { id: 'king', name: '왕관돔', region: '차원의 바다', img: './assets/dex/fish_king_25d.png', rarity: 'BOSS' },
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
    coins: 300,
    caught: {},
    missions: {},
    serverLinked: false,
    gear: { rodLevel: 1, reelLevel: 1, lureStock: 5 },
    bestStreak: 0,
  };
}
