import { VERT_SRC, FRAG_SRC } from './shaders';
import type { MakeupConfig } from '@/types/makeup';

function hexToVec3(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
}

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
    throw new Error('Shader compile: ' + gl.getShaderInfoLog(s));
  return s;
}

function link(gl: WebGLRenderingContext, vert: WebGLShader, frag: WebGLShader): WebGLProgram {
  const p = gl.createProgram()!;
  gl.attachShader(p, vert);
  gl.attachShader(p, frag);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS))
    throw new Error('Program link: ' + gl.getProgramInfoLog(p));
  return p;
}

type TexSlot = 0 | 1 | 2 | 3;

export class WebGLMakeupRenderer {
  private gl: WebGLRenderingContext;
  private prog: WebGLProgram;
  private textures: Record<string, WebGLTexture> = {};
  private locs: Record<string, WebGLUniformLocation | null> = {};

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
    if (!gl) throw new Error('WebGL not supported');
    this.gl = gl;

    const prog = link(gl,
      compile(gl, gl.VERTEX_SHADER, VERT_SRC),
      compile(gl, gl.FRAGMENT_SHADER, FRAG_SRC),
    );
    this.prog = prog;
    gl.useProgram(prog);

    // Full-screen quad
    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Cache all uniform locations
    const uniforms = [
      'u_video','u_lipMask','u_browMask','u_auxMask',
      'u_skinSmooth','u_texelSize',
      'u_foundColor','u_foundOpacity',
      'u_contColor','u_contOpacity',
      'u_blushL','u_blushR','u_blushRad','u_blushColor','u_blushOpacity',
      'u_browColor','u_browOpacity',
      'u_lipColor','u_lipOpacity','u_lipGlossy',
    ];
    for (const u of uniforms) this.locs[u] = gl.getUniformLocation(prog, u);

    // Bind texture units
    gl.uniform1i(this.locs['u_video'], 0);
    gl.uniform1i(this.locs['u_lipMask'], 1);
    gl.uniform1i(this.locs['u_browMask'], 2);
    gl.uniform1i(this.locs['u_auxMask'], 3);

    // Create textures
    for (const [name, slot] of [['video',0],['lip',1],['brow',2],['aux',3]] as [string, TexSlot][]) {
      this.textures[name] = this.makeTexture(slot as TexSlot);
    }
  }

  private makeTexture(slot: TexSlot): WebGLTexture {
    const { gl } = this;
    gl.activeTexture(gl.TEXTURE0 + slot);
    const t = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return t;
  }

  private uploadTex(slot: TexSlot, source: TexImageSource) {
    const { gl } = this;
    gl.activeTexture(gl.TEXTURE0 + slot);
    gl.bindTexture(gl.TEXTURE_2D, this.textures[['video','lip','brow','aux'][slot]]);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
  }

  private u1f(name: string, v: number) { this.gl.uniform1f(this.locs[name], v); }
  private u2f(name: string, x: number, y: number) { this.gl.uniform2f(this.locs[name], x, y); }
  private u3f(name: string, v: [number,number,number]) { this.gl.uniform3f(this.locs[name], v[0], v[1], v[2]); }

  render(
    video: TexImageSource,
    lipCanvas: OffscreenCanvas,
    browCanvas: OffscreenCanvas,
    auxCanvas: OffscreenCanvas,
    config: MakeupConfig,
    blushLUV: [number, number],
    blushRUV: [number, number],
    blushRad: number,
  ) {
    const { gl } = this;
    const w = gl.canvas.width;
    const h = gl.canvas.height;
    gl.viewport(0, 0, w, h);

    // Upload textures
    this.uploadTex(0, video);
    this.uploadTex(1, lipCanvas);
    this.uploadTex(2, browCanvas);
    this.uploadTex(3, auxCanvas);

    // Skin smooth
    this.u1f('u_skinSmooth', config.skinSmooth?.enabled ? (config.skinSmooth.intensity ?? 0.5) : 0.0);
    this.u2f('u_texelSize', 1 / w, 1 / h);

    // Foundation
    const foundEnabled = config.foundation?.enabled ?? false;
    this.u3f('u_foundColor', foundEnabled ? hexToVec3(config.foundation!.color) : [0,0,0]);
    this.u1f('u_foundOpacity', foundEnabled ? (config.foundation!.opacity ?? 0) : 0);

    // Contour
    const contEnabled = config.contour?.enabled ?? false;
    this.u3f('u_contColor', contEnabled ? hexToVec3(config.contour!.color) : [0,0,0]);
    this.u1f('u_contOpacity', contEnabled ? (config.contour!.opacity ?? 0) : 0);

    // Blush
    const blushEnabled = config.blush?.enabled ?? false;
    this.u2f('u_blushL', blushLUV[0], blushLUV[1]);
    this.u2f('u_blushR', blushRUV[0], blushRUV[1]);
    this.u1f('u_blushRad', blushRad);
    this.u3f('u_blushColor', blushEnabled ? hexToVec3(config.blush!.color) : [0,0,0]);
    this.u1f('u_blushOpacity', blushEnabled ? (config.blush!.opacity ?? 0) : 0);

    // Brows
    const browEnabled = config.brows?.enabled ?? false;
    this.u3f('u_browColor', browEnabled ? hexToVec3(config.brows!.color) : [0,0,0]);
    this.u1f('u_browOpacity', browEnabled ? (config.brows!.opacity ?? 0) : 0);

    // Lips
    const lipEnabled = config.lipstick?.enabled ?? false;
    this.u3f('u_lipColor', lipEnabled ? hexToVec3(config.lipstick!.color) : [0,0,0]);
    this.u1f('u_lipOpacity', lipEnabled ? (config.lipstick!.opacity ?? 0) : 0);
    this.u1f('u_lipGlossy', lipEnabled && config.lipstick!.glossy ? 1.0 : 0.0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  dispose() {
    const { gl } = this;
    for (const t of Object.values(this.textures)) gl.deleteTexture(t);
    gl.deleteProgram(this.prog);
  }
}
