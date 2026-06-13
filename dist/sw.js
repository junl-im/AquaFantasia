const CACHE_NAME = 'aqua-fantasia-v7.2.0-total-ui-transparent-dex';
const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./offline.html",
  "./assets/screens/start_screen_clean_v720.webp",
  "./assets/screens/start_screen_clean_v720.png",
  "./assets/screens/start_screen_clean_v710.webp",
  "./assets/screens/start_screen_clean_v690.webp",
  "./assets/art/bg_ocean.webp",
  "./assets/art/bg_lake.webp",
  "./assets/art/bg_river.webp",
  "./assets/art/bg_harbor.webp",
  "./assets/art/bg_deep.webp",
  "./assets/art/bg_palace.webp",
  "./assets/art/bg_dimension.webp",
  "./assets/art/bg_glacier.webp",
  "./assets/art/bg_storm.webp",
  "./assets/art/bg_mangrove.webp",
  "./assets/art/bg_lunar.webp",
  "./assets/art/bg_reef_festival.webp",
  "./assets/art/player_boat.png",
  "./assets/art/fishing_float.png",
  "./assets/art/fish_clown.png",
  "./assets/art/gauge_frame.png",
  "./assets/art/fish_slot.png",
  "./assets/art/water_ripple_overlay.webp",
  "./assets/art/caustic_sparkle_overlay.webp",
  "./assets/ui/v720_button_gold_clean.png",
  "./assets/ui/v720_button_aqua_clean.png",
  "./assets/ui/v720_button_purple_clean.png",
  "./assets/ui/v720_button_green_clean.png",
  "./assets/ui/v720_toggle_on.png",
  "./assets/ui/v720_toggle_off.png",
  "./assets/ui/v720_panel_clean.png",
  "./assets/ui/v710_button_yellow.png",
  "./assets/ui/v710_button_blue.png",
  "./assets/ui/v710_button_purple.png",
  "./assets/ui/v710_button_green.png",
  "./assets/ui/v710_combo_ribbon.png",
  "./assets/ui/button_cast_clean.png",
  "./assets/ui/button_cast_yellow_clean.png",
  "./assets/ui/nav_village_25d.png",
  "./assets/ui/nav_fishing_25d.png",
  "./assets/ui/nav_gear_25d.png",
  "./assets/ui/nav_dex_25d.png",
  "./assets/ui/nav_shop_25d.png",
  "./assets/ui/nav_mission_25d.png",
  "./assets/ui/v700_panel_soft.png",
  "./assets/ui/v700_card_slot.png",
  "./assets/ui/v700_modal_shell.png",
  "./assets/ui/v700_header_ribbon.png",
  "./assets/ui/v700_nav_shell.png",
  "./assets/ui/v700_bite_banner.png",
  "./assets/ui/v700_reel_panel.png",
  "./assets/screens/start_screen_reference.webp",
  "./assets/screens/start_screen_reference.png",
  "./assets/atlas/aqua_fishing_atlas.webp",
  "./assets/atlas/aqua_fishing_atlas.json",
  "./assets/atlas/aqua_fishing_atlas_v650.webp",
  "./assets/atlas/aqua_fishing_atlas_v650.json",
  "./assets/dex/fish_abyss_25d.png",
  "./assets/dex/fish_aurora_25d.png",
  "./assets/dex/fish_bubble_25d.png",
  "./assets/dex/fish_clown_card_25d.png",
  "./assets/dex/fish_coral_25d.png",
  "./assets/dex/fish_crystal_25d.png",
  "./assets/dex/fish_deep_25d.png",
  "./assets/dex/fish_dimension_25d.png",
  "./assets/dex/fish_firefly_25d.png",
  "./assets/dex/fish_harbor_25d.png",
  "./assets/dex/fish_king_25d.png",
  "./assets/dex/fish_lake_25d.png",
  "./assets/dex/fish_lantern_25d.png",
  "./assets/dex/fish_leaf_25d.png",
  "./assets/dex/fish_lotus_25d.png",
  "./assets/dex/fish_lunar_25d.png",
  "./assets/dex/fish_mangrove_25d.png",
  "./assets/dex/fish_manta_25d.png",
  "./assets/dex/fish_moon_25d.png",
  "./assets/dex/fish_nova_25d.png",
  "./assets/dex/fish_orca_boss_25d.png",
  "./assets/dex/fish_palace_25d.png",
  "./assets/dex/fish_pearl_25d.png",
  "./assets/dex/fish_prism_25d.png",
  "./assets/dex/fish_reef_star_25d.png",
  "./assets/dex/fish_river_25d.png",
  "./assets/dex/fish_shadow_25d.png",
  "./assets/dex/fish_storm_25d.png",
  "./assets/dex/fish_sun_25d.png",
  "./assets/dex/fish_thunder_25d.png",
  "./assets/dex/fish_turtle_guardian_25d.png",
  "./assets/dex/fish_unknown_25d.png"
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
