import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { ProductType } from '@/features/ar-flow/productConfig';

const CATALOG: {
  type: ProductType;
  name: string;
  subtitle: string;
  description: string;
  gradient: string;
  accent: string;
  swatchColors: string[];
}[] = [
  {
    type: 'batom',
    name: 'Batom',
    subtitle: 'Matte · Cremoso · Brilhante',
    description: 'Do nude ao vermelho intenso — encontre o tom perfeito para você.',
    gradient: 'from-rose-950 to-rose-900/50',
    accent: '#C02030',
    swatchColors: ['#8B1A4A', '#C02030', '#E06040', '#C09080'],
  },
  {
    type: 'blush',
    name: 'Blush',
    subtitle: 'Matte · Cintilante',
    description: 'Realce natural que ilumina e define as maçãs do rosto.',
    gradient: 'from-pink-950 to-pink-900/50',
    accent: '#E8A0A8',
    swatchColors: ['#E87060', '#E8A0A8', '#C46378', '#C89060'],
  },
  {
    type: 'base',
    name: 'Base',
    subtitle: 'Matte · Natural · Luminosa · HD',
    description: 'Cobertura uniforme para todos os tons de pele.',
    gradient: 'from-amber-950 to-amber-900/50',
    accent: '#E8C9B0',
    swatchColors: ['#F5E8D8', '#D4AF8C', '#A0704A', '#6B4020'],
  },
  {
    type: 'contour',
    name: 'Contorno',
    subtitle: 'Esculpe e Define',
    description: 'Realce os traços naturais com técnica profissional.',
    gradient: 'from-stone-950 to-stone-900/50',
    accent: '#9A7060',
    swatchColors: ['#9A7060', '#885040', '#7A5038', '#6B4020'],
  },
  {
    type: 'brows',
    name: 'Sobrancelha',
    subtitle: 'Preenche e Define',
    description: 'Moldura perfeita para realçar o olhar.',
    gradient: 'from-neutral-950 to-neutral-900/50',
    accent: '#5A3D2B',
    swatchColors: ['#C4A882', '#8A6558', '#5A3D2B', '#2A1A12'],
  },
];

export function CategoriesSection() {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 space-y-3">
          <p className="text-blush text-xs font-medium tracking-[0.2em] uppercase">
            Experimente em AR
          </p>
          <h2 className="text-3xl sm:text-4xl font-light leading-tight">
            Use a{' '}
            <span className="gradient-text font-semibold">realidade aumentada</span>
            <br />
            para testar qualquer produto
          </h2>
          <p className="text-white/40 text-sm max-w-md">
            Capture uma foto e experimente infinitas cores em tempo real — sem sair de casa.
          </p>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATALOG.map((cat, i) => (
            <motion.div
              key={cat.type}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${cat.gradient} border border-white/8 p-6 flex flex-col gap-4 cursor-pointer group hover:border-white/20 transition-all`}
              onClick={() => navigate(`/ar?product=${cat.type}`)}
            >
              {/* Color swatches row */}
              <div className="flex gap-2">
                {cat.swatchColors.map((c) => (
                  <div
                    key={c}
                    className="w-7 h-7 rounded-full ring-1 ring-white/20"
                    style={{ background: c }}
                  />
                ))}
              </div>

              {/* Text */}
              <div className="flex-1">
                <h3 className="font-semibold text-xl text-white mb-0.5 group-hover:text-rose-300 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-white/40 text-xs mb-2">{cat.subtitle}</p>
                <p className="text-white/50 text-sm leading-snug">{cat.description}</p>
              </div>

              {/* CTA */}
              <button
                className="flex items-center gap-2 text-sm font-semibold text-white/80 group-hover:text-white transition-colors"
                onClick={(e) => { e.stopPropagation(); navigate(`/ar?product=${cat.type}`); }}
              >
                Teste aqui
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>

              {/* AR badge */}
              <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-white/60 text-[10px] font-medium uppercase tracking-wider">
                AR
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
