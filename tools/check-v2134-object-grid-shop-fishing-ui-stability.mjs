import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const readJson = (file) => JSON.parse(read(file));
const fail = (message) => { console.error(`[v2134] ${message}`); process.exit(1); };
const assertIncludes = (file, needle, label = needle) => { if (!read(file).includes(needle)) fail(`${file} missing ${label}`); };
const assertFile = (file) => { if (!fs.existsSync(path.join(root, file))) fail(`missing file: ${file}`); };
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');

const pkg = readJson('package.json');
const lock = readJson('package-lock.json');
if (pkg.version !== '2.1.34') fail(`package.json version is ${pkg.version}`);
if (lock.version !== '2.1.34' || lock.packages?.['']?.version !== '2.1.34') fail('package-lock.json version mismatch');
assertIncludes('src/data.ts', "APP_VERSION = '2.1.34'", 'APP_VERSION 2.1.34');
assertIncludes('src/data.ts', 'aqua-fantasia-v2.1.34-object-grid-shop-fishing-ui-stability', 'v2.1.34 cache name');
assertIncludes('public/sw.js', 'aqua-fantasia-v2.1.34-object-grid-shop-fishing-ui-stability', 'service worker cache');
assertIncludes('public/offline.html', 'v2.1.34', 'offline badge');
assertIncludes('README.md', '# AquaFantasia v2.1.34', 'README title v2.1.34');
if (fs.existsSync(path.join(root, 'APP_VERSION'))) fail('root APP_VERSION file must not exist in v2.1.34 full package');

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
  'v2134-object-grid-shop-fishing-ui-stability',
  'v2134-object-grid-shop-fishing-ui-root',
  'v2134-village-object-grid-stability',
  'v2134-world-controls',
  'data-v2134-primary-order="plus-minus-build-center-shop-sail"',
  'v2134-fishing-premium-game-screen',
  'v2134-fishing-coach',
  'v2134-fishing-lane',
  'data-v2134-coach-catch',
  'data-v2134-coach-tension',
  'data-v2134-coach-stamina',
  'v2134-reel-console',
  'v2134-reel-touch-zone',
  'v2134-shop-buy-price',
  "activeNav.dataset.v2134Dock = 'same-position-size-gap-no-press-shift'",
]) {
  if (!main.includes(token)) fail(`src/main.ts missing v2.1.34 token: ${token}`);
}
for (const token of [
  'V2134_OBJECT_CLEARANCE_LOCK',
  'V2134_MICRO_TILE_POINTER_LOCK',
  'hasVisualObjectClearance',
  'bestScore <= 1.16',
  'y + h + 1',
  'v2134-village-object-clearance-ready',
  '1타일 안전 간격',
]) {
  if (!village.includes(token)) fail(`src/villageWorld.ts missing v2.1.34 token: ${token}`);
}
for (const token of [
  'v2134-object-grid-shop-fishing-ui-root',
  '--v2134-shop-buy-bg',
  '.v2134-world-controls',
  '.v2134-shop-buy-price',
  '.v2134-fishing-lane',
  '.v2134-reel-console',
  '.v2134-reel-touch-zone',
  'V2134_TILE_SCALE_DECISION_LOCK',
]) {
  if (!styles.includes(token)) fail(`src/styles.css missing v2.1.34 token: ${token}`);
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
if (/east:\s*'west'|west:\s*'east'|northeast:\s*'northwest'|northwest:\s*'northeast'|southeast:\s*'southwest'|southwest:\s*'southeast'/.test(playerMap[0])) fail('player direction map must not swap or mirror directions');
const npcMap = village.match(/const ACTOR_DIRECTION_TEXTURE_FIX:[\s\S]*?};/);
if (!npcMap) fail('ACTOR_DIRECTION_TEXTURE_FIX block missing');
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
  'v2131-build-confirm',
  'showBuildConfirm({ type: this.selectedBuild',
  'applyPendingBuildPlacement',
  '빨간 풋프린트 위치에는 놓을 수 없습니다',
]) {
  if (!main.includes(token) && !village.includes(token)) fail(`regression guard missing ${token}`);
}
if (main.includes('뿅') || main.includes('퐁!')) fail('unnatural fishing pop message remains');
if (/mountBottomNav\(root,\s*['"]fishing['"]\)/.test(main)) fail('fishing screen must not mount bottom nav');
if (!styles.includes('body[data-screen="fishing"] .bottom-nav')) fail('fishing bottom-nav hide guard missing');
if (!styles.includes('.v2131-opening-cinematic::before') || !styles.includes('content: none !important')) fail('opening frame overlay guard missing');

const forbidden = ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai'];
for (const file of ['package.json', 'package-lock.json', 'src/data.ts', 'src/main.ts', 'src/villageWorld.ts', 'src/styles.css', 'public/sw.js', 'public/offline.html', 'README.md']) {
  const text = read(file);
  for (const token of forbidden) if (text.includes(token)) fail(`${file} contains forbidden token ${token}`);
}

console.log('[v2134] object grid/shop/fishing UI stability guard passed');
