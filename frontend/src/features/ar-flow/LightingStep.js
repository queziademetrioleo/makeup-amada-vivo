import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Step 1 — Tela 4 do fluxo
 * Câmera já está aberta em background. Avisamos sobre iluminação.
 */
import { motion } from 'framer-motion';
import { useARStore } from '@/store/useARStore';
import { PRODUCT_CONFIG } from './productConfig';
export function LightingStep({ cameraPreviewRef }) {
    const { product, setStep } = useARStore();
    const info = PRODUCT_CONFIG[product];
    return (_jsxs(motion.div, { className: "relative w-full h-full flex flex-col overflow-hidden", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, children: [_jsx("canvas", { ref: cameraPreviewRef, className: "absolute inset-0 w-full h-full object-cover", style: { filter: 'blur(8px) brightness(0.45)', transform: 'scaleX(-1) scale(1.05)' } }), _jsxs("div", { className: "relative z-10 flex flex-col h-full px-6 pt-14 pb-10", children: [_jsx("p", { className: "text-white/50 text-xs uppercase tracking-[0.18em] mb-1", children: "Experimente em AR" }), _jsx("h1", { className: "text-2xl font-bold text-white mb-8", children: info.label }), _jsxs(motion.div, { className: "rounded-3xl bg-black/60 backdrop-blur-xl border border-white/10 p-6 space-y-5", initial: { y: 32, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { delay: 0.15 }, children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-3xl", children: "\u26A0\uFE0F" }), _jsx("h2", { className: "text-white font-semibold text-lg", children: "Aten\u00E7\u00E3o" })] }), _jsx("p", { className: "text-white/70 text-sm leading-relaxed", children: "A ilumina\u00E7\u00E3o interfere no resultado da an\u00E1lise." }), _jsx("div", { className: "space-y-3", children: [
                                    { icon: '☀️', text: 'Deixe seu rosto de frente para uma fonte de luz natural.' },
                                    { icon: '📵', text: 'Evite contraluz — não fique de costas para a janela.' },
                                    { icon: '😐', text: 'Mantenha expressão neutra e olhe direto para a câmera.' },
                                ].map((tip) => (_jsxs("div", { className: "flex gap-3 items-start", children: [_jsx("span", { className: "text-lg leading-tight mt-0.5", children: tip.icon }), _jsx("p", { className: "text-white/60 text-sm leading-snug", children: tip.text })] }, tip.text))) })] }), _jsx("div", { className: "flex-1" }), _jsxs(motion.div, { className: "space-y-3", initial: { y: 24, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { delay: 0.3 }, children: [_jsx("button", { onClick: () => setStep('capture'), className: "w-full py-4 rounded-2xl bg-white text-black font-semibold text-base", children: "Continuar" }), _jsx("button", { onClick: () => setStep('capture'), className: "w-full py-3 rounded-2xl bg-transparent text-white/50 text-sm", children: "Ver exemplos" })] })] })] }));
}
