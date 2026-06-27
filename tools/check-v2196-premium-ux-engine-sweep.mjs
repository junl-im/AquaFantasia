import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const fail = (message) => { console.error(`[v2196] ${message}`); process.exit(1); };
const must = (cond, message) => { if (!cond) fail(message); };

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const main = read('src/main.ts');
const css = read('src/styles.css');
const data = read('src/data.ts');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const readme = read('README.md');

must(pkg.version === '2.1.96', 'package.json version mismatch');
must(lock.version === '2.1.96' && lock.packages?.['']?.version === '2.1.96', 'package-lock version mismatch');
must(data.includes("APP_VERSION = '2.1.96'"), 'APP_VERSION not synced');
must(data.includes('aqua-fantasia-v2.1.96-premium-ux-engine-sweep'), 'CACHE_NAME not synced');
must(sw.includes('v2.1.96') && sw.includes('aqua-fantasia-v2.1.96-premium-ux-engine-sweep'), 'service worker not synced');
must(offline.includes('v2.1.96'), 'offline page not synced');
must(readme.startsWith('# AquaFantasia v2.1.96'), 'README top version missing');
must(pkg.scripts.validate.includes('check-v2196-premium-ux-engine-sweep.mjs'), 'validate script not updated');

must(main.includes('installV2196PremiumUxEngineSweepPass'), 'v2196 runtime pass missing');
must(main.includes('v2196-opening-cinematic') && main.includes('v2196-opening-video'), 'v2196 opening classes missing');
must(main.includes('requestVideoFrameCallback') && main.includes('hidden-until-real-video-frame'), 'first-frame video guard missing');
must(!main.includes('poster="./assets/v2120/opening/aqua_opening_poster_v2120.jpg"'), 'opening poster restored unexpectedly');
must(main.includes('controlsList') && main.includes('noremoteplayback') && main.includes('disablepictureinpicture'), 'native video controls suppression missing');
must(main.includes('v2196-fishing-loadout') && main.includes('v2196-loadout-cell') && main.includes('v2196-loadout-copy'), 'v2196 fishing loadout classes missing');
must(main.includes('top-thin-long-half-half-text-first'), 'text-first loadout runtime contract missing');
must(main.includes('v2196-result-card') && main.includes('v2196-bite-callout'), 'v2196 bite/result layout guards missing');

must(css.includes('v2196-premium-ux-engine-sweep'), 'v2196 CSS marker missing');
must(css.includes('--v2196-loadout-icon: 9px') && css.includes('--v2196-loadout-height: 26px'), 'v2196 loadout size variables missing');
must(css.includes('grid-template-columns: minmax(0, 1fr) minmax(0, 1fr)') && css.includes('grid-template-columns: var(--v2196-loadout-icon) minmax(0, 1fr)'), 'v2196 two-column text-first CSS missing');
must(css.includes('::-webkit-media-controls-start-playback-button') && css.includes('v2196-first-frame-ready'), 'v2196 native play mark CSS guard missing');
must(css.includes('v2196-result-max-height') && css.includes('v2196-result-impact'), 'v2196 result compact CSS missing');

const assetFiles = [];
const walk = (dir) => {
  for (const name of fs.readdirSync(path.join(root, dir))) {
    const rel = path.join(dir, name);
    const abs = path.join(root, rel);
    const stat = fs.statSync(abs);
    if (stat.isDirectory()) walk(rel);
    else assetFiles.push(rel.replace(/\\/g, '/'));
  }
};
if (fs.existsSync(path.join(root, 'public'))) walk('public');
const playerChecks = [
  'player_east_frame_', 'player_west_frame_', 'player_north_frame_', 'player_south_frame_',
  'player_northeast_frame_', 'player_northwest_frame_', 'player_southeast_frame_', 'player_southwest_frame_'
];
for (const token of playerChecks) must(main.includes(token) || data.includes(token) || assetFiles.some((file) => file.includes(token)), `player direction token missing: ${token}`);
must(!/player_(east|west|north|south|northeast|northwest|southeast|southwest)[\s\S]{0,120}(scale\.x\s*=\s*-|flip|alias)/i.test(main), 'player direction flip/alias regression detected');

const forbiddenRootMarkdown = fs.readdirSync(root).filter((name) => /^.*\.md$/i.test(name) && name !== 'README.md');
must(forbiddenRootMarkdown.length === 0, `extra root markdown files: ${forbiddenRootMarkdown.join(', ')}`);
must(!fs.existsSync(path.join(root, 'APP_VERSION')), 'APP_VERSION root file must not exist');

console.log('[v2196] first-frame opening, text-first loadout, premium design/performance checks passed');
