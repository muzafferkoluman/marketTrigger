import { create } from 'zustand';
import { User, signInAnonymously, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  signInAnon: () => Promise<void>;
  logOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true, // starts loading until firebase auth state resolves
  setUser: (user) => set({ user, isLoading: false }),
  
  signInAnon: async () => {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Anonymous sign in failed:", error);
    }
  },
  
  logOut: async () => {
    try {
      await signOut(auth);
      set({ user: null });
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  }
}));
