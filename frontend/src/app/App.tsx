import { Routes, Route } from 'react-router-dom';
import { IntroPage } from '@/features/intro/IntroPage';
import { CapturePage } from '@/features/capture/CapturePage';
import { MirrorPage } from '@/features/mirror/MirrorPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<IntroPage />} />
      <Route path="/captura" element={<CapturePage />} />
      <Route path="/espelho" element={<MirrorPage />} />
    </Routes>
  );
}
