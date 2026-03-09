import { useEffect, useRef } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { useCameraStore } from '@/store/useCameraStore';
// WASM served from CDN — explicit URL avoids Vite bundling issues
const WASM_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm';
// Compact (~3 MB float16) model hosted on Google's MediaPipe CDN
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
/**
 * Initialises MediaPipe FaceLandmarker in VIDEO mode.
 *
 * VIDEO mode makes detectForVideo() fully synchronous:
 * call it on every animation frame and get landmarks immediately —
 * no callbacks, no race conditions, perfect frame-sync with rendering.
 */
export function useFaceMesh() {
    const faceLandmarkerRef = useRef(null);
    const { setFaceMeshReady, setError } = useCameraStore.getState();
    useEffect(() => {
        let cancelled = false;
        async function init() {
            const filesetResolver = await FilesetResolver.forVisionTasks(WASM_CDN);
            if (cancelled)
                return;
            const fl = await FaceLandmarker.createFromOptions(filesetResolver, {
                baseOptions: {
                    modelAssetPath: MODEL_URL,
                    delegate: 'GPU',
                },
                outputFaceBlendshapes: false,
                outputFacialTransformationMatrixes: false,
                runningMode: 'VIDEO',
                numFaces: 1,
            });
            if (cancelled)
                return;
            faceLandmarkerRef.current = fl;
            setFaceMeshReady(true);
        }
        init().catch((err) => {
            console.error('[FaceLandmarker]', err);
            setError('Não foi possível inicializar a IA facial. Verifique sua conexão e recarregue a página.');
        });
        return () => {
            cancelled = true;
            faceLandmarkerRef.current?.close();
            faceLandmarkerRef.current = null;
            setFaceMeshReady(false);
        };
    }, [setFaceMeshReady, setError]);
    return { faceLandmarkerRef };
}
