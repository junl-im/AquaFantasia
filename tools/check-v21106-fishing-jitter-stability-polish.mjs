import fs from 'node:fs';
import path from 'node:path';

const read = (p) => fs.readFileSync(p, 'utf8');
const fail = (message) => { console.error(`[v21106] ${message}`); process.exit(1); };
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
const expectedCache = 'aqua-fantasia-v2.1.106-fishing-jitter-stability-polish';

const directions = ['east','west','north','south','northeast','northwest','southeast','southwest'];
for (const direction of directions) {
  for (let frame = 1; frame <= 4; frame += 1) {
    const rel = `public/assets/v2129/characters/player/player_${direction}_frame_${String(frame).padStart(2, '0')}.png`;
    must(fs.existsSync(path.join(root, rel)), `missing player frame: ${rel}`);
  }
}
must(world.includes("player_${direction}_frame_${String(index + 1).padStart(2, '0')}.png"), 'player direction filename template changed');
must(!world.includes('player.scale.x = direction') && !world.includes('player.scale.x *= -1') && !world.includes('scale.x *= -1'), 'player direction flip regression token found');

must(pkg.version === '2.1.106', 'package.json version mismatch');
must(lock.version === '2.1.106' && lock.packages?.['']?.version === '2.1.106', 'package-lock version mismatch');
must(data.includes("APP_VERSION = '2.1.106'") && data.includes(expectedCache), 'data.ts version/cache mismatch');
must(sw.includes('v2.1.106') && sw.includes(expectedCache), 'service worker not synced');
must(offline.includes('v2.1.106') && offline.includes('떨림 안정화'), 'offline page not synced');
must(readme.startsWith('# AquaFantasia v2.1.106') && readme.includes('## v2.1.106 변경사항'), 'README version/history missing');
must(pkg.scripts.validate.includes('check-v21106-fishing-jitter-stability-polish.mjs'), 'validate script not updated');

must(main.includes('installV21105PremiumSceneIntegrityPolishPass') && main.includes('installV21106FishingJitterStabilityPolishPass'), 'v21105/v21106 install chain missing');
must(main.includes('v21106-fishing-jitter-stability-root') && main.includes('anchored-bobber-toast-alert-no-shake-premium-layout'), 'v21106 root marker missing');
must(main.includes('fishingBobberAnchorX') && main.includes('fishingBobberPullOffset'), 'bobber anchor fields missing');
must(main.includes('this.bobber.position.set(\n        this.fishingBobberAnchorX') && !main.includes('this.bobber.y += Math.sin(now / 250)'), 'bobber non-cumulative motion not applied');
must(main.includes('const pulseGap = status.safe ? 820') && main.includes('420 : 560'), 'haptic pulse gap not softened');
must(main.includes('v21106-stable-action-badge') && main.includes('single-anchor-no-shake-notification'), 'action badge stable anchor missing');
must(main.includes('v21106-stable-battle-strip') && main.includes('v21106-stable-reel-control'), 'reeling cockpit stability markers missing');
must(main.includes('v21106-stable-toast') && main.includes('single-anchor-opacity-feedback-no-pop-jitter'), 'stable toast normalization missing');

must(toast.includes('v21106StableToast') && toast.includes('v21106-stable-toast') && toast.includes('anchored-no-jitter-fishing-safe-feedback'), 'ToastManager stable toast markers missing');
must(css.includes('v21106-fishing-jitter-stability-root') && css.includes('--v21106-alert-top'), 'v21106 css root vars missing');
must(css.includes('v21106-stable-action-badge') && css.includes('animation: none'), 'v21106 stable action badge css missing');
must(css.includes('#toast-root[data-v21106-stable-toast="anchored-no-jitter-fishing-safe-feedback"]') && css.includes('place-items: start center'), 'stable toast root css missing');
must(css.includes('v21106-stable-battle-strip') && css.includes('v21106-stable-reel-control'), 'reeling cockpit css missing');
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
console.log('[v21106] fishing jitter/toast stability, premium layout, opening and player direction checks passed');
