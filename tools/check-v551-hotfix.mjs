import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd();
const read = (file) => readFileSync(join(root, file), 'utf8');
const exists = (file) => { try { statSync(join(root, file)); return true; } catch { return false; } };
function fail(message) { console.error(`[check-v551] ${message}`); process.exit(1); }

const required = [
  'src/runtime/v551-hotfix-runtime.js',
  'tools/check-v551-hotfix.mjs',
  'PATCH_NOTES_v5.5.1.md',
  'V5_5_1_RUNTIME_ERROR_HOTFIX_CHECKLIST.md',
  'reports/v5.5.1-runtime-error-audit.md',
];
required.forEach((file) => { if (!exists(file)) fail(`missing ${file}`); });

const runtime = read('src/runtime/v551-hotfix-runtime.js');
const index = read('index.html');
const sw = read('sw.js');
const pkg = read('package.json');

if (!runtime.includes('AquaFantasiaV551') || !runtime.includes('clearInlineHandlers') || !runtime.includes('guardedCast') || !runtime.includes('guardedHook') || !runtime.includes('guardedReel')) fail('hotfix control guards missing');
if (!runtime.includes('cast-btn') || !runtime.includes('bite-target') || !runtime.includes('reel-action-btn')) fail('legacy inline target guards missing');
if (!(index.includes('v551-hotfix-runtime.js?v=5.5.1') || index.includes('v551-hotfix-runtime.js?v=5.5.2') || index.includes('v551-hotfix-runtime.js?v=5.5.5') || index.includes('v551-hotfix-runtime.js?v=5.6.0') || index.includes('v551-hotfix-runtime.js?v=5.6.1') || index.includes('v551-hotfix-runtime.js?v=5.7.0')) || !index.includes('updateViaCache')) fail('index hotfix/cache-bust markers missing');
if (!(index.includes('v53-casual-ux-polish.js?v=5.5.1') || index.includes('v53-casual-ux-polish.js?v=5.5.2') || index.includes('v53-casual-ux-polish.js?v=5.5.5') || index.includes('v53-casual-ux-polish.js?v=5.6.0') || index.includes('v53-casual-ux-polish.js?v=5.6.1') || index.includes('v53-casual-ux-polish.js?v=5.7.0')) || !(index.includes('v55-mobile-feel-runtime.js?v=5.5.1') || index.includes('v55-mobile-feel-runtime.js?v=5.5.2') || index.includes('v55-mobile-feel-runtime.js?v=5.5.5') || index.includes('v55-mobile-feel-runtime.js?v=5.6.0') || index.includes('v55-mobile-feel-runtime.js?v=5.6.1') || index.includes('v55-mobile-feel-runtime.js?v=5.7.0'))) fail('runtime module cache-bust markers missing');
if (!(sw.includes('aqua-fantasia-v5.5.1-hotfix-20260612') || sw.includes('aqua-fantasia-v5.5.2-runtime-ci-hotfix-20260612') || sw.includes('aqua-fantasia-v5.5.5-auto-cache-sweep-20260612') || sw.includes('aqua-fantasia-v5.6.0-background-art-20260612') || sw.includes('aqua-fantasia-v5.6.1-ui-cleanup-20260612') || sw.includes('aqua-fantasia-v5.7.0-water-art-20260612')) || !sw.includes('./src/runtime/v551-hotfix-runtime.js') || !sw.includes('aqua-fantasia-v5.5.0-mobile-feel-20260612')) fail('service worker hotfix/migration markers missing');
if (!pkg.includes('runtime551:check') || !pkg.includes('check-v551-hotfix.mjs')) fail('package v5.5.1 script missing');
console.log('[check-v551] runtime error hotfix OK');
