import { readFileSync, existsSync } from 'node:fs';

const root = process.cwd();
const read = (file) => readFileSync(`${root}/${file}`, 'utf8');
const fail = (message) => { throw new Error(message); };
const pkg = JSON.parse(read('package.json'));
const version = '2.0.26';
if (pkg.version !== version) fail(`package version mismatch: ${pkg.version}`);
if (!pkg.scripts.validate.includes('check-v2026-wide-stability-guard')) fail('validate script must include v2.0.26 wide stability checker');

const data = read('src/data.ts');
const sw = read('public/sw.js');
const main = read('src/main.ts');
const css = read('src/styles.css');
const world = read('src/villageWorld.ts');
const readme = read('README.md');

for (const [file, text, token] of [
  ['src/data.ts', data, "APP_VERSION = '2.0.26'"],
  ['src/data.ts', data, 'aqua-fantasia-v2.0.26-wide-stability-guard'],
  ['public/sw.js', sw, 'aqua-fantasia-v2.0.26-wide-stability-guard'],
  ['README.md', readme, '# AquaFantasia v2.0.26'],
  ['README.md', readme, '## v2.0.26 변경사항'],
]) {
  if (!text.includes(token)) fail(`${file} missing ${token}`);
}

for (const token of [
  "dataset.wideStabilityGuard = 'v2026-wide-ui-audit'",
  "dataset.assetCuration = 'v2026-curated-asset-pass'",
  'v2026-unified-dock-nav',
  "nav.dataset.dockGuard = 'v2026-home-fishing-same-dock'",
  'v2026-fishing-stability-screen',
  'v2026-menu-stability-screen',
  'v2026-wide-stability-screen',
  'v2026-stable-cast-button',
  'v2026-page-health-panel',
]) {
  if (!main.includes(token)) fail(`src/main.ts missing v2.0.26 token: ${token}`);
}

for (const token of [
  'v2.0.26 Wide stability guard',
  'html[data-wide-stability-guard="v2026-wide-ui-audit"] .start-art-screen .hit-keep.v2025-keep-button',
  'html[data-wide-stability-guard="v2026-wide-ui-audit"] .bottom-nav.v2026-unified-dock-nav',
  'body[data-screen="fishing"] .fishing-guide-card',
  'body[data-screen="fishing"] .recent-catch-strip',
  'body[data-screen="fishing"] .reel-panel.v205-reel-panel',
  '.runtime-menu-screen.v2026-menu-stability-screen .runtime-content',
  '.v2026-page-health-panel',
  '.v2-build-tray',
  '/assets/v2025/ui/fishing_primary_button_emerald_premium_sd2026.png',
  '/assets/v2025/ui/top_status_aqua_premium_sd2026.png',
  '/assets/v2025/ui/build_header_deep_premium_sd2026.png',
]) {
  if (!css.includes(token)) fail(`src/styles.css missing v2.0.26 guard token: ${token}`);
}
const v2026Block = css.slice(css.indexOf('v2.0.26 Wide stability guard'));
if (v2026Block.includes('html[data-version="2.0.26"]')) fail('v2.0.26 guard must not use exact data-version selectors');
if (!v2026Block.includes('right: calc(var(--v2026-dock-right) + var(--v2026-dock-button) + 12px)')) fail('fishing panels must reserve right dock space');

for (const token of [
  './assets/v2025/interiors/interior_05_Building_Interior_Inn_source_crop_16_256.png',
  './assets/v2025/interiors/interior_06_Building_Interior_Fish_Market_source_crop_16_256.png',
  './assets/v2025/interiors/interior_07_Building_Interior_Fishing_Guild_source_crop_16_256.png',
  './assets/v2025/interiors/interior_08_Building_Interior_Harbor_Office_source_crop_16_256.png',
  "v2.0.26: curated premium details",
  "{ kind: 'flowerTree', x: 12, y: 27, scale: .42 }",
]) {
  if (!world.includes(token)) fail(`src/villageWorld.ts missing v2.0.26 token: ${token}`);
}

for (const asset of [
  'public/assets/v2025/ui/fishing_primary_button_emerald_premium_sd2026.png',
  'public/assets/v2025/ui/fishing_secondary_button_emerald_premium_sd2026.png',
  'public/assets/v2025/ui/top_status_aqua_premium_sd2026.png',
  'public/assets/v2025/ui/build_header_deep_premium_sd2026.png',
  'public/assets/v2025/interiors/interior_05_Building_Interior_Inn_source_crop_16_256.png',
]) {
  if (!existsSync(`${root}/${asset}`)) fail(`missing required v2.0.26 asset ${asset}`);
  const cachePath = asset.replace('public/', './');
  if (!sw.includes(cachePath)) fail(`service worker must cache ${asset}`);
}

const lock = read('package-lock.json');
for (const token of ['packages.applied-caas', 'applied-caas-gateway', 'internal.api.openai', '10.192.']) {
  if (lock.includes(token)) fail(`package-lock contains forbidden registry token ${token}`);
}
console.log('[AquaFantasia] v2.0.26 wide stability guard validation passed.');
