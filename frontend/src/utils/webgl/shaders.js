// ── Vertex shader — trivial full-screen quad ─────────────────────────────────
export const VERT_SRC = /* glsl */ `
  attribute vec2 a_position;
  varying   vec2 v_uv;

  void main() {
    // a_position in [-1, 1]; map to UV [0, 1]
    v_uv        = vec2(a_position.x * 0.5 + 0.5, a_position.y * 0.5 + 0.5);
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;
// ── Fragment shader — all makeup layers in one GPU pass ───────────────────────
// Blend modes run in LINEAR color space — physically correct vs Canvas 2D
// which operates in sRGB (gamma). Multiply in linear ≈ real pigment on skin.
export const FRAG_SRC = /* glsl */ `
  precision mediump float;

  varying vec2 v_uv;

  // ── Textures ──────────────────────────────────────────────────────────────
  uniform sampler2D u_video;       // live camera frame
  uniform sampler2D u_lipMask;     // R=lip fill, G=gloss zone
  uniform sampler2D u_browMask;    // R=brow fill
  uniform sampler2D u_auxMask;     // R=contour, G=foundation

  // ── Skin smoothing ────────────────────────────────────────────────────────
  uniform float     u_skinSmooth;  // 0.0 = off, 1.0 = full
  uniform vec2      u_texelSize;   // 1/width, 1/height

  // ── Foundation ────────────────────────────────────────────────────────────
  uniform vec3      u_foundColor;
  uniform float     u_foundOpacity;

  // ── Contour ───────────────────────────────────────────────────────────────
  uniform vec3      u_contColor;
  uniform float     u_contOpacity;

  // ── Blush (radial distance in shader — no texture needed) ─────────────────
  uniform vec2      u_blushL;      // UV centre left cheek
  uniform vec2      u_blushR;      // UV centre right cheek
  uniform float     u_blushRad;    // falloff radius in UV space
  uniform vec3      u_blushColor;
  uniform float     u_blushOpacity;

  // ── Brows ─────────────────────────────────────────────────────────────────
  uniform vec3      u_browColor;
  uniform float     u_browOpacity;

  // ── Lipstick ──────────────────────────────────────────────────────────────
  uniform vec3      u_lipColor;
  uniform float     u_lipOpacity;
  uniform float     u_lipGlossy;   // 0 = matte, 1 = gloss

  // ── Blend helpers ─────────────────────────────────────────────────────────
  vec3 srgbToLinear(vec3 c) { return c * c; }           // fast approx γ=2.0
  vec3 linearToSrgb(vec3 c) { return sqrt(c); }

  vec3 blendMultiply(vec3 base, vec3 blend) {
    return base * blend;
  }

  vec3 blendScreen(vec3 base, vec3 blend) {
    return 1.0 - (1.0 - base) * (1.0 - blend);
  }

  vec3 blendOverlay(vec3 base, vec3 blend) {
    vec3 low  = 2.0 * base * blend;
    vec3 high = 1.0 - 2.0 * (1.0 - base) * (1.0 - blend);
    return mix(low, high, step(0.5, base));
  }

  // Edge-preserving skin smooth (5×5 bilateral-lite)
  vec3 skinSmooth(vec2 uv) {
    vec3  centre = texture2D(u_video, uv).rgb;
    vec3  acc    = vec3(0.0);
    float wSum   = 0.0;

    for (float x = -2.0; x <= 2.0; x += 1.0) {
      for (float y = -2.0; y <= 2.0; y += 1.0) {
        vec2  off    = vec2(x, y) * u_texelSize;
        vec3  s      = texture2D(u_video, uv + off).rgb;
        // Weight: spatial (Gaussian) × range (colour distance)
        float spatial = exp(-(x*x + y*y) * 0.2);
        float range   = exp(-dot(s - centre, s - centre) * 12.0);
        float w       = spatial * range;
        acc  += s * w;
        wSum += w;
      }
    }
    return acc / wSum;
  }

  // ── Main ──────────────────────────────────────────────────────────────────
  void main() {
    // 1. Sample + optionally smooth the skin
    vec3 raw  = texture2D(u_video, v_uv).rgb;
    vec3 base = (u_skinSmooth > 0.0) ? mix(raw, skinSmooth(v_uv), u_skinSmooth * 0.6) : raw;

    // Convert to linear for physically correct blending
    vec3 color = srgbToLinear(base);
    vec3 lin_found  = srgbToLinear(u_foundColor);
    vec3 lin_cont   = srgbToLinear(u_contColor);
    vec3 lin_blush  = srgbToLinear(u_blushColor);
    vec3 lin_brow   = srgbToLinear(u_browColor);
    vec3 lin_lip    = srgbToLinear(u_lipColor);

    vec4 lipSample  = texture2D(u_lipMask, v_uv);
    vec4 browSample = texture2D(u_browMask, v_uv);
    vec4 auxSample  = texture2D(u_auxMask, v_uv);

    float lipFill   = lipSample.r;
    float lipGloss  = lipSample.g;
    float browFill  = browSample.r;
    float contFill  = auxSample.r;
    float foundFill = auxSample.g;

    // 2. Foundation — source-over (adds coverage, no darkening)
    if (u_foundOpacity > 0.0 && foundFill > 0.001) {
      color = mix(color, lin_found, foundFill * u_foundOpacity * 0.22);
    }

    // 3. Contour — multiply (darkens like shadow)
    if (u_contOpacity > 0.0 && contFill > 0.001) {
      vec3 blended = blendMultiply(color, lin_cont);
      color = mix(color, blended, contFill * u_contOpacity * 0.5);
    }

    // 4. Blush — smooth radial gradient, overlay blend (stays bright)
    if (u_blushOpacity > 0.0) {
      // Elliptical falloff: x-axis compressed to match face aspect
      vec2 aspect    = vec2(1.4, 1.0);
      float distL    = length((v_uv - u_blushL) * aspect) / u_blushRad;
      float distR    = length((v_uv - u_blushR) * aspect) / u_blushRad;
      float blushVal = max(
        smoothstep(1.0, 0.0, distL),
        smoothstep(1.0, 0.0, distR)
      );
      if (blushVal > 0.001) {
        vec3 blended = blendOverlay(color, lin_blush);
        color = mix(color, blended, blushVal * u_blushOpacity * 0.5);
      }
    }

    // 5. Brows — multiply
    if (u_browOpacity > 0.0 && browFill > 0.001) {
      vec3 blended = blendMultiply(color, lin_brow);
      color = mix(color, blended, browFill * u_browOpacity * 0.65);
    }

    // 6. Lip fill — multiply (pigment on skin)
    if (u_lipOpacity > 0.0 && lipFill > 0.001) {
      vec3 blended = blendMultiply(color, lin_lip);
      color = mix(color, blended, lipFill * u_lipOpacity * 0.85);

      // 7. Gloss highlight — screen blend (additive light)
      if (u_lipGlossy > 0.0 && lipGloss > 0.001) {
        vec3 glossBlend = blendScreen(color, vec3(1.0, 0.98, 0.96));
        color = mix(color, glossBlend, lipGloss * u_lipGlossy * 0.55);
      }
    }

    // Convert back to sRGB for display
    gl_FragColor = vec4(linearToSrgb(color), 1.0);
  }
`;
