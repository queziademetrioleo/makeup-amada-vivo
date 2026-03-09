import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
export function Modal({ open, onClose, title, children }) {
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape')
            onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);
    return (_jsx(AnimatePresence, { children: open && (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "absolute inset-0 bg-black/70 backdrop-blur-sm", onClick: onClose }), _jsxs(motion.div, { initial: { opacity: 0, scale: 0.95, y: 12 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.95, y: 12 }, transition: { type: 'spring', stiffness: 300, damping: 28 }, className: "relative card w-full max-w-md p-6 z-10", children: [title && (_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h2", { className: "text-lg font-semibold", children: title }), _jsx("button", { onClick: onClose, className: "text-white/40 hover:text-white transition-colors text-xl leading-none", "aria-label": "Fechar", children: "\u00D7" })] })), children] })] })) }));
}
