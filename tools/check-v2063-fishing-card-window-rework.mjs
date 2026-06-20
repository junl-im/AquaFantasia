import { readFileSync } from 'node:fs';

const main = readFileSync('src/main.ts', 'utf8');
const styles = readFileSync('src/styles.css', 'utf8');
const data = readFileSync('src/data.ts', 'utf8');
const pkg = readFileSync('package.json', 'utf8');
const sw = readFileSync('public/sw.js', 'utf8');

function assert(condition, message) {
  if (!condition) {
    console.error(`[v2063] ${message}`);
    process.exit(1);
  }
}

assert(/APP_VERSION = '2\.0\.(?:6[3-9]|[7-9]\d)'/.test(data), 'APP_VERSION must be v2.0.63 or later.');
assert(/aqua-fantasia-v2\.0\.(?:6[3-9]|[7-9]\d)-/.test(data), 'CACHE_NAME must use v2.0.63 or later key.');
assert(/aqua-fantasia-v2\.0\.(?:6[3-9]|[7-9]\d)-/.test(sw), 'service worker cache key must use v2.0.63 or later.');
assert(pkg.includes('check-v2063-fishing-card-window-rework.mjs'), 'validate script must include v2063 guard.');
assert(main.includes("dataset.v2063FishingCardWindows = 'v2063-fishing-state-machine-unified-card-windows'"), 'v2063 global dataset marker missing.');
assert(main.includes('v2063-fishing-rework-screen'), 'fishing screen must include v2063 rework class.');
assert(main.includes('v2063-fishing-board'), 'new visible fishing board missing.');
assert(main.includes('v2063-fish-target') && main.includes('v2063-player-bar'), 'fish target/player reel lane missing.');
assert(main.includes('data-v2063-distance') && main.includes('data-v2063-progress'), 'visible distance progress UI missing.');
assert(main.includes("this.reelPanel?.style.setProperty('--v2063-player'"), 'v2063 player marker CSS variable update missing.');
assert(main.includes("this.reelPanel?.style.setProperty('--v2063-fish'"), 'v2063 fish marker CSS variable update missing.');
assert(main.includes('v2063-unified-card-window-screen'), 'unified card window class missing.');
assert(styles.includes('v2.0.63 fishing state-machine rework + unified card windows'), 'v2063 CSS marker missing.');
assert(styles.includes('.v2063-fishing-board') && styles.includes('.v2063-fish-lane'), 'v2063 fishing board CSS missing.');
assert(styles.includes('.v2063-unified-card-window-screen .runtime-content'), 'unified card content CSS missing.');
assert(styles.includes('.v2063-fishing-rework-screen .v2055-reel-actions button'), 'reel action button CSS missing.');
console.log('[v2063] fishing card-window rework checks passed.');
