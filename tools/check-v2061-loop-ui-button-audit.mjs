import { readFileSync } from 'node:fs';

const main = readFileSync('src/main.ts', 'utf8');
const styles = readFileSync('src/styles.css', 'utf8');
const data = readFileSync('src/data.ts', 'utf8');
const pkg = readFileSync('package.json', 'utf8');
const sw = readFileSync('public/sw.js', 'utf8');

function assert(condition, message) {
  if (!condition) {
    console.error(`[v2061] ${message}`);
    process.exit(1);
  }
}

assert(data.includes("APP_VERSION = '2.0.61'"), 'APP_VERSION must be 2.0.61.');
assert(data.includes('aqua-fantasia-v2.0.61-loop-ui-button-audit'), 'cache key must be v2.0.61 loop UI audit.');
assert(sw.includes('aqua-fantasia-v2.0.61-loop-ui-button-audit'), 'service worker cache key must be v2.0.61 loop UI audit.');
assert(pkg.includes('check-v2061-loop-ui-button-audit.mjs'), 'validate script must include v2061 guard.');
assert(main.includes("dataset.v2061LoopUiButtonAudit = 'v2061-loop-popup-content-button-audit'"), 'HTML dataset marker missing.');
assert(main.includes('v2061-loop-ui-village-screen'), 'village root v2061 class missing.');
assert(main.includes('v2061-loop-pop-title'), 'loop popup title markup missing.');
assert(main.includes("root.querySelectorAll<HTMLElement>('.v2051-loop-mini.open, .v2051-expedition-mini.open')"), 'loop toggle should close other open loop panels.');
assert(styles.includes('v2.0.61 loop popup/content/button audit'), 'v2061 CSS marker missing.');
assert(styles.includes(':is(.v2051-loop-mini.open,.v2051-expedition-mini.open) .v2051-loop-body'), 'open loop popup body override missing.');
assert(styles.includes('v2061-loop-pop-title'), 'loop popup visible title styles missing.');
assert(styles.includes('background-image: none !important'), 'legacy button image frame neutralizer missing.');
assert(styles.includes('.btn-gold-cost'), 'gold cost button polish missing.');
assert(styles.includes('runtime-menu-screen'), 'menu panel aqua polish missing.');
console.log('[v2061] loop UI/button audit checks passed.');
