declare module 'howler' {
  export class Howl {
    constructor(options: Record<string, unknown>);
    play(name?: string): number;
  }
  export const Howler: {
    volume(value?: number): number | void;
  };
}

declare module 'firebase/app' {
  export function initializeApp(config: Record<string, unknown>): unknown;
}

declare module 'firebase/auth' {
  export const browserSessionPersistence: unknown;
  export function getAuth(app: unknown): unknown;
  export function setPersistence(auth: unknown, persistence: unknown): Promise<void>;
}

declare module 'firebase/firestore' {
  export function getFirestore(app: unknown): unknown;
}

declare module 'pixi.js' {
  export interface PointLike { x: number; y: number; set(x?: number, y?: number): void; }
  export class Texture {
    static WHITE: Texture;
    width: number;
    height: number;
  }
  export class Container {
    x: number;
    y: number;
    alpha: number;
    rotation: number;
    scale: PointLike;
    addChild(...children: unknown[]): unknown;
    removeChild(...children: unknown[]): unknown;
    destroy(options?: unknown): void;
  }
  export class Sprite extends Container {
    constructor(texture?: Texture);
    texture: Texture;
    anchor: PointLike;
    tint: number;
    width: number;
    height: number;
  }
  export class Graphics extends Container {
    clear(): this;
    ellipse(x: number, y: number, width: number, height: number): this;
    poly(points: number[]): this;
    fill(options: Record<string, unknown>): this;
    stroke(options: Record<string, unknown>): this;
  }
  export class Ticker {
    deltaMS: number;
  }
  export class Application {
    canvas: HTMLCanvasElement;
    stage: Container;
    screen: { width: number; height: number };
    ticker: { add(fn: (ticker: Ticker) => void): void };
    init(options: Record<string, unknown>): Promise<void>;
    destroy(removeView?: boolean, options?: unknown): void;
  }
  export class Assets {
    static load<T = Texture>(url: string): Promise<T>;
  }
}
