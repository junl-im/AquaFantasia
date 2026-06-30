import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const fail = (message) => { console.error(`[v21117] ${message}`); process.exit(1); };
const must = (condition, message) => { if (!condition) fail(message); };
const version = '2.1.117';
const cache = 'aqua-fantasia-v2.1.117-village-menu-icon-clarity';

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
must(pkg.scripts.validate === 'node tools/clean-old-patch-docs.mjs && node tools/validate-clean.mjs && node tools/check-v21117-village-menu-icon-clarity.mjs', 'validate script must use v2.1.117 guard');
must(data.includes(`APP_VERSION = '${version}'`) && data.includes(cache), 'data.ts version/cache mismatch');
must(sw.includes('v2.1.117') && sw.includes(cache) && sw.includes('url.origin !== self.location.origin') && sw.includes('response.ok'), 'service worker v2.1.117 cache containment missing');
must(offline.includes('v2.1.117') && offline.includes('마을 우측 상단 메뉴 아이콘'), 'offline page not synced');
must(readme.startsWith('# AquaFantasia v2.1.117') && readme.includes('## v2.1.117 변경사항') && readme.includes('아이콘 위쪽에 다른 그림'), 'README v2.1.117 record missing');
must(handoff.includes('기준 패키지 버전: `2.1.117`') && handoff.includes('v2.1.117 마을 우측 상단 메뉴 아이콘 시인성 hotfix 기록') && handoff.includes('마을 우측 상단 메뉴 아이콘'), 'handoff v2.1.117 record missing');

must(main.includes("classList.add('v21116-fishing-ui-stability-hotfix-root')"), 'v2.1.116 fishing stability root must remain');
must(main.includes("classList.add('v21117-village-menu-icon-clarity-root')") && main.includes('top-right-icons-larger-same-cell-clipped-clean'), 'v2.1.117 root scope missing');
must(main.includes('installV21117VillageMenuIconClarityPass') && main.includes('v21117-world-controls-icon-clarity'), 'v2.1.117 menu clarity pass missing');
must(main.includes("html.style.setProperty('--v21105-menu-icon', `${compact ? 24 : 25}px`);") && main.includes("html.style.setProperty('--v21117-menu-cell', '34px')"), 'menu icon/cell variables not synced');
must(main.includes('fixed-34-cell-25-icon-no-bleed') && main.includes('icon-bigger-button-same-size-clip-clean'), 'v2.1.117 menu data tokens missing');
must(main.includes("['clip-path', 'inset(0 round 11px)']") && main.includes("['isolation', 'isolate']") && main.includes("['background-image', 'none']"), 'runtime bleed clipping/isolation missing');
must(main.includes("['width', 'var(--v21117-menu-icon)']") && main.includes("['max-height', 'var(--v21117-menu-icon)']"), 'runtime icon size override missing');

must(css.includes('v2.1.117 village top-right menu icon clarity'), 'v2.1.117 CSS section missing');
must(css.includes('--v21117-menu-cell: 34px') && css.includes('--v21117-menu-icon: 25px'), 'v2.1.117 CSS variables missing');
must(css.includes('clip-path: inset(0 round 11px) !important') && css.includes('isolation: isolate !important') && css.includes('background-image: none !important'), 'v2.1.117 bleed guard CSS missing');
must(css.includes('width: var(--v21117-menu-icon) !important') && css.includes('object-position: center center !important'), 'v2.1.117 icon clarity CSS missing');
must(css.includes('content: none !important') && css.includes('.v2157-menu-label'), 'v2.1.117 pseudo/label guards missing');
must(css.includes('@media (max-width: 360px), (max-height: 610px)'), 'v2.1.117 compact fallback missing');

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

console.log('[v21117] village top-right menu icon clarity, SVG ban, and handoff guards passed');
