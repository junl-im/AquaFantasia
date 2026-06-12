// Aqua Fantasia v5.5.5 Auto Cache Sweep + Silent Recovery
// ------------------------------------------------------------
// 목적:
// 1) 배포 버전이 바뀌면 사용자가 버튼을 누르지 않아도 오래된 PWA/Service Worker 캐시를 정리합니다.
// 2) 정상 업데이트 과정에서는 "캐시 정리 후 새로고침" 팝업을 계속 띄우지 않습니다.
// 3) 스택 오류/구버전 캐시 충돌이 감지되면 1회 자동 새로고침으로 복구합니다. Maximum call stack recovery marker.

(function aquaV555AutoCacheSweep() {
  const VERSION = '5.5.5-auto-cache-sweep';
  const CACHE_KEEP_PREFIX = 'aqua-fantasia-v5.5.5-auto-cache-sweep-20260612';
  const BUILD_KEY = 'aqua_runtime_build_version';
  const RELOAD_KEY = 'aqua_v555_reload_once';
  const CLEANED_KEY = 'aqua_v555_last_cleaned';
  const LEGACY_CARD_IDS = ['aqua-v552-error-card', 'aqua-v554-recovery', 'aqua-v555-cache-card'];
  const OLD_CACHE_PATTERN = /^(aqua-fantasia-|workbox-|vite-|precache-)/i;
  const STACK_PATTERN = /maximum call stack|too much recursion|recursion/i;
  const state = {
    version: VERSION,
    keepPrefix: CACHE_KEEP_PREFIX,
    startedAt: Date.now(),
    changedBuild: false,
    cleaned: false,
    reloadScheduled: false,
    deletedKeys: [],
    errors: [],
    lastRecoveryReason: '',
  };

  function safe(fn, fallback) {
    try { return fn(); } catch (error) { state.errors.push(String(error?.message || error)); return fallback; }
  }

  function readyBody(fn) {
    if (document.body) return fn();
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  }

  function hideLegacyCards() {
    readyBody(() => {
      for (const id of LEGACY_CARD_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        el.classList.remove('open');
        el.setAttribute('aria-hidden', 'true');
        el.style.display = 'none';
      }
    });
  }

  function ensureStyle() {
    if (document.getElementById('aqua-v555-style')) return;
    const style = document.createElement('style');
    style.id = 'aqua-v555-style';
    style.textContent = '.aqua-v555-cache-card{position:fixed;left:12px;right:12px;top:calc(12px + env(safe-area-inset-top,0px));z-index:10020;display:none;justify-content:center;pointer-events:none}.aqua-v555-cache-card.open{display:flex}.aqua-v555-cache-card>div{width:min(450px,100%);border-radius:22px;padding:12px;background:linear-gradient(180deg,rgba(2,132,199,.94),rgba(2,8,23,.96));border:1px solid rgba(186,230,253,.32);box-shadow:0 20px 48px rgba(0,0,0,.42);color:#e0f2fe;pointer-events:auto}.aqua-v555-cache-card b{display:block;color:#fff7ad;font-size:13px}.aqua-v555-cache-card span{display:block;margin-top:4px;font-size:11px;font-weight:850;line-height:1.4;color:rgba(224,242,254,.86)}.aqua-v555-cache-card button{margin-top:9px;border:0;border-radius:999px;padding:9px 12px;background:linear-gradient(180deg,#fff7ad,#67e8f9);color:#082f49;font-size:12px;font-weight:1000}.aqua-v555-cache-sweeping::before{content:"";position:fixed;inset:0;z-index:1;pointer-events:none;background:radial-gradient(circle at 50% 0%,rgba(103,232,249,.08),transparent 36%)}body.aqua-v555-silent-cache #aqua-v552-error-card,body.aqua-v555-silent-cache #aqua-v554-recovery{display:none!important}';
    document.head.appendChild(style);
  }

  function ensureCard() {
    ensureStyle();
    let root = document.getElementById('aqua-v555-cache-card');
    if (root) return root;
    root = document.createElement('div');
    root.id = 'aqua-v555-cache-card';
    root.className = 'aqua-v555-cache-card';
    root.innerHTML = '<div><b>최신 런타임으로 자동 복구 중</b><span>이전 PWA 캐시를 정리하고 있습니다.</span><button type="button">지금 새로고침</button></div>';
    root.querySelector('button')?.addEventListener('click', () => reloadOnce('manual'));
    document.body.appendChild(root);
    return root;
  }

  function showCard(message, options = {}) {
    if (options.silent) return;
    readyBody(() => {
      const root = ensureCard();
      const span = root.querySelector('span');
      if (span) span.textContent = message;
      root.style.display = '';
      root.removeAttribute('aria-hidden');
      root.classList.add('open');
      if (!options.sticky) setTimeout(hideCard, options.ms || 1600);
    });
  }

  function hideCard() {
    const root = document.getElementById('aqua-v555-cache-card');
    if (!root) return;
    root.classList.remove('open');
    root.setAttribute('aria-hidden', 'true');
    root.style.display = 'none';
  }

  function reloadOnce(reason) {
    const flag = `${VERSION}:${reason}`;
    const old = safe(() => sessionStorage.getItem(RELOAD_KEY), '');
    if (old === flag || state.reloadScheduled) return false;
    state.reloadScheduled = true;
    safe(() => sessionStorage.setItem(RELOAD_KEY, flag));
    const url = new URL(location.href);
    url.searchParams.set('aquaCache', 'v555');
    url.searchParams.set('t', String(Date.now()));
    setTimeout(() => location.replace(url.toString()), 80);
    return true;
  }

  async function updateServiceWorker() {
    try {
      const registration = await navigator.serviceWorker?.getRegistration?.();
      if (registration?.waiting) registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      await registration?.update?.();
      return registration || null;
    } catch (error) {
      state.errors.push(String(error?.message || error));
      return null;
    }
  }

  async function sweepCaches(options = {}) {
    hideLegacyCards();
    safe(() => document.documentElement.classList.add('aqua-v555-cache-sweeping'));
    const deleted = [];
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(async (key) => {
          const shouldDelete = OLD_CACHE_PATTERN.test(key) && !key.startsWith(CACHE_KEEP_PREFIX);
          if (!shouldDelete) return;
          const ok = await caches.delete(key);
          if (ok) deleted.push(key);
        }));
      }
      state.deletedKeys = deleted;
      state.cleaned = true;
      safe(() => localStorage.setItem(CLEANED_KEY, JSON.stringify({ version: VERSION, at: Date.now(), deleted })));
      try { navigator.serviceWorker?.controller?.postMessage?.({ type: 'AQUA_FORCE_CACHE_SWEEP', keepPrefix: CACHE_KEEP_PREFIX, version: VERSION }); } catch (_) {}
      await updateServiceWorker();
      if (options.reload && deleted.length > 0) reloadOnce(options.reason || 'cache-change');
      return deleted;
    } catch (error) {
      state.errors.push(String(error?.message || error));
      if (options.reload) reloadOnce('cache-error');
      else showCard(`자동 캐시 정리 중 문제가 있었습니다: ${String(error?.message || error).slice(0, 120)}.`, { sticky: false, ms: 2200 });
      return deleted;
    } finally {
      safe(() => document.documentElement.classList.remove('aqua-v555-cache-sweeping'));
      if (!state.reloadScheduled) hideCard();
      hideLegacyCards();
    }
  }

  function patchAlertForStackRecovery() {
    if (window.__aquaV555AlertPatched) return;
    window.__aquaV555AlertPatched = true;
    const originalAlert = window.alert;
    window.alert = function aquaV555AlertProxy(message) {
      const text = String(message || '');
      if (STACK_PATTERN.test(text) || /게임 초기화 중 오류/.test(text) || /캐시 정리 후 새로고침/.test(text)) {
        handleLegacyRecovery(text || 'alert-runtime-error', { reload: true, silent: true });
        return undefined;
      }
      return originalAlert.call(window, message);
    };
    window.alert.__aquaV555Original = originalAlert;
  }

  function patchGlobalErrorRecovery() {
    if (window.__aquaV555ErrorPatched) return;
    window.__aquaV555ErrorPatched = true;
    const onError = (event) => {
      const message = String(event?.error?.message || event?.message || event?.reason?.message || event?.reason || '');
      if (!STACK_PATTERN.test(message)) return;
      event?.preventDefault?.();
      handleLegacyRecovery(message, { reload: true, silent: true });
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onError);
  }

  function detectBuildChange() {
    const previous = safe(() => localStorage.getItem(BUILD_KEY), '');
    state.changedBuild = previous !== VERSION;
    safe(() => localStorage.setItem(BUILD_KEY, VERSION));
    return state.changedBuild;
  }

  function handleLegacyRecovery(reason = 'legacy-runtime', options = {}) {
    state.lastRecoveryReason = String(reason).slice(0, 220);
    hideLegacyCards();
    const silent = options.silent !== false;
    if (!silent) showCard('이전 캐시 충돌이 감지되어 자동 복구합니다. 저장 데이터는 유지됩니다.', { sticky: false, ms: 1400 });
    return sweepCaches({ reload: options.reload !== false, reason: 'runtime-recovery' });
  }

  function boot() {
    readyBody(() => {
      ensureStyle();
      document.body.classList.add('aqua-v555-silent-cache');
      hideLegacyCards();
      setInterval(hideLegacyCards, 1800);
    });
    patchAlertForStackRecovery();
    patchGlobalErrorRecovery();
    const changed = detectBuildChange();
    const ready = (async () => {
      if (changed) {
        await sweepCaches({ reload: true, reason: 'build-change', silent: true });
      } else {
        await sweepCaches({ reload: false, silent: true });
      }
      hideLegacyCards();
      return state;
    })();
    window.AquaV555AutoCache.ready = ready;
  }

  window.AquaV555AutoCache = {
    version: VERSION,
    keepPrefix: CACHE_KEEP_PREFIX,
    state,
    ready: Promise.resolve(state),
    sweepCaches,
    reloadOnce,
    hideLegacyCards,
    handleLegacyRecovery,
    clearAllAquaCaches: () => sweepCaches({ reload: true, reason: 'manual-clear' }),
  };

  boot();
})();
