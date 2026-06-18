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

must(pkg.version === '2.0.34', 'package.json version must be 2.0.34');
must(data.includes("APP_VERSION = '2.0.34'"), 'APP_VERSION must be 2.0.34');
must(data.includes('aqua-fantasia-v2.0.34-screen-integrity-polish'), 'CACHE_NAME must be v2.0.34 screen integrity cache');
must(sw.includes('aqua-fantasia-v2.0.34-screen-integrity-polish'), 'service worker cache must be v2.0.34 screen integrity cache');
must(offline.includes('v2.0.34'), 'offline badge must mention v2.0.34');

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

for (const token of [
  "northeast: 'southeast'",
  "southeast: 'northeast'",
  "{ movement: 'northeast', dx: 0.5, dy: -0.866, texture: 'southeast' }",
  "{ movement: 'southeast', dx: 0.5, dy: 0.866, texture: 'northeast' }",
]) must(world.includes(token), `villageWorld.ts missing diagonal QA token ${token}`);

must(!/html\[data-version="2\.0\.34"\]/.test(css), 'v2034 CSS must not be scoped to data-version');
for (const forbidden of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  must(!lock.includes(forbidden), `package-lock contains forbidden registry token ${forbidden}`);
}
console.log('[AquaFantasia] v2.0.34 screen integrity polish validation passed.');
