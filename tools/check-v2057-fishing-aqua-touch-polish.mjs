import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => { console.error(`[v2057-fishing-aqua-touch-polish] ${message}`); process.exit(1); };
const must = (condition, message) => { if (!condition) fail(message); };
const has = (source, token, label = token) => must(source.includes(token), `missing ${label}`);

const pkg = JSON.parse(read('package.json'));
const data = read('src/data.ts');
const main = read('src/main.ts');
const css = read('src/styles.css');
const world = read('src/villageWorld.ts');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const readme = read('README.md');
const lock = read('package-lock.json');

must(pkg.version === '2.0.57', 'package.json version must be 2.0.57');
has(data, "APP_VERSION = '2.0.57'", 'APP_VERSION 2.0.57');
has(data, 'aqua-fantasia-v2.0.57-fishing-aqua-touch-polish', 'data cache v2.0.57');
has(sw, 'aqua-fantasia-v2.0.57-fishing-aqua-touch-polish', 'sw cache v2.0.57');
has(offline, 'v2.0.57', 'offline badge v2.0.57');
has(readme, '# AquaFantasia v2.0.57', 'README title v2.0.57');
has(readme, '## v2.0.57', 'README changelog v2.0.57');
has(pkg.scripts.validate, 'check-v2057-fishing-aqua-touch-polish.mjs', 'v2057 validate hook');

for (const token of [
  "dataset.v2057FishingAquaTouch = 'v2057-fishing-aqua-touch'",
  'v2057-fishing-aqua-touch-screen',
  'v2057-reel-panel',
  'v2057-reel-console',
  'v2057-tension-track',
  'data-v2057-safe-window',
  "private reelMode: 'neutral' | 'wind' | 'release' = 'neutral'",
  'const setReelRelease = (active: boolean',
  "this.reelMode === 'release'",
  'v2057-result-card',
  'v2057-result-ribbon',
]) has(main, token, `main token ${token}`);

for (const token of [
  'v2.0.57 fishing gauge/control separation',
  '.v2057-reel-panel',
  '.v2057-reel-console',
  '.v2057-tension-track',
  '.v2057-result-card',
  '.v2057-result-actions',
  'background-image: none !important',
  '.v203-interior-panel.open .v203-interior-card',
  '@keyframes v2057ReelDanger',
]) has(css, token, `css token ${token}`);

for (const token of [
  'function footprintBaseLeftTile',
  'v2.0.57: interaction favors the visible lower-left edge',
  'v2.0.57: users place large slanted assets by their lower-left foot tile',
  'lowerLeftTouch',
  'atFrontDoor',
]) has(world, token, `world token ${token}`);

must(!/v2021-result-modal-frame" src/.test(main), 'result card must not reinsert old modal frame image');
must(!/dock-row-top|dock-row-bottom/.test(main), 'main must not render old two-row dock rows');
for (const token of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  must(!lock.includes(token), `package-lock contains forbidden registry token ${token}`);
}
const rootMarkdown = fs.readdirSync('.').filter((name) => name.toLowerCase().endsWith('.md'));
must(rootMarkdown.length === 1 && rootMarkdown[0] === 'README.md', 'root must contain README.md only');
const forbiddenNotes = fs.readdirSync('.', { recursive: true }).filter((name) => /_NOTES\.md$/i.test(String(name)));
must(forbiddenNotes.length === 0, 'must not create *_NOTES.md files');
console.log('[AquaFantasia] v2.0.57 fishing/aqua touch polish validation passed.');
