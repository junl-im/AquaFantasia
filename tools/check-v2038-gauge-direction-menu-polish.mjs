import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => { console.error(`[v2038-gauge-direction-menu-polish] ${message}`); process.exit(1); };
const must = (condition, message) => { if (!condition) fail(message); };

const pkg = JSON.parse(read('package.json'));
const main = read('src/main.ts');
const css = read('src/styles.css');
const world = read('src/villageWorld.ts');
const data = read('src/data.ts');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const lock = read('package-lock.json');

const [major, minor, patch] = pkg.version.split('.').map(Number);
const versionOk = major === 2 && minor === 0 && patch >= 38;
must(versionOk, 'package.json version must be 2.0.38 or newer');
must(data.includes(`APP_VERSION = '${pkg.version}'`), `APP_VERSION must be ${pkg.version}`);
must(data.includes(`aqua-fantasia-v${pkg.version}-`), `CACHE_NAME must include v${pkg.version}`);
must(sw.includes(`aqua-fantasia-v${pkg.version}-`), `service worker cache must include v${pkg.version}`);
must(offline.includes(`v${pkg.version}`), `offline badge must mention v${pkg.version}`);

for (const token of [
  "dataset.v2038UiPolish = 'v2038-gauge-direction-menu-polish'",
  'v2038-fishing-repair-screen',
  'v2038-fishing-stage',
  'v2038-fishing-hud',
  'v2038-fishing-guide-card',
  'v2038-reel-panel',
  'v2038-cast-button',
  'v2038-result-card',
  'v2038-identical-dock-nav',
  "nav.dataset.v2038DockGuard = 'v2038-home-fishing-menu-exact-dock'",
  "root.dataset.v2038MenuAudit = 'aqua-card-design-complete'",
  'v2038-menu-aqua-card-screen',
]) must(main.includes(token), `main.ts missing ${token}`);

for (const token of [
  'Gauge/direction/menu repair pass',
  '--v2038-control-gap: 2px',
  '--v2038-fishing-safe-bottom',
  '.village-world-screen .v2-world-controls button',
  'border: 1px solid rgba(163, 243, 255, .10) !important',
  'body[data-screen="fishing"] .v2038-reel-panel',
  'min-height: 192px !important',
  '.v2038-reel-panel::before',
  '릴 감기 게이지',
  '.v2038-reel-panel .v205-reel-grid::before',
  'height: 148px !important',
  '.v2038-reel-panel .safe-zone',
  '.v2038-reel-panel .tension-fill',
  '.bottom-nav.v2038-identical-dock-nav',
  'body.v2037-character-panel-open .bottom-nav.v2038-identical-dock-nav',
  '.runtime-menu-screen.v2038-menu-aqua-card-screen',
  '.v2023-world-map-bg',
]) must(css.includes(token), `styles.css missing ${token}`);

const hasV2038DirectDiagonal = [
  "northeast: 'northeast'",
  "southeast: 'southeast'",
  "northwest: 'northwest'",
  "southwest: 'southwest'",
  "{ movement: 'northeast', dx: 0.5, dy: -0.866, texture: 'northeast' }",
  "{ movement: 'southeast', dx: 0.5, dy: 0.866, texture: 'southeast' }",
  'v2.0.38: the rebuilt v2023 files already encode their visual direction',
].every((token) => world.includes(token));
const hasV2040ObservedDiagonal = [
  "northeast: 'southwest'",
  "southeast: 'northwest'",
  "northwest: 'southeast'",
  "southwest: 'northeast'",
  "{ movement: 'northeast', dx: 0.5, dy: -0.866, texture: 'southwest' }",
  "{ movement: 'southeast', dx: 0.5, dy: 0.866, texture: 'northwest' }",
  'v2.0.40: field observation showed 1시 rendered like 7시 and 5시 like 11시',
].every((token) => world.includes(token));

const hasV2042VisualDiagonal = [
  "northeast: 'northwest'",
  "southeast: 'southeast'",
  "northwest: 'northeast'",
  "southwest: 'southwest'",
  "{ movement: 'northeast', dx: 0.5, dy: -0.866, texture: 'northwest' }",
  "{ movement: 'southeast', dx: 0.5, dy: 0.866, texture: 'southeast' }",
  'v2.0.42: the actual player PNG silhouettes were inspected in a contact sheet',
].every((token) => world.includes(token));
must(hasV2038DirectDiagonal || hasV2040ObservedDiagonal || hasV2042VisualDiagonal, 'villageWorld.ts missing v2038/v2040/v2042 diagonal QA lineage');

must(!/html\[data-version="2\.0\.38"\]/.test(css), 'v2038 CSS must not be scoped to data-version');
for (const forbidden of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  must(!lock.includes(forbidden), `package-lock contains forbidden registry token ${forbidden}`);
}
console.log('[AquaFantasia] v2.0.38 gauge/direction/menu polish validation passed.');
