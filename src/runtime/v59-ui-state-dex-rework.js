/* Aqua Fantasia v5.9.0 UI State Router + 2.5D Fish Dex Rework
 * ------------------------------------------------------------------
 * 목적:
 * - 던지기/챔질/상점 같은 전역 HUD가 로그인/마을/도감까지 따라다니는 문제를 구조적으로 차단합니다.
 * - 실제 화면 상태를 body[data-screen]에 고정하고, 화면별 허용 UI만 남깁니다.
 * - 도감/가방 카드를 원화풍 2.5D 카드와 물고기 포트레이트로 재스킨합니다.
 * - 기존 게임 로직은 유지하고 DOM/CSS/래퍼만 적용하는 안전한 런타임 패치입니다.
 */
(function AquaV59UIStateDexRework() {
  if (window.AquaV59UIStateDexRework?.installed) return;

  const VERSION = '5.9.0';
  const REGION_ART = {
    '호수': 'assets/art/v59_fish_lake_25d.webp',
    '강': 'assets/art/v59_fish_river_25d.webp',
    '항구': 'assets/art/v59_fish_harbor_25d.webp',
    '심해': 'assets/art/v59_fish_deep_25d.webp',
    '용궁': 'assets/art/v59_fish_palace_25d.webp',
    '차원의 바다': 'assets/art/v59_fish_dimension_25d.webp',
    'unknown': 'assets/art/v59_fish_unknown_25d.webp',
  };
  const DEV_TEXT = /(QUICK ACTION|Node24 OK|STACK SAFE|Pixi Bridge|Atlas 대기|CASUAL UX 5\.3|CASUAL RESULT SHOP 5\.4|MOBILE FEEL 5\.5|STABILITY 5\.1|PERFORMANCE FOCUS|RUNTIME DIET|DEBUG|CI HOTFIX)/i;
  const GAME_SCREENS = new Set(['login', 'village', 'fishing', 'inventory', 'encyclopedia', 'equipment', 'quests', 'record', 'competition', 'captain', 'worldmap', 'achievements']);
  const state = { screen: 'login', sweeps: 0, decoratedDex: 0, decoratedInventory: 0, lastSweepAt: 0, observerBusy: false };

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  }
  function $(selector, root = document) { return root.querySelector(selector); }
  function $all(selector, root = document) { return Array.from(root.querySelectorAll(selector)); }
  function isVisible(el) {
    if (!el || el.classList.contains('hidden')) return false;
    const style = getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) !== 0;
  }
  function detectScreen() {
    const bodyScreen = document.body?.dataset?.screen;
    if (bodyScreen && GAME_SCREENS.has(bodyScreen)) return bodyScreen;
    const visible = $all('#main-content > [id^="screen-"]').find(isVisible) || $all('[id^="screen-"]').find(isVisible);
    if (visible?.id) return visible.id.replace(/^screen-/, '');
    return 'login';
  }
  function setHidden(el, reason = 'v59') {
    if (!el) return;
    el.dataset.aquaV59Hidden = reason;
    el.classList.remove('open', 'show', 'active');
    el.setAttribute('aria-hidden', 'true');
    el.style.setProperty('display', 'none', 'important');
    el.style.setProperty('visibility', 'hidden', 'important');
    el.style.setProperty('opacity', '0', 'important');
    el.style.setProperty('pointer-events', 'none', 'important');
  }
  function clearInlineDisplay(el) {
    if (!el) return;
    if (el.dataset.aquaV59Hidden) return;
    el.style.removeProperty('display');
    el.style.removeProperty('visibility');
    el.style.removeProperty('opacity');
    el.style.removeProperty('pointer-events');
  }

  function injectStyle() {
    if ($('#aqua-v59-style')) return;
    const style = document.createElement('style');
    style.id = 'aqua-v59-style';
    style.textContent = `
      :root{--v59-ink:#061426;--v59-panel:rgba(7,29,48,.76);--v59-edge:rgba(225,255,250,.38);--v59-gold:#ffe98a;--v59-cyan:#68f4ff;--v59-mint:#8ff8d0;--v59-shadow:0 24px 54px rgba(0,7,23,.42), inset 0 1px 0 rgba(255,255,255,.28), inset 0 -10px 22px rgba(0,12,32,.22)}
      body.aqua-v59-router .aqua-nav-v53,
      body.aqua-v59-router .aqua-shop-fab-v54,
      body.aqua-v59-router #v30-smart-dock,
      body.aqua-v59-router #v31-smart-dock-label,
      body.aqua-v59-router #aqua-v552-badge,
      body.aqua-v59-router #aqua-v554-recovery,
      body.aqua-v59-router .aqua-dev-badge,
      body.aqua-v59-router .aqua-runtime-badge,
      body.aqua-v59-router .v47-renderer-overlay{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}
      body.aqua-v59-router #v52-casual-panel,
      body.aqua-v59-router #v53-casual-panel,
      body.aqua-v59-router #aqua-v54-panel,
      body.aqua-v59-router #aqua-v55-panel,
      body.aqua-v59-router #v38-action-director,
      body.aqua-v59-router #v39-fishing-director,
      body.aqua-v59-router #v46-engine-panel,
      body.aqua-v59-router #v48-runtime-panel,
      body.aqua-v59-router #v50-performance-panel,
      body.aqua-v59-router #v51-stability-panel{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}
      body.aqua-v59-router:not([data-screen="fishing"]) .aqua-fishing-v53-ui,
      body.aqua-v59-router:not([data-screen="fishing"]) #aqua-v55-touch-coach,
      body.aqua-v59-router:not([data-screen="fishing"]) .aqua-v55-meter,
      body.aqua-v59-router:not([data-screen="fishing"]) #aqua-v49-action-layer,
      body.aqua-v59-router:not([data-screen="fishing"]) .cast-orb{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}
      body.aqua-v59-router[data-screen="login"] .bottom-nav,
      body.aqua-v59-router[data-screen="login"] .top-bar-focus,
      body.aqua-v59-router[data-screen="fishing"] .bottom-nav,
      body.aqua-v59-router[data-screen="fishing"] .top-bar-focus{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}
      body.aqua-v59-router[data-screen="login"] #main-content{bottom:0!important}
      body.aqua-v59-router[data-screen="fishing"] #main-content{bottom:0!important}
      body.aqua-v59-router .bottom-nav{position:fixed;left:10px;right:10px;bottom:calc(10px + env(safe-area-inset-bottom,0px));z-index:88;border:1px solid rgba(255,255,255,.12)!important;border-radius:28px!important;padding:.58rem .32rem!important;background:linear-gradient(180deg,rgba(8,34,58,.88),rgba(3,14,29,.96))!important;box-shadow:0 18px 46px rgba(0,6,22,.46),inset 0 1px 0 rgba(255,255,255,.22)!important;backdrop-filter:blur(14px)}
      body.aqua-v59-router .bottom-nav .nav-tile{border-radius:18px;padding:.25rem .12rem;color:rgba(238,252,255,.78);font-weight:900;text-shadow:0 2px 10px rgba(0,0,0,.35)}
      body.aqua-v59-router .bottom-nav .nav-tile:active{transform:translateY(1px) scale(.98)}
      body.aqua-v59-router #screen-village.screen-scroll,
      body.aqua-v59-router #screen-inventory.screen-scroll,
      body.aqua-v59-router #screen-encyclopedia.screen-scroll{padding-bottom:calc(104px + env(safe-area-inset-bottom,0px))!important}
      body.aqua-v59-router .first-play-guide{box-shadow:0 30px 80px rgba(0,8,28,.36), inset 0 1px 0 rgba(255,255,255,.22)!important}
      body.aqua-v59-router #screen-encyclopedia{background:radial-gradient(circle at 18% -4%,rgba(255,239,154,.16),transparent 18rem),linear-gradient(180deg,#061d34,#073951 50%,#031221)!important}
      body.aqua-v59-router #screen-encyclopedia>.font-extrabold{font-size:2.15rem;letter-spacing:-.06em;text-shadow:0 4px 18px rgba(0,0,0,.34)}
      body.aqua-v59-router #search-box{height:54px;border-radius:22px!important;background:linear-gradient(180deg,rgba(255,255,255,.13),rgba(255,255,255,.065))!important;border:1px solid rgba(255,255,255,.16)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.22),0 16px 34px rgba(0,0,0,.24)!important}
      body.aqua-v59-router #enc-list.v59-dex-grid{display:grid!important;grid-template-columns:1fr;gap:12px!important}
      .v59-dex-progress{position:relative;overflow:hidden;border-radius:28px!important;padding:16px 16px!important;background-image:linear-gradient(135deg,rgba(255,233,138,.18),rgba(104,244,255,.17),rgba(143,248,208,.08)),url('assets/art/v59_dex_card_25d.svg')!important;background-size:cover!important;border:1px solid rgba(255,255,255,.20)!important;box-shadow:var(--v59-shadow)!important}
      .v59-dex-card{position:relative;min-height:114px;overflow:hidden;border-radius:28px!important;padding:14px 14px!important;display:grid!important;grid-template-columns:92px 1fr!important;align-items:center;gap:14px!important;background-image:linear-gradient(135deg,rgba(255,255,255,.12),rgba(95,234,255,.10) 42%,rgba(2,10,28,.32)),url('assets/art/v59_dex_card_25d.svg')!important;background-size:cover!important;background-position:center!important;border:1px solid rgba(235,255,255,.18)!important;box-shadow:0 18px 44px rgba(0,7,24,.38),inset 0 1px 0 rgba(255,255,255,.24),inset 0 -12px 22px rgba(0,12,30,.18)!important;opacity:1!important;transform:translateZ(0);isolation:isolate}
      .v59-dex-card::before{content:"";position:absolute;inset:-40%;background:radial-gradient(circle at var(--mx,34%) 8%,rgba(255,255,255,.34),transparent 18%),conic-gradient(from 220deg,transparent,rgba(255,255,255,.12),transparent,rgba(104,244,255,.12),transparent);opacity:.68;mix-blend-mode:screen;pointer-events:none;animation:v59DexGlow 7.8s linear infinite;z-index:-1}
      .v59-dex-card::after{content:"";position:absolute;left:94px;right:14px;bottom:13px;height:2px;border-radius:99px;background:linear-gradient(90deg,rgba(255,233,138,.95),rgba(104,244,255,.7),transparent);opacity:.58;pointer-events:none}
      .v59-dex-card[data-locked="1"]{background-image:linear-gradient(135deg,rgba(4,12,28,.74),rgba(14,42,65,.62)),url('assets/art/v59_dex_locked_25d.svg')!important;filter:saturate(.75)}
      .v59-fish-frame{width:86px;height:86px;position:relative;display:grid;place-items:center;border-radius:28px;background:radial-gradient(circle at 35% 22%,rgba(255,255,255,.44),rgba(104,244,255,.12) 42%,rgba(2,10,28,.28) 76%);box-shadow:inset 0 2px 0 rgba(255,255,255,.36),inset 0 -12px 20px rgba(0,19,43,.26),0 18px 28px rgba(0,8,28,.34);overflow:hidden}
      .v59-fish-frame::before{content:"";position:absolute;inset:8px;border-radius:24px;background:radial-gradient(circle at 50% 90%,rgba(104,244,255,.32),transparent 56%);opacity:.8}.v59-fish-frame img{position:relative;width:92%;height:92%;object-fit:contain;filter:drop-shadow(0 13px 12px rgba(0,7,20,.36));animation:v59FishFloat 2.6s ease-in-out infinite alternate}.v59-fish-frame i{position:absolute;left:12px;right:12px;bottom:11px;height:7px;border-radius:99px;background:rgba(6,20,38,.28);filter:blur(4px);transform:scaleX(.85)}
      .v59-dex-card[data-rarity="4"]{border-color:rgba(199,210,254,.34)!important}.v59-dex-card[data-rarity="5"],.v59-dex-card[data-boss="1"]{border-color:rgba(255,233,138,.48)!important;box-shadow:0 18px 50px rgba(108,73,14,.36),inset 0 1px 0 rgba(255,255,255,.24),inset 0 -12px 22px rgba(0,12,30,.18)!important}.v59-dex-card[data-region="심해"]{background-color:rgba(6,16,48,.55)}.v59-dex-card[data-region="용궁"]{background-color:rgba(22,53,50,.44)}.v59-dex-card[data-region="차원의 바다"]{background-color:rgba(48,24,72,.44)}
      .v59-region-chip{display:inline-flex;align-items:center;gap:5px;margin-top:7px;border-radius:999px;padding:5px 9px;background:rgba(255,255,255,.11);border:1px solid rgba(255,255,255,.10);font-size:10px;font-weight:1000;color:rgba(230,252,255,.82)}
      .v59-inventory-card{position:relative;overflow:hidden;border-radius:28px!important;padding:13px!important;min-height:110px;background-image:linear-gradient(135deg,rgba(255,255,255,.13),rgba(104,244,255,.10),rgba(3,13,30,.25)),url('assets/art/v59_dex_card_25d.svg')!important;background-size:cover!important;border:1px solid rgba(255,255,255,.17)!important;box-shadow:0 18px 42px rgba(0,7,24,.34),inset 0 1px 0 rgba(255,255,255,.22)!important}
      .v59-inventory-card .fish-emoji-box{background:transparent!important;box-shadow:none!important}.v59-inventory-card .v59-fish-frame{width:70px;height:70px;border-radius:24px}.v59-inventory-card .v59-fish-frame img{width:92%;height:92%}
      @keyframes v59FishFloat{0%{transform:translate3d(-1px,2px,0) rotate(-2deg) scale(.98)}100%{transform:translate3d(2px,-4px,0) rotate(2deg) scale(1.035)}}
      @keyframes v59DexGlow{to{transform:rotate(1turn)}}
      @media (min-width:680px){body.aqua-v59-router #enc-list.v59-dex-grid{grid-template-columns:1fr 1fr}.v59-dex-card{grid-template-columns:88px 1fr!important}}
      @media (max-width:390px){.v59-dex-card{grid-template-columns:78px 1fr!important;gap:10px!important;padding:12px!important;border-radius:24px!important}.v59-fish-frame{width:74px;height:74px;border-radius:23px}.v59-dex-card::after{left:84px}.v59-region-chip{display:none}}
      @media (prefers-reduced-motion:reduce){.v59-fish-frame img,.v59-dex-card::before{animation:none!important}.v59-dex-card{transition:none!important}}
      body.aqua-v59-lite .v59-dex-card::before{animation:none!important;opacity:.26}body.aqua-v59-lite .v59-fish-frame img{animation:none!important;filter:drop-shadow(0 8px 8px rgba(0,7,20,.25))}
    `;
    document.head.appendChild(style);
  }

  function updateBodyScreen() {
    if (!document.body) return 'login';
    const screen = detectScreen();
    state.screen = screen;
    document.body.dataset.screen = screen;
    document.body.dataset.aquaUiZone = screen;
    document.body.classList.add('aqua-v59-router');
    document.body.classList.toggle('aqua-v59-screen-fishing', screen === 'fishing');
    document.body.classList.toggle('aqua-v59-screen-login', screen === 'login');
    const lite = document.body.classList.contains('perf-lite') || document.body.classList.contains('aqua-v55-lite') || matchMedia('(prefers-reduced-motion: reduce)').matches || navigator.connection?.saveData === true;
    document.body.classList.toggle('aqua-v59-lite', Boolean(lite));
    return screen;
  }

  function scrubGlobalHud(screen) {
    const alwaysHide = [
      '.aqua-nav-v53', '.aqua-shop-fab-v54', '#v30-smart-dock', '#v31-smart-dock-label',
      '#aqua-v552-badge', '#aqua-v554-recovery', '.aqua-dev-badge', '.aqua-runtime-badge',
      '#v52-casual-panel', '#v53-casual-panel', '#aqua-v54-panel', '#aqua-v55-panel',
      '#v38-action-director', '#v39-fishing-director', '#v46-engine-panel', '#v48-runtime-panel', '#v50-performance-panel', '#v51-stability-panel',
    ];
    alwaysHide.forEach((selector) => $all(selector).forEach((el) => setHidden(el, selector)));
    if (screen !== 'fishing') {
      ['.aqua-fishing-v53-ui', '#aqua-v55-touch-coach', '.aqua-v55-meter', '#aqua-v49-action-layer', '.cast-orb', '#reel-game:not(.hidden)', '#bite-target:not(.hidden)'].forEach((selector) => $all(selector).forEach((el) => setHidden(el, 'offscreen-fishing')));
    } else {
      ['#aqua-v55-touch-coach', '.aqua-v55-meter'].forEach((selector) => $all(selector).forEach(clearInlineDisplay));
    }
  }

  function scrubDevText() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
    const targets = [];
    while (walker.nextNode()) {
      const el = walker.currentNode;
      if (!el || el === document.body || el.id === 'fishing-region-info') continue;
      if (el.closest?.('#screen-fishing') && state.screen === 'fishing') continue;
      const text = String(el.textContent || '').trim();
      if (text && DEV_TEXT.test(text) && el.children.length <= 3) targets.push(el);
    }
    targets.forEach((el) => setHidden(el, 'dev-text'));
  }

  function regionFromText(text) {
    if (text.includes('차원의 바다')) return '차원의 바다';
    for (const region of ['호수', '강', '항구', '심해', '용궁']) if (text.includes(region)) return region;
    return 'unknown';
  }
  function rarityFromText(text) {
    if (/신화|MYTH|myth/i.test(text)) return 5;
    if (/전설|LEGEND|legend/i.test(text)) return 5;
    if (/영웅|EPIC|epic/i.test(text)) return 4;
    if (/희귀|RARE|rare/i.test(text)) return 3;
    if (/고급|UNCOMMON|uncommon/i.test(text)) return 2;
    return 1;
  }
  function imgFor(region, locked = false) {
    if (locked) return REGION_ART.unknown;
    return REGION_ART[region] || REGION_ART.unknown;
  }
  function buildFishFrame(region, locked = false) {
    const url = imgFor(region, locked);
    const alt = locked ? '미발견 어종 실루엣' : `${region} 어종 2.5D 원화`;
    return `<div class="v59-fish-frame" aria-hidden="true"><img src="${url}" alt="${alt}" loading="lazy" decoding="async"><i></i></div>`;
  }

  function decorateDex() {
    const list = $('#enc-list');
    if (!list) return;
    list.classList.add('v59-dex-grid');
    const children = Array.from(list.children);
    children.forEach((card, index) => {
      if (!(card instanceof HTMLElement)) return;
      if (index === 0 && /도감 진행도/.test(card.textContent || '')) {
        card.classList.add('v59-dex-progress');
        return;
      }
      if (card.dataset.v59Dex === '1') return;
      const text = card.textContent || '';
      const locked = /미발견|❔/.test(text);
      const region = regionFromText(text);
      const rarity = rarityFromText(text);
      const boss = /BOSS|보스|👑/.test(text);
      card.dataset.v59Dex = '1';
      card.dataset.region = region;
      card.dataset.rarity = String(rarity);
      if (locked) card.dataset.locked = '1';
      if (boss) card.dataset.boss = '1';
      card.classList.add('v59-dex-card');
      card.classList.remove('premium-glass', 'opacity-60', 'flex', 'items-center', 'gap-3');
      const portrait = card.firstElementChild;
      if (portrait) {
        portrait.className = 'v59-dex-portrait';
        portrait.innerHTML = buildFishFrame(region, locked);
      }
      const content = card.children[1];
      if (content && !content.querySelector('.v59-region-chip')) {
        const chip = document.createElement('span');
        chip.className = 'v59-region-chip';
        chip.textContent = locked ? `${region} · 발견 전` : `${region} · 수면 생태`; 
        content.appendChild(chip);
      }
      state.decoratedDex += 1;
    });
  }

  function decorateInventory() {
    $all('#inv-grid .fish-row').forEach((card) => {
      if (card.dataset.v59Inv === '1') return;
      const text = card.textContent || '';
      const region = regionFromText(text);
      const locked = false;
      card.dataset.v59Inv = '1';
      card.dataset.region = region;
      card.classList.add('v59-inventory-card');
      const box = card.querySelector('.fish-emoji-box');
      if (box) box.innerHTML = buildFishFrame(region, locked);
      state.decoratedInventory += 1;
    });
  }

  function decoratePointerLight() {
    if (document.body.dataset.v59Pointer === '1') return;
    document.body.dataset.v59Pointer = '1';
    document.addEventListener('pointermove', (event) => {
      const card = event.target?.closest?.('.v59-dex-card,.v59-inventory-card');
      if (!card || document.body.classList.contains('aqua-v59-lite')) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${Math.round(event.clientX - rect.left)}px`);
      card.style.setProperty('--my', `${Math.round(event.clientY - rect.top)}px`);
    }, { passive: true });
  }

  function sweep() {
    if (!document.body) return;
    state.sweeps += 1;
    state.lastSweepAt = performance.now();
    injectStyle();
    const screen = updateBodyScreen();
    scrubGlobalHud(screen);
    scrubDevText();
    if (screen === 'encyclopedia') decorateDex();
    if (screen === 'inventory') decorateInventory();
  }

  function scheduleSweep(delay = 32) {
    if (state.sweepTimer) return;
    state.sweepTimer = setTimeout(() => {
      state.sweepTimer = 0;
      requestAnimationFrame(() => {
        try { sweep(); } catch (error) { console.warn('[AquaV59] sweep failed', error); }
      });
    }, delay);
  }

  function wrapGlobal(name, after) {
    const original = window[name];
    if (typeof original !== 'function' || original.__aquaV59Wrapped) return false;
    const wrapped = function aquaV59WrappedFunction(...args) {
      const result = original.apply(this, args);
      try { after?.(args, result); } catch (error) { console.warn(`[AquaV59] after ${name} failed`, error); }
      scheduleSweep(20);
      return result;
    };
    Object.defineProperty(wrapped, '__aquaV59Wrapped', { value: true });
    window[name] = wrapped;
    return true;
  }

  function installWrappers() {
    wrapGlobal('switchScreen', (args) => {
      const screen = args?.[0];
      if (screen && document.body) document.body.dataset.screen = screen;
      window.dispatchEvent(new CustomEvent('aqua:screen-change', { detail: { screen, source: 'v59' } }));
    });
    wrapGlobal('showLoginScreen', () => {
      if (document.body) document.body.dataset.screen = 'login';
      window.dispatchEvent(new CustomEvent('aqua:screen-change', { detail: { screen: 'login', source: 'v59' } }));
    });
    wrapGlobal('goFishing', () => window.dispatchEvent(new CustomEvent('aqua:screen-change', { detail: { screen: 'fishing-intent', source: 'v59' } })));
    wrapGlobal('renderEncyclopedia', () => setTimeout(decorateDex, 0));
    wrapGlobal('renderInventory', () => setTimeout(decorateInventory, 0));
  }

  function installObserver() {
    if (window.__aquaV59Observer) return;
    const observer = new MutationObserver((mutations) => {
      if (state.observerBusy) return;
      let useful = false;
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length) { useful = true; break; }
        if (mutation.type === 'attributes' && ['class', 'style', 'data-screen'].includes(mutation.attributeName)) { useful = true; break; }
      }
      if (useful) scheduleSweep(70);
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'data-screen'] });
    window.__aquaV59Observer = observer;
  }

  function boot() {
    ready(() => {
      injectStyle();
      decoratePointerLight();
      sweep();
      installObserver();
      const wrapperTimer = setInterval(() => {
        installWrappers();
        if (window.switchScreen?.__aquaV59Wrapped && window.renderEncyclopedia?.__aquaV59Wrapped) clearInterval(wrapperTimer);
      }, 120);
      setTimeout(() => { installWrappers(); sweep(); }, 400);
      setTimeout(sweep, 1100);
      setInterval(sweep, 3000);
      window.addEventListener('aqua:screen-change', () => scheduleSweep(20));
      window.addEventListener('focus', () => scheduleSweep(20));
      console.log('[AquaFantasia] v5.9.0 UI State Router + Fish Dex Rework ready');
    });
  }

  window.AquaV59UIStateDexRework = { installed: true, version: VERSION, state, sweep, decorateDex, decorateInventory, art: REGION_ART };
  boot();
})();
