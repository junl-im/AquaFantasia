// Aqua Fantasia v5.5 Mobile Feel & Cache Guard Runtime
// ------------------------------------------------------------
// 목적:
// 1) 입질 시 화면 어디를 눌러도 챔질되는 모바일 친화 조작을 추가합니다.
// 2) 릴링 중 수면을 길게 누르면 감기고 손을 떼면 자동으로 줄을 푸는 자연스러운 조작감을 제공합니다.
// 3) v49/v53/v54 UI가 겹치지 않도록 낚시 화면 전용 레이어 우선순위를 정리합니다.
// 4) FPS/Save-Data/저사양 조건을 감지해 이펙트와 캐시를 자동 경량화합니다.

import { GAME_PHASE, aquaStore, clamp, now } from '../core/state.js';

const VERSION = '5.5.0-mobile-feel';
const CACHE_KEEP_PREFIX = 'aqua-fantasia-v5.6.0-background-art-20260612';
const SAVE_MARK = 'aqua_v5.5_mobile_feel_boot';
const SELECTOR = {
  fishingVisual: '#fishing-visual',
  stageGuide: '#fishing-stage-guide',
  cast: '#cast-btn',
  reelGame: '#reel-game',
  reelButton: '#reel-action-btn',
};

const runtime = {
  booted: false,
  lowEnd: false,
  compact: false,
  holding: false,
  lastPointerAt: 0,
  lastHookAt: 0,
  lastGuardAt: 0,
  frames: 0,
  fps: 60,
  fpsSamples: [],
  lastFrame: 0,
  raf: 0,
};

function ready(fn) {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
  else fn();
}

function qs(selector, root = document) { return root.querySelector(selector); }

function vibrate(pattern) {
  try { if (aquaStore.getState().settings?.haptic !== false) navigator.vibrate?.(pattern); } catch (_) {}
}

function isFishingScreen() {
  return document.body?.dataset?.screen === 'fishing' || !qs('#screen-fishing')?.classList.contains('hidden');
}

function detectLowEnd() {
  const nav = navigator || {};
  const memory = Number(nav.deviceMemory || 4);
  const cores = Number(nav.hardwareConcurrency || 6);
  const saveData = Boolean(nav.connection?.saveData);
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  const narrow = Math.min(window.innerWidth || 430, window.innerHeight || 800) <= 380;
  return saveData || reduced || memory <= 3 || cores <= 4 || (narrow && memory <= 4);
}

function phaseText(phase, fishing) {
  const tension = Math.round(clamp(fishing?.tension || 0, 0, 100));
  const progress = Math.round(clamp(fishing?.progress || 0, 0, 100));
  if (phase === GAME_PHASE.CASTING) return ['CAST ARC', '찌가 날아가는 중', '수면에 닿으면 입질을 기다려요.'];
  if (phase === GAME_PHASE.WAITING) return ['WAIT', '입질 대기', '물결이 튀면 화면을 바로 터치하세요.'];
  if (phase === GAME_PHASE.BITE) return ['BITE!', '지금 터치', '작은 원을 놓쳐도 화면 어디든 누르면 챔질됩니다.'];
  if (phase === GAME_PHASE.REELING) {
    const guide = tension > 72 ? '높아요. 손을 떼고 살짝 풀기!' : tension < 28 ? '낮아요. 꾹 눌러 감기!' : '좋아요. 30~70 안전지대 유지!';
    return [`${progress}%`, '릴링 중', guide];
  }
  if (phase === GAME_PHASE.CATCH) return ['CATCH', '포획 성공', '결과창에서 보관/판매/재도전이 가능합니다.'];
  if (phase === GAME_PHASE.FAIL) return ['MISS', '줄 정비', '다시 던져 리듬을 잡아봐요.'];
  return ['READY', '낚싯대 던지기', '큰 버튼을 눌러 시작하세요.'];
}

