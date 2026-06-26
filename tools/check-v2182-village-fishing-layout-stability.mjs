import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root = process.cwd();
const fail = (msg) => { console.error(`[v2182] ${msg}`); process.exit(1); };
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const json = (file) => JSON.parse(read(file));
const assertIncludes = (file, token) => { if (!read(file).includes(token)) fail(`${file} missing ${token}`); };
const assertFile = (file) => { if (!exists(file)) fail(`missing file: ${file}`); };
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');

const pkg = json('package.json');
const lock = json('package-lock.json');
if (pkg.version !== '2.1.82') fail(`package.json version is ${pkg.version}`);
if (lock.version !== '2.1.82' || lock.packages?.['']?.version !== '2.1.82') fail('package-lock.json version mismatch');
if (!pkg.scripts?.validate?.includes('check-v2182-village-fishing-layout-stability.mjs')) fail('validate script must run v2.1.82 guard');
assertIncludes('src/data.ts', "APP_VERSION = '2.1.82'");
assertIncludes('src/data.ts', 'aqua-fantasia-v2.1.82-village-fishing-layout-stability');
assertIncludes('public/sw.js', 'aqua-fantasia-v2.1.82-village-fishing-layout-stability');
assertIncludes('public/offline.html', 'v2.1.82');
assertIncludes('README.md', '# AquaFantasia v2.1.82');
assertIncludes('README.md', '## v2.1.82 변경사항');
assertIncludes('README.md', '## v2.1.81 변경사항');
assertIncludes('index.html', './assets/v2120/opening/aqua_opening_v2120.mp4');
assertIncludes('index.html', 'rel="preload"');
if (exists('APP_VERSION')) fail('root APP_VERSION file must not exist');
const rootMarkdown = fs.readdirSync(root).filter((name) => /\.md$/i.test(name));
if (rootMarkdown.length !== 1 || rootMarkdown[0] !== 'README.md') fail(`root markdown must be README.md only: ${rootMarkdown.join(', ')}`);

function checkCssBalance(file) {
  const text = read(file);
  const pairs = { '(': ')', '{': '}', '[': ']' };
  const closers = new Set(Object.values(pairs));
  const stack = [];
  let inComment = false;
  let quote = '';
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (inComment) { if (ch === '*' && next === '/') { inComment = false; i += 1; } continue; }
    if (quote) { if (ch === '\\') { i += 1; continue; } if (ch === quote) quote = ''; continue; }
    if (ch === '/' && next === '*') { inComment = true; i += 1; continue; }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (pairs[ch]) stack.push({ ch, i });
    else if (closers.has(ch)) { const open = stack.pop(); if (!open || pairs[open.ch] !== ch) fail(`${file} bracket mismatch near index ${i}`); }
  }
  if (quote) fail(`${file} has unclosed quote`);
  if (inComment) fail(`${file} has unclosed comment`);
  if (stack.length) fail(`${file} has unclosed ${stack.at(-1).ch} near index ${stack.at(-1).i}`);
}
checkCssBalance('src/styles.css');

