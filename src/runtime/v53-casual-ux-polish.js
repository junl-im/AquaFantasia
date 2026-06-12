// Aqua Fantasia v5.3 Casual UX Polish Runtime
// -------------------------------------------
// v5.2의 캐주얼 낚시 시스템을 기반으로, UI 겹침을 줄이고 낚시 안내/가방/결과 연출을 정돈합니다.

import { ASSETS, APP_VERSION, GAME_PHASE, aquaStore } from '../core/state.js';
import { createFishingSystem } from '../systems/fishing.js';
import { createInventorySystem } from '../systems/inventory.js';
import { createNavigator } from '../ui/navigator.js';

const VERSION = APP_VERSION;

function ready(fn) {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
  else fn();
}

function ensureStyle() {
  if (document.getElementById('aqua-casual-v53-style')) return;
  const style = document.createElement('style');
  style.id = 'aqua-casual-v53-style';
  style.textContent = `
    body.aqua-v53-ready #v52-casual-panel, body.aqua-v53-ready .v52-casual-panel{display:none!important}
    body.aqua-v53-ready .v50-performance-panel, body.aqua-v53-ready .v51-stability-panel{display:none!important}
    body.aqua-fishing-active .top-bar-focus, body.aqua-fishing-active .bottom-nav, body.aqua-fishing-active #v30-smart-dock{display:none!important}
    #aqua-casual-stage-v53{position:absolute;inset:0;z-index:6;pointer-events:none;overflow:hidden;border-radius:inherit;background-image:linear-gradient(180deg,rgba(5,18,36,.04),rgba(7,89,133,.16)),url('${ASSETS.background}');background-size:cover;background-position:center;opacity:.96;contain:layout paint style}
    .aqua-v53-line{position:absolute;left:18%;top:15%;width:38%;height:4px;border-radius:999px;background:linear-gradient(90deg,rgba(255,255,255,.20),rgba(255,247,173,.84),rgba(103,232,249,.94));transform-origin:left center;filter:drop-shadow(0 0 6px rgba(103,232,249,.74));opacity:.86}
    .aqua-v53-bobber{position:absolute;width:70px;height:70px;left:50%;top:42%;margin:-35px 0 0 -35px;background:url('${ASSETS.bobber}') center/contain no-repeat;filter:drop-shadow(0 16px 18px rgba(0,0,0,.36));transform:translate3d(0,0,0);will-change:transform,left,top}
    .aqua-v53-ripple{position:absolute;width:108px;height:108px;margin:-54px 0 0 -54px;background:url('${ASSETS.ripple}') center/contain no-repeat;opacity:0;transform:scale(.2);filter:drop-shadow(0 0 22px rgba(103,232,249,.78));will-change:transform,opacity}
    .aqua-v53-ripple.active{animation:aquaV53Ripple .84s ease-out both}.aqua-v53-bite-mark{position:absolute;left:50%;top:34%;transform:translate(-50%,-50%);padding:9px 14px;border-radius:999px;background:linear-gradient(180deg,#fff7ad,#fb923c);color:#391500;font-weight:1000;font-size:16px;opacity:0;box-shadow:0 16px 28px rgba(251,146,60,.32)}.aqua-v53-bite-mark.active{animation:aquaV53Bite .58s ease-in-out infinite alternate}.aqua-v53-stage-shake{animation:aquaV53Shake .26s linear both}
    .v53-casual-panel{position:relative;overflow:hidden;border-radius:1.45rem;padding:1rem;background:linear-gradient(135deg,rgba(253,186,116,.20),rgba(45,212,191,.17),rgba(168,85,247,.13)),url('${ASSETS.background}');background-size:cover;border:1px solid rgba(255,255,255,.18);box-shadow:0 18px 50px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.18)}
    .v53-casual-badge{display:inline-flex;align-items:center;gap:.35rem;border-radius:999px;padding:.32rem .62rem;background:rgba(255,255,255,.16);font-size:.68rem;font-weight:1000;color:#fff7ad;letter-spacing:.06em}.v53-casual-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;margin-top:.8rem}.v53-casual-actions button{border:0;border-radius:1rem;padding:.72rem .45rem;font-size:.72rem;font-weight:1000;color:#07203a;background:linear-gradient(180deg,#fff7ad,#67e8f9);box-shadow:0 10px 24px rgba(0,0,0,.24)}
    @keyframes aquaV53Ripple{0%{opacity:.9;transform:scale(.15)}100%{opacity:0;transform:scale(2.7)}}@keyframes aquaV53Bite{0%{opacity:.82;transform:translate(-50%,-54%) scale(.94)}100%{opacity:1;transform:translate(-50%,-64%) scale(1.09)}}@keyframes aquaV53Shake{0%,100%{transform:translate3d(0,0,0)}25%{transform:translate3d(-4px,3px,0)}50%{transform:translate3d(4px,-3px,0)}75%{transform:translate3d(-2px,2px,0)}}
    @media (max-width:430px){.v53-casual-panel{border-radius:1.25rem;padding:.85rem}.v53-casual-actions{grid-template-columns:1fr}.aqua-v53-bobber{width:62px;height:62px;margin:-31px 0 0 -31px}}
    @media (prefers-reduced-motion:reduce){.aqua-v53-ripple.active,.aqua-v53-bite-mark.active,.aqua-v53-stage-shake{animation:none!important}}
  `;
  document.head.appendChild(style);
}

