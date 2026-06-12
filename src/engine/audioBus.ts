import { Howl, Howler } from 'howler';

export class AquaAudioBus {
  private unlocked = false;
  private sprite?: Howl;

  async unlock() {
    if (this.unlocked) return;
    Howler.volume(0.82);
    this.unlocked = true;
  }

  loadSprite(src: string, sprite: Record<string, [number, number]>) {
    this.sprite = new Howl({ src: [src], sprite, html5: false, preload: true });
  }

  play(name: string) {
    if (!this.unlocked || !this.sprite) return;
    this.sprite.play(name);
  }
}
