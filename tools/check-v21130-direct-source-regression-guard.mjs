import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const fail = (message) => { console.error(`[v21130] ${message}`); process.exit(1); };
const must = (condition, message) => { if (!condition) fail(message); };
const version = '2.1.130';
const cache = 'aqua-fantasia-v2.1.130-direct-source-regression-guard';

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const data = read('src/data.ts');
const main = read('src/main.ts');
const css = read('src/styles.css');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const readme = read('README.md');
const handoff = read('AI_HANDOFF_CARDVILLE.md');
const world = read('src/villageWorld.ts');

must(pkg.version === version, 'package.json version mismatch');
must(lock.version === version && lock.packages?.['']?.version === version, 'package-lock version mismatch');
must(pkg.scripts.validate === 'node tools/clean-old-patch-docs.mjs && node tools/validate-clean.mjs && node tools/check-v21130-direct-source-regression-guard.mjs', 'validate script must use v2.1.130 guard');
must(data.includes(`APP_VERSION = '${version}'`) && data.includes(cache), 'data.ts version/cache mismatch');
must(sw.includes('v2.1.130') && sw.includes(cache) && sw.includes('url.origin !== self.location.origin') && sw.includes('response.ok'), 'service worker cache containment missing');
must(offline.includes('v2.1.130') && offline.includes('direct source regression guard'), 'offline page not synced');
must(readme.startsWith('# AquaFantasia v2.1.130') && readme.includes('## v2.1.130 변경사항') && readme.includes('installV21130DirectSourceRegressionGuardPass'), 'README v2.1.130 record missing');
must(handoff.includes('기준 패키지 버전: `2.1.130`') && handoff.includes('현재 작업 기준: `v2.1.130`') && handoff.includes('v2.1.130 direct source regression guard 패치 기록'), 'handoff v2.1.130 record missing');

must(main.includes('installV21130DirectSourceRegressionGuardPass') && main.includes('syncV21130DirectSourceUi') && main.includes('v21130-direct-source-regression-root'), 'v2.1.130 pass/root tokens missing');
must(main.includes('dataset.v21130DirectSourceRegressionGuard = \'active\'') && main.includes('v21130UiPolicy'), 'v2.1.130 boot policy missing');
must(main.includes("this.installV21129DirectStateUiPass();\n    this.installV21130DirectSourceRegressionGuardPass();"), 'v2.1.130 must run after v2.1.129 handoff');
must(main.includes("if (html.dataset.v21130DirectSourceRegressionGuard === 'active')") && main.includes('handoff-to-v21130-direct-source-regression-guard'), 'v2.1.129 handoff to v2.1.130 missing');
const v21130Install = main.slice(main.indexOf('private installV21130DirectSourceRegressionGuardPass'), main.indexOf('private syncV21130DirectSourceUi'));
const v21130Sync = main.slice(main.indexOf('private syncV21130DirectSourceUi'), main.indexOf('private preloadCriticalImages'));
must(v21130Install.includes("attributeFilter: ['class', 'data-screen', 'data-fishing-phase']"), 'v2.1.130 light observer missing');
must(!v21130Install.includes("'style'") && !v21130Sync.includes("attributeName === 'style'"), 'v2.1.130 must not install a style observer loop');
must(main.includes('v21130-village-guide-popup') && main.includes('aqua-v21130-guide-dismissed') && main.includes('data-v21130-direct-guide'), 'v2.1.130 first guide source tokens missing');
must(main.includes('v21130-bottom-nav-final') && main.includes('v21130BottomNav'), 'v2.1.130 bottom nav source tokens missing');
must(main.includes('v21130-runtime-page-final') && main.includes('v21130-page-column-final'), 'v2.1.130 page centering source tokens missing');
must(main.includes('v21130-expedition-final') && main.includes('v21130-expedition-direct'), 'v2.1.130 expedition source tokens missing');
must(main.includes('v21130-fishing-final-screen') && main.includes('v21130-water-final') && main.includes('v21130-loadout-final'), 'v2.1.130 fishing source tokens missing');
must(main.includes('v21130-combo-final') && main.includes('v21130-bite-final') && main.includes('v21130-result-final'), 'v2.1.130 combo/bite/result tokens missing');
for (const token of [
  "this.syncV21130DirectSourceUi(`go-${screen}`)",
  "this.syncV21130DirectSourceUi('start-game-village')",
  "this.syncV21130DirectSourceUi('mount-bottom-nav')",
  "this.syncV21130DirectSourceUi('render-fishing-dom')",
  "this.syncV21130DirectSourceUi(`fishing-phase-${phase}`)",
  "this.syncV21130DirectSourceUi('show-bite-callout')",
  "this.syncV21130DirectSourceUi('show-result-card')"
]) must(main.includes(token), `direct v2.1.130 sync call missing: ${token}`);

