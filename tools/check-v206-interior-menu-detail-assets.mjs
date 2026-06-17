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
if (pkg.version === '2.0.6') pass('package version is 2.0.6'); else fail('package version must be 2.0.6');
if (rootMarkdown.length === 1 && rootMarkdown[0] === 'README.md') pass('root docs are README.md only'); else fail(`root docs must be README.md only: ${rootMarkdown.join(', ')}`);

has('package-lock.json', '"version": "2.0.6"', 'package-lock is 2.0.6');
has('src/data.ts', "APP_VERSION = '2.0.6'", 'APP_VERSION is 2.0.6');
has('src/data.ts', 'aqua-fantasia-v2.0.6-interior-menu-detail-assets', 'data cache is v2.0.6');
has('public/sw.js', 'aqua-fantasia-v2.0.6-interior-menu-detail-assets', 'service worker cache is v2.0.6');
has('public/offline.html', 'v2.0.6', 'offline page badge is v2.0.6');
has('README.md', 'AquaFantasia v2.0.6', 'README documents v2.0.6');
has('README.md', 'v2.0.6 변경사항', 'README contains v2.0.6 changelog');
has('README.md', 'v2.0.5 변경사항', 'README still keeps v2.0.5 changelog');
has('src/main.ts', "dataset.villagePolish = 'v206-interior-menu-detail-assets'", 'v2.0.6 polish dataset is wired');
has('src/main.ts', 'v206-menu-detail-screen', 'v2.0.6 runtime menu class exists');
has('src/main.ts', 'v206-village-status', 'village summary panel markup exists');
has('src/main.ts', 'v206-inventory-dashboard', 'inventory dashboard markup exists');
has('src/main.ts', 'v206-quest-npc-board', 'quest NPC board markup exists');
has('src/main.ts', 'v206-route-ready', 'map route readiness markup exists');
has('src/main.ts', 'data-v206-interior-go-map', 'interior map action exists');
has('src/main.ts', 'data-v206-interior-go-mission', 'interior mission action exists');
has('src/main.ts', 'data-v206-interior-go-inventory', 'interior inventory action exists');
has('src/villageWorld.ts', 'v206-interior-status', 'interior status query is wired');
has('src/villageWorld.ts', 'innkeeper_happy.png', 'innkeeper portrait is wired');
has('src/villageWorld.ts', 'captain_happy.png', 'captain portrait is wired');
has('src/styles.css', 'v2.0.6 Interior & Menu Detail Asset Integration', 'v2.0.6 CSS section exists');
has('src/styles.css', 'v206-interior-menu-detail-assets', 'v2.0.6 CSS dataset selector exists');
has('src/styles.css', 'v206-route-ready', 'v2.0.6 map CSS exists');
has('src/styles.css', 'v206-interior-card', 'v2.0.6 interior CSS exists');

const requiredAssets = [
  'public/assets/v203/portraits/innkeeper_happy.png',
  'public/assets/v203/portraits/captain_happy.png',
  'public/assets/v203/portraits/guild_happy.png',
  'public/assets/v203/portraits/merchant_happy.png',
  'public/assets/v22/generated/05_Building_Interior_Inn.png',
  'public/assets/v22/generated/06_Building_Interior_Fish_Market.png',
  'public/assets/v22/generated/07_Building_Interior_Fishing_Guild.png',
  'public/assets/v22/generated/08_Building_Interior_Harbor_Office.png',
  'public/assets/v205/fishing/slot_bait.png',
  'public/assets/v205/fishing/treasure_chest.png',
];
for (const asset of requiredAssets) exists(asset, `${asset} exists`);

if (process.exitCode) process.exit(process.exitCode);
console.log('v2.0.6 interior and menu detail asset checks passed');
