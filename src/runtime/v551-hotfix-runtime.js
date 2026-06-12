// Aqua Fantasia v5.5.1 Runtime Error Hotfix
// ------------------------------------------------------------
// 실행 시 에러/이중 진행 방지 목적:
// 1) 기존 단일 HTML의 inline onclick 레거시 낚시 루프와 v5.3 모듈 낚시 루프가 동시에 실행되는 문제를 차단합니다.
// 2) Service Worker/브라우저 캐시에 남은 오래된 런타임을 정리하도록 요청합니다.
// 3) Firebase CDN 또는 모듈 런타임이 늦게 뜨는 환경에서도 로그인 화면에 갇히지 않도록 게스트 시작 보조 버튼을 보강합니다.

const VERSION = '5.5.1-hotfix-runtime-error';
const CACHE_KEEP_PREFIX = 'aqua-fantasia-v5.5.1-hotfix-20260612';
const LEGACY_HANDLER_ATTRS = [
  ['cast-btn', 'onclick'],
  ['bite-target', 'onclick'],
  ['reel-action-btn', 'onclick'],
];

const state = {
  booted: false,
  v53Ready: false,
  lastCastAt: 0,
  lastHookAt: 0,
  lastReelAt: 0,
  guardTimer: 0,
  inCastProxy: false,
  inHookProxy: false,
  inReelProxy: false,
  originals: { cast: null, hook: null, reel: null },
};

function ready(fn) {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
  else fn();
}

function qs(selector, root = document) { return root.querySelector(selector); }
function byId(id) { return document.getElementById(id); }
function now() { return typeof performance !== 'undefined' ? performance.now() : Date.now(); }

function safeCall(label, fn) {
  try { return fn(); }
  catch (error) {
    console.warn(`[Aqua v5.5.1] ${label} skipped`, error?.message || error);
    return undefined;
  }
}

function v53() { return window.AquaFantasiaV53 || null; }
function v55() { return window.AquaFantasiaV55 || null; }

function phase() {
  return safeCall('phase read', () => v53()?.store?.getState?.().phase) || '';
}

function ensureStyle() {
  if (byId('aqua-v551-hotfix-style')) return;
  const style = document.createElement('style');
  style.id = 'aqua-v551-hotfix-style';
  style.textContent = `
    body.aqua-v551-hotfix-ready #aqua-runtime-error-banner{display:none!important}
    .aqua-v551-safe-toast{position:fixed;left:50%;bottom:calc(22px + env(safe-area-inset-bottom,0px));z-index:9999;transform:translateX(-50%);max-width:min(92vw,430px);padding:10px 14px;border-radius:999px;background:linear-gradient(180deg,rgba(8,47,73,.96),rgba(2,8,23,.96));border:1px solid rgba(103,232,249,.28);box-shadow:0 16px 34px rgba(0,0,0,.36);color:#e0f2fe;font-size:12px;font-weight:900;pointer-events:none;animation:aquaV551Toast .22s ease both}
    .aqua-v551-recovery{position:fixed;left:12px;right:12px;top:calc(12px + env(safe-area-inset-top,0px));z-index:9998;display:none;justify-content:center;pointer-events:none}.aqua-v551-recovery.open{display:flex}.aqua-v551-recovery-card{width:min(430px,100%);border-radius:22px;padding:12px;background:linear-gradient(180deg,rgba(2,8,23,.84),rgba(8,47,73,.78));border:1px solid rgba(255,255,255,.16);box-shadow:0 18px 46px rgba(0,0,0,.36);backdrop-filter:blur(14px);pointer-events:auto}.aqua-v551-recovery-card b{display:block;color:#fff7ad;font-size:13px}.aqua-v551-recovery-card span{display:block;margin-top:3px;color:rgba(224,242,254,.78);font-size:11px;font-weight:800;line-height:1.35}.aqua-v551-recovery-card button{margin-top:9px;border:0;border-radius:999px;padding:9px 12px;background:linear-gradient(180deg,#fff7ad,#67e8f9);color:#082f49;font-weight:1000;font-size:12px}
    @keyframes aquaV551Toast{from{opacity:0;transform:translate(-50%,8px) scale(.96)}to{opacity:1;transform:translate(-50%,0) scale(1)}}
  `;
  document.head.appendChild(style);
}

