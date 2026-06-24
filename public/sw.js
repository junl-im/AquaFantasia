// v2.1.48 keeps CI validate stability and polishes menu icon clipping, single-frame village controls, menu cards, fishing cockpit centering, and cautious tile hit scoring.
const CACHE_NAME = 'aqua-fantasia-v2.1.48-ui-overlap-layout-sweep';
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
