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
  console.error(`[v2075] ${msg}`);
  process.exit(1);
};
const must = (condition, msg) => { if (!condition) fail(msg); };
const has = (source, needle, msg) => must(source.includes(needle), msg);

must(/^2\.0\.\d+$/.test(VERSION), 'package.json version must stay on 2.0.x');
must(Number(VERSION.split('.')[2]) >= 75, 'v2075 guard only applies to v2.0.75+ packages');
must(lock.version === VERSION && lock.packages?.['']?.version === VERSION, 'package-lock version mismatch');
has(data, `APP_VERSION = '${VERSION}'`, 'APP_VERSION mismatch');
has(data, CACHE_PREFIX, 'src/data.ts cache version mismatch');
has(sw, CACHE_PREFIX, 'service worker cache version mismatch');
has(offline, `v${VERSION}`, 'offline badge/version mismatch');
has(readme, `# AquaFantasia v${VERSION}`, 'README title version mismatch');
has(readme, `## v${VERSION} 변경사항`, 'README changelog missing');
has(pkg.scripts.validate, 'check-v2075-exploration-ui-scroll-polish.mjs', 'v2075 validate hook missing');

for (const forbidden of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  must(!lockRaw.includes(forbidden), `internal registry marker leaked into package-lock: ${forbidden}`);
}

const rootMarkdown = readdirSync('.', { withFileTypes: true })
  .filter((entry) => entry.isFile() && /\.md$/i.test(entry.name))
  .map((entry) => entry.name);
must(rootMarkdown.length === 1 && rootMarkdown[0] === 'README.md', 'root markdown files must be README.md only');

has(main, "document.documentElement.dataset.v2075UiExplorationPolish = 'v2075-ui-exploration-scroll-polish'", 'v2075 boot dataset missing');
has(main, 'v2075-exploration-polish-village-screen', 'v2075 village scope class missing');
has(main, 'v2075-expedition-dock', 'single expedition dock class missing');
has(main, 'v2075-expedition-toggle', 'slim expedition toggle class missing');
has(main, 'v2075-expedition-loop-summary', 'folded growth loop summary missing');
has(main, 'aria-expanded="false"><span>개척</span>', 'single expedition toggle aria markup missing');
must(!main.includes('aria-label="성장 루프 펼치기"'), 'duplicate growth loop toggle must remain removed');
must(!main.includes('>루프</button><div class="v2051-loop-body"'), 'visible 루프 toggle markup must not return');

has(main, 'const scrollableSelector =', 'scrollable selector missing');
has(main, '.runtime-content', 'runtime content scroll target missing');
has(main, '.v2051-loop-body', 'loop body scroll target missing');
has(main, '.v203-interior-card', 'interior card scroll target missing');
has(main, 'let scrollTarget: HTMLElement | null = null', 'drag scroll target state missing');
has(main, 'scrollTarget.scrollTop = Math.max(0, startTop - dy)', 'drag scroll must move active scroll container');
has(main, "target?.closest('.bottom-nav, input, textarea, select, .runtime-hud, button, a, [role=\"button\"], [data-no-swipe]')", 'button-safe drag guard missing');
has(main, "root.dataset.v2075ScrollPolish = 'menu-drag-scroll-aqua-buttons'", 'menu scroll polish dataset missing');
has(main, 'v2075-scroll-polish-menu-screen', 'menu scroll polish class missing');

has(css, 'html[data-v2075-ui-exploration-polish="v2075-ui-exploration-scroll-polish"]', 'v2075 CSS root selector missing');
has(css, '.v2049-growth-board.v2051-loop-mini', 'hidden duplicate growth board selector missing');
has(css, 'display: none !important', 'duplicate growth board hide rule missing');
has(css, '.v2050-expedition-board.v2075-expedition-dock', 'expedition dock CSS missing');
has(css, 'v2.0.75 final placement override', 'final bottom placement override missing');
has(css, 'bottom: calc(max(12px, env(safe-area-inset-bottom)) + 78px)', 'expedition toggle bottom placement missing');
has(css, '.v2051-expedition-mini.open .v2051-loop-body', 'expedition popup open body CSS missing');
has(css, 'bottom: calc(max(12px, env(safe-area-inset-bottom)) + 122px)', 'expedition popup bottom sheet placement missing');
has(css, '.runtime-menu-screen.v2075-scroll-polish-menu-screen .runtime-content', 'runtime content scroll CSS missing');
has(css, 'touch-action: pan-y !important', 'menu pan-y touch action missing');
has(css, 'min-height: 38px !important', 'button size polish missing');

has(villageWorld, 'ACTOR_DIRECTION_TEXTURE_FIX[direction] ?? direction', 'character direction correction fallback changed/missing');
has(villageWorld, './assets/v2047/characters/player_${direction}.png', 'v2047 direction texture path changed/missing');
has(villageWorld, 'actorDirectionQaPasses()', 'character direction QA guard missing');

console.log('[v2075] exploration UI / scroll polish checks passed.');
