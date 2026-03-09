import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { AuthModal } from '@/features/auth/AuthModal';
import { LandingPage } from '@/features/landing/LandingPage';
import { TryOnPage } from '@/features/tryon/TryOnPage';
import { ARFlowPage } from '@/features/ar-flow/ARFlowPage';
import { SelectionFlowPage } from '@/features/selection-flow/SelectionFlowPage';
import { ReceiptPage } from '@/features/receipt/ReceiptPage';
import { QueueStatusPage } from '@/features/queue/QueueStatusPage';
import { MaquiadorPage } from '@/features/maquiador/MaquiadorPage';
import { initAuthListener } from '@/lib/auth';

export function App() {
  useEffect(() => {
    const unsubscribe = initAuthListener();
    return unsubscribe;
  }, []);

  const { pathname } = useLocation();
  const isFullscreen = pathname === '/' || pathname.startsWith('/ar') || pathname.startsWith('/selecao');

  return (
    <>
      {/* Header and auth hidden on full-screen flows */}
      {!isFullscreen && <Header />}

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/tryon" element={<TryOnPage />} />
        <Route path="/ar" element={<ARFlowPage />} />
        <Route path="/selecao" element={<SelectionFlowPage />} />
        <Route path="/recibo" element={<ReceiptPage />} />
        <Route path="/fila/:orderId" element={<QueueStatusPage />} />
        <Route path="/maquiador" element={<MaquiadorPage />} />
      </Routes>

      {!isFullscreen && <AuthModal />}
    </>
  );
}
