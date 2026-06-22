import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => {
  console.error(`[v2083] ${message}`);
  process.exit(1);
};

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const data = read('src/data.ts');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const readme = read('README.md');
const main = read('src/main.ts');
const world = read('src/villageWorld.ts');
const validateScript = pkg.scripts?.validate ?? '';

if (pkg.version !== '2.0.83') fail('package.json version must be 2.0.83');
if (lock.version !== '2.0.83' || lock.packages?.['']?.version !== '2.0.83') fail('package-lock version must be 2.0.83');
if (!data.includes("APP_VERSION = '2.0.83'")) fail('APP_VERSION must be 2.0.83');
if (!data.includes('aqua-fantasia-v2.0.83-village-hitbox-feel')) fail('data cache name must be v2.0.83');
if (!sw.includes('aqua-fantasia-v2.0.83-village-hitbox-feel')) fail('service worker cache must be v2.0.83');
if (!offline.includes('v2.0.83')) fail('offline badge must mention v2.0.83');
if (!readme.startsWith('# AquaFantasia v2.0.83')) fail('README top version must be v2.0.83');
if (!validateScript.includes('check-v2083-village-hitbox-feel.mjs')) fail('validate must run v2083 check');

for (const token of [
  "dataset.v2083VillageHitboxFeel = 'v2083-village-hitbox-feel'",
  'v2083-village-hitbox-feel-screen',
]) {
  if (!main.includes(token)) fail(`missing main.ts v2083 marker: ${token}`);
}

for (const token of [
  'const BUILDING_HITBOX_FRONT_MARGIN = 1;',
  'const BUILDING_HITBOX_SIDE_MARGIN = 0.24;',
  'type VillagePointerHit',
  "dataset.v2083VillageHitboxFeel = 'world-pointer-building-footprint-score'",
  'private pointerToStagePoint(ev: PointerEvent): PointerPoint',
  'private pointerToWorldPoint(ev: PointerEvent): PointerPoint',
  'private pointerHitFromEvent(ev: PointerEvent): VillagePointerHit',
  'this.activePointers.set(ev.pointerId, this.pointerToStagePoint(ev));',
  'const building = this.findBuildingNear(hit.x, hit.y, hit.worldX, hit.worldY);',
  'private buildingFocusTile(building:',
  'private buildingHitScore(building: VillageBuildingSave',
  'Number.POSITIVE_INFINITY',
  'world-pointer-building-footprint-score',
]) {
  if (!world.includes(token)) fail(`missing villageWorld v2083 hitbox token: ${token}`);
}

for (const directionToken of [
  'ACTOR_DIRECTION_TEXTURE_FIX',
  'ACTOR_DIRECTION_TEXTURES',
  'actorDirectionFromVector',
  'actorTextureUrl',
  'actorDirectionQaPasses',
]) {
  if (!world.includes(directionToken)) fail(`character direction guard token removed: ${directionToken}`);
}

for (const phrase of [
  '마을 클릭 좌표',
  '건물 히트박스 체감',
  'buildingHitScore',
]) {
  if (!readme.includes(phrase)) fail(`README must document v2083 work: ${phrase}`);
}

const banned = ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai'];
const lockText = read('package-lock.json');
const polluted = banned.filter((needle) => lockText.includes(needle));
if (polluted.length) fail(`forbidden registry strings in package-lock: ${polluted.join(', ')}`);

const rootMarkdown = fs.readdirSync('.').filter((name) => name.endsWith('.md'));
if (rootMarkdown.length !== 1 || rootMarkdown[0] !== 'README.md') fail(`root markdown must be README.md only: ${rootMarkdown.join(', ')}`);

console.log('[v2083] village hitbox feel checks passed.');
