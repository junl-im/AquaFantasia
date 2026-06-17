export type RuntimeQualityTier = 'lite' | 'balanced' | 'high';

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

export class RuntimeQualityManager {
  private quality: RuntimeQualityTier = 'balanced';
  private started = false;
  private raf = 0;
  private last = 0;
  private samples: number[] = [];
  private lowFpsFrames = 0;
  private highFpsFrames = 0;
  private lastAppliedQuality: RuntimeQualityTier | '' = '';

  start(): void {
    if (this.started) return;
    this.started = true;
    this.quality = this.detectInitialTier();
    this.applyQuality('initial');
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.tick);
    window.addEventListener('resize', this.syncViewportVars, { passive: true });
    window.visualViewport?.addEventListener('resize', this.syncViewportVars, { passive: true });
    window.visualViewport?.addEventListener('scroll', this.syncViewportVars, { passive: true });
    window.addEventListener('orientationchange', this.syncViewportVars, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.last = performance.now();
        this.samples = [];
        this.applyQuality('resume');
      }
    }, { passive: true });
  }

  tier(): RuntimeQualityTier {
    return this.quality;
  }

  isLite(): boolean {
    return this.quality === 'lite';
  }

  recommendedDprCap(): number {
    return this.quality === 'high' ? 2.35 : this.quality === 'balanced' ? 1.85 : 1.35;
  }

  private detectInitialTier(): RuntimeQualityTier {
    const cores = navigator.hardwareConcurrency ?? 4;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
    const dpr = window.devicePixelRatio || 1;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const small = Math.min(window.innerWidth, window.innerHeight) < 380;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection?.saveData ?? false;
    const slowNetwork = /(^|-)2g$/.test((navigator as Navigator & { connection?: { effectiveType?: string } }).connection?.effectiveType ?? '');
    if (reduced || saveData || slowNetwork || cores <= 3 || memory <= 2 || small) return 'lite';
    if (cores >= 8 && memory >= 6 && dpr >= 2) return 'high';
    return 'balanced';
  }

  private tick = (now: number): void => {
    const dt = now - this.last;
    this.last = now;
    if (dt > 0 && dt < 1000) {
      const fps = 1000 / dt;
      this.samples.push(fps);
      if (this.samples.length > 60) this.samples.shift();
      if (this.samples.length >= 40) this.evaluateAverageFps();
    }
    this.raf = requestAnimationFrame(this.tick);
  };

  private evaluateAverageFps(): void {
    const avg = this.samples.reduce((sum, fps) => sum + fps, 0) / this.samples.length;
    const current = this.quality;
    if (avg < 38) {
      this.lowFpsFrames += 1;
      this.highFpsFrames = 0;
    } else {
      this.lowFpsFrames = Math.max(0, this.lowFpsFrames - 1);
      if (avg > 56) this.highFpsFrames += 1;
      else this.highFpsFrames = Math.max(0, this.highFpsFrames - 1);
    }

    if (this.lowFpsFrames > 7 && current !== 'lite') {
      this.quality = current === 'high' ? 'balanced' : 'lite';
      this.samples = [];
      this.lowFpsFrames = 0;
      this.highFpsFrames = 0;
      this.applyQuality('fps-downshift');
    } else if (this.highFpsFrames > 220 && current === 'lite' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.quality = 'balanced';
      this.samples = [];
      this.lowFpsFrames = 0;
      this.highFpsFrames = 0;
      this.applyQuality('fps-recovery');
    }
  }

  private applyQuality(reason: string): void {
    const root = document.documentElement;
    const changed = this.lastAppliedQuality !== this.quality;
    this.lastAppliedQuality = this.quality;
    root.dataset.runtimeQuality = this.quality;
    root.dataset.runtimeQualityReason = reason;
    root.classList.toggle('runtime-quality-lite', this.quality === 'lite');
    root.classList.toggle('runtime-quality-balanced', this.quality === 'balanced');
    root.classList.toggle('runtime-quality-high', this.quality === 'high');
    root.style.setProperty('--runtime-dpr-cap', String(this.recommendedDprCap()));
    root.style.setProperty('--water-fx-alpha', this.quality === 'lite' ? '.48' : this.quality === 'high' ? '.70' : '.60');
    root.style.setProperty('--water-fx-blend', this.quality === 'lite' ? '.78' : this.quality === 'high' ? '1.04' : '.92');
    root.style.setProperty('--ui-motion-scale', this.quality === 'lite' ? '.58' : '1');
    root.style.setProperty('--premium-depth-alpha', this.quality === 'lite' ? '.42' : this.quality === 'high' ? '.72' : '.58');
    this.syncViewportVars();
    if (changed) {
      window.dispatchEvent(new CustomEvent('aqua-runtime-quality-change', { detail: { tier: this.quality, reason, dprCap: this.recommendedDprCap() } }));
    }
  }

  private syncViewportVars = (): void => {
    const vv = window.visualViewport;
    const width = Math.max(1, Math.floor(vv?.width ?? window.innerWidth));
    const height = Math.max(1, Math.floor(vv?.height ?? window.innerHeight));
    const portraitWidth = clamp(width, 300, 500);
    const offsetLeft = Math.max(0, Math.floor(vv?.offsetLeft ?? 0));
    const offsetTop = Math.max(0, Math.floor(vv?.offsetTop ?? 0));
    const root = document.documentElement;
    root.style.setProperty('--runtime-viewport-width', `${width}px`);
    root.style.setProperty('--runtime-viewport-height', `${height}px`);
    root.style.setProperty('--runtime-shell-width', `${portraitWidth}px`);
    root.style.setProperty('--runtime-visual-left', `${offsetLeft}px`);
    root.style.setProperty('--runtime-visual-top', `${offsetTop}px`);
  };
}
