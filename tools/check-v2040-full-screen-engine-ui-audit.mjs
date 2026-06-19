import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => { console.error(`[v2040-full-screen-engine-ui-audit] ${message}`); process.exit(1); };
const must = (condition, message) => { if (!condition) fail(message); };

const pkg = JSON.parse(read('package.json'));
const main = read('src/main.ts');
const css = read('src/styles.css');
const world = read('src/villageWorld.ts');
const data = read('src/data.ts');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const lock = read('package-lock.json');

must(pkg.version === '2.0.40', 'package.json version must be 2.0.40');
must(data.includes("APP_VERSION = '2.0.40'"), 'APP_VERSION must be 2.0.40');
must(data.includes('aqua-fantasia-v2.0.40-full-screen-engine-ui-audit'), 'CACHE_NAME must be v2.0.40 full audit');
must(sw.includes('aqua-fantasia-v2.0.40-full-screen-engine-ui-audit'), 'service worker cache must be v2.0.40 full audit');
must(offline.includes('v2.0.40'), 'offline badge must mention v2.0.40');

for (const token of [
  "dataset.v2040FullAuditPolish = 'v2040-full-screen-engine-ui-audit'",
  'v2040-fishing-playable-screen',
  'v2040-fishing-stage',
  'v2040-fishing-hud',
  'v2040-fishing-guide-card',
  'v2040-reel-panel',
  'v2040-vertical-gauge',
  'v2040-vertical-marker',
  'v2040-cast-button',
  'v2040-result-card',
  'v2040-identical-dock-nav',
  "nav.dataset.v2040DockGuard = 'v2040-field-menu-fishing-identical-dock'",
  'v2040-menu-aqua-card-screen',
  "root.dataset.v2040MenuAudit = 'dock-safe-aqua-card-no-odd-buttons'",
  'v2040-village-engine-audit-screen',
  'v2040-character-panel-open',
  'v2040-interior-open',
  'startPanelHold',
]) must(main.includes(token), `main.ts missing ${token}`);

for (const token of [
  'v2.0.40 Full screen engine/UI audit',
  '--v2040-control-gap: 2px',
  '--v2040-fishing-safe-bottom',
  '.bottom-nav.v2040-identical-dock-nav',
  'body.v2040-character-panel-open .bottom-nav.v2040-identical-dock-nav',
  'body.v2040-interior-open .v2-world-controls',
  'body[data-screen="fishing"] .v2040-reel-panel:not(.hidden)',
  '.v2040-vertical-gauge',
  '.v2040-vertical-marker',
  '.v2040-reel-panel .hold-pad',
  'pointer-events: auto !important',
  '.v2040-result-card',
  '.runtime-menu-screen.v2040-menu-aqua-card-screen .runtime-content',
  'padding-right: calc(var(--v2040-dock-button) + 16px) !important',
  '.runtime-menu-screen.v2040-menu-aqua-card-screen :is(.runtime-btn,.btn-aqua-action,.btn-gold-cost,button.runtime-btn,.shop-card,.region-card)',
]) must(css.includes(token), `styles.css missing ${token}`);

for (const token of [
  "northeast: 'southwest'",
  "southeast: 'northwest'",
  "northwest: 'southeast'",
  "southwest: 'northeast'",
  "{ movement: 'northeast', dx: 0.5, dy: -0.866, texture: 'southwest' }",
  "{ movement: 'southeast', dx: 0.5, dy: 0.866, texture: 'northwest' }",
  'v2.0.40: field observation showed 1시 rendered like 7시 and 5시 like 11시',
  "document.body.classList.add('v2040-interior-open')",
  "document.body.classList.remove('v2040-interior-open')",
]) must(world.includes(token), `villageWorld.ts missing ${token}`);

must(!/html\[data-version="2\.0\.40"\]/.test(css), 'v2040 CSS must not be scoped to exact data-version');
for (const forbidden of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  must(!lock.includes(forbidden), `package-lock contains forbidden registry token ${forbidden}`);
}

console.log('[AquaFantasia] v2.0.40 full screen engine/UI audit validation passed.');
