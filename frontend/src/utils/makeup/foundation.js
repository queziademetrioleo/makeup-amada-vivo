import { LANDMARK_GROUPS, groupToPixels } from '@/utils/landmarks';
import { compositeLayer, buildPath } from '@/utils/canvas';
/**
 * Foundation — evens out skin tone with a very low-opacity overlay.
 * Uses 'source-over' (not multiply) because foundation ADDS coverage,
 * it doesn't darken. Excludes eyes and mouth area.
 */
export function drawFoundation(ctx, landmarks, width, height, config) {
    if (!config.enabled || config.opacity === 0)
        return;
    const oval = groupToPixels(LANDMARK_GROUPS.faceOval, landmarks, width, height);
    const leftEye = groupToPixels(LANDMARK_GROUPS.leftEye, landmarks, width, height);
    const rightEye = groupToPixels(LANDMARK_GROUPS.rightEye, landmarks, width, height);
    const lips = [
        ...groupToPixels(LANDMARK_GROUPS.lipsOuterUpper, landmarks, width, height),
        ...groupToPixels(LANDMARK_GROUPS.lipsOuterLower, landmarks, width, height).slice(1, -1),
    ];
    compositeLayer(ctx, width, height, {
        draw: (oc) => {
            // Face oval
            buildPath(oc, oval);
            // Punch holes for eyes and lips (even-odd fill rule)
            buildPath(oc, leftEye);
            buildPath(oc, rightEye);
            buildPath(oc, lips);
            oc.fillStyle = config.color;
            oc.fill('evenodd');
        },
        blur: 8,
        blendMode: 'source-over',
        alpha: config.opacity * 0.28,
    });
}
