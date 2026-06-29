import fs from 'node:fs';
import path from 'node:path';

const read = (p) => fs.readFileSync(p, 'utf8');
const fail = (message) => { console.error(`[v21105] ${message}`); process.exit(1); };
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
const expectedCache = 'aqua-fantasia-v2.1.105-premium-scene-integrity-polish';

const directions = ['east','west','north','south','northeast','northwest','southeast','southwest'];
for (const direction of directions) {
  for (let frame = 1; frame <= 4; frame += 1) {
    const rel = `public/assets/v2129/characters/player/player_${direction}_frame_${String(frame).padStart(2, '0')}.png`;
    must(fs.existsSync(path.join(root, rel)), `missing player frame: ${rel}`);
  }
}
must(world.includes("player_${direction}_frame_${String(index + 1).padStart(2, '0')}.png"), 'player direction filename template changed');
must(!world.includes('player.scale.x = direction') && !world.includes('player.scale.x *= -1') && !world.includes('scale.x *= -1'), 'player direction flip regression token found');

must(pkg.version === '2.1.105', 'package.json version mismatch');
must(lock.version === '2.1.105' && lock.packages?.['']?.version === '2.1.105', 'package-lock version mismatch');
must(data.includes("APP_VERSION = '2.1.105'"), 'APP_VERSION not synced');
must(data.includes(expectedCache), 'CACHE_NAME not synced in data.ts');
must(sw.includes('v2.1.105') && sw.includes(expectedCache), 'service worker not synced');
must(offline.includes('v2.1.105'), 'offline page not synced');
must(readme.startsWith('# AquaFantasia v2.1.105') && readme.includes('## v2.1.105 변경사항'), 'README version/history missing');
must(pkg.scripts.validate.includes('check-v21105-premium-scene-integrity-polish.mjs'), 'validate script not updated');

must(main.includes('installV21104OverlapDesignEnginePolishPass') && main.includes('installV21105PremiumSceneIntegrityPolishPass'), 'v21104/v21105 install chain missing');
must(main.includes('v21105-premium-scene-integrity-root') && main.includes('v21105PremiumSceneIntegrity'), 'v21105 root markers missing');
must(main.includes('scene-scoped-fishing-village-build-design-performance'), 'v21105 scene performance marker missing');
must(main.includes('v21105-opening-shell') && main.includes('v21105-opening-video'), 'v21105 opening classes missing');
must(main.includes("video.removeAttribute('poster')") || main.includes('video.removeAttribute("poster")'), 'opening poster removal missing');
must(main.includes("video.removeAttribute('controls')") || main.includes('video.removeAttribute("controls")'), 'opening controls removal missing');
must(main.includes('disablepictureinpicture') && main.includes('disableremoteplayback') && main.includes('disableRemotePlayback'), 'opening native video UI lock missing');
must(main.includes('controls-poster-pip-remote-disabled-first-frame-shell') && main.includes('requestVideoFrameCallback'), 'first frame native shell marker missing');
must(!main.includes('poster="./assets/v2120/opening/aqua_opening_poster_v2120.jpg"') && !main.includes("poster='./assets/v2120/opening/aqua_opening_poster_v2120.jpg'"), 'opening poster restored unexpectedly');

must(main.includes('v21105-fishing-loadout') && main.includes('two-equal-columns-micro-icons-text-first-scene-safe'), 'v21105 fishing loadout missing');
must(main.includes('v21105-loadout-cell') && main.includes('exact-half-readable-ellipsis-no-icon-bloat'), 'v21105 loadout cell guard missing');
must(main.includes('v21105-focused-stage-clean-prep-only') && main.includes('v21105-reeling-only-control'), 'v21105 fishing phase cleanup missing');
must(main.includes('v21105-bite-callout') && main.includes('v21105-result-card') && main.includes('v21105-result-actions'), 'v21105 bite/result layout guards missing');
must(main.includes('v21105-village-stability-screen') && main.includes('paint-stable-menu-hud-joystick-textless-no-player-coordinate-change'), 'village stability guard missing');
must(main.includes('v21105-top-menu-grid-lock') && main.includes('two-by-three-compact-one-border-no-frame'), 'top menu grid lock missing');
must(main.includes('v21105-build-flow-modal') && main.includes('select-preview-tile-small-confirm-build-cancel'), 'build flow guard missing');
must(main.includes('v21105-aurora-glass-card') && main.includes('v21105-readable-input') && main.includes('v21105-close-x'), 'premium design guards missing');
must(main.includes("img.decoding = 'async'") && main.includes("img.loading = 'lazy'") && main.includes('img.draggable = false'), 'image async/lazy/no-drag policy missing');
must(main.includes('v21105FrameBudget') && main.includes('long-frame-observed-scene-throttled'), 'frame budget throttle marker missing');

must(css.includes('v21105-premium-scene-integrity-root'), 'v21105 css root missing');
must(css.includes('--v21105-loadout-icon: 4px') && css.includes('--v21105-loadout-height: 19px'), 'v21105 loadout variables missing');
must(css.includes('grid-template-columns: minmax(0, 1fr) minmax(0, 1fr)') && css.includes('grid-template-columns: var(--v21105-loadout-icon) minmax(0, 1fr)'), 'v21105 two-slot grid missing');
must(css.includes('::-webkit-media-controls-start-playback-button') && css.includes('::-webkit-media-controls-overlay-play-button'), 'native play mark css lock missing');
must(css.includes('v21105-top-menu-grid-lock') && css.includes('repeat(2, var(--v21105-menu-button))'), 'top menu css lock missing');
must(css.includes('v21105-build-confirm-card') && css.includes('v21105-build-confirm-actions'), 'build confirm css missing');
must(css.includes('v21105-aurora-glass-card') && css.includes('v21105-readable-input') && css.includes('v21105-close-x'), 'premium design/readable input/close css missing');
must(css.includes('body[data-screen="fishing"] .bottom-nav'), 'fishing village dock hide css missing');
must(css.includes('[class*="ribbon"]') && css.includes('max-height: 22px'), 'result badge/ribbon compact guard missing');

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
must(!fs.existsSync(path.join(root, 'APP_VERSION')), 'root APP_VERSION file must not exist');

console.log('[v21105] premium scene integrity, fishing/village/build/design, opening, player direction checks passed');
