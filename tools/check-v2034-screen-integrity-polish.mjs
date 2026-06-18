import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => { console.error(`[v2034-screen-integrity-polish] ${message}`); process.exit(1); };
const must = (condition, message) => { if (!condition) fail(message); };

const pkg = JSON.parse(read('package.json'));
const main = read('src/main.ts');
const css = read('src/styles.css');
const world = read('src/villageWorld.ts');
const data = read('src/data.ts');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const lock = read('package-lock.json');

must(/^2\.0\.(3[4-9]|[4-9][0-9])$/.test(pkg.version), 'package.json version must preserve v2.0.34+ lineage');
must(/APP_VERSION = '2\.0\.(3[4-9]|[4-9][0-9])'/.test(data), 'APP_VERSION must preserve v2.0.34+ lineage');
must(/aqua-fantasia-v2\.0\.(3[4-9]|[4-9][0-9])-/.test(data), 'CACHE_NAME must preserve v2.0.34+ lineage');
must(/aqua-fantasia-v2\.0\.(3[4-9]|[4-9][0-9])-/.test(sw), 'service worker cache must preserve v2.0.34+ lineage');
must(/v2\.0\.(3[4-9]|[4-9][0-9])/.test(offline), 'offline badge must preserve v2.0.34+ lineage');

for (const token of [
  "dataset.v2034ScreenIntegrity = 'v2034-screen-integrity-polish'",
  "dataset.v2034FishingPlayability = 'v2034-fishing-reel-dock-final-layout'",
  'v2034-fishing-integrity-screen',
  'v2034-fishing-stage',
  'v2034-fishing-hud',
  'v2034-reel-panel',
  'v2034-cast-button',
  'v2034-identical-dock-nav',
  "nav.dataset.v2034DockGuard = 'v2034-home-fishing-menu-transparent-safe-dock'",
  'v2034-character-panel-open',
]) must(main.includes(token), `main.ts missing ${token}`);

for (const token of [
  'html[data-v2034-screen-integrity="v2034-screen-integrity-polish"]',
  'html[data-v2034-fishing-playability="v2034-fishing-reel-dock-final-layout"]',
  '--v2034-dock-button',
  '--v2034-control-gap',
  '.bottom-nav.v2034-identical-dock-nav',
  'body.v2034-character-panel-open .bottom-nav.v2034-identical-dock-nav { display: none !important; }',
  'body[data-screen="fishing"] .fishing-screen.v2034-fishing-integrity-screen',
  'body[data-screen="fishing"] .v2034-reel-panel:not(.hidden) { display: block !important; }',
  'body[data-screen="fishing"] .v2034-reel-panel .v205-horizontal-gauge',
  'body[data-screen="fishing"] .v2034-cast-button',
  '.village-world-screen .v2-world-controls',
  '.v2-profile-chip::after',
  '.runtime-menu-screen .runtime-content',
  '.v2-build-tray',
]) must(css.includes(token), `styles.css missing ${token}`);

const hasV2034DiagonalQa = world.includes("northeast: 'southeast'") && world.includes("southeast: 'northeast'");
const hasV2035DiagonalQa = world.includes("northeast: 'northwest'") && world.includes("southeast: 'southwest'") && world.includes("northwest: 'northeast'") && world.includes("southwest: 'southeast'");
must(hasV2034DiagonalQa || hasV2035DiagonalQa, 'villageWorld.ts missing diagonal QA lineage');

must(!/html\[data-version="2\.0\.34"\]/.test(css), 'v2034 CSS must not be scoped to data-version');
for (const forbidden of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  must(!lock.includes(forbidden), `package-lock contains forbidden registry token ${forbidden}`);
}
console.log('[AquaFantasia] v2.0.34 screen integrity polish validation passed.');
