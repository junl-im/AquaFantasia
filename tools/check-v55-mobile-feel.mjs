import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd();
const read = (file) => readFileSync(join(root, file), 'utf8');
const exists = (file) => { try { statSync(join(root, file)); return true; } catch { return false; } };
function fail(message) { console.error(`[check-v55] ${message}`); process.exit(1); }

const required = [
  'src/runtime/v55-mobile-feel-runtime.js',
  'src/types/vendor-shims.d.ts',
  'assets/art/v55_mobile_feel_panel.svg',
  'tools/check-v55-mobile-feel.mjs',
  'PATCH_NOTES_v5.5.md',
  'V5_5_MOBILE_FEEL_CHECKLIST.md',
  '.github/workflows/aqua-static-validate.yml',
];
required.forEach((file) => { if (!exists(file)) fail(`missing ${file}`); });

const runtime = read('src/runtime/v55-mobile-feel-runtime.js');
const index = read('index.html');
const sw = read('sw.js');
const state = read('src/core/state.js');
const manifest = read('manifest.webmanifest');
const pkg = read('package.json');
const workflow = read('.github/workflows/aqua-static-validate.yml');

if (!state.includes("APP_VERSION = '5.5.0'") || !state.includes('aqua_v5.5')) fail('state v5.5 version/save markers missing');
if (!index.includes('v55-mobile-feel-runtime.js') || !index.includes('v5.5 Mobile Feel') || !index.includes("const APP_VERSION = '5.5.0'")) fail('index v5.5 markers missing');
if (!runtime.includes('AquaFantasiaV55') || !runtime.includes('hookBite') || !runtime.includes('tensionGuard') || !runtime.includes('MOBILE FEEL 5.5')) fail('runtime v5.5 control markers missing');
if (!runtime.includes('aqua-v55-lite') || !runtime.includes('aqua-v55-compact') || !runtime.includes('CACHE_KEEP_PREFIX')) fail('runtime v5.5 performance/cache markers missing');
if (!sw.includes('aqua-fantasia-v5.5.0-mobile-feel-20260612') || !sw.includes('./src/runtime/v55-mobile-feel-runtime.js') || !sw.includes('keepPrefix')) fail('service worker v5.5 cache guard markers missing');
if (!manifest.includes('v5.5 Mobile Feel') || !manifest.includes('5.5-mobile-feel-20260612')) fail('manifest v5.5 markers missing');
if (!pkg.includes('runtime55:check') || !pkg.includes('check-v55-mobile-feel.mjs')) fail('package runtime55 script missing');
if (!workflow.includes('npm run typecheck') || !workflow.includes('npm run runtime:check')) fail('GitHub Actions validation workflow incomplete');
console.log('[check-v55] Mobile feel/cache guard OK');
