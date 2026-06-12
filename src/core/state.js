// Aqua Fantasia v5.6.0 Background Art Pass - 전역 게임 상태 관리
// ------------------------------------------------------------
// 역할:
// 1) 낚시 Runtime, Fishing System, Inventory UI, Navigator가 같은 이벤트를 구독합니다.
// 2) READY → CASTING → WAITING → BITE → REELING → CATCH/FAIL 흐름을 명확히 유지합니다.
// 3) v5.2 이하 저장 데이터를 읽되, 새 저장은 v5.3과 latest 중심으로만 가볍게 남깁니다.

export const GAME_PHASE = Object.freeze({
  READY: 'READY',
  CASTING: 'CASTING',
  WAITING: 'WAITING',
  BITE: 'BITE',
  REELING: 'REELING',
  CATCH: 'CATCH',
  FAIL: 'FAIL',
});

export const ASSETS = Object.freeze({
  background: 'assets/art/v56_fishing_bg_lake.webp',
  ripple: 'assets/ui-kit/icons/water_ripple.png',
  bobber: 'assets/ui-kit/fishing_minigame/bobber_large.png',
  reelBar: 'assets/ui-kit/fishing_minigame/reel_bar_220px.png',
  tensionGauge: 'assets/ui-kit/icons/tension_gauge.png',
  panel: 'assets/ui-kit/panels/panel_1.png',
  mobileShell: 'src/ui/mobile-shell.js',
  fishIcons: [
    'assets/ui-kit/icons/fish_1.png',
    'assets/ui-kit/icons/fish_2.png',
    'assets/ui-kit/icons/fish_3.png',
    'assets/ui-kit/icons/fish_4.png',
    'assets/ui-kit/icons/fish_5.png',
    'assets/ui-kit/icons/fish_6.png',
  ],
});

export const APP_VERSION = '5.6.0';
export const SAVE_KEYS = ['aqua_v5.6.0', 'aqua_v5.5.5', 'aqua_v5.5.2', 'aqua_v5.5.1', 'aqua_v5.5', 'aqua_v5.4', 'aqua_v5.3', 'aqua_v5.2', 'aqua_v5.1', 'aqua_v5.0', 'aqua_v4.9', 'aqua_latest_state'];

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

export function lerp(from, to, amount) {
  return from + (to - from) * clamp(amount, 0, 1);
}

export function now() {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

export function pickFishIcon(seed = Math.random()) {
  const index = Math.abs(Math.floor(Number(seed) * 1000)) % ASSETS.fishIcons.length;
  return ASSETS.fishIcons[index];
}

function createEmitter() {
  const listeners = new Map();
  return {
    on(type, listener) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(listener);
      return () => this.off(type, listener);
    },
    off(type, listener) {
      listeners.get(type)?.delete(listener);
    },
    emit(type, payload) {
      const event = { type, payload, time: now() };
      listeners.get(type)?.forEach((listener) => {
        try { listener(event); } catch (error) { console.warn('[AquaState] listener error', type, error); }
      });
      listeners.get('*')?.forEach((listener) => {
        try { listener(event); } catch (error) { console.warn('[AquaState] wildcard listener error', error); }
      });
    },
  };
}

function loadSavedState() {
  if (typeof localStorage === 'undefined') return null;
  for (const key of SAVE_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch (error) {
      console.warn('[AquaState] 저장 데이터 읽기 실패', key, error);
    }
  }
  return null;
}

function normalizeInventory(saved) {
  const raw = Array.isArray(saved?.inventory) ? saved.inventory : [];
  return raw.slice(0, 120).map((item, index) => ({
    id: item?.id || `legacy-${index}-${Date.now()}`,
    name: item?.name || '작은 물고기',
    icon: item?.icon || ASSETS.fishIcons[index % ASSETS.fishIcons.length],
    rarity: Number(item?.rarity || 1),
    value: Number(item?.value || 80),
    caughtAt: Number(item?.caughtAt || Date.now()),
  }));
}

function createDefaultState() {
  const saved = loadSavedState() || {};
  return {
    version: APP_VERSION,
    phase: GAME_PHASE.READY,
    phaseStartedAt: now(),
    player: {
      name: saved?.player?.name || saved?.nickname || '낚시꾼',
      level: Number(saved?.player?.level || saved?.level || 1),
      gold: Number(saved?.player?.gold || saved?.gold || 0),
      exp: Number(saved?.player?.exp || saved?.exp || 0),
    },
    fishing: {
      tension: 50,
      progress: 0,
      safeSeconds: 0,
      isDown: false,
      combo: 0,
      lastResult: saved?.fishing?.lastResult || null,
      bitePosition: { x: 0.5, y: 0.48 },
      message: '낚싯대 던지기',
      subMessage: '찌가 물에 닿으면 입질을 기다려요.',
      difficulty: saved?.fishing?.difficulty || 'normal',
      lastJudge: '',
      guideLevel: saved?.settings?.guide || 'standard',
    },
    inventory: normalizeInventory(saved),
    caught: Array.isArray(saved?.caught) ? saved.caught.slice(0, 300) : [],
    settings: {
      motion: saved?.settings?.motion || 'balanced',
      performance: saved?.settings?.performance || 'auto',
      haptic: saved?.settings?.haptic !== false,
      guide: saved?.settings?.guide || 'standard',
    },
    shop: {
      owned: Array.isArray(saved?.shop?.owned) ? saved.shop.owned.slice(0, 60) : [],
      selectedSkin: saved?.shop?.selectedSkin || 'bubble',
      lastPurchase: saved?.shop?.lastPurchase || null,
    },
  };
}

