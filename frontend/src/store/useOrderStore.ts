import { create } from 'zustand';

export type SelectionStep = 'batom' | 'base' | 'corretivo' | 'blush';

export interface StepSelection {
  productId: string;
  productName: string;
  colorId: string;
  colorName: string;
  colorHex: string;
}

export const STEPS: SelectionStep[] = ['batom', 'base', 'corretivo', 'blush'];

export const STEP_LABELS: Record<SelectionStep, string> = {
  batom: 'Batom',
  base: 'Base',
  corretivo: 'Corretivo',
  blush: 'Blush',
};

export const STEP_DESCRIPTIONS: Record<SelectionStep, string> = {
  batom: 'Escolha a cor do seu batom',
  base: 'Escolha a tonalidade da base',
  corretivo: 'Escolha o corretivo ideal',
  blush: 'Finalize com o blush perfeito',
};

interface OrderState {
  clientName: string;
  stepIndex: number;
  selections: Partial<Record<SelectionStep, StepSelection>>;
  orderId: string | null;
  queuePosition: number | null;

  setClientName: (name: string) => void;
  confirmStep: (selection: StepSelection) => void;
  nextStep: () => void;
  setOrder: (orderId: string, position: number) => void;
  reset: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  clientName: '',
  stepIndex: 0,
  selections: {},
  orderId: null,
  queuePosition: null,

  setClientName: (name) => set({ clientName: name }),

  confirmStep: (selection) =>
    set((state) => ({
      selections: {
        ...state.selections,
        [STEPS[state.stepIndex]]: selection,
      },
    })),

  nextStep: () => set((state) => ({ stepIndex: state.stepIndex + 1 })),

  setOrder: (orderId, position) => set({ orderId, queuePosition: position }),

  reset: () =>
    set({
      clientName: '',
      stepIndex: 0,
      selections: {},
      orderId: null,
      queuePosition: null,
    }),
}));
