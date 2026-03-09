/**
 * Step 1 — Tela 4 do fluxo
 * Câmera já está aberta em background. Avisamos sobre iluminação.
 */
import { motion } from 'framer-motion';
import { useARStore } from '@/store/useARStore';
import { PRODUCT_CONFIG } from './productConfig';

interface Props {
  /** data URL preview from the live camera (drawn each frame by parent) */
  cameraPreviewRef: React.RefObject<HTMLCanvasElement | null>;
}

export function LightingStep({ cameraPreviewRef }: Props) {
  const { product, setStep } = useARStore();
  const info = PRODUCT_CONFIG[product];

  return (
    <motion.div
      className="relative w-full h-full flex flex-col overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Live camera preview (blurred) fills background */}
      <canvas
        ref={cameraPreviewRef}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'blur(8px) brightness(0.45)', transform: 'scaleX(-1) scale(1.05)' }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full px-6 pt-14 pb-10">
        {/* Top label */}
        <p className="text-white/50 text-xs uppercase tracking-[0.18em] mb-1">
          Experimente em AR
        </p>
        <h1 className="text-2xl font-bold text-white mb-8">{info.label}</h1>

        {/* Warning card */}
        <motion.div
          className="rounded-3xl bg-black/60 backdrop-blur-xl border border-white/10 p-6 space-y-5"
          initial={{ y: 32, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚠️</span>
            <h2 className="text-white font-semibold text-lg">Atenção</h2>
          </div>

          <p className="text-white/70 text-sm leading-relaxed">
            A iluminação interfere no resultado da análise.
          </p>

          <div className="space-y-3">
            {[
              { icon: '☀️', text: 'Deixe seu rosto de frente para uma fonte de luz natural.' },
              { icon: '📵', text: 'Evite contraluz — não fique de costas para a janela.' },
              { icon: '😐', text: 'Mantenha expressão neutra e olhe direto para a câmera.' },
            ].map((tip) => (
              <div key={tip.text} className="flex gap-3 items-start">
                <span className="text-lg leading-tight mt-0.5">{tip.icon}</span>
                <p className="text-white/60 text-sm leading-snug">{tip.text}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="flex-1" />

        {/* CTA buttons */}
        <motion.div
          className="space-y-3"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={() => setStep('capture')}
            className="w-full py-4 rounded-2xl bg-white text-black font-semibold text-base"
          >
            Continuar
          </button>
          <button
            onClick={() => setStep('capture')}
            className="w-full py-3 rounded-2xl bg-transparent text-white/50 text-sm"
          >
            Ver exemplos
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
