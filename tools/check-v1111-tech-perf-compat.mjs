import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const assert = (condition, message) => {
  if (!condition) {
    console.error(`FAIL ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS ${message}`);
  }
};

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const data = read('src/data.ts');
const main = read('src/main.ts');
const css = read('src/styles.css');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const readme = read('README.md');
const workflow = read('.github/workflows/pages.yml');
const quality = read('src/core/RuntimeQualityManager.ts');
const underwater = read('src/core/UnderwaterWebglLayer.ts');
const storage = read('src/storage.ts');

assert(pkg.version === '1.1.11', 'package version is v1.1.11');
assert(lock.version === '1.1.11' && lock.packages?.['']?.version === '1.1.11', 'package-lock root version is v1.1.11');
assert(data.includes("APP_VERSION = '1.1.11'"), 'APP_VERSION is v1.1.11');
assert(data.includes('aqua-fantasia-v1.1.11-tech-perf-compat'), 'data cache is v1.1.11');
assert(sw.includes('aqua-fantasia-v1.1.11-tech-perf-compat'), 'service worker cache is v1.1.11');
assert(offline.includes('v1.1.11'), 'offline page badge is v1.1.11');
assert(readme.includes('v1.1.11 Tech Perf Compat'), 'README documents v1.1.11');
assert(pkg.scripts?.['ci:install']?.includes('npm ci'), 'ci install script exists');
assert(workflow.includes('npm ci --ignore-scripts --no-audit --progress=false'), 'GitHub Actions uses deterministic npm ci');
assert(pkg.engines?.node === '>=20', 'Node engine floor is documented');
assert(main.includes("dataset.techPerfCompat = 'v1111-tech-perf-compat'"), 'v1.1.11 dataset is wired');
assert(main.includes('installTechPerfCompatPass'), 'tech perf compat installer is wired');
assert(main.includes('aqua-runtime-quality-change'), 'runtime quality change listener is wired');
assert(main.includes('layer.setQuality(tier, this.compact)'), 'existing WebGL layers receive quality changes');
assert(main.includes("window.addEventListener('blur', stopInteraction"), 'blur releases held fishing input');
assert(main.includes("window.addEventListener('pagehide', stopInteraction"), 'pagehide releases held fishing input');
assert(quality.includes('saveData') && quality.includes('slowNetwork'), 'runtime quality considers save-data and slow network');
assert(quality.includes('runtime-quality-lite') && quality.includes('runtime-visual-left'), 'runtime quality exports CSS classes and visual offsets');
assert(underwater.includes('setQuality(quality: UnderwaterQualityTier'), 'underwater layer supports live quality updates');
assert(underwater.includes("document.visibilityState === 'hidden'"), 'underwater layer skips hidden-tab drawing');
assert(underwater.includes("dataset.underwaterQuality"), 'underwater quality dataset is exported');
assert(storage.includes('VALID_SCREENS') && storage.includes('VALID_REGIONS'), 'save data screen and region validation exists');
assert(storage.includes('sanitizeRecord') && storage.includes('sanitizeMissions'), 'save record sanitizers exist');
assert(sw.includes('navigationPreload') && sw.includes('event.preloadResponse'), 'service worker navigation preload is used');
assert(sw.includes("req.headers.has('range')"), 'service worker skips range requests');
assert(sw.includes('fresh.type !== \'opaque\''), 'service worker avoids opaque asset cache writes');
assert(sw.includes('if (res && res.ok'), 'HTML cache writes require ok response');
assert(css.includes('v1.1.11 TECH / PERF / COMPAT PASS'), 'v1.1.11 CSS block exists');
assert(css.includes('data-tech-perf-compat="v1111-tech-perf-compat"'), 'v1.1.11 CSS dataset selectors exist');
assert(css.includes('content-visibility: auto'), 'scroll performance content-visibility is wired');
assert(css.includes('--v1111-fixed-width'), 'v1.1.11 fixed width variable exists');
assert(css.includes('prefers-reduced-motion: reduce'), 'reduced motion compatibility exists');
assert(exists('public/assets/v1110/home/village_islands_user_bg.webp'), 'uploaded village background remains present');
assert(!css.includes('.svg') && !main.includes('.svg') && !data.includes('.svg'), 'no SVG/vector references added');

const swCheck = spawnSync(process.execPath, ['--check', path.join(root, 'public/sw.js')], { encoding: 'utf8' });
assert(swCheck.status === 0, 'service worker syntax is valid');

if (process.exitCode) process.exit(process.exitCode);
console.log('v1.1.11 tech perf compat checks passed');
