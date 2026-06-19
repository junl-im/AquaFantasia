import fs from 'node:fs';
import path from 'node:path';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => { console.error(`[v2045-direction-asset-engine-audit] ${message}`); process.exit(1); };
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
must(version === '2.0.45', 'package.json version must be 2.0.45');
has(data, "APP_VERSION = '2.0.45'", 'APP_VERSION 2.0.45');
has(data, 'aqua-fantasia-v2.0.45-direction-asset-engine-audit', 'data cache v2.0.45');
has(sw, 'aqua-fantasia-v2.0.45-direction-asset-engine-audit', 'sw cache v2.0.45');
has(offline, 'v2.0.45', 'offline badge v2.0.45');
has(readme, '# AquaFantasia v2.0.45', 'README title v2.0.45');
has(readme, '## v2.0.45', 'README v2.0.45 changelog');

for (const token of [
  "dataset.v2045DirectionAssetEngineAudit = 'v2045-direction-asset-engine-audit'",
  'v2045-fishing-playable-screen',
  'v2045-reel-panel',
  'v2045-result-card',
  'v2045-identical-dock-nav',
  "nav.dataset.v2045DockGuard = 'v2045-fishing-safe-area-dock-final'",
  'v2045-menu-aqua-center-screen',
  "root.dataset.v2045MenuAudit = 'direction-asset-engine-audit'",
]) has(main, token, `main token ${token}`);

for (const token of [
  'V2045_HIDDEN_DECORATION_KEYS',
  'resolveVillageDprCap',
  "app.ticker.maxFPS = 60",
  "item.eventMode = 'none'",
  'safeIntegerTile',
  "this.root.dataset.v2045VillageAudit = 'direction-asset-performance-trim'",
  "northeast: 'northwest'",
  "southeast: 'southeast'",
  "northwest: 'northeast'",
  "southwest: 'southwest'",
]) has(world, token, `world token ${token}`);

for (const token of [
  'v2.0.45 Direction/asset/performance audit',
  '--v2045-dock-bottom',
  '.bottom-nav.v2045-identical-dock-nav',
  'body[data-screen="fishing"] .fishing-screen.v2045-fishing-playable-screen .v2045-reel-panel',
  '.runtime-quality-lite',
  '.v2045-menu-aqua-center-screen',
]) has(css, token, `css token ${token}`);

const directions = ['south', 'southeast', 'east', 'northeast', 'north', 'northwest', 'west', 'southwest'];
const roles = ['player', 'chief', 'merchant', 'guild', 'captain', 'tourist', 'vip'];
for (const role of roles) {
  for (const direction of directions) {
    const file = path.join('public/assets/v2023/characters', `${role}_${direction}.png`);
    must(fs.existsSync(file), `missing 8-way character asset ${file}`);
    const stat = fs.statSync(file);
    must(stat.size > 1024, `8-way character asset looks empty ${file}`);
  }
}

for (const forbidden of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  must(!lock.includes(forbidden), `package-lock contains forbidden registry token ${forbidden}`);
}
const rootMarkdown = fs.readdirSync('.').filter((name) => name.toLowerCase().endsWith('.md'));
must(rootMarkdown.length === 1 && rootMarkdown[0] === 'README.md', 'root must contain README.md only');
const forbiddenNotes = fs.readdirSync('.', { recursive: true }).filter((name) => /_NOTES\.md$/i.test(String(name)));
must(forbiddenNotes.length === 0, 'must not create *_NOTES.md files');
console.log('[AquaFantasia] v2.0.45 direction/asset/engine audit validation passed.');
