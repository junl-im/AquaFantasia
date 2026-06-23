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
  console.error(`[v216] ${message}`);
  process.exit(1);
}

const version = '2.1.6';
const cache = 'aqua-fantasia-v2.1.6-event-ui-fishing-stability';
if (pkg.version !== version) fail(`package version mismatch: ${pkg.version}`);
if (lock.version !== version) fail(`package-lock top version mismatch: ${lock.version}`);
if (!lock.packages || !lock.packages[''] || lock.packages[''].version !== version) fail('package-lock root package version not synchronized');
if (!data.includes("APP_VERSION = '2.1.6'")) fail('APP_VERSION not synchronized');
if (!data.includes(cache)) fail('data cache version not synchronized');
if (!sw.includes(cache)) fail('service worker cache version not synchronized');
if (!offline.includes('v2.1.6')) fail('offline badge is not v2.1.6');
if (!readme.includes('AquaFantasia v2.1.6')) fail('README title is not v2.1.6');

for (const token of ['AquaFantasia_backup', "name === 'dist'", "name === 'reports'", "name.endsWith('.log')", '_NOTES']) {
  if (!cleanScript.includes(token)) fail(`clean script missing cleanup token: ${token}`);
}
for (const token of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  if (JSON.stringify(lock).includes(token) || JSON.stringify(pkg).includes(token)) fail(`forbidden registry token found: ${token}`);
}

for (const token of [
  "dataset.v216EventUiFishingStability = 'v216-event-ui-fishing-stability-pass'",
  'v216-event-ui-fishing-stability-root',
  'v216-fishing-input-ui-screen',
  'v216-right-bottom-dock',
  "const supportsPointerEvents = 'PointerEvent' in window",
  'const isFishingInputExcluded',
  "'.bottom-nav, .fishing-hud, .recent-catch-strip, .fishing-loadout-strip, .cast-button, .v2055-reel-console, .reel-panel, .hold-pad, .v2053-reel-touch-zone, .catch-result-card, .v2059-fishing-close'",
  "if (supportsPointerEvents || isFishingInputExcluded(ev.target)) return;",
  "dom.app.querySelector<HTMLElement>('.fishing-screen')?.classList.add('v216-result-open')",
  "dom.app.querySelector<HTMLElement>('.fishing-screen')?.classList.remove('v216-result-open')",
]) {
  if (!main.includes(token)) fail(`main missing v2.1.6 event/fishing token: ${token}`);
}

for (const token of [
  'data-v2097-interior-panel data-v2094-interior-panel',
  'data-v2097-interior-image data-v2094-interior-image',
]) {
  if (!main.includes(token)) fail(`main missing v2.1.6 interior compatibility token: ${token}`);
}

for (const token of [
  "dataset.v216InteriorPanelRepair = 'v216-v2097-interior-selector-event-lock'",
  "classList.add('v215-village-hitbox-ready', 'v216-village-interior-ready')",
  "[data-v2097-interior-panel], [data-v2094-interior-panel]",
  "[data-v2097-interior-image], [data-v2094-interior-image]",
  "this.root.classList.add('v2094-interior-open', 'v2097-interior-open')",
  "document.body.classList.add('v2094-modal-open', 'v2097-modal-open')",
  ".v2097-world-controls, .v2094-world-controls",
]) {
  if (!villageWorld.includes(token)) fail(`villageWorld missing v2.1.6 interior/event token: ${token}`);
}

for (const token of [
  'html.v216-event-ui-fishing-stability-root',
  '--v216-card-strong',
  '#toast-root',
  '.v2097-interior-panel.open',
  '.v2097-interior-panel .v2097-modal-backdrop',
  '.village-world-screen.v2097-interior-open',
  '.bottom-nav.v2098-bottom-nav.v216-right-bottom-dock',
  'body[data-screen="fishing"] .fishing-screen.v216-fishing-input-ui-screen',
  'body[data-screen="fishing"] :is(.fishing-hud,.fishing-loadout-strip,.recent-catch-strip,.cast-button,.reel-panel,.v2055-reel-console,.v2053-reel-touch-zone,.bite-callout,.action-badge,.catch-result-card,.v2059-fishing-close,.bottom-nav)',
  '.v216-result-open :is(.fishing-hud,.fishing-loadout-strip,.recent-catch-strip,.cast-button,.reel-panel,.v2055-reel-console,.bottom-nav)',
]) {
  if (!css.includes(token)) fail(`CSS missing v2.1.6 UI/fishing token: ${token}`);
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

console.log('[AquaFantasia] v2.1.6 event/UI/fishing stability validation passed.');