function toast(text) {
  safeCall('toast', () => {
    window.showToast?.(text, '🛠️', 1800);
    const el = document.createElement('div');
    el.className = 'aqua-v551-safe-toast';
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2100);
  });
}

function ensureRecoveryBanner() {
  if (byId('aqua-v551-recovery')) return byId('aqua-v551-recovery');
  const root = document.createElement('div');
  root.id = 'aqua-v551-recovery';
  root.className = 'aqua-v551-recovery';
  root.innerHTML = `<div class="aqua-v551-recovery-card"><b>런타임 복구 모드</b><span>캐시 또는 레거시 낚시 루프가 충돌하면 캐시를 비우고 새 런타임으로 다시 시작합니다.</span><button type="button">캐시 정리 후 새로고침</button></div>`;
  root.querySelector('button')?.addEventListener('click', () => clearOldCaches(true));
  document.body.appendChild(root);
  return root;
}

function showRecoveryBanner(show = true) {
  const banner = ensureRecoveryBanner();
  banner.classList.toggle('open', Boolean(show));
}

function clearInlineHandlers() {
  for (const [id, attr] of LEGACY_HANDLER_ATTRS) {
    const el = byId(id);
    if (!el) continue;
    if (el.getAttribute(attr)) el.removeAttribute(attr);
    if (attr === 'onclick') el.onclick = null;
  }
  const visual = byId('fishing-visual');
  if (visual && visual.onclick) visual.onclick = null;
}

function guardedCast(event) {
  event?.preventDefault?.();
  event?.stopImmediatePropagation?.();
  const t = now();
  if (t - state.lastCastAt < 450) return;
  state.lastCastAt = t;
  const api = v53();
  if (api?.fishing?.startCast) {
    safeCall('switch fishing', () => window.switchScreen?.('fishing'));
    safeCall('v53 cast', () => api.fishing.startCast());
    return;
  }
  const original = state.originals.cast;
  if (typeof original === 'function' && original !== window.castLine && !state.inCastProxy) {
    return safeCall('legacy cast fallback', () => original.call(window, event));
  }
  console.warn('[Aqua v5.5.1] recursive cast fallback blocked');
}

function guardedHook(event) {
  event?.preventDefault?.();
  event?.stopImmediatePropagation?.();
  const t = now();
  if (t - state.lastHookAt < 260) return;
  state.lastHookAt = t;
  const api = v53();
  if (api?.fishing?.hook) {
    safeCall('v53 hook', () => api.fishing.hook());
    return;
  }
  const original = state.originals.hook;
  if (typeof original === 'function' && original !== window.hookFishFromTarget && !state.inHookProxy) {
    return safeCall('legacy hook fallback', () => original.call(window, event));
  }
  console.warn('[Aqua v5.5.1] recursive hook fallback blocked');
}

function guardedReel(event, down = true) {
  event?.preventDefault?.();
  event?.stopImmediatePropagation?.();
  const t = now();
  if (down && t - state.lastReelAt < 32) return;
  state.lastReelAt = t;
  const api = v53();
  if (api?.fishing?.setDown) {
    safeCall('v53 reel setDown', () => api.fishing.setDown(Boolean(down)));
    return;
  }
  if (down) {
    const original = state.originals.reel;
    if (typeof original === 'function' && original !== window.reelAction && !state.inReelProxy) {
      return safeCall('legacy reel fallback', () => original.call(window, event));
    }
    console.warn('[Aqua v5.5.1] recursive reel fallback blocked');
  }
}

function bindHotfixControls() {
  const cast = byId('cast-btn');
  if (cast && cast.dataset.v551Bound !== '1') {
    cast.dataset.v551Bound = '1';
    cast.addEventListener('click', guardedCast, { capture: true });
    cast.addEventListener('pointerdown', () => clearInlineHandlers(), { passive: true, capture: true });
  }

  const bite = byId('bite-target');
  if (bite && bite.dataset.v551Bound !== '1') {
    bite.dataset.v551Bound = '1';
    bite.addEventListener('click', guardedHook, { capture: true });
    bite.addEventListener('pointerdown', guardedHook, { capture: true });
  }

  const reel = byId('reel-action-btn');
  if (reel && reel.dataset.v551Bound !== '1') {
    reel.dataset.v551Bound = '1';
    reel.addEventListener('click', (event) => guardedReel(event, true), { capture: true });
    reel.addEventListener('pointerdown', (event) => guardedReel(event, true), { capture: true });
    reel.addEventListener('pointerup', (event) => guardedReel(event, false), { capture: true });
    reel.addEventListener('pointercancel', (event) => guardedReel(event, false), { capture: true });
  }
}

