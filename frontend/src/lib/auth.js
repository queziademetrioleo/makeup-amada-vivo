import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, onAuthStateChanged, } from 'firebase/auth';
import { auth } from './firebase';
import { useAuthStore } from '@/store/useAuthStore';
const googleProvider = new GoogleAuthProvider();
export const signInWithEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const signUpWithEmail = (email, password) => createUserWithEmailAndPassword(auth, email, password);
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signOut = () => firebaseSignOut(auth);
// Called once in App.tsx to subscribe to auth state
export function initAuthListener() {
    const { setUser } = useAuthStore.getState();
    return onAuthStateChanged(auth, (user) => {
        setUser(user);
    });
}
