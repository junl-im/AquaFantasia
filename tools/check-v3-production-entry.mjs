import fs from 'node:fs';
import assert from 'node:assert/strict';

const entry = fs.readFileSync('src/entry.ts','utf8');
const page = fs.readFileSync('index.html','utf8');
const worker = fs.readFileSync('public/sw.js','utf8');
const manifest = JSON.parse(fs.readFileSync('public/manifest.webmanifest','utf8'));
const root = fs.readFileSync('src/v3/preview.ts','utf8');

assert.match(entry,/bootAquaFantasia/,'V3 must be the main executable');
assert.doesNotMatch(entry,/import\(['"]\.\/main['"]\)/,'Legacy V2 must not boot');
assert.doesNotMatch(entry,/searchParams\.get\(['"]preview['"]\)/,'No preview gate on production URL');
assert.doesNotMatch(root,/기존 게임으로 돌아가기|기존 게임 ↗|V3 LAB|낚시 엔진 미리보기/,'No preview/legacy UI copy');
assert.doesNotMatch(root,/data-v3-exit/,'No obsolete return button');
assert.match(page,/aqua-app-version.*3\.0\.0/);
assert.equal(manifest.start_url,'./');
assert.equal(manifest.scope,'./');
assert.equal(manifest.orientation,'any');
assert.match(worker,/aqua-fantasia-v3-launch-/,'Service worker must invalidate the old V2 cache');
assert.match(worker,/sweep|isAquaCache/,'Service worker must clear old V2 caches');
assert.match(worker,/request\.mode === 'navigate'/,'App shell must be refreshed from network');
console.log('[V3 release] default entry, V2 isolation, app metadata, SW and PWA guards passed');
