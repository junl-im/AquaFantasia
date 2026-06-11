import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const root = process.cwd();
const requiredFiles = [
  'index.html',
  'manifest.webmanifest',
  'sw.js',
  'offline.html',
  'data/fish.json',
  '.nojekyll',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/maskable-512.png',
  'assets/icons/apple-touch-icon.png',
  'assets/art/aqua_ocean_scene.svg',
  'assets/art/card_lux_frame.svg',
  'assets/art/fishing_stage.svg',
  'assets/art/aqua_logo_mark.svg',
  'assets/art/v30_ocean_masterpiece.svg',
  'assets/art/v30_water_caustics.svg',
  'assets/art/v30_hud_panel.svg',
  'assets/art/v30_director_card.svg',
  'assets/art/v30_card_texture.svg',
  'assets/art/v30_fishing_stage.svg',
  'assets/art/v30_fish_silhouette_sheet.svg',
  'assets/art/v30_boss_crest.svg',
  'assets/art/v30_route_atlas.svg',
  'assets/art/v31_director_stage.svg',
  'assets/art/v31_mobile_shell.svg',
  'assets/art/v31_action_deck.svg',
  'assets/art/v31_hud_frame.svg',
  'assets/art/v31_region_card.svg',
  'assets/art/v31_fishing_theater.svg',
  'assets/art/v31_stage_fx.svg',
  'assets/art/v31_region_atlas.svg',
  'assets/art/region_lake_v31.svg',
  'assets/art/region_river_v31.svg',
  'assets/art/region_harbor_v31.svg',
  'assets/art/region_deep_v31.svg',
  'assets/art/region_palace_v31.svg',
  'assets/art/region_dimension_v31.svg',

  'assets/art/v32_command_center.svg',
  'assets/art/v32_mobile_hero.svg',
  'assets/art/v32_fish_gallery.svg',
  'assets/art/v32_region_showcase.svg',
  'assets/art/v32_fishing_cinematic.svg',
  'assets/art/v32_boss_emblem.svg',
  'assets/art/v32_inventory_card.svg',
  'assets/art/v32_button_glyphs.svg',
  'assets/art/v32_route_panorama_lake.svg',
  'assets/art/v32_route_panorama_river.svg',
  'assets/art/v32_route_panorama_harbor.svg',
  'assets/art/v32_route_panorama_deep.svg',
  'assets/art/v32_route_panorama_palace.svg',
  'assets/art/v32_route_panorama_dimension.svg',
  'assets/art/v33_nexus_bridge.svg',
  'assets/art/v33_mobile_stage.svg',
  'assets/art/v33_fishing_theater.svg',
  'assets/art/v33_inventory_shelf.svg',
  'assets/art/v33_fish_constellation.svg',
  'assets/art/v33_route_hologram.svg',
  'assets/art/v33_boss_tide.svg',
  'assets/art/v33_button_set.svg',
  'assets/art/v33_region_lake.svg',
  'assets/art/v33_region_river.svg',
  'assets/art/v33_region_harbor.svg',
  'assets/art/v33_region_deep.svg',
  'assets/art/v33_region_palace.svg',
  'assets/art/v33_region_dimension.svg',
  'assets/art/v34_abyss_canvas.svg',
  'assets/art/v34_mobile_poster.svg',
  'assets/art/v34_fishing_stage.svg',
  'assets/art/v34_fish_showcase.svg',
  'assets/art/v34_region_panorama.svg',
  'assets/art/v34_inventory_showcase.svg',
  'assets/art/v34_boss_gate.svg',
  'assets/art/v34_ui_frame.svg',
  'assets/art/v34_button_glyphs.svg',
  'assets/art/v34_route_compass.svg',
  'assets/art/v34_region_lake.svg',
  'assets/art/v34_region_river.svg',
  'assets/art/v34_region_harbor.svg',
  'assets/art/v34_region_deep.svg',
  'assets/art/v34_region_palace.svg',
  'assets/art/v34_region_dimension.svg',
  'assets/art/v35_tide_master.svg',
  'assets/art/v35_mobile_stage.svg',
  'assets/art/v35_fishing_stage.svg',
  'assets/art/v35_fish_cabinet.svg',
  'assets/art/v35_boss_gate.svg',
  'assets/art/v35_inventory_wall.svg',
  'assets/art/v35_ui_frame.svg',
  'assets/art/v35_tide_radar.svg',
  'assets/art/v35_button_glyphs.svg',
  'assets/art/v35_route_map.svg',
  'assets/art/v35_reward_chest.svg',
  'assets/art/v35_encyclopedia_plate.svg',
  'assets/art/v35_region_lake.svg',
  'assets/art/v35_region_river.svg',
  'assets/art/v35_region_harbor.svg',
  'assets/art/v35_region_deep.svg',
  'assets/art/v35_region_palace.svg',
  'assets/art/v35_region_dimension.svg',
  'assets/art/v36_core_navigator.svg',
  'assets/art/v36_mobile_canvas.svg',
  'assets/art/v36_fishing_stage.svg',
  'assets/art/v36_fish_atlas.svg',
  'assets/art/v36_region_lake.svg',
  'assets/art/v36_region_river.svg',
  'assets/art/v36_region_harbor.svg',
  'assets/art/v36_region_deep.svg',
  'assets/art/v36_region_palace.svg',
  'assets/art/v36_region_dimension.svg',
  'assets/art/v36_inventory_deck.svg',
  'assets/art/v36_boss_crest.svg',
  'assets/art/v36_route_orbit.svg',
  'assets/art/v36_hud_frame.svg',
  'assets/art/v36_button_runes.svg',
  'assets/art/v36_reward_vault.svg',
  'assets/art/v36_pwa_shell.svg',
  'assets/art/v36_performance_radar.svg',
  'assets/art/v36_world_console.svg',
  'assets/art/v36_module_map.svg',
  'assets/art/v36_encyclopedia_wall.svg',
  'assets/art/v36_touch_overlay.svg',
  'assets/art/v363_painterly_ocean.svg',
  'assets/art/v363_mobile_scene.svg',
  'assets/art/v363_command_canvas.svg',
  'assets/art/v363_fishing_canvas.svg',
  'assets/art/v363_lux_frame.svg',
  'assets/art/v363_material_card.svg',
  'assets/art/v363_button_plate.svg',
  'assets/art/v363_fish_showcase.svg',
  'assets/art/v363_region_lake.svg',
  'assets/art/v363_region_river.svg',
  'assets/art/v363_region_harbor.svg',
  'assets/art/v363_region_deep.svg',
  'assets/art/v363_region_palace.svg',
  'assets/art/v363_region_dimension.svg'
];

