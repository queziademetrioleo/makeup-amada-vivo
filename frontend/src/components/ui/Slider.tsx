interface SliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function Slider({ label, value, min = 0, max = 1, step = 0.01, onChange, disabled }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className={`space-y-1.5 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <div className="flex justify-between items-center">
        <span className="text-xs text-white/50 font-medium uppercase tracking-wider">{label}</span>
        <span className="text-xs text-white/60 font-mono">{Math.round(pct)}%</span>
      </div>
      <div className="relative h-1.5 bg-border rounded-full">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-brand rounded-full"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
          style={{ margin: 0 }}
        />
      </div>
    </div>
  );
}
