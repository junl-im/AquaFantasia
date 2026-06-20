import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const assert = (condition, message) => {
  if (!condition) {
    console.error(`[v2066] ${message}`);
    process.exit(1);
  }
};

const pkg = read('package.json');
const lock = read('package-lock.json');
const data = read('src/data.ts');
const main = read('src/main.ts');
const css = read('src/styles.css');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const readme = read('README.md');

assert(/"version": "2\.0\.(6[6-9]|[7-9][0-9])"/.test(pkg), 'package.json version must be v2.0.66 or later.');
assert(/"version": "2\.0\.(6[6-9]|[7-9][0-9])"/.test(lock), 'package-lock.json version must be v2.0.66 or later.');
assert(/APP_VERSION = '2\.0\.(6[6-9]|[7-9][0-9])'/.test(data), 'APP_VERSION must be v2.0.66 or later.');
assert(/aqua-fantasia-v2\.0\.(6[6-9]|[7-9][0-9])-/.test(data), 'data cache name must be v2.0.66 or later.');
assert(/aqua-fantasia-v2\.0\.(6[6-9]|[7-9][0-9])-/.test(sw), 'service worker cache name must be v2.0.66 or later.');
assert(/v2\.0\.(6[6-9]|[7-9][0-9])/.test(offline), 'offline badge must be v2.0.66 or later.');
assert(/^# AquaFantasia v2\.0\.(6[6-9]|[7-9][0-9])/.test(readme), 'README title must be v2.0.66 or later.');
assert(pkg.includes('check-v2066-risk-regression-sweep.mjs'), 'validate script must include v2066 guard.');

assert(main.includes("dataset.v2066RiskRegressionSweep = 'v2066-risk-regression-sweep'"), 'v2066 dataset marker missing.');
assert(main.includes('v2066-risk-regression-screen'), 'fishing screen must include v2066 marker class.');
assert(main.match(/private recentCatchMarkup\(\): string/g)?.length === 1, 'recentCatchMarkup must not be duplicated.');
assert(main.includes("document.querySelectorAll('.catch-result-card.v2064-result-card, .catch-result-card.v2059-result-card')"), 'result card duplicate sweep missing.');
assert(main.includes('resultCardOpen'), 'resultCardOpen lock must remain.');

assert(css.includes('v2.0.66 risk regression sweep'), 'v2066 CSS block missing.');
assert(css.includes('html[data-v2066-risk-regression-sweep="v2066-risk-regression-sweep"] body[data-screen="fishing"] .runtime-content'), 'correct html>body fishing selector missing.');
assert(!css.includes('body[data-screen="fishing"] html[data-v2065-unified-card-frame-polish="v2065-unified-aqua-card-popup-frame-polish"] .runtime-content'), 'impossible body html selector must be removed.');
assert(css.includes('body:not([data-screen="village"]) .bottom-nav.fixed-root-nav'), 'non-village dock hide guard missing.');
assert(css.includes('.dock-row:empty'), 'empty dock row guard missing.');
assert(css.includes('border-image: none'), 'button/card border-image reset missing.');

const forbidden = ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai'];
for (const needle of forbidden) {
  assert(!lock.includes(needle), `forbidden registry string found in lockfile: ${needle}`);
}

const markdownFiles = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', 'dist', 'reports', '.git'].includes(entry.name)) continue;
      walk(rel);
    } else if (/\.md$/i.test(entry.name)) {
      markdownFiles.push(rel.replaceAll('\\', '/'));
    }
  }
};
walk('.');
assert(markdownFiles.length === 1 && markdownFiles[0] === 'README.md', `only root README.md is allowed, found: ${markdownFiles.join(', ')}`);

console.log('[v2066] risk/regression sweep checks passed.');
