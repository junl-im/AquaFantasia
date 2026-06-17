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
const lock = JSON.parse(read('package-lock.json'));
const data = read('src/data.ts');
const main = read('src/main.ts');
const css = read('src/styles.css');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const readme = read('README.md');

assert(pkg.version.startsWith('1.1.') && Number(pkg.version.split('.')[2] ?? 0) >= 12, 'package version keeps v1.1.12+ lineage');
assert(lock.version === pkg.version && lock.packages?.['']?.version === pkg.version, 'package-lock root version follows package version');
assert(data.includes(`APP_VERSION = '${pkg.version}'`), 'APP_VERSION follows package version');
assert(data.includes(`aqua-fantasia-v${pkg.version}-`) || data.includes('aqua-fantasia-v1.1.12-content-flow-engine-qa'), 'data cache keeps v1.1.12+ lineage');
assert(sw.includes(`aqua-fantasia-v${pkg.version}-`) || sw.includes('aqua-fantasia-v1.1.12-content-flow-engine-qa'), 'service worker cache keeps v1.1.12+ lineage');
assert(offline.includes(`v${pkg.version}`) || offline.includes('v1.1.12'), 'offline page badge keeps v1.1.12+ lineage');
assert(readme.includes('v1.1.12 Content Flow Engine QA') || readme.includes('v1.1.13 Detail Stability QA'), 'README documents v1.1.12+ lineage');
assert(main.includes("dataset.contentFlowEngine = 'v1112-content-flow-engine-qa'"), 'v1.1.12 dataset is wired');
assert(main.includes('installContentFlowEngineQaPass'), 'content flow QA installer is wired');
assert(main.includes('repairScrollableContentFlow'), 'scrollable content repair is wired');
assert(main.includes('scheduleContentFlowRepair(root)'), 'bottom nav schedules content flow repair');
assert(main.includes('goals.map((goal)'), 'all missions are rendered instead of slicing the list');
assert(!main.includes('goals.slice(0, 12)'), 'mission list is not truncated to 12');
assert(!main.includes(".slice(0, 18).map((fish)"), 'dex list is not truncated to 18 cards');
assert(main.includes('const uniqueCaught = Object.keys(this.save.caught)'), 'unlock logic uses unique catch count');
assert(main.includes('uniqueCaught >= 5') && main.includes('uniqueCaught >= 10') && main.includes('uniqueCaught >= 14'), 'late region unlocks use unique catch gates');
assert((main.includes('const sx = w * 0.78') && main.includes('const ex = w * 0.40')) || (main.includes('const sx = w * 0.82') && main.includes('const ex = w * 0.34')), 'Pixi cast path throws from right to left');
assert((main.includes('h * 0.39') && main.includes('w - playerScaledW * 0.30')) || (main.includes('h * 0.34') && main.includes('w - playerScaledW * 0.18')), 'Pixi fisher is smaller and right anchored');
assert(css.includes('v1.1.12 CONTENT FLOW / ENGINE QA PASS'), 'v1.1.12 CSS block exists');
assert(css.includes('data-content-flow-engine="v1112-content-flow-engine-qa"'), 'v1.1.12 CSS dataset selectors exist');
assert(css.includes('--v1112-scroll-bottom-space'), 'dynamic scroll bottom spacing variable exists');
assert(css.includes('overflow-y: auto !important'), 'menu screens keep vertical scrolling enabled');
assert(css.includes('max-height: none !important') && css.includes('overflow-y: visible !important'), 'nested content lists do not trap vertical scroll');
assert(css.includes('fallbackCastLeftward'), 'HTML fallback cast animation is leftward');
assert(css.includes('background-image: url(\'/assets/v92/ui/button_mid_gold.png\')'), 'gold money/free button styling remains image based');
assert(css.includes('background-image: url(\'/assets/v92/ui/button_mid_aqua.png\')'), 'cyan action button styling remains image based');
assert(css.includes('.mission-card.runtime-mission-card'), 'mission card overlap guard exists');
assert(css.includes('.dex-grid.runtime-dex-grid'), 'dex full-grid guard exists');
assert(exists('public/assets/v1110/home/village_islands_user_bg.webp'), 'uploaded village background remains present');
assert(!css.includes('.svg') && !main.includes('.svg') && !data.includes('.svg'), 'no SVG/vector references added');

const swCheck = spawnSync(process.execPath, ['--check', path.join(root, 'public/sw.js')], { encoding: 'utf8' });
assert(swCheck.status === 0, 'service worker syntax is valid');

if (process.exitCode) process.exit(process.exitCode);
console.log('v1.1.12 content flow engine QA checks passed');
