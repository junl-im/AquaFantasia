import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd();
const read = (file) => readFileSync(join(root, file), 'utf8');
const exists = (file) => { try { statSync(join(root, file)); return true; } catch { return false; } };
function fail(message) { console.error(`[check-v56] ${message}`); process.exit(1); }

const required = [
  'src/runtime/v56-background-art-pass.js',
  'tools/check-v56-background-art.mjs',
  'PATCH_NOTES_v5.6.0.md',
  'V5_6_0_BACKGROUND_ART_CHECKLIST.md',
  'reports/v5.6.0-background-art-audit.md',
  'assets/art/v56_fishing_bg_lake.webp',
  'assets/art/v56_fishing_bg_river.webp',
  'assets/art/v56_fishing_bg_harbor.webp',
  'assets/art/v56_fishing_bg_deep.webp',
  'assets/art/v56_fishing_bg_palace.webp',
  'assets/art/v56_fishing_bg_dimension.webp',
];
required.forEach((file) => { if (!exists(file)) fail(`missing ${file}`); });

const index = read('index.html');
const sw = read('sw.js');
const runtime = read('src/runtime/v56-background-art-pass.js');
const manifest = read('manifest.webmanifest');
const pkg = read('package.json');
const state = read('src/core/state.js');

if (!(index.includes('v56-background-art-pass.js?v=5.6.0') || index.includes('v56-background-art-pass.js?v=5.6.1') || index.includes('v56-background-art-pass.js?v=5.7.0') || index.includes('v56-background-art-pass.js?v=5.8.0') || index.includes('v56-background-art-pass.js?v=5.9.0')) || !index.includes('v5.6.0 Background Art Pass')) fail('index v5.6 runtime marker missing');
if (!(index.includes("const APP_VERSION = '5.6.0'") || index.includes("const APP_VERSION = '5.6.1'") || index.includes("const APP_VERSION = '5.7.0'") || index.includes("const APP_VERSION = '5.8.0'") || index.includes("const APP_VERSION = '5.9.0'"))) fail('index APP_VERSION must be 5.6.x');
if (!runtime.includes('AquaV56BackgroundArt') || !runtime.includes('v56_fishing_bg_lake.webp') || !runtime.includes('v56_fishing_bg_dimension.webp')) fail('runtime art API/assets missing');
if (!runtime.includes('selectRegion') || !runtime.includes('MutationObserver') || !runtime.includes('v47-renderer-layer .v47-renderer-overlay')) fail('runtime region hook / text overlay guard missing');
if (!(sw.includes('aqua-fantasia-v5.8.0-2-5d-art-20260612') || sw.includes('aqua-fantasia-v5.9.0-state-dex-20260612') || sw.includes('aqua-fantasia-v5.7.0-water-art-20260612') || sw.includes('aqua-fantasia-v5.6.1-ui-cleanup-20260612') || sw.includes('aqua-fantasia-v5.6.0-background-art-20260612')) || !sw.includes('./src/runtime/v56-background-art-pass.js')) fail('service worker v5.6 cache entry missing');
for (const asset of ['lake','river','harbor','deep','palace','dimension']) {
  if (!sw.includes(`./assets/art/v56_fishing_bg_${asset}.webp`)) fail(`service worker missing ${asset} background`);
  const size = statSync(join(root, `assets/art/v56_fishing_bg_${asset}.webp`)).size;
  if (size < 8000 || size > 140000) fail(`unexpected ${asset} webp size: ${size}`);
}
if (!manifest.includes('v5.6.0 Background Art Pass') && !manifest.includes('v5.6.1 UI State Cleanup')) fail('manifest v5.6 markers missing');
if (!pkg.includes('runtime56:check') || !pkg.includes('check-v56-background-art.mjs')) fail('package v5.6 script missing');
if (!(state.includes("background: 'assets/art/v56_fishing_bg_lake.webp'") || state.includes("background: 'assets/art/v57_fishing_bg_lake_master.webp'")) || !(state.includes("APP_VERSION = '5.6.0'") || state.includes("APP_VERSION = '5.6.1'") || state.includes("APP_VERSION = '5.7.0'") || state.includes("APP_VERSION = '5.8.0'") || state.includes("APP_VERSION = '5.9.0'"))) fail('core state background/version not updated');

console.log('[check-v56] background art pass OK');
