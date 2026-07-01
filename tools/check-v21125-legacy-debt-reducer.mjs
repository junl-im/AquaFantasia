import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const fail = (message) => { console.error(`[v21125] ${message}`); process.exit(1); };
const must = (condition, message) => { if (!condition) fail(message); };
const version = '2.1.125';
const cache = 'aqua-fantasia-v2.1.125-legacy-debt-reducer';

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
must(pkg.scripts.validate === 'node tools/clean-old-patch-docs.mjs && node tools/validate-clean.mjs && node tools/check-v21125-legacy-debt-reducer.mjs', 'validate script must use v2.1.125 guard');
must(data.includes(`APP_VERSION = '${version}'`) && data.includes(cache), 'data.ts version/cache mismatch');
must(sw.includes('v2.1.125') && sw.includes(cache) && sw.includes('url.origin !== self.location.origin') && sw.includes('response.ok'), 'service worker cache containment missing');
must(offline.includes('v2.1.125') && offline.includes('레거시 부채 감소') && offline.includes('코드 꼬임'), 'offline page not synced');
must(readme.startsWith('# AquaFantasia v2.1.125') && readme.includes('## v2.1.125 변경사항') && readme.includes('installV21125LegacyDebtReducerPass'), 'README v2.1.125 record missing');
must(handoff.includes('기준 패키지 버전: `2.1.125`') && handoff.includes('현재 작업 기준: `v2.1.125`') && handoff.includes('v2.1.125 legacy debt reducer 패치 기록'), 'handoff v2.1.125 record missing');

must(main.includes('installV21125LegacyDebtReducerPass') && main.includes('v21125-legacy-debt-reducer-root') && main.includes('observer-handoff-light-finalizer-active'), 'v2.1.125 root/call tokens missing');
must(main.includes("if (html.dataset.v21125LegacyDebtReducer === 'active') return;"), 'v2.1.124 observer handoff guard missing');
must(main.includes('WeakMap<HTMLElement, string>') && main.includes('alreadyApplied') && main.includes('legacy-style-churn-throttled'), 'v2.1.125 light write/debt guard missing');
must(main.includes('v21125-village-guide-popup') && main.includes('aqua-v21125-guide-dismissed') && main.includes('낚시로 재화를 모으고 개척 목표'), 'v2.1.125 first guide missing');
must(main.includes('v21125-bottom-nav-final') && main.includes('one-anchor-no-legacy-rewrite'), 'v2.1.125 bottom nav anchor missing');
must(main.includes('v21125-runtime-page-final') && main.includes('v21125-page-column-final'), 'v2.1.125 page centering tokens missing');
must(main.includes('v21125-expedition-final') && main.includes('expedition-center-scroll-final-light'), 'v2.1.125 expedition final token missing');
must(main.includes('v21125-water-final') && main.includes('v21125-sea-lane-final') && main.includes('v21125-loadout-final'), 'v2.1.125 fishing water/loadout tokens missing');
must(main.includes('v21125-loadout-child-final') && main.includes('v21125-combo-final'), 'v2.1.125 loadout/combo tokens missing');
must(main.includes('v21125-bite-final') && main.includes('v21125-result-final'), 'v2.1.125 bite/result anchors missing');
must(main.includes("attributeFilter: ['class', 'style', 'data-screen', 'data-fishing-phase', 'data-v21124-fishing-phase']") && main.includes('window.setTimeout(() => schedule(false), 180)'), 'v2.1.125 throttled observer missing');

must(css.includes('v2.1.125 legacy debt reducer') && css.includes('--v21125-page-width') && css.includes('--v21125-combo-bottom'), 'v2.1.125 CSS variables missing');
must(css.includes('.v21125-village-guide-popup') && css.includes('.v21125-guide-card'), 'v2.1.125 guide CSS missing');
must(css.includes('.runtime-menu-screen.v21125-runtime-page-final') && css.includes('.v21125-page-column-final'), 'v2.1.125 page CSS missing');
must(css.includes('.v21125-expedition-final.v2097-expedition-body-open') && css.includes('.v21125-village-modal-final'), 'v2.1.125 village modal CSS missing');
must(css.includes('.v21125-water-final') && css.includes('.v21125-sea-lane-final') && css.includes('.v21125-loadout-final'), 'v2.1.125 fishing CSS missing');
must(css.includes('.combo-badge.v21125-combo-final:not(.hidden)') && css.includes('.bite-callout.v21125-bite-final') && css.includes('.catch-result-card.v21125-result-final'), 'v2.1.125 combo/bite/result CSS missing');
must(css.includes('@media (max-width: 360px), (max-height: 610px)') && css.includes('@media (prefers-reduced-motion: reduce)'), 'v2.1.125 media guards missing');

for (const token of [
  '## 작업중인 내용', '## 기록', '## 다음 업데이트 예상 내역', '## 필수 결과 확인 명령', 'GitHub Desktop', 'Firebase 무료 플랜', 'npm run validate', 'npm run ci:registry:check', 'npm run ci:install', 'npm run typecheck', 'npm run build', 'AF-v2.1.125-full.zip', 'AF-v2.1.125-patch.zip', '코드 꼬임', '예전 보정 코드', '초반 가이드', '개척 팝업', '물길', '낚싯대', '물었다'
]) must(handoff.includes(token), `handoff missing required token: ${token}`);
for (const token of ['운영/산출 고정 규칙', '결과 공유 형식', 'GitHub Desktop', 'Firebase 무료 플랜', 'zip 내부 점검 명령', 'AF-v2.1.125-full.zip', 'AF-v2.1.125-patch.zip']) must(readme.includes(token), `README missing operating token: ${token}`);

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
    if (stat.isDirectory()) walk(full, acc);
    else acc.push(rel);
  }
  return acc;
}
const files = walk(root);
const markdown = files.filter((f) => f.endsWith('.md')).sort();
must(markdown.join('|') === 'AI_HANDOFF_CARDVILLE.md|README.md', `markdown set changed: ${markdown.join(', ')}`);
must(files.filter((f) => /\.svgz?$/i.test(f)).length === 0, 'SVG files are forbidden');
const runtimeFiles = files.filter((f) => f === 'index.html' || f.startsWith('src/') || f === 'public/sw.js' || f === 'public/offline.html' || f === 'public/manifest.webmanifest');
const svgRuntimeRefs = runtimeFiles.filter((file) => /\.svgz?\b|image\/svg|<svg\b|svg\(/i.test(read(file)));
must(svgRuntimeRefs.length === 0, `runtime SVG references are forbidden: ${svgRuntimeRefs.join(', ')}`);
must(!files.some((f) => f === 'APP_VERSION' || f.startsWith('reports/') || f.startsWith('dist/') || /_NOTES\.md$/i.test(path.basename(f))), 'generated temp/report files must not be packaged');
function balanced(source, open, close) {
  let depth = 0;
  for (const char of source) {
    if (char === open) depth += 1;
    if (char === close) depth -= 1;
    if (depth < 0) return false;
  }
  return depth === 0;
}
must(balanced(css, '{', '}'), 'CSS brace balance failed');

console.log('[v21125] legacy debt reducer, observer handoff, light finalizer, UI anchors, handoff contract, and package guards passed');
