// v2.1.134 render budget ui write ledger: keep legacy observer mutes, move latest UI ownership to one light sync, and avoid style observer loops.
const CACHE_NAME = 'aqua-fantasia-v2.1.134-render-budget-ui-write-ledger';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './offline.html'
];
const isAquaCache = (key) => key.startsWith('aqua-fantasia-');
const sweepOldCaches = () => caches.keys().then((keys) => Promise.all(keys.filter((key) => isAquaCache(key) && key !== CACHE_NAME).map((key) => caches.delete(key))));
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(sweepOldCaches());
  self.clients.claim();
});
self.addEventListener('message', (event) => {
  if (event.data?.type === 'AQUA_FORCE_CACHE_SWEEP') {
    event.waitUntil(sweepOldCaches());
  }
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).then((response) => {
    if (response && response.ok) {
      const clone = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => undefined);
    }
    return response;
  }).catch(() => caches.match(event.request).then((cached) => cached || caches.match('./offline.html'))));
});
