import { readFileSync, existsSync, readdirSync } from 'node:fs';

const root = process.cwd();
const read = (file) => readFileSync(`${root}/${file}`, 'utf8');
const fail = (message) => { throw new Error(message); };
const has = (file, token, message) => { if (!read(file).includes(token)) fail(message || `${file} missing token ${token}`); };

const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '2.0.25') fail(`package version mismatch: ${pkg.version}`);
if (!pkg.scripts.validate.includes('check-v2025-persistent-regression-guard')) fail('validate script does not use v2.0.25 persistent checker');
if (pkg.scripts.validate.includes('check-v2024-fishing-menu-content-repair.mjs')) fail('validate must not be locked to old exact-version v2.0.24 checker');
if (!pkg.scripts['ci:install']?.includes('--registry=https://registry.npmjs.org/')) fail('ci:install must force public npm registry');

has('src/data.ts', "APP_VERSION = '2.0.25'", 'APP_VERSION is not 2.0.25');
has('src/data.ts', 'aqua-fantasia-v2.0.25-persistent-regression-guard', 'CACHE_NAME is not v2.0.25');
has('public/sw.js', 'aqua-fantasia-v2.0.25-persistent-regression-guard', 'service worker cache is not v2.0.25');
has('public/offline.html', 'v2.0.25', 'offline page version badge mismatch');
has('README.md', '# AquaFantasia v2.0.25', 'README title is not v2.0.25');
has('README.md', '## v2.0.25 변경사항', 'README v2.0.25 section missing');
has('README.md', '특정 버전에서만 먹는 CSS', 'README must document exact-version CSS regression cause');

const lock = read('package-lock.json');
for (const token of ['packages.applied-caas', 'applied-caas-gateway', 'internal.api.openai', '10.192.']) {
  if (lock.includes(token)) fail(`package-lock contains forbidden internal registry token: ${token}`);
}
has('.npmrc', 'registry=https://registry.npmjs.org/', '.npmrc must force public npm registry');

const main = read('src/main.ts');
for (const token of [
  "dataset.regressionGuard = 'v2025-persistent-ui-guard'",
  "dataset.startScreenGuard = 'v2025-persistent-start-layout'",
  "dataset.menuDockGuard = 'v2025-dock-same-every-screen'",
  "dataset.assetMegaPatch = 'v2025-premium-asset-mega-pass'",
  'applyStartLoginLayoutGuard(shell)',
  'private applyStartLoginLayoutGuard(shell: HTMLElement): void',
  'v2025-keep-button',
  'v2025-server-button',
  'right-bottom-wing-v2016',
]) {
  if (!main.includes(token)) fail(`main v2.0.25 token missing: ${token}`);
}
if (main.includes('클릭해서 정보 보기')) fail('profile HUD still contains unwanted 정보 text');

const css = read('src/styles.css');
for (const token of [
  'v2.0.25 Persistent regression guard mega patch',
  'Root cause: several earlier hotfixes were scoped to html[data-version="2.0.xx"]',
  'html[data-start-screen-guard="v2025-persistent-start-layout"] .start-art-screen',
  'html[data-menu-dock-guard="v2025-dock-same-every-screen"] body[data-screen="fishing"] .bottom-nav.v2016-safe-dock-nav',
  'html[data-regression-guard="v2025-persistent-ui-guard"] body[data-screen="fishing"] .reel-panel.v205-reel-panel',
  'html[data-regression-guard="v2025-persistent-ui-guard"] .runtime-menu-screen.v2024-menu-content-repair-screen .runtime-content > *',
  '/assets/v2025/ui/inventory_page_bg_aqua_premium_sd2026.png',
  '/assets/v2025/ui/quest_page_bg_royal_premium_sd2026.png',
  '/assets/v2025/ui/worldmap_page_bg_coral_premium_sd2026.png',
  '/assets/v2025/ui/toast_banner_aqua_premium_sd2026.png',
  '/assets/v2025/ui/bottom_nav_aqua_premium_sd2026.png',
]) {
  if (!css.includes(token)) fail(`CSS v2.0.25 token missing: ${token}`);
}
const v2025Block = css.slice(css.indexOf('v2.0.25 Persistent regression guard mega patch'));
if (v2025Block.includes('html[data-version="2.0.25"] .start-art-screen .hit-keep')) fail('start keep guard must not be scoped only to data-version=2.0.25');
if (v2025Block.includes('html[data-version="2.0.25"] body[data-screen="fishing"] .bottom-nav')) fail('fishing dock guard must not be scoped only to data-version=2.0.25');

const world = read('src/villageWorld.ts');
for (const token of [
  "west: 'west'",
  "east: 'east'",
  'actor.label.scale.set(1, 1)',
  './assets/v2023/characters/player_${direction}.png',
  './assets/v2025/props/harbor_beach_bench_source_02_512.png',
  './assets/v2025/props/harbor_beach_quest_board_large_source_03_512.png',
  'v2.0.25: premium mega pass. Small nonblocking detail clusters only',
]) {
  if (!world.includes(token)) fail(`world v2.0.25 token missing: ${token}`);
}
for (const token of ["west: 'east'", "east: 'west'", 'aquafantasia_first_village_town_square_9x16.png']) {
  if (world.includes(token) || main.includes(token)) fail(`stale forbidden token remains: ${token}`);
}

const requiredAssets = [
  'public/assets/v2025/ui/panel_large_aqua_premium_sd2026.png',
  'public/assets/v2025/ui/bottom_nav_aqua_premium_sd2026.png',
  'public/assets/v2025/ui/toast_banner_aqua_premium_sd2026.png',
  'public/assets/v2025/ui/inventory_page_bg_aqua_premium_sd2026.png',
  'public/assets/v2025/ui/quest_page_bg_royal_premium_sd2026.png',
  'public/assets/v2025/ui/worldmap_page_bg_coral_premium_sd2026.png',
  'public/assets/v2025/ui/fishing_header_emerald_premium_sd2026.png',
  'public/assets/v2025/ui/build_card_deep_premium_sd2026.png',
  'public/assets/v2025/props/harbor_beach_bench_source_02_512.png',
  'public/assets/v2025/props/harbor_beach_dock_platform_source_02_512.png',
  'public/assets/v2025/props/harbor_beach_quest_board_large_source_03_512.png',
];
const sw = read('public/sw.js');
for (const file of requiredAssets) {
  if (!existsSync(`${root}/${file}`)) fail(`Missing required v2.0.25 asset: ${file}`);
  const cachePath = file.replace('public/', './');
  if (!sw.includes(cachePath)) fail(`service worker must cache ${file}`);
}
if (readdirSync(root).some((name) => name.endsWith('_NOTES.md'))) fail('Unexpected NOTES md in project root');
console.log('[AquaFantasia] v2.0.25 persistent regression guard validation passed.');
