import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PRESETS } from '@/data/presets';

export function PresetsSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <p className="text-blush text-sm font-medium tracking-widest uppercase">Looks prontos</p>
          <h2 className="text-4xl lg:text-5xl font-light">
            Um clique,{' '}
            <span className="gradient-text font-semibold">look completo</span>
          </h2>
          <p className="text-white/40 max-w-md mx-auto">
            Presets curados por maquiadoras. Experimente no provador virtual e descubra o seu favorito.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PRESETS.map((preset, i) => (
            <motion.div
              key={preset.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link to={`/tryon?preset=${preset.id}`}>
                <div className="card hover:border-blush/30 transition-all group cursor-pointer overflow-hidden">
                  {/* Color bar */}
                  <div
                    className="h-1.5 w-full"
                    style={{ background: `linear-gradient(90deg, ${preset.gradient[0]}, ${preset.gradient[1]})` }}
                  />

                  <div className="p-5 space-y-3">
                    {/* Swatch row */}
                    <div className="flex gap-2">
                      {Object.entries(preset.config).map(([key, cfg]) => (
                        'color' in cfg && cfg.enabled ? (
                          <div
                            key={key}
                            className="w-6 h-6 rounded-full border border-white/10"
                            style={{ backgroundColor: cfg.color }}
                            title={key}
                          />
                        ) : null
                      ))}
                    </div>

                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold group-hover:text-blush-light transition-colors">
                          {preset.name}
                        </h3>
                        <p className="text-white/40 text-sm mt-0.5">{preset.description}</p>
                      </div>
                      {preset.isPremium && (
                        <span className="text-xs bg-gold/10 border border-gold/30 text-gold px-2 py-0.5 rounded-full shrink-0">
                          Premium
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {preset.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-white/5 text-white/30 px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
