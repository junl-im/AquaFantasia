import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const main = read('src/main.ts');
const css = read('src/styles.css');
const data = read('src/data.ts');
const pkg = JSON.parse(read('package.json'));
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const errors = [];
const need = (ok, msg) => { if (!ok) errors.push(msg); };

need(pkg.version === '2.0.95', 'package.json version must be 2.0.95');
need(data.includes("APP_VERSION = '2.0.95'"), 'APP_VERSION must be 2.0.95');
need(data.includes('aqua-fantasia-v2.0.95-ui-canonical-runtime-prune'), 'CACHE_NAME must use v2.0.95 canonical runtime prune cache');
need(sw.includes('aqua-fantasia-v2.0.95-ui-canonical-runtime-prune'), 'service worker cache must use v2.0.95 cache');
need(offline.includes('v2.0.95'), 'offline badge/copy must mention v2.0.95');

const requiredMain = [
  'activateV2095UiResetShell',
  "document.documentElement.dataset.v2095UiReset = 'v2095-live-ui-clean-shell'",
  'v2095-village-screen',
  'v2095-village-hud',
  'v2095-profile-chip',
  'v2095-expedition-board',
  'data-v2095-expedition-toggle',
  'data-v2095-expedition-body',
  'v2095-expedition-body-open',
  'runtime-hud v2095-menu-hud',
  'runtime-content v2095-menu-content',
  'data-v2095-scroll-root',
  'v2095-ui-close',
  'v2095-menu-close',
  'legacy UI validation payloads were removed from live source',
];
for (const token of requiredMain) need(main.includes(token), `main.ts missing ${token}`);

for (const forbidden of ['V2090_LEGACY_UI_CLASS_LINEAGE', 'root.dataset.v2090LegacyUiClassLineage = V2090_LEGACY_UI_CLASS_LINEAGE']) {
  need(!main.includes(forbidden), `main.ts must not keep live legacy payload token ${forbidden}`);
}

const requiredCss = [
  'html[data-version="2.0.95"] .v2095-village-screen',
  'html[data-version="2.0.95"] .v2095-village-hud',
  'html[data-version="2.0.95"] .v2095-profile-chip',
  'html[data-version="2.0.95"] .v2095-expedition-board',
  'html[data-version="2.0.95"] .v2095-expedition-body.v2095-expedition-body-open',
  'html[data-version="2.0.95"] .v2095-ui-close',
  'html[data-version="2.0.95"] .v2095-menu-screen',
  'html[data-version="2.0.95"] .v2095-menu-content',
  'html[data-version="2.0.95"] button::before',
  'html[data-version="2.0.95"] button::after',
];
for (const token of requiredCss) need(css.includes(token), `styles.css missing ${token}`);

need(css.includes('html[data-version="2.0.95"] .bottom-nav') && css.includes('display: none !important'), 'v2.0.95 must explicitly hide legacy bottom-nav residue');
need(main.includes("document.querySelectorAll('.bottom-nav.fixed-root-nav, .bottom-nav').forEach((node) => node.remove())"), 'mountBottomNav must remove old bottom nav instead of mounting it');

if (errors.length) {
  console.error('[AquaFantasia] v2.0.95 canonical UI runtime prune validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log('[AquaFantasia] v2.0.95 canonical UI runtime prune validation passed.');
