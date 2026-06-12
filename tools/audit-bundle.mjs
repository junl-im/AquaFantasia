import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd();
const read = (file) => readFileSync(join(root, file), 'utf8');
const bytes = (file) => statSync(join(root, file)).size;
const index = read('index.html');
const sw = read('sw.js');
const fish = JSON.parse(read('data/fish.json')).fish || [];
const artFiles = readdirSync(join(root, 'assets/art')).filter((name) => name.endsWith('.svg'));
const refs = [...index.matchAll(/assets\/(?:art|icons|images|atlas|ui-kit)\/[^'"\)\s]+/g), ...sw.matchAll(/\.\/assets\/(?:art|icons|images|atlas|ui-kit)\/[^'"\)\s]+/g)].map((m) => m[0].replace(/^\.\//, ''));
const missing = [...new Set(refs)].filter((ref) => { try { statSync(join(root, ref)); return false; } catch { return true; } });
const duplicateFishIds = fish.length - new Set(fish.map((item) => item.id)).size;
const report = {
  version: '5.5.0',
  indexBytes: bytes('index.html'),
  indexLines: index.split('\n').length,
  serviceWorkerBytes: bytes('sw.js'),
  fishCount: fish.length,
  artSvgCount: artFiles.length,
  referencedAssetCount: new Set(refs).size,
  missingAssets: missing,
  duplicateFishIds,
  runtime: {
    runtimeDiet48: index.includes('initV48Runtime') && index.includes('v48-runtime-panel'),
    runtimeConnect49: index.includes('initV49Runtime') && index.includes('v49-runtime-panel') && index.includes('v49-pixi-runtime-canvas'),
    performanceFocus50: index.includes('initV50Runtime') && index.includes('v50-performance-panel') && index.includes('v50-focus-canvas'),
    stabilityAssist51: index.includes('initV51Runtime') && index.includes('v51-stability-panel') && index.includes('aqua_v5.1'),
    casualRefactor52: index.includes('v52-casual-runtime.js') || read('package.json').includes('runtime52'),
    casualUX53: index.includes('v53-casual-ux-polish.js') && sw.includes('aqua-fantasia-v5.3.0'),
    resultShop54: index.includes('v54-result-shop-polish.js') && index.includes('CASUAL RESULT SHOP 5.4') && sw.includes('aqua-fantasia-v5.4.0'),
    mobileFeel55: index.includes('v55-mobile-feel-runtime.js') && index.includes('MOBILE FEEL 5.5') && sw.includes('aqua-fantasia-v5.5.0-mobile-feel-20260612'),
    renderer47: index.includes('initV47RendererRuntime') && index.includes('v47-fishing-canvas'),
    engine46: index.includes('initV46EngineRuntime') && index.includes('aqua_fishing_v46.webp'),
    lightServiceWorker: !sw.includes('./assets/art/v31_director_stage.svg'),
    optimizedSave: index.includes('aqua_v5.1') && index.includes('aqua_v5.0') && index.includes('aqua_v4.9') && index.includes('aqua_latest_state'),
    mobileGuards: index.includes('kakao-autopilot') && index.includes('initBackExitGuard') && index.includes('requestV43FullscreenNow'),
    legacyRenderGate: index.includes('renderLegacyDirectorPanelsIfNeeded'),
    cleanBundleReady: index.includes('Clean Ready') && read('package.json').includes('clean:report')
  }
};
console.log(JSON.stringify(report, null, 2));
if (missing.length || duplicateFishIds || fish.length < 174 || !report.runtime.runtimeDiet48 || !report.runtime.runtimeConnect49 || !report.runtime.performanceFocus50 || !report.runtime.stabilityAssist51 || !report.runtime.casualUX53 || !report.runtime.resultShop54 || !report.runtime.mobileFeel55 || !report.runtime.renderer47 || !report.runtime.lightServiceWorker || !report.runtime.mobileGuards) process.exit(1);
