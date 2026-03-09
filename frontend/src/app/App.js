import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
    return (_jsxs(_Fragment, { children: [!isFullscreen && _jsx(Header, {}), _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(LandingPage, {}) }), _jsx(Route, { path: "/tryon", element: _jsx(TryOnPage, {}) }), _jsx(Route, { path: "/ar", element: _jsx(ARFlowPage, {}) }), _jsx(Route, { path: "/selecao", element: _jsx(SelectionFlowPage, {}) }), _jsx(Route, { path: "/recibo", element: _jsx(ReceiptPage, {}) }), _jsx(Route, { path: "/fila/:orderId", element: _jsx(QueueStatusPage, {}) }), _jsx(Route, { path: "/maquiador", element: _jsx(MaquiadorPage, {}) })] }), !isFullscreen && _jsx(AuthModal, {})] }));
}
