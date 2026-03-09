import { motion, AnimatePresence } from 'framer-motion';
import type { MakeupLayer } from '@/types/makeup';
import { useMakeupStore } from '@/store/useMakeupStore';
import { LipstickControl } from './LipstickControl';
import { BlushControl } from './BlushControl';
import { ContourControl } from './ContourControl';
import { FoundationControl } from './FoundationControl';
import { BrowsControl } from './BrowsControl';

const LAYERS: { id: MakeupLayer; label: string; icon: string }[] = [
  { id: 'lipstick', label: 'Batom', icon: '💄' },
  { id: 'blush', label: 'Blush', icon: '🌸' },
  { id: 'contour', label: 'Contorno', icon: '◐' },
  { id: 'foundation', label: 'Base', icon: '✦' },
  { id: 'brows', label: 'Sobrancelha', icon: '〜' },
];

const CONTROLS: Record<MakeupLayer, React.ReactNode> = {
  lipstick: <LipstickControl />,
  blush: <BlushControl />,
  contour: <ContourControl />,
  foundation: <FoundationControl />,
  brows: <BrowsControl />,
};

function useActiveLayerOpacity() {
  const { config, activeLayer, updateLipstick, updateBlush, updateContour, updateFoundation, updateBrows } = useMakeupStore();

  const opacityMap: Record<MakeupLayer, number> = {
    lipstick:   config.lipstick.opacity,
    blush:      config.blush.opacity,
    contour:    config.contour.opacity,
    foundation: config.foundation.opacity,
    brows:      config.brows.opacity,
  };

  const enabledMap: Record<MakeupLayer, boolean> = {
    lipstick:   config.lipstick.enabled,
    blush:      config.blush.enabled,
    contour:    config.contour.enabled,
    foundation: config.foundation.enabled,
    brows:      config.brows.enabled,
  };

  const updateMap: Record<MakeupLayer, (opacity: number) => void> = {
    lipstick:   (opacity) => updateLipstick({ opacity }),
    blush:      (opacity) => updateBlush({ opacity }),
    contour:    (opacity) => updateContour({ opacity }),
    foundation: (opacity) => updateFoundation({ opacity }),
    brows:      (opacity) => updateBrows({ opacity }),
  };

  return {
    opacity:    opacityMap[activeLayer],
    enabled:    enabledMap[activeLayer],
    setOpacity: updateMap[activeLayer],
    label:      LAYERS.find(l => l.id === activeLayer)?.label ?? '',
  };
}

export function MakeupPanel() {
  const { activeLayer, setLayer } = useMakeupStore();
  const { opacity, enabled, setOpacity, label } = useActiveLayerOpacity();

  return (
    <div className="flex flex-col gap-4">
      {/* Tab row */}
      <div className="flex gap-1 bg-void rounded-xl p-1">
        {LAYERS.map((l) => (
          <button
            key={l.id}
            onClick={() => setLayer(l.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg text-xs transition-all ${
              activeLayer === l.id
                ? 'bg-panel text-white shadow-sm'
                : 'text-white/30 hover:text-white/60'
            }`}
          >
            <span className="text-base leading-none">{l.icon}</span>
            <span className="font-medium hidden sm:block">{l.label}</span>
          </button>
        ))}
      </div>

      {/* ── Intensity bar — always visible ── */}
      <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.25)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#EC4899' }}>
            Intensidade — {label}
          </span>
          <span className="text-xs font-mono text-white/60">{Math.round(opacity * 100)}%</span>
        </div>
        <div className={`relative h-2 rounded-full ${!enabled ? 'opacity-40' : ''}`} style={{ background: 'rgba(255,255,255,0.1)' }}>
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: `${opacity * 100}%`, background: 'linear-gradient(90deg, #EC4899, #8B5CF6)' }}
          />
          <input
            type="range"
            min={0} max={1} step={0.01}
            value={opacity}
            disabled={!enabled}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
            className="absolute inset-0 w-full opacity-0 cursor-pointer h-full disabled:cursor-not-allowed"
            style={{ margin: 0 }}
          />
        </div>
      </div>

      {/* Active control */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeLayer}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.18 }}
        >
          {CONTROLS[activeLayer]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
