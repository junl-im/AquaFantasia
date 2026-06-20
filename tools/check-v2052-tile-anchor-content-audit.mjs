import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => { console.error(`[v2052-tile-anchor-content-audit] ${message}`); process.exit(1); };
const must = (condition, message) => { if (!condition) fail(message); };
const has = (source, token, label = token) => must(source.includes(token), `missing ${label}`);

const pkg = JSON.parse(read('package.json'));
const main = read('src/main.ts');
const css = read('src/styles.css');
const world = read('src/villageWorld.ts');
const data = read('src/data.ts');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const readme = read('README.md');
const lock = read('package-lock.json');

must(pkg.version === '2.0.52', 'package.json version must be 2.0.52');
has(data, "APP_VERSION = '2.0.52'", 'APP_VERSION 2.0.52');
has(data, 'aqua-fantasia-v2.0.52-tile-anchor-content-audit', 'data cache v2.0.52');
has(sw, 'aqua-fantasia-v2.0.52-tile-anchor-content-audit', 'sw cache v2.0.52');
has(offline, 'v2.0.52', 'offline badge v2.0.52');
has(readme, '# AquaFantasia v2.0.52', 'README title v2.0.52');
has(readme, '## v2.0.52', 'README v2.0.52 changelog');
has(pkg.scripts.validate, 'check-v2052-tile-anchor-content-audit.mjs', 'v2052 validate hook');

for (const token of [
  "dataset.v2052TileAnchorContentAudit = 'v2052-tile-anchor-content-audit'",
  'v2052-tile-anchor-village-screen',
  'v2052-identical-dock-nav',
  "v2052DockGuard = 'v2052-four-button-dock-stable-no-empty-frame'",
  'v2052-fishing-feedback-screen',
]) has(main, token, `main token ${token}`);

for (const token of [
  "dataset.v2052TileAnchorAudit = 'tile-ground-footprint-collision-audit'",
  'TILE_ACTOR_GROUND_Y',
  'TILE_DECOR_GROUND_Y',
  'BUILDING_GROUND_BACKSET',
  'function actorGround',
  'function decorationGround',
  'function footprintGround',
  'function tileDiamondPoints',
  'function footprintTileKeys',
  'normalizeSavedBuildingFootprints',
  'createFootprintBaseGraphic',
  'container.position.set(center.x, center.y)',
  'sprite.anchor.set(0.5, 1)',
  'const insideFootprint',
  'const atFrontDoor',
]) has(world, token, `world token ${token}`);

for (const token of [
  'v2.0.52 tile/anchor/content audit',
  '--v2052-dock-btn',
  '.v2052-tile-anchor-village-screen',
  '.bottom-nav.v2052-identical-dock-nav',
  '.dock-row:empty',
  '손을 떼면 장력 ↓',
]) has(css, token, `css token ${token}`);

for (const forbidden of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  must(!lock.includes(forbidden), `package-lock contains forbidden registry token ${forbidden}`);
}
const rootMarkdown = fs.readdirSync('.').filter((name) => name.toLowerCase().endsWith('.md'));
must(rootMarkdown.length === 1 && rootMarkdown[0] === 'README.md', 'root must contain README.md only');
const forbiddenNotes = fs.readdirSync('.', { recursive: true }).filter((name) => /_NOTES\.md$/i.test(String(name)));
must(forbiddenNotes.length === 0, 'must not create *_NOTES.md files');
console.log('[AquaFantasia] v2.0.52 tile/anchor/content audit validation passed.');
