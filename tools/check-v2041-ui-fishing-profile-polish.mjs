import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => { console.error(`[v2041-ui-fishing-profile-polish] ${message}`); process.exit(1); };
const must = (condition, message) => { if (!condition) fail(message); };
const has = (source, token, label = token) => must(source.includes(token), `missing ${label}`);

const pkg = JSON.parse(read('package.json'));
const main = read('src/main.ts');
const css = read('src/styles.css');
const world = read('src/villageWorld.ts');
const data = read('src/data.ts');
const storage = read('src/storage.ts');
const types = read('src/types.ts');
const sw = read('public/sw.js');
const offline = read('public/offline.html');
const readme = read('README.md');
const lock = read('package-lock.json');

const [major, minor, patch] = pkg.version.split('.').map(Number);
must(major === 2 && minor === 0 && patch >= 41, 'package.json version must be 2.0.41 or newer');
has(data, `APP_VERSION = '${pkg.version}'`, `APP_VERSION ${pkg.version}`);
has(data, `aqua-fantasia-v${pkg.version}-`, `data cache v${pkg.version}`);
has(sw, `aqua-fantasia-v${pkg.version}-`, `sw cache v${pkg.version}`);
has(offline, `v${pkg.version}`, `offline badge v${pkg.version}`);
has(readme, `# AquaFantasia v${pkg.version}`, `README title v${pkg.version}`);
has(readme, '## v2.0.41', 'README v2.0.41 changelog');

for (const token of [
  "dataset.v2041UiFishingProfilePolish = 'v2041-ui-fishing-profile-polish'",
  'v2041-fishing-playable-screen',
  'v2041-fishing-stage',
  'v2041-reel-panel',
  'v2041-cast-button',
  'v2041-result-card',
  'v2041-action-badge',
  'v2041-bite-burst',
  'v2041-bite-callout',
  'v2041-identical-dock-nav',
  "nav.dataset.v2041DockGuard = 'v2041-transparent-identical-dock'",
  'v2041-menu-aqua-center-screen',
  "root.dataset.v2041MenuAudit = 'centered-aqua-card-readable-wallet'",
  'data-v2041-name-input',
  'data-v2041-name-save',
  'data-v2041-player-name',
  'startTouchHold',
  'startPanelHold',
  "callout.innerHTML = `<strong>${title}</strong><span>",
]) has(main, token, `main token ${token}`);

must(!main.includes('\ud074\ub9ad\ud574\uc11c \uc5f4\uae30'), 'HUD must not show old click-to-open copy');
must(!main.includes('CAPTAIN PROFILE'), 'character profile must not show CAPTAIN PROFILE');
must(!main.includes('v2017-character-note">'), 'character profile note markup must be removed');

for (const token of [
  'playerName: string;',
]) has(types, token, `types token ${token}`);
for (const token of [
  'sanitizePlayerName',
  'playerName: sanitizePlayerName(parsed.playerName, base.playerName)',
]) has(storage, token, `storage token ${token}`);
has(data, 'playerName:', 'default player name');

const hasV2041DirectDiagonal = [
  "northeast: 'northeast'",
  "southeast: 'southeast'",
  "northwest: 'northwest'",
  "southwest: 'southwest'",
  "{ movement: 'northeast', dx: 0.5, dy: -0.866, texture: 'northeast' }",
  "{ movement: 'southeast', dx: 0.5, dy: 0.866, texture: 'southeast' }",
  "{ movement: 'northwest', dx: -0.5, dy: -0.866, texture: 'northwest' }",
  "{ movement: 'southwest', dx: -0.5, dy: 0.866, texture: 'southwest' }",
  'v2.0.41: use the actual v2023 file direction directly',
].every((token) => world.includes(token));
const hasV2042VisualDiagonal = [
  "northeast: 'northwest'",
  "southeast: 'southeast'",
  "northwest: 'northeast'",
  "southwest: 'southwest'",
  "{ movement: 'northeast', dx: 0.5, dy: -0.866, texture: 'northwest' }",
  "{ movement: 'southeast', dx: 0.5, dy: 0.866, texture: 'southeast' }",
  "{ movement: 'northwest', dx: -0.5, dy: -0.866, texture: 'northeast' }",
  "{ movement: 'southwest', dx: -0.5, dy: 0.866, texture: 'southwest' }",
  'v2.0.42: the actual player PNG silhouettes were inspected in a contact sheet',
].every((token) => world.includes(token));
must(hasV2041DirectDiagonal || hasV2042VisualDiagonal, 'villageWorld.ts missing v2041/v2042 diagonal QA lineage');

for (const token of [
  "this.root.classList.add('v2040-interior-open', 'v2041-interior-open'",
  "document.body.classList.add('v2040-interior-open', 'v2041-interior-open'",
  ".v2-world-controls')?.setAttribute('hidden', 'true')",
  ".bottom-nav')?.setAttribute('hidden', 'true')",
]) has(world, token, `world token ${token}`);

for (const oldCross of [
  "northeast: 'southwest'",
  "southeast: 'northwest'",
  "northwest: 'southeast'",
  "southwest: 'northeast'",
]) must(!world.includes(oldCross), `old diagonal cross-map remains: ${oldCross}`);

for (const token of [
  'v2.0.41 UI/fishing/profile polish',
  '--v2041-control-size',
  '--v2041-dock-button',
  '.village-world-screen .v2-world-controls',
  'border: 1px solid transparent !important',
  '.bottom-nav.v2041-identical-dock-nav',
  '[data-dock-slot="village"] { grid-column: 2 !important; grid-row: 1 !important; }',
  '[data-dock-slot="inventory"] { grid-column: 1 !important; grid-row: 2 !important; }',
  '[data-dock-slot="mission"] { grid-column: 2 !important; grid-row: 2 !important; }',
  '[data-dock-slot="map"] { grid-column: 3 !important; grid-row: 2 !important; }',
  'body.v2041-interior-open .v2-world-controls',
  'body[data-screen="fishing"] .v2041-reel-panel:not(.hidden)',
  'left: 50vw !important',
  'pointer-events: auto !important',
  'touch-action: none !important',
  'body[data-screen="fishing"] .v2041-result-card',
  'body[data-screen="fishing"] :is(.v2041-action-badge,.bite-callout) :is(img,picture,svg)',
  '.runtime-menu-screen.v2041-menu-aqua-center-screen .runtime-hud',
  '.runtime-menu-screen.v2041-menu-aqua-center-screen .runtime-wallet',
  '.runtime-menu-screen.v2041-menu-aqua-center-screen .runtime-content',
  '.v2041-name-editor',
  '.v2017-character-card :is(.v2017-character-title,.v2017-character-note)',
]) has(css, token, `css token ${token}`);

must(!/html\[data-version="2\.0\.41"\]/.test(css), 'v2041 CSS must not be scoped to exact data-version');
for (const forbidden of ['packages.applied-caas', 'applied-caas-gateway', '10.192.', 'internal.api.openai']) {
  must(!lock.includes(forbidden), `package-lock contains forbidden registry token ${forbidden}`);
}

const rootMarkdown = fs.readdirSync('.').filter((name) => name.toLowerCase().endsWith('.md'));
must(rootMarkdown.length === 1 && rootMarkdown[0] === 'README.md', 'root must contain README.md only');
const forbiddenNotes = fs.readdirSync('.', { recursive: true }).filter((name) => /_NOTES\.md$/i.test(String(name)));
must(forbiddenNotes.length === 0, 'must not create *_NOTES.md files');

console.log('[AquaFantasia] v2.0.41 UI/fishing/profile polish validation passed.');
