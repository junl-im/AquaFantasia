#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const must = (cond, msg) => { if (!cond) { console.error(`[v21133] ${msg}`); process.exit(1); } };
const json = (p) => JSON.parse(read(p));

const version = '2.1.133';
const cache = 'aqua-fantasia-v2.1.133-single-governor-ledger';
const pkg = json('package.json');
const lock = json('package-lock.json');
const main = read('src/main.ts');
const css = read('src/styles.css');
const data = read('src/data.ts');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const readme = read('README.md');
const handoff = read('AI_HANDOFF_CARDVILLE.md');

must(pkg.version === version, 'package version must be 2.1.133');
must(lock.version === version && lock.packages?.['']?.version === version, 'package-lock version must be 2.1.133');
must(pkg.scripts.validate === 'node tools/clean-old-patch-docs.mjs && node tools/validate-clean.mjs && node tools/check-v21133-single-governor-ledger.mjs', 'validate script must use v2.1.133 guard');
must(data.includes(`APP_VERSION = '${version}'`) && data.includes(cache), 'src/data version/cache missing');
must(sw.includes('v2.1.133') && sw.includes(cache) && sw.includes('url.origin !== self.location.origin') && sw.includes('response.ok'), 'service worker cache containment missing');
must(offline.includes('v2.1.133') && offline.includes('single governor ledger'), 'offline page not synced');

must(main.includes('installV21133SingleGovernorLedgerPass') && main.includes('syncV21133SingleGovernorLedgerUi'), 'v2.1.133 pass/sync missing');
must(main.includes("dataset.v21133SingleGovernorLedger = 'active'") && main.includes('v21133-single-governor-ledger-root'), 'v2.1.133 early boot root missing');
must(main.includes("this.installV21132ObserverBudgetGovernorPass();\n    this.installV21133SingleGovernorLedgerPass();"), 'v2.1.133 must run after v2.1.132 handoff');
must(main.includes("this.syncV21133SingleGovernorLedgerUi(`go-${screen}`)") && main.includes("this.syncV21133SingleGovernorLedgerUi('start-game-village')"), 'v2.1.133 direct state sync calls missing');
must(main.includes("dataset.v21132UiPolicy = 'handoff-to-v21133-single-governor-ledger'"), 'v2.1.132 handoff to v2.1.133 missing');
must(main.includes("if (document.documentElement.dataset.v21133SingleGovernorLedger === 'active')"), 'v2.1.132 install guard for v2.1.133 missing');

const installStart = main.indexOf('private installV21133SingleGovernorLedgerPass');
const syncStart = main.indexOf('private syncV21133SingleGovernorLedgerUi');
const nextStart = main.indexOf('private preloadCriticalImages', syncStart);
must(installStart > 0 && syncStart > installStart && nextStart > syncStart, 'v2.1.133 method boundaries missing');
const install = main.slice(installStart, syncStart);
const sync = main.slice(syncStart, nextStart);
must(install.includes("attributeFilter: ['class', 'data-screen', 'data-fishing-phase', 'aria-hidden']"), 'v2.1.133 light observer missing');
must(install.includes("attributeFilter: ['class', 'data-screen', 'data-fishing-phase', 'aria-hidden']") && !sync.includes("attributeName === 'style'"), 'v2.1.133 must not install a style observer loop');
must(sync.includes('v21133-village-guide-popup') && sync.includes('aqua-v21133-guide-dismissed'), 'v2.1.133 guide sync missing');
must(sync.includes('v21133-bottom-nav-final') && sync.includes('same-right-bottom-anchor'), 'v2.1.133 bottom nav sync missing');
must(sync.includes('v21133-runtime-page-final') && sync.includes('v21133-page-column-final'), 'v2.1.133 page centering sync missing');
must(sync.includes('v21133-expedition-final') && sync.includes('v21133-village-modal-final'), 'v2.1.133 expedition/modal sync missing');
must(sync.includes('v21133-fishing-final-screen') && sync.includes('v21133-water-budget-final') && sync.includes('v21133-loadout-final'), 'v2.1.133 fishing sync missing');
must(sync.includes('v21133-combo-final') && sync.includes('v21133-bite-final') && sync.includes('v21133-result-final'), 'v2.1.133 combo/bite/result sync missing');
must(sync.includes('v21133MutedLegacyObserverCount') && sync.includes('v21133ObserverBudget'), 'v2.1.133 observer debt ledger missing');
must(install.includes('lastSignature') && install.includes('v21133LastSkippedReason'), 'v2.1.133 signature skip guard missing');
must(main.includes('v21132MutedLegacyObservers') && main.includes('installV2175PolishEngineSweepPass') && main.includes('installV21110FishingFeelDesignStabilityPass'), 'legacy observer mute compatibility missing');

must(css.includes('v2.1.133 single governor ledger') && css.includes('--v21133-page-width') && css.includes('--v21133-combo-bottom'), 'v2.1.133 CSS variables missing');
must(css.includes('.v21133-village-guide-popup') && css.includes('.v21133-guide-card'), 'v2.1.133 guide CSS missing');
must(css.includes('.runtime-menu-screen.v21133-runtime-page-final') && css.includes('.v21133-page-column-final'), 'v2.1.133 page CSS missing');
must(css.includes('.v21133-expedition-final.v2097-expedition-body-open') && css.includes('.v21133-village-modal-final'), 'v2.1.133 village modal CSS missing');
must(css.includes('.v21133-water-budget-final') && css.includes('.v21133-loadout-final'), 'v2.1.133 fishing CSS missing');
must(css.includes('.combo-badge.v21133-combo-final:not(.hidden)') && css.includes('.v21133-bite-final') && css.includes('.v21133-result-final'), 'v2.1.133 combo/bite/result CSS missing');

const handoffTokens = ['기준 패키지 버전: `2.1.133`','현재 작업 기준: `v2.1.133`','v2.1.133 single governor ledger 패치 기록','## 작업중인 내용','## 기록','## 다음 업데이트 예상 내역','## 필수 결과 확인 명령','GitHub Desktop','Firebase 무료 플랜','npm run validate','npm run ci:registry:check','npm run ci:install','npm run typecheck','npm run build','AF-v2.1.133-full.zip','AF-v2.1.133-patch.zip','코드 꼬임','예전 보정 코드','single governor ledger','초반 마을 가이드','개척 팝업','물길','낚싯대','물었다'];
for (const token of handoffTokens) must(handoff.includes(token), `handoff missing token: ${token}`);
for (const token of ['운영/산출 고정 규칙','결과 공유 형식','GitHub Desktop','Firebase 무료 플랜','zip 내부 점검 명령','AF-v2.1.133-full.zip','AF-v2.1.133-patch.zip','single governor ledger']) must(readme.includes(token), `README missing operating token: ${token}`);

const mdFiles = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules','.git','dist','reports'].includes(entry.name)) continue;
      walk(rel);
    } else if (entry.name.toLowerCase().endsWith('.md')) mdFiles.push(rel.replaceAll('\\','/'));
  }
};
walk('.');
const allowed = new Set(['AI_HANDOFF_CARDVILLE.md','README.md']);
for (const md of mdFiles.map((x) => x.replace(/^\.\//, ''))) must(allowed.has(md), `unexpected markdown file: ${md}`);

console.log('[v21133] single governor ledger checks passed');
console.log(JSON.stringify({ ok: true, version, mutedObserverLedger: true, files: fs.readdirSync(root).length }, null, 2));
