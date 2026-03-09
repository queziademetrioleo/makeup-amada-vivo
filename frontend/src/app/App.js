import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route } from 'react-router-dom';
import { LandingPage } from '@/features/landing/LandingPage';
import { SelectionFlowPage } from '@/features/selection-flow/SelectionFlowPage';
import { ReceiptPage } from '@/features/receipt/ReceiptPage';
import { QueueStatusPage } from '@/features/queue/QueueStatusPage';
import { MaquiadorPage } from '@/features/maquiador/MaquiadorPage';
export function App() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(LandingPage, {}) }), _jsx(Route, { path: "/selecao", element: _jsx(SelectionFlowPage, {}) }), _jsx(Route, { path: "/recibo", element: _jsx(ReceiptPage, {}) }), _jsx(Route, { path: "/fila/:orderId", element: _jsx(QueueStatusPage, {}) }), _jsx(Route, { path: "/maquiador", element: _jsx(MaquiadorPage, {}) })] }));
}
