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
if (pkg.version === '2.0.3') pass('package version is 2.0.3'); else fail('package version must be 2.0.3');
if (rootMarkdown.length === 1 && rootMarkdown[0] === 'README.md') pass('root docs are README.md only'); else fail(`root docs must be README.md only: ${rootMarkdown.join(', ')}`);

has('src/data.ts', "APP_VERSION = '2.0.3'", 'APP_VERSION is 2.0.3');
has('src/data.ts', 'aqua-fantasia-v2.0.3-asset-integration', 'data cache is v2.0.3');
has('public/sw.js', 'aqua-fantasia-v2.0.3-asset-integration', 'service worker cache is v2.0.3');
has('public/offline.html', 'v2.0.3', 'offline page badge is v2.0.3');
has('README.md', 'AquaFantasia v2.0.3', 'README documents v2.0.3');
has('README.md', 'v2.0.3 변경사항', 'README contains v2.0.3 changelog');
has('src/main.ts', "dataset.villagePolish = 'v203-asset-integration'", 'v2.0.3 polish dataset is wired');
has('src/main.ts', 'v203-interior-panel', 'interior overlay markup exists');
has('src/main.ts', 'nav_build.png', 'build control icon is wired');
has('src/main.ts', 'nav_fishing.png', 'fishing control icon is wired');
has('src/villageWorld.ts', 'PORTRAIT_ASSETS', 'dialogue portrait asset map exists');
has('src/villageWorld.ts', 'INTERIOR_ASSETS', 'interior asset map exists');
has('src/villageWorld.ts', 'openInterior', 'building interior opener exists');
has('src/villageWorld.ts', 'v203-dialog-portrait', 'dialogue uses portrait markup');
has('src/styles.css', 'v2.0.3 Asset Integration', 'v2.0.3 CSS section exists');
has('src/styles.css', '../assets/v203/ui/dialog_frame.png', 'dialogue frame CSS asset is used');
has('src/styles.css', '.v203-interior-panel', 'interior overlay CSS exists');

const requiredAssets = [
  'public/assets/v203/portraits/chief_portrait.png',
  'public/assets/v203/portraits/merchant_portrait.png',
  'public/assets/v203/portraits/guild_portrait.png',
  'public/assets/v203/portraits/captain_portrait.png',
  'public/assets/v203/portraits/tourist_portrait.png',
  'public/assets/v203/portraits/vip_portrait.png',
  'public/assets/v203/portraits/player_portrait.png',
  'public/assets/v203/ui/dialog_frame.png',
  'public/assets/v203/ui/popup_frame.png',
  'public/assets/v22/generated/05_Building_Interior_Inn.png',
  'public/assets/v22/generated/06_Building_Interior_Fish_Market.png',
  'public/assets/v22/generated/07_Building_Interior_Fishing_Guild.png',
  'public/assets/v22/generated/08_Building_Interior_Harbor_Office.png',
  'public/assets/v22/icons/nav_build.png',
  'public/assets/v22/icons/nav_fishing.png',
];
for (const asset of requiredAssets) exists(asset, `${asset} exists`);

if (process.exitCode) process.exit(process.exitCode);
console.log('v2.0.3 asset integration checks passed');
