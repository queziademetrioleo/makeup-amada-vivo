import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { analyzeWithGemini } from '@/lib/gemini';
import { findProduct } from '@/data/catalog';
import { useRecommendationStore } from '@/store/useRecommendationStore';
export function CapturePage() {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const landmarkerRef = useRef(null);
    const streamRef = useRef(null);
    const rafRef = useRef(0);
    const [status, setStatus] = useState('init');
    const [errorMsg, setErrorMsg] = useState('');
    const [faceCount, setFaceCount] = useState(0);
    const { setPhoto, setResult, setLoading, setError } = useRecommendationStore();
    // ── Init camera + FaceLandmarker ─────────────────────────────────────────
    useEffect(() => {
        let cancelled = false;
        async function init() {
            try {
                // Start camera
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
                });
                if (cancelled) {
                    stream.getTracks().forEach((t) => t.stop());
                    return;
                }
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }
                // Load face landmarker
                const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm');
                if (cancelled)
                    return;
                const landmarker = await FaceLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
                        delegate: 'GPU',
                    },
                    runningMode: 'VIDEO',
                    numFaces: 5,
                    minFaceDetectionConfidence: 0.5,
                    minTrackingConfidence: 0.5,
                });
                if (cancelled)
                    return;
                landmarkerRef.current = landmarker;
                setStatus('ready');
                // Detection loop
                function detect() {
                    if (cancelled)
                        return;
                    const video = videoRef.current;
                    if (video && landmarker && video.readyState >= 2) {
                        const result = landmarker.detectForVideo(video, performance.now());
                        const count = result.faceLandmarks?.length ?? 0;
                        setFaceCount(count);
                        if (count === 0)
                            setStatus('no-face');
                        else if (count > 1)
                            setStatus('multi-face');
                        else
                            setStatus('ready');
                    }
                    rafRef.current = requestAnimationFrame(detect);
                }
                detect();
            }
            catch (err) {
                console.error(err);
                setStatus('error');
                setErrorMsg('Não foi possível acessar a câmera.');
            }
        }
        init();
        return () => {
            cancelled = true;
            cancelAnimationFrame(rafRef.current);
            streamRef.current?.getTracks().forEach((t) => t.stop());
            landmarkerRef.current?.close();
        };
    }, []);
    // ── Capture photo ────────────────────────────────────────────────────────
    const capturePhoto = useCallback(async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas)
            return;
        setStatus('capturing');
        // Draw video frame to canvas
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        // Get base64
        const base64 = canvas.toDataURL('image/jpeg', 0.85);
        setPhoto(base64);
        // Stop camera & detection
        cancelAnimationFrame(rafRef.current);
        streamRef.current?.getTracks().forEach((t) => t.stop());
        // Send to Gemini
        setStatus('analyzing');
        setLoading(true);
        try {
            const geminiResult = await analyzeWithGemini(base64);
            // Map IDs to full products
            const base = findProduct(geminiResult.recomendacoes.base.id);
            const batom = findProduct(geminiResult.recomendacoes.batom.id);
            const blush = findProduct(geminiResult.recomendacoes.blush.id);
            if (!base || !batom || !blush) {
                throw new Error('Produto recomendado não encontrado no catálogo.');
            }
            setResult({ tom: geminiResult.analise_pele.tom, subtom: geminiResult.analise_pele.subtom }, { base, batom, blush });
            navigate('/espelho');
        }
        catch (err) {
            console.error('Gemini error:', err);
            setStatus('error');
            setErrorMsg(err instanceof Error ? err.message : 'Erro ao analisar a imagem.');
            setError(err instanceof Error ? err.message : 'Erro ao analisar a imagem.');
        }
    }, [navigate, setPhoto, setResult, setLoading, setError]);
    // ── Status helpers ───────────────────────────────────────────────────────
    const canCapture = status === 'ready' && faceCount === 1;
    const statusText = {
        init: 'Carregando câmera...',
        ready: 'Rosto detectado ✓',
        'no-face': 'Posicione seu rosto no centro',
        'multi-face': 'Apenas um rosto deve estar visível',
        capturing: 'Capturando foto...',
        analyzing: 'A IA está analisando seu rosto...',
        error: errorMsg,
    };
    const statusColor = {
        init: 'rgba(255,255,255,0.5)',
        ready: '#4ADE80',
        'no-face': '#FBBF24',
        'multi-face': '#FBBF24',
        capturing: 'rgba(255,255,255,0.5)',
        analyzing: '#EC4899',
        error: '#EF4444',
    };
    return (_jsxs("div", { className: "fixed inset-0 bg-black flex flex-col", children: [_jsxs("div", { className: "relative flex-1 overflow-hidden", children: [_jsx("video", { ref: videoRef, className: "absolute inset-0 w-full h-full object-cover", playsInline: true, muted: true, style: { transform: 'scaleX(-1)' } }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center pointer-events-none", children: _jsx("div", { className: "w-64 h-80 sm:w-72 sm:h-96 rounded-[50%] border-2 transition-colors duration-300", style: {
                                borderColor: canCapture ? '#4ADE80' : status === 'analyzing' ? '#EC4899' : 'rgba(255,255,255,0.3)',
                                boxShadow: canCapture ? '0 0 30px rgba(74,222,128,0.3)' : 'none',
                            } }) }), _jsx("div", { className: "absolute top-0 left-0 right-0 p-4 pt-12 flex justify-center", children: _jsx(motion.div, { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 }, className: "px-5 py-2.5 rounded-full backdrop-blur-md", style: { background: 'rgba(0,0,0,0.5)', border: `1px solid ${statusColor[status]}40` }, children: _jsx("p", { className: "text-sm font-medium", style: { color: statusColor[status] }, children: statusText[status] }) }, status) }), _jsx(AnimatePresence, { children: status === 'analyzing' && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "absolute inset-0 flex flex-col items-center justify-center gap-4 z-20", style: { background: 'rgba(0,0,0,0.7)' }, children: [_jsx("div", { className: "w-16 h-16 rounded-full border-4 border-pink-500 border-t-transparent animate-spin" }), _jsx("p", { className: "text-white text-lg font-medium", children: "Analisando seu rosto com IA..." }), _jsx("p", { className: "text-white/50 text-sm", children: "Isso pode levar alguns segundos" })] })) })] }), _jsxs("div", { className: "flex-shrink-0 p-6 pb-10 flex flex-col items-center gap-4", style: { background: 'rgba(0,0,0,0.8)' }, children: [status === 'error' ? (_jsx("button", { onClick: () => window.location.reload(), className: "px-8 py-3 rounded-2xl text-white font-semibold", style: { background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)' }, children: "Tentar novamente" })) : (_jsx(motion.button, { whileHover: canCapture ? { scale: 1.05 } : {}, whileTap: canCapture ? { scale: 0.95 } : {}, onClick: capturePhoto, disabled: !canCapture, className: "w-20 h-20 rounded-full flex items-center justify-center transition-opacity", style: {
                            background: canCapture
                                ? 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)'
                                : 'rgba(255,255,255,0.15)',
                            boxShadow: canCapture ? '0 0 30px rgba(236,72,153,0.5)' : 'none',
                            opacity: canCapture ? 1 : 0.4,
                        }, children: _jsx("div", { className: "w-16 h-16 rounded-full border-2 border-white/80" }) })), _jsx("p", { className: "text-white/40 text-xs text-center", children: status === 'analyzing'
                            ? 'Aguarde a análise...'
                            : 'Centralize seu rosto e toque para tirar a foto' })] }), _jsx("canvas", { ref: canvasRef, className: "hidden" })] }));
}
