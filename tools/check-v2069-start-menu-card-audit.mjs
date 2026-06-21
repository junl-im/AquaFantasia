import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const assert = (condition, message) => {
  if (!condition) {
    console.error(`[v2069] ${message}`);
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
const v2068 = read('tools/check-v2068-ci-validate-node-modules-fix.mjs');

assert(pkg.includes('"version": "2.0.69"'), 'package.json version must be 2.0.69.');
assert(lock.includes('"version": "2.0.69"'), 'package-lock.json version must be 2.0.69.');
assert(data.includes("APP_VERSION = '2.0.69'"), 'APP_VERSION must be 2.0.69.');
assert(data.includes('aqua-fantasia-v2.0.69-start-menu-aqua-card-restore'), 'data cache name must be v2.0.69.');
assert(sw.includes('aqua-fantasia-v2.0.69-start-menu-aqua-card-restore'), 'service worker cache name must be v2.0.69.');
assert(offline.includes('v2.0.69'), 'offline badge must be v2.0.69.');
assert(readme.startsWith('# AquaFantasia v2.0.69'), 'README title must be v2.0.69.');
assert(pkg.includes('check-v2069-start-menu-card-audit.mjs'), 'validate script must include v2069 guard.');
assert(v2068.includes('v2.0.68 or later'), 'v2068 guard must allow later versions.');

assert(main.includes("dataset.v2069StartMenuCardAudit = 'v2069-start-menu-aqua-card-audit'"), 'v2069 dataset marker missing.');
assert(css.includes('v2.0.69 conservative start screen + full menu aqua card audit'), 'v2069 CSS block missing.');
assert(css.includes("content: url('/assets/v85/screens/start_screen_clean_v810.webp')"), 'start screen must use verified v85/v810 art path.');
assert(css.includes('.start-art-screen .hit-keep .keep-text') && css.includes('visibility: hidden !important'), 'start login keep text must be hidden on artwork.');
assert(css.includes('body[data-screen="login"] :is(.runtime-menu-screen,.runtime-hud,.runtime-content,.bottom-nav'), 'login screen UI guard missing.');

const requiredMenuCards = [
  '.runtime-content', '.runtime-hud', '.runtime-hero-card', '.v204-window-card', '.v204-map-shell', '.v206-map-shell',
  '.v206-inventory-dashboard', '.v206-catch-ledger', '.v206-quest-npc-board', '.shop-card', '.mission-card',
  '.gear-card', '.dex-card', '.ranking-panel', '.v206-route-ready article', '.v2050-expedition-grid article'
];
for (const needle of requiredMenuCards) {
  assert(css.includes(needle), `menu aqua card coverage missing: ${needle}`);
}
assert(css.includes('--v2069-card-bg') && css.includes('--v2069-btn-bg'), 'v2069 card/button tokens missing.');
assert(css.includes('.v2051-loop-body') && css.includes('.v2055-loop-close') && css.includes('.v2059-loop-close'), 'loop popup content/close restore missing.');
assert(!css.includes('body[data-screen="fishing"] html['), 'impossible body html selector must not exist.');

const forbidden = ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai'];
for (const needle of forbidden) {
  assert(!lock.includes(needle), `forbidden registry string found in lockfile: ${needle}`);
}

for (const dir of ['dist', 'reports']) {
  assert(!fs.existsSync(path.join(root, dir)), `${dir} must not exist in packaged source.`);
}

const markdownFiles = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', 'dist', 'reports', '.git'].includes(entry.name)) continue;
      walk(rel);
    } else if (/\.md$/i.test(entry.name)) {
      markdownFiles.push(rel.replaceAll('\\\\', '/'));
    }
  }
};
walk('.');
assert(markdownFiles.length === 1 && markdownFiles[0] === 'README.md', `only root README.md is allowed, found: ${markdownFiles.join(', ')}`);

console.log('[v2069] start screen/menu aqua card audit checks passed.');
