import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => {
  console.error(`[v218] ${message}`);
  process.exit(1);
};

const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '2.1.8') fail(`package version must be 2.1.8, got ${pkg.version}`);

const data = read('src/data.ts');
if (!data.includes("APP_VERSION = '2.1.8'")) fail('APP_VERSION is not synced');
if (!data.includes('aqua-fantasia-v2.1.8-stable-ui-fishing-rollback')) fail('cache name is not v2.1.8 stable rollback');

const main = read('src/main.ts');
for (const token of [
  "dataset.v218StableRollback = 'v218-stable-ui-fishing-rollback'",
  'v218-stable-ui-fishing-rollback-root',
  'v218-runtime-page-screen',
  'v218-fishing-stable-rollback-screen',
  'v2055-fishing-reel-rebuild-screen',
  'v2057-fishing-aqua-touch-screen',
  'v2073-fishing-core-feel-screen',
  'v2084-fishing-bite-single-screen',
  'v2098-fishing-restored-screen',
  "[data-village-shop]')?.addEventListener('click'",
]) {
  if (!main.includes(token)) fail(`missing main.ts token: ${token}`);
}
for (const forbidden of [
  'v217-aqua-ui-touch-fishing-normalize-root',
  'v217-fishing-core-repair-screen',
  'v217-aqua-page-card',
  'v217-character-card',
]) {
  if (main.includes(forbidden)) fail(`broken v217 live token remains in main.ts: ${forbidden}`);
}

const css = read('src/styles.css');
for (const token of [
  'v2.1.8: stable UI/fishing rollback guard',
  'html.v218-stable-ui-fishing-rollback-root',
  'background-image: none !important;',
  '.runtime-menu-screen.v218-runtime-page-screen .runtime-content',
  '.village-world-screen.v2097-expedition-open .v2097-expedition-board',
  'body.v218-aqua-modal-open .village-world-screen',
  '.bottom-nav.v2098-bottom-nav',
  'body[data-screen="fishing"] .fishing-hud .hud-chip img',
]) {
  if (!css.includes(token)) fail(`missing CSS token: ${token}`);
}
for (const forbidden of [
  'html.v217-aqua-ui-touch-fishing-normalize-root',
  '--v217-card',
]) {
  if (css.includes(forbidden)) fail(`broken v217 CSS block remains: ${forbidden}`);
}

const world = read('src/villageWorld.ts');
for (const token of [
  "dataset.v218StableRollback = 'v218-raw-diamond-touch-interior-selector-repair'",
  'v218-village-touch-repaired',
  'const tile = nearestDiamondTile(world.x, world.y);',
  "[data-v2097-interior-panel], [data-v2094-interior-panel]",
  "[data-v2097-interior-image], [data-v2094-interior-image]",
  "document.body.classList.add('v2094-modal-open', 'v2097-modal-open', 'v218-aqua-modal-open')",
  ".v2097-village-guide, .v2094-village-guide",
  'guide.hidden = false;',
]) {
  if (!world.includes(token)) fail(`missing villageWorld token: ${token}`);
}
for (const forbidden of [
  'x: world.x - TILE_W * 0.22',
  'y: world.y + TILE_H * 0.22',
]) {
  if (world.includes(forbidden)) fail(`old shifted touch bias remains: ${forbidden}`);
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

const toast = read('src/toast.ts');
if (!toast.includes('toast popups are intentionally disabled') || !toast.includes('root.replaceChildren')) fail('toast disable guard missing');

const readme = read('README.md');
if (!readme.startsWith('# AquaFantasia v2.1.8')) fail('README version not synced');
if (!readme.includes('v2.0.99에 남아 있던 v2080~v2098 안정 UI/낚시 런타임 기준으로 되돌렸습니다')) fail('README rollback note missing');

const offline = read('public/offline.html');
if (!offline.includes('v2.1.8')) fail('offline badge missing v2.1.8');

console.log('[v218] stable UI/fishing rollback checks passed.');
