import { readFileSync, existsSync, readdirSync } from 'node:fs';

const root = process.cwd();
const read = (path) => readFileSync(`${root}/${path}`, 'utf8');
const fail = (message) => { throw new Error(message); };
const has = (file, token, message) => { if (!read(file).includes(token)) fail(message || `${file} missing token ${token}`); };

const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '2.0.24') fail(`package version mismatch: ${pkg.version}`);
if (!pkg.scripts.validate.includes('check-v2024-fishing-menu-content-repair')) fail('validate script does not use v2.0.24 checker');
if (pkg.scripts.validate.includes('check-v2023-premium-matched-assets.mjs')) fail('validate should not run old exact-version v2.0.23 checker');
if (!pkg.scripts['ci:install']?.includes('--registry=https://registry.npmjs.org/')) fail('ci:install must force npmjs registry');
if (!pkg.scripts['ci:registry:check']?.includes('check-npm-registry-access')) fail('ci:registry:check script missing');

has('src/data.ts', "APP_VERSION = '2.0.24'", 'APP_VERSION is not 2.0.24');
has('src/data.ts', 'aqua-fantasia-v2.0.24-fishing-menu-content-repair', 'CACHE_NAME is not v2.0.24');
has('public/sw.js', 'aqua-fantasia-v2.0.24-fishing-menu-content-repair', 'service worker cache is not v2.0.24');
has('public/offline.html', 'v2.0.24', 'offline page version badge mismatch');
has('README.md', '# AquaFantasia v2.0.24', 'README title is not v2.0.24');
has('README.md', '## v2.0.24 변경사항', 'README v2.0.24 section missing');
has('README.md', 'EAI_AGAIN', 'README must keep registry DNS/network diagnosis');

const lock = read('package-lock.json');
for (const token of ['packages.applied-caas', 'applied-caas-gateway', 'internal.api.openai', '10.192.']) {
  if (lock.includes(token)) fail(`package-lock still contains forbidden internal registry token: ${token}`);
}
has('package-lock.json', 'https://registry.npmjs.org/@firebase/database-compat/-/database-compat-2.0.11.tgz', 'firebase database-compat must resolve to public npm registry');
has('.npmrc', 'registry=https://registry.npmjs.org/', '.npmrc must force public npm registry');

const main = read('src/main.ts');
for (const token of [
  "dataset.uiFix = 'v2024-fishing-menu-content-repair'",
  "dataset.fishingMenuRepair = 'v2024-fishing-menu-content-repair'",
  "dataset.premiumAssets = 'v2023-premium-matched-assets'",
  'v2024-menu-content-repair-screen',
  'v2024-fishing-menu-repair-screen',
  'v2024-village-object-repair-screen',
  'right-bottom-wing-v2016',
  '플레이어 Lv.${this.playerLevel()} · 클릭해서 열기',
]) {
  if (!main.includes(token)) fail(`main v2.0.24 token missing: ${token}`);
}
if (main.includes('클릭해서 정보 보기')) fail('profile HUD still contains unwanted 정보 text');
if ((main.match(/const safe = this\.tension >= zone\.left && this\.tension <= zone\.right;/g) || []).length !== 2) fail('expected exactly one safe const in pixi tick and one in fallback tick');
if (main.includes('aquafantasia_first_village_town_square_9x16.png')) fail('old village art background is still mounted in HTML');

const world = read('src/villageWorld.ts');
for (const token of [
  "west: 'west'",
  "east: 'east'",
  'actor.label.scale.set(1, 1)',
  './assets/v2023/characters/player_${direction}.png',
  './assets/v2023/build/preview_valid_tile.png',
  './assets/v2023/props/bench.png',
  "{ kind: 'cherryTree', x: 13, y: 12, blocks: true, scale: .58 }",
  "{ kind: 'flowerTree', x: 10, y: 28, blocks: true, scale: .54 }",
  'v2.0.22: lightweight NPC reservation AI',
  'v2.0.23: premium matched harbor/beach props',
]) {
  if (!world.includes(token)) fail(`world v2.0.24 token missing: ${token}`);
}
for (const token of [
  "west: 'east'",
  "east: 'west'",
  "{ kind: 'cherryTree', x: 11, y: 10, blocks: true, scale: .82 }",
  "{ kind: 'flowerTree', x: 12, y: 27, blocks: true, scale: .76 }",
]) {
  if (world.includes(token)) fail(`stale world token must not remain: ${token}`);
}

const css = read('src/styles.css');
for (const token of [
  'v2.0.24 Fishing/menu content repair',
  'data-fishing-menu-repair="v2024-fishing-menu-content-repair"',
  'body[data-screen="fishing"] .bottom-nav.v840-bottom-nav.v2016-safe-dock-nav',
  'grid-template-columns: repeat(3, var(--v2024-dock-button))',
  'button[data-screen="village"] { grid-column: 3 !important; grid-row: 1 !important; }',
  'body[data-screen="fishing"] .recent-catch-strip',
  'body[data-screen="fishing"] .fishing-guide-card',
  'body[data-screen="fishing"] .reel-panel.v205-reel-panel',
  '#toast-root',
  '.v2017-character-head > div > span { display: none',
  '.runtime-menu-screen.v2024-menu-content-repair-screen .runtime-content > *',
  '/assets/v2023/ui/inventory_page_bg.png',
  '/assets/v2023/ui/quest_page_bg.png',
  '/assets/v2023/ui/worldmap_page_bg.png',
]) {
  if (!css.includes(token)) fail(`CSS v2.0.24 token missing: ${token}`);
}
if (css.includes('html[data-version="2.0.24"] body[data-screen="fishing"] .bottom-nav') && css.includes('display: none !important;') && css.includes('data-version="2.0.24"][data-fishing-polish')) fail('v2.0.24 must not hide the fishing dock');

const sw = read('public/sw.js');
for (const file of [
  'public/assets/v2023/characters/player_west.png',
  'public/assets/v2023/characters/player_east.png',
  'public/assets/v2023/build/preview_valid_tile.png',
  'public/assets/v2023/build/preview_invalid_tile.png',
  'public/assets/v2023/ui/inventory_page_bg.png',
  'public/assets/v2023/ui/quest_page_bg.png',
  'public/assets/v2023/ui/worldmap_page_bg.png',
  'public/assets/v2023/ui/toast_banner_aqua.png',
  'public/assets/v2023/props/bench.png',
  'public/assets/v2023/props/dock_platform.png',
  'public/assets/v2023/tiles/grass_tile_0.png',
]) {
  if (!existsSync(`${root}/${file}`)) fail(`Missing required v2.0.24 asset: ${file}`);
  const cachePath = file.replace('public/', './');
  if (!sw.includes(cachePath)) fail(`service worker must cache ${file}`);
}

if (readdirSync(root).some((name) => name.endsWith('_NOTES.md'))) fail('Unexpected NOTES md in project root');
console.log('[AquaFantasia] v2.0.24 fishing/menu content repair validation passed.');
