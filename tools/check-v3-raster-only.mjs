import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || process.cwd());
const candidates = [path.join(root, 'src/v3'), path.join(root, 'src/entry.ts')];
const violations = [];
const bad = /<\s*svg\b|<\s*\/\s*svg\s*>|\.svg\b|data:image\/svg\+xml|createElementNS\s*\(/i;

function scan(p) {
  if (!fs.existsSync(p)) return;
  const stat = fs.statSync(p);
  if (stat.isDirectory()) {
    for (const name of fs.readdirSync(p)) scan(path.join(p, name));
    return;
  }
  if (!stat.isFile()) return;
  if (/\.svgz?$/i.test(p)) { violations.push(path.relative(root, p)); return; }
  if (!/\.(?:ts|tsx|js|jsx|css|html|json)$/i.test(p)) return;
  if (bad.test(fs.readFileSync(p, 'utf8'))) violations.push(path.relative(root, p));
}
for (const candidate of candidates) scan(candidate);
if (violations.length) {
  console.error('[V3 raster-only] FORBIDDEN vector content:', violations.join(', '));
  process.exitCode = 1;
} else {
  console.log('[V3 raster-only] PASS — no vector assets or references in V3');
}
