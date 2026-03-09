import { motion } from 'framer-motion';

const BENEFITS = [
  {
    icon: '⚡',
    title: 'Tempo real',
    description: 'Rastreamento facial com MediaPipe. 30fps sem delay perceptível.',
  },
  {
    icon: '🔒',
    title: 'Privacidade total',
    description: 'O vídeo nunca sai do seu dispositivo. Nenhum frame é enviado ao servidor.',
  },
  {
    icon: '🎨',
    title: 'Centenas de combinações',
    description: 'Batom, blush, contorno, base e sobrancelha com cores e intensidades personalizáveis.',
  },
  {
    icon: '📸',
    title: 'Salve seu look',
    description: 'Tire uma foto do resultado e salve em sua conta para comprar depois.',
  },
  {
    icon: '📱',
    title: 'Mobile & desktop',
    description: 'Interface adaptada para qualquer tela. Câmera frontal ou traseira.',
  },
  {
    icon: '✨',
    title: 'Presets prontos',
    description: 'Looks curados por maquiadoras profissionais, prontos para experimentar.',
  },
];

export function BenefitsSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <p className="text-blush text-sm font-medium tracking-widest uppercase">Por que nos escolher</p>
          <h2 className="text-4xl lg:text-5xl font-light">
            Tecnologia que <span className="gradient-text font-semibold">encanta</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="card p-6 hover:border-blush/30 transition-colors group"
            >
              <div className="text-3xl mb-4">{b.icon}</div>
              <h3 className="font-semibold text-white mb-2 group-hover:text-blush-light transition-colors">
                {b.title}
              </h3>
              <p className="text-white/40 text-sm leading-relaxed">{b.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
