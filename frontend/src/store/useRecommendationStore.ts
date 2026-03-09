import { create } from 'zustand';
import type { CatalogProduct } from '@/data/catalog';

export interface AIAnalysis {
    tom: string;
    subtom: string;
}

export interface AIRecommendations {
    base: CatalogProduct;
    batom: CatalogProduct;
    blush: CatalogProduct;
}

interface RecommendationState {
    /** Photo base64 captured by user */
    photoBase64: string | null;
    /** Analysis returned by Gemini */
    analysis: AIAnalysis | null;
    /** Product recommendations from Gemini */
    recommendations: AIRecommendations | null;
    /** Currently active products (user can override) */
    activeBase: CatalogProduct | null;
    activeBatom: CatalogProduct | null;
    activeBlush: CatalogProduct | null;
    /** Loading / error state */
    isLoading: boolean;
    error: string | null;

    setPhoto: (base64: string) => void;
    setResult: (analysis: AIAnalysis, recs: AIRecommendations) => void;
    setActiveBase: (p: CatalogProduct) => void;
    setActiveBatom: (p: CatalogProduct) => void;
    setActiveBlush: (p: CatalogProduct) => void;
    setLoading: (v: boolean) => void;
    setError: (e: string | null) => void;
    reset: () => void;
}

export const useRecommendationStore = create<RecommendationState>((set) => ({
    photoBase64: null,
    analysis: null,
    recommendations: null,
    activeBase: null,
    activeBatom: null,
    activeBlush: null,
    isLoading: false,
    error: null,

    setPhoto: (base64) => set({ photoBase64: base64 }),

    setResult: (analysis, recs) => set({
        analysis,
        recommendations: recs,
        activeBase: recs.base,
        activeBatom: recs.batom,
        activeBlush: recs.blush,
        isLoading: false,
        error: null,
    }),

    setActiveBase: (p) => set({ activeBase: p }),
    setActiveBatom: (p) => set({ activeBatom: p }),
    setActiveBlush: (p) => set({ activeBlush: p }),
    setLoading: (v) => set({ isLoading: v }),
    setError: (e) => set({ error: e, isLoading: false }),

    reset: () => set({
        photoBase64: null,
        analysis: null,
        recommendations: null,
        activeBase: null,
        activeBatom: null,
        activeBlush: null,
        isLoading: false,
        error: null,
    }),
}));
