import fs from 'node:fs';
import path from 'node:path';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (msg) => { console.error(`[v2031-final-screen-audit] ${msg}`); process.exit(1); };
const has = (file, needle, msg) => { if (!read(file).includes(needle)) fail(msg); };

const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '2.0.31') fail('package.json version must be 2.0.31');
has('src/data.ts', "APP_VERSION = '2.0.31'", 'APP_VERSION must be 2.0.31');
has('src/data.ts', 'aqua-fantasia-v2.0.31-pixel-perfect-audit', 'cache name must be v2.0.31 pixel-perfect lineage');
has('public/offline.html', 'v2.0.31', 'offline badge must be v2.0.31');
has('public/sw.js', 'aqua-fantasia-v2.0.31-pixel-perfect-audit', 'service worker cache must be v2.0.31 pixel-perfect lineage');

const main = read('src/main.ts');
const world = read('src/villageWorld.ts');
const css = read('src/styles.css');

for (const token of [
  "dataset.v2031FinalAudit = 'v2031-final-screen-audit'",
  "dataset.v2031DirectionAudit = 'v2031-eight-direction-clock-audit'",
  'v2031-fishing-clean-screen',
  'v2031-identical-dock-nav',
  'v2031-cast-button',
  'v2031-reel-panel',
  'v2031-recent-catch-card',
  "dataset.v2031DockGuard = 'v2031-home-fishing-menu-identical-dock'",
]) if (!main.includes(token)) fail(`main.ts missing ${token}`);

for (const oldProp of ['v2019-fishing-prop v2019-splash-ready', 'v2020-fishing-prop v2020-pearl-flash', 'v2021-fishing-prop v2021-warning-pulse']) {
  if (main.includes(oldProp)) fail(`oversized fishing prop still rendered: ${oldProp}`);
}

for (const token of [
  'true 8-way angular quantization',
  "movement: 'northeast', dx: 0.5, dy: -0.866",
  "movement: 'southeast', dx: 0.5, dy: 0.866",
  "return 'northeast';",
]) if (!world.includes(token)) fail(`villageWorld.ts missing direction guard ${token}`);

const roles = ['player', 'chief', 'merchant', 'guild', 'captain', 'tourist', 'vip'];
const directions = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'];
for (const role of roles) {
  for (const direction of directions) {
    const asset = path.join('public/assets/v2023/characters', `${role}_${direction}.png`);
    if (!fs.existsSync(asset)) fail(`missing 8-direction asset ${asset}`);
  }
}

for (const token of [
  'html[data-v2031-final-audit="v2031-final-screen-audit"]',
  '--v2031-dock-button',
  '.bottom-nav.v2031-identical-dock-nav',
  '.v2-profile-chip.v2017-profile-button::after { display: none',
  'body[data-screen="fishing"] .v2031-fishing-stage',
  'body[data-screen="fishing"] .v2031-reel-panel',
  'body[data-screen="fishing"] .v2031-cast-button',
  'body[data-screen="fishing"] :is(.action-badge,.bite-callout',
  '.v2-build-tray',
]) if (!css.includes(token)) fail(`styles.css missing ${token}`);

for (const forbidden of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  if (read('package-lock.json').includes(forbidden)) fail(`package-lock contains forbidden registry token ${forbidden}`);
}

console.log('[AquaFantasia] v2.0.31 final screen audit validation passed.');
