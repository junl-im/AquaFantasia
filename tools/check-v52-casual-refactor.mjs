import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd();
const read = (file) => readFileSync(join(root, file), 'utf8');
const exists = (file) => { try { statSync(join(root, file)); return true; } catch { return false; } };
function fail(message) { console.error(`[check-v52] ${message}`); process.exit(1); }
const required = [
  'src/engine/fishingPixiRuntime.ts',
  'src/systems/fishing.js',
  'src/systems/inventory.js',
  'src/ui/navigator.js',
  'src/core/state.js',
  'src/runtime/v52-casual-runtime.js',
  'assets/art/v363_painterly_ocean.png',
  'assets/ui-kit/icons/water_ripple.png',
  'assets/ui-kit/fishing_minigame/bobber_large.png',
  'assets/ui-kit/fishing_minigame/reel_bar_220px.png',
  'assets/ui-kit/icons/tension_gauge.png',
  'assets/ui-kit/panels/panel_1.png',
  'assets/ui-kit/icons/fish_1.png',
  'assets/ui-kit/icons/fish_2.png',
  'assets/ui-kit/icons/fish_3.png',
  'assets/ui-kit/icons/fish_4.png',
  'assets/ui-kit/icons/fish_5.png',
  'assets/ui-kit/icons/fish_6.png',
];
for (const file of required) if (!exists(file)) fail(`missing ${file}`);
const state = read('src/core/state.js');
const fishing = read('src/systems/fishing.js');
const inventory = read('src/systems/inventory.js');
const navigator = read('src/ui/navigator.js');
const pixi = read('src/engine/fishingPixiRuntime.ts');
const runtime = read('src/runtime/v52-casual-runtime.js');
const index = read('index.html');
const sw = read('sw.js');
if (!state.includes("READY") || !state.includes("CASTING") || !state.includes("WAITING") || !state.includes("BITE") || !state.includes("REELING") || !state.includes("CATCH") || !state.includes("FAIL")) fail('phase enum incomplete');
if (!pixi.includes("from 'pixi.js'") || !pixi.includes('Sprite') || !pixi.includes('Container') || !pixi.includes('spawnRipple') || !pixi.includes('shakePower')) fail('Pixi runtime does not contain required sprite/container/ripple/shake logic');
if (pixi.includes('new Graphics') || pixi.includes('Graphics()')) fail('Pixi runtime still instantiates Graphics');
if (!fishing.includes('SAFE_MIN = 30') || !fishing.includes('SAFE_MAX = 70') || !fishing.includes('CATCH_SECONDS = 3') || !fishing.includes('isDown')) fail('fishing system tension loop requirements missing');
if (!inventory.includes('panel_1.png') || !inventory.includes('grid-template-columns:repeat(4,1fr)') || !inventory.includes('aquaInventoryPop')) fail('inventory elastic grid requirements missing');
if (!navigator.includes('createNavigator') || !navigator.includes('던지기') || !navigator.includes('챔질') || !navigator.includes('가방')) fail('navigator action flow missing');
if (!runtime.includes('createFishingSystem') || !runtime.includes('createInventorySystem') || !runtime.includes('createNavigator')) fail('v52 runtime connector missing systems');
if (!index.includes('v53-casual-ux-polish.js') && !index.includes('v52-casual-runtime.js')) fail('index casual runtime marker missing');
if (!sw.includes('aqua-fantasia-v5.3.0') && !sw.includes('aqua-fantasia-v5.2.0')) fail('service worker casual cache marker missing');
console.log('[check-v52] casual refactor OK');
