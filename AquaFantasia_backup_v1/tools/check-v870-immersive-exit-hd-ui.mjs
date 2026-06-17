import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const fail = (msg) => { console.error(`[check-v870] ${msg}`); process.exit(1); };
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
  [pkg.version === '8.7.0', 'package version must be 8.7.0'],
  [has(data, "APP_VERSION = '8.7.0'"), 'APP_VERSION must be 8.7.0'],
  [has(data, 'aqua-fantasia-v8.7.0-immersive-exit-hd-ui'), 'cache name must be v8.7.0'],
  [has(sw, 'aqua-fantasia-v8.7.0-immersive-exit-hd-ui'), 'service worker cache must be v8.7.0'],
  [manifest.display === 'fullscreen', 'manifest display must be fullscreen'],
  [Array.isArray(manifest.display_override) && manifest.display_override.includes('fullscreen'), 'display_override must include fullscreen'],
  [!has(guard, 'requestFullscreen(') && !has(main, 'requestFullscreen('), 'requestFullscreen must not be called'],
  [!has(guard, 'orientation.lock(') && !has(main, 'orientation.lock('), 'screen orientation API must not be called'],
  [has(main, 'kakaotalk://inappbrowser/close') && has(main, 'kakaoweb://closeBrowser'), 'Kakao close schemes missing'],
  [has(main, 'showExitFallbackHint'), 'exit fallback hint missing'],
  [has(main, './assets/v87/characters/fisher_boat_crisp.png'), 'v87 crisp character not wired'],
  [has(data, './assets/v87/icons/rod.png'), 'v87 nav icons not wired'],
  [has(css, 'v8.7.0 IMMERSIVE EXIT + HD UI POLISH'), 'v8.7 CSS polish layer missing'],
  [has(css, "url('/assets/v87/ui/bottom_nav_hd.png')"), 'v87 nav background not used'],
  [has(css, "url('/assets/v87/ui/recent_panel_hd.png')"), 'v87 recent panel not used'],
  [has(css, 'ranking-bg-art'), 'ranking background restore missing'],
  [fs.existsSync(path.join(root, 'README.md')), 'README.md missing'],
  [!fs.readdirSync(root).some((f) => /^CLEAN_REPLACE_GUIDE|^FINAL_CONSOLIDATED|^PATCH_NOTES/.test(f)), 'old MD patch files must not be present'],
];

for (const [ok, msg] of checks) if (!ok) fail(msg);
console.log('[check-v870] immersive exit + HD UI polish OK');
console.log(JSON.stringify({ ok: true, version: '8.7.0', mode: process.argv.includes('--audit') ? 'audit' : process.argv.includes('--runtime') ? 'runtime' : 'validate' }, null, 2));
