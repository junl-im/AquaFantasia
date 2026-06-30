import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const fail = (message) => { console.error(`[v21115] ${message}`); process.exit(1); };
const must = (condition, message) => { if (!condition) fail(message); };
const version = '2.1.115';
const cache = 'aqua-fantasia-v2.1.115-runtime-viewport-input-guard';

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const data = read('src/data.ts');
const main = read('src/main.ts');
const runtimeQuality = read('src/core/RuntimeQualityManager.ts');
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
must(pkg.scripts.validate === 'node tools/clean-old-patch-docs.mjs && node tools/validate-clean.mjs && node tools/check-v21115-runtime-viewport-input-guard.mjs', 'validate script must use v2.1.115 guard');
must(data.includes(`APP_VERSION = '${version}'`) && data.includes(cache), 'data.ts version/cache mismatch');
must(sw.includes('v2.1.115') && sw.includes(cache) && sw.includes('url.origin !== self.location.origin') && sw.includes('response.ok'), 'service worker v2.1.115 cache containment missing');
must(offline.includes('v2.1.115') && offline.includes('키보드 변동'), 'offline page not synced');
must(readme.startsWith('# AquaFantasia v2.1.115') && readme.includes('## v2.1.115 변경사항'), 'README version/history missing');
must(handoff.includes('기준 패키지 버전: `2.1.115`') && handoff.includes('v2.1.115 런타임 viewport/input 가드'), 'handoff v2.1.115 record missing');

must(main.includes("classList.add('v21113-ui-ux-stability-root')"), 'v2.1.113 root class must remain');
must(main.includes("classList.add('v21114-interaction-layout-design-root')"), 'v2.1.114 root class must remain');
must(runtimeQuality.includes('installV21115RuntimeViewportInputGuard'), 'v2.1.115 runtime guard installer missing');
must(runtimeQuality.includes("root.classList.add('v21115-runtime-viewport-input-root')"), 'v2.1.115 root class missing');
must(runtimeQuality.includes("root.dataset.v21115RuntimeViewportInput = 'raf-batched-viewport-keyboard-input-safe-performance-guard'"), 'v2.1.115 dataset missing');
must(runtimeQuality.includes('private viewportRaf = 0') && runtimeQuality.includes('private lastViewportSignature ='), 'viewport RAF/signature guard missing');
must(runtimeQuality.includes('private scheduleViewportSync') && runtimeQuality.includes('requestAnimationFrame') && runtimeQuality.includes('this.syncViewportVars(false)'), 'batched viewport sync missing');
must(runtimeQuality.includes('--v21115-visual-height') && runtimeQuality.includes('--v21115-keyboard-inset') && runtimeQuality.includes('v21115-keyboard-visible') && runtimeQuality.includes('v21115-compact-viewport'), 'viewport/keyboard CSS variables missing');
must(runtimeQuality.includes("document.addEventListener('focusin'") && runtimeQuality.includes("document.addEventListener('focusout'"), 'input focus viewport resync missing');

must(css.includes('v2.1.115 runtime viewport/input guard'), 'v2.1.115 CSS section missing');
must(css.includes('--v21115-visual-height') && css.includes('--v21115-keyboard-inset') && css.includes('v21115-keyboard-visible'), 'v2.1.115 CSS variables/classes missing');
must(css.includes('scrollbar-gutter: stable both-edges') && css.includes('touch-action: manipulation') && css.includes('scroll-margin-block'), 'v2.1.115 input/touch/scroll guards missing');
must(css.includes('@supports not (height: 100svh)'), 'v2.1.115 svh fallback missing');

must(cleanScript.includes('AI_HANDOFF_CARDVILLE.md'), 'clean script must whitelist AI_HANDOFF_CARDVILLE.md');
must(validateClean.includes('requiredMarkdown') && validateClean.includes('AI_HANDOFF_CARDVILLE.md'), 'validate-clean must require handoff markdown');
must(main.includes('installV21110FishingFeelDesignStabilityPass'), 'last known stable fishing pass missing');
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

console.log('[v21115] runtime viewport/input guard, service worker cache containment, SVG ban, and handoff guards passed');
