import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const removed = [];
const skipDirs = new Set(['node_modules', 'dist', '.git']);

function removeEntry(p) {
  if (!fs.existsSync(p)) return;
  const rel = path.relative(root, p).replace(/\\/g, '/');
  fs.rmSync(p, { recursive: true, force: true });
  removed.push(rel);
}

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    if (skipDirs.has(name)) continue;
    const p = path.join(dir, name);
    const rel = path.relative(root, p).replace(/\\/g, '/');
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (rel === 'reports') removeEntry(p);
      else walk(p);
      continue;
    }
    if (st.isFile() && name.endsWith('.md') && rel !== 'README.md') removeEntry(p);
  }
}

walk(root);

if (removed.length) {
  console.log('[clean-old-patch-docs] removed stale markdown/docs:');
  for (const rel of removed) console.log(`- ${rel}`);
} else {
  console.log('[clean-old-patch-docs] no stale patch docs found');
}
