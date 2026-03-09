import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const SHOWCASE_COLORS = ['#C02030', '#8B1A4A', '#E06040', '#C47B8A', '#D4AF8C', '#C09080'];

export function HeroSection() {
  return (
    <section className="relative min-h-dvh flex items-center pt-16 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-40 w-96 h-96 bg-blush/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center w-full py-24">
        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 bg-blush/10 border border-blush/20 rounded-full px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blush animate-pulse-slow" />
            <span className="text-blush text-xs font-medium tracking-wide">Maquiagem virtual em tempo real</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-light leading-[1.05] tracking-tight">
            Descubra seu{' '}
            <span className="gradient-text font-semibold">look perfeito</span>{' '}
            antes de comprar
          </h1>

          <p className="text-white/50 text-lg leading-relaxed max-w-lg">
            Experimente batons, blush, contorno e muito mais em tempo real —
            diretamente pela câmera do seu navegador. Sem baixar nada.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link to="/selecao">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="btn-primary text-base px-8 py-4"
              >
                Montar meu look
              </motion.button>
            </Link>
            <Link to="/tryon">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="btn-ghost text-base px-8 py-4"
              >
                Provador livre
              </motion.button>
            </Link>
          </div>

          {/* Color swatches row */}
          <div className="flex items-center gap-3">
            <span className="text-white/30 text-xs">Tonalidades em destaque</span>
            <div className="flex gap-1.5">
              {SHOWCASE_COLORS.map((hex) => (
                <div
                  key={hex}
                  className="w-5 h-5 rounded-full border border-white/10"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Visual mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative flex justify-center"
        >
          <div className="relative w-72 lg:w-96">
            {/* Phone frame */}
            <div className="w-full aspect-[9/19] rounded-[3rem] bg-panel border-2 border-white/10 overflow-hidden shadow-card relative">
              {/* Fake camera view */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#1a0d14] to-[#0a0810] flex items-center justify-center">
                <div className="w-full h-full bg-gradient-to-b from-[#2a1520]/50 to-[#0d0912]/80 flex flex-col items-center justify-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <svg className="w-10 h-10 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                    </svg>
                  </div>
                  <p className="text-white/20 text-xs text-center px-4">
                    Experimente clicando em<br/>"Abrir provador virtual"
                  </p>
                </div>
              </div>

              {/* Makeup overlay simulation */}
              <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-2 px-4">
                {SHOWCASE_COLORS.slice(0, 4).map((hex, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-white/20 cursor-pointer"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>

            {/* Floating badges */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -left-8 top-1/3 glass rounded-xl px-3 py-2 text-xs"
            >
              <span className="gradient-text font-semibold">+50 cores</span>
              <br />
              <span className="text-white/40">de batom</span>
            </motion.div>

            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity }}
              className="absolute -right-8 top-1/2 glass rounded-xl px-3 py-2 text-xs"
            >
              <span className="text-white/80">Sem download</span>
              <br />
              <span className="text-white/40">100% no browser</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
