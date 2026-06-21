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
const fail = (msg) => { console.error(`[v2078] ${msg}`); process.exit(1); };
const must = (condition, msg) => { if (!condition) fail(msg); };
const has = (source, needle, msg) => must(source.includes(needle), msg);

must(/^2\.0\.\d+$/.test(VERSION), 'package.json version must stay on 2.0.x');
must(Number(VERSION.split('.')[2]) >= 78, 'v2078 guard only applies to v2.0.78+ packages');
must(lock.version === VERSION && lock.packages?.['']?.version === VERSION, 'package-lock version mismatch');
has(data, `APP_VERSION = '${VERSION}'`, 'APP_VERSION mismatch');
has(data, CACHE_PREFIX, 'src/data.ts cache version mismatch');
has(sw, CACHE_PREFIX, 'service worker cache version mismatch');
has(offline, `v${VERSION}`, 'offline badge/version mismatch');
has(readme, `# AquaFantasia v${VERSION}`, 'README title version mismatch');
has(readme, `## v${VERSION} 변경사항`, 'README changelog missing');
has(pkg.scripts.validate, 'check-v2078-aqua-card-hud-panel-polish.mjs', 'v2078 validate hook missing');

for (const forbidden of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  must(!lockRaw.includes(forbidden), `internal registry marker leaked into package-lock: ${forbidden}`);
}

const rootMarkdown = readdirSync('.', { withFileTypes: true })
  .filter((entry) => entry.isFile() && /\.md$/i.test(entry.name))
  .map((entry) => entry.name);
must(rootMarkdown.length === 1 && rootMarkdown[0] === 'README.md', 'root markdown files must be README.md only');

has(main, "document.documentElement.dataset.v2078AquaCardUi = 'v2078-aqua-card-hud-panel-polish'", 'v2078 boot dataset missing');
has(main, "root.dataset.v2078AquaCardUi = 'managed-aqua-card-stack'", 'v2078 menu dataset missing');
has(main, 'v2078-aqua-card-ui-screen', 'runtime menu v2078 scope class missing');
has(main, 'v2078-village-ui-polish-screen', 'village v2078 scope class missing');
has(main, 'aqua-card-surface aqua-card-hud', 'aqua HUD management class missing');
has(main, 'runtime-content aqua-card-surface aqua-card-page', 'aqua page management class missing');
has(main, 'aqua-card-surface aqua-card-dialog', 'aqua dialog management class missing');
has(main, 'aqua-card-mini-bar', 'aqua expedition mini bar class missing');
has(main, '.v204-inventory-grid', 'inventory drag target missing');
has(main, '.v2074-sale-grid', 'sale ledger drag target missing');
has(main, '.v2076-expedition-candidates', 'expedition candidate scroll target missing');

has(css, 'v2.0.78 Aqua Card HUD/Panel Polish', 'v2078 CSS comment missing');
has(css, 'html[data-v2078-aqua-card-ui="v2078-aqua-card-hud-panel-polish"]', 'v2078 CSS root selector missing');
has(css, '--aqua-card-surface', 'aqua card variable missing');
has(css, '.runtime-menu-screen.v2078-aqua-card-ui-screen', 'v2078 runtime screen CSS missing');
has(css, 'grid-template-areas: "mascot title" "wallet wallet"', 'HUD overlap fix grid areas missing');
has(css, '.runtime-content.aqua-card-page', 'aqua page content CSS missing');
has(css, 'flex: 1 1 auto !important', 'runtime content must fill remaining menu space without overlap');
has(css, 'width: min(236px, calc(100vw - 132px))', 'expedition bar shortened width missing');
has(css, 'top: calc(max(7px, env(safe-area-inset-top)) + 82px)', 'expedition bar must sit close under HUD');
has(css, 'z-index: 330 !important', 'expedition bar must not be topmost');
has(css, 'z-index: 820 !important', 'expedition popup z-index must be below dialogs but above HUD');
has(css, '.v2017-character-panel.open', 'character panel z-order selector missing');
has(css, '.v203-interior-panel.open', 'interior panel z-order selector missing');
has(css, 'z-index: 2800 !important', 'dialogs must sit above expedition bar');
has(css, '.v203-interior-card', 'building info card polish missing');
has(css, 'overflow-y: auto !important', 'vertical scroll support missing');
has(css, 'touch-action: pan-y !important', 'touch drag scroll support missing');
has(css, 'body:is(.v2032-character-panel-open,.v2040-interior-open', 'expedition bar must yield under panels');

has(villageWorld, "goldLantern: './assets/v209/props/crystal_lamp.png'", 'clipped gold lantern asset must be replaced with complete crystal lamp');
has(villageWorld, 'old gold_lantern.png is a right-edge half sprite', 'lantern asset reason comment missing');
has(villageWorld, 'ACTOR_DIRECTION_TEXTURE_FIX[direction] ?? direction', 'character direction correction fallback changed/missing');
has(villageWorld, './assets/v2047/characters/player_${direction}.png', 'v2047 direction texture path changed/missing');
has(villageWorld, 'actorDirectionQaPasses()', 'character direction QA guard missing');

console.log('[v2078] aqua card HUD/panel polish checks passed.');