function ensureStyle() {
  if (document.getElementById('aqua-mobile-feel-v55-style')) return;
  const style = document.createElement('style');
  style.id = 'aqua-mobile-feel-v55-style';
  style.textContent = `
    body.aqua-v55-ready{--v55-bottom:calc(12px + env(safe-area-inset-bottom,0px));--v55-card:rgba(2,8,23,.66);--v55-line:rgba(255,255,255,.15)}
    body.aqua-v55-ready[data-screen="fishing"] #fishing-visual{touch-action:none;contain:layout paint style;overscroll-behavior:none;isolation:isolate}
    body.aqua-v55-ready[data-screen="fishing"] .aqua-shop-fab-v54{opacity:0!important;pointer-events:none!important;transform:translateY(16px) scale(.92)!important}
    body.aqua-v55-ready[data-screen="fishing"] #reel-game:not(.hidden){display:none!important}
    body.aqua-v55-ready[data-screen="fishing"] #aqua-v49-action-layer .v49-hold-pad{display:none!important}
    body.aqua-v55-ready[data-screen="fishing"] .aqua-fishing-v53-ui{z-index:74;width:min(94vw,390px);bottom:var(--v55-bottom)}
    body.aqua-v55-ready[data-screen="fishing"] .aqua-reel-shell-v53{padding:12px 12px 13px;border-radius:24px;background:linear-gradient(180deg,rgba(14,116,144,.78),rgba(3,15,32,.96));box-shadow:0 18px 42px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.20)}
    body.aqua-v55-ready[data-screen="fishing"] .aqua-v53-actions button{min-height:44px;font-size:12px;touch-action:none}
    body.aqua-v55-ready[data-screen="fishing"] #cast-btn{min-height:58px;box-shadow:0 16px 36px rgba(14,165,233,.26);will-change:transform}
    body.aqua-v55-ready[data-screen="fishing"] #cast-btn:active{transform:scale(.982)}
    #aqua-v55-touch-coach{position:absolute;left:.78rem;right:.78rem;top:4.7rem;z-index:73;display:grid;grid-template-columns:auto 1fr auto;gap:.58rem;align-items:center;padding:.58rem .7rem;border-radius:1.1rem;background:linear-gradient(135deg,rgba(2,8,23,.70),rgba(8,47,73,.54));border:1px solid var(--v55-line);backdrop-filter:blur(10px);box-shadow:0 14px 30px rgba(0,0,0,.26);pointer-events:none;transform:translateY(-4px);opacity:.96;transition:opacity .18s ease,transform .18s ease}
    #aqua-v55-touch-coach i{display:grid;place-items:center;width:2.15rem;height:2.15rem;border-radius:.9rem;background:linear-gradient(180deg,#fff7ad,#67e8f9);color:#082f49;font-style:normal;font-weight:1000;font-size:.72rem;box-shadow:0 10px 22px rgba(103,232,249,.22)}
    #aqua-v55-touch-coach b{display:block;color:#fff7cc;font-size:.78rem;line-height:1.05;font-weight:1000;letter-spacing:-.02em}
    #aqua-v55-touch-coach span{display:block;margin-top:.16rem;color:rgba(224,242,254,.78);font-size:.62rem;line-height:1.18;font-weight:850}
    #aqua-v55-touch-coach em{display:block;min-width:3.4rem;text-align:right;color:#a7f3d0;font-style:normal;font-size:.68rem;font-weight:1000}
    .aqua-v55-meter{position:absolute;left:.7rem;right:.7rem;bottom:calc(6.35rem + env(safe-area-inset-bottom,0px));z-index:73;display:none;grid-template-columns:1fr auto;gap:.55rem;align-items:center;pointer-events:none}.aqua-v55-meter-track{height:8px;border-radius:999px;background:rgba(255,255,255,.14);overflow:hidden;box-shadow:inset 0 1px 5px rgba(0,0,0,.35)}.aqua-v55-meter-track>i{display:block;width:var(--v55-progress,0%);height:100%;border-radius:inherit;background:linear-gradient(90deg,#67e8f9,#86efac,#fff7ad);box-shadow:0 0 16px rgba(103,232,249,.48);transition:width .08s linear}.aqua-v55-meter>em{font-style:normal;font-size:.62rem;font-weight:1000;color:#fff7ad;text-shadow:0 2px 8px rgba(0,0,0,.45)}
    #fishing-visual.phase-reel .aqua-v55-meter{display:grid}
    body.aqua-v55-phase-ready #aqua-v55-touch-coach{top:auto;bottom:1rem;transform:none}
    body.aqua-v55-phase-bite #aqua-v55-touch-coach{animation:aquaV55BiteNudge .54s ease-in-out infinite alternate;background:linear-gradient(135deg,rgba(67,20,7,.70),rgba(14,116,144,.62));border-color:rgba(255,247,173,.34)}
    body.aqua-v55-phase-reeling #aqua-v55-touch-coach{top:4.35rem}
    body.aqua-v55-compact[data-screen="fishing"] #screen-fishing>.px-5.pt-5{padding:calc(.42rem + env(safe-area-inset-top,0px)) .85rem .1rem!important}
    body.aqua-v55-compact[data-screen="fishing"] #fishing-region-name{font-size:1.18rem!important}
    body.aqua-v55-compact[data-screen="fishing"] #fishing-region-info{max-width:12rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    body.aqua-v55-compact[data-screen="fishing"] #fishing-coach-panel,body.aqua-v55-compact[data-screen="fishing"] #v39-fishing-tuning,body.aqua-v55-compact[data-screen="fishing"] #v40-settings-bar{display:none!important}
    body.aqua-v55-compact[data-screen="fishing"] #fishing-visual{margin:.32rem .58rem .25rem!important;border-radius:1.7rem!important}
    body.aqua-v55-compact[data-screen="fishing"] #fishing-stage-guide{left:.55rem;right:.55rem;top:.55rem;padding:.52rem .58rem;border-radius:1rem}
    body.aqua-v55-compact[data-screen="fishing"] #fishing-stage-guide span{font-size:.56rem;line-height:1.12}
    body.aqua-v55-compact #aqua-v55-touch-coach{left:.55rem;right:.55rem;top:4.1rem;padding:.5rem .58rem;grid-template-columns:auto 1fr;gap:.45rem}body.aqua-v55-compact #aqua-v55-touch-coach em{display:none}
    body.aqua-v55-lite #fishing-visual .fx-aurora,body.aqua-v55-lite #fishing-visual .depth-rays,body.aqua-v55-lite #fishing-visual .bubble-field,body.aqua-v55-lite #fishing-visual .wave-layer{opacity:.22!important;animation:none!important;filter:none!important}
    body.aqua-v55-lite #aqua-v49-action-layer .v49-touch-ring,body.aqua-v55-lite .aqua-v55-meter{filter:none!important}
    .aqua-v55-panel{position:relative;overflow:hidden;border-radius:1.45rem;padding:1rem;background-image:linear-gradient(135deg,rgba(103,232,249,.16),rgba(34,197,94,.12),rgba(255,247,173,.12)),url('assets/art/v55_mobile_feel_panel.svg');background-size:cover;border:1px solid rgba(255,255,255,.16);box-shadow:0 18px 48px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.16)}.aqua-v55-badge{display:inline-flex;border-radius:999px;padding:.32rem .62rem;background:rgba(103,232,249,.15);font-size:.68rem;font-weight:1000;color:#cffafe;letter-spacing:.06em}.aqua-v55-panel p{color:rgba(224,242,254,.72);font-size:.72rem;line-height:1.45}.aqua-v55-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;margin-top:.8rem}.aqua-v55-grid button{border:0;border-radius:1rem;padding:.72rem .42rem;font-size:.72rem;font-weight:1000;color:#082f49;background:linear-gradient(180deg,#fff7ad,#67e8f9);box-shadow:0 10px 24px rgba(0,0,0,.22)}
    @keyframes aquaV55BiteNudge{from{transform:translateY(-4px) scale(.99)}to{transform:translateY(2px) scale(1.012)}}
    @media (max-width:390px),(max-height:720px){body.aqua-v55-ready{--v55-bottom:calc(8px + env(safe-area-inset-bottom,0px))}.aqua-v55-grid{grid-template-columns:1fr}#aqua-v55-touch-coach span{font-size:.58rem}.aqua-v55-meter{bottom:calc(5.85rem + env(safe-area-inset-bottom,0px))}}
    @media (prefers-reduced-motion:reduce){#aqua-v55-touch-coach,.aqua-v55-meter-track>i{animation:none!important;transition:none!important}}
  `;
  document.head.appendChild(style);
}

