import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => { console.error(`[v2121] ${message}`); process.exit(1); };
const has = (text, needle, label) => { if (!text.includes(needle)) fail(`missing ${label}: ${needle}`); };
const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '2.1.21') fail(`package version must be 2.1.21, got ${pkg.version}`);
has(pkg.scripts?.validate ?? '', 'tools/check-v2121-ui-continuity-polish.mjs', 'v2121 validate hook');
const lock = JSON.parse(read('package-lock.json'));
if (lock.version !== '2.1.21') fail(`lock version must be 2.1.21, got ${lock.version}`);
if (lock.packages?.['']?.version !== '2.1.21') fail(`lock root version must be 2.1.21, got ${lock.packages?.['']?.version}`);
const data = read('src/data.ts');
has(data, "APP_VERSION = '2.1.21'", 'APP_VERSION 2.1.21');
has(data, 'aqua-fantasia-v2.1.21-ui-continuity-polish', 'v2121 cache name');
const sw = read('public/sw.js');
has(sw, 'aqua-fantasia-v2.1.21-ui-continuity-polish', 'service worker cache name');
has(sw, './assets/v2120/opening/aqua_opening_v2120.mp4', 'opening mp4 precache kept');
has(sw, './assets/v2120/opening/aqua_opening_poster_v2120.jpg', 'opening poster precache kept');
const offline = read('public/offline.html');
has(offline, 'v2.1.21', 'offline version badge');
const readme = read('README.md');
has(readme, 'AquaFantasia v2.1.21', 'README title');
has(readme, '이 기기에서 로그인 유지', 'approved login toggle note');
const main = read('src/main.ts');
[
  "dataset.v2121UiContinuityPolish = 'v2121-ui-continuity-polish'",
  'v2121-ui-continuity-polish-root',
  'v2121-start-shell',
  'v2121-village-continuity-polish',
  'v2121-village-opening-state',
  'v2121-opening-cinematic',
  'v2121-opening-video',
  'v2121-opening-skip',
  'v2121-opening-video-ready',
  'v2121-opening-video-fallback',
  'finishVillageOpeningTriggered',
  'data-v2121-opening-skip',
  'v2121-world-controls',
  'v2121-bottom-nav',
  "nav.dataset.v2121Dock = 'right-bottom-no-shift-readable'",
  'v2121-runtime-page-shell',
  'v2121-aqua-page',
  'data-v2121-page-title',
  'data-v2121-page-subtitle',
  'v2121-fishing-continuity-screen',
  'v2121-game-dialog-card',
  'v2121-dialog-x',
  "document.body.classList.toggle('v2121-modal-open', hidden)",
  "document.body.classList.toggle('v2121-expedition-open', willOpen)",
].forEach((needle) => has(main, needle, `main marker ${needle}`));
const village = read('src/villageWorld.ts');
[
  'V2121_UI_CONTINUITY_LOCK',
  'dataset.v2121UiContinuityLock',
  "this.root.classList.toggle('v2121-build-tray-open', open)",
  "document.body.classList.toggle('v2121-build-open', open)",
  '--v2121-joystick-transform',
  'V2120_PLAYER_DIRECTION_REMAP_LOCK',
  'PLAYER_ACTOR_DIRECTION_TEXTURE_FIX',
  "east: 'west'",
  "west: 'east'",
  "northeast: 'northwest'",
  "northwest: 'northeast'",
].forEach((needle) => has(village, needle, `village marker ${needle}`));
const lockedTokens = ['ACTOR_DIRECTION_TEXTURE_FIX', 'ACTOR_DIRECTION_TEXTURES', 'actorDirectionFromVector', 'actorTextureUrl', 'actorDirectionQaPasses'];
for (const token of lockedTokens) has(village, token, `direction lock token ${token}`);
const styles = read('src/styles.css');
[
  'v2.1.21 UI continuity polish',
  'html.v2121-ui-continuity-polish-root',
  '--v2121-command-width: 126px',
  '--v2121-hud-width: min(58vw, 292px)',
  '.v2121-opening-skip',
  '.v2121-opening-video-fallback',
  '.v2121-opening-bubble',
  '.login-screen.v2121-start-shell .hit-keep',
  'background-image: none !important',
  '.bottom-nav.v2121-bottom-nav',
  'width: 180px',
  '--v2121-joystick-transform',
  '.v2121-aqua-page::before',
  'data-v2121-page-title',
  '.v2121-game-dialog-card',
  '.v2121-fishing-continuity-screen',
  '.v2053-reel-touch-zone:not(.hidden)',
].forEach((needle) => has(styles, needle, `style marker ${needle}`));
const mp4 = 'public/assets/v2120/opening/aqua_opening_v2120.mp4';
const poster = 'public/assets/v2120/opening/aqua_opening_poster_v2120.jpg';
if (!exists(mp4)) fail('opening MP4 asset missing');
if (!exists(poster)) fail('opening poster asset missing');
const mp4Size = fs.statSync(path.join(root, mp4)).size;
if (mp4Size <= 0 || mp4Size > 2_400_000) fail(`opening MP4 should remain optimized under 2.4MB, got ${mp4Size}`);
const playerDir = 'public/assets/v2118/characters/player';
const playerFrames = fs.readdirSync(path.join(root, playerDir)).filter((name) => /^player_.*_frame_\d+\.png$/.test(name));
if (playerFrames.length !== 32) fail(`player frame count must remain 32, got ${playerFrames.length}`);
const playerManifest = JSON.parse(read('public/assets/v2118/characters/player/manifest.json'));
if (playerManifest.version !== '2.1.21') fail(`player manifest version must be 2.1.21, got ${playerManifest.version}`);
has(JSON.stringify(playerManifest), 'direction remap locked', 'player direction continuity note');
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
console.log('[v2121] UI continuity, opening fallback, common page header, fishing layout, and direction locks passed.');
console.log(JSON.stringify({ ok: true, version: pkg.version, openingMp4Size: mp4Size, playerFrames: playerFrames.length, bottomNavWidth: 180 }, null, 2));
