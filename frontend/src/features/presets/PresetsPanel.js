import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMakeupStore, PRESETS } from '@/store/useMakeupStore';
import { PresetCard } from './PresetCard';
import { Button } from '@/components/ui/Button';
export function PresetsPanel() {
    const { resetConfig } = useMakeupStore();
    return (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-xs text-white/40 uppercase tracking-wider font-medium", children: "Looks prontos" }), _jsx(Button, { variant: "ghost", size: "sm", onClick: resetConfig, className: "text-xs py-1 px-3", children: "Limpar" })] }), _jsx("div", { className: "space-y-2 max-h-80 overflow-y-auto pr-1", children: PRESETS.map((preset) => (_jsx(PresetCard, { preset: preset }, preset.id))) })] }));
}
