import { create } from 'zustand';
export const useCameraStore = create((set) => ({
    status: 'idle',
    error: null,
    faceMeshReady: false,
    faceDetected: false,
    setStatus: (status) => set({ status }),
    setError: (error) => set({ error }),
    setFaceMeshReady: (faceMeshReady) => set({ faceMeshReady }),
    setFaceDetected: (faceDetected) => set({ faceDetected }),
}));
