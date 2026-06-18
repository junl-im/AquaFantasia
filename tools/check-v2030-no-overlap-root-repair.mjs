import fs from 'node:fs';

const read = (file) => fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const main = read('src/main.ts');
const css = read('src/styles.css');
const toast = read('src/toast.ts');
const village = read('src/villageWorld.ts');
const pkg = JSON.parse(read('package.json'));
const lock = read('package-lock.json');

const failures = [];
const must = (condition, message) => { if (!condition) failures.push(message); };

must(pkg.version === '2.0.30', 'package.json version must be 2.0.30');
must(/dataset\.v2030RootRepair = 'v2030-no-overlap-root-repair'/.test(main), 'v2030 root repair dataset missing');
must(/dataset\.v2030FishingRepair = 'v2030-fishing-stage-reset'/.test(main), 'v2030 fishing repair dataset missing');
must(!/dom\.app\.appendChild\(root\);\s*this\.mountBottomNav\(root, 'village'\);\s*const stage/.test(main), 'village bottom nav must not mount before loading completes');
must(/root\.querySelector<HTMLElement>\('\.v2027-village-loading'\)\?\.remove\(\);\s*this\.mountBottomNav\(root, 'village'\);/.test(main), 'village bottom nav must mount after loading completes');
must(!/const entries = Object\.entries\(this\.save\.caught\)\s*const entries/.test(main), 'duplicate recentCatchMarkup entries declaration remains');
must(/class=\"fishing-stage v2028-fishing-stage v2030-fishing-stage\"/.test(main), 'fishing stage reset class missing');
must(/v2030-cast-button/.test(main), 'v2030 cast button class missing');
must(/v2030-reel-panel/.test(main), 'v2030 reel panel class missing');
must(/v2030-bite-callout/.test(main), 'v2030 bite callout class missing');
must(/window\.setTimeout\(close, 2000\)/.test(toast), 'toast must auto close after 2 seconds');
must(/actor\.targetTimer = 180 \+ Math\.random\(\) \* 620/.test(village), 'NPC immediate movement timer missing');
must(/npc\.role === 'tourist'/.test(village), 'tourist specific roaming targets missing');
must(/v2030-fishing-stage-reset/.test(css), 'v2030 fishing reset CSS missing');
must(/\.village-world-screen:not\(\.v2027-village-ready\) \+ \.bottom-nav/.test(css), 'loading must hide sibling bottom nav');
must(/\.v2-world-controls button \{[\s\S]*height: 40px !important/.test(css), 'world control compact buttons missing');
must(/\.v2030-reel-panel[\s\S]*\.v205-horizontal-gauge/.test(css), 'reel gauge visibility guard missing');
must(/\.v2030-cast-button[\s\S]*left: 50% !important/.test(css), 'cast button centering guard missing');
must(/\.bottom-nav button span \{ color: #fff !important/.test(css), 'dock labels must remain white');
must(!/(packages\.applied-caas|applied-caas-gateway|10\.192\.|internal\.api\.openai)/.test(lock), 'internal registry contamination found in lockfile');

if (failures.length) {
  console.error('v2.0.30 no-overlap root repair audit failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('v2.0.30 no-overlap root repair audit passed');
