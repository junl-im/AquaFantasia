import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const fail = (message) => { console.error(`[v21116] ${message}`); process.exit(1); };
const must = (condition, message) => { if (!condition) fail(message); };
const version = '2.1.116';
const cache = 'aqua-fantasia-v2.1.116-fishing-ui-stability-hotfix';

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
must(pkg.scripts.validate === 'node tools/clean-old-patch-docs.mjs && node tools/validate-clean.mjs && node tools/check-v21116-fishing-ui-stability-hotfix.mjs', 'validate script must use v2.1.116 guard');
must(data.includes(`APP_VERSION = '${version}'`) && data.includes(cache), 'data.ts version/cache mismatch');
must(sw.includes('v2.1.116') && sw.includes(cache) && sw.includes('url.origin !== self.location.origin') && sw.includes('response.ok'), 'service worker v2.1.116 cache containment missing');
must(offline.includes('v2.1.116') && offline.includes('낚시 장비/미끼칸'), 'offline page not synced');
must(readme.startsWith('# AquaFantasia v2.1.116') && readme.includes('## v2.1.116 변경사항') && readme.includes('물었다!') && readme.includes('연속 성공'), 'README v2.1.116 record missing');
must(handoff.includes('기준 패키지 버전: `2.1.116`') && handoff.includes('v2.1.116 낚시 UI 안정성 hotfix 기록') && handoff.includes('1.2초 자동'), 'handoff v2.1.116 record missing');

must(main.includes("classList.add('v21113-ui-ux-stability-root')"), 'v2.1.113 root class must remain');
must(main.includes("classList.add('v21114-interaction-layout-design-root')"), 'v2.1.114 root class must remain');
must(main.includes("v21116-fishing-ui-stability-hotfix-root") && main.includes("stable-loadout-bite-combo-result-aqua-skin"), 'v2.1.116 root scope missing');
must(main.includes('v21116-loadout-stable') && main.includes('v21116-loadout-cell'), 'loadout stability tokens missing');
must(main.includes('v21116-combo-badge') && main.includes('v21116-cast-button-stable'), 'combo/cast stability tokens missing');
must(main.includes("// v2.1.116: keep the bite callout stable until the player taps it; no auto-close/auto-reel jump."), 'auto bite transition removal comment missing');
must(!main.includes("if (this.state === 'bite') this.startReeling();\n    }, 1200"), 'old 1.2s auto bite transition still present');
must(main.includes(".cast-button, .bite-callout, .reel-panel") && main.includes(".cast-button, .bite-callout, .v2055-reel-console"), 'bite callout must be excluded from root/stage pointer handling');
must(main.includes('const existing = this.stageHost?.querySelector<HTMLElement>(\'.bite-callout\')') && main.includes('if (!existing) this.stageHost?.appendChild(callout)'), 'bite callout reuse guard missing');
must(main.includes('v21116-bite-callout-stable') && main.includes('single-stable-player-trigger-only') && main.includes('v21116-bite-start'), 'stable bite callout tokens missing');
must(main.includes('const existingResult = document.querySelector(\'.catch-result-card.v2064-result-card\')') && main.includes('if (this.resultCardOpen && existingResult) return'), 'result card double-open guard missing');
must(main.includes('v21116-result-card-stable') && main.includes("card.dataset.v21116ResultCard = 'locked-size-aqua-stable'"), 'result card stable token missing');

must(css.includes('v2.1.116 fishing UI stability hotfix'), 'v2.1.116 CSS section missing');
must(css.includes('v21116-loadout-stable') && css.includes('animation: none !important') && css.includes('will-change: auto !important'), 'loadout no-jitter CSS missing');
must(css.includes('hud_capsule_aqua_premium_sd2026.png') && css.includes('slot_square_aqua_premium_sd2026.png'), 'Aqua PNG skin missing for loadout/combo');
must(css.includes('v21116-combo-badge') && css.includes('white-space: nowrap !important'), 'combo badge stable style missing');
must(css.includes('v21116-bite-callout-stable') && css.includes('modal_tall_aqua_premium_sd2026.png') && css.includes('transition: opacity 120ms ease'), 'bite callout stable Aqua style missing');
must(css.includes('v21116-result-card-stable') && css.includes('panel_medium_aqua_premium_sd2026.png') && css.includes('catch-result-card.v2059-result-idle'), 'result card stable Aqua style missing');
must(css.includes('position: fixed !important') && css.includes('transform: translate3d(-50%, -50%, 0) !important') && css.includes('scrollbar-gutter: stable !important'), 'result/bite fixed center stability CSS missing');
must(css.includes('@supports not (height: 100svh)') && css.includes('@media (prefers-reduced-motion: reduce)'), 'fallback/reduced motion guards missing');

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

console.log('[v21116] fishing UI stability hotfix, Aqua PNG skins, SVG ban, and handoff guards passed');
