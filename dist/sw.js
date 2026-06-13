const CACHE_NAME = 'aqua-fantasia-v7.5.0-ui-rescue-mission-expansion';
const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./offline.html",
  "./assets/screens/start_screen_clean_v750.webp",
  "./assets/screens/start_screen_clean_v750.png",
  "./assets/ui/v750_keep_on.png",
  "./assets/ui/v750_keep_off.png",
  "./assets/ui/v750_button_gold.png",
  "./assets/ui/v750_button_aqua.png",
  "./assets/ui/v750_button_purple.png",
  "./assets/ui/v750_button_green.png",
  "./assets/ui/v750_panel_clean.png",
  "./assets/ui/v750_modal_clean.png",
  "./assets/ui/v750_card_clean.png",
  "./assets/screens/start_screen_clean_v740.webp",
  "./assets/screens/start_screen_clean_v740.png",
  "./assets/ui/v740_keep_on.png",
  "./assets/ui/v740_keep_off.png",
  "./assets/ui/v740_button_gold.png",
  "./assets/ui/v740_button_aqua.png",
  "./assets/ui/v740_button_purple.png",
  "./assets/ui/v740_button_green.png",
  "./assets/ui/v740_button_small_blue.png",
  "./assets/ui/v740_panel_blue.png",
  "./assets/ui/v740_card_slot.png",
  "./assets/ui/v740_modal_shell.png",
  "./assets/ui/v740_nav_shell.png",
  "./assets/ui/v740_bite_banner.png",
  "./assets/ui/v740_reel_panel.png",
  "./assets/ui/v740_combo_badge.png",
  "./assets/art/bg_user_ocean.webp",
  "./assets/art/bg_user_lake.webp",
  "./assets/art/bg_user_harbor.webp",
  "./assets/art/bg_user_river.webp",
  "./assets/art/bg_user_stream.webp",
  "./assets/art/bg_user_deep.webp",
  "./assets/screens/start_screen_clean_v720.webp",
  "./assets/screens/start_screen_clean_v720.png",
  "./assets/screens/start_screen_clean_v730.webp",
  "./assets/screens/start_screen_clean_v730.png",
  "./assets/ui/v730_keep_on.png",
  "./assets/ui/v730_keep_off.png",
  "./assets/ui/v730_button_gold.png",
  "./assets/ui/v730_button_aqua.png",
  "./assets/ui/v730_button_purple.png",
  "./assets/ui/v730_button_green.png",
  "./assets/ui/v730_panel_pearl.png",
  "./assets/ui/v730_modal_shell.png",
  "./assets/ui/v730_bite_banner.png",
  "./assets/ui/v730_reel_panel.png",
  "./assets/ui/v730_nav_active.png",
  "./assets/ui/v730_badge_combo.png",
  "./assets/dex/fish_v730_candyfin_25d.png",
  "./assets/dex/fish_v730_bluesprite_25d.png",
  "./assets/dex/fish_v730_royal_25d.png",
  "./assets/dex/fish_v730_melon_25d.png",
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
  "./assets/dex/v740_fish_01.png",
  "./assets/dex/v740_fish_02.png",
  "./assets/dex/v740_fish_03.png",
  "./assets/dex/v740_fish_04.png",
  "./assets/dex/v740_fish_05.png",
  "./assets/dex/v740_fish_06.png",
  "./assets/dex/v740_fish_07.png",
  "./assets/dex/v740_fish_08.png",
  "./assets/dex/v740_fish_09.png",
  "./assets/dex/v740_fish_10.png",
  "./assets/dex/v740_fish_11.png",
  "./assets/dex/v740_fish_12.png",
  "./assets/dex/v740_fish_13.png",
  "./assets/dex/v740_fish_14.png",
  "./assets/dex/v740_fish_15.png",
  "./assets/dex/v740_fish_16.png",
  "./assets/dex/v740_fish_17.png",
  "./assets/dex/v740_fish_18.png",
  "./assets/dex/v740_fish_19.png",
  "./assets/dex/v740_fish_20.png",
  "./assets/dex/v740_fish_21.png",
  "./assets/dex/v740_fish_22.png",
  "./assets/dex/v740_fish_23.png",
  "./assets/dex/v740_fish_24.png",
  "./assets/dex/v740_fish_25.png",
  "./assets/dex/v740_fish_26.png",
  "./assets/dex/v740_fish_27.png",
  "./assets/dex/v740_fish_28.png",
  "./assets/dex/v740_fish_29.png",
  "./assets/dex/v740_fish_30.png",
  "./assets/dex/v740_fish_31.png",
  "./assets/dex/v740_fish_32.png",
  "./assets/dex/v740_fish_33.png",
  "./assets/dex/v740_fish_34.png",
  "./assets/dex/v740_fish_35.png",
  "./assets/dex/v740_fish_36.png",
  "./assets/dex/v740_fish_37.png",
  "./assets/dex/v740_fish_38.png",
  "./assets/dex/v740_fish_39.png",
  "./assets/dex/v740_fish_40.png",
  "./assets/dex/v740_fish_41.png",
  "./assets/dex/v740_fish_42.png",
  "./assets/dex/v740_fish_43.png",
  "./assets/dex/v740_fish_44.png",
  "./assets/reference/user_ui_frames_sheet_v740.png",
  "./assets/reference/user_icons_effects_sheet_v740.png",
  "./assets/reference/user_fish_sheet_v740.png",
  "./assets/reference/user_character_background_sheet_v740.png",
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
