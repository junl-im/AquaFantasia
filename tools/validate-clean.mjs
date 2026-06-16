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
if (pkg.version !== '1.0.1') fail('package version mismatch');
if (!data.includes("APP_VERSION = '1.0.1'")) fail('APP_VERSION is not 1.0.1');
if (!data.includes('aqua-fantasia-v1.0.1-ui-water-frame-polish')) fail('CACHE_NAME mismatch');
console.log('[validate-clean] Aqua Fantasia v1.0.1 clean single README package OK');
console.log(JSON.stringify({ ok:true, version:'1.0.1', files: files.length }, null, 2));
