import { Application, Assets, Container, Graphics, Sprite, Text, Texture } from 'pixi.js';
import type { SaveData, VillageBuildingSave, VillageBuildingType, VillageTileKind } from './types';

const MAP_SIZE = 40;
const TILE_W = 80;
const TILE_H = 40;
const BASE_SCALE = 0.92;
const WORLD_ORIGIN_X = MAP_SIZE * TILE_W * 0.5;
const WORLD_ORIGIN_Y = 120;

type ToastKind = 'normal' | 'mission' | 'dex' | 'shop' | 'fishing' | 'reward';

type WorldNpcRole = 'chief' | 'merchant' | 'guild' | 'captain' | 'tourist' | 'vip';

type BuildDefinition = {
  type: VillageBuildingType;
  label: string;
  size: [number, number];
  cost: number;
  score: number;
  texture?: string;
  kind: 'building' | 'prop' | 'path';
  description: string;
};

type WorldCallbacks = {
  onSave: () => void;
  onGoFishing: () => void;
  onToast: (toast: { type?: ToastKind; title: string; message?: string }) => void;
};

type VillageWorldOptions = WorldCallbacks & {
  root: HTMLElement;
  stageHost: HTMLElement;
  save: SaveData;
};

type PointerTrack = {
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  moved: boolean;
};

type Actor = {
  id: string;
  role: WorldNpcRole | 'player';
  name: string;
  tileX: number;
  tileY: number;
  x: number;
  y: number;
  speed: number;
  path: Array<[number, number]>;
  node: Container;
  body: Graphics;
  label: Text;
  mood: string;
  talk: string[];
  targetTimer: number;
};

const BUILD_DEFS: Record<VillageBuildingType, BuildDefinition> = {
  house: {
    type: 'house',
    label: '주민 집',
    size: [3, 3],
    cost: 180,
    score: 70,
    texture: './assets/v2/village/buildings/building_fisherman_house.png',
    kind: 'building',
    description: '주민 수를 늘리는 기본 주택',
  },
  market: {
    type: 'market',
    label: '어시장',
    size: [4, 4],
    cost: 360,
    score: 130,
    texture: './assets/v2/village/buildings/building_fish_market.png',
    kind: 'building',
    description: '자동 판매와 관광 수익의 핵심',
  },
  inn: {
    type: 'inn',
    label: '여관',
    size: [4, 4],
    cost: 420,
    score: 150,
    texture: './assets/v2/village/buildings/building_village_inn.png',
    kind: 'building',
    description: '관광객 체류 시간을 늘립니다',
  },
  guild: {
    type: 'guild',
    label: '낚시 길드',
    size: [4, 4],
    cost: 400,
    score: 140,
    texture: './assets/v2/village/buildings/building_fishing_guild.png',
    kind: 'building',
    description: '낚시 퀘스트와 수역 개척의 출발점',
  },
  harbor: {
    type: 'harbor',
    label: '항구 사무소',
    size: [4, 4],
    cost: 0,
    score: 120,
    texture: './assets/v2/village/buildings/building_harbor_office.png',
    kind: 'building',
    description: '항구로 이동해 낚시 지역을 선택합니다',
  },
  warehouse: {
    type: 'warehouse',
    label: '창고',
    size: [3, 3],
    cost: 300,
    score: 100,
    texture: './assets/v2/village/buildings/building_storage_warehouse.png',
    kind: 'building',
    description: '후반 자동 보관 시스템의 기반',
  },
  aquarium: {
    type: 'aquarium',
    label: '수족관',
    size: [4, 4],
    cost: 620,
    score: 210,
    texture: './assets/v2/village/buildings/building_aquarium.png',
    kind: 'building',
    description: '도감과 관광 점수를 크게 올립니다',
  },
  fountain: {
    type: 'fountain',
    label: '분수',
    size: [2, 2],
    cost: 120,
    score: 55,
    kind: 'prop',
    description: '광장 분위기와 행복도를 올립니다',
  },
  flower: {
    type: 'flower',
    label: '꽃밭',
    size: [1, 1],
    cost: 25,
    score: 12,
    kind: 'prop',
    description: '작지만 마을 분위기를 살립니다',
  },
  path: {
    type: 'path',
    label: '돌길',
    size: [1, 1],
    cost: 8,
    score: 4,
    kind: 'path',
    description: '주민 이동속도, 관광객, 수익을 올립니다',
  },
};

