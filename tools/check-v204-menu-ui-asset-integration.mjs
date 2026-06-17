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
if (pkg.version === '2.0.4') pass('package version is 2.0.4'); else fail('package version must be 2.0.4');
if (rootMarkdown.length === 1 && rootMarkdown[0] === 'README.md') pass('root docs are README.md only'); else fail(`root docs must be README.md only: ${rootMarkdown.join(', ')}`);

has('package-lock.json', '"version": "2.0.4"', 'package-lock is 2.0.4');
has('src/data.ts', "APP_VERSION = '2.0.4'", 'APP_VERSION is 2.0.4');
has('src/data.ts', 'aqua-fantasia-v2.0.4-menu-ui-assets', 'data cache is v2.0.4');
has('public/sw.js', 'aqua-fantasia-v2.0.4-menu-ui-assets', 'service worker cache is v2.0.4');
has('public/offline.html', 'v2.0.4', 'offline page badge is v2.0.4');
has('README.md', 'AquaFantasia v2.0.4', 'README documents v2.0.4');
has('README.md', 'v2.0.4 변경사항', 'README contains v2.0.4 changelog');
has('src/main.ts', "dataset.villagePolish = 'v204-menu-ui-assets'", 'v2.0.4 polish dataset is wired');
has('src/types.ts', "'map'", 'map screen type exists');
has('src/storage.ts', "'map'", 'map screen is accepted by save sanitizer');
has('src/data.ts', "screen: 'map'", 'right menu map item uses map screen');
has('src/main.ts', 'private renderMap()', 'world map renderer exists');
has('src/main.ts', 'v204-map-shell', 'world map markup exists');
has('src/main.ts', 'v204-inventory-shell', 'inventory frame markup exists');
has('src/main.ts', 'v204-quest-board', 'quest board markup exists');
has('src/main.ts', 'v204-mini-map', 'village mini map markup exists');
has('src/styles.css', 'v2.0.4 Menu UI Asset Integration', 'v2.0.4 CSS section exists');
has('src/styles.css', '../assets/v203/ui/inventory_frame.png', 'inventory frame CSS asset is used');
has('src/styles.css', '../assets/v203/ui/minimap_frame.png', 'minimap frame CSS asset is used');
has('src/styles.css', '../assets/v203/ui/build_frame.png', 'quest board frame CSS asset is used');
has('src/styles.css', '../assets/v203/ui/toast_frame.png', 'HUD frame CSS asset is used');

const requiredAssets = [
  'public/assets/v203/ui/dialog_frame.png',
  'public/assets/v203/ui/popup_frame.png',
  'public/assets/v203/ui/inventory_frame.png',
  'public/assets/v203/ui/minimap_frame.png',
  'public/assets/v203/ui/build_frame.png',
  'public/assets/v203/ui/toast_frame.png',
  'public/assets/v203/portraits/player_happy.png',
  'public/assets/v22/icons/nav_bag.png',
  'public/assets/v22/icons/nav_quest.png',
  'public/assets/v22/icons/nav_map.png',
  'public/assets/v22/icons/nav_village.png',
];
for (const asset of requiredAssets) exists(asset, `${asset} exists`);

if (process.exitCode) process.exit(process.exitCode);
console.log('v2.0.4 menu UI asset integration checks passed');
