// Aqua Fantasia v5.6.1 UI State Cleanup
// ------------------------------------------------------------
// Production polish layer:
// - Hide the v5.3 fixed fishing navigator outside the actual fishing screen.
// - Remove the legacy QUICK ACTION label left behind by the smart dock.
// - Hide CI/runtime version badges in the player-facing build.
// - Keep only screen-appropriate HUD elements visible.

(function aquaV561UIStateCleanup() {
  const VERSION = '5.6.1-ui-cleanup';
  const state = {
    version: VERSION,
    startedAt: Date.now(),
    currentScreen: 'login',
    sweeps: 0,
    removed: [],
  };

  const HIDE_SELECTORS = [
    '#v31-smart-dock-label',
    '#aqua-v552-badge',
    '#aqua-v554-recovery',
    '.v31-smart-dock-label',
    '.v47-renderer-overlay',
    '.aqua-dev-badge',
    '.aqua-runtime-badge',
  ];

  function ready(fn) {
    if (document.body) fn();
    else document.addEventListener('DOMContentLoaded', fn, { once: true });
  }

  function byId(id) { return document.getElementById(id); }

  function detectScreen() {
    const fromBody = document.body?.dataset?.screen;
    if (fromBody) return fromBody;
    const screens = Array.from(document.querySelectorAll('[id^="screen-"]'));
    const visible = screens.find((el) => !el.classList.contains('hidden'));
    return visible ? visible.id.replace(/^screen-/, '') : 'login';
  }

  function ensureStyle() {
    if (byId('aqua-v561-style')) return;
    const style = document.createElement('style');
    style.id = 'aqua-v561-style';
    style.textContent = `
      body.aqua-v561-ui-clean #v31-smart-dock-label,
      body.aqua-v561-ui-clean .v31-smart-dock-label,
      body.aqua-v561-ui-clean #aqua-v552-badge,
      body.aqua-v561-ui-clean .v47-renderer-overlay,
      body.aqua-v561-ui-clean .aqua-dev-badge,
      body.aqua-v561-ui-clean .aqua-runtime-badge{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}
      body.aqua-v561-ui-clean #v30-smart-dock{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}
      body.aqua-v561-ui-clean .aqua-nav-v53{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}
      body.aqua-v561-ui-clean:not([data-screen="fishing"]) .aqua-fishing-v53-ui{display:none!important;visibility:hidden!important;pointer-events:none!important}
      body.aqua-v561-ui-clean[data-screen="login"] .top-bar-focus,
      body.aqua-v561-ui-clean[data-screen="login"] .bottom-nav,
      body.aqua-v561-ui-clean[data-screen="login"] #v30-smart-dock{display:none!important}
      body.aqua-v561-ui-clean[data-screen="fishing"] .bottom-nav,
      body.aqua-v561-ui-clean[data-screen="fishing"] .top-bar-focus,
      body.aqua-v561-ui-clean[data-screen="fishing"] #v30-smart-dock{display:none!important}
      body.aqua-v561-ui-clean .first-play-guide{margin-top:.25rem}
      body.aqua-v561-ui-clean .bottom-nav{z-index:90}
      body.aqua-v561-ui-clean #screen-village.screen-scroll{padding-bottom:calc(104px + var(--safe-bottom,0px))}
      @media (max-width:430px){body.aqua-v561-ui-clean .first-play-guide{border-radius:1.55rem}body.aqua-v561-ui-clean #screen-village.screen-scroll{padding-bottom:calc(112px + var(--safe-bottom,0px))}}
    `;
    document.head.appendChild(style);
  }

  function hideElement(el, reason) {
    if (!el) return;
    el.classList.remove('open', 'show', 'active');
    el.setAttribute('aria-hidden', 'true');
    el.style.setProperty('display', 'none', 'important');
    el.style.setProperty('visibility', 'hidden', 'important');
    el.style.setProperty('opacity', '0', 'important');
    el.style.setProperty('pointer-events', 'none', 'important');
    if (reason && !state.removed.includes(reason)) state.removed.push(reason);
  }

  function removeBadTextNodes() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
    const targets = [];
    while (walker.nextNode()) {
      const el = walker.currentNode;
      if (!el || el === document.body) continue;
      const text = String(el.textContent || '').trim();
      if (text === 'QUICK ACTION') targets.push({ el, reason: 'quick-action-label' });
      if (/^v5\.|Node24 OK|STACK SAFE/i.test(text) && el.id !== 'fishing-region-info') targets.push({ el, reason: 'runtime-version-badge' });
    }
    targets.forEach((item) => hideElement(item.el, item.reason));
  }

  function syncScreenState() {
    const screen = detectScreen();
    state.currentScreen = screen;
    if (document.body) document.body.dataset.screen = screen;
    document.body?.classList.toggle('login-mode', screen === 'login');
    document.body?.classList.toggle('aqua-v561-screen-fishing', screen === 'fishing');
    document.body?.classList.toggle('aqua-v561-screen-village', screen === 'village');
    return screen;
  }

  function sweepUI() {
    if (!document.body) return;
    state.sweeps += 1;
    document.body.classList.add('aqua-v561-ui-clean');
    const screen = syncScreenState();
    HIDE_SELECTORS.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => hideElement(el, selector));
    });
    const nav = document.querySelector('.aqua-nav-v53');
    hideElement(nav, 'top-fishing-navigator');
    const dock = byId('v30-smart-dock');
    hideElement(dock, 'smart-dock');
    const label = byId('v31-smart-dock-label');
    hideElement(label, 'quick-action-label');
    const badge = byId('aqua-v552-badge');
    hideElement(badge, 'runtime-version-badge');
    if (screen !== 'fishing') document.querySelectorAll('.aqua-fishing-v53-ui').forEach((el) => hideElement(el, 'fishing-ui-offscreen'));
    removeBadTextNodes();
  }

  function patchRenderSmartDock() {
    if (window.__aquaV561SmartDockPatched) return;
    window.__aquaV561SmartDockPatched = true;
    const original = window.renderSmartDock;
    if (typeof original !== 'function') return;
    window.renderSmartDock = function aquaV561RenderSmartDockProxy(...args) {
      const result = original.apply(this, args);
      sweepUI();
      return result;
    };
  }

  function scheduleSweep() {
    if (state.sweepTimer) return;
    state.sweepTimer = setTimeout(() => {
      state.sweepTimer = 0;
      sweepUI();
    }, 80);
  }

  function observe() {
    if (window.__aquaV561Observer) return;
    const observer = new MutationObserver(() => scheduleSweep());
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'data-screen'] });
    window.__aquaV561Observer = observer;
  }

  function boot() {
    ready(() => {
      ensureStyle();
      patchRenderSmartDock();
      sweepUI();
      observe();
      window.addEventListener('aqua:screen-change', sweepUI);
      window.addEventListener('popstate', () => setTimeout(sweepUI, 0));
      window.addEventListener('focus', sweepUI);
      setTimeout(sweepUI, 250);
      setTimeout(sweepUI, 900);
      setInterval(sweepUI, 2500);
      console.log('[AquaFantasia] v5.6.1 UI State Cleanup ready');
    });
  }

  window.AquaV561UIStateCleanup = { version: VERSION, state, sweepUI, syncScreenState };
  boot();
})();