function setFishingBodyClass(phase) {
  document.body.classList.toggle('aqua-fishing-active', [GAME_PHASE.CASTING, GAME_PHASE.WAITING, GAME_PHASE.BITE, GAME_PHASE.REELING].includes(phase));
}

function createSpriteRuntime(host) {
  ensureStyle();
  const old = host.querySelector('#aqua-casual-stage');
  old?.remove?.();
  let stage = host.querySelector('#aqua-casual-stage-v53');
  if (!stage) {
    stage = document.createElement('div');
    stage.id = 'aqua-casual-stage-v53';
    stage.innerHTML = `<i class="aqua-v53-line"></i><i class="aqua-v53-bobber"></i><i class="aqua-v53-ripple"></i><b class="aqua-v53-bite-mark">입질!</b>`;
    host.appendChild(stage);
  }
  const line = stage.querySelector('.aqua-v53-line');
  const bobber = stage.querySelector('.aqua-v53-bobber');
  const ripple = stage.querySelector('.aqua-v53-ripple');
  const mark = stage.querySelector('.aqua-v53-bite-mark');

  function place(pos = { x: 0.5, y: 0.42 }) {
    const x = Math.round(pos.x * 100);
    const y = Math.round(pos.y * 100);
    bobber.style.left = `${x}%`;
    bobber.style.top = `${y}%`;
    ripple.style.left = `${x}%`;
    ripple.style.top = `${y}%`;
    mark.style.left = `${x}%`;
    mark.style.top = `${Math.max(12, y - 10)}%`;
    const dx = x - 18;
    const dy = y - 15;
    line.style.width = `${Math.max(24, Math.sqrt(dx * dx + dy * dy))}%`;
    line.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
  }

  return {
    cast() {
      mark.classList.remove('active');
      const start = performance.now();
      const duration = 720;
      const animate = () => {
        const t = Math.min(1, (performance.now() - start) / duration);
        const e = 1 - Math.pow(1 - t, 3);
        const x = 18 + (50 - 18) * e;
        const y = 15 + (42 - 15) * e - Math.sin(e * Math.PI) * 25;
        place({ x: x / 100, y: y / 100 });
        bobber.style.transform = `translate3d(0,0,0) rotate(${(-18 + e * 34).toFixed(1)}deg) scale(${0.78 + e * 0.22})`;
        if (t < 1) requestAnimationFrame(animate);
        else this.wait();
      };
      animate();
    },
    wait() {
      place({ x: 0.5, y: 0.42 });
      mark.classList.remove('active');
      bobber.style.filter = 'drop-shadow(0 16px 18px rgba(0,0,0,.36))';
    },
    bite(pos) {
      place(pos || { x: 0.5, y: 0.42 });
      ripple.classList.remove('active'); void ripple.offsetWidth; ripple.classList.add('active');
      mark.classList.add('active');
      stage.classList.remove('aqua-v53-stage-shake'); void stage.offsetWidth; stage.classList.add('aqua-v53-stage-shake');
    },
    reel() {
      mark.classList.remove('active');
      bobber.style.filter = 'drop-shadow(0 0 22px rgba(251,191,36,.95))';
    },
    update(frame) {
      if (frame?.phase === GAME_PHASE.REELING) {
        const n = (performance.now() / 250) % (Math.PI * 2);
        const amp = frame.safe ? 0.07 : 0.13;
        place({ x: 0.5 + Math.sin(n) * amp, y: 0.42 + Math.cos(n * 0.82) * 0.038 });
      }
    },
    playVictory(icon) {
      const img = document.createElement('img');
      img.src = icon || ASSETS.fishIcons[0];
      img.alt = '';
      img.style.cssText = 'position:absolute;left:50%;top:38%;width:116px;height:116px;margin:-58px 0 0 -58px;object-fit:contain;animation:aquaV53Victory .9s cubic-bezier(.2,1.35,.3,1) both;filter:drop-shadow(0 16px 24px rgba(0,0,0,.36));z-index:8;';
      stage.appendChild(img);
      setTimeout(() => img.remove(), 950);
    },
    fail() {
      stage.classList.remove('aqua-v53-stage-shake'); void stage.offsetWidth; stage.classList.add('aqua-v53-stage-shake');
    },
  };
}

