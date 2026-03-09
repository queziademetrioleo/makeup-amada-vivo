import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMakeupStore } from '@/store/useMakeupStore';
import { MakeupPanel } from '@/features/makeup/MakeupPanel';
import { PresetsPanel } from '@/features/presets/PresetsPanel';
export function TryOnControls({ onSnapshot, isSaving }) {
    const [tab, setTab] = useState('makeup');
    const { showBeforeAfter, showDebugLandmarks, toggleBeforeAfter, toggleDebug } = useMakeupStore();
    return (_jsxs("div", { className: "glass-panel rounded-2xl flex flex-col h-full overflow-hidden", children: [_jsxs("div", { className: "p-4 border-b border-border flex gap-2", children: [_jsx("button", { onClick: toggleBeforeAfter, className: `flex-1 text-xs py-2 rounded-lg border transition-all ${showBeforeAfter
                            ? 'border-blush/50 bg-blush/10 text-blush-light'
                            : 'border-border text-white/40 hover:text-white/70'}`, children: "Antes / Depois" }), _jsx("button", { onClick: toggleDebug, className: `text-xs py-2 px-3 rounded-lg border transition-all ${showDebugLandmarks
                            ? 'border-gold/50 bg-gold/10 text-gold'
                            : 'border-border text-white/30 hover:text-white/50'}`, children: "Debug" })] }), _jsx("div", { className: "flex border-b border-border", children: ['makeup', 'presets'].map((t) => (_jsx("button", { onClick: () => setTab(t), className: `flex-1 py-3 text-sm font-medium transition-colors ${tab === t
                        ? 'text-white border-b-2 border-blush -mb-px'
                        : 'text-white/30 hover:text-white/60'}`, children: t === 'makeup' ? 'Maquiagem' : 'Looks' }, t))) }), _jsx("div", { className: "flex-1 overflow-y-auto p-4", children: _jsx(AnimatePresence, { mode: "wait", children: _jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 }, children: tab === 'makeup' ? _jsx(MakeupPanel, {}) : _jsx(PresetsPanel, {}) }, tab) }) }), _jsx("div", { className: "p-4 border-t border-border", children: _jsx("button", { onClick: onSnapshot, disabled: isSaving, className: "w-full btn-primary py-3 text-sm flex items-center justify-center gap-2", children: isSaving ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" }), "Salvando\u2026"] })) : (_jsxs(_Fragment, { children: [_jsxs("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" }), _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 13a3 3 0 11-6 0 3 3 0 016 0z" })] }), "Tirar foto"] })) }) })] }));
}
