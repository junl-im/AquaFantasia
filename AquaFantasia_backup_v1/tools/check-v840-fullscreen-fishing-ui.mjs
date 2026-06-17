import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const main = read('src/main.ts');
const css = read('src/styles.css');
const data = read('src/data.ts');
const sw = read('public/sw.js');

const must = [
  [data.includes("APP_VERSION = '8.4.0'"), 'APP_VERSION must be 8.4.0'],
  [data.includes('aqua-fantasia-v8.4.0-fishing-fullscreen-ui-polish'), 'cache name must be v8.4.0'],
  [sw.includes('assets/v84/bg/ocean_full.webp'), 'service worker must precache v84 full fishing backgrounds'],
  [main.includes('v840-fishing-screen'), 'fishing must use v840 fullscreen shell'],
  [main.includes('recentCatchMarkup'), 'recent catch strip must be dynamic'],
  [!main.includes('v13-fishing-gear-card'), 'fishing gear card hotspot must be removed'],
  [!main.includes('v13-fishing-shop-card'), 'fishing bait/shop card hotspot must be removed'],
  [main.includes('가짜 유저 데이터는 제거했습니다'), 'ranking must explicitly remove fake user rows'],
  [main.includes('installImmersiveRetryHooks'), 'immersive retry hooks must be installed'],
  [css.includes('.v840-fishing-stage.fishing-stage') && css.includes('inset: 0 !important'), 'fishing stage must fill the screen'],
  [css.includes('.bottom-nav.v840-bottom-nav'), 'polished dynamic bottom nav must be present'],
  [css.includes('v13-top-action-cleaner'), 'unwanted top-right v13 action buttons must be visually cleaned'],
  [css.includes('--v840-nav-height'), 'v840 nav sizing variable must exist'],
];

const failures = must.filter(([ok]) => !ok).map(([, label]) => label);
if (failures.length) {
  console.error('[v8.4.0 UI check failed]');
  for (const failure of failures) console.error(' -', failure);
  process.exit(1);
}
console.log('[v8.4.0 UI check] fullscreen fishing/nav/ranking/immersive retry guards passed');
