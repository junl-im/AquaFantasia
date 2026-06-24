import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const fail = (message) => { console.error(`[v2151] ${message}`); process.exit(1); };
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const readJson = (file) => JSON.parse(read(file));
const exists = (file) => fs.existsSync(path.join(root, file));
const assertFile = (file) => { if (!exists(file)) fail(`missing file: ${file}`); };
const assertIncludes = (file, needle, label = needle) => { if (!read(file).includes(needle)) fail(`${file} missing ${label}`); };
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');

const pkg = readJson('package.json');
const lock = readJson('package-lock.json');
if (pkg.version !== '2.1.51') fail(`package.json version is ${pkg.version}`);
if (lock.version !== '2.1.51' || lock.packages?.['']?.version !== '2.1.51') fail('package-lock.json version mismatch');
if (!pkg.scripts?.validate?.includes('check-v2151-layout-composition-fishing-ui-polish.mjs')) fail('validate script must run v2.1.51 guard');
assertIncludes('src/data.ts', "APP_VERSION = '2.1.51'", 'APP_VERSION 2.1.51');
assertIncludes('src/data.ts', 'aqua-fantasia-v2.1.51-layout-composition-fishing-ui-polish', 'v2.1.51 cache name');
assertIncludes('public/sw.js', 'aqua-fantasia-v2.1.51-layout-composition-fishing-ui-polish', 'service worker cache');
assertIncludes('public/offline.html', 'v2.1.51', 'offline badge');
assertIncludes('README.md', '# AquaFantasia v2.1.51', 'README title');
if (exists('APP_VERSION')) fail('root APP_VERSION file must not exist');

const rootMarkdown = fs.readdirSync(root).filter((name) => /\.md$/i.test(name));
if (rootMarkdown.length !== 1 || rootMarkdown[0] !== 'README.md') fail(`root markdown must be README.md only: ${rootMarkdown.join(', ')}`);
for (const name of ['dist', 'reports', 'backup', 'logs', '_NOTES', 'AquaFantasia_backup_v1']) {
  if (exists(name)) fail(`forbidden generated folder/file found: ${name}`);
}
if (exists('node_modules') && !fs.statSync(path.join(root, 'node_modules')).isDirectory()) fail('node_modules must be a directory when present');
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
  'dataset.v2151LayoutCompositionFishingUi',
  'v2151-layout-composition-fishing-ui-root',
  'v2151-world-controls',
  'data-v2151-primary-order="plus-minus-build-center-shop-sail"',
  'v2151-runtime-page-shell',
  'data-v2151-page-title-clean="true"',
  'v2151-bottom-nav',
  'v2151-fishing-focus-screen',
  'v2151-fishing-stage',
  'v2151-fishing-hud',
  'v2151-sea-lane-card',
  'v2151-fishing-loadout',
  'v2151-fishing-coach',
  'v2151-bite-action',
  'data-v2151-bite-action',
  'v2151-reel-panel',
  'v2151-reel-console',
  'v2151-reel-touch-zone',
  'v2151-cast-button',
]) if (!main.includes(token)) fail(`src/main.ts missing v2.1.51 token: ${token}`);
if (/mountBottomNav\(root,\s*['"]fishing['"]\)/.test(main)) fail('fishing screen must not mount bottom nav');
if (main.includes('뿅') || main.includes('퐁!')) fail('unnatural fishing pop message remains');

for (const token of [
  'V2151_LAYOUT_COMPOSITION_FISHING_UI_LOCK',
  'V2151_DIAMOND_TOUCH_SCORE_LIMIT = 0.940',
  'bestScore <= V2151_DIAMOND_TOUCH_SCORE_LIMIT',
  'v2151-layout-composition-fishing-ui-touch-cautious-no-tile-shrink',
  'dataset.v2151LayoutCompositionFishingUiLock',
  'const TILE_W = 80',
  'const TILE_H = 40',
]) if (!village.includes(token)) fail(`src/villageWorld.ts missing v2.1.51 tile token: ${token}`);

for (const token of [
  'v2151-layout-composition-fishing-ui-root',
  '--v2151-aqua-card',
  '--v2151-aqua-cell',
  '--v2151-gold-cta',
  '.v2151-world-controls',
  '.v2151-bottom-nav',
  '.v2151-bottom-nav .v2098-nav-item img',
  '.runtime-content[data-v2151-page-title-clean="true"]::before',
  '.shop-card.runtime-shop-card',
  '.v2076-expedition-candidates',
  '.v2151-fishing-hud .hud-chip.region',
  '.v2151-sea-lane-card',
  '.v2151-fishing-loadout',
  '.v2151-fishing-coach',
  '.v2151-bite-action',
  '.v2151-cast-button',
  '.v2151-reel-panel',
  '.v2151-reel-console',
  '.v2151-reel-touch-zone',
  '.v2151-fishing-focus-screen[data-fishing-phase="reeling"] .v2151-reel-panel:not(.hidden)',
  'left: calc(var(--v2151-safe-left) + 10px) !important;',
  'right: calc(var(--v2151-safe-right) + 10px) !important;',
  'body[data-screen="fishing"] .bottom-nav',
]) if (!styles.includes(token)) fail(`src/styles.css missing v2.1.51 style token: ${token}`);

for (const token of [
  '우측 상단 메뉴는 뒤쪽 큰 프레임을 제거하고',
  '하단 홈/가방/퀘스트/지도 아이콘은 버튼 내부에서만 보이도록',
  '가방/퀘스트/지도/상점 페이지의 중복 제목 잔상',
  '개척 항로 조사/후보지/출항 후보지 영역은 공통 아쿠아 카드 스킨',
  '낚시 화면은 준비 단계와 릴링 단계를 분리',
  '다이아몬드 터치 점수만 `0.940`',
  'node_modules`는 CI 작업환경에서는 허용',
]) if (!readme.includes(token)) fail(`README.md missing v2.1.51 note: ${token}`);

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

console.log('[v2151] layout composition fishing UI polish guard passed');
