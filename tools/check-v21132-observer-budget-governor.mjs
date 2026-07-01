#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const must = (cond, msg) => { if (!cond) { console.error(`[v21132] ${msg}`); process.exit(1); } };
const json = (p) => JSON.parse(read(p));

const version = '2.1.132';
const cache = 'aqua-fantasia-v2.1.132-observer-budget-governor';
const pkg = json('package.json');
const lock = json('package-lock.json');
const main = read('src/main.ts');
const css = read('src/styles.css');
const data = read('src/data.ts');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const readme = read('README.md');
const handoff = read('AI_HANDOFF_CARDVILLE.md');

must(pkg.version === version, 'package version must be 2.1.132');
must(lock.version === version && lock.packages?.['']?.version === version, 'package-lock version must be 2.1.132');
must(pkg.scripts.validate === 'node tools/clean-old-patch-docs.mjs && node tools/validate-clean.mjs && node tools/check-v21132-observer-budget-governor.mjs', 'validate script must use v2.1.132 guard');
must(data.includes(`APP_VERSION = '${version}'`) && data.includes(cache), 'src/data version/cache missing');
must(sw.includes('v2.1.132') && sw.includes(cache) && sw.includes('url.origin !== self.location.origin') && sw.includes('response.ok'), 'service worker cache containment missing');
must(offline.includes('v2.1.132') && offline.includes('observer budget governor'), 'offline page not synced');

must(main.includes('installV21132ObserverBudgetGovernorPass') && main.includes('syncV21132ObserverBudgetGovernorUi'), 'v2.1.132 pass/sync missing');
must(main.includes("dataset.v21132ObserverBudgetGovernor = 'active'") && main.includes('v21132-observer-budget-governor-root'), 'v2.1.132 early boot root missing');
must(main.includes("this.installV21131StaleObserverQuarantinePass();\n    this.installV21132ObserverBudgetGovernorPass();"), 'v2.1.132 must run after v2.1.131 handoff');
must(main.includes("this.syncV21132ObserverBudgetGovernorUi(`go-${screen}`)") && main.includes("this.syncV21132ObserverBudgetGovernorUi('start-game-village')"), 'v2.1.132 direct state sync calls missing');

const installStart = main.indexOf('private installV21132ObserverBudgetGovernorPass');
const syncStart = main.indexOf('private syncV21132ObserverBudgetGovernorUi');
const nextStart = main.indexOf('private preloadCriticalImages', syncStart);
must(installStart > 0 && syncStart > installStart && nextStart > syncStart, 'v2.1.132 method boundaries missing');
const install = main.slice(installStart, syncStart);
const sync = main.slice(syncStart, nextStart);
must(install.includes("attributeFilter: ['class', 'data-screen', 'data-fishing-phase']"), 'v2.1.132 light observer missing');
must(!install.includes("'style'") && !sync.includes("attributeName === 'style'"), 'v2.1.132 must not install a style observer loop');
must(sync.includes('v21132-village-guide-popup') && sync.includes('aqua-v21132-guide-dismissed'), 'v2.1.132 guide sync missing');
must(sync.includes('v21132-bottom-nav-final') && sync.includes('v21132BottomNav'), 'v2.1.132 bottom nav sync missing');
must(sync.includes('v21132-runtime-page-final') && sync.includes('v21132-page-column-final'), 'v2.1.132 page centering sync missing');
must(sync.includes('v21132-expedition-final') && sync.includes('v21132-expedition-host-final'), 'v2.1.132 expedition sync missing');
must(sync.includes('v21132-fishing-final-screen') && sync.includes('v21132-water-final') && sync.includes('v21132-loadout-final'), 'v2.1.132 fishing sync missing');
must(sync.includes('v21132-combo-final') && sync.includes('v21132-bite-final') && sync.includes('v21132-result-final'), 'v2.1.132 combo/bite/result sync missing');
must(sync.includes("v21131StaleObserverQuarantine = 'handoff-to-v21132-observer-budget-governor'"), 'v2.1.131 handoff missing');
must(main.includes('v21132MutedLegacyObservers') && main.includes('installV2175PolishEngineSweepPass') && main.includes('installV21110FishingFeelDesignStabilityPass'), 'legacy observer mute list missing');

const guardedNames = ['installV2175PolishEngineSweepPass','installV2179PremiumInteractionEnginePass','installV2199PremiumDesignPolishPass','installV21106FishingJitterStabilityPolishPass','installV21110FishingFeelDesignStabilityPass'];
for (const name of guardedNames) {
  const idx = main.indexOf(`private ${name}(): void {`);
  must(idx > 0, `${name} missing`);
  const head = main.slice(idx, idx + 420);
  must(head.includes("dataset.v21132ObserverBudgetGovernor === 'active'") && head.includes('v21132MutedLegacyObservers'), `${name} must be muted by v2.1.132`);
}

must(css.includes('v2.1.132 observer budget governor') && css.includes('--v21132-page-width') && css.includes('--v21132-combo-bottom'), 'v2.1.132 CSS variables missing');
must(css.includes('.v21132-village-guide-popup') && css.includes('.v21132-guide-card'), 'v2.1.132 guide CSS missing');
must(css.includes('.runtime-menu-screen.v21132-runtime-page-final') && css.includes('.v21132-page-column-final'), 'v2.1.132 page CSS missing');
must(css.includes('.v21132-expedition-final.v2097-expedition-body-open') && css.includes('.v21132-village-modal-final'), 'v2.1.132 village modal CSS missing');
must(css.includes('.v21132-water-final') && css.includes('.v21132-sea-lane-final') && css.includes('.v21132-loadout-final'), 'v2.1.132 fishing CSS missing');
must(css.includes('.combo-badge.v21132-combo-final:not(.hidden)') && css.includes('.v21132-bite-final') && css.includes('.v21132-result-final'), 'v2.1.132 combo/bite/result CSS missing');

const handoffTokens = ['기준 패키지 버전: `2.1.132`','현재 작업 기준: `v2.1.132`','v2.1.132 observer budget governor 패치 기록','## 작업중인 내용','## 기록','## 다음 업데이트 예상 내역','## 필수 결과 확인 명령','GitHub Desktop','Firebase 무료 플랜','npm run validate','npm run ci:registry:check','npm run ci:install','npm run typecheck','npm run build','AF-v2.1.132-full.zip','AF-v2.1.132-patch.zip','코드 꼬임','예전 보정 코드','observer budget governor','초반 가이드','개척 팝업','물길','낚싯대','물었다'];
for (const token of handoffTokens) must(handoff.includes(token), `handoff missing token: ${token}`);
for (const token of ['운영/산출 고정 규칙','결과 공유 형식','GitHub Desktop','Firebase 무료 플랜','zip 내부 점검 명령','AF-v2.1.132-full.zip','AF-v2.1.132-patch.zip','observer budget governor']) must(readme.includes(token), `README missing operating token: ${token}`);

const mdFiles = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules','.git','dist','reports'].includes(entry.name)) continue;
      walk(rel);
    } else if (entry.name.toLowerCase().endsWith('.md')) mdFiles.push(rel.replaceAll('\\\\','/'));
  }
};
walk('.');
const allowed = new Set(['AI_HANDOFF_CARDVILLE.md','README.md']);
for (const md of mdFiles.map((x) => x.replace(/^\.\//, ''))) must(allowed.has(md), `unexpected markdown file: ${md}`);

console.log('[v21132] observer budget governor checks passed');
console.log(JSON.stringify({ ok: true, version, files: fs.readdirSync(root).length }, null, 2));
