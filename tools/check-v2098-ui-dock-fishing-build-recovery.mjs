import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (p) => readFileSync(join(root, p), 'utf8');
const pkg = JSON.parse(read('package.json'));
const main = read('src/main.ts');
const css = read('src/styles.css');
const data = read('src/data.ts');
const sw = read('public/sw.js');
const offline = read('public/offline.html');

function fail(msg) {
  console.error(`[v2098] ${msg}`);
  process.exit(1);
}

if (pkg.version !== '2.0.98') fail(`package version mismatch: ${pkg.version}`);
if (!data.includes("APP_VERSION = '2.0.98'")) fail('APP_VERSION not synchronized');
if (!sw.includes('v2.0.98')) fail('service worker cache is not v2.0.98');
if (!offline.includes('v2.0.98')) fail('offline badge is not v2.0.98');

const requiredMain = [
  'v2098UiRecovery',
  'v2098-bottom-nav',
  "label: '홈'",
  "label: '가방'",
  "label: '퀘스트'",
  "label: '지도'",
  'v2098-fishing-restored-screen',
  'v2055-fishing-reel-rebuild-screen',
  'data-village-build-open',
  'v2098-menu-content',
  'data-v2098-scroll-root',
];
for (const token of requiredMain) {
  if (!main.includes(token)) fail(`missing main token: ${token}`);
}

const forbiddenDockItems = ["label: '상점'", "label: '장비'", "label: '도감'", "label: '출항'", "label: '마을'"];
for (const token of forbiddenDockItems) {
  if (main.includes(token)) fail(`bottom dock still contains old item token: ${token}`);
}

const requiredCss = [
  'html[data-version="2.0.98"]',
  '.bottom-nav.v2098-bottom-nav',
  'right: max(8px, env(safe-area-inset-right))',
  'grid-template-columns: repeat(4, minmax(0, 1fr))',
  '.v2098-fishing-restored-screen',
  '.v2097-world-controls',
  '.v2097-build-tray-open',
  '.v2098-build-tray-open',
];
for (const token of requiredCss) {
  if (!css.includes(token)) fail(`missing css token: ${token}`);
}

const villageWorld = read('src/villageWorld.ts');
for (const token of ['v2097-build-tray-open', 'v2098-build-tray-open', 'TILE_W * 0.22', 'TILE_H * 0.22']) {
  if (!villageWorld.includes(token)) fail(`missing villageWorld token: ${token}`);
}

const banned = ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai'];
const lock = read('package-lock.json');
for (const token of banned) if (lock.includes(token)) fail(`forbidden registry token found: ${token}`);

function walk(dir, out = []) {
  for (const name of readdirSync(join(root, dir))) {
    const p = join(dir, name);
    const st = statSync(join(root, p));
    if (st.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}
for (const p of walk('.')) {
  if (/node_modules|\/dist\/|\/reports\//.test(p)) fail(`forbidden package path exists: ${p}`);
  if (/_NOTES\.md$/.test(p)) fail(`forbidden notes file exists: ${p}`);
}
console.log('[AquaFantasia] v2.0.98 UI dock/fishing/build recovery validation passed.');
