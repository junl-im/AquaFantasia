import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'index.html', 'src/main.ts', 'src/styles.css', 'src/data.ts', 'src/storage.ts', 'src/audio.ts', 'src/toast.ts',
  'public/sw.js', 'public/manifest.webmanifest', 'public/assets/art/bg_ocean.png', 'public/assets/art/player_boat.png',
  'public/assets/art/fishing_float.png', 'public/assets/art/fish_clown.png', 'public/assets/art/gauge_frame.png', 'public/assets/art/fish_slot.png',
  'public/assets/atlas/aqua_fishing_atlas.webp', 'public/assets/atlas/aqua_fishing_atlas.json', '.github/workflows/pages.yml'
];
const forbiddenFiles = [/AquaFantasia_v\d/i, /PATCH_NOTES_v[1-5]/i, /STACK_SAFE/i];
const forbiddenText = ['v5.1 Stability Assist', 'STACK SAFE', 'Node24 OK', 'Firebase 익명 연동', 'QUICK ACTION'];
let ok = true;
const fail = (msg) => { console.error('[validate-clean]', msg); ok = false; };

for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) fail(`missing ${file}`);
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'dist') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const files = walk(root);
for (const file of files) {
  const rel = path.relative(root, file).replaceAll('\\', '/');
  if (forbiddenFiles.some((rx) => rx.test(rel))) fail(`legacy file remains: ${rel}`);
  if (/\.(html|ts|css|js|json|md|yml|yaml)$/.test(rel)) {
    const text = fs.readFileSync(file, 'utf8');
    for (const word of forbiddenText) if (text.includes(word)) fail(`forbidden legacy text '${word}' in ${rel}`);
  }
}

const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
if (!index.includes('/src/main.ts')) fail('index.html is not using the Vite TypeScript entry');
if (!fs.readFileSync(path.join(root, 'src/data.ts'), 'utf8').includes("APP_VERSION = '6.2.0'")) fail('APP_VERSION is not 6.2.0');
const sw = fs.readFileSync(path.join(root, 'public/sw.js'), 'utf8');
if (!sw.includes('aqua-fantasia-v6.2.0-asset-runtime')) fail('service worker cache version mismatch');
const atlas = JSON.parse(fs.readFileSync(path.join(root, 'public/assets/atlas/aqua_fishing_atlas.json'), 'utf8'));
for (const name of ['player_boat.png','fishing_float.png','fish_clown.png','gauge_frame.png','fish_slot.png']) {
  if (!atlas.frames?.[name]) fail(`atlas missing ${name}`);
}
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
for (const dep of ['pixi.js','howler','firebase']) if (!pkg.dependencies?.[dep]) fail(`missing dependency ${dep}`);
if (!pkg.devDependencies?.vite || !pkg.devDependencies?.typescript) fail('missing Vite/TypeScript dev dependencies');

if (!ok) process.exit(1);
console.log('[validate-clean] Aqua Fantasia v6.2.0 clean asset runtime OK');
console.log(JSON.stringify({ ok: true, version: '6.2.0', files: files.length, atlasFrames: Object.keys(atlas.frames).length }, null, 2));
