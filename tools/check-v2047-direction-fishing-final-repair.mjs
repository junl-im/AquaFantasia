import fs from 'node:fs';
import path from 'node:path';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => { console.error(`[v2047-direction-fishing-final-repair] ${message}`); process.exit(1); };
const must = (condition, message) => { if (!condition) fail(message); };
const has = (source, token, label = token) => must(source.includes(token), `missing ${label}`);

const pkg = JSON.parse(read('package.json'));
const main = read('src/main.ts');
const css = read('src/styles.css');
const world = read('src/villageWorld.ts');
const data = read('src/data.ts');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const readme = read('README.md');
const lock = read('package-lock.json');

const version = String(pkg.version);
const [major, minor, patch] = version.split('.').map(Number);
must(major === 2 && minor === 0 && patch >= 47, 'package.json version must be 2.0.47 or newer');
has(data, "APP_VERSION = '2.0.47'", 'APP_VERSION 2.0.47');
has(data, 'aqua-fantasia-v2.0.47-direction-fishing-final-repair', 'data cache v2.0.47');
has(sw, 'aqua-fantasia-v2.0.47-direction-fishing-final-repair', 'sw cache v2.0.47');
has(offline, 'v2.0.47', 'offline badge v2.0.47');
has(readme, '# AquaFantasia v2.0.47', 'README title v2.0.47');
has(readme, '## v2.0.47', 'README v2.0.47 changelog');

for (const token of [
  "dataset.v2047DirectionFishingRepair = 'v2047-direction-fishing-final-repair'",
  'v2046-fishing-playable-screen v2047-fishing-playable-screen',
  'v2047-fishing-stage',
  'v2047-reel-panel',
  'v2047-hold-pad',
  'v2047-identical-dock-nav',
  "nav.dataset.v2047DockGuard = 'v2047-fixed-visible-aqua-dock'",
  "nav.style.setProperty('bottom', 'max(112px, calc(env(safe-area-inset-bottom) + 112px))'",
  "this.tension = 50 + this.getRegion().difficulty * 2",
  'safeTimer >= 2.4',
  "아래 큰 노란 버튼을 꾹 누르거나 바다 화면을 누르며 초록 안전지대를 2.4초 유지하세요",
]) has(main, token, `main token ${token}`);

for (const token of [
  'v2.0.47 Direction/fishing final repair',
  '--v2047-dock-bottom',
  '.bottom-nav.v2047-identical-dock-nav',
  'body[data-screen="fishing"] .bottom-nav.v2047-identical-dock-nav',
  '.fishing-screen.v2047-fishing-playable-screen .v2047-reel-panel',
  '.v2047-hold-pad strong::before',
]) has(css, token, `css token ${token}`);

for (const token of [
  './assets/v2047/characters/player_south.png',
  './assets/v2047/characters/player_${direction}.png',
  "northeast: 'northeast'",
  "southeast: 'southeast'",
  "northwest: 'northwest'",
  "southwest: 'southwest'",
  'ACTOR_DIRECTION_QA_VECTORS',
]) has(world, token, `world token ${token}`);

const directions = ['south', 'southeast', 'east', 'northeast', 'north', 'northwest', 'west', 'southwest'];
const roles = ['player', 'chief', 'merchant', 'guild', 'captain', 'tourist', 'vip'];
for (const role of roles) {
  for (const direction of directions) {
    const file = path.join('public/assets/v2047/characters', `${role}_${direction}.png`);
    must(fs.existsSync(file), `missing v2047 clock-corrected asset ${file}`);
    must(fs.statSync(file).size > 1024, `v2047 clock-corrected asset looks empty ${file}`);
  }
}

for (const forbidden of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  must(!lock.includes(forbidden), `package-lock contains forbidden registry token ${forbidden}`);
}
const rootMarkdown = fs.readdirSync('.').filter((name) => name.toLowerCase().endsWith('.md'));
must(rootMarkdown.length === 1 && rootMarkdown[0] === 'README.md', 'root must contain README.md only');
const forbiddenNotes = fs.readdirSync('.', { recursive: true }).filter((name) => /_NOTES\.md$/i.test(String(name)));
must(forbiddenNotes.length === 0, 'must not create *_NOTES.md files');
console.log('[AquaFantasia] v2.0.47 direction/fishing final repair validation passed.');
