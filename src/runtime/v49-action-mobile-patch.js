// Aqua Fantasia v4.9 Action Mobile Runtime Patch
// ------------------------------------------------------------
// 목적: 기존 v4.8/v5.x 정적 통파일을 깨지 않고, 모바일 낚시 화면의 액션감/조작감/UI 겹침/성능을 런타임 오버레이로 보정합니다.
// - 기존 castLine / hookFishFromTarget / reelAction 흐름은 유지합니다.
// - 낚시 화면에 Sprite 기반 찌/물결/입질 말풍선/꾹누르기 릴 패드를 얹습니다.
// - 저사양·Save-Data 환경에서는 자동으로 이펙트를 줄이고 Canvas DPR을 낮춥니다.

const VERSION = '4.9.0-action-mobile';
const SELECTOR = {
  visual: '#fishing-visual',
  cast: '#cast-btn',
  reel: '#reel-game',
  reelAction: '#reel-action-btn',
  status: '#fishing-status',
  guide: '#fishing-stage-guide',
  bite: '#bite-target',
};

const state = {
  patched: false,
  holding: false,
  holdTimer: 0,
  lastPhase: 'ready',
  lowEnd: false,
  lastFx: 0,
};

function ready(fn) {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
  else fn();
}

function qs(sel, root = document) { return root.querySelector(sel); }

function getPhase() {
  const visual = qs(SELECTOR.visual);
  if (!visual) return 'ready';
  if (visual.classList.contains('phase-reel')) return 'reel';
  if (visual.classList.contains('phase-bite')) return 'bite';
  if (visual.classList.contains('phase-casting')) return 'casting';
  if (visual.classList.contains('phase-success')) return 'success';
  if (visual.classList.contains('phase-fail')) return 'fail';
  return visual.dataset?.fishingPhase || 'ready';
}

function detectLowEnd() {
  const nav = navigator;
  const memory = Number(nav.deviceMemory || 4);
  const cores = Number(nav.hardwareConcurrency || 6);
  const saveData = Boolean(nav.connection?.saveData);
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  return saveData || reduced || memory <= 3 || cores <= 4;
}

function vibrate(pattern) {
  try { navigator.vibrate?.(pattern); } catch (_) {}
}