function ensureCoach() {
  const visual = qs(SELECTOR.fishingVisual);
  if (!visual) return null;
  let coach = qs('#aqua-v55-touch-coach', visual);
  if (!coach) {
    coach = document.createElement('div');
    coach.id = 'aqua-v55-touch-coach';
    coach.setAttribute('aria-hidden', 'true');
    coach.innerHTML = '<i>READY</i><p><b>낚싯대 던지기</b><span>큰 버튼을 눌러 시작하세요.</span></p><em>60 FPS</em>';
    visual.appendChild(coach);
  }
  let meter = qs('.aqua-v55-meter', visual);
  if (!meter) {
    meter = document.createElement('div');
    meter.className = 'aqua-v55-meter';
    meter.innerHTML = '<div class="aqua-v55-meter-track"><i></i></div><em>SAFE 0.0s</em>';
    visual.appendChild(meter);
  }
  return coach;
}

function setDown(value) {
  const phase = aquaStore.getState().phase;
  if (phase !== GAME_PHASE.REELING) return;
  try { window.AquaFantasiaV53?.fishing?.setDown?.(Boolean(value)); }
  catch (_) { aquaStore.updateFishing({ isDown: Boolean(value) }, 'v55:input'); }
}

function hookBite() {
  const state = aquaStore.getState();
  if (state.phase !== GAME_PHASE.BITE) return false;
  const t = now();
  if (t - runtime.lastHookAt < 260) return true;
  runtime.lastHookAt = t;
  try { window.AquaFantasiaV53?.fishing?.hook?.(); }
  catch (_) { try { window.hookFishFromTarget?.(); } catch (_) {} }
  vibrate([12, 18, 12]);
  return true;
}

