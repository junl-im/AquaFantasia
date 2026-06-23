import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const fail = (message) => { console.error(`[v2115] ${message}`); process.exit(1); };
const has = (text, token, label = token) => { if (!text.includes(token)) fail(`missing ${label}`); };

const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '2.1.15') fail(`package version must be 2.1.15, got ${pkg.version}`);
has(pkg.scripts?.validate ?? '', 'tools/check-v2115-aqua-screen-shell.mjs', 'v2115 validate hook');

const lock = JSON.parse(read('package-lock.json'));
if (lock.version !== '2.1.15') fail(`lock version must be 2.1.15, got ${lock.version}`);
if (lock.packages?.['']?.version !== '2.1.15') fail(`lock root package version must be 2.1.15, got ${lock.packages?.['']?.version}`);

const data = read('src/data.ts');
has(data, "APP_VERSION = '2.1.15'", 'APP_VERSION 2.1.15');
has(data, 'aqua-fantasia-v2.1.15-aqua-screen-shell', 'v2115 cache name');

const main = read('src/main.ts');
[
  "dataset.v2115AquaScreenShell = 'v2115-aqua-screen-shell'",
  'v2115-aqua-screen-shell-root',
  'v2115-start-shell',
  'v2115-village-shell',
  'v2115-village-loading-state',
  'v2115-village-ready',
  'data-v2115-primary-order="plus-minus-build-center-shop-sail"',
  'v2115-world-controls',
  'v2115-aqua-card',
  'v2115-runtime-page-shell',
  'v2115-aqua-page',
  'v2115-bottom-nav',
  "nav.dataset.v2115Dock = 'right-bottom-small-aqua'",
  'v2115-fishing-skin-screen',
  "document.body.classList.toggle('v2115-expedition-open', willOpen)",
  "document.body.classList.toggle('v2115-modal-open', hidden)",
].forEach((token) => has(main, token, `main ${token}`));

const village = read('src/villageWorld.ts');
[
  'ACTOR_DIRECTION_TEXTURE_FIX',
  'ACTOR_DIRECTION_TEXTURES',
  'actorDirectionFromVector',
  'actorTextureUrl',
  'actorDirectionQaPasses',
  'v2115-build-tray-open',
  "document.body.classList.toggle('v2115-build-open', open)",
  "'v2115-modal-open'",
].forEach((token) => has(village, token, `village ${token}`));

const css = read('src/styles.css');
[
  'v2.1.15: Aqua Screen Shell rebuild',
  'html.v2115-aqua-screen-shell-root',
  '--v2115-card-asset',
  '.login-screen.v2115-start-shell .v2084-start-actions',
  '.village-world-screen.v2115-village-loading-state',
  '.v2115-world-controls',
  'grid-template-columns: repeat(2, 44px)',
  '.v2097-joystick-knob',
  'transform: translate(-50%, -50%)',
  '.bottom-nav.v2115-bottom-nav',
  '.v2097-expedition-body.v2097-expedition-body-open',
  'body.v2115-expedition-open .village-world-screen',
  '.village-world-screen.v2115-build-tray-open .v2097-build-tray',
  '.runtime-menu-screen.v2115-runtime-page-shell .v2115-aqua-page',
  'body[data-screen="fishing"] .fishing-screen.v2115-fishing-skin-screen',
  "content: '✓'",
  'var(--v2115-button-asset)',
].forEach((token) => has(css, token, `css ${token}`));

const sw = read('public/sw.js');
has(sw, 'aqua-fantasia-v2.1.15-aqua-screen-shell', 'service worker cache');
const offline = read('public/offline.html');
has(offline, 'v2.1.15', 'offline version');
const readme = read('README.md');
if (!readme.startsWith('# AquaFantasia v2.1.15')) fail('README version not synced');
for (const token of ['v2115-aqua-screen-shell-root', '로그인 유지', '로딩', '조이스틱', '개척', '건설', '상점', '출항', '낚시', 'v2.1.10 신규 에셋', 'validate-and-deploy']) has(readme, token, `README ${token}`);

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

console.log('[v2115] Aqua screen shell checks passed.');
console.log(JSON.stringify({ ok: true, version: '2.1.15', assets: manifest.totalPng }, null, 2));
