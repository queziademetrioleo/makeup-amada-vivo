import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Modal } from '@/components/ui/Modal';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export function AuthModal() {
  const { authModalOpen, closeAuthModal } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  return (
    <Modal
      open={authModalOpen}
      onClose={closeAuthModal}
      title={mode === 'login' ? 'Entrar na sua conta' : 'Criar conta'}
    >
      {mode === 'login' ? (
        <LoginForm onSwitch={() => setMode('register')} />
      ) : (
        <RegisterForm onSwitch={() => setMode('login')} />
      )}
    </Modal>
  );
}
