import fs from 'node:fs';
import path from 'node:path';

const read = (p) => fs.readFileSync(p, 'utf8');
const fail = (message) => { console.error(`[v21102] ${message}`); process.exit(1); };
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

must(pkg.version === '2.1.102', 'package.json version mismatch');
must(lock.version === '2.1.102' && lock.packages?.['']?.version === '2.1.102', 'package-lock version mismatch');
must(data.includes("APP_VERSION = '2.1.102'"), 'APP_VERSION not synced');
must(data.includes('aqua-fantasia-v2.1.102-premium-design-system-continuation'), 'CACHE_NAME not synced');
must(sw.includes('v2.1.102') && sw.includes('aqua-fantasia-v2.1.102-premium-design-system-continuation'), 'service worker not synced');
must(offline.includes('v2.1.102'), 'offline page not synced');
must(readme.startsWith('# AquaFantasia v2.1.102'), 'README top version missing');
must(pkg.scripts.validate.includes('check-v21102-premium-design-system-continuation.mjs'), 'validate script not updated');

must(main.includes('installV21102PremiumDesignSystemContinuationPass'), 'v21102 install pass missing');
must(main.includes('v21102-premium-design-system-continuation-root') && main.includes('v21102PremiumDesignSystem'), 'v21102 runtime markers missing');
must(main.includes('v21102-opening-cinematic') && main.includes('v21102-opening-video'), 'v21102 opening classes missing');
must(main.includes('video.removeAttribute(\'poster\')') || main.includes('video.removeAttribute("poster")'), 'opening poster removal missing');
must(main.includes('disablepictureinpicture') && main.includes('disableremoteplayback'), 'opening native video UI lock missing');
must(main.includes('requestVideoFrameCallback') && main.includes('v21102-first-frame-ready'), 'v21102 first frame shell missing');
must(main.includes('v21102-fishing-loadout') && main.includes('thin-two-slot-text-first-continuation'), 'v21102 fishing split loadout missing');
must(main.includes('v21102-loadout-cell') && main.includes('two-slot-text-first-micro-icon-readable'), 'v21102 loadout text-first cell missing');
must(main.includes('v21102-bite-callout') && main.includes('v21102-result-card'), 'v21102 bite/result guards missing');
must(main.includes('v21102-no-reeling-cleanup'), 'v21102 reeling cleanup missing');

must(css.includes('v21102-premium-design-system-continuation-root'), 'v21102 css root missing');
must(css.includes('--v21102-loadout-icon: 5px') && css.includes('--v21102-loadout-height: 22px'), 'v21102 loadout sizing variables missing');
must(css.includes('grid-template-columns: minmax(0, 1fr) minmax(0, 1fr)') && css.includes('grid-template-columns: var(--v21102-loadout-icon) minmax(0, 1fr)'), 'v21102 two-slot text-first grid missing');
must(css.includes('::-webkit-media-controls-start-playback-button') && css.includes('::-webkit-media-controls-overlay-play-button'), 'native play mark css lock missing');
must(css.includes('v21102-ocean-glass-card') && css.includes('v21102-readable-input'), 'premium design/readable input css missing');
must(!main.includes('poster="./assets/v2120/opening/aqua_opening_poster_v2120.jpg"'), 'opening poster restored unexpectedly');
must(!fs.existsSync(path.join(root, 'APP_VERSION')), 'root APP_VERSION file must not exist');

console.log('[v21102] premium design system continuation, opening mask, fishing split loadout/result/design checks passed');
