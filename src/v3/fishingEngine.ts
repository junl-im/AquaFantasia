/** Pure AquaFantasia v3 fishing rules; no DOM, storage, or network dependencies. */
export type FishBehavior = 'steady' | 'dart' | 'heavy' | 'wave' | 'trickster' | 'boss';
export type RoundPhase = 'waiting' | 'bite' | 'fighting' | 'landed' | 'escaped';

export interface FishProfile {
  readonly id: string;
  readonly name: string;
  readonly behavior: FishBehavior;
  readonly difficulty: number;
  readonly image: string;
  readonly reward: number;
}

export interface FishingRound {
  readonly phase: RoundPhase;
  readonly fish: FishProfile;
  readonly seed: number;
  readonly elapsed: number;
  readonly fightElapsed: number;
  readonly biteIn: number;
  readonly biteWindow: number;
  readonly tension: number;
  readonly progress: number;
  readonly fatigue: number;
  readonly peakTension: number;
  readonly reason: 'none' | 'missed' | 'snapped' | 'exhausted';
}

export const DEMO_FISH: readonly FishProfile[] = [
  { id: 'bubble', name: '바늘꼬리', behavior: 'steady', difficulty: 0.82, image: './assets/v2110/fish/common_tropical/fish_common_001.png', reward: 55 },
  { id: 'lake', name: '투명메기', behavior: 'dart', difficulty: 0.95, image: './assets/v2110/fish/common_tropical/fish_common_002.png', reward: 72 },
  { id: 'pearl', name: '화산쏨뱅이', behavior: 'heavy', difficulty: 1.08, image: './assets/v2110/fish/common_tropical/fish_common_003.png', reward: 115 },
  { id: 'clown', name: '하늘가오리', behavior: 'wave', difficulty: 1.05, image: './assets/v2110/fish/common_tropical/fish_common_004.png', reward: 140 },
  { id: 'coral', name: '작은 금붕어', behavior: 'trickster', difficulty: 1.13, image: './assets/v2110/fish/common_tropical/fish_common_006.png', reward: 165 },
  { id: 'king', name: '푸른보석고기', behavior: 'boss', difficulty: 1.28, image: './assets/v2110/fish/rare_deepsea/fish_rare_002.png', reward: 360 },
];

function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value));
}

function normalizedSeed(seed: number): number {
  return Number.isFinite(seed) ? (Math.floor(seed) >>> 0) : 1;
}

function seedFraction(seed: number): number {
  return ((Math.imul(normalizedSeed(seed), 1664525) + 1013904223) >>> 0) / 4294967296;
}

export function createCast(fish: FishProfile, seed = 1): FishingRound {
  return {
    phase: 'waiting', fish, seed: normalizedSeed(seed),
    elapsed: 0, fightElapsed: 0, biteIn: 1.2 + seedFraction(seed) * 2.2,
    biteWindow: 3.8, tension: 0.1, progress: 0, fatigue: 0,
    peakTension: 0.1, reason: 'none',
  };
}

export function hookFish(round: FishingRound): FishingRound {
  return round.phase === 'bite' ? { ...round, phase: 'fighting' } : round;
}

function fishPull(round: FishingRound): number {
  const { behavior, difficulty } = round.fish;
  const t = round.fightElapsed;
  const offset = (round.seed % 97) / 97;
  const wave = Math.sin(t * 2.5 + offset * Math.PI * 2);
  const cycle = (t + offset) % 6;
  const base = 0.052 + difficulty * 0.025;
  switch (behavior) {
    case 'steady': return base + wave * 0.012;
    case 'dart': return base + (cycle < 0.8 ? 0.17 : 0) + wave * 0.018;
    case 'heavy': return base + 0.055;
    case 'wave': return base + Math.max(0, wave) * 0.095;
    case 'trickster': return base + (cycle > 2.5 && cycle < 3.7 ? 0.12 : 0);
    case 'boss': return base + 0.045 + (cycle < 1.2 ? 0.14 : 0);
  }
}

/** Holding reels and raises tension; releasing stops the reel and cools the line. */
export function advanceRound(round: FishingRound, seconds: number, holding: boolean): FishingRound {
  if (!Number.isFinite(seconds) || seconds <= 0) return round;
  if (round.phase === 'landed' || round.phase === 'escaped') return round;
  const dt = clamp(seconds, 0, 0.1);
  const elapsed = round.elapsed + dt;

  if (round.phase === 'waiting') {
    const biteIn = round.biteIn - dt;
    return { ...round, elapsed, biteIn, phase: biteIn <= 0 ? 'bite' : 'waiting' };
  }
  if (round.phase === 'bite') {
    const biteWindow = round.biteWindow - dt;
    return biteWindow <= 0
      ? { ...round, elapsed, biteWindow: 0, phase: 'escaped', reason: 'missed' }
      : { ...round, elapsed, biteWindow };
  }

  const fightElapsed = round.fightElapsed + dt;
  const pulling = fishPull({ ...round, fightElapsed });
  const fatigue = clamp(round.fatigue + (holding ? 0.013 : -0.004) * dt, 0, 1);
  const tensionChange = holding
    ? (0.135 + pulling * 0.9 - fatigue * 0.05) * dt
    : (-0.3 + pulling * 0.2) * dt;
  const tension = clamp(round.tension + tensionChange, 0, 1.1);
  const progressRate = holding
    ? (0.068 / round.fish.difficulty) * (1 - Math.max(0, tension - 0.67) * 0.28)
    : -0.008;
  const progress = clamp(round.progress + progressRate * dt, 0, 1);
  const peakTension = Math.max(round.peakTension, tension);
  const next = { ...round, elapsed, fightElapsed, fatigue, tension, progress, peakTension };
  if (tension >= 1) return { ...next, phase: 'escaped', reason: 'snapped' };
  if (fightElapsed >= 90) return { ...next, phase: 'escaped', reason: 'exhausted' };
  if (progress >= 1) return { ...next, phase: 'landed', reason: 'none' };
  return next;
}

export function rewardFor(round: FishingRound): number {
  if (round.phase !== 'landed') return 0;
  return Math.round(round.fish.reward * (round.peakTension < 0.7 ? 1.15 : 1));
}
