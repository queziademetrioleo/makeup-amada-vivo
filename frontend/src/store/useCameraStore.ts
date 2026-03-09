import { create } from 'zustand';

type CameraStatus = 'idle' | 'requesting' | 'active' | 'error';

interface CameraState {
  status: CameraStatus;
  error: string | null;
  faceMeshReady: boolean;
  faceDetected: boolean;

  setStatus: (status: CameraStatus) => void;
  setError: (error: string | null) => void;
  setFaceMeshReady: (v: boolean) => void;
  setFaceDetected: (v: boolean) => void;
}

export const useCameraStore = create<CameraState>((set) => ({
  status: 'idle',
  error: null,
  faceMeshReady: false,
  faceDetected: false,

  setStatus: (status) => set({ status }),
  setError: (error) => set({ error }),
  setFaceMeshReady: (faceMeshReady) => set({ faceMeshReady }),
  setFaceDetected: (faceDetected) => set({ faceDetected }),
}));
