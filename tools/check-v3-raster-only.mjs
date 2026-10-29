import fs from 'node:fs';
import path from 'node:path';

/** No vector files anywhere in source; no inline/vector references in V3 UI. */
const root = path.resolve(process.argv[2] || process.cwd());
const violations = new Set();
const excluded = new Set(['.git', 'node_modules', 'dist']);
const badInline = /<\s*svg\b|<\s*\/\s*svg\s*>|\.svg\b|data:image\/svg\+xml|createElementNS\s*\(/i;

function walk(p) {
  if (!fs.existsSync(p)) return;
  const stat = fs.statSync(p);
  if (stat.isDirectory()) {
    for (const name of fs.readdirSync(p)) {
      if (!excluded.has(name)) walk(path.join(p, name));
    }
    return;
  }
  if (!stat.isFile()) return;
  const rel = path.relative(root, p).replaceAll('\\', '/');
  if (/\.svgz?$/i.test(rel)) violations.add(rel);
  const isV3Code = rel.startsWith('src/v3/') || rel === 'src/entry.ts';
  if (isV3Code && /\.(?:ts|tsx|js|jsx|css|html|json)$/i.test(rel)
    && badInline.test(fs.readFileSync(p, 'utf8'))) violations.add(rel);
}
walk(root);
if (violations.size) {
  console.error('[V3 raster-only] FORBIDDEN vector assets/references:', [...violations].join(', '));
  process.exitCode = 1;
} else {
  console.log('[V3 raster-only] PASS — no vector files in repository and no vector references in V3');
}