export const aquaStore = (() => {
  const emitter = createEmitter();
  let state = createDefaultState();

  function snapshot() {
    if (typeof structuredClone === 'function') return structuredClone(state);
    return JSON.parse(JSON.stringify(state));
  }

  function emitChange(reason, extra = {}) {
    emitter.emit('change', { reason, state: snapshot(), ...extra });
  }

  function setState(patch, reason = 'setState') {
    state = { ...state, ...patch, version: APP_VERSION };
    emitChange(reason);
  }

  function setPhase(phase, payload = {}) {
    if (!Object.values(GAME_PHASE).includes(phase)) throw new Error(`알 수 없는 게임 상태: ${phase}`);
    state = {
      ...state,
      version: APP_VERSION,
      phase,
      phaseStartedAt: now(),
      fishing: { ...state.fishing, ...(payload.fishing || {}) },
    };
    emitter.emit('phase', { phase, state: snapshot(), ...payload });
    emitChange(`phase:${phase}`, payload);
  }

  function updateFishing(patch, reason = 'fishing') {
    state = { ...state, fishing: { ...state.fishing, ...patch } };
    emitter.emit('fishing', { state: snapshot(), patch });
    emitChange(reason);
  }

  function addFish(fish = {}) {
    const iconSeed = Math.random();
    const item = {
      id: fish.id || `fish-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: fish.name || '통통 물고기',
      icon: fish.icon || pickFishIcon(iconSeed),
      rarity: Number(fish.rarity || 1),
      value: Number(fish.value || Math.round(60 + iconSeed * 180)),
      caughtAt: Date.now(),
    };
    state = {
      ...state,
      inventory: [item, ...state.inventory].slice(0, 120),
      caught: [item, ...state.caught].slice(0, 300),
      fishing: { ...state.fishing, lastResult: item },
    };
    emitter.emit('inventory:add', { item, state: snapshot() });
    emitChange('inventory:add', { item });
    return item;
  }

  function clearResult() {
    updateFishing({ lastResult: null, progress: 0, safeSeconds: 0, tension: 50, combo: 0, lastJudge: '' }, 'result:clear');
  }

  function addGold(amount = 0, reason = 'gold:add') {
    const gold = Math.max(0, Number(state.player.gold || 0) + Math.round(Number(amount || 0)));
    state = { ...state, player: { ...state.player, gold } };
    emitter.emit('wallet', { amount: Math.round(Number(amount || 0)), gold, state: snapshot(), reason });
    emitChange(reason, { gold });
    return gold;
  }

  function removeFishById(id) {
    const before = state.inventory.length;
    state = { ...state, inventory: state.inventory.filter((item) => item.id !== id) };
    if (state.inventory.length !== before) emitChange('inventory:remove', { id });
    return before !== state.inventory.length;
  }

  function sellFish(id) {
    const item = state.inventory.find((fish) => fish.id === id);
    if (!item) return null;
    removeFishById(id);
    const earned = Math.max(1, Math.round(Number(item.value || 80)));
    addGold(earned, 'shop:sellFish');
    emitter.emit('shop:sell', { item, earned, state: snapshot() });
    save();
    return { item, earned };
  }

  function buyShopItem(item = {}) {
    const price = Math.max(0, Math.round(Number(item.price || 0)));
    if (Number(state.player.gold || 0) < price) {
      emitter.emit('shop:denied', { item, state: snapshot(), reason: 'not-enough-gold' });
      return false;
    }
    const owned = new Set(state.shop.owned || []);
    owned.add(item.id || item.name || `shop-${Date.now()}`);
    state = {
      ...state,
      player: { ...state.player, gold: Math.max(0, Number(state.player.gold || 0) - price) },
      shop: { ...state.shop, owned: [...owned], lastPurchase: { ...item, boughtAt: Date.now() } },
    };
    emitter.emit('shop:buy', { item, state: snapshot() });
    emitChange('shop:buy', { item });
    save();
    return true;
  }

  function save() {
    if (typeof localStorage === 'undefined') return;
    const data = snapshot();
    for (const key of ['aqua_v5.4', 'aqua_v5.3', 'aqua_latest_state']) {
      try { localStorage.setItem(key, JSON.stringify(data)); } catch (error) { console.warn('[AquaState] 저장 실패', key, error); }
    }
  }

  return {
    on: emitter.on.bind(emitter),
    off: emitter.off.bind(emitter),
    emit: emitter.emit.bind(emitter),
    getState: snapshot,
    setState,
    setPhase,
    updateFishing,
    addFish,
    clearResult,
    addGold,
    removeFishById,
    sellFish,
    buyShopItem,
    save,
  };
})();

export const gameStore = aquaStore;
export function subscribe(type, listener) { return aquaStore.on(type, listener); }
export function setPhase(phase, payload) { return aquaStore.setPhase(phase, payload); }
export function dispatch(type, payload) { return aquaStore.emit(type, payload); }
