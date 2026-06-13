const CACHE_NAME = 'aqua-fantasia-v6.3.0-immersive-asset-runtime';
const PRECACHE = [
  './', './index.html', './manifest.webmanifest', './offline.html',
  './assets/art/login_ocean_fishing_25d.webp', './assets/art/bg_ocean.webp', './assets/art/bg_lake.webp', './assets/art/bg_river.webp', './assets/art/bg_harbor.webp', './assets/art/bg_deep.webp', './assets/art/bg_palace.webp', './assets/art/bg_dimension.webp',
  './assets/art/player_boat.png', './assets/art/fishing_float.png', './assets/art/fish_clown.png', './assets/art/gauge_frame.png', './assets/art/fish_slot.png',
  './assets/ui/nav_village_25d.png', './assets/ui/nav_fishing_25d.png', './assets/ui/nav_gear_25d.png', './assets/ui/nav_dex_25d.png', './assets/ui/nav_shop_25d.png', './assets/ui/nav_mission_25d.png',
  './assets/ui/gear_rod_25d.png', './assets/ui/gear_reel_25d.png', './assets/ui/gear_lure_25d.png',
  './assets/atlas/aqua_fishing_atlas.webp', './assets/atlas/aqua_fishing_atlas.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE.map((url) => new Request(url, { cache: 'reload' }))).catch(() => undefined)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith('aqua-fantasia-') && key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'AQUA_FORCE_CACHE_SWEEP') {
    event.waitUntil((async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key.startsWith('aqua-fantasia-') && key !== CACHE_NAME).map((key) => caches.delete(key)));
    })());
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const req = event.request;
  event.respondWith((async () => {
    try {
      const cached = await caches.match(req);
      const fresh = fetch(req).then((res) => {
        if (res && res.ok && req.url.startsWith(self.location.origin)) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return res;
      });
      return cached || await fresh;
    } catch {
      return await caches.match('./offline.html') || Response.error();
    }
  })());
});
