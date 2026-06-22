import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';

const root = process.cwd();
const read = (p) => readFileSync(join(root, p), 'utf8');
const pkg = JSON.parse(read('package.json'));
const lock = read('package-lock.json');
const data = read('src/data.ts');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const readme = read('README.md');
const main = read('src/main.ts');
const css = read('src/styles.css');
const villageWorld = read('src/villageWorld.ts');
const validateClean = read('tools/validate-clean.mjs');
const cleanScript = read('tools/clean-old-patch-docs.mjs');

function fail(msg) {
  console.error(`[v210] ${msg}`);
  process.exit(1);
}

const version = '2.1.0';
const cache = 'aqua-fantasia-v2.1.0-aqua-ui-foundation';
if (pkg.version !== version) fail(`package version mismatch: ${pkg.version}`);
if (!lock.includes('"version": "2.1.0"')) fail('package-lock version not synchronized');
if (!data.includes("APP_VERSION = '2.1.0'")) fail('APP_VERSION not synchronized');
if (!data.includes(cache)) fail('data cache version not synchronized');
if (!sw.includes(cache)) fail('service worker cache version not synchronized');
if (!offline.includes('v2.1.0')) fail('offline badge is not v2.1.0');
if (!readme.includes('AquaFantasia v2.1.0')) fail('README title is not v2.1.0');
if (!validateClean.includes('^2\\.(0|1)\\.\\d+$')) fail('validate-clean does not allow 2.1.x sequence');

for (const token of ['AquaFantasia_backup', "name === 'dist'", "name === 'reports'", "name.endsWith('.log')", '_NOTES']) {
  if (!cleanScript.includes(token)) fail(`clean script missing cleanup token: ${token}`);
}

for (const token of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  if (lock.includes(token) || JSON.stringify(pkg).includes(token)) fail(`forbidden registry token found: ${token}`);
}

for (const token of [
  "dataset.v210AquaUiFoundation = 'v210-aqua-card-layout-foundation'",
  "v210-aqua-ui-foundation-root",
  "v2100-ui-stability-root",
  "v2098-ui-recovery-root",
  "v2097-ui-clean-root",
]) {
  if (!main.includes(token)) fail(`main missing 2.1.0 UI token: ${token}`);
}

for (const token of [
  'html.v210-aqua-ui-foundation-root',
  '--v210-card',
  '--v210-blur',
  '.v2097-village-hud',
  '.v2097-expedition-board',
  '.v2097-world-controls',
  '.v2097-joystick',
  '.bottom-nav.v2098-bottom-nav',
  '.bottom-nav:not(.v2098-bottom-nav)',
  '.v2097-modal-backdrop',
  '.v2097-expedition-body.v2097-expedition-body-open',
  '.runtime-menu-screen.v2097-menu-screen',
  '.v2097-menu-content:empty::before',
]) {
  if (!css.includes(token)) fail(`CSS missing 2.1.0 aqua UI token: ${token}`);
}

for (const label of ['홈', '가방', '퀘스트', '지도']) {
  if (!main.includes(`label: '${label}'`)) fail(`bottom nav label missing: ${label}`);
}
for (const token of ['data-village-build-open', 'data-village-shop', 'data-village-fishing', 'data-village-zoom-in', 'data-village-zoom-out', 'data-village-center']) {
  if (!main.includes(token)) fail(`right top control token missing: ${token}`);
}
for (const token of ['data-village-joystick', 'data-village-joystick-knob']) {
  if (!main.includes(token)) fail(`joystick token missing: ${token}`);
}
for (const token of ['v2094-build-tray-open', 'v2097-build-tray-open', 'v2098-build-tray-open']) {
  if (!villageWorld.includes(token) && !main.includes(token)) fail(`build state token missing: ${token}`);
}
for (const token of ['ACTOR_DIRECTION_TEXTURE_FIX', 'ACTOR_DIRECTION_TEXTURES', 'actorDirectionFromVector', 'actorTextureUrl', 'actorDirectionQaPasses']) {
  if (!villageWorld.includes(token)) fail(`character direction guard token missing: ${token}`);
}

function walk(dir, out = []) {
  for (const name of readdirSync(join(root, dir))) {
    if (name === 'node_modules' || name === '.git') continue;
    const p = dir === '.' ? name : `${dir}/${name}`;
    const st = statSync(join(root, p));
    if (st.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}

const files = walk('.');
const forbidden = files.filter((p) => {
  if (p === 'README.md') return false;
  const base = basename(p);
  if (/\.md$/i.test(p)) return true;
  if (/_NOTES\.md$/i.test(base)) return true;
  if (/(^|\/)dist\//.test(p)) return true;
  if (/(^|\/)reports\//.test(p)) return true;
  if (/(^|\/)AquaFantasia_backup/i.test(p)) return true;
  if (/\.log$/i.test(p)) return true;
  return false;
});
if (forbidden.length) fail(`forbidden package artifacts remain: ${forbidden.slice(0, 12).join(', ')}`);

console.log('[AquaFantasia] v2.1.0 aqua UI foundation validation passed.');
