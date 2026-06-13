import fs from 'node:fs';
const fail = (msg) => { console.error(`[check-v710] ${msg}`); process.exit(1); };
const must = (path) => { if (!fs.existsSync(path)) fail(`missing ${path}`); return fs.readFileSync(path, 'utf8'); };
const css = must('src/styles.css');
const main = must('src/main.ts');
const data = must('src/data.ts');
const sw = must('public/sw.js');
const pkg = JSON.parse(must('package.json'));
for (const file of [
  'public/assets/screens/start_screen_clean_v710.webp',
  'public/assets/screens/start_screen_clean_v710.png',
  'public/assets/ui/v710_button_yellow.png',
  'public/assets/ui/v710_button_blue.png',
  'public/assets/ui/v710_button_purple.png',
  'public/assets/ui/v710_combo_ribbon.png',
  'public/assets/dex/fish_lantern_25d.png',
  'public/assets/dex/fish_orca_boss_25d.png',
  'public/assets/dex/fish_prism_25d.png'
]) if (!fs.existsSync(file)) fail(`missing ${file}`);
for (const token of ['v7.1.0 UI / UX REFINEMENT PASS','start_screen_clean_v710.webp','keep-text','home-btn','연속 성공','미발견','v710_button_yellow.png']) {
  if (!css.includes(token) && !main.includes(token)) fail(`missing token ${token}`);
}
if (!main.includes('data-go="village"') || main.includes('data-go="dex">가방')) fail('fishing top action must be village, not bag');
if (!data.includes("APP_VERSION = '7.1.0'") || !data.includes('aqua-fantasia-v7.1.0-ui-dex-polish')) fail('v7.1 data/cache missing');
if (!sw.includes('aqua-fantasia-v7.1.0-ui-dex-polish') || !sw.includes('start_screen_clean_v710.webp') || !sw.includes('v710_button_yellow.png')) fail('service worker v7.1 assets missing');
if (pkg.version !== '7.1.0') fail('package version must be 7.1.0');
console.log('[check-v710] UI/UX dex polish OK');
