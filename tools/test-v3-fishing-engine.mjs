import test from 'node:test';
import assert from 'node:assert/strict';
import { DEMO_FISH, createCast, hookFish, advanceRound, rewardFor } from '../src/v3/fishingEngine.ts';

function waitForBite(round) {
  let state = round;
  for (let i = 0; i < 100 && state.phase === 'waiting'; i += 1) {
    state = advanceRound(state, 0.05, false);
  }
  assert.equal(state.phase, 'bite');
  return state;
}

test('six distinct fish behaviors and deterministic opening', () => {
  assert.equal(DEMO_FISH.length, 6);
  assert.equal(new Set(DEMO_FISH.map((fish) => fish.behavior)).size, 6);
  assert.deepEqual(createCast(DEMO_FISH[0], 42), createCast(DEMO_FISH[0], 42));
});

test('baiting and bite timeout have explicit transitions', () => {
  const initial = createCast(DEMO_FISH[0], 5);
  assert.equal(hookFish(initial), initial);
  let state = waitForBite(initial);
  state = hookFish(state);
  assert.equal(state.phase, 'fighting');
  assert.equal(rewardFor(state), 0);

  state = waitForBite(createCast(DEMO_FISH[0], 5));
  for (let i = 0; i < 100 && state.phase === 'bite'; i += 1) {
    state = advanceRound(state, 0.05, false);
  }
  assert.equal(state.phase, 'escaped');
  assert.equal(state.reason, 'missed');
});

test('holding reels; releasing lowers tension and stops progress', () => {
  const state = hookFish(waitForBite(createCast(DEMO_FISH[0], 7)));
  const holding = advanceRound(state, 0.1, true);
  const released = advanceRound(holding, 0.1, false);
  assert.ok(holding.progress > state.progress);
  assert.ok(released.progress <= holding.progress);
  assert.ok(released.tension < holding.tension);
});

test('continuously holding without releasing snaps the line', () => {
  let state = hookFish(waitForBite(createCast(DEMO_FISH[5], 1)));
  for (let i = 0; i < 1000 && state.phase === 'fighting'; i += 1) {
    state = advanceRound(state, 0.05, true);
  }
  assert.equal(state.phase, 'escaped');
  assert.equal(state.reason, 'snapped');
});

for (const fish of DEMO_FISH) {
  test(`adaptive reel strategy can land ${fish.name}`, () => {
    let state = hookFish(waitForBite(createCast(fish, 23)));
    let holding = true;
    for (let i = 0; i < 1800 && state.phase === 'fighting'; i += 1) {
      if (state.tension > 0.68) holding = false;
      if (state.tension < 0.22) holding = true;
      state = advanceRound(state, 0.05, holding);
    }
    assert.equal(state.phase, 'landed', `${fish.name}: ${state.reason}, progress ${state.progress}`);
    assert.ok(rewardFor(state) >= fish.reward);
  });
}

test('invalid frame durations cannot corrupt game state', () => {
  const initial = createCast(DEMO_FISH[0], 1);
  assert.equal(advanceRound(initial, Number.NaN, true), initial);
  assert.equal(advanceRound(initial, -1, true), initial);
  assert.ok(advanceRound(initial, 100, true).elapsed <= 0.1);
});
