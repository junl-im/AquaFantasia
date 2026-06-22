import fs from 'node:fs';
const read = (f) => fs.readFileSync(f, 'utf8');
const fail = (msg) => { console.error(`[v2093] ${msg}`); process.exit(1); };
const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const data = read('src/data.ts');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const main = read('src/main.ts');
const css = read('src/styles.css');
const readme = read('README.md');
if (pkg.version !== '2.0.93') fail('package.json version must be 2.0.93');
if (lock.version !== pkg.version || lock.packages?.['']?.version !== pkg.version) fail('package-lock version mismatch');
if (!data.includes(`APP_VERSION = '${pkg.version}'`)) fail('APP_VERSION mismatch');
if (!data.includes(`aqua-fantasia-v${pkg.version}-ui-legacy-hard-prune-stable-shell`)) fail('cache name mismatch');
if (!sw.includes(`aqua-fantasia-v${pkg.version}-ui-legacy-hard-prune-stable-shell`)) fail('service worker cache mismatch');
if (!offline.includes(`v${pkg.version}`)) fail('offline version mismatch');
if (!readme.startsWith(`# AquaFantasia v${pkg.version}`)) fail('README top version mismatch');
for (const token of [
  "dataset.v2093UiStable = 'v2093-live-ui-canonical'",
  'activateV2093UiStableShell',
  "html.classList.add('v2093-ui-canonical-root')",
  'v2093-ui-stable-village-screen',
  'v2093-village-hud',
  'v2093-profile-chip',
  'v2093-expedition-board',
  'v2093-expedition-toggle',
  'data-v2093-expedition-toggle',
  'v2093-expedition-body',
  'data-v2093-expedition-body',
  'v2093-expedition-body-open',
  'v2093-ui-close',
  'v2093-ui-stable-menu-screen',
  'v2093-runtime-hud',
  'v2093-menu-content',
  'data-v2093-scroll-root="true"',
  'v2093-menu-close',
]) if (!main.includes(token)) fail(`missing main token: ${token}`);
for (const liveBad of [
  'private v2091ValidationLineageOnly',
]) if (main.includes(liveBad)) fail(`live legacy UI function still present: ${liveBad}`);

for (const token of [
  'v2.0.93 UI canonical hardening pass',
  'html[data-v2093-ui-stable="v2093-live-ui-canonical"]',
  '--v2093-hud-h: 44px',
  'grid-template-columns: minmax(74px, max-content)',
  '.v2093-expedition-body.v2093-expedition-body-open',
  '.v2093-menu-close',
  '.v2093-ui-close',
  'content: none !important',
]) if (!css.includes(token)) fail(`missing CSS token: ${token}`);
for (const phrase of ['v2093', '단일 셸', '과거 UI 마커', '닫기 `X`', '개척바']) if (!readme.includes(phrase)) fail(`README missing: ${phrase}`);
const banned = ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai'];
const lockText = read('package-lock.json');
const polluted = banned.filter((x) => lockText.includes(x));
if (polluted.length) fail(`forbidden registry strings: ${polluted.join(', ')}`);
const rootMarkdown = fs.readdirSync('.').filter((name) => name.endsWith('.md'));
if (rootMarkdown.length !== 1 || rootMarkdown[0] !== 'README.md') fail(`root markdown must be README.md only: ${rootMarkdown.join(', ')}`);
console.log('[v2093] UI legacy hard prune stable shell checks passed.');
