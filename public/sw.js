// v2.1.47 keeps CI validate package-boundary stability and polishes page/layout overlap, fishing stage centering, menu icon containment, shop text, expedition cards, and tile hit caution.
const CACHE_NAME = 'aqua-fantasia-v2.1.47-ui-overlap-layout-fishing-polish';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './offline.html'
];
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then((cached) => cached || caches.match('./offline.html'))));
});
