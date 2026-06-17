import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (msg) => { console.error(`v2.0.10 validation failed: ${msg}`); process.exit(1); };

const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '2.0.10') fail('package.json version must be 2.0.10');
if (!pkg.scripts.validate.includes('check-v2010-asset-layout-polish.mjs')) fail('validate script must use v2.0.10 checker');

const lock = read('package-lock.json');
if (!lock.includes('"version": "2.0.10"')) fail('package-lock must include v2.0.10');

const data = read('src/data.ts');
if (!data.includes("APP_VERSION = '2.0.10'")) fail('APP_VERSION must be 2.0.10');
if (!data.includes('aqua-fantasia-v2.0.10-asset-layout-polish')) fail('CACHE_NAME must use v2.0.10 cache');

const main = read('src/main.ts');
[
  "dataset.villagePolish = 'v2010-asset-layout-polish'",
  'v2010-village-clean-screen',
  'v2010-menu-full-screen',
  'v2010-right-dock-nav',
  "nav.dataset.menuDock = 'right-bottom-v2010'",
].forEach((needle) => { if (!main.includes(needle)) fail(`main.ts missing ${needle}`); });
if (main.includes('v2-legacy-bg-img')) fail('legacy village background image must be removed from renderVillage');

const village = read('src/villageWorld.ts');
[
  "stall: './assets/v209/props/seaside_stall.png'",
  "questBoard: './assets/v209/props/quest_board_large.png'",
  "arch: './assets/v209/props/crystal_arch.png'",
  "statue: './assets/v209/props/crystal_statue.png'",
  'const direction = dx < 0 ? 1 : -1;',
].forEach((needle) => { if (!village.includes(needle)) fail(`villageWorld.ts missing ${needle}`); });

const styles = read('src/styles.css');
[
  'v2.0.10 Asset/Layout Polish',
  '--v2010-dock-button',
  '.bottom-nav.v2010-right-dock-nav',
  '.runtime-menu-screen.v2010-menu-full-screen .runtime-content',
  '.v2010-village-clean-screen .v2-legacy-bg-img',
].forEach((needle) => { if (!styles.includes(needle)) fail(`styles.css missing ${needle}`); });

[
  'seaside_stall.png', 'quest_board_large.png', 'potted_palm.png', 'barrels.png',
  'coral_cluster.png', 'crystal_arch.png', 'crystal_statue.png', 'wood_bridge.png',
].forEach((name) => { if (!exists(`public/assets/v209/props/${name}`)) fail(`missing extracted prop ${name}`); });

const offline = read('public/offline.html');
if (!offline.includes('v2.0.10')) fail('offline badge must show v2.0.10');

const sw = read('public/sw.js');
if (!sw.includes('aqua-fantasia-v2.0.10-asset-layout-polish')) fail('service worker cache must use v2.0.10 cache');

const readme = read('README.md');
if (!readme.includes('# AquaFantasia v2.0.10')) fail('README title must show v2.0.10');
if (!readme.includes('우측 최하단 메뉴 도크 재점검')) fail('README must include v2.0.10 changelog');

const rootMarkdown = fs.readdirSync(root).filter((file) => file.toLowerCase().endsWith('.md'));
if (rootMarkdown.length !== 1 || rootMarkdown[0] !== 'README.md') fail('root must contain only README.md');

console.log('v2.0.10 asset layout polish validation passed');
