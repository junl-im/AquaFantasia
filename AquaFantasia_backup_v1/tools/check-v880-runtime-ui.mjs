import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const fail = (msg) => { console.error(`[check-v880] ${msg}`); process.exit(1); };
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const pkg = JSON.parse(read('package.json'));
const data = read('src/data.ts');
const main = read('src/main.ts');
const css = read('src/styles.css');
const guard = read('src/core/PortraitGuard.ts');
const sw = read('public/sw.js');
const manifest = JSON.parse(read('public/manifest.webmanifest'));
const has = (text, needle) => text.includes(needle);

const checks = [
  [pkg.version === '8.8.0', 'package version must be 8.8.0'],
  [has(data, "APP_VERSION = '8.8.0'"), 'APP_VERSION must be 8.8.0'],
  [has(data, 'aqua-fantasia-v8.8.0-browser-fullscreen-runtime-ui'), 'cache name must be v8.8.0'],
  [has(sw, 'aqua-fantasia-v8.8.0-browser-fullscreen-runtime-ui'), 'service worker cache must be v8.8.0'],
  [manifest.display === 'fullscreen', 'manifest display must be fullscreen'],
  [Array.isArray(manifest.display_override) && manifest.display_override.includes('fullscreen'), 'display_override must include fullscreen'],
  [has(guard, 'requestFullscreen') && has(guard, 'metrics.hostileInApp'), 'safe browser fullscreen split missing'],
  [!has(guard, 'orientation.lock(') && !has(main, 'orientation.lock('), 'screen orientation API must not be called'],
  [has(main, 'createRuntimeMenuScreen'), 'runtime menu shell missing'],
  [has(main, "player: './assets/v88/characters/fisher_boat_ultra.png'"), 'v88 character not wired'],
  [has(data, "./assets/v88/icons/village.png"), 'village nav icon must not be bag'],
  [has(css, 'v8.8.0 RUNTIME UI + SAFE FULLSCREEN RECOVERY'), 'v8.8 CSS layer missing'],
  [has(css, "url('/assets/v88/ui/bottom_nav_hd.png')"), 'v88 nav background not used'],
  [has(css, "url('/assets/v85/bg/deepsea_full.webp')"), 'runtime art backgrounds not wired'],
  [fs.existsSync(path.join(root, 'public/assets/v88/icons/village.png')), 'village icon asset missing'],
  [fs.existsSync(path.join(root, 'public/assets/v88/characters/fisher_boat_ultra.png')), 'v88 character asset missing'],
  [fs.existsSync(path.join(root, 'README.md')), 'README.md missing'],
  [!fs.readdirSync(root).some((f) => /^CLEAN_REPLACE_GUIDE|^FINAL_CONSOLIDATED|^PATCH_NOTES/.test(f)), 'old MD patch files must not be present'],
];

for (const [ok, msg] of checks) if (!ok) fail(msg);
console.log('[check-v880] runtime UI + safe fullscreen split OK');
console.log(JSON.stringify({ ok: true, version: '8.8.0', mode: process.argv.includes('--audit') ? 'audit' : process.argv.includes('--runtime') ? 'runtime' : 'validate' }, null, 2));
