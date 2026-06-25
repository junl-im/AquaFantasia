import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const fail = (msg) => { console.error(`[v2155] ${msg}`); process.exit(1); };
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const json = (file) => JSON.parse(read(file));
const assertIncludes = (file, token) => { if (!read(file).includes(token)) fail(`${file} missing ${token}`); };
const assertFile = (file) => { if (!exists(file)) fail(`missing file: ${file}`); };
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');

const pkg = json('package.json');
const lock = json('package-lock.json');
if (pkg.version !== '2.1.55') fail(`package.json version is ${pkg.version}`);
if (lock.version !== '2.1.55' || lock.packages?.['']?.version !== '2.1.55') fail('package-lock.json version mismatch');
if (!pkg.scripts?.validate?.includes('check-v2155-menu-fishing-core-visibility.mjs')) fail('validate script must run v2.1.55 guard');
assertIncludes('src/data.ts', "APP_VERSION = '2.1.55'");
assertIncludes('src/data.ts', 'aqua-fantasia-v2.1.55-micro-top-menu-fishing-core-gauge');
assertIncludes('public/sw.js', 'aqua-fantasia-v2.1.55-micro-top-menu-fishing-core-gauge');
assertIncludes('public/offline.html', 'v2.1.55');
assertIncludes('README.md', '# AquaFantasia v2.1.55');
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
  'dataset.v2155MenuFishingCoreVisibility',
  'v2155-menu-fishing-core-visibility-root',
  'v2155-world-controls',
  'data-v2155-primary-order="plus-minus-build-center-shop-sail"',
  'v2155-fishing-focus-screen',
  'v2155-battle-strip',
  'data-v2155-catch-bar',
  'data-v2155-tension-bar',
  'data-v2155-stamina-bar',
  'data-v2155-safe-window',
  'v2155-reel-panel',
  'v2155-reel-console',
  'v2155-reel-touch-zone',
  'data-v2155-bite-action',
]) if (!main.includes(token)) fail(`src/main.ts missing ${token}`);

for (const token of [
  '--v2155-menu-cell: 22px;',
  '--v2155-menu-gap-x: 15px;',
  'grid-template-columns: repeat(3, var(--v2155-menu-cell)) !important;',
  'width: var(--v2155-menu-cell) !important;',
  'height: var(--v2155-menu-cell) !important;',
  'button > span:last-child',
  'clip: rect(0 0 0 0) !important;',
  '.v2155-battle-strip',
  'bottom: calc(var(--v2155-safe-bottom) + 102px) !important;',
  'z-index: 650 !important;',
  '.v2155-reel-panel:not(.hidden)',
  'display: none !important;',
  '.v2155-reel-console:not(.hidden)',
  'z-index: 640 !important;',
  '.v2155-reel-touch-zone',
]) if (!styles.includes(token)) fail(`src/styles.css missing ${token}`);

for (const token of [
  '22px급 마이크로 아이콘 셀',
  '포획/텐션/저항 게이지를 감기/풀기 버튼 바로 위에 고정',
  '다이아몬드 터치 점수만 `0.932`',
]) if (!readme.includes(token)) fail(`README.md missing ${token}`);

for (const token of [
  'V2151_DIAMOND_TOUCH_SCORE_LIMIT = 0.932',
  'bestScore <= V2151_DIAMOND_TOUCH_SCORE_LIMIT',
  'v2155-menu-fishing-core-touch-cautious-no-tile-shrink',
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

if (sha256(`${playerDir}/player_east_frame_01.png`) === sha256(`${playerDir}/player_west_frame_01.png`)) fail('east and west player frames must not be identical');
if (/scaleX\s*\(\s*-1\s*\)|flipX|mirror|alias.*east|alias.*west/i.test(main)) fail('player/NPC direction code must not introduce flip or alias regression');
if (!main.includes('shouldPlayOpening') || !main.includes('openingIntroShown')) fail('opening video first-start gating missing');
if (!main.includes('v2130-build-confirm') || !main.includes('data-v2130-build-confirm-apply')) fail('construction confirm flow missing');

console.log('[v2155] micro top menu and fishing core gauge visibility passed');
