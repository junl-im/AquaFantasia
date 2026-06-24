import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const readJson = (file) => JSON.parse(read(file));
const fail = (message) => { console.error(`[v2144] ${message}`); process.exit(1); };
const assertFile = (file) => { if (!fs.existsSync(path.join(root, file))) fail(`missing file: ${file}`); };
const assertIncludes = (file, needle, label = needle) => { if (!read(file).includes(needle)) fail(`${file} missing ${label}`); };
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');

const pkg = readJson('package.json');
const lock = readJson('package-lock.json');
if (pkg.version !== '2.1.44') fail(`package.json version is ${pkg.version}`);
if (lock.version !== '2.1.44' || lock.packages?.['']?.version !== '2.1.44') fail('package-lock.json version mismatch');
assertIncludes('src/data.ts', "APP_VERSION = '2.1.44'", 'APP_VERSION 2.1.44');
assertIncludes('src/data.ts', 'aqua-fantasia-v2.1.44-ui-placement-polish-sweep', 'v2.1.44 cache name');
assertIncludes('public/sw.js', 'aqua-fantasia-v2.1.44-ui-placement-polish-sweep', 'service worker cache');
assertIncludes('public/offline.html', 'v2.1.44', 'offline badge');
assertIncludes('README.md', '# AquaFantasia v2.1.44', 'README title v2.1.44');
if (fs.existsSync(path.join(root, 'APP_VERSION'))) fail('root APP_VERSION file must not exist');

const rootMarkdown = fs.readdirSync(root).filter((name) => /\.md$/i.test(name));
if (rootMarkdown.length !== 1 || rootMarkdown[0] !== 'README.md') fail(`root markdown must be README.md only: ${rootMarkdown.join(', ')}`);

// node_modules is allowed after npm ci in CI, but generated outputs remain forbidden in source/ZIP boundaries.
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
} catch {
  // ZIP validations normally run outside a git checkout.
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
  'dataset.v2143UiOverlapPlacementSweep',
  'dataset.v2144UiPlacementPolishSweep',
  'v2144-ui-placement-polish-sweep-root',
  'v2144-runtime-page-shell',
  'v2144-runtime-page-shell',
  'v2144-bottom-nav',
  'v2144-fishing-focus-screen',
  'v2144-fishing-stage',
  'v2144-fishing-hud',
  'v2144-sea-lane-card',
  'v2144-fishing-loadout',
  'v2144-fishing-priority-hint',
  'v2144-bite-action',
  'data-v2144-bite-action',
  'v2144-reel-panel',
  'v2144-reel-console',
  'v2144-reel-touch-zone',
  'v2144-cast-button',
  'fishing-stage-layer-deconflict-menu-page-hud-tile-audit',
  'village-hud-menu-expedition-hitbox-deconflict',
]) {
  if (!main.includes(token)) fail(`src/main.ts missing v2.1.44 token: ${token}`);
}
if (main.includes("if (!this.canStartFishingCast()) return;\n    if (!this.canStartFishingCast()) return;")) fail('consecutive duplicate canStartFishingCast guard returned');
if (/mountBottomNav\(root,\s*['"]fishing['"]\)/.test(main)) fail('fishing screen must not mount bottom nav');
if (main.includes('뿅') || main.includes('퐁!')) fail('unnatural fishing pop message remains');

for (const token of [
  'V2144_UI_PLACEMENT_POLISH_SWEEP_LOCK',
  'V2144_DIAMOND_TOUCH_SCORE_LIMIT = 0.955',
  'bestScore <= V2144_DIAMOND_TOUCH_SCORE_LIMIT',
  'v2144-hitbox-placement-ui-overlap-polish-no-tile-pixel-shrink',
  'dataset.v2144UiPlacementPolishSweepLock',
  'const maxAssistRadius = Math.min(V2138_FINE_PLACEMENT_SEARCH_RADIUS, 2)',
  'const TILE_W = 80',
  'const TILE_H = 40',
]) {
  if (!village.includes(token)) fail(`src/villageWorld.ts missing v2.1.44 tile/placement token: ${token}`);
}

for (const token of [
  'v2144-ui-placement-polish-sweep-root',
  '--v2144-card-bg',
  '--v2144-aqua-cta',
  '--v2144-gold-cta',
  '.v2144-bottom-nav',
  '.v2144-runtime-page-shell',
  '.v2144-runtime-page-shell .runtime-content',
  '.v2144-fishing-hud',
  '.v2144-sea-lane-card',
  '.v2144-fishing-loadout',
  '.v2144-fishing-priority-hint',
  '.v2144-bite-action',
  '.v2144-cast-button',
  '.v2144-reel-panel',
  '.v2144-reel-console',
  '.v2144-reel-touch-zone',
  '.v2144-fishing-focus-screen[data-fishing-phase="reeling"] .v2144-reel-panel:not(.hidden)',
  '--v2144-fishing-reserved',
  'body[data-screen="fishing"] .bottom-nav',
]) {
  if (!styles.includes(token)) fail(`src/styles.css missing v2.1.44 style token: ${token}`);
}

for (const token of [
  'UI 겹침, 마을 배치, 낚시 콕핏 레인 분리',
  '로드/미끼 스트립, 바다물길 카드, 우선 안내, 코치 패널, 캐스팅 CTA, 입질 CTA, 릴 게이지, 릴 콘솔, 터치존',
  '구형 낚시 사용법 카드, 시작 카드, 소품 조각',
  '우측 상단 마을 조작 버튼과 우측 하단 메뉴는 투명 프레임',
  '타일 픽셀 축소는 아직 적용하지 않았습니다',
  '다이아몬드 터치 점수를 0.955',
  '`npm ci`가 만든 `node_modules`는 작업환경 의존성으로 허용',
]) {
  if (!readme.includes(token)) fail(`README.md missing v2.1.44 note: ${token}`);
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
  'node_modules가 Git에 추적되거나 full/patch ZIP에 들어가는 것은 계속 차단',
]) {
  if (!main.includes(token) && !village.includes(token) && !readme.includes(token)) fail(`regression guard missing ${token}`);
}
if (!styles.includes('.v2131-opening-cinematic::before') || !styles.includes('content: none !important')) fail('opening frame overlay guard missing');
if (!styles.includes('.v2142-hidden-legacy-guide') || !styles.includes('display: none !important')) fail('legacy fishing guide is not hidden by CSS');

const forbidden = ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai'];
for (const file of ['package.json', 'package-lock.json', 'src/data.ts', 'src/main.ts', 'src/villageWorld.ts', 'src/styles.css', 'public/sw.js', 'public/offline.html', 'README.md', '.npmrc']) {
  const text = read(file);
  for (const token of forbidden) if (text.includes(token)) fail(`${file} contains forbidden token ${token}`);
}

console.log('[v2144] UI placement polish, fishing, HUD, menu, tile guard passed');
