// Aqua Fantasia v5.2 Casual Runtime Connector
// ------------------------------------------------------
// 정적 GitHub Pages 환경에서도 동작하도록 Pixi 빌드 없이 DOM/Sprite 레이어를 우선 연결합니다.
// Vite 빌드 환경에서는 src/engine/fishingPixiRuntime.ts가 실제 Pixi.js 엔진 역할을 이어받습니다.

import { ASSETS, GAME_PHASE, aquaStore } from '../core/state.js';
import { createFishingSystem } from '../systems/fishing.js';
import { createInventorySystem } from '../systems/inventory.js';
import { createNavigator } from '../ui/navigator.js';

const VERSION = '5.2.0';

function ready(fn) {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
  else fn();
}

function ensureStyle() {
  if (document.getElementById('aqua-casual-v52-style')) return;
  const style = document.createElement('style');
  style.id = 'aqua-casual-v52-style';
  style.textContent = `
    #aqua-casual-stage{position:absolute;inset:0;z-index:5;pointer-events:none;overflow:hidden;border-radius:inherit;background-image:linear-gradient(180deg,rgba(5,18,36,.05),rgba(6,78,92,.18)),url('${ASSETS.background}');background-size:cover;background-position:center;opacity:.92}
    .aqua-casual-bobber{position:absolute;width:64px;height:64px;left:50%;top:42%;margin:-32px 0 0 -32px;background:url('${ASSETS.bobber}') center/contain no-repeat;filter:drop-shadow(0 14px 18px rgba(0,0,0,.32));transform:translate3d(0,0,0);transition:filter .2s ease}
    .aqua-casual-line{position:absolute;left:18%;top:16%;width:38%;height:4px;background:linear-gradient(90deg,rgba(255,255,255,.15),rgba(181,245,255,.92));border-radius:999px;transform-origin:left center;filter:drop-shadow(0 0 6px rgba(103,232,249,.72));opacity:.75}
    .aqua-casual-ripple{position:absolute;width:98px;height:98px;margin:-49px 0 0 -49px;background:url('${ASSETS.ripple}') center/contain no-repeat;opacity:0;transform:scale(.2);filter:drop-shadow(0 0 18px rgba(103,232,249,.7))}
    .aqua-casual-ripple.active{animation:aquaV52Ripple .82s ease-out both}
    .aqua-casual-bite-mark{position:absolute;left:50%;top:37%;transform:translate(-50%,-50%);padding:8px 12px;border-radius:999px;background:linear-gradient(180deg,#fff7ad,#fb923c);color:#341400;font-weight:1000;font-size:16px;opacity:0;box-shadow:0 10px 28px rgba(251,146,60,.35)}
    .aqua-casual-bite-mark.active{animation:aquaV52Bite .62s ease-in-out infinite alternate}
    .aqua-casual-stage-shake{animation:aquaV52Shake .28s linear both}
    @keyframes aquaV52Ripple{0%{opacity:.9;transform:scale(.15)}100%{opacity:0;transform:scale(2.6)}}
    @keyframes aquaV52Bite{0%{opacity:.82;transform:translate(-50%,-54%) scale(.94)}100%{opacity:1;transform:translate(-50%,-62%) scale(1.08)}}
    @keyframes aquaV52Shake{0%,100%{transform:translate3d(0,0,0)}25%{transform:translate3d(-5px,3px,0)}50%{transform:translate3d(4px,-4px,0)}75%{transform:translate3d(-3px,2px,0)}}
    .v52-casual-panel{position:relative;overflow:hidden;border-radius:1.45rem;padding:1rem;background:linear-gradient(135deg,rgba(253,186,116,.18),rgba(45,212,191,.15),rgba(168,85,247,.12)),url('${ASSETS.background}');background-size:cover;border:1px solid rgba(255,255,255,.18);box-shadow:0 18px 50px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.18);}
    .v52-casual-badge{display:inline-flex;align-items:center;gap:.35rem;border-radius:999px;padding:.32rem .62rem;background:rgba(255,255,255,.16);font-size:.68rem;font-weight:1000;color:#fff7ad;letter-spacing:.06em}
    .v52-casual-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;margin-top:.8rem}.v52-casual-actions button{border:0;border-radius:1rem;padding:.7rem .45rem;font-size:.72rem;font-weight:1000;color:#07203a;background:linear-gradient(180deg,#fff7ad,#67e8f9);box-shadow:0 10px 24px rgba(0,0,0,.24)}
  `;
  document.head.appendChild(style);
}

