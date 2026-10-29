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
  click('button[data-v3-region-id="coral-bay"][data-v3-region-action="select"]');
  click('button[data-v3-region-id="deep-blue"][data-v3-region-action="unlock"]');
  click('button[data-v3-region-id="deep-blue"][data-v3-region-action="select"]');
  click('[data-v3-harbor-close]');
  const save=JSON.parse(localStorage.getItem('aquafantasia:v3:collection:v1'));
  return {rod:save.rodLevel,region:save.selectedRegion,coins:save.coins,
    species:Object.keys(save.records).length,legacy:localStorage.getItem('aqua-fantasia-save-v650'),
    lite:localStorage.getItem('aquafantasia:v3:lite:v1'),litePressed,
    liteClass:document.querySelector('.v3-screen').classList.contains('v3-lite-mode')};
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
      const launch=await evaluate("({version:document.documentElement.dataset.aquaGameVersion,lab:document.querySelector('.v3-eyebrow')?.textContent,exit:!!document.querySelector('[data-v3-exit]'),old:!!document.querySelector('.legacy-game')})");
      if(launch.version!=='3.0.0'||launch.exit||launch.lab?.includes('LAB')||launch.old)
        throw Error('The default URL must boot the new V3 production game: '+JSON.stringify(launch));
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
    const coach = await evaluate("({text:document.querySelector('[data-v3-reel-coach]')?.textContent,hidden:document.querySelector('[data-v3-reel-coach]')?.hidden})");
    if(!coach.text || coach.hidden)throw Error('Reeling advice is not visible during fight');
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
    await evaluate("document.querySelector('[data-v3-dex-close]').click();document.querySelector('[data-v3-harbor-toggle]').click();true");
    if(!await evaluate("document.querySelector('[data-v3-harbor-dialog]').open"))throw Error('Harbor modal failed');
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
    if(grown.rod!==3||grown.region!=='deep-blue'||grown.coins!==250||grown.species!==4||grown.legacy!=='LEGACY_UNTOUCHED'
      ||grown.lite!=='1'||grown.litePressed!=='true'||!grown.liteClass)
      throw Error('Progression / lite setting / legacy save isolation failed: '+JSON.stringify(grown));
    const priorLiteDocumentOrigin=await evaluate('performance.timeOrigin');
    await send('Page.reload',{ignoreCache:true});
    await until(()=>evaluate("performance.timeOrigin !== "+priorLiteDocumentOrigin+" && document.querySelector('.v3-screen.v3-lite-mode') && Boolean(document.querySelector('[data-v3-harbor-toggle]')?.offsetWidth) && document.querySelector('[data-v3-wallet]')?.textContent?.includes('250')"),'new document and persisted lite mode after browser reload');
    if(await evaluate("localStorage.getItem('aqua-fantasia-save-v650')")!=='LEGACY_UNTOUCHED')
      throw Error('Legacy V2 save was unexpectedly modified after reload');
    await evaluate("document.querySelector('[data-v3-harbor-toggle]').click();true");
    await capture('harbor-deep-blue-390x844');
    await evaluate("document.querySelector('[data-v3-harbor-close]').click();true");
    await capture('deep-blue-390x844');
    console.log('[V3 browser] touch, fish PNG, dialogs, upgrades, new regions, legacy save isolation PASS');
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
