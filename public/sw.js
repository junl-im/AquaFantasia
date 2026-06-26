// v2.1.81 content engine upgrade: preserves video-only intro, keeps village camera centered without movement fighting, and strengthens fishing/menu/card performance guards.
const CACHE_NAME = 'aqua-fantasia-v2.1.81-content-engine-upgrade';
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
