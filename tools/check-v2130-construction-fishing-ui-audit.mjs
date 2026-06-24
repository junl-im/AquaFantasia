import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const fail = (message) => {
  console.error(`[v2130] ${message}`);
  process.exit(1);
};
const assertIncludes = (file, needle, label = needle) => {
  if (!read(file).includes(needle)) fail(`${file} missing ${label}`);
};
const assertFile = (file) => {
  if (!fs.existsSync(path.join(root, file))) fail(`missing file: ${file}`);
};

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
if (pkg.version !== '2.1.30') fail(`package.json version is ${pkg.version}`);
if (lock.version !== '2.1.30' || lock.packages?.['']?.version !== '2.1.30') fail('package-lock.json version mismatch');
assertIncludes('src/data.ts', "APP_VERSION = '2.1.30'", 'APP_VERSION 2.1.30');
assertIncludes('src/data.ts', 'aqua-fantasia-v2.1.30-construction-fishing-ui-audit', 'v2.1.30 cache name');
assertIncludes('public/sw.js', 'aqua-fantasia-v2.1.30-construction-fishing-ui-audit', 'service worker cache');
assertIncludes('public/offline.html', 'v2.1.30', 'offline badge');

const styles = read('src/styles.css');
const main = read('src/main.ts');
const village = read('src/villageWorld.ts');

const pairs = { '(': ')', '{': '}', '[': ']' };
const stack = [];
let inComment = false;
let quote = '';
for (let i = 0; i < styles.length; i += 1) {
  const ch = styles[i];
  const next = styles[i + 1];
  if (inComment) {
    if (ch === '*' && next === '/') { inComment = false; i += 1; }
    continue;
  }
  if (!quote && ch === '/' && next === '*') { inComment = true; i += 1; continue; }
  if (quote) {
    if (ch === '\\') { i += 1; continue; }
    if (ch === quote) quote = '';
    continue;
  }
  if (ch === '"' || ch === "'") { quote = ch; continue; }
  if (pairs[ch]) stack.push({ ch, i });
  else if (Object.values(pairs).includes(ch)) {
    const open = stack.pop();
    if (!open || pairs[open.ch] !== ch) fail(`CSS bracket mismatch near index ${i}`);
  }
}
if (stack.length) fail(`CSS unclosed bracket ${stack.at(-1).ch} near index ${stack.at(-1).i}`);

assertIncludes('src/main.ts', 'v2130-construction-fishing-ui-root', 'html v2130 root');
assertIncludes('src/main.ts', 'v2130-build-confirm', 'build confirm markup');
assertIncludes('src/main.ts', 'v2130-fishing-start-card', 'fishing start card');
assertIncludes('src/main.ts', 'v2130-bottom-nav', 'bottom nav class');
assertIncludes('src/main.ts', 'v2130-world-controls', 'world controls class');

assertIncludes('src/villageWorld.ts', 'V2129_PLAYER_FILENAME_DIRECTION_LOCK', 'v2129 player lock preserved');
assertIncludes('src/villageWorld.ts', 'V2130_PLAYER_MOTION_IMMUTABLE_LOCK', 'v2130 player immutable lock');
assertIncludes('src/villageWorld.ts', "east: 'east'", 'east filename direct mapping');
assertIncludes('src/villageWorld.ts', "west: 'west'", 'west filename direct mapping');
assertIncludes('src/villageWorld.ts', './assets/v2129/characters/player/player_', 'v2129 player frame path preserved');
assertIncludes('src/villageWorld.ts', 'showBuildConfirm({ type: this.selectedBuild', 'build confirm replaces immediate install');
assertIncludes('src/villageWorld.ts', 'applyPendingBuildPlacement', 'build confirm apply method');
assertIncludes('src/villageWorld.ts', "def.kind === 'building'", 'prop labels suppressed');
assertIncludes('src/villageWorld.ts', 'stroke: { color: 0xffffff, width: 2 }', 'thin actor label outline');
assertIncludes('src/villageWorld.ts', "'--v2130-joystick-transform'", 'v2130 joystick variable');

const playerDir = 'public/assets/v2129/characters/player';
for (const dir of ['south','southeast','east','northeast','north','northwest','west','southwest']) {
  for (let frame = 1; frame <= 4; frame += 1) assertFile(`${playerDir}/player_${dir}_frame_${String(frame).padStart(2, '0')}.png`);
}
const npcRoles = ['chief', 'merchant', 'guild', 'captain', 'tourist', 'vip'];
const dirs = ['south','southeast','east','northeast','north','northwest','west','southwest'];
for (const role of npcRoles) for (const dir of dirs) assertFile(`public/assets/v2047/characters/${role}_${dir}.png`);

for (const token of [
  '--v2130-command-width: 184px',
  '.v2130-world-controls',
  'background: transparent !important',
  '.bottom-nav.v2130-bottom-nav',
  '.v2097-name-editor input',
  '.v2130-build-confirm.open',
  '.v2130-fishing-start-card',
  '.fishing-screen.v2130-fishing-rebuild-screen',
]) {
  if (!styles.includes(token)) fail(`styles.css missing ${token}`);
}

const forbidden = ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai'];
for (const file of ['package.json', 'package-lock.json', 'src/data.ts', 'src/main.ts', 'src/villageWorld.ts', 'src/styles.css', 'public/sw.js', 'public/offline.html', 'README.md']) {
  const text = read(file);
  for (const token of forbidden) if (text.includes(token)) fail(`${file} contains forbidden token ${token}`);
}

console.log('[v2130] construction/fishing/ui audit passed');
