import fs from 'node:fs';

const main = fs.readFileSync('src/main.ts', 'utf8');
const css = fs.readFileSync('src/styles.css', 'utf8');
const data = fs.readFileSync('src/data.ts', 'utf8');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const offline = fs.readFileSync('public/offline.html', 'utf8');

const must = [
  [pkg.version === '2.0.89', 'package.json version must be 2.0.89'],
  [data.includes("APP_VERSION = '2.0.89'"), 'APP_VERSION must be 2.0.89'],
  [data.includes('aqua-fantasia-v2.0.89-ui-hard-reset-expedition-shop-fix'), 'cache name must be v2.0.89 hard reset'],
  [offline.includes('v2.0.89'), 'offline badge must be v2.0.89'],
  [main.includes("dataset.v2089UiHardReset = 'v2089-ui-hard-reset-expedition-shop-fix'"), 'v2089 dataset marker missing'],
  [main.includes('v2089-ui-hard-reset-menu-screen'), 'v2089 menu root class missing'],
  [main.includes('v2089-ui-hard-reset-village-screen'), 'v2089 village root class missing'],
  [main.includes('v2089-village-hud') && main.includes('v2089-profile-chip'), 'v2089 HUD classes missing'],
  [main.includes('v2089-expedition-board') && main.includes('v2089-expedition-toggle') && main.includes('v2089-expedition-body'), 'v2089 expedition classes missing'],
  [main.includes('v2089-expedition-open') && main.includes('v2089-expedition-body-open'), 'v2089 expedition state classes missing'],
  [main.includes('v2089-ui-close') && main.includes('v2089-menu-close'), 'v2089 close button classes missing'],
  [main.includes('data-village-shop') && main.includes('pointerup') && main.includes('capture: true'), 'shop pointer fallback missing'],
  [main.includes('[data-v2089-scroll-root]') && main.includes('.v2089-menu-content'), 'v2089 scroll roots missing'],
  [css.includes('v2.0.89 Hard UI reset'), 'v2089 CSS section missing'],
  [css.includes('--v2089-village-hud-w') && css.includes('width: 66px'), 'v2089 level chip width fix missing'],
  [css.includes('--v2089-expedition-gap: 3px'), 'v2089 expedition HUD gap missing'],
  [css.includes('.v2089-expedition-body-open') && css.includes('min-height: min(260px'), 'v2089 expedition visible card missing'],
  [css.includes('.v2089-menu-close') && css.includes('top: calc(max(8px, env(safe-area-inset-top)) + 7px)'), 'v2089 top-right menu close missing'],
  [css.includes('.v203-interior-actions [data-v203-interior-close]:not(.v2089-ui-close)') && css.includes('display: none !important'), 'bottom duplicate building close must be hidden'],
  [css.includes('[data-village-shop]') && css.includes('pointer-events: auto !important'), 'shop click layer fix missing'],
];

const failed = must.filter(([ok]) => !ok).map(([, msg]) => msg);
if (failed.length) {
  console.error('v2.0.89 UI hard reset check failed:');
  failed.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
}

console.log('v2.0.89 UI hard reset / expedition / shop click check passed.');
