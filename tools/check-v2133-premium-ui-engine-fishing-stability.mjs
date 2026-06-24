import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const readJson = (file) => JSON.parse(read(file));
const fail = (message) => {
  console.error(`[v2133] ${message}`);
  process.exit(1);
};
const assertIncludes = (file, needle, label = needle) => {
  if (!read(file).includes(needle)) fail(`${file} missing ${label}`);
};
const assertFile = (file) => {
  if (!fs.existsSync(path.join(root, file))) fail(`missing file: ${file}`);
};
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');

const pkg = readJson('package.json');
const lock = readJson('package-lock.json');
if (pkg.version !== '2.1.33') fail(`package.json version is ${pkg.version}`);
if (lock.version !== '2.1.33' || lock.packages?.['']?.version !== '2.1.33') fail('package-lock.json version mismatch');
assertIncludes('src/data.ts', "APP_VERSION = '2.1.33'", 'APP_VERSION 2.1.33');
assertIncludes('src/data.ts', 'aqua-fantasia-v2.1.33-premium-ui-engine-fishing-stability', 'v2.1.33 cache name');
assertIncludes('public/sw.js', 'aqua-fantasia-v2.1.33-premium-ui-engine-fishing-stability', 'service worker cache');
assertIncludes('public/offline.html', 'v2.1.33', 'offline badge');
assertIncludes('README.md', '# AquaFantasia v2.1.33', 'README title v2.1.33');
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


const village = read('src/villageWorld.ts');
const main = read('src/main.ts');
const styles = read('src/styles.css');

if (fs.existsSync(path.join(root, 'APP_VERSION'))) fail('root APP_VERSION file must not exist in v2.1.33 full package');
for (const token of [
  'v2133-premium-ui-engine-fishing-stability',
  'v2133-premium-ui-engine-fishing-stability-root',
  'v2133-runtime-page-shell',
  'v2133-aqua-page',
  'v2133-bottom-nav',
  "nav.dataset.v2133Dock = 'premium-aqua-fixed-identical-no-shift'",
  'applyV2133UiEngineGuard',
  'v2133-fishing-engine-screen',
  'v2133FishingEngine',
  'v2133-fishing-coach',
  'data-v2133-coach-primary',
  'data-v2133-danger-meter',
  'resolveFishingFailurePressure',
  'failureRecoveryTimer',
  'hardStopReelInput',
]) {
  if (!main.includes(token)) fail(`src/main.ts missing v2.1.33 token: ${token}`);
}
for (const token of [
  '--v2133-card-bg',
  '.v2133-bottom-nav',
  '.runtime-menu-screen.v2133-runtime-page-shell',
  '.v2133-aqua-page',
  '.v2133-fishing-coach',
  '[data-v2133-danger-meter]',
  '.v2133-close-control',
  'FISHING_V2133_FAILURE_GRACE_LOCK',
]) {
  if (!styles.includes(token)) fail(`src/styles.css missing v2.1.33 token: ${token}`);
}


const directions = ['south','southeast','east','northeast','north','northwest','west','southwest'];
const playerDir = 'public/assets/v2129/characters/player';
for (const direction of directions) {
  for (let frame = 1; frame <= 4; frame += 1) {
    assertFile(`${playerDir}/player_${direction}_frame_${String(frame).padStart(2, '0')}.png`);
  }
}
const hashManifest = readJson(`${playerDir}/player_frame_hashes_v2129.json`);
if (Object.keys(hashManifest).length !== 32) fail('player hash manifest must contain exactly 32 frames');
for (const [name, hash] of Object.entries(hashManifest)) {
  const rel = `${playerDir}/${name}`;
  assertFile(rel);
  if (sha256(rel) !== hash) fail(`player frame hash changed: ${name}`);
}
if (sha256(`${playerDir}/player_east_frame_01.png`) === sha256(`${playerDir}/player_west_frame_01.png`)) fail('east and west player frames must not be identical');

