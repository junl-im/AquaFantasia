import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => { console.error(`[v2053-hud-dock-fishing-system] ${message}`); process.exit(1); };
const must = (condition, message) => { if (!condition) fail(message); };
const has = (source, token, label = token) => must(source.includes(token), `missing ${label}`);

const pkg = JSON.parse(read('package.json'));
const data = read('src/data.ts');
const main = read('src/main.ts');
const css = read('src/styles.css');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const readme = read('README.md');
const lock = read('package-lock.json');

must(pkg.version === '2.0.53', 'package.json version must be 2.0.53');
has(data, "APP_VERSION = '2.0.53'", 'APP_VERSION 2.0.53');
has(data, 'aqua-fantasia-v2.0.53-hud-dock-fishing-system', 'data cache v2.0.53');
has(sw, 'aqua-fantasia-v2.0.53-hud-dock-fishing-system', 'sw cache v2.0.53');
has(offline, 'v2.0.53', 'offline badge v2.0.53');
has(readme, '# AquaFantasia v2.0.53', 'README title v2.0.53');
has(readme, '## v2.0.53', 'README v2.0.53 changelog');
has(pkg.scripts.validate, 'check-v2053-hud-dock-fishing-system.mjs', 'v2053 validate hook');

for (const token of [
  "dataset.v2053HudDockFishingSystem = 'v2053-hud-dock-fishing-system'",
  'v2053-hud-dock-village-screen',
  'v2053-fishing-system-screen',
  'v2053-single-row-dock-nav',
  "v2053DockGuard = 'v2053-single-row-village-inventory-mission-map'",
  "const dockOrder: Screen[] = ['village', 'inventory', 'mission', 'map']",
  'dock-row dock-row-main',
  'v2053-reel-touch-zone',
  'setReelInput',
  'data-v2053-input-state',
  'Lv.${this.playerLevel()}',
  'data-v2053-profile-open',
]) has(main, token, `main token ${token}`);

for (const token of [
  'v2.0.53 HUD/dock/fishing system repair',
  '--v2053-dock-btn',
  '.v2053-single-row-dock-nav',
  '.dock-row-main',
  '.v2053-reel-touch-zone',
  '.v2053-hold-pad',
  '.v2053-hud-dock-village-screen .v2-profile-chip [data-v2-level]',
]) has(css, token, `css token ${token}`);

const forbidden = ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai'];
for (const token of forbidden) must(!lock.includes(token), `package-lock contains forbidden registry token ${token}`);
const rootMarkdown = fs.readdirSync('.').filter((name) => name.toLowerCase().endsWith('.md'));
must(rootMarkdown.length === 1 && rootMarkdown[0] === 'README.md', 'root must contain README.md only');
const forbiddenNotes = fs.readdirSync('.', { recursive: true }).filter((name) => /_NOTES\.md$/i.test(String(name)));
must(forbiddenNotes.length === 0, 'must not create *_NOTES.md files');
console.log('[AquaFantasia] v2.0.53 HUD/dock/fishing system validation passed.');
