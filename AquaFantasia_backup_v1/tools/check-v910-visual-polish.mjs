import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));
const fail = (msg) => { console.error(`[check-v910] ${msg}`); process.exit(1); };
const pkg = JSON.parse(read('package.json'));
const data = read('src/data.ts');
const main = read('src/main.ts');
const css = read('src/styles.css');
const sw = read('public/sw.js');
const webgl = read('src/core/UnderwaterWebglLayer.ts');
const checks = [
  [pkg.version === '9.1.0', 'package version must be 9.1.0'],
  [data.includes("APP_VERSION = '9.1.0'"), 'APP_VERSION must be 9.1.0'],
  [data.includes('aqua-fantasia-v9.1.0-visual-polish-cute-webgl'), 'cache name must be v9.1.0'],
  [sw.includes('aqua-fantasia-v9.1.0-visual-polish-cute-webgl'), 'service worker cache must be v9.1.0'],
  [main.includes("player: './assets/v91/characters/chibi_fisher_boat_story.png'"), 'v91 cute chibi player not connected'],
  [main.includes('runtime-bg-character'), 'runtime menu cute companion missing'],
  [main.includes('./assets/v91/bg/menu_town.webp'), 'v91 menu backgrounds not connected'],
  [data.includes('./assets/v91/bg/region_lake.webp'), 'v91 region backgrounds not connected'],
  [data.includes('./assets/v91/icons/village.png') && data.includes('./assets/v91/icons/fishing.png'), 'v91 nav icons not connected'],
  [webgl.includes('FRAGMENT_SOURCE') && webgl.includes('gl.drawArrays'), 'WebGL shader layer incomplete'],
  [css.includes('v9.1.0 Visual polish layer'), 'v9.1 CSS layer missing'],
  [css.includes('.runtime-bg-character'), 'runtime character CSS missing'],
  [css.includes('/assets/v91/ui/panel_large_aqua.png'), 'v91 UI panel CSS missing'],
  [css.includes('/assets/v91/ui/bottom_nav_deep.png'), 'v91 bottom nav CSS missing'],
  [exists('public/assets/v91/characters/chibi_fisher_boat_story.png'), 'v91 chibi player asset missing'],
  [exists('public/assets/v91/bg/menu_town.webp'), 'v91 menu background missing'],
  [exists('public/assets/v91/bg/region_lake.webp'), 'v91 region background missing'],
  [exists('public/assets/v91/ui/panel_large_aqua.png'), 'v91 panel asset missing'],
  [exists('public/assets/v91/ui/bottom_nav_deep.png'), 'v91 nav frame asset missing'],
  [exists('public/assets/v91/icons/village.png'), 'v91 village icon missing'],
  [exists('tools/clean-old-patch-docs.mjs'), 'old docs cleanup script missing'],
];
for (const [ok, msg] of checks) if (!ok) fail(msg);
console.log('[check-v910] Visual polish + cute chibi + WebGL underwater layer OK');
console.log(JSON.stringify({ ok: true, version: '9.1.0', mode: process.argv.includes('--audit') ? 'audit' : process.argv.includes('--runtime') ? 'runtime' : 'validate' }, null, 2));
