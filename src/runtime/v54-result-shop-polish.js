// Aqua Fantasia v5.4 Casual Result & Shop Polish - 결과/상점 UX 연결 런타임
// ---------------------------------------------------------------------
// v5.3의 캐주얼 낚시 흐름 위에 짧고 귀여운 결과 팝업, 즉시 판매, 상점 버튼을 얹습니다.
// 기존 거대 DOM UI를 제거하지 않고 모바일에서 보이는 핵심 행동만 더 선명하게 정리합니다.

import { ASSETS, GAME_PHASE, aquaStore } from '../core/state.js';
import { createShopSystem, showAquaToastV54 } from '../systems/shop.js';

const VERSION = '5.4.0';

function ready(fn) {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
  else fn();
}

function ensureStyle() {
  if (document.getElementById('aqua-result-shop-v54-style')) return;
  const style = document.createElement('style');
  style.id = 'aqua-result-shop-v54-style';
  style.textContent = `
    body.aqua-v54-ready #v53-casual-panel{display:none!important}
    .aqua-result-v54-backdrop{position:fixed;inset:0;z-index:92;display:none;align-items:center;justify-content:center;padding:18px;background:radial-gradient(circle at 50% 30%,rgba(103,232,249,.24),rgba(2,6,23,.62));backdrop-filter:blur(7px);pointer-events:auto}.aqua-result-v54-backdrop.open{display:flex;animation:aquaResultFadeV54 .18s ease both}
    .aqua-result-v54-card{width:min(380px,94vw);position:relative;overflow:hidden;border-radius:34px;padding:20px 18px 18px;text-align:center;color:#fff;background-image:linear-gradient(180deg,rgba(14,165,233,.84),rgba(5,20,44,.96)),url('${ASSETS.panel}');background-size:100% 100%,cover;border:1px solid rgba(255,255,255,.22);box-shadow:0 26px 70px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.22);animation:aquaResultPopV54 .68s cubic-bezier(.17,1.4,.26,1) both}.aqua-result-v54-card::before{content:"";position:absolute;inset:-42%;background:conic-gradient(from 0deg,transparent,rgba(255,247,173,.22),transparent,rgba(103,232,249,.24),transparent);animation:aquaResultSpinV54 4.2s linear infinite;pointer-events:none}.aqua-result-v54-inner{position:relative;z-index:1}.aqua-result-v54-badge{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:7px 11px;background:linear-gradient(180deg,#fff7ad,#fb923c);color:#431407;font-size:12px;font-weight:1000;box-shadow:0 12px 24px rgba(251,146,60,.24)}.aqua-result-v54-fish{width:132px;height:132px;margin:12px auto 4px;object-fit:contain;filter:drop-shadow(0 18px 24px rgba(0,0,0,.32));animation:aquaResultFishV54 .78s cubic-bezier(.18,1.45,.28,1) both}.aqua-result-v54-title{margin:4px 0 2px;font-size:24px;line-height:1.02;font-weight:1000;letter-spacing:-.055em}.aqua-result-v54-meta{margin:0;color:rgba(224,242,254,.82);font-size:12px;font-weight:900}.aqua-result-v54-value{display:inline-flex;margin-top:10px;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.14);font-size:13px;font-weight:1000;color:#fff7ad}.aqua-result-v54-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:14px}.aqua-result-v54-actions button{border:0;border-radius:18px;padding:12px 10px;font-weight:1000;color:#082f49;background:linear-gradient(180deg,#fff7ad,#67e8f9);box-shadow:0 10px 22px rgba(0,0,0,.18)}.aqua-result-v54-actions button.secondary{background:rgba(255,255,255,.12);color:#fff;border:1px solid rgba(255,255,255,.15)}.aqua-result-v54-actions button.wide{grid-column:1/-1;background:linear-gradient(180deg,#fb923c,#fff7ad);color:#431407}.aqua-shop-fab-v54{position:fixed;right:14px;bottom:calc(86px + env(safe-area-inset-bottom,0px));z-index:49;border:0;border-radius:999px;padding:11px 13px;background:linear-gradient(180deg,#fff7ad,#67e8f9);color:#082f49;font-size:12px;font-weight:1000;box-shadow:0 14px 30px rgba(0,0,0,.28);display:flex;align-items:center;gap:6px}.aqua-shop-fab-v54 b{font-size:14px}.aqua-v54-panel{position:relative;overflow:hidden;border-radius:1.45rem;padding:1rem;background-image:linear-gradient(135deg,rgba(251,146,60,.19),rgba(103,232,249,.18),rgba(255,247,173,.12)),url('${ASSETS.panel}');background-size:100% 100%,cover;border:1px solid rgba(255,255,255,.18);box-shadow:0 18px 50px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.18)}.aqua-v54-badge{display:inline-flex;border-radius:999px;padding:.32rem .62rem;background:rgba(255,255,255,.16);font-size:.68rem;font-weight:1000;color:#fff7ad;letter-spacing:.06em}.aqua-v54-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;margin-top:.8rem}.aqua-v54-grid button{border:0;border-radius:1rem;padding:.72rem .45rem;font-size:.72rem;font-weight:1000;color:#082f49;background:linear-gradient(180deg,#fff7ad,#67e8f9);box-shadow:0 10px 24px rgba(0,0,0,.24)}
    @keyframes aquaResultFadeV54{from{opacity:0}to{opacity:1}}@keyframes aquaResultPopV54{0%{opacity:0;transform:translateY(30px) scale(.84)}58%{opacity:1;transform:translateY(-8px) scale(1.035)}100%{opacity:1;transform:translateY(0) scale(1)}}@keyframes aquaResultFishV54{0%{opacity:0;transform:rotate(-18deg) scale(.35)}64%{opacity:1;transform:rotate(9deg) scale(1.18)}100%{opacity:1;transform:rotate(0) scale(1)}}@keyframes aquaResultSpinV54{to{transform:rotate(1turn)}}
    @media (max-width:380px){.aqua-result-v54-card{border-radius:28px;padding:16px 14px}.aqua-result-v54-fish{width:112px;height:112px}.aqua-shop-fab-v54{bottom:calc(76px + env(safe-area-inset-bottom,0px));padding:10px 12px}}
    @media (prefers-reduced-motion:reduce){.aqua-result-v54-card,.aqua-result-v54-fish,.aqua-result-v54-card::before{animation:none!important}}
  `;
  document.head.appendChild(style);
}

