import { LANDMARK_GROUPS, groupToPixels } from '@/utils/landmarks';
import { compositeLayer, buildPath } from '@/utils/canvas';
export function drawBrows(ctx, landmarks, width, height, config) {
    if (!config.enabled || config.opacity === 0)
        return;
    const leftPts = groupToPixels(LANDMARK_GROUPS.leftBrow, landmarks, width, height);
    const rightPts = groupToPixels(LANDMARK_GROUPS.rightBrow, landmarks, width, height);
    const faceWidth = Math.abs(landmarks[454].x - landmarks[234].x) * width;
    const thickness = faceWidth * 0.018;
    function browPolygon(pts) {
        const top = pts.map(([x, y]) => [x, y - thickness]);
        const bot = pts.map(([x, y]) => [x, y + thickness * 0.5]);
        return [...top, ...[...bot].reverse()];
    }
    for (const pts of [browPolygon(leftPts), browPolygon(rightPts)]) {
        // Soft base
        compositeLayer(ctx, width, height, {
            draw: (oc) => { buildPath(oc, pts); oc.fillStyle = config.color; oc.fill(); },
            blur: 3,
            blendMode: 'multiply',
            alpha: config.opacity * 0.55,
        });
        // Sharper definition
        compositeLayer(ctx, width, height, {
            draw: (oc) => { buildPath(oc, pts); oc.fillStyle = config.color; oc.fill(); },
            blur: 1,
            blendMode: 'multiply',
            alpha: config.opacity * 0.35,
        });
    }
}
