import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => { console.error(`[v2035-direction-fishing-menu-repair] ${message}`); process.exit(1); };
const must = (condition, message) => { if (!condition) fail(message); };

const pkg = JSON.parse(read('package.json'));
const main = read('src/main.ts');
const css = read('src/styles.css');
const world = read('src/villageWorld.ts');
const data = read('src/data.ts');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const lock = read('package-lock.json');

must(/^2\.0\.(3[5-9]|[4-9][0-9])$/.test(pkg.version), 'package.json version must be 2.0.35 or later');
must(/APP_VERSION = '2\.0\.(3[5-9]|[4-9][0-9])'/.test(data), 'APP_VERSION must be 2.0.35 or later');
must(/aqua-fantasia-v2\.0\.(3[5-9]|[4-9][0-9])-/.test(data), 'CACHE_NAME must be v2.0.35 or later');
must(/aqua-fantasia-v2\.0\.(3[5-9]|[4-9][0-9])-/.test(sw), 'service worker cache must be v2.0.35 or later');
must(/v2\.0\.(3[5-9]|[4-9][0-9])/.test(offline), 'offline badge must mention v2.0.35 or later');

for (const token of [
  "dataset.v2035FinalPolish = 'v2035-direction-fishing-menu-repair'",
  "dataset.v2035FishingPlayable = 'v2035-fishing-playfield-rebuild'",
  'v2035-fishing-playfield-screen',
  'v2035-fishing-stage',
  'v2035-fishing-hud',
  'v2035-reel-panel',
  'v2035-cast-button',
  'v2035-identical-dock-nav',
  "nav.dataset.v2035DockGuard = 'v2035-home-fishing-menu-exact-dock'",
  'v2035-character-panel-open',
]) must(main.includes(token), `main.ts missing ${token}`);

const hasV2035CrossDiagonal = [
  "northeast: 'northwest'",
  "southeast: 'southwest'",
  "northwest: 'northeast'",
  "southwest: 'southeast'",
  "{ movement: 'northeast', dx: 0.5, dy: -0.866, texture: 'northwest' }",
  "{ movement: 'southeast', dx: 0.5, dy: 0.866, texture: 'southwest' }",
  'v2.0.35: v2023 diagonal source files are horizontally mirrored',
].every((token) => world.includes(token));
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
const hasV2047ClockCorrectedDiagonal = [
  "northeast: 'northeast'",
  "southeast: 'southeast'",
  "northwest: 'northwest'",
  "southwest: 'southwest'",
  "{ movement: 'northeast', dx: 0.5, dy: -0.866, texture: 'northeast' }",
  "{ movement: 'southeast', dx: 0.5, dy: 0.866, texture: 'southeast' }",
  'v2.0.47: stop relying on ambiguous v2023 diagonal filenames',
  './assets/v2047/characters/player_${direction}.png',
].every((token) => world.includes(token));
must(hasV2035CrossDiagonal || hasV2038DirectDiagonal || hasV2040ObservedDiagonal || hasV2042VisualDiagonal || hasV2047ClockCorrectedDiagonal, 'villageWorld.ts missing v2035/v2038/v2040/v2042/v2047 diagonal repair lineage');

for (const token of [
  'html[data-v2035-final-polish="v2035-direction-fishing-menu-repair"]',
  'html[data-v2035-fishing-playable="v2035-fishing-playfield-rebuild"]',
  '--v2035-dock-button',
  '--v2035-control-gap: 1px',
  '.bottom-nav.v2035-identical-dock-nav',
  'body.v2035-character-panel-open .bottom-nav.v2035-identical-dock-nav { display: none !important; }',
  '.village-world-screen .v2-world-controls',
  'row-gap: var(--v2035-control-gap) !important',
  'body[data-screen="fishing"] .fishing-screen.v2035-fishing-playfield-screen',
  'body[data-screen="fishing"] .v2035-reel-panel',
  'body[data-screen="fishing"] .v2035-reel-panel.hidden { display: none !important; }',
  'body[data-screen="fishing"] .v2035-reel-panel .v205-horizontal-gauge',
  'body[data-screen="fishing"] .v2035-cast-button',
  'body[data-screen="fishing"] .v2035-recent-catch-card { display: none !important; }',
  '.runtime-menu-screen .runtime-content',
  '.v2-build-tray',
]) must(css.includes(token), `styles.css missing ${token}`);

must(!/html\[data-version="2\.0\.35"\]/.test(css), 'v2035 CSS must not be scoped to data-version');
for (const forbidden of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  must(!lock.includes(forbidden), `package-lock contains forbidden registry token ${forbidden}`);
}
console.log('[AquaFantasia] v2.0.35+ direction/fishing/menu repair validation passed.');
