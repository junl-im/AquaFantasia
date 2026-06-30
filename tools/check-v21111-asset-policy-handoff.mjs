import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const fail = (message) => { console.error(`[v21111] ${message}`); process.exit(1); };
const must = (condition, message) => { if (!condition) fail(message); };
const version = '2.1.111';
const cache = 'aqua-fantasia-v2.1.111-asset-policy-handoff';

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
must(pkg.scripts.validate.includes('check-v21111-asset-policy-handoff.mjs'), 'validate script not updated');
must(data.includes(`APP_VERSION = '${version}'`) && data.includes(cache), 'data.ts version/cache mismatch');
must(sw.includes('v2.1.111') && sw.includes(cache), 'service worker not synced');
must(offline.includes('v2.1.111') && offline.includes('SVG 이미지 금지'), 'offline page not synced');
must(readme.startsWith('# AquaFantasia v2.1.111') && readme.includes('## v2.1.111 변경사항'), 'README version/history missing');
must(handoff.includes('기준 패키지 버전: `2.1.111`') && handoff.includes('SVG 이미지 절대 금지') && handoff.includes('잘 작동되는 기능은 건드리지 않는다'), 'handoff safety rules missing');

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
  const raw = match[1].trim().replace(/^['"]|['"]$/g, '');
  const target = normalizedAssetPath(raw);
  if (target && !fs.existsSync(target)) missingCssAssets.push(raw);
}
must(missingCssAssets.length === 0, `CSS asset references missing: ${[...new Set(missingCssAssets)].join(', ')}`);
must(css.includes('/assets/v12/buttons/btn_orange_normal_wide_blank.webp'), 'orange wide button fallback not corrected');
must(css.includes('./assets/v2110/ui/main_aqua_cards/ui_main_001.png'), 'main aqua card asset not corrected');
must(css.includes('./assets/v2110/ui/buttons_and_badges/ui_button_001.png'), 'close/button asset not corrected');
must(!css.includes('/assets/v12/buttons/btn_orange_wide_blank.webp'), 'old missing orange button asset still referenced');
must(!css.includes('./assets/v2110/ui/main_aqua_cards/ui_card_001.png'), 'old missing main card asset still referenced');
must(!css.includes('./assets/v2110/ui/buttons_and_badges/ui_badge_001.png'), 'old missing badge asset still referenced');

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

console.log('[v21111] asset policy, SVG ban, handoff, and CSS asset reference checks passed');
