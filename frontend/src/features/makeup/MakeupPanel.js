import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion, AnimatePresence } from 'framer-motion';
import { useMakeupStore } from '@/store/useMakeupStore';
import { Slider } from '@/components/ui/Slider';
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
    };
}
export function MakeupPanel() {
    const { activeLayer, setLayer } = useMakeupStore();
    const { opacity, enabled, setOpacity } = useActiveLayerOpacity();
    return (_jsxs("div", { className: "flex flex-col gap-3 h-full", children: [_jsx("div", { className: "flex gap-1 bg-void rounded-xl p-1", children: LAYERS.map((l) => (_jsxs("button", { onClick: () => setLayer(l.id), className: `flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg text-xs transition-all ${activeLayer === l.id
                        ? 'bg-panel text-white shadow-sm'
                        : 'text-white/30 hover:text-white/60'}`, children: [_jsx("span", { className: "text-base leading-none", children: l.icon }), _jsx("span", { className: "font-medium hidden sm:block", children: l.label })] }, l.id))) }), _jsx("div", { className: "bg-void/60 rounded-xl px-3 py-2.5 border border-border/40", children: _jsx(Slider, { label: "Intensidade", value: opacity, onChange: setOpacity, disabled: !enabled }) }), _jsx(AnimatePresence, { mode: "wait", children: _jsx(motion.div, { initial: { opacity: 0, x: 8 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -8 }, transition: { duration: 0.18 }, className: "flex-1 overflow-y-auto", children: CONTROLS[activeLayer] }, activeLayer) })] }));
}
