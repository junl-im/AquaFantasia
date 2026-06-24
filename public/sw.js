// v2.1.50 keeps CI validate stability and tightens UI overlap, icon containment, single-frame controls, menu cards, expedition/shop spacing, centered fishing cockpit, and cautious tile hit scoring.
const CACHE_NAME = 'aqua-fantasia-v2.1.50-ui-overlap-placement-beauty-polish';
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
