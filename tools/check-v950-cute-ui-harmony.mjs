import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));
const fail = (msg) => { console.error(`[check-v950] ${msg}`); process.exit(1); };
const pkg = JSON.parse(read('package.json'));
const data = read('src/data.ts');
const main = read('src/main.ts');
const css = read('src/styles.css');
const sw = read('public/sw.js');
const webgl = read('src/core/UnderwaterWebglLayer.ts');
const checks = [
  [pkg.version === '9.5.0', 'package version must be 9.5.0'],
  [data.includes("APP_VERSION = '9.5.0'"), 'APP_VERSION must be 9.5.0'],
  [data.includes('aqua-fantasia-v9.5.0-cute-ui-harmony'), 'cache name must be v9.5.0'],
  [sw.includes('aqua-fantasia-v9.5.0-cute-ui-harmony'), 'service worker cache must be v9.5.0'],
  [main.includes("dataset.visualPolish = 'v950-cute-ui-harmony'"), 'v9.5 visual polish dataset missing'],
  [main.includes('runtime-hud-mascot'), 'cute HUD mascot missing'],
  [main.includes('v950-gear-card') && main.includes('v950-stat-bar'), 'gear card stat polish missing'],
  [main.includes('v950-inventory-card') && main.includes('v950-count'), 'inventory count polish missing'],
  [main.includes('v950-shop-card') && main.includes('v950-mission-card'), 'shop/mission card polish missing'],
  [webgl.includes('FRAGMENT_SOURCE') && webgl.includes('gl.drawArrays'), 'WebGL underwater layer incomplete'],
  [css.includes('v9.5.0 cute UI harmony layer'), 'v9.5 CSS layer missing'],
  [css.includes('.runtime-hud-mascot'), 'runtime mascot CSS missing'],
  [css.includes('.v950-stat-bar'), 'gear stat bar CSS missing'],
  [css.includes('.bottom-nav.v840-bottom-nav button.active::before'), 'nav active pseudo frame missing'],
  [css.includes('inset: 8px 6px 9px'), 'v9.5 smaller nav active inset missing'],
  [exists('public/assets/v91/characters/chibi_fisher_face_icon.png'), 'v91 face icon missing'],
  [exists('public/assets/v91/ui/panel_card_aqua.png'), 'v91 card panel missing'],
  [exists('README.md'), 'README.md missing'],
];
for (const [ok, msg] of checks) if (!ok) fail(msg);
console.log('[check-v950] cute UI harmony and screen polish OK');
console.log(JSON.stringify({ ok: true, version: '9.5.0', mode: process.argv.includes('--audit') ? 'audit' : process.argv.includes('--runtime') ? 'runtime' : 'validate' }, null, 2));
