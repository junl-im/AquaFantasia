// Aqua Fantasia v5.2 Casual Refactor - 낚시 핵심 메커니즘
// ------------------------------------------------------
// 밀당 게이지를 단순 클릭 연타가 아니라, 터치 상태(IsDown)에 따라 부드럽게 오르내리는
// 캐주얼 미니게임으로 정리합니다. 안전지대(30~70)에 3초 머무르면 포획 성공입니다.

import { ASSETS, GAME_PHASE, aquaStore, clamp, lerp, now } from '../core/state.js';

const SAFE_MIN = 30;
const SAFE_MAX = 70;
const CATCH_SECONDS = 3;

export function calculateTensionRisk(readiness = 100) {
  return Math.max(0, 100 - Number(readiness || 0));
}

function vibrate(pattern) {
  try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (error) {}
}

function ensureStyle() {
  if (document.getElementById('aqua-fishing-v52-style')) return;
  const style = document.createElement('style');
  style.id = 'aqua-fishing-v52-style';
  style.textContent = `
    .aqua-fishing-v52-ui{position:absolute;left:50%;bottom:calc(18px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:35;width:min(92vw,360px);pointer-events:auto;font-family:inherit}
    .aqua-reel-shell{position:relative;border-radius:24px;padding:13px 14px 16px;background:linear-gradient(180deg,rgba(9,42,70,.86),rgba(4,18,34,.92));box-shadow:0 20px 45px rgba(0,0,0,.32),inset 0 1px 0 rgba(255,255,255,.22);border:1px solid rgba(255,255,255,.16);overflow:hidden;touch-action:none;user-select:none}
    .aqua-reel-shell::before{content:"";position:absolute;inset:0;background:url('${ASSETS.reelBar}') center/82% 62% no-repeat;opacity:.28;filter:drop-shadow(0 6px 12px rgba(0,0,0,.24));pointer-events:none}
    .aqua-reel-label{display:flex;justify-content:space-between;align-items:center;gap:8px;position:relative;z-index:1;margin-bottom:9px;font-size:12px;color:rgba(255,255,255,.84);font-weight:900}
    .aqua-tension-track{position:relative;z-index:1;height:22px;border-radius:999px;background:linear-gradient(90deg,rgba(239,68,68,.72),rgba(74,222,128,.78) 30%,rgba(74,222,128,.82) 70%,rgba(239,68,68,.78));box-shadow:inset 0 2px 8px rgba(0,0,0,.35);overflow:hidden}
    .aqua-tension-safe{position:absolute;left:30%;right:30%;top:0;bottom:0;background:rgba(255,255,255,.22);box-shadow:0 0 18px rgba(167,243,208,.32)}
    .aqua-tension-cursor{position:absolute;top:50%;left:50%;width:34px;height:34px;margin-left:-17px;margin-top:-17px;border-radius:50%;background:radial-gradient(circle,#fff 0 18%,#fde68a 20% 43%,#fb923c 45% 72%,rgba(255,255,255,.15) 73%);box-shadow:0 0 18px rgba(251,191,36,.85);transform:translateX(0);transition:box-shadow .12s ease}
    .aqua-tension-track.danger .aqua-tension-cursor{animation:aquaDangerShake .16s linear infinite;box-shadow:0 0 22px rgba(248,113,113,.95)}
    .aqua-catch-timer{position:relative;z-index:1;height:8px;margin-top:11px;border-radius:999px;background:rgba(255,255,255,.14);overflow:hidden}
    .aqua-catch-timer>i{display:block;height:100%;width:0%;border-radius:inherit;background:linear-gradient(90deg,#67e8f9,#a7f3d0,#fde68a);box-shadow:0 0 14px rgba(103,232,249,.55)}
    .aqua-reel-hint{position:relative;z-index:1;margin-top:8px;text-align:center;font-size:12px;color:rgba(255,255,255,.82);font-weight:800}
    @keyframes aquaDangerShake{0%,100%{transform:translateX(var(--cursor-x,0px)) translateY(0)}25%{transform:translateX(calc(var(--cursor-x,0px) - 3px)) translateY(-1px)}75%{transform:translateX(calc(var(--cursor-x,0px) + 3px)) translateY(1px)}}
    .aqua-fish-victory{position:absolute;left:50%;top:42%;z-index:45;width:96px;height:96px;margin:-48px 0 0 -48px;pointer-events:none;animation:aquaFishVictory .82s cubic-bezier(.2,1.35,.3,1) both;filter:drop-shadow(0 18px 24px rgba(0,0,0,.34))}
    @keyframes aquaFishVictory{0%{opacity:0;transform:scale(.35) rotate(-28deg)}60%{opacity:1;transform:scale(1.35) rotate(12deg)}100%{opacity:0;transform:scale(1.0) rotate(360deg)}}
  `;
  document.head.appendChild(style);
}

