// v2.1.83 quality/system upgrade: fishing adaptive info stack, gauge lifecycle cleanup, village shake guard, menu/card performance polish.
const CACHE_NAME = 'aqua-fantasia-v2.1.83-quality-system-upgrade';
const ASSETS = ['./', './index.html', './offline.html'];
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then((res) => res || caches.match('./offline.html'))));
});
