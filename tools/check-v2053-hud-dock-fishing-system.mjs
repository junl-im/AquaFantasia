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

must(/^2\.0\.(5[3-9]|[6-9]\d|\d{3,})$/.test(pkg.version), 'package.json version must be v2.0.53 or later');
must(/APP_VERSION = '2\.0\.(5[3-9]|[6-9]\d|\d{3,})'/.test(data), 'APP_VERSION must be v2.0.53 or later');
has(data, `aqua-fantasia-v${pkg.version}`, 'data cache current version');
has(sw, `aqua-fantasia-v${pkg.version}`, 'sw cache current version');
has(offline, `v${pkg.version}`, 'offline badge current version');
has(readme, `# AquaFantasia v${pkg.version}`, 'README title current version');
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
