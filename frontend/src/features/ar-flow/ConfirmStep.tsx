/**
 * Step 3 — Tela 6 do fluxo
 * "Sua foto ficou assim" — confirma ou refaz. Não aplica maquiagem aqui.
 */
import { motion } from 'framer-motion';
import { useARStore } from '@/store/useARStore';

export function ConfirmStep() {
  const { capturedPhoto, retake, setStep } = useARStore();

  return (
    <motion.div
      className="w-full h-full flex flex-col bg-zinc-950"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Confirmação</p>
        <h2 className="text-white text-xl font-bold">Sua foto ficou assim:</h2>
      </div>

      {/* Photo */}
      <div className="flex-1 px-6 min-h-0">
        {capturedPhoto && (
          <motion.div
            className="w-full h-full max-h-[60vh] rounded-3xl overflow-hidden"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          >
            {/* Show mirrored (selfie orientation) */}
            <img
              src={capturedPhoto}
              alt="Foto capturada"
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
          </motion.div>
        )}
      </div>

      {/* Buttons */}
      <motion.div
        className="px-6 pt-6 pb-10 space-y-3"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <button
          onClick={() => setStep('studio')}
          className="w-full py-4 rounded-2xl bg-white text-black font-semibold text-base"
        >
          Experimente aqui
        </button>
        <button
          onClick={retake}
          className="w-full py-3.5 rounded-2xl border border-white/20 text-white/70 text-sm font-medium"
        >
          Fotografar novamente
        </button>
      </motion.div>
    </motion.div>
  );
}
