import { readFileSync, writeFileSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const read = (file) => readFileSync(join(root, file), 'utf8');
function fail(message) { console.error(`\n[validate-static] ${message}`); process.exit(1); }
function exists(file) { try { statSync(join(root, file)); return true; } catch { return false; } }

const required = [
  'index.html','sw.js','manifest.webmanifest','offline.html','data/fish.json','package.json',
  'firebase.json','firestore.rules','storage.rules','vite.config.ts','tsconfig.json',
  'src/main.ts','src/engine/pixiStage.ts','src/engine/fishingRenderer.ts','src/engine/performanceGovernor.ts',
  'assets/atlas/aqua_fishing_v47.webp','assets/atlas/aqua_fishing_v47.atlas.json',
  'assets/atlas/aqua_fishing_v48.webp','assets/atlas/aqua_fishing_v48.atlas.json',
  'assets/atlas/aqua_fishing_v49.webp','assets/atlas/aqua_fishing_v49.atlas.json',
  'assets/art/v48_runtime_diet_panel.svg','assets/art/v48_runtime_backdrop.svg','assets/art/v48_fishing_renderer_lite.svg',
  'assets/art/v49_pixi_runtime_stage.svg','assets/art/v49_runtime_panel.svg','src/runtime/v49-pixi-runtime.js',
  'assets/art/v50_runtime_console.svg','assets/art/v50_fishing_focus_stage.svg','assets/art/v50_perf_meter.svg',
  'assets/atlas/aqua_fishing_v50.webp','assets/atlas/aqua_fishing_v50.atlas.json','src/runtime/v50-performance-runtime.js','assets/art/v51_stability_console.svg','assets/art/v51_touch_latency.svg','assets/art/v51_fishing_fps_lane.svg','assets/atlas/aqua_fishing_v51.webp','assets/atlas/aqua_fishing_v51.atlas.json','src/runtime/v51-stability-runtime.js',
  'PATCH_NOTES_v4.9.md','V4_9_RUNTIME_CONNECT_CHECKLIST.md','PATCH_NOTES_v5.0.md','V5_0_PERFORMANCE_FOCUS_CHECKLIST.md','PATCH_NOTES_v5.1.md','V5_1_STABILITY_ASSIST_CHECKLIST.md',
  'tools/audit-bundle.mjs','tools/check-v47-renderer.mjs','tools/check-v48-runtime.mjs','tools/check-v49-runtime.mjs','tools/check-v50-runtime.mjs','tools/check-v51-runtime.mjs','tools/clean-bundle-report.mjs',
  'src/runtime/v52-casual-runtime.js','tools/check-v52-casual-refactor.mjs',
  'assets/art/v363_painterly_ocean.png','assets/ui-kit/icons/water_ripple.png','assets/ui-kit/icons/tension_gauge.png',
  'assets/ui-kit/fishing_minigame/bobber_large.png','assets/ui-kit/fishing_minigame/reel_bar_220px.png','assets/ui-kit/panels/panel_1.png',
  'assets/ui-kit/icons/fish_1.png','assets/ui-kit/icons/fish_2.png','assets/ui-kit/icons/fish_3.png','assets/ui-kit/icons/fish_4.png','assets/ui-kit/icons/fish_5.png','assets/ui-kit/icons/fish_6.png',
];
required.forEach((file) => { if (!exists(file)) fail(`Missing required file: ${file}`); });

const index = read('index.html');
const sw = read('sw.js');
const manifest = JSON.parse(read('manifest.webmanifest'));
const fishJson = JSON.parse(read('data/fish.json'));
const fish = fishJson.fish || [];

if (!index.includes('Aqua Fantasia')) fail('index.html does not look like the game entry file.');
if (!index.includes("const APP_VERSION = '5.2.0'")) fail('APP_VERSION must be 5.2.0.');
if (!index.includes('v5.2 Casual Pixi Refactor') && !index.includes('CASUAL FISHING 5.2')) fail('v5.2 casual refactor marker is missing.');
if (!index.includes('v5.1 Stability Assist') && !index.includes('STABILITY 5.1')) fail('v5.1 stability assist marker is missing.');
if (!index.includes('initV51Runtime') || !index.includes('renderV51StabilityPanel') || !index.includes('v51-stability-panel')) fail('v5.1 stability runtime/panel is missing.');
if (!index.includes('v52-casual-runtime.js') || !index.includes('CASUAL FISHING 5.2')) fail('v5.2 casual runtime/panel is missing.');
if (!index.includes('v4.9 Pixi Runtime Connect') && !index.includes('PIXI RUNTIME 4.9')) fail('v4.9 runtime connect marker is missing.');
if (!index.includes('initV48Runtime') || !index.includes('renderV48RuntimePanel') || !index.includes('v48-runtime-panel')) fail('v4.8 runtime panel/runtime is missing.');
if (!index.includes('initV49Runtime') || !index.includes('renderV49RuntimePanel') || !index.includes('v49-runtime-panel') || !index.includes('v49-pixi-runtime-canvas')) fail('v4.9 runtime panel/canvas is missing.');
if (!index.includes('v48-production-mode') || !index.includes('v48-low-visual')) fail('v4.8 production CSS classes are missing.');
if (!index.includes('initV50Runtime') || !index.includes('renderV50PerformancePanel') || !index.includes('v50-performance-panel') || !index.includes('v50-focus-canvas')) fail('v5.0 performance runtime/canvas is missing.');
if (!index.includes('aqua_v5.1') || !index.includes('aqua_v5.0') || !index.includes('aqua_v4.9') || !index.includes('aqua_latest_state')) fail('v5.1 save keys are missing.');
if (!index.includes('v47-fishing-canvas') || !index.includes('initV47RendererRuntime')) fail('v4.7 fishing renderer bridge is missing.');
if (!index.includes('v45_bobber_master.svg') || !index.includes('v41-flow-hud') || !index.includes('catch-result-overlay')) fail('active fishing UX assets/flows are missing.');
if (!index.includes('kakao-autopilot') || !index.includes('initBackExitGuard') || !index.includes('requestV43FullscreenNow')) fail('mobile launch/back/fullscreen guards are missing.');
if (!index.includes('renderLegacyDirectorPanelsIfNeeded')) fail('legacy render gate is missing.');
if (/\bFISH_DB\b/.test(index)) fail('legacy FISH_DB reference found.');
if (/\bgetCurrentWeekKey\b/.test(index)) fail('legacy getCurrentWeekKey reference found.');
if ((index.match(/data-region=\"차원의 바다\"/g) || []).length > 1) fail('Duplicate Dimension Sea village card found.');

if (!sw.includes('aqua-fantasia-v5.2.0')) fail('Service worker cache version must be v5.2.0.');
if (!sw.includes('./assets/atlas/aqua_fishing_v49.webp') || !sw.includes('./assets/art/v49_runtime_panel.svg')) fail('v4.9 cache entries are missing.');
if (!sw.includes('./assets/atlas/aqua_fishing_v50.webp') || !sw.includes('./assets/art/v50_runtime_console.svg')) fail('v5.0 cache entries are missing.');
if (!sw.includes('./assets/atlas/aqua_fishing_v51.webp') || !sw.includes('./assets/art/v51_stability_console.svg')) fail('v5.1 cache entries are missing.');
if (!sw.includes('./src/runtime/v52-casual-runtime.js') || !sw.includes('./assets/ui-kit/icons/water_ripple.png')) fail('v5.2 cache entries are missing.');
if (sw.includes('./assets/art/v31_director_stage.svg')) fail('legacy bulk SVG precache found in service worker.');
if (!manifest.display || manifest.display !== 'fullscreen') fail('manifest display must be fullscreen.');
if (!Array.isArray(manifest.icons) || manifest.icons.length < 3) fail('manifest icons are incomplete.');

if (!Array.isArray(fish) || fish.length < 174) fail('fish database must include at least 174 fish.');
const ids = new Set();
for (const item of fish) {
  if (!item.id || ids.has(item.id)) fail(`Invalid or duplicate fish id: ${item.id}`);
  ids.add(item.id);
  if (!item.region || !item.name || !item.rarity) fail(`Fish entry is incomplete: ${item.id}`);
}

const refs = [...index.matchAll(/assets\/(?:art|icons|images|atlas|ui-kit)\/[^'"\)\s]+/g), ...sw.matchAll(/\.\/assets\/(?:art|icons|images|atlas|ui-kit)\/[^'"\)\s]+/g)]
  .map((m) => m[0].replace(/^\.\//, ''));
for (const ref of new Set(refs)) if (!exists(ref)) fail(`Missing referenced asset: ${ref}`);

const scripts = [...index.matchAll(/<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/gi)]
  .map((m) => m[1].trim())
  .filter(Boolean);
scripts.forEach((script, idx) => {
  const temp = join(root, `.validate-script-${idx}.mjs`);
  writeFileSync(temp, script, 'utf8');
  const result = spawnSync(process.execPath, ['--check', temp], { encoding: 'utf8' });
  rmSync(temp, { force: true });
  if (result.status !== 0) {
    console.error(result.stdout);
    console.error(result.stderr);
    fail(`JavaScript syntax check failed for script #${idx + 1}.`);
  }
});

console.log('[validate-static] AquaFantasia v5.2 static bundle OK.');
