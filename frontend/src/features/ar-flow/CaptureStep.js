import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Step 2 — Tela 5 do fluxo
 * Câmera ao vivo + guia oval + detecção de rosto.
 * Botão "Iniciar Análise" ativa quando rosto está centralizado.
 */
import { useRef, useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useARStore } from '@/store/useARStore';
export function CaptureStep({ videoRef, faceLandmarkerRef, faceMeshReady }) {
    const { setCapturedPhoto } = useARStore();
    const canvasRef = useRef(null);
    const rafRef = useRef(0);
    const tsRef = useRef(0);
    const lmRef = useRef(null);
    const detRef = useRef(false);
    const [detected, setDetected] = useState(false);
    const [busy, setBusy] = useState(false);
    const tick = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || video.readyState < 2) {
            rafRef.current = requestAnimationFrame(tick);
            return;
        }
        const vw = video.videoWidth, vh = video.videoHeight;
        if (!vw) {
            rafRef.current = requestAnimationFrame(tick);
            return;
        }
        if (canvas.width !== vw)
            canvas.width = vw;
        if (canvas.height !== vh)
            canvas.height = vh;
        const ctx = canvas.getContext('2d');
        // Mirror for selfie view
        ctx.save();
        ctx.translate(vw, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, vw, vh);
        ctx.restore();
        // Face detection
        const fl = faceLandmarkerRef.current;
        if (fl && faceMeshReady) {
            const now = performance.now();
            const ts = now > tsRef.current ? now : tsRef.current + 1;
            tsRef.current = ts;
            try {
                const res = fl.detectForVideo(video, ts);
                const lm = res.faceLandmarks[0];
                lmRef.current = lm ?? null;
                const d = !!lm;
                if (d !== detRef.current) {
                    detRef.current = d;
                    setDetected(d);
                }
            }
            catch { /* ignore */ }
        }
        rafRef.current = requestAnimationFrame(tick);
    }, [videoRef, faceLandmarkerRef, faceMeshReady]);
    useEffect(() => {
        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [tick]);
    const handleCapture = useCallback(() => {
        const video = videoRef.current;
        if (!video || busy)
            return;
        setBusy(true);
        cancelAnimationFrame(rafRef.current);
        // Capture unmirrored frame (landmarks are in unmirrored coords)
        const snap = document.createElement('canvas');
        snap.width = video.videoWidth;
        snap.height = video.videoHeight;
        snap.getContext('2d').drawImage(video, 0, 0);
        setCapturedPhoto(snap.toDataURL('image/jpeg', 0.92));
    }, [videoRef, busy, setCapturedPhoto]);
    return (_jsxs(motion.div, { className: "relative w-full h-full overflow-hidden bg-black", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, children: [_jsx("canvas", { ref: canvasRef, className: "absolute inset-0 w-full h-full object-cover" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70 pointer-events-none" }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center pointer-events-none", children: _jsxs("div", { className: "relative", style: { width: '64%', aspectRatio: '3/4' }, children: [_jsx("div", { className: `absolute inset-0 rounded-[50%] border-2 transition-colors duration-500 ${detected ? 'border-emerald-400' : 'border-white/40'}` }), ['tl', 'tr', 'bl', 'br'].map((pos) => (_jsx("div", { className: `absolute w-7 h-7 transition-colors duration-500 ${detected ? 'border-emerald-400' : 'border-white/70'}
                ${pos === 'tl' ? 'top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-lg' : ''}
                ${pos === 'tr' ? 'top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-lg' : ''}
                ${pos === 'bl' ? 'bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-lg' : ''}
                ${pos === 'br' ? 'bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-lg' : ''}
              ` }, pos))), _jsx(AnimatePresence, { children: detected && (_jsx(motion.div, { className: "absolute inset-0 rounded-[50%] border-2 border-emerald-400", initial: { opacity: 0.7, scale: 1 }, animate: { opacity: 0, scale: 1.1 }, transition: { duration: 1, repeat: Infinity } })) })] }) }), _jsx("div", { className: "absolute top-10 inset-x-0 flex justify-center", children: _jsx(AnimatePresence, { mode: "wait", children: !faceMeshReady ? (_jsx(motion.div, { className: "px-4 py-2 rounded-full bg-black/70 backdrop-blur-sm", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, children: _jsx("p", { className: "text-white/60 text-sm", children: "Inicializando IA..." }) }, "init")) : detected ? (_jsxs(motion.div, { className: "px-4 py-2 rounded-full bg-emerald-500/90 backdrop-blur-sm flex items-center gap-2", initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0 }, children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-white animate-pulse" }), _jsx("p", { className: "text-white text-sm font-medium", children: "Rosto detectado" })] }, "ok")) : (_jsx(motion.div, { className: "px-4 py-2 rounded-full bg-black/70 backdrop-blur-sm", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, children: _jsx("p", { className: "text-white/60 text-sm", children: "Centralize seu rosto no guia" }) }, "wait")) }) }), _jsxs("div", { className: "absolute bottom-0 inset-x-0 px-6 pb-12 flex flex-col items-center gap-3", children: [_jsx(motion.button, { onClick: handleCapture, disabled: !detected || !faceMeshReady || busy, className: `w-full max-w-xs py-4 rounded-2xl font-semibold text-base transition-all duration-300 ${detected && faceMeshReady && !busy
                            ? 'bg-white text-black'
                            : 'bg-white/20 text-white/40 cursor-not-allowed'}`, whileTap: detected ? { scale: 0.97 } : undefined, children: busy ? 'Analisando...' : 'Iniciar Análise' }), _jsx("p", { className: "text-white/40 text-xs", children: detected ? 'Toque para capturar seu rosto' : 'Posicione o rosto dentro do guia' })] })] }));
}
