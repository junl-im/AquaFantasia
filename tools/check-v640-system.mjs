import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
let ok = true;
const fail = (msg) => { console.error('[check-v640]', msg); ok = false; };
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const data = read('src/data.ts');
const main = read('src/main.ts');
const css = read('src/styles.css');
const sw = read('public/sw.js');
const workflow = read('.github/workflows/pages.yml');

const expectedAssets = [
  'public/assets/art/bg_glacier.webp', 'public/assets/art/bg_storm.webp',
  'public/assets/ui/gear_line_25d.png', 'public/assets/ui/shop_bait_25d.png', 'public/assets/ui/shop_oil_25d.png', 'public/assets/ui/shop_charm_25d.png',
  'public/assets/dex/fish_clown_card_25d.png', 'public/assets/dex/fish_leaf_25d.png', 'public/assets/dex/fish_lantern_25d.png', 'public/assets/dex/fish_shadow_25d.png', 'public/assets/dex/fish_lotus_25d.png', 'public/assets/dex/fish_nova_25d.png', 'public/assets/dex/fish_crystal_25d.png', 'public/assets/dex/fish_aurora_25d.png', 'public/assets/dex/fish_thunder_25d.png'
];
for (const asset of expectedAssets) if (!fs.existsSync(path.join(root, asset))) fail(`missing asset ${asset}`);

for (const token of ['CACHE_NAME', '6.4.0', 'glacier', 'storm', 'lineLevel', 'reward', 'weight']) if (!data.includes(token)) fail(`data token missing ${token}`);
for (const token of ['showResultCard', 'catch-result-card', 'safeZone', 'spawnTouchRing', 'updateUnlocks', 'screen.orientation', 'navigationUI']) if (!main.includes(token)) fail(`runtime token missing ${token}`);
for (const token of ['catch-result-card', 'safe-progress', 'caustic-overlay', 'cardShine', 'ringPop']) if (!css.includes(token)) fail(`css token missing ${token}`);
if (!sw.includes('bg_glacier.webp') || !sw.includes('gear_line_25d.png')) fail('service worker does not precache v6.4 critical assets');
if (workflow.includes('cache: npm')) fail('workflow must not require a lockfile cache');
if (!workflow.includes('node-version:')) fail('workflow must pin Node for GitHub Pages validation');

const atlas = JSON.parse(read('public/assets/atlas/aqua_fishing_atlas.json'));
if (Object.keys(atlas.frames ?? {}).length < 15) fail('atlas metadata too small for v6.4 asset expansion');

if (!ok) process.exit(1);
console.log('[check-v640] 2.5D asset/system compatibility OK');
console.log(JSON.stringify({ ok: true, mode: process.argv.includes('--audit') ? 'audit' : process.argv.includes('--runtime') ? 'runtime' : 'validate', assetCount: expectedAssets.length, atlasFrames: Object.keys(atlas.frames ?? {}).length }, null, 2));
