import { useMakeupStore } from '@/store/useMakeupStore';
import { Slider } from '@/components/ui/Slider';
import { ColorPicker } from '@/components/ui/ColorPicker';

const BROW_COLORS = [
  '#5A3D2B', '#4A2820', '#6B4B3E', '#3D1F2A', '#8A6558',
  '#704830', '#8A7060', '#2A1810', '#6B5040', '#4A3530',
];

export function BrowsControl() {
  const { config, updateBrows } = useMakeupStore();
  const brows = config.brows;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Sobrancelhas</span>
        <button
          role="switch"
          aria-checked={brows.enabled}
          onClick={() => updateBrows({ enabled: !brows.enabled })}
          className={`w-8 h-4 rounded-full transition-colors ${brows.enabled ? 'bg-blush' : 'bg-border'}`}
        >
          <span className={`block w-3 h-3 rounded-full bg-white shadow m-0.5 transition-transform ${brows.enabled ? 'translate-x-4' : ''}`} />
        </button>
      </div>

      <ColorPicker
        label="Cor"
        value={brows.color}
        swatches={BROW_COLORS}
        onChange={(color) => updateBrows({ color })}
        disabled={!brows.enabled}
      />

      <Slider
        label="Intensidade"
        value={brows.opacity}
        onChange={(opacity) => updateBrows({ opacity })}
        disabled={!brows.enabled}
      />
    </div>
  );
}
