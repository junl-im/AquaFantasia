import { APP_VERSION, defaultSave, regions } from './data';
import type { RegionKey, SaveData, Screen } from './types';

const KEY = 'aqua-fantasia-save-v650';
const LEGACY_KEYS = ['aqua-fantasia-save-v640', 'aqua-fantasia-save-v630', 'aqua-fantasia-save-v620'];
const VALID_SCREENS: Screen[] = ['login', 'village', 'fishing', 'gear', 'inventory', 'dex', 'shop', 'mission', 'ranking'];
const VALID_REGIONS = new Set<RegionKey>(regions.map((region) => region.key));

function finiteNumber(value: unknown, fallback: number, min = 0, max = Number.MAX_SAFE_INTEGER): number {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(numeric)));
}

function sanitizeRecord(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value as Record<string, unknown>)
    .filter(([key]) => /^[a-zA-Z0-9_-]+$/.test(key))
    .map(([key, count]) => [key, finiteNumber(count, 0)]));
}

function sanitizeMissions(value: unknown): Record<string, boolean> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value as Record<string, unknown>)
    .filter(([key]) => /^[a-zA-Z0-9_-]+$/.test(key))
    .map(([key, done]) => [key, Boolean(done)]));
}

function normalizeSave(parsed: Partial<SaveData>): SaveData {
  const base = defaultSave();
  const gear = {
    rodLevel: finiteNumber(parsed.gear?.rodLevel, base.gear.rodLevel, 1, 99),
    reelLevel: finiteNumber(parsed.gear?.reelLevel, base.gear.reelLevel, 1, 99),
    lureStock: finiteNumber(parsed.gear?.lureStock, base.gear.lureStock, 0, 9999),
    lineLevel: finiteNumber(parsed.gear?.lineLevel, base.gear.lineLevel, 1, 99),
  };
  const parsedScreen = parsed.screen as Screen | undefined;
  const parsedRegion = parsed.region as RegionKey | undefined;
  const screen = parsedScreen && VALID_SCREENS.includes(parsedScreen) ? parsedScreen : base.screen;
  const region = parsedRegion && VALID_REGIONS.has(parsedRegion) ? parsedRegion : base.region;
  const unlocked = Array.isArray(parsed.unlockedRegions)
    ? parsed.unlockedRegions.filter((key): key is RegionKey => VALID_REGIONS.has(key as RegionKey))
    : [];
  const unlockedRegions = Array.from(new Set<RegionKey>([...base.unlockedRegions, ...unlocked]));
  return {
    ...base,
    ...parsed,
    version: APP_VERSION,
    screen,
    region: unlockedRegions.includes(region) ? region : base.region,
    coins: finiteNumber(parsed.coins, base.coins, 0),
    caught: sanitizeRecord(parsed.caught),
    missions: sanitizeMissions(parsed.missions),
    serverLinked: Boolean(parsed.serverLinked),
    gear,
    bestStreak: finiteNumber(parsed.bestStreak, base.bestStreak, 0),
    currentStreak: finiteNumber(parsed.currentStreak, 0, 0),
    totalCasts: finiteNumber(parsed.totalCasts, 0, 0),
    totalSuccess: finiteNumber(parsed.totalSuccess, 0, 0),
    totalFail: finiteNumber(parsed.totalFail, 0, 0),
    unlockedRegions,
    mastery: sanitizeRecord(parsed.mastery),
    lastRescueAt: finiteNumber(parsed.lastRescueAt, 0, 0),
  };
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY) ?? LEGACY_KEYS.map((k) => localStorage.getItem(k)).find(Boolean);
    if (!raw) return defaultSave();
    return normalizeSave(JSON.parse(raw) as Partial<SaveData>);
  } catch {
    return defaultSave();
  }
}

export function saveGame(save: SaveData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...save, version: APP_VERSION }));
  } catch {
    // Storage may be unavailable in private mode. The game keeps running in memory.
  }
}

export async function tryAnonymousServerLink(save: SaveData): Promise<{ ok: boolean; message: string }> {
  const globalConfig = (window as unknown as { AQUA_FIREBASE_CONFIG?: Record<string, string> }).AQUA_FIREBASE_CONFIG;
  if (!globalConfig?.apiKey) {
    save.serverLinked = false;
    saveGame(save);
    return { ok: false, message: '서버 설정 전이라 로컬 저장으로 진행합니다.' };
  }

  try {
    const appMod = await import('firebase/app');
    const authMod = await import('firebase/auth');
    const app = appMod.initializeApp(globalConfig);
    const auth = authMod.getAuth(app);
    await authMod.signInAnonymously(auth);
    save.serverLinked = true;
    saveGame(save);
    return { ok: true, message: '익명 서버연동이 완료되었습니다.' };
  } catch (error) {
    console.warn('[AquaFantasia] anonymous server link failed', error);
    save.serverLinked = false;
    saveGame(save);
    return { ok: false, message: '서버연동 실패. 로컬 저장으로 계속합니다.' };
  }
}
