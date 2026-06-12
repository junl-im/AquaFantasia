import { Application, Assets, Container, Graphics, Ticker } from 'pixi.js';
import type { AquaEngineConfig } from './types';

export type FishingPhase = 'ready' | 'casting' | 'bite' | 'reel' | 'success' | 'fail';

export class AquaFishingRenderer {
  app?: Application;
  stage = new Container();
  fish = new Graphics();
  bobber = new Graphics();
  phase: FishingPhase = 'ready';

  async init(config: AquaEngineConfig) {
    const resolution = Math.min(window.devicePixelRatio || 1, config.quality === 'lite' ? 1.1 : config.dprCap || 1.6);
    this.app = new Application();
    await this.app.init({ resizeTo: config.canvasHost, backgroundAlpha: 0, antialias: config.quality !== 'lite', resolution, autoDensity: true, powerPreference: config.quality === 'lite' ? 'low-power' : 'high-performance' });
    config.canvasHost.appendChild(this.app.canvas);
    this.app.stage.addChild(this.stage);
    await Assets.load(config.atlasUrl).catch(() => undefined);
    this.stage.addChild(this.fish, this.bobber);
    this.app.ticker.add((ticker: Ticker) => this.tick(ticker.deltaMS));
    return this;
  }

  setPhase(phase: FishingPhase) { this.phase = phase; }

  tick(ms: number) {
    if (!this.app) return;
    const t = performance.now() / 1000;
    const w = this.app.screen.width;
    const h = this.app.screen.height;
    this.fish.clear();
    this.bobber.clear();
    if (this.phase === 'reel') {
      const x = w * (0.45 + Math.sin(t * 1.4) * 0.22);
      const y = h * (0.68 + Math.sin(t * 2.1) * 0.04);
      this.fish.ellipse(x, y, 34, 14).fill({ color: 0xfff7dd, alpha: 0.82 });
      this.fish.poly([x - 30, y, x - 58, y - 16, x - 58, y + 16]).fill({ color: 0x48d7ff, alpha: 0.58 });
    }
    if (this.phase === 'casting' || this.phase === 'bite' || this.phase === 'reel') {
      const x = w * (0.52 + Math.sin(t * 0.7) * 0.04);
      const y = h * (0.55 + Math.sin(t * 1.4) * 0.02);
      this.bobber.ellipse(x, y, 13, 26).fill({ color: 0xfff7dd, alpha: 0.92 });
      this.bobber.ellipse(x, y - 6, 13, 12).fill({ color: 0xff6b6b, alpha: 0.86 });
      this.bobber.ellipse(x, y + 20, this.phase === 'bite' ? 58 : 34, this.phase === 'bite' ? 22 : 13).stroke({ color: 0xf7d071, alpha: this.phase === 'bite' ? 0.82 : 0.35, width: 3 });
    }
  }

  destroy() { this.app?.destroy(true); this.app = undefined; }
}
