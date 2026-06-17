import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const fail = (msg) => { console.error(`[check-v800] ${msg}`); process.exit(1); };
const text = (p) => { const f = path.join(root,p); if (!fs.existsSync(f)) fail(`missing ${p}`); return fs.readFileSync(f,'utf8'); };
const exists = (p) => { if (!fs.existsSync(path.join(root,p))) fail(`missing ${p}`); };
const data = text('src/data.ts');
const main = text('src/main.ts');
const css = text('src/styles.css');
const sw = text('public/sw.js');
const pkg = JSON.parse(text('package.json'));
if (pkg.version !== '8.0.0') fail('package version mismatch');
if (!data.includes("APP_VERSION = '8.0.0'")) fail('APP_VERSION mismatch');
if (!data.includes('aqua-fantasia-v8.0.0-ui-asset-rebuild')) fail('cache name mismatch in data');
if (!sw.includes('aqua-fantasia-v8.0.0-ui-asset-rebuild')) fail('cache name mismatch in sw');
for (const p of [
  'public/assets/v9/bg/ocean.webp','public/assets/v9/bg/lake.webp','public/assets/v9/bg/stream.webp','public/assets/v9/bg/deepsea.webp',
  'public/assets/v9/equipment/boat.png','public/assets/v9/equipment/rod.png','public/assets/v9/equipment/reel.png','public/assets/v9/equipment/line.png','public/assets/v9/equipment/bait.png',
  'public/assets/v9/icons/nav_village.png','public/assets/v9/icons/nav_fishing.png','public/assets/v9/icons/nav_gear.png','public/assets/v9/icons/nav_shop.png',
  'reports/v8.0.0-ui-asset-rebuild-audit.md'
]) exists(p);
for (let i=1;i<=29;i++) exists(`public/assets/v9/fish/fish_${String(i).padStart(2,'0')}.png`);
for (const token of ['v8.0.0 UI ASSET REBUILD','v800-screen','page-coin','start_screen_clean_v750']) if (!css.includes(token) && !main.includes(token)) fail(`missing token ${token}`);
for (const token of ['base / 260','base / 360','./assets/v9/equipment/rod.png']) if (!main.includes(token)) fail(`main missing ${token}`);
console.log('[check-v800] rendered asset rebuild + stable menu UI OK');
console.log(JSON.stringify({ ok: true, version: '8.0.0' }, null, 2));
