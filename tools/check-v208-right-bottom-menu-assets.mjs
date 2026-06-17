import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const fail = (msg) => { console.error(`v2.0.8 validation failed: ${msg}`); process.exit(1); };

const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '2.0.8') fail('package.json version must be 2.0.8');

const data = read('src/data.ts');
if (!data.includes("APP_VERSION = '2.0.8'")) fail('APP_VERSION must be 2.0.8');
if (!data.includes('aqua-fantasia-v2.0.8-right-bottom-menu-assets')) fail('CACHE_NAME must use v2.0.8 cache');

const main = read('src/main.ts');
for (const token of [
  "dataset.villagePolish = 'v208-right-bottom-menu-assets'",
  'v208-right-dock-nav',
  '우측 하단 메뉴',
  'if (nav.classList.contains(\'v208-right-dock-nav\'))',
]) {
  if (!main.includes(token)) fail(`missing main.ts token: ${token}`);
}

const css = read('src/styles.css');
for (const token of [
  'v2.0.8 Right-bottom Compact Menu',
  'grid-template-columns: repeat(2, var(--v208-dock-button))',
  'background: transparent !important;',
  '--v208-dock-icon',
  'v208-right-bottom-menu-assets',
]) {
  if (!css.includes(token)) fail(`missing styles.css token: ${token}`);
}

const villageWorld = read('src/villageWorld.ts');
for (const token of ['grass_path_tile.png', 'curved_path_tile.png', 'sand_path_tile.png']) {
  if (!villageWorld.includes(token)) fail(`missing tile asset integration: ${token}`);
}

const offline = read('public/offline.html');
if (!offline.includes('v2.0.8')) fail('offline badge must show v2.0.8');

const sw = read('public/sw.js');
if (!sw.includes('aqua-fantasia-v2.0.8-right-bottom-menu-assets')) fail('service worker cache must use v2.0.8 cache');

const readme = read('README.md');
if (!readme.includes('# AquaFantasia v2.0.8')) fail('README title must show v2.0.8');
if (!readme.includes('우측 하단 간소 메뉴 재정리')) fail('README must include v2.0.8 changelog');

const mdFiles = fs.readdirSync(root).filter((name) => name.toLowerCase().endsWith('.md'));
if (mdFiles.length !== 1 || mdFiles[0] !== 'README.md') fail(`root markdown files must only be README.md, found: ${mdFiles.join(', ')}`);

console.log('v2.0.8 right-bottom menu and asset validation passed');
