// Aqua Fantasia v5.5.2 Runtime & CI Hotfix Guard
// ------------------------------------------------------------
// 목적:
// 1) v5.5.1 실행 오류 핫픽스가 실제로 올라왔는지 감시합니다.
// 2) 브라우저/SW가 오래된 v5.5.0~v5.5.1 모듈을 물고 있으면 캐시 정리와 재시작 안내를 제공합니다.
// 3) GitHub Actions Node 24 마이그레이션 패치가 적용된 빌드임을 런타임/검증 도구가 확인할 수 있게 합니다.

const VERSION = '5.5.2-runtime-ci-hotfix';
const CACHE_KEEP_PREFIX = 'aqua-fantasia-v5.6.0-background-art-20260612';
const BOOT_KEY = 'aqua_v5.5.2_runtime_ci_hotfix_boot';
const state = {
  booted: false,
  errors: [],
  lastBannerAt: 0,
};

function ready(fn) {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
  else fn();
}

function now() { return typeof performance !== 'undefined' ? performance.now() : Date.now(); }
function byId(id) { return document.getElementById(id); }

function ensureStyle() {
  if (byId('aqua-v552-style')) return;
  const style = document.createElement('style');
  style.id = 'aqua-v552-style';
  style.textContent = `
    .aqua-v552-runtime-badge{position:fixed;right:10px;bottom:calc(10px + env(safe-area-inset-bottom,0px));z-index:9997;display:none;border-radius:999px;padding:7px 10px;background:rgba(2,8,23,.72);border:1px solid rgba(103,232,249,.22);color:#cffafe;font-size:10px;font-weight:1000;letter-spacing:.04em;pointer-events:none;backdrop-filter:blur(10px)}
    body.aqua-v552-ready .aqua-v552-runtime-badge{display:block;opacity:.72}
    .aqua-v552-error-card{position:fixed;left:12px;right:12px;top:calc(12px + env(safe-area-inset-top,0px));z-index:10000;display:none;justify-content:center;pointer-events:none}.aqua-v552-error-card.open{display:flex}.aqua-v552-error-card>div{width:min(440px,100%);border-radius:22px;padding:13px;background:linear-gradient(180deg,rgba(67,20,7,.92),rgba(2,8,23,.94));border:1px solid rgba(255,247,173,.24);box-shadow:0 18px 44px rgba(0,0,0,.38);pointer-events:auto}.aqua-v552-error-card b{display:block;color:#fff7ad;font-size:13px}.aqua-v552-error-card span{display:block;margin-top:4px;color:rgba(255,237,213,.84);font-size:11px;font-weight:850;line-height:1.35}.aqua-v552-error-card button{margin-top:9px;border:0;border-radius:999px;padding:9px 12px;background:linear-gradient(180deg,#fff7ad,#67e8f9);color:#082f49;font-size:12px;font-weight:1000}
  `;
  document.head.appendChild(style);
}

function ensureBadge() {
  if (byId('aqua-v552-badge')) return;
  const badge = document.createElement('div');
  badge.id = 'aqua-v552-badge';
  badge.className = 'aqua-v552-runtime-badge';
  badge.textContent = 'v5.5.2 Node24 OK';
  document.body.appendChild(badge);
}

function ensureErrorCard() {
  let root = byId('aqua-v552-error-card');
  if (root) return root;
  root = document.createElement('div');
  root.id = 'aqua-v552-error-card';
  root.className = 'aqua-v552-error-card';
  root.innerHTML = `<div><b>실행 오류 복구 준비됨</b><span>이전 Service Worker 캐시 또는 레거시 낚시 이벤트가 남아 있으면 캐시를 비운 뒤 새 런타임으로 다시 시작합니다.</span><button type="button">캐시 정리 후 새로고침</button></div>`;
  root.querySelector('button')?.addEventListener('click', () => clearCaches(true));
  document.body.appendChild(root);
  return root;
}

function showErrorCard(message = '') {
  if (window.AquaV555AutoCache?.handleLegacyRecovery) {
    window.AquaV555AutoCache.handleLegacyRecovery(message || 'v5.5.2 runtime guard', { reload: /maximum call stack|too much recursion|recursion|module|import|service worker|cache/i.test(String(message)), silent: true });
    return;
  }
  const t = now();
  if (t - state.lastBannerAt < 1200) return;
  state.lastBannerAt = t;
  const root = ensureErrorCard();
  const span = root.querySelector('span');
  if (span && message) span.textContent = `감지된 오류: ${message.slice(0, 180)}. 캐시를 비우고 새 런타임으로 재시작하세요.`;
  root.classList.add('open');
  setTimeout(() => root.classList.remove('open'), 2200);
}


async function clearCaches(forceReload = false) {
  try { localStorage.setItem(BOOT_KEY, VERSION); } catch (_) {}
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
    console.warn('[Aqua v5.5.2] cache cleanup skipped', error?.message || error);
  }
  if (forceReload) location.reload();
}

function captureRuntimeError(error) {
  const message = String(error?.message || error?.reason?.message || error?.reason || error || 'unknown runtime error');
  state.errors.push({ message, time: Date.now() });
  state.errors = state.errors.slice(-8);
  const likelyRuntime = /Aqua|castLine|hookFish|reelAction|Firebase|module|import|service worker|cache|Cannot read|undefined/i.test(message);
  if (likelyRuntime) showErrorCard(message);
}

function verifyHotfixStack() {
  const v551Ready = Boolean(window.AquaFantasiaV551?.guardedCast);
  const v55Ready = Boolean(window.AquaFantasiaV55?.cacheGuard);
  document.body.classList.toggle('aqua-v552-v551-ready', v551Ready);
  document.body.classList.toggle('aqua-v552-v55-ready', v55Ready);
  if (!v551Ready) {
    setTimeout(() => {
      if (!window.AquaFantasiaV551?.guardedCast) console.warn('[Aqua v5.5.2] v5.5.1 hotfix runtime not detected yet');
    }, 3500);
  }
}

function boot() {
  if (state.booted) return;
  state.booted = true;
  ensureStyle();
  ensureBadge();
  document.body.classList.add('aqua-v552-ready');
  window.addEventListener('error', captureRuntimeError);
  window.addEventListener('unhandledrejection', captureRuntimeError);
  window.addEventListener('aqua-firebase-error', (event) => captureRuntimeError(event?.detail || 'Firebase init error'));
  if (!window.AquaV555AutoCache) clearCaches(false);
  verifyHotfixStack();
  setInterval(verifyHotfixStack, 1600);
  window.AquaFantasiaV552 = { version: VERSION, cacheKeepPrefix: CACHE_KEEP_PREFIX, clearCaches, state };
  console.log(`[AquaFantasia] ${VERSION} ready`);
}

ready(boot);
