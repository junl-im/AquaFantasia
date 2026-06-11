const CACHE_VERSION = 'aqua-fantasia-v3.6.1';
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
  "./assets/art/aqua_ocean_scene.svg",
  "./assets/art/card_lux_frame.svg",
  "./assets/art/fishing_stage.svg",
  "./assets/art/aqua_logo_mark.svg",
  "./assets/art/v30_ocean_masterpiece.svg",
  "./assets/art/v30_water_caustics.svg",
  "./assets/art/v30_hud_panel.svg",
  "./assets/art/v30_director_card.svg",
  "./assets/art/v30_card_texture.svg",
  "./assets/art/v30_fishing_stage.svg",
  "./assets/art/v30_fish_silhouette_sheet.svg",
  "./assets/art/v30_boss_crest.svg",
  "./assets/art/v30_route_atlas.svg",
  "./assets/art/v31_director_stage.svg",
  "./assets/art/v31_mobile_shell.svg",
  "./assets/art/v31_action_deck.svg",
  "./assets/art/v31_hud_frame.svg",
  "./assets/art/v31_region_card.svg",
  "./assets/art/v31_fishing_theater.svg",
  "./assets/art/v31_stage_fx.svg",
  "./assets/art/v31_region_atlas.svg",
  "./assets/art/region_lake_v31.svg",
  "./assets/art/region_river_v31.svg",
  "./assets/art/region_harbor_v31.svg",
  "./assets/art/region_deep_v31.svg",
  "./assets/art/region_palace_v31.svg",
  "./assets/art/region_dimension_v31.svg",

  "./assets/art/v32_command_center.svg",
  "./assets/art/v32_mobile_hero.svg",
  "./assets/art/v32_fish_gallery.svg",
  "./assets/art/v32_region_showcase.svg",
  "./assets/art/v32_fishing_cinematic.svg",
  "./assets/art/v32_boss_emblem.svg",
  "./assets/art/v32_inventory_card.svg",
  "./assets/art/v32_button_glyphs.svg",
  "./assets/art/v32_route_panorama_lake.svg",
  "./assets/art/v32_route_panorama_river.svg",
  "./assets/art/v32_route_panorama_harbor.svg",
  "./assets/art/v32_route_panorama_deep.svg",
  "./assets/art/v32_route_panorama_palace.svg",
  "./assets/art/v32_route_panorama_dimension.svg",
  "./assets/art/v33_nexus_bridge.svg",
  "./assets/art/v33_mobile_stage.svg",
  "./assets/art/v33_fishing_theater.svg",
  "./assets/art/v33_inventory_shelf.svg",
  "./assets/art/v33_fish_constellation.svg",
  "./assets/art/v33_route_hologram.svg",
  "./assets/art/v33_boss_tide.svg",
  "./assets/art/v33_button_set.svg",
  "./assets/art/v33_region_lake.svg",
  "./assets/art/v33_region_river.svg",
  "./assets/art/v33_region_harbor.svg",
  "./assets/art/v33_region_deep.svg",
  "./assets/art/v33_region_palace.svg",
  "./assets/art/v33_region_dimension.svg",
  "./assets/art/v34_abyss_canvas.svg",
  "./assets/art/v34_mobile_poster.svg",
  "./assets/art/v34_fishing_stage.svg",
  "./assets/art/v34_fish_showcase.svg",
  "./assets/art/v34_region_panorama.svg",
  "./assets/art/v34_inventory_showcase.svg",
  "./assets/art/v34_boss_gate.svg",
  "./assets/art/v34_ui_frame.svg",
  "./assets/art/v34_button_glyphs.svg",
  "./assets/art/v34_route_compass.svg",
  "./assets/art/v34_region_lake.svg",
  "./assets/art/v34_region_river.svg",
  "./assets/art/v34_region_harbor.svg",
  "./assets/art/v34_region_deep.svg",
  "./assets/art/v34_region_palace.svg",
  "./assets/art/v34_region_dimension.svg",
  "./assets/art/v35_tide_master.svg",
  "./assets/art/v36_core_navigator.svg",
  "./assets/art/v36_mobile_canvas.svg",
  "./assets/art/v36_fishing_stage.svg",
  "./assets/art/v36_fish_atlas.svg",
  "./assets/art/v36_region_lake.svg",
  "./assets/art/v36_region_river.svg",
  "./assets/art/v36_region_harbor.svg",
  "./assets/art/v36_region_deep.svg",
  "./assets/art/v36_region_palace.svg",
  "./assets/art/v36_region_dimension.svg",
  "./assets/art/v36_inventory_deck.svg",
  "./assets/art/v36_boss_crest.svg",
  "./assets/art/v36_route_orbit.svg",
  "./assets/art/v36_hud_frame.svg",
  "./assets/art/v36_button_runes.svg",
  "./assets/art/v36_reward_vault.svg",
  "./assets/art/v36_pwa_shell.svg",
  "./assets/art/v36_performance_radar.svg",
  "./assets/art/v36_world_console.svg",
  "./assets/art/v36_module_map.svg",
  "./assets/art/v36_encyclopedia_wall.svg",
  "./assets/art/v36_touch_overlay.svg",
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
