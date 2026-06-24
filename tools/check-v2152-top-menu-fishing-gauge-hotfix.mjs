import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const fail = (msg) => { console.error(`[v2152] ${msg}`); process.exit(1); };
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const json = (file) => JSON.parse(read(file));
const assertIncludes = (file, token) => { if (!read(file).includes(token)) fail(`${file} missing ${token}`); };
const assertFile = (file) => { if (!exists(file)) fail(`missing file: ${file}`); };
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');

const pkg = json('package.json');
const lock = json('package-lock.json');
if (pkg.version !== '2.1.52') fail(`package.json version is ${pkg.version}`);
if (lock.version !== '2.1.52' || lock.packages?.['']?.version !== '2.1.52') fail('package-lock.json version mismatch');
if (!pkg.scripts?.validate?.includes('check-v2152-top-menu-fishing-gauge-hotfix.mjs')) fail('validate script must run v2.1.52 guard');
assertIncludes('src/data.ts', "APP_VERSION = '2.1.52'");
assertIncludes('src/data.ts', 'aqua-fantasia-v2.1.52-compact-top-menu-visible-fishing-gauge');
assertIncludes('public/sw.js', 'aqua-fantasia-v2.1.52-compact-top-menu-visible-fishing-gauge');
assertIncludes('public/offline.html', 'v2.1.52');
assertIncludes('README.md', '# AquaFantasia v2.1.52');
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
  'dataset.v2152TopMenuFishingGaugeHotfix',
  'v2152-compact-menu-fishing-gauge-root',
  'v2152-world-controls',
  'data-v2152-primary-order="plus-minus-build-center-shop-sail"',
  'v2152-fishing-focus-screen',
  'v2152-fishing-stage',
  'v2152-reel-panel',
  'v2152-reel-console',
  'v2152-reel-touch-zone',
  'v2152-bottom-nav',
  'data-v2152-bite-action',
]) if (!main.includes(token)) fail(`src/main.ts missing ${token}`);

for (const token of [
  'grid-template-columns: repeat(3, 31px) !important;',
  'grid-auto-rows: 31px !important;',
  'gap: 8px !important;',
  'max-width: 112px !important;',
  'width: 31px !important;',
  'height: 31px !important;',
  'background: transparent !important;',
  '.v2152-fishing-focus-screen[data-fishing-phase="reeling"] .v2152-reel-panel .v2073-fishing-gauges',
  'position: fixed !important;',
  'z-index: 120 !important;',
  '.v2152-reel-console .v2055-reel-actions',
  'grid-template-columns: repeat(2, minmax(0, 1fr)) !important;',
  '.v2152-reel-touch-zone',
  'display: none !important;',
]) if (!styles.includes(token)) fail(`src/styles.css missing ${token}`);

for (const token of [
  '우측 상단 마을 메뉴바를 핫픽스했습니다',
  '포획/텐션/저항 게이지가 화면 상단 고정 카드로 항상 보이게',
  '감기/풀기 버튼은 하단 고정 콘솔',
  '다이아몬드 터치 점수만 `0.938`',
]) if (!readme.includes(token)) fail(`README.md missing ${token}`);

for (const token of [
  'V2151_DIAMOND_TOUCH_SCORE_LIMIT = 0.938',
  'bestScore <= V2151_DIAMOND_TOUCH_SCORE_LIMIT',
  'v2152-compact-menu-fishing-gauge-touch-cautious-no-tile-shrink',
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

console.log('[v2152] compact top menu and visible fishing gauge hotfix passed');
