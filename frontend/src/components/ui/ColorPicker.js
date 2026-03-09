import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const DEFAULT_SWATCHES = [
    '#C02030', '#8B1A4A', '#E06040', '#C47B8A', '#C09080',
    '#B06840', '#D4AF8C', '#8B6B5A', '#5A3D2B', '#3D1F2A',
    '#C46378', '#F0A070', '#DBAAA0', '#E8A0A8', '#F0D0D0',
];
export function ColorPicker({ label, value, swatches = DEFAULT_SWATCHES, onChange, disabled }) {
    return (_jsxs("div", { className: `space-y-2 ${disabled ? 'opacity-40 pointer-events-none' : ''}`, children: [label && (_jsx("span", { className: "text-xs text-white/50 font-medium uppercase tracking-wider", children: label })), _jsxs("div", { className: "flex flex-wrap gap-2", children: [swatches.map((hex) => (_jsx("button", { title: hex, onClick: () => onChange(hex), className: `w-7 h-7 rounded-full transition-all duration-150 ${value === hex
                            ? 'ring-2 ring-offset-2 ring-offset-panel ring-white scale-110'
                            : 'hover:scale-105'}`, style: { backgroundColor: hex } }, hex))), _jsxs("label", { className: "w-7 h-7 rounded-full border border-dashed border-white/30 flex items-center justify-center cursor-pointer hover:border-white/60 transition-colors overflow-hidden", title: "Cor personalizada", children: [_jsx("input", { type: "color", value: value, onChange: (e) => onChange(e.target.value), className: "opacity-0 absolute w-px h-px" }), _jsx("span", { className: "text-white/40 text-xs select-none", children: "+" })] })] })] }));
}
