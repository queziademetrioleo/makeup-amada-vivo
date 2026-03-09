import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * AR Flow — orquestra as 4 telas:
 *   lighting → capture → confirm → studio
 *
 * O elemento <video> fica sempre montado (nunca desmontado) para que
 * o srcObject / stream da câmera não seja perdido entre os steps.
 */
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useWebcam } from '@/hooks/useWebcam';
import { useFaceMesh } from '@/hooks/useFaceMesh';
import { useCameraStore } from '@/store/useCameraStore';
import { useARStore } from '@/store/useARStore';
import { LightingStep } from './LightingStep';
import { CaptureStep } from './CaptureStep';
import { ConfirmStep } from './ConfirmStep';
import { StudioStep } from './StudioStep';
export function ARFlowPage() {
    const [searchParams] = useSearchParams();
    const { step, setProduct } = useARStore();
    const { videoRef, start } = useWebcam();
    const { faceLandmarkerRef } = useFaceMesh();
    const { faceMeshReady } = useCameraStore();
    // Canvas used by LightingStep for the blurred camera preview
    const previewCanvasRef = useRef(null);
    const previewRafRef = useRef(0);
    // Apply product from URL
    useEffect(() => {
        const p = searchParams.get('product');
        if (p)
            setProduct(p);
    }, [searchParams, setProduct]);
    // Start camera immediately so it's ready by the time user reaches capture
    useEffect(() => {
        start();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // Drive the preview canvas for the LightingStep background
    useEffect(() => {
        function drawPreview() {
            const video = videoRef.current;
            const canvas = previewCanvasRef.current;
            if (!video || !canvas || video.readyState < 2) {
                previewRafRef.current = requestAnimationFrame(drawPreview);
                return;
            }
            const vw = video.videoWidth, vh = video.videoHeight;
            if (!vw) {
                previewRafRef.current = requestAnimationFrame(drawPreview);
                return;
            }
            if (canvas.width !== vw)
                canvas.width = vw;
            if (canvas.height !== vh)
                canvas.height = vh;
            canvas.getContext('2d').drawImage(video, 0, 0);
            previewRafRef.current = requestAnimationFrame(drawPreview);
        }
        previewRafRef.current = requestAnimationFrame(drawPreview);
        return () => cancelAnimationFrame(previewRafRef.current);
    }, [videoRef]);
    return (_jsxs("div", { className: "fixed inset-0 overflow-hidden bg-zinc-950", children: [_jsx("video", { ref: videoRef, autoPlay: true, playsInline: true, muted: true, style: {
                    position: 'fixed',
                    top: -9999,
                    left: -9999,
                    width: 1,
                    height: 1,
                    pointerEvents: 'none',
                }, "aria-hidden": "true" }), _jsxs(AnimatePresence, { mode: "wait", children: [step === 'lighting' && (_jsx(LightingStep, { cameraPreviewRef: previewCanvasRef }, "lighting")), step === 'capture' && (_jsx(CaptureStep, { videoRef: videoRef, faceLandmarkerRef: faceLandmarkerRef, faceMeshReady: faceMeshReady }, "capture")), step === 'confirm' && _jsx(ConfirmStep, {}, "confirm"), step === 'studio' && (_jsx(StudioStep, { videoRef: videoRef, faceLandmarkerRef: faceLandmarkerRef, faceMeshReady: faceMeshReady }, "studio"))] })] }));
}
