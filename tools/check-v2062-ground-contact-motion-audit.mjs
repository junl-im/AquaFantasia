import { readFileSync } from 'node:fs';

const village = readFileSync('src/villageWorld.ts', 'utf8');
const main = readFileSync('src/main.ts', 'utf8');
const styles = readFileSync('src/styles.css', 'utf8');
const data = readFileSync('src/data.ts', 'utf8');
const pkg = readFileSync('package.json', 'utf8');
const sw = readFileSync('public/sw.js', 'utf8');

function assert(condition, message) {
  if (!condition) {
    console.error(`[v2062] ${message}`);
    process.exit(1);
  }
}

assert(/APP_VERSION = '2\.0\.(?:6[2-9]|[7-9]\d)'/.test(data), 'APP_VERSION must be v2.0.62 or later.');
assert(/aqua-fantasia-v2\.0\.(?:6[2-9]|[7-9]\d)-/.test(data), 'cache key must use v2.0.62 or later.');
assert(/aqua-fantasia-v2\.0\.(?:6[2-9]|[7-9]\d)-/.test(sw), 'service worker cache key must be v2.0.62 or later.');
assert(pkg.includes('check-v2062-ground-contact-motion-audit.mjs'), 'validate script must include v2062 guard.');
assert(main.includes("dataset.v2062GroundContactMotionAudit = 'v2062-shadow-foot-contact-motion-audit'"), 'global v2062 dataset marker missing.');
assert(main.includes('v2062-ground-contact-village-screen'), 'village screen must include v2062 ground-contact class.');
assert(village.includes("dataset.v2062GroundContactAudit = 'shadow-foot-contact-no-floating-motion'"), 'VillageWorld v2062 marker missing.');
assert(village.includes('function actorSpriteGroundOffset'), 'actor texture bottom padding helper missing.');
assert(village.includes('function decorationSpriteGroundOffset'), 'decoration bottom padding helper missing.');
assert(village.includes('footContact: Graphics;'), 'actor foot contact marker must be part of Actor.');
assert(village.includes('node.addChild(shadow, footContact, body, label)'), 'actor render stack must keep shadow/feet/body/label order.');
assert(village.includes('actor.body.position.y = actor.groundOffset;'), 'actor body must keep the visual foot offset, not float above the tile.');
assert(village.includes('item.position.set(base.x + groundSlide, base.y);'), 'pet movement must not add a Y bob/slope that reads as floating.');
assert(!village.includes('const tileSlope = groundSlide * 0.18;'), 'old pet tileSlope Y offset must be removed.');
assert(!village.includes('actor.body.position.y = 0;'), 'old actor zero-offset placement must be replaced by groundOffset.');
assert(styles.includes('v2.0.62 shadow-foot contact motion audit'), 'v2062 CSS marker missing.');
console.log('[v2062] ground-contact motion audit checks passed.');
