// Aqua Fantasia v5.5.4 Stack Guard + Single Actions Runtime Aid
// ------------------------------------------------------------
// 목적:
// 1) v5.1~v5.5 누적 런타임이 같은 전역 함수를 여러 번 감싸면서 생길 수 있는
//    Maximum call stack size exceeded 오류를 실행 전에 차단합니다.
// 2) 초기화 단계별로 오류를 격리해서 게임 전체 boot가 중단되지 않게 합니다.
// 3) 오래된 Service Worker 캐시가 v5.5.1/v5.5.2 스크립트를 섞어 물고 있을 때
//    복구 버튼을 제공합니다.

const VERSION = '5.5.4-stack-guard';
const CACHE_KEEP_PREFIX = 'aqua-fantasia-v5.5.5-auto-cache-sweep-20260612';
const state = {
  booted: false,
  stages: [],
  errors: [],
  activeStage: '',
  inCast: false,
  inHook: false,
  inReel: false,
};

function ready(fn) {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
  else fn();
}

function byId(id) { return document.getElementById(id); }
function messageOf(error) { return String(error?.message || error?.reason?.message || error?.reason || error || 'unknown'); }
function isStackError(error) { return /maximum call stack|too much recursion|recursion/i.test(messageOf(error)); }

function ensureStyle() {
  if (byId('aqua-v554-style')) return;
  const style = document.createElement('style');
  style.id = 'aqua-v554-style';
  style.textContent = `
    body.aqua-v554-stack-safe #aqua-v552-badge::after{content:' · STACK SAFE'}
    .aqua-v554-recovery{position:fixed;left:12px;right:12px;top:calc(12px + env(safe-area-inset-top,0px));z-index:10005;display:none;justify-content:center;pointer-events:none}.aqua-v554-recovery.open{display:flex}.aqua-v554-recovery>div{width:min(460px,100%);border-radius:22px;padding:13px;background:linear-gradient(180deg,rgba(8,47,73,.94),rgba(2,8,23,.96));border:1px solid rgba(103,232,249,.28);box-shadow:0 20px 48px rgba(0,0,0,.42);color:#e0f2fe;pointer-events:auto}.aqua-v554-recovery b{display:block;color:#fff7ad;font-size:13px}.aqua-v554-recovery span{display:block;margin-top:4px;font-size:11px;font-weight:850;line-height:1.4;color:rgba(224,242,254,.82)}.aqua-v554-recovery button{margin-top:9px;border:0;border-radius:999px;padding:9px 12px;background:linear-gradient(180deg,#fff7ad,#67e8f9);color:#082f49;font-size:12px;font-weight:1000}
  `;
  document.head.appendChild(style);
}

function ensureRecoveryCard() {
  let root = byId('aqua-v554-recovery');
  if (root) return root;
  root = document.createElement('div');
  root.id = 'aqua-v554-recovery';
  root.className = 'aqua-v554-recovery';
  root.innerHTML = `<div><b>스택 오류 복구 모드</b><span>누적 런타임 또는 이전 PWA 캐시가 충돌해 재귀 호출이 감지되었습니다. 캐시를 비우고 최신 런타임으로 다시 시작하세요.</span><button type="button">캐시 정리 후 새로고침</button></div>`;
  root.querySelector('button')?.addEventListener('click', () => clearCaches(true));
  document.body.appendChild(root);
  return root;
}

function showRecovery(error, stage = '') {
  if (window.AquaV555AutoCache?.handleLegacyRecovery) {
    window.AquaV555AutoCache.handleLegacyRecovery(`${stage || state.activeStage || 'runtime'}: ${messageOf(error)}`, { reload: true, silent: true });
    return;
  }
  ensureStyle();
  const root = ensureRecoveryCard();
  const span = root.querySelector('span');
  if (span) span.textContent = `감지 위치: ${stage || state.activeStage || 'runtime'} · ${messageOf(error).slice(0, 160)}. 캐시 정리 후 새로고침하면 최신 스크립트만 다시 로드합니다.`;
  root.classList.add('open');
  setTimeout(() => root.classList.remove('open'), 2200);
}


