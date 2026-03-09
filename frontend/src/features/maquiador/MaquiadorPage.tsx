import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeToQueue, startOrder, completeOrder } from '@/lib/orders';
import type { Order } from '@/lib/orders';
import { STEPS, STEP_LABELS } from '@/store/useOrderStore';

function StatusBadge({ status }: { status: Order['status'] }) {
  if (status === 'em-atendimento') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E8809A]/20 text-[#E8809A] border border-[#E8809A]/30">
        <span className="w-1.5 h-1.5 rounded-full bg-[#E8809A] animate-pulse" />
        Em atendimento
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/5 text-white/50 border border-white/10">
      <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
      Aguardando
    </span>
  );
}

interface OrderCardProps {
  order: Order;
  onStart: () => void;
  onComplete: () => void;
}

function OrderCard({ order, onStart, onComplete }: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [acting, setActing] = useState(false);
  const isActive = order.status === 'em-atendimento';

  const handleStart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setActing(true);
    try { await onStart(); } finally { setActing(false); }
  };

  const handleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setActing(true);
    try { await onComplete(); } finally { setActing(false); }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className={`rounded-2xl border overflow-hidden transition-all
        ${isActive
          ? 'bg-[#E8809A]/8 border-[#E8809A]/30'
          : 'bg-[#161829] border-white/8'
        }`}
    >
      {/* Card header — click to expand */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left"
      >
        {/* Position number */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0
            ${isActive ? 'bg-[#E8809A]/20 text-[#E8809A]' : 'bg-white/5 text-white/50'}`}
        >
          {order.queuePosition}
        </div>

        {/* Client info */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white text-base">{order.clientName}</div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <StatusBadge status={order.status} />
            {/* Color swatches preview */}
            <div className="flex -space-x-1">
              {STEPS.map((step) => {
                const sel = order.selections[step];
                if (!sel) return null;
                return (
                  <div
                    key={step}
                    className="w-4 h-4 rounded-full ring-1 ring-[#161829]"
                    style={{ backgroundColor: sel.colorHex }}
                    title={`${STEP_LABELS[step]}: ${sel.colorName}`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Expand chevron */}
        <svg
          className={`w-4 h-4 text-white/30 transition-transform flex-shrink-0 ${expanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded receipt */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/5 mx-5" />
            <div className="px-5 py-3 space-y-2">
              {STEPS.map((step) => {
                const sel = order.selections[step];
                if (!sel) return null;
                return (
                  <div key={step} className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-full flex-shrink-0 ring-1 ring-white/15"
                      style={{ backgroundColor: sel.colorHex }}
                    />
                    <div>
                      <span className="text-xs font-semibold text-[#E8809A]/60 uppercase tracking-wider mr-2">
                        {STEP_LABELS[step]}
                      </span>
                      <span className="text-sm text-white/80">{sel.productName}</span>
                      <span className="text-xs text-white/40 ml-1">· {sel.colorName}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action button */}
      <div className="px-5 pb-4 pt-1">
        {order.status === 'aguardando' && (
          <button
            onClick={handleStart}
            disabled={acting}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all
              bg-white/8 hover:bg-white/14 border border-white/10 disabled:opacity-50"
          >
            {acting ? 'Iniciando…' : 'Iniciar Atendimento'}
          </button>
        )}
        {order.status === 'em-atendimento' && (
          <button
            onClick={handleComplete}
            disabled={acting}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all
              bg-[#E8809A] hover:bg-[#E8809A]/90 disabled:opacity-50
              shadow-lg shadow-[#E8809A]/20"
          >
            {acting ? 'Finalizando…' : 'Finalizar Atendimento'}
          </button>
        )}
      </div>
    </motion.div>
  );
}

export function MaquiadorPage() {
  const [orders, setOrders] = useState<Order[]>([]);
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

  return (
    <div className="min-h-dvh bg-[#080910]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#080910]/90 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#E8809A] to-[#17C3B2] flex items-center justify-center">
              <span className="text-white text-xs font-bold">M</span>
            </div>
            <h1 className="font-semibold text-white">Painel do Maquiador</h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Ao vivo
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-6 space-y-6">
        {/* Stats bar */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#161829] border border-white/8 rounded-xl px-4 py-3">
            <div className="text-2xl font-bold text-[#E8809A]">{waitingOrders.length}</div>
            <div className="text-xs text-white/40 mt-0.5">Aguardando</div>
          </div>
          <div className="bg-[#161829] border border-white/8 rounded-xl px-4 py-3">
            <div className="text-2xl font-bold text-white">{activeOrders.length}</div>
            <div className="text-xs text-white/40 mt-0.5">Em atendimento</div>
          </div>
        </div>

        {/* Em atendimento */}
        {activeOrders.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-[#E8809A]/70 uppercase tracking-widest mb-3">
              Em atendimento
            </h2>
            <div className="space-y-3">
              <AnimatePresence>
                {activeOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onStart={() => startOrder(order.id)}
                    onComplete={() => completeOrder(order.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </section>
        )}

        {/* Fila de espera */}
        <section>
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">
            Fila de espera
          </h2>

          {!isLoaded && (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-[#E8809A]/30 border-t-[#E8809A] rounded-full animate-spin mx-auto mb-3" />
              <p className="text-white/40 text-sm">Carregando fila…</p>
            </div>
          )}

          {isLoaded && waitingOrders.length === 0 && activeOrders.length === 0 && (
            <div className="text-center py-16 bg-[#161829] border border-white/5 rounded-2xl">
              <div className="text-4xl mb-3">✨</div>
              <p className="text-white/60 font-medium">Nenhum cliente na fila</p>
              <p className="text-white/30 text-sm mt-1">Novos pedidos aparecerão aqui em tempo real</p>
            </div>
          )}

          {isLoaded && waitingOrders.length > 0 && (
            <div className="space-y-3">
              <AnimatePresence>
                {waitingOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onStart={() => startOrder(order.id)}
                    onComplete={() => completeOrder(order.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
