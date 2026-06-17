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

add(/^1\.1\.([4-9]|[1-9][0-9]+)$/.test(pkg.version), 'package version keeps v1.1.4+ lineage');
add(data.includes('APP_VERSION ='), 'APP_VERSION is declared');
add(data.includes('aqua-fantasia-v1.1.'), 'cache name keeps v1.1 lineage in data');
add(sw.includes('aqua-fantasia-v1.1.'), 'service worker cache keeps v1.1 lineage');
add(sw.includes('Promise.allSettled(PRECACHE.map((url) => cache.add(url)))'), 'service worker precache is fault tolerant');
try { new Script(sw); add(true, 'service worker syntax is valid'); } catch (error) { add(false, `service worker syntax invalid: ${error.message}`); }

add(main.includes("dataset.visualPolish = 'v1111-quality-engine-ui-audit'"), 'v1.1.1 safety CSS marker is retained');
add(main.includes("dataset.enginePatch = 'v1112-premium-25d-engine'"), 'v1.1.2 engine marker is retained');

add(main.includes("dataset.detailPolish = 'v1113-micro-detail-polish'"), 'v1.1.3 detail polish marker is wired');
add(main.includes("dataset.pixelPolish = 'v1114-pixel-perfect-polish'"), 'v1.1.4 pixel polish marker is wired');
add(main.includes('v1114-pixel-polish-screen'), 'runtime menu v1114 class exists');
add(main.includes('v1114-pixel-polish-fishing'), 'fishing v1114 class exists');
add(main.includes("if (this.state !== 'reeling') return;"), 'hold pad only starts during reeling');
add(main.includes("if (this.state !== 'success')") && main.includes("this.pixi.ticker.remove(popup)"), 'catch popup ticker cleanup exists');
add(main.includes('data-label=') && main.includes('aria-label="${label}"'), 'bottom nav labels are accessible and CSS-addressable');
add(main.includes('v1113-micro-detail-screen'), 'runtime menu v1113 class exists');
add(main.includes('v1113-micro-detail-fishing'), 'fishing v1113 class exists');
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

add(css.includes('v1.1.3 MICRO DETAIL POLISH PASS'), 'v1.1.3 CSS block exists');
add(css.includes('v1.1.4 PIXEL PERFECT POLISH PASS'), 'v1.1.4 CSS block exists');
add(css.includes('v1114-pixel-polish-screen .runtime-hud'), 'v114 runtime HUD pixel containment exists');
add(css.includes('v1114-pixel-polish-fishing .fishing-hud.v840-fishing-hud'), 'v114 fishing HUD pixel containment exists');
add(css.includes('v1114-pixel-polish-fishing .catch-result-card > div'), 'v114 result card button grid exists');
add(css.includes('html[data-pixel-polish="v1114-pixel-perfect-polish"] .bottom-nav.v840-bottom-nav'), 'v114 fixed nav guard exists');
add(css.includes('@media (max-width: 360px)'), 'v114 ultra-small viewport guard exists');
add(css.includes('v1113-micro-detail-screen .runtime-hud'), 'v113 HUD micro containment exists');
add(css.includes('v1113-micro-detail-screen :is(.runtime-btn,.image-btn)'), 'v113 button width correction exists');
add(css.includes('v1113-micro-detail-fishing .fishing-hud.v840-fishing-hud'), 'v113 fishing HUD micro containment exists');
add(css.includes('v1113-micro-detail-fishing .recent-catch-strip'), 'v113 recent catch micro separation exists');
add(!css.includes("url('../assets/") && !css.includes('url(../assets/'), 'legacy CSS public asset paths were normalized');
add(css.includes('html[data-engine-patch="v1112-premium-25d-engine"] .bottom-nav.v840-bottom-nav'), 'v112 nav final guard exists');
add(css.includes('grid-template-columns: repeat(8, minmax(0, 1fr))'), 'bottom nav has 8 fixed columns');
add(css.includes('v1112-premium-engine-screen .v108-shop-card.shop-card'), 'shop card premium containment exists');
add(css.includes('v1112-premium-engine-screen .v108-mission-card'), 'mission card premium containment exists');
add(css.includes('v1112-premium-engine-screen .v108-rank-row'), 'ranking contrast containment exists');
add(css.includes('v1112-premium-engine-fishing .recent-catch-strip'), 'fishing recent catch separation exists');
add(css.includes('var(--water-fx-alpha'), 'water alpha remains quality-controlled');
add(!/\.svg/i.test(main + css + data), 'no SVG/vector asset references added');
add(existsSync('README.md'), 'README.md exists');
add(read('README.md').includes('v1.1.4 Pixel Perfect Polish'), 'README documents v1.1.4');
add(/v1\.1\.([4-9]|[1-9][0-9]+)/.test(read('public/offline.html')), 'offline page version badge is updated');

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
  console.error(`v1.1.4 pixel perfect polish validation failed: ${failed.length} issue(s)`);
  process.exit(1);
}
console.log('v1.1.4 pixel perfect polish checks passed.');
