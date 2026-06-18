import { readFileSync, existsSync, readdirSync } from 'node:fs';

const root = process.cwd();
const read = (path) => readFileSync(`${root}/${path}`, 'utf8');
const required = [
  'public/assets/v2012/characters/player_south.png',
  'public/assets/v2012/characters/player_north.png',
  'public/assets/v2012/characters/player_east.png',
  'public/assets/v2012/characters/player_west.png',
  'public/assets/v2012/characters/player_northeast.png',
  'public/assets/v2012/characters/player_northwest.png',
  'public/assets/v2012/characters/player_southeast.png',
  'public/assets/v2012/characters/player_southwest.png',
  'public/assets/v2012/characters/chief_south.png',
  'public/assets/v2012/characters/merchant_south.png',
  'public/assets/v2012/characters/guild_south.png',
  'public/assets/v2012/characters/captain_south.png',
  'public/assets/v2012/props/dog_stand.png',
  'public/assets/v2012/props/cat_sit.png',
  'public/assets/v2012/props/seagull_stand.png',
  'public/assets/v2012/props/duck_swim.png',
];
for (const file of required) {
  if (!existsSync(`${root}/${file}`)) throw new Error(`Missing v2.0.13 required asset: ${file}`);
}
const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '2.0.13') throw new Error(`package version mismatch: ${pkg.version}`);
if (!pkg.scripts.validate.includes('check-v2013-direction-dock-collision-fix')) throw new Error('validate script does not use v2.0.13 checker');
const data = read('src/data.ts');
if (!data.includes("APP_VERSION = '2.0.13'")) throw new Error('APP_VERSION is not v2.0.13');
if (!data.includes('v2.0.13-direction-dock-collision-fix')) throw new Error('CACHE_NAME is not v2.0.13');
const main = read('src/main.ts');
for (const token of ['v2013-wing-dock-nav', 'v2013-menu-safe-screen', 'v2013-world-safe-screen', 'right-bottom-wing-v2013']) {
  if (!main.includes(token)) throw new Error(`v2.0.13 main token missing: ${token}`);
}
const world = read('src/villageWorld.ts');
for (const token of ['ACTOR_DIRECTION_TEXTURE_FIX', 'occupiedTiles', 'BUILDING_COLLISION_FRONT_TRIM', 'ACTOR_DIRECTION_TEXTURES', 'actorDirectionFromVector']) {
  if (!world.includes(token)) throw new Error(`v2.0.13 world token missing: ${token}`);
}
const css = read('src/styles.css');
for (const token of ['v2.0.13 Direction/dock/collision bugfix', 'v2013-wing-dock-nav', '--v2013-dock-bottom', 'touch-action: pan-y']) {
  if (!css.includes(token)) throw new Error(`v2.0.13 CSS token missing: ${token}`);
}
const readme = read('README.md');
if (!readme.includes('## v2.0.13 변경사항')) throw new Error('README v2.0.13 section missing');
if (readdirSync(root).some((name) => name.endsWith('_NOTES.md'))) throw new Error('Unexpected NOTES md in project root');
console.log('[AquaFantasia] v2.0.13 direction/dock/collision validation passed.');
