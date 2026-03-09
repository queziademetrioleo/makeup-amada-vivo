import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { signOut } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
export function Header() {
    const location = useLocation();
    const { user, openAuthModal } = useAuthStore();
    const isTryOn = location.pathname === '/tryon';
    return (_jsx("header", { className: "fixed top-0 inset-x-0 z-40 h-16 flex items-center px-6 glass border-b border-white/5", children: _jsxs("div", { className: "max-w-7xl mx-auto w-full flex items-center justify-between", children: [_jsxs(Link, { to: "/", className: "flex items-center gap-2", children: [_jsx("div", { className: "w-7 h-7 rounded-full bg-gradient-brand flex items-center justify-center", children: _jsx("span", { className: "text-white text-xs font-bold", children: "M" }) }), _jsxs("span", { className: "font-semibold text-sm tracking-wide", children: [_jsx("span", { className: "gradient-text", children: "MakeUp" }), _jsx("span", { className: "text-white/60 ml-1 font-light", children: "Farm\u00E1cia Make Up" })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [!isTryOn && (_jsx(Link, { to: "/tryon", children: _jsx(motion.button, { whileHover: { scale: 1.03 }, whileTap: { scale: 0.97 }, className: "btn-primary text-sm py-2", children: "Experimentar agora" }) })), user ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-xs text-white/50 hidden sm:block", children: user.displayName ?? user.email?.split('@')[0] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => signOut(), children: "Sair" })] })) : (_jsx(Button, { variant: "ghost", size: "sm", onClick: openAuthModal, children: "Entrar" }))] })] }) }));
}
