import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const fail = (message) => {
  console.error(`[v2127] ${message}`);
  process.exit(1);
};
const assertIncludes = (file, text, label = text) => {
  const body = read(file);
  if (!body.includes(text)) fail(`${file} missing ${label}`);
};

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
if (pkg.version !== '2.1.27') fail(`package.json version is ${pkg.version}`);
const lock = JSON.parse(read('package-lock.json'));
if (lock.version !== '2.1.27' || lock.packages?.['']?.version !== '2.1.27') fail('package-lock.json version mismatch');
assertIncludes('src/data.ts', "APP_VERSION = '2.1.27'", 'APP_VERSION 2.1.27');
assertIncludes('public/sw.js', 'aqua-fantasia-v2.1.27-direction-motion-ui-fishing-audit', 'v2.1.27 cache name');
assertIncludes('public/offline.html', 'v2.1.27', 'offline badge v2.1.27');

checkBalancedCss('src/styles.css');
assertIncludes('src/styles.css', 'v2127-direction-motion-ui-audit-root', 'v2127 CSS root');
assertIncludes('src/styles.css', 'border: 0 !important;', 'opening border removal');
assertIncludes('src/styles.css', 'box-shadow: none !important;', 'opening chrome removal');
assertIncludes('src/styles.css', '--v2127-command-width: 154px', 'top command width');
assertIncludes('src/styles.css', 'width: 188px !important;', 'bottom dock width');
assertIncludes('src/styles.css', 'width: 22px !important;', 'bottom dock icon size');
assertIncludes('src/styles.css', '--v2127-joystick-transform', 'joystick runtime transform');

const village = read('src/villageWorld.ts');
for (const token of [
  'ACTOR_DIRECTION_TEXTURE_FIX',
  'ACTOR_DIRECTION_TEXTURES',
  'actorDirectionFromVector',
  'actorTextureUrl',
  'actorDirectionQaPasses',
  'V2127_DIRECTION_MOTION_AUDIT_LOCK',
]) {
  if (!village.includes(token)) fail(`src/villageWorld.ts missing ${token}`);
}
if (!village.includes("east: 'west'")) fail('player visual mapping must route east movement to west-labelled asset for current supplied PNG set');
if (!village.includes("west: 'east'")) fail('player visual mapping must route west movement to east-labelled asset for current supplied PNG set');
if (!village.includes("playerActorVisualDirection('east') === 'west'")) fail('player east QA mapping missing');
if (!village.includes("playerActorVisualDirection('west') === 'east'")) fail('player west QA mapping missing');
if (!village.includes('actor.walkPhase += deltaMs * 0.0095')) fail('walk animation speed must stay slower than tremble range');
if (!village.includes("--v2127-joystick-transform")) fail('joystick must update v2127 transform variable');

const frameDir = path.join(root, 'public/assets/v2118/characters/player');
const directions = ['north','northeast','east','southeast','south','southwest','west','northwest'];
for (const dir of directions) {
  for (let i = 1; i <= 4; i += 1) {
    const file = path.join(frameDir, `player_${dir}_frame_${String(i).padStart(2, '0')}.png`);
    if (!fs.existsSync(file)) fail(`missing player frame ${file}`);
  }
}

const main = read('src/main.ts');
assertIncludes('src/main.ts', 'v2127-direction-motion-ui-audit-root', 'main root v2127 class');
assertIncludes('src/main.ts', 'v2127-opening-cinematic', 'opening v2127 class');
assertIncludes('src/main.ts', 'v2127-world-controls', 'top controls v2127 class');
assertIncludes('src/main.ts', 'v2127-bottom-nav', 'bottom nav v2127 class');
assertIncludes('src/main.ts', 'v2127-fishing-uiux-screen', 'fishing v2127 class');
assertIncludes('src/main.ts', 'openingIntroPending', 'first-start opening gate');
assertIncludes('src/main.ts', 'openingIntroShown', 'first-start opening shown state');

console.log('[v2127] regression audit PASS');
