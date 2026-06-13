import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd();
const read = (file) => readFileSync(join(root, file), 'utf8');
const exists = (file) => { try { statSync(join(root, file)); return true; } catch { return false; } };
function fail(message) { console.error(`[check-v59] ${message}`); process.exit(1); }

const required = [
  'src/runtime/v59-ui-state-dex-rework.js',
  'tools/check-v59-ui-state-dex.mjs',
  'PATCH_NOTES_v5.9.0.md',
  'V5_9_0_UI_STATE_DEX_REWORK_CHECKLIST.md',
  'reports/v5.9.0-ui-state-dex-rework-audit.md',
  'assets/art/v59_dex_card_25d.svg',
  'assets/art/v59_dex_locked_25d.svg',
  'assets/art/v59_fish_lake_25d.webp',
  'assets/art/v59_fish_river_25d.webp',
  'assets/art/v59_fish_harbor_25d.webp',
  'assets/art/v59_fish_deep_25d.webp',
  'assets/art/v59_fish_palace_25d.webp',
  'assets/art/v59_fish_dimension_25d.webp',
  'assets/art/v59_fish_unknown_25d.webp',
  '.github/workflows/pages.yml',
];
required.forEach((file) => { if (!exists(file)) fail(`missing ${file}`); });

const index = read('index.html');
const sw = read('sw.js');
const runtime = read('src/runtime/v59-ui-state-dex-rework.js');
const manifest = read('manifest.webmanifest');
const pkg = read('package.json');
const state = read('src/core/state.js');
const validate = read('tools/validate-static.mjs');
const workflow = read('.github/workflows/pages.yml');

if (!index.includes('v59-ui-state-dex-rework.js?v=5.9.0') || !index.includes('v5.9.0 UI State Router + 2.5D Fish Dex Rework')) fail('index v5.9 runtime marker missing');
if (!(index.includes("const APP_VERSION = '5.9.0'") || index.includes("const APP_VERSION = '6.0.0'")) || !(state.includes("APP_VERSION = '5.9.0'") || state.includes("APP_VERSION = '6.0.0'")) || !state.includes('aqua_v5.9.0')) fail('APP_VERSION/save marker must retain v5.9 compatibility or v6.0 upgrade');
if (!runtime.includes('AquaV59UIStateDexRework') || !runtime.includes('aqua-v59-router') || !runtime.includes('decorateDex') || !runtime.includes('decorateInventory')) fail('runtime API/router/dex markers missing');
if (!runtime.includes('.aqua-nav-v53') || !runtime.includes('.aqua-shop-fab-v54') || !runtime.includes('data-screen="fishing"')) fail('runtime HUD isolation markers missing');
if (!runtime.includes('v59_fish_lake_25d.webp') || !runtime.includes('v59_dex_card_25d.svg') || !runtime.includes('v59FishFloat')) fail('runtime 2.5D fish/dex art markers missing');
if (!runtime.includes('MutationObserver') || !runtime.includes('wrapGlobal') || !runtime.includes('prefers-reduced-motion') || !runtime.includes('navigator.connection')) fail('runtime stabilization/performance markers missing');
if (!(sw.includes('aqua-fantasia-v5.9.0-state-dex-20260612') || sw.includes('aqua-fantasia-v6.0.0-interaction-balance-20260612')) || !sw.includes('./src/runtime/v59-ui-state-dex-rework.js') || !sw.includes('./assets/art/v59_fish_lake_25d.webp') || !sw.includes('./assets/art/v59_dex_card_25d.svg')) fail('service worker v5.9 cache entries missing');
if (!(manifest.includes('v5.9.0 UI State Router') || manifest.includes('v6.0.0 Interaction Balance')) || !(manifest.includes('5.9.0-state-dex-20260612') || manifest.includes('6.0.0-interaction-balance-20260612'))) fail('manifest v5.9/v6.0 markers missing');
if (!pkg.includes('runtime59:check') || !pkg.includes('check-v59-ui-state-dex.mjs')) fail('package v5.9 script missing');
if (!validate.includes('v59-ui-state-dex-rework.js') || !validate.includes('5.9.0-state-dex')) fail('validate-static v5.9 coverage missing');
if (!workflow.includes('on:') || !workflow.includes('push:') || !workflow.includes('workflow_dispatch:') || workflow.includes('aqua-static-validate')) fail('workflow must be single pages.yml push/manual flow');
console.log('[check-v59] UI state router + 2.5D fish dex rework OK');