function ensureStyle() {
  if (document.getElementById('aqua-v49-action-mobile-style')) return;
  const style = document.createElement('style');
  style.id = 'aqua-v49-action-mobile-style';
  style.textContent = `
    body.aqua-v49-action-mobile-ready[data-screen="fishing"] #app-shell{height:100dvh;min-height:100dvh;overflow:hidden}
    body.aqua-v49-action-mobile-ready[data-screen="fishing"] .bottom-nav,
    body.aqua-v49-action-mobile-ready[data-screen="fishing"] #onehand-fab,
    body.aqua-v49-action-mobile-ready[data-screen="fishing"] #immersive-btn,
    body.aqua-v49-action-mobile-ready[data-screen="fishing"] #v30-smart-dock{display:none!important}
    body.aqua-v49-action-mobile-ready[data-screen="fishing"] #screen-fishing{padding-bottom:env(safe-area-inset-bottom,0px);overflow:hidden}
    body.aqua-v49-action-mobile-ready[data-screen="fishing"] #fishing-visual{contain:layout paint style;touch-action:none;-webkit-user-select:none;user-select:none;isolation:isolate;min-height:0;box-shadow:0 22px 58px rgba(0,0,0,.38),inset 0 1px 0 rgba(255,255,255,.14)}
    body.aqua-v49-action-mobile-ready[data-screen="fishing"] #fishing-coach-panel,
    body.aqua-v49-action-mobile-ready[data-screen="fishing"] #v39-fishing-tuning,
    body.aqua-v49-action-mobile-ready[data-screen="fishing"] #v40-settings-bar{display:none!important}
    body.aqua-v49-action-mobile-ready[data-screen="fishing"] #fishing-stage-guide{left:.72rem;right:.72rem;top:.64rem;bottom:auto;z-index:71;padding:.64rem .74rem;border-radius:1.05rem;background:linear-gradient(135deg,rgba(2,8,23,.74),rgba(8,145,178,.20));border:1px solid rgba(255,255,255,.14);box-shadow:0 12px 28px rgba(0,0,0,.26);backdrop-filter:blur(10px)}
    body.aqua-v49-action-mobile-ready[data-screen="fishing"] #fishing-stage-guide b{font-size:.74rem;line-height:1.05;color:#fff7ad}
    body.aqua-v49-action-mobile-ready[data-screen="fishing"] #fishing-stage-guide span{font-size:.64rem;line-height:1.24;color:rgba(224,242,254,.82)}
    body.aqua-v49-action-mobile-ready[data-screen="fishing"] #fishing-status{z-index:70;bottom:.72rem;max-width:calc(100% - 1.2rem);white-space:nowrap;text-overflow:ellipsis;overflow:hidden;padding:.46rem .72rem;font-size:.72rem;background:rgba(2,8,23,.68);border-color:rgba(255,255,255,.12);backdrop-filter:blur(10px)}
    body.aqua-v49-action-mobile-ready.aqua-v49-phase-reel #fishing-status{opacity:.86;transform:translate(-50%, .2rem) scale(.94)}
    body.aqua-v49-action-mobile-ready #bite-target{z-index:82;touch-action:manipulation;will-change:transform,opacity}
    body.aqua-v49-action-mobile-ready #cast-btn{transform-origin:center;will-change:transform,opacity;box-shadow:0 16px 34px rgba(14,165,233,.26)}
    body.aqua-v49-action-mobile-ready #cast-btn:active{animation:aquaV49Squash .24s cubic-bezier(.18,1.3,.25,1)}
    #aqua-v49-action-layer{position:absolute;inset:0;z-index:43;pointer-events:none;overflow:hidden;border-radius:inherit;contain:layout paint style}
    #aqua-v49-action-layer .v49-line{position:absolute;left:77%;top:78%;width:38%;height:4px;border-radius:999px;background:linear-gradient(90deg,rgba(255,255,255,.16),rgba(255,247,173,.78),rgba(103,232,249,.86));filter:drop-shadow(0 0 8px rgba(103,232,249,.5));opacity:0;transform-origin:left center;will-change:transform,opacity}
    #aqua-v49-action-layer .v49-bobber{position:absolute;left:50%;top:54%;width:74px;height:74px;margin:-37px 0 0 -37px;background:url('assets/ui-kit/fishing_minigame/bobber_large.png') center/contain no-repeat;filter:drop-shadow(0 18px 22px rgba(0,0,0,.36));opacity:0;will-change:transform,left,top,opacity}
    #aqua-v49-action-layer .v49-ripple{position:absolute;left:50%;top:58%;width:116px;height:116px;margin:-58px 0 0 -58px;background:url('assets/ui-kit/icons/water_ripple.png') center/contain no-repeat;opacity:0;transform:scale(.2);filter:drop-shadow(0 0 22px rgba(103,232,249,.82));will-change:transform,opacity}
    #aqua-v49-action-layer .v49-bite-bubble{position:absolute;left:50%;top:35%;transform:translate(-50%,-50%) scale(.8);padding:.52rem .72rem;border-radius:999px;background:linear-gradient(180deg,#fff7ad,#fb923c);color:#391500;font-size:1.08rem;font-weight:1000;box-shadow:0 18px 34px rgba(251,146,60,.36);opacity:0;will-change:transform,opacity}
    #aqua-v49-action-layer .v49-touch-ring{position:absolute;left:50%;top:55%;width:160px;height:160px;margin:-80px 0 0 -80px;border-radius:999px;background:radial-gradient(circle,rgba(255,247,173,.22) 0 18%,rgba(103,232,249,.16) 22% 46%,transparent 50%);border:1px solid rgba(255,247,173,.28);opacity:0;will-change:transform,opacity}
    #aqua-v49-action-layer .v49-hold-pad{pointer-events:auto;position:absolute;left:50%;bottom:1.05rem;transform:translateX(-50%) translateY(10px);min-width:min(76vw,320px);border:0;border-radius:1.35rem;padding:.9rem .9rem;background:linear-gradient(180deg,#fff7ad,#67e8f9);color:#073047;font-weight:1000;font-size:.94rem;box-shadow:0 18px 36px rgba(0,0,0,.30);opacity:0;display:none;touch-action:none;will-change:transform,opacity}
    #aqua-v49-action-layer .v49-hold-pad small{display:block;margin-top:.16rem;font-size:.64rem;line-height:1.1;color:rgba(7,48,71,.68);font-weight:900}
    #aqua-v49-action-layer .v49-hold-pad.is-holding{transform:translateX(-50%) translateY(0) scale(.965);filter:saturate(1.25);box-shadow:0 12px 28px rgba(251,191,36,.34)}
    #aqua-v49-action-layer .v49-safe-coach{position:absolute;left:.74rem;right:.74rem;bottom:5.95rem;display:grid;grid-template-columns:auto 1fr;gap:.55rem;align-items:center;padding:.58rem .68rem;border-radius:1rem;background:rgba(2,8,23,.62);border:1px solid rgba(255,255,255,.12);backdrop-filter:blur(10px);opacity:0;transform:translateY(8px);transition:opacity .18s ease,transform .18s ease;box-shadow:0 10px 24px rgba(0,0,0,.24)}
    #aqua-v49-action-layer .v49-safe-coach b{display:grid;place-items:center;width:2.1rem;height:2.1rem;border-radius:.82rem;background:linear-gradient(180deg,#fff7ad,#fb923c);color:#391500;font-size:1rem}
    #aqua-v49-action-layer .v49-safe-coach span{display:block;color:#fff7ad;font-weight:1000;font-size:.73rem;line-height:1.05}
    #aqua-v49-action-layer .v49-safe-coach em{display:block;margin-top:.14rem;color:rgba(224,242,254,.75);font-style:normal;font-size:.62rem;font-weight:800;line-height:1.2}
    #fishing-visual.phase-casting #aqua-v49-action-layer .v49-line,
    #fishing-visual.phase-bite #aqua-v49-action-layer .v49-line,
    #fishing-visual.phase-reel #aqua-v49-action-layer .v49-line{opacity:.84;animation:aquaV49LineTug 1.2s ease-in-out infinite alternate}
    #fishing-visual.phase-casting #aqua-v49-action-layer .v49-bobber{opacity:1;animation:aquaV49CastArc .86s cubic-bezier(.17,.92,.22,1) both,aquaV49Bob .95s ease-in-out .86s infinite alternate}
    #fishing-visual.phase-bite #aqua-v49-action-layer .v49-bobber{opacity:1;animation:aquaV49BitePull .42s ease-in-out infinite alternate}
    #fishing-visual.phase-reel #aqua-v49-action-layer .v49-bobber{opacity:1;animation:aquaV49ReelBob .44s ease-in-out infinite alternate}
    #fishing-visual.phase-bite #aqua-v49-action-layer .v49-bite-bubble{opacity:1;animation:aquaV49BiteBubble .48s ease-in-out infinite alternate}
    #fishing-visual.phase-bite #aqua-v49-action-layer .v49-touch-ring{opacity:1;animation:aquaV49TouchRing .8s ease-in-out infinite}
    #fishing-visual.phase-reel #aqua-v49-action-layer .v49-hold-pad{display:block;opacity:1;transform:translateX(-50%) translateY(0)}
    #fishing-visual.phase-reel #aqua-v49-action-layer .v49-safe-coach{opacity:1;transform:translateY(0)}
    #fishing-visual.phase-success #aqua-v49-action-layer .v49-ripple{animation:aquaV49Ripple .62s ease-out both}
    #fishing-visual.phase-fail #aqua-v49-action-layer .v49-touch-ring{opacity:.75;animation:aquaV49FailRing .44s linear both}
    body.aqua-v49-lite #aqua-v49-action-layer .v49-touch-ring,
    body.aqua-v49-lite #aqua-v49-action-layer .v49-safe-coach{display:none!important}
    body.aqua-v49-lite #fishing-visual .bubble-field,
    body.aqua-v49-lite #fishing-visual .depth-rays,
    body.aqua-v49-lite #fishing-visual .fx-aurora{opacity:.22!important;animation:none!important}
    body.aqua-v49-paused #aqua-v49-action-layer *,
    body.aqua-v49-lite #aqua-v49-action-layer .v49-line{animation-duration:1.6s!important;filter:none!important}
    @keyframes aquaV49Squash{0%{transform:scale(1)}45%{transform:scale(1.06,.88)}100%{transform:scale(1)}}
    @keyframes aquaV49CastArc{0%{left:84%;top:80%;opacity:0;transform:translate3d(0,0,0) scale(.64) rotate(-28deg)}18%{opacity:1}58%{left:57%;top:24%;transform:scale(1.08) rotate(18deg)}100%{left:50%;top:56%;transform:scale(1) rotate(0deg)}}
    @keyframes aquaV49Bob{from{transform:translate3d(-3px,-5px,0) rotate(-3deg)}to{transform:translate3d(4px,6px,0) rotate(4deg)}}
    @keyframes aquaV49BitePull{from{transform:translate3d(0,-7px,0) scale(.95)}to{transform:translate3d(0,14px,0) scale(1.06)}}
    @keyframes aquaV49ReelBob{from{transform:translate3d(-10px,-4px,0) rotate(-8deg)}to{transform:translate3d(12px,8px,0) rotate(9deg)}}
    @keyframes aquaV49BiteBubble{from{transform:translate(-50%,-56%) scale(.92)}to{transform:translate(-50%,-70%) scale(1.12)}}
    @keyframes aquaV49TouchRing{0%{transform:scale(.72);opacity:.82}100%{transform:scale(1.16);opacity:.22}}
    @keyframes aquaV49Ripple{0%{opacity:.92;transform:scale(.2)}100%{opacity:0;transform:scale(2.5)}}
    @keyframes aquaV49FailRing{0%,100%{transform:translateX(0) scale(1);opacity:.7}25%{transform:translateX(-7px) scale(1.02)}75%{transform:translateX(7px) scale(.98)}}
    @keyframes aquaV49LineTug{from{transform:rotate(-112deg) scaleX(.88)}to{transform:rotate(-104deg) scaleX(1.02)}}
    @media (max-width:390px){body.aqua-v49-action-mobile-ready[data-screen="fishing"] #fishing-stage-guide{top:.48rem;padding:.55rem .62rem}.aqua-v49-action-mobile-ready[data-screen="fishing"] #fishing-stage-guide span{font-size:.58rem}#aqua-v49-action-layer .v49-hold-pad{bottom:.75rem;min-width:calc(100vw - 46px);padding:.78rem .74rem;font-size:.86rem}#aqua-v49-action-layer .v49-safe-coach{bottom:5.4rem}}
    @media (prefers-reduced-motion:reduce){#aqua-v49-action-layer *{animation:none!important;transition:none!important}body.aqua-v49-action-mobile-ready #cast-btn:active{animation:none!important}}
  `;
  document.head.appendChild(style);
}

