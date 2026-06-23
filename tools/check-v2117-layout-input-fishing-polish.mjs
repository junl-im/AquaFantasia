import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const fail = (message) => { console.error(`[v2117] ${message}`); process.exit(1); };
const has = (text, token, label = token) => { if (!text.includes(token)) fail(`missing ${label}`); };

const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '2.1.17') fail(`package version must be 2.1.17, got ${pkg.version}`);
has(pkg.scripts?.validate ?? '', 'tools/check-v2117-layout-input-fishing-polish.mjs', 'v2117 validate hook');

const lock = JSON.parse(read('package-lock.json'));
if (lock.version !== '2.1.17') fail(`lock version must be 2.1.17, got ${lock.version}`);
if (lock.packages?.['']?.version !== '2.1.17') fail(`lock root package version must be 2.1.17, got ${lock.packages?.['']?.version}`);

const data = read('src/data.ts');
has(data, "APP_VERSION = '2.1.17'", 'APP_VERSION 2.1.17');
has(data, 'aqua-fantasia-v2.1.17-layout-input-fishing-polish', 'v2117 cache name');

const main = read('src/main.ts');
[
  "dataset.v2117LayoutInputFishing = 'v2117-layout-input-fishing-polish'",
  'v2117-layout-input-fishing-root',
  'v2117-start-shell',
  'v2117-village-layout-polish',
  'v2117-village-loading-state',
  'v2117-village-ready',
  'data-v2117-primary-order="plus-minus-build-center-shop-sail"',
  'v2117-world-controls',
  'v2117-aqua-card',
  'v2117-runtime-page-shell',
  'v2117-aqua-page',
  'v2117-fishing-reel-safe-screen',
  'v2117-bottom-nav',
  "nav.dataset.v2117Dock = 'right-bottom-no-shift-polish'",
  "document.body.classList.toggle('v2117-expedition-open', willOpen)",
  "document.body.classList.toggle('v2117-modal-open', hidden)",
  "nav.classList.contains('v2117-bottom-nav')",
].forEach((token) => has(main, token, `main ${token}`));

const village = read('src/villageWorld.ts');
[
  'ACTOR_DIRECTION_TEXTURE_FIX',
  'ACTOR_DIRECTION_TEXTURES',
  'actorDirectionFromVector',
  'actorTextureUrl',
  'actorDirectionQaPasses',
  './assets/v2110/tiles_32x32/sea_and_beach/sea_tile_006_32x32.png',
  './assets/v2110/tiles_32x32/sea_and_beach/sea_tile_015_32x32.png',
  'v2117-build-tray-open',
  "document.body.classList.toggle('v2117-build-open', open)",
  "'v2117-modal-open'",
  "--v2117-joystick-transform",
].forEach((token) => has(village, token, `village ${token}`));

const css = read('src/styles.css');
[
  'v2.1.17: Layout Input Fishing Polish',
  'html.v2117-layout-input-fishing-root',
  'Approved keep-login toggle lock',
  '--v2117-joystick-transform',
  'grid-template-columns: repeat(2, 37px)',
  '.bottom-nav.v2117-bottom-nav',
  'Right-bottom dock must not resize',
  'body.v2117-expedition-open .village-world-screen .v2097-expedition-board.open',
  ':is(.v2117-aqua-card,.v2117-aqua-page,',
  '.village-world-screen.v2117-build-tray-open .v2097-build-tray',
  'body[data-screen="fishing"] .fishing-screen.v2117-fishing-reel-safe-screen',
  '.v2055-reel-console:not(.hidden)',
  'var(--v2117-close-asset)',
].forEach((token) => has(css, token, `css ${token}`));

const sw = read('public/sw.js');
has(sw, 'aqua-fantasia-v2.1.17-layout-input-fishing-polish', 'service worker cache');
for (const asset of [
  './assets/v2110/tiles_32x32/sea_and_beach/sea_tile_001_32x32.png',
  './assets/v2110/tiles_32x32/sea_and_beach/sea_tile_002_32x32.png',
  './assets/v2110/tiles_32x32/sea_and_beach/sea_tile_003_32x32.png',
  './assets/v2110/tiles_32x32/sea_and_beach/sea_tile_011_32x32.png',
  './assets/v2110/objects/fishing_props/fishing_prop_023.png',
]) has(sw, asset, `sw ${asset}`);

const offline = read('public/offline.html');
has(offline, 'v2.1.17', 'offline version');
const readme = read('README.md');
if (!readme.startsWith('# AquaFantasia v2.1.17')) fail('README version not synced');
for (const token of ['v2117-layout-input-fishing-root', '로그인 유지', '개척', '조이스틱', '우측 하단', '우측 상단', '낚시', '물 타일', 'v2.1.10 신규 에셋 278개', 'validate-and-deploy']) has(readme, token, `README ${token}`);

const manifestPath = path.join(root, 'public/assets/v2110/asset_manifest.json');
if (!fs.existsSync(manifestPath)) fail('v2110 asset manifest missing');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
if (manifest.totalPng !== 278) fail(`expected v2110 asset manifest totalPng 278, got ${manifest.totalPng}`);

const forbiddenRegistryTokens = [
  ['packages', 'applied-caas'].join('.'),
  ['applied-caas', 'gateway'].join('-'),
  ['10', '192', ''].join('.'),
  ['internal', 'api', 'openai'].join('.'),
];
for (const forbidden of forbiddenRegistryTokens) {
  for (const file of ['package.json', 'package-lock.json', 'README.md', 'src/data.ts', 'src/main.ts', 'src/styles.css', 'src/villageWorld.ts']) {
    if (read(file).includes(forbidden)) fail(`forbidden registry string ${forbidden} in ${file}`);
  }
}

console.log('[v2117] Layout/input/fishing polish checks passed.');
console.log(JSON.stringify({ ok: true, version: '2.1.17', assets: manifest.totalPng }, null, 2));
