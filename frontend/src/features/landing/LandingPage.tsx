import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 60% 20%, #2D1B4E 0%, #1A0D2E 40%, #080910 100%)',
      }}
    >
      {/* Background glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #EC4899 0%, #8B5CF6 60%, transparent 100%)' }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-8 gap-6">
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-xs font-semibold tracking-[0.3em] uppercase text-white/50"
        >
          Convenção de Vendas 2026
        </motion.p>

        {/* Logo / Título — Playfair Display */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-7xl sm:text-8xl font-bold leading-none"
          style={{
            fontFamily: "'Playfair Display', serif",
            background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Amada<br />Vivo
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-white/60 text-base leading-relaxed max-w-xs"
        >
          Experimente a maquiagem virtual em tempo real
        </motion.p>

        {/* Ícone circular */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.35, type: 'spring', stiffness: 200 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => navigate('/selecao')}
          className="w-24 h-24 rounded-full flex items-center justify-center shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
            boxShadow: '0 0 40px rgba(236,72,153,0.5)',
            minWidth: 96,
            minHeight: 96,
          }}
        >
          <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
          </svg>
        </motion.button>

        {/* Botão principal — gradient pill */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/selecao')}
          className="btn-gradient w-full max-w-xs px-8 text-white font-semibold text-lg"
          style={{
            minHeight: 56,
            boxShadow: '0 8px 32px rgba(236,72,153,0.4)',
          }}
        >
          Toque para Começar
        </motion.button>

        {/* Rodapé */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-white/30 text-xs"
        >
          Nenhuma foto é armazenada • Experiência 100% privada
        </motion.p>
      </div>
    </div>
  );
}
