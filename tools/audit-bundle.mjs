import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const index = readFileSync(join(root, 'index.html'), 'utf8');
const fish = JSON.parse(readFileSync(join(root, 'data/fish.json'), 'utf8')).fish || [];
const artDir = join(root, 'assets/art');
const artFiles = readdirSync(artDir).filter((name) => name.endsWith('.svg'));
const bytes = (path) => statSync(join(root, path)).size;
const refs = [...index.matchAll(/assets\/(?:art|icons|images)\/[^'"\)\s]+/g)].map((m) => m[0]);
const missing = [...new Set(refs)].filter((ref) => { try { statSync(join(root, ref)); return false; } catch { return true; } });
const report = {
  version: '4.0.0',
  indexBytes: bytes('index.html'),
  indexLines: index.split('\n').length,
  fishCount: fish.length,
  artSvgCount: artFiles.length,
  referencedAssetCount: new Set(refs).size,
  missingAssets: missing,
  duplicateFishIds: fish.length - new Set(fish.map((item) => item.id)).size,
  mobileGuards: {
    kakaoAutopilot: index.includes('kakao-autopilot'),
    fullscreenAttempt: index.includes('enableMobileGameMode'),
    backExitGuard: index.includes('initBackExitGuard'),
    tideMaster: index.includes('renderV35TideMaster'),
    coreNavigator: index.includes('renderV36CoreNavigator'),
    artDirector37: index.includes('renderV37ArtDirector') && index.includes('art-v37'),
    actionFishing38: index.includes('renderV38ActionDirector') && index.includes('bite-target') && index.includes('hookFishFromTarget') && index.includes('action-reel-panel'),
    grandActionFishing39: index.includes('renderV39FishingDirector') && index.includes('v39-action-lane') && index.includes('cycleFishingDetail') && index.includes('assets/ui-kit/fishing_minigame/bobber_large.png'),
    bossActionFishing40: index.includes('v40-boss-command') && index.includes('releaseLineAction') && index.includes('chargeReelAction') && index.includes('dodgeBossAction') && index.includes('tickV40BossActionLoop'),
    moduleScaffold: index.includes('v3.6.4') || index.includes('Start Flow'),
    perfLite: index.includes('perf-lite') && index.includes('warmAssetsSafely'),
    painterlyArt: index.includes('art-v363') && index.includes('v363_painterly_ocean.svg'),
    startFlow: index.includes('startLocalGuestGame') && index.includes('first-play-guide') && index.includes('renderFishingCoach'),
    autoImmersive: index.includes('initAutoImmersiveShell') && index.includes('browserSessionPersistence'),
    legacyRenderGate: index.includes('renderLegacyDirectorPanelsIfNeeded'),
    lightServiceWorker: !readFileSync(join(root, 'sw.js'), 'utf8').includes('./assets/art/v31_director_stage.svg')
  }
};
console.log(JSON.stringify(report, null, 2));
if (report.missingAssets.length) process.exit(1);
if (report.duplicateFishIds) process.exit(1);
if (report.fishCount < 174) process.exit(1);
if (!report.mobileGuards.artDirector37 || !report.mobileGuards.actionFishing38 || !report.mobileGuards.grandActionFishing39 || !report.mobileGuards.bossActionFishing40) process.exit(1);
if (!report.mobileGuards.coreNavigator) process.exit(1);
if (!report.mobileGuards.perfLite || !report.mobileGuards.lightServiceWorker || !report.mobileGuards.painterlyArt || !report.mobileGuards.legacyRenderGate || !report.mobileGuards.startFlow || !report.mobileGuards.autoImmersive) process.exit(1);
