import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsx("section", { className: "py-24 px-6", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "text-center mb-16 space-y-4", children: [_jsx("p", { className: "text-blush text-sm font-medium tracking-widest uppercase", children: "Por que nos escolher" }), _jsxs("h2", { className: "text-4xl lg:text-5xl font-light", children: ["Tecnologia que ", _jsx("span", { className: "gradient-text font-semibold", children: "encanta" })] })] }), _jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-6", children: BENEFITS.map((b, i) => (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay: i * 0.08, duration: 0.5 }, className: "card p-6 hover:border-blush/30 transition-colors group", children: [_jsx("div", { className: "text-3xl mb-4", children: b.icon }), _jsx("h3", { className: "font-semibold text-white mb-2 group-hover:text-blush-light transition-colors", children: b.title }), _jsx("p", { className: "text-white/40 text-sm leading-relaxed", children: b.description })] }, b.title))) })] }) }));
}
