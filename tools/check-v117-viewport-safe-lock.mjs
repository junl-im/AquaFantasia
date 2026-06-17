import { readFileSync } from 'node:fs';

const files = {
  styles: readFileSync('src/styles.css', 'utf8'),
  main: readFileSync('src/main.ts', 'utf8'),
  data: readFileSync('src/data.ts', 'utf8'),
  sw: readFileSync('public/sw.js', 'utf8'),
  pkg: readFileSync('package.json', 'utf8'),
  offline: readFileSync('public/offline.html', 'utf8'),
};

const must = [
  [files.data, "APP_VERSION = '1.1.7'", 'APP_VERSION must be 1.1.7'],
  [files.data, 'aqua-fantasia-v1.1.7-viewport-safe-lock', 'CACHE_NAME must be v1.1.7 viewport safe lock'],
  [files.sw, 'aqua-fantasia-v1.1.7-viewport-safe-lock', 'Service worker cache must be v1.1.7'],
  [files.offline, 'v1.1.7', 'Offline page version badge must be v1.1.7'],
  [files.pkg, '"version": "1.1.7"', 'package version must be 1.1.7'],
  [files.pkg, 'check-v117-viewport-safe-lock.mjs', 'package scripts must call v117 validation'],
  [files.main, "dataset.viewportSafe = 'v1117-viewport-safe-lock'", 'viewport safe dataset flag is missing'],
  [files.main, 'installViewportSafeLock()', 'viewport safe installer must be called'],
  [files.main, 'applyViewportSafeGuards(root, nav)', 'runtime screens must apply viewport guards'],
  [files.main, 'repairBottomNavBounds', 'bottom nav runtime bounds repair is missing'],
  [files.main, 'repairScreenBounds', 'screen runtime bounds repair is missing'],
  [files.main, 'v1117-viewport-safe-screen', 'runtime v117 screen class is missing'],
  [files.main, 'v1117-viewport-safe-fishing', 'fishing v117 class is missing'],
  [files.styles, 'v1.1.7 VIEWPORT SAFE LOCK', 'v1.1.7 CSS layer is missing'],
  [files.styles, 'html[data-viewport-safe="v1117-viewport-safe-lock"] #app', 'v117 app cage selector is missing'],
  [files.styles, 'var(--v117-app-width', 'v117 app width variable is missing'],
  [files.styles, 'calc((100vw - var(--v117-app-width, 100vw)) / 2', 'v117 nav app-centered inset is missing'],
  [files.styles, 'grid-template-columns: repeat(8, minmax(0, 1fr))', '8-slot nav grid guard is missing'],
  [files.styles, 'html.v117-nav-bounds-emergency', 'runtime emergency nav class selector is missing'],
  [files.styles, 'transform: none !important;', 'transform reset guard is missing'],
  [files.styles, 'overflow-x: hidden !important;', 'horizontal overflow guard is missing'],
];

let ok = true;
for (const [content, needle, message] of must) {
  if (!content.includes(needle)) {
    console.error(`FAIL: ${message}`);
    ok = false;
  }
}

const v117Block = files.styles.slice(files.styles.indexOf('v1.1.7 VIEWPORT SAFE LOCK'));
if (!/\.bottom-nav\.v840-bottom-nav[\s\S]*?left:\s*max\(4px,[\s\S]*?right:\s*max\(4px,[\s\S]*?width:\s*auto !important;[\s\S]*?transform:\s*none !important;/m.test(v117Block)) {
  console.error('FAIL: v1.1.7 bottom nav must use app-centered left/right, auto width, transform none');
  ok = false;
}
if (!/@media \(min-width: 540px\)[\s\S]*?\.bottom-nav\.v840-bottom-nav[\s\S]*?width:\s*auto !important;[\s\S]*?transform:\s*none !important;/m.test(v117Block)) {
  console.error('FAIL: v1.1.7 tablet portrait override must not reintroduce translate centering');
  ok = false;
}
if (!/\.runtime-menu-screen\.swipe-route-peek[\s\S]*?transform:\s*none !important;/m.test(v117Block)) {
  console.error('FAIL: v1.1.7 swipe drift guard is missing');
  ok = false;
}
if (!/\.fishing-screen \.catch-result-card[\s\S]*?max-height:[\s\S]*?overflow:\s*hidden auto !important;/m.test(v117Block)) {
  console.error('FAIL: v1.1.7 catch result viewport bound is missing');
  ok = false;
}
if (/\.svg/i.test(files.main + files.styles + files.data)) {
  console.error('FAIL: no SVG/vector asset references may be added');
  ok = false;
}
if (!ok) process.exit(1);
console.log('v1.1.7 viewport safe lock checks passed');
