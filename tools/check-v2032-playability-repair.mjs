import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => { console.error(`[v2032-playability-repair] ${message}`); process.exit(1); };
const must = (condition, message) => { if (!condition) fail(message); };

const pkg = JSON.parse(read('package.json'));
const lock = read('package-lock.json');
const data = read('src/data.ts');
const main = read('src/main.ts');
const css = read('src/styles.css');
const village = read('src/villageWorld.ts');

must(pkg.version === '2.0.32', 'package.json version must be 2.0.32');
must(data.includes("APP_VERSION = '2.0.32'"), 'APP_VERSION must be 2.0.32');
must(data.includes('aqua-fantasia-v2.0.32-pixel-perfect-audit'), 'cache name must use v2.0.32 pixel-perfect lineage');
must(read('public/sw.js').includes('aqua-fantasia-v2.0.32-pixel-perfect-audit'), 'service worker cache must use v2.0.32');
must(read('public/offline.html').includes('v2.0.32'), 'offline badge must be v2.0.32');

for (const token of [
  "dataset.v2032PlayabilityRepair = 'v2032-fishing-hud-dock-playable-repair'",
  "dataset.v2032DockRepair = 'v2032-identical-dock-visible-safe-area'",
  'v2032-fishing-playable-screen',
  'v2032-fishing-stage',
  'v2032-fishing-hud',
  'v2032-cast-button',
  'v2032-reel-panel',
  'v2032-recent-catch-card',
  'v2032-identical-dock-nav',
  "nav.dataset.v2032DockGuard = 'v2032-home-fishing-menu-identical-visible-dock'",
  'setDockHiddenForCharacterPanel',
]) must(main.includes(token), `main.ts missing ${token}`);

for (const token of [
  'html[data-v2032-playability-repair="v2032-fishing-hud-dock-playable-repair"]',
  'html[data-v2032-dock-repair="v2032-identical-dock-visible-safe-area"] .bottom-nav.v2032-identical-dock-nav',
  '--v2032-dock-button',
  'body[data-screen="fishing"] .fishing-screen.v2032-fishing-playable-screen',
  'body[data-screen="fishing"] .v2032-fishing-stage',
  'body[data-screen="fishing"] .v2032-cast-button',
  'body[data-screen="fishing"] .v2032-reel-panel:not(.hidden) { display: block !important; }',
  'body[data-screen="fishing"] .v2032-reel-panel .v205-horizontal-gauge',
  'body[data-screen="fishing"] .v2032-reel-panel :is(.tension-track,.safe-progress,.surge-meter)',
  'body.v2032-character-panel-open .bottom-nav.v2032-identical-dock-nav { display: none !important; }',
  '.v2-profile-chip.v2017-profile-button::after',
  '.village-world-screen .v2-world-controls button',
]) must(css.includes(token), `styles.css missing ${token}`);

for (const token of [
  'private pinchCenterScreen: PointerPoint | null = null;',
  'private pinchCenterWorld: PointerPoint | null = null;',
  'private beginPinchZoom(): void',
  'this.camera.x = center.x - this.pinchCenterWorld.x * nextScale;',
  'this.camera.y = center.y - this.pinchCenterWorld.y * nextScale;',
]) must(village.includes(token), `villageWorld.ts missing pinch-center token ${token}`);

must(!/html\[data-version="2\.0\.32"\]/.test(css), 'v2032 repair must not be scoped to data-version');
must(!/(packages\.applied-caas|applied-caas-gateway|10\.192\.|internal\.api\.openai)/.test(lock), 'internal registry contamination found in package-lock');
must(!/reports\//.test(lock), 'lockfile unexpectedly references reports directory');

console.log('[AquaFantasia] v2.0.32 playability repair validation passed.');
