import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => { console.error(`[v2044-fishing-shop-village-audit] ${message}`); process.exit(1); };
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

must(pkg.version === '2.0.44', 'package.json version must be 2.0.44');
has(data, "APP_VERSION = '2.0.44'", 'APP_VERSION 2.0.44');
has(data, 'aqua-fantasia-v2.0.44-fishing-shop-village-audit', 'data cache v2.0.44');
has(sw, 'aqua-fantasia-v2.0.44-fishing-shop-village-audit', 'sw cache v2.0.44');
has(offline, 'v2.0.44', 'offline badge v2.0.44');
has(readme, '# AquaFantasia v2.0.44', 'README title v2.0.44');
has(readme, '## v2.0.44', 'README v2.0.44 changelog');

for (const token of [
  "dataset.v2044FishingShopVillageAudit = 'v2044-fishing-shop-village-audit'",
  'Aqua Fantasia 접속 중',
  'this.villageWorld?.setPlayerName(next)',
  'shop_free_',
  '무료 보상은 하루 1번',
  'v2044-identical-dock-nav',
  "nav.dataset.v2044DockGuard = 'v2044-fishing-safe-area-dock'",
  'v2044-fishing-playable-screen',
  'v2044-reel-panel',
  'v2044-result-card',
  'data-v2044-interior-move',
  'v2044-shop-summary',
]) has(main, token, `main token ${token}`);

for (const token of [
  'setPlayerName(name: string)',
  'this.worldPlayerName()',
  'movingBuildingId',
  'beginMoveBuilding',
  'tryMoveBuilding',
  'tileBelongsToBuilding',
  'data-v2044-build-move-placement',
  'v2044-interior-open',
  'clipped edge object audit',
]) has(world, token, `world token ${token}`);
must(!world.includes("this.createActor('player', 'player', '나'"), 'player label must not be hard-coded to 나');

for (const token of [
  'v2.0.44 Fishing/shop/village audit',
  '--v2044-dock-bottom',
  '.bottom-nav.v2044-identical-dock-nav',
  'body[data-screen="fishing"] .bottom-nav.v2044-identical-dock-nav',
  '.village-world-screen.v2044-village-ui-screen .v2-world-controls',
  '.v2044-shop-summary',
  '.v2044-building-move-active',
  '#toast-root',
]) has(css, token, `css token ${token}`);

for (const forbidden of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  must(!lock.includes(forbidden), `package-lock contains forbidden registry token ${forbidden}`);
}
const rootMarkdown = fs.readdirSync('.').filter((name) => name.toLowerCase().endsWith('.md'));
must(rootMarkdown.length === 1 && rootMarkdown[0] === 'README.md', 'root must contain README.md only');
const forbiddenNotes = fs.readdirSync('.', { recursive: true }).filter((name) => /_NOTES\.md$/i.test(String(name)));
must(forbiddenNotes.length === 0, 'must not create *_NOTES.md files');
console.log('[AquaFantasia] v2.0.44 fishing/shop/village audit validation passed.');