function ensureLayer() {
  const visual = qs(SELECTOR.visual);
  if (!visual) return null;
  let layer = qs('#aqua-v49-action-layer', visual);
  if (layer) return layer;
  layer = document.createElement('div');
  layer.id = 'aqua-v49-action-layer';
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = `
    <i class="v49-line"></i>
    <i class="v49-ripple"></i>
    <i class="v49-bobber"></i>
    <b class="v49-bite-bubble">!</b>
    <i class="v49-touch-ring"></i>
    <div class="v49-safe-coach"><b>30~70</b><p><span>안전지대 유지</span><em>꾹 누르면 감기고, 손을 떼면 장력이 내려갑니다.</em></p></div>
    <button type="button" class="v49-hold-pad">꾹 눌러 릴 감기<small>높아지면 손을 떼거나 줄 풀기</small></button>`;
  visual.appendChild(layer);
  bindHoldPad(layer);
  return layer;
}

function spawnRipple() {
  const layer = ensureLayer();
  const ripple = layer?.querySelector('.v49-ripple');
  if (!ripple) return;
  ripple.style.animation = 'none';
  void ripple.offsetWidth;
  ripple.style.animation = 'aquaV49Ripple .72s ease-out both';
}

function spawnTouchFx(x = 50, y = 55) {
  const visual = qs(SELECTOR.visual);
  if (!visual || state.lowEnd) return;
  const now = performance.now();
  if (now - state.lastFx < 110) return;
  state.lastFx = now;
  const fx = document.createElement('i');
  fx.style.cssText = `position:absolute;left:${x}%;top:${y}%;width:28px;height:28px;margin:-14px 0 0 -14px;border-radius:999px;border:2px solid rgba(255,247,173,.82);z-index:85;pointer-events:none;box-shadow:0 0 24px rgba(103,232,249,.45);animation:aquaV49TouchRing .5s ease-out both;`;
  visual.appendChild(fx);
  setTimeout(() => fx.remove(), 560);
}

