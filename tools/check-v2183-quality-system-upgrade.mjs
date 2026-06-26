import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root = process.cwd();
const fail = (msg) => { console.error(`[v2183] ${msg}`); process.exit(1); };
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const json = (file) => JSON.parse(read(file));
const assertIncludes = (file, token) => { if (!read(file).includes(token)) fail(`${file} missing ${token}`); };
const assertFile = (file) => { if (!exists(file)) fail(`missing file: ${file}`); };
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');

const pkg = json('package.json');
const lock = json('package-lock.json');
if (pkg.version !== '2.1.83') fail(`package.json version is ${pkg.version}`);
if (lock.version !== '2.1.83' || lock.packages?.['']?.version !== '2.1.83') fail('package-lock.json version mismatch');
if (!pkg.scripts?.validate?.includes('check-v2183-quality-system-upgrade.mjs')) fail('validate script must run v2.1.83 guard');
assertIncludes('src/data.ts', "APP_VERSION = '2.1.83'");
assertIncludes('src/data.ts', 'aqua-fantasia-v2.1.83-quality-system-upgrade');
assertIncludes('public/sw.js', 'aqua-fantasia-v2.1.83-quality-system-upgrade');
assertIncludes('public/offline.html', 'v2.1.83');
assertIncludes('README.md', '# AquaFantasia v2.1.83');
assertIncludes('README.md', '## v2.1.83 변경사항');
assertIncludes('README.md', '## v2.1.82 변경사항');
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
  'this.installV2183QualitySystemUpgradePass();',
  'installV2183QualitySystemUpgradePass',
  'dataset.v2183QualitySystemUpgrade',
  'v2183-quality-system-upgrade-root',
  'adaptive-fishing-info-stack-gauge-lifecycle-village-shake-card-performance',
  'v2183OpeningContract',
  'video-only-no-bubble-no-vignette-no-skip-no-poster',
  'v2183-village-stability-screen',
  'no-coordinate-touch-camera-visual-jitter-guard',
  'v2183-village-stage-stable',
  'transition-animation-suppressed-no-player-coordinate-change',
  'v2183-joystick-clean',
  'icon-only-no-label-touch-stable',
  'v2183-hud-expedition-breathing',
  'v2183-top-menu-cell',
  'v2183-fishing-system-screen',
  'adaptive-info-stack-lifecycle-cleanup-bite-result-safe',
  'v2183-sea-lane-card',
  'measured-height-left-safe-readable-full-card',
  'v2183-loadout-top',
  'v2183-fishing-loadout',
  'measured-below-waterway-wide-readable-no-cutoff',
  'v2183-loadout-cell',
  'rod-bait-icon-text-three-line-readable',
  'v2183-battle-strip',
  'hidden-lifecycle-cleanup-not-reeling',
  'v2183-reel-console',
  'v2183-gauge-lifecycle-cleanup',
  'v2183-bite-callout',
  'raised-signal-method-safe-scroll',
  'v2183-bite-not-active',
  'v2183-result-card',
  'centered-scroll-contained-actions-text-budget',
  'v2183OverlapGuard',
  'v2183-long-frame-observed',
  'v2183-premium-aqua-card',
  'v2183-img-policy',
]) if (!main.includes(token)) fail(`src/main.ts missing ${token}`);
for (const token of [
  '/* v2.1.83: quality/system upgrade',
  'html.v2183-quality-system-upgrade-root',
  '.v2183-joystick-clean > :is(span, small, em, strong)',
  '.v2183-top-menu-cell',
  'body[data-screen="fishing"] .v2183-sea-lane-card',
  'top: var(--v2183-loadout-top) !important;',
  '.v2183-fishing-system-screen:not([data-v2183-fishing-phase="reeling"]) :is(.v2183-battle-strip,.v2183-reel-console,.v2182-battle-strip,.v2182-reel-console,.reel-panel,.v2055-reel-panel,.v2053-reel-touch-zone)',
  '.v2183-fishing-system-screen[data-v2183-fishing-phase="reeling"] .v2183-battle-strip',
  'top: var(--v2183-gauge-top) !important;',
  '.v2183-bite-callout',
  'top: 41% !important;',
  '.v2183-result-card',
  'grid-template-columns: repeat(2, minmax(0, 1fr)) !important;',
  '.v2183-scroll-safe-content',
  '@media (prefers-reduced-motion: reduce)',
]) if (!styles.includes(token)) fail(`src/styles.css missing ${token}`);
for (const token of [
  '## v2.1.83 변경사항',
  'quality/system upgrade pass',
  '바다물길 카드의 실제 높이를 측정',
  'lifecycle cleanup guard',
  '마을 화면 떨림 방지',
  '오프닝 영상 최초 시작 전용 및 poster 미사용 정책',
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
console.log('[v2183] quality/system upgrade, adaptive fishing stack, gauge lifecycle cleanup, village shake guard, opening contract, card/performance, and direction/package checks passed');
