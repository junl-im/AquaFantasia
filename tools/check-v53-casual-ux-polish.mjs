import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd();
const read = (file) => readFileSync(join(root, file), 'utf8');
const exists = (file) => { try { statSync(join(root, file)); return true; } catch { return false; } };
function fail(message) { console.error(`[check-v53] ${message}`); process.exit(1); }
const required = [
  'src/runtime/v53-casual-ux-polish.js',
  'src/core/state.js',
  'src/systems/fishing.js',
  'src/systems/inventory.js',
  'src/ui/navigator.js',
  'assets/art/v363_painterly_ocean.png',
  'assets/ui-kit/icons/water_ripple.png',
  'assets/ui-kit/fishing_minigame/bobber_large.png',
  'assets/ui-kit/fishing_minigame/reel_bar_220px.png',
  'assets/ui-kit/icons/tension_gauge.png',
  'assets/ui-kit/panels/panel_1.png',
  'assets/ui-kit/icons/fish_1.png',
  'assets/ui-kit/icons/fish_6.png',
];
for (const file of required) if (!exists(file)) fail(`missing ${file}`);
const state = read('src/core/state.js');
const fishing = read('src/systems/fishing.js');
const inventory = read('src/systems/inventory.js');
const navigator = read('src/ui/navigator.js');
const runtime = read('src/runtime/v53-casual-ux-polish.js');
const index = read('index.html');
const sw = read('sw.js');
if (!(state.includes("APP_VERSION = '5.3.0'") || state.includes("APP_VERSION = '5.4.0'") || state.includes("APP_VERSION = '5.5.0'")) || !state.includes('aqua_v5.3')) fail('state v5.3 save/version marker missing');
if (!state.includes('READY') || !state.includes('CASTING') || !state.includes('WAITING') || !state.includes('BITE') || !state.includes('REELING') || !state.includes('CATCH') || !state.includes('FAIL')) fail('phase enum incomplete');
if (!fishing.includes('SAFE_MIN = 30') || !fishing.includes('SAFE_MAX = 70') || !fishing.includes('CATCH_SECONDS = 3') || !fishing.includes('aqua-fishing-v53-ui') || !fishing.includes('GOOD ZONE')) fail('v5.3 fishing UX requirements missing');
if (!inventory.includes('aqua-inventory-v53-backdrop') || !inventory.includes('grid-template-columns:repeat(4,1fr)') || !inventory.includes('aquaInventoryPopV53')) fail('v5.3 inventory spring grid missing');
if (!navigator.includes('aqua-nav-v53') || !navigator.includes('던지기') || !navigator.includes('챔질') || !navigator.includes('가방')) fail('v5.3 navigator actions missing');
if (!runtime.includes('createFishingSystem') || !runtime.includes('createInventorySystem') || !runtime.includes('createNavigator') || !runtime.includes('aqua-v53-ready')) fail('v5.3 runtime connector missing systems');
if (!index.includes('v53-casual-ux-polish.js') || !(index.includes("const APP_VERSION = '5.3.0'") || index.includes("const APP_VERSION = '5.4.0'") || index.includes("const APP_VERSION = '5.5.0'"))) fail('index v5.3 runtime marker missing');
if (!sw.includes('aqua-fantasia-v5.3.0') || !sw.includes('./src/runtime/v53-casual-ux-polish.js')) fail('service worker v5.3 entries missing');
console.log('[check-v53] casual UX polish OK');
