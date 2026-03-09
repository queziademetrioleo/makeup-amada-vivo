import { useRef, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebcam } from '@/hooks/useWebcam';
import { useFaceMesh } from '@/hooks/useFaceMesh';
import { useMakeupStore, PRESETS } from '@/store/useMakeupStore';
import { useCameraStore } from '@/store/useCameraStore';
import { useAuthStore } from '@/store/useAuthStore';
import { CameraPermission } from '@/features/camera/CameraPermission';
import { TryOnCanvas, type TryOnCanvasHandle } from './TryOnCanvas';
import { TryOnControls } from './TryOnControls';
import { uploadSnapshot } from '@/lib/storage';
import { saveLook } from '@/lib/firestore';

export function TryOnPage() {
  const [searchParams] = useSearchParams();
  const canvasRef = useRef<TryOnCanvasHandle>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);

  const { videoRef, isReady, isLoading, error, start } = useWebcam();
  // FaceLandmarker initialises immediately — no need to wait for camera
  const { faceLandmarkerRef } = useFaceMesh();
  const { faceMeshReady, faceDetected } = useCameraStore();
  const { config, showBeforeAfter, showDebugLandmarks, applyPreset } = useMakeupStore();
  const { user, openAuthModal } = useAuthStore();

  useEffect(() => {
    const presetId = searchParams.get('preset');
    if (presetId) {
      const preset = PRESETS.find((p) => p.id === presetId);
      if (preset) applyPreset(preset);
    }
  }, [searchParams, applyPreset]);

  const handleSnapshot = async () => {
    const dataUrl = canvasRef.current?.captureSnapshot();
    if (!dataUrl) return;
    if (!user) { setSnapshotUrl(dataUrl); return; }
    setIsSaving(true);
    try {
      const url = await uploadSnapshot(user.uid, dataUrl);
      await saveLook({
        userId: user.uid,
        name: `Look ${new Date().toLocaleDateString('pt-BR')}`,
        snapshotUrl: url,
        makeupConfig: config,
      });
      setSnapshotUrl(url);
    } catch {
      setSnapshotUrl(dataUrl);
    } finally {
      setIsSaving(false);
    }
  };

  const cameraStatus = isLoading ? 'requesting' : error ? 'error' : 'idle';

  return (
    <div className="min-h-dvh pt-16 flex flex-col lg:flex-row gap-0">
      {/*
        The <video> element must ALWAYS stay in the DOM as a single instance.
        If we place it inside a conditional branch, React unmounts and remounts it
        when isReady flips, losing the srcObject (stream) → black canvas.
        We keep it off-screen with a fixed position so it never interrupts layout.
      */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: 'fixed',
          top: -9999,
          left: -9999,
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />

      {/* Main canvas area */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-6">
        <div className="w-full max-w-2xl">
          {isReady ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-[4/3] w-full"
            >
              <TryOnCanvas
                ref={canvasRef}
                videoRef={videoRef}
                faceLandmarkerRef={faceLandmarkerRef}
                config={config}
                showBeforeAfter={showBeforeAfter}
                showDebug={showDebugLandmarks}
                faceMeshReady={faceMeshReady}
                faceDetected={faceDetected}
              />
            </motion.div>
          ) : (
            <div className="aspect-[4/3] w-full glass-panel rounded-2xl overflow-hidden">
              <CameraPermission
                status={cameraStatus}
                error={error}
                onStart={start}
              />
            </div>
          )}
        </div>
      </div>

      {/* Controls sidebar */}
      <div className="w-full lg:w-80 xl:w-96 p-4 lg:p-6 lg:pl-0 flex flex-col">
        <div className="h-full lg:h-[calc(100dvh-5rem)]">
          <TryOnControls onSnapshot={handleSnapshot} isSaving={isSaving} />
        </div>
      </div>

      {/* Snapshot preview */}
      <AnimatePresence>
        {snapshotUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="card p-6 max-w-sm w-full space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Sua foto</h3>
                <button onClick={() => setSnapshotUrl(null)} className="text-white/40 hover:text-white text-xl">×</button>
              </div>
              <img src={snapshotUrl} alt="Snapshot do look" className="w-full rounded-xl object-cover" />
              <div className="flex gap-3">
                <a href={snapshotUrl} download="meu-look.jpg" className="flex-1 btn-primary text-center text-sm py-2.5">
                  Baixar foto
                </a>
                {!user && (
                  <button
                    onClick={() => { setSnapshotUrl(null); openAuthModal(); }}
                    className="flex-1 btn-ghost text-sm py-2.5"
                  >
                    Salvar na conta
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
