// Aqua Fantasia v5.3 Casual UX Polish - 낚시 핵심 메커니즘
// -------------------------------------------------------
// 개선점:
// - 안내 문구를 상태별로 더 명확하게 보여줍니다.
// - 텐션 30~70 안전지대를 3초 유지하면 성공합니다.
// - 위험 구간에서는 게이지, 버튼, 진동 피드백을 모두 가볍게 제공합니다.
// - 성공 결과는 한 번에 쏟아내지 않고 짧은 Victory 이벤트 후 가방에 저장합니다.

import { ASSETS, GAME_PHASE, aquaStore, clamp, lerp, now, pickFishIcon } from '../core/state.js';

const SAFE_MIN = 30;
const SAFE_MAX = 70;
const CATCH_SECONDS = 3;
const LOOP_MS = 1000 / 30;

export function calculateTensionRisk(readiness = 100) {
  return Math.max(0, 100 - Number(readiness || 0));
}

function vibrate(pattern) {
  try { if (aquaStore.getState().settings.haptic !== false && navigator.vibrate) navigator.vibrate(pattern); } catch (error) {}
}

function ensureStyle() {
  if (document.getElementById('aqua-fishing-v53-style')) return;
  const style = document.createElement('style');
  style.id = 'aqua-fishing-v53-style';
  style.textContent = `
    .aqua-fishing-v53-ui{position:absolute;left:50%;bottom:calc(16px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:38;width:min(92vw,382px);pointer-events:auto;font-family:inherit;display:none}
    body.aqua-fishing-active .aqua-fishing-v53-ui{display:block}
    .aqua-reel-shell-v53{position:relative;border-radius:26px;padding:14px 14px 16px;background:linear-gradient(180deg,rgba(30,64,175,.74),rgba(5,20,44,.95));box-shadow:0 22px 48px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.24);border:1px solid rgba(255,255,255,.16);overflow:hidden;touch-action:none;user-select:none;backdrop-filter:blur(14px)}
    .aqua-reel-shell-v53::before{content:"";position:absolute;inset:0;background:url('${ASSETS.reelBar}') center 54%/78% 52% no-repeat;opacity:.31;filter:drop-shadow(0 8px 16px rgba(0,0,0,.26));pointer-events:none}
    .aqua-v53-guide{position:relative;z-index:2;display:grid;grid-template-columns:auto 1fr;gap:8px;align-items:center;margin-bottom:10px}
    .aqua-v53-guide-icon{width:36px;height:36px;border-radius:15px;display:grid;place-items:center;background:linear-gradient(180deg,#fff7ad,#fb923c);box-shadow:0 10px 20px rgba(251,146,60,.28);font-size:18px}
    .aqua-v53-guide b{display:block;font-size:13px;line-height:1.05;color:#fff7d6}.aqua-v53-guide span{display:block;margin-top:3px;font-size:11px;font-weight:800;color:rgba(224,242,254,.76)}
    .aqua-tension-track-v53{position:relative;z-index:1;height:24px;border-radius:999px;background:linear-gradient(90deg,rgba(239,68,68,.82),rgba(251,191,36,.76) 18%,rgba(74,222,128,.85) 30%,rgba(74,222,128,.9) 70%,rgba(251,191,36,.78) 82%,rgba(239,68,68,.86));box-shadow:inset 0 2px 8px rgba(0,0,0,.38);overflow:hidden}
    .aqua-tension-safe-v53{position:absolute;left:30%;right:30%;top:0;bottom:0;background:rgba(255,255,255,.20);box-shadow:0 0 18px rgba(167,243,208,.36)}
    .aqua-tension-cursor-v53{position:absolute;top:50%;left:50%;width:36px;height:36px;margin-left:-18px;margin-top:-18px;border-radius:50%;background:radial-gradient(circle,#fff 0 17%,#fde68a 20% 44%,#fb923c 46% 73%,rgba(255,255,255,.12) 74%);box-shadow:0 0 18px rgba(251,191,36,.86);transform:translateX(var(--cursor-x,0px));transition:box-shadow .12s ease}
    .aqua-tension-track-v53.danger{animation:aquaV53TrackDanger .36s linear infinite}.aqua-tension-track-v53.danger .aqua-tension-cursor-v53{animation:aquaV53DangerShake .16s linear infinite;box-shadow:0 0 24px rgba(248,113,113,.98)}
    .aqua-catch-timer-v53{position:relative;z-index:1;height:9px;margin-top:11px;border-radius:999px;background:rgba(255,255,255,.14);overflow:hidden}.aqua-catch-timer-v53>i{display:block;height:100%;width:0%;border-radius:inherit;background:linear-gradient(90deg,#67e8f9,#a7f3d0,#fde68a);box-shadow:0 0 14px rgba(103,232,249,.55);transition:width .08s linear}
    .aqua-v53-actions{position:relative;z-index:2;display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.aqua-v53-actions button{border:0;border-radius:18px;padding:12px 10px;font-size:13px;font-weight:1000;color:#07203a;background:linear-gradient(180deg,#fff7ad,#67e8f9);box-shadow:0 12px 22px rgba(0,0,0,.24);touch-action:none}.aqua-v53-actions button.secondary{background:rgba(255,255,255,.13);color:#fff;border:1px solid rgba(255,255,255,.14)}
    .aqua-v53-actions button:active{transform:translateY(2px) scale(.98)}
    .aqua-v53-toast{position:absolute;left:50%;top:24%;z-index:60;transform:translate(-50%,-50%);padding:10px 14px;border-radius:999px;background:linear-gradient(180deg,#fff7ad,#fb923c);color:#391500;font-weight:1000;box-shadow:0 18px 34px rgba(0,0,0,.30);animation:aquaV53Toast .75s cubic-bezier(.2,1.2,.25,1) both;pointer-events:none;white-space:nowrap}
    .aqua-v53-victory{position:absolute;left:50%;top:40%;z-index:61;width:116px;height:116px;margin:-58px 0 0 -58px;pointer-events:none;object-fit:contain;filter:drop-shadow(0 18px 28px rgba(0,0,0,.38));animation:aquaV53Victory .9s cubic-bezier(.2,1.45,.22,1) both}
    @keyframes aquaV53TrackDanger{0%,100%{filter:none}50%{filter:brightness(1.28) saturate(1.35)}}
    @keyframes aquaV53DangerShake{0%,100%{transform:translateX(var(--cursor-x,0px))}25%{transform:translateX(calc(var(--cursor-x,0px) - 3px)) translateY(-1px)}75%{transform:translateX(calc(var(--cursor-x,0px) + 3px)) translateY(1px)}}
    @keyframes aquaV53Toast{0%{opacity:0;transform:translate(-50%,-40%) scale(.82)}35%{opacity:1;transform:translate(-50%,-56%) scale(1.08)}100%{opacity:0;transform:translate(-50%,-72%) scale(.96)}}
    @keyframes aquaV53Victory{0%{opacity:0;transform:scale(.15) rotate(-24deg)}65%{opacity:1;transform:scale(1.24) rotate(12deg)}100%{opacity:0;transform:scale(.72) rotate(360deg)}}
    @media (max-width:430px){.aqua-fishing-v53-ui{width:calc(100vw - 20px);bottom:calc(10px + env(safe-area-inset-bottom,0px))}.aqua-reel-shell-v53{border-radius:22px;padding:12px}.aqua-v53-actions button{padding:11px 8px;font-size:12px}}
    @media (prefers-reduced-motion:reduce){.aqua-v53-toast,.aqua-v53-victory,.aqua-tension-track-v53.danger,.aqua-tension-track-v53.danger .aqua-tension-cursor-v53{animation:none!important}}
  `;
  document.head.appendChild(style);
}

