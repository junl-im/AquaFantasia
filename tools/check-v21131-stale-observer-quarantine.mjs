import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const fail = (message) => { console.error(`[v21131] ${message}`); process.exit(1); };
const must = (condition, message) => { if (!condition) fail(message); };
const version = '2.1.131';
const cache = 'aqua-fantasia-v2.1.131-stale-observer-quarantine';
const read = (file) => fs.readFileSync(file, 'utf8');

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const data = read('src/data.ts');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const main = read('src/main.ts');
const css = read('src/styles.css');
const readme = read('README.md');
const handoff = read('AI_HANDOFF_CARDVILLE.md');

must(pkg.version === version, 'package.json version mismatch');
must(lock.version === version && lock.packages?.['']?.version === version, 'package-lock version mismatch');
must(pkg.scripts.validate === 'node tools/clean-old-patch-docs.mjs && node tools/validate-clean.mjs && node tools/check-v21131-stale-observer-quarantine.mjs', 'validate script must use v2.1.131 guard');
must(data.includes(`APP_VERSION = '${version}'`) && data.includes(cache), 'data.ts version/cache mismatch');
must(sw.includes('v2.1.131') && sw.includes(cache) && sw.includes('url.origin !== self.location.origin') && sw.includes('response.ok'), 'service worker cache containment missing');
must(offline.includes('v2.1.131') && offline.includes('stale observer quarantine'), 'offline page not synced');
must(readme.startsWith('# AquaFantasia v2.1.131') && readme.includes('## v2.1.131 변경사항') && readme.includes('installV21131StaleObserverQuarantinePass'), 'README v2.1.131 record missing');
must(handoff.includes('기준 패키지 버전: `2.1.131`') && handoff.includes('현재 작업 기준: `v2.1.131`') && handoff.includes('v2.1.131 stale observer quarantine 패치 기록'), 'handoff v2.1.131 record missing');

must(main.includes('installV21131StaleObserverQuarantinePass') && main.includes('syncV21131StaleObserverQuarantineUi') && main.includes('v21131-stale-observer-quarantine-root'), 'v2.1.131 pass/root tokens missing');
must(main.includes("dataset.v21131StaleObserverQuarantine = 'active'") && main.includes('v21131UiPolicy'), 'v2.1.131 boot policy missing');
must(main.includes("this.installV21130DirectSourceRegressionGuardPass();\n    this.installV21131StaleObserverQuarantinePass();"), 'v2.1.131 must run after v2.1.130 handoff');
for (const token of [
  'v21122SystemUxPerformance',
  'v21123RuntimeDeconflict',
  'v21124RootCauseUxRepair',
  'v21125LegacyDebtReducer',
  'v21126StaleCodePruner',
  'v21128DirectSourceUiRepair',
  'v21129DirectStateUi',
  'v21130DirectSourceRegressionGuard',
]) {
  must(main.includes(`html.dataset.${token} = 'handoff-to-v21131-stale-observer-quarantine'`), `missing handoff guard for ${token}`);
}
const v21131Install = main.slice(main.indexOf('private installV21131StaleObserverQuarantinePass'), main.indexOf('private syncV21131StaleObserverQuarantineUi'));
const v21131Sync = main.slice(main.indexOf('private syncV21131StaleObserverQuarantineUi'), main.indexOf('private preloadCriticalImages'));
must(v21131Install.includes("attributeFilter: ['class', 'data-screen', 'data-fishing-phase']"), 'v2.1.131 light observer missing');
must(!v21131Install.includes("'style'") && !v21131Sync.includes("attributeName === 'style'"), 'v2.1.131 must not install a style observer loop');
must(v21131Sync.includes('v21131-village-guide-popup') && v21131Sync.includes('aqua-v21131-guide-dismissed'), 'v2.1.131 guide sync missing');
must(v21131Sync.includes('v21131-bottom-nav-final') && v21131Sync.includes('v21131BottomNav'), 'v2.1.131 bottom nav sync missing');
must(v21131Sync.includes('v21131-runtime-page-final') && v21131Sync.includes('v21131-page-column-final'), 'v2.1.131 page centering sync missing');
must(v21131Sync.includes('v21131-expedition-final') && v21131Sync.includes('v21131-expedition-host-final'), 'v2.1.131 expedition sync missing');
must(v21131Sync.includes('v21131-fishing-final-screen') && v21131Sync.includes('v21131-water-final') && v21131Sync.includes('v21131-loadout-final'), 'v2.1.131 fishing sync missing');
must(v21131Sync.includes('v21131-combo-final') && v21131Sync.includes('v21131-bite-final') && v21131Sync.includes('v21131-result-final'), 'v2.1.131 combo/bite/result sync missing');
for (const token of [
  "this.syncV21131StaleObserverQuarantineUi(`go-${screen}`)",
  "this.syncV21131StaleObserverQuarantineUi('start-game-village')",
  "this.syncV21131StaleObserverQuarantineUi('render-fishing-dom')",
  "this.syncV21131StaleObserverQuarantineUi('mount-bottom-nav')",
  "this.syncV21131StaleObserverQuarantineUi(`fishing-phase-${phase}`)",
  "this.syncV21131StaleObserverQuarantineUi('show-result-card')",
  "this.syncV21131StaleObserverQuarantineUi('show-bite-callout')",
]) must(main.includes(token), `direct v2.1.131 sync call missing: ${token}`);

