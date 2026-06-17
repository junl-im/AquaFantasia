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

assert(/^1\.1\.(1[4-9]|[2-9][0-9])$/.test(pkg.version), 'package version keeps v1.1.14+ button style lineage');
assert(lock.version === pkg.version && lock.packages?.['']?.version === pkg.version, 'package-lock root version matches package version');
assert(data.includes(`APP_VERSION = '${pkg.version}'`), 'APP_VERSION matches package version');
assert(data.includes('aqua-fantasia-v1.1.') && data.includes('CACHE_NAME'), 'data cache name remains versioned');
assert(sw.includes('aqua-fantasia-v1.1.') && sw.includes('CACHE_NAME'), 'service worker cache remains versioned');
assert(offline.includes(`v${pkg.version}`), 'offline page badge matches package version');
assert(readme.includes(`v${pkg.version}`) || readme.includes('v1.1.14 Button Style Hotfix'), 'README documents current lineage');
assert(main.includes("dataset.buttonStyleQa = 'v11114-button-style-hotfix'"), 'button style dataset is wired');
assert(main.includes('v11114-button-style-screen'), 'button style screen class is wired');
assert(main.includes('btn-aqua-action'), 'aqua action class is used in markup');
assert(main.includes('btn-gold-cost'), 'gold cost class is used in markup');
assert(main.includes('image-btn gold v950-price-btn compact-cost-btn btn-gold-cost'), 'gear cost buttons are explicitly gold, not soft aqua');
assert(!main.includes('image-btn soft v950-price-btn compact-cost-btn'), 'old soft cost button class is removed');
assert((main.match(/btn-aqua-action/g) ?? []).length >= 9, 'all requested action buttons receive aqua action class');
assert((main.match(/btn-gold-cost/g) ?? []).length >= 3, 'free/cost/price buttons receive gold cost class');
assert(main.includes('runtime-btn cyan compact-cta btn-aqua-action" data-mission'), 'mission card buttons use aqua action class');
assert(!main.includes("'cyan' : 'blue'"), 'mission buttons no longer mix blue/cyan by state');
assert(main.includes('this.renderMission();') && !main.includes('this.renderMission();\n    this.renderMission();'), 'duplicate mission rerender is removed');
assert(css.includes('v1.1.14 BUTTON STYLE HOTFIX'), 'v1.1.14 CSS block exists');
assert(css.includes('data-button-style-qa="v11114-button-style-hotfix"'), 'v1.1.14 CSS dataset selector exists');
assert(css.includes('--v11114-aqua-button') && css.includes('--v11114-gold-button'), 'aqua and gold button assets are defined');
assert(css.includes('.runtime-item-card .btn-aqua-action') && css.includes('width: fit-content !important'), 'inventory card buttons no longer stretch full width');
assert(css.includes('.shop-card.runtime-shop-card .shop-price.btn-gold-cost'), 'shop price badges are explicitly gold compact buttons');
assert(css.includes('.mission-card.runtime-mission-card .btn-aqua-action'), 'mission buttons are explicitly compact aqua');
assert(exists('public/assets/v3d_underwater/ui/buttons/button_mid_aqua_normal.png'), 'aqua 2.5D button asset exists');
assert(exists('public/assets/v3d_underwater/ui/buttons/button_mid_gold_normal.png'), 'gold 2.5D button asset exists');
assert(!css.includes('.svg') && !main.includes('.svg') && !data.includes('.svg'), 'no SVG/vector references added');

const swCheck = spawnSync(process.execPath, ['--check', path.join(root, 'public/sw.js')], { encoding: 'utf8' });
assert(swCheck.status === 0, 'service worker syntax is valid');

if (process.exitCode) process.exit(process.exitCode);
console.log('v1.1.14 button style hotfix checks passed');
