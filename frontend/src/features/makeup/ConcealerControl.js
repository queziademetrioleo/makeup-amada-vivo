import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMakeupStore } from '@/store/useMakeupStore';
import { Slider } from '@/components/ui/Slider';
import { ColorPicker } from '@/components/ui/ColorPicker';
const CONCEALER_COLORS = [
    '#F8EAD8', '#F5E4D0', '#F0D8B8', '#EDD0A8', '#E8C898',
    '#DEC098', '#D4B088', '#CCA878', '#C09060', '#A07050',
];
export function ConcealerControl() {
    const { config, updateConcealer } = useMakeupStore();
    const concealer = config.concealer;
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Corretivo" }), _jsx("button", { role: "switch", "aria-checked": concealer.enabled, onClick: () => updateConcealer({ enabled: !concealer.enabled }), className: `w-8 h-4 rounded-full transition-colors ${concealer.enabled ? 'bg-blush' : 'bg-border'}`, children: _jsx("span", { className: `block w-3 h-3 rounded-full bg-white shadow m-0.5 transition-transform ${concealer.enabled ? 'translate-x-4' : ''}` }) })] }), _jsx(ColorPicker, { label: "Cor", value: concealer.color, swatches: CONCEALER_COLORS, onChange: (color) => updateConcealer({ color }), disabled: !concealer.enabled }), _jsx(Slider, { label: "Intensidade", value: concealer.opacity, onChange: (opacity) => updateConcealer({ opacity }), disabled: !concealer.enabled })] }));
}
