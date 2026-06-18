import { readFileSync, existsSync, readdirSync } from 'node:fs';

const root = process.cwd();
const read = (path) => readFileSync(`${root}/${path}`, 'utf8');
const fail = (message) => { throw new Error(message); };
const has = (file, token, message) => { if (!read(file).includes(token)) fail(message || `${file} missing token ${token}`); };

const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '2.0.23') fail(`package version mismatch: ${pkg.version}`);
if (!pkg.scripts.validate.includes('check-v2023-premium-matched-assets')) fail('validate script does not use v2.0.23 checker');
if (!pkg.scripts['ci:install']?.includes('--registry=https://registry.npmjs.org/')) fail('ci:install must force npmjs registry');
if (!pkg.scripts['ci:registry:check']?.includes('check-npm-registry-access')) fail('ci:registry:check script missing');

has('src/data.ts', "APP_VERSION = '2.0.23'", 'APP_VERSION is not 2.0.23');
has('src/data.ts', 'aqua-fantasia-v2.0.23-premium-matched-assets', 'CACHE_NAME is not v2.0.23');
has('public/sw.js', 'aqua-fantasia-v2.0.23-premium-matched-assets', 'service worker cache is not v2.0.23');
has('public/offline.html', 'v2.0.23', 'offline page version badge mismatch');
has('README.md', '# AquaFantasia v2.0.23', 'README title is not v2.0.23');
has('README.md', '## v2.0.23 변경사항', 'README v2.0.23 section missing');
has('README.md', 'EAI_AGAIN', 'README must keep registry DNS/network diagnosis');

const lock = read('package-lock.json');
for (const token of ['packages.applied-caas', 'applied-caas-gateway', 'internal.api.openai', '10.192.']) {
  if (lock.includes(token)) fail(`package-lock still contains forbidden internal registry token: ${token}`);
}
has('package-lock.json', 'https://registry.npmjs.org/@firebase/database-compat/-/database-compat-2.0.11.tgz', 'firebase database-compat must resolve to public npm registry');
has('.npmrc', 'registry=https://registry.npmjs.org/', '.npmrc must force public npm registry');

const workflow = read('.github/workflows/pages.yml');
for (const token of [
  'name: validate-and-deploy',
  'npm config set registry https://registry.npmjs.org/',
  'Guard package-lock registry',
  'NPM registry diagnostics',
  'npm run ci:registry:check',
  'npm run ci:install 2>&1 | tee npm-install.log',
  'packages\\.applied-caas|applied-caas-gateway|10\\.192\\.',
  'npm run validate',
  'npm run typecheck',
  'npm run build',
]) {
  if (!workflow.includes(token)) fail(`workflow missing required token: ${token}`);
}

const main = read('src/main.ts');
for (const token of [
  "dataset.uiFix = 'v2022-hud-fishing-ai-polish'",
  "dataset.premiumAssets = 'v2023-premium-matched-assets'",
  'v2023-premium-menu-screen',
  'v2023-premium-village-screen',
  'v2023-premium-fishing-screen',
  'worldMapPremiumBg',
  'v2023-world-map-bg',
  'right-bottom-wing-v2016',
  'v2021-bait-aware-cast',
]) {
  if (!main.includes(token)) fail(`main v2.0.23 token missing: ${token}`);
}
if ((main.match(/const safe = this\.tension >= zone\.left && this\.tension <= zone\.right;/g) || []).length !== 2) fail('expected exactly one safe const in pixi tick and one in fallback tick');
if (main.includes('aquafantasia_first_village_town_square_9x16.png')) fail('old village art background is still mounted in HTML');

const world = read('src/villageWorld.ts');
for (const token of [
  "west: 'west'",
  "east: 'east'",
  "north: 'north'",
  "south: 'south'",
  'actor.label.scale.set(1, 1)',
  './assets/v2023/characters/player_south.png',
  './assets/v2023/characters/player_${direction}.png',
  'BUILD_PREVIEW_TEXTURES',
  'createBuildPreviewTileSprite',
  './assets/v2023/build/preview_valid_tile.png',
  './assets/v2023/build/preview_invalid_tile.png',
  './assets/v2023/tiles/grass_tile_0.png',
  './assets/v2023/props/bench.png',
  'v2.0.22: lightweight NPC reservation AI',
  'v2.0.23: premium matched harbor/beach props',
]) {
  if (!world.includes(token)) fail(`world v2.0.23 token missing: ${token}`);
}
for (const token of [
  "west: 'east'",
  "east: 'west'",
  "north: 'south'",
  "south: 'north'",
  "{ movement: 'west', dx: -1, dy: 0, texture: 'east' }",
  "{ movement: 'east', dx: 1, dy: 0, texture: 'west' }",
]) {
  if (world.includes(token)) fail(`opposite direction mapping must not remain: ${token}`);
}

const css = read('src/styles.css');
for (const token of [
  'v2.0.23 premium matched asset pass',
  'data-premium-assets="v2023-premium-matched-assets"',
  '/assets/v2023/ui/inventory_page_bg.png',
  '/assets/v2023/ui/quest_page_bg.png',
  '/assets/v2023/ui/worldmap_page_bg.png',
  '/assets/v2023/ui/build_page_bg.png',
  '/assets/v2023/ui/toast_banner_aqua.png',
  '.v2023-world-map-bg',
]) {
  if (!css.includes(token)) fail(`CSS v2.0.23 token missing: ${token}`);
}
if (css.includes('body[data-screen="fishing"] .bottom-nav.v2016-safe-dock-nav,\nhtml[data-version="2.0.22"][data-fishing-polish="v2019-fishing-stability-polish"] body[data-screen="fishing"] .bottom-nav.v208-right-dock-nav {\n  display: none !important;')) fail('fishing dock must not be hidden');

for (const file of [
  'public/assets/v2023/characters/player_west.png',
  'public/assets/v2023/characters/player_east.png',
  'public/assets/v2023/build/preview_valid_tile.png',
  'public/assets/v2023/build/preview_invalid_tile.png',
  'public/assets/v2023/ui/inventory_page_bg.png',
  'public/assets/v2023/ui/quest_page_bg.png',
  'public/assets/v2023/ui/worldmap_page_bg.png',
  'public/assets/v2023/ui/build_page_bg.png',
  'public/assets/v2023/props/bench.png',
  'public/assets/v2023/props/dock_platform.png',
  'public/assets/v2023/tiles/grass_tile_0.png',
  'public/assets/v2023/worldmap/tropical_island_ui_safe.png',
]) {
  if (!existsSync(`${root}/${file}`)) fail(`Missing required v2.0.23 asset: ${file}`);
  has('public/sw.js', file.replace('public/', './'), `service worker must cache ${file}`);
}

if (readdirSync(root).some((name) => name.endsWith('_NOTES.md'))) fail('Unexpected NOTES md in project root');
console.log('[AquaFantasia] v2.0.23 premium matched assets validation passed.');
