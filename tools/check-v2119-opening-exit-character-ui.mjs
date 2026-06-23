import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => { console.error(`[v2119] ${message}`); process.exit(1); };
const has = (text, token, label = token) => { if (!text.includes(token)) fail(`missing ${label}`); };
const sha = (file) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');

const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '2.1.19') fail(`package version must be 2.1.19, got ${pkg.version}`);
has(pkg.scripts?.validate ?? '', 'tools/check-v2119-opening-exit-character-ui.mjs', 'v2119 validate hook');

const lock = JSON.parse(read('package-lock.json'));
if (lock.version !== '2.1.19') fail(`lock version must be 2.1.19, got ${lock.version}`);
if (lock.packages?.['']?.version !== '2.1.19') fail(`lock root package version must be 2.1.19, got ${lock.packages?.['']?.version}`);

const data = read('src/data.ts');
has(data, "APP_VERSION = '2.1.19'", 'APP_VERSION 2.1.19');
has(data, 'aqua-fantasia-v2.1.19-opening-exit-character-ui', 'v2119 cache name');

const main = read('src/main.ts');
[
  "dataset.v2119OpeningExitCharacterUi = 'v2119-opening-exit-character-ui'",
  'v2119-opening-exit-character-ui-root',
  'v2119-start-shell',
  'v2119-village-opening-polish',
  'v2119-village-opening-state',
  'v2119-opening-cinematic',
  '아쿠아 판타지아 마을에 아침이 밝아오고 있습니다.',
  'v2119-world-controls',
  'data-v2119-primary-order="plus-minus-build-center-shop-sail"',
  'v2119-bottom-nav',
  "nav.dataset.v2119Dock = 'right-bottom-slightly-larger-locked'",
  'v2119-game-dialog-backdrop',
  'v2119-game-dialog-card',
  'v2119-dialog-x',
  '오늘의 항해를 마칠까요?',
  'v2119-runtime-page-shell',
  'v2119-aqua-page',
  'v2119-fishing-polish-screen',
  "document.body.classList.toggle('v2119-modal-open', hidden)",
  "document.body.classList.toggle('v2119-expedition-open', willOpen)",
  "nav.classList.contains('v2119-bottom-nav')",
  "nav.classList.contains('v2119-bottom-nav') ? '176px' : '166px'",
].forEach((token) => has(main, token, `main ${token}`));

const village = read('src/villageWorld.ts');
[
  'ACTOR_DIRECTION_TEXTURE_FIX',
  'ACTOR_DIRECTION_TEXTURES',
  'actorDirectionFromVector',
  'actorTextureUrl',
  'actorDirectionQaPasses',
  'V2118_PLAYER_MOTION_LOCK',
  'V2119_PLAYER_MOTION_IMAGE_LOCK',
  'v2119PlayerMotionImageLock',
  'PLAYER_ACTOR_FRAME_COUNT = 4',
  'PLAYER_ACTOR_MOTION_TEXTURES',
  "player: './assets/v2118/characters/player/player_south_frame_01.png'",
  './assets/v2118/tiles_32x32/sea_and_beach/sea_tile_001_32x32.png',
  "document.body.classList.toggle('v2119-build-open', open)",
  "knob.style.setProperty('--v2119-joystick-transform', knobTransform)",
].forEach((token) => has(village, token, `village ${token}`));

for (const [label, rx] of [
  ['grass', /grass:\s*\[[\s\S]*?\],\s*sand:/],
  ['sand', /sand:\s*\[[\s\S]*?\],\s*sea:/],
  ['wood', /wood:\s*\[[\s\S]*?\],\s*plaza:/],
]) {
  const block = village.match(rx)?.[0] ?? '';
  if (!block) fail(`${label} tile block missing`);
  if (/tiles_32x32\/sea_and_beach\/sea_tile/i.test(block)) fail(`${label} tile block must not use supplied blue sea tiles`);
}
const seaBlock = village.match(/sea:\s*\[[\s\S]*?\],\s*stone:/)?.[0] ?? '';
if (!seaBlock) fail('sea tile block missing');
for (const tile of ['sea_tile_001_32x32.png', 'sea_tile_002_32x32.png', 'sea_tile_003_32x32.png', 'sea_tile_011_32x32.png']) has(seaBlock, `./assets/v2118/tiles_32x32/sea_and_beach/${tile}`, `sea tile ${tile}`);

