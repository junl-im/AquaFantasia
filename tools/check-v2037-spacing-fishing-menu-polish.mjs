import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => { console.error(`[v2037-spacing-fishing-menu-polish] ${message}`); process.exit(1); };
const must = (condition, message) => { if (!condition) fail(message); };

const pkg = JSON.parse(read('package.json'));
const main = read('src/main.ts');
const css = read('src/styles.css');
const data = read('src/data.ts');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const lock = read('package-lock.json');

must(pkg.version === '2.0.37', 'package.json version must be 2.0.37');
must(data.includes("APP_VERSION = '2.0.37'"), 'APP_VERSION must be 2.0.37');
must(data.includes('aqua-fantasia-v2.0.37-fishing-spacing-menu-polish'), 'CACHE_NAME must be v2.0.37 fishing spacing polish');
must(sw.includes('aqua-fantasia-v2.0.37-fishing-spacing-menu-polish'), 'service worker cache must be v2.0.37');
must(offline.includes('v2.0.37'), 'offline badge must mention v2.0.37');

for (const token of [
  "dataset.v2037UiPolish = 'v2037-spacing-fishing-menu-polish'",
  'v2037-character-panel-open',
  'v2037-fishing-stable-screen',
  'v2037-fishing-stage',
  'v2037-fishing-hud',
  'v2037-reel-panel',
  'v2037-cast-button',
  'v2037-result-card',
  'v2037-identical-dock-nav',
  "nav.dataset.v2037DockGuard = 'v2037-home-fishing-menu-exact-dock'",
]) must(main.includes(token), `main.ts missing ${token}`);

for (const token of [
  'v2.0.37 Spacing/fishing/menu polish pass',
  '--v2037-control-gap: 4px',
  '--v2037-control-w',
  '--v2037-control-h',
  '.village-world-screen .v2-world-controls button',
  'border: 1px solid rgba(160, 243, 255, .16) !important',
  'body[data-screen="fishing"] .v2037-reel-panel',
  'overflow: visible !important',
  '.v2037-reel-panel .v205-reel-grid::before',
  'height: 136px !important',
  '.v2037-reel-panel .hold-pad',
  '.v2037-result-card',
  '.bottom-nav.v2037-identical-dock-nav',
  'body.v2037-character-panel-open .bottom-nav.v2037-identical-dock-nav',
  '.runtime-menu-screen.v2029-menu-clean-page :is(.runtime-3d-bg,.runtime-bg-character',
]) must(css.includes(token), `styles.css missing ${token}`);

for (const forbidden of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  must(!lock.includes(forbidden), `package-lock contains forbidden registry token ${forbidden}`);
}

console.log('[AquaFantasia] v2.0.37 spacing/fishing/menu polish validation passed.');
