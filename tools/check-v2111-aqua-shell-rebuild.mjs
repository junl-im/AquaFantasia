import fs from 'node:fs';
import path from 'node:path';

const read = (file) => fs.readFileSync(file, 'utf8');
const exists = (file) => fs.existsSync(file);
const fail = (message) => { console.error(`[v2111] ${message}`); process.exit(1); };
const has = (text, token, label = token) => { if (!text.includes(token)) fail(`missing ${label}`); };

const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '2.1.11') fail(`package version must be 2.1.11, got ${pkg.version}`);
has(pkg.scripts?.validate ?? '', 'tools/check-v2111-aqua-shell-rebuild.mjs', 'v2111 validate hook');

const data = read('src/data.ts');
has(data, "APP_VERSION = '2.1.11'", 'APP_VERSION 2.1.11');
has(data, 'aqua-fantasia-v2.1.11-aqua-shell-rebuild', 'v2111 cache name');

const main = read('src/main.ts');
for (const token of [
  "dataset.v2111AquaShell = 'v2111-aqua-shell-rebuild'",
  'v2111-aqua-shell-root',
  'v2111-village-shell',
  'v2111-runtime-page-shell',
  'v2111-fishing-rebuild-screen',
  'v2111-bottom-nav',
  "v218-aqua-modal-open', 'v2111-modal-open'",
  'do not mount the village bottom menu over it',
]) has(main, token, `main token ${token}`);
if (main.includes("document.documentElement.classList.add('v2098-ui-recovery-root', 'v218-stable-ui-fishing-rollback-root', 'v219-ui-touch-shop-fishing-audit-root', 'v2110-asset-integration-pass-root')")) fail('old v2110 root must not be activated');

const world = read('src/villageWorld.ts');
for (const token of [
  'v2.1.11: use the real canvas-local diamond hit',
  'const tile = nearestDiamondTile(world.x, world.y);',
  'v2111-build-tray-open',
  'document.body.classList.toggle(\'v2111-build-open\', open)',
  'toggleBuildTrayFromButton',
  "shopButton?.addEventListener('pointerup'",
  "fishingButton?.addEventListener('pointerup'",
]) has(world, token, `world token ${token}`);
for (const directionToken of [
  'ACTOR_DIRECTION_TEXTURE_FIX',
  'ACTOR_DIRECTION_TEXTURES',
  'actorDirectionFromVector',
  'actorTextureUrl',
  'actorDirectionQaPasses',
]) has(world, directionToken, `direction guard ${directionToken}`);

const css = read('src/styles.css');
for (const token of [
  'v2.1.11: Aqua Shell rebuild',
  'html.v2111-aqua-shell-root',
  '--v2111-card',
  '.start-art-screen .hit-keep',
  'background-image: linear-gradient',
  'body[data-screen="village"] .v2097-village-hud',
  'body[data-screen="village"] .v2097-expedition-board',
  '.v2097-world-controls',
  '.v2097-joystick',
  '.bottom-nav.v2111-bottom-nav',
  'body.v2111-modal-open .village-world-screen',
  '.village-world-screen.v2097-expedition-open .v2097-expedition-board',
  '.runtime-menu-screen.v2111-runtime-page-shell .v2111-aqua-page',
  'body[data-screen="fishing"] .fishing-screen.v2111-fishing-rebuild-screen',
  'body[data-screen="fishing"] .v2110-fishing-props',
  'body[data-screen="fishing"] .cast-button',
]) has(css, token, `CSS token ${token}`);

const sw = read('public/sw.js');
has(sw, 'aqua-fantasia-v2.1.11-aqua-shell-rebuild', 'service worker cache');
const offline = read('public/offline.html');
has(offline, 'v2.1.11', 'offline version');
has(offline, '단일 아쿠아 쉘 UI', 'offline v2111 summary');
const readme = read('README.md');
if (!readme.startsWith('# AquaFantasia v2.1.11')) fail('README version not synced');
for (const token of ['단일 UI 루트', '잔여 모달 상태', '마을 바닥 터치 좌표', '낚시 화면', 'validate-and-deploy']) has(readme, token, `README ${token}`);

const assetRoot = 'public/assets/v2110';
if (!exists(assetRoot)) fail('v2110 imported asset directory missing');
const manifestPath = path.join(assetRoot, 'asset_manifest.json');
if (!exists(manifestPath)) fail('v2110 asset manifest missing');
const manifest = JSON.parse(read(manifestPath));
if (manifest.totalPng !== 278) fail(`v2110 asset manifest should still track 278 PNG files, got ${manifest.totalPng}`);

console.log('[v2111] Aqua Shell rebuild checks passed.');
console.log(JSON.stringify({ ok: true, version: '2.1.11', assets: manifest.totalPng }, null, 2));
