import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { FaceLandmarker } from '@mediapipe/tasks-vision';
import type { NormalizedLandmarkList, MakeupConfig } from '@/types/makeup';
import { ThreeMakeupRenderer } from '@/utils/threejs/ThreeMakeupRenderer';
import { LiveBadge, FaceMeshLoadingOverlay, NoFaceIndicator } from '@/features/camera/CameraView';
import { useCameraStore } from '@/store/useCameraStore';

interface TryOnCanvasProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  faceLandmarkerRef: React.MutableRefObject<FaceLandmarker | null>;
  config: MakeupConfig;
  showBeforeAfter: boolean;
  showDebug: boolean;
  faceMeshReady: boolean;
  faceDetected: boolean;
}

export interface TryOnCanvasHandle {
  captureSnapshot: () => string;
}

function drawDebugDots(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmarkList,
  width: number,
  height: number,
): void {
  ctx.save();
  ctx.fillStyle = 'rgba(232, 128, 154, 0.8)';
  for (const lm of landmarks) {
    ctx.beginPath();
    ctx.arc(lm.x * width, lm.y * height, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export const TryOnCanvas = forwardRef<TryOnCanvasHandle, TryOnCanvasProps>(
  (
    { videoRef, faceLandmarkerRef, config, showBeforeAfter, showDebug, faceMeshReady, faceDetected },
    ref,
  ) => {
    // Three.js canvas — makeup rendered here
    const glCanvasRef  = useRef<HTMLCanvasElement>(null);
    // 2D canvas — debug dots + before/after overlay
    const overlayRef   = useRef<HTMLCanvasElement>(null);
    const rendererRef  = useRef<ThreeMakeupRenderer | null>(null);
    const rafRef       = useRef<number>(0);
    const prevFaceRef  = useRef(false);
    const tsRef        = useRef(0);
    const { setFaceDetected } = useCameraStore.getState();

    // Expose snapshot (reads the WebGL canvas)
    useImperativeHandle(ref, () => ({
      captureSnapshot: () => {
        const canvas = glCanvasRef.current;
        if (!canvas) return '';
        const offscreen = document.createElement('canvas');
        offscreen.width  = canvas.width;
        offscreen.height = canvas.height;
        const octx = offscreen.getContext('2d')!;
        octx.translate(canvas.width, 0);
        octx.scale(-1, 1);
        octx.drawImage(canvas, 0, 0);
        return offscreen.toDataURL('image/jpeg', 0.92);
      },
    }));

    // Lazily create ThreeMakeupRenderer
    const getRenderer = useCallback((video: HTMLVideoElement): ThreeMakeupRenderer | null => {
      const canvas = glCanvasRef.current;
      if (!canvas) return null;
      if (!rendererRef.current) {
        try {
          rendererRef.current = new ThreeMakeupRenderer(canvas, video);
        } catch (e) {
          console.error('Three.js init failed:', e);
          return null;
        }
      }
      return rendererRef.current;
    }, []);

    const renderFrame = useCallback(() => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(renderFrame);
        return;
      }

      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (vw === 0 || vh === 0) {
        rafRef.current = requestAnimationFrame(renderFrame);
        return;
      }

      // ── Detect face ──────────────────────────────────────────────────────────
      let landmarks: NormalizedLandmarkList | null = null;
      const fl = faceLandmarkerRef.current;
      if (fl && faceMeshReady) {
        const now = performance.now();
        const ts  = now > tsRef.current ? now : tsRef.current + 1;
        tsRef.current = ts;
        try {
          const results = fl.detectForVideo(video, ts);
          landmarks = (results.faceLandmarks[0] as NormalizedLandmarkList) ?? null;
        } catch { /* ignore single-frame errors */ }
      }

      const detected = !!landmarks;
      if (detected !== prevFaceRef.current) {
        prevFaceRef.current = detected;
        setFaceDetected(detected);
      }

      // ── Sync overlay canvas size ─────────────────────────────────────────────
      const ov = overlayRef.current;
      if (ov && (ov.width !== vw || ov.height !== vh)) {
        ov.width  = vw;
        ov.height = vh;
      }
      const ovCtx = ov?.getContext('2d') ?? null;
      ovCtx?.clearRect(0, 0, vw, vh);

      // ── Three.js render ──────────────────────────────────────────────────────
      const renderer = getRenderer(video);
      if (renderer) {
        if (!showBeforeAfter) {
          renderer.render(landmarks, config, vw, vh);
          if (showDebug && landmarks && ovCtx) drawDebugDots(ovCtx, landmarks, vw, vh);

        } else {
          // Full makeup on Three.js canvas, overlay masks left half with raw video
          renderer.render(landmarks, config, vw, vh);

          if (ovCtx) {
            ovCtx.save();
            ovCtx.beginPath();
            ovCtx.rect(0, 0, vw / 2, vh);
            ovCtx.clip();
            ovCtx.drawImage(video, 0, 0, vw, vh);
            ovCtx.restore();

            // Divider line + labels
            const half = vw / 2;
            ovCtx.save();
            ovCtx.strokeStyle = 'rgba(255,255,255,0.55)';
            ovCtx.lineWidth   = 1.5;
            ovCtx.setLineDash([5, 4]);
            ovCtx.beginPath();
            ovCtx.moveTo(half, 0);
            ovCtx.lineTo(half, vh);
            ovCtx.stroke();

            ovCtx.save();
            ovCtx.translate(half, 0);
            ovCtx.scale(-1, 1);
            ovCtx.fillStyle = 'rgba(255,255,255,0.45)';
            ovCtx.font      = '11px Inter, sans-serif';
            ovCtx.fillText('DEPOIS', -half + 10, 20);
            ovCtx.fillText('ANTES', 10, 20);
            ovCtx.restore();
            ovCtx.restore();
          }
        }
      }

      rafRef.current = requestAnimationFrame(renderFrame);
    }, [videoRef, faceLandmarkerRef, config, showBeforeAfter, showDebug, faceMeshReady, setFaceDetected, getRenderer]);

    useEffect(() => {
      rafRef.current = requestAnimationFrame(renderFrame);
      return () => {
        cancelAnimationFrame(rafRef.current);
        rendererRef.current?.dispose();
        rendererRef.current = null;
      };
    }, [renderFrame]);

    return (
      <div className="relative w-full h-full flex items-center justify-center bg-black rounded-2xl overflow-hidden">
        {/*
          CSS scaleX(-1) = selfie/mirror view.
          Canvas pixels are unmirrored internally; landmarks align 1:1.
        */}
        {/* Three.js makeup output — scaleX(-1) = selfie/mirror view */}
        <canvas
          ref={glCanvasRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />
        {/* 2D overlay for debug / before-after */}
        <canvas
          ref={overlayRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />

        <LiveBadge />

        <AnimatePresence>
          {!faceMeshReady && <FaceMeshLoadingOverlay isReady={faceMeshReady} />}
        </AnimatePresence>

        {faceMeshReady && !faceDetected && <NoFaceIndicator />}
      </div>
    );
  },
);
TryOnCanvas.displayName = 'TryOnCanvas';
