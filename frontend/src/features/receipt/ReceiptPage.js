import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useOrderStore, STEPS, STEP_LABELS } from '@/store/useOrderStore';
import { createOrder } from '@/lib/orders';
export function ReceiptPage() {
    const navigate = useNavigate();
    const { clientName, selections, setOrder, reset } = useOrderStore();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingError, setLoadingError] = useState(null);
    // Guard: redirect if nothing selected
    useEffect(() => {
        const hasSelections = Object.keys(selections).length > 0;
        if (!clientName || !hasSelections) {
            navigate('/selecao', { replace: true });
        }
    }, [clientName, selections, navigate]);
    const handleEnterQueue = async () => {
        setIsLoading(true);
        setLoadingError(null);
        try {
            const { orderId, queuePosition } = await createOrder(clientName, selections);
            setOrder(orderId, queuePosition);
            navigate(`/fila/${orderId}`);
        }
        catch (err) {
            console.error('Failed to create order:', err);
            setLoadingError('Erro ao entrar na fila. Tente novamente.');
            setIsLoading(false);
        }
    };
    const filledSteps = STEPS.filter((step) => selections[step]);
    return (_jsxs("div", { className: "min-h-dvh bg-[#080910] flex flex-col", children: [_jsx("div", { className: "h-14 flex items-center px-6 border-b border-white/5 flex-shrink-0", children: _jsxs("button", { onClick: () => navigate('/selecao'), className: "text-white/40 hover:text-white/70 transition-colors flex items-center gap-2 text-sm", children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }), "Voltar"] }) }), _jsx("div", { className: "flex-1 flex items-center justify-center p-6", children: _jsx("div", { className: "w-full max-w-md", children: _jsxs(motion.div, { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 }, children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "w-16 h-16 rounded-full bg-[#E8809A]/20 border border-[#E8809A]/30 flex items-center justify-center mx-auto mb-4", children: _jsx("span", { className: "text-2xl", children: "\uD83D\uDC84" }) }), _jsx("h1", { className: "text-2xl font-bold text-white mb-1", children: "Seu Look Completo" }), _jsxs("p", { className: "text-white/50 text-sm", children: ["Ol\u00E1, ", _jsx("span", { className: "text-[#E8809A] font-medium", children: clientName }), "! Confira suas escolhas."] })] }), _jsx("div", { className: "bg-[#161829] border border-white/8 rounded-2xl overflow-hidden mb-6", children: filledSteps.map((step, idx) => {
                                    const sel = selections[step];
                                    if (!sel)
                                        return null;
                                    return (_jsxs(motion.div, { initial: { opacity: 0, x: -12 }, animate: { opacity: 1, x: 0 }, transition: { delay: idx * 0.07 }, className: `flex items-center gap-4 px-5 py-4 ${idx < filledSteps.length - 1 ? 'border-b border-white/5' : ''}`, children: [_jsx("div", { className: "w-16 flex-shrink-0", children: _jsx("span", { className: "text-xs font-semibold text-[#E8809A]/70 uppercase tracking-wider", children: STEP_LABELS[step] }) }), _jsx("div", { className: "w-9 h-9 rounded-full flex-shrink-0 shadow-sm ring-1 ring-white/15", style: { backgroundColor: sel.colorHex } }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: "text-sm font-medium text-white truncate", children: sel.productName }), _jsx("div", { className: "text-xs text-white/40 mt-0.5", children: sel.colorName })] })] }, step));
                                }) }), loadingError && (_jsx("div", { className: "mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400", children: loadingError })), _jsx(motion.button, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3 }, onClick: handleEnterQueue, disabled: isLoading, className: "w-full py-4 rounded-2xl font-bold text-white text-lg transition-all\n                bg-[#E8809A] hover:bg-[#E8809A]/90 active:scale-98 disabled:opacity-60\n                shadow-xl shadow-[#E8809A]/25", children: isLoading ? (_jsxs("span", { className: "flex items-center justify-center gap-2", children: [_jsx("span", { className: "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" }), "Entrando na fila\u2026"] })) : ('Entrar na Fila') }), _jsx("button", { onClick: () => { reset(); navigate('/selecao'); }, className: "w-full mt-3 py-3 text-sm text-white/30 hover:text-white/50 transition-colors", children: "Recome\u00E7ar sele\u00E7\u00E3o" })] }) }) })] }));
}
