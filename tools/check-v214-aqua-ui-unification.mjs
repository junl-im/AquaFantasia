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
const toast = read('src/toast.ts');
const villageWorld = read('src/villageWorld.ts');
const cleanScript = read('tools/clean-old-patch-docs.mjs');

function fail(message) {
  console.error(`[v214] ${message}`);
  process.exit(1);
}

const version = '2.1.4';
const cache = 'aqua-fantasia-v2.1.4-aqua-ui-unified-fishing-polish';
if (pkg.version !== version) fail(`package version mismatch: ${pkg.version}`);
if (lock.version !== version) fail(`package-lock top version mismatch: ${lock.version}`);
if (!lock.packages || !lock.packages[''] || lock.packages[''].version !== version) fail('package-lock root package version not synchronized');
if (!data.includes("APP_VERSION = '2.1.4'")) fail('APP_VERSION not synchronized');
if (!data.includes(cache)) fail('data cache version not synchronized');
if (!sw.includes(cache)) fail('service worker cache version not synchronized');
if (!offline.includes('v2.1.4')) fail('offline badge is not v2.1.4');
if (!readme.includes('AquaFantasia v2.1.4')) fail('README title is not v2.1.4');

for (const token of ['AquaFantasia_backup', "name === 'dist'", "name === 'reports'", "name.endsWith('.log')", '_NOTES']) {
  if (!cleanScript.includes(token)) fail(`clean script missing cleanup token: ${token}`);
}
for (const token of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  if (JSON.stringify(lock).includes(token) || JSON.stringify(pkg).includes(token)) fail(`forbidden registry token found: ${token}`);
}
for (const token of [
  "dataset.v214AquaUiUnified = 'v214-aqua-ui-unified-fishing-polish-pass'",
  'v214-aqua-ui-unified-root',
  'v213-aqua-ui-detail-root',
  'v212-aqua-ui-polish-root',
  'v211-aqua-ui-refinement-root',
  'v210-aqua-ui-foundation-root',
  'v2100-ui-stability-root',
  'v2098-ui-recovery-root',
  'v2097-ui-clean-root',
]) {
  if (!main.includes(token)) fail(`main missing v2.1.4 UI token: ${token}`);
}
for (const token of [
  'v214-keep-aqua-toggle',
  "['left', '21.8%']",
  "['width', '56.4%']",
  "['min-height', '44px']",
  "['font-size', 'clamp(13px, 3.35vw, 15px)']",
  'data-v214-keep-state',
]) {
  if (!main.includes(token.replace('data-v214-keep-state', 'v214KeepState'))) fail(`start-screen aqua toggle guard missing: ${token}`);
}
for (const token of [
  'v214-fishing-polish-screen',
  'v214-fishing-hud',
  'v214-fishing-loadout',
  'v214-recent-catch',
  'v214-reel-card',
  'v214-reel-console',
  'v214-bite-callout',
  'v214-action-badge',
]) {
  if (!main.includes(token)) fail(`fishing markup missing v2.1.4 token: ${token}`);
}
for (const token of [
  'html.v214-aqua-ui-unified-root',
  '--v214-card',
  '--v214-card-strong',
  '--v214-border',
  '#toast-root',
  '.toast',
  '.hit-keep.v214-keep-aqua-toggle',
  '.keep-indicator::before',
  '.runtime-content',
  '.v2097-menu-content',
  '.v2098-menu-content',
  '.v2097-modal-card',
  '.v2097-character-card',
  '.v2097-interior-card',
  '.v2097-build-tray',
  '.v2097-expedition-body',
  '.v2097-ui-close',
  '.runtime-btn',
  'overscroll-behavior: contain',
  'body[data-screen="fishing"] .game-screen.fishing-screen.v214-fishing-polish-screen',
  '.fishing-hud.v214-fishing-hud',
  '.fishing-loadout-strip.v214-fishing-loadout',
  '.fishing-guide-card.v214-fishing-guide',
  '.recent-catch-strip.v214-recent-catch',
  '.cast-button',
  '.reel-panel.v214-reel-card:not(.hidden)',
  '.v2055-reel-console.v214-reel-console:not(.hidden)',
  '.v2053-reel-touch-zone:not(.hidden)',
  '.bite-callout.v214-bite-callout',
  '.action-badge.v214-action-badge',
]) {
  if (!css.includes(token)) fail(`CSS missing v2.1.4 token: ${token}`);
}
for (const token of ['v214ToastDisabled', 'show(_options: ToastOptions): void', 'replaceChildren()', 'toast popups are intentionally disabled']) {
  if (!toast.includes(token)) fail(`toast disable implementation missing: ${token}`);
}
for (const label of ['홈', '가방', '퀘스트', '지도']) {
  if (!main.includes(`label: '${label}'`)) fail(`bottom nav label missing: ${label}`);
}
for (const token of ['data-village-build-open', 'data-village-shop', 'data-village-fishing', 'data-village-center', 'data-village-zoom-in', 'data-village-zoom-out']) {
  if (!main.includes(token)) fail(`right-top village control missing: ${token}`);
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
console.log('[AquaFantasia] v2.1.4 aqua UI unification and fishing polish validation passed.');
