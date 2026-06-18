import { readFileSync, existsSync, readdirSync } from 'node:fs';

const root = process.cwd();
const read = (path) => readFileSync(`${root}/${path}`, 'utf8');
const fail = (message) => { throw new Error(message); };
const has = (file, token, message) => { if (!read(file).includes(token)) fail(message || `${file} missing token ${token}`); };

const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '2.0.18') fail(`package version mismatch: ${pkg.version}`);
if (!pkg.scripts.validate.includes('check-v2018-build-asset-polish')) fail('validate script does not use v2.0.18 checker');
if (!pkg.scripts['ci:install']?.includes('--registry=https://registry.npmjs.org/')) fail('ci:install must force npmjs registry');
if (!pkg.scripts['ci:install']?.includes('--fetch-retries=5')) fail('ci:install must include retry options');

has('src/data.ts', "APP_VERSION = '2.0.18'", 'APP_VERSION is not 2.0.18');
has('src/data.ts', 'aqua-fantasia-v2.0.18-build-asset-polish', 'CACHE_NAME is not v2.0.18');
has('public/sw.js', 'aqua-fantasia-v2.0.18-build-asset-polish', 'service worker cache is not v2.0.18');
has('public/offline.html', 'v2.0.18', 'offline page version badge mismatch');
has('README.md', '# AquaFantasia v2.0.18', 'README title is not v2.0.18');
has('README.md', '## v2.0.18 변경사항', 'README v2.0.18 section missing');
has('README.md', 'validate-and-deploy', 'README must keep validate-and-deploy workflow guidance');

const lock = read('package-lock.json');
for (const token of ['packages.applied-caas', 'applied-caas-gateway', 'internal.api.openai', '10.192.']) {
  if (lock.includes(token)) fail(`package-lock still contains forbidden internal registry token: ${token}`);
}
has('package-lock.json', 'https://registry.npmjs.org/@firebase/database-compat/-/database-compat-2.0.11.tgz', 'firebase database-compat must resolve to public npm registry');
has('.npmrc', 'registry=https://registry.npmjs.org/', '.npmrc must force public npm registry');
has('.npmrc', 'fetch-retries=5', '.npmrc must include retry options');

const workflow = read('.github/workflows/pages.yml');
for (const token of [
  'name: validate-and-deploy',
  'npm config set registry https://registry.npmjs.org/',
  'Guard package-lock registry',
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
  "dataset.villagePolish = 'v2018-build-asset-polish'",
  'v2018-build-ux-screen',
  'v2018-menu-drag-screen',
  'installRuntimeVerticalDragScroll',
  'data-v2018-dragging',
  'v2018-build-help',
  'data-v2017-profile',
  'data-v2017-character-panel',
  'right-bottom-wing-v2016',
]) {
  if (!main.includes(token)) fail(`v2.0.18 main token missing: ${token}`);
}
if (main.includes('aquafantasia_first_village_town_square_9x16.png')) fail('old village art background is still mounted in HTML');
if ((main.match(/TODAY TIDE/g) || []).length > 1) fail('duplicate TODAY TIDE fallback markup returned');

const world = read('src/villageWorld.ts');
for (const token of [
  "west: 'west'",
  "east: 'east'",
  "north: 'north'",
  "south: 'south'",
  "{ movement: 'west', dx: -1, dy: 0, texture: 'west' }",
  "{ movement: 'east', dx: 1, dy: 0, texture: 'east' }",
  'if (this.selectedBuild) this.updatePreviewFromPointer(ev);',
  '건설 버튼으로 취소',
  '설치 취소',
  'const isSoftProp = b.type === \'flower\' || b.type === \'fountain\';',
  'this.occupiedTiles.add(key);',
  'if (!isSoftProp && yy < b.y + walkBlockH) this.blockedTiles.add(key);',
  'noticeBoard',
  'plazaStairs',
  'bridgeAsset',
  'actor.label.scale.set(1, 1)',
]) {
  if (!world.includes(token)) fail(`world token missing: ${token}`);
}
for (const token of [
  "west: 'east'",
  "east: 'west'",
  "north: 'south'",
  "south: 'north'",
  "{ movement: 'west', dx: -1, dy: 0, texture: 'east' }",
  "{ movement: 'east', dx: 1, dy: 0, texture: 'west' }",
  "{ movement: 'north', dx: 0, dy: -1, texture: 'south' }",
  "{ movement: 'south', dx: 0, dy: 1, texture: 'north' }",
]) {
  if (world.includes(token)) fail(`opposite direction mapping must not remain: ${token}`);
}

const css = read('src/styles.css');
for (const token of [
  'v2.0.18 Build/asset polish',
  'html[data-version="2.0.18"] .start-art-screen .hit-keep',
  'top: 78.6% !important',
  'v2018-build-ux-screen .v2-world-controls button',
  'v2018-build-help',
  'v2-build-grid',
  'touch-action: pan-y manipulation !important',
  '--v2016-dock-icon: clamp(32px',
  'v2018-menu-drag-screen',
  'data-v2018-dragging="true"',
  'overflow-y: scroll !important',
  '-webkit-text-stroke',
  '[src*="aquafantasia_first_village_town_square_9x16"]',
]) {
  if (!css.includes(token)) fail(`CSS protection token missing: ${token}`);
}

for (const file of [
  'public/assets/v2012/characters/player_south.png',
  'public/assets/v2012/characters/player_north.png',
  'public/assets/v2012/characters/player_east.png',
  'public/assets/v2012/characters/player_west.png',
  'public/assets/v2012/characters/player_northeast.png',
  'public/assets/v2012/characters/player_northwest.png',
  'public/assets/v2012/characters/player_southeast.png',
  'public/assets/v2012/characters/player_southwest.png',
  'public/assets/v209/props/notice_board.png',
  'public/assets/v209/props/plaza_stairs.png',
  'public/assets/v209/props/bridge_asset.png',
  'public/assets/v2012/props/butterfly_blue.png',
  'public/assets/v2012/props/butterfly_pink.png',
  'public/assets/v2012/props/sparkles.png',
  'public/assets/v2012/props/water_ring.png',
]) {
  if (!existsSync(`${root}/${file}`)) fail(`Missing required runtime asset: ${file}`);
}

if (readdirSync(root).some((name) => name.endsWith('_NOTES.md'))) fail('Unexpected NOTES md in project root');
console.log('[AquaFantasia] v2.0.18 build/asset polish validation passed.');
