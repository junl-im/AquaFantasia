import { Application, Assets, Container, Sprite } from 'pixi.js';
import type { AquaEngineConfig } from './types';

export class AquaPixiStage {
  app?: Application;
  root = new Container();

  async init(config: AquaEngineConfig) {
    const resolution = Math.min(window.devicePixelRatio || 1, config.dprCap || 2);
    this.app = new Application();
    await this.app.init({ resizeTo: config.canvasHost, backgroundAlpha: 0, antialias: config.quality !== 'lite', resolution, autoDensity: true, powerPreference: config.quality === 'lite' ? 'low-power' : 'high-performance' });
    config.canvasHost.appendChild(this.app.canvas);
    this.app.stage.addChild(this.root);
    const texture = await Assets.load(config.atlasUrl);
    const sprite = new Sprite(texture);
    sprite.alpha = config.quality === 'lite' ? 0.08 : 0.16;
    sprite.width = this.app.screen.width;
    sprite.height = this.app.screen.height;
    this.root.addChild(sprite);
    return this;
  }

  destroy() {
    this.app?.destroy(true);
    this.app = undefined;
  }
}