function fail(message) {
  console.error(`\n[validate-static] ${message}`);
  process.exit(1);
}

for (const file of requiredFiles) {
  try { readFileSync(join(root, file)); }
  catch { fail(`Missing required file: ${file}`); }
}

const index = readFileSync(join(root, 'index.html'), 'utf8');
const sw = readFileSync(join(root, 'sw.js'), 'utf8');
if (!index.includes('Aqua Fantasia')) fail('index.html does not look like the game entry file.');
if (!index.includes("const APP_VERSION = '3.6.3'")) fail('APP_VERSION must be 3.6.3 for this patch.');
if (!index.includes('serviceWorker.register')) fail('PWA service worker registration is missing.');
if (!index.includes('season-ranking-panel')) fail('Season ranking UI is missing.');
if (!index.includes('weekly-reward-vault')) fail('Weekly reward vault UI is missing.');
if (!index.includes('kakao-autopilot')) fail('v2.9 Kakao autopilot runtime is missing.');
if (!index.includes('enableMobileGameMode')) fail('Mobile game mode function is missing.');
if (!index.includes('sensory-panel')) fail('Sensory panel UI is missing.');
if (!index.includes('unlockSensoryEngine')) fail('Sensory engine function is missing.');
if (!index.includes('createImpactBurst')) fail('Impact feedback function is missing.');
if (!index.includes('captain-hub-panel')) fail('Captain coach hub UI is missing.');
if (!index.includes('runMegaQualityDirector')) fail('Mega quality director function is missing.');
if (!index.includes('toggleOneHandMode')) fail('One-hand mobile UX function is missing.');
if (!index.includes('focus-goal-title')) fail('v2.5 focus HUD is missing.');
if (!index.includes('toggleQuickMenu')) fail('v2.5 quick menu is missing.');
if (!index.includes('REGION_ROUTE')) fail('v2.7 route map data is missing.');
if (!index.includes('world-route-mini')) fail('v2.7 route mini UI is missing.');
if (!index.includes('screen-worldmap')) fail('v2.7 world map screen is missing.');
if (!index.includes('INVENTORY CORE 3.2')) fail('v3.2 inventory summary UI is missing.');
if (!index.includes('sellRecommendedFish')) fail('v2.8 recommended sale function is missing.');
if (!index.includes('settled: false')) fail('v2.8 post-catch settlement flag is missing.');
if (!index.includes('exit-confirm-modal')) fail('v2.9 mobile back exit modal is missing.');
if (!index.includes('initBackExitGuard')) fail('v2.9 back button guard is missing.');
if (!index.includes('art-status-strip')) fail('v2.9 art UI status strip is missing.');
if (!index.includes('v30-director-panel')) fail('v3.0 Ocean Director panel is missing.');
if (!index.includes('renderOceanDirectorPanel')) fail('v3.0 Ocean Director renderer is missing.');
if (!index.includes('runOceanDirectorAction')) fail('v3.0 Ocean Director action is missing.');
if (!index.includes('v30-smart-dock')) fail('v3.0 smart dock is missing.');
if (!index.includes('exposeAquaHandlers')) fail('v2.9 inline handler exposure is missing.');

