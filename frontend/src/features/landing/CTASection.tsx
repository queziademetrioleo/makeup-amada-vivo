import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function CTASection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card p-12 relative overflow-hidden"
        >
          {/* Glow decorations */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-blush/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-gold/10 rounded-full blur-3xl" />

          <div className="relative space-y-6">
            <p className="text-blush text-sm font-medium tracking-widest uppercase">Pronto para começar?</p>
            <h2 className="text-4xl lg:text-5xl font-light leading-tight">
              Monte seu look e{' '}
              <span className="gradient-text font-semibold">entre na fila</span>
            </h2>
            <p className="text-white/40 text-lg">
              Escolha batom, base, corretivo e blush passo a passo. O maquiador recebe seu pedido na hora.
            </p>
            <Link to="/selecao">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="btn-primary text-base px-10 py-4 mt-2"
              >
                Montar meu look
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
