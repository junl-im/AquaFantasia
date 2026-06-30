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
const requiredMarkdown = new Set(['README.md', 'AI_HANDOFF_CARDVILLE.md']);
const markdown = files.filter((f) => f.endsWith('.md'));
const banned = files.filter((f) => (
  /^(CLEAN_REPLACE_GUIDE|FINAL_CONSOLIDATED|PATCH_NOTES|PROMPTS_DALLE_ASSETS|DELETE_OLD_FILES).*\.md$/.test(path.basename(f)) ||
  /_NOTES\.md$/i.test(path.basename(f)) ||
  f.startsWith('reports/')
));

if (banned.length) fail(`old patch documents must not be included: ${banned.join(', ')}`);
const unexpectedMarkdown = markdown.filter((f) => !requiredMarkdown.has(f));
const missingMarkdown = [...requiredMarkdown].filter((f) => !markdown.includes(f));
if (unexpectedMarkdown.length || missingMarkdown.length) {
  fail(`markdown must be exactly README.md and AI_HANDOFF_CARDVILLE.md; found=[${markdown.join(', ')}], missing=[${missingMarkdown.join(', ')}]`);
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const data = fs.readFileSync(path.join(root, 'src/data.ts'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'public/sw.js'), 'utf8');
const offline = fs.readFileSync(path.join(root, 'public/offline.html'), 'utf8');
const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
const handoff = fs.readFileSync(path.join(root, 'AI_HANDOFF_CARDVILLE.md'), 'utf8');
const version = pkg.version;

if (!/^2\.(0|1)\.\d+$/.test(version)) fail(`unsupported version ${version}; use 2.0.x or 2.1.x sequence`);
if (!data.includes(`APP_VERSION = '${version}'`)) fail(`APP_VERSION is not ${version}`);
const expectedCachePrefix = `aqua-fantasia-v${version}-`;
if (!data.includes(expectedCachePrefix)) fail('CACHE_NAME mismatch in data.ts');
if (!sw.includes(expectedCachePrefix)) fail('CACHE_NAME mismatch in sw.js');
if (!offline.includes(`v${version}`)) fail('offline page version badge mismatch');
if (!readme.includes(`AquaFantasia v${version}`)) fail('README title version mismatch');
if (!handoff.includes(`기준 패키지 버전: \`${version}\``)) fail('AI_HANDOFF_CARDVILLE.md version mismatch');

console.log(`[validate-clean] AquaFantasia v${version} clean README/handoff package OK`);
console.log(JSON.stringify({ ok: true, version, files: files.length }, null, 2));
