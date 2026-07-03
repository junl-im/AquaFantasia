// v2.1.135 cache reflection deploy hotfix: force a new cache namespace, bypass stale HTML/JS/CSS, and sweep old AquaFantasia caches.
const CACHE_NAME = 'aqua-fantasia-v2.1.135-cache-reflection-deploy-hotfix';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './offline.html'
];
const isAquaCache = (key) => key.startsWith('aqua-fantasia-');
const sweepOldCaches = () => caches.keys().then((keys) => Promise.all(keys.filter((key) => isAquaCache(key) && key !== CACHE_NAME).map((key) => caches.delete(key))));
const shouldReloadFromNetwork = (request, url) => request.mode === 'navigate' || ['document', 'script', 'style', 'worker', 'manifest'].includes(request.destination) || /\.(?:html|js|mjs|css|json|webmanifest)$/i.test(url.pathname);
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(sweepOldCaches().then(() => self.clients.claim()));
});
self.addEventListener('message', (event) => {
  if (event.data?.type === 'AQUA_SKIP_WAITING') self.skipWaiting();
  if (event.data?.type === 'AQUA_FORCE_CACHE_SWEEP') event.waitUntil(sweepOldCaches());
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  const networkRequest = shouldReloadFromNetwork(event.request, url) ? new Request(event.request, { cache: 'reload' }) : event.request;
  event.respondWith(fetch(networkRequest).then((response) => {
    if (response && response.ok) {
      const clone = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => undefined);
    }
    return response;
  }).catch(() => caches.match(event.request).then((cached) => cached || caches.match('./offline.html'))));
});
