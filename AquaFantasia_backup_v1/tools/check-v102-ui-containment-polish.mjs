import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));
const fail = (msg) => { console.error(`[check-v102] ${msg}`); process.exit(1); };
const pkg = JSON.parse(read('package.json'));
const data = read('src/data.ts');
const main = read('src/main.ts');
const css = read('src/styles.css');
const sw = read('public/sw.js');
const checks = [
  [pkg.version === '1.0.2', 'package version must be 1.0.2'],
  [data.includes("APP_VERSION = '1.0.2'"), 'APP_VERSION must be 1.0.2'],
  [data.includes('aqua-fantasia-v1.0.2-ui-containment-polish'), 'cache name must be v1.0.2'],
  [sw.includes('aqua-fantasia-v1.0.2-ui-containment-polish'), 'service worker cache must be v1.0.2'],
  [main.includes("dataset.visualPolish = 'v102-ui-containment-polish'"), 'v1.0.2 visual polish dataset missing'],
  [main.includes('v102-ui-containment-screen') && main.includes('v102-ui-containment-fishing'), 'v1.0.2 runtime screen classes missing'],
  [css.includes('v1.0.2 UI Containment Polish'), 'v1.0.2 CSS layer missing'],
  [css.includes('/assets/v102/ui/bottom_nav_frame_clean.png'), 'clean bottom nav frame missing'],
  [css.includes('button::before') && css.includes('content: none'), 'corner/pearl pseudo cleanup missing'],
  [css.includes('-webkit-line-clamp: 2') && css.includes('text-overflow: ellipsis'), 'text containment rules missing'],
  [css.includes('grid-template-columns: clamp(48px, 12vw, 58px) minmax(0, 1fr) minmax(58px, 68px)'), 'shop containment grid missing'],
  [css.includes('ranking-live-card') && css.includes('minmax(70px, 86px)'), 'ranking containment grid missing'],
  [css.includes('var(--v102-card-fill)') && css.includes('100% 100%, 100% 100%'), 'filled frame backing missing'],
  [exists('public/assets/v102/ui/bottom_nav_frame_clean.png'), 'v102 bottom nav clean asset missing'],
  [exists('public/assets/v102/ui/button_aqua_clean.png') && exists('public/assets/v102/ui/button_gold_clean.png'), 'v102 button assets missing'],
  [exists('README.md'), 'README.md missing'],
];
for (const [ok, msg] of checks) if (!ok) fail(msg);
console.log('[check-v102] UI frame backing, text containment, clean nav, button tone polish OK');
console.log(JSON.stringify({ ok: true, version: '1.0.2', mode: process.argv.includes('--audit') ? 'audit' : process.argv.includes('--runtime') ? 'runtime' : 'validate' }, null, 2));
