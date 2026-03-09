import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMakeupStore } from '@/store/useMakeupStore';
import { Slider } from '@/components/ui/Slider';
import { ColorPicker } from '@/components/ui/ColorPicker';
const BLUSH_COLORS = [
    '#E8A0A8', '#F0A070', '#C46378', '#DBAAA0', '#F0C0B0',
    '#E8B4C0', '#C89080', '#D4827A', '#FFC0CB', '#FFB6C1',
];
export function BlushControl() {
    const { config, updateBlush } = useMakeupStore();
    const blush = config.blush;
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Blush" }), _jsx("button", { role: "switch", "aria-checked": blush.enabled, onClick: () => updateBlush({ enabled: !blush.enabled }), className: `w-8 h-4 rounded-full transition-colors ${blush.enabled ? 'bg-blush' : 'bg-border'}`, children: _jsx("span", { className: `block w-3 h-3 rounded-full bg-white shadow m-0.5 transition-transform ${blush.enabled ? 'translate-x-4' : ''}` }) })] }), _jsx(ColorPicker, { label: "Cor", value: blush.color, swatches: BLUSH_COLORS, onChange: (color) => updateBlush({ color }), disabled: !blush.enabled }), _jsx(Slider, { label: "Intensidade", value: blush.opacity, onChange: (opacity) => updateBlush({ opacity }), disabled: !blush.enabled })] }));
}
