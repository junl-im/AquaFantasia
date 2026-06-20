#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const fail = (message) => { console.error(`[v2058] ${message}`); process.exit(1); };

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const data = read('src/data.ts');
const types = read('src/types.ts');
const storage = read('src/storage.ts');
const main = read('src/main.ts');
const css = read('src/styles.css');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const readme = read('README.md');

if (pkg.version !== '2.0.58') fail('package.json version must be 2.0.58');
if (lock.version !== '2.0.58' || lock.packages?.['']?.version !== '2.0.58') fail('package-lock.json root versions must be 2.0.58');
if (!data.includes("APP_VERSION = '2.0.58'")) fail('APP_VERSION must be 2.0.58');
if (!data.includes('aqua-fantasia-v2.0.58-tech-modernization-multiplayer-guard')) fail('CACHE_NAME must use v2.0.58 modernization cache');
if (!sw.includes('aqua-fantasia-v2.0.58-tech-modernization-multiplayer-guard')) fail('service worker cache must use v2.0.58 cache');
if (!offline.includes('v2.0.58')) fail('offline badge must show v2.0.58');
if (!readme.startsWith('# AquaFantasia v2.0.58')) fail('README title must be v2.0.58');
if (!readme.includes('## v2.0.58 변경사항')) fail('README must include v2.0.58 changelog');

for (const token of ['MultiplayerState', 'MultiplayerEvent', 'pendingEvents', 'clientId']) {
  if (!types.includes(token)) fail(`types.ts missing multiplayer token ${token}`);
}
for (const token of ['sanitizeMultiplayer', 'appendLocalSyncEvent', 'consumeLocalSyncEvents', 'aqua-fantasia-client-id']) {
  if (!storage.includes(token)) fail(`storage.ts missing multiplayer sanitizer/foundation token ${token}`);
}
if (!main.includes('appendLocalSyncEvent')) fail('main.ts must append local sync events for future multiplayer');
if (!main.includes('fishingInputAbort') || !main.includes('new AbortController()')) fail('fishing input listeners must be abortable to avoid repeated-render leaks');
if ((main.match(/익명 서버연동 완료/g) ?? []).length > 1) fail('duplicate server-link toast text should not remain in startGame');
if (!main.includes("dataset.v2058TechModernization")) fail('runtime feature dataset for v2058 is missing');
if (!main.includes("nav.dataset.v2058DockGuard")) fail('bottom dock v2058 guard dataset is missing');
if (!css.includes('v2.0.58 technical modernization')) fail('styles.css missing v2058 modernization block');
if (!css.includes('prefers-reduced-motion')) fail('styles.css must keep reduced-motion performance guard');
if (!css.includes('background-image: none !important')) fail('styles.css must quarantine old image button frames');
if (fs.readdirSync(root).filter((name) => /_NOTES\.md$/i.test(name)).length) fail('root *_NOTES.md files are not allowed');

const lockText = read('package-lock.json');
for (const forbidden of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  if (lockText.includes(forbidden)) fail(`forbidden registry token found: ${forbidden}`);
}

console.log('[AquaFantasia] v2.0.58 tech modernization / multiplayer guard validation passed.');
