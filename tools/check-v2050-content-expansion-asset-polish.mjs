import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => { console.error(`[v2050-content-expansion-asset-polish] ${message}`); process.exit(1); };
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

must(pkg.version === '2.0.50', 'package.json version must be 2.0.50');
has(data, "APP_VERSION = '2.0.50'", 'APP_VERSION 2.0.50');
has(data, 'aqua-fantasia-v2.0.50-content-expansion-asset-polish', 'data cache v2.0.50');
has(sw, 'aqua-fantasia-v2.0.50-content-expansion-asset-polish', 'sw cache v2.0.50');
has(offline, 'v2.0.50', 'offline badge v2.0.50');
has(readme, '# AquaFantasia v2.0.50', 'README title v2.0.50');
has(readme, '## v2.0.50', 'README v2.0.50 changelog');
has(pkg.scripts.validate, 'check-v2050-content-expansion-asset-polish.mjs', 'v2050 validate hook');

for (const token of [
  "dataset.v2050ContentExpansionAssetPolish = 'v2050-content-expansion-asset-polish'",
  'v2050-content-village-screen',
  'islandExpansionStats',
  'islandExpansionBoardMarkup',
  'v2050-expedition-board',
  'v2050-expedition-card',
  '개척 항로 허가서',
  'shop_route_permit',
  'expeditionPrep3',
  'routePermit',
  'v2050-menu-content-screen',
  'v2050-fishing-system-screen',
  'v2050-identical-dock-nav',
]) has(main, token, `main token ${token}`);

for (const token of [
  'v2.0.50 Content expansion / asset polish',
  '--v2050-aqua-border',
  '.v2050-expedition-board',
  '.v2050-expedition-card',
  '.v2050-expedition-grid',
  '.v2050-shop-list .shop-card.owned',
  '.bottom-nav.v2050-identical-dock-nav',
  '.v2050-cast-button',
  '.v2050-reel-panel',
]) has(css, token, `css token ${token}`);

for (const token of [
  'V2050_HIDDEN_DECORATION_KEYS',
  "dataset.v2050ContentExpansionAssetPolish = 'calmer-assets-island-expansion-routes'",
]) has(world, token, `world token ${token}`);

for (const forbidden of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  must(!lock.includes(forbidden), `package-lock contains forbidden registry token ${forbidden}`);
}
const rootMarkdown = fs.readdirSync('.').filter((name) => name.toLowerCase().endsWith('.md'));
must(rootMarkdown.length === 1 && rootMarkdown[0] === 'README.md', 'root must contain README.md only');
const forbiddenNotes = fs.readdirSync('.', { recursive: true }).filter((name) => /_NOTES\.md$/i.test(String(name)));
must(forbiddenNotes.length === 0, 'must not create *_NOTES.md files');
console.log('[AquaFantasia] v2.0.50 content expansion / asset polish validation passed.');
