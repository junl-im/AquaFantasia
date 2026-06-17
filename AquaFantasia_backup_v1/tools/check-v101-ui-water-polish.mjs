import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));
const fail = (msg) => { console.error(`[check-v101] ${msg}`); process.exit(1); };
const pkg = JSON.parse(read('package.json'));
const data = read('src/data.ts');
const main = read('src/main.ts');
const css = read('src/styles.css');
const sw = read('public/sw.js');
const webgl = read('src/core/UnderwaterWebglLayer.ts');
const checks = [
  [pkg.version === '1.0.1', 'package version must be 1.0.1'],
  [data.includes("APP_VERSION = '1.0.1'"), 'APP_VERSION must be 1.0.1'],
  [data.includes('aqua-fantasia-v1.0.1-ui-water-frame-polish'), 'cache name must be v1.0.1'],
  [sw.includes('aqua-fantasia-v1.0.1-ui-water-frame-polish'), 'service worker cache must be v1.0.1'],
  [main.includes("dataset.visualPolish = 'v101-ui-water-frame-polish'"), 'v1.0.1 visual polish dataset missing'],
  [main.includes('v101-ui-water-frame-screen') && main.includes('v101-ui-water-frame-fishing'), 'v1.0.1 screen classes missing'],
  [main.includes('sceneUrl') && webgl.includes('sampler2D u_scene') && webgl.includes('loadSceneTexture'), 'WebGL scene texture path missing'],
  [css.includes('v1.0.1 UI Water Frame Reset'), 'v1.0.1 CSS layer missing'],
  [css.includes('--v101-panel-fill') && css.includes('calc(100% - 32px)'), 'transparent frame fill fix missing'],
  [css.includes('--v101-nav-height') && css.includes('bottom: 0 !important'), 'compact bottom nav frame fix missing'],
  [css.includes('combo-badge') && css.includes('bottom: auto'), 'combo/start overlap fix missing'],
  [exists('public/assets/v101/water/water_clear_calm.webp'), 'v101 uploaded water texture missing'],
  [exists('public/assets/v101/water/water_abyss_canyon.webp'), 'v101 deep water texture missing'],
  [exists('README.md'), 'README.md missing'],
];
for (const [ok, msg] of checks) if (!ok) fail(msg);
console.log('[check-v101] semantic version, filled UI frames, compact nav and textured WebGL water OK');
console.log(JSON.stringify({ ok: true, version: '1.0.1', mode: process.argv.includes('--audit') ? 'audit' : process.argv.includes('--runtime') ? 'runtime' : 'validate' }, null, 2));
