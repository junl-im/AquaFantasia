import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const readJson = (file) => JSON.parse(read(file));
const fail = (message) => { console.error(`[v2139] ${message}`); process.exit(1); };
const assertIncludes = (file, needle, label = needle) => { if (!read(file).includes(needle)) fail(`${file} missing ${label}`); };
const assertFile = (file) => { if (!fs.existsSync(path.join(root, file))) fail(`missing file: ${file}`); };
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');

const pkg = readJson('package.json');
const lock = readJson('package-lock.json');
if (pkg.version !== '2.1.39') fail(`package.json version is ${pkg.version}`);
if (lock.version !== '2.1.39' || lock.packages?.['']?.version !== '2.1.39') fail('package-lock.json version mismatch');
assertIncludes('src/data.ts', "APP_VERSION = '2.1.39'", 'APP_VERSION 2.1.39');
assertIncludes('src/data.ts', 'aqua-fantasia-v2.1.39-fishing-ui-system-polish', 'v2.1.39 cache name');
assertIncludes('public/sw.js', 'aqua-fantasia-v2.1.39-fishing-ui-system-polish', 'service worker cache');
assertIncludes('public/offline.html', 'v2.1.39', 'offline badge');
assertIncludes('README.md', '# AquaFantasia v2.1.39', 'README title v2.1.39');
if (fs.existsSync(path.join(root, 'APP_VERSION'))) fail('root APP_VERSION file must not exist');

const rootMarkdown = fs.readdirSync(root).filter((name) => /\.md$/i.test(name));
if (rootMarkdown.length !== 1 || rootMarkdown[0] !== 'README.md') fail(`root markdown must be README.md only: ${rootMarkdown.join(', ')}`);
for (const name of ['node_modules', 'dist', 'reports', 'backup', 'logs', '_NOTES', 'AquaFantasia_backup_v1']) {
  if (fs.existsSync(path.join(root, name))) fail(`forbidden generated folder/file found: ${name}`);
}

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
    if (inComment) {
      if (ch === '*' && next === '/') { inComment = false; i += 1; }
      continue;
    }
    if (quote) {
      if (ch === '\\') { i += 1; continue; }
      if (ch === quote) quote = '';
      continue;
    }
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
  'dataset.v2139FishingUiSystem',
  'v2139-fishing-ui-system-polish-root',
  'v2139-fishing-focus-screen',
  'v2139-fishing-stage',
  'v2139-fishing-hud',
  'v2139-sea-lane-card',
  'v2139-fishing-loadout',
  'v2139-fishing-coach',
  'v2139-reel-panel',
  'v2139-reel-console',
  'v2139-reel-touch-zone',
  'v2139-cast-button',
  'v2139-hidden-legacy-guide',
  'v2139-hidden-legacy-start-card',
  'v2139-hidden-legacy-fishing-props',
  'v2139-runtime-page-shell',
  'v2139-aqua-page',
  'v2139-bottom-nav',
  "nav.dataset.v2139Dock = 'transparent-no-table-frame-fixed-premium-spacing'",
  "activeNav.dataset.v2139Dock = 'transparent-no-table-frame-fixed-premium-spacing'",
  '캐스팅 시작',
  'failureRecoveryTimer >= 1.62',
]) {
  if (!main.includes(token)) fail(`src/main.ts missing v2.1.39 token: ${token}`);
}

for (const token of [
  'V2139_TILE_TOUCH_STABILITY_LOCK',
  'V2139_TILE_PIXEL_SIZE_MIGRATION_PLAN_LOCK',
  'V2139_DIAMOND_TOUCH_SCORE_LIMIT = 1.03',
  'bestScore <= V2139_DIAMOND_TOUCH_SCORE_LIMIT',
  'full tile shrink still needs save/building/NPC/camera migration',
  'dataset.v2139TileTouchStabilityLock',
  'dataset.v2139TilePixelMigrationPlanLock',
  'const TILE_W = 80',
  'const TILE_H = 40',
]) {
  if (!village.includes(token)) fail(`src/villageWorld.ts missing v2.1.39 token: ${token}`);
}

for (const token of [
  'v2139-fishing-ui-system-polish-root',
  '--v2139-card-bg',
  '--v2139-aqua-cta',
  '--v2139-gold-cta',
  '.v2139-bottom-nav',
  '.v2139-sea-lane-card',
  '.v2139-fishing-loadout',
  '.v2139-cast-button',
  '.v2139-reel-panel',
  '.v2139-reel-console',
  '.v2139-reel-touch-zone',
  '.v2139-hidden-legacy-guide',
  '.v2139-hidden-legacy-start-card',
  '.v2139-hidden-legacy-fishing-props',
  '.v2139-runtime-page-shell',
  '.v2139-runtime-page-shell .runtime-content',
  '.v2139-fishing-focus-screen[data-fishing-phase="reeling"] .v2139-reel-panel:not(.hidden)',
  '--v2139-reel-reserved',
  'body[data-screen="fishing"] .bottom-nav',
]) {
  if (!styles.includes(token)) fail(`src/styles.css missing v2.1.39 token: ${token}`);
}

