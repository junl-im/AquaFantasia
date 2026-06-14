import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const fail = (msg) => { console.error(`[check-v760] ${msg}`); process.exit(1); };
const text = (p) => { const f = path.join(root,p); if (!fs.existsSync(f)) fail(`missing ${p}`); return fs.readFileSync(f,'utf8'); };
const exists = (p) => { if (!fs.existsSync(path.join(root,p))) fail(`missing ${p}`); };
const data = text('src/data.ts');
const main = text('src/main.ts');
const css = text('src/styles.css');
const sw = text('public/sw.js');
const pkg = JSON.parse(text('package.json'));
if (pkg.version !== '7.6.0') fail('package version mismatch');
if (!data.includes("APP_VERSION = '7.6.0'")) fail('APP_VERSION mismatch');
if (!data.includes('aqua-fantasia-v7.6.0-nav-fixed-25d-runtime')) fail('cache name mismatch in data');
if (!sw.includes('aqua-fantasia-v7.6.0-nav-fixed-25d-runtime')) fail('cache name mismatch in sw');
for (const p of [
  'public/assets/v9/manifest.runtime.json',
  'public/assets/v9/ui/bottom_nav_bar_deepblue.png',
  'public/assets/v9/ui/panel_status_deepblue.png',
  'public/assets/v9/ui/content_panel_aqua.png',
  'public/assets/v9/ui/button_large_gold_normal.png',
  'public/assets/v9/icons/nav_fishing.png',
  'public/assets/v9/equipment/boat.png',
  'public/assets/v9/equipment/bobber.png',
  'public/assets/v9/fx/ring_aqua.png',
  'public/assets/v9/bg/ocean.webp',
  'public/assets/v9/bg/overlay_caustic.webp',
  'reports/v7.6.0-nav-fixed-25d-runtime-audit.md'
]) exists(p);
for (let i=1;i<=28;i++) exists(`public/assets/v9/fish/fish_${String(i).padStart(2,'0')}.png`);
for (const token of ['fixed-root-nav','data-fixed-root','dom.app.appendChild(nav)','fishing-guide-card',"mountBottomNav(root, 'fishing')"]) if (!main.includes(token)) fail(`main missing ${token}`);
for (const token of ['v7.6.0 FIXED ROOT NAV','position: fixed !important','bottom_nav_bar_deepblue.png','--bottom-nav-height-v760','fishing-guide-card']) if (!css.includes(token)) fail(`css missing ${token}`);
console.log('[check-v760] fixed root nav + v9 rendered runtime OK');
console.log(JSON.stringify({ ok: true, mode: process.argv.includes('--audit') ? 'audit' : process.argv.includes('--runtime') ? 'runtime' : 'validate', version: '7.6.0' }, null, 2));
