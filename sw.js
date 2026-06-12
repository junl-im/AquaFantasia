const CACHE_VERSION = 'aqua-fantasia-v4.7.0';
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
  "./assets/art/v39_fishing_director.svg",
  "./assets/art/v41_action_button.svg",
  "./assets/art/v41_precision_ring.svg",
  "./assets/art/v41_hud_panel.svg",
  "./assets/art/v41_flow_fishing_stage.svg",
  "./assets/art/v42_result_scroll.svg",
  "./assets/art/v43_perf_fishing_shell.svg",
  "./assets/art/v43_fullscreen_shell.svg",
  "./assets/art/v43_perf_meter.svg",
  "./assets/art/v44_animation_fishing_stage.svg",
  "./assets/art/v44_line_arc.svg",
  "./assets/art/v44_hook_prompt.svg",
  "./assets/art/v44_action_overlay.svg",
  "./assets/art/v44_rhythm_lane.svg",
  "./assets/art/v45_bobber_master.svg",
  "./assets/art/v45_reel_console_premium.svg",
  "./assets/art/v45_tension_gauge_deluxe.svg",
  "./assets/art/v45_fishing_stage_lux.svg",
  "./assets/atlas/aqua_fishing_v46.webp",
  "./assets/atlas/aqua_fishing_v47.webp",
  "./assets/atlas/aqua_fishing_v46.atlas.json",
  "./assets/atlas/aqua_fishing_v47.atlas.json",
  "./assets/art/v46_engine_console.svg",
  "./assets/art/v46_pixi_stage.svg",
  "./assets/art/v46_atlas_glow.svg",
  "./assets/art/v46_audio_mixer.svg",
  "./assets/art/v46_perf_matrix.svg",
  "./assets/art/v46_webp_cards.svg",
  "./assets/art/v47_fishing_pixi_stage.svg",
  "./assets/art/v47_renderer_console.svg",
  "./assets/art/v47_renderer_glow.svg",
  "./assets/art/v47_water_ribbon.svg",
  "./assets/art/v47_bobber_glow.svg",
  "./assets/art/v47_line_arc.svg",
  "./assets/art/v39_reel_lane.svg",
  "./assets/ui-kit/fishing_minigame/bobber_large.png",
  "./assets/ui-kit/icons/reel_progress.png"
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CORE_CACHE);
    await Promise.allSettled(CORE_ASSETS.map((asset) => cache.add(asset)));
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
