import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn,spawnSync} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';

const url='http://127.0.0.1:4178/';
async function until(fn,label,ms=12000) {
  const end=Date.now()+ms; let last;
  while(Date.now()<end) {
    try { const value=await fn(); if(value) return value; } catch(err) { last=err; }
    await sleep(100);
  }
  throw Error('Timeout '+label+(last?' '+last:''));
}
function browserPath() {
  const candidates=[process.env.CHROME_BIN,'google-chrome','google-chrome-stable','chromium','chromium-browser'].filter(Boolean);
  for(const cmd of candidates) {
    if(fs.existsSync(cmd)) return cmd;
    const found=spawnSync('which',[cmd],{encoding:'utf8'});
    if(found.status===0 && found.stdout.trim()) return found.stdout.trim();
  }
  throw Error('Chromium/Chrome executable not found');
}
function layoutSnapshot() {
  const rect=(selector)=>{
    const el=document.querySelector(selector);
    if(!el) return null;
    const r=el.getBoundingClientRect();
    return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};
  };
  return {
    w:innerWidth,h:innerHeight,scrollW:document.documentElement.scrollWidth,
    scrollH:document.documentElement.scrollHeight,
    top:rect('.v3-top'),sea:rect('.v3-sea'),console:rect('.v3-console'),
    cast:rect('[data-v3-cast]'),reel:rect('[data-v3-reel]'),
    dex:rect('[data-v3-dex-toggle]'),harbor:rect('[data-v3-harbor-toggle]')
  };
}
function reelDown() {
  document.querySelector('[data-v3-reel]').dispatchEvent(
    new PointerEvent('pointerdown',{bubbles:true,pointerId:33,pointerType:'touch',isPrimary:true})
  );
  return document.querySelector('.v3-sea').dataset.phase;
}
function showHarborAndGrow() {
  const click=(selector)=>{
    const el=document.querySelector(selector);
    if(!el || el.disabled) throw Error('Missing or disabled '+selector);
    el.click();
  };
  click('[data-v3-harbor-toggle]');
  click('[data-v3-lite]');
  const litePressed=document.querySelector('[data-v3-lite]').getAttribute('aria-pressed');
  click('[data-v3-upgrade]');
  click('[data-v3-upgrade]');
  click('button[data-v3-region-id="coral-bay"][data-v3-region-action="unlock"]');
  if(document.querySelector('button[data-v3-region-id="coral-bay"][data-v3-region-action="select"]')) {
    throw Error('Coral bay should auto-select after unlocking');
  }
  if(document.querySelector('[data-v3-region]')?.textContent?.includes('산호빛 만')!==true)
    throw Error('Unlocking coral bay did not move the player');
  click('button[data-v3-region-id="deep-blue"][data-v3-region-action="unlock"]');
  click('[data-v3-brake-upgrade]');
  const newBrakeText=document.querySelector('[data-v3-brake-status]')?.textContent;
  if(!newBrakeText?.includes('Lv.2'))throw Error('Brake upgrade was not applied');
  if(document.querySelector('[data-v3-region]')?.textContent?.includes('푸른 심해')!==true)
    throw Error('Unlocking deep blue did not move the player');
  click('[data-v3-harbor-close]');
  const save=JSON.parse(localStorage.getItem('aquafantasia:v3:collection:v1'));
  return {rod:save.rodLevel,brake:save.brakeLevel,region:save.selectedRegion,coins:save.coins,
    species:Object.keys(save.records).length,legacy:localStorage.getItem('aqua-fantasia-save-v650'),
    lite:localStorage.getItem('aquafantasia:v3:lite:v1'),litePressed,
    liteClass:document.querySelector('.v3-screen').classList.contains('v3-lite-mode')};
}
/** Real browser input and animation frames: catch one fish and verify the PNG reveal. */
function catchOneFish() {
  return new Promise((resolve,reject)=>{
    const cast=document.querySelector('[data-v3-cast]');
    const reel=document.querySelector('[data-v3-reel]');
    const sea=document.querySelector('.v3-sea');
    const tension=document.querySelector('[data-v3-tension-label]');
    if(!cast || !reel || !sea || !tension)return reject(Error('Missing V3 play controls'));
    const pointer=73;
    let holding=false;
    let sawApproach=false, sawSurface=false;
    let minFishBottom=Infinity,maxFishBottom=-Infinity;
    const fishArt=document.querySelector('[data-v3-fish]');
    const approachNote=document.querySelector('[data-v3-approach]');
    const release=()=>{
      if(!holding)return;
      window.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:pointer,pointerType:'touch'}));
      holding=false;
    };
    const hold=()=>{
      if(holding)return;
      reel.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:pointer,pointerType:'touch',isPrimary:true}));
      holding=reel.classList.contains('is-pressed');
    };
    cast.click();
    const start=performance.now();
    const timer=setInterval(()=>{
      const phase=sea.dataset.phase;
      const strength=(parseFloat(tension.textContent)||0)/100;
      if(phase==='bite')hold();
      if(phase==='fighting') {
        const near=sea.dataset.approach;
        sawApproach ||= near==='approaching';
        sawSurface ||= near==='surface';
        const bottom=fishArt?parseFloat(getComputedStyle(fishArt).bottom):NaN;
        if(Number.isFinite(bottom)) {minFishBottom=Math.min(minFishBottom,bottom);maxFishBottom=Math.max(maxFishBottom,bottom);}
        if(holding && strength>.61)release();
        if(!holding && strength<.27)hold();
      }
      if(phase==='landed'||phase==='escaped') {
        clearInterval(timer);
        release();
        // Allow async image decoding and the reveal animation to settle.
        setTimeout(()=>{
          const panel=document.querySelector('[data-v3-result]');
          const art=document.querySelector('[data-v3-result-fish]');
          const rect=panel?.getBoundingClientRect(),water=sea.getBoundingClientRect();
          resolve({phase,visible:panel?.hidden===false,img:art?.naturalWidth||0,
            alt:art?.alt,fish:document.querySelector('[data-v3-result-name]')?.textContent,
            inside:!!rect&&rect.top>=water.top-3&&rect.bottom<=water.bottom+3,
            reelState:reel.disabled,
            approach:sawApproach,surface:sawSurface,surfaceRisePx:maxFishBottom-minFishBottom,
            approachHidden:approachNote?.hidden===true,
            splash:document.querySelector('[data-v3-landing-splash]')?.naturalWidth||0,
            splashAnimation:getComputedStyle(document.querySelector('[data-v3-landing-splash]')).animationName});
        },550);
      } else if(performance.now()-start>65000) {
        clearInterval(timer);
        release();
        reject(Error('Timed out waiting for a complete live catch: '+phase));
      }
    },55);
  });
}
async function main() {
  const profile=fs.mkdtempSync(path.join(os.tmpdir(),'aqua-v3-qa-'));
  const vite=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','4178','--strictPort'],{stdio:'ignore'});
  let chrome,ws;
  try {
    await until(async()=> (await fetch(url).catch(()=>null))?.ok,'Vite preview start',18000);
    chrome=spawn(browserPath(),[
      '--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-extensions',
      '--disable-background-timer-throttling','--disable-renderer-backgrounding',
      '--remote-allow-origins=*','--remote-debugging-port=0',
      '--user-data-dir='+profile,'about:blank'
    ],{stdio:'ignore'});
    const portFile=path.join(profile,'DevToolsActivePort');
    const lines=await until(()=>fs.existsSync(portFile)&&fs.readFileSync(portFile,'utf8').trim().split('\n'),'Chromium CDP startup',15000);
    ws=new WebSocket('ws://127.0.0.1:'+lines[0]+lines[1]);
    await until(()=>ws.readyState===1,'CDP connection');
    const pending=new Map();let id=0;
    ws.addEventListener('message',event=>{
      const packet=JSON.parse(event.data);const entry=pending.get(packet.id);
      if(!entry)return;
      pending.delete(packet.id);
      if(packet.error)entry.reject(Error(JSON.stringify(packet.error)));
      else entry.resolve(packet.result);
    });
    function call(method,params={},sessionId) {
      return new Promise((resolve,reject)=>{
        const requestId=++id;pending.set(requestId,{resolve,reject});
        ws.send(JSON.stringify({id:requestId,method,params,...(sessionId?{sessionId}:{})}));
      });
    }
    const target=await call('Target.createTarget',{url:'about:blank'});
    const attached=await call('Target.attachToTarget',{targetId:target.targetId,flatten:true});
    const send=(method,params={})=>call(method,params,attached.sessionId);
    await send('Page.enable');await send('Runtime.enable');
    async function evaluate(expression) {
      const answer=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
      if(answer.exceptionDetails)throw Error('Page exception: '+JSON.stringify(answer.exceptionDetails));
      return answer.result?.value;
    }
    const screenshots = path.resolve('v3-qa-screenshots');
    async function capture(name) {
      const shot = await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
      fs.mkdirSync(screenshots,{recursive:true});
      fs.writeFileSync(path.join(screenshots,name+'.png'),Buffer.from(shot.data,'base64'));
    }
    async function nav(w,h,mobile) {
      await send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile});
      await send('Page.navigate',{url});
      await until(()=>evaluate("Boolean(document.querySelector('.v3-screen')&&document.querySelector('[data-v3-cast]'))"),'V3 DOM');
      const launch=await evaluate("({version:document.documentElement.dataset.aquaGameVersion,lab:document.querySelector('.v3-eyebrow')?.textContent,exit:!!document.querySelector('[data-v3-exit]'),old:!!document.querySelector('.legacy-game'),goal:document.querySelector('[data-v3-hint]')?.textContent,harborGoal:document.querySelector('[data-v3-harbor-toggle]')?.dataset.goalReady})");
      if(launch.version!=='3.0.0'||launch.exit||launch.lab?.includes('LAB')||launch.old)
        throw Error('The default URL must boot the new V3 production game: '+JSON.stringify(launch));
      if(!launch.goal?.includes('다음 목표')||launch.harborGoal!=='false')
        throw Error('Fresh player should see first progression objective: '+JSON.stringify(launch));
      await sleep(150);
    }
    for(const [w,h,mobile] of [[320,568,true],[375,667,true],[390,844,true],[667,375,true],[844,390,true],[1280,800,false]]) {
      await nav(w,h,mobile);
      const state=await evaluate('('+layoutSnapshot.toString()+')()');
      const keys=['top','sea','console','cast','reel','dex','harbor'];
      const missing=keys.filter(k=>!state[k]||state[k].height<20||state[k].width<20);
      const clipped=keys.filter(k=>state[k]&&(state[k].left< -2||state[k].top< -2||state[k].right>w+2||state[k].bottom>h+2));
      if(missing.length||clipped.length||state.scrollW>w+2||state.scrollH>h+2||state.sea.height<45)
        throw Error('Viewport '+w+'x'+h+' failed: '+JSON.stringify({missing,clipped,state}));
      await capture('home-'+w+'x'+h);
      console.log('[V3 browser] viewport '+w+'x'+h+' PASS; sea '+Math.round(state.sea.height)+'px');
    }
    await nav(390,844,true);
    const starterSea=await evaluate("({region:document.querySelector('.v3-sea')?.dataset.region,art:document.querySelector('.v3-sea')?.style.getPropertyValue('--v3-water-image'),splash:document.querySelector('.v3-strike-splash')?.getAttribute('src'),finalHidden:document.querySelector('[data-v3-last-stand]')?.hidden})");
    if(starterSea.region!=='shore'||!starterSea.art.includes('water_clear_calm.webp')||!starterSea.splash?.endsWith('water_splash.png')||starterSea.finalHidden!==true)
      throw Error('Region/impact raster artwork did not boot: '+JSON.stringify(starterSea));
    await evaluate("document.querySelector('[data-v3-cast]').click(); true");
    await until(()=>evaluate("document.querySelector('[data-v3-fish]').naturalWidth>0"),'PNG fish asset',9000);
    await until(()=>evaluate("document.querySelector('.v3-sea').dataset.phase==='bite'"),'bite animation',8500);
    const biteVisual=await evaluate("({window:document.querySelector('[data-v3-bite-window]')?.hidden,fill:document.querySelector('[data-v3-bite-fill]')?.getBoundingClientRect().width,ripples:getComputedStyle(document.querySelector('.v3-bite-ripples')).opacity})");
    if(biteVisual.window || !(biteVisual.fill>3) || Number(biteVisual.ripples)<.9)
      throw Error('Bite wave/countdown not visible: '+JSON.stringify(biteVisual));
    await capture('bite-390x844');
    const phase=await evaluate('('+reelDown.toString()+')()');
    if(!(await evaluate("document.querySelector('[data-v3-bite-window]').hidden"))) throw Error('Countdown persisted during fight');
    if(phase!=='fighting')throw Error('Touch did not hook fish: '+phase);
    if(!await evaluate("document.querySelector('[data-v3-last-stand]').hidden"))throw Error('Final boss stage leaked into beginner fish');
    const coach = await evaluate("({text:document.querySelector('[data-v3-reel-coach]')?.textContent,hidden:document.querySelector('[data-v3-reel-coach]')?.hidden,splash:document.querySelector('.v3-strike-splash')?.naturalWidth})");
    if(!coach.text || coach.hidden || !(coach.splash>0))throw Error('Reeling advice/splash PNG missing: '+JSON.stringify(coach));
    await sleep(320);
    const progress=await evaluate("parseInt(document.querySelector('[data-v3-progress-label]').textContent,10)");
    const unrelatedRelease=await evaluate("window.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:34}));window.dispatchEvent(new KeyboardEvent('keyup',{bubbles:true,code:'Space'}));document.querySelector('[data-v3-reel]').classList.contains('is-pressed')");
    if(!unrelatedRelease)throw Error('Another finger or unrelated keyup cancelled the held reel');
    await evaluate("window.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:33}));true");
    if(await evaluate("document.querySelector('[data-v3-reel]').classList.contains('is-pressed')")) throw Error('Owning pointer did not release the reel');
    await evaluate("document.querySelector('[data-v3-reel]').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:35,pointerType:'touch',isPrimary:true}));window.dispatchEvent(new Event('blur'));true");
    if(await evaluate("document.querySelector('[data-v3-reel]').classList.contains('is-pressed')")) throw Error('Blur failed to release reel');
    if(!(progress>0))throw Error('Reeling does not advance capture');
    await evaluate("document.querySelector('[data-v3-dex-toggle]').click();true");
    if(!await evaluate("document.querySelector('[data-v3-dex-dialog]').open"))throw Error('Dex modal failed');
    const dexBefore=await evaluate("({all:document.querySelectorAll('[data-v3-dex-fish]').length,filter:document.querySelector('[data-v3-dex-filter=all]')?.getAttribute('aria-pressed')})");
    if(dexBefore.all!==12||dexBefore.filter!=='true')throw Error('Dex all filter failed: '+JSON.stringify(dexBefore));
    await evaluate("document.querySelector('[data-v3-dex-filter=found]').click();true");
    if(!await evaluate("Boolean(document.querySelector('.v3-dex-empty')?.textContent.includes('첫 낚시'))"))throw Error('Empty discovered collection not explained');
    await evaluate("document.querySelector('[data-v3-dex-filter=missing]').click();true");
    if(!await evaluate("document.querySelectorAll('[data-v3-dex-fish]').length===12"))throw Error('Missing fish filter failed');
    const rosterAssets=await evaluate("(async()=>{const sources=[...document.querySelectorAll('[data-v3-dex-fish] img')].map(img=>img.getAttribute('src'));return await Promise.all(sources.map(src=>new Promise(resolve=>{const img=new Image();img.onload=()=>resolve({ok:img.naturalWidth>0,src});img.onerror=()=>resolve({ok:false,src});img.src=src;})));})()");
    if(rosterAssets.length!==12||rosterAssets.some(x=>!x.ok))throw Error('Missing fish PNG artwork: '+JSON.stringify(rosterAssets.filter(x=>!x.ok)));
    await capture('dex-missing-390x844');
    await evaluate("document.querySelector('[data-v3-dex-close]').click();document.querySelector('[data-v3-harbor-toggle]').click();true");
    if(!await evaluate("document.querySelector('[data-v3-harbor-dialog]').open"))throw Error('Harbor modal failed');
    const lockedConditions=await evaluate("({chips:document.querySelectorAll('[data-v3-region-id=coral-bay]').length,required:document.querySelectorAll('.v3-harbor-region .v3-region-requirements span').length,objective:document.querySelector('[data-v3-harbor-objective]')?.textContent})");
    if(lockedConditions.required!==6||!lockedConditions.objective?.includes('다음 목표')) throw Error('Harbor requirements not visible: '+JSON.stringify(lockedConditions));
    await capture('harbor-locked-390x844');
    await evaluate("document.querySelector('[data-v3-harbor-close]').click();true");
    const sample=JSON.stringify({
      version:1,coins:2000,rodLevel:1,unlockedRegions:['shore'],selectedRegion:'shore',
      records:Object.fromEntries(['bubble','lake','pearl','clown'].map(id=>[id,{count:1,bestLengthCm:30,rarest:'common'}]))
    });
    await evaluate("(localStorage.setItem('aqua-fantasia-save-v650','LEGACY_UNTOUCHED'),localStorage.setItem('aquafantasia:v3:collection:v1',"+JSON.stringify(sample)+"),true)");
    const priorDocumentOrigin=await evaluate('performance.timeOrigin');
    await send('Page.reload',{ignoreCache:true});
    // Reload returns before the old document is replaced; do not accept stale HUD values.
    await until(()=>evaluate("performance.timeOrigin !== "+priorDocumentOrigin+" && Boolean(document.querySelector('[data-v3-harbor-toggle]')?.offsetWidth) && document.querySelector('[data-v3-wallet]')?.textContent?.includes('2,000')"),'new V3 document and hydrated wallet after reload',12000);
    const grown=await evaluate('('+showHarborAndGrow.toString()+')()');
    if(grown.rod!==3||grown.brake!==2||grown.region!=='deep-blue'||grown.coins!==10||grown.species!==4||grown.legacy!=='LEGACY_UNTOUCHED'
      ||grown.lite!=='1'||grown.litePressed!=='true'||!grown.liteClass)
      throw Error('Progression / lite setting / legacy save isolation failed: '+JSON.stringify(grown));
    const priorLiteDocumentOrigin=await evaluate('performance.timeOrigin');
    await send('Page.reload',{ignoreCache:true});
    await until(()=>evaluate("performance.timeOrigin !== "+priorLiteDocumentOrigin+" && document.querySelector('.v3-screen.v3-lite-mode') && Boolean(document.querySelector('[data-v3-harbor-toggle]')?.offsetWidth) && document.querySelector('[data-v3-wallet]')?.textContent?.includes('10')"),'new document and persisted lite mode after browser reload');
    const nextObjective=await evaluate("document.querySelector('[data-v3-hint]')?.textContent");
    if(!nextObjective?.includes('도감 완성까지')||!nextObjective.includes('8종'))
      throw Error('Late-game objective did not update: '+nextObjective);
    if(await evaluate("localStorage.getItem('aqua-fantasia-save-v650')")!=='LEGACY_UNTOUCHED')
      throw Error('Legacy V2 save was unexpectedly modified after reload');
    await evaluate("document.querySelector('[data-v3-harbor-toggle]').click();true");
    const brakePersisted=await evaluate("({text:document.querySelector('[data-v3-brake-status]')?.textContent,disabled:document.querySelector('[data-v3-brake-upgrade]')?.disabled})");
    if(!brakePersisted.text?.includes('Lv.2')||!brakePersisted.disabled)throw Error('Brake should persist and the next 680-coin upgrade should be disabled: '+JSON.stringify(brakePersisted));
    const unlockedConditions=await evaluate("({active:document.querySelector('.v3-harbor-region.is-active .v3-harbor-region-head strong')?.textContent,opened:document.querySelectorAll('.v3-region-opened').length,objective:document.querySelector('[data-v3-harbor-objective]')?.textContent,sea:document.querySelector('.v3-sea')?.dataset.region,art:document.querySelector('.v3-sea')?.style.getPropertyValue('--v3-water-image')})");
    if(unlockedConditions.active!=='푸른 심해'||unlockedConditions.opened!==3||!unlockedConditions.objective?.includes('도감 완성까지')||unlockedConditions.sea!=='deep-blue'||!unlockedConditions.art?.includes('water_abyss_canyon.webp'))throw Error('Deep blue harbor state not reflected: '+JSON.stringify(unlockedConditions));
    await capture('harbor-deep-blue-390x844');
    await evaluate("document.querySelector('[data-v3-harbor-close]').click();true");
    await capture('deep-blue-390x844');
    const liteSplash=await evaluate("({lite:document.querySelector('.v3-screen').classList.contains('v3-lite-mode'),splashDisplay:getComputedStyle(document.querySelector('[data-v3-landing-splash]')).display})");
    if(!liteSplash.lite||liteSplash.splashDisplay!=='none')
      throw Error('Reduced FX mode must hide landing splash animation: '+JSON.stringify(liteSplash));
    // Switch to normal visual mode to verify that landing splash really animates.
    await evaluate("document.querySelector('[data-v3-harbor-toggle]').click();document.querySelector('[data-v3-lite]').click();document.querySelector('[data-v3-harbor-close]').click();true");
    const normalSplash=await evaluate("({lite:document.querySelector('.v3-screen').classList.contains('v3-lite-mode'),splashDisplay:getComputedStyle(document.querySelector('[data-v3-landing-splash]')).display})");
    if(normalSplash.lite||normalSplash.splashDisplay==='none')
      throw Error('Standard mode did not restore landing splash effects: '+JSON.stringify(normalSplash));
    const fishRevealBefore=await evaluate("({present:!!document.querySelector('[data-v3-result-fish]'),hidden:document.querySelector('[data-v3-result]')?.hidden})");
    if(!fishRevealBefore.present||fishRevealBefore.hidden!==true)throw Error('Catch reveal artwork/card missing before fishing: '+JSON.stringify(fishRevealBefore));
    const liveResult=await evaluate('('+catchOneFish.toString()+')()');
    if(liveResult.phase!=='landed'||!liveResult.visible||!(liveResult.img>0)||!liveResult.inside||!liveResult.fish||liveResult.reelState!==true
      ||!liveResult.approach||!liveResult.surface||liveResult.surfaceRisePx<10||!liveResult.approachHidden
      ||!(liveResult.splash>0)||liveResult.splashAnimation!=='v3-catch-splash')
      throw Error('Live catch / fish artwork / panel viewport failed: '+JSON.stringify(liveResult));
    await capture('real-catch-reveal-390x844');
    console.log('[V3 browser] real live catch artwork and viewport PASS: '+liveResult.fish);
    console.log('[V3 browser] touch, fish PNG, dialogs, upgrades, new regions, legacy save isolation PASS');
    // Real PixiJS render is separate from the public release, opt-in for design review.
    await send('Page.navigate',{url:url+'?visual=1'});
    await until(()=>evaluate("document.querySelector('.v3-sea')?.dataset.v3SceneStatus==='ready'"),'opt-in PixiJS scene initialized',20000);
    const pixi=await evaluate("({canvas:!!document.querySelector('.v3-pixi-canvas'),width:document.querySelector('.v3-pixi-canvas')?.width,height:document.querySelector('.v3-pixi-canvas')?.height,app:!!document.querySelector('.v3-visual-rebuild'),scrollW:document.documentElement.scrollWidth,innerW:innerWidth})");
    if(!pixi.canvas||!(pixi.width>0)||!(pixi.height>0)||!pixi.app||pixi.scrollW>pixi.innerW+2)
      throw Error('V4 visual scene failed to mount correctly: '+JSON.stringify(pixi));
    await capture('visual-v4-pixi-390x844');
    const skins=await evaluate("(()=>{const style=(sel,pseudo)=>{const e=document.querySelector(sel);if(!e)return null;const x=getComputedStyle(e,pseudo);return {bg:x.backgroundImage,border:x.borderTopLeftRadius+'|'+x.borderTopRightRadius,icon:pseudo?x.backgroundImage:undefined}};return {cast:style('.v3-cast'),reel:style('.v3-reel'),dex:style('.v3-dex-toggle'),harbor:style('.v3-harbor-toggle'),castIcon:style('.v3-cast','::before'),reelIcon:style('.v3-reel','::before'),dexIcon:style('.v3-dex-toggle','::before'),harborIcon:style('.v3-harbor-toggle','::before'),frame:style('.v3-console'),tension:style('.v3-tension'),progress:style('.v3-progress')}})()");
    if(!skins.cast||!skins.reel||skins.cast.bg===skins.reel.bg||
      skins.cast.border===skins.reel.border||skins.dex.bg===skins.harbor.bg||
      skins.tension.bg===skins.progress.bg||skins.castIcon?.bg==='none'||
      skins.reelIcon?.bg==='none'||skins.dexIcon?.bg==='none'||skins.harborIcon?.bg==='none')
      throw Error('Bespoke V4 button skins must be distinct and illustrated: '+JSON.stringify(skins));
    await evaluate("document.querySelector('[data-v3-dex-toggle]').click();true");
    const dexSkin=await evaluate("({open:document.querySelector('[data-v3-dex-dialog]').open,all:getComputedStyle(document.querySelector('[data-v3-dex-filter=all]')).backgroundImage,found:getComputedStyle(document.querySelector('[data-v3-dex-filter=found]')).backgroundImage})");
    if(!dexSkin.open)throw Error('Custom field-guide frame failed to open');
    await capture('visual-v4-field-guide-390x844');
    await evaluate("document.querySelector('[data-v3-dex-filter=found]').click();true");
    const selectedTab=await evaluate("({selected:document.querySelector('[data-v3-dex-filter=found]').getAttribute('aria-pressed'),bg:getComputedStyle(document.querySelector('[data-v3-dex-filter=found]')).backgroundImage})");
    if(selectedTab.selected!=='true'||selectedTab.bg===dexSkin.found)
      throw Error('Distinct discovered-tab pressed skin did not update: '+JSON.stringify(selectedTab));
    await evaluate("document.querySelector('[data-v3-dex-close]').click();document.querySelector('[data-v3-harbor-toggle]').click();true");
    const harborSkin=await evaluate("(()=>{const el=document.querySelector('[data-v3-harbor-dialog]');const cards=[...document.querySelectorAll('.v3-harbor-region')];return {open:el.open,regions:cards.map(c=>({biome:c.dataset.v3Biome,bg:getComputedStyle(c).backgroundImage})),rod:getComputedStyle(document.querySelector('[data-v3-upgrade]')).backgroundImage,brake:getComputedStyle(document.querySelector('[data-v3-brake-upgrade]')).backgroundImage,close:getComputedStyle(document.querySelector('[data-v3-harbor-close]')).backgroundImage}})()");
    if(!harborSkin.open||harborSkin.regions.length!==3||
      new Set(harborSkin.regions.map(x=>x.bg)).size!==3||
      harborSkin.rod===harborSkin.brake)
      throw Error('Harbor must have individual regional and upgrade frames: '+JSON.stringify(harborSkin));
    await capture('visual-v4-workshop-390x844');
    await evaluate("document.querySelector('[data-v3-harbor-close]').click();true");
    console.log('[V3 browser] V4 bespoke cast/reel/navigation, tabs and biome/workshop frames PASS');
    const idleMotion=await evaluate("({pose:document.querySelector('.v3-sea')?.dataset.v3FisherPose,frame:document.querySelector('.v3-sea')?.dataset.v3FisherFrame})");
    if(idleMotion.pose!=='idle'||idleMotion.frame!=='0')throw Error('V4 fisher must initialize idle: '+JSON.stringify(idleMotion));
    await evaluate("document.querySelector('[data-v3-cast]').click();true");
    await until(()=>evaluate("document.querySelector('.v3-sea')?.dataset.v3ScenePhase==='bite'"),'real V4 bite and hook',12000);
    await evaluate("document.querySelector('[data-v3-reel]').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:81,pointerType:'touch',isPrimary:true}));true");
    await until(()=>evaluate("document.querySelector('.v3-sea')?.dataset.v3ScenePhase==='fighting'"),'V4 fish hooked for mesh animation',3000);
    await until(()=>evaluate("Number(document.querySelector('.v3-sea')?.dataset.v3FishBend)>0.05"),'V4 fish mesh deforms in action',4000);
    const motionSample=await evaluate("({pose:document.querySelector('.v3-sea')?.dataset.v3FisherPose,frame:document.querySelector('.v3-sea')?.dataset.v3FisherFrame,bend:Number(document.querySelector('.v3-sea')?.dataset.v3FishBend),rod:Number(document.querySelector('.v3-sea')?.dataset.v3RodBend),held:document.querySelector('.v3-sea')?.dataset.v3SceneHeld,lineSag:Number(document.querySelector('.v3-sea')?.dataset.v4LineSag),wake:Number(document.querySelector('.v3-sea')?.dataset.v4WakeStrength)})");
    if(motionSample.pose!=='reel'||motionSample.held!=='true'||motionSample.bend<=0||motionSample.rod<=0||!(motionSample.lineSag>0)||!(motionSample.wake>0))
      throw Error('V4 hooked sprite/rod/mesh motion is not coupled to reeling: '+JSON.stringify(motionSample));
    await capture('visual-v4-real-reeling-390x844');
    await evaluate("window.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:81,pointerType:'touch'}));true");
    await until(()=>evaluate("document.querySelector('.v3-sea')?.dataset.v3FisherPose==='brace'"),'V4 released reel pose',3000);
    const releasedSag=await evaluate("Number(document.querySelector('.v3-sea')?.dataset.v4LineSag)");
    if(!(releasedSag>motionSample.lineSag))
      throw Error('V4 line should visibly relax after releasing the reel: '+JSON.stringify({releasedSag,motionSample}));
    await capture('visual-v4-cast-390x844');
    console.log('[V3 browser] animated 4-frame fisher, real reel/brace poses and deformable fish mesh PASS');
    // A narrow phone and widescreen desktop need their own rendered screenshots,
    // not merely the standard V3 DOM overflow checks.
    for (const [w,h,mobile] of [[320,568,true],[1280,800,false]]) {
      await send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile});
      await send('Page.navigate',{url:url+'?visual=1'});
      await until(()=>evaluate("document.querySelector('.v3-sea')?.dataset.v3SceneStatus==='ready'"),'V4 scene '+w+'x'+h,20000);
      const v4layout=await evaluate('('+layoutSnapshot.toString()+')()');
      const c=await evaluate("({width:document.querySelector('.v3-pixi-canvas')?.width,height:document.querySelector('.v3-pixi-canvas')?.height,canvasRect:(()=>{const r=document.querySelector('.v3-pixi-canvas')?.getBoundingClientRect();return r?{width:r.width,height:r.height}:null})()})");
      if(w===1280 && (v4layout.sea?.right>=v4layout.console?.left||
        v4layout.console?.left<700||v4layout.sea?.width<650))
        throw Error('Desktop V4 must use a side command deck, not a narrow phone strip: '+JSON.stringify(v4layout));
      const sonar=await evaluate("({display:getComputedStyle(document.querySelector('[data-v4-sonar]')).display,label:document.querySelector('[data-v4-sonar-note]')?.textContent,target:document.querySelector('[data-v4-sonar]')?.style.getPropertyValue('--v4-target-y')})");
      if(w===1280 && (sonar.display==='none'||!sonar.label||!sonar.target))
        throw Error('Live desktop sonar must be readable and physically driven: '+JSON.stringify(sonar));
      if(w<1024 && sonar.display!=='none')
        throw Error('Sonar must not consume precious mobile space: '+JSON.stringify(sonar));
      if(!c.width||!c.height||!c.canvasRect || c.canvasRect.width<100 ||
        v4layout.scrollW>w+2 || v4layout.scrollH>h+2 || v4layout.console.bottom>h+3)
        throw Error('V4 responsive visual stage overflows '+w+'x'+h+': '+JSON.stringify({v4layout,c}));
      await capture('visual-v4-pixi-'+w+'x'+h);
    }
    console.log('[V3 browser] PixiJS V4 opt-in visual canvas, 320/390/1280 responsive and cast PASS');
  } finally {
    if(ws&&ws.readyState===1)ws.close();
    if(chrome)chrome.kill('SIGKILL');
    vite.kill('SIGKILL');
    await sleep(400);
    // Chrome can still be flushing a profile after SIGKILL; cleanup must not mask test errors.
    try { fs.rmSync(profile,{recursive:true,force:true,maxRetries:8,retryDelay:200}); }
    catch(err) { console.warn('[V3 browser] temporary profile cleanup warning:',String(err)); }
  }
}
main().catch(error=>{console.error('[V3 browser] FAIL:',error);process.exitCode=1;});
