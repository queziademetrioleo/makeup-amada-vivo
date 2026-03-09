import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMakeupStore } from '@/store/useMakeupStore';
import { Slider } from '@/components/ui/Slider';
import { ColorPicker } from '@/components/ui/ColorPicker';
const FOUNDATION_COLORS = [
    // Porcelain / Very Light
    '#FAF0E6', '#F5E8D5', '#F2DFC8',
    // Light / Fair
    '#ECCDB0', '#E8C9B0', '#E2C09E',
    // Light-Medium
    '#D4B090', '#CEAA85', '#C9A07A',
    // Medium
    '#C49870', '#BA8F65', '#B08060',
    // Medium-Tan
    '#A07050', '#966845', '#8C613C',
    // Tan / Deep
    '#7A5235', '#6B4428', '#5A381E',
];
export function FoundationControl() {
    const { config, updateFoundation } = useMakeupStore();
    const foundation = config.foundation;
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Base" }), _jsx("button", { role: "switch", "aria-checked": foundation.enabled, onClick: () => updateFoundation({ enabled: !foundation.enabled }), className: `w-8 h-4 rounded-full transition-colors ${foundation.enabled ? 'bg-blush' : 'bg-border'}`, children: _jsx("span", { className: `block w-3 h-3 rounded-full bg-white shadow m-0.5 transition-transform ${foundation.enabled ? 'translate-x-4' : ''}` }) })] }), _jsx(ColorPicker, { label: "Tom de pele", value: foundation.color, swatches: FOUNDATION_COLORS, onChange: (color) => updateFoundation({ color }), disabled: !foundation.enabled }), _jsx(Slider, { label: "Cobertura", value: foundation.opacity, onChange: (opacity) => updateFoundation({ opacity }), disabled: !foundation.enabled })] }));
}
