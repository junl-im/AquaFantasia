import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root = process.cwd();
const fail = (msg) => { console.error(`[v2171] ${msg}`); process.exit(1); };
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const json = (file) => JSON.parse(read(file));
const assertIncludes = (file, token) => { if (!read(file).includes(token)) fail(`${file} missing ${token}`); };
const assertFile = (file) => { if (!exists(file)) fail(`missing file: ${file}`); };
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');

const pkg = json('package.json');
const lock = json('package-lock.json');
if (pkg.version !== '2.1.71') fail(`package.json version is ${pkg.version}`);
if (lock.version !== '2.1.71' || lock.packages?.['']?.version !== '2.1.71') fail('package-lock.json version mismatch');
if (!pkg.scripts?.validate?.includes('check-v2171-fishing-layout-engine.mjs')) fail('validate script must run v2.1.71 guard');
assertIncludes('src/data.ts', "APP_VERSION = '2.1.71'");
assertIncludes('src/data.ts', 'aqua-fantasia-v2.1.71-fishing-layout-engine');
assertIncludes('public/sw.js', 'aqua-fantasia-v2.1.71-fishing-layout-engine');
assertIncludes('public/offline.html', 'v2.1.71');
assertIncludes('README.md', '# AquaFantasia v2.1.71');
assertIncludes('README.md', '## v2.1.71 변경사항');
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
    else if (closers.has(ch)) {
      const open = stack.pop();
      if (!open || pairs[open.ch] !== ch) fail(`${file} bracket mismatch near index ${i}`);
    }
  }
  if (quote) fail(`${file} has unclosed quote`);
  if (inComment) fail(`${file} has unclosed comment`);
  if (stack.length) fail(`${file} has unclosed ${stack.at(-1).ch} near index ${stack.at(-1).i}`);
}
checkCssBalance('src/styles.css');

const main = read('src/main.ts');
const styles = read('src/styles.css');
const toast = read('src/toast.ts');
const village = read('src/villageWorld.ts');
const readme = read('README.md');

for (const token of [
  'dataset.v2171FishingLayoutEngine',
  'v2171-fishing-layout-engine-root',
  'installV2171FishingLayoutEnginePass',
  'v2171-fishing-layout-screen',
  'v2171FishingLayout',
  'left-loadout-under-sea-lane-center-gauge-bottom-button-no-bite-overlap',
  'v2171-sea-lane-card',
  'v2171-fishing-loadout',
  'v2171-loadout-cell',
  'v2171-battle-strip',
  'center-upper-gauge-lane-separated-from-bottom-button',
  'v2171-reel-console',
  'bottom-single-button-lane',
  'v2171-single-reel-button',
  'v2171-release-hidden',
  'v2171-bite-callout',
  'single-center-signal-no-copy-overlap',
  'v2171-action-badge',
  'v2171-result-card',
  'v2171-result-actions',
  'v2171LegacyFishingFragmentBlocked',
  'v2171EngineContainment',
  'v2171-img-decode',
  'this.installV2171FishingLayoutEnginePass();',
]) if (!main.includes(token)) fail(`src/main.ts missing ${token}`);

for (const token of [
  '/* v2.1.71: fishing layout engine upgrade',
  'html.v2171-fishing-layout-engine-root body[data-screen="fishing"] .v2171-sea-lane-card',
  'left: calc(env(safe-area-inset-left, 0px) + 14px) !important;',
  'top: calc(env(safe-area-inset-top, 0px) + 56px) !important;',
  'html.v2171-fishing-layout-engine-root body[data-screen="fishing"] .v2171-fishing-layout-screen:not([data-fishing-phase="reeling"]):not([data-fishing-phase="bite"]) .v2171-fishing-loadout',
  'grid-template-columns: 1fr !important;',
  'grid-template-columns: 38px minmax(0, 1fr) !important;',
  'html.v2171-fishing-layout-engine-root body[data-screen="fishing"] .v2171-bite-callout',
  'single-center-signal-no-copy-overlap',
  'html.v2171-fishing-layout-engine-root body[data-screen="fishing"] .v2171-fishing-layout-screen[data-fishing-phase="reeling"] .v2171-battle-strip',
  'top: clamp(168px, 44svh, calc(100svh - env(safe-area-inset-bottom, 0px) - 252px)) !important;',
  'bottom: auto !important;',
  'html.v2171-fishing-layout-engine-root body[data-screen="fishing"] .v2171-fishing-layout-screen[data-fishing-phase="reeling"] .v2171-reel-console:not(.hidden)',
  'bottom: calc(env(safe-area-inset-bottom, 0px) + 16px) !important;',
  'html.v2171-fishing-layout-engine-root .v2171-engine-card',
  'content-visibility: auto !important;',
]) if (!styles.includes(token)) fail(`src/styles.css missing ${token}`);

