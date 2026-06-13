import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const mustExist = [
  'index.html', 'manifest.webmanifest', 'sw.js', 'offline.html', 'package.json', 'package-lock.json',
  'assets/art/login_ocean_fishing_25d.svg', 'assets/art/water_ripple_overlay.svg',
  'assets/icons/icon-192.png', 'assets/icons/icon-512.png', '.github/workflows/pages.yml'
];
const forbiddenFiles = [
  'AquaFantasia_v4.9_CLEAN_UNIFIED.html', 'AquaFantasia_v5.9.0_CLEAN_UNIFIED.html',
  'AquaFantasia_v4.9_standalone_phaser.html'
];
const forbiddenText = [
  'Firebase 익명 연동', 'v5.1 Stability Assist', 'STACK SAFE', 'Node24 OK', 'QUICK ACTION',
  'aqua-static-validate.yml', 'v5.5.2 Node24'
];
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
let ok = true;
for (const file of mustExist) {
  if (!fs.existsSync(path.join(root, file))) { console.error(`[clean-validate] missing ${file}`); ok = false; }
}
for (const file of forbiddenFiles) {
  if (fs.existsSync(path.join(root, file))) { console.error(`[clean-validate] old html should not exist: ${file}`); ok = false; }
}
for (const text of forbiddenText) {
  if (html.includes(text)) { console.error(`[clean-validate] forbidden text remains in index.html: ${text}`); ok = false; }
}
if (!html.includes('익명 서버연동')) { console.error('[clean-validate] renamed server button missing'); ok = false; }
if (!/body\s+data-screen="login"/.test(html)) { console.error('[clean-validate] login-first state missing'); ok = false; }
if (!/body\[data-screen="login"\]\s+\.app-hud\s*\{\s*display:none/.test(html)) { console.error('[clean-validate] login HUD guard missing'); ok = false; }
if (!/body\[data-screen="login"\]\s+\.bottom-nav/.test(html)) { console.error('[clean-validate] login bottom-nav guard missing'); ok = false; }
if (!html.includes('login_ocean_fishing_25d.svg')) { console.error('[clean-validate] login art not connected'); ok = false; }
if (!html.includes('showToast') || !html.includes('pointermove')) { console.error('[clean-validate] dismissible/swipe notification logic missing'); ok = false; }
if (!ok) process.exit(1);
console.log(`[clean-validate] Aqua Fantasia clean runtime OK (${process.argv[2] || 'validate'})`);
