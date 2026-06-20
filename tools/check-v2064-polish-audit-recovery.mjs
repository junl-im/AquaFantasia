import { readFileSync } from 'node:fs';

const main = readFileSync('src/main.ts', 'utf8');
const styles = readFileSync('src/styles.css', 'utf8');
const data = readFileSync('src/data.ts', 'utf8');
const pkg = readFileSync('package.json', 'utf8');
const sw = readFileSync('public/sw.js', 'utf8');

function assert(condition, message) {
  if (!condition) {
    console.error(`[v2064] ${message}`);
    process.exit(1);
  }
}

assert(/APP_VERSION = '2\.0\.(64|65|66|67|68|69|[7-9][0-9])'/.test(data), 'APP_VERSION must keep v2.0.64 or later lineage.');
assert(/aqua-fantasia-v2\.0\.(64|65|66|67|68|69|[7-9][0-9])/.test(data), 'CACHE_NAME must keep v2.0.64 or later lineage.');
assert(/aqua-fantasia-v2\.0\.(64|65|66|67|68|69|[7-9][0-9])/.test(sw), 'service worker cache key must keep v2.0.64 or later lineage.');
assert(pkg.includes('check-v2064-polish-audit-recovery.mjs'), 'validate script must include v2064 guard.');
assert(main.includes("dataset.v2064PolishAudit = 'v2064-fishing-ui-card-button-stability-audit'"), 'v2064 global dataset marker missing.');
assert(main.includes('v2064-fishing-polish-screen'), 'fishing screen must include v2064 polish class.');
assert(main.includes('private resultCardOpen = false;'), 'result card single-open lock missing.');
assert(main.includes("document.querySelector('.catch-result-card.v2064-result-card')"), 'result card duplicate guard missing.');
assert(main.includes('v2064-result-card'), 'result card v2064 class missing.');
assert(main.includes('v2064-bite-callout'), 'bite callout v2064 class missing.');
assert(!main.includes("callout.className = 'bite-callout v2030-bite-callout v2041-bite-callout v2042-bite-callout v2043-bite-callout v2046-bite-callout v2048-bite-callout';\n    callout.className"), 'duplicate bite callout class assignment must not return.');
assert(styles.includes('v2.0.64 polish audit recovery'), 'v2064 CSS marker missing.');
assert(styles.includes('.v2064-fishing-polish-screen .v2063-fishing-board'), 'v2064 fishing board polish CSS missing.');
assert(styles.includes('.v2064-fishing-polish-screen :is(.tension-track,.safe-progress,.surge-meter'), 'legacy fishing gauge quarantine CSS missing.');
assert(styles.includes('.v2064-fishing-polish-screen .catch-result-card.v2064-result-card'), 'v2064 compact result card CSS missing.');
assert(styles.includes('body:not([data-screen="village"]) .bottom-nav'), 'non-village dock hide guard missing.');
console.log('[v2064] polish audit recovery checks passed.');
