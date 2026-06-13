import type { RegionInfo, SaveData } from './types';

export const APP_VERSION = '6.2.0';
export const CACHE_NAME = 'aqua-fantasia-v6.2.0-asset-runtime';

export const regions: RegionInfo[] = [
  { key: 'lake', name: '잔잔한 해변', subtitle: '초보 추천 · 안정적인 입질', bg: './assets/art/bg_lake.webp', difficulty: 1.0 },
  { key: 'river', name: '산호숲 바다', subtitle: '흐름이 빠른 중급 수역', bg: './assets/art/bg_river.webp', difficulty: 1.15 },
  { key: 'harbor', name: '노을 항구', subtitle: '반짝임 속 희귀어 출현', bg: './assets/art/bg_harbor.webp', difficulty: 1.22 },
  { key: 'deep', name: '깊은 바다', subtitle: '장력 변화가 큰 심해', bg: './assets/art/bg_deep.webp', difficulty: 1.34 },
  { key: 'palace', name: '용궁 정원', subtitle: '고급 장비 권장', bg: './assets/art/bg_palace.webp', difficulty: 1.45 },
  { key: 'dimension', name: '차원의 바다', subtitle: '보스 입질 확률 상승', bg: './assets/art/bg_dimension.webp', difficulty: 1.58 },
];

export const fishDex = [
  { id: 'lake', name: '방울광대', region: '잔잔한 해변', img: './assets/dex/fish_lake_25d.png', rarity: 'COMMON' },
  { id: 'river', name: '산호줄무늬', region: '산호숲 바다', img: './assets/dex/fish_river_25d.png', rarity: 'COMMON' },
  { id: 'harbor', name: '노을꼬리', region: '노을 항구', img: './assets/dex/fish_harbor_25d.png', rarity: 'RARE' },
  { id: 'deep', name: '심해등불', region: '깊은 바다', img: './assets/dex/fish_deep_25d.png', rarity: 'RARE' },
  { id: 'palace', name: '용궁비늘', region: '용궁 정원', img: './assets/dex/fish_palace_25d.png', rarity: 'EPIC' },
  { id: 'dimension', name: '차원광어', region: '차원의 바다', img: './assets/dex/fish_dimension_25d.png', rarity: 'BOSS' },
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
  };
}
