import { readFileSync, existsSync, readdirSync } from 'node:fs';

const root = process.cwd();
const read = (path) => readFileSync(`${root}/${path}`, 'utf8');
const required = [
  'public/assets/v2012/characters/player_south.png',
  'public/assets/v2012/characters/player_north.png',
  'public/assets/v2012/characters/player_east.png',
  'public/assets/v2012/characters/player_west.png',
  'public/assets/v2012/characters/chief_south.png',
  'public/assets/v2012/characters/merchant_south.png',
  'public/assets/v2012/characters/guild_south.png',
  'public/assets/v2012/characters/captain_south.png',
  'public/assets/v2012/props/dog_stand.png',
  'public/assets/v2012/props/cat_sit.png',
  'public/assets/v2012/props/seagull_stand.png',
  'public/assets/v2012/props/duck_swim.png',
  'public/assets/v2012/props/tree_cherry.png',
  'public/assets/v2012/props/tree_maple.png',
  'public/assets/v2012/props/big_splash.png',
];
for (const file of required) {
  if (!existsSync(`${root}/${file}`)) throw new Error(`Missing v2.0.12 asset: ${file}`);
}
const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '2.0.12') throw new Error(`package version mismatch: ${pkg.version}`);
if (!pkg.scripts.validate.includes('check-v2012-asset-character-world-polish')) throw new Error('validate script does not use v2.0.12 checker');
const data = read('src/data.ts');
if (!data.includes("APP_VERSION = '2.0.12'")) throw new Error('APP_VERSION is not v2.0.12');
if (!data.includes('v2.0.12-asset-character-world-polish')) throw new Error('CACHE_NAME is not v2.0.12');
const world = read('src/villageWorld.ts');
for (const token of ['ACTOR_DIRECTION_TEXTURES', 'actorDirectionFromVector', 'setActorDirection', 'dog_stand.png', 'tree_cherry.png', 'swimmingDuck']) {
  if (!world.includes(token)) throw new Error(`v2.0.12 world token missing: ${token}`);
}
if (world.includes('setActorFacing(')) throw new Error('legacy setActorFacing should not remain');
const css = read('src/styles.css');
if (!css.includes('v2.0.12 Character/world asset polish')) throw new Error('v2.0.12 CSS block missing');
const readme = read('README.md');
if (!readme.includes('## v2.0.12 변경사항')) throw new Error('README v2.0.12 section missing');
if (readdirSync(root).some((name) => name.endsWith('_NOTES.md'))) throw new Error('Unexpected NOTES md in project root');
console.log('[AquaFantasia] v2.0.12 asset/character/world polish validation passed.');
