import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
let ok = true;
const fail = (msg) => { console.error('[check-v660]', msg); ok = false; };
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));

const data = read('src/data.ts');
const main = read('src/main.ts');
const css = read('src/styles.css');
const sw = read('public/sw.js');
const workflow = read('.github/workflows/pages.yml');
const pkg = JSON.parse(read('package.json'));

const expectedAssets = [
  'public/assets/art/login_ocean_fishing_25d.png', 'public/assets/art/login_ocean_fishing_25d.webp',
  'public/assets/art/bg_ocean.png', 'public/assets/art/bg_ocean.webp',
  'public/assets/art/player_boat.png', 'public/assets/art/fishing_float.png', 'public/assets/art/fish_clown.png', 'public/assets/art/gauge_frame.png', 'public/assets/art/fish_slot.png',
  'public/assets/ui/button_primary.png', 'public/assets/ui/button_soft.png', 'public/assets/ui/button_cast.png',
  'public/assets/ui/dex_panel_reference_25d.png',
  'public/assets/art/bg_mangrove.webp', 'public/assets/art/bg_lunar.webp', 'public/assets/art/bg_reef_festival.webp',
  'public/assets/dex/fish_mangrove_25d.png', 'public/assets/dex/fish_firefly_25d.png', 'public/assets/dex/fish_lunar_25d.png', 'public/assets/dex/fish_manta_25d.png', 'public/assets/dex/fish_turtle_guardian_25d.png', 'public/assets/dex/fish_orca_boss_25d.png', 'public/assets/dex/fish_reef_star_25d.png', 'public/assets/dex/fish_prism_25d.png',
  'public/assets/ui/fx_surge_25d.png', 'public/assets/ui/fx_guard_25d.png', 'public/assets/ui/fx_boss_warning_25d.png', 'public/assets/ui/badge_mastery_25d.png', 'public/assets/ui/badge_rescue_25d.png',
  'public/assets/atlas/aqua_fishing_atlas_v650.webp', 'public/assets/atlas/aqua_fishing_atlas_v650.json'
];
for (const asset of expectedAssets) if (!exists(asset)) fail(`missing asset ${asset}`);
for (const token of ['6.6.0', 'mangrove', 'lunar', 'reefFestival', 'tide', 'unlockHint', 'mastery', 'lastRescueAt']) if (!data.includes(token)) fail(`data token missing ${token}`);
for (const token of ['initFallbackFishingStage', 'castLineFallback', 'hasWebGL', 'surgeTimer', 'perfectChain', 'routeGuardActive', 'portrait-primary', 'orientationPolicy', 'CACHE_NAME']) if (!main.includes(token)) fail(`runtime token missing ${token}`);
for (const token of ['fallback-scene', 'surge-meter', 'guard-active', 'weather-pill', 'system-strip', 'button_primary.png']) if (!css.includes(token)) fail(`css token missing ${token}`);
for (const token of ['bg_mangrove.webp', 'aqua_fishing_atlas_v650.webp', 'aqua-fantasia-v6.6.0-reference-art-remaster']) if (!sw.includes(token)) fail(`service worker token missing ${token}`);
if (workflow.includes('cache: npm')) fail('workflow must not require npm lockfile cache');
if (!workflow.includes('actions/setup-node@v6')) fail('workflow should stay on Node 24 capable setup-node');
if (pkg.version !== '6.6.0') fail('package version must be 6.6.0');
const atlas = JSON.parse(read('public/assets/atlas/aqua_fishing_atlas_v650.json'));
if (Object.keys(atlas.frames ?? {}).length < 12) fail('v6.5/v6.6 atlas metadata too small');
if (!ok) process.exit(1);
console.log('[check-v660] reference-art remaster + portrait runtime OK');
console.log(JSON.stringify({ ok: true, mode: process.argv.includes('--audit') ? 'audit' : process.argv.includes('--runtime') ? 'runtime' : 'validate', assets: expectedAssets.length, atlasFrames: Object.keys(atlas.frames).length }, null, 2));
