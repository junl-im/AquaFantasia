import fs from 'node:fs';
import path from 'node:path';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => {
  console.error(`[v2110] ${message}`);
  process.exit(1);
};

const exists = (file) => fs.existsSync(file);
const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '2.1.10') fail(`package version must be 2.1.10, got ${pkg.version}`);
if (!pkg.scripts?.validate?.includes('tools/check-v2110-asset-integration-pass.mjs')) fail('validate script is not wired to v2110 check');

const data = read('src/data.ts');
if (!data.includes("APP_VERSION = '2.1.10'")) fail('APP_VERSION is not synced');
if (!data.includes('aqua-fantasia-v2.1.10-asset-integration-pass')) fail('cache name is not v2.1.10 asset pass');
if (!data.includes('./assets/v2110/fish/common_tropical/fish_common_001.png')) fail('new common fish asset not wired in fishDex');
if (!data.includes('./assets/v2110/fish/rare_deepsea/fish_rare_016.png')) fail('new rare fish asset not wired in fishDex');

const v2110Root = 'public/assets/v2110';
if (!exists(v2110Root)) fail('public/assets/v2110 asset directory missing');
const pngFiles = [];
const walk = (dir) => {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p);
    else if (p.endsWith('.png')) pngFiles.push(p.replace(/\\/g, '/'));
  }
};
walk(v2110Root);
if (pngFiles.length !== 278) fail(`expected 278 imported PNG assets, got ${pngFiles.length}`);

const manifestPath = 'public/assets/v2110/asset_manifest.json';
if (!exists(manifestPath)) fail('asset manifest missing');
const manifest = JSON.parse(read(manifestPath));
if (manifest.version !== '2.1.10') fail('asset manifest version mismatch');
if (manifest.totalPng !== 278) fail(`manifest totalPng mismatch: ${manifest.totalPng}`);
for (const [folder, count] of Object.entries({
  'character/fisher_walk_frames': 28,
  'fish/common_tropical': 16,
  'fish/rare_deepsea': 16,
  'objects/fishing_props': 23,
  'tiles_32x32/sea_and_beach': 81,
  'ui/buttons_and_badges': 67,
  'ui/fish_dex_cards': 11,
  'ui/fishing_hud': 12,
  'ui/main_aqua_cards': 10,
  'ui/modals_tabs_toggles': 14,
})) {
  const actual = manifest.summary?.[folder]?.count;
  if (actual !== count) fail(`manifest folder count mismatch for ${folder}: ${actual}`);
}

for (const required of [
  'public/assets/v2110/fish/common_tropical/fish_common_001.png',
  'public/assets/v2110/fish/common_tropical/fish_common_016.png',
  'public/assets/v2110/fish/rare_deepsea/fish_rare_001.png',
  'public/assets/v2110/fish/rare_deepsea/fish_rare_016.png',
  'public/assets/v2110/objects/fishing_props/fishing_prop_002.png',
  'public/assets/v2110/objects/fishing_props/fishing_prop_006.png',
  'public/assets/v2110/tiles_32x32/sea_and_beach/sea_tile_001_32x32.png',
  'public/assets/v2110/ui/buttons_and_badges/ui_button_002.png',
  'public/assets/v2110/ui/main_aqua_cards/ui_main_006.png',
  'public/assets/v2110/ui/fish_dex_cards/ui_card_001.png',
]) {
  if (!exists(required)) fail(`required imported asset missing: ${required}`);
}

const main = read('src/main.ts');
for (const token of [
  "dataset.v2110AssetIntegrationPass = 'v2110-asset-integration-pass'",
  'v2110-asset-integration-pass-root',
  'v2110-fishing-new-assets-screen',
  'v2110FishingBoat',
  'v2110FishingBuoy',
  'v2110FishingRope',
  'v2110FishingNet',
  '--v2110-sea-tile',
]) {
  if (!main.includes(token)) fail(`missing main.ts token: ${token}`);
}
for (const token of [
  'v218-stable-ui-fishing-rollback-root',
  'v219-ui-touch-shop-fishing-audit-root',
  "onOpenShop: () => { void this.go('shop'); }",
  'v2055-fishing-reel-rebuild-screen',
  'v2057-fishing-aqua-touch-screen',
  'v2073-fishing-core-feel-screen',
  'v2084-fishing-bite-single-screen',
  'v2098-fishing-restored-screen',
]) {
  if (!main.includes(token)) fail(`stability token removed from main.ts: ${token}`);
}

const css = read('src/styles.css');
for (const token of [
  'v2.1.10: new individual PNG asset integration pass',
  'html.v2110-asset-integration-pass-root',
  '--v2110-button-aqua',
  'body[data-screen="fishing"] .v2110-fishing-props',
  '.v2110-fishing-boat',
  '.v2110-fishing-buoy',
  'max-width: min(22vw, 146px)',
  '.start-art-screen .hit-keep::before',
  'background-image: none !important;',
  'body[data-screen="dex"] .dex-card',
]) {
  if (!css.includes(token)) fail(`missing CSS token: ${token}`);
}

const sw = read('public/sw.js');
for (const token of [
  'aqua-fantasia-v2.1.10-asset-integration-pass',
  './assets/v2110/asset_manifest.json',
  './assets/v2110/fish/common_tropical/fish_common_001.png',
  './assets/v2110/ui/buttons_and_badges/ui_button_002.png',
  './assets/v2110/objects/fishing_props/fishing_prop_002.png',
  './assets/v2110/tiles_32x32/sea_and_beach/sea_tile_001_32x32.png',
]) {
  if (!sw.includes(token)) fail(`missing service worker token: ${token}`);
}

const world = read('src/villageWorld.ts');
for (const directionToken of [
  'ACTOR_DIRECTION_TEXTURE_FIX',
  'ACTOR_DIRECTION_TEXTURES',
  'actorDirectionFromVector',
  'actorTextureUrl',
  'actorDirectionQaPasses',
]) {
  if (!world.includes(directionToken)) fail(`character direction guard token removed: ${directionToken}`);
}

const readme = read('README.md');
if (!readme.startsWith('# AquaFantasia v2.1.10')) fail('README version not synced');
if (!readme.includes('새로 제공된 `aqua_fantasia_individual_assets_png.zip` 에셋 278개')) fail('README asset import note missing');

const offline = read('public/offline.html');
if (!offline.includes('v2.1.10')) fail('offline badge missing v2.1.10');

console.log('[v2110] asset integration pass checks passed.');
