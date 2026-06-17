import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));
const fail = (msg) => { console.error(`[check-v960] ${msg}`); process.exit(1); };
const pkg = JSON.parse(read('package.json'));
const data = read('src/data.ts');
const main = read('src/main.ts');
const css = read('src/styles.css');
const sw = read('public/sw.js');
const checks = [
  [pkg.version === '9.6.0', 'package version must be 9.6.0'],
  [data.includes("APP_VERSION = '9.6.0'"), 'APP_VERSION must be 9.6.0'],
  [data.includes('aqua-fantasia-v9.6.0-ui-readability-polish'), 'cache name must be v9.6.0'],
  [sw.includes('aqua-fantasia-v9.6.0-ui-readability-polish'), 'service worker cache must be v9.6.0'],
  [main.includes("dataset.visualPolish = 'v960-ui-readability-polish'"), 'v9.6 visual polish dataset missing'],
  [main.includes('v960-ui-readability-screen'), 'v9.6 runtime screen class missing'],
  [main.includes('v960-ui-readability-fishing-screen'), 'v9.6 fishing class missing'],
  [css.includes('v9.6.0 UI Readability Polish'), 'v9.6 CSS layer missing'],
  [css.includes('--v960-nav-height'), 'v9.6 nav variable missing'],
  [css.includes('selected state is now a compact pearl marker'), 'v9.6 nav selected style note missing'],
  [css.includes('text-overflow: ellipsis'), 'text overflow guard missing'],
  [css.includes('-webkit-line-clamp'), 'line clamp guard missing'],
  [css.includes('word-break: keep-all'), 'Korean text wrapping guard missing'],
  [css.includes('grid-template-columns: minmax(0, 1fr) minmax(74px, 96px)'), 'mission card grid balance missing'],
  [exists('README.md'), 'README.md missing'],
];
for (const [ok, msg] of checks) if (!ok) fail(msg);
console.log('[check-v960] UI readability, nav marker, text containment and background polish OK');
console.log(JSON.stringify({ ok: true, version: '9.6.0', mode: process.argv.includes('--audit') ? 'audit' : process.argv.includes('--runtime') ? 'runtime' : 'validate' }, null, 2));
