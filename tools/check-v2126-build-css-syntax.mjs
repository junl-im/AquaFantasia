import fs from 'node:fs';
import path from 'node:path';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => { throw new Error(`[v2126] ${message}`); };
const exists = (file) => fs.existsSync(file);

function validateBalancedCss(css, file = 'src/styles.css') {
  const stack = [];
  let inComment = false;
  let quote = '';
  for (let i = 0; i < css.length; i += 1) {
    const ch = css[i];
    const next = css[i + 1] ?? '';
    if (inComment) {
      if (ch === '*' && next === '/') {
        inComment = false;
        i += 1;
      }
      continue;
    }
    if (quote) {
      if (ch === '\\') {
        i += 1;
        continue;
      }
      if (ch === quote) quote = '';
      continue;
    }
    if (ch === '/' && next === '*') {
      inComment = true;
      i += 1;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === '(' || ch === '[' || ch === '{') {
      stack.push({ ch, i });
      continue;
    }
    if (ch === ')' || ch === ']' || ch === '}') {
      const open = stack.pop();
      const expected = ch === ')' ? '(' : ch === ']' ? '[' : '{';
      if (!open) fail(`${file}: unexpected closing ${ch} at offset ${i}`);
      if (open.ch !== expected) fail(`${file}: mismatched ${open.ch} closed by ${ch} at offset ${i}`);
    }
  }
  if (inComment) fail(`${file}: unclosed CSS comment`);
  if (quote) fail(`${file}: unclosed string literal`);
  if (stack.length) {
    const open = stack.at(-1);
    const before = css.slice(0, open.i);
    const line = before.split('\n').length;
    const column = open.i - before.lastIndexOf('\n');
    fail(`${file}: unclosed ${open.ch} at ${line}:${column}`);
  }
}

const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '2.1.26') fail(`package version mismatch: ${pkg.version}`);
if (!pkg.scripts?.validate?.includes('check-v2126-build-css-syntax.mjs')) fail('validate script not wired to v2126 check');
const lock = JSON.parse(read('package-lock.json'));
if (lock.version !== '2.1.26' || lock.packages?.['']?.version !== '2.1.26') fail('package-lock version mismatch');

const data = read('src/data.ts');
if (!data.includes("APP_VERSION = '2.1.26'")) fail('APP_VERSION not synced');
if (!data.includes('aqua-fantasia-v2.1.26-css-build-syntax-fix')) fail('cache name not synced');

const main = read('src/main.ts');
const world = read('src/villageWorld.ts');
const css = read('src/styles.css');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const readme = read('README.md');

validateBalancedCss(css);

const cssTokens = [
  'v2.1.25 opening/direction/motion/UI polish',
  'v2.1.26 CSS build syntax guard',
  'html.v2125-opening-direction-motion-ui-root',
  'transform: var(--v2125-joystick-transform, var(--v2124-joystick-transform, var(--v2123-joystick-transform, var(--v2122-joystick-transform, var(--v2121-joystick-transform, translate(-50%, -50%)))))) !important;',
  '.v2125-opening-cinematic',
  '.v2125-opening-video',
  '.v2125-world-controls',
  '.bottom-nav.v2125-bottom-nav',
  '.fishing-screen.v2125-fishing-polish-screen .bottom-nav',
];
for (const token of cssTokens) if (!css.includes(token)) fail(`css missing ${token}`);
const v2125JoystickTransformLines = css.split('\n').filter((line) => line.includes('transform: var(--v2125-joystick-transform'));
if (!v2125JoystickTransformLines.some((line) => line.trim().endsWith(')))))) !important;'))) {
  fail('v2125 joystick transform fallback must close all nested var() functions');
}

const mainTokens = [
  "document.documentElement.dataset.v2125OpeningDirectionMotionUi = 'v2125-opening-direction-motion-ui';",
  "'v2125-opening-direction-motion-ui-root'",
  'openingIntroPending && !this.openingIntroShown',
  'v2125-opening-cinematic',
  'v2125-opening-video',
  'v2125-world-controls',
  'v2125-bottom-nav',
];
for (const token of mainTokens) if (!main.includes(token)) fail(`main missing ${token}`);
if (main.includes('class="v2097-village-loading v2111-village-loading')) fail('opening section must not use legacy loading card classes');

const worldTokens = [
  'V2125_DIRECTION_MOTION_LOCK',
  "east: 'east'",
  "west: 'west'",
  "northeast: 'northwest'",
  "northwest: 'northeast'",
  'if (this.joystick.active) this.movePlayerByJoystick(deltaMs);',
  'else this.updateActor(this.player, deltaMs);',
  "knob.style.setProperty('--v2125-joystick-transform', knobTransform);",
  "knob.style.setProperty('--v2125-joystick-transform', 'translate(-50%, -50%)');",
  'Math.floor(actor.walkPhase) % PLAYER_ACTOR_FRAME_COUNT',
];
for (const token of worldTokens) if (!world.includes(token)) fail(`world missing ${token}`);

const lockedTokens = ['ACTOR_DIRECTION_TEXTURE_FIX', 'ACTOR_DIRECTION_TEXTURES', 'actorDirectionFromVector', 'actorTextureUrl', 'actorDirectionQaPasses'];
for (const token of lockedTokens) if (!world.includes(token)) fail(`locked direction token missing: ${token}`);

if (!sw.includes('aqua-fantasia-v2.1.26-css-build-syntax-fix')) fail('service worker cache not synced');
if (!offline.includes('v2.1.26')) fail('offline badge/version not synced');
if (!readme.includes('## v2.1.26 변경사항')) fail('README v2.1.26 notes missing');

const frameDir = 'public/assets/v2118/characters/player';
const directions = ['south','southeast','east','northeast','north','northwest','west','southwest'];
let frameCount = 0;
for (const direction of directions) {
  for (let i = 1; i <= 4; i += 1) {
    const file = path.join(frameDir, `player_${direction}_frame_${String(i).padStart(2,'0')}.png`);
    if (!exists(file)) fail(`missing player frame ${file}`);
    if (fs.statSync(file).size < 1000) fail(`player frame looks empty ${file}`);
    frameCount += 1;
  }
}
if (frameCount !== 32) fail(`player frame count mismatch ${frameCount}`);

const openingMp4 = 'public/assets/v2120/opening/aqua_opening_v2120.mp4';
if (!exists(openingMp4)) fail('opening mp4 missing');
if (fs.statSync(openingMp4).size > 2_500_000) fail('opening mp4 must stay optimized under 2.5MB');

const forbidden = [
  'packages.' + 'applied-caas',
  'applied-caas-' + 'gateway',
  '10.' + '192.',
  'internal.api.' + 'openai',
];
for (const file of ['package.json','package-lock.json','src/main.ts','src/villageWorld.ts','src/data.ts','src/styles.css','public/sw.js','public/offline.html','README.md']) {
  const text = read(file);
  for (const needle of forbidden) if (text.includes(needle)) fail(`forbidden registry/internal string in ${file}: ${needle}`);
}

console.log(JSON.stringify({ ok: true, version: '2.1.26', cssBalanced: true, playerFrames: frameCount }, null, 2));
