// Aqua Fantasia v5.2 Casual Refactor - 캐주얼 내비게이터 UI
// -------------------------------------------------------
// 실전 플레이 흐름을 간단하게 정리합니다: 던지기 → 입질 터치 → 밀당 → 가방 확인.

import { GAME_PHASE, aquaStore } from '../core/state.js';

export const NAVIGATOR_VERSION = '5.2.0';
export function navigatorTitle(primaryTitle = '오늘의 낚시 준비') { return String(primaryTitle || '오늘의 낚시 준비'); }

function ensureNavigatorStyle() {
  if (document.getElementById('aqua-navigator-v52-style')) return;
  const style = document.createElement('style');
  style.id = 'aqua-navigator-v52-style';
  style.textContent = `
    .aqua-nav-v52{position:fixed;left:12px;right:12px;top:calc(10px + env(safe-area-inset-top,0px));z-index:42;display:flex;justify-content:center;pointer-events:none}
    .aqua-nav-card{width:min(94vw,430px);border-radius:24px;padding:13px 14px;background:linear-gradient(135deg,rgba(255,255,255,.18),rgba(103,232,249,.12),rgba(251,191,36,.10));border:1px solid rgba(255,255,255,.18);box-shadow:0 16px 42px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.20);backdrop-filter:blur(10px);pointer-events:auto;color:white}
    .aqua-nav-top{display:flex;align-items:center;justify-content:space-between;gap:10px}
    .aqua-nav-title{font-weight:1000;letter-spacing:-.02em;font-size:15px;text-shadow:0 2px 12px rgba(0,0,0,.35)}
    .aqua-nav-phase{font-size:11px;font-weight:900;color:#fde68a;background:rgba(0,0,0,.22);padding:5px 9px;border-radius:999px}
    .aqua-nav-actions{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:10px}
    .aqua-nav-actions button{border:0;border-radius:16px;padding:10px 8px;font-size:12px;font-weight:1000;color:#052f4a;background:linear-gradient(180deg,#fef3c7,#67e8f9);box-shadow:0 8px 18px rgba(0,0,0,.22);transform:translateZ(0)}
    .aqua-nav-actions button:active{transform:scale(.96)}
    .aqua-nav-help{margin-top:8px;font-size:11px;color:rgba(255,255,255,.72);font-weight:800;line-height:1.35}
    body.aqua-fishing-active .aqua-nav-v52{top:auto;bottom:calc(112px + env(safe-area-inset-bottom,0px))}
    body.aqua-fishing-active .aqua-nav-card{background:linear-gradient(135deg,rgba(7,22,38,.72),rgba(14,165,233,.18));}
  `;
  document.head.appendChild(style);
}

export function createNavigator(options = {}) {
  const store = options.store || aquaStore;
  const fishing = options.fishingSystem;
  const inventory = options.inventorySystem;
  const host = options.host || document.body;
  ensureNavigatorStyle();

  const root = document.createElement('div');
  root.className = 'aqua-nav-v52';
  root.innerHTML = `
    <div class="aqua-nav-card">
      <div class="aqua-nav-top">
        <div class="aqua-nav-title" id="aqua-nav-title">오늘의 낚시 준비</div>
        <div class="aqua-nav-phase" id="aqua-nav-phase">READY</div>
      </div>
      <div class="aqua-nav-actions">
        <button type="button" id="aqua-nav-cast">🎣 던지기</button>
        <button type="button" id="aqua-nav-hook">⚡ 챔질</button>
        <button type="button" id="aqua-nav-bag">🎒 가방</button>
      </div>
      <div class="aqua-nav-help" id="aqua-nav-help">낚싯대 던지기 → 입질 표시 터치 → 밀당 게이지를 녹색 구간에 3초 유지</div>
    </div>`;
  host.appendChild(root);

  const title = root.querySelector('#aqua-nav-title');
  const phase = root.querySelector('#aqua-nav-phase');
  const help = root.querySelector('#aqua-nav-help');
  const cast = root.querySelector('#aqua-nav-cast');
  const hook = root.querySelector('#aqua-nav-hook');
  const bag = root.querySelector('#aqua-nav-bag');

  function render() {
    const state = store.getState();
    phase.textContent = state.phase;
    document.body.classList.toggle('aqua-fishing-active', [GAME_PHASE.CASTING, GAME_PHASE.WAITING, GAME_PHASE.BITE, GAME_PHASE.REELING].includes(state.phase));
    const byPhase = {
      [GAME_PHASE.READY]: ['오늘의 낚시 준비', '던지기를 누르면 찌가 포물선을 그리며 날아갑니다.'],
      [GAME_PHASE.CASTING]: ['찌가 날아가는 중', '수면에 떨어질 때까지 잠깐 기다리세요.'],
      [GAME_PHASE.WAITING]: ['수면 관찰', '입질이 오면 물결과 느낌표가 뜹니다.'],
      [GAME_PHASE.BITE]: ['입질!', '빛나는 찌 위치를 터치해서 챔질하세요.'],
      [GAME_PHASE.REELING]: ['밀당 중', '누르면 텐션 상승, 떼면 하강. 녹색 구간 3초 유지!'],
      [GAME_PHASE.CATCH]: ['포획 성공', '가방에서 잡은 물고기를 확인할 수 있어요.'],
      [GAME_PHASE.FAIL]: ['놓쳤어요', '장력이 너무 높거나 낮으면 실패합니다. 다시 도전!'],
    }[state.phase] || ['오늘의 낚시', '상태를 확인하고 다음 행동을 선택하세요.'];
    title.textContent = byPhase[0];
    help.textContent = byPhase[1];
    cast.disabled = ![GAME_PHASE.READY, GAME_PHASE.CATCH, GAME_PHASE.FAIL].includes(state.phase);
    hook.disabled = state.phase !== GAME_PHASE.BITE;
  }

  cast.addEventListener('click', () => fishing?.startCast?.());
  hook.addEventListener('click', () => fishing?.hook?.());
  bag.addEventListener('click', () => inventory?.open?.());
  store.on('change', render);
  render();

  return { element: root, render };
}
