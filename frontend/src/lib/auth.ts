import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth } from './firebase';
import { useAuthStore } from '@/store/useAuthStore';

const googleProvider = new GoogleAuthProvider();

export const signInWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const signUpWithEmail = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

export const signOut = () => firebaseSignOut(auth);

// Called once in App.tsx to subscribe to auth state
export function initAuthListener(): () => void {
  const { setUser } = useAuthStore.getState();
  return onAuthStateChanged(auth, (user: User | null) => {
    setUser(user);
  });
}
