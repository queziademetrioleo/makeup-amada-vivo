import { Routes, Route } from 'react-router-dom';
import { IntroPage } from '@/features/intro/IntroPage';
import { CapturePage } from '@/features/capture/CapturePage';
import { MirrorPage } from '@/features/mirror/MirrorPage';
import { ReceiptPage } from '@/features/receipt/ReceiptPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<IntroPage />} />
      <Route path="/captura" element={<CapturePage />} />
      <Route path="/espelho" element={<MirrorPage />} />
      <Route path="/recibo" element={<ReceiptPage />} />
    </Routes>
  );
}