for (const token of [
  '## v2.1.71 변경사항',
  '감기 버튼은 하단 안전영역에 고정',
  '포획/텐션/저항 게이지는 중앙 위쪽 전용 레이어',
  '낚싯대/미끼 아이콘 칩',
  '`물었다!` 신호와 설명',
  '시스템/성능',
  'viewport 지표 CSS 변수',
  '플레이어 8방향 32프레임',
  '## v2.1.70 변경사항',
]) if (!readme.includes(token)) fail(`README.md missing ${token}`);

for (const token of [
  'keyboardMoveKeys',
  'bindKeyboardMovement',
  'keyboardMoveDirectionLabel',
  "return 'AW 11시';",
  "return 'WD 1시';",
  "return 'AS 7시';",
  "return 'SD 5시';",
  "this.root.dataset.v2169KeyboardMoveLock = 'wasd-eight-direction-joystick-parity-no-direction-flip'",
]) if (!village.includes(token)) fail(`src/villageWorld.ts missing ${token}`);

for (const token of [
  "this.root.dataset.v2169BriefToast = 'shop-purchase-simple-feedback'",
  'v2169-brief-toast',
  "card.dataset.v2169BriefToast = options.type === 'shop' ? 'shop-purchase-simple-feedback' : 'general-feedback'",
]) if (!toast.includes(token)) fail(`src/toast.ts missing ${token}`);

if (/poster\s*=\s*["']\.\/assets\/v2120\/opening\/aqua_opening_poster_v2120\.jpg/.test(main)) fail('opening video must not use poster image before playback');
if (/scaleX\s*\(\s*-1\s*\)|flipX|mirror|alias.*east|alias.*west/i.test(main)) fail('player/NPC direction code must not introduce flip or alias regression');

for (const token of [
  'V2151_DIAMOND_TOUCH_SCORE_LIMIT = 0.926',
  'bestScore <= V2151_DIAMOND_TOUCH_SCORE_LIMIT',
  'const TILE_W = 80',
  'const TILE_H = 40',
  'V2129_PLAYER_FILENAME_DIRECTION_LOCK',
  './assets/v2129/characters/player/player_${direction}_frame_${String(index + 1).padStart(2, \'0\')}.png',
  "player: './assets/v2129/characters/player/player_south_frame_01.png'",
  'return ACTOR_DIRECTIONS.every((direction) => playerActorVisualDirection(direction) === direction);',
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
for (const [name, hash] of Object.entries(hashManifest)) {
  const rel = `${playerDir}/${name}`;
  assertFile(rel);
  if (sha256(rel) !== hash) fail(`player frame hash changed: ${name}`);
}
if (sha256(`${playerDir}/player_east_frame_01.png`) === sha256(`${playerDir}/player_west_frame_01.png`)) fail('east and west player frames must not be identical');
const npcDir = 'public/assets/v2023/characters';
const npcRoles = ['chief', 'merchant', 'guild', 'captain', 'tourist', 'vip'];
for (const role of npcRoles) for (const direction of directions) assertFile(`${npcDir}/${role}_${direction}.png`);

console.log('[v2171] fishing layout engine, loadout/bite/gauge/button guards, performance containment, direction assets, and package guards passed');
