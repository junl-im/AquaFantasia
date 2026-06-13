export type Screen = 'login' | 'village' | 'fishing' | 'gear' | 'dex' | 'shop' | 'mission';
export type FishingState = 'idle' | 'casting' | 'waiting' | 'bite' | 'reeling' | 'success' | 'fail';
export type RegionKey = 'lake' | 'river' | 'harbor' | 'deep' | 'palace' | 'dimension';

export interface RegionInfo {
  key: RegionKey;
  name: string;
  subtitle: string;
  bg: string;
  difficulty: number;
}

export interface GearState {
  rodLevel: number;
  reelLevel: number;
  lureStock: number;
}

export interface SaveData {
  version: string;
  screen: Screen;
  region: RegionKey;
  coins: number;
  caught: Record<string, number>;
  missions: Record<string, boolean>;
  serverLinked: boolean;
  gear: GearState;
  bestStreak: number;
}

export interface ToastOptions {
  type?: 'normal' | 'mission' | 'dex' | 'shop' | 'fishing' | 'reward';
  title: string;
  message?: string;
  actionScreen?: Screen;
}
