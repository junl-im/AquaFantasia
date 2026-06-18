import { readFileSync, existsSync, readdirSync } from 'node:fs';

const root = process.cwd();
const read = (path) => readFileSync(`${root}/${path}`, 'utf8');
const fail = (message) => { throw new Error(message); };
const has = (file, token, message) => { if (!read(file).includes(token)) fail(message || `${file} missing token ${token}`); };

const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '2.0.21') fail(`package version mismatch: ${pkg.version}`);
if (!pkg.scripts.validate.includes('check-v2021-ui-fishing-build-polish')) fail('validate script does not use v2.0.21 checker');
if (!pkg.scripts['ci:install']?.includes('--registry=https://registry.npmjs.org/')) fail('ci:install must force npmjs registry');
if (!pkg.scripts['ci:registry:check']?.includes('check-npm-registry-access')) fail('ci:registry:check script missing');

has('src/data.ts', "APP_VERSION = '2.0.21'", 'APP_VERSION is not 2.0.21');
has('src/data.ts', 'aqua-fantasia-v2.0.21-ui-fishing-build-polish', 'CACHE_NAME is not v2.0.21');
has('public/sw.js', 'aqua-fantasia-v2.0.21-ui-fishing-build-polish', 'service worker cache is not v2.0.21');
has('public/offline.html', 'v2.0.21', 'offline page version badge mismatch');
has('README.md', '# AquaFantasia v2.0.21', 'README title is not v2.0.21');
has('README.md', '## v2.0.21 변경사항', 'README v2.0.21 section missing');
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
  'v2021-menu-asset-screen',
  'v2021-village-asset-screen',
  'v2021-fishing-asset-screen',
  'uiModalAqua',
  'uiSlotSquareAqua',
  'uiTooltipAqua',
  'uiButtonPillAqua',
  'uiBubbleSoft',
  'uiGodrayStar',
  'uiPlanktonGlow',
  'uiMagicRingGold',
  'uiWarningPulse',
  'uiSurfaceFoam',
  'uiCoralBranch',
  'uiKelpLeaf',
  'v2021-menu-deco v2021-menu-bubble-soft',
  'v2021-fishing-prop v2021-surface-foam',
  'v2021-fishing-prop v2021-warning-pulse',
  'v2021-bait-aware-cast',
  'private syncCastButtonState(): void',
  'private canStartFishingCast(): boolean',
  "this.save.gear.lureStock -= 1;",
  "if (!this.canStartFishingCast()) return;",
  'target?.closest(\'.cast-button, .reel-panel, .fishing-hud, .recent-catch-strip, .fishing-loadout-strip\')',
  "if (this.state === 'idle') this.castLine();",
  "if (this.state === 'idle') this.castLineFallback();",
  'v2021-result-modal-frame',
  'v2021-reel-tooltip-frame',
  'right-bottom-wing-v2016',
]) {
  if (!main.includes(token)) fail(`main v2.0.21 token missing: ${token}`);
}
if ((main.match(/const safe = this\.tension >= zone\.left && this\.tension <= zone\.right;/g) || []).length !== 2) fail('expected exactly one safe const in pixi tick and one in fallback tick');
if (main.includes('if (this.save.gear.lureStock > 0) this.save.gear.lureStock -= 1;')) fail('old permissive lure decrement guard must not remain');
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
  'v2.0.21: extra nonblocking ambience; keep walk/build corridors open.',
  "{ kind: 'butterflyBlue', x: 10, y: 18",
  "{ kind: 'shoreFoam', x: 13, y: 36",
]) {
  if (!world.includes(token)) fail(`world v2.0.21 token missing: ${token}`);
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
  'v2.0.21 UI/fishing/build polish',
  'data-asset-polish="v2021-ui-fishing-build-polish"',
  'html[data-version="2.0.21"] .start-art-screen .hit-keep',
  '.fishing-stage.fishing-phase-idle .fallback-bobber',
  '.v2021-menu-deco',
  '.v2021-menu-bubble-soft',
  '.v2021-menu-coral-branch',
  '.v2021-menu-kelp-leaf',
  '.v2021-fishing-prop',
  '.v2021-surface-foam',
  '.v2021-godray-star',
  '.v2021-plankton-glow',
  '.v2021-warning-pulse',
  '.v2021-bait-aware-cast.no-bait',
  '.v2021-cast-pill-art',
  '.v2021-reel-tooltip-frame',
  '.v2021-result-modal-frame',
  'modal_aqua.png',
  'slot_square_aqua.png',
  'tooltip_aqua.png',
  'button_pill_aqua_normal.png',
  'max-height: min(45dvh, 322px)',
  'height: clamp(116px, 18dvh, 142px)',
]) {
  if (!css.includes(token)) fail(`CSS v2.0.21 token missing: ${token}`);
}

for (const file of [
  'public/assets/v3d_underwater/ui/frames/modal_aqua.png',
  'public/assets/v3d_underwater/ui/frames/slot_square_aqua.png',
  'public/assets/v3d_underwater/ui/frames/tooltip_aqua.png',
  'public/assets/v3d_underwater/ui/buttons/button_pill_aqua_normal.png',
  'public/assets/v3d_underwater/textures/particles/bubble_soft.png',
  'public/assets/v3d_underwater/textures/particles/godray_star.png',
  'public/assets/v3d_underwater/textures/particles/plankton_glow.png',
  'public/assets/v3d_underwater/textures/particles/magic_ring_gold.png',
  'public/assets/v3d_underwater/textures/particles/warning_pulse.png',
  'public/assets/v3d_underwater/textures/fx/surface_foam.png',
  'public/assets/v3d_underwater/textures/fx/coral_branch_card.png',
  'public/assets/v3d_underwater/textures/fx/kelp_leaf_card.png',
]) {
  if (!existsSync(`${root}/${file}`)) fail(`Missing required v2.0.21 asset: ${file}`);
  has('public/sw.js', file.replace('public/', './'), `service worker must cache ${file}`);
}

if (readdirSync(root).some((name) => name.endsWith('_NOTES.md'))) fail('Unexpected NOTES md in project root');
console.log('[AquaFantasia] v2.0.21 UI/fishing/build polish validation passed.');
