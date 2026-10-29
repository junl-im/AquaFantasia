import test from 'node:test';
import assert from 'node:assert/strict';
import { DEMO_FISH, createCast, hookFish, advanceRound, fishVisualSignal, rewardFor, reelAdvice } from '../src/v3/fishingEngine.ts';

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

test('all visual motions are finite, bounded, and tied to fish behavior', () => {
  const cues = new Set();
  for (const fish of DEMO_FISH) {
    let state = hookFish(waitForBite(createCast(fish, 19)));
    for (let i = 0; i < 95; i += 1) state = advanceRound(state, 0.05, false);
    const visual = fishVisualSignal(state);
    assert.deepEqual(visual, fishVisualSignal(state));
    for (const value of [visual.x, visual.y, visual.rotation, visual.intensity]) {
      assert.ok(Number.isFinite(value));
    }
    assert.ok(Math.abs(visual.x) <= 1);
    assert.ok(Math.abs(visual.y) <= 1);
    assert.ok(Math.abs(visual.rotation) <= 30);
    assert.ok(visual.intensity >= 0 && visual.intensity <= 1);
    cues.add(visual.cue);
  }
  assert.equal(cues.size, 6);
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

test('coaching has repeatable phase and tension advice for all fish behaviors', () => {
  for (const fish of DEMO_FISH) {
    const waiting = createCast(fish, 101, 2);
    assert.equal(reelAdvice(waiting).level, 'normal');
    let state = hookFish(waitForBite(waiting));
    assert.equal(reelAdvice(state).level, 'reel');
    const medium = { ...state, tension: 0.41, fightElapsed: 2.3 };
    assert.ok(['normal','ease'].includes(reelAdvice(medium).level));
    const high = { ...state, tension: 0.88 };
    assert.equal(reelAdvice(high).level, 'danger');
    assert.match(reelAdvice(high).message, /손을 떼/);
    assert.deepEqual(reelAdvice(medium), reelAdvice(medium));
    assert.equal(reelAdvice({ ...state, phase: 'landed' }).level, 'normal');
  }
});
test('surging fish progress more slowly during a strong pull than passive fish', () => {
  const boss = DEMO_FISH.find(f => f.behavior === 'boss');
  const steady = DEMO_FISH.find(f => f.behavior === 'steady');
  let b = hookFish(waitForBite(createCast(boss, 1, 3)));
  let c = hookFish(waitForBite(createCast(steady, 1, 3)));
  b = { ...b, fightElapsed: 0, tension: .2 };
  c = { ...c, fightElapsed: 0, tension: .2 };
  const nextBoss = advanceRound(b, .05, true);
  const nextSteady = advanceRound(c, .05, true);
  assert.ok(nextBoss.progress > 0 && nextSteady.progress > 0);
  assert.ok(nextBoss.progress < nextSteady.progress);
});
