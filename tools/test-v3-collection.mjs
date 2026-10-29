import test from 'node:test';
import assert from 'node:assert/strict';
import { DEMO_FISH, createCast, hookFish, advanceRound } from '../src/v3/fishingEngine.ts';
import { V3_COLLECTION_KEY, emptyCollection, parseCollection, measureCatch, collectCatch, discoveredSpecies, totalCatches } from '../src/v3/collection.ts';

function land(fish = DEMO_FISH[0], seed = 17) {
  let round = createCast(fish, seed);
  for (let i = 0; i < 100 && round.phase === 'waiting'; i += 1) round = advanceRound(round, 0.05, false);
  round = hookFish(round);
  let holding = true;
  for (let i = 0; i < 1800 && round.phase === 'fighting'; i += 1) {
    if (round.tension > 0.68) holding = false;
    if (round.tension < 0.22) holding = true;
    round = advanceRound(round, 0.05, holding);
  }
  assert.equal(round.phase, 'landed');
  return round;
}

test('catch measurement is deterministic and limited to landed rounds', () => {
  const landed = land(DEMO_FISH[1], 100);
  assert.deepEqual(measureCatch(landed), measureCatch(landed));
  assert.ok(measureCatch(landed).lengthCm > 0);
  assert.throws(() => measureCatch(createCast(DEMO_FISH[1], 100)), /Only landed/);
});

test('first catch discovers a species, rewards coins, and leaves prior state immutable', () => {
  const initial = emptyCollection();
  const { state, result } = collectCatch(initial, land());
  assert.equal(discoveredSpecies(initial), 0);
  assert.equal(discoveredSpecies(state), 1);
  assert.equal(totalCatches(state), 1);
  assert.equal(result.firstDiscovery, true);
  assert.equal(result.newSizeRecord, true);
  assert.ok(result.earnedCoins >= 50);
  assert.equal(state.coins, result.earnedCoins);
  assert.deepEqual(initial, emptyCollection());
});

test('repeat catches preserve best length, highest rarity and total captures', () => {
  const a = collectCatch(emptyCollection(), land(DEMO_FISH[0], 2));
  const b = collectCatch(a.state, land(DEMO_FISH[0], 19));
  assert.equal(discoveredSpecies(b.state), 1);
  assert.equal(totalCatches(b.state), 2);
  assert.ok(b.state.records.bubble.bestLengthCm >= a.state.records.bubble.bestLengthCm);
  assert.ok(b.state.coins > a.state.coins);
});

test('six species fill the dex and survive validated JSON round-trip', () => {
  let state = emptyCollection();
  for (const fish of DEMO_FISH) state = collectCatch(state, land(fish, 21)).state;
  assert.equal(discoveredSpecies(state), 6);
  assert.equal(totalCatches(state), 6);
  assert.deepEqual(parseCollection(JSON.stringify(state)), state);
});

test('corrupted and foreign records never populate or crash the V3 dex', () => {
  assert.deepEqual(parseCollection('not-json'), emptyCollection());
  assert.deepEqual(parseCollection('{"version":9}'), emptyCollection());
  assert.deepEqual(parseCollection(null), emptyCollection());
  const forged = JSON.stringify({ version: 1, coins: -100, records: {
    bubble: { count: 2, bestLengthCm: 13.2, rarest: 'rare' },
    unknown: { count: 999, bestLengthCm: 12, rarest: 'legendary' },
    lake: { count: 1e100, bestLengthCm: 13, rarest: 'legendary' },
  } });
  const clean = parseCollection(forged);
  assert.equal(clean.coins, 0);
  assert.equal(discoveredSpecies(clean), 1);
  assert.deepEqual(Object.keys(clean.records), ['bubble']);
});

test('V3 collection storage key is isolated from legacy save namespaces', () => {
  assert.match(V3_COLLECTION_KEY, /^aquafantasia:v3:/);
});