function phaseCopy(phase) {
  return {
    [GAME_PHASE.READY]: ['🎣', '낚싯대 던지기', '버튼을 눌러 찌를 던져요.'],
    [GAME_PHASE.CASTING]: ['🌀', '찌 날아가는 중', '수면에 닿을 때까지 기다려요.'],
    [GAME_PHASE.WAITING]: ['👀', '수면 보기', '입질 표시가 뜨면 바로 챔질!'],
    [GAME_PHASE.BITE]: ['❗', '빛나는 찌 터치', '지금 눌러야 챔질 성공!'],
    [GAME_PHASE.REELING]: ['🧵', '안전지대 유지', '게이지를 30~70에 3초 유지해요.'],
    [GAME_PHASE.CATCH]: ['✨', '포획 성공', '가방에 물고기가 들어갔어요.'],
    [GAME_PHASE.FAIL]: ['💦', '놓쳤어요', '다시 던져서 리듬을 잡아봐요.'],
  }[phase] || ['🎣', '낚시 준비', '다음 행동을 선택하세요.'];
}

function ensureUI(root) {
  ensureStyle();
  let wrapper = root.querySelector('.aqua-fishing-v53-ui');
  if (wrapper) return wrapper;
  wrapper = document.createElement('div');
  wrapper.className = 'aqua-fishing-v53-ui';
  wrapper.innerHTML = `
    <div class="aqua-reel-shell-v53">
      <div class="aqua-v53-guide"><i class="aqua-v53-guide-icon">🎣</i><p><b>낚시 준비</b><span>던지기 버튼을 눌러 시작해요.</span></p></div>
      <div class="aqua-tension-track-v53"><i class="aqua-tension-safe-v53"></i><i class="aqua-tension-cursor-v53"></i></div>
      <div class="aqua-catch-timer-v53"><i></i></div>
      <div class="aqua-v53-actions"><button class="aqua-reel-down">누르고 릴 감기</button><button class="secondary aqua-release-line">살짝 풀기</button></div>
    </div>`;
  root.appendChild(wrapper);
  return wrapper;
}

