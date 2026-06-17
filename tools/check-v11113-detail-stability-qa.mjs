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

assert(pkg.version === '1.1.13', 'package version is v1.1.13');
assert(lock.version === '1.1.13' && lock.packages?.['']?.version === '1.1.13', 'package-lock root version is v1.1.13');
assert(data.includes("APP_VERSION = '1.1.13'"), 'APP_VERSION is v1.1.13');
assert(data.includes('aqua-fantasia-v1.1.13-detail-stability-qa'), 'data cache is v1.1.13');
assert(sw.includes('aqua-fantasia-v1.1.13-detail-stability-qa'), 'service worker cache is v1.1.13');
assert(offline.includes('v1.1.13'), 'offline page badge is v1.1.13');
assert(readme.includes('v1.1.13 Detail Stability QA'), 'README documents v1.1.13');
assert(main.includes("dataset.detailStabilityQa = 'v11113-detail-stability-qa'"), 'v1.1.13 dataset is wired');
assert(main.includes('installDetailStabilityQaPass'), 'detail stability installer is wired');
assert(main.includes('preloadCriticalImages'), 'critical image preload is wired');
assert(main.includes('repairImageFallbacks'), 'image fallback guard is wired');
assert(main.includes('scheduleDetailStabilityRepair(root)'), 'bottom nav schedules detail stability repair');
assert(main.includes('v11113-detail-stability-screen'), 'menu screen class is wired');
assert(main.includes('v11113-detail-stability-fishing'), 'fishing screen class is wired');
assert(main.includes('verticalIntent') && main.includes('absY > 18 && absY > absX * 1.18'), 'vertical scroll cancels swipe tracking');
assert(main.includes('activePointerId') && main.includes('ev.isPrimary'), 'pointer swipe guard is primary-pointer aware');
assert(main.includes('ev.touches.length > 1'), 'multi-touch swipe guard exists');
assert(main.includes("document.querySelectorAll('.touch-ring, .v930-fx, .bite-callout, .action-badge')"), 'temporary FX cleanup exists on screen clear');
assert(main.includes("addEventListener('lostpointercapture'") && main.includes("addEventListener('pointerleave'"), 'reeling input releases on pointer leave/capture loss');
assert(css.includes('v1.1.13 DETAIL STABILITY QA'), 'v1.1.13 CSS block exists');
assert(css.includes('data-detail-stability-qa="v11113-detail-stability-qa"'), 'v1.1.13 CSS dataset selectors exist');
assert(css.includes('--v11113-content-bottom'), 'dynamic v1.1.13 content bottom space exists');
assert(css.includes('--v11113-nav-height'), 'dynamic v1.1.13 nav height exists');
assert(css.includes('grid-template-columns: repeat(8, minmax(0, 1fr))'), 'bottom nav remains 8 fixed columns');
assert(css.includes('font-size: clamp(7px, 1.75vw, 9px)'), 'bottom nav labels are readable but bounded');
assert(css.includes('min-height: 40px'), 'compact buttons keep a safe touch height');
assert(css.includes('fallback-applied') || css.includes('data-v11113-fallback-applied'), 'image fallback styling exists');
assert(css.includes('pointer-events: none !important') && css.includes('.underwater-webgl-canvas'), 'water/WebGL layers cannot block touch');
assert(css.includes('overflow-y: auto !important') && css.includes('touch-action: pan-y !important'), 'menu vertical scrolling remains enabled');
assert(exists('public/assets/v1110/home/village_islands_user_bg.webp'), 'uploaded village background remains present');
assert(!css.includes('.svg') && !main.includes('.svg') && !data.includes('.svg'), 'no SVG/vector references added');

const swCheck = spawnSync(process.execPath, ['--check', path.join(root, 'public/sw.js')], { encoding: 'utf8' });
assert(swCheck.status === 0, 'service worker syntax is valid');

if (process.exitCode) process.exit(process.exitCode);
console.log('v1.1.13 detail stability QA checks passed');
