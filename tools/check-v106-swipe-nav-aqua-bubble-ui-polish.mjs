import { readFileSync, existsSync } from 'node:fs';

const read = (p) => readFileSync(p, 'utf8');
const checks = [];
const add = (ok, msg) => checks.push({ ok, msg });

const pkg = JSON.parse(read('package.json'));
const data = read('src/data.ts');
const main = read('src/main.ts');
const css = read('src/styles.css');
const shader = read('src/core/UnderwaterWebglLayer.ts');
const sw = read('public/sw.js');

add(pkg.version === '1.0.6', 'package version is 1.0.6');
add(data.includes("APP_VERSION = '1.0.6'"), 'APP_VERSION is 1.0.6');
add(data.includes('aqua-fantasia-v1.0.6-swipe-nav-aqua-bubble-ui-polish'), 'cache name updated in data');
add(sw.includes('aqua-fantasia-v1.0.6-swipe-nav-aqua-bubble-ui-polish'), 'service worker cache updated');
add(main.includes('v106-swipe-nav-ui-screen'), 'runtime screens have v106 class');
add(main.includes('v106-swipe-nav-ui-fishing'), 'fishing screen has v106 class');
add(main.includes('installTabSwipe'), 'menu swipe navigation is installed');
add(main.includes("const swipeOrder: Screen[] = ['village', 'fishing', 'gear', 'inventory', 'dex', 'shop', 'mission', 'ranking'];"), 'swipe tab order is explicit');
add(main.includes("if (active !== 'fishing'"), 'fishing tab is excluded from swipe navigation');
add(main.includes('<div class="combo-badge hidden"'), 'combo badge starts hidden');
add(main.includes('this.comboNode.classList.toggle(\'hidden\', this.save.currentStreak < 2)'), 'combo appears only for streaks');
add(css.includes('v1.0.6 SWIPE NAV + AQUA BUBBLE UI POLISH'), 'v106 CSS block exists');
add(css.includes("--v106-nav-frame: url('/assets/v106/ui/bottom_nav_frame_slim.png')"), 'slim nav frame is used');
add(css.includes('clamp(32px, 8.6vw, 39px)'), 'bottom nav icons are enlarged');
add(css.includes('Content buttons are the compact buttons'), 'content CTA button compaction exists');
add(css.includes('.ranking-screen .runtime-title strong'), 'ranking readability override exists');
add(css.includes('.swipe-enabled-screen'), 'swipe-enabled screen CSS exists');
add(css.includes('.fishing-screen.v106-swipe-nav-ui-fishing') && css.includes('touch-action: none'), 'fishing swipe prevention CSS exists');
add(css.includes('Aqua droplet fallback layer'), 'aqua droplet fallback CSS exists');
add(shader.includes('float aquaDroplet'), 'shader uses aqua droplet bubbles');
add(shader.includes('for (int i = 0; i < 17; i++)'), 'shader droplet density is updated');
add(shader.includes('vec3(0.76, 1.0, 1.0) * bubbles * 0.34'), 'shader bubble color is aqua-tinted');
add(existsSync('public/assets/v106/ui/bottom_nav_frame_slim.png'), 'v106 bottom nav frame asset exists');
add(existsSync('README.md'), 'README.md exists');

const failed = checks.filter((c) => !c.ok);
for (const check of checks) console.log(`${check.ok ? 'PASS' : 'FAIL'} ${check.msg}`);
if (failed.length) {
  console.error(`v1.0.6 validation failed: ${failed.length} issue(s)`);
  process.exit(1);
}
console.log('v1.0.6 swipe nav aqua bubble UI polish checks passed.');
