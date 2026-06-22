import fs from 'node:fs';
const read = (f) => fs.readFileSync(f, 'utf8');
const fail = (msg) => { console.error(`[v2092] ${msg}`); process.exit(1); };
const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const data = read('src/data.ts');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const readme = read('README.md');
const main = read('src/main.ts');
const css = read('src/styles.css');
const validate = pkg.scripts?.validate ?? '';
if (!pkg.version.startsWith('2.0.') || Number(pkg.version.split('.').at(-1)) < 92) fail('package.json version must be 2.0.92 or later');
if (lock.version !== pkg.version || lock.packages?.['']?.version !== pkg.version) fail('package-lock version mismatch');
if (!data.includes(`APP_VERSION = '${pkg.version}'`)) fail('APP_VERSION mismatch');
if (!data.includes(`aqua-fantasia-v${pkg.version}`)) fail('cache name mismatch');
if (!sw.includes(`aqua-fantasia-v${pkg.version}`)) fail('service worker cache mismatch');
if (!offline.includes(`v${pkg.version}`)) fail('offline version mismatch');
if (!readme.startsWith(`# AquaFantasia v${pkg.version}`)) fail('README top version mismatch');
if (!validate.includes('check-v2092-ui-canonical-stable-shell.mjs')) fail('validate must include v2092 check');
for (const token of [
  "dataset.v2092UiStable = 'v2092-live-ui-canonical'",
  'activateV2092UiStableShell',
  "html.classList.add('v2092-ui-canonical-root')",
  'v2092-ui-stable-village-screen',
  'v2092-village-hud',
  'v2092-profile-chip',
  'v2092-expedition-board',
  'v2092-expedition-toggle',
  'data-v2092-expedition-toggle',
  'v2092-expedition-body',
  'data-v2092-expedition-body',
  'v2092-expedition-body-open',
  'v2092-ui-close',
  'v2092-ui-stable-menu-screen',
  'v2092-runtime-hud',
  'v2092-menu-content',
  'data-v2092-scroll-root="true"',
  'v2092-menu-close',
]) if (!main.includes(token)) fail(`missing main token: ${token}`);
for (const bad of [
  'root.dataset.v2090LegacyUiClassLineage = V2090_LEGACY_UI_CLASS_LINEAGE;',
  'root.dataset.v2091UiCleanup = `stable-clean-${active}`;',
  'root.dataset.v2091UiCleanup = \'live-dom-pruned\';',
]) if (main.includes(bad)) fail(`live legacy marker still attached: ${bad}`);
for (const token of [
  'v2.0.92 canonical UI shell hard stabilization',
  'html[data-v2092-ui-stable="v2092-live-ui-canonical"]',
  '--v2092-hud-w',
  'minmax(92px, max-content)',
  '.v2092-expedition-body.v2092-expedition-body-open',
  '.v2092-menu-close',
  '.v2092-ui-close',
  'content: none !important',
]) if (!css.includes(token)) fail(`missing CSS token: ${token}`);
for (const phrase of ['v20xx UI 복구 레이어', 'v2092', '캐릭터 정보창', '개척바', '닫기 `X`']) if (!readme.includes(phrase)) fail(`README missing: ${phrase}`);
const banned = ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai'];
const lockText = read('package-lock.json');
const polluted = banned.filter((x) => lockText.includes(x));
if (polluted.length) fail(`forbidden registry strings: ${polluted.join(', ')}`);
const rootMarkdown = fs.readdirSync('.').filter((name) => name.endsWith('.md'));
if (rootMarkdown.length !== 1 || rootMarkdown[0] !== 'README.md') fail(`root markdown must be README.md only: ${rootMarkdown.join(', ')}`);
console.log('[v2092] canonical stable UI shell checks passed.');
