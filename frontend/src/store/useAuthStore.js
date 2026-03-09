import { create } from 'zustand';
export const useAuthStore = create((set) => ({
    user: null,
    isLoading: true,
    authModalOpen: false,
    setUser: (user) => set({ user, isLoading: false }),
    setLoading: (isLoading) => set({ isLoading }),
    openAuthModal: () => set({ authModalOpen: true }),
    closeAuthModal: () => set({ authModalOpen: false }),
}));
