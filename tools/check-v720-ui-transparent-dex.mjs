import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
const root = process.cwd();
let ok = true;
const fail = (msg) => { console.error('[check-v720]', msg); ok = false; };
const required = [
  'public/assets/screens/start_screen_clean_v720.webp',
  'public/assets/ui/v720_toggle_on.png',
  'public/assets/ui/v720_toggle_off.png',
  'public/assets/ui/v720_panel_clean.png',
  'reports/v7.2.0-total-ui-transparent-dex-audit.md'
];
for (const file of required) if (!fs.existsSync(path.join(root, file))) fail(`missing ${file}`);
const data = fs.readFileSync(path.join(root, 'src/data.ts'), 'utf8');
if (!data.includes("APP_VERSION = '7.2.0'")) fail('APP_VERSION mismatch');
if (!data.includes('aqua-fantasia-v7.2.0-total-ui-transparent-dex')) fail('cache mismatch');
const main = fs.readFileSync(path.join(root, 'src/main.ts'), 'utf8');
if (!main.includes('start_screen_clean_v720.webp')) fail('login art not upgraded');
if (!main.includes('v720-keep-toggle')) fail('login keep toggle class missing');
const css = fs.readFileSync(path.join(root, 'src/styles.css'), 'utf8');
for (const token of ['v7.2.0 TOTAL UI/UX', 'start_screen_clean_v720.webp', 'v720_toggle_on.png', 'dex-fish-orb']) if (!css.includes(token)) fail(`missing css token ${token}`);

function parsePngAlpha(file) {
  const buf = fs.readFileSync(file);
  const sig = '89504e470d0a1a0a';
  if (buf.subarray(0,8).toString('hex') !== sig) throw new Error('not png');
  let off = 8, width = 0, height = 0, colorType = 0, bitDepth = 0;
  const idats = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off); off += 4;
    const type = buf.subarray(off, off+4).toString('ascii'); off += 4;
    const data = buf.subarray(off, off+len); off += len + 4;
    if (type === 'IHDR') { width = data.readUInt32BE(0); height = data.readUInt32BE(4); bitDepth = data[8]; colorType = data[9]; }
    if (type === 'IDAT') idats.push(data);
    if (type === 'IEND') break;
  }
  if (bitDepth !== 8 || colorType !== 6) throw new Error(`unsupported PNG format bitDepth=${bitDepth} colorType=${colorType}`);
  const bpp = 4;
  const stride = width * bpp;
  const raw = zlib.inflateSync(Buffer.concat(idats));
  const out = Buffer.alloc(height * stride);
  let p = 0;
  for (let y=0;y<height;y++) {
    const filter = raw[p++];
    const row = raw.subarray(p, p+stride); p += stride;
    const prev = y === 0 ? null : out.subarray((y-1)*stride, y*stride);
    const cur = out.subarray(y*stride, (y+1)*stride);
    for (let x=0;x<stride;x++) {
      const left = x >= bpp ? cur[x-bpp] : 0;
      const up = prev ? prev[x] : 0;
      const upLeft = prev && x >= bpp ? prev[x-bpp] : 0;
      let val = row[x];
      if (filter === 1) val = (val + left) & 255;
      else if (filter === 2) val = (val + up) & 255;
      else if (filter === 3) val = (val + Math.floor((left + up) / 2)) & 255;
      else if (filter === 4) {
        const pval = left + up - upLeft;
        const pa = Math.abs(pval - left), pb = Math.abs(pval - up), pc = Math.abs(pval - upLeft);
        const pr = pa <= pb && pa <= pc ? left : (pb <= pc ? up : upLeft);
        val = (val + pr) & 255;
      }
      cur[x] = val;
    }
  }
  return { width, height, data: out };
}
const fishDir = path.join(root, 'public/assets/dex');
const fish = fs.readdirSync(fishDir).filter((name) => /^fish_.*\.png$/.test(name));
if (fish.length < 32) fail(`expected at least 32 fish pngs, got ${fish.length}`);
for (const name of fish) {
  const png = parsePngAlpha(path.join(fishDir, name));
  const corners = [[0,0],[png.width-1,0],[0,png.height-1],[png.width-1,png.height-1]];
  for (const [x,y] of corners) {
    const i = (png.width*y+x)*4+3;
    if (png.data[i] !== 0) fail(`${name} corner is not transparent`);
  }
  let opaque = 0;
  for (let i=3;i<png.data.length;i+=4) if (png.data[i] > 0) opaque++;
  const ratio = opaque / (png.width * png.height);
  if (ratio > 0.72) fail(`${name} looks like it still has a full background (${ratio.toFixed(2)})`);
}
if (!ok) process.exit(1);
console.log('[check-v720] total UI/UX and transparent 2.5D fish dex OK');
