import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebcam } from '@/hooks/useWebcam';
import { useFaceMesh } from '@/hooks/useFaceMesh';
import { useCameraStore } from '@/store/useCameraStore';
import { useMakeupStore } from '@/store/useMakeupStore';
import { useOrderStore, STEPS, STEP_LABELS, STEP_DESCRIPTIONS, } from '@/store/useOrderStore';
import { TryOnCanvas } from '@/features/tryon/TryOnCanvas';
import { CameraPermission } from '@/features/camera/CameraPermission';
import { PRODUCTS } from '@/data/products';
// Map each step to a product category
const STEP_CATEGORY = {
    batom: 'lipstick',
    base: 'foundation',
    corretivo: 'corretivo',
    blush: 'blush',
};
// Opacity defaults per step
const STEP_OPACITY = {
    batom: 0.85,
    base: 0.75,
    corretivo: 0.80,
    blush: 0.60,
};
function applyStepColor(color, opacity, updateLipstick, updateFoundation, updateContour, updateBlush, step) {
    switch (step) {
        case 'batom':
            updateLipstick({ color, opacity, enabled: true, glossy: false });
            break;
        case 'base':
            updateFoundation({ color, opacity, enabled: true });
            break;
        case 'corretivo':
            updateContour({ color, opacity, enabled: true });
            break;
        case 'blush':
            updateBlush({ color, opacity, enabled: true });
            break;
    }
}
function NameModal({ onConfirm }) {
    const [value, setValue] = useState('');
    return (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6", children: _jsxs(motion.div, { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { type: 'spring', stiffness: 300, damping: 25 }, className: "glass-card p-8 w-full max-w-sm shadow-2xl", children: [_jsx("div", { className: "w-12 h-12 rounded-full flex items-center justify-center mb-6 mx-auto", style: { background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)' }, children: _jsx("span", { className: "text-xl", children: "\uD83D\uDC84" }) }), _jsx("h2", { className: "text-2xl font-bold text-white text-center mb-2", style: { fontFamily: "'Playfair Display', serif" }, children: "Bem-vinda ao Try-On Guiado" }), _jsx("p", { className: "text-white/50 text-sm text-center mb-6", children: "Vamos encontrar o look perfeito para voc\u00EA passo a passo." }), _jsx("label", { className: "block text-sm text-white/60 mb-2", children: "Qual \u00E9 o seu nome?" }), _jsx("input", { type: "text", value: value, onChange: (e) => setValue(e.target.value), onKeyDown: (e) => {
                        if (e.key === 'Enter' && value.trim())
                            onConfirm(value.trim());
                    }, placeholder: "Digite seu nome...", autoFocus: true, className: "w-full mb-4 px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30", style: {
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.10)',
                        borderRadius: 14,
                        minHeight: 48,
                    } }), _jsx("button", { disabled: !value.trim(), onClick: () => { if (value.trim())
                        onConfirm(value.trim()); }, className: "btn-gradient w-full text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed", style: { minHeight: 52 }, children: "Come\u00E7ar" })] }) }));
}
export function SelectionFlowPage() {
    const navigate = useNavigate();
    const { videoRef, isReady, isLoading, error, start } = useWebcam();
    const { faceLandmarkerRef } = useFaceMesh();
    const { faceMeshReady, faceDetected } = useCameraStore();
    const { config, updateLipstick, updateFoundation, updateContour, updateBlush } = useMakeupStore();
    const { clientName, stepIndex, setClientName, confirmStep, nextStep, } = useOrderStore();
    const currentStep = STEPS[stepIndex];
    // Products for the current step
    const stepProducts = currentStep
        ? PRODUCTS.filter((p) => p.category === STEP_CATEGORY[currentStep])
        : [];
    const [selectedProductIndex, setSelectedProductIndex] = useState(0);
    const [selectedColorIndex, setSelectedColorIndex] = useState(0);
    const [intensity, setIntensity] = useState(currentStep ? STEP_OPACITY[currentStep] : 0.75);
    const prevStepRef = useRef(-1);
    // When step changes, reset product/color selection and intensity
    useEffect(() => {
        if (!currentStep)
            return;
        if (prevStepRef.current !== stepIndex) {
            prevStepRef.current = stepIndex;
            setSelectedProductIndex(0);
            setSelectedColorIndex(0);
            setIntensity(STEP_OPACITY[currentStep]);
        }
    }, [stepIndex, currentStep]);
    const selectedProduct = stepProducts[selectedProductIndex] ?? null;
    const selectedColor = selectedProduct?.colors[selectedColorIndex] ?? null;
    // Apply color + intensity whenever any of these change
    const applyColor = useCallback((color, opacity) => {
        if (!currentStep)
            return;
        applyStepColor(color, opacity, updateLipstick, updateFoundation, updateContour, updateBlush, currentStep);
    }, [currentStep, updateLipstick, updateFoundation, updateContour, updateBlush]);
    useEffect(() => {
        if (!currentStep || !selectedColor)
            return;
        applyColor(selectedColor.hex, intensity);
    }, [currentStep, selectedColor, intensity, applyColor]);
    // Start webcam on mount
    useEffect(() => {
        start();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // All steps done → go to receipt
    useEffect(() => {
        if (stepIndex >= STEPS.length) {
            navigate('/recibo');
        }
    }, [stepIndex, navigate]);
    const handleChoose = () => {
        if (!currentStep || !selectedProduct || !selectedColor)
            return;
        const selection = {
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            colorId: selectedColor.id,
            colorName: selectedColor.name,
            colorHex: selectedColor.hex,
        };
        confirmStep(selection);
        nextStep();
    };
    const cameraStatus = isLoading ? 'requesting' : error ? 'error' : 'idle';
    return (_jsxs("div", { className: "fixed inset-0 bg-[#080910] overflow-hidden", children: [_jsx("video", { ref: videoRef, autoPlay: true, playsInline: true, muted: true, style: {
                    position: 'fixed',
                    top: -9999,
                    left: -9999,
                    width: 1,
                    height: 1,
                    opacity: 0,
                    pointerEvents: 'none',
                }, "aria-hidden": "true" }), _jsx(AnimatePresence, { children: !clientName && (_jsx(NameModal, { onConfirm: (name) => setClientName(name) })) }), _jsxs("div", { className: "hidden lg:flex h-full overflow-hidden", children: [_jsx("div", { className: "flex-1 flex items-center justify-center p-4 relative min-w-0", children: isReady ? (_jsx(motion.div, { initial: { opacity: 0, scale: 0.97 }, animate: { opacity: 1, scale: 1 }, className: "relative w-full h-full max-h-full", children: _jsx("div", { className: "relative w-full h-full", children: _jsx(TryOnCanvas, { videoRef: videoRef, faceLandmarkerRef: faceLandmarkerRef, config: config, showBeforeAfter: false, showDebug: false, faceMeshReady: faceMeshReady, faceDetected: faceDetected }) }) })) : (_jsx("div", { className: "w-full max-w-2xl aspect-[4/3] glass-panel rounded-2xl overflow-hidden", children: _jsx(CameraPermission, { status: cameraStatus, error: error, onStart: start }) })) }), _jsxs("div", { className: "w-80 xl:w-96 flex-shrink-0 flex flex-col overflow-hidden border-l", style: {
                            background: '#0F1022',
                            borderColor: 'rgba(255,255,255,0.07)',
                        }, children: [_jsxs("div", { className: "p-5 border-b", style: { borderColor: 'rgba(255,255,255,0.07)' }, children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h1", { className: "text-sm font-semibold text-white/60 uppercase tracking-widest", children: "Seu Look" }), clientName && (_jsx("span", { className: "text-xs text-pink-400 font-medium", children: clientName }))] }), _jsx("div", { className: "flex gap-2", children: STEPS.map((step, idx) => {
                                            const isDone = idx < stepIndex;
                                            const isCurrent = idx === stepIndex;
                                            return (_jsxs("div", { className: "flex-1 flex flex-col items-center gap-1", children: [_jsx("div", { className: "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all", style: isDone
                                                            ? { background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)', color: 'white' }
                                                            : isCurrent
                                                                ? { background: 'rgba(236,72,153,0.15)', border: '2px solid #EC4899', color: '#EC4899' }
                                                                : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.3)' }, children: isDone ? '✓' : idx + 1 }), _jsx("span", { className: "text-[10px] font-medium transition-colors", style: { color: isCurrent ? '#EC4899' : isDone ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)' }, children: STEP_LABELS[step] })] }, step));
                                        }) })] }), _jsx(AnimatePresence, { mode: "wait", children: currentStep && (_jsxs(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, transition: { duration: 0.2 }, className: "flex-1 overflow-y-auto flex flex-col", children: [_jsxs("div", { className: "px-5 pt-5 pb-3", children: [_jsx("h2", { className: "text-xl font-bold text-white", style: { fontFamily: "'Playfair Display', serif" }, children: STEP_LABELS[currentStep] }), _jsx("p", { className: "text-sm text-white/40 mt-0.5", children: STEP_DESCRIPTIONS[currentStep] })] }), stepProducts.length > 1 && (_jsxs("div", { className: "px-5 pb-3", children: [_jsx("p", { className: "text-xs text-white/40 mb-2 uppercase tracking-wider", children: "Produto" }), _jsx("div", { className: "flex flex-col gap-1.5", children: stepProducts.map((product, pIdx) => (_jsxs("button", { onClick: () => {
                                                            setSelectedProductIndex(pIdx);
                                                            setSelectedColorIndex(0);
                                                        }, className: "w-full text-left px-3 py-2.5 rounded-xl border transition-all text-sm", style: selectedProductIndex === pIdx
                                                            ? { background: 'rgba(236,72,153,0.10)', borderColor: 'rgba(236,72,153,0.40)', color: 'white' }
                                                            : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }, children: [_jsx("div", { className: "font-medium", children: product.name }), _jsxs("div", { className: "text-xs text-white/40 mt-0.5", children: [product.brand, " \u00B7 R$ ", product.price.toFixed(2).replace('.', ',')] })] }, product.id))) })] })), stepProducts.length === 1 && selectedProduct && (_jsx("div", { className: "px-5 pb-3", children: _jsxs("div", { className: "px-3 py-2.5 rounded-xl", style: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }, children: [_jsx("div", { className: "text-sm font-medium text-white", children: selectedProduct.name }), _jsxs("div", { className: "text-xs text-white/40 mt-0.5", children: [selectedProduct.brand, " \u00B7 R$ ", selectedProduct.price.toFixed(2).replace('.', ',')] })] }) })), selectedProduct && (_jsxs("div", { className: "px-5 pb-4", children: [_jsx("p", { className: "text-xs text-white/40 mb-3 uppercase tracking-wider", children: "Cor" }), _jsx("div", { className: "grid grid-cols-4 gap-2", children: selectedProduct.colors.map((color, cIdx) => (_jsxs("button", { onClick: () => setSelectedColorIndex(cIdx), title: color.name, className: "flex flex-col items-center gap-1.5 group", children: [_jsx("div", { className: "w-12 h-12 rounded-full transition-all shadow-md", style: {
                                                                    backgroundColor: color.hex,
                                                                    ...(selectedColorIndex === cIdx
                                                                        ? { outline: '2px solid #EC4899', outlineOffset: 2, transform: 'scale(1.10)', boxShadow: '0 0 12px rgba(236,72,153,0.5)' }
                                                                        : {}),
                                                                } }), _jsx("span", { className: "text-[9px] text-center leading-tight transition-colors", style: { color: selectedColorIndex === cIdx ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)' }, children: color.name })] }, color.id))) })] })), selectedColor && (_jsx("div", { className: "px-5 pb-3", children: _jsxs("div", { className: "flex items-center gap-3 px-3 py-2.5 rounded-xl", style: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }, children: [_jsx("div", { className: "w-8 h-8 rounded-full flex-shrink-0 shadow-sm", style: { backgroundColor: selectedColor.hex, border: '1px solid rgba(255,255,255,0.1)' } }), _jsxs("div", { children: [_jsx("div", { className: "text-sm text-white font-medium", children: selectedColor.name }), _jsx("div", { className: "text-xs text-white/40", children: selectedColor.hex })] })] }) })), currentStep && (_jsx("div", { className: "px-5 pb-4", children: _jsxs("div", { className: "rounded-xl px-4 py-3", style: { background: 'rgba(236,72,153,0.07)', border: '1px solid rgba(236,72,153,0.20)' }, children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-xs font-bold uppercase tracking-widest", style: { color: '#EC4899' }, children: "\u25C8 Intensidade" }), _jsxs("span", { className: "text-xs font-mono font-semibold", style: { color: '#EC4899' }, children: [Math.round(intensity * 100), "%"] })] }), _jsxs("div", { className: "relative h-2.5 rounded-full", style: { background: 'rgba(255,255,255,0.08)' }, children: [_jsx("div", { className: "absolute inset-y-0 left-0 rounded-full", style: { width: `${intensity * 100}%`, background: 'linear-gradient(90deg, #EC4899, #8B5CF6)' } }), _jsx("input", { type: "range", min: 0, max: 1, step: 0.01, value: intensity, onChange: (e) => setIntensity(parseFloat(e.target.value)), className: "absolute inset-0 w-full h-full opacity-0 cursor-pointer", style: { margin: 0 } })] })] }) })), _jsx("div", { className: "flex-1" })] }, currentStep)) }), _jsxs("div", { className: "p-5 border-t", style: { borderColor: 'rgba(255,255,255,0.07)' }, children: [_jsx("button", { onClick: handleChoose, disabled: !selectedColor || !currentStep, className: "btn-gradient w-full text-white font-semibold text-base disabled:opacity-40 disabled:cursor-not-allowed", style: { minHeight: 52 }, children: currentStep ? `Escolher ${STEP_LABELS[currentStep]}` : 'Escolher' }), stepIndex > 0 && (_jsxs("p", { className: "text-center text-xs text-white/30 mt-2", children: ["Passo ", stepIndex + 1, " de ", STEPS.length] }))] })] })] }), _jsxs("div", { className: "lg:hidden flex flex-col h-full", children: [_jsxs("div", { className: "flex-1 relative min-h-0", children: [isReady ? (_jsx("div", { className: "absolute inset-0", children: _jsx(TryOnCanvas, { videoRef: videoRef, faceLandmarkerRef: faceLandmarkerRef, config: config, showBeforeAfter: false, showDebug: false, faceMeshReady: faceMeshReady, faceDetected: faceDetected }) })) : (_jsx("div", { className: "absolute inset-0", children: _jsx(CameraPermission, { status: cameraStatus, error: error, onStart: start }) })), _jsxs("div", { className: "absolute top-0 left-0 right-0 z-10 flex items-center px-4 gap-3", style: {
                                    height: 52,
                                    background: 'rgba(8,9,16,0.65)',
                                    backdropFilter: 'blur(12px)',
                                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                                }, children: [clientName && (_jsx("span", { className: "text-xs text-pink-400 font-medium mr-1 flex-shrink-0", children: clientName })), _jsx("div", { className: "flex gap-2 flex-1", children: STEPS.map((step, idx) => {
                                            const isDone = idx < stepIndex;
                                            const isCurrent = idx === stepIndex;
                                            return (_jsxs("div", { className: "flex-1 flex flex-col items-center gap-0.5", children: [_jsx("div", { className: "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all", style: isDone
                                                            ? { background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)', color: 'white' }
                                                            : isCurrent
                                                                ? { background: 'rgba(236,72,153,0.15)', border: '2px solid #EC4899', color: '#EC4899' }
                                                                : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.3)' }, children: isDone ? '✓' : idx + 1 }), _jsx("span", { className: "text-[8px] font-medium", style: { color: isCurrent ? '#EC4899' : isDone ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)' }, children: STEP_LABELS[step] })] }, step));
                                        }) })] })] }), _jsx(AnimatePresence, { mode: "wait", children: currentStep && (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 20 }, transition: { duration: 0.22 }, className: "flex-shrink-0 flex flex-col", style: {
                                height: '50%',
                                background: 'rgba(15,16,34,0.95)',
                                backdropFilter: 'blur(20px)',
                                borderTop: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '24px 24px 0 0',
                            }, children: [_jsx("div", { className: "flex justify-center pt-3 pb-1 flex-shrink-0", children: _jsx("div", { className: "w-10 h-1 rounded-full", style: { background: 'rgba(255,255,255,0.15)' } }) }), _jsxs("div", { className: "px-5 pt-1 pb-2 flex-shrink-0", children: [_jsx("h2", { className: "text-lg font-bold text-white", style: { fontFamily: "'Playfair Display', serif" }, children: STEP_LABELS[currentStep] }), _jsx("p", { className: "text-xs text-white/40", children: STEP_DESCRIPTIONS[currentStep] })] }), stepProducts.length > 1 && (_jsx("div", { className: "flex-shrink-0 px-5 pb-2", children: _jsx("div", { className: "flex gap-2 overflow-x-auto pb-1", style: { scrollbarWidth: 'none' }, children: stepProducts.map((product, pIdx) => (_jsx("button", { onClick: () => {
                                                setSelectedProductIndex(pIdx);
                                                setSelectedColorIndex(0);
                                            }, className: "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap", style: selectedProductIndex === pIdx
                                                ? { background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)', color: 'white' }
                                                : { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }, children: product.name }, product.id))) }) })), _jsx("div", { className: "flex-1 overflow-y-auto px-5 pb-2", children: selectedProduct && (_jsx("div", { className: "grid grid-cols-5 gap-2", children: selectedProduct.colors.map((color, cIdx) => (_jsxs("button", { onClick: () => setSelectedColorIndex(cIdx), title: color.name, className: "flex flex-col items-center gap-1 group", style: { minHeight: 48 }, children: [_jsx("div", { className: "w-14 h-14 rounded-full transition-all shadow-md", style: {
                                                        backgroundColor: color.hex,
                                                        ...(selectedColorIndex === cIdx
                                                            ? { outline: '2px solid #EC4899', outlineOffset: 2, transform: 'scale(1.08)', boxShadow: '0 0 14px rgba(236,72,153,0.55)' }
                                                            : {}),
                                                    } }), _jsx("span", { className: "text-[8px] text-center leading-tight", style: { color: selectedColorIndex === cIdx ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)' }, children: color.name })] }, color.id))) })) }), currentStep && (_jsx("div", { className: "flex-shrink-0 px-5 pb-2", children: _jsxs("div", { className: "rounded-xl px-4 py-2.5", style: { background: 'rgba(236,72,153,0.07)', border: '1px solid rgba(236,72,153,0.20)' }, children: [_jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [_jsx("span", { className: "text-xs font-bold uppercase tracking-widest", style: { color: '#EC4899' }, children: "\u25C8 Intensidade" }), _jsxs("span", { className: "text-xs font-mono font-semibold", style: { color: '#EC4899' }, children: [Math.round(intensity * 100), "%"] })] }), _jsxs("div", { className: "relative h-2.5 rounded-full", style: { background: 'rgba(255,255,255,0.08)' }, children: [_jsx("div", { className: "absolute inset-y-0 left-0 rounded-full", style: { width: `${intensity * 100}%`, background: 'linear-gradient(90deg, #EC4899, #8B5CF6)' } }), _jsx("input", { type: "range", min: 0, max: 1, step: 0.01, value: intensity, onChange: (e) => setIntensity(parseFloat(e.target.value)), className: "absolute inset-0 w-full h-full opacity-0 cursor-pointer", style: { margin: 0 } })] })] }) })), _jsx("div", { className: "flex-shrink-0 px-5 pb-5 pt-2", children: _jsx("button", { onClick: handleChoose, disabled: !selectedColor, className: "btn-gradient w-full text-white font-semibold text-base disabled:opacity-40 disabled:cursor-not-allowed", style: { minHeight: 52 }, children: currentStep ? `Escolher ${STEP_LABELS[currentStep]}` : 'Escolher' }) })] }, currentStep)) })] })] }));
}
