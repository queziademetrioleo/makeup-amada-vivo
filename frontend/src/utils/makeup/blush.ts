import { LANDMARK_GROUPS, centroid } from '@/utils/landmarks';
import { compositeLayer, hexToRgb } from '@/utils/canvas';
import type { NormalizedLandmarkList, BlushConfig } from '@/types/makeup';

export function drawBlush(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmarkList,
  width: number,
  height: number,
  config: BlushConfig,
): void {
  if (!config.enabled || config.opacity === 0) return;

  const [lx, ly] = centroid(LANDMARK_GROUPS.leftCheek, landmarks, width, height);
  const [rx, ry] = centroid(LANDMARK_GROUPS.rightCheek, landmarks, width, height);

  const faceWidth = Math.abs(landmarks[454].x - landmarks[234].x) * width;
  const rxSize = faceWidth * 0.16;
  const rySize = faceWidth * 0.10;

  const { r, g, b } = hexToRgb(config.color);

  function drawCheek(cx: number, cy: number) {
    compositeLayer(ctx, width, height, {
      draw: (oc) => {
        // Outer soft glow
        oc.save();
        oc.translate(cx, cy);
        oc.scale(rxSize * 1.6, rySize * 1.6);
        const outer = oc.createRadialGradient(0, 0, 0, 0, 0, 1);
        outer.addColorStop(0, `rgba(${r},${g},${b},0.6)`);
        outer.addColorStop(0.5, `rgba(${r},${g},${b},0.25)`);
        outer.addColorStop(1, `rgba(${r},${g},${b},0)`);
        oc.beginPath();
        oc.arc(0, 0, 1, 0, Math.PI * 2);
        oc.fillStyle = outer;
        oc.fill();
        oc.restore();
      },
      blur: 12,
      blendMode: 'multiply',
      alpha: config.opacity * 0.55,
    });

    // Inner concentration
    compositeLayer(ctx, width, height, {
      draw: (oc) => {
        oc.save();
        oc.translate(cx, cy);
        oc.scale(rxSize, rySize);
        const inner = oc.createRadialGradient(0, 0, 0, 0, 0, 1);
        inner.addColorStop(0, `rgba(${r},${g},${b},0.9)`);
        inner.addColorStop(1, `rgba(${r},${g},${b},0)`);
        oc.beginPath();
        oc.arc(0, 0, 1, 0, Math.PI * 2);
        oc.fillStyle = inner;
        oc.fill();
        oc.restore();
      },
      blur: 8,
      blendMode: 'multiply',
      alpha: config.opacity * 0.35,
    });
  }

  drawCheek(lx, ly);
  drawCheek(rx, ry);
}
