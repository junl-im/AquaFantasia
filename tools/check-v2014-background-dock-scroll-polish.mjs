import { readFileSync, existsSync, readdirSync } from 'node:fs';

const root = process.cwd();
const read = (path) => readFileSync(`${root}/${path}`, 'utf8');
const required = [
  'public/assets/v2012/characters/player_south.png',
  'public/assets/v2012/characters/player_north.png',
  'public/assets/v2012/characters/player_east.png',
  'public/assets/v2012/characters/player_west.png',
  'public/assets/v209/props/wood_sign.png',
  'public/assets/v209/props/rope_wall.png',
  'public/assets/v209/props/stone_corner.png',
  'public/assets/v209/props/stone_curve.png',
  'public/assets/v209/props/stair_wide.png',
  'public/assets/v209/props/rope_corner.png',
];
for (const file of required) {
  if (!existsSync(`${root}/${file}`)) throw new Error(`Missing v2.0.14 required asset: ${file}`);
}
const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '2.0.14') throw new Error(`package version mismatch: ${pkg.version}`);
if (!pkg.scripts.validate.includes('check-v2014-background-dock-scroll-polish')) throw new Error('validate script does not use v2.0.14 checker');
const data = read('src/data.ts');
if (!data.includes("APP_VERSION = '2.0.14'")) throw new Error('APP_VERSION is not v2.0.14');
if (!data.includes('v2.0.14-background-dock-scroll-polish')) throw new Error('CACHE_NAME is not v2.0.14');
const main = read('src/main.ts');
for (const token of ['v2014-clean-village-screen', 'v2014-menu-scroll-screen', 'v2014-ghost-dock-nav', 'right-bottom-wing-v2014']) {
  if (!main.includes(token)) throw new Error(`v2.0.14 main token missing: ${token}`);
}
if (main.includes('aquafantasia_first_village_town_square_9x16.png')) throw new Error('old village art background is still mounted in HTML');
const world = read('src/villageWorld.ts');
for (const token of ['ACTOR_DIRECTION_TEXTURE_FIX', 'woodSign', 'ropeWall', 'stoneCorner', 'wideStairs', 'ropeCorner']) {
  if (!world.includes(token)) throw new Error(`v2.0.14 world token missing: ${token}`);
}
const css = read('src/styles.css');
for (const token of ['v2.0.14 Background/dock/scroll polish', 'v2014-ghost-dock-nav', '--v2014-dock-button', 'v2-build-grid', 'pointer-events: none', 'touch-action: pan-y']) {
  if (!css.includes(token)) throw new Error(`v2.0.14 CSS token missing: ${token}`);
}
const readme = read('README.md');
if (!readme.includes('## v2.0.14 변경사항')) throw new Error('README v2.0.14 section missing');
if (readdirSync(root).some((name) => name.endsWith('_NOTES.md'))) throw new Error('Unexpected NOTES md in project root');
console.log('[AquaFantasia] v2.0.14 background/dock/scroll polish validation passed.');
