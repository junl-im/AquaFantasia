import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const fail = (message) => { console.error(`[v21120] ${message}`); process.exit(1); };
const must = (condition, message) => { if (!condition) fail(message); };
const version = '2.1.120';
const cache = 'aqua-fantasia-v2.1.120-screen-composition-handoff';

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
must(pkg.scripts.validate === 'node tools/clean-old-patch-docs.mjs && node tools/validate-clean.mjs && node tools/check-v21120-screen-composition-handoff.mjs', 'validate script must use v2.1.120 guard');
must(data.includes(`APP_VERSION = '${version}'`) && data.includes(cache), 'data.ts version/cache mismatch');
must(sw.includes('v2.1.120') && sw.includes(cache) && sw.includes('url.origin !== self.location.origin') && sw.includes('response.ok'), 'service worker v2.1.120 cache containment missing');
must(offline.includes('v2.1.120') && offline.includes('화면 구성 가독성') && offline.includes('인수인계 검증 계약'), 'offline page not synced');
must(readme.startsWith('# AquaFantasia v2.1.120') && readme.includes('## v2.1.120 변경사항') && readme.includes('installV21120ScreenCompositionHandoffPass'), 'README v2.1.120 record missing');
must(handoff.includes('기준 패키지 버전: `2.1.120`') && handoff.includes('v2.1.120 화면 구성/인수인계 계약 패치 기록') && handoff.includes('산출물 zip 점검 명령'), 'handoff v2.1.120 record missing');

must(main.includes("classList.add('v21119-interaction-safe-root')"), 'v2.1.119 root scope must remain');
must(main.includes("classList.add('v21120-screen-composition-handoff-root')") && main.includes('readable-shell-safe-nav-handoff-contract'), 'v2.1.120 root scope missing');
must(main.includes('installV21120ScreenCompositionHandoffPass') && main.includes('v21120-readable-panel') && main.includes('v21120-contained-media'), 'v2.1.120 runtime pass missing');
must(main.includes("html.style.setProperty('--v21120-visual-height'") && main.includes("html.style.setProperty('--v21120-visual-width'"), 'v2.1.120 visual viewport variables missing');
must(main.includes('v21120-safe-nav') && main.includes('v21120-action-button') && main.includes('v21120-readable-text'), 'v2.1.120 nav/action/text tokens missing');
must(main.includes('lastSignature') && main.includes("'v21120ScreenCompositionHandoff'"), 'v2.1.120 signature/dataset keep guard missing');

must(css.includes('v2.1.120 screen composition handoff'), 'v2.1.120 CSS section missing');
must(css.includes('--v21120-visual-height: 100svh') && css.includes('--v21120-card-hairline'), 'v2.1.120 CSS variables missing');
must(css.includes('.v21120-readable-panel') && css.includes('text-wrap: pretty'), 'v2.1.120 readable panel/text CSS missing');
must(css.includes('.v21120-contained-media') && css.includes('-webkit-user-drag: none'), 'v2.1.120 contained media CSS missing');
must(css.includes('.v21120-safe-nav') && css.includes('width: min(460px, calc(100vw - 16px))'), 'v2.1.120 safe nav CSS missing');
must(css.includes('@media (prefers-contrast: more)') && css.includes('@media (prefers-reduced-motion: reduce)'), 'v2.1.120 accessibility media guards missing');

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
  'AF-v2.1.120-full.zip',
  'AF-v2.1.120-patch.zip'
];
for (const token of requiredHandoffTokens) must(handoff.includes(token), `handoff missing required token: ${token}`);
for (const token of ['운영/산출 고정 규칙', '결과 공유 형식', 'GitHub Desktop', 'Firebase 무료 플랜', 'zip 내부 점검 명령']) must(readme.includes(token), `README missing operating token: ${token}`);

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

console.log('[v21120] screen composition, handoff contract, SVG ban, and package guards passed');
