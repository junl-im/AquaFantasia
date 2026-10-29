import { DEMO_FISH, type FishProfile } from './fishingEngine.ts';
import { discoveredSpecies, type CollectionState, type RegionId } from './collection.ts';

/** Small, independently testable P2 progression. No legacy saves, network, or UI. */
export interface FishingRegion {
  readonly id: RegionId;
  readonly name: string;
  readonly description: string;
  readonly requiredDiscoveries: number;
  readonly requiredRodLevel: number;
  readonly unlockPrice: number;
  readonly fishIds: readonly string[];
}
export const FISHING_REGIONS: readonly FishingRegion[] = [
  { id: 'shore', name: '잔잔한 해변', description: '낚시의 시작, 물결이 부드러운 곳', requiredDiscoveries: 0, requiredRodLevel: 1, unlockPrice: 0, fishIds: ['bubble', 'lake'] },
  { id: 'coral-bay', name: '산호빛 만', description: '다채로운 물고기가 숨어 있는 산호초', requiredDiscoveries: 2, requiredRodLevel: 2, unlockPrice: 280, fishIds: ['pearl', 'clown', 'coral'] },
  { id: 'deep-blue', name: '푸른 심해', description: '강한 저항과 전설의 물고기를 만나는 곳', requiredDiscoveries: 4, requiredRodLevel: 3, unlockPrice: 900, fishIds: ['king', 'clown', 'coral'] },
];

export const MAX_ROD_LEVEL = 4;
const ROD_UPGRADE_PRICES = [160, 410, 840] as const;

export function rodUpgradePrice(level: number): number | null {
  return Number.isSafeInteger(level) && level >= 1 && level < MAX_ROD_LEVEL
    ? ROD_UPGRADE_PRICES[level - 1] : null;
}
export function tryUpgradeRod(state: CollectionState): CollectionState {
  const price = rodUpgradePrice(state.rodLevel);
  if (price === null || state.coins < price) return state;
  return { ...state, coins: state.coins - price, rodLevel: state.rodLevel + 1 };
}
export function getRegion(id: RegionId): FishingRegion {
  const region = FISHING_REGIONS.find((candidate) => candidate.id === id);
  if (!region) throw new Error('Unknown fishing region');
  return region;
}
export function canUnlockRegion(state: CollectionState, id: RegionId): boolean {
  const region = getRegion(id);
  return !state.unlockedRegions.includes(id)
    && state.coins >= region.unlockPrice
    && discoveredSpecies(state) >= region.requiredDiscoveries
    && state.rodLevel >= region.requiredRodLevel;
}
export function tryUnlockRegion(state: CollectionState, id: RegionId): CollectionState {
  if (!canUnlockRegion(state, id)) return state;
  const region = getRegion(id);
  return {
    ...state,
    coins: state.coins - region.unlockPrice,
    unlockedRegions: [...state.unlockedRegions, id],
  };
}
export function trySelectRegion(state: CollectionState, id: RegionId): CollectionState {
  return state.unlockedRegions.includes(id) && getRegion(id) && state.selectedRegion !== id
    ? { ...state, selectedRegion: id } : state;
}
/** A stable region-specific fish selection. Never picks inaccessible species. */
export function fishForRegion(state: CollectionState, castCount: number): FishProfile {
  const region = getRegion(state.selectedRegion);
  const allowed = region.fishIds.map((id) => DEMO_FISH.find((fish) => fish.id === id))
    .filter((fish): fish is FishProfile => fish !== undefined);
  if (!allowed.length) throw new Error('Fishing region has no available species');
  const index = Number.isSafeInteger(castCount) ? Math.abs(castCount) % allowed.length : 0;
  return allowed[index];
}
