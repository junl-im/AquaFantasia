import fs from 'node:fs';

const read = (p) => fs.readFileSync(p, 'utf8');
const pass = (msg) => console.log(`PASS ${msg}`);
const fail = (msg) => {
  console.error(`FAIL ${msg}`);
  process.exitCode = 1;
};
const has = (file, needle, msg) => read(file).includes(needle) ? pass(msg) : fail(msg);
const exists = (file, msg) => fs.existsSync(file) ? pass(msg) : fail(`${msg} missing`);

const pkg = JSON.parse(read('package.json'));
const rootMarkdown = fs.readdirSync('.').filter((name) => name.endsWith('.md'));
if (pkg.version === '2.0.2') pass('package version is 2.0.2'); else fail('package version must be 2.0.2');
if (rootMarkdown.length === 1 && rootMarkdown[0] === 'README.md') pass('root docs are README.md only'); else fail(`root docs must be README.md only: ${rootMarkdown.join(', ')}`);

has('src/data.ts', "APP_VERSION = '2.0.2'", 'APP_VERSION is 2.0.2');
has('src/data.ts', 'aqua-fantasia-v2.0.2-mobile-rpg-controls', 'data cache is v2.0.2');
has('public/sw.js', 'aqua-fantasia-v2.0.2-mobile-rpg-controls', 'service worker cache is v2.0.2');
has('public/offline.html', 'v2.0.2', 'offline page badge is v2.0.2');
has('README.md', 'AquaFantasia v2.0.2', 'README documents v2.0.2');
has('README.md', '문서 정책', 'README contains document policy');
has('src/main.ts', "dataset.villagePolish = 'v202-mobile-rpg-controls'", 'v2.0.2 polish dataset is wired');
has('src/main.ts', 'data-village-joystick', 'analog joystick markup exists');
has('src/main.ts', 'data-village-build-open', 'small build button exists');
has('src/main.ts', 'data-v2-objective', 'objective tracker markup exists');
has('src/main.ts', '좌측 조이스틱 이동', 'village guide reflects joystick controls');
has('src/villageWorld.ts', 'bindJoystick', 'joystick binding exists');
has('src/villageWorld.ts', 'movePlayerByJoystick', 'joystick movement exists');
has('src/villageWorld.ts', 'this.zoom(0.11, true)', 'zoom in focuses player');
has('src/villageWorld.ts', 'this.zoom(-0.11, true)', 'zoom out focuses player');
has('src/villageWorld.ts', 'player_sd_front.png', 'SD player sprite is used');
has('src/styles.css', '.v2-build-tray-open .v2-build-tray', 'popup build tray CSS exists');
has('src/styles.css', '.v2-joystick', 'joystick CSS exists');
has('src/styles.css', 'html[data-village-polish="v202-mobile-rpg-controls"]', 'v2.0.2 polish CSS selector exists');

const requiredAssets = [
  'public/assets/v22/characters/player_sd_front.png',
  'public/assets/v22/characters/npc_chief.png',
  'public/assets/v22/characters/npc_merchant.png',
  'public/assets/v22/characters/npc_guild.png',
  'public/assets/v22/characters/npc_captain.png',
  'public/assets/v22/characters/npc_tourist.png',
  'public/assets/v22/characters/npc_vip.png',
  'public/assets/v22/icons/nav_bag.png',
  'public/assets/v22/icons/nav_quest.png',
  'public/assets/v22/icons/nav_map.png',
  'public/assets/v22/icons/nav_village.png',
  'public/assets/v22/generated/01_UI_Core_Pack.png',
  'public/assets/v22/generated/02_Icon_Pack.png',
  'public/assets/v22/generated/05_Building_Interior_Inn.png',
  'public/assets/v22/generated/09_Fishing_Minigame_UI.png',
];
for (const asset of requiredAssets) exists(asset, `${asset} exists`);

if (process.exitCode) process.exit(process.exitCode);
console.log('v2.0.2 mobile RPG controls cleanup checks passed');
