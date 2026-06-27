// v2.1.95 premium design engine sweep: opening video shell hardening, slim fishing loadout, active-screen polish.
const CACHE_NAME = 'aqua-fantasia-v2.1.95-premium-design-engine-sweep';
const APP_SHELL = ['./', './index.html', './manifest.webmanifest', './offline.html'];
self.addEventListener('install', (event) => { event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (event) => { event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (event) => { if (event.request.method !== 'GET') return; event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => { const copy = response.clone(); caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => undefined); return response; }).catch(() => caches.match('./offline.html')))); });
