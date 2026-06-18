import { readFileSync, existsSync, readdirSync } from 'node:fs';

const root = process.cwd();
const read = (path) => readFileSync(`${root}/${path}`, 'utf8');
const fail = (message) => { throw new Error(message); };
const has = (file, token, message) => { if (!read(file).includes(token)) fail(message || `${file} missing token ${token}`); };

const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '2.0.20') fail(`package version mismatch: ${pkg.version}`);
if (!pkg.scripts.validate.includes('check-v2020-asset-refinement-polish')) fail('validate script does not use v2.0.20 checker');
if (!pkg.scripts['ci:install']?.includes('--registry=https://registry.npmjs.org/')) fail('ci:install must force npmjs registry');
if (!pkg.scripts['ci:registry:check']?.includes('check-npm-registry-access')) fail('ci:registry:check script missing');

has('src/data.ts', "APP_VERSION = '2.0.20'", 'APP_VERSION is not 2.0.20');
has('src/data.ts', 'aqua-fantasia-v2.0.20-asset-refinement-polish', 'CACHE_NAME is not v2.0.20');
has('public/sw.js', 'aqua-fantasia-v2.0.20-asset-refinement-polish', 'service worker cache is not v2.0.20');
has('public/offline.html', 'v2.0.20', 'offline page version badge mismatch');
has('README.md', '# AquaFantasia v2.0.20', 'README title is not v2.0.20');
has('README.md', '## v2.0.20 변경사항', 'README v2.0.20 section missing');
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
  "dataset.fishingPolish = 'v2019-fishing-stability-polish'",
  "dataset.assetPolish = 'v2020-asset-refinement-polish'",
  'v2020-menu-asset-screen',
  'v2020-village-asset-screen',
  'v2020-fishing-asset-screen',
  'fishingWaveSplash',
  'fishingCrystalSparkle',
  'fishingCommonShadow',
  'uiPanelAqua',
  'uiCardAqua',
  'uiButtonSmallAqua',
  'uiPearlFlash',
  'v2020-fishing-prop v2020-wave-splash',
  'v2020-fishing-prop v2020-crystal-sparkle',
  'v2020-menu-deco v2020-menu-panel-deco',
  'v2020-reel-panel-frame',
  'v2020-cast-button',
  'private setFishingPhase(phase: FishingState)',
  'this.bobber.visible = false;',
  'this.bobber.visible = true;',
  'right-bottom-wing-v2016',
]) {
  if (!main.includes(token)) fail(`main v2.0.20 token missing: ${token}`);
}
if ((main.match(/const safe = this\.tension >= zone\.left && this\.tension <= zone\.right;/g) || []).length !== 2) fail('expected exactly one safe const in pixi tick and one in fallback tick');
if (main.includes('aquafantasia_first_village_town_square_9x16.png')) fail('old village art background is still mounted in HTML');

const world = read('src/villageWorld.ts');
for (const token of [
  "west: 'west'",
  "east: 'east'",
  "north: 'north'",
  "south: 'south'",
  "{ movement: 'west', dx: -1, dy: 0, texture: 'west' }",
  "{ movement: 'east', dx: 1, dy: 0, texture: 'east' }",
  'actor.label.scale.set(1, 1)',
  'v2.0.20: refine existing SD ocean fantasy props',
  "{ kind: 'waterRing', x: 28, y: 36",
  "{ kind: 'goldLantern', x: 26, y: 18",
  "{ kind: 'crystal', x: 22, y: 26",
]) {
  if (!world.includes(token)) fail(`world v2.0.20 token missing: ${token}`);
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
  'v2.0.20 Asset refinement polish',
  'data-asset-polish="v2020-asset-refinement-polish"',
  'data-fishing-polish="v2019-fishing-stability-polish"',
  'html[data-version="2.0.20"] .start-art-screen .hit-keep',
  '.fishing-stage.fishing-phase-idle .fallback-bobber',
  '.v2019-fishing-prop',
  '.v2020-fishing-prop',
  '.v2020-wave-splash',
  '.v2020-crystal-sparkle',
  '.v2020-shadow-common',
  '.v2020-pearl-flash',
  '.v2020-cast-button',
  '.v2020-reel-panel-frame',
  '.v2020-menu-deco',
  '.v2020-menu-panel-deco',
  'button_wide_aqua_normal.png',
  'panel_medium_aqua.png',
  'pearl_flash.png',
  'max-height: min(45dvh, 322px)',
  'height: clamp(116px, 18dvh, 142px)',
]) {
  if (!css.includes(token)) fail(`CSS v2.0.20 token missing: ${token}`);
}

for (const file of [
  'public/assets/v205/fishing/wave_splash.png',
  'public/assets/v205/fishing/crystal_sparkle.png',
  'public/assets/v205/fishing/fish_shadow_common.png',
  'public/assets/v3d_underwater/ui/frames/panel_medium_aqua.png',
  'public/assets/v3d_underwater/ui/frames/card_aqua.png',
  'public/assets/v3d_underwater/ui/frames/hud_capsule_aqua.png',
  'public/assets/v3d_underwater/ui/frames/progress_frame_aqua.png',
  'public/assets/v3d_underwater/ui/buttons/button_small_aqua_normal.png',
  'public/assets/v3d_underwater/ui/buttons/button_wide_aqua_normal.png',
  'public/assets/v3d_underwater/textures/particles/pearl_flash.png',
]) {
  if (!existsSync(`${root}/${file}`)) fail(`Missing required v2.0.20 refinement asset: ${file}`);
  has('public/sw.js', file.replace('public/', './'), `service worker must cache ${file}`);
}

if (readdirSync(root).some((name) => name.endsWith('_NOTES.md'))) fail('Unexpected NOTES md in project root');
console.log('[AquaFantasia] v2.0.20 asset refinement validation passed.');