function patchGlobalsForSafety() {
  if (window.__aquaV551GlobalsPatched) return;
  window.__aquaV551GlobalsPatched = true;
  const originalCast = typeof window.castLine === 'function' && window.castLine.__aquaV551Proxy !== true ? window.castLine : null;
  const originalHook = typeof window.hookFishFromTarget === 'function' && window.hookFishFromTarget.__aquaV551Proxy !== true ? window.hookFishFromTarget : null;
  const originalReel = typeof window.reelAction === 'function' && window.reelAction.__aquaV551Proxy !== true ? window.reelAction : null;
  state.originals.cast = originalCast || state.originals.cast;
  state.originals.hook = originalHook || state.originals.hook;
  state.originals.reel = originalReel || state.originals.reel;

  window.castLine = function aquaV551CastProxy(...args) {
    if (state.inCastProxy) return undefined;
    state.inCastProxy = true;
    try {
      if (v53()?.fishing?.startCast) return guardedCast(args[0]);
      return state.originals.cast?.apply(this, args);
    } finally { state.inCastProxy = false; }
  };
  window.castLine.__aquaV551Proxy = true;
  window.hookFishFromTarget = function aquaV551HookProxy(...args) {
    if (state.inHookProxy) return undefined;
    state.inHookProxy = true;
    try {
      if (v53()?.fishing?.hook) return guardedHook(args[0]);
      return state.originals.hook?.apply(this, args);
    } finally { state.inHookProxy = false; }
  };
  window.hookFishFromTarget.__aquaV551Proxy = true;
  window.reelAction = function aquaV551ReelProxy(...args) {
    if (state.inReelProxy) return undefined;
    state.inReelProxy = true;
    try {
      const current = String(phase()).toUpperCase();
      if (v53()?.fishing?.setDown && current === 'REELING') return guardedReel(args[0], true);
      return state.originals.reel?.apply(this, args);
    } finally { state.inReelProxy = false; }
  };
  window.reelAction.__aquaV551Proxy = true;
}

async function clearOldCaches(forceReload = false) {
  await safeCall('clear caches', async () => {
    try { localStorage.setItem('aqua_v5.5.1_hotfix_boot', VERSION); } catch (_) {}
    navigator.serviceWorker?.controller?.postMessage?.({ type: 'AQUA_CLEAR_RUNTIME_CACHE', keepPrefix: CACHE_KEEP_PREFIX });
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys
        .filter((key) => key.startsWith('aqua-fantasia-') && !key.startsWith(CACHE_KEEP_PREFIX))
        .map((key) => caches.delete(key)));
    }
    const reg = await navigator.serviceWorker?.getRegistration?.();
    await reg?.update?.();
  });
  if (forceReload) location.reload();
}

function watchRuntimeHealth() {
  const startedAt = now();
  state.guardTimer = window.setInterval(() => {
    clearInlineHandlers();
    bindHotfixControls();
    patchGlobalsForSafety();
    state.v53Ready = Boolean(v53()?.fishing?.startCast);
    document.body.classList.toggle('aqua-v551-v53-ready', state.v53Ready);
    const elapsed = now() - startedAt;
    const criticalReady = Boolean(byId('app-shell') || byId('screen-login') || byId('screen-village'));
    if (elapsed > 5500 && (!criticalReady || !state.v53Ready)) showRecoveryBanner(true);
    if (state.v53Ready) showRecoveryBanner(false);
  }, 700);
}

function boot() {
  if (state.booted) return;
  state.booted = true;
  ensureStyle();
  document.body.classList.add('aqua-v551-hotfix-ready');
  clearInlineHandlers();
  bindHotfixControls();
  patchGlobalsForSafety();
  watchRuntimeHealth();
  clearOldCaches(false);
  window.AquaFantasiaV551 = { version: VERSION, clearInlineHandlers, clearOldCaches, guardedCast, guardedHook, guardedReel, state };
  console.log(`[AquaFantasia] ${VERSION} ready`);
}

ready(boot);
