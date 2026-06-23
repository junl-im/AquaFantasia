import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => { console.error(`[v2118] ${message}`); process.exit(1); };
const has = (text, token, label = token) => { if (!text.includes(token)) fail(`missing ${label}`); };

const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '2.1.18') fail(`package version must be 2.1.18, got ${pkg.version}`);
has(pkg.scripts?.validate ?? '', 'tools/check-v2118-character-water-ui-polish.mjs', 'v2118 validate hook');

const lock = JSON.parse(read('package-lock.json'));
if (lock.version !== '2.1.18') fail(`lock version must be 2.1.18, got ${lock.version}`);
if (lock.packages?.['']?.version !== '2.1.18') fail(`lock root package version must be 2.1.18, got ${lock.packages?.['']?.version}`);

const data = read('src/data.ts');
has(data, "APP_VERSION = '2.1.18'", 'APP_VERSION 2.1.18');
has(data, 'aqua-fantasia-v2.1.18-character-tile-ui-polish', 'v2118 cache name');

const main = read('src/main.ts');
[
  "dataset.v2118CharacterWaterUi = 'v2118-character-water-ui-polish'",
  'v2118-character-water-ui-root',
  'v2118-start-shell',
  'v2118-village-character-water-polish',
  'v2118-village-loading-state',
  'v2118-village-ready',
  'data-v2118-primary-order="plus-minus-build-center-shop-sail"',
  'v2118-world-controls',
  'v2118-aqua-card',
  'v2118-runtime-page-shell',
  'v2118-aqua-page',
  'v2118-fishing-stability-screen',
  'v2118-bottom-nav',
  "nav.dataset.v2118Dock = 'right-bottom-stable-polish'",
  "document.body.classList.toggle('v2118-expedition-open', willOpen)",
  "document.body.classList.toggle('v2118-modal-open', hidden)",
  "nav.classList.contains('v2118-bottom-nav')",
].forEach((token) => has(main, token, `main ${token}`));

const village = read('src/villageWorld.ts');
[
  'ACTOR_DIRECTION_TEXTURE_FIX',
  'ACTOR_DIRECTION_TEXTURES',
  'actorDirectionFromVector',
  'actorTextureUrl',
  'actorDirectionQaPasses',
  'V2118_PLAYER_MOTION_LOCK',
  'PLAYER_ACTOR_FRAME_COUNT = 4',
  'PLAYER_ACTOR_MOTION_TEXTURES',
  'playerActorMotionTextureUrl',
  "player: './assets/v2118/characters/player/player_south_frame_01.png'",
  "player: Object.fromEntries(ACTOR_DIRECTIONS.map((direction) => [direction, playerActorMotionTextureUrl(direction, 0)]))",
  './assets/v2118/tiles_32x32/sea_and_beach/sea_tile_001_32x32.png',
  './assets/v2118/tiles_32x32/sea_and_beach/sea_tile_045_32x32.png',
  './assets/v2118/tiles_32x32/sea_and_beach/sea_tile_055_32x32.png',
  'v2118PlayerMotionLock',
  'npc-eight-direction-static-assets-verified',
  'v2118-build-tray-open',
  "document.body.classList.toggle('v2118-build-open', open)",
  "'v2118-modal-open'",
].forEach((token) => has(village, token, `village ${token}`));

const grassBlock = village.match(/grass:\s*\[[\s\S]*?\],\s*sand:/)?.[0] ?? '';
if (!grassBlock) fail('grass tile block missing');
if (/tiles_32x32\/sea_and_beach\/sea_tile/i.test(grassBlock)) fail('grass tile block must not use supplied sea/beach tiles');
const seaBlock = village.match(/sea:\s*\[[\s\S]*?\],\s*stone:/)?.[0] ?? '';
if (!seaBlock) fail('sea tile block missing');
for (const tile of ['sea_tile_001_32x32.png', 'sea_tile_002_32x32.png', 'sea_tile_003_32x32.png', 'sea_tile_011_32x32.png']) has(seaBlock, `./assets/v2118/tiles_32x32/sea_and_beach/${tile}`, `sea tile ${tile}`);

const css = read('src/styles.css');
[
  'v2.1.18 character motion, water-tile balance, and UI spacing polish',
  'html.v2118-character-water-ui-root',
  '--v2118-command-width: 112px',
  '--v2118-hud-width: min(58vw, 342px)',
  '.login-screen.v2118-start-shell .remember-row',
  '.v2097-world-controls.v2118-world-controls',
  'grid-template-columns: repeat(2, 48px)',
  '.v2097-joystick-knob',
  '.bottom-nav.v2118-bottom-nav',
  'body.v2118-expedition-open .village-world-screen .v2097-expedition-board.open',
  ':is(.v2118-aqua-card,.v2118-aqua-page,',
  'body[data-screen="fishing"] .fishing-screen.v2118-fishing-stability-screen',
  'var(--v2118-close-asset)',
].forEach((token) => has(css, token, `css ${token}`));

