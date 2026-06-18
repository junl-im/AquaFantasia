import { readFileSync, existsSync, readdirSync } from 'node:fs';

const root = process.cwd();
const read = (path) => readFileSync(`${root}/${path}`, 'utf8');
const fail = (message) => { throw new Error(message); };
const has = (file, token, message) => { if (!read(file).includes(token)) fail(message || `${file} missing token ${token}`); };

const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '2.0.22') fail(`package version mismatch: ${pkg.version}`);
if (!pkg.scripts.validate.includes('check-v2022-hud-fishing-ai-polish')) fail('validate script does not use v2.0.22 checker');
if (!pkg.scripts['ci:install']?.includes('--registry=https://registry.npmjs.org/')) fail('ci:install must force npmjs registry');
if (!pkg.scripts['ci:registry:check']?.includes('check-npm-registry-access')) fail('ci:registry:check script missing');

has('src/data.ts', "APP_VERSION = '2.0.22'", 'APP_VERSION is not 2.0.22');
has('src/data.ts', 'aqua-fantasia-v2.0.22-hud-fishing-ai-polish', 'CACHE_NAME is not v2.0.22');
has('public/sw.js', 'aqua-fantasia-v2.0.22-hud-fishing-ai-polish', 'service worker cache is not v2.0.22');
has('public/offline.html', 'v2.0.22', 'offline page version badge mismatch');
has('README.md', '# AquaFantasia v2.0.22', 'README title is not v2.0.22');
has('README.md', '## v2.0.22 변경사항', 'README v2.0.22 section missing');
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
  "dataset.assetPolish = 'v2021-ui-fishing-build-polish'",
  "dataset.uiFix = 'v2022-hud-fishing-ai-polish'",
  'v2022-hud-control-screen',
  'v2022-menu-dock-screen',
  'v2022-fishing-ui-screen',
  'v2021-menu-asset-screen',
  'v2021-village-asset-screen',
  'v2021-fishing-asset-screen',
  'v2021-bait-aware-cast',
  'v2021-result-modal-frame',
  'v2021-reel-tooltip-frame',
  'target?.closest(\'.cast-button, .reel-panel, .fishing-hud, .recent-catch-strip, .fishing-loadout-strip\')',
  "if (this.state === 'idle') this.castLine();",
  'right-bottom-wing-v2016',
]) {
  if (!main.includes(token)) fail(`main v2.0.22 token missing: ${token}`);
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
  'v2.0.22: lightweight NPC reservation AI',
  'private isNpcTileReserved',
  'private trimNpcCrowdedStart',
  'desiredTile?: string',
  'pauseTimer: number',
  'this.findPath(npc.tileX, npc.tileY, target[0], target[1], npc)',
]) {
  if (!world.includes(token)) fail(`world v2.0.22 token missing: ${token}`);
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
  'v2.0.22 HUD/fishing/NPC polish',
  'data-ui-fix="v2022-hud-fishing-ai-polish"',
  '--v2022-control-w',
  '#toast-root',
  'tooltip_aqua.png',
  'hud_capsule_aqua.png',
  'button_small_aqua_normal.png',
  'body[data-screen="fishing"] .bottom-nav.v2016-safe-dock-nav',
  'display: grid !important;',
  'pulseCastSoftV2022',
  'width: min(232px, 56vw)',
  'bottom: calc(var(--v2016-dock-safe-bottom) + 8px)',
  'left: max(8px, env(safe-area-inset-left))',
  'right: max(8px, env(safe-area-inset-right))',
  'max-height: min(42dvh, 286px)',
  '.v2-build-tray',
  'max-height: min(82dvh, 720px)',
  'min-height: 76px',
]) {
  if (!css.includes(token)) fail(`CSS v2.0.22 token missing: ${token}`);
}
if (css.includes('html[data-version="2.0.22"][data-fishing-polish="v2019-fishing-stability-polish"] body[data-screen="fishing"] .bottom-nav.v2016-safe-dock-nav,\nhtml[data-version="2.0.22"][data-fishing-polish="v2019-fishing-stability-polish"] body[data-screen="fishing"] .bottom-nav.v208-right-dock-nav {\n  display: none !important;')) fail('v2.0.22 must not hide the fishing dock');

for (const file of [
  'public/assets/v3d_underwater/ui/frames/tooltip_aqua.png',
  'public/assets/v3d_underwater/ui/frames/hud_capsule_aqua.png',
  'public/assets/v3d_underwater/ui/buttons/button_small_aqua_normal.png',
  'public/assets/v3d_underwater/ui/buttons/button_pill_aqua_normal.png',
]) {
  if (!existsSync(`${root}/${file}`)) fail(`Missing required v2.0.22 asset: ${file}`);
  has('public/sw.js', file.replace('public/', './'), `service worker must cache ${file}`);
}

if (readdirSync(root).some((name) => name.endsWith('_NOTES.md'))) fail('Unexpected NOTES md in project root');
console.log('[AquaFantasia] v2.0.22 HUD/fishing/NPC polish validation passed.');
