import fs from 'node:fs';
import path from 'node:path';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => { console.error(`[v2112] ${message}`); process.exit(1); };
const has = (text, token, label = token) => { if (!text.includes(token)) fail(`missing ${label}`); };
const exists = (file) => fs.existsSync(file);

const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '2.1.12') fail(`package version must be 2.1.12, got ${pkg.version}`);
has(pkg.scripts?.validate ?? '', 'tools/check-v2112-aqua-foundation-shell.mjs', 'v2112 validate hook');

const data = read('src/data.ts');
has(data, "APP_VERSION = '2.1.12'", 'APP_VERSION 2.1.12');
has(data, 'aqua-fantasia-v2.1.12-aqua-shell-foundation', 'v2112 cache name');

const main = read('src/main.ts');
for (const token of [
  "dataset.v2112AquaFoundation = 'v2112-aqua-shell-foundation'",
  'v2112-aqua-foundation-root',
  'v2112-village-foundation',
  'v2112-runtime-page-shell',
  'v2112-aqua-page',
  'v2112-fishing-foundation-screen',
  'v2112-bottom-nav',
  "'v2112-modal-open', 'v2112-expedition-open', 'v2112-build-open'",
  "target?.closest<HTMLButtonElement>('[data-village-build-open]')",
  "target?.closest<HTMLButtonElement>('[data-village-fishing]')",
]) has(main, token, `main token ${token}`);

const world = read('src/villageWorld.ts');
for (const token of [
  'v2112-build-active',
  'v2112-build-tray-open',
  "document.body.classList.toggle('v2112-build-open', open)",
  'v2.1.12: keep the real canvas-local diamond hit',
  'const tile = nearestDiamondTile(world.x, world.y);',
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
  'v2.1.12: Aqua foundation shell pass',
  'html.v2112-aqua-foundation-root',
  '--v2112-card',
  '.start-art-screen .hit-keep',
  'background-image: none',
  'body[data-screen="village"] .v2097-village-hud',
  'body[data-screen="village"] .v2097-expedition-board',
  'body[data-screen="village"] .v2097-world-controls',
  'body[data-screen="village"] .v2097-joystick',
  '.bottom-nav.v2112-bottom-nav',
  'body.v2112-modal-open .village-world-screen',
  'body.v2112-expedition-open .village-world-screen',
  'body.v2112-build-open .village-world-screen',
  '.village-world-screen.v2097-expedition-open .v2097-expedition-body',
  '.runtime-menu-screen.v2112-runtime-page-shell .v2112-aqua-page',
  'body[data-screen="fishing"] .fishing-screen.v2112-fishing-foundation-screen',
  'body[data-screen="fishing"] .v2110-fishing-props',
  'body[data-screen="fishing"] .fishing-hud img',
]) has(css, token, `CSS token ${token}`);

const sw = read('public/sw.js');
has(sw, 'aqua-fantasia-v2.1.12-aqua-shell-foundation', 'service worker cache');
const offline = read('public/offline.html');
has(offline, 'v2.1.12', 'offline version');
has(offline, '단일 아쿠아 쉘 UI', 'offline shell summary');
const readme = read('README.md');
if (!readme.startsWith('# AquaFantasia v2.1.12')) fail('README version not synced');
for (const token of ['v2112-aqua-foundation-root', 'HUD', '개척', '조이스틱', '우측 하단', '건설', '상점', '출항', '낚시', 'validate-and-deploy']) has(readme, token, `README ${token}`);

const assetRoot = 'public/assets/v2110';
if (!exists(assetRoot)) fail('v2110 imported asset directory missing');
const manifestPath = path.join(assetRoot, 'asset_manifest.json');
if (!exists(manifestPath)) fail('v2110 asset manifest missing');
const manifest = JSON.parse(read(manifestPath));
if (manifest.totalPng !== 278) fail(`v2110 asset manifest should still track 278 PNG files, got ${manifest.totalPng}`);

console.log('[v2112] Aqua foundation shell checks passed.');
console.log(JSON.stringify({ ok: true, version: '2.1.12', assets: manifest.totalPng }, null, 2));
