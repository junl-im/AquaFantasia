import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const fail = (message) => { console.error(`[v2116] ${message}`); process.exit(1); };
const has = (text, token, label = token) => { if (!text.includes(token)) fail(`missing ${label}`); };

const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '2.1.16') fail(`package version must be 2.1.16, got ${pkg.version}`);
has(pkg.scripts?.validate ?? '', 'tools/check-v2116-village-asset-polish.mjs', 'v2116 validate hook');

const lock = JSON.parse(read('package-lock.json'));
if (lock.version !== '2.1.16') fail(`lock version must be 2.1.16, got ${lock.version}`);
if (lock.packages?.['']?.version !== '2.1.16') fail(`lock root package version must be 2.1.16, got ${lock.packages?.['']?.version}`);

const data = read('src/data.ts');
has(data, "APP_VERSION = '2.1.16'", 'APP_VERSION 2.1.16');
has(data, 'aqua-fantasia-v2.1.16-village-asset-polish', 'v2116 cache name');

const main = read('src/main.ts');
[
  "dataset.v2116VillageAssetPolish = 'v2116-village-asset-polish'",
  'v2116-village-asset-polish-root',
  'v2116-start-shell',
  'v2116-village-asset-polish',
  'v2116-village-loading-state',
  'v2116-village-ready',
  'data-v2116-primary-order="plus-minus-build-center-shop-sail"',
  'v2116-world-controls',
  'v2116-aqua-card',
  'v2116-runtime-page-shell',
  'v2116-aqua-page',
  'v2116-fishing-asset-screen',
  'v2116-bottom-nav',
  "nav.dataset.v2116Dock = 'right-bottom-asset-polish'",
  "document.body.classList.toggle('v2116-expedition-open', willOpen)",
  "document.body.classList.toggle('v2116-modal-open', hidden)",
].forEach((token) => has(main, token, `main ${token}`));

const village = read('src/villageWorld.ts');
[
  'ACTOR_DIRECTION_TEXTURE_FIX',
  'ACTOR_DIRECTION_TEXTURES',
  'actorDirectionFromVector',
  'actorTextureUrl',
  'actorDirectionQaPasses',
  'fishingBoat',
  'rowBoat',
  'ropeCoil',
  'anchorAsset',
  'treasureChest',
  'seaweedPatch',
  'driftwood',
  'crabTrap',
  'lifeRing',
  './assets/v2110/objects/fishing_props/fishing_prop_001.png',
  './assets/v2110/objects/fishing_props/fishing_prop_023.png',
  './assets/v2110/tiles_32x32/sea_and_beach/sea_tile_001_32x32.png',
  'v2116-build-tray-open',
  "document.body.classList.toggle('v2116-build-open', open)",
  "'v2116-modal-open'",
].forEach((token) => has(village, token, `village ${token}`));

const css = read('src/styles.css');
[
  'v2.1.16: Village Asset Polish',
  'html.v2116-village-asset-polish-root',
  '--v2116-card-asset',
  '--v2116-button-asset',
  '.v2116-world-controls',
  'grid-template-columns: repeat(2, 42px)',
  '.bottom-nav.v2116-bottom-nav',
  ':is(.v2116-aqua-card,.v2116-aqua-page,',
  '.village-world-screen.v2116-build-tray-open .v2097-build-tray',
  'body.v2116-expedition-open .village-world-screen',
  'body[data-screen="fishing"] .fishing-screen.v2116-fishing-asset-screen',
  'var(--v2116-round-close-asset)',
].forEach((token) => has(css, token, `css ${token}`));

const sw = read('public/sw.js');
has(sw, 'aqua-fantasia-v2.1.16-village-asset-polish', 'service worker cache');
for (const asset of [
  './assets/v2110/objects/fishing_props/fishing_prop_001.png',
  './assets/v2110/objects/fishing_props/fishing_prop_004.png',
  './assets/v2110/objects/fishing_props/fishing_prop_010.png',
  './assets/v2110/objects/fishing_props/fishing_prop_023.png',
  './assets/v2110/tiles_32x32/sea_and_beach/sea_tile_001_32x32.png',
]) has(sw, asset, `sw ${asset}`);

const offline = read('public/offline.html');
has(offline, 'v2.1.16', 'offline version');
const readme = read('README.md');
if (!readme.startsWith('# AquaFantasia v2.1.16')) fail('README version not synced');
for (const token of ['v2116-village-asset-polish-root', '마을 오브젝트', '32x32', '우측 상단', '우측 하단', '아쿠아 카드', '낚시', 'v2.1.10 에셋 278개', 'validate-and-deploy']) has(readme, token, `README ${token}`);

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

console.log('[v2116] Village asset polish checks passed.');
console.log(JSON.stringify({ ok: true, version: '2.1.16', assets: manifest.totalPng }, null, 2));
