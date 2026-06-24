import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const fail = (message) => {
  console.error(`[v2128] ${message}`);
  process.exit(1);
};
const assertIncludes = (file, text, label = text) => {
  const body = read(file);
  if (!body.includes(text)) fail(`${file} missing ${label}`);
};
const fileHash = (file) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');

function checkBalancedCss(file) {
  const src = read(file);
  const stack = [];
  let quote = null;
  let comment = false;
  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    const next = src[i + 1];
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
    if (ch === '{' || ch === '(' || ch === '[') stack.push({ ch, i });
    if (ch === '}' || ch === ')' || ch === ']') {
      const last = stack.pop();
      const expected = ch === '}' ? '{' : ch === ')' ? '(' : '[';
      if (!last || last.ch !== expected) fail(`${file} has unbalanced ${ch} near offset ${i}`);
    }
  }
  if (quote) fail(`${file} has unclosed quote ${quote}`);
  if (comment) fail(`${file} has unclosed CSS comment`);
  if (stack.length) fail(`${file} has unclosed ${stack.at(-1).ch} near offset ${stack.at(-1).i}`);
}

const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '2.1.28') fail(`package.json version is ${pkg.version}`);
const lock = JSON.parse(read('package-lock.json'));
if (lock.version !== '2.1.28' || lock.packages?.['']?.version !== '2.1.28') fail('package-lock.json version mismatch');
assertIncludes('src/data.ts', "APP_VERSION = '2.1.28'", 'APP_VERSION 2.1.28');
assertIncludes('public/sw.js', 'aqua-fantasia-v2.1.28-direction-ui-fishing-correction', 'v2.1.28 cache name');
assertIncludes('public/offline.html', 'v2.1.28', 'offline badge v2.1.28');

checkBalancedCss('src/styles.css');
assertIncludes('src/styles.css', 'v2128-direction-ui-fishing-correction-root', 'v2128 CSS root');
assertIncludes('src/styles.css', '--v2128-command-width: 166px', 'v2128 top command width');
assertIncludes('src/styles.css', '.bottom-nav.v2128-bottom-nav', 'v2128 bottom nav selector');
assertIncludes('src/styles.css', 'width: 202px !important;', 'v2128 bottom dock width');
assertIncludes('src/styles.css', 'width: 24px !important;', 'v2128 bottom dock icon size');
assertIncludes('src/styles.css', '--v2128-joystick-transform', 'v2128 joystick transform');
assertIncludes('src/styles.css', '.v2128-fishing-upgrade-screen', 'v2128 fishing upgrade CSS');

const village = read('src/villageWorld.ts');
for (const token of [
  'ACTOR_DIRECTION_TEXTURE_FIX',
  'ACTOR_DIRECTION_TEXTURES',
  'actorDirectionFromVector',
  'actorTextureUrl',
  'actorDirectionQaPasses',
  'V2128_TRUE_EAST_MOTION_LOCK',
]) {
  if (!village.includes(token)) fail(`src/villageWorld.ts missing ${token}`);
}
if (!village.includes('assets/v2128/characters/player')) fail('player motion textures must use v2128 corrected frame set');
if (!village.includes("east: 'east'")) fail('3 o clock/east must map to the corrected east frame');
if (!village.includes("west: 'west'")) fail('9 o clock/west must map to the west frame');
if (!village.includes("playerActorVisualDirection('east') === 'east'")) fail('player east QA mapping missing');
if (!village.includes("playerActorVisualDirection('west') === 'west'")) fail('player west QA mapping missing');
if (!village.includes('actor.walkPhase += deltaMs * 0.0068')) fail('walk animation speed must stay slowed for readable steps');
if (!village.includes('--v2128-joystick-transform')) fail('joystick must update v2128 transform variable');

const frameDir = 'public/assets/v2128/characters/player';
const directions = ['north','northeast','east','southeast','south','southwest','west','northwest'];
for (const dir of directions) {
  for (let i = 1; i <= 4; i += 1) {
    const file = `${frameDir}/player_${dir}_frame_${String(i).padStart(2, '0')}.png`;
    if (!fs.existsSync(path.join(root, file))) fail(`missing player frame ${file}`);
  }
}
if (fileHash('public/assets/v2128/characters/player/player_east_frame_01.png') === fileHash('public/assets/v2118/characters/player/player_east_frame_01.png')) {
  fail('v2128 east frame must not be the old left-facing v2118 east frame');
}
if (fileHash('public/assets/v2128/characters/player/player_west_frame_01.png') !== fileHash('public/assets/v2118/characters/player/player_west_frame_01.png')) {
  fail('v2128 west frame should preserve the west-facing v2118 west frame');
}

const main = read('src/main.ts');
assertIncludes('src/main.ts', 'v2128-direction-ui-fishing-correction-root', 'main root v2128 class');
assertIncludes('src/main.ts', 'v2128-world-controls', 'top controls v2128 class');
assertIncludes('src/main.ts', 'v2128-bottom-nav', 'bottom nav v2128 class');
assertIncludes('src/main.ts', 'v2128-fishing-upgrade-screen', 'fishing v2128 class');
assertIncludes('src/main.ts', 'openingIntroPending', 'first-start opening gate');
assertIncludes('src/main.ts', 'openingIntroShown', 'first-start opening shown state');

console.log('[v2128] direction/ui/fishing audit PASS');
