import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => { console.error(`[v2087] ${message}`); process.exit(1); };

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const data = read('src/data.ts');
const main = read('src/main.ts');
const css = read('src/styles.css');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const readme = read('README.md');
const validateScript = pkg.scripts?.validate ?? '';

const patch = Number(pkg.version.split('.')[2] ?? 0);
if (!/^2\.0\.\d+$/.test(pkg.version) || patch < 87) fail('package.json version must be v2.0.87 or newer');
if (lock.version !== pkg.version || lock.packages?.['']?.version !== pkg.version) fail('package-lock version must match package.json');
if (!data.includes(`APP_VERSION = '${pkg.version}'`)) fail('APP_VERSION must match package.json');
if (!data.includes(`aqua-fantasia-v${pkg.version}`)) fail('data cache name must match current version');
if (!sw.includes(`aqua-fantasia-v${pkg.version}`)) fail('service worker cache must match current version');
if (!offline.includes(`v${pkg.version}`)) fail('offline badge must mention current version');
if (!readme.startsWith(`# AquaFantasia v${pkg.version}`)) fail('README top version must match current version');
if (!validateScript.includes('check-v2087-ui-stabilizer-sweep.mjs')) fail('validate must run v2087 check');

for (const token of [
  "dataset.v2087UiStabilizerSweep = 'v2087-ui-stabilizer-sweep'",
  'v2087-stabilized-menu-screen',
  'v2087-slim-runtime-hud',
  'v2087-menu-content',
  'data-v2087-scroll-root="true"',
  'v2087-close-button',
  'v2087-stabilized-village-screen',
  'v2087-slim-village-hud',
  'v2087-modal-open',
]) {
  if (!main.includes(token)) fail(`missing main.ts token: ${token}`);
}

for (const token of [
  'v2.0.87 UI Stabilizer Sweep',
  '--v2087-page-width',
  '.runtime-menu-screen.v2087-stabilized-menu-screen',
  'grid-template-rows: var(--v2087-hud-height) minmax(0, 1fr)',
  '.v2087-slim-runtime-hud',
  '.v2087-menu-content',
  '.v2087-close-button',
  '.v2087-slim-village-hud',
  'body:is(.v2087-modal-open',
  'repeat(auto-fit, minmax(min(100%, 208px), 1fr))',
  'content: none !important',
]) {
  if (!css.includes(token)) fail(`missing CSS token: ${token}`);
}

for (const phrase of [
  'UI 안정화 스윕',
  '누적 CSS 오버라이드',
  '단일 스크롤 본문',
  '버튼 위쪽 푸른 줄',
  '개척바가 뒤에 따라 보이지',
]) {
  if (!readme.includes(phrase)) fail(`README must document: ${phrase}`);
}

const banned = ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai'];
const lockText = read('package-lock.json');
const polluted = banned.filter((needle) => lockText.includes(needle));
if (polluted.length) fail(`forbidden registry strings in package-lock: ${polluted.join(', ')}`);

const rootMarkdown = fs.readdirSync('.').filter((name) => name.endsWith('.md'));
if (rootMarkdown.length !== 1 || rootMarkdown[0] !== 'README.md') fail(`root markdown must be README.md only: ${rootMarkdown.join(', ')}`);

console.log('[v2087] UI stabilizer sweep checks passed.');
