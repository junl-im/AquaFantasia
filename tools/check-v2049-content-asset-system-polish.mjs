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

const version = String(pkg.version);
const [major, minor, patch] = version.split('.').map(Number);
must(major === 2 && minor === 0 && patch >= 49, 'package.json version must be 2.0.49 or newer');
must(/APP_VERSION = '2\.0\.(49|[5-9][0-9])'/.test(data), 'APP_VERSION must be 2.0.49 or newer');
must(/aqua-fantasia-v2\.0\.(49|[5-9][0-9])-/.test(data), 'data cache must be v2.0.49 or newer');
must(/aqua-fantasia-v2\.0\.(49|[5-9][0-9])-/.test(sw), 'sw cache must be v2.0.49 or newer');
must(/v2\.0\.(49|[5-9][0-9])/.test(offline), 'offline badge must be v2.0.49 or newer');
must(/# AquaFantasia v2\.0\.(49|[5-9][0-9])/.test(readme), 'README title must be v2.0.49 or newer');
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