function bindVisual() {
  const visual = qs(SELECTOR.fishingVisual);
  if (!visual || visual.dataset.v55TouchBound === '1') return;
  visual.dataset.v55TouchBound = '1';
  visual.addEventListener('pointerdown', (event) => {
    if (!isFishingScreen()) return;
    runtime.lastPointerAt = now();
    const phase = aquaStore.getState().phase;
    if (phase === GAME_PHASE.BITE) {
      event.preventDefault();
      hookBite();
      return;
    }
    if (phase === GAME_PHASE.REELING) {
      event.preventDefault();
      runtime.holding = true;
      setDown(true);
      vibrate(6);
    }
  }, { passive: false });
  visual.addEventListener('pointerup', () => { runtime.holding = false; setDown(false); }, { passive: true });
  visual.addEventListener('pointercancel', () => { runtime.holding = false; setDown(false); }, { passive: true });
  visual.addEventListener('lostpointercapture', () => { runtime.holding = false; setDown(false); }, { passive: true });
}

function bindButtons() {
  const cast = qs(SELECTOR.cast);
  if (cast && cast.dataset.v55Bound !== '1') {
    cast.dataset.v55Bound = '1';
    cast.addEventListener('pointerdown', () => vibrate(8), { passive: true });
  }
  const reel = qs(SELECTOR.reelButton);
  if (reel && reel.dataset.v55Bound !== '1') {
    reel.dataset.v55Bound = '1';
    reel.addEventListener('pointerdown', (event) => { event.preventDefault(); runtime.holding = true; setDown(true); }, { passive: false });
    reel.addEventListener('pointerup', () => { runtime.holding = false; setDown(false); }, { passive: true });
    reel.addEventListener('pointercancel', () => { runtime.holding = false; setDown(false); }, { passive: true });
  }
}

