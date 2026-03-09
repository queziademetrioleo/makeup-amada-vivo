import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { signUpWithEmail } from '@/lib/auth';
import { useAuthStore } from '@/store/useAuthStore';
export function RegisterForm({ onSwitch }) {
    const { closeAuthModal } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            setError('Senha deve ter pelo menos 6 caracteres.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await signUpWithEmail(email, password);
            closeAuthModal();
        }
        catch {
            setError('Não foi possível criar a conta. Verifique seus dados.');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "space-y-3", children: [_jsx("input", { type: "email", placeholder: "E-mail", value: email, onChange: (e) => setEmail(e.target.value), required: true, className: "w-full bg-void border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-blush/50 transition-colors placeholder:text-white/20" }), _jsx("input", { type: "password", placeholder: "Senha (m\u00EDn. 6 caracteres)", value: password, onChange: (e) => setPassword(e.target.value), required: true, className: "w-full bg-void border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-blush/50 transition-colors placeholder:text-white/20" })] }), error && _jsx("p", { className: "text-red-400 text-xs", children: error }), _jsx("button", { type: "submit", disabled: loading, className: "w-full btn-primary py-3 text-sm", children: loading ? 'Criando conta…' : 'Criar conta' }), _jsxs("p", { className: "text-center text-xs text-white/30", children: ["J\u00E1 tem conta?", ' ', _jsx("button", { type: "button", onClick: onSwitch, className: "text-blush hover:underline", children: "Entrar" })] })] }));
}
