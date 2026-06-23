import fs from 'node:fs';
import path from 'node:path';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => { throw new Error(`[v2125] ${message}`); };
const exists = (file) => fs.existsSync(file);

const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '2.1.25') fail(`package version mismatch: ${pkg.version}`);
if (!pkg.scripts?.validate?.includes('check-v2125-opening-direction-motion-ui.mjs')) fail('validate script not wired to v2125 check');
const lock = JSON.parse(read('package-lock.json'));
if (lock.version !== '2.1.25' || lock.packages?.['']?.version !== '2.1.25') fail('package-lock version mismatch');

const data = read('src/data.ts');
if (!data.includes("APP_VERSION = '2.1.25'")) fail('APP_VERSION not synced');
if (!data.includes('aqua-fantasia-v2.1.25-opening-direction-motion-ui')) fail('cache name not synced');

const main = read('src/main.ts');
const world = read('src/villageWorld.ts');
const css = read('src/styles.css');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const readme = read('README.md');

const mainTokens = [
  "document.documentElement.dataset.v2125OpeningDirectionMotionUi = 'v2125-opening-direction-motion-ui';",
  "'v2125-opening-direction-motion-ui-root'",
  'v2125-village-ready',
  'v2125-village-opening-state',
  'v2125-opening-cinematic',
  'v2125-opening-video',
  'v2125-opening-bubble',
  'v2125-world-controls',
  'v2125-bottom-nav',
  'v2125-runtime-page-shell',
  'v2125-aqua-page',
  'v2125-fishing-polish-screen',
  "nav.dataset.v2125Dock = 'slightly-larger-icons-stable';",
  'openingIntroPending && !this.openingIntroShown',
];
for (const token of mainTokens) if (!main.includes(token)) fail(`main missing ${token}`);
if (main.includes('class="v2097-village-loading v2111-village-loading')) fail('opening section must not use legacy loading card classes');
if (!main.includes("root.dataset.v2125OpeningDirectionMotionUi = shouldPlayOpening ? 'opening-video-no-chrome' : 'direct-route-no-opening';")) fail('v2125 opening route dataset missing');

const worldTokens = [
  "const V2125_DIRECTION_MOTION_LOCK = 'v2125-east-motion-visual-lock';",
  'this.root.dataset.v2125DirectionMotionLock = V2125_DIRECTION_MOTION_LOCK;',
  "east: 'east'",
  "west: 'west'",
  "northeast: 'northwest'",
  "northwest: 'northeast'",
  "playerActorVisualDirection('east') === 'east'",
  "playerActorVisualDirection('west') === 'west'",
  'if (this.joystick.active) this.movePlayerByJoystick(deltaMs);',
  'else this.updateActor(this.player, deltaMs);',
  "knob.style.setProperty('--v2125-joystick-transform', knobTransform);",
  "knob.style.setProperty('--v2125-joystick-transform', 'translate(-50%, -50%)');",
  'Math.floor(actor.walkPhase) % PLAYER_ACTOR_FRAME_COUNT',
];
for (const token of worldTokens) if (!world.includes(token)) fail(`world missing ${token}`);

const lockedTokens = ['ACTOR_DIRECTION_TEXTURE_FIX', 'ACTOR_DIRECTION_TEXTURES', 'actorDirectionFromVector', 'actorTextureUrl', 'actorDirectionQaPasses'];
for (const token of lockedTokens) if (!world.includes(token)) fail(`locked direction token missing: ${token}`);

const cssTokens = [
  'v2.1.25 opening/direction/motion/UI polish',
  'html.v2125-opening-direction-motion-ui-root',
  '.v2125-opening-cinematic',
  '.v2125-opening-cinematic::before',
  '.v2125-opening-cinematic > :not(.v2125-opening-video):not(.v2125-opening-vignette):not(.v2125-opening-bubble):not(.v2125-opening-skip)',
  '.v2125-opening-video',
  '.v2125-world-controls',
  'border-color: transparent !important',
  '.bottom-nav.v2125-bottom-nav',
  'width: 21px !important',
  '--v2125-joystick-transform',
  '.runtime-menu-screen.v2125-runtime-page-shell .v2125-aqua-page',
  '.fishing-screen.v2125-fishing-polish-screen .bottom-nav',
];
for (const token of cssTokens) if (!css.includes(token)) fail(`css missing ${token}`);

if (!sw.includes('aqua-fantasia-v2.1.25-opening-direction-motion-ui')) fail('service worker cache not synced');
if (!offline.includes('v2.1.25')) fail('offline badge/version not synced');
if (!readme.includes('## v2.1.25 변경사항')) fail('README v2.1.25 notes missing');

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

const forbidden = ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai'];
for (const file of ['package.json','package-lock.json','src/main.ts','src/villageWorld.ts','src/data.ts','src/styles.css','public/sw.js','public/offline.html','README.md']) {
  const text = read(file);
  for (const needle of forbidden) if (text.includes(needle)) fail(`forbidden registry/internal string in ${file}: ${needle}`);
}
