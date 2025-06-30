// src/stores/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// On réutilise notre type User
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'restricted' | 'banned';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  actions: {
    login: (user: User, token: string) => void;
    logout: () => void;
    setUser: (user: User | null) => void;
  };
}

export const useAuthStore = create<AuthState>()(
  // La middleware 'persist' va automatiquement sauvegarder l'état dans le localStorage
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      actions: {
        login: (user, token) => {
          set({ user, token, isAuthenticated: true });
        },
        logout: () => {
          set({ user: null, token: null, isAuthenticated: false });
        },
        setUser: (user) => {
          set({ user });
        },
      },
    }),
    {
      name: 'auth-storage', // Clé dans le localStorage
      storage: createJSONStorage(() => localStorage), // (optional) par défaut, c'est déjà localStorage
      // On choisit de ne persister que le user et le token
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// Sélecteurs pour un accès facile et optimisé
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthToken = () => useAuthStore((state) => state.token);
export const useAuthActions = () => useAuthStore((state) => state.actions);
