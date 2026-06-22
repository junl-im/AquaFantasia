import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => { console.error(`[v2088] ${message}`); process.exit(1); };

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const data = read('src/data.ts');
const main = read('src/main.ts');
const css = read('src/styles.css');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const readme = read('README.md');
const validateScript = pkg.scripts?.validate ?? '';

const [major, minor, patch] = pkg.version.split('.').map(Number);
if (major !== 2 || minor !== 0 || patch < 88) fail('package.json version must be v2.0.88 or later');
if (lock.version !== pkg.version || lock.packages?.['']?.version !== pkg.version) fail('package-lock version must match package.json');
if (!data.includes(`APP_VERSION = '${pkg.version}'`)) fail('APP_VERSION must match package.json');
if (!data.includes(`aqua-fantasia-v${pkg.version}`)) fail('data cache name must include current package version');
if (!sw.includes(`aqua-fantasia-v${pkg.version}`)) fail('service worker cache must include current package version');
if (!offline.includes(`v${pkg.version}`)) fail('offline badge must mention current package version');
if (!readme.startsWith(`# AquaFantasia v${pkg.version}`)) fail('README top version must match package.json');
if (!validateScript.includes('check-v2088-character-shell-expedition-ui.mjs')) fail('validate must run v2088 check');

for (const token of [
  "dataset.v2088CharacterShellExpeditionUi = 'v2088-character-shell-expedition-ui'",
  'v2088-character-shell-village-screen',
  'v2088-character-hud',
  'v2088-profile-chip',
  'v2088-expedition-board',
  'v2088-expedition-toggle',
  'v2088-expedition-open',
  'v2088-character-shell-menu-screen',
  'v2088-runtime-hud',
  'v2088-menu-content',
  'data-v2088-scroll-root="true"',
  'v2088-fishing-bite-stable-screen',
  'bite-stable-flash',
]) {
  if (!main.includes(token)) fail(`missing main.ts token: ${token}`);
}

for (const token of [
  'v2.0.88 Character Shell / Expedition UI repair',
  '--v2088-shell',
  '.runtime-menu-screen.v2088-character-shell-menu-screen',
  '.v2088-runtime-hud',
  '.v2088-menu-content',
  '.v2088-expedition-board',
  '.v2088-expedition-toggle',
  '.v2088-expedition-open .v2051-loop-toggle',
  '.v2051-expedition-mini.open .v2088-expedition-body',
  ':is(.v2017-character-panel[aria-hidden="false"],.v203-interior-panel[aria-hidden="false"],.v203-interior-panel.open)',
  '.fishing-screen.v2088-fishing-bite-stable-screen .fishing-stage.camera-shake',
  'content: none !important',
]) {
  if (!css.includes(token)) fail(`missing CSS token: ${token}`);
}

for (const phrase of [
  '캐릭터 정보창 스타일',
  '개척 열림과 일반 모달 열림을 분리',
  'HUD와 개척바를 5px 간격',
  '레벨 표기 칸',
  '낚시 입질 흔들림',
]) {
  if (!readme.includes(phrase)) fail(`README must document: ${phrase}`);
}

const banned = ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai'];
const lockText = read('package-lock.json');
const polluted = banned.filter((needle) => lockText.includes(needle));
if (polluted.length) fail(`forbidden registry strings in package-lock: ${polluted.join(', ')}`);

const rootMarkdown = fs.readdirSync('.').filter((name) => name.endsWith('.md'));
if (rootMarkdown.length !== 1 || rootMarkdown[0] !== 'README.md') fail(`root markdown must be README.md only: ${rootMarkdown.join(', ')}`);

console.log('[v2088] character shell / expedition UI checks passed.');
