#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const json = (p) => JSON.parse(read(p));
const must = (cond, msg) => { if (!cond) { console.error(`[v21134] ${msg}`); process.exit(1); } };

const version = '2.1.134';
const cache = 'aqua-fantasia-v2.1.134-render-budget-ui-write-ledger';
const pkg = json('package.json');
const lock = json('package-lock.json');
const main = read('src/main.ts');
const css = read('src/styles.css');
const data = read('src/data.ts');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const readme = read('README.md');
const handoff = read('AI_HANDOFF_CARDVILLE.md');

must(pkg.version === version, 'package version must be 2.1.134');
must(lock.version === version && lock.packages?.['']?.version === version, 'package-lock version must be 2.1.134');
must(pkg.scripts.validate === 'node tools/clean-old-patch-docs.mjs && node tools/validate-clean.mjs && node tools/check-v21134-render-budget-ui-write-ledger.mjs', 'validate script must use v2.1.134 guard');
must(data.includes(`APP_VERSION = '${version}'`) && data.includes(cache), 'src/data version/cache missing');
must(sw.includes('v2.1.134') && sw.includes(cache) && sw.includes('url.origin !== self.location.origin') && sw.includes('response.ok'), 'service worker cache containment missing');
must(offline.includes('v2.1.134') && offline.includes('render budget ui write ledger'), 'offline page not synced');

must(main.includes('installV21134RenderBudgetUiWriteLedgerPass') && main.includes('syncV21134RenderBudgetUiWriteLedgerUi'), 'v2.1.134 pass/sync missing');
must(main.includes('configureV21134RenderBudget') && main.includes('v21134RecommendedFps'), 'v2.1.134 render budget methods missing');
must(main.includes("dataset.v21134RenderBudgetUiWriteLedger = 'active'") && main.includes('v21134-render-budget-ui-write-ledger-root'), 'v2.1.134 early boot root missing');
must(main.includes("this.installV21134RenderBudgetUiWriteLedgerPass();"), 'v2.1.134 install call missing');
must(!main.includes('handoff-to-'), 'obsolete handoff markers must be deleted after group 2 cleanup');
must(!main.includes('installV21133SingleGovernorLedgerPass') && !main.includes('syncV21133SingleGovernorLedgerUi'), 'v2.1.133 pass/sync must be deleted');
must(main.includes('this.syncV21134RenderBudgetUiWriteLedgerUi(`go-${screen}`)') && main.includes("this.syncV21134RenderBudgetUiWriteLedgerUi('start-game-village')") && main.includes('this.syncV21134RenderBudgetUiWriteLedgerUi(`fishing-phase-${phase}`)'), 'v2.1.134 direct sync call sites missing');
must(!/installV211(?:22|23|24|25|26|28|29|30|31|32|33)[A-Za-z0-9_]*Pass/.test(main), 'obsolete group 2 install pass still present');
must(!/syncV211(?:29|30|31|32|33)[A-Za-z0-9_]*Ui/.test(main), 'obsolete group 2 sync function still present');
must(main.includes('v21134-village-direct-source') && main.includes('v21134-runtime-page-final') && main.includes('v21134-page-column-final') && main.includes('v21134-fishing-final-screen'), 'v2.1.134 direct source classes missing');
must(main.includes('lastTensionUiSignature') && main.includes('rounded-signature') && main.includes('qValue') && main.includes('qCatch'), 'v2.1.134 rounded fishing UI write budget missing');
must(main.includes('ticker.maxFPS = fps') && main.includes('fallbackFps = this.v21134RecommendedFps'), 'v2.1.134 Pixi/fallback FPS budget missing');
must(!main.includes('webkit-playsinline loop preload="auto"') && main.includes("openingVideo?.addEventListener('ended', finishVillageOpeningAfterMinimum") && main.includes("finishVillageOpeningAfterMinimum())") && main.includes('window.setTimeout(finishVillageOpeningAfterMinimum, reducedOpeningMotion ? 1800 : 9000)'), 'opening video exit fallback missing');

