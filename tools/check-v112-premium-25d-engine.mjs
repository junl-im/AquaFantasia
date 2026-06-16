import { readFileSync, existsSync } from 'node:fs';
import { Script } from 'node:vm';

const read = (p) => readFileSync(p, 'utf8');
const checks = [];
const add = (ok, msg) => checks.push({ ok, msg });
const pkg = JSON.parse(read('package.json'));
const data = read('src/data.ts');
const main = read('src/main.ts');
const css = read('src/styles.css');
const sw = read('public/sw.js');
const underwater = read('src/core/UnderwaterWebglLayer.ts');
const quality = read('src/core/RuntimeQualityManager.ts');

add(pkg.version === '1.1.2', 'package version is 1.1.2');
add(data.includes("APP_VERSION = '1.1.2'"), 'APP_VERSION is 1.1.2');
add(data.includes('aqua-fantasia-v1.1.2-premium-25d-engine'), 'cache name updated in data');
add(sw.includes('aqua-fantasia-v1.1.2-premium-25d-engine'), 'service worker cache updated');
add(sw.includes('Promise.allSettled(PRECACHE.map((url) => cache.add(url)))'), 'service worker precache is fault tolerant');
try { new Script(sw); add(true, 'service worker syntax is valid'); } catch (error) { add(false, `service worker syntax invalid: ${error.message}`); }

add(main.includes("dataset.visualPolish = 'v1111-quality-engine-ui-audit'"), 'v1.1.1 safety CSS marker is retained');
add(main.includes("dataset.enginePatch = 'v1112-premium-25d-engine'"), 'v1.1.2 engine marker is wired');
add(main.includes('v1112-premium-engine-screen'), 'runtime menu v1112 class exists');
add(main.includes('v1112-premium-engine-fishing'), 'fishing v1112 class exists');
add(main.includes('syncCatchSpriteTexture'), 'active fish texture sync exists');
add(main.includes('tickFallback(now, dt)'), 'HTML fallback reeling loop is wired');
add(main.includes('fallbackTicker'), 'fallback ticker cleanup exists');
add(main.includes('syncFishingHud()'), 'fishing HUD live sync exists');
add(main.includes("if (active !== 'fishing'"), 'fishing remains excluded from tab swipe');
add(main.includes('Pointer Events. Installing both pointer and touch handlers'), 'duplicate swipe guard still exists');
add(main.includes('recommendedDprCap()'), 'Pixi DPR cap uses runtime quality');

add(quality.includes('aqua-runtime-quality-change'), 'runtime quality change event exists');
add(quality.includes('--premium-depth-alpha'), 'premium depth alpha is quality-controlled');
add(quality.includes('fps-recovery'), 'runtime quality can recover from lite');
add(underwater.includes('quality-lite') || underwater.includes('quality-${this.quality}'), 'underwater canvas quality class exists');
add(underwater.includes("powerPreference: WebGLPowerPreference"), 'underwater power preference follows tier');
add(underwater.includes('frameIndex % 2'), 'lite underwater shader frame throttling exists');
add(underwater.includes('u_ui_safety'), 'underwater shader keeps UI safety alpha');

add(css.includes('v1.1.1 QUALITY ENGINE + UI AUDIT'), 'v1.1.1 CSS safety block retained');
add(css.includes('v1.1.2 PREMIUM 2.5D ENGINE PASS'), 'v1.1.2 CSS block exists');
add(css.includes('html[data-engine-patch="v1112-premium-25d-engine"] .bottom-nav.v840-bottom-nav'), 'v112 nav final guard exists');
add(css.includes('grid-template-columns: repeat(8, minmax(0, 1fr))'), 'bottom nav has 8 fixed columns');
add(css.includes('v1112-premium-engine-screen .v108-shop-card.shop-card'), 'shop card premium containment exists');
add(css.includes('v1112-premium-engine-screen .v108-mission-card'), 'mission card premium containment exists');
add(css.includes('v1112-premium-engine-screen .v108-rank-row'), 'ranking contrast containment exists');
add(css.includes('v1112-premium-engine-fishing .recent-catch-strip'), 'fishing recent catch separation exists');
add(css.includes('var(--water-fx-alpha'), 'water alpha remains quality-controlled');
add(!/\.svg/i.test(main + css + data), 'no SVG/vector asset references added');
add(existsSync('README.md'), 'README.md exists');

const precache = [...sw.matchAll(/"(\.\/?[^"\n]+)"/g)].map((m) => m[1]);
const missing = [];
for (const url of precache) {
  if (url === './') continue;
  const rel = url.replace(/^\.\//, '');
  const file = rel === 'index.html' ? 'index.html' : `public/${rel}`;
  if (!existsSync(file)) missing.push(file);
}
add(missing.length === 0, missing.length ? `precache has missing files: ${missing.slice(0, 8).join(', ')}` : 'precache file list has no missing files');

const failed = checks.filter((c) => !c.ok);
for (const check of checks) console.log(`${check.ok ? 'PASS' : 'FAIL'} ${check.msg}`);
if (failed.length) {
  console.error(`v1.1.2 premium 2.5D engine validation failed: ${failed.length} issue(s)`);
  process.exit(1);
}
console.log('v1.1.2 premium 2.5D engine checks passed.');
