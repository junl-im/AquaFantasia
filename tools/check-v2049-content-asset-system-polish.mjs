import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => { console.error(`[v2049-content-asset-system-polish] ${message}`); process.exit(1); };
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

must(pkg.version === '2.0.49', 'package.json version must be 2.0.49');
has(data, "APP_VERSION = '2.0.49'", 'APP_VERSION 2.0.49');
has(data, 'aqua-fantasia-v2.0.49-content-asset-system-polish', 'data cache v2.0.49');
has(sw, 'aqua-fantasia-v2.0.49-content-asset-system-polish', 'sw cache v2.0.49');
has(offline, 'v2.0.49', 'offline badge v2.0.49');
has(readme, '# AquaFantasia v2.0.49', 'README title v2.0.49');
has(readme, '## v2.0.49', 'README v2.0.49 changelog');
has(pkg.scripts.validate, 'check-v2049-content-asset-system-polish.mjs', 'v2049 validate hook');

for (const token of [
  "dataset.v2049ContentAssetSystemPolish = 'v2049-content-asset-system-polish'",
  'v2049-content-village-screen',
  'v2049-growth-board',
  'villageGrowthBoardMarkup',
  'v2049-menu-content-screen',
  '마을 장식 키트',
  'villageDev500',
  'autoIncome5',
  'v2049-fishing-system-screen',
  'v2049-reel-panel',
  'v2049-hold-pad',
  'v2049-identical-dock-nav',
]) has(main, token, `main token ${token}`);

for (const token of [
  'v2.0.49 Content/asset/system polish',
  '--v2049-aqua-border',
  '.v2049-growth-board',
  '.v2049-growth-loop',
  '.v2049-income-float',
  '.v2049-shop-summary',
  '.v2049-hold-pad',
  '.bottom-nav.v2049-identical-dock-nav',
]) has(css, token, `css token ${token}`);

for (const token of [
  'V2049_HIDDEN_DECORATION_KEYS',
  "dataset.v2049ContentAssetSystem = 'clean-props-content-loop-performance'",
  'showPassiveIncomeFloat',
  '자동수익 +',
]) has(world, token, `world token ${token}`);

for (const forbidden of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  must(!lock.includes(forbidden), `package-lock contains forbidden registry token ${forbidden}`);
}
const rootMarkdown = fs.readdirSync('.').filter((name) => name.toLowerCase().endsWith('.md'));
must(rootMarkdown.length === 1 && rootMarkdown[0] === 'README.md', 'root must contain README.md only');
const forbiddenNotes = fs.readdirSync('.', { recursive: true }).filter((name) => /_NOTES\.md$/i.test(String(name)));
must(forbiddenNotes.length === 0, 'must not create *_NOTES.md files');
console.log('[AquaFantasia] v2.0.49 content/asset/system polish validation passed.');
