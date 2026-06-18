import { readFileSync, existsSync, readdirSync } from 'node:fs';

const root = process.cwd();
const read = (path) => readFileSync(`${root}/${path}`, 'utf8');
const fail = (message) => { throw new Error(message); };
const has = (file, token, message) => { if (!read(file).includes(token)) fail(message || `${file} missing token ${token}`); };

const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '2.0.17') fail(`package version mismatch: ${pkg.version}`);
if (!pkg.scripts.validate.includes('check-v2017-direction-ui-polish')) fail('validate script does not use v2.0.17 checker');
if (!pkg.scripts['ci:install']?.includes('--registry=https://registry.npmjs.org/')) fail('ci:install must force npmjs registry');
if (!pkg.scripts['ci:install']?.includes('--fetch-retries=5')) fail('ci:install must include retry options');

has('src/data.ts', "APP_VERSION = '2.0.17'", 'APP_VERSION is not 2.0.17');
has('src/data.ts', 'aqua-fantasia-v2.0.17-direction-ui-polish', 'CACHE_NAME is not v2.0.17');
has('public/sw.js', 'aqua-fantasia-v2.0.17-direction-ui-polish', 'service worker cache is not v2.0.17');
has('public/offline.html', 'v2.0.17', 'offline page version badge mismatch');
has('README.md', '# AquaFantasia v2.0.17', 'README title is not v2.0.17');
has('README.md', '## v2.0.17 변경사항', 'README v2.0.17 section missing');
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
  "dataset.villagePolish = 'v2017-direction-ui-polish'",
  'v2017-direction-ui-screen',
  'v2017-menu-readability-screen',
  'v2017-quest-scroll-screen',
  'data-v2017-profile',
  'data-v2017-character-panel',
  'playerLevel()',
  '마을 Lv.${this.save.village.level}',
  'right-bottom-wing-v2016',
]) {
  if (!main.includes(token)) fail(`v2.0.17 main token missing: ${token}`);
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
  'loadCriticalTextures',
  'loadDeferredTextures',
  'criticalTextureUrls',
  'CRITICAL_DECO_KINDS',
  'animateActorWalk',
  'actor.shadow.scale.set',
  'actor.label.scale.x = 1',
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
if ((world.match(/body: '낚시 의뢰, 희귀 어종 정보/g) || []).length !== 1) fail('guild interior body must appear once');

const css = read('src/styles.css');
for (const token of [
  'v2.0.17 Direction/UI polish',
  'top: 77.35% !important',
  '--v2016-dock-icon: clamp(30px',
  'v2017-direction-ui-screen .v2-world-controls button',
  'min-height: 38px !important',
  'v2017-character-panel',
  'v2017-menu-readability-screen',
  '-webkit-text-stroke',
  'v2017-quest-scroll-screen.mission-screen',
  'overflow-y: scroll !important',
  'touch-action: pan-y !important',
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
  'public/assets/v2012/props/tree_tropical.png',
  'public/assets/v2012/props/tree_palm_alt.png',
  'public/assets/v209/props/wood_sign.png',
  'public/assets/v209/props/rope_wall.png',
  'public/assets/v209/props/stone_corner.png',
  'public/assets/v209/props/stone_curve.png',
  'public/assets/v209/props/stair_wide.png',
  'public/assets/v209/props/rope_corner.png',
]) {
  if (!existsSync(`${root}/${file}`)) fail(`Missing required runtime asset: ${file}`);
}

if (readdirSync(root).some((name) => name.endsWith('_NOTES.md'))) fail('Unexpected NOTES md in project root');
console.log('[AquaFantasia] v2.0.17 direction/UI polish validation passed.');
