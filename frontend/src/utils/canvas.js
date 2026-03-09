export function hexToRgb(hex) {
    const clean = hex.replace('#', '');
    const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
    const n = parseInt(full, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
export function hexToRgba(hex, alpha) {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r},${g},${b},${alpha})`;
}
/**
 * Core compositing helper.
 *
 * Draws makeup onto an OffscreenCanvas (with optional blur) and then
 * composites the result onto the main canvas with the given blend mode
 * and opacity.
 *
 * Using an offscreen canvas means:
 *   1. We can blur the makeup BEFORE blending — blurring source pixels only,
 *      not the composite result (which would bleed into background).
 *   2. We can use blend modes like `multiply` which physically simulate
 *      how pigment interacts with skin: skin texture shows through instead
 *      of being painted over.
 */
export function compositeLayer(ctx, width, height, opts) {
    const { draw, blur = 0, blendMode = 'source-over', alpha = 1 } = opts;
    const oc = new OffscreenCanvas(width, height);
    const oc2d = oc.getContext('2d');
    if (!oc2d)
        return;
    if (blur > 0)
        oc2d.filter = `blur(${blur}px)`;
    draw(oc2d);
    ctx.save();
    ctx.globalCompositeOperation = blendMode;
    ctx.globalAlpha = alpha;
    ctx.drawImage(oc, 0, 0);
    ctx.restore();
}
/** Build a closed polygon path — shared by all makeup effects */
export function buildPath(ctx, points) {
    if (points.length < 3)
        return;
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++)
        ctx.lineTo(points[i][0], points[i][1]);
    ctx.closePath();
}
/** Legacy helper kept for backward compat */
export function drawPolygon(ctx, points, fillStyle, alpha, blur = 0, composite = 'source-over') {
    compositeLayer(ctx, ctx.canvas.width, ctx.canvas.height, {
        draw: (oc) => { buildPath(oc, points); oc.fillStyle = fillStyle; oc.fill(); },
        blur,
        blendMode: composite,
        alpha,
    });
}
export function drawRadialGradientEllipse(ctx, cx, cy, rx, ry, colorHex, alpha, blur = 0) {
    const { r, g, b } = hexToRgb(colorHex);
    compositeLayer(ctx, ctx.canvas.width, ctx.canvas.height, {
        draw: (oc) => {
            oc.save();
            oc.translate(cx, cy);
            oc.scale(rx, ry);
            const grad = oc.createRadialGradient(0, 0, 0, 0, 0, 1);
            grad.addColorStop(0, `rgba(${r},${g},${b},1)`);
            grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
            oc.beginPath();
            oc.arc(0, 0, 1, 0, Math.PI * 2);
            oc.fillStyle = grad;
            oc.fill();
            oc.restore();
        },
        blur,
        blendMode: 'source-over',
        alpha,
    });
}
