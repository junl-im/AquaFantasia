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

const VERSION = pkg.version;
const CACHE_PREFIX = `aqua-fantasia-v${VERSION}-`;
const fail = (msg) => {
  console.error(`[v2076] ${msg}`);
  process.exit(1);
};
const must = (condition, msg) => { if (!condition) fail(msg); };
const has = (source, needle, msg) => must(source.includes(needle), msg);

must(/^2\.0\.\d+$/.test(VERSION), 'package.json version must stay on 2.0.x');
must(Number(VERSION.split('.')[2]) >= 76, 'v2076 guard only applies to v2.0.76+ packages');
must(lock.version === VERSION && lock.packages?.['']?.version === VERSION, 'package-lock version mismatch');
has(data, `APP_VERSION = '${VERSION}'`, 'APP_VERSION mismatch');
has(data, CACHE_PREFIX, 'src/data.ts cache version mismatch');
has(sw, CACHE_PREFIX, 'service worker cache version mismatch');
has(offline, `v${VERSION}`, 'offline badge/version mismatch');
has(readme, `# AquaFantasia v${VERSION}`, 'README title version mismatch');
has(readme, `## v${VERSION} 변경사항`, 'README changelog missing');
has(pkg.scripts.validate, 'check-v2076-island-expansion-routes.mjs', 'v2076 validate hook missing');

for (const forbidden of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  must(!lockRaw.includes(forbidden), `internal registry marker leaked into package-lock: ${forbidden}`);
}

const rootMarkdown = readdirSync('.', { withFileTypes: true })
  .filter((entry) => entry.isFile() && /\.md$/i.test(entry.name))
  .map((entry) => entry.name);
must(rootMarkdown.length === 1 && rootMarkdown[0] === 'README.md', 'root markdown files must be README.md only');

has(main, "document.documentElement.dataset.v2076IslandExpansionRoutes = 'v2076-island-expansion-routes'", 'v2076 boot dataset missing');
has(main, 'type IslandExpansionStats = {', 'IslandExpansionStats type missing');
has(main, 'type ExpeditionRouteCandidate = {', 'ExpeditionRouteCandidate type missing');
has(main, 'phaseLabel: string;', 'phase label stat missing');
has(main, "surveyDone: boolean;", 'surveyDone stat missing');
has(main, "chartDone: boolean;", 'chartDone stat missing');
has(main, "settled: boolean;", 'settled stat missing');
has(main, 'private expeditionRouteCandidates(): ExpeditionRouteCandidate[]', 'route candidate method missing');
has(main, 'private expeditionCandidateMarkup(): string', 'candidate markup method missing');
has(main, 'private expeditionActionsMarkup(stats: IslandExpansionStats): string', 'action markup method missing');
has(main, 'private handleExpeditionAction(action: string): void', 'action handler missing');
has(main, 'private handleExpeditionRoute(key: RegionKey): void', 'route handler missing');
has(main, 'private bindExpeditionControls(root: HTMLElement): void', 'expedition control binding missing');
has(main, 'data-expedition-action="${action.key}"', 'action button data binding missing');
has(main, 'data-expedition-route="${route.key}"', 'route button data binding missing');
has(main, "this.save.missions.expedition_survey_done = true", 'survey action does not persist mission flag');
has(main, "this.save.missions.expedition_chart_done = true", 'chart action does not persist mission flag');
has(main, "this.save.missions.expedition_second_island = true", 'second island action does not persist mission flag');
has(main, "this.save.region = key", 'candidate selection does not set active region');
has(main, 'v2076-expedition-route-village-screen', 'v2076 village scope class missing');
has(main, 'v2076-expedition-route-menu-screen', 'v2076 menu scope class missing');
has(main, "root.dataset.v2076ExpeditionRoutes = 'route-candidates-action-buttons'", 'v2076 menu dataset missing');
has(main, 'v2076-expedition-card', 'map expedition card class missing');
has(main, "id: 'expeditionSurvey'", 'expedition survey mission missing');
has(main, "id: 'expeditionChart'", 'expedition chart mission missing');
has(main, "id: 'expeditionSecondIsland'", 'expedition second island mission missing');
has(main, "if (this.save.missions.expedition_chart_done) { unlocked.add('mangrove'); unlocked.add('glacier'); }", 'chart unlock branch missing');
has(main, "if (this.save.missions.expedition_second_island) { unlocked.add('storm'); unlocked.add('lunar'); unlocked.add('dimension'); }", 'second island unlock branch missing');

has(css, 'v2.0.76 island expansion route upgrade', 'v2076 CSS comment missing');
has(css, 'html[data-v2076-island-expansion-routes="v2076-island-expansion-routes"]', 'v2076 CSS root selector missing');
has(css, '.v2076-expedition-actions', 'expedition actions CSS missing');
has(css, '.v2076-expedition-candidates', 'candidate list CSS missing');
has(css, '.v2076-route-card', 'route card CSS missing');
has(css, '.v2076-route-card button[aria-disabled="true"]', 'disabled route button CSS missing');
has(css, '.runtime-menu-screen.v2076-expedition-route-menu-screen .v2076-expedition-card', 'map card scoped CSS missing');

has(villageWorld, 'ACTOR_DIRECTION_TEXTURE_FIX[direction] ?? direction', 'character direction correction fallback changed/missing');
has(villageWorld, './assets/v2047/characters/player_${direction}.png', 'v2047 direction texture path changed/missing');
has(villageWorld, 'actorDirectionQaPasses()', 'character direction QA guard missing');

console.log('[v2076] island expansion route checks passed.');
