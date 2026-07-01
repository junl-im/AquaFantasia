import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const fail = (message) => { console.error(`[v21123] ${message}`); process.exit(1); };
const must = (condition, message) => { if (!condition) fail(message); };
const version = '2.1.123';
const cache = 'aqua-fantasia-v2.1.123-runtime-deconflict';

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
const cleanScript = read('tools/clean-old-patch-docs.mjs');
const validateClean = read('tools/validate-clean.mjs');

must(pkg.version === version, 'package.json version mismatch');
must(lock.version === version && lock.packages?.['']?.version === version, 'package-lock version mismatch');
must(pkg.scripts.validate === 'node tools/clean-old-patch-docs.mjs && node tools/validate-clean.mjs && node tools/check-v21123-runtime-deconflict.mjs', 'validate script must use v2.1.123 guard');
must(data.includes(`APP_VERSION = '${version}'`) && data.includes(cache), 'data.ts version/cache mismatch');
must(sw.includes('v2.1.123') && sw.includes(cache) && sw.includes('url.origin !== self.location.origin') && sw.includes('response.ok'), 'service worker v2.1.123 cache containment missing');
must(offline.includes('v2.1.123') && offline.includes('예전 UI 보정 코드') && offline.includes('런타임 디컨플릭트'), 'offline page not synced');
must(readme.startsWith('# AquaFantasia v2.1.123') && readme.includes('## v2.1.123 변경사항') && readme.includes('installV21123RuntimeDeconflictPass'), 'README v2.1.123 record missing');
must(handoff.includes('현재 작업 기준: `v2.1.123`') && handoff.includes('v2.1.123 runtime deconflict 패치 기록') && handoff.includes('산출물 zip 점검 명령'), 'handoff v2.1.123 record missing');

must(main.includes("classList.add('v21123-runtime-deconflict-root')") && main.includes('latest-anchor-owns-layout-and-fishing-ui'), 'v2.1.123 root scope missing');
must(main.includes('installV21123RuntimeDeconflictPass') && main.includes('v21123-owned-anchor') && main.includes('v21123LatestAnchor'), 'v2.1.123 runtime owner tokens missing');
must(main.includes('v21123-bottom-nav-final') && main.includes('one-fixed-right-bottom-anchor'), 'v2.1.123 bottom nav final anchor missing');
must(main.includes('v21123-runtime-page-final') && main.includes('v21123-page-column-final') && main.includes('centered-not-right-biased'), 'v2.1.123 page deconflict anchors missing');
must(main.includes('v21123-expedition-final') && main.includes('v21123-village-modal-final') && main.includes('full-visible-centered-modal'), 'v2.1.123 village modal anchors missing');
must(main.includes('v21123-water-budget-final') && main.includes('v21123-sea-lane-final') && main.includes('v21123-loadout-final'), 'v2.1.123 fishing water/loadout anchors missing');
must(main.includes('v21123-loadout-child-final') && main.includes("['scale', '1']"), 'v2.1.123 loadout child anti-pulse guard missing');
must(main.includes('v21123-bite-final') && main.includes('v21123-result-final') && main.includes('v21123-combo-final'), 'v2.1.123 bite/result/combo anchors missing');
must(main.includes('--v21123-visual-height') && main.includes('window.setTimeout(normalize, 80)') && main.includes('lastSignature'), 'v2.1.123 delayed finalizer/signature guard missing');
must(main.includes("'v21123RuntimeDeconflict'") || main.includes('v21123RuntimeDeconflict'), 'v2.1.123 dataset keep guard missing');

