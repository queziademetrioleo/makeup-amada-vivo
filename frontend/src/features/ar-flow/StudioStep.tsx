/**
 * Step 4 — Tela 7 do fluxo (WEBCAM AO VIVO)
 *
 * A câmera está rodando. MediaPipe detecta o rosto frame a frame.
 * Maquiagem aplicada via Canvas 2D com multiply blend + bezier suave.
 * Troca de cor = instantânea (ref, sem re-render).
 */
import { useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { FaceLandmarker } from '@mediapipe/tasks-vision';
import type { NormalizedLandmarkList } from '@/types/makeup';
import { useARStore } from '@/store/useARStore';
import { PRODUCT_CONFIG } from './productConfig';
import { LANDMARK_GROUPS } from '@/utils/landmarks';

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  faceLandmarkerRef: React.MutableRefObject<FaceLandmarker | null>;
  faceMeshReady: boolean;
}

// ── Smooth bezier path through points ────────────────────────────────────────
function smoothPath(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  pts: [number, number][],
) {
  if (pts.length < 2) return;
  ctx.beginPath();
  const start: [number, number] = [
    (pts[pts.length - 1][0] + pts[0][0]) / 2,
    (pts[pts.length - 1][1] + pts[0][1]) / 2,
  ];
  ctx.moveTo(start[0], start[1]);
  for (let i = 0; i < pts.length; i++) {
    const next = pts[(i + 1) % pts.length];
    ctx.quadraticCurveTo(pts[i][0], pts[i][1], (pts[i][0] + next[0]) / 2, (pts[i][1] + next[1]) / 2);
  }
  ctx.closePath();
}

function lmPx(lm: NormalizedLandmarkList, idx: number, w: number, h: number): [number, number] {
  return [lm[idx].x * w, lm[idx].y * h];
}

function groupPx(lm: NormalizedLandmarkList, indices: readonly number[], w: number, h: number): [number, number][] {
  return indices.map((i) => lmPx(lm, i, w, h));
}

// ── Composite helper ─────────────────────────────────────────────────────────
function composite(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  blur: number,
  blend: GlobalCompositeOperation,
  alpha: number,
  draw: (oc: OffscreenCanvasRenderingContext2D) => void,
) {
  const oc = new OffscreenCanvas(w, h);
  const oc2 = oc.getContext('2d')!;
  if (blur > 0) oc2.filter = `blur(${blur}px)`;
  draw(oc2);
  ctx.save();
  ctx.globalCompositeOperation = blend;
  ctx.globalAlpha = alpha;
  ctx.drawImage(oc, 0, 0);
  ctx.restore();
}

// ── Makeup renderers per product ─────────────────────────────────────────────

function renderLipstick(ctx: CanvasRenderingContext2D, lm: NormalizedLandmarkList, w: number, h: number, color: string, opacity: number) {
  // Outer lip boundary
  const upper = groupPx(lm, [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291], w, h);
  const lower = groupPx(lm, [291, 375, 321, 405, 314, 17, 84, 181, 91, 146, 61], w, h);
  const lipOuter: [number, number][] = [...upper, ...lower.slice(1, -1)];

  // Inner mouth opening — subtracted with even-odd so teeth are never painted
  const innerUpper = groupPx(lm, [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308], w, h);
  const innerLower = groupPx(lm, [308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78], w, h);
  const mouthHole: [number, number][] = [...innerUpper, ...innerLower.slice(1, -1)];

  function drawLip(oc: OffscreenCanvasRenderingContext2D) {
    smoothPath(oc, lipOuter);
    smoothPath(oc, mouthHole);   // punch hole
    oc.fillStyle = color;
    oc.fill('evenodd');
  }

  // Pass 1 — soft base
  composite(ctx, w, h, 4, 'multiply', opacity * 0.65, drawLip);
  // Pass 2 — sharp definition
  composite(ctx, w, h, 1.2, 'multiply', opacity * 0.45, drawLip);
  // Pass 3 — subtle gloss (screen)
  composite(ctx, w, h, 3, 'screen', opacity * 0.10, (oc) => {
    const cx = lipOuter.reduce((s, p) => s + p[0], 0) / lipOuter.length;
    const cy = lipOuter.reduce((s, p) => s + p[1], 0) / lipOuter.length;
    const g = oc.createRadialGradient(cx, cy - 2, 0, cx, cy, 16);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    smoothPath(oc, lipOuter);
    smoothPath(oc, mouthHole);
    oc.fillStyle = g;
    oc.fill('evenodd');
  });
}