function createUI(host) {
  ensureStyle();
  const wrapper = document.createElement('div');
  wrapper.className = 'aqua-fishing-v52-ui';
  wrapper.innerHTML = `
    <div class="aqua-reel-shell" id="aqua-reel-shell">
      <div class="aqua-reel-label"><span>밀당 게이지</span><b id="aqua-reel-state">대기</b></div>
      <div class="aqua-tension-track" id="aqua-tension-track">
        <span class="aqua-tension-safe"></span>
        <span class="aqua-tension-cursor" id="aqua-tension-cursor"></span>
      </div>
      <div class="aqua-catch-timer"><i id="aqua-catch-timer-fill"></i></div>
      <div class="aqua-reel-hint" id="aqua-reel-hint">입질 후 화면을 누르고 떼며 안전지대를 유지하세요</div>
    </div>`;
  host.appendChild(wrapper);
  return {
    wrapper,
    shell: wrapper.querySelector('#aqua-reel-shell'),
    track: wrapper.querySelector('#aqua-tension-track'),
    cursor: wrapper.querySelector('#aqua-tension-cursor'),
    timer: wrapper.querySelector('#aqua-catch-timer-fill'),
    state: wrapper.querySelector('#aqua-reel-state'),
    hint: wrapper.querySelector('#aqua-reel-hint'),
  };
}

