/**
 * MaskGenerator — draws precise makeup region masks into OffscreenCanvas
 * textures for upload to the WebGL shader.
 *
 * Channel layout:
 *   lipCanvas  : R = lip fill,  G = gloss zone (inner upper lip)
 *   browCanvas : R = brow fill
 *   auxCanvas  : R = contour,   G = foundation (face oval – eyes – lips)
 */
import { LANDMARK_GROUPS, groupToPixels, centroid } from '@/utils/landmarks';
import type { NormalizedLandmarkList } from '@/types/makeup';

// ── helpers ──────────────────────────────────────────────────────────────────

function oc(w: number, h: number) {
  const c = new OffscreenCanvas(w, h);
  return { c, ctx: c.getContext('2d')! };
}

/** Draw a smooth closed polygon without calling buildPath (which resets path) */
function polyPath(
  ctx: OffscreenCanvasRenderingContext2D,
  pts: [number, number][],
) {
  if (pts.length < 3) return;
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
}

// ── Lip mask ─────────────────────────────────────────────────────────────────

function drawLipMask(
  ctx: OffscreenCanvasRenderingContext2D,
  landmarks: NormalizedLandmarkList,
  w: number, h: number,
) {
  ctx.clearRect(0, 0, w, h);

  const upperOuter = groupToPixels(LANDMARK_GROUPS.lipsOuterUpper, landmarks, w, h);
  const lowerOuter = groupToPixels(LANDMARK_GROUPS.lipsOuterLower, landmarks, w, h);
  const upperInner = groupToPixels(LANDMARK_GROUPS.lipsInnerUpper, landmarks, w, h);
  const lowerInner = groupToPixels(LANDMARK_GROUPS.lipsInnerLower, landmarks, w, h);

  // Outer lip polygon
  const outerPoly: [number,number][] = [
    ...upperOuter,
    ...[...lowerOuter].reverse().slice(1, -1),
  ];
  // Inner mouth opening (teeth area)
  const innerPoly: [number,number][] = [
    ...upperInner,
    ...[...lowerInner].reverse().slice(1, -1),
  ];

  // R channel = lip fill: draw outer ring between outer and inner contours
  // Use evenodd so the inner mouth polygon punches a hole (teeth stay clear)
  ctx.globalCompositeOperation = 'source-over';
  ctx.beginPath();
  polyPath(ctx, outerPoly);  // outer boundary
  polyPath(ctx, innerPoly);  // inner hole
  ctx.fillStyle = '#ff0000';
  ctx.fill('evenodd');

  // G channel = gloss — narrow band on upper inner lip
  const cx = upperInner.reduce((s, [x]) => s + x, 0) / upperInner.length;
  const cy = upperInner.reduce((s, [, y]) => s + y, 0) / upperInner.length;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(0.65, 0.35);
  ctx.translate(-cx, -cy);
  ctx.globalCompositeOperation = 'lighter';
  ctx.beginPath();
  polyPath(ctx, upperInner);
  ctx.fillStyle = '#00ff00';
  ctx.fill();
  ctx.restore();
}

// ── Brow mask ────────────────────────────────────────────────────────────────

function drawBrowMask(
  ctx: OffscreenCanvasRenderingContext2D,
  landmarks: NormalizedLandmarkList,
  w: number, h: number,
) {
  ctx.clearRect(0, 0, w, h);
  const faceWidth = Math.abs(landmarks[454].x - landmarks[234].x) * w;

  // Sort by X so the stroke follows the arch left-to-right, not zigzag.
  // MediaPipe brow indices are not in anatomical order.
  const leftPts  = groupToPixels(LANDMARK_GROUPS.leftBrow, landmarks, w, h)
                     .sort((a, b) => a[0] - b[0]);
  const rightPts = groupToPixels(LANDMARK_GROUPS.rightBrow, landmarks, w, h)
                     .sort((a, b) => a[0] - b[0]);

  ctx.globalCompositeOperation = 'source-over';
  ctx.lineWidth   = faceWidth * 0.018;
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';
  ctx.strokeStyle = '#ff0000';
  ctx.filter      = 'blur(2px)';

  for (const pts of [leftPts, rightPts]) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
  }
  ctx.filter = 'none';
}

// ── Aux mask (contour R + foundation G) ──────────────────────────────────────

