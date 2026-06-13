const CACHE_VERSION = 'aqua-fantasia-v6.0.0-interaction-balance-20260612';
// aqua-fantasia-v5.9.0-state-dex-20260612 legacy marker for migration audit
// aqua-fantasia-v5.9.0-2-5d-art-20260612 legacy marker for migration audit
// aqua-fantasia-v5.7.0-water-art-20260612 legacy marker for migration audit
// aqua-fantasia-v5.6.1-ui-cleanup-20260612 legacy marker for migration audit
// aqua-fantasia-v5.6.0-background-art-20260612 legacy marker for migration audit
// aqua-fantasia-v5.5.5-auto-cache-sweep-20260612 legacy marker for migration audit
// aqua-fantasia-v5.5.2-runtime-ci-hotfix-20260612 legacy marker for migration audit
// aqua-fantasia-v5.5.1-hotfix-20260612 legacy marker for migration audit
// aqua-fantasia-v5.5.0-mobile-feel-20260612 legacy marker for migration audit
// aqua-fantasia-v5.4.0 legacy marker for migration audit
// aqua-fantasia-v5.3.0 legacy marker for migration audit
// aqua-fantasia-v5.2.0 legacy marker for migration audit
// aqua-fantasia-v5.1.0 legacy marker for migration audit
// aqua-fantasia-v5.0.0 legacy marker for migration audit
// aqua-fantasia-v4.9.0 legacy marker for migration audit
// aqua-fantasia-v4.8.0 legacy marker for migration audit
// aqua-fantasia-v4.7.0 legacy marker for migration audit
// aqua-fantasia-v4.6.0 legacy marker for migration audit
const CORE_CACHE = `${CACHE_VERSION}-core`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./offline.html",
  "./manifest.webmanifest",
  "./data/fish.json",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/maskable-512.png",
  "./assets/icons/apple-touch-icon.png",
  "./assets/art/aqua_logo_mark.svg",
  "./assets/art/v39_fishing_grand_stage.svg",
  "./assets/art/v41_precision_ring.svg",
  "./assets/art/v42_result_scroll.svg",
  "./assets/art/v45_bobber_master.svg",
  "./assets/art/v45_reel_console_premium.svg",
  "./assets/atlas/aqua_fishing_v47.webp",
  "./assets/atlas/aqua_fishing_v47.atlas.json",
  "./assets/art/v47_fishing_pixi_stage.svg",
  "./assets/art/v47_renderer_console.svg",
  "./assets/art/v48_runtime_diet_panel.svg",
  "./assets/art/v48_runtime_backdrop.svg",
  "./assets/art/v48_fishing_renderer_lite.svg",
  "./assets/atlas/aqua_fishing_v48.webp",
  "./assets/atlas/aqua_fishing_v48.atlas.json",
  "./assets/art/v49_pixi_runtime_stage.svg",
  "./assets/art/v49_runtime_panel.svg",
  "./assets/atlas/aqua_fishing_v49.webp",
  "./assets/atlas/aqua_fishing_v49.atlas.json",
  "./assets/art/v50_runtime_console.svg",
  "./assets/art/v50_fishing_focus_stage.svg",
  "./assets/art/v50_perf_meter.svg",
  "./assets/atlas/aqua_fishing_v50.webp",
  "./assets/atlas/aqua_fishing_v50.atlas.json",
  "./assets/art/v51_stability_console.svg",
  "./assets/art/v51_touch_latency.svg",
  "./assets/art/v51_fishing_fps_lane.svg",
  "./assets/art/v55_mobile_feel_panel.svg",
  "./assets/atlas/aqua_fishing_v51.webp",
  "./assets/atlas/aqua_fishing_v51.atlas.json",
  "./assets/ui-kit/icons/fish_6.png",
  "./assets/ui-kit/icons/fish_5.png",
  "./assets/ui-kit/icons/fish_4.png",
  "./assets/ui-kit/icons/fish_3.png",
  "./assets/ui-kit/icons/fish_2.png",
  "./assets/ui-kit/icons/fish_1.png",
  "./assets/ui-kit/panels/panel_1.png",
  "./assets/ui-kit/fishing_minigame/reel_bar_220px.png",
  "./assets/ui-kit/fishing_minigame/bobber_large.png",
  "./assets/ui-kit/icons/tension_gauge.png",
  "./assets/ui-kit/icons/water_ripple.png",
  "./assets/art/v56_fishing_bg_lake.webp",
  "./assets/art/v56_fishing_bg_river.webp",
  "./assets/art/v56_fishing_bg_harbor.webp",
  "./assets/art/v56_fishing_bg_deep.webp",
  "./assets/art/v56_fishing_bg_palace.webp",
  "./assets/art/v56_fishing_bg_dimension.webp",
  "./assets/art/v57_fishing_bg_lake_master.webp",
  "./assets/art/v57_fishing_bg_river_master.webp",
  "./assets/art/v57_fishing_bg_harbor_master.webp",
  "./assets/art/v57_fishing_bg_deep_master.webp",
  "./assets/art/v57_fishing_bg_palace_master.webp",
  "./assets/art/v57_fishing_bg_dimension_master.webp",
  "./assets/art/v57_water_ripple_overlay.webp",
  "./assets/art/v57_water_caustics_overlay.webp",
  "./assets/art/v58_panel_25d.svg",
  "./assets/art/v58_button_primary_25d.svg",
  "./assets/art/v58_nav_shell_25d.svg",
  "./assets/art/v58_icon_fish_25d.svg",
  "./assets/art/v58_icon_lake_25d.svg",
  "./assets/art/v59_dex_card_25d.svg",
  "./assets/art/v59_dex_locked_25d.svg",
  "./assets/art/v59_fish_lake_25d.webp",
  "./assets/art/v59_fish_river_25d.webp",
  "./assets/art/v59_fish_harbor_25d.webp",
  "./assets/art/v59_fish_deep_25d.webp",
  "./assets/art/v59_fish_palace_25d.webp",
  "./assets/art/v59_fish_dimension_25d.webp",
  "./assets/art/v59_fish_unknown_25d.webp",
  "./assets/art/v60_water_depth_overlay.webp",
  "./assets/art/v60_caustic_sparkle_overlay.webp",
  "./assets/art/v363_painterly_ocean.png",
  "./src/ui/navigator.js",
  "./src/systems/inventory.js",
  "./src/systems/fishing.js",
  "./src/core/state.js",
  "./src/runtime/v54-result-shop-polish.js",
  "./src/runtime/v55-mobile-feel-runtime.js",
  "./src/runtime/v551-hotfix-runtime.js",
  "./src/runtime/v552-ci-runtime-guard.js",
  "./src/runtime/v554-stack-guard.js",
  "./src/runtime/v555-auto-cache-sweep.js",
  "./src/runtime/v56-background-art-pass.js",
  "./src/runtime/v57-water-art-direction.js",
  "./src/runtime/v561-ui-state-cleanup.js",
  "./src/runtime/v58-ui-art-reboot.js",
  "./src/runtime/v59-ui-state-dex-rework.js",
  "./src/runtime/v60-interaction-balance.js",
  "./src/runtime/v49-action-mobile-patch.js",
  "./src/systems/shop.js",
  "./src/runtime/v53-casual-ux-polish.js",
  "./src/runtime/v52-casual-runtime.js"
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CORE_CACHE);
    await Promise.allSettled(CORE_ASSETS.map((asset) => cache.add(new Request(asset, { cache: 'reload' }))));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => !key.startsWith(CACHE_VERSION)).map((key) => caches.delete(key)));
    if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
    await self.clients.claim();
  })());
});


