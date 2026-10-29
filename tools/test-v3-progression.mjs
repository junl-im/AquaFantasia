import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { DEMO_FISH, advanceRound, createCast, hookFish } from '../src/v3/fishingEngine.ts';
import { emptyCollection, parseCollection } from '../src/v3/collection.ts';
import { canUnlockRegion, fishForRegion, rodUpgradePrice, trySelectRegion, tryUnlockRegion, tryUpgradeRod } from '../src/v3/progression.ts';

test('V3 old collection data migrates without losing coins or records', () => {
  const legacy = JSON.stringify({ version: 1, coins: 275, records: { bubble: { count: 4, bestLengthCm: 22.5, rarest: 'rare' } } });
  const migrated = parseCollection(legacy);
  assert.equal(migrated.coins, 275);
  assert.equal(migrated.records.bubble.count, 4);
  assert.equal(migrated.rodLevel, 1);
  assert.deepEqual(migrated.unlockedRegions, ['shore']);
  assert.equal(migrated.selectedRegion, 'shore');
});

test('upgrades charge once, cap at level 4, and do not mutate old data', () => {
  const initial = { ...emptyCollection(), coins: 5000 };
  const two = tryUpgradeRod(initial), three = tryUpgradeRod(two), four = tryUpgradeRod(three);
  assert.equal(initial.rodLevel, 1);
  assert.equal(two.rodLevel, 2);
  assert.equal(three.rodLevel, 3);
  assert.equal(four.rodLevel, 4);
  assert.equal(tryUpgradeRod(four), four);
  assert.equal(four.coins, 5000 - 160 - 410 - 840);
  assert.equal(rodUpgradePrice(4), null);
});

test('region unlocking requires discoveries, equipment, and sufficient coins', () => {
  const baseline = { ...emptyCollection(), coins: 1500 };
  assert.equal(canUnlockRegion(baseline, 'coral-bay'), false);
  let withFish = baseline;
  for (const id of ['bubble','lake','pearl','clown']) {
    withFish = { ...withFish, records: { ...withFish.records, [id]: { count: 1, bestLengthCm: 20, rarest: 'common' } } };
  }
  assert.equal(canUnlockRegion(withFish, 'coral-bay'), false);
  const upgraded = tryUpgradeRod(withFish);
  assert.equal(canUnlockRegion(upgraded, 'coral-bay'), true);
  const unlocked = tryUnlockRegion(upgraded, 'coral-bay');
  assert.equal(unlocked.coins, upgraded.coins - 280);
  assert.equal(tryUnlockRegion(unlocked, 'coral-bay'), unlocked);
  assert.equal(trySelectRegion(unlocked, 'coral-bay').selectedRegion, 'coral-bay');
  assert.equal(canUnlockRegion(unlocked, 'deep-blue'), false);
});

test('regions never spawn locked-region fish, even across multiple casts', () => {
  let state = emptyCollection();
  const seenShore = new Set();
  for (let i=0; i<240; i++) seenShore.add(fishForRegion(state,i,i*31+13).id);
  assert.deepEqual([...seenShore].sort(), ['bubble','lake']);
  assert.equal(trySelectRegion(state,'deep-blue'), state);
  state = { ...state, selectedRegion: 'deep-blue', unlockedRegions: ['shore','coral-bay','deep-blue'] };
  const deep = new Set(Array.from({length:240}, (_, i) => fishForRegion(state, i, i*71+3).id));
  assert.ok(deep.has('king'));
  assert.ok(!deep.has('bubble'));
});

