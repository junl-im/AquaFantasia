import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const fail = (msg) => { console.error(`[check-v820] ${msg}`); process.exit(1); };
const text = (p) => { const f = path.join(root, p); if (!fs.existsSync(f)) fail(`missing ${p}`); return fs.readFileSync(f, 'utf8'); };
const exists = (p) => { if (!fs.existsSync(path.join(root, p))) fail(`missing ${p}`); };
const data = text('src/data.ts');
const main = text('src/main.ts');
const css = text('src/styles.css');
const sw = text('public/sw.js');
const pkg = JSON.parse(text('package.json'));
if (pkg.version !== '8.2.0') fail('package version mismatch');
if (!data.includes("APP_VERSION = '8.2.0'")) fail('APP_VERSION mismatch');
if (!data.includes('aqua-fantasia-v8.2.0-v13-tab-composition')) fail('cache name mismatch in data');
if (!sw.includes('aqua-fantasia-v8.2.0-v13-tab-composition')) fail('cache name mismatch in sw');
for (const p of [
  'public/assets/v13/compositions/town.webp',
  'public/assets/v13/compositions/fishing.webp',
  'public/assets/v13/compositions/gear.webp',
  'public/assets/v13/compositions/inventory.webp',
  'public/assets/v13/compositions/dex.webp',
  'public/assets/v13/compositions/shop.webp',
  'public/assets/v13/compositions/mission.webp',
  'public/assets/v13/compositions/ranking.webp',
  'public/assets/v13/reference/tab_ui_layout_map.json',
  'public/assets/v13/reference/UI_LAYOUT_GUIDE_KO.md',
  'public/assets/v12/screens/start_screen_clean_v810.webp',
  'public/assets/v12/buttons/btn_mint_normal_wide_blank.webp',
  'public/assets/v12/bg/ocean_portrait.webp',
  'public/assets/v12/icons/bobber.png'
]) exists(p);
for (const token of [
  'v13-screen', 'v13-bg', 'v13-hot-layer', 'v13-bottom-nav-hotspots', 'v13-fishing-stage', 'V13_BG',
  "screen === 'inventory'", "screen === 'ranking'", "renderInventory", "renderRanking"
]) {
  if (!css.includes(token) && !main.includes(token)) fail(`missing token ${token}`);
}
for (const tab of ['village', 'fishing', 'gear', 'inventory', 'dex', 'shop', 'mission', 'ranking']) {
  if (!main.includes(`${tab}: './assets/v13/compositions/`) && !main.includes(`createV13Screen('${tab}')`)) fail(`missing v13 tab ${tab}`);
}
if (!main.includes('v810-keep-button') || !css.includes('hit-keep.v810-keep-button')) fail('visible keep-login button override missing');
console.log('[check-v820] v13 tab composition UI + start keep button OK');
console.log(JSON.stringify({ ok: true, version: '8.2.0' }, null, 2));
