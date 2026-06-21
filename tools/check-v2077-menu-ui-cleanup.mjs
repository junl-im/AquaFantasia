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
  console.error(`[v2077] ${msg}`);
  process.exit(1);
};
const must = (condition, msg) => { if (!condition) fail(msg); };
const has = (source, needle, msg) => must(source.includes(needle), msg);

must(/^2\.0\.\d+$/.test(VERSION), 'package.json version must stay on 2.0.x');
must(Number(VERSION.split('.')[2]) >= 77, 'v2077 guard only applies to v2.0.77+ packages');
must(lock.version === VERSION && lock.packages?.['']?.version === VERSION, 'package-lock version mismatch');
has(data, `APP_VERSION = '${VERSION}'`, 'APP_VERSION mismatch');
has(data, CACHE_PREFIX, 'src/data.ts cache version mismatch');
has(sw, CACHE_PREFIX, 'service worker cache version mismatch');
has(offline, `v${VERSION}`, 'offline badge/version mismatch');
has(readme, `# AquaFantasia v${VERSION}`, 'README title version mismatch');
has(readme, `## v${VERSION} 변경사항`, 'README changelog missing');
has(pkg.scripts.validate, 'check-v2077-menu-ui-cleanup.mjs', 'v2077 validate hook missing');

for (const forbidden of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  must(!lockRaw.includes(forbidden), `internal registry marker leaked into package-lock: ${forbidden}`);
}

const rootMarkdown = readdirSync('.', { withFileTypes: true })
  .filter((entry) => entry.isFile() && /\.md$/i.test(entry.name))
  .map((entry) => entry.name);
must(rootMarkdown.length === 1 && rootMarkdown[0] === 'README.md', 'root markdown files must be README.md only');

has(main, "document.documentElement.dataset.v2077MenuUiCleanup = 'v2077-menu-aqua-card-scroll-close-expedition-fix'", 'v2077 boot dataset missing');
has(main, 'v2077-expedition-hud-safe-village-screen', 'v2077 village scope class missing');
has(main, 'v2077-aqua-card-scroll-screen', 'v2077 runtime menu scope class missing');
has(main, "root.dataset.v2077MenuUiCleanup = 'aqua-card-scroll-close-normalized'", 'v2077 menu dataset missing');
has(main, 'v2077-menu-close', 'v2077 close button class missing');
has(main, 'data-v2077-close', 'v2077 close button data hook missing');
has(main, "root.querySelectorAll<HTMLButtonElement>('[data-v2059-menu-close], [data-v2077-close]')", 'v2077 robust close binding missing');
has(main, 'const v2077ScrollableSelector =', 'v2077 scrollable selector missing');
has(main, '.v204-inventory-shell', 'v2077 inventory scroll target missing');
has(main, '.v2076-expedition-card', 'v2077 expedition scroll target missing');
has(main, '.mission-list', 'v2077 mission scroll target missing');
has(main, "const content = root.querySelector<HTMLElement>('.runtime-content');", 'v2077 runtime-content fallback missing');
has(main, "if (content && content.scrollHeight > content.clientHeight + 2) return content;", 'v2077 runtime-content scroll fallback missing');
has(main, "root.removeAttribute('data-v2018-dragging');", 'interactive click reset for close/buttons missing');
has(main, "if (root.getAttribute('data-v2018-dragging') !== 'true') return;", 'drag click suppression must not rely on stale moved flag');
must(!main.includes('aria-label="성장 루프 펼치기"'), 'visible growth loop toggle must not return');
must(!main.includes('>루프</button><div class="v2051-loop-body"'), 'legacy loop button markup must remain removed');

has(css, 'v2.0.77 full menu UI cleanup', 'v2077 CSS comment missing');
has(css, 'html[data-v2077-menu-ui-cleanup="v2077-menu-aqua-card-scroll-close-expedition-fix"]', 'v2077 CSS root selector missing');
has(css, '.runtime-menu-screen.v2077-aqua-card-scroll-screen .runtime-content', 'v2077 runtime content CSS missing');
has(css, '.inventory-screen.v2077-aqua-card-scroll-screen .runtime-content', 'v2077 inventory scroll CSS missing');
has(css, '.runtime-menu-screen.v2077-aqua-card-scroll-screen .v2077-menu-close', 'v2077 close CSS missing');
has(css, 'body[data-screen="village"] .v2077-expedition-hud-safe-village-screen .v2050-expedition-board.v2075-expedition-dock', 'v2077 expedition bar placement CSS missing');
has(css, 'top: calc(max(8px, env(safe-area-inset-top)) + 88px)', 'expedition bar must be HUD-under, not bottom dock placement');
has(css, 'bottom: auto !important', 'v2077 expedition bottom override missing');
has(css, 'body[data-screen="village"] .v2077-expedition-hud-safe-village-screen .v2051-expedition-mini.open .v2051-loop-body', 'v2077 expedition popup CSS missing');
has(css, 'left: max(10px, env(safe-area-inset-left)) !important;', 'v2077 popup safe-area left clamp missing');
has(css, 'right: max(10px, env(safe-area-inset-right)) !important;', 'v2077 popup safe-area right clamp missing');
has(css, 'overflow-y: auto !important', 'v2077 vertical scroll CSS missing');
has(css, 'touch-action: pan-y !important', 'v2077 pan-y touch CSS missing');
has(css, '.v2049-growth-board.v2051-loop-mini', 'duplicate growth board hide selector missing');

has(villageWorld, 'ACTOR_DIRECTION_TEXTURE_FIX[direction] ?? direction', 'character direction correction fallback changed/missing');
has(villageWorld, './assets/v2047/characters/player_${direction}.png', 'v2047 direction texture path changed/missing');
has(villageWorld, 'actorDirectionQaPasses()', 'character direction QA guard missing');

console.log('[v2077] menu UI cleanup checks passed.');
