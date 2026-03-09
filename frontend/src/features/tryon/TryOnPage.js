import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebcam } from '@/hooks/useWebcam';
import { useFaceMesh } from '@/hooks/useFaceMesh';
import { useMakeupStore, PRESETS } from '@/store/useMakeupStore';
import { useCameraStore } from '@/store/useCameraStore';
import { useAuthStore } from '@/store/useAuthStore';
import { CameraPermission } from '@/features/camera/CameraPermission';
import { TryOnCanvas } from './TryOnCanvas';
import { TryOnControls } from './TryOnControls';
import { uploadSnapshot } from '@/lib/storage';
import { saveLook } from '@/lib/firestore';
export function TryOnPage() {
    const [searchParams] = useSearchParams();
    const canvasRef = useRef(null);
    const [isSaving, setIsSaving] = useState(false);
    const [snapshotUrl, setSnapshotUrl] = useState(null);
    const { videoRef, isReady, isLoading, error, start } = useWebcam();
    // FaceLandmarker initialises immediately — no need to wait for camera
    const { faceLandmarkerRef } = useFaceMesh();
    const { faceMeshReady, faceDetected } = useCameraStore();
    const { config, showBeforeAfter, showDebugLandmarks, applyPreset } = useMakeupStore();
    const { user, openAuthModal } = useAuthStore();
    useEffect(() => {
        const presetId = searchParams.get('preset');
        if (presetId) {
            const preset = PRESETS.find((p) => p.id === presetId);
            if (preset)
                applyPreset(preset);
        }
    }, [searchParams, applyPreset]);
    const handleSnapshot = async () => {
        const dataUrl = canvasRef.current?.captureSnapshot();
        if (!dataUrl)
            return;
        if (!user) {
            setSnapshotUrl(dataUrl);
            return;
        }
        setIsSaving(true);
        try {
            const url = await uploadSnapshot(user.uid, dataUrl);
            await saveLook({
                userId: user.uid,
                name: `Look ${new Date().toLocaleDateString('pt-BR')}`,
                snapshotUrl: url,
                makeupConfig: config,
            });
            setSnapshotUrl(url);
        }
        catch {
            setSnapshotUrl(dataUrl);
        }
        finally {
            setIsSaving(false);
        }
    };
    const cameraStatus = isLoading ? 'requesting' : error ? 'error' : 'idle';
    return (_jsxs("div", { className: "min-h-dvh pt-16 flex flex-col lg:flex-row gap-0", children: [_jsx("video", { ref: videoRef, autoPlay: true, playsInline: true, muted: true, style: {
                    position: 'fixed',
                    top: -9999,
                    left: -9999,
                    width: 1,
                    height: 1,
                    opacity: 0,
                    pointerEvents: 'none',
                }, "aria-hidden": "true" }), _jsx("div", { className: "flex-1 flex items-center justify-center p-4 lg:p-6", children: _jsx("div", { className: "w-full max-w-2xl", children: isReady ? (_jsx(motion.div, { initial: { opacity: 0, scale: 0.97 }, animate: { opacity: 1, scale: 1 }, className: "relative aspect-[4/3] w-full", children: _jsx(TryOnCanvas, { ref: canvasRef, videoRef: videoRef, faceLandmarkerRef: faceLandmarkerRef, config: config, showBeforeAfter: showBeforeAfter, showDebug: showDebugLandmarks, faceMeshReady: faceMeshReady, faceDetected: faceDetected }) })) : (_jsx("div", { className: "aspect-[4/3] w-full glass-panel rounded-2xl overflow-hidden", children: _jsx(CameraPermission, { status: cameraStatus, error: error, onStart: start }) })) }) }), _jsx("div", { className: "w-full lg:w-80 xl:w-96 p-4 lg:p-6 lg:pl-0 flex flex-col", children: _jsx("div", { className: "h-full lg:h-[calc(100dvh-5rem)]", children: _jsx(TryOnControls, { onSnapshot: handleSnapshot, isSaving: isSaving }) }) }), _jsx(AnimatePresence, { children: snapshotUrl && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm", children: _jsxs(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.9 }, className: "card p-6 max-w-sm w-full space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "font-semibold", children: "Sua foto" }), _jsx("button", { onClick: () => setSnapshotUrl(null), className: "text-white/40 hover:text-white text-xl", children: "\u00D7" })] }), _jsx("img", { src: snapshotUrl, alt: "Snapshot do look", className: "w-full rounded-xl object-cover" }), _jsxs("div", { className: "flex gap-3", children: [_jsx("a", { href: snapshotUrl, download: "meu-look.jpg", className: "flex-1 btn-primary text-center text-sm py-2.5", children: "Baixar foto" }), !user && (_jsx("button", { onClick: () => { setSnapshotUrl(null); openAuthModal(); }, className: "flex-1 btn-ghost text-sm py-2.5", children: "Salvar na conta" }))] })] }) })) })] }));
}
