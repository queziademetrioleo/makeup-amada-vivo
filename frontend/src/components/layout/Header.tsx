import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { signOut } from '@/lib/auth';
import { Button } from '@/components/ui/Button';

export function Header() {
  const location = useLocation();
  const { user, openAuthModal } = useAuthStore();
  const isTryOn = location.pathname === '/tryon';

  return (
    <header className="fixed top-0 inset-x-0 z-40 h-16 flex items-center px-6 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-brand flex items-center justify-center">
            <span className="text-white text-xs font-bold">M</span>
          </div>
          <span className="font-semibold text-sm tracking-wide">
            <span className="gradient-text">MakeUp</span>
            <span className="text-white/60 ml-1 font-light">Farmácia Make Up</span>
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {!isTryOn && (
            <Link to="/tryon">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn-primary text-sm py-2"
              >
                Experimentar agora
              </motion.button>
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50 hidden sm:block">
                {user.displayName ?? user.email?.split('@')[0]}
              </span>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                Sair
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" onClick={openAuthModal}>
              Entrar
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
