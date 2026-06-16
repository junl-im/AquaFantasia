import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));
const fail = (msg) => { console.error(`[check-v980] ${msg}`); process.exit(1); };
const pkg = JSON.parse(read('package.json'));
const data = read('src/data.ts');
const main = read('src/main.ts');
const css = read('src/styles.css');
const sw = read('public/sw.js');
const webgl = read('src/core/UnderwaterWebglLayer.ts');
const checks = [
  [pkg.version === '9.8.0', 'package version must be 9.8.0'],
  [data.includes("APP_VERSION = '9.8.0'"), 'APP_VERSION must be 9.8.0'],
  [data.includes('aqua-fantasia-v9.8.0-water-ui-frame-polish'), 'cache name must be v9.8.0'],
  [sw.includes('aqua-fantasia-v9.8.0-water-ui-frame-polish'), 'service worker cache must be v9.8.0'],
  [main.includes("dataset.visualPolish = 'v980-water-ui-frame-polish'"), 'v9.8 visual polish dataset missing'],
  [main.includes('v980-water-ui-frame-screen') && main.includes('v980-water-ui-frame-fishing'), 'v9.8 screen classes missing'],
  [css.includes('v9.8.0 Water UI Frame Polish'), 'v9.8 CSS layer missing'],
  [css.includes('/assets/v3d_underwater/ui/frames/bottom_nav_aqua.png'), 'v3d full nav frame not connected'],
  [css.includes('/assets/v3d_underwater/ui/frames/panel_medium_aqua.png'), 'v3d menu panel frame not connected'],
  [css.includes('overflow-wrap: anywhere'), 'text overflow guard missing'],
  [css.includes('-webkit-line-clamp'), 'line clamp guard missing'],
  [css.includes('v980CausticDrift'), 'caustic drift overlay missing'],
  [webgl.includes('float fbm') && webgl.includes('bubbleField') && webgl.includes('godRay') && webgl.includes('gl_FragColor = vec4(color, 0.86)'), 'enhanced WebGL underwater shader missing'],
  [exists('public/assets/v3d_underwater/textures/fx/caustics_loop_06.png'), 'v3d caustic texture missing'],
  [exists('public/assets/v3d_underwater/ui/frames/bottom_nav_aqua.png'), 'v3d bottom nav frame missing'],
  [exists('README.md'), 'README.md missing'],
];
for (const [ok, msg] of checks) if (!ok) fail(msg);
console.log('[check-v980] water UI frames, text containment and enhanced WebGL water polish OK');
console.log(JSON.stringify({ ok: true, version: '9.8.0', mode: process.argv.includes('--audit') ? 'audit' : process.argv.includes('--runtime') ? 'runtime' : 'validate' }, null, 2));
