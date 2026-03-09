import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion, AnimatePresence } from 'framer-motion';
import { useMakeupStore } from '@/store/useMakeupStore';
import { LipstickControl } from './LipstickControl';
import { BlushControl } from './BlushControl';
import { ContourControl } from './ContourControl';
import { FoundationControl } from './FoundationControl';
import { BrowsControl } from './BrowsControl';
const LAYERS = [
    { id: 'lipstick', label: 'Batom', icon: '💄' },
    { id: 'blush', label: 'Blush', icon: '🌸' },
    { id: 'contour', label: 'Contorno', icon: '◐' },
    { id: 'foundation', label: 'Base', icon: '✦' },
    { id: 'brows', label: 'Sobrancelha', icon: '〜' },
];
const CONTROLS = {
    lipstick: _jsx(LipstickControl, {}),
    blush: _jsx(BlushControl, {}),
    contour: _jsx(ContourControl, {}),
    foundation: _jsx(FoundationControl, {}),
    brows: _jsx(BrowsControl, {}),
};
function useActiveLayerOpacity() {
    const { config, activeLayer, updateLipstick, updateBlush, updateContour, updateFoundation, updateBrows } = useMakeupStore();
    const opacityMap = {
        lipstick: config.lipstick.opacity,
        blush: config.blush.opacity,
        contour: config.contour.opacity,
        foundation: config.foundation.opacity,
        brows: config.brows.opacity,
    };
    const enabledMap = {
        lipstick: config.lipstick.enabled,
        blush: config.blush.enabled,
        contour: config.contour.enabled,
        foundation: config.foundation.enabled,
        brows: config.brows.enabled,
    };
    const updateMap = {
        lipstick: (opacity) => updateLipstick({ opacity }),
        blush: (opacity) => updateBlush({ opacity }),
        contour: (opacity) => updateContour({ opacity }),
        foundation: (opacity) => updateFoundation({ opacity }),
        brows: (opacity) => updateBrows({ opacity }),
    };
    return {
        opacity: opacityMap[activeLayer],
        enabled: enabledMap[activeLayer],
        setOpacity: updateMap[activeLayer],
        label: LAYERS.find(l => l.id === activeLayer)?.label ?? '',
    };
}
export function MakeupPanel() {
    const { activeLayer, setLayer } = useMakeupStore();
    const { opacity, enabled, setOpacity, label } = useActiveLayerOpacity();
    return (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsx("div", { className: "flex gap-1 bg-void rounded-xl p-1", children: LAYERS.map((l) => (_jsxs("button", { onClick: () => setLayer(l.id), className: `flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg text-xs transition-all ${activeLayer === l.id
                        ? 'bg-panel text-white shadow-sm'
                        : 'text-white/30 hover:text-white/60'}`, children: [_jsx("span", { className: "text-base leading-none", children: l.icon }), _jsx("span", { className: "font-medium hidden sm:block", children: l.label })] }, l.id))) }), _jsxs("div", { className: "rounded-xl px-4 py-3", style: { background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.25)' }, children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("span", { className: "text-xs font-semibold uppercase tracking-widest", style: { color: '#EC4899' }, children: ["Intensidade \u2014 ", label] }), _jsxs("span", { className: "text-xs font-mono text-white/60", children: [Math.round(opacity * 100), "%"] })] }), _jsxs("div", { className: `relative h-2 rounded-full ${!enabled ? 'opacity-40' : ''}`, style: { background: 'rgba(255,255,255,0.1)' }, children: [_jsx("div", { className: "absolute inset-y-0 left-0 rounded-full", style: { width: `${opacity * 100}%`, background: 'linear-gradient(90deg, #EC4899, #8B5CF6)' } }), _jsx("input", { type: "range", min: 0, max: 1, step: 0.01, value: opacity, disabled: !enabled, onChange: (e) => setOpacity(parseFloat(e.target.value)), className: "absolute inset-0 w-full opacity-0 cursor-pointer h-full disabled:cursor-not-allowed", style: { margin: 0 } })] })] }), _jsx(AnimatePresence, { mode: "wait", children: _jsx(motion.div, { initial: { opacity: 0, x: 8 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -8 }, transition: { duration: 0.18 }, children: CONTROLS[activeLayer] }, activeLayer) })] }));
}
