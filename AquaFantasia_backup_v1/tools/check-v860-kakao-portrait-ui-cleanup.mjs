import fs from 'node:fs';
const read = (file) => fs.readFileSync(file, 'utf8');
const exists = (file) => fs.existsSync(file);
const fail = (msg) => { console.error(`[check-v860] ${msg}`); process.exit(1); };
const data = read('src/data.ts');
const guard = read('src/core/PortraitGuard.ts');
const main = read('src/main.ts');
const css = read('src/styles.css');
const sw = read('public/sw.js');
const manifest = JSON.parse(read('public/manifest.webmanifest'));
const pkg = JSON.parse(read('package.json'));
const tests = [
  [pkg.version === '8.6.0', 'package version must be 8.6.0'],
  [data.includes("APP_VERSION = '8.6.0'"), 'APP_VERSION must be 8.6.0'],
  [data.includes('aqua-fantasia-v8.6.0-kakao-portrait-ui-cleanup'), 'cache name must be v8.6.0'],
  [manifest.display === 'standalone', 'manifest display must be standalone, not fullscreen'],
  [manifest.orientation === 'portrait-primary', 'manifest must keep portrait-primary orientation'],
  [!guard.includes('requestFullscreen('), 'PortraitGuard must not call requestFullscreen'],
  [!guard.includes('screen.orientation') && !guard.includes('orientation.lock'), 'PortraitGuard must not call screen.orientation.lock'],
  [guard.includes("dataset.fullscreenApi = 'disabled'"), 'fullscreen API disabled marker missing'],
  [guard.includes("dataset.orientationApi = 'disabled'"), 'orientation API disabled marker missing'],
  [main.includes('v13-bottom-nav-cleaner'), 'v13 baked bottom nav cleaner must be mounted'],
  [css.includes('v8.6.0 KAKAO PORTRAIT + UI EDGE CLEANUP'), 'v8.6 CSS cleanup layer missing'],
  [css.includes('/assets/v86/ui/bottom_nav_clean.png'), 'bottom nav must use v86 clean frame'],
  [css.includes('/assets/v86/ui/recent_panel_clean.png'), 'recent catch must use v86 clean panel'],
  [css.includes('grid-template-columns: repeat(8'), 'bottom nav must align eight tabs'],
  [sw.includes('aqua-fantasia-v8.6.0-kakao-portrait-ui-cleanup'), 'service worker cache must be v8.6.0'],
  [sw.includes('./assets/v86/ui/bottom_nav_clean.png'), 'service worker must precache v86 nav assets'],
];
for (const file of [
  'public/assets/v86/ui/bottom_nav_clean.png',
  'public/assets/v86/ui/recent_panel_clean.png',
  'public/assets/v86/ui/reel_panel_clean.png',
  'public/assets/v86/ui/tab_blue.png',
  'public/assets/v86/ui/tab_gold.png',
]) tests.push([exists(file), `missing ${file}`]);
const failures = tests.filter(([ok]) => !ok).map(([, label]) => label);
if (failures.length) { for (const f of failures) console.error(' -', f); process.exit(1); }
console.log('[check-v860] Kakao no-fullscreen portrait + UI edge cleanup OK');
console.log(JSON.stringify({ ok: true, version: '8.6.0', mode: process.argv.includes('--audit') ? 'audit' : process.argv.includes('--runtime') ? 'runtime' : 'validate' }, null, 2));
