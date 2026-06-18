import { readFileSync, existsSync, readdirSync } from 'node:fs';

const root = process.cwd();
const read = (path) => readFileSync(`${root}/${path}`, 'utf8');
const fail = (message) => { throw new Error(message); };
const has = (file, token, message) => { if (!read(file).includes(token)) fail(message || `${file} missing token ${token}`); };

const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '2.0.19') fail(`package version mismatch: ${pkg.version}`);
if (!pkg.scripts.validate.includes('check-v2019-fishing-stability-polish')) fail('validate script does not use v2.0.19 checker');
if (!pkg.scripts['ci:install']?.includes('--registry=https://registry.npmjs.org/')) fail('ci:install must force npmjs registry');
if (!pkg.scripts['ci:registry:check']?.includes('check-npm-registry-access')) fail('ci:registry:check script missing');

has('src/data.ts', "APP_VERSION = '2.0.19'", 'APP_VERSION is not 2.0.19');
has('src/data.ts', 'aqua-fantasia-v2.0.19-fishing-stability-polish', 'CACHE_NAME is not v2.0.19');
has('public/sw.js', 'aqua-fantasia-v2.0.19-fishing-stability-polish', 'service worker cache is not v2.0.19');
has('public/offline.html', 'v2.0.19', 'offline page version badge mismatch');
has('README.md', '# AquaFantasia v2.0.19', 'README title is not v2.0.19');
has('README.md', '## v2.0.19 변경사항', 'README v2.0.19 section missing');
has('README.md', 'EAI_AGAIN', 'README must document registry DNS/network diagnosis');

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
has('tools/check-npm-registry-access.mjs', 'registry.npmjs.org', 'registry diagnostic tool missing npmjs host');
has('tools/check-npm-registry-access.mjs', 'DNS/network/proxy access', 'registry diagnostic must explain network class');

const main = read('src/main.ts');
for (const token of [
  "dataset.fishingPolish = 'v2019-fishing-stability-polish'",
  'v2019-fishing-stability-screen',
  'fishingAmbientRing',
  'fishingAmbientFoam',
  'fishingAmbientShadow',
  'fishingAmbientSplash',
  'v2019-fishing-prop v2019-water-ring',
  'private setFishingPhase(phase: FishingState)',
  "this.setFishingPhase('idle')",
  "this.setFishingPhase('casting')",
  "this.setFishingPhase('waiting')",
  "this.setFishingPhase('bite')",
  "this.setFishingPhase('reeling')",
  'this.setFishingPhase(this.state)',
  'this.bobber.visible = false;',
  'this.bobber.visible = true;',
  'right-bottom-wing-v2016',
]) {
  if (!main.includes(token)) fail(`main v2.0.19 token missing: ${token}`);
}
if ((main.match(/const safe = this\.tension >= zone\.left && this\.tension <= zone\.right;/g) || []).length !== 2) fail('expected exactly one safe const in pixi tick and one in fallback tick');
if (main.includes('const safe = this.tension >= zone.left && this.tension <= zone.right;\n    const safe = this.tension >= zone.left && this.tension <= zone.right;')) fail('duplicate safe const still remains');
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
  'noticeBoard',
  'plazaStairs',
  'bridgeAsset',
]) {
  if (!world.includes(token)) fail(`world protection token missing: ${token}`);
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
  'v2.0.19 Fishing stability polish',
  'data-fishing-polish="v2019-fishing-stability-polish"',
  '.fishing-stage.fishing-phase-idle .fallback-bobber',
  '.fishing-stage.fishing-phase-reeling .fallback-bobber',
  '.v2019-fishing-prop',
  '.v2019-water-ring',
  '.v2019-shore-foam',
  '.v2019-fish-shadow',
  '.v2019-splash-ready',
  '.fishing-screen.fishing-phase-reeling .recent-catch-strip',
  '.reel-panel.hidden',
  'max-height: min(45dvh, 322px)',
  'height: clamp(116px, 18dvh, 142px)',
]) {
  if (!css.includes(token)) fail(`CSS v2.0.19 token missing: ${token}`);
}

for (const file of [
  'public/assets/v2012/props/water_ring.png',
  'public/assets/v2012/props/shore_foam.png',
  'public/assets/v2012/props/fish_shadow_mid.png',
  'public/assets/v2012/props/big_splash.png',
  'public/assets/v205/fishing/gauge_vertical.png',
  'public/assets/v205/fishing/gauge_horizontal.png',
  'public/assets/v205/fishing/resistance_bar.png',
]) {
  if (!existsSync(`${root}/${file}`)) fail(`Missing required fishing stability asset: ${file}`);
}
has('public/sw.js', './assets/v2012/props/fish_shadow_mid.png', 'service worker must cache fish shadow mid');

if (readdirSync(root).some((name) => name.endsWith('_NOTES.md'))) fail('Unexpected NOTES md in project root');
console.log('[AquaFantasia] v2.0.19 fishing stability validation passed.');
