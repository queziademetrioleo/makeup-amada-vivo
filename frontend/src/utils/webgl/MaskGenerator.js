/**
 * MaskGenerator — draws makeup region masks into OffscreenCanvas textures
 * for upload to WebGL.
 *
 * Channels per canvas:
 *   lipCanvas  : R = lip fill,  G = gloss zone
 *   browCanvas : R = brow fill
 *   auxCanvas  : R = contour,   G = foundation
 */
import { LANDMARK_GROUPS, groupToPixels, centroid } from '@/utils/landmarks';
import { buildPath } from '@/utils/canvas';
function oc(w, h) {
    const c = new OffscreenCanvas(w, h);
    return { c, ctx: c.getContext('2d') };
}
// ── Lip mask ────────────────────────────────────────────────────────────────
function drawLipMask(ctx, landmarks, w, h) {
    ctx.clearRect(0, 0, w, h);
    const upperOuter = groupToPixels(LANDMARK_GROUPS.lipsOuterUpper, landmarks, w, h);
    const lowerOuter = groupToPixels(LANDMARK_GROUPS.lipsOuterLower, landmarks, w, h);
    const outerPoly = [
        ...upperOuter,
        ...[...lowerOuter].reverse().slice(1, -1),
    ];
    // R channel = full lip fill (red = 255 where lip is)
    ctx.globalCompositeOperation = 'source-over';
    buildPath(ctx, outerPoly);
    ctx.fillStyle = '#ff0000'; // R=1
    ctx.fill();
    // G channel = gloss zone (inner 1/3 only)
    // We approximate gloss by shrinking the outer lip path inward
    const cx = outerPoly.reduce((s, [x]) => s + x, 0) / outerPoly.length;
    const cy = outerPoly.reduce((s, [, y]) => s + y, 0) / outerPoly.length;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(0.55, 0.45);
    ctx.translate(-cx, -cy);
    buildPath(ctx, outerPoly);
    // Mix green into existing red pixels (additive)
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = '#00ff00'; // G=1
    ctx.fill();
    ctx.restore();
}
// ── Brow mask ───────────────────────────────────────────────────────────────
function drawBrowMask(ctx, landmarks, w, h) {
    ctx.clearRect(0, 0, w, h);
    const faceWidth = Math.abs(landmarks[454].x - landmarks[234].x) * w;
    const thickness = faceWidth * 0.018;
    const leftPts = groupToPixels(LANDMARK_GROUPS.leftBrow, landmarks, w, h);
    const rightPts = groupToPixels(LANDMARK_GROUPS.rightBrow, landmarks, w, h);
    function browPolygon(pts) {
        const top = pts.map(([x, y]) => [x, y - thickness]);
        const bot = pts.map(([x, y]) => [x, y + thickness * 0.5]);
        return [...top, ...[...bot].reverse()];
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.filter = 'blur(2px)';
    for (const poly of [browPolygon(leftPts), browPolygon(rightPts)]) {
        buildPath(ctx, poly);
        ctx.fillStyle = '#ff0000'; // R channel
        ctx.fill();
    }
    ctx.filter = 'none';
}
// ── Aux mask (contour R + foundation G) ────────────────────────────────────
function drawAuxMask(ctx, landmarks, w, h) {
    ctx.clearRect(0, 0, w, h);
    const faceWidth = Math.abs(landmarks[454].x - landmarks[234].x) * w;
    // R = contour (cheekbones + nose sides + forehead)
    ctx.globalCompositeOperation = 'source-over';
    ctx.filter = 'blur(14px)';
    for (const pts of [
        groupToPixels(LANDMARK_GROUPS.leftContour, landmarks, w, h),
        groupToPixels(LANDMARK_GROUPS.rightContour, landmarks, w, h),
    ]) {
        buildPath(ctx, pts);
        ctx.fillStyle = '#ff0000';
        ctx.fill();
    }
    ctx.filter = 'none';
    // G = foundation (face oval minus eyes/lips)
    const oval = groupToPixels(LANDMARK_GROUPS.faceOval, landmarks, w, h);
    const leftEye = groupToPixels(LANDMARK_GROUPS.leftEye, landmarks, w, h);
    const rightEye = groupToPixels(LANDMARK_GROUPS.rightEye, landmarks, w, h);
    const lips = [
        ...groupToPixels(LANDMARK_GROUPS.lipsOuterUpper, landmarks, w, h),
        ...groupToPixels(LANDMARK_GROUPS.lipsOuterLower, landmarks, w, h).slice(1, -1),
    ];
    ctx.filter = 'blur(8px)';
    ctx.globalCompositeOperation = 'source-over';
    buildPath(ctx, oval);
    buildPath(ctx, leftEye);
    buildPath(ctx, rightEye);
    buildPath(ctx, lips);
    ctx.fillStyle = '#00ff00'; // G channel
    ctx.fill('evenodd');
    ctx.filter = 'none';
    // Nose side contour blobs (add to R channel)
    const noseSize = faceWidth * 0.035;
    ctx.filter = 'blur(5px)';
    for (const idx of [48, 278]) {
        const nx = landmarks[idx].x * w;
        const ny = landmarks[idx].y * h;
        ctx.save();
        ctx.translate(nx, ny);
        ctx.scale(noseSize, noseSize * 2.2);
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
        g.addColorStop(0, 'rgba(255,0,0,0.7)');
        g.addColorStop(1, 'rgba(255,0,0,0)');
        ctx.beginPath();
        ctx.arc(0, 0, 1, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.restore();
    }
    ctx.filter = 'none';
}
export function generateMasks(landmarks, w, h) {
    const lip = oc(w, h);
    const brow = oc(w, h);
    const aux = oc(w, h);
    drawLipMask(lip.ctx, landmarks, w, h);
    drawBrowMask(brow.ctx, landmarks, w, h);
    drawAuxMask(aux.ctx, landmarks, w, h);
    // Blush UV centres (landmark → UV)
    const [lx, ly] = centroid(LANDMARK_GROUPS.leftCheek, landmarks, w, h);
    const [rx, ry] = centroid(LANDMARK_GROUPS.rightCheek, landmarks, w, h);
    const faceWidth = Math.abs(landmarks[454].x - landmarks[234].x);
    return {
        lipCanvas: lip.c,
        browCanvas: brow.c,
        auxCanvas: aux.c,
        blushLUV: [lx / w, ly / h],
        blushRUV: [rx / w, ry / h],
        blushRad: faceWidth * 0.16,
    };
}
