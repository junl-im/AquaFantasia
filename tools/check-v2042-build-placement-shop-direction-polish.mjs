import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => { console.error(`[v2042-build-placement-shop-direction-polish] ${message}`); process.exit(1); };
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
const [major, minor, patch] = version.split('.').map(Number);
must(major === 2 && minor === 0 && patch >= 42, 'package.json version must be 2.0.42 or newer');
has(data, `APP_VERSION = '${version}'`, `APP_VERSION ${version}`);
has(data, `aqua-fantasia-v${version}-`, `data cache v${version}`);
has(sw, `aqua-fantasia-v${version}-`, `sw cache v${version}`);
has(offline, `v${version}`, `offline badge v${version}`);
has(readme, `# AquaFantasia v${version}`, `README title v${version}`);
has(readme, '## v2.0.42', 'README v2.0.42 changelog');

for (const token of [
  "dataset.v2042BuildShopDirectionPolish = 'v2042-build-placement-shop-direction-polish'",
  'v2042-village-ui-screen',
  'v2042-menu-aqua-center-screen',
  "root.dataset.v2042MenuAudit = 'shop-and-page-aqua-card-centered'",
  'v2042-shop-summary',
  'v2042-shop-list',
  'v2042-identical-dock-nav',
  "nav.dataset.v2042DockGuard = 'v2042-transparent-uniform-dock'",
  'v2042-fishing-playable-screen',
  'v2042-cast-button',
  'v2042-reel-panel',
  'v2042-result-card',
]) has(main, token, `main token ${token}`);

for (const token of [
  "northeast: 'northwest'",
  "southeast: 'southeast'",
  "northwest: 'northeast'",
  "southwest: 'southwest'",
  "{ movement: 'northeast', dx: 0.5, dy: -0.866, texture: 'northwest' }",
  "{ movement: 'southeast', dx: 0.5, dy: 0.866, texture: 'southeast' }",
  "{ movement: 'northwest', dx: -0.5, dy: -0.866, texture: 'northeast' }",
  "{ movement: 'southwest', dx: -0.5, dy: 0.866, texture: 'southwest' }",
  'v2.0.42: the actual player PNG silhouettes were inspected in a contact sheet',
  "this.root.toggleAttribute('data-v2042-build-drag-placement', Boolean(type))",
  "this.root.classList.add('v2040-interior-open', 'v2041-interior-open', 'v2042-interior-open'",
  "document.body.classList.add('v2040-interior-open', 'v2041-interior-open', 'v2042-interior-open'",
]) has(world, token, `world token ${token}`);

for (const token of [
  'v2.0.42 Build placement/shop/direction polish',
  '--v2042-control-size',
  '#toast-root',
  '.village-world-screen.v2042-village-ui-screen .v2-world-controls',
  '.village-world-screen.v2042-village-ui-screen .v2-build-tray',
  '.village-world-screen.v2042-village-ui-screen.v2-build-active .v2-build-backdrop',
  'background: transparent !important',
  'filter: none !important',
  '.runtime-menu-screen.v2042-menu-aqua-center-screen .v2042-shop-summary',
  '.runtime-menu-screen.v2042-menu-aqua-center-screen .shop-card',
  '.v203-interior-panel.open .v203-interior-card',
  'body.v2042-interior-open .v2-world-controls',
]) has(css, token, `css token ${token}`);

must(!/html\[data-version="2\.0\.42"\]/.test(css), 'v2042 CSS must not be scoped to exact data-version');
for (const forbidden of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  must(!lock.includes(forbidden), `package-lock contains forbidden registry token ${forbidden}`);
}

const rootMarkdown = fs.readdirSync('.').filter((name) => name.toLowerCase().endsWith('.md'));
must(rootMarkdown.length === 1 && rootMarkdown[0] === 'README.md', 'root must contain README.md only');
const forbiddenNotes = fs.readdirSync('.', { recursive: true }).filter((name) => /_NOTES\.md$/i.test(String(name)));
must(forbiddenNotes.length === 0, 'must not create *_NOTES.md files');

console.log('[AquaFantasia] v2.0.42 build placement/shop/direction polish validation passed.');
