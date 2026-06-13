const AQUA_VERSION = 'aqua-fantasia-v6.1.0-clean-replace';
const PRECACHE = [
  './', './index.html', './offline.html', './manifest.webmanifest',
  './assets/art/login_ocean_fishing_25d.svg', './assets/art/water_ripple_overlay.svg',
  './assets/art/fish_lake_25d.svg', './assets/art/fish_river_25d.svg', './assets/art/fish_harbor_25d.svg',
  './assets/art/fish_deep_25d.svg', './assets/art/fish_palace_25d.svg', './assets/art/fish_dimension_25d.svg', './assets/art/fish_unknown_25d.svg',
  './assets/icons/icon-192.png', './assets/icons/icon-512.png'
];
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(AQUA_VERSION).then(cache => cache.addAll(PRECACHE)).catch(() => undefined));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(key => key === AQUA_VERSION ? undefined : caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => {
  if (!event.data || event.data.type !== 'AQUA_CLEAN_CACHE_SWEEP') return;
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(key => key === AQUA_VERSION ? undefined : caches.delete(key)));
  })());
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const req = event.request;
  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
      const fresh = await fetch(req);
      const url = new URL(req.url);
      if (fresh.ok && url.origin === location.origin) {
        const cache = await caches.open(AQUA_VERSION);
        cache.put(req, fresh.clone()).catch(() => undefined);
      }
      return fresh;
    } catch (error) {
      return caches.match('./offline.html') || new Response('Offline', { status: 503 });
    }
  })());
});
