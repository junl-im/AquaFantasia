import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (msg) => { console.error(`v2.0.11 validation failed: ${msg}`); process.exit(1); };

const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '2.0.11') fail('package.json version must be 2.0.11');
if (!pkg.scripts.validate.includes('check-v2011-dock-build-placement-polish.mjs')) fail('validate script must use v2.0.11 checker');

const lock = read('package-lock.json');
if (!lock.includes('"version": "2.0.11"')) fail('package-lock must include v2.0.11');

const data = read('src/data.ts');
if (!data.includes("APP_VERSION = '2.0.11'")) fail('APP_VERSION must be 2.0.11');
if (!data.includes('aqua-fantasia-v2.0.11-dock-build-placement-polish')) fail('CACHE_NAME must use v2.0.11 cache');

const main = read('src/main.ts');
[
  "dataset.villagePolish = 'v2011-dock-build-placement-polish'",
  'v2011-dock-safe-screen',
  'v2011-menu-dock-screen',
  'v2011-wing-dock-nav',
  "nav.dataset.menuDock = 'right-bottom-wing-v2011'",
  "data-dock-slot=\"${screen}\"",
  "repeat(3, var(--v2011-dock-button",
].forEach((needle) => { if (!main.includes(needle)) fail(`main.ts missing ${needle}`); });
if (main.includes('v2-legacy-bg-img')) fail('legacy village background image must stay removed from renderVillage');

const village = read('src/villageWorld.ts');
[
  'private labelLayer = new Container();',
  'this.world.addChild(this.tileLayer, this.buildingLayer, this.decorationLayer, this.labelLayer, this.actorLayer',
  'setBuildTrayOpen(open: boolean, keepSelection = false)',
  'this.setBuildTrayOpen(false, true);',
  'private createBuildGhost(def: BuildDefinition',
  'label.zIndex = (building.y + building.h) * 20 + 19',
  'const direction = dx < 0 ? -1 : 1;',
].forEach((needle) => { if (!village.includes(needle)) fail(`villageWorld.ts missing ${needle}`); });

const styles = read('src/styles.css');
[
  'v2.0.11 Right-bottom wing dock',
  '--v2011-dock-button',
  '.bottom-nav.v2011-wing-dock-nav button[data-screen="village"] { grid-column: 3 !important; grid-row: 1 !important; }',
  '.bottom-nav.v2011-wing-dock-nav button[data-screen="map"] { grid-column: 3 !important; grid-row: 2 !important; }',
  'background: transparent !important',
  '.runtime-menu-screen.v2011-menu-dock-screen .runtime-content',
  '.village-world-screen.v2011-dock-safe-screen.v2-build-active .v2-village-stage',
].forEach((needle) => { if (!styles.includes(needle)) fail(`styles.css missing ${needle}`); });

[
  'seaside_stall.png', 'quest_board_large.png', 'potted_palm.png', 'barrels.png',
  'coral_cluster.png', 'crystal_arch.png', 'crystal_statue.png', 'wood_bridge.png',
].forEach((name) => { if (!exists(`public/assets/v209/props/${name}`)) fail(`missing extracted prop ${name}`); });

const offline = read('public/offline.html');
if (!offline.includes('v2.0.11') && !offline.includes('2.0.11')) fail('offline badge must show v2.0.11');

const sw = read('public/sw.js');
if (!sw.includes('aqua-fantasia-v2.0.11-dock-build-placement-polish')) fail('service worker cache must use v2.0.11 cache');

const readme = read('README.md');
if (!readme.includes('# AquaFantasia v2.0.11')) fail('README title must show v2.0.11');
if (!readme.includes('ㅢ형 우측 최하단 메뉴 도크')) fail('README must include v2.0.11 changelog');

const rootMarkdown = fs.readdirSync(root).filter((file) => file.toLowerCase().endsWith('.md'));
if (rootMarkdown.length !== 1 || rootMarkdown[0] !== 'README.md') fail('root must contain only README.md');

console.log('v2.0.11 dock/build placement polish validation passed');
