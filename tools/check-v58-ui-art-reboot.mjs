import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd();
const read = (file) => readFileSync(join(root, file), 'utf8');
const exists = (file) => { try { statSync(join(root, file)); return true; } catch { return false; } };
function fail(message) { console.error(`[check-v58] ${message}`); process.exit(1); }

const required = [
  'src/runtime/v58-ui-art-reboot.js',
  'tools/check-v58-ui-art-reboot.mjs',
  'PATCH_NOTES_v5.8.0.md',
  'V5_8_0_2_5D_ART_REBOOT_CHECKLIST.md',
  'reports/v5.8.0-2-5d-art-reboot-audit.md',
  'assets/art/v58_panel_25d.svg',
  'assets/art/v58_button_primary_25d.svg',
  'assets/art/v58_nav_shell_25d.svg',
  'assets/art/v58_icon_fish_25d.svg',
  'assets/art/v58_icon_lake_25d.svg',
];
required.forEach((file) => { if (!exists(file)) fail(`missing ${file}`); });

const index = read('index.html');
const sw = read('sw.js');
const runtime = read('src/runtime/v58-ui-art-reboot.js');
const manifest = read('manifest.webmanifest');
const pkg = read('package.json');
const state = read('src/core/state.js');
const validate = read('tools/validate-static.mjs');

if (!index.includes('v58-ui-art-reboot.js?v=5.9.0') || !index.includes('v5.8.0 2.5D UI Art Reboot')) fail('index v5.8 runtime marker missing');
if (!index.includes("const APP_VERSION = '5.9.0'") || !state.includes("APP_VERSION = '5.9.0'") || !state.includes('aqua_v5.9.0')) fail('APP_VERSION/save marker must be v5.9.0');
if (!runtime.includes('AquaV58UIArtReboot') || !runtime.includes('aqua-v58-art-reboot') || !runtime.includes('aqua-v58-lite')) fail('runtime API/body/lite markers missing');
if (!runtime.includes('v58_panel_25d.svg') || !runtime.includes('v58_button_primary_25d.svg') || !runtime.includes('v58_nav_shell_25d.svg')) fail('runtime 2.5D asset markers missing');
if (!runtime.includes('MutationObserver') || !runtime.includes('decorateCards') || !runtime.includes('hideDevelopmentLeftovers')) fail('runtime DOM stabilization markers missing');
if (!runtime.includes('prefers-reduced-motion') || !runtime.includes('navigator.connection') || !runtime.includes('navigator.deviceMemory')) fail('runtime mobile performance guards missing');
if (!(sw.includes('aqua-fantasia-v5.9.0-state-dex-20260612') || sw.includes('aqua-fantasia-v5.9.0-2-5d-art-20260612')) || !sw.includes('./src/runtime/v58-ui-art-reboot.js') || !sw.includes('./assets/art/v58_panel_25d.svg')) fail('service worker v5.8 cache entries missing');
if (!manifest.includes('v5.8.0 2.5D Art Reboot') || !manifest.includes('5.8.0-2-5d-art-20260612')) fail('manifest v5.8 markers missing');
if (!pkg.includes('runtime58:check') || !pkg.includes('check-v58-ui-art-reboot.mjs')) fail('package v5.8 script missing');
if (!validate.includes('v58-ui-art-reboot.js') || !validate.includes('5.8.0')) fail('validate-static v5.8 coverage missing');
console.log('[check-v58] 2.5D UI art reboot OK');
