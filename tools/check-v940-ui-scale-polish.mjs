import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));
const fail = (msg) => { console.error(`[check-v940] ${msg}`); process.exit(1); };
const pkg = JSON.parse(read('package.json'));
const data = read('src/data.ts');
const main = read('src/main.ts');
const css = read('src/styles.css');
const sw = read('public/sw.js');
const webgl = read('src/core/UnderwaterWebglLayer.ts');
const checks = [
  [pkg.version === '9.4.0', 'package version must be 9.4.0'],
  [data.includes("APP_VERSION = '9.4.0'"), 'APP_VERSION must be 9.4.0'],
  [data.includes('aqua-fantasia-v9.4.0-ui-scale-nav-polish'), 'cache name must be v9.4.0'],
  [sw.includes('aqua-fantasia-v9.4.0-ui-scale-nav-polish'), 'service worker cache must be v9.4.0'],
  [main.includes("player: './assets/v93/characters/fisher_boat_cute_action.png'"), 'v93 cute action player not connected'],
  [main.includes('spawnCastTrail') && main.includes('spawnRewardBurst'), 'cute action loop missing'],
  [webgl.includes('FRAGMENT_SOURCE') && webgl.includes('gl.drawArrays'), 'WebGL underwater layer incomplete'],
  [css.includes('v9.4.0 UI scale and nav polish layer'), 'v9.4 CSS layer missing'],
  [css.includes('--v940-nav-height'), 'v9.4 nav height token missing'],
  [css.includes('inset: 6px 5px 7px'), 'v9.4 active nav inset missing'],
  [css.includes('outline: 2px solid'), 'v9.4 active nav outline missing'],
  [css.includes('.bottom-nav.v840-bottom-nav button.active::before'), 'v9.4 active nav pseudo frame missing'],
  [css.includes('.runtime-menu-screen.v890-v3d-screen .runtime-card-list'), 'runtime list scale polish missing'],
  [css.includes('.catch-result-card.v930-result'), 'catch result scale polish missing'],
  [exists('public/assets/v93/ui/result_modal_cute.png'), 'v93 result modal asset missing'],
  [exists('public/assets/v92/ui/bottom_nav.png'), 'v92 bottom nav asset missing'],
  [exists('public/assets/v92/icons/fishing.png'), 'v92 nav icon asset missing'],
  [exists('README.md'), 'README.md missing'],
];
for (const [ok, msg] of checks) if (!ok) fail(msg);
console.log('[check-v940] UI scale + bottom navigation selected-state polish OK');
console.log(JSON.stringify({ ok: true, version: '9.4.0', mode: process.argv.includes('--audit') ? 'audit' : process.argv.includes('--runtime') ? 'runtime' : 'validate' }, null, 2));
