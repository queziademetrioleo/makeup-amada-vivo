interface ColorPickerProps {
  label?: string;
  value: string;
  swatches?: string[];
  onChange: (color: string) => void;
  disabled?: boolean;
}

const DEFAULT_SWATCHES = [
  '#C02030', '#8B1A4A', '#E06040', '#C47B8A', '#C09080',
  '#B06840', '#D4AF8C', '#8B6B5A', '#5A3D2B', '#3D1F2A',
  '#C46378', '#F0A070', '#DBAAA0', '#E8A0A8', '#F0D0D0',
];

export function ColorPicker({ label, value, swatches = DEFAULT_SWATCHES, onChange, disabled }: ColorPickerProps) {
  return (
    <div className={`space-y-2 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      {label && (
        <span className="text-xs text-white/50 font-medium uppercase tracking-wider">{label}</span>
      )}
      <div className="flex flex-wrap gap-2">
        {swatches.map((hex) => (
          <button
            key={hex}
            title={hex}
            onClick={() => onChange(hex)}
            className={`w-7 h-7 rounded-full transition-all duration-150 ${
              value === hex
                ? 'ring-2 ring-offset-2 ring-offset-panel ring-white scale-110'
                : 'hover:scale-105'
            }`}
            style={{ backgroundColor: hex }}
          />
        ))}
        {/* Custom color via native input */}
        <label
          className="w-7 h-7 rounded-full border border-dashed border-white/30 flex items-center justify-center cursor-pointer hover:border-white/60 transition-colors overflow-hidden"
          title="Cor personalizada"
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="opacity-0 absolute w-px h-px"
          />
          <span className="text-white/40 text-xs select-none">+</span>
        </label>
      </div>
    </div>
  );
}