function drawAuxMask(
  ctx: OffscreenCanvasRenderingContext2D,
  landmarks: NormalizedLandmarkList,
  w: number, h: number,
) {
  ctx.clearRect(0, 0, w, h);
  const faceWidth = Math.abs(landmarks[454].x - landmarks[234].x) * w;

  // ── R channel = contour (cheekbone / jaw area) ────────────────────────────
  ctx.globalCompositeOperation = 'source-over';
  ctx.filter = 'blur(16px)';
  for (const pts of [
    groupToPixels(LANDMARK_GROUPS.leftContour,  landmarks, w, h),
    groupToPixels(LANDMARK_GROUPS.rightContour, landmarks, w, h),
  ]) {
    ctx.beginPath();
    polyPath(ctx, pts);
    ctx.fillStyle = '#ff0000';
    ctx.fill();
  }
  ctx.filter = 'none';

  // Nose-side contour blobs (R channel, additive)
  const noseSize = faceWidth * 0.032;
  ctx.filter = 'blur(4px)';
  for (const idx of [48, 278] as const) {
    const nx = landmarks[idx].x * w;
    const ny = landmarks[idx].y * h;
    ctx.save();
    ctx.translate(nx, ny);
    ctx.scale(noseSize, noseSize * 2.0);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    g.addColorStop(0, 'rgba(255,0,0,0.65)');
    g.addColorStop(1, 'rgba(255,0,0,0)');
    ctx.beginPath();
    ctx.arc(0, 0, 1, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
  }
  ctx.filter = 'none';

  // ── G channel = foundation (face oval – eyes – lips, compound path) ───────
  const oval      = groupToPixels(LANDMARK_GROUPS.faceOval,       landmarks, w, h);
  const leftEye   = groupToPixels(LANDMARK_GROUPS.leftEye,        landmarks, w, h);
  const rightEye  = groupToPixels(LANDMARK_GROUPS.rightEye,       landmarks, w, h);
  const lipsTop   = groupToPixels(LANDMARK_GROUPS.lipsOuterUpper, landmarks, w, h);
  const lipsBot   = groupToPixels(LANDMARK_GROUPS.lipsOuterLower, landmarks, w, h);
  const lips: [number,number][] = [
    ...lipsTop,
    ...lipsBot.slice(1, -1),
  ];

  // Slightly expand eye holes so foundation doesn't bleed onto eyelids
  const expand = (pts: [number,number][], scale: number): [number,number][] => {
    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
    const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    return pts.map(([x, y]) => [cx + (x - cx) * scale, cy + (y - cy) * scale]);
  };

  ctx.filter = 'blur(8px)';
  ctx.globalCompositeOperation = 'source-over';

  // Single compound path — all sub-paths before fill('evenodd')
  ctx.beginPath();
  polyPath(ctx, oval);
  polyPath(ctx, expand(leftEye,  1.35));
  polyPath(ctx, expand(rightEye, 1.35));
  polyPath(ctx, lips);
  ctx.fillStyle = '#00ff00';
  ctx.fill('evenodd');
  ctx.filter = 'none';
}

// ── Public API ────────────────────────────────────────────────────────────────

export interface MaskSet {
  lipCanvas:  OffscreenCanvas;
  browCanvas: OffscreenCanvas;
  auxCanvas:  OffscreenCanvas;
  blushLUV:   [number, number];
  blushRUV:   [number, number];
  blushRad:   number;
}

export function generateMasks(
  landmarks: NormalizedLandmarkList,
  w: number,
  h: number,
): MaskSet {
  const lip  = oc(w, h);
  const brow = oc(w, h);
  const aux  = oc(w, h);

  drawLipMask (lip.ctx,  landmarks, w, h);
  drawBrowMask(brow.ctx, landmarks, w, h);
  drawAuxMask (aux.ctx,  landmarks, w, h);

  // Blush UV centres — Y flipped to match UNPACK_FLIP_Y_WEBGL
  const [lx, ly] = centroid(LANDMARK_GROUPS.leftCheek,  landmarks, w, h);
  const [rx, ry] = centroid(LANDMARK_GROUPS.rightCheek, landmarks, w, h);
  const faceWidth = Math.abs(landmarks[454].x - landmarks[234].x);

  return {
    lipCanvas:  lip.c,
    browCanvas: brow.c,
    auxCanvas:  aux.c,
    blushLUV:   [lx / w, 1 - ly / h],
    blushRUV:   [rx / w, 1 - ry / h],
    blushRad:   faceWidth * 0.16,
  };
}
