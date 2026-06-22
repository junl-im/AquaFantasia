import fs from 'node:fs';
const read = (f) => fs.readFileSync(f, 'utf8');
const fail = (msg) => { console.error(`[v2091] ${msg}`); process.exit(1); };
const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const data = read('src/data.ts');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const main = read('src/main.ts');
const world = read('src/villageWorld.ts');
const css = read('src/styles.css');
const readme = read('README.md');
if (!pkg.version.startsWith('2.0.') || Number(pkg.version.split('.').at(-1)) < 91) fail('package.json version must be 2.0.91 or later');
if (lock.version !== pkg.version || lock.packages?.['']?.version !== pkg.version) fail('package-lock version mismatch');
if (!data.includes(`APP_VERSION = '${pkg.version}'`)) fail('APP_VERSION mismatch');
if (!data.includes(`aqua-fantasia-v${pkg.version}`)) fail('cache name mismatch');
if (!sw.includes(`aqua-fantasia-v${pkg.version}`)) fail('service worker cache mismatch');
if (!offline.includes(`v${pkg.version}`)) fail('offline version mismatch');
if (!readme.startsWith(`# AquaFantasia v${pkg.version}`)) fail('README top version mismatch');
for (const token of [
  "dataset.v2091UiCleanup = 'v2091-live-ui-pruned'",
  'activateV2091UiCleanup',
  'delete html.dataset[key]',
  'v2091-ui-clean-village-screen',
  'v2091-village-hud',
  'v2091-profile-chip',
  'v2091-expedition-board',
  'v2091-expedition-toggle',
  'v2091-expedition-body',
  'data-v2091-expedition-toggle',
  'data-v2091-expedition-body',
  'v2091-ui-clean-menu-screen',
  'v2091-runtime-hud',
  'v2091-menu-content',
  'data-v2091-scroll-root="true"',
  'v2091-ui-close',
  'v2091-menu-close',
]) if (!main.includes(token)) fail(`missing main token: ${token}`);
for (const token of [
  "dataset.v2091UiCleanup = 'legacy-interior-events-pruned'",
  "this.root.classList.add('v2091-interior-open')",
  "document.body.classList.add('v2091-modal-open')",
]) if (!world.includes(token)) fail(`missing villageWorld token: ${token}`);
for (const token of [
  'v2.0.91 UI legacy prune shell',
  '--v2091-hud-w',
  'minmax(82px, auto)',
  '.v2091-expedition-body.v2091-expedition-body-open',
  '.v2091-menu-close',
  '.v2091-ui-close',
  'body.v2091-modal-open .v2091-expedition-board:not(.open)',
  'content: none !important',
]) if (!css.includes(token)) fail(`missing CSS token: ${token}`);
if (/className = [`'\"][^`'\"]*v208[1-9][^`'\"]*menu/.test(main)) fail('live menu root should not attach v208x menu classes');
for (const phrase of ['과거 UI 마커', '런타임에서 제거', '캐릭터 정보창', '닫기 X', '개척']) if (!readme.includes(phrase)) fail(`README missing: ${phrase}`);
const banned = ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai'];
const lockText = read('package-lock.json');
const polluted = banned.filter((x) => lockText.includes(x));
if (polluted.length) fail(`forbidden registry strings: ${polluted.join(', ')}`);
const rootMarkdown = fs.readdirSync('.').filter((name) => name.endsWith('.md'));
if (rootMarkdown.length !== 1 || rootMarkdown[0] !== 'README.md') fail(`root markdown must be README.md only: ${rootMarkdown.join(', ')}`);
console.log('[v2091] UI legacy prune shell checks passed.');
