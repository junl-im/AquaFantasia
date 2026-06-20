import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => { console.error(`[v2054-layout-issue-sweep] ${message}`); process.exit(1); };
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

must(/^2\.0\.(5[4-9]|[6-9][0-9])$/.test(pkg.version), 'package.json version must be v2.0.54 or later');
must(/APP_VERSION = '2\.0\.(5[4-9]|[6-9][0-9])'/.test(data), 'APP_VERSION must be v2.0.54 or later');
must(/aqua-fantasia-v2\.0\.(5[4-9]|[6-9][0-9])/.test(data), 'data cache must be v2.0.54 or later');
must(/aqua-fantasia-v2\.0\.(5[4-9]|[6-9][0-9])/.test(sw), 'sw cache must be v2.0.54 or later');
must(/v2\.0\.(5[4-9]|[6-9][0-9])/.test(offline), 'offline badge must be v2.0.54 or later');
must(/# AquaFantasia v2\.0\.(5[4-9]|[6-9][0-9])/.test(readme), 'README title must be v2.0.54 or later');
has(readme, '## v2.0.54', 'README v2.0.54 changelog');
has(pkg.scripts.validate, 'check-v2054-layout-issue-sweep.mjs', 'v2054 validate hook');

for (const token of [
  "dataset.v2054LayoutIssueSweep = 'v2054-layout-issue-sweep'",
  'v2054-layout-issue-village-screen',
  'v2054-fishing-issue-sweep-screen',
  'v2054-single-row-dock-nav',
  "v2054DockGuard = 'v2054-single-row-four-button-no-wrap'",
  "const dockOrder: Screen[] = ['village', 'inventory', 'mission', 'map']",
  'v2054-dock-row-main',
  'data-v2054-button-count',
  'v2054-reel-touch-zone',
  'v2054-reel-debug',
  'data-v2054-hold-state',
  'data-v2054-tension-delta',
  "this.reelTouchZone.addEventListener('touchstart', startTouchHold, { passive: false })",
  'v2054-result-card',
]) has(main, token, `main token ${token}`);

for (const token of [
  'v2.0.54 layout issue sweep',
  '--v2054-dock-btn',
  '.v2054-single-row-dock-nav',
  '.v2054-dock-row-main',
  '.dock-row:empty',
  '.v2054-reel-touch-zone.is-holding::after',
  '.v2054-reel-panel .v2054-reel-debug',
  '.v2054-result-card',
]) has(css, token, `css token ${token}`);

must(!/dock-row-top|dock-row-bottom/.test(main), 'main should not render old two-row dock rows');
must((main.match(/data-screen=\"\$\{screen\}\"/g) ?? []).length >= 1, 'dock buttons must be real screen buttons');
for (const token of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  must(!lock.includes(token), `package-lock contains forbidden registry token ${token}`);
}
const rootMarkdown = fs.readdirSync('.').filter((name) => name.toLowerCase().endsWith('.md'));
must(rootMarkdown.length === 1 && rootMarkdown[0] === 'README.md', 'root must contain README.md only');
const forbiddenNotes = fs.readdirSync('.', { recursive: true }).filter((name) => /_NOTES\.md$/i.test(String(name)));
must(forbiddenNotes.length === 0, 'must not create *_NOTES.md files');
console.log('[AquaFantasia] v2.0.54 layout/issue sweep validation passed.');
