import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const fail = (message) => { console.error(`[v2150] ${message}`); process.exit(1); };
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const readJson = (file) => JSON.parse(read(file));
const assertFile = (file) => { if (!fs.existsSync(path.join(root, file))) fail(`missing file: ${file}`); };
const assertIncludes = (file, needle, label = needle) => { if (!read(file).includes(needle)) fail(`${file} missing ${label}`); };
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');

const pkg = readJson('package.json');
const lock = readJson('package-lock.json');
if (pkg.version !== '2.1.50') fail(`package.json version is ${pkg.version}`);
if (lock.version !== '2.1.50' || lock.packages?.['']?.version !== '2.1.50') fail('package-lock.json version mismatch');
if (!pkg.scripts?.validate?.includes('check-v2150-ui-overlap-placement-beauty-polish.mjs')) fail('validate script must run v2.1.50 guard');
assertIncludes('src/data.ts', "APP_VERSION = '2.1.50'", 'APP_VERSION 2.1.50');
assertIncludes('src/data.ts', 'aqua-fantasia-v2.1.50-ui-overlap-placement-beauty-polish', 'v2.1.50 cache name');
assertIncludes('public/sw.js', 'aqua-fantasia-v2.1.50-ui-overlap-placement-beauty-polish', 'service worker cache');
assertIncludes('public/offline.html', 'v2.1.50', 'offline badge');
assertIncludes('README.md', '# AquaFantasia v2.1.50', 'README title');
if (fs.existsSync(path.join(root, 'APP_VERSION'))) fail('root APP_VERSION file must not exist');

const rootMarkdown = fs.readdirSync(root).filter((name) => /\.md$/i.test(name));
if (rootMarkdown.length !== 1 || rootMarkdown[0] !== 'README.md') fail(`root markdown must be README.md only: ${rootMarkdown.join(', ')}`);
for (const name of ['dist', 'reports', 'backup', 'logs', '_NOTES', 'AquaFantasia_backup_v1']) {
  if (fs.existsSync(path.join(root, name))) fail(`forbidden generated folder/file found: ${name}`);
}
if (fs.existsSync(path.join(root, 'node_modules')) && !fs.statSync(path.join(root, 'node_modules')).isDirectory()) fail('node_modules must be a directory when present');
const gitignore = read('.gitignore');
for (const token of ['node_modules/', 'dist/', 'reports/', 'backup/', 'logs/', '_NOTES/', 'APP_VERSION', '*.log', 'npm-install.log']) {
  if (!gitignore.includes(token)) fail(`.gitignore missing ${token}`);
}
try {
  const output = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  const bad = output.split('\0').filter(Boolean).map((f) => f.replace(/\\/g, '/')).filter((file) => (
    file === 'APP_VERSION' || file === 'npm-install.log' || file.endsWith('.log') ||
    file.startsWith('node_modules/') || file.startsWith('dist/') || file.startsWith('reports/') ||
    file.startsWith('backup/') || file.startsWith('logs/') || file.startsWith('_NOTES/') || /^AquaFantasia_backup/i.test(file)
  ));
  if (bad.length) fail(`generated artifact is tracked by git: ${bad.slice(0, 20).join(', ')}`);
} catch {}

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
const village = read('src/villageWorld.ts');
const styles = read('src/styles.css');
const readme = read('README.md');

