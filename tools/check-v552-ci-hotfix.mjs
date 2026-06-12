import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd();
const read = (file) => readFileSync(join(root, file), 'utf8');
const exists = (file) => { try { statSync(join(root, file)); return true; } catch { return false; } };
function fail(message) { console.error(`[check-v552] ${message}`); process.exit(1); }

const required = [
  '.github/workflows/aqua-static-validate.yml',
  'src/runtime/v552-ci-runtime-guard.js',
  'tools/check-v552-ci-hotfix.mjs',
  'PATCH_NOTES_v5.5.2.md',
  'V5_5_2_RUNTIME_CI_HOTFIX_CHECKLIST.md',
  'reports/v5.5.2-runtime-ci-hotfix-audit.md',
];
required.forEach((file) => { if (!exists(file)) fail(`missing ${file}`); });

const workflow = read('.github/workflows/aqua-static-validate.yml');
const index = read('index.html');
const sw = read('sw.js');
const runtime = read('src/runtime/v552-ci-runtime-guard.js');
const validate = read('tools/validate-static.mjs');
const pkg = read('package.json');
const state = read('src/core/state.js');

if (!workflow.includes('actions/checkout@v6') || !workflow.includes('actions/setup-node@v6')) fail('workflow must use Node 24 compatible official actions v6');
if (!workflow.includes('FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true') || !workflow.includes("node-version: '24'")) fail('workflow Node 24 migration markers missing');
if (!workflow.includes('package-manager-cache: false') || !workflow.includes('npm install')) fail('workflow npm install/cache guard missing');
if (!index.includes('v552-ci-runtime-guard.js?v=5.5.2') || !index.includes('v5.5.2 Runtime & CI Hotfix')) fail('index v5.5.2 runtime/metadata missing');
if (!sw.includes('aqua-fantasia-v5.5.2-runtime-ci-hotfix-20260612') || !sw.includes('./src/runtime/v552-ci-runtime-guard.js')) fail('service worker v5.5.2 cache entries missing');
if (!runtime.includes('AquaFantasiaV552') || !runtime.includes('clearCaches') || !runtime.includes('unhandledrejection') || !runtime.includes('Node24 OK')) fail('v5.5.2 runtime guard markers missing');
if (!validate.includes("APP_VERSION must be v5.5.x") || !validate.includes('v552-ci-runtime-guard.js')) fail('validate-static v5.5.2 tolerance missing');
if (!pkg.includes('runtime552:check') || !pkg.includes('check-v552-ci-hotfix.mjs')) fail('package v5.5.2 script missing');
if (!state.includes("APP_VERSION = '5.5.2'") || !state.includes('aqua_v5.5.2')) fail('state v5.5.2 markers missing');
console.log('[check-v552] runtime + CI hotfix OK');
