import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const fail = (msg) => { console.error(`[check-v830] ${msg}`); process.exit(1); };
const read = (p, mode = 'utf8') => {
  const f = path.join(root, p);
  if (!fs.existsSync(f)) fail(`missing ${p}`);
  return fs.readFileSync(f, mode);
};
const exists = (p) => { if (!fs.existsSync(path.join(root, p))) fail(`missing ${p}`); };
const data = read('src/data.ts');
const main = read('src/main.ts');
const css = read('src/styles.css');
const sw = read('public/sw.js');
const pkg = JSON.parse(read('package.json'));

function webpSize(file) {
  const b = read(file, null);
  if (b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP') fail(`${file} is not WEBP`);
  let offset = 12;
  while (offset + 8 <= b.length) {
    const type = b.toString('ascii', offset, offset + 4);
    const len = b.readUInt32LE(offset + 4);
    const dataStart = offset + 8;
    if (type === 'VP8X') {
      const width = 1 + b.readUIntLE(dataStart + 4, 3);
      const height = 1 + b.readUIntLE(dataStart + 7, 3);
      return { width, height };
    }
    if (type === 'VP8 ') {
      const width = b.readUInt16LE(dataStart + 6) & 0x3fff;
      const height = b.readUInt16LE(dataStart + 8) & 0x3fff;
      return { width, height };
    }
    if (type === 'VP8L') {
      const bits = b.readUInt32LE(dataStart + 1);
      const width = (bits & 0x3fff) + 1;
      const height = ((bits >> 14) & 0x3fff) + 1;
      return { width, height };
    }
    offset += 8 + len + (len % 2);
  }
  fail(`could not read WEBP size: ${file}`);
}

if (pkg.version !== '8.3.0') fail('package version mismatch');
if (!data.includes("APP_VERSION = '8.3.0'")) fail('APP_VERSION mismatch');
if (!data.includes('aqua-fantasia-v8.3.0-ui-polish-audit')) fail('cache name mismatch in data');
if (!sw.includes('aqua-fantasia-v8.3.0-ui-polish-audit')) fail('cache name mismatch in sw');

for (const p of [
  'public/assets/v13/compositions/town.webp',
  'public/assets/v13/compositions/fishing.webp',
  'public/assets/v13/compositions/gear.webp',
  'public/assets/v13/compositions/inventory.webp',
  'public/assets/v13/compositions/dex.webp',
  'public/assets/v13/compositions/shop.webp',
  'public/assets/v13/compositions/mission.webp',
  'public/assets/v13/compositions/ranking.webp',
  'public/assets/v13/reference/tab_ui_layout_map.json',
  'public/assets/v13/reference/UI_LAYOUT_GUIDE_KO.md',
  'public/assets/v12/screens/start_screen_clean_v810.webp',
  'public/assets/v12/buttons/btn_mint_normal_wide_blank.webp',
  'public/assets/v12/bg/ocean_portrait.webp',
  'public/assets/v12/icons/bobber.png'
]) exists(p);

for (const tab of ['town', 'fishing', 'gear', 'inventory', 'dex', 'shop', 'mission', 'ranking']) {
  const p = `public/assets/v13/compositions/${tab}.webp`;
  const size = webpSize(p);
  if (size.width !== 1080 || size.height !== 1920) fail(`${p} must be 1080x1920, got ${size.width}x${size.height}`);
}
const startSize = webpSize('public/assets/v12/screens/start_screen_clean_v810.webp');
if (startSize.width !== 1024 || startSize.height !== 1536) fail(`start screen must be 1024x1536, got ${startSize.width}x${startSize.height}`);

for (const token of [
  'start-design-surface',
  'v13-design-surface',
  'data-design="1024x1536"',
  'data-design="1080x1920"',
  "surface.insertAdjacentHTML('beforeend'",
  'v13-bottom-nav-hotspots',
  'width: max(min(100vw, 430px), calc(var(--app-height, 100svh) * 0.5625))',
  'min-width: 44px',
  'v810-keep-button'
]) {
  if (!css.includes(token) && !main.includes(token)) fail(`missing UI polish token: ${token}`);
}

for (const screen of ['village', 'fishing', 'gear', 'inventory', 'dex', 'shop', 'mission', 'ranking']) {
  if (!main.includes(`createV13Screen('${screen}')`) && !main.includes(`${screen}: './assets/v13/compositions/`)) fail(`missing v13 tab route: ${screen}`);
}

// Static tap-target sanity check for the reference design space. All declared v13 hotspots should be at least 44px on a 390x844 device after 9:16 cover scaling.
const re = /addV13Hotspot\([^,]+,\s*'([^']+)'\s*,\s*'[^']+'\s*,\s*\[(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\]/g;
const designHeight = 844;
const designWidth = designHeight * 9 / 16;
let count = 0;
let match;
while ((match = re.exec(main))) {
  const [, name, , , w, h] = match;
  const pxW = Number(w) / 1080 * designWidth;
  const pxH = Number(h) / 1920 * designHeight;
  if (pxW < 44 || pxH < 44) fail(`${name} tap target too small at 390x844 cover scale: ${pxW.toFixed(1)}x${pxH.toFixed(1)}`);
  count += 1;
}
if (count < 20) fail(`too few v13 hotspots detected: ${count}`);

console.log('[check-v830] UI polish, design-surface alignment, asset dimensions, and tap targets OK');
console.log(JSON.stringify({ ok: true, version: '8.3.0', v13Hotspots: count }, null, 2));
