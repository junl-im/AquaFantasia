import { APP_VERSION, defaultSave } from './data';
import type { SaveData } from './types';

const KEY = 'aqua-fantasia-save-v650';
const LEGACY_KEYS = ['aqua-fantasia-save-v640', 'aqua-fantasia-save-v630', 'aqua-fantasia-save-v620'];

function normalizeSave(parsed: Partial<SaveData>): SaveData {
  const base = defaultSave();
  const gear = { ...base.gear, ...(parsed.gear ?? {}) };
  const unlocked = Array.isArray(parsed.unlockedRegions) && parsed.unlockedRegions.length > 0 ? parsed.unlockedRegions : base.unlockedRegions;
  return {
    ...base,
    ...parsed,
    version: APP_VERSION,
    screen: parsed.screen === 'login' ? 'login' : (parsed.screen ?? base.screen),
    region: parsed.region ?? base.region,
    coins: Number.isFinite(parsed.coins) ? Number(parsed.coins) : base.coins,
    caught: parsed.caught ?? {},
    missions: parsed.missions ?? {},
    gear,
    bestStreak: Number.isFinite(parsed.bestStreak) ? Number(parsed.bestStreak) : base.bestStreak,
    currentStreak: Number.isFinite(parsed.currentStreak) ? Number(parsed.currentStreak) : 0,
    totalCasts: Number.isFinite(parsed.totalCasts) ? Number(parsed.totalCasts) : 0,
    totalSuccess: Number.isFinite(parsed.totalSuccess) ? Number(parsed.totalSuccess) : 0,
    totalFail: Number.isFinite(parsed.totalFail) ? Number(parsed.totalFail) : 0,
    unlockedRegions: unlocked,
    mastery: parsed.mastery ?? {},
    lastRescueAt: Number.isFinite(parsed.lastRescueAt) ? Number(parsed.lastRescueAt) : 0,
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
