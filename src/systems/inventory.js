// Aqua Fantasia v5.3 Casual UX Polish - 도감/인벤토리 시스템
// --------------------------------------------------------
// panel_1.png를 기본 팝업 베이스로 사용하고, 하단에서 띠용~ 튀어 오르는 4x3 그리드 UX를 제공합니다.

import { ASSETS, aquaStore } from '../core/state.js';

function ensureStyle() {
  if (document.getElementById('aqua-inventory-v53-style')) return;
  const style = document.createElement('style');
  style.id = 'aqua-inventory-v53-style';
  style.textContent = `
    .aqua-inventory-v53-backdrop{position:fixed;inset:0;z-index:80;background:rgba(2,6,23,.52);backdrop-filter:blur(8px);display:none;align-items:flex-end;justify-content:center;padding:0 12px calc(12px + env(safe-area-inset-bottom,0px));}
    .aqua-inventory-v53-backdrop.open{display:flex;animation:aquaInventoryFade .18s ease both}
    .aqua-inventory-v53-panel{width:min(430px,100%);border-radius:30px 30px 24px 24px;overflow:hidden;background-image:linear-gradient(180deg,rgba(4,24,48,.82),rgba(3,12,28,.95)),url('${ASSETS.panel}');background-size:100% 100%,cover;border:1px solid rgba(255,255,255,.18);box-shadow:0 -18px 58px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.22);padding:18px;transform-origin:50% 100%;animation:aquaInventoryPopV53 .52s cubic-bezier(.18,1.32,.28,1) both;color:white;}
    .aqua-inventory-v53-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}.aqua-inventory-v53-head h3{margin:0;font-size:20px;font-weight:1000;letter-spacing:-.04em}.aqua-inventory-v53-head span{font-size:12px;color:rgba(224,242,254,.74);font-weight:800}.aqua-inventory-v53-close{border:0;border-radius:999px;width:34px;height:34px;background:rgba(255,255,255,.12);color:#fff;font-weight:1000}
    .aqua-inventory-grid-v53{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;min-height:246px}.aqua-inventory-slot-v53{position:relative;aspect-ratio:1;border-radius:20px;background:linear-gradient(180deg,rgba(255,255,255,.12),rgba(255,255,255,.05));border:1px solid rgba(255,255,255,.13);display:grid;place-items:center;overflow:hidden;box-shadow:inset 0 1px 0 rgba(255,255,255,.12)}.aqua-inventory-slot-v53 img{width:68%;height:68%;object-fit:contain;filter:drop-shadow(0 10px 12px rgba(0,0,0,.28));animation:aquaFishIdleV53 2.4s ease-in-out infinite}.aqua-inventory-slot-v53 small{position:absolute;left:6px;right:6px;bottom:5px;text-align:center;font-size:9px;font-weight:900;color:rgba(255,255,255,.82);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.aqua-inventory-slot-v53.empty{opacity:.36}.aqua-inventory-slot-v53.empty::after{content:"+";font-size:22px;color:rgba(255,255,255,.5);font-weight:1000}
    .aqua-inventory-v53-foot{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}.aqua-inventory-v53-foot button{border:0;border-radius:18px;padding:12px 10px;font-weight:1000;background:linear-gradient(180deg,#fff7ad,#67e8f9);color:#082f49}.aqua-inventory-v53-foot button.secondary{background:rgba(255,255,255,.12);color:white;border:1px solid rgba(255,255,255,.13)}
    @keyframes aquaInventoryFade{from{opacity:0}to{opacity:1}}@keyframes aquaInventoryPopV53{0%{opacity:0;transform:translateY(100%) scale(.88)}58%{opacity:1;transform:translateY(-16px) scale(1.025)}100%{opacity:1;transform:translateY(0) scale(1)}}@keyframes aquaFishIdleV53{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-5px) rotate(3deg)}}
  `;
  document.head.appendChild(style);
}

export function createInventorySystem({ store = aquaStore, host = document.body } = {}) {
  ensureStyle();
  let backdrop = host.querySelector('.aqua-inventory-v53-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'aqua-inventory-v53-backdrop';
    backdrop.innerHTML = `
      <section class="aqua-inventory-v53-panel" role="dialog" aria-label="가방">
        <header class="aqua-inventory-v53-head"><div><h3>통통 가방</h3><span>최근 물고기 12마리</span></div><button class="aqua-inventory-v53-close" aria-label="닫기">×</button></header>
        <div class="aqua-inventory-grid-v53"></div>
        <footer class="aqua-inventory-v53-foot"><button class="aqua-inventory-v53-sort">가치순 정렬</button><button class="secondary aqua-inventory-v53-confirm">확인</button></footer>
      </section>`;
    host.appendChild(backdrop);
  }
  const grid = backdrop.querySelector('.aqua-inventory-grid-v53');
  const title = backdrop.querySelector('.aqua-inventory-v53-head span');

  function render(sortByValue = false) {
    const items = [...store.getState().inventory];
    if (sortByValue) items.sort((a, b) => Number(b.value || 0) - Number(a.value || 0));
    const visible = items.slice(0, 12);
    title.textContent = `보관 ${items.length}마리 · 표시 ${visible.length}마리`;
    grid.innerHTML = '';
    for (let i = 0; i < 12; i++) {
      const item = visible[i];
      const slot = document.createElement('div');
      slot.className = `aqua-inventory-slot-v53${item ? '' : ' empty'}`;
      if (item) slot.innerHTML = `<img src="${item.icon}" alt="${item.name}"><small>${item.name}</small>`;
      grid.appendChild(slot);
    }
  }

  function open() {
    render(false);
    backdrop.classList.add('open');
    document.body.classList.add('aqua-modal-open');
  }

  function close() {
    backdrop.classList.remove('open');
    document.body.classList.remove('aqua-modal-open');
  }

  backdrop.addEventListener('click', (event) => { if (event.target === backdrop) close(); });
  backdrop.querySelector('.aqua-inventory-v53-close')?.addEventListener('click', close);
  backdrop.querySelector('.aqua-inventory-v53-confirm')?.addEventListener('click', close);
  backdrop.querySelector('.aqua-inventory-v53-sort')?.addEventListener('click', () => render(true));
  store.on('inventory:add', () => { if (backdrop.classList.contains('open')) render(false); });

  return { open, close, render, element: backdrop };
}
