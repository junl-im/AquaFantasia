import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const main = read('src/main.ts');
const css = read('src/styles.css');
const data = read('src/data.ts');
const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const offline = read('public/offline.html');
const sw = read('public/sw.js');
const readme = read('README.md');
const validateScript = pkg.scripts?.validate ?? '';

const versionOk = /^2\.0\.(8[2-9]|9[0-9])$/.test(pkg.version);
const required = [
  [versionOk, 'package.json version must be v2.0.82 or later'],
  [lock.version === pkg.version, 'package-lock root version must match package.json'],
  [lock.packages?.['']?.version === pkg.version, 'package-lock package version must match package.json'],
  [data.includes(`APP_VERSION = '${pkg.version}'`), 'APP_VERSION must match package.json'],
  [data.includes(`aqua-fantasia-v${pkg.version}`), 'data cache name must match package.json'],
  [sw.includes(`aqua-fantasia-v${pkg.version}`), 'service worker cache must match package.json'],
  [offline.includes(`v${pkg.version}`), 'offline badge must mention current version'],
  [readme.includes(`AquaFantasia v${pkg.version}`), 'README must document current version'],
  [validateScript.includes('check-v2082-menu-fixed-layout-separation.mjs'), 'validate must run v2082 check'],
  [main.includes("dataset.v2082MenuFixedLayout = 'v2082-menu-fixed-layout'"), 'html dataset v2082 marker missing'],
  [main.includes('v2082-menu-fixed-layout-screen'), 'runtime menu v2082 fixed layout class missing'],
  [main.includes('v2082-${active}-layout'), 'page-scoped v2082 layout class missing'],
  [(main.includes('v2082-menu-content v2082-${active}-content') || (main.includes('v2082-menu-content') && main.includes('v2082-${active}-content'))), 'page-scoped v2082 content class missing'],
  [main.includes('data-v2082-scroll-root="true"'), 'v2082 scroll root marker missing'],
  [main.includes('v2082-runtime-hud'), 'v2082 HUD class missing'],
  [main.includes('v2082-hud-wallet'), 'v2082 HUD wallet class missing'],
  [main.includes('v2082-expedition-panel-open'), 'v2082 expedition open class missing'],
  [main.includes('v2082-expedition-body'), 'v2082 expedition scroll body class missing'],
  [main.includes('v2082-menu-content') && main.includes('v2082-inventory-content') && main.includes('v2082-map-content') && main.includes('v2082-shop-content'), 'v2082 scroll target selectors missing'],
  [css.includes('v2.0.82 Menu Fixed Layout Separation'), 'v2082 CSS section missing'],
  [css.includes('.runtime-menu-screen.v2082-menu-fixed-layout-screen'), 'v2082 menu screen CSS missing'],
  [css.includes('.v2082-runtime-hud'), 'v2082 HUD CSS missing'],
  [css.includes('grid-template-areas: "avatar title" "wallet wallet"'), 'v2082 HUD internal grid missing'],
  [css.includes('.v2082-menu-content'), 'v2082 content scroll root CSS missing'],
  [css.includes('.runtime-menu-screen.v2082-inventory-layout'), 'inventory page scoped grid CSS missing'],
  [css.includes('.runtime-menu-screen.v2082-map-layout'), 'map page scoped grid CSS missing'],
  [css.includes('.runtime-menu-screen.v2082-shop-layout'), 'shop page scoped grid CSS missing'],
  [css.includes('.runtime-menu-screen.v2082-dex-layout'), 'dex page scoped grid CSS missing'],
  [css.includes('body[data-screen="fishing"] .runtime-menu-screen.v2082-menu-fixed-layout-screen .v2082-menu-dim'), 'fishing dim exclusion missing'],
  [css.includes('body.v2082-expedition-panel-open') && css.includes('visibility: hidden !important'), 'expedition bar hide-on-open CSS missing'],
  [css.includes('::before') && css.includes('content: none !important'), 'button pseudo reset guard missing'],
];

const failed = required.filter(([ok]) => !ok).map(([, message]) => message);
if (failed.length) {
  console.error('[v2082] menu fixed layout separation checks failed:');
  for (const message of failed) console.error(`- ${message}`);
  process.exit(1);
}

const banned = ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai'];
const lockText = read('package-lock.json');
const polluted = banned.filter((needle) => lockText.includes(needle));
if (polluted.length) {
  console.error(`[v2082] forbidden registry strings in package-lock: ${polluted.join(', ')}`);
  process.exit(1);
}

const rootMarkdown = fs.readdirSync('.').filter((name) => name.endsWith('.md'));
if (rootMarkdown.length !== 1 || rootMarkdown[0] !== 'README.md') {
  console.error(`[v2082] root markdown must be README.md only: ${rootMarkdown.join(', ')}`);
  process.exit(1);
}

console.log('[v2082] menu fixed layout separation checks passed.');
