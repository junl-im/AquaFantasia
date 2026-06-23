import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => {
  console.error(`[v219] ${message}`);
  process.exit(1);
};

const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '2.1.9') fail(`package version must be 2.1.9, got ${pkg.version}`);

const data = read('src/data.ts');
if (!data.includes("APP_VERSION = '2.1.9'")) fail('APP_VERSION is not synced');
if (!data.includes('aqua-fantasia-v2.1.9-ui-touch-shop-fishing-audit')) fail('cache name is not v2.1.9 audit');

const main = read('src/main.ts');
for (const token of [
  "dataset.v219UiTouchShopFishingAudit = 'v219-ui-touch-shop-fishing-audit'",
  'v219-ui-touch-shop-fishing-audit-root',
  'v219-runtime-page-screen',
  'v219-fishing-hud-input-audit-screen',
  "onOpenShop: () => { void this.go('shop'); }",
]) {
  if (!main.includes(token)) fail(`missing main.ts token: ${token}`);
}
for (const token of [
  'v2055-fishing-reel-rebuild-screen',
  'v2057-fishing-aqua-touch-screen',
  'v2073-fishing-core-feel-screen',
  'v2084-fishing-bite-single-screen',
  'v2098-fishing-restored-screen',
]) {
  if (!main.includes(token)) fail(`fishing recovery token removed: ${token}`);
}

const world = read('src/villageWorld.ts');
for (const token of [
  'onOpenShop?: () => void',
  'v219-foot-biased-touch-shop-route',
  'v219-village-touch-shop-repaired',
  'const footWorld = { x: world.x - TILE_W * 0.14, y: world.y + TILE_H * 0.16 };',
  'const rawTile = nearestDiamondTile(world.x, world.y);',
  'const footTile = nearestDiamondTile(footWorld.x, footWorld.y);',
  'this.onOpenShop?.();',
]) {
  if (!world.includes(token)) fail(`missing villageWorld token: ${token}`);
}
for (const forbidden of [
  'x: world.x - TILE_W * 0.22',
  'y: world.y + TILE_H * 0.22',
]) {
  if (world.includes(forbidden)) fail(`old strong touch bias remains: ${forbidden}`);
}
for (const directionToken of [
  'ACTOR_DIRECTION_TEXTURE_FIX',
  'ACTOR_DIRECTION_TEXTURES',
  'actorDirectionFromVector',
  'actorTextureUrl',
  'actorDirectionQaPasses',
]) {
  if (!world.includes(directionToken)) fail(`character direction guard token removed: ${directionToken}`);
}

const css = read('src/styles.css');
for (const token of [
  'v2.1.9: touch / shop / modal page / fishing audit',
  'html.v219-ui-touch-shop-fishing-audit-root',
  'body[data-screen="shop"] .runtime-hud',
  '.runtime-menu-screen.v219-runtime-page-screen .runtime-content',
  '.village-world-screen.v2097-expedition-open .v2097-expedition-board',
  'body[data-screen="fishing"] .bottom-nav.v2098-bottom-nav { display: none !important; }',
  'body[data-screen="fishing"] .fishing-hud .hud-chip img',
  '.v2028-fishing-safe-grid { display: none !important; }',
]) {
  if (!css.includes(token)) fail(`missing CSS token: ${token}`);
}
for (const forbidden of [
  'html.v217-aqua-ui-touch-fishing-normalize-root',
  '--v217-card',
]) {
  if (css.includes(forbidden)) fail(`broken v217 CSS block remains: ${forbidden}`);
}

const readme = read('README.md');
if (!readme.startsWith('# AquaFantasia v2.1.9')) fail('README version not synced');
if (!readme.includes('상점 버튼 무반응 방지')) fail('README shop fix note missing');

const offline = read('public/offline.html');
if (!offline.includes('v2.1.9')) fail('offline badge missing v2.1.9');

console.log('[v219] UI touch/shop/fishing audit checks passed.');