must(css.includes('v2.1.123 runtime deconflict patch'), 'v2.1.123 CSS section missing');
must(css.includes('--v21123-page-width') && css.includes('--v21123-combo-bottom') && css.includes('--v21123-loadout-top'), 'v2.1.123 CSS variables missing');
must(css.includes('.v21123-owned-anchor') && css.includes('.v21123-bottom-nav-final'), 'v2.1.123 owner/nav CSS missing');
must(css.includes('.runtime-menu-screen.v21123-runtime-page-final') && css.includes('.v21123-page-column-final'), 'v2.1.123 page CSS missing');
must(css.includes('.v21123-expedition-final.v2097-expedition-body-open') && css.includes('.v21123-village-modal-final'), 'v2.1.123 village modal CSS missing');
must(css.includes('.v21123-water-budget-final') && css.includes('.v21123-sea-lane-final') && css.includes('.v21123-loadout-final'), 'v2.1.123 fishing stability CSS missing');
must(css.includes('.combo-badge.v21123-combo-final:not(.hidden)') && css.includes('.bite-callout.v21123-bite-final') && css.includes('.catch-result-card.v21123-result-final'), 'v2.1.123 combo/bite/result CSS missing');
must(css.includes('@media (max-width: 360px), (max-height: 610px)') && css.includes('@media (prefers-reduced-motion: reduce)'), 'v2.1.123 media guards missing');

const requiredHandoffTokens = [
  '## 작업중인 내용',
  '## 기록',
  '## 다음 업데이트 예상 내역',
  '## 필수 결과 확인 명령',
  'GitHub Desktop',
  'Firebase 무료 플랜',
  'npm run validate',
  'npm run ci:registry:check',
  'npm run ci:install',
  'npm run typecheck',
  'npm run build',
  'AF-v2.1.123-full.zip',
  'AF-v2.1.123-patch.zip',
  '코드 꼬임',
  '예전 UI 보정 코드',
  '물길 바',
  '물었다'
];
for (const token of requiredHandoffTokens) must(handoff.includes(token), `handoff missing required token: ${token}`);
for (const token of ['운영/산출 고정 규칙', '결과 공유 형식', 'GitHub Desktop', 'Firebase 무료 플랜', 'zip 내부 점검 명령', 'AF-v2.1.123-full.zip', 'AF-v2.1.123-patch.zip']) must(readme.includes(token), `README missing operating token: ${token}`);

must(cleanScript.includes('AI_HANDOFF_CARDVILLE.md'), 'clean script must whitelist AI_HANDOFF_CARDVILLE.md');
must(validateClean.includes('requiredMarkdown') && validateClean.includes('AI_HANDOFF_CARDVILLE.md'), 'validate-clean must require handoff markdown');
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
const svgFiles = files.filter((f) => /\.svgz?$/i.test(f));
must(svgFiles.length === 0, `SVG files are forbidden: ${svgFiles.join(', ')}`);

const runtimeFiles = files.filter((f) => (
  f === 'index.html' ||
  f.startsWith('src/') ||
  f === 'public/sw.js' ||
  f === 'public/offline.html' ||
  f === 'public/manifest.webmanifest'
));
const svgRuntimeRefs = [];
for (const file of runtimeFiles) {
  const text = read(file);
  if (/\.svgz?\b|image\/svg|<svg\b|svg\(/i.test(text)) svgRuntimeRefs.push(file);
}
must(svgRuntimeRefs.length === 0, `runtime SVG references are forbidden: ${svgRuntimeRefs.join(', ')}`);

const normalizedAssetPath = (url) => {
  if (/^(data:|https?:|#)/i.test(url)) return null;
  const clean = url.split(/[?#]/)[0];
  if (clean.startsWith('/assets/')) return path.join(root, 'public', clean.slice(1));
  if (clean.startsWith('./assets/')) return path.join(root, 'public', clean.slice(2));
  if (clean.startsWith('../assets/')) return path.join(root, 'public', clean.slice(3));
  return null;
};
const missingCssAssets = [];
for (const match of css.matchAll(/url\(([^)]+)\)/g)) {
  const raw = match[1].trim().replace(/^[ '\"]|[ '\"]$/g, '');
  const target = normalizedAssetPath(raw);
  if (target && !fs.existsSync(target)) missingCssAssets.push(raw);
}
must(missingCssAssets.length === 0, `CSS asset references missing: ${[...new Set(missingCssAssets)].join(', ')}`);

const badRegistryTokens = ['applied-caas', 'artifactory', 'internal.api.openai', '10.192.'];
const lockText = read('package-lock.json');
const badRegistryHit = badRegistryTokens.find((token) => lockText.includes(token));
must(!badRegistryHit, `forbidden registry token in package-lock: ${badRegistryHit}`);
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

console.log('[v21123] runtime deconflict, latest UI owner anchors, handoff contract, SVG ban, and package guards passed');
