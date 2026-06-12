import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd();
function walk(dir) { let out=[]; for (const name of readdirSync(join(root, dir), { withFileTypes:true })) { const p=`${dir}/${name.name}`; if (name.isDirectory()) out=out.concat(walk(p)); else out.push(p); } return out; }
const files = walk('.').filter((p) => !p.includes('/.git/') && !p.includes('/node_modules/'));
const total = files.reduce((sum, p) => sum + statSync(join(root, p)).size, 0);
const docs = files.filter((p) => /(?:PATCH_NOTES|CHECKLIST|AUDIT|REPORT|GUIDE)/i.test(p));
const index = readFileSync(join(root, 'index.html'), 'utf8');
const refs = new Set([...index.matchAll(/assets\/(?:art|icons|images|atlas|ui-kit)\/[^'"\)\s]+/g)].map((m)=>m[0]));
console.log(JSON.stringify({ ok:true, totalFiles:files.length, totalBytes:total, docsAndAuditFiles:docs.length, referencedAssets:refs.size, cleanBundleHint:'For release zip, keep current docs only and remove legacy PATCH_NOTES/CHECKLIST files.' }, null, 2));
