import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
let ok = true;
const fail = (msg) => { console.error('[validate-clean]', msg); ok = false; };
const required = [
  'index.html','src/main.ts','src/core/PortraitGuard.ts','src/styles.css','src/data.ts','src/storage.ts','src/audio.ts','src/toast.ts',
  'public/sw.js','public/manifest.webmanifest','public/assets/v12/screens/start_screen_clean_v810.webp','public/assets/v13/compositions/town.webp','public/assets/v13/compositions/fishing.webp','public/assets/v13/compositions/gear.webp','public/assets/v13/compositions/inventory.webp','public/assets/v13/compositions/dex.webp','public/assets/v13/compositions/shop.webp','public/assets/v13/compositions/mission.webp','public/assets/v13/compositions/ranking.webp','public/assets/v12/bg/ocean_portrait.webp','public/assets/v12/characters/chibi_fisher_01.png','public/assets/v12/fish/fish_01.png','public/assets/ui/v750_button_gold.png','public/assets/ui/v750_keep_on.png',
  'public/assets/v9/ui/bottom_nav_bar_deepblue.png','public/assets/v12/characters/chibi_fisher_01.png','public/assets/v12/bg/ocean_portrait.webp','public/assets/v12/fish/fish_01.png',
  'public/assets/art/player_boat.png','public/assets/art/fishing_float.png','public/assets/art/gauge_frame.png','public/assets/art/fish_slot.png',
  'public/assets/art/bg_user_ocean.webp','public/assets/dex/v740_fish_01.png','.github/workflows/pages.yml'
];
for (const file of required) if (!fs.existsSync(path.join(root,file))) fail(`missing ${file}`);
function walk(dir,out=[]) { if (!fs.existsSync(dir)) return out; for (const e of fs.readdirSync(dir,{withFileTypes:true})) { if (['.git','node_modules','dist'].includes(e.name)) continue; const f=path.join(dir,e.name); if (e.isDirectory()) walk(f,out); else out.push(f); } return out; }
const forbiddenText = ['v5.1 Stability Assist','STACK SAFE','Node24 OK','Firebase 익명 연동','QUICK ACTION','고퀄리티 원화풍 바다에서 시작하는 모바일 캐주얼 낚시'];
for (const file of walk(root)) {
  const rel = path.relative(root,file).replaceAll('\\','/');
  if (/AquaFantasia_v\d/i.test(rel)) fail(`legacy html/zip-style file remains: ${rel}`);
  if (/\.(html|ts|css|js|json|md|yml|yaml)$/.test(rel)) {
    const t=fs.readFileSync(file,'utf8');
    for (const word of forbiddenText) if (t.includes(word)) fail(`forbidden legacy text '${word}' in ${rel}`);
  }
}
const index = fs.readFileSync(path.join(root,'index.html'),'utf8');
if (!index.includes('/src/main.ts')) fail('index.html is not using Vite TypeScript entry');
if (!index.includes('아쿠아 판타지아')) fail('Korean title is missing');
const data = fs.readFileSync(path.join(root,'src/data.ts'),'utf8');
if (!data.includes("APP_VERSION = '8.3.0'")) fail('APP_VERSION is not 8.3.0');
if (!data.includes('aqua-fantasia-v8.3.0-ui-polish-audit')) fail('CACHE_NAME mismatch');
const pkg = JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
if (pkg.version !== '8.3.0') fail('package version mismatch');
for (const dep of ['pixi.js','howler','firebase']) if (!pkg.dependencies?.[dep]) fail(`missing dependency ${dep}`);
const manifest = fs.readFileSync(path.join(root,'public/manifest.webmanifest'),'utf8');
if (!manifest.includes('portrait-primary')) fail('manifest must force portrait-primary');
const main = fs.readFileSync(path.join(root,'src/main.ts'),'utf8');
for (const token of ['installBackNavigationGuard','showBiteCallout','requestHardPortraitLock','inapp-css-only','start_screen_clean_v810']) if (!main.includes(token) && !fs.readFileSync(path.join(root,'src/core/PortraitGuard.ts'),'utf8').includes(token)) fail(`missing runtime token ${token}`);
if (!ok) process.exit(1);
console.log('[validate-clean] Aqua Fantasia v8.3.0 ui polish audit OK');
console.log(JSON.stringify({ ok:true, version:'8.3.0', files: walk(root).length }, null, 2));
