import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root = process.cwd();
const fail = (msg) => { console.error(`[v2194] ${msg}`); process.exit(1); };
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const json = (file) => JSON.parse(read(file));
const assertIncludes = (file, token) => { if (!read(file).includes(token)) fail(`${file} missing ${token}`); };
const assertFile = (file) => { if (!exists(file)) fail(`missing file: ${file}`); };
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');

const pkg = json('package.json');
const lock = json('package-lock.json');
if (pkg.version !== '2.1.94') fail(`package.json version is ${pkg.version}`);
if (lock.version !== '2.1.94' || lock.packages?.['']?.version !== '2.1.94') fail('package-lock.json version mismatch');
if (!pkg.scripts?.validate?.includes('check-v2194-opening-loadout-contract.mjs')) fail('validate script must run v2.1.94 guard');
assertIncludes('src/data.ts', "APP_VERSION = '2.1.94'");
assertIncludes('src/data.ts', 'aqua-fantasia-v2.1.94-opening-loadout-contract');
assertIncludes('public/sw.js', 'aqua-fantasia-v2.1.94-opening-loadout-contract');
assertIncludes('public/offline.html', 'v2.1.94');
assertIncludes('README.md', '# AquaFantasia v2.1.94');
assertIncludes('README.md', '## v2.1.94 변경사항');
assertIncludes('README.md', '## v2.1.93 변경사항');
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
  'this.installV2194IntroLoadoutPatchPass();',
  'installV2194IntroLoadoutPatchPass',
  'dataset.v2194IntroLoadoutPatch',
  'v2194-intro-loadout-root',
  'v2194-opening-cinematic',
  'v2194-opening-video',
  'native-play-mark-hidden',
  'no-controls-no-play-mark',
  'controlsList',
  'disablepictureinpicture',
  'disableremoteplayback',
  'v2194-fishing-thin-loadout-screen',
  'thin-top-two-column-rod-bait-bar',
  'v2194-fishing-loadout',
  'v2194-loadout-cell',
  'v2194-loadout-icon',
  'small-inline-rod-bait',
  'v2194-loadout-copy'
]) if (!main.includes(token)) fail(`src/main.ts missing ${token}`);
const renderOpening = main.slice(main.indexOf('root.innerHTML = `'), main.indexOf('<header class="v2097-village-hud'));
if (!renderOpening.includes('v2194-opening-video')) fail('opening render block must contain v2194 video');
if (/poster\s*=\s*["']/.test(renderOpening) || /aqua_opening_poster_v2120\.jpg/.test(main) || /aqua_opening_poster_v2120\.jpg/.test(read('index.html'))) fail('opening video must not use poster image');
if (!/removeAttribute\('controls'\)/.test(main)) fail('opening video controls must be removed');
for (const forbidden of ['v2177-opening-status', 'v2119-opening-bubble', 'v2120-opening-vignette', 'v2173-opening-skip', '바로 마을로', '게임 진입중']) {
  if (renderOpening.includes(forbidden)) fail(`opening render block must be video-only; found ${forbidden}`);
}
for (const token of [
  '/* v2.1.94: opening native play-mark suppression',
  'html.v2194-intro-loadout-root',
  '.v2194-opening-video::-webkit-media-controls-start-playback-button',
  '.v2194-opening-cinematic:not(.v2194-video-playing)',
  '.v2194-fishing-loadout',
  'grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;',
  '.v2194-loadout-cell',
  'grid-template-columns: var(--v2194-loadout-icon) minmax(0, 1fr) !important;',
  '--v2194-loadout-icon: 16px;',
  '.v2194-loadout-copy'
]) if (!styles.includes(token)) fail(`src/styles.css missing ${token}`);
for (const token of [
  '## v2.1.94 변경사항',
  '네이티브 컨트롤 잔상',
  '상단 얇은 가로 2분할 바',
  '15~16px급 작은 인라인 아이콘',
  'v2.1.94 전용 검증'
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
]) if (!village.includes(token)) fail(`src/villageWorld.ts missing ${token}`);
const playerMap = village.match(/const PLAYER_ACTOR_DIRECTION_TEXTURE_FIX:[\s\S]*?};/);
if (!playerMap) fail('PLAYER_ACTOR_DIRECTION_TEXTURE_FIX block missing');
if (/east:\s*'west'|west:\s*'east'|northeast:\s*'northwest'|northwest:\s*'northeast'/.test(playerMap[0])) fail('player direction map must not swap east/west or diagonals');
if (/scaleX\s*\(\s*-1\s*\)|flipX|mirror|alias.*east|alias.*west/i.test(main)) fail('direction code must not introduce flip or alias regression');
const directions = ['south','southeast','east','northeast','north','northwest','west','southwest'];
const playerDir = 'public/assets/v2129/characters/player';
for (const direction of directions) for (let frame = 1; frame <= 4; frame += 1) assertFile(`${playerDir}/player_${direction}_frame_${String(frame).padStart(2, '0')}.png`);
const hashManifest = json(`${playerDir}/player_frame_hashes_v2129.json`);
if (Object.keys(hashManifest).length !== 32) fail('player hash manifest must contain exactly 32 frames');
for (const [name, hash] of Object.entries(hashManifest)) {
  const rel = `${playerDir}/${name}`;
  assertFile(rel);
  if (sha256(rel) !== hash) fail(`player frame hash changed: ${name}`);
}
if (sha256(`${playerDir}/player_east_frame_01.png`) === sha256(`${playerDir}/player_west_frame_01.png`)) fail('east and west player frames must not be identical');
const npcDir = 'public/assets/v2023/characters';
for (const role of ['chief', 'merchant', 'guild', 'captain', 'tourist', 'vip']) for (const direction of directions) assertFile(`${npcDir}/${role}_${direction}.png`);
console.log('[v2194] opening native play mark suppression, thin fishing loadout, player direction, package checks passed');
