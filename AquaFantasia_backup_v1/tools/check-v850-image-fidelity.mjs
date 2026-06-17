import fs from 'node:fs';
import path from 'node:path';

const read = (file) => fs.readFileSync(file, 'utf8');
const exists = (file) => fs.existsSync(file);
const size = (file) => fs.statSync(file).size;
const main = read('src/main.ts');
const css = read('src/styles.css');
const data = read('src/data.ts');
const sw = read('public/sw.js');
const pkg = JSON.parse(read('package.json'));

const must = [
  [pkg.version === '8.5.0', 'package version must be 8.5.0'],
  [data.includes("APP_VERSION = '8.5.0'"), 'APP_VERSION must be 8.5.0'],
  [data.includes('aqua-fantasia-v8.5.0-hd-image-fidelity'), 'cache name must be v8.5.0 hd image fidelity'],
  [main.includes("loginBg: './assets/v85/screens/start_screen_clean_v810.webp'"), 'login screen must use v85 hd art'],
  [main.includes("player: './assets/v85/characters/chibi_fisher_01_hd.png'"), 'Pixi player must use v85 hd character'],
  [main.includes('applyTextureFidelity'), 'Pixi textures must receive fidelity settings'],
  [main.includes('resolution: Math.min(window.devicePixelRatio || 1, this.compact ? 2 : 3)'), 'Pixi renderer must use higher DPR cap'],
  [data.includes('./assets/v85/bg/ocean_full.webp'), 'regions must use v85 portrait HD backgrounds'],
  [data.includes('./assets/v85/fish/fish_30.png'), 'fish dex must use v85 fish assets'],
  [data.includes('./assets/v85/icons/rod.png'), 'nav must use v85 icons'],
  [css.includes('v8.5.0 HD IMAGE FIDELITY PASS'), 'CSS HD fidelity layer must exist'],
  [css.includes("/assets/v85/buttons/btn_orange_normal_wide_blank.png"), 'cast button must use v85 sharp PNG button'],
  [css.includes("/assets/v85/ui/panel_bottom.png"), 'recent strip must use v85 sharp panel'],
  [sw.includes('aqua-fantasia-v8.5.0-hd-image-fidelity'), 'service worker cache must be v8.5.0'],
  [sw.includes('./assets/v85/bg/ocean_full.webp'), 'service worker must precache v85 backgrounds'],
];

for (const file of [
  'public/assets/v85/compositions/town.webp',
  'public/assets/v85/compositions/mission.webp',
  'public/assets/v85/bg/ocean_full.webp',
  'public/assets/v85/bg/deepsea_full.webp',
  'public/assets/v85/characters/chibi_fisher_01_hd.png',
  'public/assets/v85/fish/fish_01.png',
  'public/assets/v85/fish/fish_30.png',
  'public/assets/v85/icons/rod.png',
  'public/assets/v85/buttons/btn_orange_normal_wide_blank.png',
  'public/assets/v85/ui/panel_bottom.png',
  'public/assets/v85/manifest.v85.json',
]) {
  must.push([exists(file), `missing ${file}`]);
}

if (exists('public/assets/v85/compositions/town.webp')) must.push([size('public/assets/v85/compositions/town.webp') > 500_000, 'v85 town composition must not be over-compressed']);
if (exists('public/assets/v85/compositions/mission.webp')) must.push([size('public/assets/v85/compositions/mission.webp') > 500_000, 'v85 mission composition must not be over-compressed']);
if (exists('public/assets/v85/bg/deepsea_full.webp')) must.push([size('public/assets/v85/bg/deepsea_full.webp') > 500_000, 'v85 deepsea background must be high fidelity']);
if (exists('public/assets/v85/characters/chibi_fisher_01_hd.png')) must.push([size('public/assets/v85/characters/chibi_fisher_01_hd.png') > 300_000, 'v85 character must be high fidelity PNG']);

const failures = must.filter(([ok]) => !ok).map(([, label]) => label);
if (failures.length) {
  console.error('[v8.5.0 image fidelity check failed]');
  for (const failure of failures) console.error(' -', failure);
  process.exit(1);
}
console.log('[v8.5.0 image fidelity check] hd assets/css/pixi/cache guards passed');