function renderBlush(ctx: CanvasRenderingContext2D, lm: NormalizedLandmarkList, w: number, h: number, color: string, opacity: number) {
  const faceW = Math.abs(lm[454].x - lm[234].x) * w;
  // Smaller, more natural blush radius
  const rx = faceW * 0.09, ry = faceW * 0.065;

  for (const indices of [LANDMARK_GROUPS.leftCheek, LANDMARK_GROUPS.rightCheek]) {
    const pts = groupPx(lm, indices, w, h);
    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
    const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;

    // Outer soft glow
    composite(ctx, w, h, 12, 'multiply', opacity * 0.45, (oc) => {
      oc.save();
      oc.translate(cx, cy);
      oc.scale(rx * 1.4, ry * 1.4);
      const g = oc.createRadialGradient(0, 0, 0, 0, 0, 1);
      g.addColorStop(0, color + 'aa');
      g.addColorStop(0.6, color + '44');
      g.addColorStop(1, color + '00');
      oc.beginPath(); oc.arc(0, 0, 1, 0, Math.PI * 2);
      oc.fillStyle = g; oc.fill();
      oc.restore();
    });

    // Inner concentration
    composite(ctx, w, h, 6, 'multiply', opacity * 0.35, (oc) => {
      oc.save();
      oc.translate(cx, cy);
      oc.scale(rx, ry);
      const g = oc.createRadialGradient(0, 0, 0, 0, 0, 1);
      g.addColorStop(0, color + 'dd');
      g.addColorStop(1, color + '00');
      oc.beginPath(); oc.arc(0, 0, 1, 0, Math.PI * 2);
      oc.fillStyle = g; oc.fill();
      oc.restore();
    });
  }
}

function renderFoundation(ctx: CanvasRenderingContext2D, lm: NormalizedLandmarkList, w: number, h: number, color: string, opacity: number) {
  const oval     = groupPx(lm, LANDMARK_GROUPS.faceOval, w, h);
  const leftEye  = groupPx(lm, LANDMARK_GROUPS.leftEye, w, h);
  const rightEye = groupPx(lm, LANDMARK_GROUPS.rightEye, w, h);
  const lips: [number, number][] = [
    ...groupPx(lm, LANDMARK_GROUPS.lipsOuterUpper, w, h),
    ...groupPx(lm, LANDMARK_GROUPS.lipsOuterLower, w, h).slice(1, -1),
  ];

  composite(ctx, w, h, 10, 'source-over', opacity * 0.28, (oc) => {
    smoothPath(oc, oval);
    smoothPath(oc, leftEye);
    smoothPath(oc, rightEye);
    smoothPath(oc, lips);
    oc.fillStyle = color;
    oc.fill('evenodd');
  });
}

function renderContour(ctx: CanvasRenderingContext2D, lm: NormalizedLandmarkList, w: number, h: number, color: string, opacity: number) {
  const faceW = Math.abs(lm[454].x - lm[234].x) * w;

  for (const indices of [LANDMARK_GROUPS.leftContour, LANDMARK_GROUPS.rightContour]) {
    composite(ctx, w, h, 16, 'multiply', opacity * 0.45, (oc) => {
      const pts = groupPx(lm, indices, w, h);
      smoothPath(oc, pts);
      oc.fillStyle = color;
      oc.fill();
    });
  }

  // Nose sides
  const noseSize = faceW * 0.032;
  for (const idx of [48, 278]) {
    const nx = lm[idx].x * w, ny = lm[idx].y * h;
    composite(ctx, w, h, 5, 'multiply', opacity * 0.3, (oc) => {
      oc.save();
      oc.translate(nx, ny);
      oc.scale(noseSize, noseSize * 2);
      const g = oc.createRadialGradient(0, 0, 0, 0, 0, 1);
      g.addColorStop(0, color + 'bb');
      g.addColorStop(1, color + '00');
      oc.beginPath(); oc.arc(0, 0, 1, 0, Math.PI * 2);
      oc.fillStyle = g; oc.fill();
      oc.restore();
    });
  }
}

function renderBrows(ctx: CanvasRenderingContext2D, lm: NormalizedLandmarkList, w: number, h: number, color: string, opacity: number) {
  const faceW = Math.abs(lm[454].x - lm[234].x) * w;
  const thick = faceW * 0.018;

  for (const indices of [LANDMARK_GROUPS.leftBrow, LANDMARK_GROUPS.rightBrow]) {
    const pts = groupPx(lm, indices, w, h);
    const poly: [number, number][] = [
      ...pts.map(([x, y]) => [x, y - thick] as [number, number]),
      ...[...pts].reverse().map(([x, y]) => [x, y + thick * 0.5] as [number, number]),
    ];
    composite(ctx, w, h, 3, 'multiply', opacity * 0.55, (oc) => {
      smoothPath(oc, poly); oc.fillStyle = color; oc.fill();
    });
    composite(ctx, w, h, 1, 'multiply', opacity * 0.35, (oc) => {
      smoothPath(oc, poly); oc.fillStyle = color; oc.fill();
    });
  }
}

// ── Live canvas component ────────────────────────────────────────────────────

