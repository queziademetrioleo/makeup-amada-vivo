import { Routes, Route } from 'react-router-dom';
import { LandingPage } from '@/features/landing/LandingPage';
import { SelectionFlowPage } from '@/features/selection-flow/SelectionFlowPage';
import { ReceiptPage } from '@/features/receipt/ReceiptPage';
import { QueueStatusPage } from '@/features/queue/QueueStatusPage';
import { MaquiadorPage } from '@/features/maquiador/MaquiadorPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/selecao" element={<SelectionFlowPage />} />
      <Route path="/recibo" element={<ReceiptPage />} />
      <Route path="/fila/:orderId" element={<QueueStatusPage />} />
      <Route path="/maquiador" element={<MaquiadorPage />} />
    </Routes>
  );
}
