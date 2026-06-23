import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const fail = (message) => { console.error(`[v2114] ${message}`); process.exit(1); };
const has = (text, token, label = token) => { if (!text.includes(token)) fail(`missing ${label}`); };

const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '2.1.14') fail(`package version must be 2.1.14, got ${pkg.version}`);
has(pkg.scripts?.validate ?? '', 'tools/check-v2114-interaction-shell-polish.mjs', 'v2114 validate hook');

const lock = JSON.parse(read('package-lock.json'));
if (lock.version !== '2.1.14') fail(`lock version must be 2.1.14, got ${lock.version}`);
if (lock.packages?.['']?.version !== '2.1.14') fail(`lock root package version must be 2.1.14, got ${lock.packages?.['']?.version}`);

const data = read('src/data.ts');
has(data, "APP_VERSION = '2.1.14'", 'APP_VERSION 2.1.14');
has(data, 'aqua-fantasia-v2.1.14-interaction-shell-polish', 'v2114 cache name');

const main = read('src/main.ts');
[
  "dataset.v2114InteractionShellPolish = 'v2114-interaction-shell-polish'",
  'v2114-aqua-interaction-root',
  'v2114-village-interaction',
  'v2114-controls-mounted',
  'bindVillagePrimaryTap',
  'v2114-runtime-page-shell',
  'v2114-aqua-page',
  'v2114-fishing-polish-screen',
  'v2114-bottom-nav',
  "nav.dataset.v2114Dock = 'right-bottom-crisp-compact'",
  "root.classList.contains('v2114-build-tray-open')",
  "root.classList.contains('v2114-controls-mounted')",
].forEach((token) => has(main, token, `main ${token}`));

const village = read('src/villageWorld.ts');
[
  'v2114-build-active',
  'v2114-build-tray-open',
  "document.body.classList.toggle('v2114-build-open', open)",
  'if (ev.defaultPrevented) return;',
  'ACTOR_DIRECTION_TEXTURE_FIX',
  'ACTOR_DIRECTION_TEXTURES',
  'actorDirectionFromVector',
  'actorTextureUrl',
  'actorDirectionQaPasses',
].forEach((token) => has(village, token, `village ${token}`));

const css = read('src/styles.css');
[
  'v2.1.14: Interaction Shell Polish',
  'html.v2114-aqua-interaction-root',
  '--v2114-card',
  'body[data-screen="village"] .v2097-village-hud',
  'body[data-screen="village"] .v2097-expedition-board',
  'body[data-screen="village"] .v2097-world-controls',
  'body[data-screen="village"] .v2097-joystick',
  '.bottom-nav.v2114-bottom-nav',
  'body.v2114-modal-open .village-world-screen',
  'body.v2114-expedition-open .village-world-screen',
  'body.v2114-build-open .village-world-screen',
  '.village-world-screen.v2114-build-tray-open .v2097-build-tray',
  '.runtime-menu-screen.v2114-runtime-page-shell .v2114-aqua-page',
  'body[data-screen="fishing"] .fishing-screen.v2114-fishing-polish-screen',
  '.start-art-screen .hit-keep',
  "content: '✓'",
].forEach((token) => has(css, token, `css ${token}`));

const sw = read('public/sw.js');
has(sw, 'aqua-fantasia-v2.1.14-interaction-shell-polish', 'service worker cache');
const offline = read('public/offline.html');
has(offline, 'v2.1.14', 'offline version');
const readme = read('README.md');
if (!readme.startsWith('# AquaFantasia v2.1.14')) fail('README version not synced');
for (const token of ['v2114-aqua-interaction-root', 'HUD', '개척', '조이스틱', '우측 하단', '건설', '상점', '출항', '낚시', 'validate-and-deploy']) has(readme, token, `README ${token}`);

const manifestPath = path.join(root, 'public/assets/v2110/asset_manifest.json');
if (!fs.existsSync(manifestPath)) fail('v2110 asset manifest missing');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
if (manifest.totalPng !== 278) fail(`expected v2110 asset manifest totalPng 278, got ${manifest.totalPng}`);

const forbiddenRegistryTokens = [
  ['packages', 'applied-caas'].join('.'),
  ['applied-caas', 'gateway'].join('-'),
  ['10', '192', ''].join('.'),
  ['internal', 'api', 'openai'].join('.'),
];
for (const forbidden of forbiddenRegistryTokens) {
  for (const file of ['package.json', 'package-lock.json', 'README.md', 'src/data.ts', 'src/main.ts', 'src/styles.css', 'src/villageWorld.ts']) {
    if (read(file).includes(forbidden)) fail(`forbidden registry string ${forbidden} in ${file}`);
  }
}

console.log('[v2114] Interaction shell polish checks passed.');
console.log(JSON.stringify({ ok: true, version: '2.1.14', assets: manifest.totalPng }, null, 2));