function attachPanel({ fishing, inventory }) {
  const village = document.getElementById('screen-village');
  if (!village || document.getElementById('v53-casual-panel')) return;
  document.getElementById('v52-casual-panel')?.remove?.();
  const panel = document.createElement('div');
  panel.id = 'v53-casual-panel';
  panel.className = 'v53-casual-panel mt-4';
  panel.innerHTML = `
    <span class="v53-casual-badge">CASUAL UX 5.3</span>
    <h3 class="mt-2 text-xl font-black tracking-tight">낚시 화면 정리 · 가방 팝업 개선</h3>
    <p class="mt-1 text-xs text-white/70 leading-relaxed">상단/하단 UI 겹침을 줄이고, 텐션 안전지대·찌 터치·가방 그리드를 더 명확하게 정리했습니다.</p>
    <div class="v53-casual-actions"><button id="v53-cast-shortcut">바로 던지기</button><button id="v53-bag-shortcut">가방 열기</button><button id="v53-save-shortcut">저장</button></div>`;
  const anchor = document.getElementById('v51-stability-panel') || document.getElementById('v50-performance-panel') || village.firstElementChild;
  anchor?.insertAdjacentElement('afterend', panel);
  document.getElementById('v53-cast-shortcut')?.addEventListener('click', () => { window.switchScreen?.('fishing'); fishing.startCast(); });
  document.getElementById('v53-bag-shortcut')?.addEventListener('click', () => inventory.open());
  document.getElementById('v53-save-shortcut')?.addEventListener('click', () => aquaStore.save());
}

function boot() {
  ensureStyle();
  document.body.classList.add('aqua-v53-ready');
  const fishingVisual = document.getElementById('fishing-visual') || document.getElementById('screen-fishing') || document.body;
  if (getComputedStyle(fishingVisual).position === 'static') fishingVisual.style.position = 'relative';
  const spriteRuntime = createSpriteRuntime(fishingVisual);
  const inventory = createInventorySystem({ store: aquaStore, host: document.body });
  const fishing = createFishingSystem({ store: aquaStore, runtime: spriteRuntime, root: fishingVisual });
  createNavigator({ store: aquaStore, fishingSystem: fishing, inventorySystem: inventory, host: document.body });
  fishing.start();
  attachPanel({ fishing, inventory });

  aquaStore.on('phase', ({ payload }) => setFishingBodyClass(payload.phase));
  setFishingBodyClass(aquaStore.getState().phase);

  document.getElementById('cast-btn')?.addEventListener('click', () => fishing.startCast(), { passive: true });
  document.getElementById('bite-target')?.addEventListener('click', () => fishing.hook(), { passive: true });
  window.AquaFantasiaV53 = { version: VERSION, store: aquaStore, fishing, inventory, runtime: spriteRuntime };
  console.log(`[AquaFantasia] v${VERSION} casual UX polish runtime ready`);
}

ready(boot);
