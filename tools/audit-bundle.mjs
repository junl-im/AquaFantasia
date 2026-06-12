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
  version: '4.8.0',
  indexBytes: bytes('index.html'),
  indexLines: index.split('\n').length,
  serviceWorkerBytes: bytes('sw.js'),
  fishCount: fish.length,
  artSvgCount: artFiles.length,
  referencedAssetCount: new Set(refs).size,
  missingAssets: missing,
  duplicateFishIds,
  runtime: {
    runtimeDiet48: index.includes('initV48Runtime') && index.includes('v48-runtime-panel') && sw.includes('aqua-fantasia-v4.8.0'),
    renderer47: index.includes('initV47RendererRuntime') && index.includes('v47-fishing-canvas'),
    engine46: index.includes('initV46EngineRuntime') && index.includes('aqua_fishing_v46.webp'),
    lightServiceWorker: !sw.includes('./assets/art/v31_director_stage.svg'),
    optimizedSave: index.includes('aqua_v4.8') && index.includes('aqua_latest_state'),
    mobileGuards: index.includes('kakao-autopilot') && index.includes('initBackExitGuard') && index.includes('requestV43FullscreenNow'),
    legacyRenderGate: index.includes('renderLegacyDirectorPanelsIfNeeded'),
    cleanBundleReady: index.includes('Clean Ready') && read('package.json').includes('clean:report')
  }
};
console.log(JSON.stringify(report, null, 2));
if (missing.length || duplicateFishIds || fish.length < 174 || !report.runtime.runtimeDiet48 || !report.runtime.renderer47 || !report.runtime.lightServiceWorker || !report.runtime.mobileGuards) process.exit(1);
