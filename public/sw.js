// AquaFantasia V3 first-party assets. Replace old V2 caches on activation.
const CACHE_NAME = 'aqua-fantasia-v3-launch-20261030';
const CORE_ASSETS = ['./', './index.html', './manifest.webmanifest', './offline.html'];
const underScope = (url) => url.origin === self.location.origin && url.pathname.startsWith(new URL('./', self.registration.scope).pathname);
const isAquaCache = (key) => key.startsWith('aqua-fantasia-');
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => isAquaCache(key) && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('message', (event) => {
  if (event.data?.type === 'AQUA_SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (!underScope(url)) return;
  event.respondWith((async () => {
    try {
      // Always revalidate the app shell; build assets are hashed and safe to cache.
      const networkRequest = new Request(request, { cache: request.mode === 'navigate' ? 'reload' : 'default' });
      const response = await fetch(networkRequest);
      if (response.ok && response.type === 'basic') {
        const clone = response.clone();
        event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(request, clone)).catch(() => undefined));
      }
      return response;
    } catch {
      const cached = await caches.match(request);
      if (cached) return cached;
      if (request.mode === 'navigate') return (await caches.match('./offline.html')) || Response.error();
      return Response.error();
    }
  })());
});
