import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
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
    base: 0.45,
    corretivo: 0.55,
    blush: 0.55,
};
function applyStepColor(step, color, updateLipstick, updateFoundation, updateContour, updateBlush) {
    const opacity = STEP_OPACITY[step];
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
    return (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6", children: _jsxs(motion.div, { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { type: 'spring', stiffness: 300, damping: 25 }, className: "bg-[#161829] border border-white/10 rounded-2xl p-8 w-full max-w-sm shadow-2xl", children: [_jsx("div", { className: "w-12 h-12 rounded-full bg-[#E8809A]/20 border border-[#E8809A]/30 flex items-center justify-center mb-6 mx-auto", children: _jsx("span", { className: "text-xl", children: "\uD83D\uDC84" }) }), _jsx("h2", { className: "text-xl font-semibold text-white text-center mb-2", children: "Bem-vinda ao Try-On Guiado" }), _jsx("p", { className: "text-white/50 text-sm text-center mb-6", children: "Vamos encontrar o look perfeito para voc\u00EA passo a passo." }), _jsx("label", { className: "block text-sm text-white/60 mb-2", children: "Qual \u00E9 o seu nome?" }), _jsx("input", { type: "text", value: value, onChange: (e) => setValue(e.target.value), onKeyDown: (e) => {
                        if (e.key === 'Enter' && value.trim())
                            onConfirm(value.trim());
                    }, placeholder: "Digite seu nome...", autoFocus: true, className: "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#E8809A]/50 focus:ring-1 focus:ring-[#E8809A]/30 mb-4" }), _jsx("button", { disabled: !value.trim(), onClick: () => { if (value.trim())
                        onConfirm(value.trim()); }, className: "w-full py-3 rounded-xl font-semibold text-white transition-all\n            bg-[#E8809A] hover:bg-[#E8809A]/90 disabled:opacity-40 disabled:cursor-not-allowed", children: "Come\u00E7ar" })] }) }));
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
    const prevStepRef = useRef(-1);
    const selectedProduct = stepProducts[selectedProductIndex] ?? null;
    const selectedColor = selectedProduct?.colors[selectedColorIndex] ?? null;
    // When step changes, reset product/color selection and auto-preview first color
    useEffect(() => {
        if (!currentStep)
            return;
        if (prevStepRef.current !== stepIndex) {
            prevStepRef.current = stepIndex;
            setSelectedProductIndex(0);
            setSelectedColorIndex(0);
        }
    }, [stepIndex, currentStep]);
    // Auto-preview color whenever product/color/step selection changes
    useEffect(() => {
        if (!currentStep || !selectedColor)
            return;
        applyStepColor(currentStep, selectedColor.hex, updateLipstick, updateFoundation, updateContour, updateBlush);
    }, [currentStep, selectedColor, updateLipstick, updateFoundation, updateContour, updateBlush]);
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
    return (_jsxs("div", { className: "fixed inset-0 bg-[#080910] flex overflow-hidden", children: [_jsx("video", { ref: videoRef, autoPlay: true, playsInline: true, muted: true, style: {
                    position: 'fixed',
                    top: -9999,
                    left: -9999,
                    width: 1,
                    height: 1,
                    opacity: 0,
                    pointerEvents: 'none',
                }, "aria-hidden": "true" }), _jsx(AnimatePresence, { children: !clientName && (_jsx(NameModal, { onConfirm: (name) => setClientName(name) })) }), _jsx("div", { className: "flex-1 flex items-center justify-center p-4 relative min-w-0", children: isReady ? (_jsx(motion.div, { initial: { opacity: 0, scale: 0.97 }, animate: { opacity: 1, scale: 1 }, className: "relative w-full h-full max-h-full", style: { aspectRatio: undefined }, children: _jsx("div", { className: "relative w-full h-full", children: _jsx(TryOnCanvas, { videoRef: videoRef, faceLandmarkerRef: faceLandmarkerRef, config: config, showBeforeAfter: false, showDebug: false, faceMeshReady: faceMeshReady, faceDetected: faceDetected }) }) })) : (_jsx("div", { className: "w-full max-w-2xl aspect-[4/3] glass-panel rounded-2xl overflow-hidden", children: _jsx(CameraPermission, { status: cameraStatus, error: error, onStart: start }) })) }), _jsxs("div", { className: "w-80 xl:w-96 flex-shrink-0 bg-[#0D0E1C] border-l border-white/5 flex flex-col overflow-hidden", children: [_jsxs("div", { className: "p-5 border-b border-white/5", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h1", { className: "text-sm font-semibold text-white/60 uppercase tracking-widest", children: "Seu Look" }), clientName && (_jsx("span", { className: "text-xs text-[#E8809A] font-medium", children: clientName }))] }), _jsx("div", { className: "flex gap-2", children: STEPS.map((step, idx) => {
                                    const isDone = idx < stepIndex;
                                    const isCurrent = idx === stepIndex;
                                    return (_jsxs("div", { className: `flex-1 flex flex-col items-center gap-1`, children: [_jsx("div", { className: `w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                      ${isDone
                                                    ? 'bg-[#E8809A] text-white'
                                                    : isCurrent
                                                        ? 'bg-[#E8809A]/20 border-2 border-[#E8809A] text-[#E8809A]'
                                                        : 'bg-white/5 border border-white/10 text-white/30'}`, children: isDone ? '✓' : idx + 1 }), _jsx("span", { className: `text-[10px] font-medium transition-colors
                      ${isCurrent ? 'text-[#E8809A]' : isDone ? 'text-white/50' : 'text-white/20'}`, children: STEP_LABELS[step] })] }, step));
                                }) })] }), _jsx(AnimatePresence, { mode: "wait", children: currentStep && (_jsxs(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, transition: { duration: 0.2 }, className: "flex-1 overflow-y-auto flex flex-col", children: [_jsxs("div", { className: "px-5 pt-5 pb-3", children: [_jsx("h2", { className: "text-lg font-semibold text-white", children: STEP_LABELS[currentStep] }), _jsx("p", { className: "text-sm text-white/40 mt-0.5", children: STEP_DESCRIPTIONS[currentStep] })] }), stepProducts.length > 1 && (_jsxs("div", { className: "px-5 pb-3", children: [_jsx("p", { className: "text-xs text-white/40 mb-2 uppercase tracking-wider", children: "Produto" }), _jsx("div", { className: "flex flex-col gap-1.5", children: stepProducts.map((product, pIdx) => (_jsxs("button", { onClick: () => {
                                                    setSelectedProductIndex(pIdx);
                                                    setSelectedColorIndex(0);
                                                }, className: `w-full text-left px-3 py-2.5 rounded-xl border transition-all text-sm
                          ${selectedProductIndex === pIdx
                                                    ? 'bg-[#E8809A]/10 border-[#E8809A]/40 text-white'
                                                    : 'bg-white/3 border-white/8 text-white/60 hover:border-white/20 hover:text-white/80'}`, children: [_jsx("div", { className: "font-medium", children: product.name }), _jsxs("div", { className: "text-xs text-white/40 mt-0.5", children: [product.brand, " \u00B7 R$ ", product.price.toFixed(2).replace('.', ',')] })] }, product.id))) })] })), stepProducts.length === 1 && selectedProduct && (_jsx("div", { className: "px-5 pb-3", children: _jsxs("div", { className: "bg-white/3 border border-white/8 rounded-xl px-3 py-2.5", children: [_jsx("div", { className: "text-sm font-medium text-white", children: selectedProduct.name }), _jsxs("div", { className: "text-xs text-white/40 mt-0.5", children: [selectedProduct.brand, " \u00B7 R$ ", selectedProduct.price.toFixed(2).replace('.', ',')] })] }) })), selectedProduct && (_jsxs("div", { className: "px-5 pb-4", children: [_jsx("p", { className: "text-xs text-white/40 mb-3 uppercase tracking-wider", children: "Cor" }), _jsx("div", { className: "grid grid-cols-4 gap-2", children: selectedProduct.colors.map((color, cIdx) => (_jsxs("button", { onClick: () => setSelectedColorIndex(cIdx), title: color.name, className: `flex flex-col items-center gap-1.5 group`, children: [_jsx("div", { className: `w-10 h-10 rounded-full transition-all shadow-md
                            ${selectedColorIndex === cIdx
                                                            ? 'ring-2 ring-[#E8809A] ring-offset-2 ring-offset-[#0D0E1C] scale-110'
                                                            : 'ring-1 ring-white/10 group-hover:ring-white/30 group-hover:scale-105'}`, style: { backgroundColor: color.hex } }), _jsx("span", { className: `text-[9px] text-center leading-tight transition-colors
                            ${selectedColorIndex === cIdx ? 'text-white/80' : 'text-white/30 group-hover:text-white/50'}`, children: color.name })] }, color.id))) })] })), selectedColor && (_jsx("div", { className: "px-5 pb-4", children: _jsxs("div", { className: "flex items-center gap-3 bg-white/3 border border-white/8 rounded-xl px-3 py-2.5", children: [_jsx("div", { className: "w-8 h-8 rounded-full flex-shrink-0 shadow-sm ring-1 ring-white/10", style: { backgroundColor: selectedColor.hex } }), _jsxs("div", { children: [_jsx("div", { className: "text-sm text-white font-medium", children: selectedColor.name }), _jsx("div", { className: "text-xs text-white/40", children: selectedColor.hex })] })] }) })), _jsx("div", { className: "flex-1" })] }, currentStep)) }), _jsxs("div", { className: "p-5 border-t border-white/5", children: [_jsx("button", { onClick: handleChoose, disabled: !selectedColor || !currentStep, className: "w-full py-3.5 rounded-xl font-semibold text-white text-base transition-all\n              bg-[#E8809A] hover:bg-[#E8809A]/90 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed\n              shadow-lg shadow-[#E8809A]/20", children: currentStep ? `Escolher ${STEP_LABELS[currentStep]}` : 'Escolher' }), stepIndex > 0 && (_jsxs("p", { className: "text-center text-xs text-white/30 mt-2", children: ["Passo ", stepIndex + 1, " de ", STEPS.length] }))] })] })] }));
}
