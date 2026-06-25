import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const fail = (msg) => { console.error(`[v2163] ${msg}`); process.exit(1); };
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const json = (file) => JSON.parse(read(file));
const assertIncludes = (file, token) => { if (!read(file).includes(token)) fail(`${file} missing ${token}`); };
const assertFile = (file) => { if (!exists(file)) fail(`missing file: ${file}`); };
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');

const pkg = json('package.json');
const lock = json('package-lock.json');
if (pkg.version !== '2.1.63') fail(`package.json version is ${pkg.version}`);
if (lock.version !== '2.1.63' || lock.packages?.['']?.version !== '2.1.63') fail('package-lock.json version mismatch');
if (!pkg.scripts?.validate?.includes('check-v2163-hud-fishing-toast-inventory-polish.mjs')) fail('validate script must run v2.1.63 guard');
assertIncludes('src/data.ts', "APP_VERSION = '2.1.63'");
assertIncludes('src/data.ts', 'aqua-fantasia-v2.1.63-hud-menu-fishing-toast-inventory-polish');
assertIncludes('public/sw.js', 'aqua-fantasia-v2.1.63-hud-menu-fishing-toast-inventory-polish');
assertIncludes('public/offline.html', 'v2.1.63');
assertIncludes('README.md', '# AquaFantasia v2.1.63');
assertIncludes('README.md', '## v2.1.63 변경사항');
if (exists('APP_VERSION')) fail('root APP_VERSION file must not exist');

const rootMarkdown = fs.readdirSync(root).filter((name) => /\.md$/i.test(name));
if (rootMarkdown.length !== 1 || rootMarkdown[0] !== 'README.md') fail(`root markdown must be README.md only: ${rootMarkdown.join(', ')}`);
for (const name of ['dist', 'reports', 'backup', 'logs', '_NOTES', 'AquaFantasia_backup_v1']) {
  if (exists(name)) fail(`forbidden generated folder/file found: ${name}`);
}

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
  'dataset.v2163HudFishingToastInventoryPolish',
  'v2163-hud-gap-menu-bigger-fishing-loadout-center-toast-ledger-dex',
  'v2163-hud-fishing-toast-inventory-root',
  'v2163-world-controls-aqua-lock',
  'data-v2163-primary-order',
  'v2163-top-menu-cell',
  "controls.dataset.v2163HudMenuCheck = '2x3-35px-23px-4px-no-frame-hide-on-build-expedition'",
  "button.dataset.v2163HudMenuCell = '35px-23px-single-border-no-frame-no-overlap'",
  "['grid-template-columns', 'repeat(2, 35px)']",
  "['width', '35px']",
  "['width', '23px']",
  'v2163-fishing-clarity-screen',
  'v2163-fishing-loadout',
  'v2163-loadout-cell',
  '낚싯대 Lv.${this.save.gear.rodLevel}',
  '미끼 ${this.save.gear.lureStock}개',
  '미끼 보충 필요',
  '장비 또는 상점에서 미끼를 보충한 뒤 다시 캐스팅하세요.',
  'v2163-catch-ledger',
  'v2163-sale-ledger',
  'v2163-dex-card',
  'v2163-dex-fish-art',
  '구매 완료!',
  '무료 보상 수령!',
]) if (!main.includes(token)) fail(`src/main.ts missing ${token}`);

for (const token of [
  'dataset.v2163CenterToast',
  'enabled-center-aqua-card-feedback',
  'v2163-center-toast',
  'this.navigate(options.actionScreen!)',
]) if (!toast.includes(token)) fail(`src/toast.ts missing ${token}`);

for (const token of [
  'v2.1.63: HUD/frontier gap trim, bigger top menu, centered toast, fishing loadout, inventory ledger, and dex scale polish.',
  '--v2163-aqua-card',
  '.v2097-expedition-board:not(.open)',
  'top: calc(env(safe-area-inset-top, 0px) + 66px) !important;',
  '.v2163-world-controls-aqua-lock',
  'grid-template-columns: repeat(2, 35px) !important;',
  'grid-auto-rows: 35px !important;',
  'gap: 4px !important;',
  'width: 35px !important;',
  'width: 23px !important;',
  'body:is(.v2097-expedition-open',
  '.village-world-screen:is(.v2097-build-tray-open',
  '#toast-root[data-v2163-center-toast="enabled-center-aqua-card-feedback"]',
  'place-items: center !important;',
  '.v2163-center-toast',
  '.v2163-fishing-loadout',
  '.v2163-loadout-cell',
  '.v2163-catch-ledger .recent-card',
  '-webkit-line-clamp: 2 !important;',
  '.v2163-sale-ledger .v2074-sale-grid article img',
  'max-width: 38px !important;',
  '.v2163-dex-fish-art',
  'max-width: 48px !important;',
]) if (!styles.includes(token)) fail(`src/styles.css missing ${token}`);

for (const token of [
  'HUD와 개척 바 사이의 빈 여백을 줄이고',
  '버튼을 35px, 아이콘을 23px',
  '건설 트레이와 개척 패널이 열린 상태에서는 우측 상단 마을 메뉴바가 사라지도록',
  '낚시 준비 화면에서 낚싯대/미끼 표기가 잘리지 않도록',
  '안내 토스트를 상단이 아니라 화면 중앙',
  '최근 포획 원장에서 긴 물고기명이 잘리지 않도록',
  '자동 판매 루프의 글자 범위 이탈과 물고기 이미지 과대 표시',
  '물고기 도감 카드의 물고기 이미지를 한 단계 더 줄여',
  '플레이어 8방향 32프레임',
  'poster 제거 상태',
  '## v2.1.62 변경사항',
]) if (!readme.includes(token)) fail(`README.md missing ${token}`);

if (/\[data-v\d{4}[^\]\s]+\s+data-v\d{4}[^\]]+\]/.test(main)) fail('invalid combined data attribute selector found in main.ts');
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
for (const role of npcRoles) for (const direction of directions) {
  const rel = `${npcDir}/${role}_${direction}.png`;
  assertFile(rel);
  if (fs.statSync(path.join(root, rel)).size <= 1024) fail(`NPC direction asset looks empty: ${rel}`);
}
if (!main.includes('shouldPlayOpening') || !main.includes('openingIntroShown')) fail('opening video first-start gating missing');
if (!main.includes('v2130-build-confirm') || !main.includes('data-v2130-build-confirm-apply')) fail('construction confirm flow missing');

console.log('[v2163] HUD/menu, fishing loadout, centered toast, inventory ledger, dex, direction, opening, and packaging guards passed');
