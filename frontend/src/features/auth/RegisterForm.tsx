import { useState, type FormEvent } from 'react';
import { signUpWithEmail } from '@/lib/auth';
import { useAuthStore } from '@/store/useAuthStore';

interface RegisterFormProps {
  onSwitch: () => void;
}

export function RegisterForm({ onSwitch }: RegisterFormProps) {
  const { closeAuthModal } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError('Senha deve ter pelo menos 6 caracteres.'); return; }
    setError('');
    setLoading(true);
    try {
      await signUpWithEmail(email, password);
      closeAuthModal();
    } catch {
      setError('Não foi possível criar a conta. Verifique seus dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-void border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-blush/50 transition-colors placeholder:text-white/20"
        />
        <input
          type="password"
          placeholder="Senha (mín. 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full bg-void border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-blush/50 transition-colors placeholder:text-white/20"
        />
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <button type="submit" disabled={loading} className="w-full btn-primary py-3 text-sm">
        {loading ? 'Criando conta…' : 'Criar conta'}
      </button>

      <p className="text-center text-xs text-white/30">
        Já tem conta?{' '}
        <button type="button" onClick={onSwitch} className="text-blush hover:underline">
          Entrar
        </button>
      </p>
    </form>
  );
}
