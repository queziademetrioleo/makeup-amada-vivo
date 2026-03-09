import { LANDMARK_GROUPS, groupToPixels } from '@/utils/landmarks';
import { compositeLayer, buildPath, hexToRgb } from '@/utils/canvas';
import type { NormalizedLandmarkList, LipstickConfig } from '@/types/makeup';

export function drawLipstick(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmarkList,
  width: number,
  height: number,
  config: LipstickConfig,
): void {
  if (!config.enabled || config.opacity === 0) return;

  const upper = groupToPixels(LANDMARK_GROUPS.lipsOuterUpper, landmarks, width, height);
  const lower = groupToPixels(LANDMARK_GROUPS.lipsOuterLower, landmarks, width, height);
  const path: [number, number][] = [...upper, ...lower.slice(1, -1)];

  // ── Layer 1: Soft feathered halo (gives a natural edge instead of hard line)
  compositeLayer(ctx, width, height, {
    draw: (oc) => { buildPath(oc, path); oc.fillStyle = config.color; oc.fill(); },
    blur: 7,
    blendMode: 'multiply',   // multiply = pigment on skin, not paint on skin
    alpha: config.opacity * 0.55,
  });

  // ── Layer 2: Defined lip fill
  compositeLayer(ctx, width, height, {
    draw: (oc) => { buildPath(oc, path); oc.fillStyle = config.color; oc.fill(); },
    blur: 1.5,
    blendMode: 'multiply',
    alpha: config.opacity * 0.6,
  });

  // ── Gloss: specular highlight on upper lip (screen blend = additive light)
  if (config.glossy) {
    const lm0 = landmarks[LANDMARK_GROUPS.lipsOuterUpper[4]];  // ~37 left peak
    const lm1 = landmarks[LANDMARK_GROUPS.lipsOuterUpper[6]];  // ~267 right peak
    const hx = ((lm0.x + lm1.x) / 2) * width;
    const hy = ((lm0.y + lm1.y) / 2) * height;
    const lipHeight = Math.abs(
      landmarks[LANDMARK_GROUPS.lipsOuterLower[5]].y * height - hy,
    );

    compositeLayer(ctx, width, height, {
      draw: (oc) => {
        const grad = oc.createRadialGradient(hx, hy, 0, hx, hy, lipHeight * 1.6);
        grad.addColorStop(0, 'rgba(255,255,255,0.7)');
        grad.addColorStop(0.4, 'rgba(255,255,255,0.25)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        oc.beginPath();
        oc.ellipse(hx, hy, lipHeight * 2, lipHeight * 0.9, 0, 0, Math.PI * 2);
        oc.fillStyle = grad;
        oc.fill();
      },
      blendMode: 'screen',
      alpha: 0.65,
    });
  }
}

// ── Lip liner (optional enhancement) ─────────────────────────────────────────
export function drawLipLiner(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmarkList,
  width: number,
  height: number,
  color: string,
  opacity: number,
): void {
  const upper = groupToPixels(LANDMARK_GROUPS.lipsOuterUpper, landmarks, width, height);
  const lower = groupToPixels(LANDMARK_GROUPS.lipsOuterLower, landmarks, width, height);
  const path: [number, number][] = [...upper, ...lower.slice(1, -1)];

  compositeLayer(ctx, width, height, {
    draw: (oc) => {
      const { r, g, b } = hexToRgb(color);
      buildPath(oc, path);
      oc.strokeStyle = `rgba(${r},${g},${b},1)`;
      oc.lineWidth = 1.5;
      oc.stroke();
    },
    blur: 1,
    blendMode: 'multiply',
    alpha: opacity * 0.5,
  });
}
