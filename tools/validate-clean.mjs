import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
let ok = true;
const fail = (msg) => { console.error('[validate-clean]', msg); ok = false; };
const required = [
  'index.html','README.md','package.json','src/main.ts','src/core/PortraitGuard.ts','src/styles.css','src/data.ts','src/storage.ts','src/audio.ts','src/toast.ts',
  'public/sw.js','public/manifest.webmanifest','.github/workflows/pages.yml',
  'public/assets/v85/screens/start_screen_clean_v810.webp','public/assets/v85/compositions/town.webp','public/assets/v85/bg/ocean_full.webp','public/assets/v85/characters/chibi_fisher_01_hd.png','public/assets/v85/fish/fish_01.png',
  'public/assets/v87/characters/fisher_boat_crisp.png','public/assets/v87/ui/bottom_nav_hd.png','public/assets/v87/ui/recent_panel_hd.png','public/assets/v87/ui/reel_panel_hd.png','public/assets/v87/ui/tab_blue_hd.png','public/assets/v87/ui/tab_gold_hd.png'
];
for (const file of required) if (!fs.existsSync(path.join(root,file))) fail(`missing ${file}`);
function walk(dir, out=[]) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir,{withFileTypes:true})) {
    if (['.git','node_modules','dist'].includes(e.name)) continue;
    const f=path.join(dir,e.name);
    if (e.isDirectory()) walk(f,out); else out.push(f);
  }
  return out;
}
for (const file of walk(root)) {
  const rel = path.relative(root,file).replaceAll('\\','/');
  if (/^(CLEAN_REPLACE_GUIDE|FINAL_CONSOLIDATED|PATCH_NOTES|PROMPTS_DALLE_ASSETS)_/i.test(rel)) fail(`legacy top-level patch md remains: ${rel}`);
  if (/AquaFantasia_v\d/i.test(rel)) fail(`legacy zip/html-style file remains: ${rel}`);
}
const data = fs.readFileSync(path.join(root,'src/data.ts'),'utf8');
if (!data.includes("APP_VERSION = '8.7.0'")) fail('APP_VERSION is not 8.7.0');
if (!data.includes('aqua-fantasia-v8.7.0-immersive-exit-hd-ui')) fail('CACHE_NAME mismatch');
const pkg = JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
if (pkg.version !== '8.7.0') fail('package version mismatch');
for (const dep of ['pixi.js','howler','firebase']) if (!pkg.dependencies?.[dep]) fail(`missing dependency ${dep}`);
const guard = fs.readFileSync(path.join(root,'src/core/PortraitGuard.ts'),'utf8');
if (guard.includes('requestFullscreen(')) fail('requestFullscreen must not be used');
if (guard.includes('orientation.lock')) fail('screen orientation lock must not be used');
const manifest = JSON.parse(fs.readFileSync(path.join(root,'public/manifest.webmanifest'),'utf8'));
if (manifest.display !== 'fullscreen') fail('manifest display must be fullscreen for installed PWA mode');
if (manifest.orientation !== 'portrait-primary') fail('manifest must keep portrait-primary');
if (!ok) process.exit(1);
console.log('[validate-clean] Aqua Fantasia v8.7.0 clean single README package OK');
console.log(JSON.stringify({ ok:true, version:'8.7.0', files: walk(root).length }, null, 2));
