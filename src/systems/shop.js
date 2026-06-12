// Aqua Fantasia v5.4 Casual Result & Shop Polish - 상점/정산 시스템
// ------------------------------------------------------------------
// panel_1.png를 공통 팝업 베이스로 사용해 상점, 일괄 판매, 장비 꾸미기 구매 흐름을 제공합니다.
// 실제 서버 결제 없이 무료 플랜/로컬 상태 기준으로 동작하며, Firebase 동기화 전에도 안전하게 플레이됩니다.

import { ASSETS, aquaStore } from '../core/state.js';

const SHOP_ITEMS = [
  { id: 'bait-bubble', name: '방울 미끼', desc: '입질 대기 시간이 살짝 짧아져요.', price: 120, emoji: '🫧' },
  { id: 'rod-jelly', name: '젤리 낚싯대', desc: '텐션 흔들림이 부드러워져요.', price: 260, emoji: '🎣' },
  { id: 'skin-macaron', name: '마카롱 찌 스킨', desc: '찌가 더 통통 튀는 색감으로 보여요.', price: 420, emoji: '🍬' },
];

function ensureStyle() {
  if (document.getElementById('aqua-shop-v54-style')) return;
  const style = document.createElement('style');
  style.id = 'aqua-shop-v54-style';
  style.textContent = `
    .aqua-shop-v54-backdrop{position:fixed;inset:0;z-index:86;display:none;align-items:flex-end;justify-content:center;padding:0 12px calc(14px + env(safe-area-inset-bottom,0px));background:rgba(2,6,23,.54);backdrop-filter:blur(9px)}
    .aqua-shop-v54-backdrop.open{display:flex;animation:aquaShopFadeV54 .18s ease both}
    .aqua-shop-v54-panel{width:min(440px,100%);max-height:min(82vh,620px);overflow:auto;border-radius:32px 32px 24px 24px;padding:18px;color:#fff;background-image:linear-gradient(180deg,rgba(12,74,110,.86),rgba(4,14,31,.96)),url('${ASSETS.panel}');background-size:100% 100%,cover;border:1px solid rgba(255,255,255,.18);box-shadow:0 -22px 64px rgba(0,0,0,.44),inset 0 1px 0 rgba(255,255,255,.22);animation:aquaShopPopV54 .5s cubic-bezier(.2,1.25,.24,1) both;transform-origin:50% 100%}
    .aqua-shop-v54-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}.aqua-shop-v54-head h3{margin:0;font-size:21px;font-weight:1000;letter-spacing:-.045em}.aqua-shop-v54-gold{display:inline-flex;align-items:center;gap:5px;border-radius:999px;padding:7px 10px;background:linear-gradient(180deg,#fff7ad,#facc15);color:#422006;font-size:12px;font-weight:1000;box-shadow:0 12px 20px rgba(250,204,21,.18)}.aqua-shop-v54-close{border:0;width:34px;height:34px;border-radius:999px;background:rgba(255,255,255,.13);color:#fff;font-size:18px;font-weight:1000}
    .aqua-shop-v54-list{display:grid;gap:10px}.aqua-shop-v54-item{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;border-radius:22px;padding:12px;background:linear-gradient(180deg,rgba(255,255,255,.14),rgba(255,255,255,.06));border:1px solid rgba(255,255,255,.13)}.aqua-shop-v54-emoji{width:42px;height:42px;display:grid;place-items:center;border-radius:16px;background:linear-gradient(180deg,#fef3c7,#67e8f9);font-size:22px;box-shadow:0 10px 22px rgba(0,0,0,.18)}.aqua-shop-v54-item b{display:block;font-size:14px}.aqua-shop-v54-item small{display:block;margin-top:3px;color:rgba(224,242,254,.76);font-weight:800;line-height:1.25}.aqua-shop-v54-buy{border:0;border-radius:999px;padding:10px 12px;background:linear-gradient(180deg,#fff7ad,#67e8f9);color:#082f49;font-size:12px;font-weight:1000}.aqua-shop-v54-buy.owned{background:rgba(255,255,255,.12);color:#fff}.aqua-shop-v54-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}.aqua-shop-v54-actions button{border:0;border-radius:18px;padding:12px 10px;font-weight:1000;background:rgba(255,255,255,.13);color:#fff;border:1px solid rgba(255,255,255,.12)}.aqua-shop-v54-actions button.primary{background:linear-gradient(180deg,#fb923c,#fff7ad);color:#431407;border:0}
    .aqua-toast-v54{position:fixed;left:50%;bottom:calc(108px + env(safe-area-inset-bottom,0px));z-index:120;transform:translateX(-50%);padding:10px 14px;border-radius:999px;background:rgba(2,8,23,.86);color:#fff7ad;font-size:12px;font-weight:1000;box-shadow:0 14px 34px rgba(0,0,0,.32);animation:aquaToastV54 1.15s ease both;pointer-events:none;white-space:nowrap}
    @keyframes aquaShopFadeV54{from{opacity:0}to{opacity:1}}@keyframes aquaShopPopV54{0%{opacity:0;transform:translateY(100%) scale(.88)}62%{opacity:1;transform:translateY(-14px) scale(1.025)}100%{opacity:1;transform:translateY(0) scale(1)}}@keyframes aquaToastV54{0%{opacity:0;transform:translate(-50%,10px) scale(.94)}18%,82%{opacity:1;transform:translate(-50%,0) scale(1)}100%{opacity:0;transform:translate(-50%,-8px) scale(.96)}}
  `;
  document.head.appendChild(style);
}

