import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route } from 'react-router-dom';
import { IntroPage } from '@/features/intro/IntroPage';
import { CapturePage } from '@/features/capture/CapturePage';
import { MirrorPage } from '@/features/mirror/MirrorPage';
export function App() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(IntroPage, {}) }), _jsx(Route, { path: "/captura", element: _jsx(CapturePage, {}) }), _jsx(Route, { path: "/espelho", element: _jsx(MirrorPage, {}) })] }));
}
