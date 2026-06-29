import fs from 'node:fs';
import path from 'node:path';

const read = (p) => fs.readFileSync(p, 'utf8');
const fail = (message) => { console.error(`[v21108] ${message}`); process.exit(1); };
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
const expectedVersion = '2.1.108';
const expectedCache = 'aqua-fantasia-v2.1.108-fishing-bite-balance-polish';

must(pkg.version === expectedVersion, 'package.json version mismatch');
must(lock.version === expectedVersion && lock.packages?.['']?.version === expectedVersion, 'package-lock version mismatch');
must(data.includes(`APP_VERSION = '${expectedVersion}'`) && data.includes(expectedCache), 'data.ts version/cache mismatch');
must(sw.includes('v2.1.108') && sw.includes(expectedCache), 'service worker not synced');
must(offline.includes('v2.1.108') && offline.includes('물었다! 콜아웃 위치 보정'), 'offline page not synced');
must(readme.startsWith('# AquaFantasia v2.1.108') && readme.includes('## v2.1.108 변경사항'), 'README version/history missing');
must(pkg.scripts.validate.includes('check-v21108-fishing-bite-balance-polish.mjs'), 'validate script not updated');

must(main.includes('installV21107UiStabilityDesignEnginePass') && main.includes('installV21108FishingBiteBalancePolishPass'), 'v21108 install chain missing');
must(main.includes('FishTensionProfile') && main.includes('activeFishProfile') && main.includes('createFishTensionProfile'), 'fish tension profile engine missing');
must(main.includes("'steady' | 'dart' | 'heavy' | 'wave' | 'boss'") && main.includes('잔잔형') && main.includes('질주형') && main.includes('중량형') && main.includes('보스형'), 'fish profile archetype labels missing');
must(main.includes('profile.safeWidth') && main.includes('profile.centerSwing') && main.includes('profile.catchRate') && main.includes('profile.resistance') && main.includes('profile.escape'), 'fish profile not wired into battle math');
must(main.includes('lowered-safe-screen-inside-anchor') && main.includes('separate-from-bite-callout-no-overlap'), 'bite/action badge deconflict markers missing');
must(main.includes('--v21108-bite-callout-top') && main.includes('--v21108-alert-top'), 'v21108 CSS variables not set from runtime');
must(main.includes('document.body.dataset.v21108FishingPhase') && main.includes('v21108-fish-pattern-readout'), 'phase/readout markers missing');

must(css.includes('v21108-fishing-bite-balance-root') && css.includes('--v21108-bite-callout-top'), 'v21108 CSS root vars missing');
must(css.includes('.v21108-bite-callout-lowered') && css.includes('position: fixed') && css.includes('top: var(--v21108-bite-callout-top)'), 'bite callout lowered CSS missing');
must(css.includes('.v21108-action-badge-stable') && css.includes('top: var(--v21108-alert-top)'), 'action badge stable CSS missing');
must(css.includes('.v21108-fish-pattern-readout') && css.includes('text-overflow: ellipsis'), 'fish pattern readout CSS missing');
must(css.includes('prefers-reduced-motion: reduce') && css.includes('v21108-fishing-bite-balance-root *'), 'v21108 reduced motion CSS missing');

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
console.log('[v21108] fishing bite callout position, fish-specific tension/resistance, UI stability checks passed');
