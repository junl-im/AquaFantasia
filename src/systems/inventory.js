// Inventory system extraction target.
export function isSellCandidate(fish) { return !!fish && !fish.isBoss && Number(fish.rarity || 1) <= 2; }
