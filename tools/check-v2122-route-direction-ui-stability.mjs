import fs from 'node:fs';
import path from 'node:path';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => { throw new Error(`[v2122] ${message}`); };
const exists = (file) => fs.existsSync(file);

const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '2.1.22') fail(`package version mismatch: ${pkg.version}`);
const lock = JSON.parse(read('package-lock.json'));
if (lock.version !== '2.1.22' || lock.packages?.['']?.version !== '2.1.22') fail('package-lock version mismatch');
const data = read('src/data.ts');
if (!data.includes("APP_VERSION = '2.1.22'")) fail('APP_VERSION not synced');
if (!data.includes('aqua-fantasia-v2.1.22-route-direction-ui-stability')) fail('cache name not synced');
const main = read('src/main.ts');
const world = read('src/villageWorld.ts');
const css = read('src/styles.css');
const sw = read('public/sw.js');
const offline = read('public/offline.html');

const requiredMain = [
  'openingIntroPending = false',
  'openingIntroShown = false',
  'const shouldPlayOpening = this.openingIntroPending && !this.openingIntroShown;',
  '${shouldPlayOpening ? `<section class="v2097-village-loading',
  'v2122-opening-cinematic',
  'v2122-village-opening-state',
  'if (shouldPlayOpening) { this.openingIntroShown = true; this.openingIntroPending = false; }',
  'this.openingIntroPending = true;',
  "document.documentElement.dataset.v2122RouteDirectionUi = 'v2122-route-direction-ui-stability';",
  "'v2122-route-direction-ui-stability-root'",
  'v2122-runtime-page-shell',
  'v2122-bottom-nav',
];
for (const token of requiredMain) if (!main.includes(token)) fail(`main missing ${token}`);

if (!main.includes("root.dataset.v2122RouteDirectionUi = shouldPlayOpening ? 'first-start-opening' : 'direct-village-route';")) fail('village route marker missing');
if (!main.includes('data-v2121-opening-skip')) fail('opening skip missing');
if (!/const minimumOpeningMs = shouldPlayOpening \? \(reducedOpeningMotion \? 650 : 2400\) : 0;/.test(main)) fail('opening minimum must be zero for normal village routes');

const requiredWorld = [
  "const V2122_PLAYER_CARDINAL_MOTION_LOCK = 'v2122-player-cardinal-motion-lock';",
  "east: 'east'",
  "west: 'west'",
  "northeast: 'northwest'",
  "northwest: 'northeast'",
  "playerActorVisualDirection('east') === 'east'",
  "playerActorVisualDirection('west') === 'west'",
  'this.root.dataset.v2122PlayerCardinalMotionLock = V2122_PLAYER_CARDINAL_MOTION_LOCK;',
  'const frameIndex = walking ? Math.floor(actor.walkPhase / 3) % PLAYER_ACTOR_FRAME_COUNT : 0;',
  'actor.body.scale.set(baseScale);',
];
for (const token of requiredWorld) if (!world.includes(token)) fail(`world missing ${token}`);

const playerDirBlock = world.match(/const PLAYER_ACTOR_DIRECTION_TEXTURE_FIX[\s\S]*?};/);
if (!playerDirBlock) fail('player direction fix block missing');
if (/east:\s*'west'|west:\s*'east'/.test(playerDirBlock[0])) fail('cardinal east/west remap must not be reversed');

const frameDir = 'public/assets/v2118/characters/player';
const directions = ['south','southeast','east','northeast','north','northwest','west','southwest'];
let frameCount = 0;
for (const direction of directions) {
  for (let i = 1; i <= 4; i += 1) {
    const f = path.join(frameDir, `player_${direction}_frame_${String(i).padStart(2,'0')}.png`);
    if (!exists(f)) fail(`missing player frame ${f}`);
    frameCount += 1;
  }
}

const cssTokens = [
  'v2.1.22 route/direction/UI stability patch',
  '.v2122-opening-cinematic::before',
  '.v2122-opening-video',
  '.v2122-opening-bubble',
  '.v2122-opening-skip',
  '.village-world-screen:not(.v2122-village-opening-state) .v2122-opening-cinematic',
  '.bottom-nav.v2122-bottom-nav',
  '.runtime-menu-screen.v2122-runtime-page-shell .v2122-aqua-page',
];
for (const token of cssTokens) if (!css.includes(token)) fail(`css missing ${token}`);
if (!sw.includes('aqua-fantasia-v2.1.22-route-direction-ui-stability')) fail('service worker cache not synced');
if (!offline.includes('v2.1.22')) fail('offline badge not synced');

const readme = read('README.md');
if (!readme.includes('# AquaFantasia v2.1.22')) fail('README title not synced');
if (!readme.includes('최초 시작 로딩 전용')) fail('README opening route note missing');
if (!readme.includes('3시 방향') || !readme.includes('9시 방향')) fail('README direction note missing');

console.log('[v2122] route-isolated opening, cardinal direction/motion lock, and popup UI stability passed.');
console.log(JSON.stringify({ ok: true, version: '2.1.22', playerFrames: frameCount, opening: 'first-start-only' }, null, 2));
