import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd();
const read = (file) => readFileSync(join(root, file), 'utf8');
const exists = (file) => { try { statSync(join(root, file)); return true; } catch { return false; } };
function fail(message) { console.error(`[check-v57] ${message}`); process.exit(1); }

const required = [
  'src/runtime/v57-water-art-direction.js',
  'tools/check-v57-water-art.mjs',
  'PATCH_NOTES_v5.7.0.md',
  'V5_7_0_WATER_ART_DIRECTION_CHECKLIST.md',
  'reports/v5.7.0-water-art-direction-audit.md',
  'assets/art/v57_fishing_bg_lake_master.webp',
  'assets/art/v57_fishing_bg_river_master.webp',
  'assets/art/v57_fishing_bg_harbor_master.webp',
  'assets/art/v57_fishing_bg_deep_master.webp',
  'assets/art/v57_fishing_bg_palace_master.webp',
  'assets/art/v57_fishing_bg_dimension_master.webp',
  'assets/art/v57_water_ripple_overlay.webp',
  'assets/art/v57_water_caustics_overlay.webp',
];
required.forEach((file) => { if (!exists(file)) fail(`missing ${file}`); });

const index = read('index.html');
const sw = read('sw.js');
const runtime = read('src/runtime/v57-water-art-direction.js');
const manifest = read('manifest.webmanifest');
const pkg = read('package.json');
const state = read('src/core/state.js');

if (!index.includes('v57-water-art-direction.js?v=5.7.0') || !index.includes('v5.7.0 Water Art Direction Pass')) fail('index v5.7 runtime marker missing');
if (!index.includes("const APP_VERSION = '5.7.0'")) fail('index APP_VERSION must be 5.7.0');
if (!runtime.includes('AquaV57WaterArt') || !runtime.includes('aqua-v57-water-art') || !runtime.includes('v57_water_caustics_overlay.webp')) fail('runtime API/style/overlay markers missing');
if (!runtime.includes('selectRegion') || !runtime.includes('MutationObserver') || !runtime.includes('requestIdleCallback')) fail('runtime region hooks, watcher, or idle preload missing');
if (!runtime.includes('@keyframes aquaV57WaterDrift') || !runtime.includes('@keyframes aquaV57Caustics') || !runtime.includes('prefers-reduced-motion')) fail('water animation/performance guards missing');
if (!sw.includes('aqua-fantasia-v5.7.0-water-art-20260612') || !sw.includes('./src/runtime/v57-water-art-direction.js')) fail('service worker v5.7 cache entry missing');
for (const asset of ['lake','river','harbor','deep','palace','dimension']) {
  const file = `assets/art/v57_fishing_bg_${asset}_master.webp`;
  if (!sw.includes(`./${file}`)) fail(`service worker missing ${asset} master background`);
  const size = statSync(join(root, file)).size;
  if (size < 25000 || size > 320000) fail(`unexpected ${asset} master webp size: ${size}`);
}
for (const file of ['assets/art/v57_water_ripple_overlay.webp', 'assets/art/v57_water_caustics_overlay.webp']) {
  if (!sw.includes(`./${file}`)) fail(`service worker missing ${file}`);
  const size = statSync(join(root, file)).size;
  if (size < 12000 || size > 180000) fail(`unexpected overlay size ${file}: ${size}`);
}
if (!manifest.includes('v5.7.0 Water Art Direction') || !manifest.includes('5.7.0-water-art-20260612')) fail('manifest v5.7 markers missing');
if (!pkg.includes('runtime57:check') || !pkg.includes('check-v57-water-art.mjs')) fail('package v5.7 script missing');
if (!state.includes("APP_VERSION = '5.7.0'") || !state.includes("background: 'assets/art/v57_fishing_bg_lake_master.webp'") || !state.includes('aqua_v5.7.0')) fail('core state v5.7 version/background markers missing');
console.log('[check-v57] water art direction OK');
