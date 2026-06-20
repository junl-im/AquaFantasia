import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => { console.error(`[v2051-hud-dock-fishing-motion-polish] ${message}`); process.exit(1); };
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

must(/^2\.0\.(5[1-9]|[6-9][0-9])$/.test(pkg.version), 'package.json version must be v2.0.51 or later');
must(/APP_VERSION = '2\.0\.(5[1-9]|[6-9][0-9])'/.test(data), 'APP_VERSION must be v2.0.51 or later');
must(/aqua-fantasia-v2\.0\.(5[1-9]|[6-9][0-9])-/.test(data), 'data cache must be v2.0.51 or later');
must(/aqua-fantasia-v2\.0\.(5[1-9]|[6-9][0-9])-/.test(sw), 'sw cache must be v2.0.51 or later');
must(/v2\.0\.(5[1-9]|[6-9][0-9])/.test(offline), 'offline badge must be v2.0.51 or later');
must(/# AquaFantasia v2\.0\.(5[1-9]|[6-9][0-9])/.test(readme), 'README title must be v2.0.51 or later');
has(readme, '## v2.0.51', 'README v2.0.51 changelog');
has(pkg.scripts.validate, 'check-v2051-hud-dock-fishing-motion-polish.mjs', 'v2051 validate hook');

for (const token of [
  "dataset.v2051HudDockFishingMotionPolish = 'v2051-hud-dock-fishing-motion-polish'",
  'v2051-hud-loop-village-screen',
  'v2051-loop-mini',
  'v2051-expedition-mini',
  'v2051-loop-toggle',
  'v2051-identical-dock-nav',
  "v2051DockGuard = 'v2051-four-button-two-row-dock-no-empty-slot'",
  'v2051-fishing-feedback-screen',
  'v2051-tension-readout',
  'v2051-hold-pad',
  'v2051-result-card',
]) has(main, token, `main token ${token}`);

for (const token of [
  'v2.0.51 HUD/dock/fishing/motion polish',
  '--v2051-dock-btn',
  '.v2049-growth-board.v2051-loop-mini',
  '.v2050-expedition-board.v2051-expedition-mini',
  '.bottom-nav.v2051-identical-dock-nav',
  '.v2051-reel-panel',
  '.v2051-tension-readout',
  '.v2051-hold-pad',
  '.v2051-result-card',
]) has(css, token, `css token ${token}`);

for (const token of [
  "dataset.v2051MotionPolish = 'actor-footstep-object-motion'",
  'private motionClock = 0',
  'animateDecorationLayer',
  'item.name = `deco-${deco.kind}`',
]) has(world, token, `world token ${token}`);

for (const forbidden of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  must(!lock.includes(forbidden), `package-lock contains forbidden registry token ${forbidden}`);
}
const rootMarkdown = fs.readdirSync('.').filter((name) => name.toLowerCase().endsWith('.md'));
must(rootMarkdown.length === 1 && rootMarkdown[0] === 'README.md', 'root must contain README.md only');
const forbiddenNotes = fs.readdirSync('.', { recursive: true }).filter((name) => /_NOTES\.md$/i.test(String(name)));
must(forbiddenNotes.length === 0, 'must not create *_NOTES.md files');
console.log('[AquaFantasia] v2.0.51 HUD/dock/fishing/motion polish validation passed.');