const css = read('src/styles.css');
[
  'v2.1.19 opening, exit-dialog, corrected-player, and aqua UI tuning',
  'html.v2119-opening-exit-character-ui-root',
  '--v2119-command-width: 116px',
  '--v2119-hud-width: min(61vw, 370px)',
  '.login-screen.v2119-start-shell .hit-keep',
  'background-image: none !important',
  '.v2119-opening-cinematic',
  '@keyframes v2119Sunrise',
  '@keyframes v2119Boat',
  '.v2097-world-controls.v2119-world-controls',
  'grid-template-columns: repeat(2, 52px)',
  '.bottom-nav.v2119-bottom-nav',
  'width: 176px',
  '.v2119-game-dialog-backdrop',
  '.v2119-dialog-x',
  ':is(.v2119-aqua-card,.v2119-aqua-page',
  '--v2119-joystick-transform',
].forEach((token) => has(css, token, `css ${token}`));

const sw = read('public/sw.js');
has(sw, 'aqua-fantasia-v2.1.19-opening-exit-character-ui', 'service worker cache');
for (const asset of [
  './assets/v2118/characters/player/manifest.json',
  './assets/v2118/characters/player/player_northeast_frame_01.png',
  './assets/v2118/characters/player/player_northwest_frame_01.png',
  './assets/v2118/characters/player/player_south_frame_01.png',
  './assets/v2118/tiles_32x32/sea_and_beach/sea_tile_001_32x32.png',
]) has(sw, asset, `sw ${asset}`);

const offline = read('public/offline.html');
has(offline, 'v2.1.19', 'offline version');
has(offline, '오프닝 로딩 연출', 'offline summary');

const readme = read('README.md');
if (!readme.startsWith('# AquaFantasia v2.1.19')) fail('README version not synced');
for (const token of ['v2119-opening-exit-character-ui-root', '로그인 유지', '오프닝', '게임 종료', '우측 하단', '낚싯대', '물/땅 타일', 'V2119_PLAYER_MOTION_IMAGE_LOCK', 'validate-and-deploy']) has(readme, token, `README ${token}`);

const manifest2110Path = path.join(root, 'public/assets/v2110/asset_manifest.json');
if (!fs.existsSync(manifest2110Path)) fail('v2110 asset manifest missing');
const manifest2110 = JSON.parse(fs.readFileSync(manifest2110Path, 'utf8'));
if (manifest2110.totalPng !== 278) fail(`expected v2110 asset manifest totalPng 278, got ${manifest2110.totalPng}`);

const manifest2118Path = path.join(root, 'public/assets/v2118/asset_manifest.json');
if (!fs.existsSync(manifest2118Path)) fail('v2118 asset manifest missing');
const manifest2118 = JSON.parse(fs.readFileSync(manifest2118Path, 'utf8'));
if (manifest2118.version !== '2.1.19') fail(`expected v2118 manifest version 2.1.19, got ${manifest2118.version}`);
if (manifest2118.generatedPlayerWalkFrames !== 32) fail(`expected 32 generated player frames, got ${manifest2118.generatedPlayerWalkFrames}`);
has(JSON.stringify(manifest2118), 'V2119_PLAYER_MOTION_IMAGE_LOCK', 'v2119 manifest lock');

const playerManifestPath = path.join(root, 'public/assets/v2118/characters/player/manifest.json');
if (!fs.existsSync(playerManifestPath)) fail('player v2118 manifest missing');
const playerManifest = JSON.parse(fs.readFileSync(playerManifestPath, 'utf8'));
if (playerManifest.version !== '2.1.19') fail(`player manifest version must be 2.1.19, got ${playerManifest.version}`);
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
// The uploaded correction changes the diagonal rod frames: NE/NW player frames should no longer be byte-identical.
if (sha('public/assets/v2118/characters/player/player_northeast_frame_01.png') === sha('public/assets/v2118/characters/player/player_northwest_frame_01.png')) fail('corrected NE/NW player frames should not be byte-identical');

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

console.log('[v2119] Opening, exit dialog, corrected character frames, tile balance, and UI checks passed.');
console.log(JSON.stringify({ ok: true, version: '2.1.19', v2110Assets: manifest2110.totalPng, playerFrames: manifest2118.generatedPlayerWalkFrames, bottomNavWidth: 176 }, null, 2));
