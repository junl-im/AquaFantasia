import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const fail = (msg) => { console.error(`[validate-clean] ${msg}`); process.exit(1); };
function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name === '.git') continue;
    const p = path.join(dir, name);
    const rel = path.relative(root, p).replace(/\\/g, '/');
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else acc.push(rel);
  }
  return acc;
}
const files = walk(root);
const banned = files.filter((f) => /^(CLEAN_REPLACE_GUIDE|FINAL_CONSOLIDATED|PATCH_NOTES|PROMPTS_DALLE_ASSETS|DELETE_OLD_FILES).*\.md$/.test(path.basename(f)) || f.startsWith('reports/'));
if (banned.length) fail(`old patch documents must not be included: ${banned.join(', ')}`);
if (!files.includes('README.md')) fail('README.md missing');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const data = fs.readFileSync(path.join(root, 'src/data.ts'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'public/sw.js'), 'utf8');
const version = pkg.version;
if (!/^1\.0\.\d+$|^1\.1\.\d+$/.test(version)) fail(`unsupported semantic version ${version}`);
if (!data.includes(`APP_VERSION = '${version}'`)) fail(`APP_VERSION is not ${version}`);
const expectedCachePrefix = `aqua-fantasia-v${version}-`;
if (!data.includes(expectedCachePrefix)) fail('CACHE_NAME mismatch in data.ts');
if (!sw.includes(expectedCachePrefix)) fail('CACHE_NAME mismatch in sw.js');
console.log(`[validate-clean] Aqua Fantasia v${version} clean single README package OK`);
console.log(JSON.stringify({ ok:true, version, files: files.length }, null, 2));