self.addEventListener('message', (event) => {
  const type = event?.data?.type;
  if (type === 'SKIP_WAITING') self.skipWaiting();
  if (type === 'AQUA_CLEAR_RUNTIME_CACHE' || type === 'AQUA_FORCE_CACHE_SWEEP') {
    event.waitUntil((async () => {
      const keepPrefix = event?.data?.keepPrefix || CACHE_VERSION;
      const keys = await caches.keys();
      await Promise.all(keys
        .filter((key) => (key.includes('runtime') || key.includes('aqua-fantasia') || key.includes('workbox') || key.includes('precache')) && !key.startsWith(keepPrefix))
        .map((key) => caches.delete(key)));
    })());
  }
});

async function networkFirst(request, preloadResponsePromise) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const preload = await preloadResponsePromise;
    if (preload) {
      cache.put(request, preload.clone()).catch(() => {});
      return preload;
    }
    const fresh = await fetch(request);
    if (fresh && (fresh.ok || fresh.type === 'opaque')) cache.put(request, fresh.clone()).catch(() => {});
    return fresh;
  } catch (error) {
    const cached = await caches.match(request);
    return cached || caches.match('./offline.html');
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && (response.ok || response.type === 'opaque')) {
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone()).catch(() => {});
  }
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await caches.match(request);
  const freshPromise = fetch(request).then((response) => {
    if (response && (response.ok || response.type === 'opaque')) cache.put(request, response.clone()).catch(() => {});
    return response;
  }).catch(() => cached || null);
  return cached || freshPromise.then((response) => response || caches.match('./offline.html'));
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.hostname.includes('googleapis.com') || url.hostname.includes('firebaseio.com') || url.hostname.includes('firestore.googleapis.com')) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, event.preloadResponse));
    return;
  }

  if (url.origin === location.origin && (url.pathname.endsWith('/data/fish.json') || url.pathname.endsWith('/manifest.webmanifest'))) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  if (url.origin === location.origin && /\.(?:png|jpg|jpeg|webp|svg|gif)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (url.origin === location.origin || url.hostname === 'cdn.tailwindcss.com' || url.hostname === 'www.gstatic.com') {
    event.respondWith(staleWhileRevalidate(request));
  }
});
