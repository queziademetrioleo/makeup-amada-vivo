import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { signInWithEmail, signInWithGoogle } from '@/lib/auth';
import { useAuthStore } from '@/store/useAuthStore';
export function LoginForm({ onSwitch }) {
    const { closeAuthModal } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signInWithEmail(email, password);
            closeAuthModal();
        }
        catch {
            setError('E-mail ou senha incorretos.');
        }
        finally {
            setLoading(false);
        }
    };
    const handleGoogle = async () => {
        try {
            await signInWithGoogle();
            closeAuthModal();
        }
        catch {
            setError('Falha ao entrar com Google.');
        }
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("button", { type: "button", onClick: handleGoogle, className: "w-full btn-ghost py-2.5 text-sm flex items-center justify-center gap-2", children: [_jsxs("svg", { className: "w-4 h-4", viewBox: "0 0 24 24", fill: "currentColor", children: [_jsx("path", { d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z", fill: "#4285F4" }), _jsx("path", { d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z", fill: "#34A853" }), _jsx("path", { d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z", fill: "#FBBC05" }), _jsx("path", { d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z", fill: "#EA4335" })] }), "Continuar com Google"] }), _jsxs("div", { className: "flex items-center gap-3 my-1", children: [_jsx("hr", { className: "flex-1 border-border" }), _jsx("span", { className: "text-white/20 text-xs", children: "ou" }), _jsx("hr", { className: "flex-1 border-border" })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("input", { type: "email", placeholder: "E-mail", value: email, onChange: (e) => setEmail(e.target.value), required: true, className: "w-full bg-void border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-blush/50 transition-colors placeholder:text-white/20" }), _jsx("input", { type: "password", placeholder: "Senha", value: password, onChange: (e) => setPassword(e.target.value), required: true, className: "w-full bg-void border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-blush/50 transition-colors placeholder:text-white/20" })] }), error && _jsx("p", { className: "text-red-400 text-xs", children: error }), _jsx("button", { type: "submit", disabled: loading, className: "w-full btn-primary py-3 text-sm", children: loading ? 'Entrando…' : 'Entrar' }), _jsxs("p", { className: "text-center text-xs text-white/30", children: ["N\u00E3o tem conta?", ' ', _jsx("button", { type: "button", onClick: onSwitch, className: "text-blush hover:underline", children: "Cadastre-se" })] })] }));
}
