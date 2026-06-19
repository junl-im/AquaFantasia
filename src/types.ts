export type Screen = 'login' | 'village' | 'map' | 'fishing' | 'gear' | 'inventory' | 'dex' | 'shop' | 'mission' | 'ranking';
export type FishingState = 'idle' | 'casting' | 'waiting' | 'bite' | 'reeling' | 'success' | 'fail';
export type RegionKey = 'lake' | 'river' | 'harbor' | 'deep' | 'palace' | 'dimension' | 'glacier' | 'storm' | 'mangrove' | 'lunar' | 'reefFestival';
export type Rarity = 'COMMON' | 'RARE' | 'EPIC' | 'BOSS';

export type VillageTileKind = 'grass' | 'sand' | 'sea' | 'stone' | 'wood' | 'plaza';
export type VillageBuildingType = 'house' | 'market' | 'inn' | 'guild' | 'harbor' | 'warehouse' | 'aquarium' | 'fountain' | 'flower' | 'path';

export interface VillageBuildingSave {
  id: string;
  type: VillageBuildingType;
  x: number;
  y: number;
  w: number;
  h: number;
  builtAt: number;
}

export interface VillageSave {
  level: number;
  fund: number;
  development: number;
  unlockedSize: 20 | 30 | 40 | 60 | 80 | number;
  buildings: VillageBuildingSave[];
  paths: string[];
  tourists: number;
  autoIncome: number;
}


export interface RegionInfo {
  key: RegionKey;
  name: string;
  subtitle: string;
  bg: string;
  difficulty: number;
  waterSpeed: number;
  color: string;
  tide: string;
  unlockHint: string;
}

export interface FishInfo {
  id: string;
  name: string;
  regionKey: RegionKey;
  region: string;
  img: string;
  rarity: Rarity;
  reward: number;
  weight: number;
}

export interface GearState {
  rodLevel: number;
  reelLevel: number;
  lureStock: number;
  lineLevel: number;
}

export interface SaveData {
  version: string;
  screen: Screen;
  playerName: string;
  region: RegionKey;
  coins: number;
  caught: Record<string, number>;
  missions: Record<string, boolean>;
  serverLinked: boolean;
  gear: GearState;
  bestStreak: number;
  currentStreak: number;
  totalCasts: number;
  totalSuccess: number;
  totalFail: number;
  unlockedRegions: RegionKey[];
  mastery: Record<string, number>;
  lastRescueAt: number;
  village: VillageSave;
}

export interface ToastOptions {
  type?: 'normal' | 'mission' | 'dex' | 'shop' | 'fishing' | 'reward';
  title: string;
  message?: string;
  actionScreen?: Screen;
}
