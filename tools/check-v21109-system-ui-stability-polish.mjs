import fs from 'node:fs';
import path from 'node:path';

const read = (p) => fs.readFileSync(p, 'utf8');
const fail = (message) => { console.error(`[v21109] ${message}`); process.exit(1); };
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
const expectedVersion = '2.1.109';
const expectedCache = 'aqua-fantasia-v2.1.109-system-ui-stability-polish';

must(pkg.version === expectedVersion, 'package.json version mismatch');
must(lock.version === expectedVersion && lock.packages?.['']?.version === expectedVersion, 'package-lock version mismatch');
must(data.includes(`APP_VERSION = '${expectedVersion}'`) && data.includes(expectedCache), 'data.ts version/cache mismatch');
must(sw.includes('v2.1.109') && sw.includes(expectedCache), 'service worker not synced');
must(offline.includes('v2.1.109') && offline.includes('낚시 안전 구간 프레임 안정화'), 'offline page not synced');
must(readme.startsWith('# AquaFantasia v2.1.109') && readme.includes('## v2.1.109 변경사항'), 'README version/history missing');
must(pkg.scripts.validate.includes('check-v21109-system-ui-stability-polish.mjs'), 'validate script not updated');

must(main.includes('installV21108FishingBiteBalancePolishPass') && main.includes('installV21109SystemUiStabilityPolishPass'), 'v21109 install chain missing');
must(main.includes('fishingSafeZoneCenter') && main.includes('fishingSafeZoneLastAt'), 'safe window frame lock fields missing');
must(main.includes('frame-stable safe window') && main.includes('targetCenter') && main.includes('smoothing'), 'safeZone smoothing not applied');
must(main.includes('--v21109-bite-top') && main.includes('--v21109-battle-top') && main.includes('--v21109-reel-bottom'), 'v21109 runtime CSS variables missing');
must(main.includes('v21109-bite-callout-safe') && main.includes('screen-inside-lowered-safe-anchor'), 'bite callout safe anchor missing');
must(main.includes('v21109-action-badge-stable') && main.includes('phase-scoped-fixed-safe-feedback'), 'action badge stable anchor missing');
must(main.includes('v21109-phase-clean-node') && main.includes('v21109-result-card-stable'), 'phase cleanup/result card stabilizers missing');
must(main.includes('v21109-premium-glass-card') && main.includes('v21109-readable-input') && main.includes('v21109-no-drag-image'), 'premium common UI design guards missing');

must(css.includes('v21109-system-ui-stability-root') && css.includes('--v21109-bite-top'), 'v21109 CSS root vars missing');
must(css.includes('.v21109-bite-callout-safe') && css.includes('top: var(--v21109-bite-top)'), 'bite callout CSS missing');
must(css.includes('.v21109-action-badge-stable') && css.includes('top: var(--v21109-alert-top)'), 'action badge CSS missing');
must(css.includes('.v21109-battle-strip-stable') && css.includes('.v21109-reel-console-stable'), 'fishing rail CSS missing');
must(css.includes('.v21109-result-card-stable') && css.includes('var(--v21109-result-max-height)'), 'result card CSS missing');
must(css.includes('.v21109-readable-input') && css.includes('background: rgba(246,253,255,.96)'), 'input readability CSS missing');
must(css.includes('prefers-reduced-motion: reduce') && css.includes('v21109-system-ui-stability-root *'), 'v21109 reduced motion CSS missing');

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
console.log('[v21109] safe-window frame lock, fishing UI rails, design stability checks passed');
