import { motion } from 'framer-motion';
import type { MakeupPreset } from '@/types/presets';
import { useMakeupStore } from '@/store/useMakeupStore';

interface PresetCardProps {
  preset: MakeupPreset;
}

export function PresetCard({ preset }: PresetCardProps) {
  const { activePreset, applyPreset } = useMakeupStore();
  const isActive = activePreset === preset.id;

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => applyPreset(preset)}
      className={`w-full text-left rounded-xl border p-3 transition-all ${
        isActive
          ? 'border-blush/60 bg-blush/10'
          : 'border-border hover:border-white/20 bg-transparent'
      }`}
    >
      {/* Color bar */}
      <div
        className="h-1 w-full rounded-full mb-3"
        style={{ background: `linear-gradient(90deg, ${preset.gradient[0]}, ${preset.gradient[1]})` }}
      />

      {/* Swatches */}
      <div className="flex gap-1.5 mb-2">
        {Object.entries(preset.config).map(([key, cfg]) =>
          'color' in cfg && cfg.enabled ? (
            <div
              key={key}
              className="w-4 h-4 rounded-full border border-white/10"
              style={{ backgroundColor: cfg.color }}
            />
          ) : null,
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${isActive ? 'text-blush-light' : 'text-white'}`}>
            {preset.name}
          </p>
          <p className="text-white/30 text-xs truncate">{preset.description}</p>
        </div>
        {preset.isPremium && (
          <span className="text-xs text-gold/70 shrink-0 ml-2">★</span>
        )}
      </div>
    </motion.button>
  );
}
