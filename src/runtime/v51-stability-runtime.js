// AquaFantasia v5.1 Stability Runtime
// Lightweight frame/touch governor layered on top of the v5.0 fishing canvas.
const st = { mode: localStorage.getItem('aqua_v51_runtime_mode') || 'auto', fps: 0, frames: 0, last: performance.now(), touchLatency: 0, lastTouch: 0, running: false, samples: [] };
function mobileLike(){ return /Mobile|Android|iPhone|iPad|KAKAOTALK|wv/i.test(navigator.userAgent || ''); }
function shouldLite(){ return st.mode === 'lite' || (st.mode === 'auto' && (mobileLike() || navigator.connection?.saveData || Number(navigator.deviceMemory || 4) <= 3 || Number(navigator.hardwareConcurrency || 4) <= 4)); }
function applyBudget(){
  const lite = shouldLite();
  document.body.classList.toggle('v51-stability-lite', lite);
  document.body.classList.add('ui-v51');
  try { window.AquaV50Runtime?.setMode?.(lite ? 'lite' : st.mode === 'quality' ? 'quality' : 'balanced'); } catch {}
  try { window.AquaV49Runtime?.setMode?.(lite ? 'lite' : st.mode === 'quality' ? 'quality' : 'balanced'); } catch {}
}
function sample(now){
  st.frames += 1;
  if (now - st.last > 850) {
    st.fps = st.frames * 1000 / (now - st.last);
    st.frames = 0; st.last = now;
    st.samples.push(st.fps); if (st.samples.length > 12) st.samples.shift();
    if (st.fps > 0 && st.fps < 24 && st.mode === 'auto') document.body.classList.add('perf-lite', 'v51-stability-lite');
  }
  requestAnimationFrame(sample);
}
function onPointerDown(){ st.lastTouch = performance.now(); requestAnimationFrame(() => { st.touchLatency = Math.max(0, performance.now() - st.lastTouch); }); }
function avgFps(){ return st.samples.length ? st.samples.reduce((a,b)=>a+b,0) / st.samples.length : st.fps; }
window.AquaV51Runtime = {
  setMode(mode){ st.mode = mode || 'auto'; localStorage.setItem('aqua_v51_runtime_mode', st.mode); applyBudget(); },
  getMode(){ return st.mode; },
  getStats(){ return { fps: avgFps(), touchLatency: st.touchLatency, lite: shouldLite(), mode: st.mode, running: st.running }; },
  sweep(){ try { caches?.keys?.().then(keys => keys.filter(k => k.includes('aqua-fantasia') && !k.startsWith('aqua-fantasia-v5.1.0')).forEach(k => caches.delete(k))); } catch {} }
};
window.addEventListener('pointerdown', onPointerDown, { passive: true, capture: true });
applyBudget();
requestAnimationFrame(sample);
