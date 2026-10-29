import test from 'node:test';
import assert from 'node:assert/strict';
import { DEMO_FISH, createCast, advanceRound, hookFish } from '../src/v3/fishingEngine.ts';
import { collectCatch, emptyCollection, parseCollection, totalCatches, discoveredSpecies } from '../src/v3/collection.ts';

/** Deterministic stress exercise across all fish, rod levels and varied seeds. */
test('all species pass 24 adaptive catches each, preserving rewards and reload integrity', () => {
  let collection = emptyCollection();
  let completed = 0;
  for (const fish of DEMO_FISH) {
    for (let rod = 1; rod <= 4; rod += 1) {
      for (let trial = 0; trial < 6; trial += 1) {
        let round = createCast(fish, Math.imul(rod * 37 + trial * 13 + completed + 1, 0x9e3779b1) >>> 0, rod);
        for (let i = 0; i < 120 && round.phase === 'waiting'; i += 1) {
          round = advanceRound(round, .05, false);
        }
        assert.equal(round.phase, 'bite', fish.name + ': missed bite after simulation');
        round = hookFish(round);
        let holding = true;
        for (let i = 0; i < 1800 && round.phase === 'fighting'; i += 1) {
          if (round.tension > .68) holding = false;
          if (round.tension < .22) holding = true;
          round = advanceRound(round, .05, holding);
          if (i % 25 === 0) {
            assert.ok(Number.isFinite(round.tension) && round.tension >= 0 && round.tension < 1.1);
            assert.ok(Number.isFinite(round.progress) && round.progress >= 0 && round.progress <= 1);
            assert.ok(Number.isFinite(round.fightElapsed));
          }
        }
        assert.equal(round.phase, 'landed',
          fish.name + ' Lv.' + rod + ' #'+trial+' => '+round.phase+'/'+round.reason);
        const output = collectCatch(collection, round);
        assert.ok(output.result.earnedCoins > 0);
        collection = output.state;
        completed += 1;
        if (completed % 12 === 0) {
          const restored = parseCollection(JSON.stringify(collection));
          assert.deepEqual(restored, collection, 'V3 JSON state must survive restart');
          collection = restored;
        }
      }
    }
  }
  const totalTrials = DEMO_FISH.length * 4 * 6;
  assert.equal(completed, totalTrials);
  assert.equal(totalCatches(collection), totalTrials);
  assert.equal(discoveredSpecies(collection), DEMO_FISH.length);
  assert.ok(collection.coins >= totalTrials);
});

test('reel fatigue and motion never advance a finalized round', () => {
  let round = createCast(DEMO_FISH[0], 47, 2);
  for(let i=0;i<150 && round.phase==='waiting';i++) round=advanceRound(round,.05,false);
  round=hookFish(round);
  while(round.phase==='fighting') round=advanceRound(round,.05,round.tension < .65);
  assert.equal(round.phase,'landed');
  assert.equal(advanceRound(round,.1,true),round);
  assert.equal(advanceRound(round,.1,false),round);
});
