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
const fail = (msg) => { console.error(`[v2079] ${msg}`); process.exit(1); };
const must = (condition, msg) => { if (!condition) fail(msg); };
const has = (source, needle, msg) => must(source.includes(needle), msg);
const notHas = (source, needle, msg) => must(!source.includes(needle), msg);

must(/^2\.0\.\d+$/.test(VERSION), 'package.json version must stay on 2.0.x');
must(Number(VERSION.split('.')[2]) >= 79, 'v2079 guard only applies to v2.0.79+ packages');
must(lock.version === VERSION && lock.packages?.['']?.version === VERSION, 'package-lock version mismatch');
has(data, `APP_VERSION = '${VERSION}'`, 'APP_VERSION mismatch');
has(data, CACHE_PREFIX, 'src/data.ts cache version mismatch');
has(sw, CACHE_PREFIX, 'service worker cache version mismatch');
has(offline, `v${VERSION}`, 'offline badge/version mismatch');
has(readme, `# AquaFantasia v${VERSION}`, 'README title version mismatch');
has(readme, `## v${VERSION} 변경사항`, 'README changelog missing');
has(pkg.scripts.validate, 'check-v2079-aqua-card-object-layout-audit.mjs', 'v2079 validate hook missing');

for (const forbidden of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  must(!lockRaw.includes(forbidden), `internal registry marker leaked into package-lock: ${forbidden}`);
}

const rootMarkdown = readdirSync('.', { withFileTypes: true })
  .filter((entry) => entry.isFile() && /\.md$/i.test(entry.name))
  .map((entry) => entry.name);
must(rootMarkdown.length === 1 && rootMarkdown[0] === 'README.md', 'root markdown files must be README.md only');

has(main, "document.documentElement.dataset.v2079AquaCardObjectAudit = 'v2079-aqua-card-object-layout-audit'", 'v2079 boot dataset missing');
has(main, "root.dataset.v2079AquaCardObjectAudit = 'internal-card-spacing-scroll-object-audit'", 'v2079 menu dataset missing');
has(main, 'v2079-aqua-detail-screen', 'runtime menu v2079 scope class missing');
has(main, 'v2079-village-object-audit-screen', 'village v2079 scope class missing');
has(main, '.v2079-scroll-zone', 'v2079 scroll zone selector missing');
has(main, '.v206-inventory-dashboard', 'inventory dashboard scroll target missing');
has(main, '.v204-map-ocean', 'map drag scroll target missing');
has(main, '.v206-quest-npc-board', 'quest npc board scroll target missing');
has(main, '.runtime-card-list', 'generic runtime card list scroll target missing');

has(css, 'v2.0.79 Aqua Card Object/Layout Audit', 'v2079 CSS comment missing');
has(css, 'html[data-v2079-aqua-card-object-audit="v2079-aqua-card-object-layout-audit"]', 'v2079 CSS root selector missing');
has(css, '--aqua-card-inner-gap', 'v2079 aqua card spacing variable missing');
has(css, '.runtime-menu-screen.v2079-aqua-detail-screen .runtime-content.aqua-card-page', 'v2079 runtime content CSS missing');
has(css, 'display: flex !important', 'runtime content stack display missing');
has(css, 'scrollbar-gutter: stable both-edges !important', 'scrollbar gutter stabilization missing');
has(css, 'grid-template-columns: clamp(52px, 14vw, 72px) minmax(0, 1fr) auto', 'hero card anti-overlap grid missing');
has(css, '-webkit-line-clamp: 2 !important', 'hero/HUD description clamp missing');
has(css, 'grid-template-columns: repeat(auto-fit, minmax(84px, 1fr))', 'dashboard auto-fit grid missing');
has(css, 'width: min(196px, calc(100vw - 138px))', 'shorter expedition bar width missing');
has(css, 'top: calc(max(7px, env(safe-area-inset-top)) + 76px)', 'closer expedition bar top missing');
has(css, 'z-index: 260 !important', 'expedition bar lower z-index missing');
has(css, 'z-index: 760 !important', 'expedition popup lower-than-dialog z-index missing');
has(css, 'visibility: hidden !important', 'expedition bar must fully yield under panels');
has(css, '.v203-interior-card', 'building interior card polish missing');
has(css, 'object-fit: contain !important', 'building interior image containment missing');
has(css, 'touch-action: manipulation !important', 'button touch manipulation missing');

has(villageWorld, 'const V2079_HIDDEN_DECORATION_KEYS = new Set', 'v2079 hidden decoration audit set missing');
has(villageWorld, 'that can look half-clipped after the crystal lamp replacement', 'v2079 object audit reason comment missing');
has(villageWorld, 'V2079_HIDDEN_DECORATION_KEYS.has(key)', 'v2079 hidden decoration set not applied');
has(villageWorld, 'lamp: 92', 'lamp target height audit missing');
has(villageWorld, 'goldLantern: 68', 'gold lantern target height audit missing');
has(villageWorld, "deco.kind === 'lamp' || deco.kind === 'goldLantern'", 'lamp scale clamp missing');
has(villageWorld, '/lamp|goldLantern|crystal/i.test(kind)', 'lamp ground offset correction missing');
notHas(villageWorld, "score: 55,\n    kind: 'prop',\n    kind: 'prop'", 'fountain duplicate kind property still present');
has(villageWorld, 'ACTOR_DIRECTION_TEXTURE_FIX[direction] ?? direction', 'character direction correction fallback changed/missing');
has(villageWorld, './assets/v2047/characters/player_${direction}.png', 'v2047 direction texture path changed/missing');
has(villageWorld, 'actorDirectionQaPasses()', 'character direction QA guard missing');

console.log('[v2079] aqua card object/layout audit checks passed.');