function createSpriteRuntime(host) {
  ensureStyle();
  const stage = document.createElement('div');
  stage.id = 'aqua-casual-stage';
  stage.innerHTML = `<i class="aqua-casual-line"></i><i class="aqua-casual-bobber"></i><i class="aqua-casual-ripple"></i><b class="aqua-casual-bite-mark">입질!</b>`;
  host.appendChild(stage);
  const line = stage.querySelector('.aqua-casual-line');
  const bobber = stage.querySelector('.aqua-casual-bobber');
  const ripple = stage.querySelector('.aqua-casual-ripple');
  const mark = stage.querySelector('.aqua-casual-bite-mark');

  function place(pos = { x: 0.5, y: 0.42 }) {
    const x = Math.round(pos.x * 100);
    const y = Math.round(pos.y * 100);
    bobber.style.left = `${x}%`;
    bobber.style.top = `${y}%`;
    ripple.style.left = `${x}%`;
    ripple.style.top = `${y}%`;
    mark.style.left = `${x}%`;
    mark.style.top = `${Math.max(12, y - 9)}%`;
    const dx = x - 18;
    const dy = y - 16;
    line.style.width = `${Math.max(24, Math.sqrt(dx * dx + dy * dy))}%`;
    line.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
  }

  return {
    cast() {
      mark.classList.remove('active');
      const start = performance.now();
      const duration = 760;
      const animate = () => {
        const t = Math.min(1, (performance.now() - start) / duration);
        const e = 1 - Math.pow(1 - t, 3);
        const x = 18 + (50 - 18) * e;
        const y = 16 + (42 - 16) * e - Math.sin(e * Math.PI) * 23;
        place({ x: x / 100, y: y / 100 });
        bobber.style.transform = `translate3d(0,0,0) rotate(${(-18 + e * 36).toFixed(1)}deg) scale(${0.8 + e * 0.18})`;
        if (t < 1) requestAnimationFrame(animate);
        else this.wait();
      };
      animate();
    },
    wait() { place({ x: 0.5, y: 0.42 }); bobber.style.filter = 'drop-shadow(0 14px 18px rgba(0,0,0,.32))'; },
    bite(pos) {
      place(pos || { x: 0.5, y: 0.42 });
      ripple.classList.remove('active'); void ripple.offsetWidth; ripple.classList.add('active');
      mark.classList.add('active');
      stage.classList.remove('aqua-casual-stage-shake'); void stage.offsetWidth; stage.classList.add('aqua-casual-stage-shake');
    },
    reel() { mark.classList.remove('active'); bobber.style.filter = 'drop-shadow(0 0 20px rgba(251,191,36,.9))'; },
    update(frame) {
      if (frame?.phase === GAME_PHASE.REELING) {
        const n = (performance.now() / 240) % (Math.PI * 2);
        place({ x: 0.5 + Math.sin(n) * 0.11, y: 0.42 + Math.cos(n * 0.8) * 0.035 });
      }
    },
    playVictory(icon) {
      const img = document.createElement('img');
      img.src = icon || ASSETS.fishIcons[0];
      img.style.cssText = 'position:absolute;left:50%;top:38%;width:104px;height:104px;margin:-52px 0 0 -52px;object-fit:contain;animation:aquaFishVictory .82s cubic-bezier(.2,1.35,.3,1) both;filter:drop-shadow(0 16px 24px rgba(0,0,0,.36));';
      stage.appendChild(img); setTimeout(() => img.remove(), 900);
    },
    fail() { stage.classList.remove('aqua-casual-stage-shake'); void stage.offsetWidth; stage.classList.add('aqua-casual-stage-shake'); },
  };
}

function attachPanel() {
  const village = document.getElementById('screen-village');
  if (!village || document.getElementById('v52-casual-panel')) return;
  const panel = document.createElement('div');
  panel.id = 'v52-casual-panel';
  panel.className = 'v52-casual-panel mt-4';
  panel.innerHTML = `
    <span class="v52-casual-badge">CASUAL FISHING 5.2</span>
    <h3 class="mt-2 text-xl font-black tracking-tight">통통 튀는 캐주얼 낚시 리팩토링</h3>
    <p class="mt-1 text-xs text-white/70 leading-relaxed">찌·물결·밀당 게이지·가방 팝업을 Sprite 중심 구조와 상태 이벤트로 다시 연결했습니다.</p>
    <div class="v52-casual-actions"><button id="v52-cast-shortcut">낚시 던지기</button><button id="v52-bag-shortcut">가방 열기</button><button id="v52-save-shortcut">저장</button></div>`;
  const anchor = document.getElementById('v51-stability-panel') || document.getElementById('v50-performance-panel') || village.firstElementChild;
  anchor?.insertAdjacentElement('afterend', panel);
}

function boot() {
  ensureStyle();
  const fishingVisual = document.getElementById('fishing-visual') || document.getElementById('screen-fishing') || document.body;
  if (getComputedStyle(fishingVisual).position === 'static') fishingVisual.style.position = 'relative';
  const spriteRuntime = createSpriteRuntime(fishingVisual);
  const inventory = createInventorySystem({ store: aquaStore, host: document.body });
  const fishing = createFishingSystem({ store: aquaStore, runtime: spriteRuntime, root: fishingVisual });
  createNavigator({ store: aquaStore, fishingSystem: fishing, inventorySystem: inventory, host: document.body });
  fishing.start();
  attachPanel();

  document.getElementById('v52-cast-shortcut')?.addEventListener('click', () => { window.switchScreen?.('fishing'); fishing.startCast(); });
  document.getElementById('v52-bag-shortcut')?.addEventListener('click', () => inventory.open());
  document.getElementById('v52-save-shortcut')?.addEventListener('click', () => aquaStore.save());

  // 기존 버튼도 새 시스템에 느슨하게 연결합니다.
  document.getElementById('cast-btn')?.addEventListener('click', () => fishing.startCast(), { passive: true });
  document.getElementById('bite-target')?.addEventListener('click', () => fishing.hook(), { passive: true });
  window.AquaFantasiaV52 = { version: VERSION, store: aquaStore, fishing, inventory, runtime: spriteRuntime };
  console.log(`[AquaFantasia] v${VERSION} casual fishing runtime ready`);
}

ready(boot);
