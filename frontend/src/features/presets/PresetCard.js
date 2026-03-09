import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { useMakeupStore } from '@/store/useMakeupStore';
export function PresetCard({ preset }) {
    const { activePreset, applyPreset } = useMakeupStore();
    const isActive = activePreset === preset.id;
    return (_jsxs(motion.button, { whileTap: { scale: 0.95 }, onClick: () => applyPreset(preset), className: `w-full text-left rounded-xl border p-3 transition-all ${isActive
            ? 'border-blush/60 bg-blush/10'
            : 'border-border hover:border-white/20 bg-transparent'}`, children: [_jsx("div", { className: "h-1 w-full rounded-full mb-3", style: { background: `linear-gradient(90deg, ${preset.gradient[0]}, ${preset.gradient[1]})` } }), _jsx("div", { className: "flex gap-1.5 mb-2", children: Object.entries(preset.config).map(([key, cfg]) => 'color' in cfg && cfg.enabled ? (_jsx("div", { className: "w-4 h-4 rounded-full border border-white/10", style: { backgroundColor: cfg.color } }, key)) : null) }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: `text-sm font-medium ${isActive ? 'text-blush-light' : 'text-white'}`, children: preset.name }), _jsx("p", { className: "text-white/30 text-xs truncate", children: preset.description })] }), preset.isPremium && (_jsx("span", { className: "text-xs text-gold/70 shrink-0 ml-2", children: "\u2605" }))] })] }));
}
