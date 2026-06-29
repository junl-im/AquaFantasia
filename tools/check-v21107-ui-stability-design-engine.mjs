import fs from 'node:fs';
import path from 'node:path';

const read = (p) => fs.readFileSync(p, 'utf8');
const fail = (message) => { console.error(`[v21107] ${message}`); process.exit(1); };
const must = (condition, message) => { if (!condition) fail(message); };

const root = process.cwd();
const pkg = JSON.parse(read(path.join(root, 'package.json')));
const lock = JSON.parse(read(path.join(root, 'package-lock.json')));
const data = read(path.join(root, 'src/data.ts'));
const main = read(path.join(root, 'src/main.ts'));
const css = read(path.join(root, 'src/styles.css'));
const toast = read(path.join(root, 'src/toast.ts'));
const sw = read(path.join(root, 'public/sw.js'));
const offline = read(path.join(root, 'public/offline.html'));
const readme = read(path.join(root, 'README.md'));
const world = read(path.join(root, 'src/villageWorld.ts'));
const expectedCache = 'aqua-fantasia-v2.1.107-ui-stability-design-engine';

must(pkg.version === '2.1.107', 'package.json version mismatch');
must(lock.version === '2.1.107' && lock.packages?.['']?.version === '2.1.107', 'package-lock version mismatch');
must(data.includes("APP_VERSION = '2.1.107'") && data.includes(expectedCache), 'data.ts version/cache mismatch');
must(sw.includes('v2.1.107') && sw.includes(expectedCache), 'service worker not synced');
must(offline.includes('v2.1.107') && offline.includes('성능 안정화 엔진'), 'offline page not synced');
must(readme.startsWith('# AquaFantasia v2.1.107') && readme.includes('## v2.1.107 변경사항'), 'README version/history missing');
must(pkg.scripts.validate.includes('check-v21107-ui-stability-design-engine.mjs'), 'validate script not updated');

must(main.includes('installV21106FishingJitterStabilityPolishPass') && main.includes('installV21107UiStabilityDesignEnginePass'), 'v21106/v21107 install chain missing');
must(main.includes('v21107-ui-stability-design-root') && main.includes('scene-scoped-overlap-perf-feedback-polish'), 'v21107 root marker missing');
must(main.includes('lastHapticAt') && main.includes('lastTouchRingAt'), 'feedback throttle fields missing');
must(main.includes('v21107-quiet-touch-ring') && main.includes('throttled-no-stack-touch-ring'), 'touch ring throttle marker missing');
must(main.includes("document.body.dataset.fishingPhase = phase"), 'body fishing phase sync missing');
must(main.includes('v21107-loadout-deconflict') && main.includes('v21107-micro-loadout-icon'), 'loadout deconflict markers missing');
must(main.includes('v21107-battle-anchor') && main.includes('v21107-result-card-polish'), 'battle/result anchor markers missing');
must(main.includes('v21107-premium-glass-card') && main.includes('v21107-no-drag-image'), 'common design guard markers missing');
must(main.includes("const minGap = fishingScreen ? (this.state === 'reeling' ? 180 : 118) : 72"), 'haptic throttle gap missing');

must(toast.includes('v21107StableToast') && toast.includes('v21107-stable-toast') && toast.includes('throttled-safe-area-premium-feedback'), 'ToastManager v21107 markers missing');
must(css.includes('v21107-ui-stability-design-root') && css.includes('--v21107-card-width'), 'v21107 css root vars missing');
must(css.includes('v21107-loadout-deconflict') && css.includes('grid-template-columns: minmax(0, 1fr) minmax(0, 1fr)'), 'v21107 loadout CSS missing');
must(css.includes('v21107-quiet-alert-anchor') && css.includes('animation: none'), 'v21107 alert no-shake CSS missing');
must(css.includes('v21107-result-card-polish') && css.includes('overscroll-behavior: contain'), 'v21107 result card CSS missing');
must(css.includes('prefers-reduced-motion: reduce') && css.includes('v21107-ui-stability-design-root *'), 'v21107 reduced motion CSS missing');

const directions = ['east','west','north','south','northeast','northwest','southeast','southwest'];
for (const direction of directions) {
  for (let frame = 1; frame <= 4; frame += 1) {
    const rel = `public/assets/v2129/characters/player/player_${direction}_frame_${String(frame).padStart(2, '0')}.png`;
    must(fs.existsSync(path.join(root, rel)), `missing player frame: ${rel}`);
  }
}
must(world.includes("player_${direction}_frame_${String(index + 1).padStart(2, '0')}.png"), 'player direction filename template changed');
must(!world.includes('player.scale.x = direction') && !world.includes('player.scale.x *= -1') && !world.includes('scale.x *= -1'), 'player direction flip regression token found');
must(main.includes("video.removeAttribute('poster')") || main.includes('video.removeAttribute("poster")'), 'opening poster removal missing');
must(!main.includes('poster="./assets/v2120/opening/aqua_opening_poster_v2120.jpg"') && !main.includes("poster='./assets/v2120/opening/aqua_opening_poster_v2120.jpg'"), 'opening poster restored unexpectedly');

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
console.log('[v21107] UI stability/design engine, fishing feedback throttle, opening and player direction checks passed');
