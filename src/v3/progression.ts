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
  readonly fishWeights: readonly number[];
}
export const FISHING_REGIONS: readonly FishingRegion[] = [
  { id: 'shore', name: '잔잔한 해변', description: '낚시의 시작, 물결이 부드러운 곳', requiredDiscoveries: 0, requiredRodLevel: 1, unlockPrice: 0, fishIds: ['bubble', 'lake'], fishWeights: [60, 40] },
  { id: 'coral-bay', name: '산호빛 만', description: '다채로운 물고기가 숨어 있는 산호초', requiredDiscoveries: 2, requiredRodLevel: 2, unlockPrice: 280, fishIds: ['pearl', 'clown', 'coral'], fishWeights: [46, 34, 20] },
  { id: 'deep-blue', name: '푸른 심해', description: '강한 저항과 전설의 물고기를 만나는 곳', requiredDiscoveries: 4, requiredRodLevel: 3, unlockPrice: 900, fishIds: ['king', 'clown', 'coral'], fishWeights: [12, 44, 44] },
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
/** Stable uint32 sampling makes casts reproducible under tests. */
function castFraction(seed: number, castCount: number): number {
  const s = Number.isFinite(seed) ? (Math.floor(seed) >>> 0) : 1;
  const n = Number.isSafeInteger(castCount) ? Math.max(0, castCount) >>> 0 : 0;
  let h = (s ^ Math.imul(n + 1, 0x9e3779b1)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
/** Regional weighting plus a small boost for undiscovered fish; never draw from locked pools. */
export function fishForRegion(state: CollectionState, castCount: number, seed = 1): FishProfile {
  const region = getRegion(state.selectedRegion);
  const pool = region.fishIds.map((id, index) => ({
    fish: DEMO_FISH.find((item) => item.id === id),
    weight: region.fishWeights[index] ?? 0,
  })).filter((item): item is { fish: FishProfile; weight: number } => item.fish !== undefined && item.weight > 0);
  if (!pool.length) throw new Error('Fishing region has no available species');
  const weights = pool.map((item) =>
    item.weight * ((state.records[item.fish.id]?.count ?? 0) > 0 ? 1 : 1.5));
  const sum = weights.reduce((a, b) => a + b, 0);
  let roll = castFraction(seed, castCount) * sum;
  for (let i = 0; i < pool.length; i += 1) {
    roll -= weights[i];
    if (roll < 0) return pool[i].fish;
  }
  return pool[pool.length - 1].fish;
}
