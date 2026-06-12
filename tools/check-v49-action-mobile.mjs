import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd();
const read = (file) => readFileSync(join(root, file), 'utf8');
const exists = (file) => { try { statSync(join(root, file)); return true; } catch { return false; } };
function fail(message) { console.error(`[check-v49-action-mobile] ${message}`); process.exit(1); }

const required = [
  'src/runtime/v49-action-mobile-patch.js',
  'PATCH_NOTES_v4.9_ACTION.md',
  'V4_9_ACTION_RUNTIME_CHECKLIST.md',
  'docs/CLEAN_BUNDLE_v4.9_ACTION.md',
  'AquaFantasia_v4.9_standalone_phaser.html',
];
required.forEach((file) => { if (!exists(file)) fail(`missing ${file}`); });

const index = read('index.html');
const sw = read('sw.js');
const runtime = read('src/runtime/v49-action-mobile-patch.js');
const manifest = read('manifest.webmanifest');

if (!index.includes('v49-action-mobile-patch.js') || !index.includes('v4.9 Action Mobile Patch')) fail('index v4.9 action markers missing');
if (!runtime.includes('aqua-v49-action-mobile-ready') || !runtime.includes('꾹 눌러 릴 감기') || !runtime.includes('AquaV49ActionMobile')) fail('runtime action markers missing');
if (!runtime.includes('detectLowEnd') || !runtime.includes('AquaV49Runtime') || !runtime.includes('perf-lite')) fail('mobile performance guard markers missing');
if (!sw.includes('v49-action-mobile-patch.js') || !(sw.includes('aqua-fantasia-v5.4.0-v49-action-20260612') || sw.includes('aqua-fantasia-v5.5.0-mobile-feel-20260612')) || !sw.includes('AQUA_CLEAR_RUNTIME_CACHE')) fail('service worker v4.9 action cache markers missing');
if (!(manifest.includes('v4.9 Action Mobile Patch') || manifest.includes('v5.5 Mobile Feel')) || !(manifest.includes('4.9-action-20260612') || manifest.includes('5.5-mobile-feel-20260612'))) fail('manifest v4.9 action markers missing');
console.log('[check-v49-action-mobile] v4.9 action mobile patch OK');
