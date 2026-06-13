import fs from 'node:fs';
const fail = (msg) => { console.error(`[check-v690] ${msg}`); process.exit(1); };
const must = (path) => { if (!fs.existsSync(path)) fail(`missing ${path}`); return fs.readFileSync(path, 'utf8'); };
const main = must('src/main.ts');
const css = must('src/styles.css');
const data = must('src/data.ts');
const sw = must('public/sw.js');
const pkg = JSON.parse(must('package.json'));
for (const file of ['public/assets/screens/start_screen_clean_v690.webp','public/assets/screens/start_screen_clean_v690.png','public/assets/screens/start_screen_reference.webp','public/assets/ui/button_cast_clean.png','public/assets/ui/button_cast_yellow_clean.png','public/assets/ui/badge_combo_clean.png','public/assets/ui/dex_panel_reference_25d.png']) {
  if (!fs.existsSync(file)) fail(`missing ${file}`);
}
for (const token of ['start_screen_clean_v690.webp','hit-depart','hit-new','hit-server','hit-keep','keep-indicator']) if (!main.includes(token) && !css.includes(token)) fail(`missing start cleanup token ${token}`);
for (const forbidden of ['hit-notice" data-action','hit-support" data-action','hit-settings" data-action','hit-bag" data-action','hit-shop" data-action']) if (main.includes(forbidden)) fail(`forbidden start hotspot remains: ${forbidden}`);
for (const token of ['installBackNavigationGuard','handleHardwareBack','showGameConfirm','마을로 돌아갈까요?','게임을 종료할까요?','releaseBrowserBack']) if (!main.includes(token)) fail(`missing back navigation token ${token}`);
for (const token of ['showBiteCallout','화면을 눌러 당기세요','bite-callout']) if (!main.includes(token) && !css.includes(token)) fail(`missing bite guide token ${token}`);
if (!data.includes('7.2.0') || !data.includes('aqua-fantasia-v7.2.0-total-ui-transparent-dex')) fail('v7 data/cache missing');
if (!sw.includes('start_screen_clean_v690.webp')) fail('clean start screen is not precached');
if (pkg.version !== '7.2.0') fail('package version must be 7.2.0');
console.log('[check-v690] Start screen cleanup + back navigation guard + bite guide OK');
