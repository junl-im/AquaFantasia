import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const assert = (condition, message) => {
  if (!condition) {
    console.error(`[v2067] ${message}`);
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

assert(/\"version\": \"2\.0\.(6[7-9]|[7-9][0-9])\"/.test(pkg), 'package.json version must be v2.0.67 or later.');
assert(/\"version\": \"2\.0\.(6[7-9]|[7-9][0-9])\"/.test(lock), 'package-lock.json version must be v2.0.67 or later.');
assert(/APP_VERSION = '2\.0\.(6[7-9]|[7-9][0-9])'/.test(data), 'APP_VERSION must be v2.0.67 or later.');
assert(/aqua-fantasia-v2\.0\.(6[7-9]|[7-9][0-9])-/.test(data), 'data cache name must be v2.0.67 or later.');
assert(/aqua-fantasia-v2\.0\.(6[7-9]|[7-9][0-9])-/.test(sw), 'service worker cache name must be v2.0.67 or later.');
assert(/v2\.0\.(6[7-9]|[7-9][0-9])/.test(offline), 'offline badge must be v2.0.67 or later.');
assert(/^# AquaFantasia v2\.0\.(6[7-9]|[7-9][0-9])/.test(readme), 'README title must be v2.0.67 or later.');
assert(pkg.includes('check-v2067-start-menu-loop-card-restore.mjs'), 'validate script must include v2067 guard.');

assert(main.includes("dataset.v2067StartMenuLoopCardRestore = 'v2067-start-menu-loop-card-restore'"), 'v2067 dataset marker missing.');
assert(main.includes("panel.classList.toggle('is-open', willOpen)"), 'loop popup must add is-open state.');
assert(main.includes("other.classList.remove('is-open')"), 'other loop popup must remove is-open state.');
assert(main.includes("panel?.classList.remove('is-open')"), 'loop close button must remove is-open state.');

assert(css.includes('v2.0.67 start/menu/loop card restore'), 'v2067 CSS block missing.');
assert(css.includes('body[data-screen="login"] .start-art-screen :is(.start-hotspot,.hit-depart,.hit-new,.hit-server,.hit-keep)'), 'start screen hotspot restore rule missing.');
assert(css.includes('background: rgba(255,255,255,0) !important;'), 'start hotspot transparent background restore missing.');
assert(css.includes('body[data-screen="login"] :is(.bottom-nav,.fixed-root-nav,.v2-joystick'), 'login hidden UI guard missing.');
assert(css.includes('.runtime-menu-screen :is(') && css.includes('.v204-window-card') && css.includes('.v206-inventory-dashboard') && css.includes('.v206-quest-npc-board'), 'runtime menu aqua card coverage incomplete.');
assert(css.includes('.village-world-screen :is(.v2051-loop-mini.open,.v2051-loop-mini.is-open,.v2051-expedition-mini.open,.v2051-expedition-mini.is-open) > .v2051-loop-body'), 'opened loop body restore rule missing.');
assert(css.includes('.v2051-loop-body .v2055-loop-close'), 'loop close X restore rule missing.');
assert(css.includes('display: grid !important;') && css.includes('.v2050-expedition-grid'), 'loop detail grid restore missing.');
assert(!css.includes('body[data-screen="fishing"] html['), 'impossible body html selector must not return.');

const forbidden = ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai'];
for (const needle of forbidden) {
  assert(!lock.includes(needle), `forbidden registry string found in lockfile: ${needle}`);
}

const disallowedSourceDirs = ['dist', 'reports'];
for (const item of disallowedSourceDirs) {
  assert(!fs.existsSync(path.join(root, item)), `${item} must not exist in packaged source.`);
}
// Do not fail on node_modules here: GitHub Actions runs npm ci before npm run validate,
// so node_modules is expected in the CI workspace. ZIP packaging still excludes it and
// v2068 verifies that validate no longer treats installed dependencies as source pollution.

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

console.log('[v2067] start/menu/loop card restore checks passed.');
