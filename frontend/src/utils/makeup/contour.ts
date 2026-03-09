import { LANDMARK_GROUPS, groupToPixels, centroid } from '@/utils/landmarks';
import { compositeLayer, buildPath, hexToRgb } from '@/utils/canvas';
import type { NormalizedLandmarkList, ContourConfig } from '@/types/makeup';

export function drawContour(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmarkList,
  width: number,
  height: number,
  config: ContourConfig,
): void {
  if (!config.enabled || config.opacity === 0) return;

  const { r, g, b } = hexToRgb(config.color);
  const faceWidth = Math.abs(landmarks[454].x - landmarks[234].x) * width;
  const alpha = config.opacity * 0.45;

  // ── Under-cheekbone shadows ───────────────────────────────────────────────
  const leftPts = groupToPixels(LANDMARK_GROUPS.leftContour, landmarks, width, height);
  const rightPts = groupToPixels(LANDMARK_GROUPS.rightContour, landmarks, width, height);

  for (const pts of [leftPts, rightPts]) {
    compositeLayer(ctx, width, height, {
      draw: (oc) => { buildPath(oc, pts); oc.fillStyle = config.color; oc.fill(); },
      blur: 14,
      blendMode: 'multiply',
      alpha,
    });
  }

  // ── Nose sides ────────────────────────────────────────────────────────────
  const noseSize = faceWidth * 0.035;
  for (const idx of [48, 278]) {
    const nx = landmarks[idx].x * width;
    const ny = landmarks[idx].y * height;
    compositeLayer(ctx, width, height, {
      draw: (oc) => {
        oc.save();
        oc.translate(nx, ny);
        oc.scale(noseSize, noseSize * 2.2);
        const g2 = oc.createRadialGradient(0, 0, 0, 0, 0, 1);
        g2.addColorStop(0, `rgba(${r},${g},${b},1)`);
        g2.addColorStop(1, `rgba(${r},${g},${b},0)`);
        oc.beginPath();
        oc.arc(0, 0, 1, 0, Math.PI * 2);
        oc.fillStyle = g2;
        oc.fill();
        oc.restore();
      },
      blur: 5,
      blendMode: 'multiply',
      alpha: alpha * 0.6,
    });
  }

  // ── Forehead hairline ─────────────────────────────────────────────────────
  const [fcx, fcy] = centroid([10, 151, 9, 8, 107, 336], landmarks, width, height);
  compositeLayer(ctx, width, height, {
    draw: (oc) => {
      oc.save();
      oc.translate(fcx, fcy - 8);
      oc.scale(faceWidth * 0.20, faceWidth * 0.06);
      const gf = oc.createRadialGradient(0, 0, 0, 0, 0, 1);
      gf.addColorStop(0, `rgba(${r},${g},${b},0.7)`);
      gf.addColorStop(1, `rgba(${r},${g},${b},0)`);
      oc.beginPath();
      oc.arc(0, 0, 1, 0, Math.PI * 2);
      oc.fillStyle = gf;
      oc.fill();
      oc.restore();
    },
    blur: 10,
    blendMode: 'multiply',
    alpha: alpha * 0.35,
  });
}
