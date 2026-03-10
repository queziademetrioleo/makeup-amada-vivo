import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import type { MakeupConfig } from '@/types/makeup';
import { WebGLMakeupRenderer } from '@/utils/webgl/WebGLMakeupRenderer';
import { generateMasks } from '@/utils/webgl/MaskGenerator';
import { CATALOG, type CatalogProduct } from '@/data/catalog';
import { useRecommendationStore } from '@/store/useRecommendationStore';

type Category = 'batom' | 'base' | 'blush';

export function MirrorPage() {
    const navigate = useNavigate();
    const {
        recommendations,
        analysis,
        resumo,
        activeBase,
        activeBatom,
        activeBlush,
        setActiveBase,
        setActiveBatom,
        setActiveBlush,
    } = useRecommendationStore();

    // Redirect if no recommendations
    useEffect(() => {
        if (!recommendations) navigate('/', { replace: true });
    }, [recommendations, navigate]);

    const videoRef = useRef<HTMLVideoElement>(null);
    const glCanvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef<WebGLMakeupRenderer | null>(null);
    const landmarkerRef = useRef<FaceLandmarker | null>(null);
    const rafRef = useRef<number>(0);

    const [ready, setReady] = useState(false);
    const [activeCategory, setActiveCategory] = useState<Category>('batom');

    // ── Build MakeupConfig from active products ────────────────────────────
    const buildConfig = useCallback((): MakeupConfig => {
        return {
            lipstick: {
                enabled: !!activeBatom,
                color: activeBatom?.hex ?? '#C44040',
                opacity: 0.75,
                glossy: false,
            },
            foundation: {
                enabled: !!activeBase,
                color: activeBase?.hex ?? '#D4A574',
                opacity: 0.60,
            },
            blush: {
                enabled: !!activeBlush,
                color: activeBlush?.hex ?? '#E0788A',
                opacity: 0.65,
            },
            contour: { enabled: false, color: '#8B6540', opacity: 0 },
            brows: { enabled: false, color: '#4A3728', opacity: 0 },
            concealer: { enabled: false, color: '#E8C9A8', opacity: 0 },
            skinSmooth: { enabled: false, intensity: 0 },
        };
    }, [activeBase, activeBatom, activeBlush]);

    // ── Init camera + face landmarker ──────────────────────────────────────
    useEffect(() => {
        let cancelled = false;

        async function init() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
                });
                if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }

                const vision = await FilesetResolver.forVisionTasks(
                    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
                );
                if (cancelled) return;
                const landmarker = await FaceLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
                        delegate: 'GPU',
                    },
                    runningMode: 'VIDEO',
                    numFaces: 1,
                    minFaceDetectionConfidence: 0.5,
                });
                if (cancelled) return;
                landmarkerRef.current = landmarker;
                setReady(true);
            } catch (err) {
                console.error('Mirror init error:', err);
            }
        }

        init();
        return () => {
            cancelled = true;
            cancelAnimationFrame(rafRef.current);
            videoRef.current?.srcObject &&
                (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
            landmarkerRef.current?.close();

        };
    }, []);

    // ── Render loop ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!ready) return;

        function renderFrame() {
            const video = videoRef.current;
            const canvas = glCanvasRef.current;
            const landmarker = landmarkerRef.current;
            if (!video || !canvas || !landmarker || video.readyState < 2) {
                rafRef.current = requestAnimationFrame(renderFrame);
                return;
            }

            const vw = video.videoWidth;
            const vh = video.videoHeight;
            if (canvas.width !== vw || canvas.height !== vh) {
                canvas.width = vw;
                canvas.height = vh;
            }

            // Get renderer
            if (!rendererRef.current) {
                try {
                    rendererRef.current = new WebGLMakeupRenderer(canvas);
                } catch (e) {
                    console.error('WebGL init failed:', e);
                    rafRef.current = requestAnimationFrame(renderFrame);
                    return;
                }
            }
            const renderer = rendererRef.current;

            // Detect face
            const result = landmarker.detectForVideo(video, performance.now());
            const landmarks = result.faceLandmarks?.[0];
            const config = buildConfig();

            if (landmarks) {
                const masks = generateMasks(landmarks, vw, vh);
                renderer.render(
                    video,
                    masks.lipCanvas,
                    masks.browCanvas,
                    masks.auxCanvas,
                    config,
                    masks.blushLUV,
                    masks.blushRUV,
                    masks.blushRad,
                );
            } else {
                // No face — show plain video
                const empty = new OffscreenCanvas(vw, vh);
                const noMakeup = Object.fromEntries(
                    Object.entries(config).map(([k, v]) =>
                        [k, typeof v === 'object' && 'enabled' in v ? { ...v, enabled: false } : v],
                    ),
                ) as MakeupConfig;
                renderer.render(video, empty, empty, empty, noMakeup, [0.3, 0.6], [0.7, 0.6], 0.1);
            }

            rafRef.current = requestAnimationFrame(renderFrame);
        }

        rafRef.current = requestAnimationFrame(renderFrame);
        return () => cancelAnimationFrame(rafRef.current);
    }, [ready, buildConfig]);

    // ── Product lists per category ─────────────────────────────────────────
    const categoryProducts: Record<Category, CatalogProduct[]> = {
        batom: CATALOG.batons,
        base: CATALOG.bases,
        blush: CATALOG.blushes,
    };

    const activeProduct: Record<Category, CatalogProduct | null> = {
        batom: activeBatom,
        base: activeBase,
        blush: activeBlush,
    };

    const setActiveProduct: Record<Category, (p: CatalogProduct) => void> = {
        batom: setActiveBatom,
        base: setActiveBase,
        blush: setActiveBlush,
    };

    if (!recommendations) return null;

    return (
        <div className="fixed inset-0 bg-black flex flex-col">
            {/* Video + WebGL canvas */}
            <div className="relative flex-1 overflow-hidden">
                <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover"
                    playsInline
                    muted
                    style={{ transform: 'scaleX(-1)' }}
                />
                <canvas
                    ref={glCanvasRef}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }}
                />

                {/* Top info bar */}
                <div className="absolute top-0 left-0 right-0 p-4 pt-10 flex justify-center z-10">
                    <div
                        className="px-5 py-2 rounded-full backdrop-blur-md flex items-center gap-3"
                        style={{ background: 'rgba(0,0,0,0.5)' }}
                    >
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <p className="text-white/80 text-xs font-medium">
                            Pele: {analysis?.tom} • Subtom: {analysis?.subtom}
                        </p>
                    </div>
                </div>

                {/* Resumo da IA */}
                {resumo && (
                    <div className="absolute top-20 left-0 right-0 px-4 flex justify-center z-10">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            className="bg-black/60 backdrop-blur-md px-5 py-3 rounded-2xl max-w-sm text-center shadow-lg border border-white/10"
                        >
                            <p className="text-white/90 text-sm leading-relaxed whitespace-pre-line">
                                ✨ {resumo}
                            </p>
                        </motion.div>
                    </div>
                )}

                {/* Loading overlay */}
                {!ready && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-4 z-20">
                        <div className="w-12 h-12 rounded-full border-4 border-pink-500 border-t-transparent animate-spin" />
                        <p className="text-white text-sm">Iniciando espelho virtual...</p>
                    </div>
                )}
            </div>

            {/* Bottom product bar */}
            <div
                className="flex-shrink-0 pb-8"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 100%)' }}
            >
                {/* Category tabs */}
                <div className="flex justify-center gap-1 px-4 py-3">
                    {(['batom', 'base', 'blush'] as Category[]).map((cat) => {
                        const isAI = activeProduct[cat]?.id ===
                            (cat === 'batom' ? recommendations.batom.id
                                : cat === 'base' ? recommendations.base.id
                                    : recommendations.blush.id);

                        return (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className="px-5 py-2 rounded-full text-sm font-medium transition-all"
                                style={{
                                    background: activeCategory === cat
                                        ? 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)'
                                        : 'rgba(255,255,255,0.08)',
                                    color: activeCategory === cat ? '#fff' : 'rgba(255,255,255,0.5)',
                                }}
                            >
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                {isAI && ' ✨'}
                            </button>
                        );
                    })}
                </div>

                {/* Product swatches */}
                <div className="flex gap-3 px-6 py-2 overflow-x-auto">
                    {categoryProducts[activeCategory].map((product) => {
                        const isActive = activeProduct[activeCategory]?.id === product.id;
                        const isRecommended = product.id ===
                            (activeCategory === 'batom' ? recommendations.batom.id
                                : activeCategory === 'base' ? recommendations.base.id
                                    : recommendations.blush.id);

                        return (
                            <motion.button
                                key={product.id}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setActiveProduct[activeCategory](product)}
                                className="flex flex-col items-center gap-1.5 flex-shrink-0"
                            >
                                <div
                                    className="w-14 h-14 rounded-full transition-all relative"
                                    style={{
                                        background: product.hex,
                                        boxShadow: isActive
                                            ? `0 0 0 3px #fff, 0 0 20px ${product.hex}80`
                                            : '0 0 0 1px rgba(255,255,255,0.15)',
                                        transform: isActive ? 'scale(1.15)' : 'scale(1)',
                                    }}
                                >
                                    {isRecommended && (
                                        <div
                                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                                            style={{ background: 'linear-gradient(135deg, #EC4899, #8B5CF6)' }}
                                        >
                                            ✨
                                        </div>
                                    )}
                                </div>
                                <span className="text-[10px] text-white/60 max-w-16 text-center leading-tight truncate">
                                    {product.nome}
                                </span>
                            </motion.button>
                        );
                    })}
                </div>

                <div className="px-6 pt-2 pb-4">
                    <button
                        onClick={() => navigate('/recibo')}
                        className="w-full py-4 rounded-full text-white font-semibold text-lg"
                        style={{ background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)', boxShadow: '0 0 20px rgba(236,72,153,0.3)' }}
                    >
                        Concluir e Ver Recibo
                    </button>
                </div>
            </div>
        </div>
    );
}
