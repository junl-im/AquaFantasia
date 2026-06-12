// Aqua Fantasia v5.2 Casual Refactor - 도감/인벤토리 시스템
// ----------------------------------------------------------
// panel_1.png를 팝업 베이스로 사용하고, 물고기 아이콘을 4x3 그리드로 자동 배치합니다.

import { ASSETS, aquaStore } from '../core/state.js';

export function isSellCandidate(fish) {
  return !!fish && !fish.isBoss && Number(fish.rarity || 1) <= 2;
}

function ensureInventoryStyle() {
  if (document.getElementById('aqua-inventory-v52-style')) return;
  const style = document.createElement('style');
  style.id = 'aqua-inventory-v52-style';
  style.textContent = `
    .aqua-inventory-backdrop{position:fixed;inset:0;z-index:70;background:rgba(2,6,23,.48);backdrop-filter:blur(8px);display:none;align-items:flex-end;justify-content:center;padding:0 12px calc(12px + env(safe-area-inset-bottom,0px));}
    .aqua-inventory-backdrop.open{display:flex;animation:aquaFadeIn .16s ease both}
    .aqua-inventory-panel{position:relative;width:min(94vw,430px);min-height:390px;border-radius:30px;padding:24px 20px 22px;background:linear-gradient(180deg,rgba(8,47,73,.86),rgba(6,22,42,.95));box-shadow:0 -18px 50px rgba(0,0,0,.42), inset 0 1px 0 rgba(255,255,255,.22);transform:translateY(120%);overflow:hidden}
    .aqua-inventory-backdrop.open .aqua-inventory-panel{animation:aquaInventoryPop .58s cubic-bezier(.18,1.45,.33,1) both}
    .aqua-inventory-panel::before{content:"";position:absolute;inset:0;background:url('${ASSETS.panel}') center/100% 100% no-repeat;opacity:.52;pointer-events:none}
    .aqua-inventory-head{position:relative;z-index:1;display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:16px;color:#fff}
    .aqua-inventory-head h3{font-size:21px;font-weight:1000;margin:0;text-shadow:0 2px 12px rgba(0,0,0,.35)}
    .aqua-inventory-close{border:0;border-radius:999px;padding:9px 12px;background:rgba(255,255,255,.16);color:white;font-weight:900}
    .aqua-fish-grid{position:relative;z-index:1;display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
    .aqua-fish-slot{height:72px;border-radius:20px;background:linear-gradient(180deg,rgba(255,255,255,.18),rgba(255,255,255,.06));border:1px solid rgba(255,255,255,.16);display:flex;align-items:center;justify-content:center;position:relative;box-shadow:inset 0 1px 0 rgba(255,255,255,.22)}
    .aqua-fish-slot img{width:48px;height:48px;object-fit:contain;filter:drop-shadow(0 8px 10px rgba(0,0,0,.28));animation:aquaFishSlotIn .32s cubic-bezier(.2,1.3,.3,1) both}
    .aqua-fish-slot b{position:absolute;right:7px;bottom:5px;font-size:10px;color:#fde68a;text-shadow:0 1px 4px #000}
    .aqua-empty-slot{opacity:.36;font-size:11px;color:rgba(255,255,255,.62);font-weight:800;text-align:center}
    @keyframes aquaInventoryPop{0%{transform:translateY(120%) scale(.96)}70%{transform:translateY(-2%) scale(1.025)}100%{transform:translateY(0) scale(1)}}
    @keyframes aquaFishSlotIn{0%{opacity:0;transform:translateY(10px) scale(.82)}100%{opacity:1;transform:translateY(0) scale(1)}}
    @keyframes aquaFadeIn{from{opacity:0}to{opacity:1}}
  `;
  document.head.appendChild(style);
}

export function createInventorySystem(options = {}) {
  const store = options.store || aquaStore;
  const host = options.host || document.body;
  ensureInventoryStyle();

  const backdrop = document.createElement('div');
  backdrop.className = 'aqua-inventory-backdrop';
  backdrop.innerHTML = `
    <section class="aqua-inventory-panel" role="dialog" aria-label="낚시 가방">
      <div class="aqua-inventory-head">
        <div><h3>🎒 낚시 가방</h3><p id="aqua-inventory-count" style="margin:3px 0 0;color:rgba(255,255,255,.7);font-size:12px;font-weight:800">0 / 12</p></div>
        <button class="aqua-inventory-close" type="button">닫기</button>
      </div>
      <div class="aqua-fish-grid" id="aqua-fish-grid"></div>
    </section>`;
  host.appendChild(backdrop);

  const grid = backdrop.querySelector('#aqua-fish-grid');
  const count = backdrop.querySelector('#aqua-inventory-count');
  const closeButton = backdrop.querySelector('.aqua-inventory-close');

  function render() {
    const state = store.getState();
    const items = state.inventory.slice(0, 12);
    count.textContent = `${items.length} / 12`;
    grid.innerHTML = '';
    for (let i = 0; i < 12; i += 1) {
      const item = items[i];
      const slot = document.createElement('div');
      slot.className = 'aqua-fish-slot';
      if (item) {
        slot.innerHTML = `<img src="${item.icon || ASSETS.fishIcons[i % ASSETS.fishIcons.length]}" alt="${item.name || '물고기'}"><b>${Number(item.value || 0).toLocaleString()}G</b>`;
        slot.title = `${item.name || '물고기'} · ${Number(item.value || 0).toLocaleString()}G`;
      } else {
        slot.innerHTML = '<span class="aqua-empty-slot">빈 칸</span>';
      }
      grid.appendChild(slot);
    }
  }

  function open() {
    render();
    backdrop.classList.add('open');
    store.emit('inventory:open', { state: store.getState() });
  }

  function close() {
    backdrop.classList.remove('open');
    store.emit('inventory:close', { state: store.getState() });
  }

  closeButton.addEventListener('click', close);
  backdrop.addEventListener('click', (event) => { if (event.target === backdrop) close(); });
  store.on('inventory:add', render);
  store.on('change', (event) => { if (backdrop.classList.contains('open')) render(event); });

  return { open, close, render, element: backdrop };
}