function LiveCanvas({ videoRef, faceLandmarkerRef, faceMeshReady, colorRef, productRef }: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  faceLandmarkerRef: React.MutableRefObject<FaceLandmarker | null>;
  faceMeshReady: boolean;
  colorRef: React.MutableRefObject<string>;
  productRef: React.MutableRefObject<string>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const tsRef     = useRef(0);

  const tick = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }
    const vw = video.videoWidth, vh = video.videoHeight;
    if (!vw) { rafRef.current = requestAnimationFrame(tick); return; }

    if (canvas.width !== vw)  canvas.width  = vw;
    if (canvas.height !== vh) canvas.height = vh;

    const ctx = canvas.getContext('2d')!;

    // Draw video (unmirrored internally — CSS handles selfie flip)
    ctx.drawImage(video, 0, 0, vw, vh);

    // Detect face
    const fl = faceLandmarkerRef.current;
    if (fl && faceMeshReady) {
      const now = performance.now();
      const ts  = now > tsRef.current ? now : tsRef.current + 1;
      tsRef.current = ts;
      try {
        const res = fl.detectForVideo(video, ts);
        const lm  = res.faceLandmarks[0] as NormalizedLandmarkList | undefined;
        if (lm) {
          const color   = colorRef.current;
          const product = productRef.current;
          const opacity = PRODUCT_CONFIG[product as keyof typeof PRODUCT_CONFIG]?.defaultOpacity ?? 0.8;

          if (product === 'batom')   renderLipstick(ctx, lm, vw, vh, color, opacity);
          if (product === 'blush')   renderBlush(ctx, lm, vw, vh, color, opacity);
          if (product === 'base')    renderFoundation(ctx, lm, vw, vh, color, opacity);
          if (product === 'contour') renderContour(ctx, lm, vw, vh, color, opacity);
          if (product === 'brows')   renderBrows(ctx, lm, vw, vh, color, opacity);
        }
      } catch { /* ignore single-frame errors */ }
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [videoRef, faceLandmarkerRef, faceMeshReady, colorRef, productRef]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full object-cover"
      // Mirror for selfie view — internally unmirrored so landmarks align
      style={{ transform: 'scaleX(-1)' }}
    />
  );
}

// ── StudioStep ───────────────────────────────────────────────────────────────

export function StudioStep({ videoRef, faceLandmarkerRef, faceMeshReady }: Props) {
  const { product, selectedColor, setSelectedColor, reset } = useARStore();
  const info = PRODUCT_CONFIG[product];

  // Refs so RAF loop always reads latest values without recreating the loop
  const colorRef   = useRef(selectedColor);
  const productRef = useRef(product);
  useEffect(() => { colorRef.current = selectedColor; }, [selectedColor]);
  useEffect(() => { productRef.current = product; }, [product]);

  return (
    <motion.div
      className="relative w-full h-full flex flex-col overflow-hidden bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* ── Live makeup canvas ── */}
      <div className="relative flex-1 min-h-0">
        <LiveCanvas
          videoRef={videoRef}
          faceLandmarkerRef={faceLandmarkerRef}
          faceMeshReady={faceMeshReady}
          colorRef={colorRef}
          productRef={productRef}
        />

        {/* Top bar */}
        <div className="absolute top-0 inset-x-0 flex items-center justify-between px-4 pt-10 pb-4 bg-gradient-to-b from-black/60 to-transparent">
          <button
            onClick={reset}
            className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>

          <div className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/20">
            <span className="text-white/80 text-xs font-medium">{info.label} · AO VIVO</span>
          </div>

          {/* Share */}
          <div className="w-9 h-9" />
        </div>

        {/* AI loading indicator */}
        {!faceMeshReady && (
          <div className="absolute bottom-4 inset-x-0 flex justify-center">
            <div className="px-4 py-2 rounded-full bg-black/70 backdrop-blur-sm flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              <p className="text-white/60 text-xs">Carregando IA...</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Color palette panel ── */}
      <div className="flex-shrink-0 bg-zinc-950 border-t border-white/8 px-4 pt-4 pb-8">
        {/* Product + active color */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white font-semibold text-sm">{info.label}</p>
            <p className="text-white/40 text-xs">{info.description}</p>
          </div>
          <div
            className="w-8 h-8 rounded-full ring-2 ring-white/30 shadow-lg"
            style={{ background: selectedColor }}
          />
        </div>

        {/* Swatches — horizontal scroll */}
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
          {info.swatches.map((swatch) => {
            const active = selectedColor === swatch.hex;
            return (
              <button
                key={swatch.hex}
                onClick={() => setSelectedColor(swatch.hex)}
                className="flex-shrink-0 flex flex-col items-center gap-1.5"
              >
                <div
                  className={`w-12 h-12 rounded-full transition-all duration-200 ${
                    active
                      ? 'ring-[3px] ring-white ring-offset-[3px] ring-offset-zinc-950 scale-110'
                      : 'ring-1 ring-white/20 hover:scale-105'
                  }`}
                  style={{ background: swatch.hex }}
                />
                <span className="text-[10px] text-white/40 w-12 text-center leading-tight">
                  {swatch.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* CTA */}
        <button className="w-full mt-4 py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-400 transition-colors text-white font-semibold text-sm">
          Adicionar ao carrinho
        </button>
      </div>
    </motion.div>
  );
}
