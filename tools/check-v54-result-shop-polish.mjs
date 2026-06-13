import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd();
const read = (file) => readFileSync(join(root, file), 'utf8');
function fail(message) { console.error(`[check-v54] ${message}`); process.exit(1); }
const state = read('src/core/state.js');
const shop = read('src/systems/shop.js');
const runtime = read('src/runtime/v54-result-shop-polish.js');
const index = read('index.html');
const sw = read('sw.js');
const pkg = read('package.json');
if (!(state.includes("APP_VERSION = '5.4.0'") || state.includes("APP_VERSION = '5.5.0'") || state.includes("APP_VERSION = '5.5.1'") || state.includes("APP_VERSION = '5.5.2'") || state.includes("APP_VERSION = '5.5.5'") || state.includes("APP_VERSION = '5.6.0'") || state.includes("APP_VERSION = '5.6.1'") || state.includes("APP_VERSION = '5.7.0'") || state.includes("APP_VERSION = '5.8.0'") || state.includes("APP_VERSION = '5.9.0'")) || !state.includes('aqua_v5.4') || !state.includes('sellFish') || !state.includes('buyShopItem')) fail('state v5.4 shop/sell markers missing');
if (!shop.includes('createShopSystem') || !shop.includes('aqua-shop-v54-backdrop') || !shop.includes('panel_1.png') || !shop.includes('물고기 일괄 판매')) fail('shop system requirements missing');
if (!runtime.includes('createResultFlow') || !runtime.includes('aqua-result-v54-backdrop') || !runtime.includes('바로 판매') || !runtime.includes('다시 던지기') || !runtime.includes('CASUAL RESULT SHOP 5.4')) fail('result flow runtime markers missing');
if (!index.includes('v54-result-shop-polish.js') || !(index.includes("const APP_VERSION = '5.4.0'") || index.includes("const APP_VERSION = '5.5.0'") || index.includes("const APP_VERSION = '5.5.1'") || index.includes("const APP_VERSION = '5.5.2'") || index.includes("const APP_VERSION = '5.5.5'") || index.includes("const APP_VERSION = '5.6.0'") || index.includes("const APP_VERSION = '5.6.1'") || index.includes("const APP_VERSION = '5.7.0'") || index.includes("const APP_VERSION = '5.8.0'") || index.includes("const APP_VERSION = '5.9.0'"))) fail('index v5.4 marker missing');
if (!(sw.includes('aqua-fantasia-v5.4.0') || sw.includes('aqua-fantasia-v5.5.0') || sw.includes('aqua-fantasia-v5.5.1') || sw.includes('aqua-fantasia-v5.5.2') || sw.includes('aqua-fantasia-v5.5.5') || sw.includes('aqua-fantasia-v5.6.0') || sw.includes('aqua-fantasia-v5.6.1') || sw.includes('aqua-fantasia-v5.7.0')) || !sw.includes('./src/runtime/v54-result-shop-polish.js') || !sw.includes('./src/systems/shop.js')) fail('service worker v5.4 cache entries missing');
if (!pkg.includes('runtime54:check')) fail('package runtime54 script missing');
console.log('[check-v54] Result/shop polish OK');
