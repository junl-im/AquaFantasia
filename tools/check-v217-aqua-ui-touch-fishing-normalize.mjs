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
const toast = read('src/toast.ts');
const cleanScript = read('tools/clean-old-patch-docs.mjs');

function fail(message) {
  console.error(`[v217] ${message}`);
  process.exit(1);
}

const version = '2.1.7';
const cache = 'aqua-fantasia-v2.1.7-aqua-ui-touch-fishing-normalize';
if (pkg.version !== version) fail(`package version mismatch: ${pkg.version}`);
if (lock.version !== version) fail(`package-lock top version mismatch: ${lock.version}`);
if (!lock.packages || !lock.packages[''] || lock.packages[''].version !== version) fail('package-lock root package version not synchronized');
if (!data.includes("APP_VERSION = '2.1.7'")) fail('APP_VERSION not synchronized');
if (!data.includes(cache)) fail('data cache version not synchronized');
if (!sw.includes(cache)) fail('service worker cache version not synchronized');
if (!offline.includes('v2.1.7')) fail('offline badge is not v2.1.7');
if (!readme.includes('AquaFantasia v2.1.7')) fail('README title is not v2.1.7');

for (const token of ['AquaFantasia_backup', "name === 'dist'", "name === 'reports'", "name.endsWith('.log')", '_NOTES']) {
  if (!cleanScript.includes(token)) fail(`clean script missing cleanup token: ${token}`);
}
for (const token of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  if (JSON.stringify(lock).includes(token) || JSON.stringify(pkg).includes(token)) fail(`forbidden registry token found: ${token}`);
}

for (const token of [
  "dataset.v217AquaUiTouchFishingNormalize = 'v217-aqua-ui-touch-fishing-normalize-pass'",
  'v217-aqua-ui-touch-fishing-normalize-root',
  'v217-keep-aqua-toggle',
  'v217-village-touch-normalized-screen',
  'v217-aqua-modal-card',
  'v217-aqua-page-root',
  'v217-aqua-page-card',
  'v217-fishing-core-repair-screen',
  'v217-right-bottom-dock',
  "nav.dataset.v217DockLock = 'small-right-bottom-dock'",
  "const routeTopControl = (screen: Screen, ev: Event)",
  "routeTopControl('shop', ev)",
  "routeTopControl('fishing', ev)",
  "document.body.classList.toggle('v217-aqua-modal-open', willOpen)",
  "root.classList.toggle('v217-character-modal-open', hidden)",
]) {
  if (!main.includes(token)) fail(`main missing v2.1.7 UI/touch token: ${token}`);
}

for (const token of [
  "document.body.classList.add('v2094-modal-open', 'v2097-modal-open', 'v217-aqua-modal-open', 'v217-interior-open')",
  "this.root.classList.add('v2094-interior-open', 'v2097-interior-open', 'v217-interior-modal-open')",
  "this.root.classList.remove('v2094-interior-open', 'v2097-interior-open', 'v217-interior-modal-open')",
  "this.root.querySelector<HTMLButtonElement>('[data-village-fishing]')?.addEventListener('click', (ev) => { ev.preventDefault(); ev.stopPropagation(); this.onGoFishing(); });",
  '[data-v2097-interior-panel], [data-v2094-interior-panel]',
]) {
  if (!villageWorld.includes(token)) fail(`villageWorld missing v2.1.7 modal/touch token: ${token}`);
}

for (const token of [
  'html.v217-aqua-ui-touch-fishing-normalize-root',
  '--v217-card',
  '.hit-keep.v217-keep-aqua-toggle',
  'background-image: none !important;',
  '.runtime-menu-screen.v217-aqua-page-root .runtime-hud',
  '.runtime-content.v217-aqua-page-card',
  '.v2097-character-card.v217-character-card',
  '.village-world-screen.v2097-expedition-open .v2097-expedition-board',
  'body.v217-aqua-modal-open .village-world-screen :is(.v2097-village-hud,.v2097-world-controls,.v2097-joystick,.bottom-nav,.v2097-village-guide,.v2097-village-notice)',
  '.bottom-nav.v2098-bottom-nav.v217-right-bottom-dock',
  'body[data-screen="fishing"] .fishing-screen.v217-fishing-core-repair-screen',
  'body[data-screen="fishing"] .cast-button',
  'body[data-screen="fishing"] .v2055-reel-console.v214-reel-console:not(.hidden)',
]) {
  if (!css.includes(token)) fail(`CSS missing v2.1.7 aqua/touch/fishing token: ${token}`);
}

for (const token of [
  'this.root.replaceChildren();',
  "this.root.dataset.v214ToastDisabled = 'true'",
  'toast popups are intentionally disabled',
]) {
  if (!toast.includes(token)) fail(`toast disable guard missing: ${token}`);
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

console.log('[AquaFantasia] v2.1.7 aqua UI/touch/fishing normalization validation passed.');
