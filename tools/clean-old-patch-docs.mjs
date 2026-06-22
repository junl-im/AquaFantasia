import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const removed = [];
const skipDirs = new Set(['node_modules', '.git']);

function relOf(p) {
  return path.relative(root, p).replace(/\\/g, '/');
}

function removeEntry(p) {
  if (!fs.existsSync(p)) return;
  const rel = relOf(p);
  fs.rmSync(p, { recursive: true, force: true });
  removed.push(rel);
}

function isBackupDir(rel, name) {
  return /^AquaFantasia_backup/i.test(name) || /(^|\/)AquaFantasia_backup/i.test(rel);
}

function isForbiddenGeneratedDir(rel, name) {
  if (name === 'dist' || name === 'reports') return true;
  if (rel === 'dist' || rel === 'reports') return true;
  if (rel.includes('/dist/') || rel.endsWith('/dist')) return true;
  if (rel.includes('/reports/') || rel.endsWith('/reports')) return true;
  return false;
}

function isForbiddenTempFile(rel, name) {
  if (name.endsWith('.log')) return true;
  if (/_NOTES\.md$/i.test(name)) return true;
  if (name.endsWith('.md') && rel !== 'README.md') return true;
  return false;
}

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    if (skipDirs.has(name)) continue;
    const p = path.join(dir, name);
    const rel = relOf(p);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (isBackupDir(rel, name) || isForbiddenGeneratedDir(rel, name)) {
        removeEntry(p);
      } else {
        walk(p);
      }
      continue;
    }
    if (st.isFile() && isForbiddenTempFile(rel, name)) removeEntry(p);
  }
}

walk(root);

if (removed.length) {
  console.log('[clean-old-patch-docs] removed stale package artifacts:');
  for (const rel of removed) console.log(`- ${rel}`);
} else {
  console.log('[clean-old-patch-docs] no stale package artifacts found');
}
