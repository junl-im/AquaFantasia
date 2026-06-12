import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd();
const read = (file) => readFileSync(join(root, file), 'utf8');
const exists = (file) => { try { statSync(join(root, file)); return true; } catch { return false; } };
function fail(message) { console.error(`[check-v561] ${message}`); process.exit(1); }

const required = [
  'src/runtime/v561-ui-state-cleanup.js',
  'tools/check-v561-ui-state-cleanup.mjs',
  'PATCH_NOTES_v5.6.1.md',
  'V5_6_1_UI_STATE_CLEANUP_CHECKLIST.md',
  'reports/v5.6.1-ui-state-cleanup-audit.md',
];
required.forEach((file) => { if (!exists(file)) fail(`missing ${file}`); });

const index = read('index.html');
const sw = read('sw.js');
const runtime = read('src/runtime/v561-ui-state-cleanup.js');
const manifest = read('manifest.webmanifest');
const pkg = read('package.json');
const state = read('src/core/state.js');

if (!(index.includes('v561-ui-state-cleanup.js?v=5.6.1') || index.includes('v561-ui-state-cleanup.js?v=5.7.0')) || !index.includes('v5.6.1 UI State Cleanup')) fail('index v5.6.1 runtime marker missing');
if (!(index.includes("const APP_VERSION = '5.6.1'") || index.includes("const APP_VERSION = '5.7.0'"))) fail('index APP_VERSION must be 5.6.1');
if (!runtime.includes('AquaV561UIStateCleanup') || !runtime.includes('aqua-v561-ui-clean') || !runtime.includes('quick-action-label')) fail('runtime API/style markers missing');
if (!runtime.includes('.aqua-nav-v53') || !runtime.includes('#aqua-v552-badge') || !runtime.includes('#v31-smart-dock-label')) fail('runtime must hide navigator, version badge, and quick action label');
if (!runtime.includes('MutationObserver') || !runtime.includes('renderSmartDock')) fail('runtime observer/smart dock guard missing');
if (!(sw.includes('aqua-fantasia-v5.6.1-ui-cleanup-20260612') || sw.includes('aqua-fantasia-v5.7.0-water-art-20260612')) || !sw.includes('./src/runtime/v561-ui-state-cleanup.js')) fail('service worker v5.6.1 cache entry missing');
if (!(manifest.includes('v5.6.1 UI State Cleanup') || manifest.includes('v5.7.0 Water Art Direction')) || !(manifest.includes('5.6.1-ui-cleanup-20260612') || manifest.includes('5.7.0-water-art-20260612'))) fail('manifest v5.6.1 markers missing');
if (!pkg.includes('runtime561:check') || !pkg.includes('check-v561-ui-state-cleanup.mjs')) fail('package v5.6.1 script missing');
if (!(state.includes("APP_VERSION = '5.6.1'") || state.includes("APP_VERSION = '5.7.0'")) || !state.includes('aqua_v5.6.1')) fail('core state v5.6.1 save/version markers missing');

console.log('[check-v561] UI state cleanup OK');
