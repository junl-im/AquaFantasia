import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => { console.error(`[v2085] ${message}`); process.exit(1); };

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const data = read('src/data.ts');
const main = read('src/main.ts');
const css = read('src/styles.css');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const readme = read('README.md');
const validateScript = pkg.scripts?.validate ?? '';

if (pkg.version !== '2.0.85') fail('package.json version must be 2.0.85');
if (lock.version !== pkg.version || lock.packages?.['']?.version !== pkg.version) fail('package-lock version must match package.json');
if (!data.includes("APP_VERSION = '2.0.85'")) fail('APP_VERSION must be 2.0.85');
if (!data.includes('aqua-fantasia-v2.0.85-ui-emergency-hud-menu-reset')) fail('data cache name must be v2.0.85 emergency reset');
if (!sw.includes('aqua-fantasia-v2.0.85-ui-emergency-hud-menu-reset')) fail('service worker cache must be v2.0.85 emergency reset');
if (!offline.includes('v2.0.85')) fail('offline badge must mention v2.0.85');
if (!readme.startsWith('# AquaFantasia v2.0.85')) fail('README top version must be v2.0.85');
if (!validateScript.includes('check-v2085-ui-emergency-hud-menu-reset.mjs')) fail('validate must run v2085 check');

for (const token of [
  "dataset.v2085UiEmergencyReset = 'v2085-ui-emergency-hud-menu-reset'",
  'v2085-emergency-village-screen',
  'v2085-slim-village-hud',
  'v2085-emergency-menu-screen',
  'v2085-slim-runtime-hud',
  'v2085-menu-content',
  'data-v2085-scroll-root="true"',
  'v2085-modal-open',
]) {
  if (!main.includes(token)) fail(`missing main.ts token: ${token}`);
}

for (const token of [
  'v2.0.85 UI Emergency Reset',
  '--v2085-menu-width',
  '.runtime-menu-screen.v2085-emergency-menu-screen',
  '.v2085-slim-runtime-hud',
  '.v2085-menu-content',
  '.v2085-slim-village-hud',
  'body.v2085-modal-open .v2050-expedition-board.v2075-expedition-dock',
  'grid-template-rows: auto minmax(0, 1fr)',
  'height: 58px !important',
  'height: 56px !important',
]) {
  if (!css.includes(token)) fail(`missing CSS token: ${token}`);
}

for (const phrase of [
  'UI 응급 복구',
  '누적 CSS 오버라이드',
  'HUD를 얇게',
  '메뉴 셸',
]) {
  if (!readme.includes(phrase)) fail(`README must document: ${phrase}`);
}

const banned = ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai'];
const lockText = read('package-lock.json');
const polluted = banned.filter((needle) => lockText.includes(needle));
if (polluted.length) fail(`forbidden registry strings in package-lock: ${polluted.join(', ')}`);

const rootMarkdown = fs.readdirSync('.').filter((name) => name.endsWith('.md'));
if (rootMarkdown.length !== 1 || rootMarkdown[0] !== 'README.md') fail(`root markdown must be README.md only: ${rootMarkdown.join(', ')}`);

console.log('[v2085] UI emergency HUD/menu reset checks passed.');