must(css.includes('v2.1.130 direct source regression guard') && css.includes('--v21130-page-width') && css.includes('--v21130-combo-bottom'), 'v2.1.130 CSS variables missing');
must(css.includes('.v21130-village-guide-popup') && css.includes('.v21130-guide-card'), 'v2.1.130 guide CSS missing');
must(css.includes('.runtime-menu-screen.v21130-runtime-page-final') && css.includes('.v21130-page-column-final'), 'v2.1.130 page CSS missing');
must(css.includes('.v21130-expedition-final.v2097-expedition-body-open') && css.includes('.v21130-village-modal-final'), 'v2.1.130 village modal CSS missing');
must(css.includes('.v21130-water-final') && css.includes('.v21130-sea-lane-final') && css.includes('.v21130-loadout-final'), 'v2.1.130 fishing CSS missing');
must(css.includes('.combo-badge.v21130-combo-final:not(.hidden)') && css.includes('.v21130-bite-final') && css.includes('.v21130-result-final'), 'v2.1.130 combo/bite/result CSS missing');
must(css.includes('@media (max-width: 360px), (max-height: 610px)') && css.includes('@media (prefers-reduced-motion: reduce)'), 'media guards missing');

for (const token of [
  '## 작업중인 내용', '## 기록', '## 다음 업데이트 예상 내역', '## 필수 결과 확인 명령', 'GitHub Desktop', 'Firebase 무료 플랜', 'npm run validate', 'npm run ci:registry:check', 'npm run ci:install', 'npm run typecheck', 'npm run build', 'AF-v2.1.130-full.zip', 'AF-v2.1.130-patch.zip', '코드 꼬임', '예전 보정 코드', 'direct source regression guard', '초반 가이드', '개척 팝업', '물길', '낚싯대', '물었다'
]) must(handoff.includes(token), `handoff missing required token: ${token}`);
for (const token of ['운영/산출 고정 규칙', '결과 공유 형식', 'GitHub Desktop', 'Firebase 무료 플랜', 'zip 내부 점검 명령', 'AF-v2.1.130-full.zip', 'AF-v2.1.130-patch.zip']) must(readme.includes(token), `README missing operating token: ${token}`);

must(world.includes("player_${direction}_frame_${String(index + 1).padStart(2, '0')}.png"), 'player direction filename template changed');
must(!world.includes('player.scale.x = direction') && !world.includes('player.scale.x *= -1') && !world.includes('scale.x *= -1'), 'player direction flip regression token found');
must(main.includes("video.removeAttribute('poster')") || main.includes('video.removeAttribute("poster")'), 'opening poster removal missing');
must(!main.includes('poster="./assets/v2120/opening/aqua_opening_poster_v2120.jpg"') && !main.includes("poster='./assets/v2120/opening/aqua_opening_poster_v2120.jpg'"), 'opening poster restored unexpectedly');

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name === '.git') continue;
    const full = path.join(dir, name);
    const rel = path.relative(root, full).replace(/\\/g, '/');
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, acc); else acc.push(rel);
  }
  return acc;
}
const files = walk(root);
const markdown = files.filter((f) => f.endsWith('.md')).sort();
must(markdown.join('|') === 'AI_HANDOFF_CARDVILLE.md|README.md', `unexpected markdown files: ${markdown.join(', ')}`);
must(!files.some((f) => f.toLowerCase().endsWith('.svg') || f.toLowerCase().endsWith('.svgz')), 'SVG assets are still forbidden');
must(!files.some((f) => f.startsWith('reports/') || f.endsWith('.log')), 'reports/log files must not be included');

console.log('[v21130] direct source regression guard checks passed');
console.log(JSON.stringify({ ok: true, version, files: files.length }, null, 2));
