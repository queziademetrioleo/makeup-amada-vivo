import { motion } from 'framer-motion';

/** Overlay badge shown when camera is active */
export function LiveBadge() {
  return (
    <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
      <span className="text-white text-xs font-medium">AO VIVO</span>
    </div>
  );
}

/** Spinner shown while FaceMesh initialises */
export function FaceMeshLoadingOverlay({ isReady }: { isReady: boolean }) {
  if (isReady) return null;
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 backdrop-blur-sm rounded-2xl"
    >
      <div className="w-8 h-8 border-2 border-blush/30 border-t-blush rounded-full animate-spin" />
      <p className="text-white/60 text-sm">Carregando IA facial…</p>
    </motion.div>
  );
}

/** Indicator when no face is detected */
export function NoFaceIndicator() {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5">
      <p className="text-white/50 text-xs">Posicione seu rosto no centro</p>
    </div>
  );
}
