import { readFileSync, existsSync, readdirSync } from 'node:fs';
const root = process.cwd();
const read = (file) => readFileSync(`${root}/${file}`, 'utf8');
const fail = (message) => { throw new Error(message); };
const pkg = JSON.parse(read('package.json'));
const version = '2.0.29';
if (pkg.version !== version) fail(`package version mismatch: ${pkg.version}`);
if (!pkg.scripts.validate.includes('check-v2029-pixel-perfect-audit')) fail('validate script must include v2.0.29 pixel-perfect checker');
for (const [file, token] of [
  ['src/data.ts', `APP_VERSION = '${version}'`],
  ['src/data.ts', 'aqua-fantasia-v2.0.29-pixel-perfect-audit'],
  ['public/sw.js', 'aqua-fantasia-v2.0.29-pixel-perfect-audit'],
  ['public/offline.html', `v${version}`],
  ['README.md', `# AquaFantasia v${version}`],
  ['README.md', `## v${version} 변경사항`],
]) if (!read(file).includes(token)) fail(`${file} missing ${token}`);
const main = read('src/main.ts');
for (const token of [
  "dataset.v2029PerfectAudit = 'v2029-pixel-perfect-multi-audit'",
  "dataset.v2029AquaSimplicity = 'v2029-readable-aqua-tone'",
  'v2029-menu-clean-page',
  "root.dataset.v2029MenuAudit = 'readable-aqua-content-first'",
  'v2029-fishing-final-layout-screen',
  'v2029-fishing-hud',
  'v2029-fishing-guide-card',
  'v2029-recent-catch-card',
  'v2029-reel-panel',
  'v2029-calm-cast-button',
  'v2029-home-dock-nav',
  "nav.dataset.dockGuard = 'v2029-home-fishing-menu-identical-dock'",
]) if (!main.includes(token)) fail(`src/main.ts missing ${token}`);
for (const stale of [
  'v840-fishing-screen', 'v840-fishing-stage', 'v840-stage-ui', 'v840-fishing-hud', 'v840-reel-panel',
  'v890-fishing-screen', 'v2026-page-health-panel v204-window-card', 'v208-right-dock-nav v2010-right-dock-nav'
]) if (main.includes(stale)) fail(`src/main.ts still includes stale visible UI token: ${stale}`);
const css = read('src/styles.css');
for (const token of [
  'v2.0.29 Pixel-perfect multi-direction audit',
  'html[data-v2029-perfect-audit="v2029-pixel-perfect-multi-audit"] .bottom-nav.v2029-home-dock-nav',
  '--v2029-fishing-side-gap',
  'body[data-screen="fishing"] .v2029-fishing-hud.fishing-hud',
  'body[data-screen="fishing"] .v2029-fishing-guide-card.fishing-guide-card',
  'body[data-screen="fishing"] .v2029-recent-catch-card.recent-catch-strip',
  'body[data-screen="fishing"] .v2029-reel-panel.reel-panel',
  'body[data-screen="fishing"] .v2029-calm-cast-button.cast-button',
  '.runtime-menu-screen.v2029-menu-clean-page .runtime-content',
  '.v2-build-tray {',
  'height: min(91dvh, 860px)',
  '#toast-root .toast',
  'color: #fff !important;'
]) if (!css.includes(token)) fail(`src/styles.css missing ${token}`);
const v2029 = css.slice(css.indexOf('v2.0.29 Pixel-perfect multi-direction audit'));
if (v2029.includes('html[data-version="2.0.29"]')) fail('v2.0.29 guard must not be scoped to exact version');
for (const token of [
  'background-image: none !important;',
  'display: none !important;',
  'grid-template-columns: repeat(3, var(--v2029-dock-button))',
  'grid-template-rows: repeat(2, var(--v2029-dock-button))'
]) if (!v2029.includes(token)) fail(`v2029 CSS guard missing ${token}`);
const world = read('src/villageWorld.ts');
for (const token of [
  'V2029_HIDDEN_DECORATION_KEYS',
  'function shouldUseDecoration(deco: Decoration): boolean',
  "{ kind: 'cherryTree', x: 15, y: 16, blocks: true, scale: .24 }",
  "this.root.dataset.v2029VillageAudit = 'object-npc-build-stable'",
  'private ensureNpcHealth(): void',
  'shouldUseDecoration(deco)',
  'updateBuildPreviewAtTile(previewX, previewY)',
  "west: 'west'",
  "east: 'east'",
  'actor.label.scale.set(1, 1)'
]) if (!world.includes(token)) fail(`src/villageWorld.ts missing ${token}`);
if (world.includes("{ kind: 'cherryTree', x: 13, y: 15, blocks: true, scale: .34 }")) fail('old half-cut cherry tree placement remains');
const lock = read('package-lock.json');
for (const token of ['packages.applied-caas', 'applied-caas-gateway', 'internal.api.openai', '10.192.']) if (lock.includes(token)) fail(`package-lock contains forbidden token ${token}`);
for (const asset of [
  'public/assets/v2025/ui/hud_capsule_aqua_premium_sd2026.png',
  'public/assets/v2025/ui/toast_banner_aqua_premium_sd2026.png',
  'public/assets/v2023/build/preview_valid_tile.png',
  'public/assets/v2023/characters/player_west.png',
  'public/assets/v2023/characters/player_east.png',
]) if (!existsSync(`${root}/${asset}`)) fail(`missing required asset ${asset}`);
if (readdirSync(root).some((name) => name.endsWith('_NOTES.md'))) fail('Unexpected NOTES md in project root');
console.log('[AquaFantasia] v2.0.29 pixel-perfect multi-direction audit validation passed.');
