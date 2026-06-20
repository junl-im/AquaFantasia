import { readFileSync } from 'node:fs';

const main = readFileSync('src/main.ts', 'utf8');
const styles = readFileSync('src/styles.css', 'utf8');
const data = readFileSync('src/data.ts', 'utf8');
const pkg = readFileSync('package.json', 'utf8');
const sw = readFileSync('public/sw.js', 'utf8');
const readme = readFileSync('README.md', 'utf8');

function assert(condition, message) {
  if (!condition) {
    console.error(`[v2065] ${message}`);
    process.exit(1);
  }
}

assert(/APP_VERSION = '2\.0\.(6[5-9]|[7-9][0-9])'/.test(data), 'APP_VERSION must be v2.0.65 or newer.');
assert(/aqua-fantasia-v2\.0\.(6[5-9]|[7-9][0-9])-/.test(data), 'CACHE_NAME must use a v2.0.65+ key.');
assert(/aqua-fantasia-v2\.0\.(6[5-9]|[7-9][0-9])-/.test(sw), 'service worker cache key must use a v2.0.65+ key.');
assert(/"version": "2\.0\.(6[5-9]|[7-9][0-9])"/.test(pkg), 'package.json version must be v2.0.65 or newer.');
assert(pkg.includes('check-v2065-unified-card-frame-polish.mjs'), 'validate script must include v2065 guard.');
assert(main.includes("dataset.v2065UnifiedCardFramePolish = 'v2065-unified-aqua-card-popup-frame-polish'"), 'v2065 dataset marker missing.');
assert(styles.includes('v2.0.65 unified aqua card popup frame polish'), 'v2065 CSS marker missing.');
assert(styles.includes('--v2065-card-bg'), 'v2065 card variables missing.');
assert(styles.includes('.runtime-content,') && styles.includes('.game-dialog-card,') && styles.includes('.catch-result-card,'), 'v2065 card selector group must cover menu, dialog, and result cards.');
assert(styles.includes('.v2059-screen-close') && styles.includes('.v2059-result-close'), 'v2065 close button polish missing.');
assert(styles.includes('content: none !important;') && styles.includes('display: none !important;'), 'v2065 pseudo-frame cleanup missing.');
assert(styles.includes('.v2051-loop-body[aria-hidden="false"]'), 'v2065 loop popup open-state guard missing.');
assert(/^# AquaFantasia v2\.0\.(6[5-9]|[7-9][0-9])/.test(readme), 'README title must be v2.0.65 or newer.');
console.log('[v2065] unified aqua card frame polish checks passed.');
