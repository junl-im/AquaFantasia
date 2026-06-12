// AquaFantasia v4.9 lightweight fishing runtime bridge.
// It intentionally uses Canvas2D as a no-build fallback while the PixiJS 8/Vite renderer is migrated.
const state = { mode: 'auto', fps: 0, last: performance.now(), frames: 0, running: false, dpr: 1 };
function visualPhase(visual) {
  if (!visual) return 'ready';
  if (visual.classList.contains('phase-reel')) return 'reel';
  if (visual.classList.contains('phase-bite')) return 'bite';
  if (visual.classList.contains('phase-casting')) return 'casting';
  return visual.dataset?.fishingPhase || 'ready';
}
function resize(canvas, visual) {
  const rect = visual.getBoundingClientRect();
  const low = document.body.classList.contains('perf-lite') || state.mode === 'lite';
  const cap = low ? 1.05 : state.mode === 'quality' ? 1.6 : 1.25;
  const dpr = Math.min(window.devicePixelRatio || 1, cap);
  state.dpr = dpr;
  const w = Math.max(1, Math.floor(rect.width * dpr));
  const h = Math.max(1, Math.floor(rect.height * dpr));
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; canvas.style.width = rect.width + 'px'; canvas.style.height = rect.height + 'px'; }
  return { w, h, dpr, low };
}
function draw() {
  const canvas = document.getElementById('v49-pixi-runtime-canvas');
  const visual = document.getElementById('fishing-visual');
  if (!canvas || !visual) { requestAnimationFrame(draw); return; }
  const screen = document.body.dataset.screen;
  const active = screen === 'fishing';
  canvas.style.display = active ? 'block' : 'none';
  if (!active) { state.running = false; requestAnimationFrame(draw); return; }
  state.running = true;
  const { w, h, low } = resize(canvas, visual);
  const ctx = canvas.getContext('2d', { alpha:true });
  if (!ctx) { requestAnimationFrame(draw); return; }
  const now = performance.now();
  const phase = visualPhase(visual);
  const t = now / 1000;
  state.frames++;
  if (now - state.last > 600) { state.fps = state.frames * 1000 / (now - state.last); state.frames = 0; state.last = now; }
  ctx.clearRect(0,0,w,h);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const waveCount = low ? 2 : 4;
  for (let i=0;i<waveCount;i++) {
    ctx.beginPath();
    const base = h*(0.54 + i*0.09) + Math.sin(t*0.9+i)*10;
    ctx.moveTo(0, base);
    for (let x=0;x<=w;x+=32) ctx.lineTo(x, base + Math.sin((x/w)*Math.PI*4 + t*(0.8+i*.2))*8);
    ctx.strokeStyle = i%2 ? 'rgba(103,232,249,.18)' : 'rgba(255,247,221,.14)';
    ctx.lineWidth = Math.max(1, 2*state.dpr);
    ctx.stroke();
  }
  const bx = w*(0.52 + Math.sin(t*.7)*.045);
  const by = h*(0.54 + Math.sin(t*1.4)*.025);
  if (phase === 'casting' || phase === 'bite' || phase === 'reel') {
    ctx.beginPath();
    ctx.moveTo(w*.82,h*.82);
    ctx.quadraticCurveTo(w*.64,h*.18,bx,by);
    ctx.strokeStyle = 'rgba(253,224,71,.56)'; ctx.lineWidth = Math.max(2,3*state.dpr); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(bx,by,12*state.dpr,24*state.dpr,0,0,Math.PI*2); ctx.fillStyle='rgba(255,247,221,.94)'; ctx.fill();
    ctx.beginPath(); ctx.ellipse(bx,by-6*state.dpr,12*state.dpr,10*state.dpr,0,0,Math.PI*2); ctx.fillStyle='rgba(248,113,113,.95)'; ctx.fill();
    const ring = (phase === 'bite' ? 58 + Math.sin(t*7)*10 : 28 + Math.sin(t*2)*4)*state.dpr;
    ctx.beginPath(); ctx.ellipse(bx,by+22*state.dpr,ring,ring*.36,0,0,Math.PI*2); ctx.strokeStyle = phase === 'bite' ? 'rgba(251,191,36,.86)' : 'rgba(103,232,249,.32)'; ctx.lineWidth = Math.max(2,3*state.dpr); ctx.stroke();
  }
  if (phase === 'reel') {
    const fx = w*(0.48 + Math.sin(t*1.35)*.22);
    const fy = h*(0.68 + Math.sin(t*2.0)*.045);
    ctx.beginPath(); ctx.ellipse(fx,fy,42*state.dpr,16*state.dpr,Math.sin(t)*.08,0,Math.PI*2); ctx.fillStyle='rgba(255,247,221,.70)'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(fx-34*state.dpr,fy); ctx.lineTo(fx-72*state.dpr,fy-22*state.dpr); ctx.lineTo(fx-72*state.dpr,fy+22*state.dpr); ctx.closePath(); ctx.fillStyle='rgba(56,189,248,.48)'; ctx.fill();
    ctx.beginPath(); ctx.arc(fx,fy,70*state.dpr,0,Math.PI*2); ctx.strokeStyle='rgba(192,132,252,.20)'; ctx.lineWidth=Math.max(1,2*state.dpr); ctx.stroke();
  }
  ctx.restore();
  const fpsEl = document.getElementById('v47-renderer-fps'); if (fpsEl) fpsEl.textContent = state.fps ? Math.round(state.fps)+' FPS' : 'Auto FPS';
  requestAnimationFrame(draw);
}
window.AquaV49Runtime = { setMode(mode){ state.mode = mode || 'auto'; }, getStats(){ return { fps: state.fps, mode: state.mode, dpr: state.dpr }; }, isRunning(){ return state.running; } };
requestAnimationFrame(draw);
