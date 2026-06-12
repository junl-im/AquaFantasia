import { AquaFishingRenderer } from './fishingRenderer';
import type { AquaQualityMode } from './types';

export interface FishingRuntimeBridgeOptions { host: HTMLElement; quality: AquaQualityMode; }

export async function connectFishingRuntime(options: FishingRuntimeBridgeOptions) {
  const renderer = new AquaFishingRenderer();
  await renderer.init({
    canvasHost: options.host,
    atlasUrl: '/assets/atlas/aqua_fishing_v49.webp',
    atlasJsonUrl: '/assets/atlas/aqua_fishing_v49.atlas.json',
    quality: options.quality,
    dprCap: options.quality === 'lite' ? 1.05 : 1.45,
  });
  return renderer;
}
