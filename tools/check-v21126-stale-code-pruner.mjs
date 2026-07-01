import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const fail = (message) => { console.error(`[v21126] ${message}`); process.exit(1); };
const must = (condition, message) => { if (!condition) fail(message); };
const version = '2.1.126';
const cache = 'aqua-fantasia-v2.1.126-stale-code-pruner';

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
must(pkg.scripts.validate === 'node tools/clean-old-patch-docs.mjs && node tools/validate-clean.mjs && node tools/check-v21126-stale-code-pruner.mjs', 'validate script must use v2.1.126 guard');
must(data.includes(`APP_VERSION = '${version}'`) && data.includes(cache), 'data.ts version/cache mismatch');
must(sw.includes('v2.1.126') && sw.includes(cache) && sw.includes('url.origin !== self.location.origin') && sw.includes('response.ok'), 'service worker cache containment missing');
must(offline.includes('v2.1.126') && offline.includes('최신 단일 finalizer') && offline.includes('예전 UI 보정 observer'), 'offline page not synced');
must(readme.startsWith('# AquaFantasia v2.1.126') && readme.includes('## v2.1.126 변경사항') && readme.includes('installV21126StaleCodePrunerPass'), 'README v2.1.126 record missing');
must(handoff.includes('기준 패키지 버전: `2.1.126`') && handoff.includes('현재 작업 기준: `v2.1.126`') && handoff.includes('v2.1.126 stale code pruner 패치 기록'), 'handoff v2.1.126 record missing');

must(main.includes('installV21126StaleCodePrunerPass') && main.includes('v21126-stale-code-pruner-root') && main.includes("dataset.v21126StaleCodePruner = 'active'"), 'v2.1.126 root/call tokens missing');
must(main.includes("this.installV21125LegacyDebtReducerPass();\n    this.installV21126StaleCodePrunerPass();"), 'v2.1.126 must run after v2.1.125 handoff');
must(main.includes("if (html.dataset.v21126StaleCodePruner === 'active') return;"), 'stale observer handoff guard missing');
must(main.includes("dataset.v21123RuntimeDeconflict = 'handoff-to-v21126-single-finalizer'") && main.includes("dataset.v21125LegacyDebtReducer = 'handoff-to-v21126-single-finalizer'"), 'legacy pass handoff markers missing');
must(main.includes('v21126ObserverOwner') && main.includes('single-finalizer-css-first-inline-last-resort'), 'single observer owner marker missing');
must(main.includes('WeakMap<HTMLElement, string>') && main.includes('const unchanged = styleCache.get(node) === signature'), 'light style write guard missing');
must(main.includes('v21126-village-guide-popup') && main.includes('aqua-v21126-guide-dismissed') && main.includes('처음엔 낚시'), 'v2.1.126 first guide missing');
must(main.includes('v21126-bottom-nav-final') && main.includes('one-screen-one-position'), 'bottom nav final anchor missing');
must(main.includes('v21126-runtime-page-final') && main.includes('v21126-page-column-final'), 'page centering final tokens missing');
must(main.includes('v21126-expedition-final') && main.includes('expedition-center-scroll-v21126'), 'expedition final token missing');
must(main.includes('v21126-water-final') && main.includes('water-effect-budget-v21126') && main.includes("['display', focused ? 'none' : 'block']"), 'water effect budget/hide token missing');
must(main.includes('v21126-sea-lane-final') && main.includes('v21126-loadout-final') && main.includes('v21126-loadout-child-final'), 'sea lane/loadout tokens missing');
must(main.includes('v21126-combo-final') && main.includes('v21126-bite-final') && main.includes('v21126-result-final'), 'combo/bite/result tokens missing');
must(main.includes("attributeFilter: ['class', 'style', 'data-screen', 'data-fishing-phase', 'data-v21126-fishing-phase']") && main.includes('Math.max(70, 180 - elapsed)'), 'v2.1.126 throttled observer missing');

must(css.includes('v2.1.126 stale-code pruner') && css.includes('--v21126-page-width') && css.includes('--v21126-combo-bottom'), 'v2.1.126 CSS variables missing');
must(css.includes('.v21126-village-guide-popup') && css.includes('.v21126-guide-card'), 'guide CSS missing');
must(css.includes('.runtime-menu-screen.v21126-runtime-page-final') && css.includes('.v21126-page-column-final'), 'page CSS missing');
must(css.includes('.v21126-expedition-final.v2097-expedition-body-open') && css.includes('.v21126-village-modal-final'), 'village modal CSS missing');
must(css.includes('.v21126-water-final') && css.includes('.v21126-sea-lane-final') && css.includes('.v21126-loadout-final'), 'fishing CSS missing');
must(css.includes('.combo-badge.v21126-combo-final:not(.hidden)') && css.includes('.bite-callout.v21126-bite-final') && css.includes('.catch-result-card.v21126-result-final'), 'combo/bite/result CSS missing');
must(css.includes('v21126-performance-budget') && css.includes('filter: none !important'), 'performance budget CSS missing');
must(css.includes('@media (max-width: 360px), (max-height: 610px)') && css.includes('@media (prefers-reduced-motion: reduce)'), 'media guards missing');

for (const token of [
  '## 작업중인 내용', '## 기록', '## 다음 업데이트 예상 내역', '## 필수 결과 확인 명령', 'GitHub Desktop', 'Firebase 무료 플랜', 'npm run validate', 'npm run ci:registry:check', 'npm run ci:install', 'npm run typecheck', 'npm run build', 'AF-v2.1.126-full.zip', 'AF-v2.1.126-patch.zip', '코드 꼬임', '예전 보정 코드', 'observer', '초반 가이드', '개척 팝업', '물길', '낚싯대', '물었다'
]) must(handoff.includes(token), `handoff missing required token: ${token}`);
for (const token of ['운영/산출 고정 규칙', '결과 공유 형식', 'GitHub Desktop', 'Firebase 무료 플랜', 'zip 내부 점검 명령', 'AF-v2.1.126-full.zip', 'AF-v2.1.126-patch.zip']) must(readme.includes(token), `README missing operating token: ${token}`);

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

console.log('[v21126] stale-code pruner, single finalizer handoff, UI anchors, performance budget, handoff contract, and package guards passed');
