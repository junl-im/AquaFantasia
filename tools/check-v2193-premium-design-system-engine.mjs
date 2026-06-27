import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root = process.cwd();
const fail = (msg) => { console.error(`[v2193] ${msg}`); process.exit(1); };
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const json = (file) => JSON.parse(read(file));
const assertIncludes = (file, token) => { if (!read(file).includes(token)) fail(`${file} missing ${token}`); };
const assertFile = (file) => { if (!exists(file)) fail(`missing file: ${file}`); };
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');

const pkg = json('package.json');
const lock = json('package-lock.json');
if (pkg.version !== '2.1.93') fail(`package.json version is ${pkg.version}`);
if (lock.version !== '2.1.93' || lock.packages?.['']?.version !== '2.1.93') fail('package-lock.json version mismatch');
if (!pkg.scripts?.validate?.includes('check-v2193-premium-design-system-engine.mjs')) fail('validate script must run v2.1.93 guard');
assertIncludes('src/data.ts', "APP_VERSION = '2.1.93'");
assertIncludes('src/data.ts', 'aqua-fantasia-v2.1.93-premium-design-system-engine');
assertIncludes('public/sw.js', 'aqua-fantasia-v2.1.93-premium-design-system-engine');
assertIncludes('public/offline.html', 'v2.1.93');
assertIncludes('README.md', '# AquaFantasia v2.1.93');
assertIncludes('README.md', '## v2.1.93 변경사항');
assertIncludes('README.md', '## v2.1.92 변경사항');
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
  'this.installV2193PremiumDesignSystemEnginePass();',
  'installV2193PremiumDesignSystemEnginePass',
  'dataset.v2193PremiumDesignSystemEngine',
  'active-screen-premium-layout-no-overlap',
  'v2193-premium-design-system-root',
  'v2193-opening-cinematic',
  'v2193-opening-video',
  'video-only-first-frame-no-pre-ui',
  'v2193-fishing-design-screen',
  'measured-compact-loadout-bite-result-premium',
  'v2193-loadout-cell',
  'v2193-loadout-icon',
  'rod-bait-icon-smaller-premium-readable',
  'v2193-loadout-copy',
  'v2193-bite-callout',
  'v2193-result-card',
  'v2193-premium-card',
  'v2193-non-reeling-cleanup'
]) if (!main.includes(token)) fail(`src/main.ts missing ${token}`);
const startBlock = main.slice(main.indexOf('private async startGame'), main.indexOf('private armStartScreenReveal'));
if (startBlock.indexOf('this.renderVillage();') < 0) fail('startGame must render village/opening video directly');
if (startBlock.indexOf('this.renderVillage();') > startBlock.indexOf('this.enterImmersiveMode()')) fail('startGame must render opening video before immersive mode');
const renderOpening = main.slice(main.indexOf('root.innerHTML = `'), main.indexOf('<header class="v2097-village-hud'));
for (const forbidden of ['v2177-opening-status', 'v2119-opening-bubble', 'v2120-opening-vignette', 'v2173-opening-skip', '바로 마을로', '게임 진입중']) {
  if (renderOpening.includes(forbidden)) fail(`opening render block must be video-only; found ${forbidden}`);
}
if (/poster\s*=\s*["']/.test(renderOpening) || /aqua_opening_poster_v2120\.jpg/.test(main) || /aqua_opening_poster_v2120\.jpg/.test(read('index.html'))) fail('opening video must not use poster image');
for (const token of [
  '/* v2.1.93: premium design system engine',
  'html.v2193-premium-design-system-root',
  '.v2193-opening-cinematic',
  '.v2193-opening-video',
  '.v2193-sea-lane-card',
  '.v2193-loadout-cell',
  'grid-template-columns: var(--v2193-loadout-track) minmax(0, 1fr) !important;',
  '.v2193-loadout-icon',
  'width: var(--v2193-loadout-icon) !important;',
  '.v2193-bite-callout',
  'top: var(--v2193-bite-top) !important;',
  '.v2193-result-card',
  '.v2193-premium-card',
  'prefers-reduced-motion'
]) if (!styles.includes(token)) fail(`src/styles.css missing ${token}`);
for (const token of [
  '## v2.1.93 변경사항',
  '활성 화면 기준',
  '낚싯대/미끼 아이콘을 더 작게',
  '프리미엄 오션 글래스',
  'v2.1.93 전용 검증'
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
console.log('[v2193] premium design system engine, fishing layout, opening contract, player direction, package checks passed');
