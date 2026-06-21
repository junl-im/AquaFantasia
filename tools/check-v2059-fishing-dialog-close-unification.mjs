#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const fail = (message) => { console.error(`[v2059] ${message}`); process.exit(1); };

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const data = read('src/data.ts');
const main = read('src/main.ts');
const css = read('src/styles.css');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const readme = read('README.md');

if (!/^2\.0\.(59|[6-9][0-9])$/.test(pkg.version)) fail('package.json version must be 2.0.59+ lineage');
if (!/^2\.0\.(59|[6-9][0-9])$/.test(lock.version) || !/^2\.0\.(59|[6-9][0-9])$/.test(lock.packages?.['']?.version ?? '')) fail('package-lock.json root versions must be 2.0.59+ lineage');
if (!/APP_VERSION = '2\.0\.(59|[6-9][0-9])'/.test(data)) fail('APP_VERSION must be 2.0.59+ lineage');
if (!data.includes('fishing-dialog-close-unification') && !data.includes('grounded-motion-polish') && !data.includes('loop-ui-button-audit') && !data.includes('fishing-card-window-rework') && !data.includes('ground-contact-motion-audit') && !data.includes('fishing-card-window-rework')) fail('CACHE_NAME must keep v2.0.59+ cache lineage');
if (!sw.includes('fishing-dialog-close-unification') && !sw.includes('grounded-motion-polish') && !sw.includes('loop-ui-button-audit') && !sw.includes('fishing-card-window-rework') && !sw.includes('ground-contact-motion-audit') && !sw.includes('fishing-card-window-rework')) fail('service worker cache must keep v2.0.59+ cache lineage');
if (!/v2\.0\.(59|[6-9][0-9])/.test(offline)) fail('offline badge must show v2.0.59+ lineage');
if (!/^# AquaFantasia v2\.0\.(59|[6-9][0-9])/.test(readme)) fail('README title must be v2.0.59+ lineage');
if (!readme.includes('## v2.0.59 변경사항')) fail('README must include v2.0.59 changelog');

for (const token of [
  'dataset.v2059FishingDialogCloseUnification',
  'v2059-fishing-dialog-screen',
  'v2059-screen-close',
  'data-v2059-fishing-close',
  'data-v2059-menu-close',
  'v2059-result-card',
  'avoid duplicate toast/result popups',
  'root.dataset.v2059DockHidden',
]) {
  if (!main.includes(token)) fail(`main.ts missing ${token}`);
}
for (const token of [
  'v2.0.59 fishing result compaction',
  'body:not([data-screen="village"]) .bottom-nav.fixed-root-nav',
  '.catch-result-card.v2059-result-card',
  '.v2059-screen-close',
  '.v2059-fishing-dialog-screen .v2057-reel-console',
]) {
  if (!css.includes(token)) fail(`styles.css missing ${token}`);
}
if ((main.match(/this\.toast\.show\(\{ type: 'dex'/g) ?? []).length > 0) fail('success result must not also show a dex toast');
if ((main.match(/showResultCard\(reward\)/g) ?? []).length < 2) fail('result card guards should remain in fallback and pixi paths');
if (!main.includes("document.querySelectorAll('.catch-result-card').forEach((node) => node.remove())")) fail('result card singleton cleanup is missing');
if (fs.readdirSync(root).filter((name) => /_NOTES\.md$/i.test(name)).length) fail('root *_NOTES.md files are not allowed');

const lockText = read('package-lock.json');
for (const forbidden of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  if (lockText.includes(forbidden)) fail(`forbidden registry token found: ${forbidden}`);
}

console.log('[AquaFantasia] v2.0.59 fishing dialog / close unification validation passed.');
