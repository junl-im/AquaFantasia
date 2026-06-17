import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
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

assert(pkg.version.startsWith('1.1.'), 'package version keeps v1.1.9+ lineage');
assert(data.includes("APP_VERSION = '1.1."), 'APP_VERSION keeps v1.1.9+ lineage');
assert(data.includes('aqua-fantasia-v1.1.'), 'data cache name keeps v1.1.9+ lineage');
assert(sw.includes('aqua-fantasia-v1.1.'), 'service worker cache keeps v1.1.9+ lineage');
assert(offline.includes('v1.1.'), 'offline page badge keeps v1.1.9+ lineage');
assert(readme.includes('v1.1.9') || readme.includes('v1.1.10'), 'README documents v1.1.9+ lineage');
assert(main.includes("dataset.layoutStability = 'v1119-interaction-qa-polish'"), 'runtime layout stability dataset is wired');
assert(main.includes('installInteractionQaPolish()'), 'v1.1.9 runtime installer is wired');
assert(main.includes('repairFixedInteractiveBounds'), 'fixed interactive bounds guard exists');
assert(main.includes('--v119-visual-left'), 'visual viewport offset variables are computed');
assert(main.includes("v1119-nav-safe"), 'bottom nav v1119 safety class is applied');
assert(main.includes("right', 'auto'"), 'bottom nav JS repair no longer relies on stale right inset');
assert(!main.includes("100vw - var(--v117-app-width"), 'stale v117 100vw JS repair is removed');
assert(css.includes('v1.1.9 INTERACTION QA POLISH'), 'v1.1.9 CSS safety block exists');
assert(css.includes('data-layout-stability="v1119-interaction-qa-polish"'), 'v1.1.9 CSS dataset selectors exist');
assert(css.includes('pointer-events: none !important;') && css.includes('.underwater-webgl-canvas'), 'underwater layer cannot block UI touch');
assert(css.includes('v119-keyboard-safe'), 'keyboard/visual viewport class exists');
assert(css.includes('width: max(0px, calc(var(--v119-app-width'), 'bottom nav deterministic width lock exists');
assert(sw.includes('if (isHtml) return await caches.match(\'./offline.html\')') || sw.includes('if (isHtml) return await caches.match("./offline.html")'), 'offline fallback is limited to HTML navigation');
assert(sw.includes('return await caches.match(req) || Response.error();'), 'asset failures do not return offline HTML');
assert(!css.includes('.svg') && !main.includes('.svg') && !data.includes('.svg'), 'no SVG/vector references added');

const swCheck = spawnSync(process.execPath, ['--check', path.join(root, 'public/sw.js')], { encoding: 'utf8' });
assert(swCheck.status === 0, 'service worker syntax is valid');

if (process.exitCode) process.exit(process.exitCode);
console.log('v1.1.9 interaction QA polish checks passed');
