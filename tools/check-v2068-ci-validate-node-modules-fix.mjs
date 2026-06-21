import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const assert = (condition, message) => {
  if (!condition) {
    console.error(`[v2068] ${message}`);
    process.exit(1);
  }
};

const pkg = read('package.json');
const lock = read('package-lock.json');
const data = read('src/data.ts');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const readme = read('README.md');
const v2067 = read('tools/check-v2067-start-menu-loop-card-restore.mjs');

assert(/\"version\": \"2\.0\.(6[8-9]|[7-9][0-9])\"/.test(pkg), 'package.json version must be v2.0.68 or later.');
assert(/\"version\": \"2\.0\.(6[8-9]|[7-9][0-9])\"/.test(lock), 'package-lock.json version must be v2.0.68 or later.');
assert(/APP_VERSION = '2\.0\.(6[8-9]|[7-9][0-9])'/.test(data), 'APP_VERSION must be v2.0.68 or later.');
assert(/aqua-fantasia-v2\.0\.(6[8-9]|[7-9][0-9])-/.test(data), 'data cache name must be v2.0.68 or later.');
assert(/aqua-fantasia-v2\.0\.(6[8-9]|[7-9][0-9])-/.test(sw), 'service worker cache name must be v2.0.68 or later.');
assert(/v2\.0\.(6[8-9]|[7-9][0-9])/.test(offline), 'offline badge must be v2.0.68 or later.');
assert(/^# AquaFantasia v2\.0\.(6[8-9]|[7-9][0-9])/.test(readme), 'README title must be v2.0.68 or later.');
assert(pkg.includes('check-v2068-ci-validate-node-modules-fix.mjs'), 'validate script must include v2068 guard.');

assert(!v2067.includes("const disallowedZipItems = ['node_modules', 'dist', 'reports'];"), 'v2067 must not fail validate just because npm ci created node_modules.');
assert(v2067.includes('GitHub Actions runs npm ci before npm run validate'), 'v2067 must document the CI node_modules exception.');
assert(v2067.includes("const disallowedSourceDirs = ['dist', 'reports'];"), 'v2067 must still reject generated source directories.');

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
      markdownFiles.push(rel.replaceAll('\\', '/'));
    }
  }
};
walk('.');
assert(markdownFiles.length === 1 && markdownFiles[0] === 'README.md', `only root README.md is allowed, found: ${markdownFiles.join(', ')}`);

const forbidden = ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai'];
for (const needle of forbidden) {
  assert(!lock.includes(needle), `forbidden registry string found in lockfile: ${needle}`);
}

console.log('[v2068] CI validate node_modules guard fix checks passed.');