function applyDeviceMode(force = false) {
  runtime.lowEnd = detectLowEnd() || runtime.fps < 38;
  runtime.compact = (window.innerHeight || 800) < 740 || (window.innerWidth || 430) <= 390;
  document.body.classList.toggle('aqua-v55-lite', runtime.lowEnd);
  document.body.classList.toggle('aqua-v55-compact', runtime.compact);
  if (runtime.lowEnd || force) {
    document.body.classList.add('perf-lite');
    try { window.AquaV49Runtime?.setMode?.('lite'); } catch (_) {}
    try { localStorage.setItem('aqua_v50_runtime_mode', 'lite'); } catch (_) {}
  }
}

function updatePhaseClasses(phase) {
  document.body.classList.remove('aqua-v55-phase-ready','aqua-v55-phase-casting','aqua-v55-phase-waiting','aqua-v55-phase-bite','aqua-v55-phase-reeling','aqua-v55-phase-catch','aqua-v55-phase-fail');
  const key = String(phase || GAME_PHASE.READY).toLowerCase();
  document.body.classList.add(`aqua-v55-phase-${key}`);
}

function render() {
  ensureCoach();
  bindVisual();
  bindButtons();
  const snapshot = aquaStore.getState();
  const coach = qs('#aqua-v55-touch-coach');
  const meter = qs('.aqua-v55-meter');
  const [badge, title, desc] = phaseText(snapshot.phase, snapshot.fishing);
  updatePhaseClasses(snapshot.phase);
  if (coach) {
    coach.querySelector('i').textContent = badge;
    coach.querySelector('b').textContent = title;
    coach.querySelector('span').textContent = desc;
    coach.querySelector('em').textContent = `${Math.round(runtime.fps || 60)} FPS`;
    coach.style.opacity = isFishingScreen() ? '0.96' : '0';
  }
  if (meter) {
    const progress = clamp(snapshot.fishing?.progress || 0, 0, 100);
    const safeSeconds = Math.max(0, Number(snapshot.fishing?.safeSeconds || 0));
    meter.style.setProperty('--v55-progress', `${progress.toFixed(1)}%`);
    meter.querySelector('em').textContent = `SAFE ${safeSeconds.toFixed(1)}s`;
  }
}

function tensionGuard() {
  const snapshot = aquaStore.getState();
  if (snapshot.phase !== GAME_PHASE.REELING) return;
  const tension = Number(snapshot.fishing?.tension || 0);
  const t = now();
  if (tension >= 94 && snapshot.fishing?.isDown && t - runtime.lastGuardAt > 650) {
    runtime.lastGuardAt = t;
    aquaStore.updateFishing({ isDown: false, message: '장력 과부하! 손을 떼고 줄 풀기' }, 'v55:tension-guard');
    runtime.holding = false;
    vibrate([18, 18, 18]);
  }
}

function frame(time) {
  if (!runtime.lastFrame) runtime.lastFrame = time;
  const dt = Math.max(1, time - runtime.lastFrame);
  runtime.lastFrame = time;
  const fps = 1000 / dt;
  runtime.fpsSamples.push(fps);
  if (runtime.fpsSamples.length > 30) runtime.fpsSamples.shift();
  runtime.frames += 1;
  if (runtime.frames % 12 === 0) {
    runtime.fps = runtime.fpsSamples.reduce((a, b) => a + b, 0) / Math.max(1, runtime.fpsSamples.length);
    applyDeviceMode();
    render();
  }
  tensionGuard();
  runtime.raf = requestAnimationFrame(frame);
}

