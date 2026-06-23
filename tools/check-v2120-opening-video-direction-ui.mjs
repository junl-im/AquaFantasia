import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => { console.error(`[v2120] ${message}`); process.exit(1); };
const has = (text, needle, label) => { if (!text.includes(needle)) fail(`missing ${label}: ${needle}`); };
const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '2.1.20') fail(`package version must be 2.1.20, got ${pkg.version}`);
has(pkg.scripts?.validate ?? '', 'tools/check-v2120-opening-video-direction-ui.mjs', 'v2120 validate hook');
const lock = JSON.parse(read('package-lock.json'));
if (lock.version !== '2.1.20') fail(`lock version must be 2.1.20, got ${lock.version}`);
if (lock.packages?.['']?.version !== '2.1.20') fail(`lock root version must be 2.1.20, got ${lock.packages?.['']?.version}`);
const data = read('src/data.ts');
has(data, "APP_VERSION = '2.1.20'", 'APP_VERSION 2.1.20');
has(data, 'aqua-fantasia-v2.1.20-opening-video-direction-ui', 'v2120 cache name');
const sw = read('public/sw.js');
has(sw, 'aqua-fantasia-v2.1.20-opening-video-direction-ui', 'service worker cache name');
has(sw, './assets/v2120/opening/aqua_opening_v2120.mp4', 'opening mp4 precache');
has(sw, './assets/v2120/opening/aqua_opening_poster_v2120.jpg', 'opening poster precache');
const offline = read('public/offline.html');
has(offline, 'v2.1.20', 'offline version badge');
const main = read('src/main.ts');
[
  "dataset.v2120OpeningVideoDirectionUi = 'v2120-opening-video-direction-ui'",
  'v2120-opening-video-direction-ui-root', 'v2120-start-shell', 'v2120-village-opening-video-polish', 'v2120-village-opening-state', 'v2120-opening-cinematic', 'v2120-opening-video', './assets/v2120/opening/aqua_opening_v2120.mp4', 'minimumOpeningMs', 'finishVillageOpeningAfterMinimum', 'v2120-world-controls', 'data-v2120-primary-order="plus-minus-build-center-shop-sail"', 'v2120-bottom-nav', "nav.dataset.v2120Dock = 'right-bottom-settled-locked'", 'v2120-runtime-page-shell', 'v2120-aqua-page', 'v2120-aqua-card', 'v2120-fishing-polish-screen', 'v2120-game-dialog-card', 'v2120-dialog-x', "document.body.classList.toggle('v2120-modal-open', hidden)", "document.body.classList.toggle('v2120-expedition-open', willOpen)",
].forEach((needle) => has(main, needle, `main marker ${needle}`));
const village = read('src/villageWorld.ts');
[
  'V2120_PLAYER_DIRECTION_REMAP_LOCK', 'PLAYER_ACTOR_DIRECTION_TEXTURE_FIX', "east: 'west'", "west: 'east'", "northeast: 'northwest'", "northwest: 'northeast'", 'playerDirectionRemapQaPasses', 'dataset.v2120PlayerDirectionRemapLock', "if (role === 'player') return playerActorMotionTextureUrl(direction, 0)", "if (y >= 37) kind = 'sea'", "--v2120-joystick-transform", "document.body.classList.toggle('v2120-build-open', open)",
].forEach((needle) => has(village, needle, `village marker ${needle}`));
const lockedTokens = ['ACTOR_DIRECTION_TEXTURE_FIX', 'ACTOR_DIRECTION_TEXTURES', 'actorDirectionFromVector', 'actorTextureUrl', 'actorDirectionQaPasses'];
for (const token of lockedTokens) has(village, token, `direction lock token ${token}`);
const styles = read('src/styles.css');
[
  'v2.1.20 opening video', 'html.v2120-opening-video-direction-ui-root', '--v2120-command-width: 124px', '--v2120-hud-width: min(57vw, 286px)', '.v2120-opening-video', 'object-fit: cover', '.v2120-opening-bubble', '.login-screen.v2120-start-shell .hit-keep', 'background-image: none !important', '.v2097-expedition-board:not(.open)', 'top: calc(var(--v2120-safe-top) + 54px)', '.v2097-joystick-knob', '--v2120-joystick-transform', '.bottom-nav.v2120-bottom-nav', 'width: 178px', '.v2120-aqua-page', '.v2120-game-dialog-card', '[data-v2120-primary-order="plus-minus-build-center-shop-sail"]',
].forEach((needle) => has(styles, needle, `style marker ${needle}`));
const mp4 = 'public/assets/v2120/opening/aqua_opening_v2120.mp4';
const poster = 'public/assets/v2120/opening/aqua_opening_poster_v2120.jpg';
if (!exists(mp4)) fail('opening MP4 asset missing');
if (!exists(poster)) fail('opening poster asset missing');
const mp4Size = fs.statSync(path.join(root, mp4)).size;
if (mp4Size <= 0 || mp4Size > 2_400_000) fail(`opening MP4 should be optimized under 2.4MB, got ${mp4Size}`);
const playerDir = 'public/assets/v2118/characters/player';
const playerFrames = fs.readdirSync(path.join(root, playerDir)).filter((name) => /^player_.*_frame_\d+\.png$/.test(name));
if (playerFrames.length !== 32) fail(`player frame count must remain 32, got ${playerFrames.length}`);
const playerManifest = JSON.parse(read('public/assets/v2118/characters/player/manifest.json'));
if (playerManifest.version !== '2.1.20') fail(`player manifest version must be 2.1.20, got ${playerManifest.version}`);
has(JSON.stringify(playerManifest), 'direction-to-frame mapping', 'player direction correction manifest note');
const tileBlock = (name) => {
  const match = village.match(new RegExp(`${name}: \\[([\\s\\S]*?)\\n  \\]`));
  return match?.[1] ?? '';
};
for (const name of ['grass', 'sand', 'wood', 'plaza', 'stone']) {
  if (/sea_tile_\d+_32x32/.test(tileBlock(name))) fail(`${name} texture block must not include v2118 sea tiles`);
}
if (!/sea:\s*\[[\s\S]*sea_tile_001_32x32/.test(village)) fail('sea texture block must include supplied sea tile assets');
const forbidden = ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai'];
const scanFiles = ['package.json', 'package-lock.json', 'src/data.ts', 'src/main.ts', 'src/villageWorld.ts', 'src/styles.css', 'public/sw.js', 'public/offline.html'];
for (const file of scanFiles) {
  const text = read(file);
  for (const needle of forbidden) if (text.includes(needle)) fail(`forbidden registry/internal string in ${file}: ${needle}`);
}
console.log('[v2120] Opening video, player direction remap, HUD/expedition spacing, joystick skin, and aqua UI checks passed.');
console.log(JSON.stringify({ ok: true, version: pkg.version, openingMp4Size: mp4Size, playerFrames: playerFrames.length, bottomNavWidth: 178 }, null, 2));