function createResultFlow(shop) {
  ensureStyle();
  let lastId = '';
  let root = document.querySelector('.aqua-result-v54-backdrop');
  if (!root) {
    root = document.createElement('div');
    root.className = 'aqua-result-v54-backdrop';
    root.innerHTML = `
      <section class="aqua-result-v54-card" role="dialog" aria-label="포획 결과">
        <div class="aqua-result-v54-inner">
          <span class="aqua-result-v54-badge">✨ 포획 성공!</span>
          <img class="aqua-result-v54-fish" alt="잡은 물고기">
          <h3 class="aqua-result-v54-title">통통 물고기</h3>
          <p class="aqua-result-v54-meta">가방에 안전하게 들어갔어요</p>
          <strong class="aqua-result-v54-value">+0G 가치</strong>
          <div class="aqua-result-v54-actions"><button class="sell">바로 판매</button><button class="secondary keep">가방에 보관</button><button class="wide again">다시 던지기</button></div>
        </div>
      </section>`;
    document.body.appendChild(root);
  }
  const img = root.querySelector('.aqua-result-v54-fish');
  const title = root.querySelector('.aqua-result-v54-title');
  const meta = root.querySelector('.aqua-result-v54-meta');
  const value = root.querySelector('.aqua-result-v54-value');

  function open(item) {
    if (!item || item.id === lastId) return;
    lastId = item.id;
    img.src = item.icon || ASSETS.fishIcons[0];
    title.textContent = item.name || '통통 물고기';
    meta.textContent = `희귀도 ${item.rarity || 1} · 가방에 저장 완료`;
    value.textContent = `${Math.round(Number(item.value || 80))}G 가치`;
    root.dataset.fishId = item.id;
    root.classList.add('open');
  }
  function close() { root.classList.remove('open'); }

  root.addEventListener('click', (event) => {
    if (event.target === root) close();
    if (event.target.closest?.('.keep')) { close(); showAquaToastV54('가방에 보관했어요'); }
    if (event.target.closest?.('.sell')) {
      const sold = aquaStore.sellFish(root.dataset.fishId);
      if (sold) { showAquaToastV54(`${sold.item.name} 판매 +${sold.earned}G`); close(); }
      else showAquaToastV54('이미 정리된 물고기예요');
    }
    if (event.target.closest?.('.again')) {
      close();
      window.switchScreen?.('fishing');
      window.AquaFantasiaV53?.fishing?.startCast?.();
    }
  });

  aquaStore.on('phase', ({ payload }) => {
    if (payload.phase === GAME_PHASE.CATCH) {
      const item = payload.state?.fishing?.lastResult || aquaStore.getState().fishing.lastResult;
      window.setTimeout(() => open(item), 360);
    }
  });
  aquaStore.on('inventory:add', ({ payload }) => {
    if (aquaStore.getState().phase === GAME_PHASE.CATCH) window.setTimeout(() => open(payload.item), 360);
  });
  aquaStore.on('shop:sell', () => { if (root.classList.contains('open')) close(); shop?.render?.(); });

  return { open, close, element: root };
}

