import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const fail = (msg) => { console.error(`[check-v810] ${msg}`); process.exit(1); };
const text = (p) => { const f = path.join(root,p); if (!fs.existsSync(f)) fail(`missing ${p}`); return fs.readFileSync(f,'utf8'); };
const exists = (p) => { if (!fs.existsSync(path.join(root,p))) fail(`missing ${p}`); };
const data = text('src/data.ts');
const main = text('src/main.ts');
const css = text('src/styles.css');
const sw = text('public/sw.js');
const pkg = JSON.parse(text('package.json'));
if (pkg.version !== '8.1.0') fail('package version mismatch');
if (!data.includes("APP_VERSION = '8.1.0'")) fail('APP_VERSION mismatch');
if (!data.includes('aqua-fantasia-v8.1.0-asset-fit-start-keep')) fail('cache name mismatch in data');
if (!sw.includes('aqua-fantasia-v8.1.0-asset-fit-start-keep')) fail('cache name mismatch in sw');
for (const p of [
  'public/assets/v12/screens/start_screen_clean_v810.webp',
  'public/assets/v12/manifest.runtime.json',
  'public/assets/v12/bg/ocean_portrait.webp','public/assets/v12/bg/lake_portrait.webp','public/assets/v12/bg/pier_portrait.webp','public/assets/v12/bg/deepsea_portrait.webp',
  'public/assets/v12/ui/panel_blank.webp','public/assets/v12/ui/frame_bottom_nav.webp','public/assets/v12/ui/slot_square.webp',
  'public/assets/v12/buttons/btn_mint_normal_wide_blank.webp','public/assets/v12/buttons/btn_gold_normal_wide_blank.webp','public/assets/v12/buttons/btn_orange_normal_wide_blank.webp',
  'public/assets/v12/characters/chibi_fisher_01.png','public/assets/v12/icons/bobber.png','public/assets/v12/icons/rod.png','public/assets/v12/icons/gear.png','public/assets/v12/icons/shop.png','public/assets/v12/icons/star_coin.png'
]) exists(p);
for (let i=1;i<=30;i++) exists(`public/assets/v12/fish/fish_${String(i).padStart(2,'0')}.png`);
for (const token of ['v810-screen','v810-keep-button','start_screen_clean_v810','btn_mint_normal_wide_blank','panel_blank.webp','base / 720']) {
  if (!css.includes(token) && !main.includes(token)) fail(`missing token ${token}`);
}
for (const token of ['./assets/v12/bg/ocean_portrait.webp','./assets/v12/fish/fish_01.png','./assets/v12/icons/rod.png']) {
  if (!data.includes(token) && !main.includes(token)) fail(`missing runtime asset reference ${token}`);
}
if (css.includes('.start-art-screen .hit-keep .keep-text { display: none !important; }') && !css.includes('.hit-keep.v810-keep-button .keep-text')) fail('keep text is still hidden without v810 override');
console.log('[check-v810] asset-fit UI + visible keep-login button OK');
console.log(JSON.stringify({ ok: true, version: '8.1.0' }, null, 2));