for (const token of [
  'V2129_PLAYER_FILENAME_DIRECTION_LOCK',
  'V2130_PLAYER_MOTION_IMMUTABLE_LOCK',
  'V2131_PLAYER_NPC_DIRECTION_GUARD',
  './assets/v2129/characters/player/player_${direction}_frame_${String(index + 1).padStart(2, \'0\')}.png',
  "player: './assets/v2129/characters/player/player_south_frame_01.png'",
  "east: 'east'",
  "west: 'west'",
  "northeast: 'northeast'",
  "northwest: 'northwest'",
  'return ACTOR_DIRECTIONS.every((direction) => playerActorVisualDirection(direction) === direction);',
]) {
  if (!village.includes(token)) fail(`src/villageWorld.ts missing ${token}`);
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
if (/role\s*===\s*['"]player['"][\s\S]{0,180}scale\.x\s*=\s*-/.test(village)) fail('player-specific block contains negative scale.x flip');
if (!village.includes('if (actor.role === \'player\')')) fail('player motion branch missing');

const npcRoles = ['chief', 'merchant', 'guild', 'captain', 'tourist', 'vip'];
for (const role of npcRoles) {
  for (const direction of directions) assertFile(`public/assets/v2047/characters/${role}_${direction}.png`);
  if (!village.includes(`${role}_${'${direction}'}.png`)) fail(`NPC texture template missing for ${role}`);
}
if (!village.includes('ACTOR_DIRECTION_QA_VECTORS')) fail('NPC direction QA vectors missing');
if (!village.includes('actorDirectionQaPasses()')) fail('NPC direction QA invocation missing');

for (const token of [
  'v2131-motion-ui-fishing-build-root',
  'v2131-world-controls',
  'data-v2131-primary-order="plus-minus-build-center-shop-sail"',
  'v2131-bottom-nav',
  "nav.dataset.v2131Dock = 'fixed-right-bottom-identical-all-pages'",
  'if (nav.classList.contains(\'v2132-bottom-nav\') || nav.classList.contains(\'v2131-bottom-nav\') || nav.classList.contains(\'v2130-bottom-nav\'))',
  'v2131-runtime-page-shell',
  'v2131-aqua-page',
  'v2132-premium-ui-fishing-stability-root',
  'v2132-runtime-page-shell',
  'v2132-aqua-page',
  'v2132-bottom-nav',
  'v2132-fishing-director',
  'data-v2132-flow-step',
  'updateFishingDirector',
  'FISHING_V2132_PREMIUM_BALANCE_LOCK',
]) {
  if (!main.includes(token)) fail(`src/main.ts missing ${token}`);
}
for (const token of [
  '--v2131-command-width: 184px',
  '.v2131-world-controls',
  'background: transparent !important',
  '.bottom-nav.v2131-bottom-nav',
  '.runtime-menu-screen.v2131-runtime-page-shell',
  '.v2097-name-editor input',
  '--v2132-card-bg',
  '.v2132-fishing-director',
  '.bottom-nav.v2132-bottom-nav',
  '.runtime-menu-screen.v2132-runtime-page-shell',
]) {
  if (!styles.includes(token)) fail(`src/styles.css missing ${token}`);
}

for (const token of [
  'v2131-build-confirm',
  'data-v2131-build-confirm',
  'V2131_BUILD_PREVIEW_CONFIRM_LOCK',
  'showBuildConfirm({ type: this.selectedBuild',
  'applyPendingBuildPlacement',
  '빨간 풋프린트 위치에는 놓을 수 없습니다',
  'def.kind === \'building\'',
  'stroke: { color: 0xffffff, width: 2 }',
]) {
  if (!village.includes(token) && !main.includes(token)) fail(`build/name guard missing ${token}`);
}

for (const token of [
  'v2131-fishing-overhaul-screen',
  'v2131-fishing-start-card',
  'data-v2131-fishing-flow',
  'v2131-reel-panel',
  'v2131-reel-console',
  'v2131-reel-touch-zone',
  'v2073-gauge-row',
  'data-v2073-catch-bar',
  'data-v2073-tension-bar',
  'data-v2073-stamina-bar',
  '입질 감지!',
  '캐스팅',
  'v2132-fishing-director',
  'data-v2132-director-title',
  'data-v2132-director-pulse',
]) {
  if (!main.includes(token)) fail(`fishing UI flow missing ${token}`);
}
if (main.includes('뿅') || main.includes('퐁!')) fail('unnatural fishing pop message remains');
if (/mountBottomNav\(root,\s*['"]fishing['"]\)/.test(main)) fail('fishing screen must not mount bottom nav');
if (!styles.includes('body[data-screen="fishing"] .bottom-nav')) fail('fishing bottom-nav hide guard missing');

for (const token of [
  'openingIntroPending && !this.openingIntroShown',
  "root.dataset.v2131MotionUiFishingBuildGuard = shouldPlayOpening ? 'first-start-opening-only-guarded' : 'direct-route-no-opening-video'",
  'v2131-opening-cinematic',
]) {
  if (!main.includes(token)) fail(`opening first-start guard missing ${token}`);
}
if (!styles.includes('.v2131-opening-cinematic::before') || !styles.includes('content: none !important')) fail('opening frame overlay guard missing');

const forbidden = ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai'];
for (const file of ['package.json', 'package-lock.json', 'src/data.ts', 'src/main.ts', 'src/villageWorld.ts', 'src/styles.css', 'public/sw.js', 'public/offline.html', 'README.md']) {
  const text = read(file);
  for (const token of forbidden) if (text.includes(token)) fail(`${file} contains forbidden token ${token}`);
}

console.log('[v2133] premium UI/fishing stability guard passed');
