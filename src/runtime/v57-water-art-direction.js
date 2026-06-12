// Aqua Fantasia v5.7.0 Water Art Direction Pass
// ------------------------------------------------------------
// 목적:
// 1) v5.6 임시 배경을 더 깊이감 있는 지역별 원화풍 배경으로 승격합니다.
// 2) 호수/강/항구/심해/용궁/차원의 바다에 서로 다른 수면 애니메이션을 얹습니다.
// 3) 모바일 성능을 위해 CSS transform/opacity 중심의 저비용 레이어만 사용합니다.

(function aquaV57WaterArtDirection() {
  const VERSION = '5.7.0';
  const DEFAULT_REGION = '호수';
  const REGION_TO_KEY = new Map([
    ['호수', 'lake'],
    ['강', 'river'],
    ['항구', 'harbor'],
    ['심해', 'deep'],
    ['용궁', 'palace'],
    ['차원의 바다', 'dimension'],
  ]);
  const KEY_TO_REGION = new Map([...REGION_TO_KEY].map(([region, key]) => [key, region]));
  const REGION_ASSETS = Object.freeze({
    lake: 'assets/art/v57_fishing_bg_lake_master.webp',
    river: 'assets/art/v57_fishing_bg_river_master.webp',
    harbor: 'assets/art/v57_fishing_bg_harbor_master.webp',
    deep: 'assets/art/v57_fishing_bg_deep_master.webp',
    palace: 'assets/art/v57_fishing_bg_palace_master.webp',
    dimension: 'assets/art/v57_fishing_bg_dimension_master.webp',
  });
  const REGION_TONES = Object.freeze({
    lake: { a: '103,232,249', b: '45,212,191', c: '255,240,170', speed: '16s', plane: '52%' },
    river: { a: '94,234,212', b: '34,197,94', c: '211,255,232', speed: '12s', plane: '58%' },
    harbor: { a: '251,146,60', b: '56,189,248', c: '255,221,142', speed: '18s', plane: '50%' },
    deep: { a: '129,140,248', b: '34,211,238', c: '192,132,252', speed: '22s', plane: '100%' },
    palace: { a: '250,204,21', b: '45,212,191', c: '255,244,190', speed: '18s', plane: '100%' },
    dimension: { a: '240,171,252', b: '103,232,249', c: '255,237,213', speed: '14s', plane: '66%' },
  });
  const OVERLAY_ASSETS = Object.freeze({
    ripple: 'assets/art/v57_water_ripple_overlay.webp',
    caustics: 'assets/art/v57_water_caustics_overlay.webp',
  });

  const state = {
    version: VERSION,
    region: DEFAULT_REGION,
    key: 'lake',
    asset: REGION_ASSETS.lake,
    appliedAt: 0,
    sweeps: 0,
  };

  function escapeUrl(value) {
    return String(value || '').replace(/["\\]/g, '\\$&');
  }

  function normalizeRegion(value) {
    const text = String(value || '').replace(/[🎣🌊🏞️🏞⚓🐉🌀]/g, '').trim();
    if (REGION_TO_KEY.has(text)) return text;
    if (text.includes('차원')) return '차원의 바다';
    if (text.includes('용궁') || text.includes('용')) return '용궁';
    if (text.includes('심해')) return '심해';
    if (text.includes('항구')) return '항구';
    if (text.includes('강')) return '강';
    if (text.includes('호수')) return '호수';
    const saved = localStorage.getItem('aqua_v57_region_key') || localStorage.getItem('aqua_v56_region_key');
    if (saved && KEY_TO_REGION.has(saved)) return KEY_TO_REGION.get(saved);
    return DEFAULT_REGION;
  }

  function getCurrentRegionFromDom() {
    const title = document.getElementById('fishing-region-name')?.textContent || '';
    if (title.trim()) return normalizeRegion(title);
    const activeCard = document.querySelector('.region-card.route-recommended')?.getAttribute('data-region') || '';
    if (activeCard) return normalizeRegion(activeCard);
    const selected = document.querySelector('[data-current-region]')?.getAttribute('data-current-region') || '';
    return normalizeRegion(selected || DEFAULT_REGION);
  }

  function ready(fn) {
    if (document.body) fn();
    else document.addEventListener('DOMContentLoaded', fn, { once: true });
  }

  function ensureStyle() {
    if (document.getElementById('aqua-v57-water-art-style')) return;
    const style = document.createElement('style');
    style.id = 'aqua-v57-water-art-style';
    style.textContent = `
      :root{--aqua-v57-bg:url('assets/art/v57_fishing_bg_lake_master.webp');--aqua-v57-ripple:url('assets/art/v57_water_ripple_overlay.webp');--aqua-v57-caustics:url('assets/art/v57_water_caustics_overlay.webp');--aqua-v57-a:103,232,249;--aqua-v57-b:45,212,191;--aqua-v57-c:255,240,170;--aqua-v57-speed:16s;--aqua-v57-plane:52%;}
      body.aqua-v57-water-art #screen-fishing{background-image:radial-gradient(circle at 50% -10%,rgba(var(--aqua-v57-c),.22),transparent 22rem),linear-gradient(180deg,rgba(2,8,23,.08),rgba(2,8,23,.64) 68%,rgba(2,8,23,.88)),var(--aqua-v57-bg)!important;background-size:cover,cover,cover!important;background-position:center top,center,center!important;}
      body.aqua-v57-water-art #fishing-visual{isolation:isolate;background-image:linear-gradient(180deg,rgba(255,255,255,.05),rgba(2,8,23,.18) 44%,rgba(2,8,23,.48)),var(--aqua-v57-bg)!important;background-size:cover,cover!important;background-position:center,center!important;border-color:rgba(var(--aqua-v57-a),.24)!important;box-shadow:0 24px 76px rgba(0,0,0,.46),inset 0 1px 0 rgba(255,255,255,.22),inset 0 -18px 70px rgba(var(--aqua-v57-b),.10)!important;}
      body.aqua-v57-water-art #aqua-v56-bg-layer{display:none!important;opacity:0!important;}
      body.aqua-v57-water-art #fishing-visual>.absolute.inset-0.bg-gradient-to-b{opacity:0!important;}
      .aqua-v57-bg-master,.aqua-v57-atmosphere,.aqua-v57-water-plane,.aqua-v57-caustics,.aqua-v57-ripple,.aqua-v57-particles,.aqua-v57-foreground-vignette{position:absolute;inset:0;pointer-events:none;transform:translateZ(0);}
      .aqua-v57-bg-master{z-index:0;background-image:linear-gradient(180deg,rgba(255,255,255,.05),rgba(2,8,23,.24) 55%,rgba(2,8,23,.58)),var(--aqua-v57-bg);background-size:cover,cover;background-position:center,center;filter:saturate(1.14) contrast(1.04);transform:scale(1.018);}
      .aqua-v57-atmosphere{z-index:1;background:radial-gradient(circle at 28% 18%,rgba(var(--aqua-v57-c),.24),transparent 18rem),radial-gradient(circle at 78% 58%,rgba(var(--aqua-v57-a),.18),transparent 16rem),linear-gradient(180deg,rgba(255,255,255,.03),transparent 35%,rgba(2,8,23,.18));mix-blend-mode:screen;opacity:.88;animation:aquaV57Breath 9s ease-in-out infinite;}
      .aqua-v57-water-plane{z-index:2;top:auto;height:var(--aqua-v57-plane);bottom:-3%;background-image:var(--aqua-v57-ripple),linear-gradient(180deg,rgba(var(--aqua-v57-a),.04),rgba(var(--aqua-v57-a),.18) 35%,rgba(2,8,23,.24));background-size:520px 520px,100% 100%;background-position:0 0,center;mix-blend-mode:screen;opacity:.70;filter:blur(.15px);animation:aquaV57WaterDrift var(--aqua-v57-speed) linear infinite;}
      .aqua-v57-caustics{z-index:3;background-image:var(--aqua-v57-caustics);background-size:620px 620px;mix-blend-mode:screen;opacity:.46;animation:aquaV57Caustics calc(var(--aqua-v57-speed) * 1.65) linear infinite;}
      .aqua-v57-ripple{z-index:4;top:auto;bottom:4%;height:45%;background:repeating-linear-gradient(0deg,transparent 0 18px,rgba(var(--aqua-v57-c),.045) 20px,transparent 24px),radial-gradient(ellipse at 50% 72%,rgba(var(--aqua-v57-a),.15),transparent 42%);mix-blend-mode:screen;opacity:.66;animation:aquaV57Ripple 7.5s ease-in-out infinite;}
      .aqua-v57-particles{z-index:5;background-image:radial-gradient(circle at 12% 82%,rgba(var(--aqua-v57-c),.45) 0 1.5px,transparent 2px),radial-gradient(circle at 34% 66%,rgba(255,255,255,.36) 0 1px,transparent 1.8px),radial-gradient(circle at 72% 76%,rgba(var(--aqua-v57-a),.45) 0 1.3px,transparent 2.2px),radial-gradient(circle at 86% 58%,rgba(var(--aqua-v57-b),.34) 0 1.4px,transparent 2.4px);background-size:140px 220px,190px 260px,170px 210px,230px 280px;opacity:.52;animation:aquaV57Particles 18s linear infinite;}
      .aqua-v57-foreground-vignette{z-index:6;background:linear-gradient(180deg,rgba(2,8,23,.08),transparent 22%,transparent 70%,rgba(2,8,23,.26)),radial-gradient(ellipse at 50% 110%,rgba(2,8,23,.52),transparent 50%);opacity:.78;}
      body.aqua-v57-water-art[data-aqua-v57-region='deep'] .aqua-v57-water-plane,
      body.aqua-v57-water-art[data-aqua-v57-region='palace'] .aqua-v57-water-plane{height:100%;bottom:0;opacity:.50;}
      body.aqua-v57-water-art[data-aqua-v57-region='deep'] .aqua-v57-ripple,
      body.aqua-v57-water-art[data-aqua-v57-region='palace'] .aqua-v57-ripple{height:100%;bottom:0;opacity:.34;}
      body.aqua-v57-water-art[data-aqua-v57-region='dimension'] .aqua-v57-atmosphere{animation-duration:5.8s;opacity:.96;}
      body.aqua-v57-water-art[data-aqua-v57-region='harbor'] .aqua-v57-caustics{opacity:.32;}
      body.aqua-v57-water-art .wave-layer{opacity:.26!important;mix-blend-mode:screen;filter:blur(.6px);}
      body.aqua-v57-water-art .fx-aurora{opacity:.22!important;}
      body.aqua-v57-water-art .depth-rays{opacity:.18!important;}
      body.aqua-v57-water-art #v47-renderer-layer canvas{opacity:.42;mix-blend-mode:screen;}
      body.aqua-v57-water-art #v49-pixi-runtime-canvas{opacity:.58;mix-blend-mode:screen;}
      body.aqua-v57-water-art #v50-focus-canvas{opacity:.44;mix-blend-mode:screen;}
      body.aqua-v57-water-art[data-aqua-v57-region='lake'] .region-card[data-region='호수'],
      body.aqua-v57-water-art[data-aqua-v57-region='river'] .region-card[data-region='강'],
      body.aqua-v57-water-art[data-aqua-v57-region='harbor'] .region-card[data-region='항구'],
      body.aqua-v57-water-art[data-aqua-v57-region='deep'] .region-card[data-region='심해'],
      body.aqua-v57-water-art[data-aqua-v57-region='palace'] .region-card[data-region='용궁'],
      body.aqua-v57-water-art[data-aqua-v57-region='dimension'] .region-card[data-region='차원의 바다']{box-shadow:0 0 0 2px rgba(var(--aqua-v57-c),.42),0 24px 60px rgba(var(--aqua-v57-a),.18)!important;}
      body.aqua-v57-water-art .region-card[data-region='호수']{background-image:linear-gradient(135deg,rgba(2,8,23,.12),rgba(6,78,59,.16)),url('assets/art/v57_fishing_bg_lake_master.webp')!important;}
      body.aqua-v57-water-art .region-card[data-region='강']{background-image:linear-gradient(135deg,rgba(2,8,23,.14),rgba(20,184,166,.14)),url('assets/art/v57_fishing_bg_river_master.webp')!important;}
      body.aqua-v57-water-art .region-card[data-region='항구']{background-image:linear-gradient(135deg,rgba(2,8,23,.20),rgba(249,115,22,.14)),url('assets/art/v57_fishing_bg_harbor_master.webp')!important;}
      body.aqua-v57-water-art .region-card[data-region='심해']{background-image:linear-gradient(135deg,rgba(2,8,23,.18),rgba(79,70,229,.18)),url('assets/art/v57_fishing_bg_deep_master.webp')!important;}
      body.aqua-v57-water-art .region-card[data-region='용궁']{background-image:linear-gradient(135deg,rgba(2,8,23,.12),rgba(250,204,21,.12)),url('assets/art/v57_fishing_bg_palace_master.webp')!important;}
      body.aqua-v57-water-art .region-card[data-region='차원의 바다']{background-image:linear-gradient(135deg,rgba(2,8,23,.18),rgba(217,70,239,.16)),url('assets/art/v57_fishing_bg_dimension_master.webp')!important;}
      @keyframes aquaV57WaterDrift{0%{background-position:0 0,center;transform:translate3d(-1.5%,0,0) scale(1.02)}50%{transform:translate3d(1.5%,-1%,0) scale(1.035)}100%{background-position:520px 160px,center;transform:translate3d(-1.5%,0,0) scale(1.02)}}
      @keyframes aquaV57Caustics{0%{background-position:0 0;transform:translate3d(0,0,0) rotate(0deg)}100%{background-position:-620px 380px;transform:translate3d(1%,0,0) rotate(.01deg)}}
      @keyframes aquaV57Ripple{0%,100%{transform:translate3d(0,0,0) scaleY(1);opacity:.55}50%{transform:translate3d(0,-8px,0) scaleY(1.08);opacity:.78}}
      @keyframes aquaV57Breath{0%,100%{opacity:.72;filter:saturate(1)}50%{opacity:.98;filter:saturate(1.25)}}
      @keyframes aquaV57Particles{0%{background-position:0 0,0 0,0 0,0 0}100%{background-position:0 -220px,0 -260px,0 -210px,0 -280px}}
      @media (prefers-reduced-motion:reduce){.aqua-v57-atmosphere,.aqua-v57-water-plane,.aqua-v57-caustics,.aqua-v57-ripple,.aqua-v57-particles{animation:none!important}}
      body.perf-lite.aqua-v57-water-art .aqua-v57-caustics,
      body.aqua-v55-lite.aqua-v57-water-art .aqua-v57-caustics{display:none!important;}
      body.perf-lite.aqua-v57-water-art .aqua-v57-particles{opacity:.20;animation-duration:32s;}
      body.perf-lite.aqua-v57-water-art .aqua-v57-water-plane{opacity:.46;animation-duration:26s;}
    `;
    document.head.appendChild(style);
  }

  function ensureLayer(id, className, parent, before) {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      el.className = className;
      el.setAttribute('aria-hidden', 'true');
      parent.insertBefore(el, before || parent.firstChild);
    }
    return el;
  }

  function ensureLayers() {
    const visual = document.getElementById('fishing-visual');
    if (!visual) return null;
    const first = visual.firstChild;
    const ids = [
      ['aqua-v57-bg-master', 'aqua-v57-bg-master'],
      ['aqua-v57-atmosphere', 'aqua-v57-atmosphere'],
      ['aqua-v57-water-plane', 'aqua-v57-water-plane'],
      ['aqua-v57-caustics', 'aqua-v57-caustics'],
      ['aqua-v57-ripple', 'aqua-v57-ripple'],
      ['aqua-v57-particles', 'aqua-v57-particles'],
      ['aqua-v57-foreground-vignette', 'aqua-v57-foreground-vignette'],
    ];
    ids.slice().reverse().forEach(([id, className]) => ensureLayer(id, className, visual, first));
    return visual;
  }

  function applyTone(key) {
    const tone = REGION_TONES[key] || REGION_TONES.lake;
    const root = document.documentElement;
    root.style.setProperty('--aqua-v57-a', tone.a);
    root.style.setProperty('--aqua-v57-b', tone.b);
    root.style.setProperty('--aqua-v57-c', tone.c);
    root.style.setProperty('--aqua-v57-speed', tone.speed);
    root.style.setProperty('--aqua-v57-plane', tone.plane);
  }

  function setWaterArt(regionValue) {
    ensureStyle();
    const region = normalizeRegion(regionValue || getCurrentRegionFromDom());
    const key = REGION_TO_KEY.get(region) || 'lake';
    const asset = REGION_ASSETS[key] || REGION_ASSETS.lake;
    state.region = region;
    state.key = key;
    state.asset = asset;
    state.appliedAt = Date.now();
    state.sweeps += 1;

    document.body.classList.add('aqua-v57-water-art', 'aqua-v56-bg-art');
    document.body.dataset.aquaV57Region = key;
    document.body.dataset.aquaV56Region = key;
    const root = document.documentElement;
    root.style.setProperty('--aqua-v57-bg', `url("${escapeUrl(asset)}")`);
    root.style.setProperty('--aqua-v57-ripple', `url("${escapeUrl(OVERLAY_ASSETS.ripple)}")`);
    root.style.setProperty('--aqua-v57-caustics', `url("${escapeUrl(OVERLAY_ASSETS.caustics)}")`);
    root.style.setProperty('--aqua-v56-bg', `url("${escapeUrl(asset)}")`);
    root.style.setProperty('--aqua-v56-bg-soft', `url("${escapeUrl(asset)}")`);
    applyTone(key);

    const visual = ensureLayers();
    const bg = document.getElementById('aqua-v57-bg-master');
    if (bg) {
      bg.dataset.region = region;
      bg.style.backgroundImage = `linear-gradient(180deg,rgba(255,255,255,.05),rgba(2,8,23,.24) 55%,rgba(2,8,23,.58)), url("${escapeUrl(asset)}")`;
    }
    if (visual) visual.dataset.aquaV57Region = key;

    try {
      localStorage.setItem('aqua_v57_region_key', key);
      localStorage.setItem('aqua_v57_background_art', asset);
      localStorage.setItem('aqua_v57_water_art_ready', VERSION);
    } catch (_) {}
    window.dispatchEvent(new CustomEvent('aqua:v57-water-art', { detail: { version: VERSION, region, key, asset } }));
    return { region, key, asset };
  }

  function patchRegionSelectors() {
    if (window.__aquaV57RegionPatched) return;
    const original = window.selectRegion;
    if (typeof original === 'function') {
      window.selectRegion = function aquaV57SelectRegionProxy(region, ...rest) {
        const result = original.apply(this, [region, ...rest]);
        requestAnimationFrame(() => setWaterArt(region));
        return result;
      };
      window.selectRegion.__aquaV57Original = original;
    }
    const originalMap = window.selectRegionFromMap;
    if (typeof originalMap === 'function') {
      window.selectRegionFromMap = function aquaV57SelectRegionFromMapProxy(region, ...rest) {
        const result = originalMap.apply(this, [region, ...rest]);
        requestAnimationFrame(() => setWaterArt(region));
        return result;
      };
      window.selectRegionFromMap.__aquaV57Original = originalMap;
    }
    window.__aquaV57RegionPatched = true;
  }

  function watchRegionTitle() {
    const title = document.getElementById('fishing-region-name');
    if (!title || title.__aquaV57Observed) return;
    title.__aquaV57Observed = true;
    const observer = new MutationObserver(() => setWaterArt(title.textContent));
    observer.observe(title, { childList: true, subtree: true, characterData: true });
  }

  function preloadAssets() {
    const now = [REGION_ASSETS.lake, OVERLAY_ASSETS.ripple, OVERLAY_ASSETS.caustics];
    now.forEach((src) => {
      const img = new Image();
      img.decoding = 'async';
      img.loading = 'eager';
      img.src = src;
    });
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 600));
    idle(() => Object.values(REGION_ASSETS).forEach((src) => {
      const img = new Image();
      img.decoding = 'async';
      img.loading = 'lazy';
      img.src = src;
    }));
  }

  function boot() {
    ready(() => {
      ensureStyle();
      preloadAssets();
      setWaterArt(getCurrentRegionFromDom());
      patchRegionSelectors();
      watchRegionTitle();
      window.addEventListener('aqua:v56-background', (event) => setWaterArt(event?.detail?.region));
      window.addEventListener('aqua:screen-change', () => setWaterArt(getCurrentRegionFromDom()));
      setTimeout(() => setWaterArt(getCurrentRegionFromDom()), 300);
      setTimeout(() => setWaterArt(getCurrentRegionFromDom()), 1100);
      setInterval(() => {
        patchRegionSelectors();
        watchRegionTitle();
        if (document.body?.dataset?.screen === 'fishing') setWaterArt(getCurrentRegionFromDom());
      }, 2200);
      console.log('[AquaFantasia] v5.7.0 Water Art Direction ready');
    });
  }

  window.AquaV57WaterArt = Object.freeze({
    version: VERSION,
    assets: REGION_ASSETS,
    overlays: OVERLAY_ASSETS,
    regions: Object.fromEntries(REGION_TO_KEY),
    state,
    setWaterArt,
    normalizeRegion,
  });
  boot();
})();
