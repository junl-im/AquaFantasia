// Aqua Fantasia v5.3 Casual UX Polish - 캐주얼 내비게이터 UI
// --------------------------------------------------------
// 기존 대형 UI와 겹치지 않도록 작고 명확한 상태 안내/행동 버튼만 제공합니다.

import { GAME_PHASE, aquaStore } from '../core/state.js';

function ensureStyle() {
  if (document.getElementById('aqua-navigator-v53-style')) return;
  const style = document.createElement('style');
  style.id = 'aqua-navigator-v53-style';
  style.textContent = `
    .aqua-nav-v53{position:fixed;left:12px;right:12px;top:calc(10px + env(safe-area-inset-top,0px));z-index:43;display:flex;justify-content:center;pointer-events:none;font-family:inherit}.aqua-nav-v53-card{width:min(390px,100%);border-radius:22px;padding:10px 12px;background:linear-gradient(180deg,rgba(2,8,23,.68),rgba(8,47,73,.64));border:1px solid rgba(255,255,255,.14);box-shadow:0 16px 32px rgba(0,0,0,.26);backdrop-filter:blur(12px);pointer-events:auto;display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center}.aqua-nav-v53-title{font-size:13px;font-weight:1000;color:#fff7ad;line-height:1.1}.aqua-nav-v53-help{font-size:11px;font-weight:800;color:rgba(224,242,254,.75);margin-top:2px}.aqua-nav-v53-actions{display:flex;gap:6px}.aqua-nav-v53-actions button{border:0;border-radius:999px;padding:9px 10px;background:rgba(255,255,255,.12);color:#fff;font-size:12px;font-weight:1000}.aqua-nav-v53-actions button.primary{background:linear-gradient(180deg,#fff7ad,#67e8f9);color:#082f49}.aqua-nav-v53-actions button:disabled{opacity:.42}.aqua-nav-v53-min{display:none}
    body.aqua-fishing-active .aqua-nav-v53{top:calc(6px + env(safe-area-inset-top,0px))}body.aqua-fishing-active .aqua-nav-v53-card{padding:8px 10px;border-radius:18px}body.aqua-fishing-active .aqua-nav-v53-actions .bag{display:none}
    @media (max-width:380px){.aqua-nav-v53-help{display:none}.aqua-nav-v53-actions button{padding:8px 9px;font-size:11px}}
  `;
  document.head.appendChild(style);
}

function copyForPhase(phase) {
  return {
    [GAME_PHASE.READY]: ['낚시 준비', '던지기를 눌러 찌를 던져요.'],
    [GAME_PHASE.CASTING]: ['캐스팅 중', '찌가 물에 닿고 있어요.'],
    [GAME_PHASE.WAITING]: ['입질 대기', '수면 반응을 보면 바로 챔질!'],
    [GAME_PHASE.BITE]: ['지금 챔질!', '빛나는 찌를 터치하세요.'],
    [GAME_PHASE.REELING]: ['릴 감기', '텐션을 30~70에 유지하세요.'],
    [GAME_PHASE.CATCH]: ['포획 완료', '다시 던지거나 가방을 확인해요.'],
    [GAME_PHASE.FAIL]: ['다시 도전', '놓쳤지만 바로 다시 던질 수 있어요.'],
  }[phase] || ['Aqua Fantasia', '다음 행동을 선택하세요.'];
}

export function createNavigator({ store = aquaStore, fishingSystem, inventorySystem, host = document.body } = {}) {
  ensureStyle();
  let root = host.querySelector('.aqua-nav-v53');
  if (!root) {
    root = document.createElement('div');
    root.className = 'aqua-nav-v53';
    root.innerHTML = `
      <div class="aqua-nav-v53-card">
        <div><div class="aqua-nav-v53-title">낚시 준비</div><div class="aqua-nav-v53-help">던지기를 눌러 시작해요.</div></div>
        <div class="aqua-nav-v53-actions"><button class="primary cast">던지기</button><button class="hook">챔질</button><button class="bag">가방</button></div>
      </div>`;
    host.appendChild(root);
  }
  const title = root.querySelector('.aqua-nav-v53-title');
  const help = root.querySelector('.aqua-nav-v53-help');
  const cast = root.querySelector('.cast');
  const hook = root.querySelector('.hook');
  const bag = root.querySelector('.bag');

  function render() {
    const state = store.getState();
    const [t, h] = copyForPhase(state.phase);
    title.textContent = state.fishing.lastJudge || t;
    help.textContent = state.fishing.message || h;
    cast.disabled = ![GAME_PHASE.READY, GAME_PHASE.CATCH, GAME_PHASE.FAIL].includes(state.phase);
    hook.disabled = state.phase !== GAME_PHASE.BITE;
  }

  cast.addEventListener('click', () => fishingSystem?.startCast?.());
  hook.addEventListener('click', () => fishingSystem?.hook?.());
  bag.addEventListener('click', () => inventorySystem?.open?.());
  store.on('change', render);
  render();

  return { element: root, render };
}
