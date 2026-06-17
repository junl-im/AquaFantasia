import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));
const fail = (msg) => { console.error(`[check-v970] ${msg}`); process.exit(1); };
const pkg = JSON.parse(read('package.json'));
const data = read('src/data.ts');
const main = read('src/main.ts');
const css = read('src/styles.css');
const sw = read('public/sw.js');
const checks = [
  [pkg.version === '9.7.0', 'package version must be 9.7.0'],
  [data.includes("APP_VERSION = '9.7.0'"), 'APP_VERSION must be 9.7.0'],
  [data.includes('aqua-fantasia-v9.7.0-nav-fishing-visibility'), 'cache name must be v9.7.0'],
  [sw.includes('aqua-fantasia-v9.7.0-nav-fishing-visibility'), 'service worker cache must be v9.7.0'],
  [main.includes("dataset.visualPolish = 'v970-nav-fishing-visibility'"), 'v9.7 visual polish dataset missing'],
  [main.includes('v970-nav-fishing-screen'), 'v9.7 screen class missing'],
  [main.includes('const playerTargetH = Math.min(h * 0.62, w * 1.24)'), 'fishing character scale/visibility update missing'],
  [css.includes('v9.7.0 Nav Frame + Fishing Visibility Polish'), 'v9.7 CSS layer missing'],
  [css.includes('/assets/v97/ui/bottom_nav_full_frame.png'), 'full-width nav frame missing'],
  [css.includes('/assets/v97/ui/tab_cell_active_soft.png'), 'active tab cell asset missing'],
  [css.includes('Reel gauge: larger, high-contrast'), 'reel gauge polish note missing'],
  [css.includes('height: clamp(30px, 6.6vw, 38px)'), 'larger tension track missing'],
  [exists('public/assets/v97/ui/bottom_nav_full_frame.png'), 'v97 bottom nav frame asset missing'],
  [exists('public/assets/v97/fx/reel_gauge_frame_hd.png'), 'v97 reel gauge frame asset missing'],
  [exists('README.md'), 'README.md missing'],
];
for (const [ok, msg] of checks) if (!ok) fail(msg);
console.log('[check-v970] full-width nav frame, fishing character visibility and reel gauge polish OK');
console.log(JSON.stringify({ ok: true, version: '9.7.0', mode: process.argv.includes('--audit') ? 'audit' : process.argv.includes('--runtime') ? 'runtime' : 'validate' }, null, 2));
