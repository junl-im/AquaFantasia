import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const readJson = (file) => JSON.parse(read(file));
const fail = (message) => { console.error(`[v2138] ${message}`); process.exit(1); };
const assertIncludes = (file, needle, label = needle) => { if (!read(file).includes(needle)) fail(`${file} missing ${label}`); };
const assertFile = (file) => { if (!fs.existsSync(path.join(root, file))) fail(`missing file: ${file}`); };
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');

const pkg = readJson('package.json');
const lock = readJson('package-lock.json');
if (pkg.version !== '2.1.38') fail(`package.json version is ${pkg.version}`);
if (lock.version !== '2.1.38' || lock.packages?.['']?.version !== '2.1.38') fail('package-lock.json version mismatch');
assertIncludes('src/data.ts', "APP_VERSION = '2.1.38'", 'APP_VERSION 2.1.38');
assertIncludes('src/data.ts', 'aqua-fantasia-v2.1.38', 'v2.1.38 cache name');
assertIncludes('public/sw.js', 'aqua-fantasia-v2.1.38', 'service worker cache');
assertIncludes('public/offline.html', 'v2.1.38', 'offline badge');
assertIncludes('README.md', '# AquaFantasia v2.1.38', 'README title v2.1.38');
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

for (const token of [
  'v2137-fishing-ui-page-shell-hud-menu-polish',
  'v2138-fishing-cockpit-menu-page-polish',
  'v2137-fishing-ui-page-shell-hud-menu-polish-root',
  'v2138-fishing-cockpit-menu-page-polish-root',
  'v2137-village-ui-shell-polish',
  'v2138-village-menu-hud-polish',
  'v2137-fishing-overhaul-screen',
  'v2138-fishing-cockpit-screen',
  'dataset.v2137FishingOverhaul',
  'dataset.v2138FishingCockpit',
  'v2137-fishing-hud',
  'v2138-fishing-hud',
  'v2137-sea-lane-card',
  'v2138-sea-lane-card',
  'v2137-fishing-loadout',
  'v2138-fishing-loadout',
  'v2137-cast-button',
  'v2138-cast-button',
  'v2137-reel-panel',
  'v2138-reel-panel',
  'v2137-reel-console',
  'v2138-reel-console',
  'v2137-reel-touch-zone',
  'v2138-reel-touch-zone',
  'v2137-bottom-nav',
  'v2138-bottom-nav',
  "nav.dataset.v2137Dock = 'transparent-frame-same-position-clean-icons'",
  "nav.dataset.v2138Dock = 'fully-transparent-frame-more-air-same-position'",
  "activeNav.dataset.v2137Dock = 'transparent-frame-same-position-clean-icons'",
  "activeNav.dataset.v2138Dock = 'fully-transparent-frame-more-air-same-position'",
]) {
  if (!main.includes(token)) fail(`src/main.ts missing v2.1.38 token: ${token}`);
}
for (const token of [
  'V2137_TILE_TOUCH_PRECISION_LOCK',
  'V2137_TILE_PIXEL_SIZE_MIGRATION_REQUIRED_LOCK',
  'V2138_TILE_TOUCH_CAUTIOUS_LOCK',
  'V2138_TILE_PIXEL_SIZE_MIGRATION_REQUIRED_LOCK',
  'V2138_FINE_PLACEMENT_SEARCH_RADIUS = 2',
  'V2138_DIAMOND_TOUCH_SCORE_LIMIT = 1.08',
  'bestScore <= V2138_DIAMOND_TOUCH_SCORE_LIMIT',
  'Full tile pixel shrink still needs',
  'nearestPlaceableOrigin',
  'hasVisualObjectClearance',
]) {
  if (!village.includes(token)) fail(`src/villageWorld.ts missing v2.1.38 token: ${token}`);
}
for (const token of [
  'v2137-fishing-ui-page-shell-hud-menu-polish-root',
  'v2138-fishing-cockpit-menu-page-polish-root',
  'v2138-fishing-cockpit-menu-page-polish-root',
  '--v2137-card-bg',
  '--v2138-card-bg',
  '.v2137-bottom-nav',
  '.v2138-bottom-nav',
  '.v2137-sea-lane-card',
  '.v2138-sea-lane-card',
  '.v2137-fishing-loadout',
  '.v2138-fishing-loadout',
  '.v2137-cast-button',
  '.v2138-cast-button',
  '.v2137-reel-panel',
  '.v2138-reel-panel',
  '.v2137-reel-console',
  '.v2138-reel-console',
  '.v2137-reel-touch-zone',
  '.v2138-reel-touch-zone',
  '.fishing-guide-card',
  '.v2130-fishing-start-card',
  '.v2110-fishing-props',
  'body[data-screen="fishing"] .bottom-nav',
]) {
  if (!styles.includes(token)) fail(`src/styles.css missing v2.1.38 token: ${token}`);
}
for (const token of [
  '낚시 화면을 다시 최우선',
  '릴 패널을 스크롤 가능한 고정 콕핏',
  '우측 상단 메뉴바의 테이블성 배경',
  'HUD 길이를 확보',
  '타일 픽셀 자체 축소는 아직 적용하지 않았습니다',
  '낚시 화면 우선 개편',
  '로드/미끼 장비 테이블',
  '바다물길 표기',
  '타일 픽셀 자체 축소',
  '우측 상단/하단 메뉴 프레임',
]) {
  if (!read('README.md').includes(token)) fail(`README.md missing v2.1.38 note: ${token}`);
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
if (!playerMap) fail('PLAYER_ACTOR_DIRECTION_TEXTURE_FIX block missing');
const npcMap = village.match(/const ACTOR_DIRECTION_TEXTURE_FIX:[\s\S]*?};/);
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
]) {
  if (!main.includes(token) && !village.includes(token)) fail(`regression guard missing ${token}`);
}
if (main.includes('뿅') || main.includes('퐁!')) fail('unnatural fishing pop message remains');
if (/mountBottomNav\(root,\s*['"]fishing['"]\)/.test(main)) fail('fishing screen must not mount bottom nav');
if (!styles.includes('.v2131-opening-cinematic::before') || !styles.includes('content: none !important')) fail('opening frame overlay guard missing');

const forbidden = ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai'];
for (const file of ['package.json', 'package-lock.json', 'src/data.ts', 'src/main.ts', 'src/villageWorld.ts', 'src/styles.css', 'public/sw.js', 'public/offline.html', 'README.md']) {
  const text = read(file);
  for (const token of forbidden) if (text.includes(token)) fail(`${file} contains forbidden token ${token}`);
}

console.log('[v2138] fishing cockpit/menu page guard passed');
