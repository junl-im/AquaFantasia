import { AquaPixiStage } from './engine/pixiStage';
import { PerformanceGovernor } from './engine/performanceGovernor';
import { AquaAudioBus } from './engine/audioBus';
import { loadAquaAtlas } from './engine/webpAtlas';
import { createFirebaseClient } from './integrations/firebaseClient';
import { registerPwa } from './integrations/pwaRuntime';

const host = document.querySelector<HTMLElement>('[data-aqua-pixi-host]');
const quality = (localStorage.getItem('aqua_v47_renderer_mode') || 'auto') as 'auto' | 'lite' | 'balanced' | 'quality';
const governor = new PerformanceGovernor(quality);
const audio = new AquaAudioBus();

async function boot() {
  await registerPwa().catch(console.warn);
  await createFirebaseClient().catch(console.warn);
  await loadAquaAtlas('/assets/atlas/aqua_fishing_v49.atlas.json').catch(console.warn);
  if (host) {
    const stage = new AquaPixiStage();
    await stage.init({ canvasHost: host, atlasUrl: '/assets/atlas/aqua_fishing_v49.webp', atlasJsonUrl: '/assets/atlas/aqua_fishing_v49.atlas.json', quality, dprCap: quality === 'lite' ? 1.25 : 2 });
  }
  const loop = (t: number) => { governor.tick(t); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
  window.addEventListener('pointerdown', () => audio.unlock(), { once: true });
}

boot().catch((error) => console.error('[Aqua v4.9 runtime boot]', error));
