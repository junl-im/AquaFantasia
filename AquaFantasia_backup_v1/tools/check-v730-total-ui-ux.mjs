import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const fail = (msg) => { console.error(`[check-v730] ${msg}`); process.exit(1); };
const must = (p) => { const f = path.join(root, p); if (!fs.existsSync(f)) fail(`missing ${p}`); return fs.readFileSync(f, 'utf8'); };
const data = must('src/data.ts');
const main = must('src/main.ts');
const css = must('src/styles.css');
const sw = must('public/sw.js');
const pkg = JSON.parse(must('package.json'));
for (const file of [
  'public/assets/screens/start_screen_clean_v730.webp',
  'public/assets/screens/start_screen_clean_v730.png',
  'public/assets/ui/v730_keep_on.png',
  'public/assets/ui/v730_keep_off.png',
  'public/assets/ui/v730_button_gold.png',
  'public/assets/ui/v730_button_aqua.png',
  'public/assets/ui/v730_button_purple.png',
  'public/assets/ui/v730_button_green.png',
  'public/assets/ui/v730_panel_pearl.png',
  'public/assets/ui/v730_modal_shell.png',
  'public/assets/ui/v730_bite_banner.png',
  'public/assets/ui/v730_reel_panel.png',
  'public/assets/ui/v730_nav_active.png',
  'public/assets/dex/fish_v730_candyfin_25d.png',
  'public/assets/dex/fish_v730_bluesprite_25d.png',
  'public/assets/dex/fish_v730_royal_25d.png',
  'public/assets/dex/fish_v730_melon_25d.png',
  'reports/v7.3.0-total-ui-ux-refinement-audit.md'
]) if (!fs.existsSync(path.join(root, file))) fail(`missing ${file}`);
if (!data.includes("APP_VERSION = '7.3.0'")) fail('APP_VERSION mismatch');
if (!data.includes('aqua-fantasia-v7.3.0-total-ui-ux-refinement')) fail('cache mismatch');
if (pkg.version !== '7.3.0') fail('package version mismatch');
for (const token of ['start_screen_clean_v730.webp','v720-keep-toggle v730-keep-toggle','찌 던지기로 출항을 시작하세요','dex-summary']) if (!main.includes(token)) fail(`main missing ${token}`);
for (const token of ['v7.3.0 TOTAL UI/UX REFINEMENT PASS','v730_keep_on.png','v730_button_gold.png','v730_panel_pearl.png','v730_bite_banner.png','dex-summary']) if (!css.includes(token)) fail(`css missing ${token}`);
for (const token of ['aqua-fantasia-v7.3.0-total-ui-ux-refinement','start_screen_clean_v730.webp','v730_button_gold.png','fish_v730_royal_25d.png']) if (!sw.includes(token)) fail(`sw missing ${token}`);
console.log('[check-v730] Total UI/UX refinement OK');
console.log(JSON.stringify({ ok: true, mode: process.argv.includes('--audit') ? 'audit' : process.argv.includes('--runtime') ? 'runtime' : 'validate', version: '7.3.0' }, null, 2));
