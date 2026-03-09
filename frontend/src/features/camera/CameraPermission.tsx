import { motion } from 'framer-motion';

interface CameraPermissionProps {
  status: 'idle' | 'requesting' | 'error';
  error: string | null;
  onStart: () => void;
}

export function CameraPermission({ status, error, onStart }: CameraPermissionProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center gap-8 text-center p-8 h-full"
    >
      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-blush/10 border border-blush/20 flex items-center justify-center">
        <svg className="w-9 h-9 text-blush" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.259a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
          />
        </svg>
      </div>

      <div className="space-y-3 max-w-sm">
        {error ? (
          <>
            <h3 className="font-semibold text-white text-lg">Câmera inacessível</h3>
            <p className="text-white/40 text-sm leading-relaxed">{error}</p>
          </>
        ) : (
          <>
            <h3 className="font-semibold text-white text-lg">Precisamos da sua câmera</h3>
            <p className="text-white/40 text-sm leading-relaxed">
              Para aplicar maquiagem virtual em tempo real, precisamos acessar sua câmera.
              O vídeo nunca é enviado para nossos servidores.
            </p>
          </>
        )}
      </div>

      <button
        onClick={onStart}
        disabled={status === 'requesting'}
        className="btn-primary px-8 py-3 flex items-center gap-2"
      >
        {status === 'requesting' ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Aguardando permissão…
          </>
        ) : error ? (
          'Tentar novamente'
        ) : (
          'Ativar câmera'
        )}
      </button>
    </motion.div>
  );
}
