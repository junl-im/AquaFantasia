import fs from 'node:fs';

const read = (p) => fs.readFileSync(p, 'utf8');
const pass = (msg) => console.log(`PASS ${msg}`);
const fail = (msg) => {
  console.error(`FAIL ${msg}`);
  process.exitCode = 1;
};
const has = (file, needle, msg) => read(file).includes(needle) ? pass(msg) : fail(msg);

read('src/main.ts').includes("dataset.villagePolish = 'v22-joystick-ui-polish'") || read('src/main.ts').includes("dataset.villagePolish = 'v21-lumina-village-polish'") ? pass('village polish dataset is wired') : fail('village polish dataset is missing');
has('src/main.ts', '루미나 베이', 'village identity is renamed to Lumina Bay');
has('src/main.ts', 'data-village-build-open', 'collapsible build tray open button exists');
has('src/main.ts', 'data-v2-objective', 'objective tracker markup exists');
has('src/villageWorld.ts', 'VILLAGE_DECORATIONS', 'village decoration layer data exists');
has('src/villageWorld.ts', 'renderDecorations', 'decorations render pass exists');
has('src/villageWorld.ts', 'updatePinchZoom', 'mobile pinch zoom support exists');
has('src/villageWorld.ts', 'showTileMarker', 'touch tile marker feedback exists');
has('src/villageWorld.ts', 'softFollowPlayer', 'soft camera follow exists');
has('src/styles.css', '.v2-build-tray-open .v2-build-tray', 'build tray collapsed/open CSS exists');
has('src/styles.css', '.v2-objective-card', 'objective card CSS exists');

const requiredAssets = [
  'public/assets/v2/village/sheets/main_player_8direction_and_actions.png',
  'public/assets/v2/village/sheets/npc_5types_8direction_and_sitting.png',
  'public/assets/v2/village/sheets/bench_lamp_planter_sign_core_props.png',
  'public/assets/v2/village/tilemaps/tileset_ground_80x80_style.png',
  'public/assets/v2/village/docs/final_pack/README_KR.md',
];
for (const asset of requiredAssets) {
  fs.existsSync(asset) ? pass(`${asset} exists`) : fail(`${asset} is missing`);
}

if (process.exitCode) process.exit(process.exitCode);
console.log('v2.1 Lumina village polish checks passed');
