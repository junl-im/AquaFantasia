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

const VERSION = '2.0.74';
const CACHE = 'aqua-fantasia-v2.0.74-catch-growth-loop';
const fail = (msg) => {
  console.error(`[v2074] ${msg}`);
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

has(main, "document.documentElement.dataset.v2074CatchGrowthLoop = 'v2074-catch-growth-loop'", 'v2074 boot dataset missing');
has(main, 'type CatchGrowthSettlement = {', 'catch growth settlement type missing');
has(main, 'v2074-growth-loop-screen', 'v2074 fishing screen class missing');
has(main, 'v2074-growth-loop-menu-screen', 'v2074 menu screen class missing');
has(main, "root.dataset.v2074GrowthLoop = 'catch-sale-village-growth'", 'v2074 menu dataset missing');
has(main, 'private createCatchGrowthSettlement(fish: FishInfo, baseReward: number, firstCatch: boolean)', 'settlement creation method missing');
has(main, 'private applyCatchGrowthSettlement(settlement: CatchGrowthSettlement)', 'settlement apply method missing');
has(main, 'private catchSaleLedgerMarkup(): string', 'sale ledger markup method missing');
has(main, 'private fishStory(fish: FishInfo): string', 'fish story method missing');
has(main, 'this.applyCatchGrowthSettlement(settlement)', 'catch success does not apply village growth settlement');
has(main, 'reward: settlement.reward, fund: settlement.fund, development: settlement.development', 'sync event does not include settlement payload');
has(main, 'v2074-result-impact', 'result card impact grid missing');
has(main, 'data-next="inventory"', 'result card inventory route missing');
has(main, 'data-next="village"', 'result card village route missing');
has(main, '자동 판매 루프', 'inventory sale loop section missing');
has(main, 'v2074-dex-story', 'dex story markup missing');
has(main, '수족관 해설판', 'shop aquarium guide item missing');
has(main, "id: 'autoSale500'", 'auto sale mission missing');
has(main, "id: 'villageFund300'", 'village fund mission missing');
has(main, "['자동판매', `${this.estimatedCatchLedgerValue().toLocaleString('ko-KR')}G`]", 'growth board auto sale metric missing');

has(css, 'html[data-v2074-catch-growth-loop="v2074-catch-growth-loop"]', 'v2074 CSS root selector missing');
has(css, '.v2074-sale-grid', 'sale ledger CSS missing');
has(css, '.v2074-dex-story', 'dex story CSS missing');
has(css, '.v2074-result-impact', 'result impact CSS missing');
has(css, '.v2074-result-actions', 'result actions CSS missing');
has(css, '.runtime-menu-screen.v2074-growth-loop-menu-screen', 'v2074 menu scoped CSS missing');

has(villageWorld, 'ACTOR_DIRECTION_TEXTURE_FIX[direction] ?? direction', 'character direction correction fallback changed/missing');
has(villageWorld, './assets/v2047/characters/player_${direction}.png', 'v2047 direction texture path changed/missing');
has(villageWorld, 'actorDirectionQaPasses()', 'character direction QA guard missing');

console.log('[v2074] catch growth loop checks passed.');
