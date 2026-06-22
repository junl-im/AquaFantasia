import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const main = read('src/main.ts');
const css = read('src/styles.css');
const data = read('src/data.ts');
const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const offline = read('public/offline.html');
const sw = read('public/sw.js');

const versionNumber = Number(pkg.version.split('.').at(-1));
const isAtLeast2081 = pkg.version.startsWith('2.0.') && versionNumber >= 81;
const currentCachePrefix = `aqua-fantasia-v${pkg.version}-`;

const required = [
  [isAtLeast2081, 'package.json version must be v2.0.81 or newer'],
  [lock.version === pkg.version, 'package-lock root version must match package.json'],
  [lock.packages?.['']?.version === pkg.version, 'package-lock package version must match package.json'],
  [data.includes(`APP_VERSION = '${pkg.version}'`), 'APP_VERSION must match package.json'],
  [data.includes(currentCachePrefix), 'data cache name must match current version'],
  [sw.includes(currentCachePrefix), 'service worker cache must match current version'],
  [offline.includes(`v${pkg.version}`), 'offline badge must mention current version'],
  [main.includes("dataset.v2081AquaUiRootRepair = 'v2081-aqua-ui-root-repair'"), 'html dataset v2081 marker missing'],
  [main.includes('v2081-aqua-menu-root-repair-screen'), 'runtime menu v2081 class missing'],
  [main.includes('v2081-hud-overlay-root-repair-screen'), 'village v2081 class missing'],
  [main.includes('v2081-menu-dim'), 'runtime menu dim layer missing'],
  [main.includes('v2081-expedition-panel-open'), 'expedition open state class missing'],
  [main.includes('v2081-expedition-body'), 'expedition scroll body class missing'],
  [main.includes('v2081-scroll-root'), 'v2081 scroll selector missing'],
  [css.includes('v2.0.81 Aqua UI Root Repair'), 'v2081 CSS section missing'],
  [css.includes('.runtime-menu-screen.v2081-aqua-menu-root-repair-screen .v2081-menu-dim'), 'runtime menu blur dim CSS missing'],
  [css.includes('body[data-screen="fishing"] .runtime-menu-screen.v2081-aqua-menu-root-repair-screen::before'), 'fishing exclusion for modal dim missing'],
  [css.includes('.runtime-hud.aqua-card-hud'), 'HUD aqua-card repair missing'],
  [css.includes('.runtime-content.aqua-card-page'), 'runtime content repair missing'],
  [css.includes('::before') && css.includes('content: none !important'), 'button pseudo reset missing'],
  [css.includes('.v2-village-hud'), 'village HUD repair missing'],
  [css.includes('.v2051-expedition-mini.open .v2075-expedition-toggle'), 'expedition bar hide-on-open CSS missing'],
  [css.includes('backdrop-filter: blur(9px) saturate(1.08)'), 'dialog blur backdrop CSS missing'],
];

const failed = required.filter(([ok]) => !ok).map(([, message]) => message);
if (failed.length) {
  console.error('[v2081] aqua UI root repair checks failed:');
  for (const message of failed) console.error(`- ${message}`);
  process.exit(1);
}

const banned = ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai'];
const lockText = read('package-lock.json');
const polluted = banned.filter((needle) => lockText.includes(needle));
if (polluted.length) {
  console.error(`[v2081] forbidden registry strings in package-lock: ${polluted.join(', ')}`);
  process.exit(1);
}

console.log('[v2081] aqua UI root repair checks passed.');
