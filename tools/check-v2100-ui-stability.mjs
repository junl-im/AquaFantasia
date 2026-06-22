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
const cleanScript = read('tools/clean-old-patch-docs.mjs');

function fail(msg) {
  console.error(`[v2100] ${msg}`);
  process.exit(1);
}

const version = '2.0.100';
if (pkg.version !== version) fail(`package version mismatch: ${pkg.version}`);
if (!lock.includes('"version": "2.0.100"')) fail('package-lock version not synchronized');
if (!data.includes("APP_VERSION = '2.0.100'")) fail('APP_VERSION not synchronized');
if (!data.includes('aqua-fantasia-v2.0.100-ui-stability-root')) fail('data cache version not synchronized');
if (!sw.includes('aqua-fantasia-v2.0.100-ui-stability-root')) fail('service worker cache version not synchronized');
if (!offline.includes('v2.0.100')) fail('offline badge is not v2.0.100');
if (!readme.includes('AquaFantasia v2.0.100')) fail('README title is not v2.0.100');

for (const token of ['AquaFantasia_backup', "name === 'dist'", "name === 'reports'", "name.endsWith('.log')", '_NOTES']) {
  if (!cleanScript.includes(token)) fail(`clean script missing cleanup token: ${token}`);
}

for (const token of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  if (lock.includes(token) || pkg.version.includes(token)) fail(`forbidden registry token found: ${token}`);
}

for (const token of [
  "dataset.v2100UiStability = 'v2100-version-independent-ui-stability-root'",
  "v2100-ui-stability-root",
  "v2098-ui-recovery-root",
  "v2097-ui-clean-root",
]) {
  if (!main.includes(token)) fail(`main missing UI stability token: ${token}`);
}

for (const token of [
  'html.v2100-ui-stability-root',
  '.bottom-nav.v2098-bottom-nav',
  '.bottom-nav:not(.v2098-bottom-nav)',
  '.v2097-world-controls',
  '.v2097-village-hud',
  '.v2097-expedition-body.v2097-expedition-body-open',
  '.hit-keep.v2025-keep-button',
]) {
  if (!css.includes(token)) fail(`CSS missing v2100 UI guard token: ${token}`);
}

const navLabels = ['홈', '가방', '퀘스트', '지도'];
for (const label of navLabels) if (!main.includes(`label: '${label}'`)) fail(`bottom nav label missing: ${label}`);
for (const screen of ['village', 'inventory', 'mission', 'map']) if (!main.includes(`data-v2098-nav="${screen}"`) && !main.includes(`screen: '${screen}'`)) fail(`bottom nav screen missing: ${screen}`);

for (const token of ['v2094-build-tray-open', 'v2097-build-tray-open', 'v2098-build-tray-open', 'data-village-build-open']) {
  if (!villageWorld.includes(token) && !main.includes(token)) fail(`build state/click token missing: ${token}`);
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

console.log('[AquaFantasia] v2.0.100 UI stability root validation passed.');
