import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root = process.cwd();
const fail = (msg) => { console.error(`[v2189] ${msg}`); process.exit(1); };
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const json = (file) => JSON.parse(read(file));
const assertIncludes = (file, token) => { if (!read(file).includes(token)) fail(`${file} missing ${token}`); };
const assertFile = (file) => { if (!exists(file)) fail(`missing file: ${file}`); };
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');

const pkg = json('package.json');
const lock = json('package-lock.json');
if (pkg.version !== '2.1.89') fail(`package.json version is ${pkg.version}`);
if (lock.version !== '2.1.89' || lock.packages?.['']?.version !== '2.1.89') fail('package-lock.json version mismatch');
if (!pkg.scripts?.validate?.includes('check-v2189-premium-design-engine-sweep.mjs')) fail('validate script must run v2.1.89 guard');
assertIncludes('src/data.ts', "APP_VERSION = '2.1.89'");
assertIncludes('src/data.ts', 'aqua-fantasia-v2.1.89-premium-design-engine-sweep');
assertIncludes('public/sw.js', 'aqua-fantasia-v2.1.89-premium-design-engine-sweep');
assertIncludes('public/offline.html', 'v2.1.89');
assertIncludes('README.md', '# AquaFantasia v2.1.89');
assertIncludes('README.md', '## v2.1.89 변경사항');
assertIncludes('README.md', '## v2.1.88 변경사항');
assertIncludes('index.html', './assets/v2120/opening/aqua_opening_v2120.mp4');
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
  'this.installV2189PremiumDesignEngineSweepPass();',
  'installV2189PremiumDesignEngineSweepPass',
  'dataset.v2189PremiumDesignEngineSweep',
  'v2189-premium-ocean-glass-root',
  'premium-ocean-glass-design-fishing-system-upgrade',
  'v2189-fishing-studio-screen',
  'ocean-glass-shelf-bite-result-no-overlap',
  'v2189-sea-lane-card',
  'v2189-fishing-loadout',
  'v2189-loadout-cell',
  'v2189-loadout-copy',
  'v2189-readable-copy',
  'v2189-bite-callout',
  'v2189-focused-phase-no-overlap',
  'v2189-gauge-ghost-cleanup',
  'v2189-result-card',
  'v2189-result-rarity-compact',
  'v2189-result-impact',
  'v2189-village-paint-stability-screen',
  'v2189-hud-frontier-gap',
  'v2189-premium-ocean-card',
  'v2189-readable-input',
]) if (!main.includes(token)) fail(`src/main.ts missing ${token}`);
for (const token of [
  '/* v2.1.89: premium ocean glass design/system sweep',
  'html.v2189-premium-ocean-glass-root',
  'body[data-screen="fishing"] .v2189-sea-lane-card',
  '.v2189-fishing-loadout',
  '.v2189-loadout-cell',
  '.v2189-loadout-copy',
  '.v2189-readable-copy',
  '-webkit-line-clamp: unset !important;',
  '.v2189-bite-callout',
  'top: var(--v2189-bite-top) !important;',
  'data-v2189-fishing-phase="bite"',
  '.v2189-gauge-ghost-node',
  'body:not([data-screen="fishing"])',
  '.v2189-result-card',
  '.v2189-result-rarity-compact',
  '.v2189-result-impact',
  'grid-template-columns: repeat(2, minmax(0, 1fr)) !important;',
  '.v2189-premium-ocean-card',
  '.v2189-readable-input',
  '.v2189-village-stage-stable',
  '@media (prefers-reduced-motion: reduce)',
]) if (!styles.includes(token)) fail(`src/styles.css missing ${token}`);
for (const token of [
  '## v2.1.89 변경사항',
  '프리미엄 오션 글래스 디자인',
  '낚시 준비 화면의 바다물길/낚싯대/미끼 정보 선반',
  '입질 단계의 `물었다!` 콜아웃',
  '낚시 성공 결과창',
  '오프닝 영상 단독 시작',
  '오프닝 poster 미사용',
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
if (/poster\s*=\s*["']\.\/assets\/v2120\/opening\/aqua_opening_poster_v2120\.jpg/.test(main) || /aqua_opening_poster_v2120\.jpg/.test(read('index.html'))) fail('opening video must not use poster image');
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
console.log('[v2189] premium ocean glass design, fishing shelf/bite/result, village stability, opening/player direction/package checks passed');
