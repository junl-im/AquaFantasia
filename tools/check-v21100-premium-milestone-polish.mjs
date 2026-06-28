import fs from 'node:fs';
import path from 'node:path';

const read = (p) => fs.readFileSync(p, 'utf8');
const fail = (message) => { console.error(`[v21100] ${message}`); process.exit(1); };
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

const world = read(path.join(root, 'src/villageWorld.ts'));
const directions = ['east','west','north','south','northeast','northwest','southeast','southwest'];
for (const direction of directions) {
  for (let frame = 1; frame <= 4; frame += 1) {
    const rel = `public/assets/v2129/characters/player/player_${direction}_frame_${String(frame).padStart(2, '0')}.png`;
    must(fs.existsSync(path.join(root, rel)), `missing player frame: ${rel}`);
  }
}
must(world.includes("player_${direction}_frame_${String(index + 1).padStart(2, '0')}.png"), 'player direction filename template changed');
must(!world.includes('player.scale.x = direction') && !world.includes('player.scale.x *= -1'), 'player direction flip regression token found');

must(pkg.version === '2.1.100', 'package.json version mismatch');
must(lock.version === '2.1.100' && lock.packages?.['']?.version === '2.1.100', 'package-lock version mismatch');
must(data.includes("APP_VERSION = '2.1.100'"), 'APP_VERSION not synced');
must(data.includes('aqua-fantasia-v2.1.100-premium-milestone-polish'), 'CACHE_NAME not synced');
must(sw.includes('v2.1.100') && sw.includes('aqua-fantasia-v2.1.100-premium-milestone-polish'), 'service worker not synced');
must(offline.includes('v2.1.100'), 'offline page not synced');
must(readme.startsWith('# AquaFantasia v2.1.100'), 'README top version missing');
must(pkg.scripts.validate.includes('check-v21100-premium-milestone-polish.mjs'), 'validate script not updated');

must(main.includes('installV21100PremiumMilestonePolishPass'), 'v21100 install pass missing');
must(main.includes('v21100-premium-milestone-root') && main.includes('v21100PremiumMilestonePolish'), 'v21100 runtime markers missing');
must(main.includes('v21100-opening-cinematic') && main.includes('v21100-opening-video'), 'v21100 opening classes missing');
must(main.includes('video.removeAttribute(\'poster\')') || main.includes('video.removeAttribute("poster")'), 'opening poster removal missing');
must(main.includes('disablepictureinpicture') && main.includes('disableremoteplayback'), 'opening native video UI lock missing');
must(main.includes('requestVideoFrameCallback') && main.includes('v21100-first-frame-ready'), 'first frame shield missing');
must(main.includes('v21100-fishing-loadout') && main.includes('milestone-ultra-slim-two-slot-text-first'), 'v21100 fishing thin loadout missing');
must(main.includes('v21100-loadout-cell') && main.includes('text-first-micro-icon-no-crop'), 'v21100 loadout text-first cell missing');
must(main.includes('v21100-bite-callout') && main.includes('v21100-result-card'), 'v21100 bite/result guards missing');
must(main.includes('v21100-no-reeling-cleanup'), 'v21100 reeling cleanup missing');

must(css.includes('v21100-premium-milestone-root'), 'v21100 css root missing');
must(css.includes('--v21100-loadout-icon: 4px') && css.includes('--v21100-loadout-height: 21px'), 'v21100 loadout sizing variables missing');
must(css.includes('grid-template-columns: minmax(0, 1fr) minmax(0, 1fr)') && css.includes('grid-template-columns: var(--v21100-loadout-icon) minmax(0, 1fr)'), 'v21100 two-slot text-first grid missing');
must(css.includes('::-webkit-media-controls-start-playback-button') && css.includes('::-webkit-media-controls-overlay-play-button'), 'native play mark css lock missing');
must(css.includes('v21100-ocean-glass-card') && css.includes('v21100-readable-input'), 'premium design/readable input css missing');
must(!main.includes('poster="./assets/v2120/opening/aqua_opening_poster_v2120.jpg"'), 'opening poster restored unexpectedly');
must(!fs.existsSync(path.join(root, 'APP_VERSION')), 'root APP_VERSION file must not exist');

console.log('[v21100] premium milestone polish, opening shield, fishing loadout/result/design checks passed');
