// Aqua Fantasia v6.0.0 Interaction & Balance Patch
// ------------------------------------------------------------
// 1) 모든 토스트/알림을 탭 또는 좌우 스와이프로 닫을 수 있게 통일합니다.
// 2) 미션/퀘스트/보상 알림은 탭 시 해당 화면으로 이동합니다.
// 3) 낚시 난이도와 배경 수면 톤을 살짝 조정합니다.
(function aquaV60InteractionBalance() {
  const VERSION = '6.0.0';
  const CACHE_KEY = 'aqua-fantasia-v6.0.0-interaction-balance-20260612';
  const NOTICE_SELECTOR = [
    '.aqua-toast', '.aqua-toast-v54', '.aqua-v53-toast', '.aqua-v551-safe-toast',
    '.fullscreen-ribbon', '.kakao-autopilot-pill', '.aqua-v60-alert', '[data-aqua-notice]'
  ].join(',');

  const TARGETS = [
    { key: 'quests', icon: '🗓️', label: '미션으로 이동', re: /(미션|퀘스트|데일리|시즌|출석|보상|수령|reward|quest|mission|attendance)/i },
    { key: 'equipment', icon: '🧰', label: '장비로 이동', re: /(강화|장비|낚싯대|미끼|구매|상점|골드 부족|forge|rod|bait|shop)/i },
    { key: 'inventory', icon: '🎒', label: '가방으로 이동', re: /(가방|판매|인벤토리|도감|보관|fish dex|inventory|bag|sell)/i },
    { key: 'fishing', icon: '🎣', label: '낚시로 이동', re: /(낚시|입질|챔질|릴|물었다|던지|캐스팅|fishing|bite|reel|cast)/i },
  ];

  const state = {
    version: VERSION,
    decorated: 0,
    dismissed: 0,
    routed: 0,
    showToastPatched: false,
    alertPatched: false,
    balancePatched: false,
  };

  function ready(fn) {
    if (document.body) fn();
    else document.addEventListener('DOMContentLoaded', fn, { once: true });
  }

  function ensureStyle() {
    if (document.getElementById('aqua-v60-interaction-style')) return;
    const style = document.createElement('style');
    style.id = 'aqua-v60-interaction-style';
    style.textContent = `
      body.aqua-v60-interaction{--aqua-v60-notice-bg:linear-gradient(145deg,rgba(7,27,47,.94),rgba(13,93,112,.88) 52%,rgba(4,18,38,.94));--aqua-v60-notice-line:rgba(160,244,255,.26)}
      body.aqua-v60-interaction .toast-stack{pointer-events:auto!important;z-index:260!important;gap:10px!important;top:calc(12px + env(safe-area-inset-top,0px))!important}
      body.aqua-v60-interaction .aqua-toast,
      body.aqua-v60-interaction .aqua-toast-v54,
      body.aqua-v60-interaction .aqua-v53-toast,
      body.aqua-v60-interaction .aqua-v551-safe-toast,
      body.aqua-v60-interaction .fullscreen-ribbon,
      body.aqua-v60-interaction .kakao-autopilot-pill,
      body.aqua-v60-interaction .aqua-v60-alert{pointer-events:auto!important;touch-action:pan-y!important;user-select:none;-webkit-user-select:none;cursor:pointer;will-change:transform,opacity;position:relative;overflow:hidden;border:1px solid var(--aqua-v60-notice-line)!important;background-image:var(--aqua-v60-notice-bg)!important;box-shadow:0 18px 42px rgba(0,8,24,.38),inset 0 1px 0 rgba(255,255,255,.22),inset 0 -14px 24px rgba(0,10,30,.20)!important;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
      body.aqua-v60-interaction .aqua-toast[data-aqua-target]::after,
      body.aqua-v60-interaction .aqua-v60-alert[data-aqua-target]::after{content:attr(data-aqua-target-label);position:absolute;right:12px;bottom:7px;font-size:10px;font-weight:1000;letter-spacing:-.02em;color:rgba(208,252,255,.74)}
      body.aqua-v60-interaction .aqua-toast::before,
      body.aqua-v60-interaction .aqua-v60-alert::before{content:'';position:absolute;left:-25%;top:-80%;width:70%;height:200%;transform:rotate(16deg);background:linear-gradient(90deg,transparent,rgba(255,255,255,.16),transparent);opacity:.66;pointer-events:none;animation:aquaV60NoticeSheen 3.8s ease-in-out infinite}
      body.aqua-v60-interaction .aqua-v60-notice-x{position:absolute;right:8px;top:7px;width:22px;height:22px;border-radius:999px;display:grid;place-items:center;background:rgba(255,255,255,.11);border:1px solid rgba(255,255,255,.14);font-size:12px;font-weight:1000;color:rgba(255,255,255,.82);pointer-events:none}
      body.aqua-v60-interaction .aqua-v60-alert{position:fixed;left:50%;top:calc(20px + env(safe-area-inset-top,0px));z-index:9999;transform:translateX(-50%);width:min(92vw,440px);border-radius:24px;padding:16px 44px 16px 16px;color:#ecfeff;font-size:14px;line-height:1.45;font-weight:800}.aqua-v60-alert strong{display:block;font-size:12px;color:#a5f3fc;margin-bottom:3px}.aqua-v60-alert p{margin:0;white-space:pre-wrap}
      body.aqua-v60-interaction .aqua-v60-dismissed{pointer-events:none!important;animation:none!important;transition:transform .22s cubic-bezier(.2,.8,.2,1),opacity .20s ease,filter .20s ease!important;opacity:0!important;filter:blur(3px);transform:translate3d(var(--aqua-v60-dismiss-x,110%),0,0) scale(.96)!important}
      body.aqua-v60-water-grade #fishing-visual .aqua-v60-water-polish{position:absolute;inset:0;z-index:7;pointer-events:none;background-image:url('assets/art/v60_water_depth_overlay.webp'),url('assets/art/v60_caustic_sparkle_overlay.webp'),radial-gradient(circle at 50% 104%,rgba(3,10,28,.38),transparent 45%);background-size:cover,720px 720px,cover;background-position:center,0 0,center;mix-blend-mode:screen;opacity:.50;animation:aquaV60WaterPolish 18s linear infinite;transform:translateZ(0)}
      body.aqua-v60-water-grade[data-aqua-v57-region='lake'] #fishing-visual .aqua-v60-water-polish{opacity:.43;filter:saturate(1.06)}
      body.aqua-v60-water-grade[data-aqua-v57-region='river'] #fishing-visual .aqua-v60-water-polish{opacity:.50;animation-duration:13s}
      body.aqua-v60-water-grade[data-aqua-v57-region='harbor'] #fishing-visual .aqua-v60-water-polish{opacity:.38;filter:hue-rotate(-8deg) saturate(1.08)}
      body.aqua-v60-water-grade[data-aqua-v57-region='deep'] #fishing-visual .aqua-v60-water-polish,
      body.aqua-v60-water-grade[data-aqua-v57-region='palace'] #fishing-visual .aqua-v60-water-polish{opacity:.35;background-size:cover,920px 920px,cover}
      body.aqua-v60-water-grade[data-aqua-v57-region='dimension'] #fishing-visual .aqua-v60-water-polish{opacity:.56;animation-duration:11s;filter:hue-rotate(12deg) saturate(1.18)}
      body.aqua-v60-water-grade #screen-fishing{filter:saturate(1.03) contrast(1.015)}
      body.aqua-v60-water-grade #fishing-visual{box-shadow:0 26px 78px rgba(0,0,0,.46),inset 0 1px 0 rgba(255,255,255,.24),inset 0 -24px 78px rgba(8,47,73,.14)!important}
      body.aqua-v60-lite .aqua-v60-water-polish,body.perf-lite .aqua-v60-water-polish{animation:none!important;opacity:.24!important;filter:none!important}.aqua-v60-balance-chip{position:fixed;left:50%;bottom:calc(86px + env(safe-area-inset-bottom,0px));z-index:88;transform:translateX(-50%);padding:7px 11px;border-radius:999px;background:rgba(7,27,47,.82);border:1px solid rgba(160,244,255,.18);color:rgba(225,252,255,.82);font-size:10px;font-weight:1000;pointer-events:none;opacity:0;transition:opacity .25s ease}.aqua-v60-balance-chip.show{opacity:.92}
      @keyframes aquaV60NoticeSheen{0%,62%{transform:translateX(-70%) rotate(16deg);opacity:0}78%{opacity:.7}100%{transform:translateX(220%) rotate(16deg);opacity:0}}
      @keyframes aquaV60WaterPolish{to{background-position:center,720px 360px,center}}
      @media(max-width:390px){body.aqua-v60-interaction .aqua-toast{font-size:12px!important;padding-right:50px!important}.aqua-v60-alert{width:min(94vw,420px)!important}}
      @media(prefers-reduced-motion:reduce){body.aqua-v60-interaction .aqua-toast::before,body.aqua-v60-water-grade #fishing-visual .aqua-v60-water-polish{animation:none!important}}
    `;
    document.head.appendChild(style);
  }

  function inferTarget(text) {
    const value = String(text || '');
    return TARGETS.find((target) => target.re.test(value)) || null;
  }

  function routeTo(targetKey) {
    if (!targetKey) return false;
    state.routed += 1;
    try {
      if (typeof window.switchScreen === 'function') {
        window.switchScreen(targetKey);
        if (targetKey === 'quests' && typeof window.renderQuests === 'function') requestAnimationFrame(() => window.renderQuests());
        return true;
      }
    } catch (error) {
      console.warn('[Aqua v6.0] route failed:', error);
    }
    return false;
  }

  function dismiss(el, dir = 1) {
    if (!el || el.dataset.aquaV60Dismissing === '1') return;
    el.dataset.aquaV60Dismissing = '1';
    el.style.setProperty('--aqua-v60-dismiss-x', `${dir >= 0 ? 112 : -112}%`);
    el.classList.add('aqua-v60-dismissed');
    state.dismissed += 1;
    setTimeout(() => {
      try { el.remove(); } catch (_) { el.style.display = 'none'; }
    }, 230);
  }

  function decorateNotice(el) {
    if (!(el instanceof HTMLElement) || el.dataset.aquaV60Notice === '1') return;
    if (el.closest('#exit-confirm-modal')) return;
    el.dataset.aquaV60Notice = '1';
    el.dataset.aquaNotice = '1';
    el.setAttribute('role', el.getAttribute('role') || 'button');
    el.setAttribute('tabindex', el.getAttribute('tabindex') || '0');
    const text = (el.innerText || el.textContent || '').trim();
    const target = inferTarget(text);
    if (target) {
      el.dataset.aquaTarget = target.key;
      el.dataset.aquaTargetLabel = `${target.icon} ${target.label}`;
      el.setAttribute('aria-label', `${text}. ${target.label}`);
    } else {
      el.setAttribute('aria-label', `${text || '알림'} 닫기`);
    }
    if (!el.querySelector(':scope > .aqua-v60-notice-x')) {
      const close = document.createElement('span');
      close.className = 'aqua-v60-notice-x';
      close.textContent = '×';
      close.setAttribute('aria-hidden', 'true');
      el.appendChild(close);
    }
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let downAt = 0;
    let dragging = false;
    el.addEventListener('pointerdown', (event) => {
      if (event.button && event.button !== 0) return;
      startX = currentX = event.clientX;
      startY = event.clientY;
      downAt = performance.now();
      dragging = true;
      try { el.setPointerCapture(event.pointerId); } catch (_) {}
    }, { passive: true });
    el.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        currentX = event.clientX;
        el.style.transform = `translate3d(${dx}px,0,0) scale(${Math.max(.96, 1 - Math.abs(dx) / 900)})`;
        el.style.opacity = String(Math.max(.42, 1 - Math.abs(dx) / 210));
      }
    }, { passive: true });
    const finish = (event) => {
      if (!dragging) return;
      dragging = false;
      const dx = (event?.clientX ?? currentX) - startX;
      const dt = Math.max(1, performance.now() - downAt);
      const velocity = Math.abs(dx) / dt;
      if (Math.abs(dx) > 54 || velocity > .72) {
        dismiss(el, dx >= 0 ? 1 : -1);
      } else {
        el.style.transform = '';
        el.style.opacity = '';
      }
    };
    el.addEventListener('pointerup', finish, { passive: true });
    el.addEventListener('pointercancel', finish, { passive: true });
    el.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      const targetKey = el.dataset.aquaTarget;
      if (targetKey) routeTo(targetKey);
      dismiss(el, 1);
    });
    el.addEventListener('click', (event) => {
      if (el.dataset.aquaV60Dismissing === '1') return;
      const dx = Math.abs((event.clientX || startX) - startX);
      if (dx > 16) return;
      const targetKey = el.dataset.aquaTarget;
      if (targetKey) routeTo(targetKey);
      dismiss(el, 1);
    });
    state.decorated += 1;
  }

  function scanNotices(root = document) {
    try { root.querySelectorAll?.(NOTICE_SELECTOR).forEach(decorateNotice); } catch (_) {}
  }

  function createAlert(message) {
    ensureStyle();
    const text = String(message ?? '');
    const el = document.createElement('div');
    el.className = 'aqua-v60-alert';
    el.innerHTML = `<strong>알림</strong><p></p>`;
    el.querySelector('p').textContent = text;
    document.body.appendChild(el);
    decorateNotice(el);
    const target = inferTarget(text);
    const life = target ? 6200 : 4200;
    setTimeout(() => dismiss(el, 1), life);
    return el;
  }

  function patchShowToast() {
    const fn = window.showToast;
    if (typeof fn !== 'function' || fn.__aquaV60Patched) return false;
    const wrapped = function aquaV60ShowToast(message, icon = '✨', life = 2600, options = {}) {
      const before = new Set(document.querySelectorAll('.aqua-toast'));
      const result = fn.apply(this, [message, icon, life, options]);
      requestAnimationFrame(() => {
        const text = String(message || '');
        document.querySelectorAll('.aqua-toast').forEach((el) => {
          if (!before.has(el) || !el.dataset.aquaV60Notice) decorateNotice(el);
          if (options?.target && el instanceof HTMLElement) {
            el.dataset.aquaTarget = options.target;
            const def = TARGETS.find((t) => t.key === options.target);
            el.dataset.aquaTargetLabel = def ? `${def.icon} ${def.label}` : '이동';
          } else if (text && el instanceof HTMLElement && !el.dataset.aquaTarget) {
            const inferred = inferTarget(text);
            if (inferred) {
              el.dataset.aquaTarget = inferred.key;
              el.dataset.aquaTargetLabel = `${inferred.icon} ${inferred.label}`;
            }
          }
        });
      });
      return result;
    };
    wrapped.__aquaV60Patched = true;
    wrapped.__aquaV60Original = fn;
    window.showToast = wrapped;
    state.showToastPatched = true;
    return true;
  }

  function patchAlert() {
    if (window.alert?.__aquaV60Patched) return;
    const nativeAlert = window.alert;
    const wrapped = function aquaV60Alert(message) {
      if (!document.body) return nativeAlert.call(window, message);
      createAlert(message);
      return undefined;
    };
    wrapped.__aquaV60Patched = true;
    wrapped.__aquaV60Original = nativeAlert.__aquaV555Original || nativeAlert;
    window.alert = wrapped;
    state.alertPatched = true;
  }

  function ensureWaterPolishLayer() {
    const visual = document.getElementById('fishing-visual');
    if (!visual) return;
    let layer = document.getElementById('aqua-v60-water-polish');
    if (!layer) {
      layer = document.createElement('div');
      layer.id = 'aqua-v60-water-polish';
      layer.className = 'aqua-v60-water-polish';
      visual.appendChild(layer);
    }
  }

  function patchBalanceFunctions() {
    if (state.balancePatched) return;
    if (typeof window.getBiteWindowDuration === 'function' && !window.getBiteWindowDuration.__aquaV60Patched) {
      const original = window.getBiteWindowDuration;
      window.getBiteWindowDuration = function aquaV60BiteWindow(species) {
        const base = Number(original.apply(this, [species]) || 0);
        const rarity = Number(species?.rarity || 1);
        return Math.max(820, Math.round(base * (rarity >= 5 ? .90 : .93)));
      };
      window.getBiteWindowDuration.__aquaV60Patched = true;
    }
    if (typeof window.reelAction === 'function' && !window.reelAction.__aquaV60Patched) {
      const originalReel = window.reelAction;
      window.reelAction = function aquaV60ReelAction(...args) {
        const result = originalReel.apply(this, args);
        try {
          if (window.gameState && window.gameState.isFishing) {
            const species = window.gameState.pendingFish;
            const rarity = Number(species?.rarity || 1);
            if (!window.gameState.bossWindowActive) window.gameState.tension = Math.min(100, Number(window.gameState.tension || 0) + Math.max(.45, rarity * .18));
            if (typeof window.updateReelUI === 'function') window.updateReelUI();
          }
        } catch (_) {}
        return result;
      };
      window.reelAction.__aquaV60Patched = true;
    }
    state.balancePatched = true;
  }

  function showBalanceChip() {
    if (document.getElementById('aqua-v60-balance-chip')) return;
    const chip = document.createElement('div');
    chip.id = 'aqua-v60-balance-chip';
    chip.className = 'aqua-v60-balance-chip';
    chip.textContent = 'v6.0 밸런스 조정 적용 · 입질/릴 난이도 + 소폭';
    document.body.appendChild(chip);
    requestAnimationFrame(() => chip.classList.add('show'));
    setTimeout(() => chip.classList.remove('show'), 2600);
  }

  function boot() {
    ensureStyle();
    document.body.classList.add('aqua-v60-interaction', 'aqua-v60-water-grade');
    const lite = document.body.classList.contains('perf-lite') || document.body.classList.contains('aqua-v55-lite') || navigator.connection?.saveData === true || matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.body.classList.toggle('aqua-v60-lite', Boolean(lite));
    patchAlert();
    patchShowToast();
    scanNotices();
    ensureWaterPolishLayer();
    patchBalanceFunctions();
    showBalanceChip();
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches?.(NOTICE_SELECTOR)) decorateNotice(node);
          scanNotices(node);
          if (node.id === 'fishing-visual' || node.querySelector?.('#fishing-visual')) ensureWaterPolishLayer();
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setInterval(() => {
      patchShowToast();
      scanNotices();
      ensureWaterPolishLayer();
      patchBalanceFunctions();
    }, 1500);
    try { localStorage.setItem('aqua_v60_cache_key', CACHE_KEY); } catch (_) {}
  }

  ready(boot);

  window.AquaV60InteractionBalance = Object.freeze({
    version: VERSION,
    cacheKey: CACHE_KEY,
    state,
    dismiss,
    createAlert,
    routeTo,
  });
})();
