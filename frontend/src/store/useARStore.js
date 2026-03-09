import { create } from 'zustand';
import { PRODUCT_CONFIG } from '@/features/ar-flow/productConfig';
export const useARStore = create((set) => ({
    step: 'lighting',
    product: 'batom',
    capturedPhoto: null,
    selectedColor: PRODUCT_CONFIG.batom.defaultColor,
    setStep: (step) => set({ step }),
    setProduct: (product) => set({ product, selectedColor: PRODUCT_CONFIG[product].defaultColor }),
    setCapturedPhoto: (url) => set({ capturedPhoto: url, step: 'confirm' }),
    setSelectedColor: (color) => set({ selectedColor: color }),
    retake: () => set({ capturedPhoto: null, step: 'capture' }),
    reset: () => set((s) => ({
        step: 'lighting',
        capturedPhoto: null,
        selectedColor: PRODUCT_CONFIG[s.product].defaultColor,
    })),
}));
