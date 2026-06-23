import fs from 'node:fs';
import path from 'node:path';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => { throw new Error(`[v2123] ${message}`); };
const exists = (file) => fs.existsSync(file);

const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '2.1.23') fail(`package version mismatch: ${pkg.version}`);
const lock = JSON.parse(read('package-lock.json'));
if (lock.version !== '2.1.23' || lock.packages?.['']?.version !== '2.1.23') fail('package-lock version mismatch');
const data = read('src/data.ts');
if (!data.includes("APP_VERSION = '2.1.23'")) fail('APP_VERSION not synced');
if (!data.includes('aqua-fantasia-v2.1.23-bug-ui-fishing-stability')) fail('cache name not synced');

const main = read('src/main.ts');
const world = read('src/villageWorld.ts');
const css = read('src/styles.css');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const readme = read('README.md');

const mainTokens = [
  "document.documentElement.dataset.v2123StabilityPolish = 'v2123-bug-ui-fishing-stability';",
  "'v2123-bug-ui-fishing-stability-root'",
  'v2123-village-stability-polish',
  'v2123-village-ready',
  'v2123-village-opening-state',
  'v2123-opening-cinematic',
  'v2123-opening-video',
  'v2123-runtime-page-shell',
  'v2123-aqua-page',
  'v2123-bottom-nav',
  'right-bottom-no-shift-stable',
  'v2123-fishing-stability-screen',
  'direct-route-no-opening',
];
for (const token of mainTokens) if (!main.includes(token)) fail(`main missing ${token}`);

if (main.includes('<button type="button" data-v2017-character-inventory>가방</button>\n            <button type="button" data-v2017-character-inventory>가방</button>')) fail('duplicate character inventory button returned');
if (!/const minimumOpeningMs = shouldPlayOpening \? \(reducedOpeningMotion \? 650 : 2400\) : 0;/.test(main)) fail('opening must have zero delay for non-opening village routes');
if (!main.includes('openingIntroPending && !this.openingIntroShown')) fail('opening first-start guard missing');

const worldTokens = [
  "const V2123_PLAYER_DIRECTION_MOTION_LOCK = 'v2123-player-direction-motion-hard-lock';",
  "this.root.dataset.v2123PlayerDirectionMotionLock = V2123_PLAYER_DIRECTION_MOTION_LOCK;",
  "east: 'west'",
  "west: 'east'",
  "northeast: 'northwest'",
  "northwest: 'northeast'",
  "playerActorVisualDirection('east') === 'west'",
  "playerActorVisualDirection('west') === 'east'",
  'actor.walkPhase += deltaMs * 0.026',
  'Math.floor(actor.walkPhase) % PLAYER_ACTOR_FRAME_COUNT',
  "knob.style.setProperty('--v2123-joystick-transform'",
];
for (const token of worldTokens) if (!world.includes(token)) fail(`world missing ${token}`);

const playerDirBlock = world.match(/const PLAYER_ACTOR_DIRECTION_TEXTURE_FIX[\s\S]*?};/);
if (!playerDirBlock) fail('player direction fix block missing');
if (!/east:\s*'west'/.test(playerDirBlock[0]) || !/west:\s*'east'/.test(playerDirBlock[0])) fail('player east/west asset remap not locked');
if (!/northeast:\s*'northwest'/.test(playerDirBlock[0]) || !/northwest:\s*'northeast'/.test(playerDirBlock[0])) fail('player diagonal remap not locked');

const frameDir = 'public/assets/v2118/characters/player';
const directions = ['south','southeast','east','northeast','north','northwest','west','southwest'];
let frameCount = 0;
for (const direction of directions) {
  for (let i = 1; i <= 4; i += 1) {
    const file = path.join(frameDir, `player_${direction}_frame_${String(i).padStart(2,'0')}.png`);
    if (!exists(file)) fail(`missing player frame ${file}`);
    const stat = fs.statSync(file);
    if (stat.size < 1000) fail(`player frame looks empty ${file}`);
    frameCount += 1;
  }
}

const cssTokens = [
  'v2.1.23 bug/UI/fishing stability patch',
  '.v2123-opening-cinematic',
  '.v2123-opening-video',
  '.village-world-screen:not(.v2123-village-opening-state) .v2123-opening-cinematic',
  '.bottom-nav.v2123-bottom-nav',
  '.runtime-menu-screen.v2123-runtime-page-shell .v2123-aqua-page',
  '.v2097-ui-close',
  '.fishing-screen.v2123-fishing-stability-screen',
  '.reel-panel:not(.hidden)',
  '.v2055-reel-console:not(.hidden)',
  '.v2053-reel-touch-zone:not(.hidden)',
];
for (const token of cssTokens) if (!css.includes(token)) fail(`css missing ${token}`);

if (!sw.includes('aqua-fantasia-v2.1.23-bug-ui-fishing-stability')) fail('service worker cache not synced');
if (!offline.includes('v2.1.23')) fail('offline badge not synced');
if (!readme.includes('# AquaFantasia v2.1.23')) fail('README title not synced');
if (!readme.includes('3시 이동') || !readme.includes('걷기 모션')) fail('README direction/motion note missing');
if (!readme.includes('오프닝 영상은 계속 최초 시작 로딩 전용')) fail('README opening route note missing');

console.log('[v2123] bug/UI/fishing stability checks passed.');
console.log(JSON.stringify({ ok: true, version: '2.1.23', playerFrames: frameCount, playerAssetRemap: { east: 'west', west: 'east' }, fishing: 'centered' }, null, 2));
