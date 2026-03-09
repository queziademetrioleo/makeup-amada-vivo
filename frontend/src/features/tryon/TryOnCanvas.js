import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { AnimatePresence } from 'framer-motion';
import { WebGLMakeupRenderer } from '@/utils/webgl/WebGLMakeupRenderer';
import { generateMasks } from '@/utils/webgl/MaskGenerator';
import { LiveBadge, FaceMeshLoadingOverlay, NoFaceIndicator } from '@/features/camera/CameraView';
import { useCameraStore } from '@/store/useCameraStore';
function drawDebugDots(ctx, landmarks, width, height) {
    ctx.save();
    ctx.fillStyle = 'rgba(232, 128, 154, 0.8)';
    for (const lm of landmarks) {
        ctx.beginPath();
        ctx.arc(lm.x * width, lm.y * height, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}
export const TryOnCanvas = forwardRef(({ videoRef, faceLandmarkerRef, config, showBeforeAfter, showDebug, faceMeshReady, faceDetected }, ref) => {
    // WebGL canvas — makeup rendered here
    const glCanvasRef = useRef(null);
    // 2D canvas — debug dots + before/after overlay
    const overlayRef = useRef(null);
    const rendererRef = useRef(null);
    const rafRef = useRef(0);
    const prevFaceRef = useRef(false);
    const tsRef = useRef(0);
    const { setFaceDetected } = useCameraStore.getState();
    // Expose snapshot (reads the WebGL canvas)
    useImperativeHandle(ref, () => ({
        captureSnapshot: () => {
            const canvas = glCanvasRef.current;
            if (!canvas)
                return '';
            const offscreen = document.createElement('canvas');
            offscreen.width = canvas.width;
            offscreen.height = canvas.height;
            const octx = offscreen.getContext('2d');
            octx.translate(canvas.width, 0);
            octx.scale(-1, 1);
            octx.drawImage(canvas, 0, 0);
            return offscreen.toDataURL('image/jpeg', 0.92);
        },
    }));
    // Lazily create / resize WebGLMakeupRenderer
    const getRenderer = useCallback((w, h) => {
        const canvas = glCanvasRef.current;
        if (!canvas)
            return null;
        if (canvas.width !== w)
            canvas.width = w;
        if (canvas.height !== h)
            canvas.height = h;
        if (!rendererRef.current) {
            try {
                rendererRef.current = new WebGLMakeupRenderer(canvas);
            }
            catch (e) {
                console.error('WebGL init failed:', e);
                return null;
            }
        }
        return rendererRef.current;
    }, []);
    const renderFrame = useCallback(() => {
        const video = videoRef.current;
        if (!video || video.readyState < 2) {
            rafRef.current = requestAnimationFrame(renderFrame);
            return;
        }
        const vw = video.videoWidth;
        const vh = video.videoHeight;
        if (vw === 0 || vh === 0) {
            rafRef.current = requestAnimationFrame(renderFrame);
            return;
        }
        // ── Detect face ──────────────────────────────────────────────────────────
        let landmarks = null;
        const fl = faceLandmarkerRef.current;
        if (fl && faceMeshReady) {
            const now = performance.now();
            const ts = now > tsRef.current ? now : tsRef.current + 1;
            tsRef.current = ts;
            try {
                const results = fl.detectForVideo(video, ts);
                landmarks = results.faceLandmarks[0] ?? null;
            }
            catch { /* ignore single-frame errors */ }
        }
        const detected = !!landmarks;
        if (detected !== prevFaceRef.current) {
            prevFaceRef.current = detected;
            setFaceDetected(detected);
        }
        // ── Sync overlay canvas size ─────────────────────────────────────────────
        const ov = overlayRef.current;
        if (ov && (ov.width !== vw || ov.height !== vh)) {
            ov.width = vw;
            ov.height = vh;
        }
        const ovCtx = ov?.getContext('2d') ?? null;
        ovCtx?.clearRect(0, 0, vw, vh);
        // ── WebGL render ─────────────────────────────────────────────────────────
        if (landmarks && !showBeforeAfter) {
            const renderer = getRenderer(vw, vh);
            if (renderer) {
                const masks = generateMasks(landmarks, vw, vh);
                renderer.render(video, masks.lipCanvas, masks.browCanvas, masks.auxCanvas, config, masks.blushLUV, masks.blushRUV, masks.blushRad);
            }
            if (showDebug && ovCtx)
                drawDebugDots(ovCtx, landmarks, vw, vh);
        }
        else if (landmarks && showBeforeAfter) {
            // Left half = plain video in WebGL (opacity 0 for all makeup)
            // Right half = full makeup — achieved by clipping the overlay
            const renderer = getRenderer(vw, vh);
            if (renderer) {
                const masks = generateMasks(landmarks, vw, vh);
                renderer.render(video, masks.lipCanvas, masks.browCanvas, masks.auxCanvas, config, masks.blushLUV, masks.blushRUV, masks.blushRad);
            }
            // Overlay: mask left half with raw video (drawn on overlay canvas)
            if (ovCtx) {
                ovCtx.save();
                ovCtx.beginPath();
                ovCtx.rect(0, 0, vw / 2, vh);
                ovCtx.clip();
                ovCtx.drawImage(video, 0, 0, vw, vh);
                ovCtx.restore();
                // Divider line + labels (appear mirrored to user, so flip them)
                const half = vw / 2;
                ovCtx.save();
                ovCtx.strokeStyle = 'rgba(255,255,255,0.55)';
                ovCtx.lineWidth = 1.5;
                ovCtx.setLineDash([5, 4]);
                ovCtx.beginPath();
                ovCtx.moveTo(half, 0);
                ovCtx.lineTo(half, vh);
                ovCtx.stroke();
                ovCtx.save();
                ovCtx.translate(half, 0);
                ovCtx.scale(-1, 1);
                ovCtx.fillStyle = 'rgba(255,255,255,0.45)';
                ovCtx.font = '11px Inter, sans-serif';
                ovCtx.fillText('DEPOIS', -half + 10, 20);
                ovCtx.fillText('ANTES', 10, 20);
                ovCtx.restore();
                ovCtx.restore();
            }
        }
        else {
            // No face detected — just show plain video in WebGL canvas
            const renderer = getRenderer(vw, vh);
            if (renderer) {
                // Render with all opacities zeroed via disabled config
                const noMakeup = Object.fromEntries(Object.entries(config).map(([k, v]) => [k, { ...v, enabled: false }]));
                const empty = new OffscreenCanvas(vw, vh);
                renderer.render(video, empty, empty, empty, noMakeup, [0.3, 0.6], [0.7, 0.6], 0.1);
            }
        }
        rafRef.current = requestAnimationFrame(renderFrame);
    }, [videoRef, faceLandmarkerRef, config, showBeforeAfter, showDebug, faceMeshReady, setFaceDetected, getRenderer]);
    useEffect(() => {
        rafRef.current = requestAnimationFrame(renderFrame);
        return () => {
            cancelAnimationFrame(rafRef.current);
            rendererRef.current?.dispose();
            rendererRef.current = null;
        };
    }, [renderFrame]);
    return (_jsxs("div", { className: "relative w-full h-full flex items-center justify-center bg-black rounded-2xl overflow-hidden", children: [_jsx("canvas", { ref: glCanvasRef, className: "absolute inset-0 w-full h-full object-cover", style: { transform: 'scaleX(-1)' } }), _jsx("canvas", { ref: overlayRef, className: "absolute inset-0 w-full h-full object-cover", style: { transform: 'scaleX(-1)' } }), _jsx(LiveBadge, {}), _jsx(AnimatePresence, { children: !faceMeshReady && _jsx(FaceMeshLoadingOverlay, { isReady: faceMeshReady }) }), faceMeshReady && !faceDetected && _jsx(NoFaceIndicator, {})] }));
});
TryOnCanvas.displayName = 'TryOnCanvas';
