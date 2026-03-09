// ── Vertex shader — trivial full-screen quad ─────────────────────────────────
export const VERT_SRC = /* glsl */ `
  attribute vec2 a_position;
  varying   vec2 v_uv;

  void main() {
    v_uv        = vec2(a_position.x * 0.5 + 0.5, a_position.y * 0.5 + 0.5);
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

// ── Fragment shader ───────────────────────────────────────────────────────────
// Key design choices:
//   • Linear color space throughout (γ≈2.0 approx) — physically correct blending
//   • Lips use Photoshop "Color" blend mode (hue+sat from pigment, luminance from
//     skin) → preserves lip texture/shadows, looks like real makeup not paint
//   • Foundation/blush use Soft-Light blend → natural, non-destructive coverage
//   • Brows/contour use Multiply → correct darkening/shadow simulation
export const FRAG_SRC = /* glsl */ `
  precision mediump float;

  varying vec2 v_uv;

  // ── Textures ──────────────────────────────────────────────────────────────
  uniform sampler2D u_video;       // live camera frame
  uniform sampler2D u_lipMask;     // R=lip fill, G=gloss zone
  uniform sampler2D u_browMask;    // R=brow fill
  uniform sampler2D u_auxMask;     // R=contour, G=foundation

  // ── Skin smoothing ────────────────────────────────────────────────────────
  uniform float     u_skinSmooth;
  uniform vec2      u_texelSize;

  // ── Foundation ────────────────────────────────────────────────────────────
  uniform vec3      u_foundColor;
  uniform float     u_foundOpacity;

  // ── Contour ───────────────────────────────────────────────────────────────
  uniform vec3      u_contColor;
  uniform float     u_contOpacity;

  // ── Blush ─────────────────────────────────────────────────────────────────
  uniform vec2      u_blushL;
  uniform vec2      u_blushR;
  uniform float     u_blushRad;
  uniform vec3      u_blushColor;
  uniform float     u_blushOpacity;

  // ── Brows ─────────────────────────────────────────────────────────────────
  uniform vec3      u_browColor;
  uniform float     u_browOpacity;

  // ── Lipstick ──────────────────────────────────────────────────────────────
  uniform vec3      u_lipColor;
  uniform float     u_lipOpacity;
  uniform float     u_lipGlossy;

  // ── Gamma ─────────────────────────────────────────────────────────────────
  vec3 toLinear(vec3 c) { return c * c; }
  vec3 toSrgb(vec3 c)   { return sqrt(max(c, vec3(0.0))); }

  // ── HSL ↔ RGB (for "Color" blend mode) ───────────────────────────────────
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
    return vec3(
      hueToChannel(p, q, h + 0.3333),
      hueToChannel(p, q, h),
      hueToChannel(p, q, h - 0.3333)
    );
  }

  vec3 rgbToHsl(vec3 c) {
    float mx = max(c.r, max(c.g, c.b));
    float mn = min(c.r, min(c.g, c.b));
    float l  = (mx + mn) * 0.5;
    float d  = mx - mn;
    if (d < 0.001) return vec3(0.0, 0.0, l);
    float s = l > 0.5 ? d / (2.0 - mx - mn) : d / (mx + mn);
    float h;
    if      (mx == c.r) h = (c.g - c.b) / d + (c.g < c.b ? 6.0 : 0.0);
    else if (mx == c.g) h = (c.b - c.r) / d + 2.0;
    else                h = (c.r - c.g) / d + 4.0;
    return vec3(h / 6.0, s, l);
  }

  // ── Blend modes ───────────────────────────────────────────────────────────

  // Photoshop "Color" mode — pigment hue+sat on skin luminance.
  // This is the key to realistic makeup: preserves skin shadows/highlights.
  vec3 blendColorMode(vec3 base, vec3 blend) {
    vec3 bHsl = rgbToHsl(base);
    vec3 cHsl = rgbToHsl(blend);
    return hslToRgb(cHsl.x, cHsl.y, bHsl.z);
  }

  // Soft Light (Pegtop) — gentle coverage, preserves texture. Good for
  // foundation and blush: adds color without blowing out highlights.
  vec3 blendSoftLight(vec3 base, vec3 blend) {
    vec3 low  = 2.0 * base * blend + base * base * (1.0 - 2.0 * blend);
    vec3 high = sqrt(max(base, vec3(0.001))) * (2.0 * blend - 1.0)
                + 2.0 * base * (1.0 - blend);
    return mix(low, high, step(vec3(0.5), blend));
  }

  vec3 blendMultiply(vec3 a, vec3 b) { return a * b; }
  vec3 blendScreen(vec3 a, vec3 b)   { return 1.0 - (1.0 - a) * (1.0 - b); }

  // ── Skin smoothing (5×5 bilateral-lite) ──────────────────────────────────
  vec3 skinSmooth(vec2 uv) {
    vec3  c    = texture2D(u_video, uv).rgb;
    vec3  acc  = vec3(0.0);
    float wSum = 0.0;
    for (float x = -2.0; x <= 2.0; x += 1.0) {
      for (float y = -2.0; y <= 2.0; y += 1.0) {
        vec2  o  = vec2(x, y) * u_texelSize;
        vec3  s  = texture2D(u_video, uv + o).rgb;
        float sp = exp(-(x*x + y*y) * 0.2);
        float rg = exp(-dot(s - c, s - c) * 12.0);
        float w  = sp * rg;
        acc  += s * w;
        wSum += w;
      }
    }
    return acc / wSum;
  }

  // ── Main ──────────────────────────────────────────────────────────────────
  void main() {
    // 1. Sample + optionally smooth skin
    vec3 raw  = texture2D(u_video, v_uv).rgb;
    vec3 skin = u_skinSmooth > 0.0 ? mix(raw, skinSmooth(v_uv), u_skinSmooth * 0.6) : raw;
    vec3 col  = toLinear(skin);

    // Sample masks
    float lipFill  = texture2D(u_lipMask,  v_uv).r;
    float lipGloss = texture2D(u_lipMask,  v_uv).g;
    float browFill = texture2D(u_browMask, v_uv).r;
    vec4  aux      = texture2D(u_auxMask,  v_uv);
    float contFill = aux.r;
    float foundFill = aux.g;

    // 2. Foundation — soft-light for natural skin-tone coverage
    if (u_foundOpacity > 0.0 && foundFill > 0.001) {
      vec3 b = blendSoftLight(col, toLinear(u_foundColor));
      col    = mix(col, b, foundFill * u_foundOpacity * 0.55);
    }

    // 3. Contour — multiply to sculpt jaw/cheekbones
    if (u_contOpacity > 0.0 && contFill > 0.001) {
      vec3 b = blendMultiply(col, toLinear(u_contColor));
      col    = mix(col, b, contFill * u_contOpacity * 0.70);
    }

    // 4. Blush — soft-light for a natural rosy flush
    if (u_blushOpacity > 0.0) {
      vec2  asp    = vec2(1.4, 1.0);
      float dL     = length((v_uv - u_blushL) * asp) / u_blushRad;
      float dR     = length((v_uv - u_blushR) * asp) / u_blushRad;
      float blushW = max(smoothstep(1.0, 0.0, dL), smoothstep(1.0, 0.0, dR));
      if (blushW > 0.001) {
        vec3 b = blendSoftLight(col, toLinear(u_blushColor));
        col    = mix(col, b, blushW * u_blushOpacity * 0.55);
      }
    }

    // 5. Brows — multiply for darkening/enhancement
    if (u_browOpacity > 0.0 && browFill > 0.001) {
      vec3 b = blendMultiply(col, toLinear(u_browColor));
      col    = mix(col, b, browFill * u_browOpacity * 0.72);
    }

    // 6. Lips — "Color" blend mode (Photoshop pigment model)
    //    Applies hue+sat of lip color while keeping skin luminance.
    //    Mix with multiply for darker/richer pigment on dark shades.
    if (u_lipOpacity > 0.0 && lipFill > 0.001) {
      vec3  lc       = toLinear(u_lipColor);
      vec3  colBlend = blendColorMode(col, lc);
      vec3  mulBlend = blendMultiply(col, lc);
      // Luminance of lip color: dark shades get more multiply weight
      float lipLum   = dot(lc, vec3(0.2126, 0.7152, 0.0722));
      vec3  lipBlend = mix(colBlend, mulBlend, (1.0 - lipLum) * 0.45);
      col = mix(col, lipBlend, lipFill * u_lipOpacity * 0.92);

      // 7. Gloss — screen blend adds specular sheen on center of upper lip
      if (u_lipGlossy > 0.0 && lipGloss > 0.001) {
        vec3 g = blendScreen(col, vec3(1.0, 0.97, 0.93));
        col    = mix(col, g, lipGloss * u_lipGlossy * 0.55);
      }
    }

    gl_FragColor = vec4(toSrgb(col), 1.0);
  }
`;
