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
  version: '3.6.1',
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
    moduleScaffold: index.includes('v3.6.1 Core Navigator') || index.includes('CORE NAVIGATOR 3.6.1')
  }
};
console.log(JSON.stringify(report, null, 2));
if (report.missingAssets.length) process.exit(1);
if (report.duplicateFishIds) process.exit(1);
if (report.fishCount < 150) process.exit(1);
if (!report.mobileGuards.coreNavigator) process.exit(1);
