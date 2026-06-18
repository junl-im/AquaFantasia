import { readFileSync, existsSync, readdirSync } from 'node:fs';
const root = process.cwd();
const read = (file) => readFileSync(`${root}/${file}`, 'utf8');
const fail = (message) => { throw new Error(message); };
const pkg = JSON.parse(read('package.json'));
if (!/^2\.0\.(2[8-9]|[3-9]\d)$/.test(pkg.version)) fail(`package version must preserve v2.0.28+ zero-defect checker: ${pkg.version}`);
const version = pkg.version;
if (!pkg.scripts.validate.includes('check-v2028-zero-defect-ui-audit')) fail('validate script must include v2.0.28 zero-defect checker');
for (const [file, token] of [
  ['src/data.ts', `APP_VERSION = '${version}'`],
  ['src/data.ts', `aqua-fantasia-v${version}-`],
  ['public/sw.js', `aqua-fantasia-v${version}-`],
  ['public/offline.html', `v${version}`],
  ['README.md', `# AquaFantasia v${version}`],
  ['README.md', `## v${version} 변경사항`],
]) if (!read(file).includes(token)) fail(`${file} missing ${token}`);
const main = read('src/main.ts');
for (const token of [
  "dataset.zeroDefectUiAudit = 'v2028-zero-defect-ui-audit'",
  "dataset.legacyCssQuarantine = 'v2028-legacy-css-quarantine'",
  'v2028-fishing-zero-overlap-screen',
  'v2028-fishing-stage',
  'v2028-fishing-hud',
  'v2028-stage-ui',
  'v2028-reel-panel',
  'v2028-menu-aqua-reset-screen',
  "root.dataset.v2028MenuAudit = 'simple-aqua-readable-content'",
]) if (!main.includes(token)) fail(`src/main.ts missing ${token}`);
for (const stale of [
  'v840-fishing-screen',
  'v890-fishing-screen',
  'v840-fishing-stage',
  'v840-stage-ui',
  'v840-fishing-hud',
  'v840-reel-panel',
  'v2026-page-health-panel v204-window-card',
]) if (main.includes(stale)) fail(`src/main.ts still carries stale visible UI token: ${stale}`);
const css = read('src/styles.css');
for (const token of [
  'v2.0.28 Zero-defect UI audit and legacy quarantine pass',
  'html[data-zero-defect-ui-audit="v2028-zero-defect-ui-audit"] .bottom-nav.v2027-aqua-dock-nav',
  'color: #ffffff !important;',
  'body[data-screen="fishing"] .v2028-fishing-hud.fishing-hud',
  'body[data-screen="fishing"] .recent-catch-strip',
  'body[data-screen="fishing"] .v2028-reel-panel.reel-panel',
  '.runtime-menu-screen.v2028-menu-aqua-reset-screen .runtime-content',
  '.v2-build-tray {',
  'height: min(88dvh, 820px)',
  '#toast-root .toast',
  '.v2027-village-loading > div::before',
]) if (!css.includes(token)) fail(`src/styles.css missing ${token}`);
const block = css.slice(css.indexOf('v2.0.28 Zero-defect UI audit'));
if (block.includes('html[data-version="2.0.28"]')) fail('v2.0.28 guard must not be scoped to exact data-version');
const world = read('src/villageWorld.ts');
for (const token of [
  'cherryTree: 132',
  "baseNpcs.push(['tourist', '관광객', 23, 24",
  "data-v2028-build-preview-active",
  "data-v2028-build-tray-open",
  "west: 'west'",
  "east: 'east'",
  'actor.label.scale.set(1, 1)',
]) if (!world.includes(token)) fail(`src/villageWorld.ts missing ${token}`);
if (!world.includes("{ kind: 'flowerTree', x: 13, y: 26, scale: .30 }") && !world.includes("{ kind: 'flowerTree', x: 14, y: 26, scale: .22 }")) fail('src/villageWorld.ts missing flowerTree safe placement token');
if (world.includes('this.previewLayer.removeChildren();\n    this.previewLayer.removeChildren();')) fail('duplicate preview clear remains');
for (const token of ['packages.applied-caas', 'applied-caas-gateway', 'internal.api.openai', '10.192.']) {
  if (read('package-lock.json').includes(token)) fail(`package-lock contains forbidden token ${token}`);
}
for (const asset of [
  'public/assets/v2023/build/preview_valid_tile.png',
  'public/assets/v2023/build/preview_invalid_tile.png',
  'public/assets/v2025/ui/toast_banner_aqua_premium_sd2026.png',
  'public/assets/v2025/props/harbor_beach_bench_source_02_512.png',
]) if (!existsSync(`${root}/${asset}`)) fail(`missing required asset ${asset}`);
if (readdirSync(root).some((name) => name.endsWith('_NOTES.md'))) fail('Unexpected NOTES md in project root');
console.log('[AquaFantasia] v2.0.28 zero-defect UI audit validation passed.');