function updateBodyPhase(phase) {
  document.body.classList.remove('aqua-v49-phase-ready','aqua-v49-phase-casting','aqua-v49-phase-bite','aqua-v49-phase-reel','aqua-v49-phase-success','aqua-v49-phase-fail');
  document.body.classList.add(`aqua-v49-phase-${phase}`);
  if (phase !== state.lastPhase) {
    if (phase === 'bite' || phase === 'success') spawnRipple();
    if (phase === 'bite') vibrate([12, 20, 12]);
    state.lastPhase = phase;
  }
}

function stopHold() {
  state.holding = false;
  clearInterval(state.holdTimer);
  state.holdTimer = 0;
  qs('#aqua-v49-action-layer .v49-hold-pad')?.classList.remove('is-holding');
}

function startHold(event) {
  event?.preventDefault?.();
  event?.stopPropagation?.();
  if (getPhase() !== 'reel') return;
  if (state.holding) return;
  state.holding = true;
  qs('#aqua-v49-action-layer .v49-hold-pad')?.classList.add('is-holding');
  vibrate(8);
  const tick = () => {
    if (!state.holding || getPhase() !== 'reel') return stopHold();
    try { window.reelAction?.(); } catch (error) { console.warn('[Aqua v4.9 action] reelAction failed', error); stopHold(); }
  };
  tick();
  state.holdTimer = window.setInterval(tick, state.lowEnd ? 280 : 215);
}