const sw = read('public/sw.js');
has(sw, 'aqua-fantasia-v2.1.18-character-tile-ui-polish', 'service worker cache');
for (const asset of [
  './assets/v2118/characters/player/manifest.json',
  './assets/v2118/characters/player/player_north_frame_01.png',
  './assets/v2118/characters/player/player_northeast_frame_01.png',
  './assets/v2118/characters/player/player_south_frame_01.png',
  './assets/v2118/tiles_32x32/sea_and_beach/sea_tile_001_32x32.png',
  './assets/v2118/tiles_32x32/sea_and_beach/sea_tile_045_32x32.png',
]) has(sw, asset, `sw ${asset}`);

const offline = read('public/offline.html');
has(offline, 'v2.1.18', 'offline version');
const readme = read('README.md');
if (!readme.startsWith('# AquaFantasia v2.1.18')) fail('README version not synced');
for (const token of ['v2118-character-water-ui-root', '로그인 유지', '물 타일', '8방향', 'NPC', 'HUD', '우측 상단', 'validate-and-deploy']) has(readme, token, `README ${token}`);

const manifest2110Path = path.join(root, 'public/assets/v2110/asset_manifest.json');
if (!fs.existsSync(manifest2110Path)) fail('v2110 asset manifest missing');
const manifest2110 = JSON.parse(fs.readFileSync(manifest2110Path, 'utf8'));
if (manifest2110.totalPng !== 278) fail(`expected v2110 asset manifest totalPng 278, got ${manifest2110.totalPng}`);

const manifest2118Path = path.join(root, 'public/assets/v2118/asset_manifest.json');
if (!fs.existsSync(manifest2118Path)) fail('v2118 asset manifest missing');
const manifest2118 = JSON.parse(fs.readFileSync(manifest2118Path, 'utf8'));
if (manifest2118.generatedPlayerWalkFrames !== 32) fail(`expected 32 generated player frames, got ${manifest2118.generatedPlayerWalkFrames}`);
if (manifest2118.sourceDirectionGroupsProvided !== 7) fail(`source direction audit should record 7 source groups, got ${manifest2118.sourceDirectionGroupsProvided}`);
if (manifest2118.tileSetPngCount !== 81) fail(`expected 81 v2118 tile PNGs, got ${manifest2118.tileSetPngCount}`);

const playerManifestPath = path.join(root, 'public/assets/v2118/characters/player/manifest.json');
if (!fs.existsSync(playerManifestPath)) fail('player v2118 manifest missing');
const playerManifest = JSON.parse(fs.readFileSync(playerManifestPath, 'utf8'));
if (playerManifest.framesPerDirection !== 4) fail('player frames per direction must be 4');
const directions = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'];
if (playerManifest.directions.length !== directions.length) fail('player manifest must have 8 directions');
for (const direction of directions) {
  if (!playerManifest.directions.includes(direction)) fail(`player manifest missing ${direction}`);
  for (let i = 1; i <= 4; i += 1) {
    const n = String(i).padStart(2, '0');
    const file = `public/assets/v2118/characters/player/player_${direction}_frame_${n}.png`;
    if (!exists(file)) fail(`missing ${file}`);
  }
}

for (let group = 1; group <= 7; group += 1) {
  for (let i = 1; i <= 4; i += 1) {
    const file = `public/assets/v2118/source_fisher_walk_frames/fisher_direction_${String(group).padStart(2, '0')}_frame_${String(i).padStart(2, '0')}.png`;
    if (!exists(file)) fail(`missing source frame ${file}`);
  }
}

for (const tile of ['001', '002', '003', '011', '045', '046', '055', '056', '057']) {
  const file = `public/assets/v2118/tiles_32x32/sea_and_beach/sea_tile_${tile}_32x32.png`;
  if (!exists(file)) fail(`missing v2118 tile ${file}`);
}

const npcRoles = ['chief', 'merchant', 'guild', 'captain', 'tourist', 'vip'];
for (const role of npcRoles) {
  for (const direction of directions) {
    const file = `public/assets/v2047/characters/${role}_${direction}.png`;
    if (!exists(file)) fail(`missing NPC directional asset ${file}`);
  }
}

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

console.log('[v2118] Character motion, tile balance, NPC direction, and UI polish checks passed.');
console.log(JSON.stringify({ ok: true, version: '2.1.18', v2110Assets: manifest2110.totalPng, playerFrames: manifest2118.generatedPlayerWalkFrames, v2118Tiles: manifest2118.tileSetPngCount }, null, 2));
