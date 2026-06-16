export type UnderwaterLayerMood = 'town' | 'fishing' | 'deep' | 'reef';

export type UnderwaterLayerOptions = {
  mood?: UnderwaterLayerMood;
  compact?: boolean;
  sceneUrl?: string;
};

type WebGLCtx = WebGLRenderingContext | WebGL2RenderingContext;

const VERTEX_SOURCE = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAGMENT_SOURCE = `
precision mediump float;
varying vec2 v_uv;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_top;
uniform vec3 u_bottom;
uniform vec3 u_glow;
uniform float u_intensity;
uniform sampler2D u_scene;
uniform float u_has_scene;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 r = mat2(0.80, -0.60, 0.60, 0.80);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = r * p * 2.05 + 11.7;
    a *= 0.48;
  }
  return v;
}

float causticCell(vec2 uv, float scale, float speed) {
  vec2 p = uv * scale;
  p.x += sin(uv.y * 6.0 + u_time * speed) * 0.28;
  p.y += cos(uv.x * 7.0 - u_time * speed * 0.82) * 0.22;
  float n = fbm(p + vec2(u_time * speed * 0.12, -u_time * speed * 0.08));
  float c = abs(sin((n + p.x * 0.055 + p.y * 0.045) * 19.0));
  return pow(smoothstep(0.60, 1.0, c), 3.2);
}

float bubble(vec2 uv, vec2 center, float radius) {
  float d = distance(uv, center);
  float rim = smoothstep(radius, radius * 0.66, d) - smoothstep(radius * 0.66, radius * 0.38, d);
  float shine = smoothstep(radius * 0.52, 0.0, distance(uv, center + vec2(-radius * 0.24, radius * 0.20)));
  return rim * 0.72 + shine * 0.25;
}

float bubbleField(vec2 uv) {
  float b = 0.0;
  for (int i = 0; i < 13; i++) {
    float fi = float(i);
    float lane = hash(vec2(fi, 8.1));
    float rise = fract(u_time * (0.035 + fi * 0.003) + hash(vec2(fi, 2.7)));
    vec2 c = vec2(fract(lane + sin(u_time * 0.17 + fi) * 0.018), 1.08 - rise * 1.22);
    float r = 0.010 + hash(vec2(fi, 5.5)) * 0.018;
    b += bubble(uv, c, r);
  }
  return b;
}

float fishShadow(vec2 uv, vec2 center, float scale, float flip) {
  vec2 p = uv - center;
  p.x *= flip;
  float body = smoothstep(0.18 * scale, 0.0, length(vec2(p.x * 1.55, p.y * 3.45)));
  float tail = smoothstep(0.11 * scale, 0.0, length(vec2((p.x + 0.17 * scale) * 3.1, p.y * 5.2)));
  float fin = smoothstep(0.07 * scale, 0.0, length(vec2((p.x - 0.02 * scale) * 2.5, (p.y - 0.075 * scale) * 6.4)));
  return clamp(body + tail * 0.58 + fin * 0.26, 0.0, 1.0);
}

float godRay(vec2 uv, float x, float width, float skew, float pulse) {
  float beam = 1.0 - smoothstep(0.0, width, abs(uv.x - x - uv.y * skew));
  beam *= smoothstep(1.03, 0.02, uv.y) * smoothstep(-0.08, 0.22, uv.y);
  return beam * pulse;
}

void main() {
  vec2 uv = v_uv;
  float aspect = u_resolution.x / max(u_resolution.y, 1.0);
  vec2 auv = vec2((uv.x - 0.5) * aspect + 0.5, uv.y);
  float depth = smoothstep(0.0, 1.0, uv.y);
  float slow = u_time * 0.18;

  float swell = fbm(vec2(auv.x * 2.2 + slow, auv.y * 3.0 - slow * 0.7));
  float micro = fbm(vec2(auv.x * 12.0 - u_time * 0.08, auv.y * 10.0 + u_time * 0.10));
  vec2 current = vec2(sin(uv.y * 13.0 + u_time * 0.62 + micro * 1.8), cos(uv.x * 10.0 - u_time * 0.48 + swell * 2.0));
  vec2 warp = current * (0.012 + swell * 0.020);
  vec2 wuv = uv + warp;
  vec2 sceneUv = clamp(vec2(uv.x + warp.x * 0.55, uv.y + warp.y * 0.38), 0.002, 0.998);
  vec3 scene = texture2D(u_scene, sceneUv).rgb;

  vec3 base = mix(u_top * 1.08, u_bottom * 0.86, pow(depth, 1.08));
  base = mix(base, vec3(0.02, 0.40, 0.52), smoothstep(0.06, 0.42, 1.0 - depth) * 0.13);

  float ca1 = causticCell(wuv + vec2(0.0, u_time * 0.025), 6.2, 0.84);
  float ca2 = causticCell(wuv.yx + vec2(u_time * 0.018, 0.1), 11.5, 0.58);
  float ca3 = causticCell(wuv + vec2(0.18, -0.12), 17.0, 0.36);
  float caustic = (ca1 * 0.48 + ca2 * 0.34 + ca3 * 0.18) * smoothstep(1.04, 0.08, depth);

  float rayPulse = 0.76 + sin(u_time * 0.42) * 0.14;
  float rays = godRay(uv, 0.15, 0.075, 0.18, rayPulse)
             + godRay(uv, 0.38, 0.050, -0.11, 0.62)
             + godRay(uv, 0.70, 0.070, 0.09, 0.52)
             + godRay(uv, 0.91, 0.045, -0.16, 0.34);

  float bubbles = bubbleField(uv);
  float plankton = smoothstep(0.80, 1.0, hash(floor((uv + vec2(u_time * 0.018, -u_time * 0.024)) * u_resolution.xy * 0.095))) * 0.18;
  float school = fishShadow(uv, vec2(fract(1.08 - u_time * 0.021), 0.32 + sin(u_time * 0.37) * 0.035), 0.86, -1.0)
               + fishShadow(uv, vec2(fract(0.09 + u_time * 0.016), 0.57 + sin(u_time * 0.29) * 0.030), 0.64, 1.0)
               + fishShadow(uv, vec2(fract(0.47 + u_time * 0.012), 0.71 + sin(u_time * 0.23) * 0.018), 0.42, 1.0);

  float surface = smoothstep(0.33, 0.0, uv.y) * (0.18 + micro * 0.10);
  float fog = smoothstep(0.42, 1.0, depth);
  float vignette = smoothstep(0.92, 0.22, distance(uv, vec2(0.5, 0.50)));
  float grain = (hash(floor(uv * u_resolution.xy * 0.36) + floor(u_time * 7.0)) - 0.5) * 0.010;

  vec3 color = mix(base, scene, clamp(u_has_scene, 0.0, 1.0) * 0.56);
  color = mix(color, base, fog * 0.18);
  color += u_glow * caustic * (0.74 * u_intensity);
  color += vec3(0.70, 0.96, 1.0) * rays * (0.42 * u_intensity);
  color += u_glow * (bubbles * 0.24 + plankton * 0.30);
  color += vec3(0.75, 0.95, 1.0) * surface;
  color = mix(color, u_bottom * 0.72, fog * 0.35);
  color -= vec3(0.0, 0.08, 0.14) * school * 0.26;
  color *= mix(0.74, 1.12, vignette);
  color += grain;

  gl_FragColor = vec4(color, 0.82);
}`;

