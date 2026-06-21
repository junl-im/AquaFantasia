import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const assert = (condition, message) => {
  if (!condition) {
    console.error(`[v2070] ${message}`);
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
const v2069 = read('tools/check-v2069-start-menu-card-audit.mjs');

assert(pkg.includes('"version": "2.0.70"'), 'package.json version must be 2.0.70.');
assert(lock.includes('"version": "2.0.70"'), 'package-lock.json version must be 2.0.70.');
assert(data.includes("APP_VERSION = '2.0.70'"), 'APP_VERSION must be 2.0.70.');
assert(data.includes('aqua-fantasia-v2.0.70-menu-page-structure-audit'), 'data cache name must be v2.0.70.');
assert(sw.includes('aqua-fantasia-v2.0.70-menu-page-structure-audit'), 'service worker cache name must be v2.0.70.');
assert(offline.includes('v2.0.70'), 'offline badge must be v2.0.70.');
assert(readme.startsWith('# AquaFantasia v2.0.70'), 'README title must be v2.0.70.');
assert(pkg.includes('check-v2070-menu-page-structure-audit.mjs'), 'validate script must include v2070 guard.');
assert(v2069.includes('v2.0.69 or later'), 'v2069 guard must allow later versions.');

assert(main.includes("dataset.v2070MenuPageStructureAudit = 'v2070-menu-page-structure-design-audit'"), 'v2070 dataset marker missing.');
assert(main.includes('private installRuntimeAquaPageAudit'), 'runtime page structure normalizer missing.');
assert(main.includes("root.classList.add('v2070-aqua-page-screen')"), 'runtime screen v2070 class assignment missing.');
assert(main.includes('v2070-aqua-page-card'), 'runtime content v2070 page card missing.');
assert(main.includes('v2070-card-section') && main.includes('v2070-aqua-surface') && main.includes('v2070-aqua-button'), 'v2070 section/surface/button normalization missing.');
assert(main.includes('MutationObserver'), 'v2070 normalization must handle later page content injection.');

assert(css.includes('v2.0.70 full page structure + aqua card design audit'), 'v2070 CSS block missing.');
assert(css.includes('body[data-screen="login"] .start-art-screen .start-art-image') && css.includes('content: normal !important'), 'v2070 must not override the verified login artwork with a CSS content URL.');
assert(css.includes('.runtime-menu-screen.v2070-aqua-page-screen .v2070-aqua-page-card'), 'v2070 page card CSS missing.');
assert(css.includes('.v2070-card-section') && css.includes('.v2070-aqua-surface') && css.includes('.v2070-aqua-button'), 'v2070 card/button selectors missing.');
for (const needle of ['.v204-map-ocean', '.shop-card', '.mission-card', '.gear-card', '.dex-card', '.ranking-panel', '.v206-inventory-dashboard', '.v206-quest-npc-board']) {
  assert(css.includes(needle), `v2070 page coverage missing: ${needle}`);
}
assert(css.includes('border-image: none !important'), 'v2070 must remove old image border dependencies.');
assert(!css.includes('body[data-screen="fishing"] html['), 'impossible body html selector must not exist.');

for (const dir of ['dist', 'reports']) {
  assert(!fs.existsSync(path.join(root, dir)), `${dir} must not exist in packaged source.`);
}
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

console.log('[v2070] full menu page structure/design audit checks passed.');
