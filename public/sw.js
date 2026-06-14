const CACHE_NAME = 'aqua-fantasia-v8.1.0-asset-fit-start-keep';
const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./offline.html",
  "./assets/v12/screens/start_screen_clean_v810.webp",
  "./assets/v12/manifest.runtime.json",
  "./assets/v12/bg/ocean_portrait.webp",
  "./assets/v12/bg/lake_portrait.webp",
  "./assets/v12/bg/river_portrait.webp",
  "./assets/v12/bg/stream_portrait.webp",
  "./assets/v12/bg/deepsea_portrait.webp",
  "./assets/v12/bg/pier_portrait.webp",
  "./assets/v12/characters/chibi_fisher_01.png",
  "./assets/v12/icons/bobber.png",
  "./assets/v12/icons/rod.png",
  "./assets/v12/icons/reel.png",
  "./assets/v12/icons/line_hook.png",
  "./assets/v12/icons/bait_shrimp.png",
  "./assets/v12/icons/gear.png",
  "./assets/v12/icons/shop.png",
  "./assets/v12/icons/bag.png",
  "./assets/v12/icons/star_coin.png",
  "./assets/v12/icons/coin.png",
  "./assets/v12/icons/fish_card_common.png",
  "./assets/v12/icons/ticket.png",
  "./assets/v12/icons/sparkle.png",
  "./assets/v12/ui/panel_blank.webp",
  "./assets/v12/ui/panel_bottom.webp",
  "./assets/v12/ui/panel_progress.webp",
  "./assets/v12/ui/slot_square.webp",
  "./assets/v12/ui/frame_bottom_nav.webp",
  "./assets/v12/buttons/btn_mint_normal_wide_blank.webp",
  "./assets/v12/buttons/btn_mint_pressed_wide_blank.webp",
  "./assets/v12/buttons/btn_gold_normal_wide_blank.webp",
  "./assets/v12/buttons/btn_gold_normal_mid_blank.webp",
  "./assets/v12/buttons/btn_gold_pressed_mid_blank.webp",
  "./assets/v12/buttons/btn_cyan_normal_mid_blank.webp",
  "./assets/v12/buttons/btn_orange_normal_wide_blank.webp",
  "./assets/v12/buttons/btn_orange_pressed_wide_blank.webp",
  "./assets/ui/button_cast_clean.png",
  "./assets/art/water_ripple_overlay.webp",
  "./assets/art/caustic_sparkle_overlay.webp",
  "./assets/v12/fish/fish_01.png",
  "./assets/v12/fish/fish_02.png",
  "./assets/v12/fish/fish_03.png",
  "./assets/v12/fish/fish_04.png",
  "./assets/v12/fish/fish_05.png",
  "./assets/v12/fish/fish_06.png",
  "./assets/v12/fish/fish_07.png",
  "./assets/v12/fish/fish_08.png",
  "./assets/v12/fish/fish_09.png",
  "./assets/v12/fish/fish_10.png",
  "./assets/v12/fish/fish_11.png",
  "./assets/v12/fish/fish_12.png",
  "./assets/v12/fish/fish_13.png",
  "./assets/v12/fish/fish_14.png",
  "./assets/v12/fish/fish_15.png",
  "./assets/v12/fish/fish_16.png",
  "./assets/v12/fish/fish_17.png",
  "./assets/v12/fish/fish_18.png",
  "./assets/v12/fish/fish_19.png",
  "./assets/v12/fish/fish_20.png",
  "./assets/v12/fish/fish_21.png",
  "./assets/v12/fish/fish_22.png",
  "./assets/v12/fish/fish_23.png",
  "./assets/v12/fish/fish_24.png",
  "./assets/v12/fish/fish_25.png",
  "./assets/v12/fish/fish_26.png",
  "./assets/v12/fish/fish_27.png",
  "./assets/v12/fish/fish_28.png",
  "./assets/v12/fish/fish_29.png",
  "./assets/v12/fish/fish_30.png",
  "./assets/v12/fish/fish_unknown.png"
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE.map((url) => new Request(url, { cache: 'reload' }))).catch(() => undefined)));
});
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith('aqua-fantasia-') && key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('message', (event) => {
  if (event.data?.type === 'AQUA_FORCE_CACHE_SWEEP') {
    event.waitUntil((async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key.startsWith('aqua-fantasia-') && key !== CACHE_NAME).map((key) => caches.delete(key)));
    })());
  }
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const req = event.request;
  event.respondWith((async () => {
    try {
      const isHtml = req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html');
      if (isHtml) {
        const res = await fetch(req, { cache: 'no-store' });
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', copy));
        return res;
      }
      const cached = await caches.match(req);
      if (cached) return cached;
      const fresh = await fetch(req);
      if (fresh && fresh.ok && req.url.startsWith(self.location.origin)) {
        const copy = fresh.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
      }
      return fresh;
    } catch {
      return await caches.match('./offline.html') || Response.error();
    }
  })());
});