const MOODS: Record<UnderwaterLayerMood, { top: [number, number, number]; bottom: [number, number, number]; glow: [number, number, number]; intensity: number }> = {
  town: { top: [0.04, 0.43, 0.76], bottom: [0.01, 0.12, 0.27], glow: [0.42, 0.94, 1.0], intensity: 0.82 },
  fishing: { top: [0.02, 0.58, 0.80], bottom: [0.00, 0.14, 0.31], glow: [0.72, 1.0, 0.98], intensity: 1.08 },
  deep: { top: [0.03, 0.18, 0.45], bottom: [0.00, 0.05, 0.16], glow: [0.35, 0.68, 1.0], intensity: 0.74 },
  reef: { top: [0.02, 0.48, 0.62], bottom: [0.00, 0.14, 0.24], glow: [0.54, 1.0, 0.74], intensity: 0.9 },
};

export class UnderwaterWebglLayer {
  readonly canvas: HTMLCanvasElement;
  private gl?: WebGLCtx;
  private program?: WebGLProgram;
  private buffer?: WebGLBuffer;
  private raf = 0;
  private disposed = false;
  private readonly mood: UnderwaterLayerMood;
  private readonly compact: boolean;
  private readonly sceneUrl?: string;
  private texture?: WebGLTexture;
  private sceneReady = false;
  private startedAt = performance.now();
  private uniforms?: {
    time: WebGLUniformLocation | null;
    resolution: WebGLUniformLocation | null;
    top: WebGLUniformLocation | null;
    bottom: WebGLUniformLocation | null;
    glow: WebGLUniformLocation | null;
    intensity: WebGLUniformLocation | null;
    scene: WebGLUniformLocation | null;
    hasScene: WebGLUniformLocation | null;
  };

