import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (p) => readFileSync(join(root, p), 'utf8');
const pkg = JSON.parse(read('package.json'));
const data = read('src/data.ts');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const readme = read('README.md');
const cleanScript = read('tools/clean-old-patch-docs.mjs');

function fail(msg) {
  console.error(`[v2099] ${msg}`);
  process.exit(1);
}

if (pkg.version !== '2.0.99') fail(`package version mismatch: ${pkg.version}`);
if (!data.includes("APP_VERSION = '2.0.99'")) fail('APP_VERSION not synchronized');
if (!data.includes('aqua-fantasia-v2.0.99-clean-package-artifacts')) fail('data cache version not synchronized');
if (!sw.includes('aqua-fantasia-v2.0.99-clean-package-artifacts')) fail('service worker cache version not synchronized');
if (!offline.includes('v2.0.99')) fail('offline badge is not v2.0.99');
if (!readme.includes('AquaFantasia v2.0.99')) fail('README title is not v2.0.99');

for (const token of ['AquaFantasia_backup', "name === 'dist'", "name === 'reports'", "name.endsWith('.log')", '_NOTES']) {
  if (!cleanScript.includes(token)) fail(`clean script missing cleanup token: ${token}`);
}

const bannedRegistry = ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai'];
const lock = read('package-lock.json');
for (const token of bannedRegistry) if (lock.includes(token)) fail(`forbidden registry token found: ${token}`);

function walk(dir, out = []) {
  for (const name of readdirSync(join(root, dir))) {
    if (name === 'node_modules' || name === '.git') continue;
    const p = dir === '.' ? name : `${dir}/${name}`;
    const st = statSync(join(root, p));
    if (st.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}

const files = walk('.');
const forbidden = files.filter((p) => {
  if (p === 'README.md') return false;
  if (/\.md$/i.test(p)) return true;
  if (/_NOTES\.md$/i.test(p)) return true;
  if (/(^|\/)dist\//.test(p)) return true;
  if (/(^|\/)reports\//.test(p)) return true;
  if (/(^|\/)AquaFantasia_backup/i.test(p)) return true;
  if (/\.log$/i.test(p)) return true;
  return false;
});
if (forbidden.length) fail(`forbidden package artifacts remain: ${forbidden.slice(0, 12).join(', ')}`);

console.log('[AquaFantasia] v2.0.99 clean package artifact guard validation passed.');
