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

function fail(message) {
  console.error(`[v215] ${message}`);
  process.exit(1);
}

const version = '2.1.5';
const cache = 'aqua-fantasia-v2.1.5-ui-hitbox-menu-fix';
if (pkg.version !== version) fail(`package version mismatch: ${pkg.version}`);
if (lock.version !== version) fail(`package-lock top version mismatch: ${lock.version}`);
if (!lock.packages || !lock.packages[''] || lock.packages[''].version !== version) fail('package-lock root package version not synchronized');
if (!data.includes("APP_VERSION = '2.1.5'")) fail('APP_VERSION not synchronized');
if (!data.includes(cache)) fail('data cache version not synchronized');
if (!sw.includes(cache)) fail('service worker cache version not synchronized');
if (!offline.includes('v2.1.5')) fail('offline badge is not v2.1.5');
if (!readme.includes('AquaFantasia v2.1.5')) fail('README title is not v2.1.5');

for (const token of ['AquaFantasia_backup', "name === 'dist'", "name === 'reports'", "name.endsWith('.log')", '_NOTES']) {
  if (!cleanScript.includes(token)) fail(`clean script missing cleanup token: ${token}`);
}
for (const token of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  if (JSON.stringify(lock).includes(token) || JSON.stringify(pkg).includes(token)) fail(`forbidden registry token found: ${token}`);
}

for (const token of [
  "dataset.v215UiHitboxMenuFix = 'v215-right-bottom-menu-building-hitbox-pass'",
  'v215-ui-hitbox-menu-fix-root',
  'v215-right-bottom-dock',
  "nav.dataset.v215DockLock = 'right-bottom-no-full-width-repair'",
  "if (nav.classList.contains('v2098-bottom-nav'))",
  "nav.style.setProperty('right', 'var(--v215-safe-right",
  "nav.style.setProperty('width', 'var(--v215-dock-w",
  "nav.style.setProperty('grid-template-columns', 'repeat(4, minmax(0, 1fr))'",
]) {
  if (!main.includes(token)) fail(`main missing v2.1.5 dock repair token: ${token}`);
}

for (const label of ['홈', '가방', '퀘스트', '지도']) {
  if (!main.includes(`label: '${label}'`)) fail(`bottom nav label missing: ${label}`);
}

for (const token of [
  'html.v215-ui-hitbox-menu-fix-root',
  '--v215-dock-w',
  '.bottom-nav.v2098-bottom-nav.v215-right-bottom-dock',
  'right: var(--v215-safe-right)',
  'bottom: var(--v215-safe-bottom)',
  'grid-template-columns: repeat(4, minmax(0, 1fr))',
  '.bottom-nav.v2098-bottom-nav.v1117-nav-repaired',
  '.v2097-build-backdrop',
  'display: none !important;',
  'pointer-events: none !important;',
  ':is(.v2-build-tray-open,.v2094-build-tray-open,.v2097-build-tray-open,.v2098-build-tray-open) .v2097-build-backdrop',
  '.village-world-screen .v2-village-stage canvas',
]) {
  if (!css.includes(token)) fail(`CSS missing v2.1.5 menu/hitbox token: ${token}`);
}

for (const token of [
  'const BUILDING_HITBOX_FRONT_MARGIN = 2',
  'const BUILDING_HITBOX_SIDE_MARGIN = 0.52',
  "dataset.v215VillageHitbox = 'expanded-building-body-front-footprint-hitbox'",
  "classList.add('v215-village-hitbox-ready')",
  'const expandedFootprint',
  'const visualBodyNear',
  'const kindBias',
]) {
  if (!villageWorld.includes(token)) fail(`village hitbox repair token missing: ${token}`);
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

console.log('[AquaFantasia] v2.1.5 right-bottom dock and village hitbox validation passed.');
