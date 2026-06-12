// AquaFantasia v5.6.0 Background Art Pass
// ------------------------------------------------------------
// 목적:
// 1) 낚시 화면에 남아 있던 텍스트 포함 임시 배경을 지역별 원화풍 배경으로 교체합니다.
// 2) 호수/강/항구/심해/용궁/차원의 바다마다 다른 WebP 배경을 연결합니다.
// 3) 기존 Pixi/Canvas/낚시 조작 런타임은 유지하고, 배경 레이어만 안전하게 오버레이합니다.

const VERSION = '5.6.0';
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
  lake: 'assets/art/v56_fishing_bg_lake.webp',
  river: 'assets/art/v56_fishing_bg_river.webp',
  harbor: 'assets/art/v56_fishing_bg_harbor.webp',
  deep: 'assets/art/v56_fishing_bg_deep.webp',
  palace: 'assets/art/v56_fishing_bg_palace.webp',
  dimension: 'assets/art/v56_fishing_bg_dimension.webp',
});

function escapeUrl(url) {
  return String(url || '').replace(/["\\]/g, '\\$&');
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
  const saved = localStorage.getItem('aqua_v56_region_key');
  if (saved && KEY_TO_REGION.has(saved)) return KEY_TO_REGION.get(saved);
  return DEFAULT_REGION;
}

function getCurrentRegionFromDom() {
  const title = document.getElementById('fishing-region-name')?.textContent || '';
  if (title.trim()) return normalizeRegion(title);
  const activeCard = document.querySelector('.region-card.route-recommended')?.getAttribute('data-region') || '';
  return normalizeRegion(activeCard || DEFAULT_REGION);
}

function ensureStyle() {
  if (document.getElementById('aqua-v56-background-art-style')) return;
  const style = document.createElement('style');
  style.id = 'aqua-v56-background-art-style';
  style.textContent = `
    :root{--aqua-v56-bg:url('assets/art/v56_fishing_bg_lake.webp');--aqua-v56-bg-soft:url('assets/art/v56_fishing_bg_lake.webp')}
    body.aqua-v56-bg-art #screen-fishing{background-image:radial-gradient(circle at 50% 0%,rgba(255,247,173,.10),transparent 18rem),linear-gradient(180deg,rgba(2,8,23,.10),rgba(2,8,23,.78)),var(--aqua-v56-bg)!important;background-size:cover,cover,cover!important;background-position:center top,center,center!important;}
    body.aqua-v56-bg-art #fishing-visual{isolation:isolate;background-image:linear-gradient(180deg,rgba(255,255,255,.04),rgba(2,8,23,.28) 56%,rgba(2,8,23,.48)),var(--aqua-v56-bg)!important;background-size:cover,cover!important;background-position:center,center!important;border-color:rgba(255,255,255,.18)!important;box-shadow:0 24px 72px rgba(0,0,0,.44),inset 0 1px 0 rgba(255,255,255,.18)!important;}
    body.aqua-v56-bg-art #fishing-visual .aqua-v56-bg-layer{position:absolute;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient(180deg,rgba(255,255,255,.04),rgba(2,8,23,.32) 62%,rgba(2,8,23,.50)),var(--aqua-v56-bg);background-size:cover,cover;background-position:center,center;transform:translateZ(0) scale(1.01);filter:saturate(1.08) contrast(1.02);}
    body.aqua-v56-bg-art #fishing-visual .aqua-v56-bg-layer::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 42% 18%,rgba(255,247,173,.18),transparent 18rem),radial-gradient(circle at 75% 64%,rgba(103,232,249,.12),transparent 16rem);mix-blend-mode:screen;opacity:.82;}
    body.aqua-v56-bg-art #fishing-visual .aqua-v56-bg-layer::after{content:'';position:absolute;left:-8%;right:-8%;bottom:12%;height:26%;background:linear-gradient(180deg,transparent,rgba(103,232,249,.13),rgba(2,8,23,.18));filter:blur(8px);opacity:.82;}
    body.aqua-v56-bg-art #fishing-visual>.absolute.inset-0.bg-gradient-to-b{opacity:0!important;}
    body.aqua-v56-bg-art #fishing-visual .fx-aurora{opacity:.28!important;mix-blend-mode:screen;}
    body.aqua-v56-bg-art #fishing-visual .depth-rays{opacity:.22!important;}
    body.aqua-v56-bg-art #v47-renderer-layer .v47-renderer-overlay{display:none!important;}
    body.aqua-v56-bg-art #v47-renderer-layer canvas{opacity:.58;mix-blend-mode:screen;}
    body.aqua-v56-bg-art #v49-pixi-runtime-canvas{opacity:.82;mix-blend-mode:screen;}
    body.aqua-v56-bg-art #v50-focus-canvas{opacity:.70;mix-blend-mode:screen;}
    body.aqua-v56-bg-art .v31-stage-polish{opacity:.25!important;}
    body.aqua-v56-bg-art[data-aqua-v56-region='lake'] #fishing-visual{--aqua-v56-water:#67e8f9;}
    body.aqua-v56-bg-art[data-aqua-v56-region='river'] #fishing-visual{--aqua-v56-water:#5eead4;}
    body.aqua-v56-bg-art[data-aqua-v56-region='harbor'] #fishing-visual{--aqua-v56-water:#fb923c;}
    body.aqua-v56-bg-art[data-aqua-v56-region='deep'] #fishing-visual{--aqua-v56-water:#a78bfa;}
    body.aqua-v56-bg-art[data-aqua-v56-region='palace'] #fishing-visual{--aqua-v56-water:#facc15;}
    body.aqua-v56-bg-art[data-aqua-v56-region='dimension'] #fishing-visual{--aqua-v56-water:#f0abfc;}
    body.aqua-v56-bg-art .region-card[data-region='호수']{background-image:linear-gradient(135deg,rgba(2,8,23,.20),rgba(6,78,59,.16)),url('assets/art/v56_fishing_bg_lake.webp')!important;}
    body.aqua-v56-bg-art .region-card[data-region='강']{background-image:linear-gradient(135deg,rgba(2,8,23,.22),rgba(20,184,166,.12)),url('assets/art/v56_fishing_bg_river.webp')!important;}
    body.aqua-v56-bg-art .region-card[data-region='항구']{background-image:linear-gradient(135deg,rgba(2,8,23,.26),rgba(249,115,22,.12)),url('assets/art/v56_fishing_bg_harbor.webp')!important;}
    body.aqua-v56-bg-art .region-card[data-region='심해']{background-image:linear-gradient(135deg,rgba(2,8,23,.34),rgba(79,70,229,.14)),url('assets/art/v56_fishing_bg_deep.webp')!important;}
    body.aqua-v56-bg-art .region-card[data-region='용궁']{background-image:linear-gradient(135deg,rgba(2,8,23,.26),rgba(250,204,21,.13)),url('assets/art/v56_fishing_bg_palace.webp')!important;}
    body.aqua-v56-bg-art .region-card[data-region='차원의 바다']{background-image:linear-gradient(135deg,rgba(2,8,23,.38),rgba(217,70,239,.14)),url('assets/art/v56_fishing_bg_dimension.webp')!important;}
    body.aqua-v56-bg-art .region-card.clean{background-size:cover!important;background-position:center!important;border-color:rgba(255,255,255,.16)!important;}
    body.aqua-v56-bg-art .region-card.clean .region-title,body.aqua-v56-bg-art .region-card.clean .region-desc,body.aqua-v56-bg-art .region-card.clean .region-emoji{position:relative;z-index:1;text-shadow:0 2px 10px rgba(0,0,0,.42);}
    body.aqua-v56-bg-art .region-card.clean::before{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(2,8,23,.08),rgba(2,8,23,.58));z-index:0;pointer-events:none;}
    body.perf-lite.aqua-v56-bg-art #fishing-visual .aqua-v56-bg-layer{filter:none;}
    body.perf-lite.aqua-v56-bg-art #v47-renderer-layer canvas,body.perf-lite.aqua-v56-bg-art #v49-pixi-runtime-canvas{opacity:.45;}
    @media(max-width:420px){body.aqua-v56-bg-art #fishing-visual{border-radius:1.8rem!important;}body.aqua-v56-bg-art #v47-renderer-layer canvas{opacity:.45;}}
  `;
  document.head.appendChild(style);
}

function ensureLayer() {
  const visual = document.getElementById('fishing-visual');
  if (!visual) return null;
  let layer = document.getElementById('aqua-v56-bg-layer');
  if (!layer) {
    layer = document.createElement('div');
    layer.id = 'aqua-v56-bg-layer';
    layer.className = 'aqua-v56-bg-layer';
    visual.insertBefore(layer, visual.firstChild);
  }
  return layer;
}

function setBackground(regionValue) {
  ensureStyle();
  const region = normalizeRegion(regionValue || getCurrentRegionFromDom());
  const key = REGION_TO_KEY.get(region) || 'lake';
  const asset = REGION_ASSETS[key] || REGION_ASSETS.lake;
  document.body.classList.add('aqua-v56-bg-art');
  document.body.dataset.aquaV56Region = key;
  document.documentElement.style.setProperty('--aqua-v56-bg', `url("${escapeUrl(asset)}")`);
  document.documentElement.style.setProperty('--aqua-v56-bg-soft', `url("${escapeUrl(asset)}")`);
  const layer = ensureLayer();
  if (layer) {
    layer.dataset.region = region;
    layer.style.backgroundImage = `linear-gradient(180deg,rgba(255,255,255,.04),rgba(2,8,23,.32) 62%,rgba(2,8,23,.50)), url("${escapeUrl(asset)}")`;
  }
  try {
    localStorage.setItem('aqua_v56_region_key', key);
    localStorage.setItem('aqua_v56_background_art', asset);
  } catch (error) {}
  window.dispatchEvent(new CustomEvent('aqua:v56-background', { detail: { region, key, asset, version: VERSION } }));
  return { region, key, asset };
}

function patchRegionSelectors() {
  const original = window.selectRegion;
  if (typeof original === 'function' && !original.__aquaV56Patched) {
    const wrapped = function aquaV56SelectRegion(region, ...rest) {
      const result = original.apply(this, [region, ...rest]);
      requestAnimationFrame(() => setBackground(region));
      return result;
    };
    wrapped.__aquaV56Patched = true;
    wrapped.__aquaV56Original = original;
    window.selectRegion = wrapped;
  }
  const originalMap = window.selectRegionFromMap;
  if (typeof originalMap === 'function' && !originalMap.__aquaV56Patched) {
    const wrappedMap = function aquaV56SelectRegionFromMap(region, ...rest) {
      const result = originalMap.apply(this, [region, ...rest]);
      requestAnimationFrame(() => setBackground(region));
      return result;
    };
    wrappedMap.__aquaV56Patched = true;
    wrappedMap.__aquaV56Original = originalMap;
    window.selectRegionFromMap = wrappedMap;
  }
}

function watchRegionTitle() {
  const title = document.getElementById('fishing-region-name');
  if (!title || title.__aquaV56Observed) return;
  title.__aquaV56Observed = true;
  const observer = new MutationObserver(() => setBackground(title.textContent));
  observer.observe(title, { childList: true, subtree: true, characterData: true });
}

function preloadAssets() {
  Object.values(REGION_ASSETS).forEach((src) => {
    const img = new Image();
    img.decoding = 'async';
    img.loading = 'eager';
    img.src = src;
  });
}

function boot() {
  ensureStyle();
  preloadAssets();
  setBackground(getCurrentRegionFromDom());
  patchRegionSelectors();
  watchRegionTitle();
  setInterval(() => {
    patchRegionSelectors();
    watchRegionTitle();
    if (document.body.dataset.screen === 'fishing') setBackground(getCurrentRegionFromDom());
  }, 1800);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}

window.AquaV56BackgroundArt = Object.freeze({
  version: VERSION,
  assets: REGION_ASSETS,
  regions: Object.fromEntries(REGION_TO_KEY),
  setBackground,
  normalizeRegion,
});
