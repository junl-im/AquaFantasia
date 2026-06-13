import fs from 'node:fs';
const fail = (msg) => { console.error(`[check-v700] ${msg}`); process.exit(1); };
const must = (path) => { if (!fs.existsSync(path)) fail(`missing ${path}`); return fs.readFileSync(path, 'utf8'); };
const css = must('src/styles.css');
const main = must('src/main.ts');
const data = must('src/data.ts');
const sw = must('public/sw.js');
const pkg = JSON.parse(must('package.json'));
for (const file of [
  'public/assets/ui/v700_panel_soft.png',
  'public/assets/ui/v700_card_slot.png',
  'public/assets/ui/v700_modal_shell.png',
  'public/assets/ui/v700_header_ribbon.png',
  'public/assets/ui/v700_nav_shell.png',
  'public/assets/ui/v700_bite_banner.png',
  'public/assets/ui/v700_reel_panel.png'
]) if (!fs.existsSync(file)) fail(`missing ${file}`);
for (const token of ['v7.0.0 PREMIUM 2.5D UI POLISH PASS','v700_panel_soft.png','v700_nav_shell.png','v700_bite_banner.png','premium-bottom-nav','오늘의 출항','장비 관리','바다 상점','물고기 도감']) {
  if (!css.includes(token) && !main.includes(token)) fail(`missing UI polish token ${token}`);
}
if (!data.includes("APP_VERSION = '7.1.0'") || !data.includes('aqua-fantasia-v7.1.0-ui-dex-polish')) fail('v7 data/cache missing');
if (!sw.includes('aqua-fantasia-v7.1.0-ui-dex-polish') || !sw.includes('v700_panel_soft.png')) fail('service worker v7 UI assets missing');
if (pkg.version !== '7.1.0') fail('package version must be 7.1.0');
console.log('[check-v700] Premium 2.5D UI polish OK');
