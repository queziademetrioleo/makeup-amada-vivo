/**
 * ThreeMakeupRenderer — Three.js based makeup AR renderer.
 *
 * Architecture:
 *   • OrthographicCamera with world-units = pixels, origin at canvas center
 *   • Background plane (W×H) with VideoTexture — skin smoothing in shader
 *   • Per-zone meshes (lips, brows, blush, contour, foundation) built from
 *     MediaPipe 3D landmarks → BufferGeometry in world space
 *   • Each zone uses a custom ShaderMaterial that samples the video texture
 *     at the fragment's screen position and applies the correct blend mode:
 *       Lips      → Photoshop "Color" blend (hue+sat from pigment, lum from skin)
 *       Brows     → Multiply (darkens hair region)
 *       Contour   → Multiply (sculpts cheekbones/jaw)
 *       Foundation → Soft-Light (natural skin coverage)
 *       Blush     → Soft-Light with radial falloff
 *   • depthTest: false + renderOrder controls paint order without z-fighting
 */
import * as THREE from 'three';
import { LANDMARK_GROUPS } from '@/utils/landmarks';
// ─── Coordinate helper ────────────────────────────────────────────────────────
/** MediaPipe normalised [0,1] → Three.js world pixels (origin = canvas centre) */
function lmW(lm, W, H) {
    return [(lm.x - 0.5) * W, -(lm.y - 0.5) * H, 0];
}
function hex3(hex) {
    const n = parseInt(hex.replace('#', ''), 16);
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
}
// ─── Geometry builders ────────────────────────────────────────────────────────
/** Fan triangulation: centroid → perimeter edges.
 *  UV: centroid = (0.5, 0.5), boundary = (1, 0) — u encodes edge distance. */