function bindHoldPad(layer) {
  const pad = layer.querySelector('.v49-hold-pad');
  if (!pad || pad.dataset.bound === '1') return;
  pad.dataset.bound = '1';
  pad.addEventListener('pointerdown', startHold, { passive: false });
  pad.addEventListener('pointerup', stopHold, { passive: true });
  pad.addEventListener('pointercancel', stopHold, { passive: true });
  pad.addEventListener('pointerleave', stopHold, { passive: true });
}

function bindExistingControls() {
  const cast = qs(SELECTOR.cast);
  if (cast && cast.dataset.v49ActionBound !== '1') {
    cast.dataset.v49ActionBound = '1';
    cast.addEventListener('click', () => { vibrate(8); document.body.classList.add('aqua-v49-cast-pop'); setTimeout(() => document.body.classList.remove('aqua-v49-cast-pop'), 260); }, { passive: true });
  }
  const visual = qs(SELECTOR.visual);
  if (visual && visual.dataset.v49ActionTouch !== '1') {
    visual.dataset.v49ActionTouch = '1';
    visual.addEventListener('pointerdown', (event) => {
      if (getPhase() !== 'reel' && getPhase() !== 'bite') return;
      const rect = visual.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / Math.max(1, rect.width)) * 100;
      const y = ((event.clientY - rect.top) / Math.max(1, rect.height)) * 100;
      spawnTouchFx(x, y);
    }, { passive: true });
  }
  const reelBtn = qs(SELECTOR.reelAction);
  if (reelBtn && reelBtn.dataset.v49Hold !== '1') {
    reelBtn.dataset.v49Hold = '1';
    reelBtn.addEventListener('pointerdown', startHold, { passive: false });
    reelBtn.addEventListener('pointerup', stopHold, { passive: true });
    reelBtn.addEventListener('pointercancel', stopHold, { passive: true });
  }
}

function patchGlobals() {
  if (state.patched || !window.reelAction) return;
  state.patched = true;
  const originalReel = window.reelAction;
  window.reelAction = function patchedReelAction(...args) {
    const result = originalReel.apply(this, args);
    spawnTouchFx(50 + (Math.random() - 0.5) * 16, 56 + (Math.random() - 0.5) * 10);
    return result;
  };
  window.AquaV49ActionMobile = {
    version: VERSION,
    isLowEnd: () => state.lowEnd,
    stopHold,
    refresh: frame,
  };
}

function tunePerformance() {
  state.lowEnd = detectLowEnd();
  document.body.classList.toggle('aqua-v49-lite', state.lowEnd);
  if (state.lowEnd) document.body.classList.add('perf-lite');
  try { window.AquaV49Runtime?.setMode?.(state.lowEnd ? 'lite' : 'auto'); } catch (_) {}
}

function observePhase() {
  const visual = qs(SELECTOR.visual);
  if (!visual || visual.dataset.v49Observer === '1') return;
  visual.dataset.v49Observer = '1';
  const observer = new MutationObserver(() => updateBodyPhase(getPhase()));
  observer.observe(visual, { attributes: true, attributeFilter: ['class', 'data-fishing-phase'] });
  updateBodyPhase(getPhase());
}

function frame() {
  ensureLayer();
  bindExistingControls();
  patchGlobals();
  observePhase();
  updateBodyPhase(getPhase());
}

function boot() {
  ensureStyle();
  document.body.classList.add('aqua-v49-action-mobile-ready');
  tunePerformance();
  frame();
  window.addEventListener('resize', frame, { passive: true });
  window.visualViewport?.addEventListener('resize', frame, { passive: true });
  document.addEventListener('visibilitychange', () => {
    document.body.classList.toggle('aqua-v49-paused', document.hidden);
    if (document.hidden) stopHold();
  });
  window.addEventListener('pointerup', stopHold, { passive: true });
  window.addEventListener('pointercancel', stopHold, { passive: true });
  window.setInterval(frame, 900);
  console.log(`[AquaFantasia] v${VERSION} action mobile runtime ready`);
}

ready(boot);
