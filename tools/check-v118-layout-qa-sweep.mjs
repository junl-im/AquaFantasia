import { readFileSync } from 'node:fs';

const files = {
  styles: readFileSync('src/styles.css', 'utf8'),
  main: readFileSync('src/main.ts', 'utf8'),
  data: readFileSync('src/data.ts', 'utf8'),
  sw: readFileSync('public/sw.js', 'utf8'),
  pkg: readFileSync('package.json', 'utf8'),
  offline: readFileSync('public/offline.html', 'utf8'),
  readme: readFileSync('README.md', 'utf8'),
};

const must = [
  [files.pkg, '"version": "1.1.8"', 'package version must be 1.1.8'],
  [files.data, "APP_VERSION = '1.1.8'", 'APP_VERSION must be 1.1.8'],
  [files.data, 'aqua-fantasia-v1.1.8-layout-qa-sweep', 'data cache name must be v1.1.8'],
  [files.sw, 'aqua-fantasia-v1.1.8-layout-qa-sweep', 'service worker cache must be v1.1.8'],
  [files.offline, 'v1.1.8', 'offline page badge must be v1.1.8'],
  [files.readme, 'v1.1.8 Layout QA Sweep', 'README must document v1.1.8'],
  [files.pkg, 'check-v118-layout-qa-sweep.mjs', 'package scripts must call v118 validation'],
  [files.main, "dataset.layoutQa = 'v1118-layout-qa-sweep'", 'layout QA dataset flag is missing'],
  [files.main, 'installLayoutQaSweep()', 'layout QA installer must be called'],
  [files.main, 'repairInteractiveBounds', 'interactive bounds repair must exist'],
  [files.main, 'v1118-layout-qa-screen', 'runtime v118 screen class is missing'],
  [files.main, 'v1118-layout-qa-fishing', 'fishing v118 class is missing'],
  [files.main, 'v1118-nav-safe', 'bottom nav v118 safety class is missing'],
  [files.styles, 'v1.1.8 LAYOUT QA SWEEP', 'v1.1.8 CSS layer is missing'],
  [files.styles, 'html[data-layout-qa="v1118-layout-qa-sweep"] #app', 'v118 app cage selector is missing'],
  [files.styles, 'var(--v118-visual-width', 'v118 visual viewport variable is missing'],
  [files.styles, 'var(--v118-app-width', 'v118 app width variable is missing'],
  [files.styles, 'grid-template-columns: repeat(8, minmax(0, 1fr))', '8-slot nav grid guard is missing'],
  [files.styles, 'html.v118-interactive-bounds-emergency', 'v118 emergency bounds selector is missing'],
  [files.styles, 'html.v118-ultra-narrow', 'ultra-narrow guard is missing'],
  [files.styles, 'html.v118-short-height', 'short-height guard is missing'],
  [files.styles, 'overflow-x: hidden !important;', 'horizontal overflow guard is missing'],
  [files.styles, 'transform: none !important;', 'transform reset guard is missing'],
];

let ok = true;
for (const [content, needle, message] of must) {
  if (!content.includes(needle)) {
    console.error(`FAIL: ${message}`);
    ok = false;
  }
}

const v118Block = files.styles.slice(files.styles.indexOf('v1.1.8 LAYOUT QA SWEEP'));
if (!/\.bottom-nav\.v840-bottom-nav[\s\S]*?var\(--v118-visual-width[\s\S]*?var\(--v118-app-width[\s\S]*?width:\s*auto !important;[\s\S]*?grid-template-columns:\s*repeat\(8, minmax\(0, 1fr\)\) !important;[\s\S]*?transform:\s*none !important;/m.test(v118Block)) {
  console.error('FAIL: v1.1.8 bottom nav must use measured visual/app viewport math, auto width, 8 slots, transform none');
  ok = false;
}
if (!/\.runtime-menu-screen\.v1118-layout-qa-screen[\s\S]*?overflow-y:\s*auto !important;[\s\S]*?overflow-x:\s*hidden !important;[\s\S]*?touch-action:\s*pan-y !important;/m.test(v118Block)) {
  console.error('FAIL: v1.1.8 menu scroll containment is missing');
  ok = false;
}
if (!/\.fishing-screen\.v1118-layout-qa-fishing \.catch-result-card[\s\S]*?max-height:[\s\S]*?overflow:\s*hidden auto !important;/m.test(v118Block)) {
  console.error('FAIL: v1.1.8 fishing result bounds guard is missing');
  ok = false;
}
if (/\.svg/i.test(files.main + files.styles + files.data)) {
  console.error('FAIL: no SVG/vector asset references may be added');
  ok = false;
}
if (!ok) process.exit(1);
console.log('v1.1.8 layout QA sweep checks passed');
