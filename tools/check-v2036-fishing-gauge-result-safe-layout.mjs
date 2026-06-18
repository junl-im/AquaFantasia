import fs from 'node:fs';

const main = fs.readFileSync('src/main.ts', 'utf8');
const css = fs.readFileSync('src/styles.css', 'utf8');
const data = fs.readFileSync('src/data.ts', 'utf8');
const lock = fs.readFileSync('package-lock.json', 'utf8');

const required = [
  [data, "APP_VERSION = '2.0.36'", 'APP_VERSION 2.0.36'],
  [data, 'aqua-fantasia-v2.0.36-fishing-gauge-result-repair', 'cache 2.0.36'],
  [main, "dataset.v2036FishingGaugeRepair = 'v2036-fishing-gauge-result-safe-layout'", 'v2036 dataset'],
  [main, 'v2036-fishing-gauge-safe-screen', 'v2036 fishing screen class'],
  [main, 'v2036-fishing-stage', 'v2036 fishing stage class'],
  [main, 'v2036-reel-panel', 'v2036 reel panel class'],
  [main, 'v2036-cast-button', 'v2036 cast button class'],
  [main, 'v2036-result-card', 'v2036 result card class'],
  [main, "(dom.app.querySelector<HTMLElement>('.fishing-screen') ?? this.stageHost)?.appendChild(card);", 'result card appended to fishing screen'],
  [main, 'v2036-identical-dock-nav', 'v2036 dock class'],
  [css, 'left: 50vw !important;', 'center-fixed fishing overlay'],
  [css, '.v2036-reel-panel {', 'v2036 reel panel css'],
  [css, '.v2036-reel-panel .v205-reel-grid::before', 'css vertical gauge fallback'],
  [css, '.v2036-result-card {', 'v2036 result card css'],
  [css, 'max-width: calc(100vw - 28px) !important;', 'result card screen bounds'],
  [css, '.v2036-identical-dock-nav', 'v2036 dock css'],
  [css, 'body.v2036-character-panel-open .bottom-nav.v2036-identical-dock-nav', 'character panel hides v2036 dock'],
];

for (const [haystack, needle, label] of required) {
  if (!haystack.includes(needle)) {
    console.error(`[v2036] missing ${label}: ${needle}`);
    process.exit(1);
  }
}

const forbiddenRegistry = ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai'];
for (const token of forbiddenRegistry) {
  if (lock.includes(token)) {
    console.error(`[v2036] package-lock registry contamination: ${token}`);
    process.exit(1);
  }
}

console.log('[v2036] fishing gauge/result safe layout guard passed');
