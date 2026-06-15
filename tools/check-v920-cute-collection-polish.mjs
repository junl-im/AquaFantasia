import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));
const fail = (msg) => { console.error(`[check-v920] ${msg}`); process.exit(1); };
const pkg = JSON.parse(read('package.json'));
const data = read('src/data.ts');
const main = read('src/main.ts');
const css = read('src/styles.css');
const sw = read('public/sw.js');
const webgl = read('src/core/UnderwaterWebglLayer.ts');
const checks = [
  [pkg.version === '9.2.0', 'package version must be 9.2.0'],
  [data.includes("APP_VERSION = '9.2.0'"), 'APP_VERSION must be 9.2.0'],
  [data.includes('aqua-fantasia-v9.2.0-cute-collection-webgl-polish'), 'cache name must be v9.2.0'],
  [sw.includes('aqua-fantasia-v9.2.0-cute-collection-webgl-polish'), 'service worker cache must be v9.2.0'],
  [main.includes("player: './assets/v91/characters/chibi_fisher_boat_story.png'"), 'v91 cute chibi player not connected'],
  [main.includes('runtime-bg-character'), 'runtime menu cute companion missing'],
  [main.includes('./assets/v92/bg/menu_town.webp'), 'v92 menu backgrounds not connected'],
  [data.includes('./assets/v92/bg/region_lake.webp'), 'v92 region backgrounds not connected'],
  [data.includes('./assets/v92/icons/village.png') && data.includes('./assets/v92/icons/fishing.png'), 'v92 nav icons not connected'],
  [webgl.includes('FRAGMENT_SOURCE') && webgl.includes('gl.drawArrays'), 'WebGL shader layer incomplete'],
  [css.includes('v9.2.0 Cute collection polish layer'), 'v9.2 CSS layer missing'],
  [css.includes('.runtime-bg-character'), 'runtime character CSS missing'],
  [css.includes('/assets/v92/ui/panel_large.png'), 'v92 UI panel CSS missing'],
  [css.includes('/assets/v92/ui/bottom_nav.png'), 'v92 bottom nav CSS missing'],
  [exists('public/assets/v91/characters/chibi_fisher_boat_story.png'), 'v91 chibi player asset missing'],
  [exists('public/assets/v92/bg/menu_town.webp'), 'v92 menu background missing'],
  [exists('public/assets/v92/bg/region_lake.webp'), 'v92 region background missing'],
  [exists('public/assets/v92/ui/panel_large.png'), 'v92 panel asset missing'],
  [exists('public/assets/v92/ui/bottom_nav.png'), 'v92 nav frame asset missing'],
  [exists('public/assets/v92/icons/village.png'), 'v92 village icon missing'],
  [exists('public/assets/v92/fish/fish_01.png'), 'v92 fish asset missing'],
  [exists('public/assets/v92/equipment/rod.png'), 'v92 equipment asset missing'],
  [exists('public/assets/v92/ui/button_large_gold.png'), 'v92 cast button asset missing'],
  [exists('tools/clean-old-patch-docs.mjs'), 'old docs cleanup script missing'],
];
for (const [ok, msg] of checks) if (!ok) fail(msg);
console.log('[check-v920] Cute collection + rendered UI + WebGL underwater layer OK');
console.log(JSON.stringify({ ok: true, version: '9.2.0', mode: process.argv.includes('--audit') ? 'audit' : process.argv.includes('--runtime') ? 'runtime' : 'validate' }, null, 2));
