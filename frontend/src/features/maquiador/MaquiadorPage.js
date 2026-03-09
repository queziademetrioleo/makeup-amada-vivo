import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeToQueue, startOrder, completeOrder } from '@/lib/orders';
import { STEPS, STEP_LABELS } from '@/store/useOrderStore';
function StatusBadge({ status }) {
    if (status === 'em-atendimento') {
        return (_jsxs("span", { className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E8809A]/20 text-[#E8809A] border border-[#E8809A]/30", children: [_jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-[#E8809A] animate-pulse" }), "Em atendimento"] }));
    }
    return (_jsxs("span", { className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/5 text-white/50 border border-white/10", children: [_jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-white/30" }), "Aguardando"] }));
}
function OrderCard({ order, onStart, onComplete }) {
    const [expanded, setExpanded] = useState(false);
    const [acting, setActing] = useState(false);
    const isActive = order.status === 'em-atendimento';
    const handleStart = async (e) => {
        e.stopPropagation();
        setActing(true);
        try {
            await onStart();
        }
        finally {
            setActing(false);
        }
    };
    const handleComplete = async (e) => {
        e.stopPropagation();
        setActing(true);
        try {
            await onComplete();
        }
        finally {
            setActing(false);
        }
    };
    return (_jsxs(motion.div, { layout: true, initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -12 }, className: `rounded-2xl border overflow-hidden transition-all
        ${isActive
            ? 'bg-[#E8809A]/8 border-[#E8809A]/30'
            : 'bg-[#161829] border-white/8'}`, children: [_jsxs("button", { onClick: () => setExpanded((v) => !v), className: "w-full flex items-center gap-4 px-5 py-4 text-left", children: [_jsx("div", { className: `w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0
            ${isActive ? 'bg-[#E8809A]/20 text-[#E8809A]' : 'bg-white/5 text-white/50'}`, children: order.queuePosition }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: "font-semibold text-white text-base", children: order.clientName }), _jsxs("div", { className: "flex items-center gap-2 mt-1 flex-wrap", children: [_jsx(StatusBadge, { status: order.status }), _jsx("div", { className: "flex -space-x-1", children: STEPS.map((step) => {
                                            const sel = order.selections[step];
                                            if (!sel)
                                                return null;
                                            return (_jsx("div", { className: "w-4 h-4 rounded-full ring-1 ring-[#161829]", style: { backgroundColor: sel.colorHex }, title: `${STEP_LABELS[step]}: ${sel.colorName}` }, step));
                                        }) })] })] }), _jsx("svg", { className: `w-4 h-4 text-white/30 transition-transform flex-shrink-0 ${expanded ? 'rotate-180' : ''}`, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" }) })] }), _jsx(AnimatePresence, { children: expanded && (_jsxs(motion.div, { initial: { height: 0, opacity: 0 }, animate: { height: 'auto', opacity: 1 }, exit: { height: 0, opacity: 0 }, transition: { duration: 0.2 }, className: "overflow-hidden", children: [_jsx("div", { className: "border-t border-white/5 mx-5" }), _jsx("div", { className: "px-5 py-3 space-y-2", children: STEPS.map((step) => {
                                const sel = order.selections[step];
                                if (!sel)
                                    return null;
                                return (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-7 h-7 rounded-full flex-shrink-0 ring-1 ring-white/15", style: { backgroundColor: sel.colorHex } }), _jsxs("div", { children: [_jsx("span", { className: "text-xs font-semibold text-[#E8809A]/60 uppercase tracking-wider mr-2", children: STEP_LABELS[step] }), _jsx("span", { className: "text-sm text-white/80", children: sel.productName }), _jsxs("span", { className: "text-xs text-white/40 ml-1", children: ["\u00B7 ", sel.colorName] })] })] }, step));
                            }) })] })) }), _jsxs("div", { className: "px-5 pb-4 pt-1", children: [order.status === 'aguardando' && (_jsx("button", { onClick: handleStart, disabled: acting, className: "w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all\n              bg-white/8 hover:bg-white/14 border border-white/10 disabled:opacity-50", children: acting ? 'Iniciando…' : 'Iniciar Atendimento' })), order.status === 'em-atendimento' && (_jsx("button", { onClick: handleComplete, disabled: acting, className: "w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all\n              bg-[#E8809A] hover:bg-[#E8809A]/90 disabled:opacity-50\n              shadow-lg shadow-[#E8809A]/20", children: acting ? 'Finalizando…' : 'Finalizar Atendimento' }))] })] }));
}
export function MaquiadorPage() {
    const [orders, setOrders] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    useEffect(() => {
        const unsub = subscribeToQueue((newOrders) => {
            setOrders(newOrders);
            setIsLoaded(true);
        });
        return unsub;
    }, []);
    const activeOrders = orders.filter((o) => o.status === 'em-atendimento');
    const waitingOrders = orders.filter((o) => o.status === 'aguardando');
    return (_jsxs("div", { className: "min-h-dvh bg-[#080910]", children: [_jsx("header", { className: "sticky top-0 z-10 bg-[#080910]/90 backdrop-blur-sm border-b border-white/5", children: _jsxs("div", { className: "max-w-2xl mx-auto px-6 h-14 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-7 h-7 rounded-full bg-gradient-to-br from-[#E8809A] to-[#17C3B2] flex items-center justify-center", children: _jsx("span", { className: "text-white text-xs font-bold", children: "M" }) }), _jsx("h1", { className: "font-semibold text-white", children: "Painel do Maquiador" })] }), _jsxs("div", { className: "flex items-center gap-2 text-xs text-white/40", children: [_jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" }), "Ao vivo"] })] }) }), _jsxs("main", { className: "max-w-2xl mx-auto px-6 py-6 space-y-6", children: [_jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { className: "bg-[#161829] border border-white/8 rounded-xl px-4 py-3", children: [_jsx("div", { className: "text-2xl font-bold text-[#E8809A]", children: waitingOrders.length }), _jsx("div", { className: "text-xs text-white/40 mt-0.5", children: "Aguardando" })] }), _jsxs("div", { className: "bg-[#161829] border border-white/8 rounded-xl px-4 py-3", children: [_jsx("div", { className: "text-2xl font-bold text-white", children: activeOrders.length }), _jsx("div", { className: "text-xs text-white/40 mt-0.5", children: "Em atendimento" })] })] }), activeOrders.length > 0 && (_jsxs("section", { children: [_jsx("h2", { className: "text-xs font-semibold text-[#E8809A]/70 uppercase tracking-widest mb-3", children: "Em atendimento" }), _jsx("div", { className: "space-y-3", children: _jsx(AnimatePresence, { children: activeOrders.map((order) => (_jsx(OrderCard, { order: order, onStart: () => startOrder(order.id), onComplete: () => completeOrder(order.id) }, order.id))) }) })] })), _jsxs("section", { children: [_jsx("h2", { className: "text-xs font-semibold text-white/40 uppercase tracking-widest mb-3", children: "Fila de espera" }), !isLoaded && (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "w-8 h-8 border-2 border-[#E8809A]/30 border-t-[#E8809A] rounded-full animate-spin mx-auto mb-3" }), _jsx("p", { className: "text-white/40 text-sm", children: "Carregando fila\u2026" })] })), isLoaded && waitingOrders.length === 0 && activeOrders.length === 0 && (_jsxs("div", { className: "text-center py-16 bg-[#161829] border border-white/5 rounded-2xl", children: [_jsx("div", { className: "text-4xl mb-3", children: "\u2728" }), _jsx("p", { className: "text-white/60 font-medium", children: "Nenhum cliente na fila" }), _jsx("p", { className: "text-white/30 text-sm mt-1", children: "Novos pedidos aparecer\u00E3o aqui em tempo real" })] })), isLoaded && waitingOrders.length > 0 && (_jsx("div", { className: "space-y-3", children: _jsx(AnimatePresence, { children: waitingOrders.map((order) => (_jsx(OrderCard, { order: order, onStart: () => startOrder(order.id), onComplete: () => completeOrder(order.id) }, order.id))) }) }))] })] })] }));
}
