import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const fail = (msg) => { console.error(`[v2166] ${msg}`); process.exit(1); };
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const json = (file) => JSON.parse(read(file));
const assertIncludes = (file, token) => { if (!read(file).includes(token)) fail(`${file} missing ${token}`); };
const assertFile = (file) => { if (!exists(file)) fail(`missing file: ${file}`); };
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');

const pkg = json('package.json');
const lock = json('package-lock.json');
if (pkg.version !== '2.1.66') fail(`package.json version is ${pkg.version}`);
if (lock.version !== '2.1.66' || lock.packages?.['']?.version !== '2.1.66') fail('package-lock.json version mismatch');
if (!pkg.scripts?.validate?.includes('check-v2166-menu-hud-autosale-polish.mjs')) fail('validate script must run v2.1.66 guard');
assertIncludes('src/data.ts', "APP_VERSION = '2.1.66'");
assertIncludes('src/data.ts', 'aqua-fantasia-v2.1.66-menu-rescue-hud-autosale-polish');
assertIncludes('public/sw.js', 'aqua-fantasia-v2.1.66-menu-rescue-hud-autosale-polish');
assertIncludes('public/offline.html', 'v2.1.66');
assertIncludes('README.md', '# AquaFantasia v2.1.66');
assertIncludes('README.md', '## v2.1.66 변경사항');
if (exists('APP_VERSION')) fail('root APP_VERSION file must not exist');
const rootMarkdown = fs.readdirSync(root).filter((name) => /\.md$/i.test(name));
if (rootMarkdown.length !== 1 || rootMarkdown[0] !== 'README.md') fail(`root markdown must be README.md only: ${rootMarkdown.join(', ')}`);

function checkCssBalance(file) {
  const text = read(file);
  const pairs = { '(': ')', '{': '}', '[': ']' };
  const closers = new Set(Object.values(pairs));
  const stack = [];
  let inComment = false;
  let quote = '';
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (inComment) { if (ch === '*' && next === '/') { inComment = false; i += 1; } continue; }
    if (quote) { if (ch === '\\') { i += 1; continue; } if (ch === quote) quote = ''; continue; }
    if (ch === '/' && next === '*') { inComment = true; i += 1; continue; }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (pairs[ch]) stack.push({ ch, i });
    else if (closers.has(ch)) {
      const open = stack.pop();
      if (!open || pairs[open.ch] !== ch) fail(`${file} bracket mismatch near index ${i}`);
    }
  }
  if (quote) fail(`${file} has unclosed quote`);
  if (inComment) fail(`${file} has unclosed comment`);
  if (stack.length) fail(`${file} has unclosed ${stack.at(-1).ch} near index ${stack.at(-1).i}`);
}
checkCssBalance('src/styles.css');

const main = read('src/main.ts');
const styles = read('src/styles.css');
const toast = read('src/toast.ts');
const village = read('src/villageWorld.ts');
const readme = read('README.md');

for (const token of [
  'dataset.v2166MenuHudAutoSalePolish',
  'v2166-menu-rescue-hud-color-autosale-loop',
  'v2166-menu-rescue-root',
  'installV2166MenuHudAutoSalePass',
  'v2166-world-controls-aqua-lock',
  'data-v2166-primary-order',
  'v2166-top-menu-cell',
  "controls.dataset.v2166MenuRescue = '2x3-38px-25px-visible-village-hide-only-open-panels'",
  "button.dataset.v2166MenuRescueCell = '38px-25px-single-border-visible-after-panel-close'",
  'panelOpen',
  'v2166-menu-panel-hidden',
  'v2166-fishing-quality-screen',
  'v2166-fishing-loadout',
  'v2166-loadout-cell',
  'v2166-sea-lane-card',
  'v2166-catch-ledger',
  'v2166-sale-ledger',
  'v2166-dex-card',
  'v2166-dex-fish-art',
  'v2166-shop-card',
  'v2166-shop-price',
  'dataset.v2166TextBudget',
  'dataset.v2166ImageBudget',
]) if (!main.includes(token)) fail(`src/main.ts missing ${token}`);

for (const token of [
  'dataset.v2166CenterToast',
  'enabled-center-aqua-card-feedback-menu-rescue',
  'v2166-center-toast',
  'this.navigate(options.actionScreen!)',
]) if (!toast.includes(token)) fail(`src/toast.ts missing ${token}`);

