import { readFileSync, existsSync } from 'node:fs';

const read = (p) => readFileSync(p, 'utf8');
const checks = [];
const add = (ok, msg) => checks.push({ ok, msg });

const pkg = JSON.parse(read('package.json'));
const data = read('src/data.ts');
const main = read('src/main.ts');
const css = read('src/styles.css');
const shader = read('src/core/UnderwaterWebglLayer.ts');
const sw = read('public/sw.js');

add(pkg.version === '1.0.5', 'package version is 1.0.5');
add(data.includes("APP_VERSION = '1.0.5'"), 'APP_VERSION is 1.0.5');
add(data.includes('aqua-fantasia-v1.0.5-fishing-depth-visibility-polish'), 'cache name updated in data');
add(sw.includes('aqua-fantasia-v1.0.5-fishing-depth-visibility-polish'), 'service worker cache updated');
add(main.includes('v105-fishing-depth-fishing'), 'fishing screen has v105 class');
add(main.includes('this.bgSprite.alpha = 0.78'), 'Pixi background is transparent enough for water layer');
add(main.includes('world.sortableChildren = true'), 'Pixi layer ordering is explicit');
add(main.includes('this.player.zIndex = 20'), 'player is above background');
add(css.includes('v1.0.5 FISHING DEPTH VISIBILITY POLISH'), 'v105 CSS block exists');
add(css.includes('.fishing-screen.v105-fishing-depth-fishing .fishing-3d-ambient'), 'fishing water layer has v105 rules');
add(css.includes('z-index: 0 !important') && css.includes('.fishing-screen.v105-fishing-depth-fishing .v840-fishing-stage'), 'water is behind stage and stage is layered');
add(css.includes('.fishing-screen.v105-fishing-depth-fishing .fishing-stage::after'), 'gameplay focus overlay exists');
add(css.includes('.fishing-screen.v105-fishing-depth-fishing .tension-track') && css.includes('height: 22px'), 'reel gauge readability improved');
add(css.includes('.fishing-screen.v105-fishing-depth-fishing .v840-stage-ui .cast-button'), 'cast button lane is patched');
add(shader.includes('for (int i = 0; i < 13; i++)'), 'bubble density improved');
add(shader.includes('float ca3 = causticCell'), 'third caustic layer added');
add(shader.includes('gl_FragColor = vec4(color, 0.82);'), 'shader alpha reduced for gameplay readability');
add(existsSync('README.md'), 'README.md exists');

const failed = checks.filter((c) => !c.ok);
for (const check of checks) console.log(`${check.ok ? 'PASS' : 'FAIL'} ${check.msg}`);
if (failed.length) {
  console.error(`v1.0.5 validation failed: ${failed.length} issue(s)`);
  process.exit(1);
}
console.log('v1.0.5 fishing depth visibility polish checks passed.');
