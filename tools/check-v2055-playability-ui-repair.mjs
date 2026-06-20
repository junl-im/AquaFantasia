import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => { console.error(`[v2055-playability-ui-repair] ${message}`); process.exit(1); };
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

must(/^2\.0\.(5[5-9]|[6-9][0-9])$/.test(pkg.version), 'package.json version must preserve v2.0.55+ lineage');
must(/APP_VERSION = '2\.0\.(5[5-9]|[6-9][0-9])'/.test(data), 'APP_VERSION must preserve v2.0.55+ lineage');
must(/aqua-fantasia-v2\.0\.(5[5-9]|[6-9][0-9])/.test(data), 'data cache must preserve v2.0.55+ lineage');
must(/aqua-fantasia-v2\.0\.(5[5-9]|[6-9][0-9])/.test(sw), 'sw cache must preserve v2.0.55+ lineage');
must(/v2\.0\.(5[5-9]|[6-9][0-9])/.test(offline), 'offline badge must preserve v2.0.55+ lineage');
has(readme, `# AquaFantasia v${pkg.version}`, 'README title current version');
has(readme, `## v${pkg.version}`, 'README changelog current version');
has(pkg.scripts.validate, 'check-v2055-playability-ui-repair.mjs', 'v2055 validate hook');

for (const token of [
  "dataset.v2055PlayabilityUiRepair = 'v2055-playability-ui-repair'",
  'v2055-playability-village-screen',
  'v2055-fishing-reel-rebuild-screen',
  'v2055-reel-panel',
  'v2055-reel-console',
  'data-v2055-reel-wind',
  'data-v2055-reel-release',
  'data-v2055-tension-value',
  'data-v2055-tension-bar',
  'v2055-loop-close',
  'data-v2055-loop-close',
  "root.classList.add('v2055-map-aqua-screen')",
  'v2055-result-card',
]) has(main, token, `main token ${token}`);

for (const token of [
  'v2.0.55 playability and UI repair',
  ':not(.v2027-village-ready) :is(.v2-joystick',
  '.v2055-loop-close',
  '.runtime-menu-screen.v2055-map-aqua-screen',
  '.v2055-reel-console',
  '.v2055-reel-actions',
  '.v2055-reel-wind',
  '.v2055-reel-release',
  '.v2055-result-card',
]) has(css, token, `css token ${token}`);

must(!/dock-row-top|dock-row-bottom/.test(main), 'main must not render old two-row dock rows');
for (const token of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  must(!lock.includes(token), `package-lock contains forbidden registry token ${token}`);
}
const rootMarkdown = fs.readdirSync('.').filter((name) => name.toLowerCase().endsWith('.md'));
must(rootMarkdown.length === 1 && rootMarkdown[0] === 'README.md', 'root must contain README.md only');
const forbiddenNotes = fs.readdirSync('.', { recursive: true }).filter((name) => /_NOTES\.md$/i.test(String(name)));
must(forbiddenNotes.length === 0, 'must not create *_NOTES.md files');
console.log('[AquaFantasia] v2.0.55+ playability/UI repair validation passed.');
