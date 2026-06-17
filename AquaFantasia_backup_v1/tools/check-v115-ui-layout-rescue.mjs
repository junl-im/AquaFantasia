import { readFileSync } from 'node:fs';

const files = {
  styles: readFileSync('src/styles.css', 'utf8'),
  main: readFileSync('src/main.ts', 'utf8'),
  data: readFileSync('src/data.ts', 'utf8'),
  sw: readFileSync('public/sw.js', 'utf8'),
  pkg: readFileSync('package.json', 'utf8'),
};

const must = [
  [files.data, 'APP_VERSION =', 'APP_VERSION must be declared'],
  [files.data, 'aqua-fantasia-v1.1.', 'CACHE_NAME must keep v1.1 lineage'],
  [files.sw, 'aqua-fantasia-v1.1.', 'Service worker cache must keep v1.1 lineage'],
  [files.main, "dataset.layoutRescue = 'v1115-ui-layout-rescue'", 'Layout rescue dataset flag is missing'],
  [files.main, 'v1115-layout-rescue-screen', 'Runtime screen class is missing'],
  [files.main, 'v1115-layout-rescue-fishing', 'Fishing screen class is missing'],
  [files.styles, 'v1.1.5 UI LAYOUT RESCUE HOTFIX', 'v1.1.5 CSS layer is missing'],
  [files.styles, 'html[data-layout-rescue="v1115-ui-layout-rescue"] .bottom-nav.v840-bottom-nav', 'v1.1.5 bottom nav selector is missing'],
  [files.styles, 'transform: none !important;', 'Bottom nav transform reset guard is missing'],
  [files.styles, 'width: auto !important;', 'Bottom nav auto width guard is missing'],
  [files.styles, 'overflow-y: auto !important;', 'Scroll screen overflow recovery is missing'],
  [files.pkg, 'check-v115-ui-layout-rescue.mjs', 'package scripts must call v115 validation'],
];

let ok = true;
for (const [content, needle, message] of must) {
  if (!content.includes(needle)) {
    console.error(`FAIL: ${message}`);
    ok = false;
  }
}

if (/\.bottom-nav\.v840-bottom-nav\s*\{[^}]*left:\s*max\([^}]*right:\s*max\([^}]*max-width:\s*calc\(100vw - 12px\)[^}]*\}/s.test(files.styles) && !files.styles.includes('v1.1.5 UI LAYOUT RESCUE HOTFIX')) {
  console.error('FAIL: v1.1.4 nav drift rule exists without v1.1.5 rescue layer');
  ok = false;
}

if (!ok) process.exit(1);
console.log('v1.1.5 UI layout rescue checks passed');
