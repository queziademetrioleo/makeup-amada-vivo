import { useMakeupStore } from '@/store/useMakeupStore';
import { Slider } from '@/components/ui/Slider';
import { ColorPicker } from '@/components/ui/ColorPicker';

const LIP_COLORS = [
  '#C02030', '#8B1A4A', '#E06040', '#C47B8A', '#C09080',
  '#D4827A', '#A03050', '#E08060', '#C86070', '#F0B0A0',
  '#8B0000', '#CC4488', '#FF6B9D', '#B5737C', '#D4AF8C',
];

export function LipstickControl() {
  const { config, updateLipstick } = useMakeupStore();
  const lip = config.lipstick;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Batom</span>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-xs text-white/40">Ativo</span>
          <button
            role="switch"
            aria-checked={lip.enabled}
            onClick={() => updateLipstick({ enabled: !lip.enabled })}
            className={`w-8 h-4 rounded-full transition-colors ${lip.enabled ? 'bg-blush' : 'bg-border'}`}
          >
            <span className={`block w-3 h-3 rounded-full bg-white shadow m-0.5 transition-transform ${lip.enabled ? 'translate-x-4' : ''}`} />
          </button>
        </label>
      </div>

      <ColorPicker
        label="Cor"
        value={lip.color}
        swatches={LIP_COLORS}
        onChange={(color) => updateLipstick({ color })}
        disabled={!lip.enabled}
      />

      <Slider
        label="Intensidade"
        value={lip.opacity}
        onChange={(opacity) => updateLipstick({ opacity })}
        disabled={!lip.enabled}
      />

      <label className={`flex items-center gap-3 cursor-pointer ${!lip.enabled ? 'opacity-40 pointer-events-none' : ''}`}>
        <button
          role="switch"
          aria-checked={lip.glossy}
          onClick={() => updateLipstick({ glossy: !lip.glossy })}
          className={`w-8 h-4 rounded-full transition-colors ${lip.glossy ? 'bg-blush' : 'bg-border'}`}
        >
          <span className={`block w-3 h-3 rounded-full bg-white shadow m-0.5 transition-transform ${lip.glossy ? 'translate-x-4' : ''}`} />
        </button>
        <span className="text-xs text-white/50">Efeito glossy</span>
      </label>
    </div>
  );
}
