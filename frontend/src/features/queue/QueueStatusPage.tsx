import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrderStore, STEPS, STEP_LABELS } from '@/store/useOrderStore';
import { subscribeToOrder } from '@/lib/orders';
import type { Order } from '@/lib/orders';

const STATUS_LABEL: Record<Order['status'], string> = {
  aguardando: 'Aguardando atendimento',
  'em-atendimento': 'É a sua vez! Dirija-se ao maquiador.',
  finalizado: 'Atendimento concluído. Obrigada!',
};

const STATUS_COLOR: Record<Order['status'], string> = {
  aguardando: 'text-white/60',
  'em-atendimento': 'text-[#E8809A]',
  finalizado: 'text-green-400',
};

export function QueueStatusPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { clientName, selections } = useOrderStore();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!orderId) {
      navigate('/selecao', { replace: true });
      return;
    }
    const unsub = subscribeToOrder(orderId, (o) => setOrder(o));
    return unsub;
  }, [orderId, navigate]);

  if (!orderId) return null;

  const displayName = order?.clientName ?? clientName;
  const status = order?.status ?? 'aguardando';
  const position = order?.queuePosition ?? null;
  const orderSelections = order?.selections ?? selections;

  return (
    <div className="min-h-dvh bg-[#080910] flex flex-col">
      {/* Top bar */}
      <div className="h-14 flex items-center justify-between px-6 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#E8809A] to-[#17C3B2] flex items-center justify-center">
            <span className="text-white text-xs font-bold">M</span>
          </div>
          <span className="text-sm font-medium text-white/70">Farmácia Make Up</span>
        </div>
        {status === 'finalizado' && (
          <button
            onClick={() => navigate('/')}
            className="text-xs text-white/40 hover:text-white/60 transition-colors"
          >
            Voltar ao início
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Status card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={status}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`rounded-2xl border p-6 text-center
                  ${status === 'em-atendimento'
                    ? 'bg-[#E8809A]/10 border-[#E8809A]/30'
                    : status === 'finalizado'
                      ? 'bg-green-500/10 border-green-500/20'
                      : 'bg-[#161829] border-white/8'
                  }`}
              >
                {/* Pulse dot for em-atendimento */}
                {status === 'em-atendimento' && (
                  <div className="flex items-center justify-center mb-3">
                    <span className="relative flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8809A] opacity-75" />
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-[#E8809A]" />
                    </span>
                  </div>
                )}

                {/* Queue number */}
                {status === 'aguardando' && position !== null && (
                  <div className="mb-3">
                    <div className="text-5xl font-bold text-white mb-1">{position}</div>
                    <div className="text-xs text-white/40 uppercase tracking-widest">Posição na fila</div>
                  </div>
                )}

                {/* Name */}
                <h2 className="text-lg font-semibold text-white mb-1">
                  {displayName && `${displayName}, `}
                  {status === 'aguardando' ? 'você está na fila!' : ''}
                  {status === 'em-atendimento' ? 'chegou a sua hora!' : ''}
                  {status === 'finalizado' ? 'obrigada pela visita!' : ''}
                </h2>

                {/* Status message */}
                <p className={`text-sm font-medium ${STATUS_COLOR[status]}`}>
                  {STATUS_LABEL[status]}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Compact receipt */}
            <div className="bg-[#161829] border border-white/8 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-white/5">
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                  Suas escolhas
                </h3>
              </div>
              {STEPS.map((step) => {
                const sel = orderSelections[step];
                if (!sel) return null;
                return (
                  <div key={step} className="flex items-center gap-3 px-5 py-3 border-b border-white/5 last:border-0">
                    <div
                      className="w-7 h-7 rounded-full flex-shrink-0 ring-1 ring-white/15 shadow-sm"
                      style={{ backgroundColor: sel.colorHex }}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-[#E8809A]/70 uppercase tracking-wider mr-2">
                        {STEP_LABELS[step]}
                      </span>
                      <span className="text-sm text-white/70">{sel.colorName}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order ID */}
            <p className="text-center text-xs text-white/20">
              Pedido #{orderId.slice(0, 8).toUpperCase()}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
