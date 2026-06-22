import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => { console.error(`[v2084] ${message}`); process.exit(1); };

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const data = read('src/data.ts');
const storage = read('src/storage.ts');
const main = read('src/main.ts');
const css = read('src/styles.css');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const readme = read('README.md');
const validateScript = pkg.scripts?.validate ?? '';

if (pkg.version !== '2.0.84') fail('package.json version must be 2.0.84');
if (lock.version !== pkg.version || lock.packages?.['']?.version !== pkg.version) fail('package-lock version must match package.json');
if (!data.includes("APP_VERSION = '2.0.84'")) fail('APP_VERSION must be 2.0.84');
if (!data.includes('aqua-fantasia-v2.0.84-ui-shell-random-name-repair')) fail('data cache name must be v2.0.84');
if (!sw.includes('aqua-fantasia-v2.0.84-ui-shell-random-name-repair')) fail('service worker cache must be v2.0.84');
if (!offline.includes('v2.0.84')) fail('offline badge must mention v2.0.84');
if (!readme.startsWith('# AquaFantasia v2.0.84')) fail('README top version must be v2.0.84');
if (!validateScript.includes('check-v2084-ui-shell-random-name-repair.mjs')) fail('validate must run v2084 check');

for (const token of [
  "dataset.v2084UiShellStabilize = 'v2084-ui-shell-start-hud-fishing-repair'",
  'v2084-start-shell',
  'v2084-start-actions',
  'armStartScreenReveal',
  'v2084-hud-popup-stabilize-screen',
  'v2084-compact-hud',
  'v2084-profile-chip',
  'v2084-menu-shell-repair-screen',
  'v2084-runtime-hud',
  'v2084-menu-content',
  'data-v2084-scroll-root="true"',
  'v2084-fishing-bite-single-screen',
  "document.querySelectorAll('.bite-callout').forEach((node) => node.remove())",
]) {
  if (!main.includes(token)) fail(`missing main.ts token: ${token}`);
}

for (const token of [
  'RANDOM_PLAYER_NAMES',
  'function randomPlayerName()',
  'playerName: randomPlayerName()',
]) {
  if (!data.includes(token)) fail(`random player name token missing: ${token}`);
}
if (!storage.includes("fallback = '루미'")) fail('storage fallback player name must no longer be default 나');
if (main.includes('data-v2017-character-close>닫기')) fail('character info text close button must be removed');

for (const token of [
  'v2.0.84 UI Shell Stabilization',
  '.v2084-start-ready',
  '.v2084-runtime-hud',
  '.v2084-compact-hud',
  '.v2084-aqua-modal-dim',
  'backdrop-filter: blur(9px) saturate(1.08)',
  '.v2084-close-button',
  '.v2041-name-editor button',
  '.v2084-fishing-bite-single-screen .bite-callout',
  'content: none !important',
]) {
  if (!css.includes(token)) fail(`missing CSS token: ${token}`);
}

for (const phrase of [
  '랜덤 캐릭터명',
  'HUD 간소화',
  '공용 흐림 아쿠아 오버레이',
  '버튼 상단 줄 잔상',
  '물었다 중복',
]) {
  if (!readme.includes(phrase)) fail(`README must document: ${phrase}`);
}

const banned = ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai'];
const lockText = read('package-lock.json');
const polluted = banned.filter((needle) => lockText.includes(needle));
if (polluted.length) fail(`forbidden registry strings in package-lock: ${polluted.join(', ')}`);

const rootMarkdown = fs.readdirSync('.').filter((name) => name.endsWith('.md'));
if (rootMarkdown.length !== 1 || rootMarkdown[0] !== 'README.md') fail(`root markdown must be README.md only: ${rootMarkdown.join(', ')}`);

console.log('[v2084] UI shell / random name / HUD / bite repair checks passed.');
