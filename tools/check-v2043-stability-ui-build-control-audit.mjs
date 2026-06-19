import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => { console.error(`[v2043-stability-ui-build-control-audit] ${message}`); process.exit(1); };
const must = (condition, message) => { if (!condition) fail(message); };
const has = (source, token, label = token) => must(source.includes(token), `missing ${label}`);

const pkg = JSON.parse(read('package.json'));
const main = read('src/main.ts');
const css = read('src/styles.css');
const world = read('src/villageWorld.ts');
const data = read('src/data.ts');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const readme = read('README.md');
const lock = read('package-lock.json');

const version = String(pkg.version);
must(version === '2.0.43', 'package.json version must be 2.0.43');
has(data, "APP_VERSION = '2.0.43'", 'APP_VERSION 2.0.43');
has(data, 'aqua-fantasia-v2.0.43-stability-ui-build-control-audit', 'data cache v2.0.43');
has(sw, 'aqua-fantasia-v2.0.43-stability-ui-build-control-audit', 'sw cache v2.0.43');
has(offline, 'v2.0.43', 'offline badge v2.0.43');
has(readme, '# AquaFantasia v2.0.43', 'README title v2.0.43');
has(readme, '## v2.0.43', 'README v2.0.43 changelog');

for (const token of [
  "dataset.v2043StabilityUiAudit = 'v2043-stability-ui-build-control-audit'",
  'v2043-village-ui-screen',
  'v2043-menu-aqua-center-screen',
  "root.dataset.v2043MenuAudit = 'stable-centered-aqua-pages'",
  'v2043-fishing-playable-screen',
  'v2043-reel-panel',
  'v2043-result-card',
  'v2043-identical-dock-nav',
  "nav.dataset.v2043DockGuard = 'v2043-transparent-safe-uniform-dock'",
  'v2043-shop-summary',
  'v2043-shop-list',
  'v2043-control-icon',
  'v2043-control-label',
]) has(main, token, `main token ${token}`);

for (const token of [
  "this.root.toggleAttribute('data-v2043-build-ghost-placement', Boolean(type))",
  "this.root.setAttribute('data-v2043-build-tray-modal', 'true')",
  'private buildOriginFromPointerTile',
  'const origin = this.buildOriginFromPointerTile(tile.x, tile.y, def)',
  'this.updateBuildPreviewAtTile(origin.x, origin.y, true)',
  "this.root.classList.add('v2040-interior-open', 'v2041-interior-open', 'v2042-interior-open', 'v2043-interior-open')",
  "document.body.classList.add('v2040-interior-open', 'v2041-interior-open', 'v2042-interior-open', 'v2043-interior-open')",
  "northeast: 'northwest'",
  "southeast: 'southeast'",
  "northwest: 'northeast'",
  "southwest: 'southwest'",
]) has(world, token, `world token ${token}`);

for (const token of [
  'v2.0.43 Stability UI/build/control audit',
  '--v2043-control-size',
  '#toast-root',
  '.village-world-screen.v2043-village-ui-screen .v2-world-controls',
  '.village-world-screen.v2043-village-ui-screen .v2-world-controls .v2043-control-icon',
  '.village-world-screen.v2043-village-ui-screen .v2-world-controls .v2043-control-label',
  'body.v2043-interior-open .v2-world-controls',
  '.bottom-nav.v2043-identical-dock-nav',
  'body.v2043-character-panel-open .bottom-nav.v2043-identical-dock-nav',
  '.village-world-screen.v2043-village-ui-screen .v2-build-tray',
  '[data-v2043-build-ghost-placement] .v2-village-stage',
  '.runtime-menu-screen.v2043-menu-aqua-center-screen .runtime-hud',
  '.runtime-menu-screen.v2043-menu-aqua-center-screen .runtime-wallet',
  '.runtime-menu-screen.v2043-menu-aqua-center-screen :is(.runtime-hero-card,.runtime-panel,.runtime-item-card,.mission-card,.region-card,.shop-card,.gear-card,.dex-card,.v204-window-card',
  '.v203-interior-panel.open .v203-interior-card',
]) has(css, token, `css token ${token}`);

must(!/html\[data-version="2\.0\.43"\]/.test(css), 'v2043 CSS must not be scoped to exact data-version');
for (const forbidden of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  must(!lock.includes(forbidden), `package-lock contains forbidden registry token ${forbidden}`);
}
const rootMarkdown = fs.readdirSync('.').filter((name) => name.toLowerCase().endsWith('.md'));
must(rootMarkdown.length === 1 && rootMarkdown[0] === 'README.md', 'root must contain README.md only');
const forbiddenNotes = fs.readdirSync('.', { recursive: true }).filter((name) => /_NOTES\.md$/i.test(String(name)));
must(forbiddenNotes.length === 0, 'must not create *_NOTES.md files');
console.log('[AquaFantasia] v2.0.43 stability UI/build/control audit validation passed.');
