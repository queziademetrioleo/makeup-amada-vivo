import { create } from 'zustand';
import { DEFAULT_MAKEUP, PRESETS } from '@/data/presets';
export const useMakeupStore = create((set) => ({
    config: DEFAULT_MAKEUP,
    activeLayer: 'lipstick',
    activePreset: null,
    showDebugLandmarks: false,
    showBeforeAfter: false,
    setLayer: (layer) => set({ activeLayer: layer }),
    updateLipstick: (patch) => set((s) => ({
        config: { ...s.config, lipstick: { ...s.config.lipstick, ...patch } },
        activePreset: null,
    })),
    updateBlush: (patch) => set((s) => ({
        config: { ...s.config, blush: { ...s.config.blush, ...patch } },
        activePreset: null,
    })),
    updateContour: (patch) => set((s) => ({
        config: { ...s.config, contour: { ...s.config.contour, ...patch } },
        activePreset: null,
    })),
    updateFoundation: (patch) => set((s) => ({
        config: { ...s.config, foundation: { ...s.config.foundation, ...patch } },
        activePreset: null,
    })),
    updateBrows: (patch) => set((s) => ({
        config: { ...s.config, brows: { ...s.config.brows, ...patch } },
        activePreset: null,
    })),
    updateConcealer: (patch) => set((s) => ({
        config: { ...s.config, concealer: { ...s.config.concealer, ...patch } },
        activePreset: null,
    })),
    applyPreset: (preset) => set({ config: preset.config, activePreset: preset.id }),
    resetConfig: () => set({ config: DEFAULT_MAKEUP, activePreset: null }),
    toggleDebug: () => set((s) => ({ showDebugLandmarks: !s.showDebugLandmarks })),
    toggleBeforeAfter: () => set((s) => ({ showBeforeAfter: !s.showBeforeAfter })),
}));
export { PRESETS };
