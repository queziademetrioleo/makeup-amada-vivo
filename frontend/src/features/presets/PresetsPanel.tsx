import { useMakeupStore, PRESETS } from '@/store/useMakeupStore';
import { PresetCard } from './PresetCard';
import { Button } from '@/components/ui/Button';

export function PresetsPanel() {
  const { resetConfig } = useMakeupStore();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/40 uppercase tracking-wider font-medium">Looks prontos</p>
        <Button variant="ghost" size="sm" onClick={resetConfig} className="text-xs py-1 px-3">
          Limpar
        </Button>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {PRESETS.map((preset) => (
          <PresetCard key={preset.id} preset={preset} />
        ))}
      </div>
    </div>
  );
}