function fanGeo(pts) {
    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
    const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    const cz = pts.reduce((s, p) => s + p[2], 0) / pts.length;
    const pos = [];
    const uvs = [];
    for (let i = 0; i < pts.length; i++) {
        const [x1, y1, z1] = pts[i];
        const [x2, y2, z2] = pts[(i + 1) % pts.length];
        pos.push(cx, cy, cz, x1, y1, z1, x2, y2, z2);
        uvs.push(0.5, 0.5, 1, 0, 1, 0);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    return g;
}
/** Fan triangulation from landmark index groups. */
function fanFromIndices(indices, landmarks, W, H) {
    return fanGeo(indices.map(i => lmW(landmarks[i], W, H)));
}
/** Lip geometry: outer contour fan. */
function buildLipGeo(landmarks, W, H) {
    const upper = LANDMARK_GROUPS.lipsOuterUpper.map(i => lmW(landmarks[i], W, H));
    const lower = LANDMARK_GROUPS.lipsOuterLower.map(i => lmW(landmarks[i], W, H));
    const poly = [
        ...upper,
        ...[...lower].reverse().slice(1, -1),
    ];
    return fanGeo(poly);
}
/** Brow strip: sorted-by-X quad strip with V=1 (top edge) to V=0 (bottom edge).
 *  The V-gradient drives feathering in the brow fragment shader. */
function buildBrowGeo(indices, landmarks, W, H, halfW) {
    const raw = indices.map(i => lmW(landmarks[i], W, H));
    raw.sort((a, b) => a[0] - b[0]); // left → right
    const pos = [];
    const uvs = [];
    const idx = [];
    let vi = 0;
    for (let i = 0; i < raw.length; i++) {
        const [x, y, z] = raw[i];
        const u = i / (raw.length - 1);
        pos.push(x, y + halfW, z); // top vertex
        pos.push(x, y - halfW * 0.6, z); // bottom vertex
        uvs.push(u, 1, u, 0); // V: 1=top, 0=bottom
        if (i < raw.length - 1) {
            idx.push(vi, vi + 1, vi + 2, vi + 1, vi + 3, vi + 2);
        }
        vi += 2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    g.setIndex(idx);
    return g;
}
/** Foundation: face oval with eye+lip holes via THREE.ShapeGeometry (earcut). */
function buildFoundationGeo(landmarks, W, H) {
    const v2 = (i) => { const [x, y] = lmW(landmarks[i], W, H); return new THREE.Vector2(x, y); };
    const expandHole = (pts, s) => {
        const cx = pts.reduce((acc, p) => acc + p.x, 0) / pts.length;
        const cy = pts.reduce((acc, p) => acc + p.y, 0) / pts.length;
        return pts.map(p => new THREE.Vector2(cx + (p.x - cx) * s, cy + (p.y - cy) * s));
    };
    const ovalPts = LANDMARK_GROUPS.faceOval.map(v2);
    const leye = expandHole(LANDMARK_GROUPS.leftEye.map(v2), 1.3);
    const reye = expandHole(LANDMARK_GROUPS.rightEye.map(v2), 1.3);
    const lipPts = [
        ...LANDMARK_GROUPS.lipsOuterUpper.map(v2),
        ...LANDMARK_GROUPS.lipsOuterLower.map(v2).slice(1, -1),
    ];
    const shape = new THREE.Shape(ovalPts);
    shape.holes.push(new THREE.Path(leye));
    shape.holes.push(new THREE.Path(reye));
    shape.holes.push(new THREE.Path(lipPts));
    return new THREE.ShapeGeometry(shape);
}
/** Merge two BufferGeometries (must have matching attributes). */
function mergeTwo(a, b) {
    const posA = a.getAttribute('position').array;
    const posB = b.getAttribute('position').array;
    const uvA = a.getAttribute('uv')?.array;
    const uvB = b.getAttribute('uv')?.array;
    const merged = new THREE.BufferGeometry();
    const pos = new Float32Array(posA.length + posB.length);
    pos.set(posA);
    pos.set(posB, posA.length);
    merged.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    if (uvA && uvB) {
        const uv = new Float32Array(uvA.length + uvB.length);
        uv.set(uvA);
        uv.set(uvB, uvA.length);
        merged.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    }
    return merged;
}
// ─── GLSL shared ─────────────────────────────────────────────────────────────
/** Vertex shader shared by all makeup zone meshes.
 *  Outputs v_screenUV (for video sampling) and v_uv (mesh's own UV). */
const MAKEUP_VERT = /* glsl */ `
  varying vec2 v_screenUV;
  varying vec2 v_uv;
  void main() {
    vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_Position = clip;
    // Screen UV: maps NDC [-1,1] → [0,1] — aligns with VideoTexture (flipY=true)
    v_screenUV = clip.xy * 0.5 + vec2(0.5);
    v_uv = uv;
  }
`;
const HSL_GLSL = /* glsl */ `
  float hueToChannel(float p, float q, float t) {
    t = fract(t);
    if (t < 0.1667) return p + (q - p) * 6.0 * t;
    if (t < 0.5)    return q;
    if (t < 0.6667) return p + (q - p) * (0.6667 - t) * 6.0;
    return p;
  }
  vec3 hslToRgb(float h, float s, float l) {
    if (s < 0.001) return vec3(l);
    float q = l < 0.5 ? l * (1.0 + s) : l + s - l * s;
    float p = 2.0 * l - q;
    return vec3(hueToChannel(p,q,h+0.3333), hueToChannel(p,q,h), hueToChannel(p,q,h-0.3333));
  }
  vec3 rgbToHsl(vec3 c) {
    float mx = max(c.r, max(c.g, c.b));
    float mn = min(c.r, min(c.g, c.b));
    float l = (mx + mn) * 0.5;
    float d = mx - mn;
    if (d < 0.001) return vec3(0.0, 0.0, l);
    float s = l > 0.5 ? d / (2.0 - mx - mn) : d / (mx + mn);
    float h;
    if      (mx == c.r) h = (c.g - c.b) / d + (c.g < c.b ? 6.0 : 0.0);
    else if (mx == c.g) h = (c.b - c.r) / d + 2.0;
    else                h = (c.r - c.g) / d + 4.0;
    return vec3(h / 6.0, s, l);
  }
`;
// ─── Fragment shaders per blend mode ─────────────────────────────────────────
const LIP_FRAG = /* glsl */ `
  precision mediump float;
  varying vec2 v_screenUV;
  varying vec2 v_uv;
  uniform sampler2D u_video;
  uniform vec3  u_color;   // linear
  uniform float u_opacity;
  uniform float u_glossy;
  ${HSL_GLSL}
  vec3 toLinear(vec3 c) { return c * c; }
  vec3 toSrgb(vec3 c)   { return sqrt(max(c, vec3(0.0))); }
  vec3 blendScreen(vec3 a, vec3 b) { return 1.0 - (1.0 - a) * (1.0 - b); }
  void main() {
    vec3 base = toLinear(texture2D(u_video, v_screenUV).rgb);
    // Color mode: apply hue+sat of pigment, keep skin luminance
    vec3 bHsl = rgbToHsl(base);
    vec3 cHsl = rgbToHsl(u_color);
    vec3 colorBlend = hslToRgb(cHsl.x, cHsl.y, bHsl.z);
    // Mix with multiply for richer dark shades
    vec3 mulBlend = base * u_color;
    float lum = dot(u_color, vec3(0.2126, 0.7152, 0.0722));
    vec3 lip = mix(colorBlend, mulBlend, (1.0 - lum) * 0.45);
    vec3 out = mix(base, lip, u_opacity * 0.92);
    // Edge feathering from fan UV (u=1 at boundary)
    float edge = 1.0 - smoothstep(0.7, 1.0, v_uv.x);
    out = mix(base, out, edge);
    // Gloss: screen blend specular highlight on upper-center lip
    if (u_glossy > 0.0) {
      vec3 g = blendScreen(out, vec3(1.0, 0.97, 0.93));
      float glossDist = length((v_uv - vec2(0.5)) * vec2(1.0, 2.0));
      float glossMask = smoothstep(0.5, 0.0, glossDist);
      out = mix(out, g, glossMask * u_glossy * 0.5);
    }
    gl_FragColor = vec4(toSrgb(out), u_opacity * edge);
  }
`;
const BROW_FRAG = /* glsl */ `
  precision mediump float;
  varying vec2 v_screenUV;
  varying vec2 v_uv;
  uniform sampler2D u_video;
  uniform vec3  u_color;
  uniform float u_opacity;
  vec3 toLinear(vec3 c) { return c * c; }
  vec3 toSrgb(vec3 c)   { return sqrt(max(c, vec3(0.0))); }
  void main() {
    vec3 base = toLinear(texture2D(u_video, v_screenUV).rgb);
    // Multiply darkens brow area like real pigment on hair
    vec3 mul = base * u_color;
    // Feather along brow width (v: 1=top, 0=bottom)
    float fade = smoothstep(0.0, 0.25, v_uv.y) * smoothstep(1.0, 0.75, v_uv.y);
    vec3 out = mix(base, mul, u_opacity * 0.72 * fade);
    gl_FragColor = vec4(toSrgb(out), u_opacity * fade);
  }
`;
const CONTOUR_FRAG = /* glsl */ `
  precision mediump float;
  varying vec2 v_screenUV;
  varying vec2 v_uv;
  uniform sampler2D u_video;
  uniform vec3  u_color;
  uniform float u_opacity;
  vec3 toLinear(vec3 c) { return c * c; }
  vec3 toSrgb(vec3 c)   { return sqrt(max(c, vec3(0.0))); }
  void main() {
    vec3 base = toLinear(texture2D(u_video, v_screenUV).rgb);
    vec3 mul = base * u_color;
    // Soft edge from fan UV
    float edge = 1.0 - smoothstep(0.5, 1.0, v_uv.x);
    vec3 out = mix(base, mul, u_opacity * 0.45 * edge);
    gl_FragColor = vec4(toSrgb(out), u_opacity * edge);
  }
`;
const FOUNDATION_FRAG = /* glsl */ `
  precision mediump float;
  varying vec2 v_screenUV;
  uniform sampler2D u_video;
  uniform vec3  u_color;
  uniform float u_opacity;
  vec3 toLinear(vec3 c) { return c * c; }
  vec3 toSrgb(vec3 c)   { return sqrt(max(c, vec3(0.0))); }
  vec3 softLight(vec3 base, vec3 blend) {
    vec3 low  = 2.0*base*blend + base*base*(1.0 - 2.0*blend);
    vec3 high = sqrt(max(base, vec3(0.001)))*(2.0*blend - 1.0) + 2.0*base*(1.0-blend);
    return mix(low, high, step(vec3(0.5), blend));
  }
  void main() {
    vec3 base = toLinear(texture2D(u_video, v_screenUV).rgb);
    vec3 sl   = softLight(base, u_color);
    vec3 out  = mix(base, sl, u_opacity * 0.28);
    gl_FragColor = vec4(toSrgb(out), u_opacity * 0.28);
  }
`;
const BLUSH_FRAG = /* glsl */ `
  precision mediump float;
  varying vec2 v_screenUV;
  varying vec2 v_uv;   // CircleGeometry UV: (0.5,0.5) = center
  uniform sampler2D u_video;
  uniform vec3  u_color;
  uniform float u_opacity;
  vec3 toLinear(vec3 c) { return c * c; }
  vec3 toSrgb(vec3 c)   { return sqrt(max(c, vec3(0.0))); }
  vec3 softLight(vec3 base, vec3 blend) {
    vec3 low  = 2.0*base*blend + base*base*(1.0 - 2.0*blend);
    vec3 high = sqrt(max(base, vec3(0.001)))*(2.0*blend - 1.0) + 2.0*base*(1.0-blend);
    return mix(low, high, step(vec3(0.5), blend));
  }
  void main() {
    // Elliptical radial falloff from circle center
    vec2 centered = (v_uv - vec2(0.5)) * vec2(0.71, 1.0); // 1/1.4 horizontal compression
    float dist = length(centered) * 2.0; // 0 at center, ~1 at edge
    float alpha = smoothstep(1.0, 0.0, dist);
    if (alpha < 0.001) discard;
    vec3 base = toLinear(texture2D(u_video, v_screenUV).rgb);
    vec3 sl   = softLight(base, u_color);
    vec3 out  = mix(base, sl, alpha * u_opacity * 0.55);
    gl_FragColor = vec4(toSrgb(out), alpha * u_opacity);
  }
`;
// Background video + skin smoothing
const BG_VERT = /* glsl */ `
  varying vec2 v_uv;
  void main() {
    v_uv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const BG_FRAG = /* glsl */ `
  precision mediump float;
  varying vec2 v_uv;
  uniform sampler2D u_video;
  uniform float u_skinSmooth;
  uniform vec2  u_texelSize;
  vec3 skinSmooth(vec2 uv) {
    vec3  c = texture2D(u_video, uv).rgb;
    vec3  acc = vec3(0.0); float wSum = 0.0;
    for (float x = -2.0; x <= 2.0; x += 1.0)
      for (float y = -2.0; y <= 2.0; y += 1.0) {
        vec2  o = vec2(x,y) * u_texelSize;
        vec3  s = texture2D(u_video, uv+o).rgb;
        float w = exp(-(x*x+y*y)*0.2) * exp(-dot(s-c,s-c)*12.0);
        acc += s*w; wSum += w;
      }
    return acc / wSum;
  }
  void main() {
    vec3 color = u_skinSmooth > 0.0
      ? mix(texture2D(u_video, v_uv).rgb, skinSmooth(v_uv), u_skinSmooth * 0.6)
      : texture2D(u_video, v_uv).rgb;
    gl_FragColor = vec4(color, 1.0);
  }
`;
// ─── Material factory ─────────────────────────────────────────────────────────
function makeMat(frag, videoTex, extras = {}) {
    return new THREE.ShaderMaterial({
        vertexShader: MAKEUP_VERT,
        fragmentShader: frag,
        uniforms: {
            u_video: { value: videoTex },
            u_color: { value: new THREE.Vector3(0, 0, 0) },
            u_opacity: { value: 0 },
            ...extras,
        },
        transparent: true,
        depthTest: false,
        depthWrite: false,
        side: THREE.DoubleSide,
    });
}
function setUniforms(mat, enabled, color, opacity) {
    const [r, g, b] = hex3(color);
    mat.uniforms.u_color.value.set(r * r, g * g, b * b); // sRGB→linear
    mat.uniforms.u_opacity.value = enabled ? opacity : 0;
}
// ─── Main renderer class ──────────────────────────────────────────────────────
export class ThreeMakeupRenderer {
    renderer;
    scene;
    camera;
    videoTex;
    bgMesh;
    meshes;
    mats;
    W = 0;
    H = 0;
    constructor(canvas, video) {
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: false,
            antialias: false,
            powerPreference: 'high-performance',
        });
        this.renderer.setPixelRatio(1);
        this.renderer.autoClear = true;
        this.scene = new THREE.Scene();
        // Camera: world units = pixels, origin at canvas centre
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
        this.camera.position.z = 5;
        // VideoTexture (Three.js auto-updates from <video> each frame)
        this.videoTex = new THREE.VideoTexture(video);
        this.videoTex.minFilter = THREE.LinearFilter;
        this.videoTex.magFilter = THREE.LinearFilter;
        // Materials (shared between left/right meshes where applicable)
        this.mats = {
            bg: new THREE.ShaderMaterial({
                vertexShader: BG_VERT, fragmentShader: BG_FRAG,
                uniforms: {
                    u_video: { value: this.videoTex },
                    u_skinSmooth: { value: 0 },
                    u_texelSize: { value: new THREE.Vector2(1 / 640, 1 / 480) },
                },
                depthTest: false, depthWrite: false,
            }),
            found: makeMat(FOUNDATION_FRAG, this.videoTex),
            contour: makeMat(CONTOUR_FRAG, this.videoTex),
            blush: makeMat(BLUSH_FRAG, this.videoTex),
            brow: makeMat(BROW_FRAG, this.videoTex),
            lip: makeMat(LIP_FRAG, this.videoTex, { u_glossy: { value: 0 } }),
        };
        // Background: NDC-space full-screen plane (PlaneGeometry(2,2))
        this.bgMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.mats.bg);
        this.bgMesh.renderOrder = 0;
        this.scene.add(this.bgMesh);
        // Makeup meshes — geometry is rebuilt each frame from landmarks
        const mk = (mat, order) => {
            const m = new THREE.Mesh(new THREE.BufferGeometry(), mat);
            m.renderOrder = order;
            m.frustumCulled = false;
            this.scene.add(m);
            return m;
        };
        this.meshes = {
            found: mk(this.mats.found, 1),
            contour: mk(this.mats.contour, 2),
            blushL: mk(this.mats.blush, 3),
            blushR: mk(this.mats.blush.clone(), 3),
            browL: mk(this.mats.brow, 4),
            browR: mk(this.mats.brow.clone(), 4),
            lip: mk(this.mats.lip, 5),
        };
        // blushR and browR need their own video uniform reference
        for (const mesh of [this.meshes.blushR, this.meshes.browR]) {
            mesh.material.uniforms.u_video.value = this.videoTex;
        }
    }
    updateCamera(W, H) {
        if (this.W === W && this.H === H)
            return;
        this.W = W;
        this.H = H;
        // World-space camera: 1 unit = 1 pixel, origin at canvas centre
        this.camera.left = -W / 2;
        this.camera.right = W / 2;
        this.camera.top = H / 2;
        this.camera.bottom = -H / 2;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(W, H, false);
        this.mats.bg.uniforms.u_texelSize.value.set(1 / W, 1 / H);
        // Resize background plane to fill the pixel-space world
        this.bgMesh.geometry.dispose();
        this.bgMesh.geometry = new THREE.PlaneGeometry(W, H);
    }
    /** Replace a mesh's geometry, disposing the old one. */
    setGeo(mesh, geo) {
        mesh.geometry.dispose();
        mesh.geometry = geo;
    }
    render(landmarks, config, W, H) {
        this.updateCamera(W, H);
        // Skin smoothing on background
        this.mats.bg.uniforms.u_skinSmooth.value =
            config.skinSmooth?.enabled ? (config.skinSmooth.intensity ?? 0.5) : 0;
        if (landmarks) {
            const faceWidth = Math.abs(landmarks[454].x - landmarks[234].x) * W;
            // Lips
            this.setGeo(this.meshes.lip, buildLipGeo(landmarks, W, H));
            setUniforms(this.mats.lip, config.lipstick?.enabled ?? false, config.lipstick?.color ?? '#cc0044', config.lipstick?.opacity ?? 0);
            this.mats.lip.uniforms.u_glossy.value = config.lipstick?.glossy ? 1 : 0;
            // Brows
            const browHalf = faceWidth * 0.012;
            this.setGeo(this.meshes.browL, buildBrowGeo(LANDMARK_GROUPS.leftBrow, landmarks, W, H, browHalf));
            this.setGeo(this.meshes.browR, buildBrowGeo(LANDMARK_GROUPS.rightBrow, landmarks, W, H, browHalf));
            const browEnabled = config.brows?.enabled ?? false;
            const browColor = config.brows?.color ?? '#3d2314';
            const browOpacity = config.brows?.opacity ?? 0;
            setUniforms(this.mats.brow, browEnabled, browColor, browOpacity);
            setUniforms(this.meshes.browR.material, browEnabled, browColor, browOpacity);
            // Blush — CircleGeometry sized to cheek, translated to centroid
            const blushRad = faceWidth * 0.16;
            const blushCircle = new THREE.CircleGeometry(blushRad, 48);
            const lCheek = LANDMARK_GROUPS.leftCheek;
            const rCheek = LANDMARK_GROUPS.rightCheek;
            const lcx = lCheek.reduce((s, i) => s + (landmarks[i].x - 0.5) * W, 0) / lCheek.length;
            const lcy = lCheek.reduce((s, i) => s - (landmarks[i].y - 0.5) * H, 0) / lCheek.length;
            const rcx = rCheek.reduce((s, i) => s + (landmarks[i].x - 0.5) * W, 0) / rCheek.length;
            const rcy = rCheek.reduce((s, i) => s - (landmarks[i].y - 0.5) * H, 0) / rCheek.length;
            this.setGeo(this.meshes.blushL, blushCircle);
            this.setGeo(this.meshes.blushR, blushCircle.clone());
            this.meshes.blushL.position.set(lcx, lcy, 0);
            this.meshes.blushR.position.set(rcx, rcy, 0);
            const blushEnabled = config.blush?.enabled ?? false;
            const blushColor = config.blush?.color ?? '#f08080';
            const blushOpacity = config.blush?.opacity ?? 0;
            setUniforms(this.mats.blush, blushEnabled, blushColor, blushOpacity);
            setUniforms(this.meshes.blushR.material, blushEnabled, blushColor, blushOpacity);
            // Contour (left + right merged)
            const cLeft = fanFromIndices(LANDMARK_GROUPS.leftContour, landmarks, W, H);
            const cRight = fanFromIndices(LANDMARK_GROUPS.rightContour, landmarks, W, H);
            this.setGeo(this.meshes.contour, mergeTwo(cLeft, cRight));
            setUniforms(this.mats.contour, config.contour?.enabled ?? false, config.contour?.color ?? '#c8a090', config.contour?.opacity ?? 0);
            // Foundation
            this.setGeo(this.meshes.found, buildFoundationGeo(landmarks, W, H));
            setUniforms(this.mats.found, config.foundation?.enabled ?? false, config.foundation?.color ?? '#f5d5b8', config.foundation?.opacity ?? 0);
            for (const mesh of Object.values(this.meshes))
                mesh.visible = true;
        }
        else {
            for (const mesh of Object.values(this.meshes))
                mesh.visible = false;
        }
        this.renderer.render(this.scene, this.camera);
    }
    dispose() {
        this.videoTex.dispose();
        for (const mesh of Object.values(this.meshes))
            mesh.geometry.dispose();
        for (const mat of Object.values(this.mats))
            mat.dispose();
        this.renderer.dispose();
    }
}
