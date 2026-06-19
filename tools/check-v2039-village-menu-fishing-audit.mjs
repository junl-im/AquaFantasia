import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => { console.error(`[v2039-village-menu-fishing-audit] ${message}`); process.exit(1); };
const must = (condition, message) => { if (!condition) fail(message); };

const pkg = JSON.parse(read('package.json'));
const main = read('src/main.ts');
const css = read('src/styles.css');
const world = read('src/villageWorld.ts');
const data = read('src/data.ts');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const lock = read('package-lock.json');

must(pkg.version === '2.0.39', 'package.json version must be 2.0.39');
must(data.includes("APP_VERSION = '2.0.39'"), 'APP_VERSION must be 2.0.39');
must(data.includes('aqua-fantasia-v2.0.39-village-menu-fishing-audit-polish'), 'CACHE_NAME must be v2.0.39 audit polish');
must(sw.includes('aqua-fantasia-v2.0.39-village-menu-fishing-audit-polish'), 'service worker cache must be v2.0.39');
must(offline.includes('v2.0.39'), 'offline badge must mention v2.0.39');

for (const token of [
  "dataset.v2039AuditPolish = 'v2039-village-menu-fishing-audit-polish'",
  'v2039-fishing-audit-screen',
  'v2039-fishing-stage',
  'v2039-fishing-hud',
  'v2039-fishing-guide-card',
  'v2039-reel-panel',
  'v2039-result-card',
  'v2039-identical-dock-nav',
  "nav.dataset.v2039DockGuard = 'v2039-home-fishing-menu-exact-dock'",
  'v2039-menu-aqua-card-screen',
  "root.dataset.v2039MenuAudit = 'aqua-card-design-complete-no-odd-frames'",
  'v2039-village-object-audit-screen',
  "document.body.classList.toggle('v2039-character-panel-open', hidden)",
]) must(main.includes(token), `main.ts missing ${token}`);

for (const token of [
  'v2.0.39 Village/menu/fishing audit pass',
  '--v2039-control-gap: 3px',
  '--v2039-fishing-safe-bottom',
  '.village-world-screen .v2-world-controls button',
  'body[data-screen="fishing"] .v2039-reel-panel:not(.hidden)',
  'min-height: 214px !important',
  '.v2039-reel-panel .v205-reel-grid::before',
  'height: 160px !important',
  '.v2039-reel-panel .hold-pad',
  '.v2039-result-card',
  '.bottom-nav.v2039-identical-dock-nav',
  'body.v2039-character-panel-open .bottom-nav.v2039-identical-dock-nav',
  '.runtime-menu-screen.v2039-menu-aqua-card-screen',
  '.v2023-world-map-bg',
  '.v2039-fishing-guide-card',
]) must(css.includes(token), `styles.css missing ${token}`);

for (const token of [
  'V2039_EDGE_SAFE_DECORATIONS',
  'auditedDecorationPlacement',
  "'tree', 'palm', 'tropicalTree', 'palmAlt'",
  'const placement = auditedDecorationPlacement(deco)',
  "northeast: 'northeast'",
  "southeast: 'southeast'",
]) must(world.includes(token), `villageWorld.ts missing ${token}`);

must(!/html\[data-version="2\.0\.39"\]/.test(css), 'v2039 CSS must not be scoped to exact data-version');
for (const forbidden of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  must(!lock.includes(forbidden), `package-lock contains forbidden registry token ${forbidden}`);
}
console.log('[AquaFantasia] v2.0.39 village/menu/fishing audit validation passed.');
