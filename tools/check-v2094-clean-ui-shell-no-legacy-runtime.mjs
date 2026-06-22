import { readFileSync, existsSync } from 'node:fs';
const root = process.cwd();
const read = (file) => readFileSync(`${root}/${file}`, 'utf8');
const fail = (message) => { throw new Error(message); };
const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '2.0.94') fail(`expected package version 2.0.94, got ${pkg.version}`);
for (const [file, token] of [
  ['src/data.ts', "APP_VERSION = '2.0.94'"],
  ['src/data.ts', 'aqua-fantasia-v2.0.94-clean-ui-shell-legacy-removal'],
  ['public/sw.js', 'aqua-fantasia-v2.0.94-clean-ui-shell-legacy-removal'],
  ['public/offline.html', 'v2.0.94'],
  ['README.md', '## v2.0.94'],
]) if (!read(file).includes(token)) fail(`${file} missing ${token}`);
const main = read('src/main.ts');
const css = read('src/styles.css');
const village = read('src/villageWorld.ts');
const liveRequired = [
  "root.className = 'game-screen village-world-screen v2094-village-screen locked-screen'",
  'dataset.v2094UiReset',
  'activateV2094UiResetShell',
  'v2094-village-hud',
  'v2094-profile-chip',
  'v2094-expedition-board',
  'data-v2094-expedition-toggle',
  'data-v2094-expedition-body',
  'v2094-character-panel',
  'v2094-interior-panel',
  'v2094-build-tray',
  'v2094-world-controls',
  'v2094-joystick',
  'v2094-menu-screen',
  'v2094-menu-content',
  'data-v2094-scroll-root',
];
for (const token of liveRequired) if (!main.includes(token)) fail(`main.ts missing live v2094 token ${token}`);
for (const token of [
  'class="v204-mini-map"',
  'class="v206-village-status',
  'class="v2-objective-card',
  'class="v2-village-guide',
  'class="v2-dialog-panel',
  'class="v2-world-controls',
  'class="v2-joystick',
  'class="v2017-character-panel"',
  'class="v203-interior-panel',
  'class="v2-build-tray',
  'nav.innerHTML = `<div class="dock-row',
  'document.body.appendChild(nav);',
]) if (main.includes(token)) fail(`legacy live markup still present: ${token}`);
if (!/private mountBottomNav[\s\S]*legacy right\/bottom dock no longer mounts[\s\S]*}\n\n  private installTabSwipe/.test(main)) fail('mountBottomNav must be disabled in v2094 live UI');
for (const token of [
  'html[data-version="2.0.94"] .v2094-village-screen',
  'html[data-version="2.0.94"] .v2094-village-hud',
  'html[data-version="2.0.94"] .v2094-expedition-board',
  'html[data-version="2.0.94"] .v2094-menu-screen',
  'html[data-version="2.0.94"] .v2094-ui-close',
  'html[data-version="2.0.94"] .bottom-nav',
]) if (!css.includes(token)) fail(`styles.css missing v2094 guard ${token}`);
if (!village.includes("'.v2094-village-hud'")) fail('villageWorld must sync v2094 HUD, not legacy HUD');
if (!village.includes("'.v2094-world-controls'")) fail('villageWorld must hide v2094 controls for modals');
if (!village.includes("'.v2094-dialog-panel'")) fail('villageWorld dialogue must target v2094 dialog panel');
if (village.includes("querySelector<HTMLElement>('.v2-village-hud')")) fail('villageWorld still queries legacy HUD');
for (const token of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  if (read('package-lock.json').includes(token)) fail(`package-lock contains forbidden token ${token}`);
}
if (!existsSync(`${root}/src/villageWorld.ts`)) fail('villageWorld missing');
console.log('[AquaFantasia] v2.0.94 clean UI shell and legacy runtime removal validation passed.');