const installStart = main.indexOf('private installV21134RenderBudgetUiWriteLedgerPass');
const syncStart = main.indexOf('private syncV21134RenderBudgetUiWriteLedgerUi');
const nextStart = main.indexOf('private preloadCriticalImages', syncStart);
must(installStart > 0 && syncStart > installStart && nextStart > syncStart, 'v2.1.134 method boundaries missing');
const install = main.slice(installStart, syncStart);
const sync = main.slice(syncStart, nextStart);
must(install.includes("attributeFilter: ['class', 'data-screen', 'data-fishing-phase', 'aria-hidden']") && !install.includes("attributeName === 'style'"), 'v2.1.134 must not install a style observer loop');
must(sync.includes('v21134-village-guide-popup') && sync.includes('aqua-v21134-guide-dismissed'), 'v2.1.134 guide sync missing');
must(sync.includes('v21134-bottom-nav-final') && sync.includes('same-right-bottom-anchor'), 'v2.1.134 bottom nav sync missing');
must(sync.includes('v21134-runtime-page-final') && sync.includes('v21134-page-column-final'), 'v2.1.134 page centering sync missing');
must(sync.includes('v21134-expedition-final') && sync.includes('v21134-village-modal-final'), 'v2.1.134 expedition/modal sync missing');
must(sync.includes('v21134-fishing-final-screen') && sync.includes('v21134-water-budget-final') && sync.includes('v21134-loadout-final'), 'v2.1.134 fishing sync missing');
must(sync.includes('v21134-combo-final') && sync.includes('v21134-bite-final') && sync.includes('v21134-result-final'), 'v2.1.134 combo/bite/result sync missing');
must(sync.includes('v21134DeletedGroup2ObserverCount') && sync.includes('v21134ObserverBudget') && sync.includes('v21134UiWriteBudget'), 'v2.1.134 observer/write ledgers missing');

must(css.includes('v2.1.134 render budget + UI write ledger') && css.includes('--v21134-page-width') && css.includes('--v21134-combo-bottom'), 'v2.1.134 CSS variables missing');
must(css.includes('.v21134-village-guide-popup') && css.includes('.v21134-guide-card'), 'v2.1.134 guide CSS missing');
must(css.includes('.runtime-menu-screen.v21134-runtime-page-final') && css.includes('.v21134-page-column-final'), 'v2.1.134 page CSS missing');
must(css.includes('.v21134-expedition-final.v2097-expedition-body-open') && css.includes('.v21134-village-modal-final'), 'v2.1.134 village modal CSS missing');
must(css.includes('.v21134-water-budget-final') && css.includes('.v21134-loadout-final'), 'v2.1.134 fishing CSS missing');
must(css.includes('.combo-badge.v21134-combo-final:not(.hidden)') && css.includes('.v21134-bite-final') && css.includes('.v21134-result-final'), 'v2.1.134 combo/bite/result CSS missing');

const handoffTokens = ['기준 패키지 버전: `2.1.134`','현재 작업 기준: `v2.1.134`','v2.1.134 render budget ui write ledger 패치 기록','## 작업중인 내용','## 기록','## 다음 업데이트 예상 내역','## 필수 결과 확인 명령','GitHub Desktop','Firebase 무료 플랜','npm run validate','npm run ci:registry:check','npm run ci:install','npm run typecheck','npm run build','AF-v2.1.134-g2-full.zip','AF-v2.1.134-g2-patch.zip','코드 꼬임','예전 보정 코드','render budget','UI write budget','그룹 2 삭제','인트로 영상','초반 마을 가이드','개척 팝업','물길','낚싯대','물었다'];
for (const token of handoffTokens) must(handoff.includes(token), `handoff missing token: ${token}`);
for (const token of ['AquaFantasia v2.1.134','운영/산출 고정 규칙','결과 공유 형식','GitHub Desktop','Firebase 무료 플랜','zip 내부 점검 명령','AF-v2.1.134-g2-full.zip','AF-v2.1.134-g2-patch.zip','render budget ui write ledger','그룹 2 삭제','인트로 영상']) must(readme.includes(token), `README missing operating token: ${token}`);

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

console.log('[v21134] render budget ui write ledger checks passed');
console.log(JSON.stringify({ ok: true, version, renderBudget: true, files: fs.readdirSync(root).length }, null, 2));
