import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => {
  console.error(`[v2080] ${message}`);
  process.exit(1);
};

const pkg = JSON.parse(read('package.json'));
if (!/^2\.0\.(8[0-9]|9[0-9])$/.test(pkg.version)) fail('package.json version must be v2.0.80 or later');

const data = read('src/data.ts');
if (!data.includes(`APP_VERSION = '${pkg.version}'`)) fail('APP_VERSION is not synced to package version');
if (!data.includes(`aqua-fantasia-v${pkg.version}`)) fail('cache name is not synced to current package version');

const main = read('src/main.ts');
for (const token of [
  "dataset.v2080MenuTileAudit = 'v2080-menu-page-grid-tile-hitbox-audit'",
  'v2080-menu-page-grid-screen',
  'v2080-scroll-stack',
  'page-structure-scroll-content-width-normalized',
  '.v2080-card-grid, .v2080-card-stack, .v2080-scroll-zone',
  'v2080-tile-hitbox-audit-screen',
]) {
  if (!main.includes(token)) fail(`missing main.ts v2080 marker: ${token}`);
}

const css = read('src/styles.css');
for (const token of [
  'v2.0.80 Menu Page Grid / Tile Hitbox Audit',
  'html[data-v2080-menu-tile-audit="v2080-menu-page-grid-tile-hitbox-audit"] .runtime-menu-screen.v2080-menu-page-grid-screen .runtime-content.v2080-scroll-stack',
  'grid-template-columns: repeat(auto-fit, minmax(min(100%, 154px), 1fr))',
  '-webkit-line-clamp: unset',
  '.v2080-tile-hitbox-audit-screen .v2050-expedition-board.v2075-expedition-dock',
  '.v2080-tile-hitbox-audit-screen :is(.v2017-character-panel.open,.v203-interior-panel.open)',
]) {
  if (!css.includes(token)) fail(`missing CSS v2080 marker: ${token}`);
}

const world = read('src/villageWorld.ts');
for (const token of [
  'diamondHitScore',
  'nearestDiamondTile',
  'const scaleX = this.app.screen.width / Math.max(1, rect.width);',
  'const tile = nearestDiamondTile(wx, wy);',
  "dataset.v2080TileHitboxAudit = 'canvas-local-tile-diamond-hitbox-normalized'",
]) {
  if (!world.includes(token)) fail(`missing villageWorld v2080 marker: ${token}`);
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

const readme = read('README.md');
if (!readme.startsWith(`# AquaFantasia v${pkg.version}`)) fail('README top version is not synced to package version');
if (!readme.includes('마을 타일 클릭 좌표는 canvas CSS 크기와 Pixi 내부 screen 크기 차이를 보정')) fail('README does not document tile click hitbox correction');

const offline = read('public/offline.html');
if (!offline.includes(`v${pkg.version}`)) fail('offline badge missing current package version');

console.log('[v2080] menu page grid / tile hitbox audit checks passed.');
