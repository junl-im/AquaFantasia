// Aqua Fantasia v5.2 Casual Refactor - 전역 상태 관리
// ------------------------------------------------------
// 목적:
// 1) Runtime(Pixi 렌더러), System(낚시/인벤토리), UI가 같은 상태 이벤트를 구독하도록 통합합니다.
// 2) 낚시 진행 상태를 READY → CASTING → WAITING → BITE → REELING → CATCH/FAIL 로 세분화합니다.
// 3) 기존 index.html 단일 런타임과도 충돌하지 않도록 작은 이벤트 스토어 형태로 설계했습니다.

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
  background: 'assets/art/v363_painterly_ocean.png',
  ripple: 'assets/ui-kit/icons/water_ripple.png',
  bobber: 'assets/ui-kit/fishing_minigame/bobber_large.png',
  reelBar: 'assets/ui-kit/fishing_minigame/reel_bar_220px.png',
  tensionGauge: 'assets/ui-kit/icons/tension_gauge.png',
  panel: 'assets/ui-kit/panels/panel_1.png',
  fishIcons: [
    'assets/ui-kit/icons/fish_1.png',
    'assets/ui-kit/icons/fish_2.png',
    'assets/ui-kit/icons/fish_3.png',
    'assets/ui-kit/icons/fish_4.png',
    'assets/ui-kit/icons/fish_5.png',
    'assets/ui-kit/icons/fish_6.png',
  ],
});

export const SAVE_KEYS = ['aqua_v5.2', 'aqua_v5.1', 'aqua_v5.0', 'aqua_v4.9', 'aqua_latest_state'];

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

export function lerp(from, to, amount) {
  return from + (to - from) * clamp(amount, 0, 1);
}

export function now() {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
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

function createDefaultState() {
  const saved = loadSavedState() || {};
  return {
    version: '5.2.0',
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
      lastResult: null,
      bitePosition: { x: 0.5, y: 0.48 },
      message: '낚싯대 던지기',
      difficulty: 'normal',
    },
    inventory: Array.isArray(saved.inventory) ? saved.inventory : [],
    caught: Array.isArray(saved.caught) ? saved.caught : [],
    settings: {
      motion: saved?.settings?.motion || 'balanced',
      performance: saved?.settings?.performance || 'auto',
      haptic: saved?.settings?.haptic !== false,
      guide: saved?.settings?.guide || 'standard',
    },
  };
}

export const aquaStore = (() => {
  const emitter = createEmitter();
  let state = createDefaultState();

  function snapshot() {
    return structuredClone ? structuredClone(state) : JSON.parse(JSON.stringify(state));
  }

  function emitChange(reason, extra = {}) {
    emitter.emit('change', { reason, state: snapshot(), ...extra });
  }

  function setState(patch, reason = 'setState') {
    state = { ...state, ...patch };
    emitChange(reason);
  }

  function setPhase(phase, payload = {}) {
    if (!Object.values(GAME_PHASE).includes(phase)) throw new Error(`알 수 없는 게임 상태: ${phase}`);
    state = {
      ...state,
      phase,
      phaseStartedAt: now(),
      fishing: { ...state.fishing, ...payload.fishing },
    };
    emitter.emit('phase', { phase, state: snapshot(), ...payload });
    emitChange(`phase:${phase}`, payload);
  }

  function updateFishing(patch, reason = 'fishing') {
    state = { ...state, fishing: { ...state.fishing, ...patch } };
    emitter.emit('fishing', { state: snapshot(), patch });
    emitChange(reason);
  }

  function addFish(fish) {
    const item = {
      id: fish?.id || `fish-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: fish?.name || '환상의 물고기',
      icon: fish?.icon || ASSETS.fishIcons[Math.floor(Math.random() * ASSETS.fishIcons.length)],
      rarity: Number(fish?.rarity || 1),
      value: Number(fish?.value || 100),
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
    updateFishing({ lastResult: null, progress: 0, safeSeconds: 0, tension: 50, combo: 0 }, 'result:clear');
  }

  function save() {
    if (typeof localStorage === 'undefined') return;
    const data = snapshot();
    for (const key of ['aqua_v5.2', 'aqua_latest_state']) {
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
    save,
  };
})();

// 기존 함수명과의 느슨한 호환용 별칭입니다.
export const gameStore = aquaStore;
export function subscribe(type, listener) { return aquaStore.on(type, listener); }
export function setPhase(phase, payload) { return aquaStore.setPhase(phase, payload); }
export function dispatch(type, payload) { return aquaStore.emit(type, payload); }