const DAY_TALK: Record<WorldNpcRole, string[]> = {
  chief: ['마을을 발전시켜보게. 지금은 광장이 가장 중요하네.', '길을 이어두면 주민들이 훨씬 활발하게 움직인다네.', '현재 목표는 관광객이 머무를 만한 첫 마을을 만드는 것이야.'],
  merchant: ['물고기 10마리만 더 납품해주면 어시장이 커질 거예요.', '오늘은 산호빛 생선이 인기예요.', '상점 앞 길을 넓혀주면 손님이 더 많이 올 것 같아요.'],
  guild: ['항구에서 출항하면 낚시 미니게임으로 이동합니다.', '길드 의뢰는 마을 발전도와 연결될 예정이에요.', '희귀 어종은 새 섬 개척의 열쇠가 됩니다.'],
  captain: ['선착장이 커지면 다른 섬도 개척할 수 있지.', '바다는 넓고, 아직 열리지 않은 수역이 많아.', '출항 준비가 되면 항구 사무소로 오게.'],
  tourist: ['저 꽃밭 너무 예쁘네요.', '항구가 더 커졌군요!', '오늘 고기 많이 잡았나요?'],
  vip: ['이 정도면 고급 휴양섬이 될 가능성이 있군요.', '수족관이 생기면 다시 방문하겠습니다.', '길과 광장 동선이 아주 중요합니다.'],
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function tileKey(x: number, y: number): string {
  return `${x},${y}`;
}

function isoToWorld(x: number, y: number): { x: number; y: number } {
  return {
    x: WORLD_ORIGIN_X + (x - y) * (TILE_W / 2),
    y: WORLD_ORIGIN_Y + (x + y) * (TILE_H / 2),
  };
}

function worldToTile(worldX: number, worldY: number): { x: number; y: number } {
  const dx = worldX - WORLD_ORIGIN_X;
  const dy = worldY - WORLD_ORIGIN_Y;
  const x = Math.floor((dy / (TILE_H / 2) + dx / (TILE_W / 2)) / 2);
  const y = Math.floor((dy / (TILE_H / 2) - dx / (TILE_W / 2)) / 2);
  return { x, y };
}

function centerOfTile(x: number, y: number): { x: number; y: number } {
  return isoToWorld(x + 0.5, y + 0.5);
}

function createDefaultBuildings(): VillageBuildingSave[] {
  return [
    { id: 'b_fountain_0', type: 'fountain', x: 19, y: 19, w: 2, h: 2, builtAt: Date.now() },
    { id: 'b_market_0', type: 'market', x: 13, y: 21, w: 4, h: 4, builtAt: Date.now() },
    { id: 'b_guild_0', type: 'guild', x: 24, y: 21, w: 4, h: 4, builtAt: Date.now() },
    { id: 'b_inn_0', type: 'inn', x: 18, y: 12, w: 4, h: 4, builtAt: Date.now() },
    { id: 'b_harbor_0', type: 'harbor', x: 18, y: 31, w: 4, h: 4, builtAt: Date.now() },
  ];
}

export class VillageWorld {
  private readonly root: HTMLElement;
  private readonly stageHost: HTMLElement;
  private readonly save: SaveData;
  private readonly onSave: () => void;
  private readonly onGoFishing: () => void;
  private readonly onToast: WorldCallbacks['onToast'];
  private app?: Application;
  private world = new Container();
  private tileLayer = new Graphics();
  private buildingLayer = new Container();
  private actorLayer = new Container();
  private previewLayer = new Container();
  private textures = new Map<string, Texture>();
  private tileKinds = new Map<string, VillageTileKind>();
  private pathTiles = new Set<string>();
  private blockedTiles = new Set<string>();
  private player?: Actor;
  private npcs: Actor[] = [];
  private camera = { x: 0, y: 0, scale: BASE_SCALE };
  private pointer?: PointerTrack;
  private selectedBuild: VillageBuildingType | null = null;
  private hoverTile: { x: number; y: number } | null = null;
  private lastDialogAt = 0;
  private lastPassiveIncomeAt = 0;
  private destroyed = false;
  private readonly resizeHandler = () => this.resize();

  constructor(options: VillageWorldOptions) {
    this.root = options.root;
    this.stageHost = options.stageHost;
    this.save = options.save;
    this.onSave = options.onSave;
    this.onGoFishing = options.onGoFishing;
    this.onToast = options.onToast;
    this.ensureVillageState();
  }

  async init(): Promise<void> {
    const app = new Application();
    await app.init({
      resizeTo: this.stageHost,
      backgroundAlpha: 0,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      powerPreference: 'high-performance',
    });
    this.app = app;
    this.stageHost.appendChild(app.canvas);
    this.world.sortableChildren = true;
    this.buildingLayer.sortableChildren = true;
    this.actorLayer.sortableChildren = true;
    app.stage.addChild(this.world);
    this.world.addChild(this.tileLayer, this.buildingLayer, this.actorLayer, this.previewLayer);
    this.generateTiles();
    await this.loadTextures();
    this.renderTiles();
    this.renderBuildings();
    this.spawnActors();
    this.bindStageInput();
    this.bindUi();
    this.resize();
    window.addEventListener('resize', this.resizeHandler, { passive: true });
    app.ticker.add((ticker: { deltaMS: number }) => this.tick(ticker.deltaMS));
    this.syncHud();
    this.showGuide('마을 입장 완료', '빈 바닥을 터치하면 캐릭터가 이동합니다. 건물/NPC 근처를 터치하면 상호작용합니다.');
  }

  destroy(): void {
    this.destroyed = true;
    window.removeEventListener('resize', this.resizeHandler);
    this.app?.destroy(true, { children: true, texture: false });
    this.app = undefined;
  }

  setBuildMode(type: VillageBuildingType | null): void {
    this.selectedBuild = type;
    this.root.classList.toggle('v2-build-active', Boolean(type));
    this.root.querySelectorAll<HTMLElement>('[data-build-type]').forEach((node) => {
      node.classList.toggle('active', node.dataset.buildType === type);
    });
    this.previewLayer.removeChildren();
    if (type) {
      const def = BUILD_DEFS[type];
      this.showGuide('설치 모드', `${def.label} 선택됨 · ${def.description}`);
    }
  }

  zoom(delta: number): void {
    this.camera.scale = clamp(this.camera.scale + delta, 0.55, 1.65);
    this.applyCamera();
  }

  centerCameraOnPlayer(): void {
    if (!this.player || !this.app) return;
    this.camera.x = this.app.screen.width / 2 - this.player.x * this.camera.scale;
    this.camera.y = this.app.screen.height / 2 - this.player.y * this.camera.scale;
    this.applyCamera();
  }

  private ensureVillageState(): void {
    if (!this.save.village) {
      this.save.village = {
        level: 1,
        fund: 0,
        development: 0,
        unlockedSize: 40,
        buildings: createDefaultBuildings(),
        paths: [],
        tourists: 0,
        autoIncome: 0,
      };
      this.onSave();
    }
    if (!Array.isArray(this.save.village.buildings) || this.save.village.buildings.length === 0) {
      this.save.village.buildings = createDefaultBuildings();
    }
    if (!Array.isArray(this.save.village.paths)) this.save.village.paths = [];
    if (!this.save.village.unlockedSize) this.save.village.unlockedSize = 40;
  }

  private generateTiles(): void {
    this.tileKinds.clear();
    this.pathTiles.clear();
    for (let y = 0; y < MAP_SIZE; y += 1) {
      for (let x = 0; x < MAP_SIZE; x += 1) {
        let kind: VillageTileKind = 'grass';
        if (y >= 35) kind = 'sea';
        else if (y >= 32 || x <= 2 || x >= 37) kind = 'sand';
        else if ((x >= 17 && x <= 22 && y >= 17 && y <= 24) || (x >= 16 && x <= 23 && y >= 18 && y <= 22)) kind = 'plaza';
        else if (x === 20 && y >= 14 && y <= 34) kind = 'stone';
        else if (y === 22 && x >= 12 && x <= 28) kind = 'stone';
        if (kind === 'stone' || kind === 'plaza') this.pathTiles.add(tileKey(x, y));
        this.tileKinds.set(tileKey(x, y), kind);
      }
    }
    for (const key of this.save.village.paths) {
      this.tileKinds.set(key, 'stone');
      this.pathTiles.add(key);
    }
  }

  private async loadTextures(): Promise<void> {
    const urls = Array.from(new Set(Object.values(BUILD_DEFS).map((def) => def.texture).filter((url): url is string => Boolean(url))));
    try {
      const result = await Assets.load(urls);
      for (const url of urls) {
        const texture = result[url] as Texture | undefined;
        if (texture) this.textures.set(url, texture);
      }
    } catch (error) {
      console.warn('[AquaFantasia] village texture load skipped', error);
    }
  }

  private tileColor(kind: VillageTileKind): number {
    if (kind === 'sea') return 0x4fc9e8;
    if (kind === 'sand') return 0xf3d999;
    if (kind === 'plaza') return 0xd7c6a7;
    if (kind === 'stone') return 0xb8c4c8;
    if (kind === 'wood') return 0xc99664;
    return 0x80c978;
  }

  private tileStroke(kind: VillageTileKind): number {
    if (kind === 'sea') return 0x89efff;
    if (kind === 'sand') return 0xffefbd;
    if (kind === 'stone' || kind === 'plaza') return 0xf7f3e5;
    return 0xa4e38e;
  }

  private renderTiles(): void {
    this.tileLayer.clear();
    for (let y = 0; y < MAP_SIZE; y += 1) {
      for (let x = 0; x < MAP_SIZE; x += 1) {
        const kind = this.tileKinds.get(tileKey(x, y)) ?? 'grass';
        const p = isoToWorld(x, y);
        const c = this.tileColor(kind);
        this.tileLayer.poly([p.x, p.y + TILE_H / 2, p.x + TILE_W / 2, p.y, p.x + TILE_W, p.y + TILE_H / 2, p.x + TILE_W / 2, p.y + TILE_H]);
        this.tileLayer.fill({ color: c, alpha: kind === 'sea' ? 0.92 : 0.98 });
        this.tileLayer.stroke({ color: this.tileStroke(kind), alpha: 0.34, width: 1 });
        if (kind === 'sea') {
          this.tileLayer.poly([p.x + 10, p.y + TILE_H / 2, p.x + TILE_W / 2, p.y + 7, p.x + TILE_W - 10, p.y + TILE_H / 2, p.x + TILE_W / 2, p.y + TILE_H - 7]);
          this.tileLayer.stroke({ color: 0xffffff, alpha: 0.16, width: 1 });
        }
      }
    }
  }

  private renderBuildings(): void {
    this.buildingLayer.removeChildren();
    this.rebuildCollision();
    for (const building of this.save.village.buildings) {
      const def = BUILD_DEFS[building.type];
      if (!def) continue;
      const container = new Container();
      container.zIndex = (building.y + building.h) * 20 + 4;
      const center = centerOfTile(building.x + building.w / 2 - 0.5, building.y + building.h - 0.5);
      if (def.texture && this.textures.has(def.texture)) {
        const sprite = new Sprite(this.textures.get(def.texture)!);
        sprite.anchor.set(0.5, 1);
        const targetW = Math.max(130, building.w * TILE_W * 1.12);
        sprite.scale.set(targetW / Math.max(1, sprite.texture.width));
        sprite.position.set(center.x, center.y + TILE_H * 0.88);
        container.addChild(sprite);
      } else {
        const g = this.createPropGraphic(def.type, building.w, building.h);
        g.position.set(center.x, center.y + TILE_H * 0.4);
        container.addChild(g);
      }
      const label = new Text({
        text: def.label,
        style: { fontFamily: 'Arial', fontSize: 18, fontWeight: '800', fill: 0x315064, stroke: { color: 0xffffff, width: 4 } },
      });
      label.anchor.set(0.5);
      label.position.set(center.x, center.y + TILE_H * 0.75);
      container.addChild(label);
      this.buildingLayer.addChild(container);
    }
  }

  private createPropGraphic(type: VillageBuildingType, w: number, h: number): Graphics {
    const g = new Graphics();
    if (type === 'fountain') {
      g.circle(0, -14, 42).fill({ color: 0x9ee8ff, alpha: 0.96 }).stroke({ color: 0xffffff, width: 8, alpha: 0.8 });
      g.circle(0, -16, 21).fill({ color: 0x48bdda, alpha: 0.92 });
      g.circle(0, -46, 9).fill({ color: 0xffffff, alpha: 0.92 });
      g.moveTo(0, -46).lineTo(0, -80).stroke({ color: 0x9ee8ff, width: 5, alpha: 0.76 });
      return g;
    }
    if (type === 'flower') {
      for (let i = 0; i < 6; i += 1) {
        const a = (Math.PI * 2 * i) / 6;
        g.circle(Math.cos(a) * 15, Math.sin(a) * 8 - 8, 10).fill({ color: i % 2 ? 0xff96c8 : 0xffdf6d, alpha: 0.95 });
      }
      g.circle(0, -8, 7).fill({ color: 0xfaf1a4, alpha: 1 });
      return g;
    }
    g.roundRect(-w * 16, -h * 16, w * 32, h * 32, 12).fill({ color: 0xf6d58b, alpha: 0.9 }).stroke({ color: 0xffffff, width: 3, alpha: 0.8 });
    return g;
  }

  private rebuildCollision(): void {
    this.blockedTiles.clear();
    for (let y = 0; y < MAP_SIZE; y += 1) {
      for (let x = 0; x < MAP_SIZE; x += 1) {
        if (this.tileKinds.get(tileKey(x, y)) === 'sea') this.blockedTiles.add(tileKey(x, y));
      }
    }
    for (const b of this.save.village.buildings) {
      if (b.type === 'flower' || b.type === 'fountain') continue;
      for (let yy = b.y; yy < b.y + b.h; yy += 1) {
        for (let xx = b.x; xx < b.x + b.w; xx += 1) {
          this.blockedTiles.add(tileKey(xx, yy));
        }
      }
    }
  }

  private spawnActors(): void {
    this.actorLayer.removeChildren();
    this.npcs = [];
    this.player = this.createActor('player', 'player', '나', 20, 29, 0x1e9bff, '기대');
    this.actorLayer.addChild(this.player.node);
    const baseNpcs: Array<[WorldNpcRole, string, number, number, number, string]> = [
      ['chief', '촌장', 19, 18, 0xffd36e, '행복'],
      ['merchant', '상인', 14, 25, 0xff8b63, '즐거움'],
      ['guild', '길드원', 27, 25, 0x8ec7ff, '열정'],
      ['captain', '선장', 21, 31, 0x7dd0c5, '피곤'],
    ];
    const score = this.calculateDevelopment();
    if (score >= 100) baseNpcs.push(['tourist', '관광객', 17, 23, 0xffbee8, '감탄']);
    if (score >= 500) baseNpcs.push(['tourist', '관광객', 23, 18, 0xffbee8, '여행']);
    if (score >= 1000) baseNpcs.push(['vip', 'VIP', 22, 23, 0xb895ff, '만족']);
    for (const [role, name, x, y, color, mood] of baseNpcs) {
      const actor = this.createActor(`npc_${role}_${x}_${y}`, role, name, x, y, color, mood);
      this.npcs.push(actor);
      this.actorLayer.addChild(actor.node);
    }
  }

  private createActor(id: string, role: Actor['role'], name: string, tileX: number, tileY: number, color: number, mood: string): Actor {
    const p = centerOfTile(tileX, tileY);
    const node = new Container();
    node.zIndex = tileY * 20 + 16;
    const shadow = new Graphics();
    shadow.ellipse(0, 10, 18, 8).fill({ color: 0x294b55, alpha: 0.26 });
    const body = new Graphics();
    body.circle(0, -15, 18).fill({ color, alpha: 1 }).stroke({ color: 0xffffff, width: 4, alpha: 0.92 });
    body.circle(-6, -19, 2.8).fill({ color: 0x274659, alpha: 1 });
    body.circle(6, -19, 2.8).fill({ color: 0x274659, alpha: 1 });
    body.roundRect(-10, -4, 20, 24, 10).fill({ color: role === 'player' ? 0x0f83d3 : 0xffffff, alpha: role === 'player' ? 0.92 : 0.7 });
    const label = new Text({ text: name, style: { fontFamily: 'Arial', fontSize: 17, fontWeight: '900', fill: 0x254157, stroke: { color: 0xffffff, width: 5 } } });
    label.anchor.set(0.5);
    label.position.set(0, -54);
    node.addChild(shadow, body, label);
    node.position.set(p.x, p.y);
    return {
      id,
      role,
      name,
      tileX,
      tileY,
      x: p.x,
      y: p.y,
      speed: role === 'player' ? 4.3 : 1.05 + Math.random() * 0.35,
      path: [],
      node,
      body,
      label,
      mood,
      talk: role === 'player' ? [] : DAY_TALK[role as WorldNpcRole] ?? DAY_TALK.tourist,
      targetTimer: 800 + Math.random() * 2500,
    };
  }

  private bindStageInput(): void {
    if (!this.app) return;
    const canvas = this.app.canvas;
    canvas.style.touchAction = 'none';
    canvas.addEventListener('pointerdown', (ev: PointerEvent) => {
      this.pointer = { startX: ev.clientX, startY: ev.clientY, lastX: ev.clientX, lastY: ev.clientY, moved: false };
      canvas.setPointerCapture?.(ev.pointerId);
    });
    canvas.addEventListener('pointermove', (ev: PointerEvent) => {
      if (!this.pointer) return;
      const dx = ev.clientX - this.pointer.lastX;
      const dy = ev.clientY - this.pointer.lastY;
      const total = Math.hypot(ev.clientX - this.pointer.startX, ev.clientY - this.pointer.startY);
      this.pointer.moved = this.pointer.moved || total > 8;
      this.pointer.lastX = ev.clientX;
      this.pointer.lastY = ev.clientY;
      if (this.pointer.moved && !this.selectedBuild) {
        this.camera.x += dx;
        this.camera.y += dy;
        this.applyCamera();
      }
      if (this.selectedBuild) this.updatePreviewFromPointer(ev);
    });
    canvas.addEventListener('pointerup', (ev: PointerEvent) => {
      const track = this.pointer;
      this.pointer = undefined;
      canvas.releasePointerCapture?.(ev.pointerId);
      if (!track) return;
      if (!track.moved || this.selectedBuild) this.handlePointerTap(ev);
    });
    canvas.addEventListener('pointercancel', () => { this.pointer = undefined; });
    canvas.addEventListener('wheel', (ev: WheelEvent) => {
      ev.preventDefault();
      this.zoom(ev.deltaY > 0 ? -0.08 : 0.08);
    }, { passive: false });
  }

  private bindUi(): void {
    this.root.querySelectorAll<HTMLButtonElement>('[data-build-type]').forEach((button) => {
      button.addEventListener('click', () => {
        const type = button.dataset.buildType as VillageBuildingType;
        this.setBuildMode(this.selectedBuild === type ? null : type);
      });
    });
    this.root.querySelector<HTMLButtonElement>('[data-village-zoom-in]')?.addEventListener('click', () => this.zoom(0.12));
    this.root.querySelector<HTMLButtonElement>('[data-village-zoom-out]')?.addEventListener('click', () => this.zoom(-0.12));
    this.root.querySelector<HTMLButtonElement>('[data-village-center]')?.addEventListener('click', () => this.centerCameraOnPlayer());
    this.root.querySelector<HTMLButtonElement>('[data-village-build-close]')?.addEventListener('click', () => this.setBuildMode(null));
    this.root.querySelector<HTMLButtonElement>('[data-village-fishing]')?.addEventListener('click', () => this.onGoFishing());
  }

  private handlePointerTap(ev: PointerEvent): void {
    const tile = this.tileFromPointer(ev);
    if (!this.inBounds(tile.x, tile.y)) return;
    if (this.selectedBuild) {
      this.tryPlace(tile.x, tile.y, this.selectedBuild);
      return;
    }
    const npc = this.findNpcNear(tile.x, tile.y);
    if (npc) {
      this.movePlayerNear(tile.x, tile.y);
      this.openDialogue(npc);
      return;
    }
    const building = this.findBuildingNear(tile.x, tile.y);
    if (building) {
      this.movePlayerNear(tile.x, tile.y);
      this.interactBuilding(building);
      return;
    }
    this.movePlayerTo(tile.x, tile.y);
  }

  private updatePreviewFromPointer(ev: PointerEvent): void {
    if (!this.selectedBuild) return;
    const tile = this.tileFromPointer(ev);
    if (this.hoverTile?.x === tile.x && this.hoverTile?.y === tile.y) return;
    this.hoverTile = tile;
    this.previewLayer.removeChildren();
    if (!this.inBounds(tile.x, tile.y)) return;
    const def = BUILD_DEFS[this.selectedBuild];
    const ok = this.canPlace(tile.x, tile.y, def);
    const g = new Graphics();
    for (let y = tile.y; y < tile.y + def.size[1]; y += 1) {
      for (let x = tile.x; x < tile.x + def.size[0]; x += 1) {
        const p = isoToWorld(x, y);
        g.poly([p.x, p.y + TILE_H / 2, p.x + TILE_W / 2, p.y, p.x + TILE_W, p.y + TILE_H / 2, p.x + TILE_W / 2, p.y + TILE_H]);
        g.fill({ color: ok ? 0x35f08a : 0xff4747, alpha: 0.42 });
        g.stroke({ color: 0xffffff, alpha: 0.82, width: 2 });
      }
    }
    g.zIndex = 99999;
    this.previewLayer.addChild(g);
  }

  private tileFromPointer(ev: PointerEvent): { x: number; y: number } {
    if (!this.app) return { x: 0, y: 0 };
    const rect = this.app.canvas.getBoundingClientRect();
    const sx = ev.clientX - rect.left;
    const sy = ev.clientY - rect.top;
    const wx = (sx - this.camera.x) / this.camera.scale;
    const wy = (sy - this.camera.y) / this.camera.scale;
    return worldToTile(wx, wy);
  }

  private tryPlace(x: number, y: number, type: VillageBuildingType): void {
    const def = BUILD_DEFS[type];
    if (!def) return;
    if (!this.canPlace(x, y, def)) {
      this.showGuide('설치 불가', '건물, 나무, 바다, 다른 구조물과 겹칠 수 없습니다. 길 위에는 건물을 올릴 수 없어요.');
      return;
    }
    if (this.save.coins < def.cost) {
      this.showGuide('골드 부족', `${def.label} 설치에는 ${def.cost.toLocaleString('ko-KR')}G가 필요합니다.`);
      return;
    }
    this.save.coins -= def.cost;
    if (def.kind === 'path') {
      const key = tileKey(x, y);
      if (!this.save.village.paths.includes(key)) this.save.village.paths.push(key);
      this.pathTiles.add(key);
      this.tileKinds.set(key, 'stone');
      this.renderTiles();
    } else {
      const [w, h] = def.size;
      this.save.village.buildings.push({ id: `b_${type}_${Date.now()}`, type, x, y, w, h, builtAt: Date.now() });
      this.renderBuildings();
    }
    this.save.village.fund += Math.floor(def.cost * 0.15);
    this.save.village.development = this.calculateDevelopment();
    this.onSave();
    this.syncHud();
    this.showGuide('설치 완료', `${def.label} 설치 완료 · 마을 발전도 +${def.score}`);
    if (type !== 'path') this.setBuildMode(null);
  }

  private canPlace(x: number, y: number, def: BuildDefinition): boolean {
    const [w, h] = def.size;
    for (let yy = y; yy < y + h; yy += 1) {
      for (let xx = x; xx < x + w; xx += 1) {
        if (!this.inBounds(xx, yy)) return false;
        const key = tileKey(xx, yy);
        const tile = this.tileKinds.get(key);
        if (tile === 'sea') return false;
        if (def.kind !== 'path' && this.pathTiles.has(key)) return false;
        if (this.blockedTiles.has(key)) return false;
        if (def.kind === 'path' && this.pathTiles.has(key)) return false;
      }
    }
    return true;
  }

  private findNpcNear(x: number, y: number): Actor | undefined {
    return this.npcs.find((npc) => Math.abs(npc.tileX - x) + Math.abs(npc.tileY - y) <= 1);
  }

  private findBuildingNear(x: number, y: number): VillageBuildingSave | undefined {
    return this.save.village.buildings.find((b) => x >= b.x - 1 && x <= b.x + b.w && y >= b.y - 1 && y <= b.y + b.h);
  }

  private interactBuilding(building: VillageBuildingSave): void {
    const def = BUILD_DEFS[building.type];
    if (!def) return;
    if (building.type === 'harbor') {
      this.showGuide('항구 입구', '항구에서 낚싯배를 선택하고 수역으로 출항합니다.');
      window.setTimeout(() => {
        if (!this.destroyed) this.onGoFishing();
      }, 420);
      return;
    }
    if (building.type === 'market') {
      const caught = Object.values(this.save.caught).reduce((sum, count) => sum + count, 0);
      const bonus = Math.min(300, caught * 4 + this.save.village.buildings.length * 12);
      this.save.coins += bonus;
      this.save.village.fund += Math.floor(bonus * 0.25);
      this.onSave();
      this.syncHud();
      this.showGuide('어시장', `오늘의 자동 판매 정산 +${bonus.toLocaleString('ko-KR')}G · 창고/시장 자동화의 첫 단계입니다.`);
      return;
    }
    if (building.type === 'inn') {
      this.showGuide('여관 내부', '실내 진입 시스템 준비 완료: 다음 패치에서 침대, 벽난로, 여관 NPC가 들어갑니다.');
      return;
    }
    if (building.type === 'guild') {
      this.showGuide('낚시 길드', '퀘스트: 아무 물고기 10마리 납품 → 마을 기금 증가 → 새 건물 해금.');
      return;
    }
    this.showGuide(def.label, def.description);
  }

  private openDialogue(actor: Actor): void {
    const now = performance.now();
    if (now - this.lastDialogAt < 260) return;
    this.lastDialogAt = now;
    const text = actor.talk[Math.floor(Math.random() * actor.talk.length)] ?? '안녕하세요.';
    const panel = this.root.querySelector<HTMLElement>('.v2-dialog-panel');
    if (!panel) return;
    panel.classList.add('open');
    panel.innerHTML = `<div><strong>${actor.name}</strong><span>${actor.mood}</span></div><p>${text}</p>`;
    window.setTimeout(() => panel.classList.remove('open'), 4300);
  }

  private showGuide(title: string, message: string): void {
    this.onToast({ type: 'normal', title, message });
    const guide = this.root.querySelector<HTMLElement>('.v2-village-guide');
    if (!guide) return;
    guide.innerHTML = `<strong>${title}</strong><span>${message}</span>`;
    guide.classList.add('pop');
    window.setTimeout(() => guide.classList.remove('pop'), 900);
  }

  private movePlayerNear(x: number, y: number): void {
    const candidates: Array<[number, number]> = [[x, y + 1], [x - 1, y], [x + 1, y], [x, y - 1], [x - 1, y + 1], [x + 1, y + 1]];
    const found = candidates.find(([cx, cy]) => this.isWalkable(cx, cy));
    if (found) this.movePlayerTo(found[0], found[1]);
  }

  private movePlayerTo(x: number, y: number): void {
    if (!this.player || !this.isWalkable(x, y)) return;
    const path = this.findPath(this.player.tileX, this.player.tileY, x, y);
    if (!path.length) {
      this.showGuide('이동 불가', '막혀 있는 타일입니다. 길이나 빈 잔디를 선택해주세요.');
      return;
    }
    this.player.path = path;
  }

  private tick(deltaMs: number): void {
    if (!this.app || this.destroyed) return;
    this.updateActor(this.player, deltaMs);
    for (const npc of this.npcs) {
      npc.targetTimer -= deltaMs;
      if (npc.targetTimer <= 0 && npc.path.length === 0) {
        this.assignNpcTarget(npc);
        npc.targetTimer = 2600 + Math.random() * 5200;
      }
      this.updateActor(npc, deltaMs);
    }
    this.actorLayer.sortChildren();
    const now = performance.now();
    if (now - this.lastPassiveIncomeAt > 12000) {
      this.lastPassiveIncomeAt = now;
      this.applyPassiveIncome();
    }
  }

  private updateActor(actor: Actor | undefined, deltaMs: number): void {
    if (!actor || actor.path.length === 0) return;
    const [tx, ty] = actor.path[0];
    const target = centerOfTile(tx, ty);
    const dx = target.x - actor.x;
    const dy = target.y - actor.y;
    const dist = Math.hypot(dx, dy);
    const key = tileKey(actor.tileX, actor.tileY);
    const pathBoost = this.pathTiles.has(key) ? 1.55 : 1;
    const step = actor.speed * pathBoost * Math.max(0.8, deltaMs / 16.67);
    if (dist <= step) {
      actor.x = target.x;
      actor.y = target.y;
      actor.tileX = tx;
      actor.tileY = ty;
      actor.path.shift();
    } else {
      actor.x += (dx / dist) * step;
      actor.y += (dy / dist) * step;
    }
    actor.node.position.set(actor.x, actor.y);
    actor.node.zIndex = actor.tileY * 20 + 16;
    actor.node.scale.x = dx < -1 ? -1 : 1;
  }

  private assignNpcTarget(npc: Actor): void {
    const hour = new Date().getHours();
    let targets: Array<[number, number]>;
    if (hour < 11) targets = [[19, 18], [20, 19], [21, 20], [18, 22]];
    else if (hour < 15) targets = [[14, 25], [16, 24], [18, 20]];
    else if (hour < 19) targets = [[26, 25], [23, 22], [20, 28]];
    else targets = [[18, 15], [20, 29], [13, 24]];
    if (npc.role === 'captain') targets = [[20, 31], [20, 29], [21, 33]];
    const target = targets[Math.floor(Math.random() * targets.length)];
    const path = this.findPath(npc.tileX, npc.tileY, target[0], target[1]);
    if (path.length) npc.path = path;
  }

  private applyPassiveIncome(): void {
    const score = this.calculateDevelopment();
    const income = Math.max(0, Math.floor(score / 80));
    this.save.village.development = score;
    this.save.village.autoIncome = income;
    if (income <= 0) return;
    this.save.coins += income;
    this.save.village.fund += Math.floor(income * 0.35);
    this.onSave();
    this.syncHud();
  }

  private calculateDevelopment(): number {
    const caughtScore = Object.values(this.save.caught).reduce((sum, count) => sum + count, 0) * 5;
    const buildingScore = this.save.village.buildings.reduce((sum, b) => sum + (BUILD_DEFS[b.type]?.score ?? 0), 0);
    const pathScore = this.save.village.paths.length * BUILD_DEFS.path.score;
    const successScore = this.save.totalSuccess * 5;
    return Math.floor(caughtScore + buildingScore + pathScore + successScore + this.save.village.fund * 0.08);
  }

  private syncHud(): void {
    const score = this.calculateDevelopment();
    this.save.village.development = score;
    this.save.village.level = score >= 1000 ? 5 : score >= 500 ? 4 : score >= 300 ? 3 : score >= 100 ? 2 : 1;
    this.save.village.tourists = score >= 1000 ? 3 : score >= 500 ? 2 : score >= 100 ? 1 : 0;
    const hud = this.root.querySelector<HTMLElement>('.v2-village-hud');
    if (hud) {
      hud.querySelector<HTMLElement>('[data-v2-gold]')!.textContent = this.save.coins.toLocaleString('ko-KR');
      hud.querySelector<HTMLElement>('[data-v2-fund]')!.textContent = this.save.village.fund.toLocaleString('ko-KR');
      hud.querySelector<HTMLElement>('[data-v2-dev]')!.textContent = `${score}`;
      hud.querySelector<HTMLElement>('[data-v2-level]')!.textContent = `Lv.${this.save.village.level}`;
      hud.querySelector<HTMLElement>('[data-v2-tourists]')!.textContent = String(this.save.village.tourists);
    }
    const milestones = this.root.querySelector<HTMLElement>('.v2-milestone-line');
    if (milestones) {
      milestones.innerHTML = `<span class="${score >= 100 ? 'on' : ''}">100 관광객</span><span class="${score >= 500 ? 'on' : ''}">500 관광버스</span><span class="${score >= 1000 ? 'on' : ''}">1000 VIP</span>`;
    }
  }

  private isWalkable(x: number, y: number): boolean {
    return this.inBounds(x, y) && !this.blockedTiles.has(tileKey(x, y));
  }

  private inBounds(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < MAP_SIZE && y < MAP_SIZE;
  }

  private findPath(sx: number, sy: number, tx: number, ty: number): Array<[number, number]> {
    if (!this.isWalkable(tx, ty)) return [];
    const start = tileKey(sx, sy);
    const target = tileKey(tx, ty);
    const queue: Array<[number, number]> = [[sx, sy]];
    const came = new Map<string, string | null>([[start, null]]);
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (let index = 0; index < queue.length; index += 1) {
      const [x, y] = queue[index];
      if (tileKey(x, y) === target) break;
      for (const [dx, dy] of dirs) {
        const nx = x + dx;
        const ny = y + dy;
        const key = tileKey(nx, ny);
        if (!this.isWalkable(nx, ny) || came.has(key)) continue;
        came.set(key, tileKey(x, y));
        queue.push([nx, ny]);
      }
    }
    if (!came.has(target)) return [];
    const path: Array<[number, number]> = [];
    let current: string | null = target;
    while (current && current !== start) {
      const [x, y] = current.split(',').map(Number);
      path.push([x, y]);
      current = came.get(current) ?? null;
    }
    return path.reverse().slice(0, 80);
  }

  private applyCamera(): void {
    this.world.position.set(this.camera.x, this.camera.y);
    this.world.scale.set(this.camera.scale);
  }

  private resize(): void {
    if (!this.app) return;
    if (this.camera.x === 0 && this.camera.y === 0) {
      this.centerCameraOnPlayer();
      return;
    }
    this.applyCamera();
  }
}