must(css.includes('v2.1.131 stale observer quarantine') && css.includes('--v21131-page-width') && css.includes('--v21131-combo-bottom'), 'v2.1.131 CSS variables missing');
must(css.includes('.v21131-village-guide-popup') && css.includes('.v21131-guide-card'), 'v2.1.131 guide CSS missing');
must(css.includes('.runtime-menu-screen.v21131-runtime-page-final') && css.includes('.v21131-page-column-final'), 'v2.1.131 page CSS missing');
must(css.includes('.v21131-expedition-final.v2097-expedition-body-open') && css.includes('.v21131-village-modal-final'), 'v2.1.131 village modal CSS missing');
must(css.includes('.v21131-water-final') && css.includes('.v21131-sea-lane-final') && css.includes('.v21131-loadout-final'), 'v2.1.131 fishing CSS missing');
must(css.includes('.combo-badge.v21131-combo-final:not(.hidden)') && css.includes('.v21131-bite-final') && css.includes('.v21131-result-final'), 'v2.1.131 combo/bite/result CSS missing');

for (const token of [
  '## 작업중인 내용', '## 기록', '## 다음 업데이트 예상 내역', '## 필수 결과 확인 명령', 'GitHub Desktop', 'Firebase 무료 플랜', 'npm run validate', 'npm run ci:registry:check', 'npm run ci:install', 'npm run typecheck', 'npm run build', 'AF-v2.1.131-full.zip', 'AF-v2.1.131-patch.zip', '코드 꼬임', '예전 보정 코드', 'stale observer quarantine', '초반 가이드', '개척 팝업', '물길', '낚싯대', '물었다'
]) must(handoff.includes(token), `handoff missing token: ${token}`);
for (const token of ['운영/산출 고정 규칙', '결과 공유 형식', 'GitHub Desktop', 'Firebase 무료 플랜', 'zip 내부 점검 명령', 'AF-v2.1.131-full.zip', 'AF-v2.1.131-patch.zip']) must(readme.includes(token), `README missing operating token: ${token}`);

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    if (['node_modules', 'dist', '.git'].includes(name)) continue;
    const p = path.join(dir, name);
    const rel = path.relative(process.cwd(), p).replace(/\\/g, '/');
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else acc.push(rel);
  }
  return acc;
}
const files = walk(process.cwd());
const markdown = files.filter((f) => f.toLowerCase().endsWith('.md'));
must(markdown.length === 2 && markdown.includes('README.md') && markdown.includes('AI_HANDOFF_CARDVILLE.md'), `markdown contract broken: ${markdown.join(', ')}`);
must(!files.some((f) => f.toLowerCase().endsWith('.svg') || f.toLowerCase().endsWith('.svgz')), 'SVG files are forbidden');
must(!files.some((f) => f.endsWith('.log') || f.startsWith('reports/') || f.startsWith('dist/')), 'generated reports/logs/dist must not be packaged');

console.log('[v21131] stale observer quarantine checks passed');
console.log(JSON.stringify({ ok: true, version, files: files.length }, null, 2));