async function cacheGuard() {
  try {
    const last = localStorage.getItem(SAVE_MARK);
    if (last === VERSION) return;
    localStorage.setItem(SAVE_MARK, VERSION);
    navigator.serviceWorker?.controller?.postMessage?.({ type: 'AQUA_CLEAR_RUNTIME_CACHE', keepPrefix: CACHE_KEEP_PREFIX });
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys
        .filter((key) => key.startsWith('aqua-fantasia-') && !key.startsWith(CACHE_KEEP_PREFIX))
        .map((key) => caches.delete(key)));
    }
  } catch (error) {
    console.warn('[Aqua v5.5] cache guard skipped', error);
  }
}

function attachPanel() {
  const village = document.getElementById('screen-village');
  if (!village || document.getElementById('aqua-v55-panel')) return;
  const panel = document.createElement('div');
  panel.id = 'aqua-v55-panel';
  panel.className = 'aqua-v55-panel mt-4';
  panel.innerHTML = `
    <span class="aqua-v55-badge">MOBILE FEEL 5.5</span>
    <h3 class="mt-2 text-xl font-black tracking-tight">입질 터치 확장 · 릴 조작 정리 · 캐시 가드</h3>
    <p class="mt-1">입질 상태에서는 수면 어디든 터치해 챔질할 수 있고, 릴링은 길게 누르기/떼기로 자연스럽게 이어집니다. 낮은 FPS나 Save-Data 환경에서는 이펙트를 줄이고 PWA 캐시를 새 버전 기준으로 정리합니다.</p>
    <div class="aqua-v55-grid"><button id="v55-fish-test">낚시 테스트</button><button id="v55-lite-toggle">저사양 모드</button><button id="v55-cache-clean">캐시 정리</button></div>`;
  const anchor = document.getElementById('aqua-v54-panel') || document.getElementById('v53-casual-panel') || village.firstElementChild;
  anchor?.insertAdjacentElement('afterend', panel);
  panel.querySelector('#v55-fish-test')?.addEventListener('click', () => { window.switchScreen?.('fishing'); setTimeout(() => window.AquaFantasiaV53?.fishing?.startCast?.(), 120); });
  panel.querySelector('#v55-lite-toggle')?.addEventListener('click', () => { runtime.lowEnd = true; document.body.classList.add('aqua-v55-lite','perf-lite'); localStorage.setItem('aqua_graphics_mode', 'low'); render(); });
  panel.querySelector('#v55-cache-clean')?.addEventListener('click', () => { localStorage.removeItem(SAVE_MARK); cacheGuard(); window.showToast?.('v5.5 캐시 정리 요청', '🧹', 1300); });
}

function boot() {
  if (runtime.booted) return;
  runtime.booted = true;
  ensureStyle();
  document.body.classList.add('aqua-v55-ready');
  applyDeviceMode(true);
  render();
  attachPanel();
  cacheGuard();
  aquaStore.on('phase', render);
  aquaStore.on('fishing', render);
  aquaStore.on('change', render);
  window.addEventListener('resize', () => { applyDeviceMode(true); render(); }, { passive: true });
  window.visualViewport?.addEventListener('resize', () => { applyDeviceMode(true); render(); }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { runtime.holding = false; setDown(false); } });
  runtime.raf = requestAnimationFrame(frame);
  window.AquaFantasiaV55 = { version: VERSION, cacheKeepPrefix: CACHE_KEEP_PREFIX, render, setDown, hookBite, cacheGuard, state: runtime };
  console.log(`[AquaFantasia] v${VERSION} mobile feel runtime ready`);
}

ready(boot);
