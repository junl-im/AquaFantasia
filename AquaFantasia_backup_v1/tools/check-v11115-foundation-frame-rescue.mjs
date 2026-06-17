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

assert(pkg.version === '1.1.15', 'package version is v1.1.15');
assert(lock.version === pkg.version && lock.packages?.['']?.version === pkg.version, 'package-lock root version matches package version');
assert(data.includes("APP_VERSION = '1.1.15'"), 'APP_VERSION is v1.1.15');
assert(data.includes('aqua-fantasia-v1.1.15-foundation-frame-rescue'), 'data cache is v1.1.15');
assert(sw.includes('aqua-fantasia-v1.1.15-foundation-frame-rescue'), 'service worker cache is v1.1.15');
assert(offline.includes('v1.1.15'), 'offline page badge is v1.1.15');
assert(readme.includes('v1.1.15 Foundation Frame Rescue'), 'README documents v1.1.15');
assert(main.includes("dataset.foundationFrameRescue = 'v11115-foundation-frame-rescue'"), 'foundation frame dataset is wired');
assert(main.includes('v11115-foundation-frame-screen'), 'menu screen foundation class is wired');
assert(main.includes('v11115-foundation-frame-fishing'), 'fishing foundation class is wired');
assert(main.includes('v11115-keep-toggle'), 'login keep toggle has v1.1.15 class');
assert(main.includes('v11115-village-bg-img') && main.includes('village_islands_user_bg.png'), 'village user background is inserted as a real image layer with png fallback');
assert(main.includes("homeBg: './assets/v1110/home/village_islands_user_bg.webp'") && main.includes('village_islands_user_bg.png'), 'uploaded village background is primary with png fallback');
assert(main.includes('playerTargetH = Math.min(h * 0.34') && main.includes('w * 0.34, h * 0.57'), 'fishing character/bobber layout is shifted right-character to left-water');
assert(main.includes('const sx = w * 0.82') && main.includes('const ex = w * 0.34'), 'Pixi cast path throws from right toward left');
assert(main.includes('v11115-left-splash'), 'splash uses left-water class');
assert(css.includes('v1.1.15 FOUNDATION FRAME RESCUE'), 'v1.1.15 CSS block exists');
assert(css.includes('data-foundation-frame-rescue="v11115-foundation-frame-rescue"'), 'v1.1.15 CSS dataset selectors exist');
assert(css.includes('.v11115-village-bg-img') && css.includes('object-fit: cover'), 'village background is forced visible and covering');
assert(css.includes('.v108-home-banner.v1110-home-banner') && css.includes('scaleX(1.08)'), 'home banner width is expanded without tall-only stretching');
assert(css.includes('.hit-keep.v11115-keep-toggle') && css.includes('color: #fff'), 'login keep text is white and sharpened');
assert(css.includes('panel_medium_aqua.png') && css.includes('--v11115-frame-radius'), 'aquatic frame corner layer is present');
assert(css.includes('.mission-card.runtime-mission-card') && css.includes("grid-template-areas: 'copy button' 'progress progress'"), 'mission tab layout is reset and not side-pushed');
assert(css.includes('v11115FallbackCastLeft') && css.includes('v11115CastTrailLeft'), 'HTML fallback and FX cast leftward animations exist');
assert(css.includes('overflow: hidden !important') && css.includes('contain: paint !important'), 'fishing playfield clips broken effects');
assert(exists('public/assets/v1110/home/village_islands_user_bg.png'), 'uploaded village PNG asset exists');
assert(exists('public/assets/v1110/home/village_islands_user_bg.webp'), 'uploaded village WebP asset remains present');
assert(!css.includes('.svg') && !main.includes('.svg') && !data.includes('.svg'), 'no SVG/vector references added');

const swCheck = spawnSync(process.execPath, ['--check', path.join(root, 'public/sw.js')], { encoding: 'utf8' });
assert(swCheck.status === 0, 'service worker syntax is valid');

if (process.exitCode) process.exit(process.exitCode);
console.log('v1.1.15 foundation frame rescue checks passed');