  constructor(private readonly host: HTMLElement, options: UnderwaterLayerOptions = {}) {
    this.mood = options.mood ?? 'town';
    this.compact = Boolean(options.compact || window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    this.sceneUrl = options.sceneUrl;
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'underwater-webgl-canvas';
    this.canvas.setAttribute('aria-hidden', 'true');
    this.host.prepend(this.canvas);
  }

  start(): boolean {
    if (this.disposed) return false;
    const gl = this.canvas.getContext('webgl2', { alpha: true, antialias: false, depth: false, stencil: false, premultipliedAlpha: true, powerPreference: 'high-performance' })
      ?? this.canvas.getContext('webgl', { alpha: true, antialias: false, depth: false, stencil: false, premultipliedAlpha: true, powerPreference: 'high-performance' });
    if (!gl) {
      this.canvas.classList.add('webgl-unavailable');
      return false;
    }
    this.gl = gl;
    const vertex = this.compile(gl.VERTEX_SHADER, VERTEX_SOURCE);
    const fragment = this.compile(gl.FRAGMENT_SHADER, FRAGMENT_SOURCE);
    if (!vertex || !fragment) return false;
    const program = gl.createProgram();
    if (!program) return false;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('[AquaFantasia] Underwater WebGL link failed', gl.getProgramInfoLog(program));
      return false;
    }
    this.program = program;
    const buffer = gl.createBuffer();
    if (!buffer) return false;
    this.buffer = buffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    this.uniforms = {
      time: gl.getUniformLocation(program, 'u_time'),
      resolution: gl.getUniformLocation(program, 'u_resolution'),
      top: gl.getUniformLocation(program, 'u_top'),
      bottom: gl.getUniformLocation(program, 'u_bottom'),
      glow: gl.getUniformLocation(program, 'u_glow'),
      intensity: gl.getUniformLocation(program, 'u_intensity'),
      scene: gl.getUniformLocation(program, 'u_scene'),
      hasScene: gl.getUniformLocation(program, 'u_has_scene'),
    };
    this.resize();
    this.host.classList.add('underwater-webgl-ready');
    this.loadSceneTexture();
    this.tick();
    return true;
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    if (this.gl) {
      if (this.buffer) this.gl.deleteBuffer(this.buffer);
      if (this.texture) this.gl.deleteTexture(this.texture);
      if (this.program) this.gl.deleteProgram(this.program);
    }
    this.canvas.remove();
  }

  private compile(type: number, source: string): WebGLShader | undefined {
    const gl = this.gl;
    if (!gl) return undefined;
    const shader = gl.createShader(type);
    if (!shader) return undefined;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn('[AquaFantasia] Underwater WebGL compile failed', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return undefined;
    }
    return shader;
  }

  private loadSceneTexture(): void {
    const gl = this.gl;
    if (!gl || !this.sceneUrl) return;
    const texture = gl.createTexture();
    if (!texture) return;
    this.texture = texture;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    const pixel = new Uint8Array([12, 120, 156, 255]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = () => {
      if (this.disposed || !this.gl || !this.texture) return;
      const active = this.gl;
      active.bindTexture(active.TEXTURE_2D, this.texture);
      active.pixelStorei(active.UNPACK_FLIP_Y_WEBGL, 0);
      active.texImage2D(active.TEXTURE_2D, 0, active.RGBA, active.RGBA, active.UNSIGNED_BYTE, img);
      active.texParameteri(active.TEXTURE_2D, active.TEXTURE_WRAP_S, active.CLAMP_TO_EDGE);
      active.texParameteri(active.TEXTURE_2D, active.TEXTURE_WRAP_T, active.CLAMP_TO_EDGE);
      active.texParameteri(active.TEXTURE_2D, active.TEXTURE_MIN_FILTER, active.LINEAR);
      active.texParameteri(active.TEXTURE_2D, active.TEXTURE_MAG_FILTER, active.LINEAR);
      this.sceneReady = true;
      this.host.classList.add('underwater-scene-texture-ready');
    };
    img.onerror = () => { this.sceneReady = false; };
    img.src = this.sceneUrl;
  }

  private resize(): void {
    const gl = this.gl;
    if (!gl) return;
    const rect = this.host.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, this.compact ? 1.5 : 2.25);
    const width = Math.max(2, Math.floor(rect.width * dpr));
    const height = Math.max(2, Math.floor(rect.height * dpr));
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.canvas.style.width = `${Math.max(1, Math.floor(rect.width))}px`;
      this.canvas.style.height = `${Math.max(1, Math.floor(rect.height))}px`;
      gl.viewport(0, 0, width, height);
    }
  }

  private tick = (): void => {
    if (this.disposed || !this.gl || !this.program || !this.uniforms) return;
    this.resize();
    const gl = this.gl;
    const mood = MOODS[this.mood];
    gl.useProgram(this.program);
    gl.uniform1f(this.uniforms.time, (performance.now() - this.startedAt) / 1000);
    gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
    gl.uniform3fv(this.uniforms.top, mood.top);
    gl.uniform3fv(this.uniforms.bottom, mood.bottom);
    gl.uniform3fv(this.uniforms.glow, mood.glow);
    gl.uniform1f(this.uniforms.intensity, mood.intensity);
    gl.activeTexture(gl.TEXTURE0);
    if (this.texture) gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(this.uniforms.scene, 0);
    gl.uniform1f(this.uniforms.hasScene, this.sceneReady ? 1 : 0);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    this.raf = requestAnimationFrame(this.tick);
  };
}