function createShopFab(shop) {
  let fab = document.querySelector('.aqua-shop-fab-v54');
  if (!fab) {
    fab = document.createElement('button');
    fab.className = 'aqua-shop-fab-v54';
    fab.type = 'button';
    fab.innerHTML = '<b>🛒</b> 상점';
    document.body.appendChild(fab);
  }
  fab.addEventListener('click', () => shop.open());
  return fab;
}

function attachVillagePanel(shop, result) {
  const village = document.getElementById('screen-village');
  if (!village || document.getElementById('aqua-v54-panel')) return;
  const panel = document.createElement('div');
  panel.id = 'aqua-v54-panel';
  panel.className = 'aqua-v54-panel mt-4';
  panel.innerHTML = `
    <span class="aqua-v54-badge">CASUAL RESULT SHOP 5.4</span>
    <h3 class="mt-2 text-xl font-black tracking-tight">짧은 결과창 · 몽글 상점 · 판매 흐름</h3>
    <p class="mt-1 text-xs text-white/70 leading-relaxed">포획 후 바로 보관/판매/재도전이 가능하고, panel_1.png 톤의 상점으로 골드 소비 루프를 연결했습니다.</p>
    <div class="aqua-v54-grid"><button id="v54-shop-shortcut">상점 열기</button><button id="v54-bag-shortcut">가방 열기</button><button id="v54-fish-shortcut">낚시 시작</button></div>`;
  const anchor = document.getElementById('v53-casual-panel') || document.getElementById('v51-stability-panel') || village.firstElementChild;
  anchor?.insertAdjacentElement('afterend', panel);
  document.getElementById('v54-shop-shortcut')?.addEventListener('click', () => shop.open());
  document.getElementById('v54-bag-shortcut')?.addEventListener('click', () => window.AquaFantasiaV53?.inventory?.open?.());
  document.getElementById('v54-fish-shortcut')?.addEventListener('click', () => { window.switchScreen?.('fishing'); window.AquaFantasiaV53?.fishing?.startCast?.(); });
}

function boot() {
  ensureStyle();
  document.body.classList.add('aqua-v54-ready');
  const shop = createShopSystem({ store: aquaStore, host: document.body });
  const result = createResultFlow(shop);
  createShopFab(shop);
  attachVillagePanel(shop, result);
  window.AquaFantasiaV54 = { version: VERSION, store: aquaStore, shop, result };
  console.log(`[AquaFantasia] v${VERSION} casual result/shop polish ready`);
}

ready(boot);
