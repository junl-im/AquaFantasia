import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const fail = (msg) => { console.error(`[check-v750] ${msg}`); process.exit(1); };
const text = (p) => { const f = path.join(root,p); if (!fs.existsSync(f)) fail(`missing ${p}`); return fs.readFileSync(f,'utf8'); };
const exists = (p) => { if (!fs.existsSync(path.join(root,p))) fail(`missing ${p}`); };
const data = text('src/data.ts');
const main = text('src/main.ts');
const css = text('src/styles.css');
const sw = text('public/sw.js');
const pkg = JSON.parse(text('package.json'));
if (pkg.version !== '7.5.0') fail('package version mismatch');
if (!data.includes("APP_VERSION = '7.5.0'")) fail('APP_VERSION mismatch');
if (!data.includes('aqua-fantasia-v7.5.0-ui-rescue-mission-expansion')) fail('cache name mismatch in data');
if (!sw.includes('aqua-fantasia-v7.5.0-ui-rescue-mission-expansion')) fail('cache name mismatch in sw');
for (const p of [
  'public/assets/screens/start_screen_clean_v750.webp',
  'public/assets/screens/start_screen_clean_v750.png',
  'public/assets/ui/v750_keep_on.png',
  'public/assets/ui/v750_keep_off.png',
  'public/assets/ui/v750_button_gold.png',
  'public/assets/ui/v750_button_aqua.png',
  'public/assets/ui/v750_button_purple.png',
  'public/assets/ui/v750_button_green.png',
  'public/assets/ui/v750_panel_clean.png',
  'public/assets/ui/v750_modal_clean.png',
  'public/assets/ui/v750_card_clean.png',
  'reports/v7.5.0-ui-rescue-mission-expansion-audit.md'
]) exists(p);
for (let i=1;i<=44;i++) exists(`public/assets/dex/v740_fish_${String(i).padStart(2,'0')}.png`);
for (const token of ['start_screen_clean_v750.webp','v750-keep-toggle','scroll-screen','missionGoals','mission-dashboard']) if (!main.includes(token)) fail(`main missing ${token}`);
for (const token of ['v7.5.0 UI RESCUE','overflow-y: auto','v750_keep_on.png','mission-dashboard','price-badge']) if (!css.includes(token)) fail(`css missing ${token}`);
const missionCount = (main.match(/id: '/g) || []).length;
if (missionCount < 30) fail(`mission count too small: ${missionCount}`);
console.log('[check-v750] UI rescue + mission expansion OK');
console.log(JSON.stringify({ ok: true, mode: process.argv.includes('--audit') ? 'audit' : process.argv.includes('--runtime') ? 'runtime' : 'validate', version: '7.5.0', missionCount }, null, 2));
