import { readFileSync, existsSync } from 'node:fs';

const args = new Set(process.argv.slice(2));
const read = (path) => readFileSync(path, 'utf8');
const fail = (msg) => { console.error(`[v1.0.3-check] ${msg}`); process.exit(1); };

const pkg = JSON.parse(read('package.json'));
const css = read('src/styles.css');
const main = read('src/main.ts');
const data = read('src/data.ts');
const sw = read('public/sw.js');

if (pkg.version !== '1.0.3') fail(`package version must be 1.0.3, got ${pkg.version}`);
if (!data.includes("APP_VERSION = '1.0.3'")) fail('APP_VERSION not updated to 1.0.3');
if (!data.includes('aqua-fantasia-v1.0.3-ui-cleanup-polish')) fail('CACHE_NAME not updated to v1.0.3');
if (!sw.includes('aqua-fantasia-v1.0.3-ui-cleanup-polish')) fail('service worker cache not updated to v1.0.3');
if (!main.includes('v103-ui-cleanup-screen')) fail('runtime menu v103 class missing');
if (!main.includes('v103-ui-cleanup-fishing')) fail('fishing v103 class missing');
if (!main.includes("dataset.visualPolish = 'v103-ui-cleanup-polish'")) fail('visualPolish dataset not updated');

const requiredCss = [
  'v1.0.3 UI CLEANUP POLISH LAYER',
  '--v103-nav-height',
  'v103-ui-cleanup-screen',
  'v103-ui-cleanup-fishing',
  'button_mid_aqua_normal.png',
  'button_mid_gold_normal.png',
  'bottom_nav_frame_clean.png',
  'line-clamp',
  'grid-template-columns: clamp(50px, 13vw, 60px) minmax(0, 1fr) minmax(54px, 78px)',
  'grid-template-columns: minmax(0, 1fr) minmax(74px, 92px)',
];
for (const token of requiredCss) {
  if (!css.includes(token)) fail(`CSS missing token: ${token}`);
}

const requiredAssets = [
  'public/assets/v102/ui/bottom_nav_frame_clean.png',
  'public/assets/v3d_underwater/ui/frames/card_aqua.png',
  'public/assets/v3d_underwater/ui/frames/panel_medium_aqua.png',
  'public/assets/v3d_underwater/ui/buttons/button_mid_aqua_normal.png',
  'public/assets/v3d_underwater/ui/buttons/button_mid_gold_normal.png',
  'public/assets/v3d_underwater/ui/frames/progress_frame_aqua.png',
];
for (const asset of requiredAssets) {
  if (!existsSync(asset)) fail(`required runtime asset missing: ${asset}`);
}

if (args.has('--runtime')) {
  if (!css.includes('contain: layout paint')) fail('runtime containment rule missing');
  if (!css.includes('overflow: hidden !important')) fail('overflow guard missing');
}
if (args.has('--audit')) {
  const forbiddenDocs = ['CLEAN_REPLACE_GUIDE_', 'FINAL_CONSOLIDATED_', 'PATCH_NOTES_'];
  const rootFiles = ['README.md'];
  for (const doc of forbiddenDocs) {
    if (rootFiles.some((file) => file.includes(doc))) fail(`forbidden doc marker leaked: ${doc}`);
  }
}
console.log('[v1.0.3-check] UI cleanup polish checks passed');
