import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => { console.error(`[v2048-dock-fishing-anchor-system] ${message}`); process.exit(1); };
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

must(pkg.version === '2.0.48', 'package.json version must be 2.0.48');
has(data, "APP_VERSION = '2.0.48'", 'APP_VERSION 2.0.48');
has(data, 'aqua-fantasia-v2.0.48-dock-fishing-anchor-system', 'data cache v2.0.48');
has(sw, 'aqua-fantasia-v2.0.48-dock-fishing-anchor-system', 'sw cache v2.0.48');
has(offline, 'v2.0.48', 'offline badge v2.0.48');
has(readme, '# AquaFantasia v2.0.48', 'README title v2.0.48');
has(readme, '## v2.0.48', 'README v2.0.48 changelog');

for (const token of [
  "dataset.v2048DockFishingAnchorSystem = 'v2048-dock-fishing-anchor-system'",
  'v2048-fishing-playable-screen',
  'v2048-fishing-stage',
  'v2048-reel-panel',
  'v2048-hold-pad',
  'v2048-cast-button',
  'v2048-identical-dock-nav',
  "nav.dataset.v2048DockGuard = 'v2048-natural-dock-shape-no-empty-frame'",
  'dock-row dock-row-top',
  'dock-row dock-row-bottom',
  'var(--v2048-fishing-dock-bottom',
  'data-reel-status',
  '누르면 게이지가 올라가고, 떼면 내려갑니다',
  'safeTimer >= 2.2',
]) has(main, token, `main token ${token}`);

for (const token of [
  'v2.0.48 Dock/fishing/anchor system',
  '--v2048-dock-bottom',
  '--v2048-fishing-dock-bottom',
  '.bottom-nav.v2048-identical-dock-nav .dock-row-top',
  '.bottom-nav.v2048-identical-dock-nav .dock-row-bottom',
  '.cast-button.v2048-cast-button',
  '.fishing-screen.v2048-fishing-playable-screen .v2048-reel-panel',
  '.v2048-reel-status',
  'body[data-screen="fishing"] .bottom-nav.v2048-identical-dock-nav',
]) has(css, token, `css token ${token}`);

for (const token of [
  'function footprintGround',
  'bottom-center ground anchor',
  "dataset.v2048VillageAnchorSystem = 'bottom-center-footprint-anchor'",
  'const center = footprintGround(building.x, building.y, building.w, building.h)',
  'const center = footprintGround(x, y, w, h)',
]) has(world, token, `world token ${token}`);

for (const forbidden of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  must(!lock.includes(forbidden), `package-lock contains forbidden registry token ${forbidden}`);
}
const rootMarkdown = fs.readdirSync('.').filter((name) => name.toLowerCase().endsWith('.md'));
must(rootMarkdown.length === 1 && rootMarkdown[0] === 'README.md', 'root must contain README.md only');
const forbiddenNotes = fs.readdirSync('.', { recursive: true }).filter((name) => /_NOTES\.md$/i.test(String(name)));
must(forbiddenNotes.length === 0, 'must not create *_NOTES.md files');
console.log('[AquaFantasia] v2.0.48 dock/fishing/anchor system validation passed.');
