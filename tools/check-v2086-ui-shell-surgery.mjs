import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => { console.error(`[v2086] ${message}`); process.exit(1); };

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const data = read('src/data.ts');
const main = read('src/main.ts');
const css = read('src/styles.css');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const readme = read('README.md');
const validateScript = pkg.scripts?.validate ?? '';

if (!/^2\.0\.(8[6-9]|9[0-9]|[1-9][0-9]{2,})$/.test(pkg.version)) fail('package.json version must be v2.0.86 or newer');
if (lock.version !== pkg.version || lock.packages?.['']?.version !== pkg.version) fail('package-lock version must match package.json');
if (!data.includes(`APP_VERSION = '${pkg.version}'`)) fail('APP_VERSION must match package version');
if (!data.includes(`aqua-fantasia-v${pkg.version}`)) fail('data cache name must include current version');
if (!sw.includes(`aqua-fantasia-v${pkg.version}`)) fail('service worker cache must include current version');
if (!offline.includes(`v${pkg.version}`)) fail('offline badge must mention current version');
if (!readme.startsWith(`# AquaFantasia v${pkg.version}`)) fail('README top version must match current version');
if (!validateScript.includes('check-v2086-ui-shell-surgery.mjs')) fail('validate must run v2086 check');

for (const token of [
  "dataset.v2086UiShellSurgery = 'v2086-ui-shell-surgery'",
  'v2086-surgical-menu-screen',
  'v2086-slim-runtime-hud',
  'v2086-menu-content',
  'data-v2086-scroll-root="true"',
  'v2086-surgical-village-screen',
  'v2086-slim-village-hud',
  'v2086-modal-open',
]) {
  if (!main.includes(token)) fail(`missing main.ts token: ${token}`);
}

for (const token of [
  'v2.0.86 UI Shell Surgery',
  '--v2086-width',
  '.runtime-menu-screen.v2086-surgical-menu-screen',
  '.v2086-slim-runtime-hud',
  '.v2086-menu-content',
  '.v2086-slim-village-hud',
  'body:is(.v2086-modal-open',
  'grid-template-rows: 48px minmax(0, 1fr)',
  'height: 48px !important',
  'minmax(min(100%, 230px), 1fr)',
]) {
  if (!css.includes(token)) fail(`missing CSS token: ${token}`);
}

for (const phrase of [
  'UI 응급 복구 2차',
  'v2086-ui-shell-surgery',
  '48px HUD',
  '단일 우선 스크롤 루트',
  '버튼 상단 푸른 줄',
]) {
  if (!readme.includes(phrase)) fail(`README must document: ${phrase}`);
}

const banned = ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai'];
const lockText = read('package-lock.json');
const polluted = banned.filter((needle) => lockText.includes(needle));
if (polluted.length) fail(`forbidden registry strings in package-lock: ${polluted.join(', ')}`);

const rootMarkdown = fs.readdirSync('.').filter((name) => name.endsWith('.md'));
if (rootMarkdown.length !== 1 || rootMarkdown[0] !== 'README.md') fail(`root markdown must be README.md only: ${rootMarkdown.join(', ')}`);

console.log('[v2086] UI shell surgery checks passed.');
