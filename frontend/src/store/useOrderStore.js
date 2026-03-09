import { create } from 'zustand';
export const STEPS = ['batom', 'base', 'corretivo', 'blush'];
export const STEP_LABELS = {
    batom: 'Batom',
    base: 'Base',
    corretivo: 'Corretivo',
    blush: 'Blush',
};
export const STEP_DESCRIPTIONS = {
    batom: 'Escolha a cor do seu batom',
    base: 'Escolha a tonalidade da base',
    corretivo: 'Escolha o corretivo ideal',
    blush: 'Finalize com o blush perfeito',
};
export const useOrderStore = create((set) => ({
    clientName: '',
    whatsapp: '',
    stepIndex: 0,
    selections: {},
    orderId: null,
    queuePosition: null,
    setClientName: (name) => set({ clientName: name }),
    setWhatsapp: (phone) => set({ whatsapp: phone }),
    confirmStep: (selection) => set((state) => ({
        selections: {
            ...state.selections,
            [STEPS[state.stepIndex]]: selection,
        },
    })),
    nextStep: () => set((state) => ({ stepIndex: state.stepIndex + 1 })),
    setOrder: (orderId, position) => set({ orderId, queuePosition: position }),
    reset: () => set({
        clientName: '',
        whatsapp: '',
        stepIndex: 0,
        selections: {},
        orderId: null,
        queuePosition: null,
    }),
}));
