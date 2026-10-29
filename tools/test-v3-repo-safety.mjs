import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

test('legacy cleanup command never deletes user files or backups', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'aqua-v3-safety-'));
  const cleaner = path.resolve('tools/clean-old-patch-docs.mjs');
  try {
    for (const dir of ['reports', 'AquaFantasia_backup_2026', 'dist']) {
      fs.mkdirSync(path.join(fixture, dir));
      fs.writeFileSync(path.join(fixture, dir, 'keep.txt'), 'original');
    }
    for (const file of ['notes.md', 'session.log']) {
      fs.writeFileSync(path.join(fixture, file), 'original');
    }
    const run = spawnSync(process.execPath, [cleaner], { cwd: fixture, encoding: 'utf8' });
    assert.equal(run.status, 0, run.stderr);
    assert.match(run.stdout, /preserved/);
    for (const entry of ['reports/keep.txt', 'AquaFantasia_backup_2026/keep.txt', 'dist/keep.txt', 'notes.md', 'session.log']) {
      assert.equal(fs.readFileSync(path.join(fixture, entry), 'utf8'), 'original');
    }
  } finally {
    // Only the isolated fixture created by this test is removed.
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});
