import { APP_VERSION } from './data';
import type { SaveData } from './types';
import { defaultSave } from './data';

const KEY = 'aqua-fantasia-save-v620';

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSave();
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    return { ...defaultSave(), ...parsed, version: APP_VERSION };
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
