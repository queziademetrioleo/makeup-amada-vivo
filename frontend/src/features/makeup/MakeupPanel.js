import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion, AnimatePresence } from 'framer-motion';
import { useMakeupStore } from '@/store/useMakeupStore';
import { LipstickControl } from './LipstickControl';
import { BlushControl } from './BlushControl';
import { ContourControl } from './ContourControl';
import { FoundationControl } from './FoundationControl';
import { BrowsControl } from './BrowsControl';
import { ConcealerControl } from './ConcealerControl';
const LAYERS = [
    { id: 'lipstick', label: 'Batom', icon: '💄' },
    { id: 'blush', label: 'Blush', icon: '🌸' },
    { id: 'contour', label: 'Contorno', icon: '◐' },
    { id: 'foundation', label: 'Base', icon: '✦' },
    { id: 'brows', label: 'Sobrancelha', icon: '〜' },
    { id: 'concealer', label: 'Corretivo', icon: '○' },
];
const CONTROLS = {
    lipstick: _jsx(LipstickControl, {}),
    blush: _jsx(BlushControl, {}),
    contour: _jsx(ContourControl, {}),
    foundation: _jsx(FoundationControl, {}),
    brows: _jsx(BrowsControl, {}),
    concealer: _jsx(ConcealerControl, {}),
};
export function MakeupPanel() {
    const { activeLayer, setLayer } = useMakeupStore();
    return (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsx("div", { className: "flex gap-1 bg-void rounded-xl p-1", children: LAYERS.map((l) => (_jsxs("button", { onClick: () => setLayer(l.id), className: `flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg text-xs transition-all ${activeLayer === l.id
                        ? 'bg-panel text-white shadow-sm'
                        : 'text-white/30 hover:text-white/60'}`, children: [_jsx("span", { className: "text-base leading-none", children: l.icon }), _jsx("span", { className: "font-medium hidden sm:block", children: l.label })] }, l.id))) }), _jsx(AnimatePresence, { mode: "wait", children: _jsx(motion.div, { initial: { opacity: 0, x: 8 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -8 }, transition: { duration: 0.18 }, children: CONTROLS[activeLayer] }, activeLayer) })] }));
}
