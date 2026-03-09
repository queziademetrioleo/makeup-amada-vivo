import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Modal } from '@/components/ui/Modal';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
export function AuthModal() {
    const { authModalOpen, closeAuthModal } = useAuthStore();
    const [mode, setMode] = useState('login');
    return (_jsx(Modal, { open: authModalOpen, onClose: closeAuthModal, title: mode === 'login' ? 'Entrar na sua conta' : 'Criar conta', children: mode === 'login' ? (_jsx(LoginForm, { onSwitch: () => setMode('register') })) : (_jsx(RegisterForm, { onSwitch: () => setMode('login') })) }));
}
