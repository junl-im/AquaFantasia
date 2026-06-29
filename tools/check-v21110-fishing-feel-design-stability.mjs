import fs from 'node:fs';
import path from 'node:path';

const read = (p) => fs.readFileSync(p, 'utf8');
const fail = (message) => { console.error(`[v21110] ${message}`); process.exit(1); };
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
const expectedVersion = '2.1.110';
const expectedCache = 'aqua-fantasia-v2.1.110-fishing-feel-design-stability';

must(pkg.version === expectedVersion, 'package.json version mismatch');
must(lock.version === expectedVersion && lock.packages?.['']?.version === expectedVersion, 'package-lock version mismatch');
must(pkg.scripts.validate.includes('check-v21110-fishing-feel-design-stability.mjs'), 'validate script not updated');
must(data.includes(`APP_VERSION = '${expectedVersion}'`) && data.includes(expectedCache), 'data.ts version/cache mismatch');
must(sw.includes('v2.1.110') && sw.includes(expectedCache), 'service worker not synced');
must(offline.includes('v2.1.110') && offline.includes('피로도 기반 저항 변화'), 'offline page not synced');
must(readme.startsWith('# AquaFantasia v2.1.110') && readme.includes('## v2.1.110 변경사항'), 'README version/history missing');

must(main.includes('installV21109SystemUiStabilityPolishPass') && main.includes('installV21110FishingFeelDesignStabilityPass'), 'v21110 install chain missing');
must(main.includes('fatigueRelief') && main.includes('recoveryGrace') && main.includes('staminaFatigue') && main.includes('staminaDrag'), 'fish fatigue/resistance behavior missing');
must(main.includes('0.5') || main.includes('* 2) / 2'), 'safe window quantization missing');
must(main.includes('quantized tired-fish safe window') && main.includes('half-point quantization'), 'safeZone v21110 comments missing');
must(main.includes('--v21110-bite-top') && main.includes('--v21110-alert-top') && main.includes('--v21110-reel-bottom'), 'v21110 runtime vars missing');
must(main.includes('v21110-bite-callout-inside') && main.includes('lowered-inside-viewport-no-edge-clip'), 'bite callout inside anchor missing');
must(main.includes('v21110-action-badge-calm') && main.includes('single-safe-lane-no-motion-pop'), 'action badge calm lane missing');
must(main.includes('v21110-stable-readout') && main.includes('fixed-line-height-tabular-metrics'), 'stable readout guard missing');
must(main.includes('v21110-result-card-premium') && main.includes('v21110-premium-card-hygiene'), 'result/common premium guard missing');
must(main.includes('v21110-image-stability') && main.includes('loading ||=') && main.includes("decoding = 'async'"), 'image stability policy missing');

must(css.includes('v21110-fishing-feel-design-root') && css.includes('--v21110-bite-top'), 'v21110 CSS root vars missing');
must(css.includes('.v21110-bite-callout-inside') && css.includes('top: var(--v21110-bite-top)'), 'v21110 bite CSS missing');
must(css.includes('.v21110-action-badge-calm') && css.includes('top: var(--v21110-alert-top)'), 'v21110 action badge CSS missing');
must(css.includes('.v21110-stable-readout') && css.includes('font-variant-numeric: tabular-nums'), 'v21110 readout CSS missing');
must(css.includes('.v21110-result-card-premium') && css.includes('var(--v21110-result-max-height)'), 'v21110 result CSS missing');
must(css.includes('.v21110-close-button-unified') && css.includes('.v21110-premium-card-hygiene'), 'v21110 common design CSS missing');
must(css.includes('prefers-reduced-motion: reduce') && css.includes('v21110-fishing-feel-design-root *'), 'v21110 reduced motion CSS missing');

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
must(!fs.existsSync(path.join(root, 'APP_VERSION')), 'root APP_VERSION file must not exist');

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
console.log('[v21110] fishing feel, fatigue resistance, safe lane, and premium design stability checks passed');
