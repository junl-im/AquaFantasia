import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd();
const read = (file) => readFileSync(join(root, file), 'utf8');
const exists = (file) => { try { statSync(join(root, file)); return true; } catch { return false; } };
function fail(message) { console.error(`[check-v555] ${message}`); process.exit(1); }

const required = [
  'src/runtime/v555-auto-cache-sweep.js',
  'tools/check-v555-auto-cache.mjs',
  'PATCH_NOTES_v5.5.5.md',
  'V5_5_5_AUTO_CACHE_SWEEP_CHECKLIST.md',
  'reports/v5.5.5-auto-cache-sweep-audit.md',
];
required.forEach((file) => { if (!exists(file)) fail(`missing ${file}`); });

const index = read('index.html');
const sw = read('sw.js');
const runtime = read('src/runtime/v555-auto-cache-sweep.js');
const pkg = read('package.json');
const manifest = read('manifest.webmanifest');

if (!index.includes('v555-auto-cache-sweep.js?v=5.5.5') || !index.includes('v5.5.5 Auto Cache Sweep')) fail('index v5.5.5 auto cache runtime markers missing');
if (!index.includes('AquaV555AutoCache') || !index.includes('await window.AquaV555AutoCache')) fail('index boot wait for auto cache sweep missing');
if (!sw.includes('aqua-fantasia-v5.5.5-auto-cache-sweep-20260612') || !sw.includes('./src/runtime/v555-auto-cache-sweep.js')) fail('service worker v5.5.5 cache version/entry missing');
if (!sw.includes('AQUA_FORCE_CACHE_SWEEP') || !sw.includes('networkFirst(request')) fail('service worker auto sweep/network-first markers missing');
if (!runtime.includes('aqua-v555-silent-cache') || !runtime.includes('setInterval(hideLegacyCards')) fail('silent non-sticky cache popup guard missing');
if (!runtime.includes('AquaV555AutoCache') || !runtime.includes('clearAllAquaCaches') || !runtime.includes('Maximum call stack') || !runtime.includes('CACHE_KEEP_PREFIX') || !runtime.includes('hideLegacyCards') || !runtime.includes('handleLegacyRecovery')) fail('auto cache runtime guard markers missing');
if (!pkg.includes('runtime555:check') || !pkg.includes('check-v555-auto-cache.mjs')) fail('package v5.5.5 script missing');
if (!manifest.includes('v5.5.5 Auto Cache Sweep') || !manifest.includes('5.5.5-auto-cache-sweep-20260612')) fail('manifest v5.5.5 markers missing');
console.log('[check-v555] auto cache sweep/runtime polish OK');
