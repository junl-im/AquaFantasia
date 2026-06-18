import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => { console.error(`[v2033-fishing-ui-direction-dialog-audit] ${message}`); process.exit(1); };
const must = (condition, message) => { if (!condition) fail(message); };

const pkg = JSON.parse(read('package.json'));
const main = read('src/main.ts');
const css = read('src/styles.css');
const world = read('src/villageWorld.ts');
const data = read('src/data.ts');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const lock = read('package-lock.json');

must(pkg.version === '2.0.33', 'package.json version must be 2.0.33');
must(data.includes("APP_VERSION = '2.0.33'"), 'APP_VERSION must be 2.0.33');
must(data.includes('aqua-fantasia-v2.0.33-pixel-perfect-audit'), 'CACHE_NAME must be v2.0.33 pixel-perfect cache');
must(sw.includes('aqua-fantasia-v2.0.33-pixel-perfect-audit'), 'service worker cache must be v2.0.33 pixel-perfect cache');
must(offline.includes('v2.0.33'), 'offline badge must mention v2.0.33');

for (const token of [
  "dataset.v2033FishingUiAudit = 'v2033-fishing-ui-direction-dialog-audit'",
  "dataset.v2033TransparentControls = 'v2033-transparent-dock-controls'",
  'v2033-fishing-playable-screen',
  'v2033-fishing-stage',
  'v2033-fishing-hud',
  'v2033-recent-catch-card',
  'v2033-reel-panel',
  'v2033-cast-button',
  'v2033-identical-dock-nav',
  "nav.dataset.v2033DockGuard = 'v2033-home-fishing-menu-identical-transparent-dock'",
  'v2033-game-dialog-card',
  'v2033-dialog-backdrop',
  'v2033-character-panel-open',
]) must(main.includes(token), `main.ts missing ${token}`);

for (const token of [
  "southeast: 'northeast'",
  "northeast: 'southeast'",
  "{ movement: 'northeast', dx: 0.5, dy: -0.866, texture: 'southeast' }",
  "{ movement: 'southeast', dx: 0.5, dy: 0.866, texture: 'northeast' }",
  'v2.0.33: 사용자가 확인한 실제 v2023 대각선 에셋 기준',
]) must(world.includes(token), `villageWorld.ts missing diagonal texture correction token ${token}`);

for (const token of [
  'html[data-v2033-fishing-ui-audit="v2033-fishing-ui-direction-dialog-audit"]',
  'html[data-v2033-transparent-controls="v2033-transparent-dock-controls"] .bottom-nav.v2033-identical-dock-nav',
  '--v2033-dock-button',
  'border: 1px solid transparent !important;',
  'body.v2033-character-panel-open .bottom-nav.v2033-identical-dock-nav { display: none !important; }',
  'body[data-screen="fishing"] .fishing-screen.v2033-fishing-playable-screen',
  'body[data-screen="fishing"] .v2033-fishing-stage',
  'body[data-screen="fishing"] .v2033-cast-button',
  'body[data-screen="fishing"] .v2033-reel-panel:not(.hidden) { display: block !important; }',
  'body[data-screen="fishing"] .v2033-reel-panel .v205-horizontal-gauge',
  'body[data-screen="fishing"] .v2033-reel-panel :is(.tension-track,.safe-progress,.surge-meter)',
  'body[data-screen="fishing"] .v2033-recent-catch-card { display: none !important; }',
  '.game-dialog-card.v2033-game-dialog-card :is(strong,p)',
  'color: #fff !important;',
  'overflow-wrap: anywhere !important;',
  'text-overflow: ellipsis !important;',
]) must(css.includes(token), `styles.css missing ${token}`);

must(!/html\[data-version="2\.0\.33"\]/.test(css), 'v2033 CSS must not be scoped to data-version');
for (const forbidden of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  must(!lock.includes(forbidden), `package-lock contains forbidden registry token ${forbidden}`);
}
console.log('[AquaFantasia] v2.0.33 fishing/UI/direction/dialog audit validation passed.');
