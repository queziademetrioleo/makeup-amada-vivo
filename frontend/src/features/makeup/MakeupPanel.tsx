import { motion, AnimatePresence } from 'framer-motion';
import type { MakeupLayer } from '@/types/makeup';
import { useMakeupStore } from '@/store/useMakeupStore';
import { LipstickControl } from './LipstickControl';
import { BlushControl } from './BlushControl';
import { ContourControl } from './ContourControl';
import { FoundationControl } from './FoundationControl';
import { BrowsControl } from './BrowsControl';
import { ConcealerControl } from './ConcealerControl';

const LAYERS: { id: MakeupLayer; label: string; icon: string }[] = [
  { id: 'lipstick',  label: 'Batom',      icon: '💄' },
  { id: 'blush',     label: 'Blush',      icon: '🌸' },
  { id: 'contour',   label: 'Contorno',   icon: '◐'  },
  { id: 'foundation',label: 'Base',       icon: '✦'  },
  { id: 'brows',     label: 'Sobrancelha',icon: '〜' },
  { id: 'concealer', label: 'Corretivo',  icon: '○'  },
];

const CONTROLS: Record<MakeupLayer, React.ReactNode> = {
  lipstick:   <LipstickControl />,
  blush:      <BlushControl />,
  contour:    <ContourControl />,
  foundation: <FoundationControl />,
  brows:      <BrowsControl />,
  concealer:  <ConcealerControl />,
};

export function MakeupPanel() {
  const { activeLayer, setLayer } = useMakeupStore();

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
