import { readFileSync, existsSync } from 'node:fs';

const read = (p) => readFileSync(p, 'utf8');
const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const main = read('src/main.ts');
const css = read('src/styles.css');
const data = read('src/data.ts');
const sw = read('public/sw.js');
const offline = read('public/offline.html');

const fail = (msg) => {
  console.error(`[v2071] ${msg}`);
  process.exit(1);
};

const versionMatch = pkg.version.match(/^2\.0\.(\d+)$/);
if (!versionMatch || Number(versionMatch[1]) < 71) fail('package.json version must preserve v2.0.71+ lineage');
if (lock.version !== pkg.version || lock.packages?.['']?.version !== pkg.version) fail('package-lock version mismatch');
if (!data.includes(`APP_VERSION = '${pkg.version}'`)) fail('APP_VERSION mismatch');
if (!data.includes(`aqua-fantasia-v${pkg.version}-`)) fail('data cache mismatch');
if (!sw.includes(`aqua-fantasia-v${pkg.version}-`)) fail('service worker cache mismatch');
if (!offline.includes(`v${pkg.version}`)) fail('offline badge mismatch');

// Recovery rule: the broken broad v2065-v2070 global card layers must not be active in source.
const bannedRuntimeMarkers = [
  'v2065-unified-card-frame-polish',
  'v2066-risk-regression-sweep',
  'v2067-start-menu-loop-card-restore',
  'v2069-start-menu-card-audit',
  'v2070-menu-page-structure-audit',
  'installRuntimeAquaPageAudit',
  'v2070-aqua-page-card',
  'v2070-aqua-page-screen'
];
for (const marker of bannedRuntimeMarkers) {
  if (main.includes(marker) || css.includes(marker)) fail(`broken broad UI layer remains active: ${marker}`);
}

// Preserve verified start art path and transparent hotspot structure.
if (!main.includes("loginBg: './assets/v85/screens/start_screen_clean_v810.webp'")) fail('verified v810 start art path missing');
if (!main.includes('class="start-hotspot hit-keep')) fail('start keep hotspot missing');
if (!css.includes('.start-art-screen .start-art-image')) fail('start art CSS missing');
if (!css.includes('content: url(\'/assets/v12/screens/start_screen_clean_v810.webp\')')) fail('v810 start art CSS recovery missing');

// Keep the known-good card/popup era: v2063/v2064 are the last stable UI polishing layers.
if (!main.includes('v2063-unified-card-window-screen')) fail('stable unified card window class missing');
if (!css.includes('v2063-fishing-state-machine-unified-card-windows')) fail('v2063 stable card CSS missing');
if (!css.includes('v2064-fishing-ui-card-button-stability-audit')) fail('v2064 stable polish CSS missing');

// Loop popup should still have content and a close X from markup/listeners.
if (!main.includes('villageGrowthBoardMarkup()')) fail('loop content markup function missing');
if (!main.includes('islandExpansionBoardMarkup()')) fail('expedition content markup function missing');
if (!main.includes('data-v2055-loop-close')) fail('loop close button missing');
if (!main.includes("panel.classList.toggle('open', willOpen)")) fail('loop toggle open handler missing');

// Validate ZIP/package source rules without failing simply because npm ci produced node_modules in CI.
for (const forbidden of ['dist', 'reports']) {
  if (existsSync(forbidden)) fail(`${forbidden} must not exist in packaged source`);
}

console.log('[v2071] stable UI recovery audit checks passed.');
