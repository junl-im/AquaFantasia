export type UnderwaterLayerMood = 'town' | 'fishing' | 'deep' | 'reef';

export type UnderwaterLayerOptions = {
  mood?: UnderwaterLayerMood;
  compact?: boolean;
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

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float wave(vec2 uv, float speed, float scale, float amp) {
  float a = sin((uv.x * scale + u_time * speed) + sin(uv.y * scale * 0.52 + u_time * speed * 0.7));
  float b = sin((uv.y * scale * 1.24 - u_time * speed * 0.82) + sin(uv.x * scale * 0.42));
  return (a + b) * 0.5 * amp;
}

void main() {
  vec2 uv = v_uv;
  vec2 aspectUv = vec2(uv.x * (u_resolution.x / max(u_resolution.y, 1.0)), uv.y);
  float depth = smoothstep(0.0, 1.0, uv.y);
  float drift = wave(aspectUv, 0.36, 9.0, 0.045) + wave(aspectUv + 0.17, 0.19, 23.0, 0.018);
  float caustic = sin((uv.x + drift) * 34.0 + u_time * 1.8) * sin((uv.y - drift) * 28.0 - u_time * 1.35);
  caustic = smoothstep(0.66, 0.96, caustic) * 0.25;
  float rays = pow(max(0.0, sin((uv.x * 4.0) + u_time * 0.33)), 5.0) * smoothstep(1.0, 0.05, uv.y) * 0.23;
  float vignette = smoothstep(0.92, 0.24, distance(uv, vec2(0.5, 0.48)));
  float grain = (hash(floor(uv * u_resolution.xy * 0.42) + floor(u_time * 8.0)) - 0.5) * 0.018;
  vec3 color = mix(u_top, u_bottom, depth + drift * 1.8);
  color += u_glow * (caustic + rays) * u_intensity;
  color += u_glow * 0.10 * vignette;
  color += grain;
  color *= mix(0.82, 1.08, vignette);
  gl_FragColor = vec4(color, 0.72);
}`;

const MOODS: Record<UnderwaterLayerMood, { top: [number, number, number]; bottom: [number, number, number]; glow: [number, number, number]; intensity: number }> = {
  town: { top: [0.04, 0.43, 0.76], bottom: [0.01, 0.12, 0.27], glow: [0.42, 0.94, 1.0], intensity: 0.82 },
  fishing: { top: [0.02, 0.55, 0.78], bottom: [0.01, 0.16, 0.34], glow: [0.65, 1.0, 0.96], intensity: 1.0 },
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
  private startedAt = performance.now();
  private uniforms?: {
    time: WebGLUniformLocation | null;
    resolution: WebGLUniformLocation | null;
    top: WebGLUniformLocation | null;
    bottom: WebGLUniformLocation | null;
    glow: WebGLUniformLocation | null;
    intensity: WebGLUniformLocation | null;
  };

  constructor(private readonly host: HTMLElement, options: UnderwaterLayerOptions = {}) {
    this.mood = options.mood ?? 'town';
    this.compact = Boolean(options.compact || window.matchMedia('(prefers-reduced-motion: reduce)').matches);
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
    };
    this.resize();
    this.host.classList.add('underwater-webgl-ready');
    this.tick();
    return true;
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    if (this.gl) {
      if (this.buffer) this.gl.deleteBuffer(this.buffer);
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
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    this.raf = requestAnimationFrame(this.tick);
  };
}
