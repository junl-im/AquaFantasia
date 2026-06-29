import fs from 'node:fs';
import path from 'node:path';

const read = (p) => fs.readFileSync(p, 'utf8');
const fail = (message) => { console.error(`[v21103] ${message}`); process.exit(1); };
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
const expectedCache = 'aqua-fantasia-v2.1.103-opening-loadout-final-guard';

const directions = ['east','west','north','south','northeast','northwest','southeast','southwest'];
for (const direction of directions) {
  for (let frame = 1; frame <= 4; frame += 1) {
    const rel = `public/assets/v2129/characters/player/player_${direction}_frame_${String(frame).padStart(2, '0')}.png`;
    must(fs.existsSync(path.join(root, rel)), `missing player frame: ${rel}`);
  }
}
must(world.includes("player_${direction}_frame_${String(index + 1).padStart(2, '0')}.png"), 'player direction filename template changed');
must(!world.includes('player.scale.x = direction') && !world.includes('player.scale.x *= -1'), 'player direction flip regression token found');

must(pkg.version === '2.1.103', 'package.json version mismatch');
must(lock.version === '2.1.103' && lock.packages?.['']?.version === '2.1.103', 'package-lock version mismatch');
must(data.includes("APP_VERSION = '2.1.103'"), 'APP_VERSION not synced');
must(data.includes(expectedCache), 'CACHE_NAME not synced in data.ts');
must(sw.includes('v2.1.103') && sw.includes(expectedCache), 'service worker not synced');
must(offline.includes('v2.1.103'), 'offline page not synced');
must(readme.startsWith('# AquaFantasia v2.1.103') && readme.includes('## v2.1.103 변경사항'), 'README version/history missing');
must(pkg.scripts.validate.includes('check-v21103-opening-loadout-final-guard.mjs'), 'validate script not updated');

must(main.includes('installV21103OpeningLoadoutFinalGuardPass'), 'v21103 install pass missing');
must(main.includes('v21103-opening-loadout-final-guard-root') && main.includes('v21103OpeningLoadoutFinalGuard'), 'v21103 runtime markers missing');
must(main.includes('v21103-opening-cinematic') && main.includes('v21103-opening-video'), 'v21103 opening classes missing');
must(main.includes("video.removeAttribute('poster')") || main.includes('video.removeAttribute("poster")'), 'opening poster removal missing');
must(main.includes("video.removeAttribute('controls')") || main.includes('video.removeAttribute("controls")'), 'opening controls attr removal missing');
must(main.includes('disablepictureinpicture') && main.includes('disableremoteplayback') && main.includes('disableRemotePlayback'), 'opening native video UI lock missing');
must(main.includes('requestVideoFrameCallback') && main.includes('v21103-first-frame-ready'), 'v21103 first frame shell missing');
must(main.includes('native-play-mark-controls-remote-pip-masked-until-first-frame'), 'v21103 native chrome mask marker missing');
must(main.includes('.top-menu-bar,.v2167-top-menu-hard-lock,.hud-bar,.pioneer-bar,.bottom-dock,.virtual-joystick,.joystick-root'), 'opening chrome hide selector missing');
must(main.includes('v21103-fishing-loadout') && main.includes('strict-50-50-thinner-text-first-final-guard'), 'v21103 fishing split loadout missing');
must(main.includes('v21103-loadout-cell') && main.includes('strict-half-micro-icon-readable-no-left-overflow'), 'v21103 loadout cell guard missing');
must(main.includes('v2132-fishing-director') && main.includes('v21103-bite-callout') && main.includes('v21103-result-card'), 'v21103 bite/result guards missing');
must(main.includes('v21103-no-reeling-cleanup'), 'v21103 reeling cleanup missing');

must(css.includes('v21103-opening-loadout-final-guard-root'), 'v21103 css root missing');
must(css.includes('--v21103-loadout-icon: 4px') && css.includes('--v21103-loadout-height: 20px'), 'v21103 loadout sizing variables missing');
must(css.includes('grid-template-columns: minmax(0, 1fr) minmax(0, 1fr)') && css.includes('grid-template-columns: var(--v21103-loadout-icon) minmax(0, 1fr)'), 'v21103 two-slot text-first grid missing');
must(css.includes('::-webkit-media-controls-start-playback-button') && css.includes('::-webkit-media-controls-overlay-play-button'), 'native play mark css lock missing');
must(css.includes('v21103-ocean-glass-card') && css.includes('v21103-readable-input'), 'premium design/readable input css missing');
must(css.includes('max-height: 26px') && css.includes('[class*="ribbon"]'), 'result badge/ribbon compact guard missing');

function balanced(source, open, close) {
  let depth = 0;
  for (const char of source) {
    if (char === open) depth += 1;
    if (char === close) depth -= 1;
    if (depth < 0) return false;
  }
  return depth === 0;
}
must(balanced(css, '{', '}'), 'CSS brace balance failed');
must(!main.includes('poster="./assets/v2120/opening/aqua_opening_poster_v2120.jpg"') && !main.includes('poster=\"./assets/v2120/opening/aqua_opening_poster_v2120.jpg\"'), 'opening poster restored unexpectedly');
must(!fs.existsSync(path.join(root, 'APP_VERSION')), 'root APP_VERSION file must not exist');

console.log('[v21103] opening native shell, fishing loadout, bite/result, player direction checks passed');
