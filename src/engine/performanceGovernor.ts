import type { AquaFrameStats, AquaQualityMode } from './types';

export class PerformanceGovernor {
  private last = performance.now();
  private samples: number[] = [];
  private quality: AquaQualityMode;

  constructor(initial: AquaQualityMode = 'auto') {
    this.quality = initial;
  }

  tick(now = performance.now()): AquaFrameStats {
    const delta = Math.max(1, now - this.last);
    this.last = now;
    this.samples.push(delta);
    if (this.samples.length > 90) this.samples.shift();
    const averageFrameMs = this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
    const fps = 1000 / averageFrameMs;
    const reduced = fps < 44 || averageFrameMs > 23;
    if (this.quality === 'auto' && reduced) document.body.classList.add('perf-lite');
    return { fps, averageFrameMs, quality: this.quality, reduced };
  }

  setQuality(mode: AquaQualityMode) {
    this.quality = mode;
    document.body.classList.toggle('perf-lite', mode === 'lite');
  }
}
