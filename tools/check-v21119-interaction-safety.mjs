import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const fail = (message) => { console.error(`[v21119] ${message}`); process.exit(1); };
const must = (condition, message) => { if (!condition) fail(message); };
const version = '2.1.119';
const cache = 'aqua-fantasia-v2.1.119-interaction-safety';

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
must(pkg.scripts.validate === 'node tools/clean-old-patch-docs.mjs && node tools/validate-clean.mjs && node tools/check-v21119-interaction-safety.mjs', 'validate script must use v2.1.119 guard');
must(data.includes(`APP_VERSION = '${version}'`) && data.includes(cache), 'data.ts version/cache mismatch');
must(sw.includes('v2.1.119') && sw.includes(cache) && sw.includes('url.origin !== self.location.origin') && sw.includes('response.ok'), 'service worker v2.1.119 cache containment missing');
must(offline.includes('v2.1.119') && offline.includes('터치 실수 방지') && offline.includes('모달 스크롤 격리'), 'offline page not synced');
must(readme.startsWith('# AquaFantasia v2.1.119') && readme.includes('## v2.1.119 변경사항') && readme.includes('installV21119InteractionSafetyPass'), 'README v2.1.119 record missing');
must(handoff.includes('기준 패키지 버전: `2.1.119`') && handoff.includes('v2.1.119 모바일 interaction safety 패치 기록') && handoff.includes('data-no-swipe'), 'handoff v2.1.119 record missing');

must(main.includes("classList.add('v21116-fishing-ui-stability-hotfix-root')"), 'v2.1.116 fishing stability root must remain');
must(main.includes("classList.add('v21117-village-menu-icon-clarity-root')"), 'v2.1.117 root scope must remain');
must(main.includes("classList.add('v21118-ui-asset-containment-root')"), 'v2.1.118 root scope must remain');
must(main.includes("classList.add('v21119-interaction-safe-root')") && main.includes('mobile-touch-modal-scroll-safe-area-guard'), 'v2.1.119 root scope missing');
must(main.includes('installV21119InteractionSafetyPass') && main.includes('v21119-touch-shield') && main.includes('v21119-scroll-safe'), 'v2.1.119 runtime pass missing');
must(main.includes("html.style.setProperty('--v21119-visual-height'") && main.includes("html.style.setProperty('--v21119-visual-width'"), 'v2.1.119 visual viewport variables missing');
must(main.includes("node.setAttribute('data-no-swipe', 'true')") && main.includes('modal-touch-scroll-contained'), 'v2.1.119 no-swipe/touch shield tokens missing');
must(main.includes('lastSignature') && main.includes("'v21119InteractionSafety'"), 'v2.1.119 signature/dataset keep guard missing');

must(css.includes('v2.1.119 interaction safety'), 'v2.1.119 CSS section missing');
must(css.includes('--v21119-visual-height: 100svh') && css.includes('--v21119-touch-target-min: 40px'), 'v2.1.119 CSS variables missing');
must(css.includes('overscroll-behavior: contain !important') && css.includes('scrollbar-gutter: stable both-edges !important'), 'v2.1.119 scroll containment CSS missing');
must(css.includes('max-height: calc(var(--v21119-visual-height') && css.includes('env(safe-area-inset-bottom'), 'v2.1.119 safe-area dialog sizing missing');
must(css.includes('touch-action: manipulation !important') && css.includes('-webkit-tap-highlight-color: transparent !important'), 'v2.1.119 touch safety CSS missing');
must(css.includes('@media (max-width: 360px), (max-height: 610px)'), 'v2.1.119 compact fallback missing');

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

console.log('[v21119] interaction safety, modal scroll containment, SVG ban, and handoff guards passed');
