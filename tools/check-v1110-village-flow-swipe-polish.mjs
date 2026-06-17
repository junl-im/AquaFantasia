import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const assert = (condition, message) => {
  if (!condition) {
    console.error(`FAIL ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS ${message}`);
  }
};

const pkg = JSON.parse(read('package.json'));
const data = read('src/data.ts');
const main = read('src/main.ts');
const css = read('src/styles.css');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const readme = read('README.md');

assert(/^1\.1\.(1[0-9]|[2-9][0-9])$/.test(pkg.version), 'package version keeps v1.1.10+ lineage');
assert(/APP_VERSION = '1\.1\.(1[0-9]|[2-9][0-9])'/.test(data), 'APP_VERSION keeps v1.1.10+ lineage');
assert(data.includes(`aqua-fantasia-v${pkg.version}-`) || data.includes('aqua-fantasia-v1.1.10-village-flow-swipe-polish'), 'cache name keeps v1.1.10+ lineage');
assert(sw.includes(`aqua-fantasia-v${pkg.version}-`) || sw.includes('aqua-fantasia-v1.1.10-village-flow-swipe-polish'), 'service worker cache keeps v1.1.10+ lineage');
assert(offline.includes(`v${pkg.version}`) || offline.includes('v1.1.10'), 'offline page badge keeps v1.1.10+ lineage');
assert(readme.includes('v1.1.10 Village Flow Swipe Polish') || readme.includes('v1.1.11 Tech Perf Compat'), 'README documents v1.1.10+ lineage');
assert(exists('public/assets/v1110/home/village_islands_user_bg.webp'), 'uploaded village background webp exists');
assert(exists('public/assets/v1110/home/village_islands_user_bg.png'), 'uploaded village background source png exists');
assert(main.includes("homeBg: './assets/v1110/home/village_islands_user_bg.webp'"), 'village screen uses uploaded background');
assert(main.includes("dataset.villageFlow = 'v1110-village-flow-swipe-polish'"), 'v1.1.10 dataset is wired');
assert(main.includes("root.classList.add('v108-home-main', 'v1110-village-flow')"), 'village root class is wired');
assert(main.includes('v1110-home-banner'), 'home banner class is wired');
assert(main.indexOf('v1110-tide-card') < main.indexOf('v1110-region-panel'), 'today tide renders before region selection');
assert(main.includes('regions.map((item) => this.regionCard(item.key))'), 'all regions are rendered on village screen');
assert(main.includes("['village', 'gear', 'inventory', 'dex', 'shop', 'mission', 'ranking', 'fishing']"), 'swipe order matches requested tab order');
assert(data.indexOf("screen: 'village'") < data.indexOf("screen: 'gear'"), 'bottom nav starts with village then gear');
assert(data.indexOf("screen: 'ranking'") < data.indexOf("screen: 'fishing'"), 'fishing is last tab');
assert(!main.includes("[data-no-swipe], button, a, .hold-pad"), 'swipe start is not blocked by menu card buttons');
assert(main.includes('playerScaledW'), 'Pixi player is aligned by scaled width');
assert(main.includes('w - playerScaledW * 0.42') || main.includes('w - playerScaledW * 0.30') || main.includes('w - playerScaledW * 0.18'), 'Pixi player is moved to right edge safely');
assert(css.includes('v1.1.10 VILLAGE FLOW / SWIPE POLISH'), 'v1.1.10 CSS block exists');
assert(css.includes('data-village-flow="v1110-village-flow-swipe-polish"'), 'v1.1.10 CSS dataset selectors exist');
assert(/\.v1110-home-banner[\s\S]*?height:\s*var\(--v1110-home-logo-h\)[\s\S]*?transform:\s*scaleX\(1\.12\)/m.test(css), 'home logo fills width without increasing vertical height');
assert(/\.v1110-region-panel[\s\S]*?max-height:\s*none !important;[\s\S]*?overflow:\s*visible !important;/m.test(css), 'region panel can extend into page scroll');
assert(/\.v1110-region-grid[\s\S]*?max-height:\s*none !important;[\s\S]*?overflow:\s*visible !important;/m.test(css), 'region grid is not clipped internally');
assert(css.includes('touch-action: pan-y !important;'), 'vertical drag remains enabled');
assert(css.includes('.fallback-player') && css.includes('right: max(-28px, -6vw)'), 'fallback fishing character is smaller and right aligned');
assert(sw.includes('./assets/v1110/home/village_islands_user_bg.webp'), 'service worker precaches uploaded village background');
assert(sw.includes('return await caches.match(req) || Response.error();'), 'asset failures still do not return offline HTML');
assert(!css.includes('.svg') && !main.includes('.svg') && !data.includes('.svg'), 'no SVG/vector references added');

const swCheck = spawnSync(process.execPath, ['--check', path.join(root, 'public/sw.js')], { encoding: 'utf8' });
assert(swCheck.status === 0, 'service worker syntax is valid');

if (process.exitCode) process.exit(process.exitCode);
console.log('v1.1.10 village flow swipe polish checks passed');
