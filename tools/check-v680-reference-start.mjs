import fs from 'node:fs';
const fail = (msg) => { console.error(`[check-v680] ${msg}`); process.exit(1); };
const must = (path) => { if (!fs.existsSync(path)) fail(`missing ${path}`); return fs.readFileSync(path, 'utf8'); };
const main = must('src/main.ts');
const css = must('src/styles.css');
const data = must('src/data.ts');
const sw = must('public/sw.js');
const pkg = JSON.parse(must('package.json'));
for (const file of ['public/assets/screens/start_screen_reference.webp','public/assets/screens/start_screen_reference.png','public/assets/ui/button_cast_clean.png','public/assets/ui/button_cast_yellow_clean.png','public/assets/ui/badge_combo_clean.png']) { if (!fs.existsSync(file)) fail(`missing ${file}`); }
for (const token of ['start-art-screen','start-hotspot','hit-depart','hit-server','hit-shop']) if (!main.includes(token)) fail(`main missing ${token}`);
for (const token of ['찌 던지기','button_cast_clean.png','button_cast_yellow_clean.png']) if (!main.includes(token) && !css.includes(token)) fail(`runtime/style missing ${token}`);
if (main.includes('alt="CAST"')) fail('legacy cropped CAST image is still wired');
if (!data.includes('6.8.0') || !data.includes('aqua-fantasia-v6.8.0-reference-start-fishing-cleanup')) fail('v6.8 data/cache missing');
if (!sw.includes('start_screen_reference.webp')) fail('start art is not precached');
if (pkg.version !== '6.8.0') fail('package version must be 6.8.0');
console.log('[check-v680] Reference start screen + clean fishing controls OK');
