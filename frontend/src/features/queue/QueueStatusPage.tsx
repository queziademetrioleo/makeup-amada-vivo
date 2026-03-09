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
    <div className="min-h-dvh flex flex-col" style={{ background: '#080910' }}>
      {/* Top bar */}
      <div
        className="h-14 flex items-center justify-between px-6 flex-shrink-0 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)' }}
          >
            <span className="text-white text-xs font-bold">M</span>
          </div>
          <span className="text-sm font-medium text-white/70">Farmácia Make Up</span>
        </div>
        {status === 'finalizado' && (
          <button
            onClick={() => navigate('/')}
            className="text-xs text-white/40 hover:text-white/60 transition-colors"
            style={{ minHeight: 44 }}
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
                className="rounded-2xl p-6 text-center"
                style={
                  status === 'em-atendimento'
                    ? {
                        background: 'rgba(236,72,153,0.08)',
                        border: '1px solid rgba(236,72,153,0.35)',
                        /* animated gradient border via box-shadow approximation */
                        animation: 'glowPulse 2s ease-in-out infinite',
                      }
                    : status === 'finalizado'
                      ? { background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }
                      : { background: 'rgba(22,24,41,0.8)', border: '1px solid rgba(255,255,255,0.08)' }
                }
              >
                {/* Pulse dot for em-atendimento */}
                {status === 'em-atendimento' && (
                  <div className="flex items-center justify-center mb-3">
                    <span className="relative flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#EC4899' }} />
                      <span className="relative inline-flex rounded-full h-4 w-4" style={{ background: '#EC4899' }} />
                    </span>
                  </div>
                )}

                {/* Queue number — Playfair Display, text-8xl, gradient text */}
                {status === 'aguardando' && position !== null && (
                  <div className="mb-3">
                    <div
                      className="font-bold mb-1 leading-none"
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '6rem',
                        background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {position}
                    </div>
                    <div className="text-xs text-white/40 uppercase tracking-widest">Posição na fila</div>
                  </div>
                )}

                {/* "É a sua vez!" headline */}
                {status === 'em-atendimento' && (
                  <div
                    className="text-3xl font-bold mb-2"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    É a sua vez!
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
                <p
                  className="text-sm font-medium"
                  style={{
                    color: status === 'em-atendimento'
                      ? '#EC4899'
                      : status === 'finalizado'
                        ? '#4ade80'
                        : 'rgba(255,255,255,0.6)',
                  }}
                >
                  {STATUS_LABEL[status]}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Compact receipt */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: '#161829', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div
                className="px-5 py-3 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                  Suas escolhas
                </h3>
              </div>
              {STEPS.map((step) => {
                const sel = orderSelections[step];
                if (!sel) return null;
                return (
                  <div
                    key={step}
                    className="flex items-center gap-3 px-5 py-3 border-b last:border-0"
                    style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                  >
                    {/* w-8 h-8 swatch with ring */}
                    <div
                      className="w-8 h-8 rounded-full flex-shrink-0 shadow-sm"
                      style={{
                        backgroundColor: sel.colorHex,
                        outline: '2px solid rgba(255,255,255,0.15)',
                        outlineOffset: 1,
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <span
                        className="text-xs font-semibold uppercase tracking-wider mr-2"
                        style={{ color: 'rgba(236,72,153,0.7)' }}
                      >
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

      <style>{`
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(236,72,153,0.0); }
          50% { box-shadow: 0 0 24px 4px rgba(236,72,153,0.30); }
        }
      `}</style>
    </div>
  );
}
