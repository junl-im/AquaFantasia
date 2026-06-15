const CACHE_NAME = 'aqua-fantasia-v8.7.0-immersive-exit-hd-ui';
const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./offline.html",
  "./assets/v85/screens/start_screen_clean_v810.webp",
  "./assets/v85/compositions/dex.webp",
  "./assets/v85/compositions/fishing.webp",
  "./assets/v85/compositions/gear.webp",
  "./assets/v85/compositions/inventory.webp",
  "./assets/v85/compositions/mission.webp",
  "./assets/v85/compositions/ranking.webp",
  "./assets/v85/compositions/shop.webp",
  "./assets/v85/compositions/town.webp",
  "./assets/v85/bg/deepsea_full.webp",
  "./assets/v85/bg/lake_full.webp",
  "./assets/v85/bg/ocean_full.webp",
  "./assets/v85/bg/pier_full.webp",
  "./assets/v85/bg/river_full.webp",
  "./assets/v85/bg/stream_full.webp",
  "./assets/v85/characters/chibi_fisher_01_hd.png",
  "./assets/v85/characters/chibi_fisher_ref_01.png",
  "./assets/v85/characters/chibi_fisher_ref_02.png",
  "./assets/v85/characters/chibi_fisher_ref_03.png",
  "./assets/v85/characters/chibi_fisher_ref_04.png",
  "./assets/v85/characters/chibi_fisher_ref_05.png",
  "./assets/v85/characters/chibi_fisher_ref_06.png",
  "./assets/v85/characters/chibi_fisher_ref_07.png",
  "./assets/v85/characters/chibi_fisher_ref_08.png",
  "./assets/v85/characters/chibi_fisher_ref_09.png",
  "./assets/v85/characters/chibi_fisher_ref_10.png",
  "./assets/v85/characters/chibi_fisher_ref_11.png",
  "./assets/v85/characters/chibi_fisher_ref_12.png",
  "./assets/v85/characters/chibi_fisher_ref_13.png",
  "./assets/v85/characters/chibi_fisher_ref_14.png",
  "./assets/v85/characters/chibi_fisher_ref_15.png",
  "./assets/v85/characters/chibi_fisher_ref_16.png",
  "./assets/v85/characters/chibi_fisher_ref_17.png",
  "./assets/v85/characters/chibi_fisher_ref_18.png",
  "./assets/v85/characters/chibi_fisher_ref_19.png",
  "./assets/v85/characters/chibi_fisher_ref_20.png",
  "./assets/v85/characters/chibi_fisher_ref_21.png",
  "./assets/v85/characters/chibi_fisher_ref_22.png",
  "./assets/v85/characters/chibi_fisher_ref_23.png",
  "./assets/v85/characters/chibi_fisher_ref_24.png",
  "./assets/v85/characters/chibi_fisher_ref_25.png",
  "./assets/v85/characters/chibi_fisher_ref_26.png",
  "./assets/v85/characters/chibi_fisher_ref_27.png",
  "./assets/v85/fish/fish_01.png",
  "./assets/v85/fish/fish_02.png",
  "./assets/v85/fish/fish_03.png",
  "./assets/v85/fish/fish_04.png",
  "./assets/v85/fish/fish_05.png",
  "./assets/v85/fish/fish_06.png",
  "./assets/v85/fish/fish_07.png",
  "./assets/v85/fish/fish_08.png",
  "./assets/v85/fish/fish_09.png",
  "./assets/v85/fish/fish_10.png",
  "./assets/v85/fish/fish_11.png",
  "./assets/v85/fish/fish_12.png",
  "./assets/v85/fish/fish_13.png",
  "./assets/v85/fish/fish_14.png",
  "./assets/v85/fish/fish_15.png",
  "./assets/v85/fish/fish_16.png",
  "./assets/v85/fish/fish_17.png",
  "./assets/v85/fish/fish_18.png",
  "./assets/v85/fish/fish_19.png",
  "./assets/v85/fish/fish_20.png",
  "./assets/v85/fish/fish_21.png",
  "./assets/v85/fish/fish_22.png",
  "./assets/v85/fish/fish_23.png",
  "./assets/v85/fish/fish_24.png",
  "./assets/v85/fish/fish_25.png",
  "./assets/v85/fish/fish_26.png",
  "./assets/v85/fish/fish_27.png",
  "./assets/v85/fish/fish_28.png",
  "./assets/v85/fish/fish_29.png",
  "./assets/v85/fish/fish_30.png",
  "./assets/v85/fish/fish_unknown.png",
  "./assets/v85/icons/bag.png",
  "./assets/v85/icons/bait_shrimp.png",
  "./assets/v85/icons/bobber.png",
  "./assets/v85/icons/coin.png",
  "./assets/v85/icons/fish_card_common.png",
  "./assets/v85/icons/fish_card_epic.png",
  "./assets/v85/icons/fish_card_rare.png",
  "./assets/v85/icons/fish_unknown.png",
  "./assets/v85/icons/gauge_arc.png",
  "./assets/v85/icons/gauge_fill.png",
  "./assets/v85/icons/gauge_level.png",
  "./assets/v85/icons/gauge_small.png",
  "./assets/v85/icons/gear.png",
  "./assets/v85/icons/gold_big.png",
  "./assets/v85/icons/line_hook.png",
  "./assets/v85/icons/nav_bar_full.png",
  "./assets/v85/icons/pearl_big.png",
  "./assets/v85/icons/reel.png",
  "./assets/v85/icons/rod.png",
  "./assets/v85/icons/shop.png",
  "./assets/v85/icons/sparkle.png",
  "./assets/v85/icons/star_big.png",
  "./assets/v85/icons/star_coin.png",
  "./assets/v85/icons/ticket.png",
  "./assets/v85/ui/button_orange_original.png",
  "./assets/v85/ui/button_orange_pressed_original.png",
  "./assets/v85/ui/frame_bottom_nav.png",
  "./assets/v85/ui/frame_dex_panel.png",
  "./assets/v85/ui/frame_equipment_large.png",
  "./assets/v85/ui/frame_inventory_panel.png",
  "./assets/v85/ui/frame_mission_panel.png",
  "./assets/v85/ui/frame_shop_panel.png",
  "./assets/v85/ui/panel_blank.png",
  "./assets/v85/ui/panel_bottom.png",
  "./assets/v85/ui/panel_progress.png",
  "./assets/v85/ui/panel_progress.webp",
  "./assets/v85/ui/panel_wallet.png",
  "./assets/v85/ui/panel_wallet.webp",
  "./assets/v85/ui/slot_square.png",
  "./assets/v85/ui/slot_tall.png",
  "./assets/v85/buttons/btn_blue_normal_wide_blank.png",
  "./assets/v85/buttons/btn_blue_pressed_wide_blank.png",
  "./assets/v85/buttons/btn_gold_normal_wide_blank.png",
  "./assets/v85/buttons/btn_gold_pressed_wide_blank.png",
  "./assets/v85/buttons/btn_mint_normal_wide_blank.png",
  "./assets/v85/buttons/btn_mint_pressed_wide_blank.png",
  "./assets/v85/buttons/btn_orange_normal_wide_blank.png",
  "./assets/v85/buttons/btn_orange_pressed_wide_blank.png",
  "./assets/v12/manifest.runtime.json",

  "./assets/v86/ui/bottom_nav_clean.png",
  "./assets/v86/ui/recent_panel_clean.png",
  "./assets/v86/ui/reel_panel_clean.png",
  "./assets/v86/ui/tab_blue.png",
  "./assets/v86/ui/tab_gold.png",
  "./assets/v86/ui/tab_cyan.png",
  "./assets/v87/characters/fisher_boat_crisp.png",
  "./assets/v87/ui/bottom_nav_hd.png",
  "./assets/v87/ui/recent_panel_hd.png",
  "./assets/v87/ui/reel_panel_hd.png",
  "./assets/v87/ui/tab_blue_hd.png",
  "./assets/v87/ui/tab_gold_hd.png",
  "./assets/v87/ui/tab_cyan_hd.png",
  "./assets/v87/icons/bag.png",
  "./assets/v87/icons/rod.png",
  "./assets/v87/icons/gear.png",
  "./assets/v87/icons/fish_card_common.png",
  "./assets/v87/icons/shop.png",
  "./assets/v87/icons/star_coin.png",
  "./assets/v87/icons/star_big.png",
  "./assets/v87/icons/coin.png",
  "./assets/v87/icons/bait_shrimp.png",
  "./assets/v87/icons/bobber.png",
  "./assets/v87/icons/sparkle.png",
  "./assets/v87/buttons/btn_orange_normal_wide_blank.png",
  "./assets/v87/buttons/btn_orange_pressed_wide_blank.png",
  "./assets/v87/buttons/btn_blue_normal_wide_blank.png",
  "./assets/v12/fx/particle_sparkle_cluster_ref_a.png",
  "./assets/art/water_ripple_overlay.webp",
  "./assets/art/caustic_sparkle_overlay.webp"
]


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