if (!index.includes('v31-action-deck')) fail('v3.1 Director Cut action deck is missing.');
if (!index.includes('getInventoryPlan')) fail('v3.1 inventory plan runtime fix is missing.');
if (!index.includes('renderDirectorCutPanel')) fail('v3.1 Director Cut renderer is missing.');
if (!index.includes('runDirectorCutAction')) fail('v3.1 Director Cut action handler is missing.');
if (!index.includes('art-v31')) fail('v3.1 art runtime class is missing.');
if (!index.includes('v32-command-center')) fail('v3.2 Visual Atlas command center is missing.');
if (!index.includes('renderVisualAtlasPanel')) fail('v3.2 Visual Atlas renderer is missing.');
if (!index.includes('runVisualAtlasAction')) fail('v3.2 Visual Atlas action handler is missing.');
if (!index.includes('art-v32')) fail('v3.2 art runtime class is missing.');
if (!index.includes('v33-command-bridge')) fail('v3.3 Nexus Forge command bridge is missing.');
if (!index.includes('v34-command-canvas')) fail('v3.4 Abyss Canvas command canvas is missing.');
if (!index.includes('v35-tide-master')) fail('v3.5 Tide Master panel is missing.');
if (!index.includes('renderV35TideMaster')) fail('v3.5 Tide Master renderer is missing.');
if (!index.includes('runV35Action')) fail('v3.5 Tide Master action handler is missing.');
if (!index.includes('art-v35')) fail('v3.5 art runtime class is missing.');
if (!index.includes('v36-core-navigator')) fail('v3.6 Core Navigator panel is missing.');
if (!index.includes('renderV36CoreNavigator')) fail('v3.6 Core Navigator renderer is missing.');
if (!index.includes('runV36Action')) fail('v3.6 Core Navigator action handler is missing.');
if (!index.includes('art-v36')) fail('v3.6 art runtime class is missing.');
if (!index.includes('art-v363')) fail('v3.6.3 painterly art runtime class is missing.');
if (!index.includes('renderLegacyDirectorPanelsIfNeeded')) fail('v3.6.3 legacy render gate is missing.');
if (!index.includes('v363_painterly_ocean.svg')) fail('v3.6.3 painterly ocean asset reference is missing.');
if (!index.includes('src/core/state.js')) fail('v3.6 modular scaffold reference is missing.');
if (!index.includes('perf-lite')) fail('v3.6.2 performance-lite CSS/runtime is missing.');
if (!index.includes('warmAssetsSafely')) fail('v3.6.2 safe asset warmer is missing.');
if (!index.includes('aqua_latest_state')) fail('v3.6.2 optimized save key is missing.');
if (!sw.includes('./assets/art/v363_fishing_canvas.svg')) fail('v3.6.3 critical cache list is missing active painterly fishing stage.');
if (sw.includes('./assets/art/v31_director_stage.svg')) fail('legacy bulk SVG precache found in service worker.');
if (/\bFISH_DB\b/.test(index)) fail('legacy FISH_DB reference found. Use FISH_DATABASE.');
if (/\bgetCurrentWeekKey\b/.test(index)) fail('legacy getCurrentWeekKey reference found. Use getRewardWeekKey/weeklyRewards.claimed.');
if (!index.includes('renderV34CommandCanvas')) fail('v3.4 Abyss Canvas renderer is missing.');
if (!index.includes('runV34Action')) fail('v3.4 Abyss Canvas action handler is missing.');
if (!index.includes('art-v34')) fail('v3.4 art runtime class is missing.');
if (!index.includes('renderV33CommandBridge')) fail('v3.3 Nexus Forge renderer is missing.');
if (!index.includes('runV33Action')) fail('v3.3 Nexus Forge action handler is missing.');
if (!index.includes('versionAtLeast')) fail('v3.3 semantic version helper is missing.');
if ((index.match(/data-region=\"차원의 바다\"/g) || []).length > 1) fail('Duplicate Dimension Sea village card returned.');


const manifest = JSON.parse(readFileSync(join(root, 'manifest.webmanifest'), 'utf8'));
if (manifest.display !== 'fullscreen') fail('manifest.webmanifest must use display: fullscreen for mobile game mode.');
if (!Array.isArray(manifest.icons) || manifest.icons.length < 3) fail('manifest icons are incomplete.');

const fish = JSON.parse(readFileSync(join(root, 'data/fish.json'), 'utf8'));
if (!Array.isArray(fish.fish) || fish.fish.length < 150) fail('data/fish.json must include at least 150 fish entries.');
const fishIds = new Set();
for (const item of fish.fish) {
  if (!item.id || fishIds.has(item.id)) fail(`Invalid or duplicate fish id: ${item.id}`);
  fishIds.add(item.id);
  if (!item.region || !item.name || !item.rarity) fail(`Fish entry is incomplete: ${item.id}`);
}

if (!sw.includes('aqua-fantasia-v3.6.3')) fail('Service worker cache version was not updated.');

const scripts = [...index.matchAll(/<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/gi)]
  .map((m) => m[1].trim())
  .filter(Boolean);

scripts.forEach((script, idx) => {
  const temp = join(root, `.validate-script-${idx}.mjs`);
  writeFileSync(temp, script, 'utf8');
  const result = spawnSync(process.execPath, ['--check', temp], { encoding: 'utf8' });
  rmSync(temp, { force: true });
  if (result.status !== 0) {
    console.error(result.stdout);
    console.error(result.stderr);
    fail(`JavaScript syntax check failed for script #${idx + 1}.`);
  }
});

console.log('[validate-static] AquaFantasia static bundle OK.');
