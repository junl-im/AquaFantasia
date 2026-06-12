// AquaFantasia v5.0 Runtime Focus Guard
// Lightweight no-build canvas overlay and frame governor for mobile fishing.
const s = { mode:'auto', fps:0, last:performance.now(), frames:0, skip:false, dpr:1, running:false };
function isLite(){ return document.body.classList.contains('perf-lite') || s.mode === 'lite' || (s.mode === 'auto' && (/Mobile|Android|iPhone|KAKAOTALK/i.test(navigator.userAgent||'') || navigator.connection?.saveData)); }
function resize(canvas, host){
  const r = host.getBoundingClientRect(); const cap = isLite()?1:1.35; const dpr = Math.min(devicePixelRatio||1, cap); s.dpr=dpr;
  const w = Math.max(1, Math.floor(r.width*dpr)); const h = Math.max(1, Math.floor(r.height*dpr));
  if (canvas.width!==w || canvas.height!==h){ canvas.width=w; canvas.height=h; canvas.style.width=r.width+'px'; canvas.style.height=r.height+'px'; }
  return {w,h,dpr,low:isLite()};
}
function phase(host){ return host?.classList.contains('phase-reel')?'reel':host?.classList.contains('phase-bite')?'bite':host?.classList.contains('phase-casting')?'casting':'ready'; }
function draw(){
  const canvas=document.getElementById('v50-focus-canvas'), host=document.getElementById('fishing-visual');
  if(!canvas||!host){ requestAnimationFrame(draw); return; }
  const active=document.body.dataset.screen==='fishing'; canvas.style.display=active?'block':'none'; s.running=active;
  if(!active){ requestAnimationFrame(draw); return; }
  const now=performance.now(); s.frames++; if(now-s.last>700){ s.fps=s.frames*1000/(now-s.last); s.frames=0; s.last=now; if(s.fps && s.fps<24) document.body.classList.add('perf-lite'); }
  const {w,h,dpr,low}=resize(canvas,host); const ctx=canvas.getContext('2d',{alpha:true}); if(!ctx){ requestAnimationFrame(draw); return; }
  ctx.clearRect(0,0,w,h); const p=phase(host), t=now/1000;
  ctx.save(); ctx.globalCompositeOperation='screen';
  const waves=low?2:5; for(let i=0;i<waves;i++){ ctx.beginPath(); const y=h*(.50+i*.08)+Math.sin(t*.9+i)*7*dpr; ctx.moveTo(0,y); for(let x=0;x<=w;x+=28*dpr) ctx.lineTo(x,y+Math.sin((x/w)*6.28*2+t+i)*5*dpr); ctx.strokeStyle=i%2?'rgba(103,232,249,.16)':'rgba(255,247,221,.12)'; ctx.lineWidth=Math.max(1,1.6*dpr); ctx.stroke(); }
  if(p!=='ready'){
    const bx=w*(.52+Math.sin(t*.7)*.035), by=h*(.52+Math.sin(t*1.2)*.025);
    ctx.beginPath(); ctx.moveTo(w*.86,h*.86); ctx.quadraticCurveTo(w*.66,h*.2,bx,by); ctx.strokeStyle='rgba(255,230,128,.55)'; ctx.lineWidth=2.5*dpr; ctx.stroke();
    const r=(p==='bite'?52+Math.sin(t*8)*9:24+Math.sin(t*2)*3)*dpr; ctx.beginPath(); ctx.ellipse(bx,by+18*dpr,r,r*.34,0,0,Math.PI*2); ctx.strokeStyle=p==='bite'?'rgba(255,210,90,.95)':'rgba(103,232,249,.34)'; ctx.lineWidth=2.3*dpr; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(bx,by,11*dpr,22*dpr,0,0,Math.PI*2); ctx.fillStyle='rgba(255,247,221,.92)'; ctx.fill(); ctx.beginPath(); ctx.ellipse(bx,by-6*dpr,11*dpr,9*dpr,0,0,Math.PI*2); ctx.fillStyle='rgba(251,113,133,.92)'; ctx.fill();
  }
  if(p==='reel'){
    const fx=w*(.5+Math.sin(t*1.4)*.22), fy=h*(.69+Math.cos(t*1.8)*.035);
    ctx.beginPath(); ctx.ellipse(fx,fy,46*dpr,15*dpr,Math.sin(t)*.12,0,Math.PI*2); ctx.fillStyle='rgba(255,247,221,.68)'; ctx.fill();
    ctx.beginPath(); ctx.arc(fx,fy,76*dpr,0,Math.PI*2); ctx.strokeStyle='rgba(192,132,252,.20)'; ctx.lineWidth=2*dpr; ctx.stroke();
  }
  ctx.restore(); requestAnimationFrame(draw);
}
window.AquaV50Runtime={ setMode(mode){s.mode=mode||'auto'}, getStats(){return {fps:s.fps,dpr:s.dpr,mode:s.mode,running:s.running}}, isRunning(){return s.running}, sweep(){try{caches?.keys?.().then(keys=>keys.filter(k=>k.includes('aqua-fantasia')&&!k.startsWith('aqua-fantasia-v5.0.0')).forEach(k=>caches.delete(k)))}catch{}} };
requestAnimationFrame(draw);
