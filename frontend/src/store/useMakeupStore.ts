import { create } from 'zustand';
import type { MakeupConfig, MakeupLayer } from '@/types/makeup';
import type { MakeupPreset } from '@/types/presets';
import { DEFAULT_MAKEUP, PRESETS } from '@/data/presets';

interface MakeupState {
  config: MakeupConfig;
  activeLayer: MakeupLayer;
  activePreset: string | null;
  showDebugLandmarks: boolean;
  showBeforeAfter: boolean;

  // Actions
  setLayer: (layer: MakeupLayer) => void;
  updateLipstick: (patch: Partial<MakeupConfig['lipstick']>) => void;
  updateBlush: (patch: Partial<MakeupConfig['blush']>) => void;
  updateContour: (patch: Partial<MakeupConfig['contour']>) => void;
  updateFoundation: (patch: Partial<MakeupConfig['foundation']>) => void;
  updateBrows: (patch: Partial<MakeupConfig['brows']>) => void;
  applyPreset: (preset: MakeupPreset) => void;
  resetConfig: () => void;
  toggleDebug: () => void;
  toggleBeforeAfter: () => void;
}

export const useMakeupStore = create<MakeupState>((set) => ({
  config: DEFAULT_MAKEUP,
  activeLayer: 'lipstick',
  activePreset: null,
  showDebugLandmarks: false,
  showBeforeAfter: false,

  setLayer: (layer) => set({ activeLayer: layer }),

  updateLipstick: (patch) =>
    set((s) => ({
      config: { ...s.config, lipstick: { ...s.config.lipstick, ...patch } },
      activePreset: null,
    })),

  updateBlush: (patch) =>
    set((s) => ({
      config: { ...s.config, blush: { ...s.config.blush, ...patch } },
      activePreset: null,
    })),

  updateContour: (patch) =>
    set((s) => ({
      config: { ...s.config, contour: { ...s.config.contour, ...patch } },
      activePreset: null,
    })),

  updateFoundation: (patch) =>
    set((s) => ({
      config: { ...s.config, foundation: { ...s.config.foundation, ...patch } },
      activePreset: null,
    })),

  updateBrows: (patch) =>
    set((s) => ({
      config: { ...s.config, brows: { ...s.config.brows, ...patch } },
      activePreset: null,
    })),

  applyPreset: (preset) =>
    set({ config: preset.config, activePreset: preset.id }),

  resetConfig: () =>
    set({ config: DEFAULT_MAKEUP, activePreset: null }),

  toggleDebug: () =>
    set((s) => ({ showDebugLandmarks: !s.showDebugLandmarks })),

  toggleBeforeAfter: () =>
    set((s) => ({ showBeforeAfter: !s.showBeforeAfter })),
}));

export { PRESETS };
