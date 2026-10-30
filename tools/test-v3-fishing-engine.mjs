import test from 'node:test';
import assert from 'node:assert/strict';
import { DEMO_FISH, createCast, hookFish, advanceRound, bossFinalStand, bossFinalState, fightImpact, fishVisualSignal, rewardFor, reelAdvice } from '../src/v3/fishingEngine.ts';

function waitForBite(round) {
  let state = round;
  for (let i = 0; i < 100 && state.phase === 'waiting'; i += 1) {
    state = advanceRound(state, 0.05, false);
  }
  assert.equal(state.phase, 'bite');
  return state;
}

test('twelve unique fish and six behavior archetypes stay deterministic', () => {
  assert.equal(DEMO_FISH.length, 12);
  assert.equal(new Set(DEMO_FISH.map((fish) => fish.id)).size, 12);
  assert.equal(new Set(DEMO_FISH.map((fish) => fish.image)).size, 12);
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

test('drag brake levels lower buildup from the same heavy fish without eliminating risk', () => {
  const fish = DEMO_FISH.find(f => f.behavior === 'boss');
  const low = createCast(fish, 67, 2, 1), high = createCast(fish, 67, 2, 3);
  assert.equal(low.brakeLevel, 1);
  assert.equal(high.brakeLevel, 3);
  const baseline = {...hookFish({...low,phase:'bite'}),tension:0.22, fightElapsed:1.1};
  const improved = {...baseline, brakeLevel:3};
  const a = advanceRound(baseline,0.05,true);
  const b = advanceRound(improved,0.05,true);
  assert.ok(b.tension < a.tension,'brake should reduce load');
  assert.equal(b.progress,a.progress,'brake should not magically change reel speed');
  assert.equal(createCast(fish,67,2,9).brakeLevel,3,'invalid high levels clamp');
  assert.equal(createCast(fish,67,2,NaN).brakeLevel,1,'invalid values fall back');
  assert.ok(b.tension>baseline.tension,'brake does not remove the need to release');
});

test('fish impact is a deterministic physical pull cue, not a random overlay', () => {
  const rush = DEMO_FISH.find(f => f.behavior === 'boss');
  const fish = hookFish({...createCast(rush, 19), phase:'bite'});
  const statuses=new Set();
  const active=[];
  const silent=[];
  for(let i=0;i<230;i++){
    const r={...fish,fightElapsed:i*.05};
    const cue=fightImpact(r);
    const visual=fishVisualSignal(r);
    assert.ok(Number.isFinite(cue.strength));
    assert.ok(cue.strength>=0&&cue.strength<=1);
    assert.equal(cue.strength,visual.intensity);
    assert.deepEqual(fightImpact(r),cue);
    statuses.add(cue.active);
    (cue.active?active:silent).push(cue.strength);
  }
  assert.deepEqual([...statuses].sort(),[false,true]);
  assert.ok(Math.min(...active)>=0.57);
  assert.ok(Math.max(...silent)<0.57);
  assert.equal(fightImpact(createCast(rush,2)).active,false);
  const heavy=DEMO_FISH.find(f=>f.behavior==='heavy');
  assert.equal(fightImpact({...fish,fish:heavy}).active,false);
});

test('final stand activates only on late boss fights and follows actual pull strength', () => {
  const boss=DEMO_FISH.find(f=>f.behavior==='boss');
  const normal=DEMO_FISH.find(f=>f.behavior==='steady');
  // Sample the short crystal burst, not the recovery interval.
  const active={...hookFish({...createCast(boss,71,3,2),phase:'bite'}),progress:0.78,tension:0.32,fightElapsed:0.1};
  assert.equal(bossFinalState(active).phase,'surge');
  assert.equal(bossFinalStand({...active,progress:0.779}),false);
  assert.equal(bossFinalStand(active),true);
  assert.equal(bossFinalStand({...active,fish:normal}),false);
  assert.equal(bossFinalStand({...active,phase:'landed'}),false);
  assert.equal(fightImpact(active).lastStand,true);
  assert.equal(fightImpact({...active,progress:0.779}).lastStand,false);
  const before={...active,progress:0.779};
  const a=advanceRound(before,.05,true),b=advanceRound(active,.05,true);
  assert.ok(b.tension>a.tension,'final boss pull should raise tension more strongly');
  assert.ok((b.progress-active.progress)<(a.progress-before.progress),'final phase should resist reeling');
  assert.equal(reelAdvice({...active,tension:0.54}).level,'ease');
  assert.match(reelAdvice({...active,tension:0.54}).title,/최후의 압박|막판 장력/);
  assert.match(reelAdvice({...active,tension:0.42}).title,/최후의 저항|감기 기회/);
  assert.ok(advanceRound({...active,tension:0.55},.05,false).tension<0.55,'letting go should ease final tension');
});

test('result state never marks a finished boss as still in final combat',()=>{
  const boss=DEMO_FISH.find(f=>f.behavior==='boss');
  const initial={...createCast(boss,2),phase:'fighting',progress:0.85};
  assert.equal(fightImpact(initial).lastStand,true);
  for(const phase of ['landed','escaped','waiting','bite']) {
    assert.equal(fightImpact({...initial,phase}).lastStand,false);
    assert.equal(bossFinalStand({...initial,phase}),false);
  }
});

test('blue jewel and leviathan use different deterministic boss pulses and recoveries', () => {
  const king = DEMO_FISH.find(f=>f.id==='king');
  const leviathan = DEMO_FISH.find(f=>f.id==='leviathan');
  const make = (fish,t) => ({...hookFish({...createCast(fish,29,3,2),phase:'bite'}),
    progress:0.84,tension:0.28,fightElapsed:t});
  const tally = (fish) => {
    const states=Array.from({length:160},(_,i)=>bossFinalState(make(fish,i*.05)));
    assert.ok(states.some(x=>x.phase==='surge'));
    assert.ok(states.some(x=>x.phase==='recover'));
    assert.ok(states.every(x=>x.pressure>=0 && x.pressure<0.2));
    const count=states.reduce((total,s,i)=>total+(i>0&&s.phase==='surge'&&states[i-1].phase!=='surge'?1:0),0);
    return {states,count};
  };
  const a=tally(king),b=tally(leviathan);
  assert.equal(a.states[0].pattern,'crystal-flurry');
  assert.equal(b.states[0].pattern,'abyss-undertow');
  assert.ok(a.count>b.count,'crystal bursts should be shorter and more frequent');
  assert.ok(a.states.some(s=>s.label.includes('수정')));
  assert.ok(b.states.some(s=>s.label.includes('심해')));
  assert.deepEqual(bossFinalState(make(leviathan,2.8)),bossFinalState(make(leviathan,2.8)));
  assert.equal(bossFinalState({...make(leviathan,3),progress:0.77}).pattern,'none');
});

test('boss surge has more pull and less reel progress than its recovery window',()=>{
  const boss=DEMO_FISH.find(f=>f.id==='leviathan');
  const make=(time)=>({...hookFish({...createCast(boss,51,2,2),phase:'bite'}),
    progress:0.82,tension:0.25,fightElapsed:time});
  const surge = Array.from({length:100},(_,i)=>make(i*.05)).find(r=>bossFinalState(r).phase==='surge');
  const recover = Array.from({length:100},(_,i)=>make(i*.05)).find(r=>bossFinalState(r).phase==='recover');
  assert.ok(surge && recover);
  const a=advanceRound(surge,.05,true), b=advanceRound(recover,.05,true);
  assert.ok(a.tension-surge.tension > b.tension-recover.tension);
  assert.ok(a.progress-surge.progress < b.progress-recover.progress);
  const easing=advanceRound({...surge,tension:0.68},.05,false);
  assert.ok(easing.tension<0.68,'player can always recover by releasing the reel');
});