export function showAquaToastV54(message) {
  const old = document.querySelector('.aqua-toast-v54');
  old?.remove?.();
  const toast = document.createElement('div');
  toast.className = 'aqua-toast-v54';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 1200);
}

export function createShopSystem({ store = aquaStore, host = document.body } = {}) {
  ensureStyle();
  let backdrop = host.querySelector('.aqua-shop-v54-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'aqua-shop-v54-backdrop';
    backdrop.innerHTML = `
      <section class="aqua-shop-v54-panel" role="dialog" aria-label="상점">
        <header class="aqua-shop-v54-head"><div><h3>몽글 상점</h3><span class="aqua-shop-v54-gold">🪙 <b>0</b> G</span></div><button class="aqua-shop-v54-close" aria-label="닫기">×</button></header>
        <div class="aqua-shop-v54-list"></div>
        <footer class="aqua-shop-v54-actions"><button class="primary aqua-shop-v54-sell-all">물고기 일괄 판매</button><button class="aqua-shop-v54-open-bag">가방 보기</button></footer>
      </section>`;
    host.appendChild(backdrop);
  }
  const goldEl = backdrop.querySelector('.aqua-shop-v54-gold b');
  const list = backdrop.querySelector('.aqua-shop-v54-list');

  function render() {
    const state = store.getState();
    const owned = new Set(state.shop?.owned || []);
    goldEl.textContent = String(Math.round(Number(state.player?.gold || 0)));
    list.innerHTML = SHOP_ITEMS.map((item) => {
      const isOwned = owned.has(item.id);
      return `<article class="aqua-shop-v54-item"><i class="aqua-shop-v54-emoji">${item.emoji}</i><div><b>${item.name}</b><small>${item.desc}</small></div><button class="aqua-shop-v54-buy${isOwned ? ' owned' : ''}" data-id="${item.id}">${isOwned ? '보유' : `${item.price}G`}</button></article>`;
    }).join('');
  }

  function open() { render(); backdrop.classList.add('open'); document.body.classList.add('aqua-modal-open'); }
  function close() { backdrop.classList.remove('open'); document.body.classList.remove('aqua-modal-open'); }

  function sellAll() {
    const state = store.getState();
    const items = [...state.inventory];
    if (!items.length) { showAquaToastV54('판매할 물고기가 없어요'); return 0; }
    const earned = items.reduce((sum, item) => sum + Math.max(1, Math.round(Number(item.value || 80))), 0);
    store.setState({ inventory: [], player: { ...state.player, gold: Number(state.player.gold || 0) + earned } }, 'shop:sellAll');
    store.emit('shop:sellAll', { earned, count: items.length });
    store.save();
    showAquaToastV54(`${items.length}마리 판매 +${earned}G`);
    render();
    return earned;
  }

  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) close();
    const buy = event.target.closest?.('.aqua-shop-v54-buy');
    if (buy) {
      const item = SHOP_ITEMS.find((entry) => entry.id === buy.dataset.id);
      if (!item || buy.classList.contains('owned')) return;
      const ok = store.buyShopItem(item);
      showAquaToastV54(ok ? `${item.name} 구매 완료!` : '골드가 부족해요');
      render();
    }
  });
  backdrop.querySelector('.aqua-shop-v54-close')?.addEventListener('click', close);
  backdrop.querySelector('.aqua-shop-v54-sell-all')?.addEventListener('click', sellAll);
  store.on('change', () => { if (backdrop.classList.contains('open')) render(); });
  render();

  return { open, close, render, sellAll, element: backdrop, items: SHOP_ITEMS };
}
