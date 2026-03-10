import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useRecommendationStore } from '@/store/useRecommendationStore';

export function ReceiptPage() {
  const navigate = useNavigate();
  const { analysis, activeBase, activeBatom, activeBlush } = useRecommendationStore();

  useEffect(() => {
    if (!activeBase || !activeBatom || !activeBlush) {
      navigate('/', { replace: true });
    }
  }, [activeBase, activeBatom, activeBlush, navigate]);

  if (!activeBase || !activeBatom || !activeBlush) return null;

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
            Obrigado!
          </h1>
          <p className="text-white/70 mt-2 text-sm">Sua rotina de beleza ideal da Farmácia Amada Vivo.</p>
        </div>

        <div className="space-y-6">
          <div className="pb-4 border-b border-white/10">
            <p className="text-xs text-white/50 uppercase font-semibold mb-1">Análise de Pele</p>
            <p className="font-medium">Tom: {analysis?.tom} | Subtom: {analysis?.subtom}</p>
          </div>

          <div>
            <p className="text-xs text-white/50 uppercase font-semibold mb-3">Seus Produtos Escolhidos</p>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full" style={{ background: activeBase.hex }} />
                <div>
                  <p className="text-sm font-semibold">{activeBase.nome}</p>
                  <p className="text-xs text-white/50">Base Facial</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full" style={{ background: activeBatom.hex }} />
                <div>
                  <p className="text-sm font-semibold">{activeBatom.nome}</p>
                  <p className="text-xs text-white/50">Batom</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full" style={{ background: activeBlush.hex }} />
                <div>
                  <p className="text-sm font-semibold">{activeBlush.nome}</p>
                  <p className="text-xs text-white/50">Blush</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10">
          <button
            onClick={() => {
              useRecommendationStore.getState().reset();
              navigate('/');
            }}
            className="w-full py-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
          >
            Tentar Novamente
          </button>
        </div>
      </motion.div>
    </div>
  );
}
