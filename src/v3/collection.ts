import { DEMO_FISH, rewardFor, type FishingRound } from './fishingEngine.ts';

/** V3-only namespace. Never read or write the v2 game-save keys. */
export const V3_COLLECTION_KEY = 'aquafantasia:v3:collection:v1';
export type CatchRarity = 'common' | 'uncommon' | 'rare' | 'legendary';
export type RegionId = 'shore' | 'coral-bay' | 'deep-blue';


export const RARITY_LABELS: Readonly<Record<CatchRarity, string>> = {
  common: '일반', uncommon: '특별', rare: '희귀', legendary: '전설',
};

const RARITY_LEVEL: Readonly<Record<CatchRarity, number>> = {
  common: 0, uncommon: 1, rare: 2, legendary: 3,
};
const RARITY_MULTIPLIER: Readonly<Record<CatchRarity, number>> = {
  common: 1, uncommon: 1.25, rare: 1.65, legendary: 2.5,
};
const LENGTH_RANGES_CM: Readonly<Record<string, readonly [number, number]>> = {
  bubble: [12, 27], lake: [28, 55], pearl: [17, 42],
  clown: [33, 71], coral: [13, 34], king: [57, 118],
  foam: [14, 32], anemone: [24, 57], ribbon: [27, 66],
  lantern: [43, 96], phantom: [48, 113], leviathan: [82, 172],
};

export interface FishRecord {
  readonly count: number;
  readonly bestLengthCm: number;
  readonly rarest: CatchRarity;
}

export interface CollectionState {
  readonly version: 1;
  readonly coins: number;
  readonly records: Readonly<Record<string, FishRecord>>;
  readonly rodLevel: number;
  /** Drag-brake upgrade. Older V3 saves lacking this property migrate to level 1. */
  readonly brakeLevel: number;
  readonly unlockedRegions: readonly RegionId[];
  readonly selectedRegion: RegionId;
}

export interface CatchResult {
  readonly fishId: string;
  readonly lengthCm: number;
  readonly rarity: CatchRarity;
  readonly earnedCoins: number;
  readonly firstDiscovery: boolean;
  readonly newSizeRecord: boolean;
}

export function emptyCollection(): CollectionState {
  return { version: 1, coins: 0, records: {}, rodLevel: 1, brakeLevel: 1, unlockedRegions: ['shore'], selectedRegion: 'shore' };
}

export function discoveredSpecies(state: CollectionState): number {
  return DEMO_FISH.filter((fish) => (state.records[fish.id]?.count ?? 0) > 0).length;
}

export function totalCatches(state: CollectionState): number {
  return DEMO_FISH.reduce((count, fish) => count + (state.records[fish.id]?.count ?? 0), 0);
}