for (const token of [
  'v2.1.66: right-top menu rescue',
  '--v2166-hud-shell',
  '--v2166-menu-cell: 38px',
  '--v2166-menu-icon: 25px',
  '.v2097-village-hud',
  '.v2097-expedition-board:not(.open)',
  '.v2166-world-controls-aqua-lock:not(.v2166-menu-panel-hidden)',
  'grid-template-columns: repeat(2, var(--v2166-menu-cell)) !important;',
  '.v2166-top-menu-cell',
  '.v2166-world-controls-aqua-lock.v2166-menu-panel-hidden',
  '.v2166-catch-ledger .recent-card',
  '.v2166-sale-ledger .v2074-sale-grid article',
  'max-width: 26px !important;',
  '.v2166-dex-fish-art',
  'max-width: 36px !important;',
  '#toast-root[data-v2166-center-toast',
]) if (!styles.includes(token)) fail(`src/styles.css missing ${token}`);

for (const token of [
  '우측 상단 메뉴바가 마을 일반 화면에서 사라지는 회귀',
  '38px 버튼, 25px 아이콘',
  'HUD 바 색감',
  '자동 판매 루프',
  '낚시 준비 화면의 낚싯대/미끼 표기',
  '상점 구매 알림',
  '플레이어 8방향 32프레임',
  'poster 제거 상태',
  '## v2.1.65 변경사항',
]) if (!readme.includes(token)) fail(`README.md missing ${token}`);

if (/poster\s*=\s*["']\.\/assets\/v2120\/opening\/aqua_opening_poster_v2120\.jpg/.test(main)) fail('opening video must not use poster image before playback');
if (/scaleX\s*\(\s*-1\s*\)|flipX|mirror|alias.*east|alias.*west/i.test(main)) fail('player/NPC direction code must not introduce flip or alias regression');

for (const token of [
  'V2151_DIAMOND_TOUCH_SCORE_LIMIT = 0.926',
  'bestScore <= V2151_DIAMOND_TOUCH_SCORE_LIMIT',
  'const TILE_W = 80',
  'const TILE_H = 40',
  'V2129_PLAYER_FILENAME_DIRECTION_LOCK',
  './assets/v2129/characters/player/player_${direction}_frame_${String(index + 1).padStart(2, \'0\')}.png',
  "player: './assets/v2129/characters/player/player_south_frame_01.png'",
  'return ACTOR_DIRECTIONS.every((direction) => playerActorVisualDirection(direction) === direction);',
  "east: 'east'",
  "west: 'west'",
  "northeast: 'northeast'",
  "northwest: 'northwest'",
]) if (!village.includes(token)) fail(`src/villageWorld.ts missing ${token}`);
const playerMap = village.match(/const PLAYER_ACTOR_DIRECTION_TEXTURE_FIX:[\s\S]*?};/);
if (!playerMap) fail('PLAYER_ACTOR_DIRECTION_TEXTURE_FIX block missing');
if (/east:\s*'west'|west:\s*'east'|northeast:\s*'northwest'|northwest:\s*'northeast'/.test(playerMap[0])) fail('player direction map must not swap east/west or diagonals');

const directions = ['south','southeast','east','northeast','north','northwest','west','southwest'];
const playerDir = 'public/assets/v2129/characters/player';
for (const direction of directions) for (let frame = 1; frame <= 4; frame += 1) assertFile(`${playerDir}/player_${direction}_frame_${String(frame).padStart(2, '0')}.png`);
const hashManifest = json(`${playerDir}/player_frame_hashes_v2129.json`);
if (Object.keys(hashManifest).length !== 32) fail('player hash manifest must contain exactly 32 frames');
for (const [name, hash] of Object.entries(hashManifest)) {
  const rel = `${playerDir}/${name}`;
  assertFile(rel);
  if (sha256(rel) !== hash) fail(`player frame hash changed: ${name}`);
}
if (sha256(`${playerDir}/player_east_frame_01.png`) === sha256(`${playerDir}/player_west_frame_01.png`)) fail('east and west player frames must not be identical');
const npcDir = 'public/assets/v2023/characters';
const npcRoles = ['chief', 'merchant', 'guild', 'captain', 'tourist', 'vip'];
for (const role of npcRoles) for (const direction of directions) assertFile(`${npcDir}/${role}_${direction}.png`);

console.log('[v2166] menu rescue, HUD color, inventory auto-sale loop, direction assets, and packaging guards passed');
