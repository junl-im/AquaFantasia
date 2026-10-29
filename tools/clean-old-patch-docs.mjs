import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
// The legacy filename is retained for the existing validation command.
// It must never delete user documents, logs, backups, or generated artifacts.
const preserved = [];
const skipDirs = new Set(['node_modules', '.git']);
const allowedRootMarkdown = new Set(['README.md', 'AI_HANDOFF_CARDVILLE.md']);

function relOf(p) {
  return path.relative(root, p).replace(/\\/g, '/');
}

function noteEntry(p) {
  preserved.push(relOf(p));
}

function isAllowedRootMarkdown(rel, name) {
  return !rel.includes('/') && allowedRootMarkdown.has(name);
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
  if (name.endsWith('.md') && !isAllowedRootMarkdown(rel, name)) return true;
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
        noteEntry(p);
      } else {
        walk(p);
      }
      continue;
    }
    if (st.isFile() && isForbiddenTempFile(rel, name)) noteEntry(p);
  }
}

walk(root);

if (preserved.length) {
  console.log('[clean-old-patch-docs] read-only audit; preserved all matching files/directories:');
  for (const rel of preserved.slice(0, 30)) console.log(`- ${rel}`);
  if (preserved.length > 30) console.log(`- ... and ${preserved.length - 30} more`);
} else {
  console.log('[clean-old-patch-docs] read-only audit; no legacy artifacts found');
}
