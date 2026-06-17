import { Howl } from 'howler';

type SoundKey = 'tap' | 'cast' | 'bite' | 'success' | 'fail';
const sounds: Partial<Record<SoundKey, Howl>> = {};
let enabled = true;

const paths: Record<SoundKey, string> = {
  tap: './assets/audio/tap.wav',
  cast: './assets/audio/cast.wav',
  bite: './assets/audio/bite.wav',
  success: './assets/audio/success.wav',
  fail: './assets/audio/fail.wav',
};

export function initAudio(): void {
  (Object.keys(paths) as SoundKey[]).forEach((key) => {
    sounds[key] = new Howl({ src: [paths[key]], volume: key === 'success' ? 0.42 : 0.25, preload: true });
  });
}

export function playSound(key: SoundKey): void {
  if (!enabled) return;
  try { sounds[key]?.play(); } catch { /* audio is optional */ }
}

export function setAudioEnabled(value: boolean): void {
  enabled = value;
}
