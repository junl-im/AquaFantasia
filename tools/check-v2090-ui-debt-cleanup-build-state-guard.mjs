import fs from 'node:fs';
const read = (f) => fs.readFileSync(f, 'utf8');
const fail = (msg) => { console.error(`[v2090] ${msg}`); process.exit(1); };
const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const data = read('src/data.ts');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const readme = read('README.md');
const main = read('src/main.ts');
const world = read('src/villageWorld.ts');
const css = read('src/styles.css');
const validate = pkg.scripts?.validate ?? '';
if (!pkg.version.startsWith('2.0.') || Number(pkg.version.split('.').at(-1)) < 90) fail('package.json version must be 2.0.90 or later');
if (lock.version !== pkg.version || lock.packages?.['']?.version !== pkg.version) fail('package-lock version mismatch');
if (!data.includes(`APP_VERSION = '${pkg.version}'`)) fail('APP_VERSION mismatch');
if (!data.includes(`aqua-fantasia-v${pkg.version}`)) fail('cache name mismatch');
if (!sw.includes(`aqua-fantasia-v${pkg.version}`)) fail('service worker cache mismatch');
if (!offline.includes(`v${pkg.version}`)) fail('offline version mismatch');
if (!readme.startsWith(`# AquaFantasia v${pkg.version}`)) fail('README top version mismatch');
if (!validate.includes('check-v2090-ui-debt-cleanup-build-state-guard.mjs')) fail('validate must include v2090 check');
for (const token of [
  "dataset.v2090UiDebtCleanup = 'v2090-ui-debt-cleanup-build-state-guard'",
  'V2090_LEGACY_UI_CLASS_LINEAGE',
  'v2090-ui-debt-clean-village-screen',
  'v2090-village-hud',
  'v2090-profile-chip',
  'v2090-expedition-board',
  'v2090-expedition-toggle',
  'v2090-expedition-body',
  'data-v2090-expedition-toggle',
  'data-v2090-expedition-body',
  'v2090-ui-debt-clean-menu-screen',
  'v2090-runtime-hud',
  'v2090-menu-content',
  'data-v2090-scroll-root="true"',
  'v2090-ui-close',
]) if (!main.includes(token)) fail(`missing main token: ${token}`);
for (const token of [
  "dataset.v2090BuildStateGuard = 'explicit-build-button-only'",
  "addEventListener('click', (ev) => {",
  "[data-village-build-open], [data-village-build-close]",
  'ev.stopPropagation();',
]) if (!world.includes(token)) fail(`missing villageWorld token: ${token}`);
for (const token of [
  'v2.0.90 UI debt cleanup / build-state guard',
  '--v2090-village-hud-w',
  'grid-template-columns: minmax(76px, auto)',
  '--v2090-expedition-gap: 4px',
  '.v2090-expedition-body.v2090-expedition-body-open',
  '.v2-build-tray-open .v2-build-tray',
  '.v2090-menu-close',
  'content: none !important',
]) if (!css.includes(token)) fail(`missing CSS token: ${token}`);
for (const phrase of ['UI debt cleanup', '마을 타일 클릭', '건설모드', '개척바', '레벨 표기 칸']) if (!readme.includes(phrase)) fail(`README missing: ${phrase}`);
const banned = ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai'];
const lockText = read('package-lock.json');
const polluted = banned.filter((x) => lockText.includes(x));
if (polluted.length) fail(`forbidden registry strings: ${polluted.join(', ')}`);
const rootMarkdown = fs.readdirSync('.').filter((name) => name.endsWith('.md'));
if (rootMarkdown.length !== 1 || rootMarkdown[0] !== 'README.md') fail(`root markdown must be README.md only: ${rootMarkdown.join(', ')}`);
console.log('[v2090] UI debt cleanup and build-state guard checks passed.');
