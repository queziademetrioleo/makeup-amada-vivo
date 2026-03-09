import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
/** Overlay badge shown when camera is active */
export function LiveBadge() {
    return (_jsxs("div", { className: "absolute top-4 left-4 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1", children: [_jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" }), _jsx("span", { className: "text-white text-xs font-medium", children: "AO VIVO" })] }));
}
/** Spinner shown while FaceMesh initialises */
export function FaceMeshLoadingOverlay({ isReady }) {
    if (isReady)
        return null;
    return (_jsxs(motion.div, { initial: { opacity: 1 }, exit: { opacity: 0 }, className: "absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 backdrop-blur-sm rounded-2xl", children: [_jsx("div", { className: "w-8 h-8 border-2 border-blush/30 border-t-blush rounded-full animate-spin" }), _jsx("p", { className: "text-white/60 text-sm", children: "Carregando IA facial\u2026" })] }));
}
/** Indicator when no face is detected */
export function NoFaceIndicator() {
    return (_jsx("div", { className: "absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5", children: _jsx("p", { className: "text-white/50 text-xs", children: "Posicione seu rosto no centro" }) }));
}