const main = read('src/main.ts');
const styles = read('src/styles.css');
const village = read('src/villageWorld.ts');
for (const token of [
  'this.installV2182VillageFishingLayoutStabilityPass();',
  'installV2182VillageFishingLayoutStabilityPass',
  'dataset.v2182VillageFishingLayoutStability',
  'v2182-village-fishing-layout-stability-root',
  'entry-camera-no-soft-follow-fight-joystick-label-free',
  'v2182-joystick-clean',
  'visual-only-no-text',
  'v2182-hud-expedition-gap',
  'plus-1px-breathing-room-no-menu-overlap',
  'v2182-fishing-layout-stability-screen',
  'info-left-in-bounds-gauge-cleans-after-catch-bite-separated-result-contained',
  'v2182-sea-lane-card',
  'left-safe-full-width-readable-no-offscreen',
  'v2182-fishing-loadout',
  'left-below-waterway-wide-readable-no-cutoff',
  'v2182-loadout-cell',
  'rod-bait-icon-text-readable-three-lines',
  'v2182-battle-strip',
  'hidden-after-catch-or-prep',
  'v2182-reel-console',
  'fishing-gauge-not-reeling',
  'v2182-bite-callout',
  'raised-signal-method-separated',
  'bite-callout-priority',
  'v2182-result-card',
  'contained-buttons-consistent-no-overflow',
  'v2182OverlapGuard',
  'v2182-long-frame-observed',
]) if (!main.includes(token)) fail(`src/main.ts missing ${token}`);
if (main.includes('<span>MOVE · WASD</span>')) fail('joystick text must be removed from village markup');
for (const token of [
  '/* v2.1.82: village no-tremble polish',
  '.v2182-joystick-clean > :is(span, small, em, strong)',
  '.v2097-joystick > span',
  '.v2182-hud-expedition-gap.v2097-village-hud',
  '.v2182-hud-expedition-gap.v2097-expedition-board:not(.open)',
  'body[data-screen="fishing"] .v2182-sea-lane-card',
  'left: var(--v2182-info-left) !important;',
  'width: var(--v2182-loadout-width) !important;',
  '.v2182-fishing-loadout',
  '.v2182-loadout-cell',
  '-webkit-line-clamp: unset !important;',
  '.v2182-fishing-layout-stability-screen:not([data-v2182-fishing-phase="reeling"]) :is(.v2182-battle-strip,.v2182-reel-console,.reel-panel,.v2055-reel-panel,.v2053-reel-touch-zone)',
  '.v2182-fishing-layout-stability-screen[data-v2182-fishing-phase="reeling"] .v2182-battle-strip',
  'top: var(--v2182-gauge-top) !important;',
  '.v2182-bite-callout',
  'top: 43% !important;',
  '.v2182-result-card',
  'grid-template-columns: repeat(2, minmax(0, 1fr)) !important;',
  '@media (prefers-reduced-motion: reduce)',
]) if (!styles.includes(token)) fail(`src/styles.css missing ${token}`);
for (const token of [
  '## v2.1.82 변경사항',
  '마을 화면 떨림',
  '조이스틱의 `MOVE · WASD` 글씨를 실제 마크업에서 제거',
  'HUD와 개척 바 사이에는 기존보다 +1px 여백',
  'gauge cleanup guard',
  '물고기 포획 결과창',
]) if (!read('README.md').includes(token)) fail(`README.md missing ${token}`);
for (const token of [
  'keyboardMoveKeys',
  'bindKeyboardMovement',
  "return 'AW 11시';",
  "return 'WD 1시';",
  "return 'AS 7시';",
  "return 'SD 5시';",
  'V2151_DIAMOND_TOUCH_SCORE_LIMIT = 0.926',
  'const TILE_W = 80',
  'const TILE_H = 40',
  'V2129_PLAYER_FILENAME_DIRECTION_LOCK',
  './assets/v2129/characters/player/player_${direction}_frame_${String(index + 1).padStart(2, \'0\')}.png',
  "east: 'east'",
  "west: 'west'",
  "northeast: 'northeast'",
  "northwest: 'northwest'",
  'v2182VillageEntryCameraLock',
  'centered-once-no-tremble',
  'cameraFollowUntil = 0;',
]) if (!village.includes(token)) fail(`src/villageWorld.ts missing ${token}`);
const playerMap = village.match(/const PLAYER_ACTOR_DIRECTION_TEXTURE_FIX:[\s\S]*?};/);
if (!playerMap) fail('PLAYER_ACTOR_DIRECTION_TEXTURE_FIX block missing');
if (/east:\s*'west'|west:\s*'east'|northeast:\s*'northwest'|northwest:\s*'northeast'/.test(playerMap[0])) fail('player direction map must not swap east/west or diagonals');
if (/poster\s*=\s*["']\.\/assets\/v2120\/opening\/aqua_opening_poster_v2120\.jpg/.test(main) || /aqua_opening_poster_v2120\.jpg/.test(read('index.html'))) fail('opening video must not use poster image');
if (/scaleX\s*\(\s*-1\s*\)|flipX|mirror|alias.*east|alias.*west/i.test(main)) fail('direction code must not introduce flip or alias regression');
const directions = ['south','southeast','east','northeast','north','northwest','west','southwest'];
const playerDir = 'public/assets/v2129/characters/player';
for (const direction of directions) for (let frame = 1; frame <= 4; frame += 1) assertFile(`${playerDir}/player_${direction}_frame_${String(frame).padStart(2, '0')}.png`);
const hashManifest = json(`${playerDir}/player_frame_hashes_v2129.json`);
if (Object.keys(hashManifest).length !== 32) fail('player hash manifest must contain exactly 32 frames');
for (const [name, hash] of Object.entries(hashManifest)) { const rel = `${playerDir}/${name}`; assertFile(rel); if (sha256(rel) !== hash) fail(`player frame hash changed: ${name}`); }
if (sha256(`${playerDir}/player_east_frame_01.png`) === sha256(`${playerDir}/player_west_frame_01.png`)) fail('east and west player frames must not be identical');
const npcDir = 'public/assets/v2023/characters';
for (const role of ['chief', 'merchant', 'guild', 'captain', 'tourist', 'vip']) for (const direction of directions) assertFile(`${npcDir}/${role}_${direction}.png`);
console.log('[v2182] village no-tremble, joystick text removal, HUD +1px gap, fishing info bounds/gauge cleanup/bite/result layout, and direction/package checks passed');
