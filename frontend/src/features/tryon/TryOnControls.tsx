import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMakeupStore } from '@/store/useMakeupStore';
import type { MakeupLayer } from '@/types/makeup';
import { MakeupPanel } from '@/features/makeup/MakeupPanel';
import { PresetsPanel } from '@/features/presets/PresetsPanel';

type Tab = 'makeup' | 'presets';

interface TryOnControlsProps {
  onSnapshot: () => void;
  isSaving: boolean;
}

const LAYER_LABELS: Record<MakeupLayer, string> = {
  lipstick:   'Batom',
  blush:      'Blush',
  contour:    'Contorno',
  foundation: 'Base',
  brows:      'Sobrancelha',
};

function IntensityBar() {
  const {
    config, activeLayer,
    updateLipstick, updateBlush, updateContour, updateFoundation, updateBrows,
  } = useMakeupStore();

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
  const updateMap: Record<MakeupLayer, (v: number) => void> = {
    lipstick:   (opacity) => updateLipstick({ opacity }),
    blush:      (opacity) => updateBlush({ opacity }),
    contour:    (opacity) => updateContour({ opacity }),
    foundation: (opacity) => updateFoundation({ opacity }),
    brows:      (opacity) => updateBrows({ opacity }),
  };

  const opacity  = opacityMap[activeLayer];
  const enabled  = enabledMap[activeLayer];
  const setOpacity = updateMap[activeLayer];
  const pct = Math.round(opacity * 100);

  return (
    <div className="px-4 py-3 border-b border-border" style={{ background: 'rgba(236,72,153,0.06)' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#EC4899' }}>
          ◈ Intensidade — {LAYER_LABELS[activeLayer]}
        </span>
        <span className="text-xs font-mono font-semibold" style={{ color: enabled ? '#EC4899' : 'rgba(255,255,255,0.3)' }}>
          {pct}%
        </span>
      </div>
      <div
        className="relative h-2.5 rounded-full"
        style={{ background: 'rgba(255,255,255,0.08)' }}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background: enabled
              ? 'linear-gradient(90deg, #EC4899 0%, #8B5CF6 100%)'
              : 'rgba(255,255,255,0.15)',
          }}
        />
        <input
          type="range"
          min={0} max={1} step={0.01}
          value={opacity}
          disabled={!enabled}
          onChange={(e) => setOpacity(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          style={{ margin: 0 }}
        />
      </div>
      {!enabled && (
        <p className="text-xs text-white/30 mt-1">Ative {LAYER_LABELS[activeLayer]} para ajustar</p>
      )}
    </div>
  );
}

export function TryOnControls({ onSnapshot, isSaving }: TryOnControlsProps) {
  const [tab, setTab] = useState<Tab>('makeup');
  const { showBeforeAfter, showDebugLandmarks, toggleBeforeAfter, toggleDebug } = useMakeupStore();

  return (
    <div className="glass-panel rounded-2xl flex flex-col h-full overflow-hidden">
      {/* Top actions */}
      <div className="p-4 border-b border-border flex gap-2">
        <button
          onClick={toggleBeforeAfter}
          className={`flex-1 text-xs py-2 rounded-lg border transition-all ${
            showBeforeAfter
              ? 'border-blush/50 bg-blush/10 text-blush-light'
              : 'border-border text-white/40 hover:text-white/70'
          }`}
        >
          Antes / Depois
        </button>
        <button
          onClick={toggleDebug}
          className={`text-xs py-2 px-3 rounded-lg border transition-all ${
            showDebugLandmarks
              ? 'border-gold/50 bg-gold/10 text-gold'
              : 'border-border text-white/30 hover:text-white/50'
          }`}
        >
          Debug
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {(['makeup', 'presets'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === t
                ? 'text-white border-b-2 border-blush -mb-px'
                : 'text-white/30 hover:text-white/60'
            }`}
          >
            {t === 'makeup' ? 'Maquiagem' : 'Looks'}
          </button>
        ))}
      </div>

      {/* Intensity bar — always visible, outside scroll area */}
      {tab === 'makeup' && <IntensityBar />}

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {tab === 'makeup' ? <MakeupPanel /> : <PresetsPanel />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Snapshot button */}
      <div className="p-4 border-t border-border">
        <button
          onClick={onSnapshot}
          disabled={isSaving}
          className="w-full btn-primary py-3 text-sm flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Salvando…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Tirar foto
            </>
          )}
        </button>
      </div>
    </div>
  );
}
