import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));
const fail = (msg) => { console.error(`[check-v900] ${msg}`); process.exit(1); };
const pkg = JSON.parse(read('package.json'));
const data = read('src/data.ts');
const main = read('src/main.ts');
const css = read('src/styles.css');
const sw = read('public/sw.js');
const webgl = read('src/core/UnderwaterWebglLayer.ts');
const checks = [
  [pkg.version === '9.0.0', 'package version must be 9.0.0'],
  [data.includes("APP_VERSION = '9.0.0'"), 'APP_VERSION must be 9.0.0'],
  [data.includes('aqua-fantasia-v9.0.0-webgl-underwater-cute-runtime'), 'cache name must be v9.0.0'],
  [sw.includes('aqua-fantasia-v9.0.0-webgl-underwater-cute-runtime'), 'service worker cache must be v9.0.0'],
  [main.includes('UnderwaterWebglLayer'), 'UnderwaterWebglLayer import/use missing'],
  [main.includes('mountUnderwaterWebgl'), 'mountUnderwaterWebgl missing'],
  [main.includes('data-underwater-webgl'), 'WebGL host not rendered'],
  [main.includes("player: './assets/v90/characters/fisher_boat_cute_crisp.png'"), 'v90 cute character not connected'],
  [webgl.includes('FRAGMENT_SOURCE') && webgl.includes('gl.drawArrays'), 'WebGL shader layer incomplete'],
  [css.includes('v9.0.0 WebGL background layer'), 'v9.0 CSS layer missing'],
  [css.includes('.underwater-webgl-canvas'), 'WebGL canvas CSS missing'],
  [exists('public/assets/v90/characters/fisher_boat_cute_crisp.png'), 'v90 cute character asset missing'],
  [exists('public/assets/v90/characters/chibi_boat_tone_reference.webp'), 'v90 cute tone reference asset missing'],
  [exists('public/assets/v3d_underwater/manifest.runtime.json'), 'v3d asset pack manifest missing'],
  [exists('tools/clean-old-patch-docs.mjs'), 'old docs cleanup script missing'],
];
for (const [ok, msg] of checks) if (!ok) fail(msg);
console.log('[check-v900] WebGL underwater background layer + cute chibi tone OK');
console.log(JSON.stringify({ ok: true, version: '9.0.0', mode: process.argv.includes('--audit') ? 'audit' : process.argv.includes('--runtime') ? 'runtime' : 'validate' }, null, 2));
