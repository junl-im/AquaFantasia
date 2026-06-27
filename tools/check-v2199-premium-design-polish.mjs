import fs from 'node:fs';
import path from 'node:path';

const read = (p) => fs.readFileSync(p, 'utf8');
const fail = (message) => { console.error(`[v2199] ${message}`); process.exit(1); };
const must = (condition, message) => { if (!condition) fail(message); };

const root = process.cwd();
const pkg = JSON.parse(read(path.join(root, 'package.json')));
const lock = JSON.parse(read(path.join(root, 'package-lock.json')));
const data = read(path.join(root, 'src/data.ts'));
const main = read(path.join(root, 'src/main.ts'));
const css = read(path.join(root, 'src/styles.css'));
const sw = read(path.join(root, 'public/sw.js'));
const offline = read(path.join(root, 'public/offline.html'));
const readme = read(path.join(root, 'README.md'));

must(pkg.version === '2.1.99', 'package.json version mismatch');
must(lock.version === '2.1.99' && lock.packages?.['']?.version === '2.1.99', 'package-lock version mismatch');
must(data.includes("APP_VERSION = '2.1.99'"), 'APP_VERSION not synced');
must(data.includes('aqua-fantasia-v2.1.99-premium-design-polish'), 'CACHE_NAME not synced');
must(sw.includes('v2.1.99') && sw.includes('aqua-fantasia-v2.1.99-premium-design-polish'), 'service worker not synced');
must(offline.includes('v2.1.99'), 'offline page not synced');
must(readme.startsWith('# AquaFantasia v2.1.99'), 'README top version missing');
must(pkg.scripts.validate.includes('check-v2199-premium-design-polish.mjs'), 'validate script not updated');

must(main.includes('installV2199PremiumDesignPolishPass'), 'v2199 install pass missing');
must(main.includes('v2199-opening-cinematic') && main.includes('v2199-opening-video'), 'v2199 opening classes missing');
must(main.includes('video.removeAttribute(\'poster\')') || main.includes('video.removeAttribute("poster")'), 'opening poster removal missing');
must(main.includes('disablepictureinpicture') && main.includes('disableremoteplayback'), 'opening native video UI lock missing');
must(main.includes('requestVideoFrameCallback') && main.includes('v2199-first-frame-ready'), 'first presented frame shield missing');
must(main.includes('v2199-fishing-loadout') && main.includes('v2199-loadout-cell') && main.includes('v2199-loadout-copy'), 'v2199 fishing loadout classes missing');
must(main.includes('ultra-thin-two-slot-text-first') && main.includes('micro-4-5px-text-first'), 'text-first micro loadout contract missing');
must(main.includes('v2199-bite-callout') && main.includes('v2199-result-card'), 'bite/result layout guards missing');
must(main.includes('v2199-no-reeling-cleanup'), 'fishing reeling cleanup missing');

must(css.includes('v2199-premium-design-polish-root'), 'v2199 css root missing');
must(css.includes('--v2199-loadout-icon: 5px') && css.includes('--v2199-loadout-height: 22px'), 'v2199 loadout sizing variables missing');
must(css.includes('grid-template-columns: minmax(0, 1fr) minmax(0, 1fr)'), 'two half loadout grid missing');
must(css.includes('grid-template-columns: var(--v2199-loadout-icon) minmax(0, 1fr)'), 'micro icon/text grid missing');
must(css.includes('::-webkit-media-controls-start-playback-button') && css.includes('::-webkit-media-controls-overlay-play-button'), 'native play mark css lock missing');
must(!main.includes('poster="./assets/v2120/opening/aqua_opening_poster_v2120.jpg"'), 'opening poster restored unexpectedly');
must(!fs.existsSync(path.join(root, 'APP_VERSION')), 'root APP_VERSION file must not exist');

console.log('[v2199] premium design polish, opening shield, fishing loadout/result checks passed');
