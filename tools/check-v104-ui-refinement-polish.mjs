import { readFileSync, existsSync } from 'node:fs';

const args = new Set(process.argv.slice(2));
const read = (path) => readFileSync(path, 'utf8');
const fail = (msg) => { console.error(`[v1.0.4-check] ${msg}`); process.exit(1); };

const pkg = JSON.parse(read('package.json'));
const css = read('src/styles.css');
const main = read('src/main.ts');
const data = read('src/data.ts');
const sw = read('public/sw.js');
const readme = read('README.md');

if (pkg.version !== '1.0.4') fail(`package version must be 1.0.4, got ${pkg.version}`);
if (!data.includes("APP_VERSION = '1.0.4'")) fail('APP_VERSION not updated to 1.0.4');
if (!data.includes('aqua-fantasia-v1.0.4-ui-refinement-polish')) fail('CACHE_NAME not updated to v1.0.4');
if (!sw.includes('aqua-fantasia-v1.0.4-ui-refinement-polish')) fail('service worker cache not updated to v1.0.4');
if (!main.includes('v104-ui-refinement-screen')) fail('runtime menu v104 class missing');
if (!main.includes('v104-ui-refinement-fishing')) fail('fishing v104 class missing');
if (!main.includes("dataset.visualPolish = 'v104-ui-refinement-polish'")) fail('visualPolish dataset not updated');
if (!readme.includes('v1.0.4 UI Refinement Polish')) fail('README version summary missing');

const requiredCss = [
  'v1.0.4 UI REFINEMENT POLISH',
  '--v104-nav-height',
  'v104-ui-refinement-screen',
  'v104-ui-refinement-fishing',
  'grid-template-areas: \'text action\' \'bar action\'',
  'runtime-menu-screen.v104-ui-refinement-screen .shop-card',
  'runtime-menu-screen.v104-ui-refinement-screen .ranking-live-card',
  'bottom-nav.v840-bottom-nav button.active::before { opacity: 0',
  'overflow-wrap: anywhere',
  '-webkit-line-clamp: 2',
];
for (const token of requiredCss) {
  if (!css.includes(token)) fail(`CSS missing token: ${token}`);
}

const requiredAssets = [
  'public/assets/v102/ui/bottom_nav_frame_clean.png',
  'public/assets/v3d_underwater/ui/frames/card_aqua.png',
  'public/assets/v3d_underwater/ui/frames/panel_medium_aqua.png',
  'public/assets/v3d_underwater/ui/buttons/button_mid_aqua_normal.png',
  'public/assets/v3d_underwater/ui/buttons/button_mid_deep_normal.png',
  'public/assets/v3d_underwater/ui/buttons/button_mid_gold_normal.png',
];
for (const asset of requiredAssets) {
  if (!existsSync(asset)) fail(`required runtime asset missing: ${asset}`);
}

if (args.has('--runtime')) {
  if (!css.includes('contain: layout paint !important')) fail('runtime containment rule missing');
  if (!css.includes('overflow: hidden !important')) fail('overflow guard missing');
  if (!css.includes('minmax(0, 1fr) minmax(70px, 88px)')) fail('mission safe action lane missing');
}
if (args.has('--audit')) {
  const forbiddenDocs = ['CLEAN_REPLACE_GUIDE_', 'FINAL_CONSOLIDATED_', 'PATCH_NOTES_'];
  for (const marker of forbiddenDocs) {
    if (readme.includes(marker)) fail(`forbidden doc marker leaked into README: ${marker}`);
  }
}
console.log('[v1.0.4-check] UI refinement polish checks passed');
