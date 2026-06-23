import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';

const root = process.cwd();
const read = (p) => readFileSync(join(root, p), 'utf8');
const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const data = read('src/data.ts');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const readme = read('README.md');
const main = read('src/main.ts');
const css = read('src/styles.css');
const villageWorld = read('src/villageWorld.ts');
const cleanScript = read('tools/clean-old-patch-docs.mjs');

function fail(msg) {
  console.error(`[v213] ${msg}`);
  process.exit(1);
}

const version = '2.1.3';
const cache = 'aqua-fantasia-v2.1.3-aqua-ui-detail-polish';
if (pkg.version !== version) fail(`package version mismatch: ${pkg.version}`);
if (lock.version !== version) fail(`package-lock top version mismatch: ${lock.version}`);
if (!lock.packages || !lock.packages[''] || lock.packages[''].version !== version) fail('package-lock root package version not synchronized');
if (!data.includes("APP_VERSION = '2.1.3'")) fail('APP_VERSION not synchronized');
if (!data.includes(cache)) fail('data cache version not synchronized');
if (!sw.includes(cache)) fail('service worker cache version not synchronized');
if (!offline.includes('v2.1.3')) fail('offline badge is not v2.1.3');
if (!readme.includes('AquaFantasia v2.1.3')) fail('README title is not v2.1.3');

for (const token of ['AquaFantasia_backup', "name === 'dist'", "name === 'reports'", "name.endsWith('.log')", '_NOTES']) {
  if (!cleanScript.includes(token)) fail(`clean script missing cleanup token: ${token}`);
}
for (const token of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  if (JSON.stringify(lock).includes(token) || JSON.stringify(pkg).includes(token)) fail(`forbidden registry token found: ${token}`);
}
for (const token of [
  "dataset.v213AquaUiDetail = 'v213-aqua-ui-detail-polish-pass'",
  'v213-aqua-ui-detail-root',
  'v212-aqua-ui-polish-root',
  'v211-aqua-ui-refinement-root',
  'v210-aqua-ui-foundation-root',
  'v2100-ui-stability-root',
  'v2098-ui-recovery-root',
  'v2097-ui-clean-root',
]) {
  if (!main.includes(token)) fail(`main missing v2.1.3 UI token: ${token}`);
}
for (const token of [
  "'v213AquaUiDetail'",
  "['left', '25.5%']",
  "['width', '49.0%']",
  "['min-height', '38px']",
  "['font-size', 'clamp(12px, 3.0vw, 14px)']",
]) {
  if (!main.includes(token)) fail(`start-screen guard missing v2.1.3 token: ${token}`);
}
for (const token of [
  'html.v213-aqua-ui-detail-root',
  '--v213-toolbar-w',
  '--v213-hud-w',
  '--v213-dock-w',
  '--v213-joy-size',
  '--v213-touch',
  '.v2097-village-hud',
  '.v2097-profile-chip',
  '.v2097-expedition-board',
  '.v2097-expedition-toggle',
  '.v2097-world-controls',
  'grid-template-columns: repeat(2, minmax(0, 1fr))',
  '[data-village-build-open]',
  '[data-village-shop]',
  '[data-village-fishing]',
  '.v2097-joystick-base',
  '.v2097-joystick-knob',
  '.bottom-nav.v2098-bottom-nav',
  '.bottom-nav:not(.v2098-bottom-nav)',
  '.v2097-modal-backdrop',
  '.v2097-character-card',
  '.v2097-interior-card',
  '.v2097-expedition-body',
  '.v2097-build-tray',
  '.v2097-ui-close',
  '.v2097-menu-content',
  'overscroll-behavior: contain',
  'background-image: none',
  '.hit-keep.v2025-keep-button.checked .keep-indicator::after',
  'body.v2097-modal-open .bottom-nav.v2098-bottom-nav',
  'body.v2097-expedition-open .v2097-joystick',
]) {
  if (!css.includes(token)) fail(`CSS missing v2.1.3 detail polish token: ${token}`);
}
const controls = ['data-village-build-open', 'data-village-shop', 'data-village-fishing', 'data-village-center', 'data-village-zoom-in', 'data-village-zoom-out'];
const positions = controls.map((token) => main.indexOf(token));
if (positions.some((pos) => pos < 0)) fail('right top control token missing');
for (let i = 1; i < positions.length; i += 1) {
  if (positions[i] <= positions[i - 1]) fail('right top controls are not in build/shop/fishing/origin/zoom order');
}
for (const label of ['홈', '가방', '퀘스트', '지도']) {
  if (!main.includes(`label: '${label}'`)) fail(`bottom nav label missing: ${label}`);
}
for (const token of ['data-village-joystick', 'data-village-joystick-knob', 'data-v2097-scroll-root="true"', 'data-v2098-scroll-root="true"']) {
  if (!main.includes(token)) fail(`runtime UI token missing: ${token}`);
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
console.log('[AquaFantasia] v2.1.3 aqua UI detail polish validation passed.');
