export type AquaQualityMode = 'auto' | 'lite' | 'balanced' | 'quality';

export interface AquaEngineConfig {
  canvasHost: HTMLElement;
  atlasUrl: string;
  atlasJsonUrl: string;
  quality: AquaQualityMode;
  dprCap: number;
}

export interface AquaFrameStats {
  fps: number;
  averageFrameMs: number;
  quality: AquaQualityMode;
  reduced: boolean;
}
