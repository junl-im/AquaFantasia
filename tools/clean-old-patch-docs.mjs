import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const removed = [];
const bannedFile = /^(CLEAN_REPLACE_GUIDE|FINAL_CONSOLIDATED|PATCH_NOTES|PROMPTS_DALLE_ASSETS|DELETE_OLD_FILES).*\.md$/;

function removeEntry(p) {
  if (!fs.existsSync(p)) return;
  const rel = path.relative(root, p).replace(/\\/g, '/');
  fs.rmSync(p, { recursive: true, force: true });
  removed.push(rel);
}

for (const name of fs.readdirSync(root)) {
  if (bannedFile.test(name)) removeEntry(path.join(root, name));
}
removeEntry(path.join(root, 'reports'));

if (removed.length) {
  console.log('[clean-old-patch-docs] removed stale patch docs:');
  for (const rel of removed) console.log(`- ${rel}`);
} else {
  console.log('[clean-old-patch-docs] no stale patch docs found');
}