for (const token of [
  'dataset.v2150UiOverlapPlacementBeauty',
  'v2150-ui-overlap-placement-beauty-root',
  'v2150-world-controls',
  'data-v2150-primary-order="plus-minus-build-center-shop-sail"',
  'v2150-runtime-page-shell',
  'data-v2150-page-title-clean="true"',
  'v2150-bottom-nav',
  'transparent-wrapper-balanced-gap-clean-icons',
  'v2150-fishing-focus-screen',
  'v2150-fishing-stage',
  'v2150-fishing-hud',
  'v2150-sea-lane-card',
  'v2150-fishing-loadout',
  'v2150-fishing-coach',
  'v2150-bite-action',
  'data-v2150-bite-action',
  'v2150-reel-panel',
  'v2150-reel-console',
  'v2150-reel-touch-zone',
  'v2150-cast-button',
]) if (!main.includes(token)) fail(`src/main.ts missing v2.1.50 token: ${token}`);
if (/mountBottomNav\(root,\s*['"]fishing['"]\)/.test(main)) fail('fishing screen must not mount bottom nav');
if (main.includes('뿅') || main.includes('퐁!')) fail('unnatural fishing pop message remains');

for (const token of [
  'V2150_UI_OVERLAP_PLACEMENT_BEAUTY_LOCK',
  'V2150_DIAMOND_TOUCH_SCORE_LIMIT = 0.942',
  'bestScore <= V2150_DIAMOND_TOUCH_SCORE_LIMIT',
  'v2150-ui-overlap-placement-beauty-touch-cautious-no-tile-shrink',
  'dataset.v2150UiOverlapPlacementBeautyLock',
  'const TILE_W = 80',
  'const TILE_H = 40',
]) if (!village.includes(token)) fail(`src/villageWorld.ts missing v2.1.50 tile token: ${token}`);

for (const token of [
  'v2150-ui-overlap-placement-beauty-root',
  '--v2150-aqua-card',
  '--v2150-aqua-cell',
  '--v2150-gold-cta',
  '.v2150-world-controls',
  '.v2150-bottom-nav',
  '.v2150-bottom-nav .v2098-nav-item img',
  '.runtime-content[data-v2150-page-title-clean="true"]::before',
  '.shop-card.runtime-shop-card',
  '.v2076-expedition-candidates',
  '.v2150-fishing-hud .hud-chip.region',
  '.v2150-sea-lane-card',
  '.v2150-fishing-loadout',
  '.v2150-fishing-coach',
  '.v2150-bite-action',
  '.v2150-cast-button',
  '.v2150-reel-panel',
  '.v2150-reel-console',
  '.v2150-reel-touch-zone',
  '.v2150-fishing-focus-screen[data-fishing-phase="reeling"] .v2150-reel-panel:not(.hidden)',
  'left: calc(var(--v2150-safe-left) + 12px) !important;',
  'right: calc(var(--v2150-safe-right) + 12px) !important;',
  'body[data-screen="fishing"] .bottom-nav',
]) if (!styles.includes(token)) fail(`src/styles.css missing v2.1.50 style token: ${token}`);

for (const token of [
  '우측 상단 마을 메뉴는 뒤쪽 배경 프레임을 계속 제거하고',
  '투명 여백을 더 확보한 128x128 PNG',
  'data-v2150-page-title-clean',
  '상점 아이템 카드는 글 영역과 골드 구매 버튼 영역을 분리',
  '릴링 중 본 게임 콕핏은 좌우 inset 고정과 sticky 게이지',
  '다이아몬드 터치 점수만 `0.942`',
  'node_modules가 Git에 추적되거나 full/patch ZIP에 들어가는 것은 계속 차단',
]) if (!readme.includes(token)) fail(`README.md missing v2.1.50 note: ${token}`);

function pngSize(rel) {
  const raw = fs.readFileSync(path.join(root, rel));
  if (raw.slice(0,8).toString('hex') !== '89504e470d0a1a0a') fail(`${rel} is not a PNG`);
  return { raw, w: raw.readUInt32BE(16), h: raw.readUInt32BE(20) };
}
for (const file of ['nav_village.png', 'nav_bag.png', 'nav_quest.png', 'nav_map.png']) {
  const rel = `public/assets/v22/icons/${file}`;
  assertFile(rel);
  const { raw, w, h } = pngSize(rel);
  if (w !== 128 || h !== 128) fail(`${rel} must be clean 128x128 icon, got ${w}x${h}`);
  if (raw.length < 1200 || raw.length > 24000) fail(`${rel} has suspicious PNG payload size ${raw.length}`);
}

const directions = ['south','southeast','east','northeast','north','northwest','west','southwest'];
const playerDir = 'public/assets/v2129/characters/player';
for (const direction of directions) for (let frame = 1; frame <= 4; frame += 1) assertFile(`${playerDir}/player_${direction}_frame_${String(frame).padStart(2, '0')}.png`);
const hashManifest = readJson(`${playerDir}/player_frame_hashes_v2129.json`);
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
for (const role of ['chief', 'merchant', 'guild', 'captain', 'tourist', 'vip']) for (const direction of directions) assertFile(`public/assets/v2047/characters/${role}_${direction}.png`);

for (const token of [
  'openingIntroPending && !this.openingIntroShown',
  'direct-route-no-opening-video',
  'showBuildConfirm({ type: this.selectedBuild',
  'applyPendingBuildPlacement',
  '빨간 풋프린트 위치에는 놓을 수 없습니다',
  'hasVisualObjectClearance',
  'nearestPlaceableOrigin',
]) if (!main.includes(token) && !village.includes(token)) fail(`regression guard missing ${token}`);
if (!styles.includes('.v2131-opening-cinematic::before') || !styles.includes('content: none !important')) fail('opening frame overlay guard missing');

const forbidden = ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai'];
for (const file of ['package.json', 'package-lock.json', 'src/data.ts', 'src/main.ts', 'src/villageWorld.ts', 'src/styles.css', 'public/sw.js', 'public/offline.html', 'README.md', '.npmrc']) {
  const text = read(file);
  for (const token of forbidden) if (text.includes(token)) fail(`${file} contains forbidden token ${token}`);
}

console.log('[v2150] UI overlap placement beauty polish guard passed');
