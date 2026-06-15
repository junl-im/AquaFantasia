import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));
const fail = (msg) => { console.error(`[check-v890] ${msg}`); process.exit(1); };
const pkg = JSON.parse(read('package.json'));
const data = read('src/data.ts');
const main = read('src/main.ts');
const css = read('src/styles.css');
const sw = read('public/sw.js');
const checks = [
  [pkg.version === '8.9.0', 'package version must be 8.9.0'],
  [data.includes("APP_VERSION = '8.9.0'"), 'APP_VERSION must be 8.9.0'],
  [data.includes('aqua-fantasia-v8.9.0-v3d-underwater-runtime-ui'), 'cache name must be v8.9.0'],
  [sw.includes('aqua-fantasia-v8.9.0-v3d-underwater-runtime-ui'), 'service worker cache must be v8.9.0'],
  [main.includes('V3D_MENU_BG'), 'V3D menu background map missing'],
  [main.includes('v890-v3d-screen'), 'v8.9 runtime menu class missing'],
  [main.includes('v890-fishing-screen'), 'v8.9 fishing class missing'],
  [data.includes('./assets/v89/bg/region_lake.webp'), 'regions must use v89 backgrounds'],
  [data.includes('./assets/v89/icons/village.png'), 'nav must use v89 icons'],
  [css.includes('v8.9.0 3D Underwater Asset Pack Integration'), 'v8.9 CSS layer missing'],
  [css.includes('/assets/v3d_underwater/textures/fx/caustics_loop_06.png'), 'caustics overlay missing'],
  [exists('public/assets/v3d_underwater/manifest.runtime.json'), 'v3d asset pack manifest missing'],
  [exists('public/assets/v89/bg/world_fishing.webp'), 'v89 generated fishing background missing'],
  [exists('public/assets/v89/bg/world_ranking.webp'), 'v89 generated ranking background missing'],
  [exists('public/assets/v89/ui/bottom_nav_deep.png'), 'v89 bottom nav asset missing'],
  [exists('public/assets/v89/characters/fisher_boat_gallery.png'), 'v89 character asset missing'],
];
for (const [ok, msg] of checks) if (!ok) fail(msg);
console.log('[check-v890] 3D underwater asset pack runtime UI OK');
console.log(JSON.stringify({ ok: true, version: '8.9.0', mode: process.argv.includes('--audit') ? 'audit' : process.argv.includes('--runtime') ? 'runtime' : 'validate' }, null, 2));