export function createFishingSystem({ store = aquaStore, runtime, root = document.body } = {}) {
  const ui = ensureUI(root);
  const guideIcon = ui.querySelector('.aqua-v53-guide-icon');
  const guideTitle = ui.querySelector('.aqua-v53-guide b');
  const guideText = ui.querySelector('.aqua-v53-guide span');
  const track = ui.querySelector('.aqua-tension-track-v53');
  const cursor = ui.querySelector('.aqua-tension-cursor-v53');
  const timerFill = ui.querySelector('.aqua-catch-timer-v53>i');
  const reelButton = ui.querySelector('.aqua-reel-down');
  const releaseButton = ui.querySelector('.aqua-release-line');

  let raf = 0;
  let last = now();
  let biteTimer = 0;
  let lastDangerBuzz = 0;

  function setDown(value) {
    store.updateFishing({ isDown: Boolean(value), message: value ? '릴 감기 중' : '줄을 살짝 풀어요' }, 'input:reel');
  }

  reelButton.addEventListener('pointerdown', (event) => { event.preventDefault(); setDown(true); vibrate(8); });
  releaseButton.addEventListener('pointerdown', (event) => { event.preventDefault(); setDown(false); store.updateFishing({ tension: clamp(store.getState().fishing.tension - 9, 0, 100) }, 'input:release'); vibrate(12); });
  window.addEventListener('pointerup', () => setDown(false), { passive: true });
  window.addEventListener('pointercancel', () => setDown(false), { passive: true });

  function toast(text) {
    const el = document.createElement('div');
    el.className = 'aqua-v53-toast';
    el.textContent = text;
    root.appendChild(el);
    setTimeout(() => el.remove(), 780);
  }

  function victory(icon) {
    const img = document.createElement('img');
    img.className = 'aqua-v53-victory';
    img.alt = '';
    img.src = icon || pickFishIcon();
    root.appendChild(img);
    setTimeout(() => img.remove(), 920);
  }

  function randomFish() {
    const seed = Math.random();
    const icon = pickFishIcon(seed);
    const names = ['방울 피라미', '젤리 잉어', '반짝 송어', '마카롱 복어', '별빛 은어', '통통 참치'];
    return {
      name: names[Math.floor(seed * names.length)] || '통통 물고기',
      icon,
      rarity: 1 + Math.floor(seed * 3),
      value: Math.round(80 + seed * 220),
    };
  }

  function render() {
    const state = store.getState();
    const [emoji, title, text] = phaseCopy(state.phase);
    guideIcon.textContent = emoji;
    guideTitle.textContent = state.fishing.lastJudge || title;
    guideText.textContent = state.fishing.message || text;
    const tension = clamp(state.fishing.tension, 0, 100);
    const width = Math.max(1, track.clientWidth || 300);
    const x = (tension / 100) * width - width / 2;
    cursor.style.setProperty('--cursor-x', `${x.toFixed(1)}px`);
    const safe = tension >= SAFE_MIN && tension <= SAFE_MAX;
    track.classList.toggle('danger', state.phase === GAME_PHASE.REELING && !safe);
    timerFill.style.width = `${clamp((state.fishing.safeSeconds / CATCH_SECONDS) * 100, 0, 100)}%`;
    reelButton.textContent = state.phase === GAME_PHASE.REELING ? '꾹 눌러 릴 감기' : '릴 감기 준비';
  }

  function tick() {
    const t = now();
    const dt = Math.min(0.08, (t - last) / 1000 || LOOP_MS / 1000);
    last = t;
    const state = store.getState();

    if (state.phase === GAME_PHASE.WAITING && biteTimer && t >= biteTimer) {
      const pos = { x: 0.38 + Math.random() * 0.24, y: 0.40 + Math.random() * 0.13 };
      store.setPhase(GAME_PHASE.BITE, { fishing: { bitePosition: pos, message: '입질! 빛나는 찌를 터치하세요.' } });
      runtime?.bite?.(pos);
      toast('입질!');
      vibrate([20, 30, 20]);
      biteTimer = 0;
    }

    if (state.phase === GAME_PHASE.REELING) {
      const f = state.fishing;
      const target = f.isDown ? f.tension + 38 * dt : f.tension - 24 * dt;
      const wave = Math.sin(t / 210) * 4.5 * dt;
      const tension = clamp(lerp(f.tension, target, 0.55) + wave, 0, 100);
      const safe = tension >= SAFE_MIN && tension <= SAFE_MAX;
      const safeSeconds = safe ? f.safeSeconds + dt : Math.max(0, f.safeSeconds - dt * 0.75);
      const progress = clamp((safeSeconds / CATCH_SECONDS) * 100, 0, 100);
      const patch = { tension, safeSeconds, progress, message: safe ? '좋아요! 안전지대 유지 중' : (tension < SAFE_MIN ? '낮아요! 꾹 눌러 감기' : '높아요! 손을 떼고 줄 풀기'), lastJudge: safe ? 'GOOD ZONE' : '' };
      store.updateFishing(patch, 'fishing:tick');
      runtime?.update?.({ phase: GAME_PHASE.REELING, tension, progress, safe });
      if (!safe && t - lastDangerBuzz > 500) { vibrate(18); lastDangerBuzz = t; }
      if (safeSeconds >= CATCH_SECONDS) finishCatch();
      if (tension <= 2 || tension >= 98) fail(tension >= 98 ? '장력이 너무 높아요!' : '줄이 너무 느슨해요!');
    }

    render();
    raf = requestAnimationFrame(tick);
  }

  function startCast() {
    const phase = store.getState().phase;
    if (![GAME_PHASE.READY, GAME_PHASE.CATCH, GAME_PHASE.FAIL].includes(phase)) return;
    store.clearResult();
    store.setPhase(GAME_PHASE.CASTING, { fishing: { message: '찌가 포물선으로 날아가요.', tension: 50, progress: 0, safeSeconds: 0 } });
    runtime?.cast?.();
    vibrate(10);
    setTimeout(() => {
      store.setPhase(GAME_PHASE.WAITING, { fishing: { message: '수면을 보고 입질을 기다려요.' } });
      runtime?.wait?.();
      biteTimer = now() + 1050 + Math.random() * 1200;
    }, 780);
  }

  function hook() {
    if (store.getState().phase !== GAME_PHASE.BITE) return;
    store.setPhase(GAME_PHASE.REELING, { fishing: { message: '30~70 안전지대에 3초 유지!', tension: 50, safeSeconds: 0, progress: 0, isDown: false } });
    runtime?.reel?.();
    toast('챔질 성공!');
    vibrate([16, 20, 16]);
  }

  function finishCatch() {
    if (store.getState().phase !== GAME_PHASE.REELING) return;
    const fish = store.addFish(randomFish());
    store.setPhase(GAME_PHASE.CATCH, { fishing: { message: `${fish.name} 포획! 가방에 저장했어요.`, lastJudge: 'CATCH!' } });
    runtime?.playVictory?.(fish.icon);
    victory(fish.icon);
    toast('포획 성공!');
    vibrate([30, 40, 30]);
    store.save();
  }

  function fail(reason = '물고기를 놓쳤어요.') {
    if (store.getState().phase === GAME_PHASE.FAIL) return;
    store.setPhase(GAME_PHASE.FAIL, { fishing: { message: reason, lastJudge: 'MISS' } });
    runtime?.fail?.();
    toast('놓쳤어요');
    vibrate([35, 25, 35]);
  }

  function start() {
    if (!raf) { last = now(); raf = requestAnimationFrame(tick); }
    render();
  }

  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  store.on('phase', render);
  store.on('fishing', render);
  render();

  return { start, stop, startCast, hook, fail, finishCatch, setDown, element: ui };
}