export function createFishingSystem(options = {}) {
  const store = options.store || aquaStore;
  const root = options.root || document.body;
  const runtime = options.runtime || null;
  const ui = createUI(root);
  let raf = 0;
  let last = now();
  let isDown = false;
  let enabled = true;

  const setDown = (value) => {
    isDown = value;
    store.updateFishing({ isDown }, 'input:reel');
  };

  ui.shell.addEventListener('pointerdown', (event) => { event.preventDefault(); setDown(true); }, { passive:false });
  window.addEventListener('pointerup', () => setDown(false), { passive:true });
  window.addEventListener('pointercancel', () => setDown(false), { passive:true });

  function showVictoryFish(item) {
    const icon = item?.icon || ASSETS.fishIcons[Math.floor(Math.random() * ASSETS.fishIcons.length)];
    const img = document.createElement('img');
    img.className = 'aqua-fish-victory';
    img.src = icon;
    img.alt = item?.name || '포획 성공';
    root.appendChild(img);
    setTimeout(() => img.remove(), 900);
    runtime?.playVictory?.(icon);
  }

  function startCast() {
    store.clearResult();
    store.setPhase(GAME_PHASE.CASTING, { fishing: { message: '찌가 날아가는 중', tension: 50, progress: 0, safeSeconds: 0 } });
    runtime?.cast?.();
    setTimeout(() => {
      store.setPhase(GAME_PHASE.WAITING, { fishing: { message: '수면을 지켜보세요' } });
      runtime?.wait?.();
    }, 760);
    const biteDelay = 1300 + Math.random() * 1500;
    setTimeout(() => {
      const state = store.getState();
      if (state.phase !== GAME_PHASE.WAITING) return;
      const bitePosition = { x: 0.22 + Math.random() * 0.56, y: 0.32 + Math.random() * 0.24 };
      store.setPhase(GAME_PHASE.BITE, { fishing: { message: '입질! 찌를 터치하세요', bitePosition } });
      runtime?.bite?.(bitePosition);
      vibrate([20, 30, 20]);
    }, biteDelay);
  }

  function hook() {
    const state = store.getState();
    if (state.phase !== GAME_PHASE.BITE) return;
    store.setPhase(GAME_PHASE.REELING, { fishing: { message: '안전지대를 3초 유지하세요', tension: 50, progress: 0, safeSeconds: 0 } });
    runtime?.reel?.();
    vibrate(25);
  }

  function catchFish() {
    const icon = ASSETS.fishIcons[Math.floor(Math.random() * ASSETS.fishIcons.length)];
    const fish = store.addFish({
      name: ['방울 피라미','분홍 잉어','레몬 송어','별빛 복어','민트 가오리','통통 참치'][Math.floor(Math.random() * 6)],
      icon,
      rarity: 1 + Math.floor(Math.random() * 3),
      value: 55 + Math.floor(Math.random() * 240),
    });
    store.setPhase(GAME_PHASE.CATCH, { fishing: { message: `${fish.name} 포획!`, progress: 100, safeSeconds: CATCH_SECONDS, lastResult: fish } });
    showVictoryFish(fish);
    vibrate([30, 30, 60]);
    store.save();
  }

  function fail(reason = '장력이 위험 구간에 오래 머물렀습니다') {
    store.setPhase(GAME_PHASE.FAIL, { fishing: { message: reason } });
    runtime?.fail?.(reason);
    vibrate([20, 50, 20]);
    setTimeout(() => store.setPhase(GAME_PHASE.READY, { fishing: { message: '다시 던질 준비 완료', tension: 50, progress: 0, safeSeconds: 0 } }), 900);
  }

  function tick() {
    if (!enabled) return;
    const t = now();
    const dt = Math.min(0.05, Math.max(0.001, (t - last) / 1000));
    last = t;
    const state = store.getState();

    if (state.phase === GAME_PHASE.REELING) {
      const f = state.fishing;
      const drift = isDown ? 54 : -38;
      const noise = Math.sin(t / 180) * 10 + Math.cos(t / 370) * 7;
      const targetTension = clamp(f.tension + (drift + noise) * dt, 0, 100);
      const tension = lerp(f.tension, targetTension, 0.42);
      const inSafe = tension >= SAFE_MIN && tension <= SAFE_MAX;
      const safeSeconds = clamp(f.safeSeconds + (inSafe ? dt : -dt * 0.85), 0, CATCH_SECONDS);
      const progress = clamp((safeSeconds / CATCH_SECONDS) * 100, 0, 100);
      const danger = tension < 15 || tension > 88;

      if (danger && Math.random() < 0.05) vibrate(12);
      if (tension <= 2 || tension >= 98) {
        fail(tension >= 98 ? '장력이 터졌어요! 손을 잠깐 떼세요' : '줄이 너무 느슨해졌어요! 다시 감아야 해요');
      } else if (safeSeconds >= CATCH_SECONDS) {
        catchFish();
      } else {
        store.updateFishing({ tension, safeSeconds, progress, isDown, message: inSafe ? '좋아요! 안전지대 유지' : '게이지를 녹색 구간으로 맞추세요' }, 'fishing:tick');
      }
    }

    render();
    raf = requestAnimationFrame(tick);
  }

  function render() {
    const state = store.getState();
    const f = state.fishing;
    ui.wrapper.style.display = state.phase === GAME_PHASE.REELING ? 'block' : 'none';
    const x = clamp(f.tension, 0, 100);
    ui.cursor.style.left = `${x}%`;
    ui.cursor.style.setProperty('--cursor-x', '0px');
    ui.timer.style.width = `${clamp(f.progress, 0, 100)}%`;
    const danger = x < 20 || x > 82;
    ui.track.classList.toggle('danger', danger);
    ui.state.textContent = danger ? '위험!' : x >= SAFE_MIN && x <= SAFE_MAX ? '안전' : '조절';
    ui.hint.textContent = f.message || '안전지대를 유지하세요';
    runtime?.update?.({ phase: state.phase, tension: x, progress: f.progress, isDown, bitePosition: f.bitePosition });
  }

  function start() {
    if (raf) cancelAnimationFrame(raf);
    last = now();
    enabled = true;
    raf = requestAnimationFrame(tick);
  }

  function stop() {
    enabled = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  // BITE 단계에서 찌를 직접 누르거나 외부 UI가 hook 이벤트를 호출할 수 있도록 노출합니다.
  store.on('runtime:hook', hook);

  return { start, stop, startCast, hook, fail, catchFish, setDown, get isDown() { return isDown; } };
}
