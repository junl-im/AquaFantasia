import { readFileSync, existsSync } from 'node:fs';
const root = process.cwd();
const read = (file) => readFileSync(`${root}/${file}`, 'utf8');
const fail = (message) => { throw new Error(message); };
const pkg = JSON.parse(read('package.json'));
const version = '2.0.27';
if (pkg.version !== version) fail(`package version mismatch: ${pkg.version}`);
if (!pkg.scripts.validate.includes('check-v2027-root-cause-ui-repair')) fail('validate script must include v2.0.27 root-cause checker');
for (const [file, token] of [
  ['src/data.ts', "APP_VERSION = '2.0.27'"],
  ['src/data.ts', 'aqua-fantasia-v2.0.27-ui-root-cause-repair'],
  ['public/sw.js', 'aqua-fantasia-v2.0.27-ui-root-cause-repair'],
  ['public/offline.html', 'v2.0.27'],
  ['README.md', '# AquaFantasia v2.0.27'],
  ['README.md', '## v2.0.27 변경사항'],
]) {
  if (!read(file).includes(token)) fail(`${file} missing ${token}`);
}
const main = read('src/main.ts');
for (const token of [
  "dataset.uiRootCauseRepair = 'v2027-ui-root-cause-repair'",
  "dataset.aquaToneReset = 'v2027-aqua-tone-reset'",
  'v2027-aqua-dock-nav',
  "nav.dataset.dockGuard = 'v2027-home-fishing-identical-dock'",
  'data-village-shop',
  'v2027-village-loading',
  'v2027-menu-content-repair-screen',
  'v2027-fishing-root-repair-screen',
]) if (!main.includes(token)) fail(`src/main.ts missing ${token}`);
if (main.includes('v840-bottom-nav')) fail('mountBottomNav must not carry stale v840-bottom-nav class');
if (main.includes('v208-right-dock-nav v2010-right-dock-nav')) fail('mountBottomNav still carries old right dock class chain');
const css = read('src/styles.css');
for (const token of [
  'v2.0.27 Root-cause UI repair pass',
  'html[data-ui-root-cause-repair="v2027-ui-root-cause-repair"] .bottom-nav.v2027-aqua-dock-nav',
  'color: #ffffff !important;',
  'body[data-screen="fishing"] .recent-catch-strip',
  'bottom: calc(var(--v2027-dock-safe) + 58px)',
  '.runtime-menu-screen.v2027-menu-content-repair-screen .runtime-content',
  '.v2-build-tray {',
  'max-height: min(84dvh, 760px)',
  '#toast-root .toast',
  '.v2027-village-loading',
]) if (!css.includes(token)) fail(`src/styles.css missing ${token}`);
const v2027 = css.slice(css.indexOf('v2.0.27 Root-cause UI repair pass'));
if (v2027.includes('html[data-version="2.0.27"]')) fail('v2.0.27 guard must not be scoped to exact data-version');
if (!v2027.includes('background: linear-gradient(145deg, rgba(249,255,255,.95), rgba(119,226,238,.66))')) fail('menu content must use simple aqua tone instead of full-page premium frames');
const world = read('src/villageWorld.ts');
for (const token of [
  'updateBuildPreviewAtTile(previewX, previewY)',
  'private updateBuildPreviewAtTile(x: number, y: number): void',
  "baseNpcs.push(['tourist', '관광객', 17, 23",
  'west: \'west\'',
  'east: \'east\'',
]) if (!world.includes(token)) fail(`src/villageWorld.ts missing ${token}`);
for (const asset of [
  'public/assets/v92/icons/shop.png',
  'public/assets/v2025/ui/top_status_aqua_premium_sd2026.png',
  'public/assets/v2023/build/preview_valid_tile.png',
  'public/assets/v2023/build/preview_invalid_tile.png',
]) if (!existsSync(`${root}/${asset}`)) fail(`missing required asset ${asset}`);
const lock = read('package-lock.json');
for (const token of ['packages.applied-caas', 'applied-caas-gateway', 'internal.api.openai', '10.192.']) if (lock.includes(token)) fail(`package-lock contains forbidden token ${token}`);
console.log('[AquaFantasia] v2.0.27 root-cause UI repair validation passed.');