for (const token of [
  '낚시 화면을 최우선으로 다시 다듬었습니다',
  '예전 낚시 사용법 카드와 시작 안내 카드는 라이브 레이어에서 숨겨',
  '포획/텐션/저항 게이지와 안전 구간이 항상 보이도록',
  '우측 상단 메뉴바의 테이블성 배경/테두리를 더 투명하게',
  'HUD 길이가 짧아 보이지 않도록',
  '개척 열림 페이지의 카드 표면',
  '타일 픽셀 축소는 아직 적용하지 않았습니다',
  '세이브 좌표, 건물 footprint, 충돌 판정, NPC 이동, 카메라 경계 마이그레이션',
]) {
  if (!readme.includes(token)) fail(`README.md missing v2.1.39 note: ${token}`);
}

const directions = ['south','southeast','east','northeast','north','northwest','west','southwest'];
const playerDir = 'public/assets/v2129/characters/player';
for (const direction of directions) {
  for (let frame = 1; frame <= 4; frame += 1) assertFile(`${playerDir}/player_${direction}_frame_${String(frame).padStart(2, '0')}.png`);
}
const hashManifest = readJson(`${playerDir}/player_frame_hashes_v2129.json`);
if (Object.keys(hashManifest).length !== 32) fail('player hash manifest must contain exactly 32 frames');
for (const [name, hash] of Object.entries(hashManifest)) {
  const rel = `${playerDir}/${name}`;
  assertFile(rel);
  if (sha256(rel) !== hash) fail(`player frame hash changed: ${name}`);
}
const playerMap = village.match(/const PLAYER_ACTOR_DIRECTION_TEXTURE_FIX:[\s\S]*?};/);
const npcMap = village.match(/const ACTOR_DIRECTION_TEXTURE_FIX:[\s\S]*?};/);
if (!playerMap) fail('PLAYER_ACTOR_DIRECTION_TEXTURE_FIX block missing');
if (!npcMap) fail('ACTOR_DIRECTION_TEXTURE_FIX block missing');
if (/east:\s*'west'|west:\s*'east'|northeast:\s*'northwest'|northwest:\s*'northeast'|southeast:\s*'southwest'|southwest:\s*'southeast'/.test(playerMap[0])) fail('player direction map must not swap or mirror directions');
if (/east:\s*'west'|west:\s*'east'|northeast:\s*'northwest'|northwest:\s*'northeast'|southeast:\s*'southwest'|southwest:\s*'southeast'/.test(npcMap[0])) fail('NPC direction map must not swap or mirror directions');
for (const direction of directions) {
  if (!playerMap[0].includes(`${direction}: '${direction}'`)) fail(`player map is not identity for ${direction}`);
  if (!npcMap[0].includes(`${direction}: '${direction}'`)) fail(`NPC map is not identity for ${direction}`);
}
for (const role of ['chief', 'merchant', 'guild', 'captain', 'tourist', 'vip']) {
  for (const direction of directions) assertFile(`public/assets/v2047/characters/${role}_${direction}.png`);
}
if (/role\s*===\s*['"]player['"][\s\S]{0,220}scale\.x\s*=\s*-/.test(village)) fail('player-specific block contains negative scale.x flip');
if (!village.includes('ACTOR_DIRECTION_QA_VECTORS') || !village.includes('actorDirectionQaPasses()')) fail('NPC direction QA missing');

for (const token of [
  'openingIntroPending && !this.openingIntroShown',
  'direct-route-no-opening-video',
  'v2131-opening-cinematic',
  'showBuildConfirm({ type: this.selectedBuild',
  'applyPendingBuildPlacement',
  '빨간 풋프린트 위치에는 놓을 수 없습니다',
  'hasVisualObjectClearance',
  'nearestPlaceableOrigin',
]) {
  if (!main.includes(token) && !village.includes(token)) fail(`regression guard missing ${token}`);
}
if (main.includes('뿅') || main.includes('퐁!')) fail('unnatural fishing pop message remains');
if (/mountBottomNav\(root,\s*['"]fishing['"]\)/.test(main)) fail('fishing screen must not mount bottom nav');
if (!styles.includes('.v2131-opening-cinematic::before') || !styles.includes('content: none !important')) fail('opening frame overlay guard missing');
if (!styles.includes('display: none !important;') || !styles.includes('.v2139-hidden-legacy-guide')) fail('legacy fishing guide is not hidden by CSS');

const forbidden = ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai'];
for (const file of ['package.json', 'package-lock.json', 'src/data.ts', 'src/main.ts', 'src/villageWorld.ts', 'src/styles.css', 'public/sw.js', 'public/offline.html', 'README.md']) {
  const text = read(file);
  for (const token of forbidden) if (text.includes(token)) fail(`${file} contains forbidden token ${token}`);
}

console.log('[v2139] fishing/UI system polish guard passed');
