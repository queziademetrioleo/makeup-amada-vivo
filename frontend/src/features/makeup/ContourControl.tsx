import { useMakeupStore } from '@/store/useMakeupStore';
import { Slider } from '@/components/ui/Slider';
import { ColorPicker } from '@/components/ui/ColorPicker';

const CONTOUR_COLORS = [
  '#8B6B5A', '#7A5040', '#6B4B3E', '#9A7060', '#A08070',
  '#C09080', '#8B7355', '#704830', '#5A3D2B', '#7A7080',
];

export function ContourControl() {
  const { config, updateContour } = useMakeupStore();
  const contour = config.contour;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Contorno</span>
        <button
          role="switch"
          aria-checked={contour.enabled}
          onClick={() => updateContour({ enabled: !contour.enabled })}
          className={`w-8 h-4 rounded-full transition-colors ${contour.enabled ? 'bg-blush' : 'bg-border'}`}
        >
          <span className={`block w-3 h-3 rounded-full bg-white shadow m-0.5 transition-transform ${contour.enabled ? 'translate-x-4' : ''}`} />
        </button>
      </div>

      <ColorPicker
        label="Cor"
        value={contour.color}
        swatches={CONTOUR_COLORS}
        onChange={(color) => updateContour({ color })}
        disabled={!contour.enabled}
      />

      <Slider
        label="Intensidade"
        value={contour.opacity}
        onChange={(opacity) => updateContour({ opacity })}
        disabled={!contour.enabled}
      />
    </div>
  );
}
