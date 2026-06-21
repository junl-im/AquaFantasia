import { readdirSync, readFileSync } from 'node:fs';

const read = (p) => readFileSync(p, 'utf8');
const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const main = read('src/main.ts');
const css = read('src/styles.css');
const data = read('src/data.ts');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const readme = read('README.md');
const villageWorld = read('src/villageWorld.ts');
const lockRaw = read('package-lock.json');

const VERSION = '2.0.73';
const CACHE = 'aqua-fantasia-v2.0.73-fishing-core-feel-update';
const fail = (msg) => {
  console.error(`[v2073] ${msg}`);
  process.exit(1);
};
const must = (condition, msg) => { if (!condition) fail(msg); };
const has = (source, needle, msg) => must(source.includes(needle), msg);

must(pkg.version === VERSION, 'package.json version mismatch');
must(lock.version === VERSION && lock.packages?.['']?.version === VERSION, 'package-lock version mismatch');
has(data, `APP_VERSION = '${VERSION}'`, 'APP_VERSION mismatch');
has(data, CACHE, 'src/data.ts cache version mismatch');
has(sw, CACHE, 'service worker cache version mismatch');
has(offline, `v${VERSION}`, 'offline badge/version mismatch');
has(readme, `# AquaFantasia v${VERSION}`, 'README title version mismatch');
has(readme, `## v${VERSION} 변경사항`, 'README changelog missing');

for (const forbidden of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  must(!lockRaw.includes(forbidden), `internal registry marker leaked into package-lock: ${forbidden}`);
}

const rootMarkdown = readdirSync('.', { withFileTypes: true })
  .filter((entry) => entry.isFile() && /\.md$/i.test(entry.name))
  .map((entry) => entry.name);
must(rootMarkdown.length === 1 && rootMarkdown[0] === 'README.md', 'root markdown files must be README.md only');

has(main, "document.documentElement.dataset.v2073FishingCoreFeel = 'v2073-fishing-core-feel-update'", 'v2073 boot dataset missing');
has(main, "type FishMood = 'calm' | 'pulling' | 'burst' | 'tired' | 'escaping'", 'FishMood state union missing');
has(main, 'FISH_MOOD_LABEL', 'fish mood label map missing');
has(main, 'private fishStamina = 100', 'fish stamina state missing');
has(main, 'private catchProgress = 0', 'catch progress state missing');
has(main, 'private escapePressure = 0', 'escape pressure state missing');
has(main, 'v2073-fishing-core-feel-screen', 'v2073 fishing screen scope class missing');
has(main, 'v2073-fishing-gauges', 'v2073 3-gauge markup missing');
has(main, 'data-v2073-catch-bar', 'catch gauge markup missing');
has(main, 'data-v2073-tension-bar', 'tension gauge markup missing');
has(main, 'data-v2073-stamina-bar', 'stamina/resistance gauge markup missing');
has(main, 'data-v2073-console-mood', 'console mood readout missing');
has(main, 'private advanceFishingBattle(now: number, dt: number)', 'fishing battle advancement method missing');
has(main, 'private setFishMood(mood: FishMood', 'fish mood setter missing');
has(main, "this.catchProgress >= 100", 'catch success no longer uses progress gauge');
has(main, "this.escapePressure >= 1", 'escape pressure fail condition missing');
has(main, "this.stageHost?.setAttribute('data-fish-mood', this.fishMood)", 'fish mood dataset initialization/update missing');
has(main, "this.stageHost?.setAttribute('data-fish-mood', this.fishMood)", 'fish mood dataset update missing');
has(main, "this.reelConsole?.classList.remove('is-winding', 'is-releasing', 'is-safe', 'is-danger', 'v2063-overlap', 'mood-calm'", 'mood class cleanup missing');

has(css, 'html[data-v2073-fishing-core-feel="v2073-fishing-core-feel-update"]', 'v2073 CSS root selector missing');
has(css, '.fishing-screen.v2073-fishing-core-feel-screen .v2073-fishing-gauges', '3-gauge CSS missing');
has(css, '[data-v2073-safe-window]', 'safe-window CSS missing');
has(css, '.v2073-console-readouts', 'console readout CSS missing');
has(css, '.reel-panel.mood-burst', 'burst mood visual CSS missing');
has(css, '.reel-panel.mood-tired', 'tired mood visual CSS missing');
has(css, '.reel-panel.mood-escaping', 'escaping mood visual CSS missing');

has(villageWorld, 'ACTOR_DIRECTION_TEXTURE_FIX[direction] ?? direction', 'character direction correction fallback changed/missing');
has(villageWorld, './assets/v2047/characters/player_${direction}.png', 'v2047 direction texture path changed/missing');
has(villageWorld, 'actorDirectionQaPasses()', 'character direction QA guard missing');

console.log('[v2073] fishing core feel checks passed.');
