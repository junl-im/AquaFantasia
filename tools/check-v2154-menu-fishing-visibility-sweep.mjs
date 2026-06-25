import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const fail = (msg) => { console.error(`[v2154] ${msg}`); process.exit(1); };
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const json = (file) => JSON.parse(read(file));
const assertIncludes = (file, token) => { if (!read(file).includes(token)) fail(`${file} missing ${token}`); };
const assertFile = (file) => { if (!exists(file)) fail(`missing file: ${file}`); };
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');

const pkg = json('package.json');
const lock = json('package-lock.json');
if (pkg.version !== '2.1.54') fail(`package.json version is ${pkg.version}`);
if (lock.version !== '2.1.54' || lock.packages?.['']?.version !== '2.1.54') fail('package-lock.json version mismatch');
if (!pkg.scripts?.validate?.includes('check-v2154-menu-fishing-visibility-sweep.mjs')) fail('validate script must run v2.1.54 guard');
assertIncludes('src/data.ts', "APP_VERSION = '2.1.54'");
assertIncludes('src/data.ts', 'aqua-fantasia-v2.1.54-mini-top-menu-visible-fishing-gauges');
assertIncludes('public/sw.js', 'aqua-fantasia-v2.1.54-mini-top-menu-visible-fishing-gauges');
assertIncludes('public/offline.html', 'v2.1.54');
assertIncludes('README.md', '# AquaFantasia v2.1.54');
if (exists('APP_VERSION')) fail('root APP_VERSION file must not exist');

const rootMarkdown = fs.readdirSync(root).filter((name) => /\.md$/i.test(name));
if (rootMarkdown.length !== 1 || rootMarkdown[0] !== 'README.md') fail(`root markdown must be README.md only: ${rootMarkdown.join(', ')}`);
for (const name of ['dist', 'reports', 'backup', 'logs', '_NOTES', 'AquaFantasia_backup_v1']) {
  if (exists(name)) fail(`forbidden generated folder/file found: ${name}`);
}
if (exists('node_modules') && !fs.statSync(path.join(root, 'node_modules')).isDirectory()) fail('node_modules must be a directory when present');

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
const village = read('src/villageWorld.ts');
const readme = read('README.md');

for (const token of [
  'dataset.v2154MenuFishingVisibilitySweep',
  'v2154-menu-fishing-visibility-sweep-root',
  'v2154-world-controls',
  'data-v2154-primary-order="plus-minus-build-center-shop-sail"',
  'v2154-fishing-focus-screen',
  'v2154-battle-strip',
  'data-v2154-catch-bar',
  'data-v2154-tension-bar',
  'data-v2154-stamina-bar',
  'data-v2154-safe-window',
  'v2154-reel-panel',
  'v2154-reel-console',
  'v2154-reel-touch-zone',
  'data-v2154-bite-action',
]) if (!main.includes(token)) fail(`src/main.ts missing ${token}`);

for (const token of [
  '--v2154-menu-cell: 24px;',
  '--v2154-menu-gap-x: 12px;',
  'grid-template-columns: repeat(3, var(--v2154-menu-cell)) !important;',
  'background: transparent !important;',
  'width: var(--v2154-menu-cell) !important;',
  'height: var(--v2154-menu-cell) !important;',
  'button > span:last-child',
  'clip: rect(0 0 0 0) !important;',
  '.v2154-battle-strip',
  'z-index: 560 !important;',
  'height: 16px !important;',
  '.v2154-reel-console:not(.hidden)',
  'z-index: 540 !important;',
  '.v2154-reel-touch-zone',
  'display: none !important;',
]) if (!styles.includes(token)) fail(`src/styles.css missing ${token}`);

for (const token of [
  '초소형 24px 셀',
  '포획/텐션/저항 게이지가 조작 버튼 위에 항상 보이도록',
  '다이아몬드 터치 점수만 `0.934`',
]) if (!readme.includes(token)) fail(`README.md missing ${token}`);

for (const token of [
  'V2151_DIAMOND_TOUCH_SCORE_LIMIT = 0.934',
  'bestScore <= V2151_DIAMOND_TOUCH_SCORE_LIMIT',
  'v2154-menu-fishing-visibility-touch-cautious-no-tile-shrink',
  'const TILE_W = 80',
  'const TILE_H = 40',
]) if (!village.includes(token)) fail(`src/villageWorld.ts missing ${token}`);

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
const playerMap = village.match(/const PLAYER_ACTOR_DIRECTION_TEXTURE_FIX:[\s\S]*?};/);
const npcMap = village.match(/const ACTOR_DIRECTION_TEXTURE_FIX:[\s\S]*?};/);
if (!playerMap || !npcMap) fail('player or NPC direction map missing');
if (/east:\s*'west'|west:\s*'east'|northeast:\s*'northwest'|northwest:\s*'northeast'|southeast:\s*'southwest'|southwest:\s*'southeast'/.test(playerMap[0] + npcMap[0])) fail('direction map must not swap or mirror directions');
for (const direction of directions) {
  if (!playerMap[0].includes(`${direction}: '${direction}'`)) fail(`player map is not identity for ${direction}`);
  if (!npcMap[0].includes(`${direction}: '${direction}'`)) fail(`NPC map is not identity for ${direction}`);
}

for (const token of [
  'openingIntroPending && !this.openingIntroShown',
  'direct-route-no-opening-video',
  'showBuildConfirm({ type: this.selectedBuild',
  'applyPendingBuildPlacement',
  '빨간 풋프린트 위치에는 놓을 수 없습니다',
]) if (!main.includes(token) && !village.includes(token)) fail(`regression guard missing ${token}`);

console.log('[v2154] mini menu and always-visible fishing gauges passed');
