/* Experimental V4 scene — live PixiJS 8, opt-in only (?visual=1).
   Uses only existing repository raster assets. The production DOM/HUD and saved
   collection remain unchanged until the visual direction is reviewed. */
import { Application, Assets, Container, Graphics, Sprite, type Texture } from 'pixi.js';
import { fishVisualSignal, landingSignal, type FishingRound } from './fishingEngine';
import type { RegionId } from './collection';

type StageState = {
  round: FishingRound | null;
  held: boolean;
  region: RegionId;
  lite: boolean;
};

export interface VisualStage {
  update(round: FishingRound | null, held: boolean, region: RegionId, lite: boolean): void;
  destroy(): void;
}

const ART: Record<RegionId, string> = {
  shore: './assets/v101/water/water_clear_calm.webp',
  'coral-bay': './assets/v101/water/water_coral_reef.webp',
  'deep-blue': './assets/v101/water/water_abyss_canyon.webp',
};
const path = (s: string) => new URL(s, window.location.href).href;
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export async function mountVisualStage(host: HTMLElement): Promise<VisualStage> {
  const app = new Application();
  await app.init({
    resizeTo: host,
    backgroundAlpha: 0,
    antialias: true,
    autoDensity: true,
    resolution: Math.min(window.devicePixelRatio || 1, 1.75),
    preference: 'webgl',
  });
  app.canvas.className = 'v3-pixi-canvas';
  app.canvas.setAttribute('aria-hidden', 'true');
  app.canvas.style.pointerEvents = 'none';
  host.prepend(app.canvas);

  const [underwater, skyTexture, shadowTexture, boatTexture, fisherTexture, floatTexture, splashTexture] =
    await Promise.all([
      Assets.load<Texture>(path(ART.shore)),
      Assets.load<Texture>(path('./assets/v12/bg/ocean_portrait.webp')),
      Assets.load<Texture>(path('./assets/v205/fishing/fish_shadow_common.png')),
      Assets.load<Texture>(path('./assets/v2110/objects/fishing_props/fishing_prop_001.png')),
      Assets.load<Texture>(path('./assets/v2110/character/fisher_walk_frames/fisher_direction_01_frame_01.png')),
      Assets.load<Texture>(path('./assets/art/fishing_float.png')),
      Assets.load<Texture>(path('./assets/v205/fishing/wave_splash.png')),
    ]);

  const stage = app.stage;
  stage.sortableChildren = true;
  const backdrop = new Sprite(underwater);
  backdrop.zIndex = 0;
  stage.addChild(backdrop);

  // Wide bands of sky hide the underwater surface above the horizon.
  const skyPhoto = new Sprite(skyTexture);
  skyPhoto.zIndex = 1;
  stage.addChild(skyPhoto);
  const skyMask = new Graphics();
  skyMask.zIndex = 1;
  stage.addChild(skyMask);
  skyPhoto.mask = skyMask;
  const sky = new Graphics();
  sky.zIndex = 1;
  stage.addChild(sky);
  const seaSurface = new Graphics();
  seaSurface.zIndex = 2;
  stage.addChild(seaSurface);
  const light = new Graphics();
  light.zIndex = 3;
  stage.addChild(light);

  const farFish = new Container();
  farFish.zIndex = 4;
  stage.addChild(farFish);
  const shadows = Array.from({length:3},(_,i)=>{
    const sprite=new Sprite(shadowTexture);
    sprite.anchor.set(.5);
    sprite.alpha = .12 - i*.019;
    sprite.width=60 + i*19;
    sprite.scale.y=sprite.scale.x;
    farFish.addChild(sprite);
    return {sprite,depth:i};
  });
  const bubbles = Array.from({ length: 23 }, (_, i) => {
    const g = new Graphics();
    const size = i % 4 === 0 ? 3.8 : i % 3 === 0 ? 2.4 : 1.5;
    g.circle(0, 0, size).stroke({color:0xc3fbff,width:1.15,alpha:.54});
    g.circle(-.7, -.8, .6).fill({color:0xffffff,alpha:.45});
    farFish.addChild(g);
    return {sprite:g,offset:i * .417,depth:(i%7)/7};
  });
  const fish = new Sprite();
  fish.anchor.set(.5);
  fish.zIndex = 5;
  stage.addChild(fish);
  const fishingLine = new Graphics();
  fishingLine.zIndex = 8;
  stage.addChild(fishingLine);
  const bobber = new Sprite(floatTexture);
  bobber.anchor.set(.5);
  bobber.zIndex = 9;
  stage.addChild(bobber);
  const vessel = new Container();
  vessel.zIndex = 10;
  stage.addChild(vessel);
  const boat = new Sprite(boatTexture);
  boat.anchor.set(.5, .5);
  vessel.addChild(boat);
  const fisher = new Sprite(fisherTexture);
  fisher.anchor.set(.5, 1);
  vessel.addChild(fisher);
  const splash = new Sprite(splashTexture);
  splash.anchor.set(.5);
  splash.zIndex = 11;
  stage.addChild(splash);

  let current: StageState = { round: null, held: false, region: 'shore', lite: false };
  let currentImage = '';
  let fishReady = false;
  let currentRegion: RegionId = 'shore';
  let textureTicket = 0;
  let elapsed = 0;
  let lastWidth = 0;
  let lastHeight = 0;
  let lastPhase = '';
  let landingAt = -100;
  let strikeAt = -100;
  let oldSurge = false;
  let disposed = false;

  // Keep asynchronous texture loads from returning to an outdated fish or region.
  function update(round: FishingRound | null, held: boolean, region: RegionId, lite: boolean): void {
    current = { round, held, region, lite };
    if (region !== currentRegion) {
      currentRegion = region;
      void Assets.load<Texture>(path(ART[region])).then((tex) => {
        if (!disposed && currentRegion === region) backdrop.texture = tex;
      }).catch(() => undefined);
    }
    const image = round?.fish.image || '';
    if (currentImage !== image) {
      currentImage = image;
      const ticket = ++textureTicket;
      fish.visible = false;
      fishReady = false;
      if (image) void Assets.load<Texture>(path(image)).then((tex) => {
        if (disposed || ticket !== textureTicket) return;
        fish.texture = tex;
        fishReady = true;
        fish.visible = true;
      }).catch(() => { fishReady = false; fish.visible = false; });
    }
    const phase = round?.phase || 'ready';
    if (phase !== lastPhase) {
      if (phase === 'landed') landingAt = elapsed;
      if (phase === 'waiting') { landingAt = -100; oldSurge = false; }
      lastPhase = phase;
    }
  }

  function layout(w: number, h: number): void {
    // Maintain real aspect on every device instead of stretching raster images.
    const scale = Math.max(w / backdrop.texture.width, h / backdrop.texture.height);
    backdrop.width = backdrop.texture.width * scale;
    backdrop.height = backdrop.texture.height * scale;
    backdrop.position.set((w-backdrop.width)/2,(h-backdrop.height)/2);

    const horizon = h * .235;
    const skyScale = Math.max(w / skyTexture.width, horizon / (skyTexture.height*.33));
    skyPhoto.scale.set(skyScale);
    skyPhoto.x=(w-skyTexture.width*skyScale)/2;
    // Crop the hand-painted sky above its existing watercolor horizon.
    skyPhoto.y=horizon - skyTexture.height*skyScale*.405;
    skyMask.clear().rect(0,0,w,horizon).fill(0xffffff);
    sky.clear().rect(0,0,w,horizon).fill({color:0x3e9aae,alpha:.085});
    light.clear();
    for(let i=0;i<5;i++){
      const left=w*(.4+i*.1);
      light.poly([left,horizon+2,left+w*.025,horizon+2,left+w*.18,h,left-w*.13,h])
        .fill({color:0xc9faff,alpha: i%2===0?.047:.025});
    }
    vessel.position.set(w*.235,horizon + h*.005);
    const boatW = Math.min(w*.47,255);
    boat.width = boatW;
    boat.scale.y = boat.scale.x;
    fisher.height = Math.min(91, Math.max(50,w*.20));
    fisher.scale.x = fisher.scale.y;
    fisher.position.set(-boatW*.04,-boat.height*.15);
    const splashW=Math.min(280,w*.53);
    splash.width=splashW;
    splash.scale.y=splash.scale.x;
    fish.width=Math.min(160,w*.34);
    fish.scale.y=fish.scale.x;
  }

  app.ticker.add((ticker) => {
    if (disposed) return;
    elapsed += Math.min(ticker.deltaMS/1000,.05);
    const w=app.screen.width, h=app.screen.height;
    if (w<=0 || h<=0) return;
    if (Math.abs(w-lastWidth)>1 || Math.abs(h-lastHeight)>1) {
      lastWidth=w;lastHeight=h;layout(w,h);
    }
    const {round,held,lite}=current;
    const phase=round?.phase || 'ready';
    const waveTime=lite?0:elapsed;
    const horizon=h*.235;

    seaSurface.clear();
    seaSurface.moveTo(0,horizon);
    for(let x=0;x<=w+15;x+=16) {
      const yy=horizon + Math.sin(x*.032+waveTime*1.6)*3 + Math.sin(x*.014-waveTime*.8)*2.5;
      seaSurface.lineTo(x,yy);
    }
    seaSurface.stroke({color:0xf0fcff,width:2.4,alpha:.92});
    seaSurface.moveTo(0,horizon+7);
    for(let x=0;x<=w+15;x+=20) seaSurface.lineTo(x,horizon+7+Math.sin(x*.021-waveTime*1.1)*3);
    seaSurface.stroke({color:0x95e8ef,width:1.25,alpha:.46});

    vessel.y = horizon + (lite?0:Math.sin(elapsed*1.45)*2.8);
    vessel.rotation = lite?0:Math.sin(elapsed*1.13)*.013;
    bobber.x=w*.59; bobber.y=horizon + h*.056 + Math.sin(waveTime*2.1)*2;
    bobber.width=Math.min(54,w*.12); bobber.scale.y=bobber.scale.x;
    bobber.visible=phase==='waiting'||phase==='bite'||phase==='fighting';

    for(const sh of shadows) {
      sh.sprite.x=w*(.37+sh.depth*.21)+Math.sin(elapsed*(.18+sh.depth*.07)+sh.depth*2)*w*.04;
      sh.sprite.y=h*(.53+sh.depth*.09)+Math.sin(elapsed*.42+sh.depth*1.9)*7;
    }
    for(const bubble of bubbles){
      const t=(bubble.offset+elapsed*(lite?.09:.16)+bubble.depth)%1;
      bubble.sprite.x=w*(.1 + ((bubble.offset*2.7)% .8)) + Math.sin(elapsed*.45+bubble.offset*6)*9;
      bubble.sprite.y=h*(1-t*.75);
      bubble.sprite.alpha=(1-t)*.48;
    }

    const visual=round?fishVisualSignal(round):null;
    const approach=round?landingSignal(round):null;
    const progress=round?.progress??0;
    const fx=visual && phase==='fighting' ? visual.intensity:0;
    const surge=fx>.65;
    if (surge && !oldSurge) strikeAt=elapsed;
    oldSurge=surge;
    if(round && fishReady) {
      const dx=visual?.x??0,dy=visual?.y??0;
      fish.visible=phase==='fighting'||phase==='landed';
      fish.x=w*(.59 + dx*.10);
      fish.y=h*(.73 - (approach?.proximity??0)*.31 + dy*.065);
      const natural=Math.min(w*.32,170);
      const fishScale=natural/fish.texture.width*(.77+progress*.29);
      fish.scale.set(phase==='landed'?fishScale*1.16:fishScale);
      fish.rotation=(visual?.rotation??0)*Math.PI/180*.38;
      fish.alpha=phase==='landed'?1:.87;
    } else fish.visible=false;

    fishingLine.clear();
    if(phase==='fighting'||phase==='bite') {
      const startX=w*.335, startY=horizon-h*.13;
      const endX=phase==='fighting'?fish.x:bobber.x;
      const endY=phase==='fighting'?fish.y:bobber.y;
      const bend=(held?1:-1)*Math.min(38,w*.065);
      fishingLine.moveTo(startX,startY)
        .bezierCurveTo(startX+w*.12,horizon-h*.085,endX+bend,horizon+h*.13,endX,endY)
        .stroke({color:fx>.67?0xffd7a5:0xf1ffff,width:1.8,alpha:.83});
    }
    const catchAge=elapsed-landingAt;
    splash.visible=!lite && catchAge>=0 && catchAge<.8;
    if(splash.visible) {
      const t=catchAge/.8;
      splash.position.set(w*.57,h*.42);
      splash.alpha=Math.sin(Math.PI*t)*.82;
      splash.scale.set(Math.min(w*.5,260)/splashTexture.width*(.65+.6*t));
    }
    host.dataset.v3SceneStatus='ready';
    host.dataset.v3ScenePhase=phase;
    host.dataset.v3SceneHeld=String(held);
  });

  return {
    update,
    destroy() {
      disposed=true;
      textureTicket++;
      app.destroy(true,{children:true});
    },
  };
}
