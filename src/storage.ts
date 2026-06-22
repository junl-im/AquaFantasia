import { APP_VERSION, defaultSave, regions } from './data';
import type { MultiplayerEvent, MultiplayerState, RegionKey, SaveData, Screen, VillageBuildingSave, VillageBuildingType } from './types';

const KEY = 'aqua-fantasia-save-v650';
const LEGACY_KEYS = ['aqua-fantasia-save-v640', 'aqua-fantasia-save-v630', 'aqua-fantasia-save-v620'];
const VALID_SCREENS: Screen[] = ['login', 'village', 'map', 'fishing', 'gear', 'inventory', 'dex', 'shop', 'mission', 'ranking'];
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


const VALID_VILLAGE_BUILDINGS = new Set<VillageBuildingType>(['house', 'market', 'inn', 'guild', 'harbor', 'warehouse', 'aquarium', 'fountain', 'flower', 'path']);

function sanitizeVillageBuildings(value: unknown, fallback: VillageBuildingSave[]): VillageBuildingSave[] {
  if (!Array.isArray(value)) return fallback;
  const buildings = value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object' && !Array.isArray(item))
    .map((item, index): VillageBuildingSave | null => {
      const type = item.type as VillageBuildingType;
      if (!VALID_VILLAGE_BUILDINGS.has(type) || type === 'path') return null;
      return {
        id: typeof item.id === 'string' && /^[a-zA-Z0-9_-]+$/.test(item.id) ? item.id : `b_${type}_${index}`,
        type,
        x: finiteNumber(item.x, 20, 0, 79),
        y: finiteNumber(item.y, 20, 0, 79),
        w: finiteNumber(item.w, 1, 1, 8),
        h: finiteNumber(item.h, 1, 1, 8),
        builtAt: finiteNumber(item.builtAt, 0, 0),
      };
    })
    .filter((item): item is VillageBuildingSave => Boolean(item));
  return buildings.length ? buildings : fallback;
}

function sanitizeVillagePaths(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.filter((item): item is string => typeof item === 'string' && /^\d{1,2},\d{1,2}$/.test(item)))).slice(0, 6400);
}

function sanitizeMissions(value: unknown): Record<string, boolean> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value as Record<string, unknown>)
    .filter(([key]) => /^[a-zA-Z0-9_-]+$/.test(key))
    .map(([key, done]) => [key, Boolean(done)]));
}


function makeClientId(): string {
  try {
    const existing = localStorage.getItem('aqua-fantasia-client-id');
    if (existing && /^local-[a-z0-9-]{8,64}$/.test(existing)) return existing;
  } catch {
    // Ignore blocked storage and still create an in-memory client id.
  }
  const next = `local-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
  try { localStorage.setItem('aqua-fantasia-client-id', next); } catch { /* ignore private-mode storage errors */ }
  return next;
}

function sanitizeMultiplayerEvent(value: unknown): MultiplayerEvent | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const item = value as Record<string, unknown>;
  const type = typeof item.type === 'string' ? item.type : '';
  if (!['save-update', 'village-action', 'fishing-result', 'shop-claim', 'profile-update'].includes(type)) return null;
  const rawPayload = item.payload && typeof item.payload === 'object' && !Array.isArray(item.payload) ? item.payload as Record<string, unknown> : {};
  const payload = Object.fromEntries(Object.entries(rawPayload)
    .filter(([key, val]) => /^[a-zA-Z0-9_-]+$/.test(key) && ['string', 'number', 'boolean'].includes(typeof val))
    .slice(0, 24)) as Record<string, string | number | boolean>;
  return {
    id: typeof item.id === 'string' && /^[a-zA-Z0-9_-]{8,80}$/.test(item.id) ? item.id : `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    type: type as MultiplayerEvent['type'],
    createdAt: finiteNumber(item.createdAt, Date.now(), 0),
    payload,
  };
}

function sanitizeMultiplayer(value: unknown, fallback: MultiplayerState): MultiplayerState {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value as Partial<MultiplayerState> : {};
  const pendingEvents = Array.isArray(source.pendingEvents)
    ? source.pendingEvents.map(sanitizeMultiplayerEvent).filter((event): event is MultiplayerEvent => Boolean(event)).slice(-80)
    : [];
  return {
    schemaVersion: 1,
    clientId: typeof source.clientId === 'string' && /^local-[a-z0-9-]{8,64}$/.test(source.clientId) ? source.clientId : makeClientId(),
    lastSyncAt: finiteNumber(source.lastSyncAt, fallback.lastSyncAt, 0),
    pendingEvents,
  };
}

function sanitizePlayerName(value: unknown, fallback = '루미'): string {
  const raw = typeof value === 'string' ? value : '';
  const cleaned = raw.replace(/[<>{}\"'`\\]/g, '').replace(/\s+/g, ' ').trim().slice(0, 12);
  return cleaned || fallback;
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
  const village = {
    ...base.village,
    ...(parsed.village && typeof parsed.village === 'object' && !Array.isArray(parsed.village) ? parsed.village : {}),
    level: finiteNumber(parsed.village?.level, base.village.level, 1, 99),
    fund: finiteNumber(parsed.village?.fund, base.village.fund, 0),
    development: finiteNumber(parsed.village?.development, base.village.development, 0),
    unlockedSize: finiteNumber(parsed.village?.unlockedSize, base.village.unlockedSize, 20, 80),
    buildings: sanitizeVillageBuildings(parsed.village?.buildings, base.village.buildings),
    paths: sanitizeVillagePaths(parsed.village?.paths),
    tourists: finiteNumber(parsed.village?.tourists, 0, 0, 999),
    autoIncome: finiteNumber(parsed.village?.autoIncome, 0, 0),
  };
  return {
    ...base,
    ...parsed,
    version: APP_VERSION,
    screen,
    playerName: sanitizePlayerName(parsed.playerName, base.playerName),
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
    village,
    multiplayer: sanitizeMultiplayer(parsed.multiplayer, base.multiplayer),
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
    const normalized = normalizeSave(save);
    localStorage.setItem(KEY, JSON.stringify({ ...normalized, version: APP_VERSION }));
  } catch {
    // Storage may be unavailable in private mode. The game keeps running in memory.
  }
}

export function appendLocalSyncEvent(save: SaveData, event: Omit<MultiplayerEvent, 'id' | 'createdAt'>): SaveData {
  const normalized = normalizeSave(save);
  const nextEvent: MultiplayerEvent = {
    id: `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    type: event.type,
    payload: event.payload,
  };
  normalized.multiplayer.pendingEvents = [...normalized.multiplayer.pendingEvents, nextEvent].slice(-80);
  saveGame(normalized);
  return normalized;
}

export function consumeLocalSyncEvents(save: SaveData): MultiplayerEvent[] {
  const normalized = normalizeSave(save);
  const events = [...normalized.multiplayer.pendingEvents];
  normalized.multiplayer.pendingEvents = [];
  normalized.multiplayer.lastSyncAt = Date.now();
  saveGame(normalized);
  return events;
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
