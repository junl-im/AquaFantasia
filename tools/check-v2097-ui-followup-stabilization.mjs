import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const pkg = JSON.parse(read('package.json'));
const main = read('src/main.ts');
const css = read('src/styles.css');
const data = read('src/data.ts');
const village = read('src/villageWorld.ts');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const readme = read('README.md');

const fail = (msg) => { console.error(`[v2097] ${msg}`); process.exit(1); };
const need = (cond, msg) => { if (!cond) fail(msg); };

need(pkg.version === '2.0.97', 'package version must be 2.0.97');
need(pkg.scripts?.validate?.includes('check-v2097-ui-followup-stabilization.mjs'), 'validate must use v2097 guard');
need(data.includes("APP_VERSION = '2.0.97'"), 'APP_VERSION must be 2.0.97');
need(data.includes('aqua-fantasia-v2.0.97-ui-followup-stabilization-shell'), 'data cache name must be v2.0.97 follow-up shell');
need(sw.includes('aqua-fantasia-v2.0.97-ui-followup-stabilization-shell'), 'service worker cache must be v2.0.97 follow-up shell');
need(offline.includes('v2.0.97'), 'offline badge must be v2.0.97');
need(readme.includes('v2.0.97'), 'README must mention v2.0.97');
need(main.includes('v2097-live-ui-stable-shell'), 'v2097 live shell marker must be attached');
need(main.includes('v2097-bottom-nav') && main.includes('stable-single-row-${active}'), 'single-row bottom nav must be v2097 stable policy');
need(main.includes("root.className = 'game-screen fishing-screen v2097-fishing-screen locked-screen'"), 'fishing screen must not carry the old stacked v20xx screen classes');
need(!main.includes('v2030-fishing-stage-reset-screen v205-fishing-asset-screen'), 'old fishing screen class chain must not remain live');
need(main.includes('runtime-content v2097-menu-content'), 'menu content must retain runtime-content and v2097 class');
need(main.includes('data-v2097-expedition-toggle') && main.includes('data-v2097-expedition-body'), 'expedition controls must use v2097 live selectors');
need(css.includes('v2.0.97 follow-up stabilization'), 'v2097 CSS stabilization block missing');
need(css.includes('html[data-version="2.0.97"] .v2097-bottom-nav'), 'v2097 bottom nav CSS missing');
need(css.includes('.v2097-fishing-screen'), 'v2097 fishing CSS missing');
need(css.includes('right: calc(max(8px, env(safe-area-inset-right)) + var(--v2097-right-rail))'), 'HUD must leave right rail space');
need(css.includes('.v2097-expedition-body.v2097-expedition-body-open'), 'expedition open CSS missing');
need(css.includes('.hit-keep.checked .keep-indicator'), 'start keep checked indicator CSS missing');
need(village.includes('const biasedWorld'), 'village pointer lower-left bias must be present');
console.log('[AquaFantasia] v2.0.97 follow-up UI stabilization validation passed.');