async function clearCaches(forceReload = false) {
  try { localStorage.setItem('aqua_v5.5.4_stack_guard_boot', VERSION); } catch (_) {}
  try { navigator.serviceWorker?.controller?.postMessage?.({ type: 'AQUA_CLEAR_RUNTIME_CACHE', keepPrefix: CACHE_KEEP_PREFIX }); } catch (_) {}
  try {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys
        .filter((key) => key.startsWith('aqua-fantasia-') && !key.startsWith(CACHE_KEEP_PREFIX))
        .map((key) => caches.delete(key)));
    }
    const reg = await navigator.serviceWorker?.getRegistration?.();
    await reg?.update?.();
  } catch (error) {
    console.warn('[Aqua v5.5.4] cache cleanup skipped', messageOf(error));
  }
  if (forceReload) location.reload();
}

function runStage(label, fn, options = {}) {
  const entry = { label, ok: false, skipped: false, time: Date.now() };
  state.activeStage = label;
  try {
    const result = typeof fn === 'function' ? fn() : undefined;
    entry.ok = true;
    state.stages.push(entry);
    return result;
  } catch (error) {
    const msg = messageOf(error);
    entry.error = msg;
    state.errors.push({ label, message: msg, time: Date.now() });
    state.errors = state.errors.slice(-12);
    state.stages.push(entry);
    console.warn(`[Aqua v5.5.4] boot stage skipped: ${label}`, error);
    if (isStackError(error)) {
      document.body.classList.add('aqua-v554-stack-safe', 'perf-lite');
      try { localStorage.setItem('aqua_v5.5.4_last_stack_stage', label); } catch (_) {}
      showRecovery(error, label);
      return undefined;
    }
    if (options?.rethrow) throw error;
    return undefined;
  } finally {
    state.activeStage = '';
  }
}

function safeProxy(name, original, impl) {
  if (typeof original !== 'function') return original;
  if (original.__aquaV554SafeProxy === true) return original;
  const proxy = function aquaV554SafeProxy(...args) {
    const key = name === 'castLine' ? 'inCast' : name === 'hookFishFromTarget' ? 'inHook' : name === 'reelAction' ? 'inReel' : '';
    if (key && state[key]) {
      console.warn(`[Aqua v5.5.4] recursive ${name} call blocked`);
      return undefined;
    }
    if (key) state[key] = true;
    try { return impl.call(this, original, args); }
    catch (error) {
      if (isStackError(error)) { showRecovery(error, name); return undefined; }
      throw error;
    } finally {
      if (key) state[key] = false;
    }
  };
  proxy.__aquaV554SafeProxy = true;
  proxy.__aquaV554Original = original;
  return proxy;
}

function patchDangerousGlobals() {
  if (window.__aquaV554GlobalsPatched) return;
  window.__aquaV554GlobalsPatched = true;

  const rawCast = window.castLine;
  const rawHook = window.hookFishFromTarget;
  const rawReel = window.reelAction;

  if (typeof rawCast === 'function') {
    window.castLine = safeProxy('castLine', rawCast, function(original, args) {
      if (window.AquaFantasiaV53?.fishing?.startCast && !state.inCast) return original.apply(this, args);
      return original.apply(this, args);
    });
  }
  if (typeof rawHook === 'function') {
    window.hookFishFromTarget = safeProxy('hookFishFromTarget', rawHook, function(original, args) {
      return original.apply(this, args);
    });
  }
  if (typeof rawReel === 'function') {
    window.reelAction = safeProxy('reelAction', rawReel, function(original, args) {
      return original.apply(this, args);
    });
  }
}

function boot() {
  if (state.booted) return;
  state.booted = true;
  ensureStyle();
  document.body.classList.add('aqua-v554-stack-safe');
  patchDangerousGlobals();
  window.addEventListener('error', (event) => {
    const error = event.error || event.message;
    if (isStackError(error)) showRecovery(error, state.activeStage);
  });
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason || event;
    if (isStackError(error)) showRecovery(error, state.activeStage);
  });
  window.AquaV554StackGuard = { version: VERSION, runStage, clearCaches, patchDangerousGlobals, isStackError, state };
  console.log(`[AquaFantasia] ${VERSION} ready`);
}

ready(boot);
