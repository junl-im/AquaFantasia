import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root = process.cwd();
const fail = (msg) => { console.error(`[v2177] ${msg}`); process.exit(1); };
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const json = (file) => JSON.parse(read(file));
const assertIncludes = (file, token) => { if (!read(file).includes(token)) fail(`${file} missing ${token}`); };
const assertFile = (file) => { if (!exists(file)) fail(`missing file: ${file}`); };
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');

const pkg = json('package.json');
const lock = json('package-lock.json');
if (pkg.version !== '2.1.77') fail(`package.json version is ${pkg.version}`);
if (lock.version !== '2.1.77' || lock.packages?.['']?.version !== '2.1.77') fail('package-lock.json version mismatch');
if (!pkg.scripts?.validate?.includes('check-v2177-opening-video-first-fix.mjs')) fail('validate script must run v2.1.77 guard');
assertIncludes('src/data.ts', "APP_VERSION = '2.1.77'");
assertIncludes('src/data.ts', 'aqua-fantasia-v2.1.77-opening-video-first-fix');
assertIncludes('public/sw.js', 'aqua-fantasia-v2.1.77-opening-video-first-fix');
assertIncludes('public/offline.html', 'v2.1.77');
assertIncludes('README.md', '# AquaFantasia v2.1.77');
assertIncludes('README.md', '## v2.1.77 변경사항');
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
const readme = read('README.md');
for (const token of [
  'dataset.v2177OpeningVideoFirstFix',
  'v2177-opening-video-first-fix-root',
  'this.installV2177OpeningVideoFirstFixPass();',
  'installV2177OpeningVideoFirstFixPass',
  'video-only-first-no-chrome-no-bubble',
  'v2177-opening-cinematic',
  'v2177-opening-video',
  'v2177-opening-status',
  'opening-video-first-no-bubble-no-village-chrome',
  'video-first-only-no-extra-screen',
  'posterless-eager-fullscreen-first',
  "video.removeAttribute('poster')",
  'webkit-playsinline',
  'v2177-village-ready-clean',
  'v2177-aqua-premium-card',
  'v2177-readable-input',
  'v2177-img-policy',
]) if (!main.includes(token)) fail(`src/main.ts missing ${token}`);
for (const token of [
  '/* v2.1.77: opening video first hotfix',
  'body[data-screen="village"] .village-world-screen[data-v2177-opening-video-first-fix="video-only-first-no-chrome-no-bubble"]',
  '> .v2-village-bg',
  '> .v2-village-stage',
  '.v2177-opening-cinematic',
  '.v2177-opening-video',
  '.v2177-opening-status',
  'height: 100svh !important;',
  'object-fit: cover !important;',
  'display: none !important;',
  'max-width: calc(100vw - 28px) !important;',
  'img[data-v2177-img-policy]',
]) if (!styles.includes(token)) fail(`src/styles.css missing ${token}`);
for (const token of [
  '## v2.1.77 변경사항',
  '시작 인트로를 로딩 진입 즉시 전체화면 영상만',
  '오프닝 중 말풍선, 비네트, 스킵 버튼, 우측 메뉴바',
  '게임 진입중',
  'poster 없이',
  '## v2.1.76 변경사항',
]) if (!readme.includes(token)) fail(`README.md missing ${token}`);
if (/poster\s*=\s*["']\.\/assets\/v2120\/opening\/aqua_opening_poster_v2120\.jpg/.test(main) || /aqua_opening_poster_v2120\.jpg/.test(read('index.html'))) fail('opening video must not use poster image');
if (/scaleX\s*\(\s*-1\s*\)|flipX|mirror|alias.*east|alias.*west/i.test(main)) fail('direction code must not introduce flip or alias regression');
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
const directions = ['south','southeast','east','northeast','north','northwest','west','southwest'];
const playerDir = 'public/assets/v2129/characters/player';
for (const direction of directions) for (let frame = 1; frame <= 4; frame += 1) assertFile(`${playerDir}/player_${direction}_frame_${String(frame).padStart(2, '0')}.png`);
const hashManifest = json(`${playerDir}/player_frame_hashes_v2129.json`);
if (Object.keys(hashManifest).length !== 32) fail('player hash manifest must contain exactly 32 frames');
for (const [name, hash] of Object.entries(hashManifest)) { const rel = `${playerDir}/${name}`; assertFile(rel); if (sha256(rel) !== hash) fail(`player frame hash changed: ${name}`); }
if (sha256(`${playerDir}/player_east_frame_01.png`) === sha256(`${playerDir}/player_west_frame_01.png`)) fail('east and west player frames must not be identical');
const npcDir = 'public/assets/v2023/characters';
for (const role of ['chief', 'merchant', 'guild', 'captain', 'tourist', 'vip']) for (const direction of directions) assertFile(`${npcDir}/${role}_${direction}.png`);
console.log('[v2177] opening video first hotfix, chrome gate, bubble overflow guard, UI polish, and direction/package guards passed');
