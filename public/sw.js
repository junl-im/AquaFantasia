// v2.1.90 premium design/content/engine sweep: refined ocean-glass UI, safer fishing equipment/bite/result placement, village paint stability, and mobile performance guards.
const CACHE_NAME = 'aqua-fantasia-v2.1.90-premium-design-content-engine';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/v2120/opening/aqua_opening_v2120.mp4'
];
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).catch(() => caches.match('./'))));
});
