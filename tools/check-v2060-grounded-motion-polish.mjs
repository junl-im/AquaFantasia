import { readFileSync } from 'node:fs';

const village = readFileSync('src/villageWorld.ts', 'utf8');
const main = readFileSync('src/main.ts', 'utf8');
const styles = readFileSync('src/styles.css', 'utf8');
const data = readFileSync('src/data.ts', 'utf8');

function assert(condition, message) {
  if (!condition) {
    console.error(`[v2060] ${message}`);
    process.exit(1);
  }
}

assert(/APP_VERSION = '2\.0\.(60|6[1-9]|[7-9][0-9])'/.test(data), 'APP_VERSION must preserve the v2060 grounded-motion lineage.');
assert(data.includes('aqua-fantasia-v2.0.') && /grounded-motion-polish|loop-ui-button-audit|ground-contact-motion-audit/.test(data), 'cache key must preserve grounded-motion or later lineage.');
assert(village.includes("dataset.v2060GroundedMotionPolish = 'no-floating-grounded-footstep-motion'"), 'VillageWorld must expose the v2060 grounded motion marker.');
assert(main.includes('v2060-grounded-motion-village-screen'), 'village root must include v2060 grounded motion class.');
assert(styles.includes('v2.0.60 grounded motion correction'), 'styles must include v2.0.60 grounded motion marker.');
assert(village.includes('actor.body.position.y = actor.groundOffset;') || village.includes('actor.body.position.y = 0;'), 'actor body Y must stay anchored to the foot point or bottom padding offset.');
assert(!village.includes('const bob = walking ? Math.abs(Math.sin(actor.walkPhase)) * -5.4 : 0;'), 'old airborne actor bob must be removed.');
assert(!village.includes('item.position.set(base.x, base.y - Math.abs(Math.sin(phase * 1.45)) * rise);'), 'steam/cookingPot container must not lift away from the tile.');
assert(village.includes('Only the smoke puffs drift upward'), 'steam motion must be visual puff-only, not object lift.');
assert(village.includes('item.position.set(base.x + groundSlide, base.y);') || village.includes('const tileSlope = groundSlide * 0.18;'), 'pet movement must stay grounded without vertical bobbing.');
assert(village.includes('item.zIndex = Math.round((base.y / TILE_H) * 20 + 12);'), 'pet z-index must stay stable from base tile Y.');
console.log('[v2060] grounded motion polish checks passed.');