/** The only untrusted input is JSON from the isolated V3 key; discard invalid fields. */
export function parseCollection(raw: string | null): CollectionState {
  if (!raw || raw.length > 100_000) return emptyCollection();
  try {
    const input: unknown = JSON.parse(raw);
    if (!input || typeof input !== 'object' || !('version' in input) || input.version !== 1) {
      return emptyCollection();
    }
    const data = input as { coins?: unknown; records?: unknown; rodLevel?: unknown; brakeLevel?: unknown; unlockedRegions?: unknown; selectedRegion?: unknown };
    const coins = typeof data.coins === 'number' && Number.isSafeInteger(data.coins)
      && data.coins >= 0 && data.coins <= 1_000_000_000 ? data.coins : 0;
    const records: Record<string, FishRecord> = {};
    const stored = data.records && typeof data.records === 'object'
      ? data.records as Record<string, unknown> : {};
    for (const fish of DEMO_FISH) {
      const value = Object.prototype.hasOwnProperty.call(stored, fish.id) ? stored[fish.id] : undefined;
      if (!value || typeof value !== 'object') continue;
      const record = value as Partial<FishRecord>;
      if (typeof record.count !== 'number' || !Number.isSafeInteger(record.count) || record.count < 1 || record.count > 1_000_000) continue;
      if (typeof record.bestLengthCm !== 'number' || !Number.isFinite(record.bestLengthCm) || record.bestLengthCm <= 0 || record.bestLengthCm > 500) continue;
      if (typeof record.rarest !== 'string' || !(record.rarest in RARITY_LEVEL)) continue;
      records[fish.id] = { count: record.count, bestLengthCm: record.bestLengthCm, rarest: record.rarest as CatchRarity };
    }
    const allowed: readonly RegionId[] = ['shore', 'coral-bay', 'deep-blue'];
    const rodLevel = typeof data.rodLevel === 'number' && Number.isSafeInteger(data.rodLevel)
      && data.rodLevel >= 1 && data.rodLevel <= 4 ? data.rodLevel : 1;
    const brakeLevel = typeof data.brakeLevel === 'number' && Number.isSafeInteger(data.brakeLevel)
      && data.brakeLevel >= 1 && data.brakeLevel <= 3 ? data.brakeLevel : 1;
    const inputRegions = Array.isArray(data.unlockedRegions) ? data.unlockedRegions : [];
    const unlockedRegions: RegionId[] = ['shore'];
    for (const id of allowed) {
      if (id !== 'shore' && inputRegions.includes(id)) unlockedRegions.push(id);
    }
    const selectedRegion: RegionId = typeof data.selectedRegion === 'string'
      && unlockedRegions.some((region) => region === data.selectedRegion)
      ? data.selectedRegion as RegionId : 'shore';
    return { version: 1, coins, records, rodLevel, brakeLevel, unlockedRegions, selectedRegion };
  } catch {
    return emptyCollection();
  }
}

function sample(seed: number, salt: number): number {
  const mixed = Math.imul((seed ^ salt) >>> 0, 0x5bd1e995) >>> 0;
  return ((mixed ^ (mixed >>> 13)) >>> 0) / 4294967296;
}

/** One deterministic catch result per landed round, independent from UI frames. */
export function measureCatch(round: FishingRound): Pick<CatchResult, 'fishId' | 'lengthCm' | 'rarity'> {
  if (round.phase !== 'landed') throw new Error('Only landed fish can enter the collection');
  const rarityRoll = sample(round.seed, 0x9e3779b9);
  const rarity: CatchRarity = rarityRoll < 0.03 ? 'legendary'
    : rarityRoll < 0.17 ? 'rare' : rarityRoll < 0.46 ? 'uncommon' : 'common';
  const [min, max] = LENGTH_RANGES_CM[round.fish.id] ?? [10, 45];
  const lengthCm = Math.round((min + sample(round.seed, 0x85ebca6b) * (max - min)) * 10) / 10;
  return { fishId: round.fish.id, lengthCm, rarity };
}

/** Returns a new state. First discovery and personal size records earn small bonuses. */
export function collectCatch(state: CollectionState, round: FishingRound): { state: CollectionState; result: CatchResult } {
  const measured = measureCatch(round);
  const previous = state.records[measured.fishId];
  const firstDiscovery = !previous;
  const newSizeRecord = !previous || measured.lengthCm > previous.bestLengthCm;
  const earnedCoins = Math.round(rewardFor(round) * RARITY_MULTIPLIER[measured.rarity])
    + (firstDiscovery ? 50 : newSizeRecord ? 15 : 0);
  const records: Record<string, FishRecord> = {
    ...state.records,
    [measured.fishId]: {
      count: Math.min((previous?.count ?? 0) + 1, 1_000_000),
      bestLengthCm: Math.max(previous?.bestLengthCm ?? 0, measured.lengthCm),
      rarest: !previous || RARITY_LEVEL[measured.rarity] > RARITY_LEVEL[previous.rarest]
        ? measured.rarity : previous.rarest,
    },
  };
  return {
    state: { ...state, coins: Math.min(state.coins + earnedCoins, 1_000_000_000), records },
    result: { ...measured, earnedCoins, firstDiscovery, newSizeRecord },
  };
}
