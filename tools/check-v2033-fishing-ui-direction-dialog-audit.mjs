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

must(/^2\.0\.(3[3-9]|[4-9][0-9])$/.test(pkg.version), 'package.json version must preserve v2.0.33+ fishing/UI direction lineage');
must(/APP_VERSION = '2\.0\.(3[3-9]|[4-9][0-9])'/.test(data), 'APP_VERSION must preserve v2.0.33+ lineage');
must(/aqua-fantasia-v2\.0\.(3[3-9]|[4-9][0-9])-/.test(data), 'CACHE_NAME must preserve v2.0.33+ lineage');
must(/aqua-fantasia-v2\.0\.(3[3-9]|[4-9][0-9])-/.test(sw), 'service worker cache must preserve v2.0.33+ lineage');
must(/v2\.0\.(3[3-9]|[4-9][0-9])/.test(offline), 'offline badge must preserve v2.0.33+ lineage');

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

const hasV2033DiagonalCorrection = world.includes("southeast: 'northeast'") && world.includes("northeast: 'southeast'");
const hasV2035DiagonalCorrection = world.includes("southeast: 'southwest'") && world.includes("northeast: 'northwest'") && world.includes("southwest: 'southeast'") && world.includes("northwest: 'northeast'");
const hasV2038DirectDirectionRepair = world.includes("southeast: 'southeast'") && world.includes("northeast: 'northeast'") && world.includes("southwest: 'southwest'") && world.includes("northwest: 'northwest'");
const hasV2040ObservedDiagonalRepair = world.includes("southeast: 'northwest'") && world.includes("northeast: 'southwest'") && world.includes("southwest: 'northeast'") && world.includes("northwest: 'southeast'");
const hasV2042VisualDiagonalRepair = world.includes("southeast: 'southeast'") && world.includes("northeast: 'northwest'") && world.includes("southwest: 'southwest'") && world.includes("northwest: 'northeast'");
const hasV2047ClockCorrectedAssets = world.includes('./assets/v2047/characters/player_${direction}.png') && world.includes("southeast: 'southeast'") && world.includes("northeast: 'northeast'") && world.includes("southwest: 'southwest'") && world.includes("northwest: 'northwest'");
must(hasV2033DiagonalCorrection || hasV2035DiagonalCorrection || hasV2038DirectDirectionRepair || hasV2040ObservedDiagonalRepair || hasV2042VisualDiagonalRepair || hasV2047ClockCorrectedAssets, 'villageWorld.ts missing diagonal texture correction lineage');
must(world.includes('v2.0.33: 사용자가 확인한 실제 v2023 대각선 에셋 기준') || world.includes('v2.0.35: v2023 diagonal source files are horizontally mirrored') || world.includes('v2.0.38: the rebuilt v2023 files already encode their visual direction') || world.includes('v2.0.40: field observation showed 1시 rendered like 7시 and 5시 like 11시') || world.includes('v2.0.42: the actual player PNG silhouettes were inspected in a contact sheet') || world.includes('v2.0.47: stop relying on ambiguous v2023 diagonal filenames'), 'villageWorld.ts missing diagonal correction explanation');

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
