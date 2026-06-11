import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const root = process.cwd();
const requiredFiles = [
  'index.html',
  'manifest.webmanifest',
  'sw.js',
  'offline.html',
  'data/fish.json',
  '.nojekyll',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/maskable-512.png',
  'assets/icons/apple-touch-icon.png'
];

function fail(message) {
  console.error(`\n[validate-static] ${message}`);
  process.exit(1);
}

for (const file of requiredFiles) {
  try { readFileSync(join(root, file)); }
  catch { fail(`Missing required file: ${file}`); }
}

const index = readFileSync(join(root, 'index.html'), 'utf8');
if (!index.includes('Aqua Fantasia')) fail('index.html does not look like the game entry file.');
if (!index.includes("const APP_VERSION = '2.1.0'")) fail('APP_VERSION must be 2.1.0 for this patch.');
if (!index.includes('serviceWorker.register')) fail('PWA service worker registration is missing.');
if (!index.includes('season-ranking-panel')) fail('Season ranking UI is missing.');
if (!index.includes('weekly-reward-vault')) fail('Weekly reward vault UI is missing.');

const manifest = JSON.parse(readFileSync(join(root, 'manifest.webmanifest'), 'utf8'));
if (manifest.display !== 'standalone') fail('manifest.webmanifest must use display: standalone.');
if (!Array.isArray(manifest.icons) || manifest.icons.length < 3) fail('manifest icons are incomplete.');

const fish = JSON.parse(readFileSync(join(root, 'data/fish.json'), 'utf8'));
if (!Array.isArray(fish.fish) || fish.fish.length < 20) fail('data/fish.json must include at least 20 fish entries.');
const fishIds = new Set();
for (const item of fish.fish) {
  if (!item.id || fishIds.has(item.id)) fail(`Invalid or duplicate fish id: ${item.id}`);
  fishIds.add(item.id);
  if (!item.region || !item.name || !item.rarity) fail(`Fish entry is incomplete: ${item.id}`);
}

const sw = readFileSync(join(root, 'sw.js'), 'utf8');
if (!sw.includes('aqua-fantasia-v2.1.0')) fail('Service worker cache version was not updated.');

const scripts = [...index.matchAll(/<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/gi)]
  .map((m) => m[1].trim())
  .filter(Boolean);

scripts.forEach((script, idx) => {
  const temp = join(root, `.validate-script-${idx}.mjs`);
  writeFileSync(temp, script, 'utf8');
  const result = spawnSync(process.execPath, ['--check', temp], { encoding: 'utf8' });
  rmSync(temp, { force: true });
  if (result.status !== 0) {
    console.error(result.stdout);
    console.error(result.stderr);
    fail(`JavaScript syntax check failed for script #${idx + 1}.`);
  }
});

console.log('[validate-static] AquaFantasia static bundle OK.');
