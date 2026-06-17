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
if (pkg.version === '2.0.5') pass('package version is 2.0.5'); else fail('package version must be 2.0.5');
if (rootMarkdown.length === 1 && rootMarkdown[0] === 'README.md') pass('root docs are README.md only'); else fail(`root docs must be README.md only: ${rootMarkdown.join(', ')}`);

has('package-lock.json', '"version": "2.0.5"', 'package-lock is 2.0.5');
has('src/data.ts', "APP_VERSION = '2.0.5'", 'APP_VERSION is 2.0.5');
has('src/data.ts', 'aqua-fantasia-v2.0.5-fishing-minigame-assets', 'data cache is v2.0.5');
has('public/sw.js', 'aqua-fantasia-v2.0.5-fishing-minigame-assets', 'service worker cache is v2.0.5');
has('public/offline.html', 'v2.0.5', 'offline page badge is v2.0.5');
has('README.md', 'AquaFantasia v2.0.5', 'README documents v2.0.5');
has('README.md', 'v2.0.5 변경사항', 'README contains v2.0.5 changelog');
has('README.md', 'v2.0.4 변경사항', 'README still keeps v2.0.4 changelog');
has('src/main.ts', "dataset.villagePolish = 'v205-fishing-minigame-assets'", 'v2.0.5 polish dataset is wired');
has('src/main.ts', 'v205-fishing-asset-screen', 'fishing screen v2.0.5 class exists');
has('src/main.ts', 'fishing-loadout-strip', 'fishing loadout strip markup exists');
has('src/main.ts', 'v205-reel-panel', 'v2.0.5 reel panel markup exists');
has('src/main.ts', 'v205-fish-shadow', 'fish shadow markup exists');
has('src/main.ts', 'fishingGaugeHorizontal', 'horizontal gauge asset is wired');
has('src/main.ts', 'fishingGaugeVertical', 'vertical gauge asset is wired');
has('src/main.ts', 'fishingCatchWindow', 'catch window asset is wired');
has('src/main.ts', 'waiting-mode', 'waiting state class is wired');
has('src/main.ts', 'bite-mode', 'bite state class is wired');
has('src/styles.css', 'v2.0.5 Fishing Minigame Asset Integration', 'v2.0.5 CSS section exists');
has('src/styles.css', '/assets/v205/fishing/slot_rod.png', 'rod slot CSS asset is used');
has('public/sw.js', './assets/v205/fishing/gauge_horizontal.png', 'service worker precaches v2.0.5 assets');

const requiredAssets = [
  'public/assets/v205/fishing/gauge_vertical.png',
  'public/assets/v205/fishing/gauge_horizontal.png',
  'public/assets/v205/fishing/resistance_bar.png',
  'public/assets/v205/fishing/catch_window.png',
  'public/assets/v205/fishing/slot_rod.png',
  'public/assets/v205/fishing/slot_bait.png',
  'public/assets/v205/fishing/line_effect.png',
  'public/assets/v205/fishing/water_splash.png',
  'public/assets/v205/fishing/water_ripple.png',
  'public/assets/v205/fishing/fish_shadow_common.png',
  'public/assets/v205/fishing/fish_shadow_large.png',
  'public/assets/v205/fishing/pearl_reward.png',
  'public/assets/v205/fishing/treasure_chest.png',
  'public/assets/v205/fishing/alert_icon.png',
  'public/assets/v205/fishing/danger_warning.png',
];
for (const asset of requiredAssets) exists(asset, `${asset} exists`);

if (process.exitCode) process.exit(process.exitCode);
console.log('v2.0.5 fishing minigame asset checks passed');
