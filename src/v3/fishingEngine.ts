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
  readonly rodLevel: number;
  readonly brakeLevel: number;
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

export type ReelAdviceLevel = 'normal' | 'reel' | 'ease' | 'danger';
export interface ReelAdvice {
  readonly level: ReelAdviceLevel;
  readonly title: string;
  readonly message: string;
}

export interface FishVisualSignal {
  /** Normalized movement used by the UI; independent from screen resolution. */
  readonly x: number;
  readonly y: number;
  readonly rotation: number;
  readonly intensity: number;
  readonly cue: string;
}

export const DEMO_FISH: readonly FishProfile[] = [
  { id: 'bubble', name: '바늘꼬리', behavior: 'steady', difficulty: 0.82, image: './assets/v2110/fish/common_tropical/fish_common_001.png', reward: 55 },
  { id: 'lake', name: '투명메기', behavior: 'dart', difficulty: 0.95, image: './assets/v2110/fish/common_tropical/fish_common_002.png', reward: 72 },
  { id: 'pearl', name: '화산쏨뱅이', behavior: 'heavy', difficulty: 1.08, image: './assets/v2110/fish/common_tropical/fish_common_003.png', reward: 115 },
  { id: 'clown', name: '하늘가오리', behavior: 'wave', difficulty: 1.05, image: './assets/v2110/fish/common_tropical/fish_common_004.png', reward: 140 },
  { id: 'coral', name: '작은 금붕어', behavior: 'trickster', difficulty: 1.13, image: './assets/v2110/fish/common_tropical/fish_common_006.png', reward: 165 },
  { id: 'king', name: '푸른보석고기', behavior: 'boss', difficulty: 1.28, image: './assets/v2110/fish/rare_deepsea/fish_rare_002.png', reward: 360 },
  { id: 'foam', name: '물결비늘', behavior: 'wave', difficulty: 0.86, image: './assets/v2110/fish/common_tropical/fish_common_005.png', reward: 64 },
  { id: 'anemone', name: '산호숨결', behavior: 'steady', difficulty: 1.04, image: './assets/v2110/fish/common_tropical/fish_common_007.png', reward: 122 },
  { id: 'ribbon', name: '리본꼬리', behavior: 'dart', difficulty: 1.11, image: './assets/v2110/fish/common_tropical/fish_common_008.png', reward: 151 },
  { id: 'lantern', name: '심해등불', behavior: 'heavy', difficulty: 1.21, image: './assets/v2110/fish/rare_deepsea/fish_rare_001.png', reward: 235 },
  { id: 'phantom', name: '유령비늘', behavior: 'trickster', difficulty: 1.23, image: './assets/v2110/fish/rare_deepsea/fish_rare_003.png', reward: 290 },
  { id: 'leviathan', name: '검푸른 지느러미', behavior: 'boss', difficulty: 1.32, image: './assets/v2110/fish/rare_deepsea/fish_rare_004.png', reward: 445 },
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

export function createCast(fish: FishProfile, seed = 1, rodLevel = 1, brakeLevel = 1): FishingRound {
  return {
    phase: 'waiting', fish, seed: normalizedSeed(seed),
    rodLevel: Number.isSafeInteger(rodLevel) ? clamp(rodLevel, 1, 4) : 1,
    brakeLevel: Number.isSafeInteger(brakeLevel) ? clamp(brakeLevel, 1, 3) : 1,
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

/** Deterministic visual behavior matching each fish's resistance archetype. */
export function fishVisualSignal(round: FishingRound): FishVisualSignal {
  const t = round.fightElapsed;
  const offset = (round.seed % 97) / 97;
  const angle = offset * Math.PI * 2;
  const wave = (speed: number) => Math.sin(t * speed + angle);
  const intensity = clamp((fishPull(round) - 0.04) / 0.27, 0, 1);

  switch (round.fish.behavior) {
    case 'steady':
      return { x: wave(1.2) * 0.23, y: wave(1.8) * 0.08, rotation: wave(1.3) * 5, intensity, cue: '잔잔한 유영' };
    case 'dart':
      return { x: wave(4.3) * 0.78, y: wave(2.4) * 0.16, rotation: wave(4.3) * 18, intensity, cue: intensity > 0.55 ? '빠른 돌진!' : '날렵한 움직임' };
    case 'heavy':
      return { x: wave(0.8) * 0.13, y: 0.17 + wave(1.2) * 0.06, rotation: wave(0.9) * 3, intensity, cue: '묵직한 저항' };
    case 'wave':
      return { x: wave(1.9) * 0.36, y: wave(3.2) * 0.32, rotation: wave(1.9) * 12, intensity, cue: '파도 따라 유영' };
    case 'trickster':
      return { x: wave(3.5) * 0.62, y: wave(5.1) * 0.2, rotation: wave(3.5) * 25, intensity, cue: '방향 급변!' };
    case 'boss':
      return { x: wave(1.25) * 0.47, y: wave(2.1) * 0.25, rotation: wave(1.25) * 13, intensity, cue: intensity > 0.6 ? '보스 폭주!' : '심해의 위압감' };
  }
}

/** Coaching reads the same deterministic resistance as the actual fishing rules. */
export function reelAdvice(round: FishingRound): ReelAdvice {
  if (round.phase !== 'fighting') {
    return { level: 'normal', title: '준비', message: '입질이 오면 챔질하세요' };
  }
  const resistance = fishVisualSignal(round).intensity;
  const surging = ['dart', 'trickster', 'boss'].includes(round.fish.behavior)
    && resistance >= 0.58;
  const releaseAt = surging ? 0.56 : 0.68;
  if (round.tension >= 0.84) {
    return { level: 'danger', title: '줄 끊김 위험!', message: '지금 손을 떼고 장력을 낮추세요' };
  }
  if (round.tension >= releaseAt) {
    return { level: 'ease', title: surging ? '돌진 중 · 잠시 쉬기' : '장력 높음 · 손 떼기',
      message: '줄이 느슨해지면 다시 감으세요' };
  }
  if (round.tension <= 0.27) {
    return { level: 'reel', title: '좋은 순간 · 감기!', message: '지금 줄을 감아 거리를 좁히세요' };
  }
  return { level: 'normal', title: surging ? '저항 주의' : '안정적인 장력',
    message: surging ? '갑작스러운 돌진에 대비하세요' : '장력을 확인하며 천천히 감으세요' };
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
  const rodStrength = 1 - (round.rodLevel - 1) * 0.08;
  const reelSpeed = 1 + (round.rodLevel - 1) * 0.12;
  // Brake reduces line strain under fish surges, but cannot completely remove risk.
  const brakeSafety = 1 - (round.brakeLevel - 1) * 0.085;
  const tensionChange = holding
    ? (0.135 + pulling * 0.9 - fatigue * 0.05) * rodStrength * brakeSafety * dt
    : (-0.3 + pulling * 0.2) * dt;
  const tension = clamp(round.tension + tensionChange, 0, 1.1);
  const isSurgeFish = round.fish.behavior === 'dart' || round.fish.behavior === 'trickster'
    || round.fish.behavior === 'boss';
  // Large, sudden pulls briefly slow reeling rather than changing rewards or the timer.
  const surgeFactor = isSurgeFish ? 1 - clamp((pulling - 0.12) * 1.15, 0, 0.16) : 1;
  const progressRate = holding
    ? (0.068 / round.fish.difficulty) * reelSpeed * surgeFactor * (1 - Math.max(0, tension - 0.67) * 0.28)
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
