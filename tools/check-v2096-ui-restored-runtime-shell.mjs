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

const fail = (msg) => { console.error(`[v2096] ${msg}`); process.exit(1); };
const need = (cond, msg) => { if (!cond) fail(msg); };

need(pkg.version === '2.0.96', 'package version must be 2.0.96');
need(pkg.scripts?.validate?.includes('check-v2096-ui-restored-runtime-shell.mjs'), 'validate must use v2096 guard');
need(data.includes("APP_VERSION = '2.0.96'"), 'APP_VERSION must be 2.0.96');
need(data.includes('aqua-fantasia-v2.0.96-ui-restored-runtime-shell'), 'data cache name must be v2.0.96 restored shell');
need(sw.includes('aqua-fantasia-v2.0.96-ui-restored-runtime-shell'), 'service worker cache must be v2.0.96');
need(offline.includes('v2.0.96'), 'offline badge must be v2.0.96');
need(readme.includes('v2.0.96'), 'README must mention v2.0.96');
need(main.includes('v2096-bottom-nav'), 'clean single-row bottom nav must be created');
need(main.includes('clean-single-row-${active}'), 'dock policy must be clean single row');
need(!main.includes('disabled-clean-shell-${active}'), 'disabled dock policy must not remain live');
need(main.includes('v2096-fishing-screen'), 'fishing screen must have v2096 stable class');
need(village.includes('const biasedWorld'), 'village pointer lower-left bias must be present');
need(main.includes('data-v2096-expedition-toggle') && main.includes('data-v2096-expedition-body'), 'expedition controls must use v2096 live selectors');
need(main.includes('runtime-content v2096-menu-content'), 'menu content must retain runtime-content and v2096 class');
need(css.includes('v2.0.96 restored runtime shell'), 'v2096 CSS shell block missing');
need(css.includes('.v2096-bottom-nav'), 'v2096 bottom nav CSS missing');
need(css.includes('.v2096-fishing-screen'), 'v2096 fishing CSS missing');
need(css.includes('.v2096-village-hud') && css.includes('right: calc(max(10px, env(safe-area-inset-right)) + 62px)'), 'HUD must leave room for right controls');
need(css.includes('.v2096-expedition-body.v2096-expedition-body-open'), 'expedition open CSS missing');
need(css.includes('.hit-keep.checked .keep-indicator'), 'start keep checked indicator CSS missing');
console.log('[AquaFantasia] v2.0.96 restored runtime shell validation passed.');
