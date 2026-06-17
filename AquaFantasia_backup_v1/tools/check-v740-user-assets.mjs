import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const fail = (msg) => { console.error(`[check-v740] ${msg}`); process.exit(1); };
const text = (p) => { const f = path.join(root,p); if (!fs.existsSync(f)) fail(`missing ${p}`); return fs.readFileSync(f,'utf8'); };
const exists = (p) => { if (!fs.existsSync(path.join(root,p))) fail(`missing ${p}`); };
const data = text('src/data.ts');
const main = text('src/main.ts');
const css = text('src/styles.css');
const sw = text('public/sw.js');
const pkg = JSON.parse(text('package.json'));
if (pkg.version !== '7.4.0') fail('package version mismatch');
if (!data.includes("APP_VERSION = '7.4.0'")) fail('APP_VERSION mismatch');
if (!data.includes('aqua-fantasia-v7.4.0-user-asset-pack')) fail('cache name mismatch in data');
if (!sw.includes('aqua-fantasia-v7.4.0-user-asset-pack')) fail('cache name mismatch in sw');
for (const p of [
  'public/assets/screens/start_screen_clean_v740.webp',
  'public/assets/screens/start_screen_clean_v740.png',
  'public/assets/ui/v740_keep_on.png',
  'public/assets/ui/v740_keep_off.png',
  'public/assets/ui/v740_button_gold.png',
  'public/assets/ui/v740_button_aqua.png',
  'public/assets/ui/v740_button_purple.png',
  'public/assets/ui/v740_panel_blue.png',
  'public/assets/ui/v740_card_slot.png',
  'public/assets/ui/v740_modal_shell.png',
  'public/assets/ui/v740_nav_shell.png',
  'public/assets/ui/v740_bite_banner.png',
  'public/assets/ui/v740_reel_panel.png',
  'public/assets/ui/v740_combo_badge.png',
  'public/assets/art/bg_user_ocean.webp',
  'public/assets/art/bg_user_lake.webp',
  'public/assets/art/bg_user_harbor.webp',
  'public/assets/art/bg_user_river.webp',
  'public/assets/art/bg_user_stream.webp',
  'public/assets/art/bg_user_deep.webp',
  'public/assets/reference/user_ui_frames_sheet_v740.png',
  'public/assets/reference/user_icons_effects_sheet_v740.png',
  'public/assets/reference/user_fish_sheet_v740.png',
  'public/assets/reference/user_character_background_sheet_v740.png',
  'reports/v7.4.0-user-asset-pack-audit.md'
]) exists(p);
for (let i=1;i<=44;i++) exists(`public/assets/dex/v740_fish_${String(i).padStart(2,'0')}.png`);
for (const token of ['start_screen_clean_v740.webp','v740-keep-toggle','업로드 에셋 기반 투명 PNG 물고기 사용']) if (!main.includes(token)) fail(`main missing ${token}`);
for (const token of ['v7.4.0 USER ASSET PACK INTEGRATION','v740_button_gold.png','v740_keep_on.png','v740_card_slot.png','v740_bite_banner.png']) if (!css.includes(token)) fail(`css missing ${token}`);
for (const token of ['bg_user_ocean.webp','v740_fish_01.png','v740_fish_20.png','v740_fish_35.png']) if (!data.includes(token)) fail(`data missing ${token}`);
for (const token of ['start_screen_clean_v740.webp','v740_button_gold.png','v740_fish_44.png','user_fish_sheet_v740.png']) if (!sw.includes(token)) fail(`sw missing ${token}`);
console.log('[check-v740] User asset pack integration OK');
console.log(JSON.stringify({ ok: true, mode: process.argv.includes('--audit') ? 'audit' : process.argv.includes('--runtime') ? 'runtime' : 'validate', version: '7.4.0' }, null, 2));
