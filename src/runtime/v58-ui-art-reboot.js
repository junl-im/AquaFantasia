/* Aqua Fantasia v5.8.0 2.5D UI Art Reboot + Stability Pass
 * -----------------------------------------------------------
 * 목적:
 * - 누적 패치로 섞인 플랫/글래스/디버그 UI 톤을 하나의 2.5D 캐주얼 게임 톤으로 정렬합니다.
 * - 로그인/마을/낚시/가방/상점 화면에 같은 입체감 규칙을 적용합니다.
 * - 기존 기능 로직은 건드리지 않고 CSS/DOM 클래스 보강 위주로 안정적으로 동작합니다.
 */
(function AquaV58UIArtReboot() {
  if (window.AquaV58UIArtReboot?.installed) return;

  const VERSION = '5.8.0';
  const ART_ASSETS = {
    panel: 'assets/art/v58_panel_25d.svg',
    button: 'assets/art/v58_button_primary_25d.svg',
    nav: 'assets/art/v58_nav_shell_25d.svg',
    fish: 'assets/art/v58_icon_fish_25d.svg',
    lake: 'assets/art/v58_icon_lake_25d.svg',
  };

  const css = `
  :root {
    --v58-ink: #061426;
    --v58-deep: #071b34;
    --v58-navy: #092440;
    --v58-panel: rgba(12, 45, 72, .78);
    --v58-panel-strong: rgba(11, 37, 62, .92);
    --v58-edge: rgba(221, 255, 249, .42);
    --v58-edge-dark: rgba(0, 19, 42, .44);
    --v58-cyan: #65f4ff;
    --v58-mint: #8ff6d0;
    --v58-sky: #43d7ff;
    --v58-blue: #5c7cff;
    --v58-gold: #ffe98a;
    --v58-coral: #ff8a7a;
    --v58-radius-lg: 28px;
    --v58-radius-xl: 36px;
    --v58-shadow: 0 24px 48px rgba(0, 12, 31, .42), 0 7px 14px rgba(0, 17, 39, .34);
    --v58-lift: inset 0 2px 0 rgba(255,255,255,.42), inset 0 -8px 18px rgba(0,18,41,.22), 0 18px 42px rgba(0,9,24,.38);
  }

  html.aqua-v58-booted,
  body.aqua-v58-art-reboot {
    background:
      radial-gradient(circle at 22% -8%, rgba(255, 239, 154, .16), transparent 23rem),
      radial-gradient(circle at 84% 6%, rgba(96, 244, 255, .18), transparent 20rem),
      linear-gradient(180deg, #052034 0%, #08344f 46%, #03111f 100%) !important;
  }

  body.aqua-v58-art-reboot #app-shell {
    background:
      radial-gradient(circle at 18% 0%, rgba(255, 239, 154, .18), transparent 12rem),
      radial-gradient(circle at 92% 8%, rgba(82, 224, 255, .18), transparent 16rem),
      linear-gradient(180deg, rgba(6,30,48,.94), rgba(7,54,75,.90) 46%, rgba(4,14,30,.98)) !important;
  }

  body.aqua-v58-art-reboot #app-shell::before {
    opacity: .45 !important;
    background-image:
      radial-gradient(circle at 24px 18px, rgba(255,255,255,.07) 0 1.5px, transparent 2px),
      linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.02) 1px, transparent 1px) !important;
    background-size: 54px 54px, 46px 46px, 46px 46px !important;
    mask-image: linear-gradient(to bottom, rgba(0,0,0,.72), rgba(0,0,0,.28) 62%, transparent) !important;
  }

  body.aqua-v58-art-reboot .screen-scroll {
    scrollbar-width: none;
  }
  body.aqua-v58-art-reboot .screen-scroll::-webkit-scrollbar { display:none; }

  body.aqua-v58-art-reboot .premium-glass,
  body.aqua-v58-art-reboot .premium-card,
  body.aqua-v58-art-reboot .first-play-guide,
  body.aqua-v58-art-reboot .route-panel,
  body.aqua-v58-art-reboot .mission-panel,
  body.aqua-v58-art-reboot .boss-panel,
  body.aqua-v58-art-reboot .inventory-coach,
  body.aqua-v58-art-reboot .result-card,
  body.aqua-v58-art-reboot .captain-panel,
  body.aqua-v58-art-reboot .quality-director,
  body.aqua-v58-art-reboot .v36-core-navigator,
  body.aqua-v58-art-reboot .v37-art-director,
  body.aqua-v58-art-reboot .v38-action-director,
  body.aqua-v58-art-reboot .v41-flow-hud,
  body.aqua-v58-art-reboot .v48-runtime-panel,
  body.aqua-v58-art-reboot .v49-runtime-panel,
  body.aqua-v58-art-reboot .v50-performance-panel,
  body.aqua-v58-art-reboot .v51-stability-panel {
    border-radius: var(--v58-radius-xl) !important;
    border: 1.5px solid var(--v58-edge) !important;
    background:
      linear-gradient(145deg, rgba(255,255,255,.22), rgba(95,224,255,.105) 36%, rgba(7,34,58,.77) 100%),
      url('${ART_ASSETS.panel}') center/100% 100% no-repeat !important;
    box-shadow: var(--v58-lift) !important;
    backdrop-filter: blur(18px) saturate(145%) !important;
    -webkit-backdrop-filter: blur(18px) saturate(145%) !important;
  }

  body.aqua-v58-art-reboot .premium-card,
  body.aqua-v58-art-reboot .region-card,
  body.aqua-v58-art-reboot .first-play-guide {
    transform: translateZ(0);
  }

  body.aqua-v58-art-reboot .premium-card::after,
  body.aqua-v58-art-reboot .region-card::after,
  body.aqua-v58-art-reboot .first-play-guide::after,
  body.aqua-v58-art-reboot .aqua-v58-surface::after {
    content: '';
    position: absolute;
    left: 10px; right: 10px; top: 8px;
    height: 34%;
    border-radius: inherit;
    background: linear-gradient(180deg, rgba(255,255,255,.30), rgba(255,255,255,.05) 72%, transparent);
    opacity: .72;
    pointer-events: none;
    mix-blend-mode: screen;
  }

  body.aqua-v58-art-reboot .premium-card:active,
  body.aqua-v58-art-reboot .region-card:active,
  body.aqua-v58-art-reboot button:active {
    transform: translateY(2px) scale(.985) !important;
    filter: saturate(1.04) brightness(.98);
  }

  body.aqua-v58-art-reboot button,
  body.aqua-v58-art-reboot .guide-actions button,
  body.aqua-v58-art-reboot .v30-action-row button,
  body.aqua-v58-art-reboot .v31-action-row button,
  body.aqua-v58-art-reboot .v54-result-actions button,
  body.aqua-v58-art-reboot #cast-line-btn,
  body.aqua-v58-art-reboot #reel-action-btn,
  body.aqua-v58-art-reboot .primary {
    border-radius: 999px !important;
    border: 1.5px solid rgba(255,255,255,.42) !important;
    box-shadow: inset 0 2px 0 rgba(255,255,255,.50), inset 0 -8px 14px rgba(35,40,127,.18), 0 14px 24px rgba(0,11,28,.32) !important;
    text-shadow: 0 2px 0 rgba(0,0,0,.18);
  }

  body.aqua-v58-art-reboot .guide-actions button.primary,
  body.aqua-v58-art-reboot button.primary,
  body.aqua-v58-art-reboot .primary:not(.v30-kpi),
  body.aqua-v58-art-reboot #cast-line-btn {
    color: #062033 !important;
    background:
      linear-gradient(145deg, rgba(255,255,178,.98), rgba(140,246,226,.98) 26%, rgba(61,212,255,.96) 70%, rgba(104,112,244,.94)),
      url('${ART_ASSETS.button}') center/100% 100% no-repeat !important;
  }

  body.aqua-v58-art-reboot .guide-actions button:not(.primary),
  body.aqua-v58-art-reboot button.secondary,
  body.aqua-v58-art-reboot .secondary {
    color: rgba(244,252,255,.94) !important;
    background: linear-gradient(180deg, rgba(255,255,255,.16), rgba(255,255,255,.06)), rgba(10,45,72,.72) !important;
  }

  body.aqua-v58-art-reboot .bottom-nav {
    left: 10px !important;
    right: 10px !important;
    bottom: max(8px, env(safe-area-inset-bottom, 0px)) !important;
    border-radius: 30px 30px 24px 24px !important;
    border: 1px solid rgba(199,255,255,.22) !important;
    background:
      linear-gradient(180deg, rgba(18,69,98,.88), rgba(3,14,31,.96)),
      url('${ART_ASSETS.nav}') center bottom/100% 100% no-repeat !important;
    box-shadow: 0 -12px 36px rgba(5,23,40,.56), inset 0 2px 0 rgba(255,255,255,.16) !important;
    overflow: visible !important;
    backdrop-filter: blur(16px) saturate(145%) !important;
    -webkit-backdrop-filter: blur(16px) saturate(145%) !important;
  }

  body.aqua-v58-art-reboot .bottom-nav .nav-tile {
    min-height: 54px;
    display: grid;
    place-items: center;
    gap: 1px;
    border-radius: 22px;
    font-weight: 900;
    color: rgba(234,250,255,.78);
    text-shadow: 0 2px 0 rgba(0,0,0,.20);
    transition: transform .18s cubic-bezier(.2,.8,.2,1), background .18s ease, color .18s ease;
  }

  body.aqua-v58-art-reboot .bottom-nav .nav-tile:active,
  body.aqua-v58-art-reboot .bottom-nav .nav-tile.aqua-v58-active {
    color: #ffffff;
    background: linear-gradient(180deg, rgba(255,255,255,.18), rgba(102,232,255,.08));
    box-shadow: inset 0 1px 0 rgba(255,255,255,.22), 0 8px 16px rgba(0,0,0,.2);
  }

  body.aqua-v58-art-reboot .first-play-guide {
    position: relative !important;
    overflow: hidden !important;
    padding: 1.15rem !important;
    margin-top: .75rem !important;
  }

  body.aqua-v58-art-reboot .first-play-guide .text-\[10px\] {
    display: inline-flex;
    align-items: center;
    gap: .35rem;
    padding: .35rem .62rem;
    border-radius: 999px;
    color: #09304a !important;
    background: linear-gradient(90deg, rgba(255,244,155,.98), rgba(132,246,224,.94));
    box-shadow: 0 8px 18px rgba(0,0,0,.20), inset 0 1px 0 rgba(255,255,255,.6);
    letter-spacing: .12em !important;
  }

  body.aqua-v58-art-reboot .guide-steps { gap: .58rem !important; }
  body.aqua-v58-art-reboot .guide-step {
    position: relative;
    overflow: hidden;
    padding: .74rem .82rem !important;
    border-radius: 22px !important;
    border: 1px solid rgba(255,255,255,.20) !important;
    background: linear-gradient(145deg, rgba(255,255,255,.18), rgba(95,224,255,.08) 54%, rgba(0,18,36,.20)) !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.25), 0 8px 16px rgba(0,0,0,.14);
  }
  body.aqua-v58-art-reboot .guide-step > span:first-child {
    min-width: 34px; height: 34px;
    display: inline-grid; place-items: center;
    border-radius: 14px;
    color: #062033 !important;
    font-weight: 1000;
    background: linear-gradient(145deg, #fff2a6, #65f4ff 70%, #6374ff);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.68), 0 8px 12px rgba(0,0,0,.20);
  }

  body.aqua-v58-art-reboot .region-card {
    position: relative;
    min-height: 138px !important;
    border-radius: 32px !important;
    background:
      radial-gradient(circle at 18% 15%, rgba(255,245,163,.22), transparent 38%),
      radial-gradient(circle at 86% 18%, rgba(99,244,255,.25), transparent 35%),
      linear-gradient(145deg, rgba(255,255,255,.18), rgba(70,180,219,.10) 45%, rgba(8,32,55,.72)) !important;
  }
  body.aqua-v58-art-reboot .region-card .region-emoji {
    width: 54px; height: 54px;
    display: grid; place-items: center;
    border-radius: 22px;
    background: linear-gradient(145deg, rgba(255,255,255,.35), rgba(96,244,255,.16));
    box-shadow: inset 0 1px 0 rgba(255,255,255,.38), 0 12px 22px rgba(0,0,0,.22);
    font-size: 1.85rem !important;
    filter: drop-shadow(0 8px 12px rgba(0,20,38,.28)) !important;
  }
  body.aqua-v58-art-reboot .region-card .region-title { font-weight: 1000 !important; letter-spacing: -.04em; }
  body.aqua-v58-art-reboot .region-card .region-desc { color: rgba(236,253,255,.70) !important; }

  body.aqua-v58-art-reboot .section-title,
  body.aqua-v58-art-reboot h1,
  body.aqua-v58-art-reboot h2,
  body.aqua-v58-art-reboot .region-title {
    text-shadow: 0 3px 0 rgba(0,0,0,.18), 0 18px 30px rgba(0,0,0,.24) !important;
  }

  body.aqua-v58-art-reboot .hud-chip,
  body.aqua-v58-art-reboot .aqua-v58-chip {
    border: 1px solid rgba(218,255,255,.24) !important;
    background: linear-gradient(180deg, rgba(255,255,255,.17), rgba(255,255,255,.06)) !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.22), 0 8px 16px rgba(0,0,0,.16) !important;
    border-radius: 999px !important;
  }

  body.aqua-v58-art-reboot #fishing-visual,
  body.aqua-v58-art-reboot .fishing-stage,
  body.aqua-v58-art-reboot #v47-fishing-canvas,
  body.aqua-v58-art-reboot #v49-pixi-runtime-canvas {
    border-radius: 32px !important;
    box-shadow: inset 0 2px 0 rgba(255,255,255,.22), 0 24px 52px rgba(0,9,24,.38) !important;
  }

  body.aqua-v58-art-reboot .aqua-v58-icon-fish {
    background: url('${ART_ASSETS.fish}') center/contain no-repeat;
  }
  body.aqua-v58-art-reboot .aqua-v58-icon-lake {
    background: url('${ART_ASSETS.lake}') center/contain no-repeat;
  }

  body.aqua-v58-art-reboot.aqua-v58-lite .premium-glass,
  body.aqua-v58-art-reboot.aqua-v58-lite .premium-card,
  body.aqua-v58-art-reboot.aqua-v58-lite .first-play-guide {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    box-shadow: 0 12px 22px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.18) !important;
  }
  body.aqua-v58-art-reboot.aqua-v58-lite .premium-card::after,
  body.aqua-v58-art-reboot.aqua-v58-lite .region-card::after,
  body.aqua-v58-art-reboot.aqua-v58-lite .first-play-guide::after { opacity: .34; }

  @media (max-width: 420px) {
    body.aqua-v58-art-reboot .first-play-guide { border-radius: 28px !important; }
    body.aqua-v58-art-reboot .guide-step { font-size: .72rem !important; }
    body.aqua-v58-art-reboot .bottom-nav .nav-tile { min-height: 50px; font-size: .72rem; }
  }
  @media (prefers-reduced-motion: reduce) {
    body.aqua-v58-art-reboot *,
    body.aqua-v58-art-reboot *::before,
    body.aqua-v58-art-reboot *::after { animation-duration: .001ms !important; transition-duration: .001ms !important; }
  }
  `;

  function injectStyle() {
    if (document.getElementById('aqua-v58-ui-art-style')) return;
    const style = document.createElement('style');
    style.id = 'aqua-v58-ui-art-style';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function shouldLite() {
    const con = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const saveData = con?.saveData === true;
    const small = Math.min(innerWidth || 0, innerHeight || 0) <= 390;
    const lowMemory = navigator.deviceMemory && navigator.deviceMemory <= 4;
    const lowCores = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    return saveData || small || lowMemory || lowCores || document.body.classList.contains('perf-lite') || matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  }

  function markScreen() {
    const active = [...document.querySelectorAll('[id^="screen-"]')].find((el) => !el.classList.contains('hidden'));
    const id = active?.id?.replace('screen-', '') || document.body.dataset.screen || 'unknown';
    document.body.dataset.screen = id;
    document.documentElement.dataset.aquaScreen = id;
    document.querySelectorAll('.bottom-nav .nav-tile').forEach((tile) => tile.classList.remove('aqua-v58-active'));
    const map = { village: 0, fishing: 1, equipment: 2, inventory: 3, quests: 4, competition: 5 };
    const idx = map[id];
    if (Number.isInteger(idx)) document.querySelectorAll('.bottom-nav .nav-tile')[idx]?.classList.add('aqua-v58-active');
  }

  function decorateCards(root = document) {
    const selector = [
      '.premium-card', '.premium-glass', '.first-play-guide', '.region-card', '.route-panel', '.mission-panel', '.boss-panel',
      '.inventory-coach', '.result-card', '.captain-panel', '.quality-director', '.v36-core-navigator', '.v37-art-director', '.v38-action-director',
      '.v41-flow-hud', '.v48-runtime-panel', '.v49-runtime-panel', '.v50-performance-panel', '.v51-stability-panel'
    ].join(',');
    root.querySelectorAll?.(selector).forEach((el) => {
      if (el.dataset.v58Decorated === '1') return;
      el.dataset.v58Decorated = '1';
      el.classList.add('aqua-v58-surface');
    });
    root.querySelectorAll?.('button, .nav-tile').forEach((el) => {
      if (el.dataset.v58Control === '1') return;
      el.dataset.v58Control = '1';
      el.classList.add('aqua-v58-control');
    });
  }

  function hideDevelopmentLeftovers() {
    const texts = ['QUICK ACTION', 'Node24 OK', 'STACK SAFE', 'Pixi Bridge', 'Atlas 대기'];
    document.querySelectorAll('body *').forEach((el) => {
      if (!(el instanceof HTMLElement)) return;
      if (el.children.length > 0) return;
      const text = (el.textContent || '').trim();
      if (!text) return;
      if (texts.some((needle) => text.includes(needle))) {
        el.style.display = 'none';
        el.setAttribute('aria-hidden', 'true');
      }
    });
  }

  function apply() {
    injectStyle();
    document.documentElement.classList.add('aqua-v58-booted');
    document.body.classList.add('aqua-v58-art-reboot');
    document.body.classList.toggle('aqua-v58-lite', shouldLite());
    document.body.dataset.aquaArt = 'v5.8.0-2.5d';
    markScreen();
    decorateCards(document);
    hideDevelopmentLeftovers();
  }

  const runSoon = () => requestAnimationFrame(() => {
    try { apply(); } catch (error) { console.warn('[AquaV58UIArtReboot] apply failed', error); }
  });

  const observer = new MutationObserver((mutations) => {
    let shouldRun = false;
    for (const mutation of mutations) {
      if (mutation.addedNodes?.length || mutation.attributeName === 'class') { shouldRun = true; break; }
    }
    if (shouldRun) runSoon();
  });

  window.AquaV58UIArtReboot = {
    installed: true,
    version: VERSION,
    apply,
    decorateCards,
    artAssets: ART_ASSETS,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      apply();
      observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    }, { once: true });
  } else {
    apply();
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  }
  addEventListener('resize', runSoon, { passive: true });
  addEventListener('orientationchange', runSoon, { passive: true });
})();
