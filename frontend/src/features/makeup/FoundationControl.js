import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMakeupStore } from '@/store/useMakeupStore';
import { Slider } from '@/components/ui/Slider';
import { ColorPicker } from '@/components/ui/ColorPicker';
const FOUNDATION_COLORS = [
    '#F5E4D0', '#ECCDB0', '#E8C9B0', '#D4B090', '#C49870',
    '#B08060', '#A07050', '#E0C8A8', '#F0D8C0', '#DBBFA0',
];
export function FoundationControl() {
    const { config, updateFoundation } = useMakeupStore();
    const foundation = config.foundation;
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Base" }), _jsx("button", { role: "switch", "aria-checked": foundation.enabled, onClick: () => updateFoundation({ enabled: !foundation.enabled }), className: `w-8 h-4 rounded-full transition-colors ${foundation.enabled ? 'bg-blush' : 'bg-border'}`, children: _jsx("span", { className: `block w-3 h-3 rounded-full bg-white shadow m-0.5 transition-transform ${foundation.enabled ? 'translate-x-4' : ''}` }) })] }), _jsx(ColorPicker, { label: "Tom de pele", value: foundation.color, swatches: FOUNDATION_COLORS, onChange: (color) => updateFoundation({ color }), disabled: !foundation.enabled }), _jsx(Slider, { label: "Cobertura", value: foundation.opacity, onChange: (opacity) => updateFoundation({ opacity }), disabled: !foundation.enabled })] }));
}
