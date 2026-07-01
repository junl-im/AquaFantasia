import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const fail = (message) => { console.error(`[v21129] ${message}`); process.exit(1); };
const must = (condition, message) => { if (!condition) fail(message); };
const version = '2.1.129';
const cache = 'aqua-fantasia-v2.1.129-direct-state-ui-sync';

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
must(pkg.scripts.validate === 'node tools/clean-old-patch-docs.mjs && node tools/validate-clean.mjs && node tools/check-v21129-direct-state-ui-sync.mjs', 'validate script must use v2.1.129 guard');
must(data.includes(`APP_VERSION = '${version}'`) && data.includes(cache), 'data.ts version/cache mismatch');
must(sw.includes('v2.1.129') && sw.includes(cache) && sw.includes('url.origin !== self.location.origin') && sw.includes('response.ok'), 'service worker cache containment missing');
must(offline.includes('v2.1.129') && offline.includes('direct state UI sync') && offline.includes('초반 가이드'), 'offline page not synced');
must(readme.startsWith('# AquaFantasia v2.1.129') && readme.includes('## v2.1.129 변경사항') && readme.includes('installV21129DirectStateUiPass'), 'README v2.1.129 record missing');
must(handoff.includes('기준 패키지 버전: `2.1.129`') && handoff.includes('현재 작업 기준: `v2.1.129`') && handoff.includes('v2.1.129 direct state UI sync 패치 기록'), 'handoff v2.1.129 record missing');

must(main.includes('installV21129DirectStateUiPass') && main.includes('syncV21129DirectUi') && main.includes('v21129-direct-state-ui-root'), 'v2.1.129 pass/root tokens missing');
must(main.includes("this.installV21128DirectSourceUiRepairPass();\n    this.installV21129DirectStateUiPass();"), 'v2.1.129 must run after v2.1.128 handoff');
must(main.includes("if (html.dataset.v21129DirectStateUi === 'active')") && main.includes('handoff-to-v21129-direct-state-sync'), 'v2.1.128 handoff to v2.1.129 missing');
must(main.includes('v21129ObserverOwner') && main.includes('direct-render-state-sync-no-style-observer'), 'direct state observer owner marker missing');
must(!main.includes("attributeFilter: ['class', 'style', 'data-screen', 'data-fishing-phase', 'data-v21129-fishing-phase']"), 'v2.1.129 must not install a style observer loop');
must(main.includes("attributeFilter: ['class', 'data-screen', 'data-fishing-phase']"), 'v2.1.129 light observer missing');
must(main.includes('aqua-v21129-guide-dismissed') && main.includes('v21129-village-guide-popup') && main.includes('처음엔 낚시'), 'v2.1.129 first guide missing');
must(main.includes('v21129-bottom-nav-final') && main.includes('same-right-bottom-anchor-village-and-pages'), 'bottom nav final anchor missing');
must(main.includes('v21129-runtime-page-final') && main.includes('v21129-page-column-final'), 'page centering final tokens missing');
must(main.includes('v21129-expedition-final') && main.includes('expedition-panel-full-visible-v21129'), 'expedition final token missing');
must(main.includes('v21129-water-final') && main.includes('fishing-water-effect-budget-v21129') && main.includes("['display', focused ? 'none' : 'block']"), 'water effect budget/hide token missing');
must(main.includes('v21129-sea-lane-final') && main.includes('v21129-loadout-final') && main.includes('v21129-loadout-child-final'), 'sea lane/loadout tokens missing');
must(main.includes('v21129-combo-final') && main.includes('v21129-bite-final') && main.includes('v21129-result-final'), 'combo/bite/result tokens missing');
must(main.includes("this.syncV21129DirectUi('mount-bottom-nav')") && main.includes("this.syncV21129DirectUi('render-fishing-dom')") && main.includes("this.syncV21129DirectUi('show-bite-callout')") && main.includes("this.syncV21129DirectUi('show-result-card')"), 'direct render-time sync calls missing');

must(css.includes('v2.1.129 direct state UI sync') && css.includes('--v21129-page-width') && css.includes('--v21129-combo-bottom'), 'v2.1.129 CSS variables missing');
must(css.includes('.v21129-village-guide-popup') && css.includes('.v21129-guide-card'), 'guide CSS missing');
must(css.includes('.runtime-menu-screen.v21129-runtime-page-final') && css.includes('.v21129-page-column-final'), 'page CSS missing');
must(css.includes('.v21129-expedition-final.v2097-expedition-body-open') && css.includes('.v21129-village-modal-final'), 'village modal CSS missing');
must(css.includes('.v21129-water-final') && css.includes('.v21129-sea-lane-final') && css.includes('.v21129-loadout-final'), 'fishing CSS missing');
must(css.includes('.combo-badge.v21129-combo-final:not(.hidden)') && css.includes('.v21129-bite-final') && css.includes('.v21129-result-final'), 'combo/bite/result CSS missing');
must(css.includes('@media (max-width: 360px), (max-height: 610px)') && css.includes('@media (prefers-reduced-motion: reduce)'), 'media guards missing');

for (const token of [
  '## 작업중인 내용', '## 기록', '## 다음 업데이트 예상 내역', '## 필수 결과 확인 명령', 'GitHub Desktop', 'Firebase 무료 플랜', 'npm run validate', 'npm run ci:registry:check', 'npm run ci:install', 'npm run typecheck', 'npm run build', 'AF-v2.1.129-full.zip', 'AF-v2.1.129-patch.zip', '코드 꼬임', '예전 보정 코드', 'style observer', 'direct state UI sync', '초반 가이드', '개척 팝업', '물길', '낚싯대', '물었다'
]) must(handoff.includes(token), `handoff missing required token: ${token}`);
for (const token of ['운영/산출 고정 규칙', '결과 공유 형식', 'GitHub Desktop', 'Firebase 무료 플랜', 'zip 내부 점검 명령', 'AF-v2.1.129-full.zip', 'AF-v2.1.129-patch.zip']) must(readme.includes(token), `README missing operating token: ${token}`);

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

console.log('[v21129] direct state UI sync, render-time anchors, stale style-observer handoff, handoff contract, and package guards passed');
