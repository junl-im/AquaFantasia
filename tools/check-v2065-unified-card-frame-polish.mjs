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

assert(data.includes("APP_VERSION = '2.0.65'"), 'APP_VERSION must be 2.0.65.');
assert(data.includes('aqua-fantasia-v2.0.65-unified-aqua-card-popup-frame-polish'), 'CACHE_NAME must use v2.0.65 card frame key.');
assert(sw.includes('aqua-fantasia-v2.0.65-unified-aqua-card-popup-frame-polish'), 'service worker cache key must use v2.0.65 card frame key.');
assert(pkg.includes('"version": "2.0.65"'), 'package.json version must be 2.0.65.');
assert(pkg.includes('check-v2065-unified-card-frame-polish.mjs'), 'validate script must include v2065 guard.');
assert(main.includes("dataset.v2065UnifiedCardFramePolish = 'v2065-unified-aqua-card-popup-frame-polish'"), 'v2065 dataset marker missing.');
assert(styles.includes('v2.0.65 unified aqua card popup frame polish'), 'v2065 CSS marker missing.');
assert(styles.includes('--v2065-card-bg'), 'v2065 card variables missing.');
assert(styles.includes('.runtime-content,') && styles.includes('.game-dialog-card,') && styles.includes('.catch-result-card,'), 'v2065 card selector group must cover menu, dialog, and result cards.');
assert(styles.includes('.v2059-screen-close') && styles.includes('.v2059-result-close'), 'v2065 close button polish missing.');
assert(styles.includes('content: none !important;') && styles.includes('display: none !important;'), 'v2065 pseudo-frame cleanup missing.');
assert(styles.includes('.v2051-loop-body[aria-hidden="false"]'), 'v2065 loop popup open-state guard missing.');
assert(readme.startsWith('# AquaFantasia v2.0.65'), 'README title must be v2.0.65.');
console.log('[v2065] unified aqua card frame polish checks passed.');