test('rod enhancement affects subsequent rounds, not active rounds', () => {
  const fish=DEMO_FISH[0];
  let weak=createCast(fish,42,1), strong=createCast(fish,42,4);
  assert.equal(weak.rodLevel,1);
  assert.equal(strong.rodLevel,4);
  for (let i=0;i<85;i++) { weak=advanceRound(weak,.05,false); strong=advanceRound(strong,.05,false); }
  // Hook phase through exact input.
  assert.equal(weak.phase,'bite'); assert.equal(strong.phase,'bite');
  weak=hookFish(weak);strong=hookFish(strong);
  for(let i=0;i<25;i++){weak=advanceRound(weak,.05,true);strong=advanceRound(strong,.05,true);}
  assert.ok(strong.progress>weak.progress);
  assert.ok(strong.tension<weak.tension);
  assert.equal(weak.rodLevel,1);
});

test('persisted progression sanitizes invalid levels and inaccessible selection',()=>{
  const clean=parseCollection(JSON.stringify({...emptyCollection(), rodLevel:900, selectedRegion:'deep-blue', unlockedRegions:['bad','coral-bay']}));
  assert.equal(clean.rodLevel,1);
  assert.equal(clean.selectedRegion,'shore');
  assert.deepEqual(clean.unlockedRegions,['shore','coral-bay']);
});

test('V3 CI prohibits vector files and references',()=>{
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'aqua-v3-raster-'));
  const checker=path.resolve('tools/check-v3-raster-only.mjs');
  try {
    fs.mkdirSync(path.join(tmp,'src/v3'),{recursive:true});
    fs.writeFileSync(path.join(tmp,'src/v3/demo.css'),'.test { background: url(thing.png) }');
    const pass=spawnSync(process.execPath,[checker,tmp],{encoding:'utf8'});
    assert.equal(pass.status,0,pass.stderr);
    fs.writeFileSync(path.join(tmp,'src/v3/demo.css'),'.test { background: url(thing.svg) }');
    const fail=spawnSync(process.execPath,[checker,tmp],{encoding:'utf8'});
    assert.notEqual(fail.status,0);
    fs.writeFileSync(path.join(tmp,'src/v3/demo.css'),'.test { background: url(thing.png) }');
    fs.mkdirSync(path.join(tmp,'public/assets'), { recursive: true });
    fs.writeFileSync(path.join(tmp,'public/assets/forbidden.svg'), '<vector />');
    const failFile=spawnSync(process.execPath,[checker,tmp],{encoding:'utf8'});
    assert.notEqual(failFile.status,0);
  } finally { fs.rmSync(tmp,{recursive:true,force:true}); }
});

test('weighted regional ecology is reproducible and never uses locked species', () => {
  const shore = emptyCollection();
  const spawn = (state, n, step, offset) => Array.from({length:n}, (_,i) =>
    fishForRegion(state, i, i*step+offset).id);
  const initial = spawn(shore, 1000, 7, 0xAB13579);
  assert.deepEqual(initial, spawn(shore, 1000, 7, 0xAB13579));
  assert.ok(initial.every(id => id === 'bubble' || id === 'lake'));
  const bubbleCount = initial.filter(id => id === 'bubble').length;
  assert.ok(bubbleCount > 510 && bubbleCount < 700, 'shore distribution: ' + bubbleCount);
  assert.ok(initial.some((id,i)=>i>0 && id===initial[i-1]), 'should not rotate predictably');
  const deep = { ...shore, selectedRegion: 'deep-blue', unlockedRegions: ['shore','coral-bay','deep-blue'] };
  const rareCount = spawn(deep, 1000, 23, 99).filter(id => id === 'king').length;
  assert.ok(rareCount > 60 && rareCount < 230, 'boss remains uncommon: '+rareCount);
});
test('discovering a fish slightly increases chances of finding the other', () => {
  const empty = emptyCollection();
  const discovered = { ...empty, records: { bubble: { count:1, bestLengthCm:17, rarest:'common' } } };
  const sample = state => Array.from({length:3000}, (_,i)=>fishForRegion(state,i,i*5+137).id)
    .filter(id=>id==='lake').length;
  const before=sample(empty), after=sample(discovered);
  assert.ok(after>before, 'discovery bonus should help exploration');
  assert.ok(after<2700, 'unseen is not guaranteed');
});
