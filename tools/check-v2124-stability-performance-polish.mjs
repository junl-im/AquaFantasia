import fs from 'node:fs';
import path from 'node:path';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => { throw new Error(`[v2124] ${message}`); };
const exists = (file) => fs.existsSync(file);

const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '2.1.24') fail(`package version mismatch: ${pkg.version}`);
if (!pkg.scripts?.validate?.includes('check-v2124-stability-performance-polish.mjs')) fail('validate script not wired to v2124 check');
const lock = JSON.parse(read('package-lock.json'));
if (lock.version !== '2.1.24' || lock.packages?.['']?.version !== '2.1.24') fail('package-lock version mismatch');

const data = read('src/data.ts');
if (!data.includes("APP_VERSION = '2.1.24'")) fail('APP_VERSION not synced');
if (!data.includes('aqua-fantasia-v2.1.24-stability-performance-polish')) fail('cache name not synced');

const main = read('src/main.ts');
const world = read('src/villageWorld.ts');
const css = read('src/styles.css');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const readme = read('README.md');

const mainTokens = [
  "document.documentElement.dataset.v2124StabilityPerformance = 'v2124-stability-performance-polish';",
  "'v2124-stability-performance-root'",
  'v2124-village-ready',
  'v2124-village-opening-state',
  'v2124-opening-cinematic',
  'v2124-runtime-page-shell',
  'v2124-aqua-page',
  'v2124-world-controls',
  'v2124-bottom-nav',
  'right-bottom-input-stable',
  'v2124-fishing-stability-screen',
  "document.body.classList.toggle('v2124-modal-open', hidden);",
  "document.body.classList.toggle('v2124-expedition-open', willOpen);",
  '/^v(?:20|21)\\d{2,}-(?:modal|expedition|build|build-tray|interior|character)-open$/',
  '.v2053-reel-touch-zone, .v2054-reel-touch-zone, .hold-pad, .v2057-reel-button',
  'openingIntroPending && !this.openingIntroShown',
];
for (const token of mainTokens) if (!main.includes(token)) fail(`main missing ${token}`);
if (!/const minimumOpeningMs = shouldPlayOpening \? \(reducedOpeningMotion \? 650 : 2400\) : 0;/.test(main)) fail('opening must not delay non-opening village routes');
if (!main.includes("root.dataset.v2124StabilityPerformance = shouldPlayOpening ? 'opening-isolated' : 'ui-state-clean';")) fail('v2124 village route state dataset missing');

const worldTokens = [
  "const V2124_STATE_INPUT_LOCK = 'v2124-state-input-performance-lock';",
  'this.root.dataset.v2124StateInputLock = V2124_STATE_INPUT_LOCK;',
  "knob.style.setProperty('--v2124-joystick-transform', knobTransform);",
  "knob.style.setProperty('--v2124-joystick-transform', 'translate(-50%, -50%)');",
  'playerActorVisualDirection(\'east\') === \'west\'',
  'playerActorVisualDirection(\'west\') === \'east\'',
  'Math.floor(actor.walkPhase) % PLAYER_ACTOR_FRAME_COUNT',
];
for (const token of worldTokens) if (!world.includes(token)) fail(`world missing ${token}`);

const cssTokens = [
  'v2.1.24 stability/performance polish',
  'html.v2124-stability-performance-root',
  '--v2124-joystick-transform',
  '.bottom-nav.v2124-bottom-nav',
  '.runtime-menu-screen.v2124-runtime-page-shell .v2124-aqua-page',
  '.fishing-screen.v2124-fishing-stability-screen :is(.reel-panel,.v2055-reel-console,.v2053-reel-touch-zone,.v2054-reel-touch-zone)',
  'html.perf-lite.v2124-stability-performance-root',
];
for (const token of cssTokens) if (!css.includes(token)) fail(`css missing ${token}`);

if (!sw.includes('aqua-fantasia-v2.1.24-stability-performance-polish')) fail('service worker cache not synced');
if (!offline.includes('v2.1.24')) fail('offline badge/version not synced');
if (!readme.includes('## v2.1.24 변경사항')) fail('README v2.1.24 notes missing');

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
