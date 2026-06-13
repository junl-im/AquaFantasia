import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd();
const read = (file) => readFileSync(join(root, file), 'utf8');
const exists = (file) => { try { statSync(join(root, file)); return true; } catch { return false; } };
function fail(message) { console.error(`[check-v60] ${message}`); process.exit(1); }

const required = [
  'src/runtime/v60-interaction-balance.js',
  'tools/check-v60-interaction-balance.mjs',
  'PATCH_NOTES_v6.0.0.md',
  'V6_0_0_INTERACTION_BALANCE_CHECKLIST.md',
  'reports/v6.0.0-interaction-balance-audit.md',
  'assets/art/v60_water_depth_overlay.webp',
  'assets/art/v60_caustic_sparkle_overlay.webp',
  '.github/workflows/pages.yml',
];
required.forEach((file) => { if (!exists(file)) fail(`missing ${file}`); });

const index = read('index.html');
const sw = read('sw.js');
const runtime = read('src/runtime/v60-interaction-balance.js');
const manifest = read('manifest.webmanifest');
const pkg = read('package.json');
const state = read('src/core/state.js');
const validate = read('tools/validate-static.mjs');
const workflow = read('.github/workflows/pages.yml');

if (!index.includes('v60-interaction-balance.js?v=6.0.0') || !index.includes('v6.0.0 Interaction Balance')) fail('index v6.0 runtime marker missing');
if (!index.includes("const APP_VERSION = '6.0.0'") || !state.includes("APP_VERSION = '6.0.0'") || !state.includes('aqua_v6.0.0') || !state.includes('aqua_v5.9.0')) fail('APP_VERSION/save marker must be v6.0.0 with v5.9 migration');
if (!runtime.includes('AquaV60InteractionBalance') || !runtime.includes('NOTICE_SELECTOR') || !runtime.includes('aqua-v60-dismissed')) fail('runtime interaction markers missing');
if (!runtime.includes('pointerdown') || !runtime.includes('pointermove') || !runtime.includes('routeTo') || !runtime.includes('미션으로 이동')) fail('runtime tap/swipe/routing markers missing');
if (!runtime.includes('patchAlert') || !runtime.includes('patchShowToast') || !runtime.includes('data-aqua-target')) fail('runtime alert/toast patch markers missing');
if (!runtime.includes('v60_water_depth_overlay.webp') || !runtime.includes('v60_caustic_sparkle_overlay.webp') || !runtime.includes('aqua-v60-water-grade')) fail('runtime water polish markers missing');
if (!runtime.includes('patchBalanceFunctions') || !index.includes('입질 타이밍을 살짝 짧게') || !index.includes('9.0 - rarity * 0.49')) fail('balance tuning markers missing');
if (!sw.includes('aqua-fantasia-v6.0.0-interaction-balance-20260612') || !sw.includes('./src/runtime/v60-interaction-balance.js') || !sw.includes('./assets/art/v60_water_depth_overlay.webp')) fail('service worker v6.0 cache entries missing');
if (!manifest.includes('v6.0.0 Interaction Balance') || !manifest.includes('6.0.0-interaction-balance-20260612')) fail('manifest v6.0 markers missing');
if (!pkg.includes('runtime60:check') || !pkg.includes('check-v60-interaction-balance.mjs')) fail('package v6.0 script missing');
if (!validate.includes('v60-interaction-balance.js') || !validate.includes('v6.0 interaction/balance')) fail('validate-static v6.0 coverage missing');
if (!workflow.includes('on:') || !workflow.includes('push:') || !workflow.includes('workflow_dispatch:') || workflow.includes('aqua-static-validate')) fail('workflow must remain single pages.yml push/manual flow');
console.log('[check-v60] Interaction balance + dismissible notification + water polish OK');
