import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
function fail(message) {
  console.error(`[v2129] ${message}`);
  process.exit(1);
}
function readText(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}
function readJson(rel) {
  return JSON.parse(readText(rel));
}
function assertIncludes(rel, needle, label = needle) {
  if (!readText(rel).includes(needle)) fail(`${rel} missing ${label}`);
}
function sha256(rel) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(root, rel))).digest('hex');
}
function checkCssBalance(rel) {
  const text = readText(rel);
  const stack = [];
  const pairs = { '(': ')', '[': ']', '{': '}' };
  const closers = new Set(Object.values(pairs));
  let quote = null;
  let comment = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (comment) {
      if (ch === '*' && next === '/') { comment = false; i += 1; }
      continue;
    }
    if (quote) {
      if (ch === '\\') { i += 1; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '/' && next === '*') { comment = true; i += 1; continue; }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (pairs[ch]) stack.push({ ch, i });
    else if (closers.has(ch)) {
      const last = stack.pop();
      if (!last || pairs[last.ch] !== ch) fail(`${rel} bracket mismatch near index ${i}`);
    }
  }
  if (quote) fail(`${rel} has unclosed quote`);
  if (comment) fail(`${rel} has unclosed comment`);
  if (stack.length) fail(`${rel} has unclosed ${stack.at(-1).ch} near index ${stack.at(-1).i}`);
}

const pkg = readJson('package.json');
const lock = readJson('package-lock.json');
if (pkg.version !== '2.1.29') fail(`package.json version is ${pkg.version}`);
if (lock.version !== '2.1.29' || lock.packages?.['']?.version !== '2.1.29') fail('package-lock.json version mismatch');
assertIncludes('src/data.ts', "APP_VERSION = '2.1.29'", 'APP_VERSION 2.1.29');
assertIncludes('src/data.ts', 'aqua-fantasia-v2.1.29-player-filename-direction-lock', 'v2.1.29 cache name');
assertIncludes('public/sw.js', 'aqua-fantasia-v2.1.29-player-filename-direction-lock', 'service worker cache v2.1.29');
assertIncludes('public/offline.html', 'v2.1.29', 'offline badge v2.1.29');
assertIncludes('README.md', '# AquaFantasia v2.1.29', 'README title v2.1.29');
checkCssBalance('src/styles.css');

const village = readText('src/villageWorld.ts');
for (const token of [
  'V2129_PLAYER_FILENAME_DIRECTION_LOCK',
  './assets/v2129/characters/player/player_${direction}_frame_${String(index + 1).padStart(2, \'0\')}.png',
  "player: './assets/v2129/characters/player/player_south_frame_01.png'",
  'return ACTOR_DIRECTIONS.every((direction) => playerActorVisualDirection(direction) === direction);',
  "east: 'east'",
  "west: 'west'",
  "northeast: 'northeast'",
  "northwest: 'northwest'",
  '--v2129-joystick-transform',
]) {
  if (!village.includes(token)) fail(`src/villageWorld.ts missing ${token}`);
}
const playerMap = village.match(/const PLAYER_ACTOR_DIRECTION_TEXTURE_FIX:[\s\S]*?};/);
if (!playerMap) fail('PLAYER_ACTOR_DIRECTION_TEXTURE_FIX block missing');
if (/east:\s*'west'|west:\s*'east'|northeast:\s*'northwest'|northwest:\s*'northeast'/.test(playerMap[0])) {
  fail('player direction map must not swap east/west or diagonals in v2.1.29');
}

const directions = ['south','southeast','east','northeast','north','northwest','west','southwest'];
const frameDir = 'public/assets/v2129/characters/player';
for (const direction of directions) {
  for (let frame = 1; frame <= 4; frame += 1) {
    const rel = `${frameDir}/player_${direction}_frame_${String(frame).padStart(2, '0')}.png`;
    if (!fs.existsSync(path.join(root, rel))) fail(`missing player frame ${rel}`);
  }
}
const hashManifest = readJson(`${frameDir}/player_frame_hashes_v2129.json`);
for (const [name, hash] of Object.entries(hashManifest)) {
  const rel = `${frameDir}/${name}`;
  if (sha256(rel) !== hash) fail(`player frame hash changed: ${name}`);
}
if (Object.keys(hashManifest).length !== 32) fail('player hash manifest must contain exactly 32 frames');
if (sha256(`${frameDir}/player_east_frame_01.png`) === sha256(`${frameDir}/player_west_frame_01.png`)) {
  fail('east and west frame hashes must differ');
}

assertIncludes('src/main.ts', 'v2129-player-filename-direction-root', 'main v2129 root');
assertIncludes('src/main.ts', 'v2129-world-controls', 'top controls v2129 class');
assertIncludes('src/main.ts', 'v2129-bottom-nav', 'bottom nav v2129 class');
assertIncludes('src/main.ts', 'v2129-fishing-upgrade-screen', 'fishing v2129 class');
assertIncludes('src/main.ts', 'v2129PlayerFilenameDirection', 'dataset keep v2129');
assertIncludes('src/styles.css', 'v2129-player-filename-direction-root', 'CSS root v2129');
assertIncludes('src/styles.css', '--v2129-command-width: 176px', 'top command width v2129');
assertIncludes('src/styles.css', '.bottom-nav.v2129-bottom-nav', 'bottom nav selector v2129');
assertIncludes('src/styles.css', '--v2129-joystick-transform', 'joystick transform v2129');
assertIncludes('src/styles.css', '.v2129-fishing-upgrade-screen', 'fishing CSS v2129');
assertIncludes('src/styles.css', 'background: transparent !important;', 'top controls transparent frame');

const forbidden = ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai'];
for (const rel of ['package.json','package-lock.json','src/data.ts','src/main.ts','src/villageWorld.ts','src/styles.css','public/sw.js','public/offline.html','README.md']) {
  const text = readText(rel);
  for (const needle of forbidden) if (text.includes(needle)) fail(`${rel} contains forbidden registry/internal string ${needle}`);
}
console.log('[v2129] player filename direction lock audit PASS');
