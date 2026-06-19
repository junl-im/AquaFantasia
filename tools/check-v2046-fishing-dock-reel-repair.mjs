import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => { console.error(`[v2046-fishing-dock-reel-repair] ${message}`); process.exit(1); };
const must = (condition, message) => { if (!condition) fail(message); };
const has = (source, token, label = token) => must(source.includes(token), `missing ${label}`);

const pkg = JSON.parse(read('package.json'));
const main = read('src/main.ts');
const css = read('src/styles.css');
const data = read('src/data.ts');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const readme = read('README.md');
const lock = read('package-lock.json');

const version = String(pkg.version);
const [major, minor, patch] = version.split('.').map(Number);
must(major === 2 && minor === 0 && patch >= 46, 'package.json version must be 2.0.46 or newer');
must(/APP_VERSION = '2\.0\.(4[6-9]|[5-9][0-9])'/.test(data), 'APP_VERSION must be 2.0.46 or newer');
must(/aqua-fantasia-v2\.0\.(4[6-9]|[5-9][0-9])-/.test(data), 'data cache must be v2.0.46 or newer');
must(/aqua-fantasia-v2\.0\.(4[6-9]|[5-9][0-9])-/.test(sw), 'sw cache must be v2.0.46 or newer');
must(/v2\.0\.(4[6-9]|[5-9][0-9])/.test(offline), 'offline badge must be v2.0.46 or newer');
must(/# AquaFantasia v2\.0\.(4[6-9]|[5-9][0-9])/.test(readme), 'README title must be v2.0.46 or newer');
has(readme, '## v2.0.46', 'README v2.0.46 changelog');

for (const token of [
  "dataset.v2046FishingDockReelRepair = 'v2046-fishing-dock-reel-repair'",
  'v2046-fishing-playable-screen',
  'v2046-fishing-stage',
  'v2046-reel-panel',
  'v2046-hold-pad',
  'v2046-identical-dock-nav',
  "nav.dataset.v2046DockGuard = 'v2046-body-portal-aqua-frame-dock'",
  'document.body.appendChild(nav)',
  "document.querySelectorAll('.bottom-nav.fixed-root-nav').forEach((node) => node.remove())",
  "this.startReeling();\n        this.holding = true",
  'v2046-bite-start',
]) has(main, token, `main token ${token}`);

for (const token of [
  'v2.0.46 Fishing dock/reel repair',
  '--v2046-dock-bottom',
  '--v2046-reel-safe-bottom',
  '.bottom-nav.v2046-identical-dock-nav',
  '.v2-world-controls',
  'body[data-screen="fishing"] .fishing-screen.v2046-fishing-playable-screen .v2046-reel-panel',
  '.v2046-hold-pad',
  '.v2046-bite-start',
]) has(css, token, `css token ${token}`);

for (const forbidden of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  must(!lock.includes(forbidden), `package-lock contains forbidden registry token ${forbidden}`);
}
const rootMarkdown = fs.readdirSync('.').filter((name) => name.toLowerCase().endsWith('.md'));
must(rootMarkdown.length === 1 && rootMarkdown[0] === 'README.md', 'root must contain README.md only');
const forbiddenNotes = fs.readdirSync('.', { recursive: true }).filter((name) => /_NOTES\.md$/i.test(String(name)));
must(forbiddenNotes.length === 0, 'must not create *_NOTES.md files');
console.log('[AquaFantasia] v2.0.46 fishing dock/reel repair validation passed.');
