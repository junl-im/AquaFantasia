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
  [files.data, 'APP_VERSION =', 'APP_VERSION must be declared'],
  [files.data, 'aqua-fantasia-v1.1.', 'CACHE_NAME must keep v1.1 lineage'],
  [files.sw, 'aqua-fantasia-v1.1.', 'Service worker cache must keep v1.1 lineage'],
  [files.offline, 'v1.1.', 'Offline page version badge must keep v1.1 lineage'],
  [files.main, "dataset.uiBounds = 'v1116-ui-bounds-polish'", 'UI bounds dataset flag is missing'],
  [files.main, 'v1116-ui-bounds-screen', 'Runtime screen class is missing'],
  [files.main, 'v1116-ui-bounds-fishing', 'Fishing screen class is missing'],
  [files.styles, 'v1.1.6 UI BOUNDS POLISH', 'v1.1.6 CSS layer is missing'],
  [files.styles, 'html[data-ui-bounds="v1116-ui-bounds-polish"] .bottom-nav.v840-bottom-nav', 'v1.1.6 bottom nav selector is missing'],
  [files.styles, 'swipe-route-peek', 'Swipe transform guard selector is missing'],
  [files.styles, 'transform: none !important;', 'Transform reset guard is missing'],
  [files.styles, 'width: auto !important;', 'Auto width guard is missing'],
  [files.styles, 'overflow-x: hidden !important;', 'Horizontal overflow guard is missing'],
  [files.styles, 'grid-template-columns: repeat(8, minmax(0, 1fr))', '8-slot nav grid guard is missing'],
  [files.pkg, 'check-v116-ui-bounds-polish.mjs', 'package scripts must call v116 validation'],
];

let ok = true;
for (const [content, needle, message] of must) {
  if (!content.includes(needle)) {
    console.error(`FAIL: ${message}`);
    ok = false;
  }
}

const v116Block = files.styles.slice(files.styles.indexOf('v1.1.6 UI BOUNDS POLISH'));
if (!/\.bottom-nav\.v840-bottom-nav[\s\S]*?left:\s*max\(4px,[\s\S]*?right:\s*max\(4px,[\s\S]*?transform:\s*none !important;[\s\S]*?width:\s*auto !important;/m.test(v116Block)) {
  console.error('FAIL: v1.1.6 nav must use inset left/right with transform none and auto width');
  ok = false;
}
if (!/\.runtime-menu-screen\.swipe-route-peek[\s\S]*?transform:\s*none !important;/m.test(v116Block)) {
  console.error('FAIL: v1.1.6 must disable menu swipe transform drift');
  ok = false;
}
if (!/\.fishing-screen \.catch-result-card[\s\S]*?max-height:[\s\S]*?overflow:\s*hidden auto !important;/m.test(v116Block)) {
  console.error('FAIL: v1.1.6 catch result card viewport bound is missing');
  ok = false;
}
if (!ok) process.exit(1);
console.log('v1.1.6 UI bounds polish checks passed');
