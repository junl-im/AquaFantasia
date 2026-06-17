import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (msg) => { console.error(`v2.0.9 validation failed: ${msg}`); process.exit(1); };

const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '2.0.9') fail('package.json version must be 2.0.9');
if (!pkg.scripts.validate.includes('check-v209-asset-qa-polish.mjs')) fail('validate script must use v2.0.9 checker');

const lock = read('package-lock.json');
if (!lock.includes('"version": "2.0.9"')) fail('package-lock must include v2.0.9');

const data = read('src/data.ts');
if (!data.includes("APP_VERSION = '2.0.9'")) fail('APP_VERSION must be 2.0.9');
if (!data.includes('aqua-fantasia-v2.0.9-asset-qa-polish')) fail('CACHE_NAME must use v2.0.9 cache');

const main = read('src/main.ts');
[
  "dataset.villagePolish = 'v209-asset-qa-polish'",
  'v209-asset-qa-screen',
  'v209-fishing-qa-screen',
  './assets/v209/props/shell_garden.png',
  './assets/v207/tiles/stone_tile.png',
].forEach((needle) => { if (!main.includes(needle)) fail(`main.ts missing ${needle}`); });

const village = read('src/villageWorld.ts');
[
  'DECO_TEXTURES',
  'BUILD_PROP_TEXTURES',
  './assets/v209/props/bench.png',
  './assets/v209/props/fountain_asset.png',
  'new Sprite(texture)',
].forEach((needle) => { if (!village.includes(needle)) fail(`villageWorld.ts missing ${needle}`); });

const styles = read('src/styles.css');
[
  'v2.0.9 Asset QA Polish',
  'v209-asset-qa-polish',
  '--v209-dock-button',
  '.v2-build-grid button img',
  '/assets/v209/props/shell_garden.png',
  '/assets/v209/props/dock_platform.png',
].forEach((needle) => { if (!styles.includes(needle)) fail(`styles.css missing ${needle}`); });

[
  'bench.png', 'flower_box.png', 'crystal_lamp.png', 'flag_blue.png',
  'crate_stack.png', 'dock_platform.png', 'palm_tree.png', 'fountain_asset.png',
  'shell_garden.png', 'notice_board.png'
].forEach((name) => { if (!exists(`public/assets/v209/props/${name}`)) fail(`missing extracted prop ${name}`); });

const offline = read('public/offline.html');
if (!offline.includes('v2.0.9')) fail('offline badge must show v2.0.9');

const sw = read('public/sw.js');
if (!sw.includes('aqua-fantasia-v2.0.9-asset-qa-polish')) fail('service worker cache must use v2.0.9 cache');

const readme = read('README.md');
if (!readme.includes('# AquaFantasia v2.0.9')) fail('README title must show v2.0.9');
if (!readme.includes('오브젝트 에셋 반영')) fail('README must include v2.0.9 changelog');

const rootMarkdown = fs.readdirSync(root).filter((file) => file.toLowerCase().endsWith('.md'));
if (rootMarkdown.length !== 1 || rootMarkdown[0] !== 'README.md') fail('root must contain only README.md');

console.log('v2.0.9 asset QA polish validation passed');
