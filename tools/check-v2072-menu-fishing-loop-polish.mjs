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
  console.error(`[v2072] ${msg}`);
  process.exit(1);
};
const must = (condition, msg) => { if (!condition) fail(msg); };
const has = (source, needle, msg) => must(source.includes(needle), msg);

must(/^2\.0\.\d+$/.test(VERSION), 'package.json version must stay on 2.0.x');
must(Number(VERSION.split('.')[2]) >= 72, 'v2072 guard only applies to v2.0.72+ packages');
must(lock.version === VERSION && lock.packages?.['']?.version === VERSION, 'package-lock version mismatch');
has(data, `APP_VERSION = '${VERSION}'`, 'APP_VERSION mismatch');
has(data, CACHE_PREFIX, 'src/data.ts cache version mismatch');
has(sw, CACHE_PREFIX, 'service worker cache version mismatch');
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

for (const marker of [
  'v2065-unified-card-frame-polish',
  'v2066-risk-regression-sweep',
  'v2067-start-menu-loop-card-restore',
  'v2069-start-menu-card-audit',
  'v2070-menu-page-structure-audit',
  'installRuntimeAquaPageAudit',
  'v2070-aqua-page-card',
  'v2070-aqua-page-screen'
]) {
  must(!main.includes(marker) && !css.includes(marker), `broken broad UI layer remains active: ${marker}`);
}

has(main, "document.documentElement.dataset.v2072MenuFishingLoopPolish = 'v2072-menu-card-fishing-loop-polish'", 'v2072 boot dataset missing');
has(main, 'v2072-loop-polish-village-screen', 'v2072 village loop scope class missing');
has(main, 'v2072-menu-card-screen', 'v2072 menu card scope class missing');
has(main, "root.dataset.v2072MenuCard = 'character-build-style-aqua-card'", 'v2072 menu card dataset missing');
has(main, 'v2072-fishing-playable-screen', 'v2072 fishing scope class missing');

if (Number(VERSION.split('.')[2]) >= 75) {
  must(!main.includes('aria-label="성장 루프 펼치기"'), 'v2.0.75+ should not expose a duplicate loop toggle');
  has(main, 'v2075-expedition-dock', 'v2.0.75+ single expedition dock missing');
  has(main, 'v2075-expedition-loop-summary', 'v2.0.75+ growth loop summary should be folded into expedition panel');
  has(main, 'aria-expanded="false"><span>개척</span>', 'v2.0.75+ slim expedition aria collapsed markup missing');
} else {
  has(main, 'aria-expanded="false">루프</button><div class="v2051-loop-body" aria-hidden="true"', 'growth loop aria collapsed markup missing');
  has(main, 'aria-expanded="false">개척</button><div class="v2051-loop-body" aria-hidden="true"', 'expedition aria collapsed markup missing');
}
has(main, "other.querySelector<HTMLElement>('.v2051-loop-toggle')?.setAttribute('aria-expanded', 'false')", 'loop sibling aria-expanded reset missing');
has(main, "panel.querySelector<HTMLElement>('.v2051-loop-toggle')?.setAttribute('aria-expanded', String(willOpen))", 'loop toggle aria-expanded update missing');
has(main, "panel?.querySelector<HTMLElement>('.v2051-loop-toggle')?.setAttribute('aria-expanded', 'false')", 'loop close aria-expanded reset missing');

has(main, "this.reelConsole?.classList.add('hidden')", 'reel console hide/reset missing');
has(main, "this.reelConsole?.classList.remove('is-winding', 'is-releasing', 'is-safe', 'is-danger', 'v2063-overlap'", 'reel console state cleanup missing');
has(main, "nav.style.setProperty('display', 'flex', 'important')", 'bottom dock flex restore missing');

has(css, 'html[data-v2072-menu-fishing-loop-polish="v2072-menu-card-fishing-loop-polish"]', 'v2072 CSS root selector missing');
has(css, '--v2072-card-bg', 'v2072 aqua card variables missing');
has(css, '.runtime-menu-screen.v2072-menu-card-screen', 'v2072 runtime menu card CSS missing');
has(css, '.runtime-menu-screen.v2072-menu-card-screen .runtime-hud', 'v2072 menu HUD CSS missing');
has(css, '.runtime-menu-screen.v2072-menu-card-screen .runtime-content', 'v2072 menu content CSS missing');
has(css, ':is(.v2051-loop-mini.open,.v2051-expedition-mini.open) .v2051-loop-body', 'v2072 loop popup open body CSS missing');
has(css, '.v2072-loop-polish-village-screen .v2-world-controls', 'v2072 world controls CSS missing');
has(css, 'body:is(.v2032-character-panel-open', 'character/interior overlay guard CSS missing');
has(css, ':is(.v2-world-controls,.bottom-nav.fixed-root-nav)', 'world controls and dock hide rule missing');
has(css, 'body[data-screen="village"] .bottom-nav.fixed-root-nav', 'village dock safe CSS missing');
has(css, '.fishing-screen.v2072-fishing-playable-screen', 'v2072 fishing CSS scope missing');
has(css, '.fishing-screen.v2072-fishing-playable-screen .cast-button', 'v2072 fishing start button CSS missing');
has(css, '.cast-button :is(.v2020-cast-button-art,.v2021-cast-pill-art)', 'v2072 cast art cleanup CSS missing');
has(css, '.bite-callout :is(img,picture,svg)', 'v2072 bite popup image cleanup CSS missing');
has(css, '.bite-callout::before', 'v2072 bite popup pseudo cleanup CSS missing');
has(css, '.v2055-reel-console', 'v2072 reel console CSS missing');

has(villageWorld, 'ACTOR_DIRECTION_TEXTURE_FIX[direction] ?? direction', 'character direction correction fallback changed/missing');
has(villageWorld, './assets/v2047/characters/player_${direction}.png', 'v2047 direction texture path changed/missing');
has(villageWorld, 'actorDirectionQaPasses()', 'character direction QA guard missing');

console.log('[v2072] menu/fishing/loop polish checks passed.');
