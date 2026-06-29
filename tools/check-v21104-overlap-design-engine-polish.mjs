import fs from 'node:fs';
import path from 'node:path';

const read = (p) => fs.readFileSync(p, 'utf8');
const fail = (message) => { console.error(`[v21104] ${message}`); process.exit(1); };
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
const expectedCache = 'aqua-fantasia-v2.1.104-overlap-design-engine-polish';

const directions = ['east','west','north','south','northeast','northwest','southeast','southwest'];
for (const direction of directions) {
  for (let frame = 1; frame <= 4; frame += 1) {
    const rel = `public/assets/v2129/characters/player/player_${direction}_frame_${String(frame).padStart(2, '0')}.png`;
    must(fs.existsSync(path.join(root, rel)), `missing player frame: ${rel}`);
  }
}
must(world.includes("player_${direction}_frame_${String(index + 1).padStart(2, '0')}.png"), 'player direction filename template changed');
must(!world.includes('player.scale.x = direction') && !world.includes('player.scale.x *= -1'), 'player direction flip regression token found');

must(pkg.version === '2.1.104', 'package.json version mismatch');
must(lock.version === '2.1.104' && lock.packages?.['']?.version === '2.1.104', 'package-lock version mismatch');
must(data.includes("APP_VERSION = '2.1.104'"), 'APP_VERSION not synced');
must(data.includes(expectedCache), 'CACHE_NAME not synced in data.ts');
must(sw.includes('v2.1.104') && sw.includes(expectedCache), 'service worker not synced');
must(offline.includes('v2.1.104'), 'offline page not synced');
must(readme.startsWith('# AquaFantasia v2.1.104') && readme.includes('## v2.1.104 변경사항'), 'README version/history missing');
must(pkg.scripts.validate.includes('check-v21104-overlap-design-engine-polish.mjs'), 'validate script not updated');

must(main.includes('installV21103OpeningLoadoutFinalGuardPass') && main.includes('installV21104OverlapDesignEnginePolishPass'), 'v21103/v21104 install pass chain missing');
must(main.includes('v21104-overlap-design-engine-root') && main.includes('v21104OverlapDesignEngine'), 'v21104 runtime markers missing');
must(main.includes('active-screen-collision-sweep-premium-performance'), 'v21104 active-screen performance marker missing');
must(main.includes('v21104-opening-cinematic') && main.includes('v21104-opening-video'), 'v21104 opening classes missing');
must(main.includes("video.removeAttribute('poster')") || main.includes('video.removeAttribute("poster")'), 'opening poster removal missing');
must(main.includes("video.removeAttribute('controls')") || main.includes('video.removeAttribute("controls")'), 'opening controls attr removal missing');
must(main.includes('disablepictureinpicture') && main.includes('disableremoteplayback') && main.includes('disableRemotePlayback'), 'opening native video UI lock missing');
must(main.includes('requestVideoFrameCallback') && main.includes('v21104-first-frame-ready'), 'v21104 first frame shell missing');
must(main.includes('posterless-native-controls-pip-remote-blocked-shell'), 'v21104 native chrome mask marker missing');
must(main.includes('.top-menu-bar,.v2167-top-menu-hard-lock,.hud-bar,.pioneer-bar,.bottom-dock,.virtual-joystick,.joystick-root'), 'opening chrome hide selector missing');

must(main.includes('v21104-fishing-loadout') && main.includes('strict-half-half-hairline-icons-safe-under-sea-lane'), 'v21104 fishing split loadout missing');
must(main.includes('v21104-loadout-cell') && main.includes('exact-half-text-first-no-left-overflow'), 'v21104 loadout cell guard missing');
must(main.includes('v21104-focused-stage-clean-prep-overlap') && main.includes('v21104-no-reeling-artifact-cleanup'), 'v21104 fishing phase cleanup missing');
must(main.includes('v21104-bite-callout') && main.includes('v21104-result-card') && main.includes('v21104-result-actions'), 'v21104 bite/result layout guards missing');
must(main.includes('v21104-ocean-depth-card') && main.includes('v21104-readable-input') && main.includes('v21104-close-x'), 'v21104 premium design guards missing');
must(main.includes("img.decoding = 'async'") && main.includes("img.loading = 'lazy'") && main.includes('img.draggable = false'), 'v21104 image async/lazy/no-drag policy missing');
must(main.includes('v21104FrameBudget') && main.includes('long-frame-observed-throttled'), 'v21104 frame budget marker missing');

must(css.includes('v21104-overlap-design-engine-root'), 'v21104 css root missing');
must(css.includes('--v21104-loadout-icon: 4px') && css.includes('--v21104-loadout-height: 19px'), 'v21104 loadout sizing variables missing');
must(css.includes('grid-template-columns: minmax(0, 1fr) minmax(0, 1fr)') && css.includes('grid-template-columns: var(--v21104-loadout-icon) minmax(0, 1fr)'), 'v21104 two-slot text-first grid missing');
must(css.includes('::-webkit-media-controls-start-playback-button') && css.includes('::-webkit-media-controls-overlay-play-button'), 'native play mark css lock missing');
must(css.includes('v21104-ocean-depth-card') && css.includes('v21104-readable-input') && css.includes('v21104-close-x'), 'premium design/readable input/close css missing');
must(css.includes('v21104-result-actions') && css.includes('max-height: 24px') && css.includes('[class*="ribbon"]'), 'result compact actions/badge guard missing');
must(css.includes('body[data-screen="fishing"] .bottom-nav'), 'fishing village dock hide css missing');

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
must(!main.includes('poster="./assets/v2120/opening/aqua_opening_poster_v2120.jpg"') && !main.includes("poster='./assets/v2120/opening/aqua_opening_poster_v2120.jpg'"), 'opening poster restored unexpectedly');
must(!fs.existsSync(path.join(root, 'APP_VERSION')), 'root APP_VERSION file must not exist');

console.log('[v21104] overlap/design engine, fishing cleanup, opening, player direction checks passed');
