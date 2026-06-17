import fs from 'node:fs';

const read = (p) => fs.readFileSync(p, 'utf8');
const pass = (msg) => console.log(`PASS ${msg}`);
const fail = (msg) => {
  console.error(`FAIL ${msg}`);
  process.exitCode = 1;
};
const has = (file, needle, msg) => read(file).includes(needle) ? pass(msg) : fail(msg);
const exists = (file, msg) => fs.existsSync(file) ? pass(msg) : fail(`${msg} missing`);

const pkg = JSON.parse(read('package.json'));
const rootMarkdown = fs.readdirSync('.').filter((name) => name.endsWith('.md'));
if (pkg.version === '2.0.7') pass('package version is 2.0.7'); else fail('package version must be 2.0.7');
if (rootMarkdown.length === 1 && rootMarkdown[0] === 'README.md') pass('root docs are README.md only'); else fail(`root docs must be README.md only: ${rootMarkdown.join(', ')}`);

has('package-lock.json', '"version": "2.0.7"', 'package-lock is 2.0.7');
has('src/data.ts', "APP_VERSION = '2.0.7'", 'APP_VERSION is 2.0.7');
has('src/data.ts', 'aqua-fantasia-v2.0.7-layout-tile-bugfix', 'data cache is v2.0.7');
has('public/sw.js', 'aqua-fantasia-v2.0.7-layout-tile-bugfix', 'service worker cache is v2.0.7');
has('public/offline.html', 'v2.0.7', 'offline page badge is v2.0.7');
has('README.md', 'AquaFantasia v2.0.7', 'README documents v2.0.7');
has('README.md', 'v2.0.7 변경사항', 'README contains v2.0.7 changelog');
has('README.md', 'v2.0.6 변경사항', 'README still keeps v2.0.6 changelog');
has('src/main.ts', "dataset.villagePolish = 'v207-layout-tile-bugfix'", 'v2.0.7 polish dataset is wired');
has('src/main.ts', 'v207-menu-safe-screen', 'runtime menu safe class exists');
has('src/main.ts', 'v207-fishing-safe-screen', 'fishing safe class exists');
has('src/main.ts', 'v207-layout-bugfix-screen', 'village bugfix class exists');
has('src/villageWorld.ts', 'TILE_TEXTURES', 'tile texture map exists');
has('src/villageWorld.ts', 'pickTileTexture', 'tile texture picker exists');
has('src/villageWorld.ts', 'this.setActorFacing(this.player, dx)', 'player body-only facing is used');
has('src/villageWorld.ts', 'actor.body.scale.x', 'actor body scale is adjusted without label flip');
has('src/styles.css', 'v2.0.7 Layout, Fishing Gauge, Login Gap, Tile Asset Bugfix', 'v2.0.7 CSS section exists');
has('src/styles.css', 'v207-layout-tile-bugfix', 'v2.0.7 CSS dataset selector exists');
has('src/styles.css', 'reel-panel.v205-reel-panel', 'fishing reel panel safe CSS exists');
has('src/styles.css', '.start-art-screen .hit-keep', 'login keep gap CSS exists');
has('src/styles.css', 'overflow-x: hidden', 'menu overflow guard exists');

const requiredAssets = [
  'public/assets/v207/tiles/grass_tile.png',
  'public/assets/v207/tiles/grass_flower_tile.png',
  'public/assets/v207/tiles/sand_tile.png',
  'public/assets/v207/tiles/stone_tile.png',
  'public/assets/v207/tiles/plaza_tile.png',
  'public/assets/v207/tiles/water_tile.png',
];
for (const asset of requiredAssets) exists(asset, `${asset} exists`);

if (process.exitCode) process.exit(process.exitCode);
console.log('v2.0.7 layout, fishing gauge, login gap, tile asset checks passed');
