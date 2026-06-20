import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => { console.error(`[v2056-motion-tile-polish] ${message}`); process.exit(1); };
const must = (condition, message) => { if (!condition) fail(message); };
const has = (source, token, label = token) => must(source.includes(token), `missing ${label}`);

const pkg = JSON.parse(read('package.json'));
const data = read('src/data.ts');
const main = read('src/main.ts');
const world = read('src/villageWorld.ts');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const readme = read('README.md');
const lock = read('package-lock.json');

must(/^2\.0\.(5[6-9]|[6-9][0-9])$/.test(pkg.version), 'package.json version must preserve v2.0.56+ lineage');
must(/APP_VERSION = '2\.0\.(5[6-9]|[6-9][0-9])'/.test(data), 'APP_VERSION must preserve v2.0.56+ lineage');
must(/aqua-fantasia-v2\.0\.(5[6-9]|[6-9][0-9])/.test(data), 'data cache must preserve v2.0.56+ lineage');
must(/aqua-fantasia-v2\.0\.(5[6-9]|[6-9][0-9])/.test(sw), 'sw cache must preserve v2.0.56+ lineage');
must(/v2\.0\.(5[6-9]|[6-9][0-9])/.test(offline), 'offline badge must preserve v2.0.56+ lineage');
has(readme, `# AquaFantasia v${pkg.version}`, 'README title current version');
has(readme, `## v${pkg.version}`, 'README changelog current version');
has(pkg.scripts.validate, 'check-v2056-motion-tile-polish.mjs', 'v2056 validate hook');

for (const token of [
  "dataset.v2056MotionTilePolish = 'v2056-motion-tile-polish'",
  'v2056-motion-tile-village-screen',
  'v2056-motion-tile-fishing-screen',
]) has(main, token, `main token ${token}`);

for (const token of [
  'type DecorationMotionBase',
  'decorationMotionBases = new WeakMap',
  "dataset.v2056MotionTilePolish = 'pet-footstep-steam-no-drift'",
  'footprintGround(x: number, y: number, w = 1, h = 1)',
  'actorGround(x: number, y: number)',
  'decorationGround(x: number, y: number)',
  "item.name = `deco-${deco.kind}`",
  "kind === 'steam' || kind === 'cookingPot'",
  "item.getChildByName('steam-puffs')",
  '/dog|cat|walkingCat/i.test(kindName)',
  '!/sleepingDog/i.test(kindName)',
  'item.position.set(base.x, base.y)',
  'actor.shadow.scale.set(shadowPulse, 1 / shadowPulse)',
]) has(world, token, `world token ${token}`);


must(
  world.includes('actor.body.position.y = bob') || world.includes('actor.body.position.y = 0;') || world.includes('actor.body.position.y = actor.groundOffset;'),
  'actor body Y must be explicitly managed by the motion pass'
);

must(!/item\.y \+=|item\.x \+=/.test(world), 'decoration animation must not cumulatively drift item x/y');
for (const token of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  must(!lock.includes(token), `package-lock contains forbidden registry token ${token}`);
}
const rootMarkdown = fs.readdirSync('.').filter((name) => name.toLowerCase().endsWith('.md'));
must(rootMarkdown.length === 1 && rootMarkdown[0] === 'README.md', 'root must contain README.md only');
const forbiddenNotes = fs.readdirSync('.', { recursive: true }).filter((name) => /_NOTES\.md$/i.test(String(name)));
must(forbiddenNotes.length === 0, 'must not create *_NOTES.md files');
console.log('[AquaFantasia] v2.0.56 motion/tile polish validation passed.');
