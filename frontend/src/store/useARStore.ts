import { create } from 'zustand';
import type { ProductType } from '@/features/ar-flow/productConfig';
import { PRODUCT_CONFIG } from '@/features/ar-flow/productConfig';

// 4 steps — lighting warns user, capture takes photo, confirm shows it,
// studio is LIVE webcam with makeup in real-time
export type ARStep = 'lighting' | 'capture' | 'confirm' | 'studio';

interface ARState {
  step: ARStep;
  product: ProductType;
  capturedPhoto: string | null; // only used for the confirm screen
  selectedColor: string;

  setStep: (step: ARStep) => void;
  setProduct: (product: ProductType) => void;
  setCapturedPhoto: (url: string) => void;
  setSelectedColor: (color: string) => void;
  retake: () => void;
  reset: () => void;
}

export const useARStore = create<ARState>((set) => ({
  step: 'lighting',
  product: 'batom',
  capturedPhoto: null,
  selectedColor: PRODUCT_CONFIG.batom.defaultColor,

  setStep:          (step)  => set({ step }),
  setProduct:       (product) =>
    set({ product, selectedColor: PRODUCT_CONFIG[product].defaultColor }),
  setCapturedPhoto: (url)   => set({ capturedPhoto: url, step: 'confirm' }),
  setSelectedColor: (color) => set({ selectedColor: color }),
  retake:           ()      => set({ capturedPhoto: null, step: 'capture' }),
  reset:            ()      =>
    set((s) => ({
      step: 'lighting',
      capturedPhoto: null,
      selectedColor: PRODUCT_CONFIG[s.product].defaultColor,
    })),
}));
