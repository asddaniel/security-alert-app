// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../api/apiClient';

// Définition des types
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'restricted' | 'banned';
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Au chargement de l'app, on vérifie si un utilisateur est déjà connecté
    const fetchUser = async () => {
      try {
        // Cette route Laravel est protégée, elle ne renverra un user que si la session est valide
        const data = await apiClient<{ user: User }>('/user');
        console.log(data);
        setUser(data.user);
      } catch (error) {
        // C'est normal d'avoir une erreur 401 si personne n'est connecté
        console.log('Aucun utilisateur authentifié trouvé.');
        console.log(error)
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const logout = async () => {
    try {
      await apiClient('/logout', { method: 'POST' });
      setUser(null);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const value = { user, setUser, isLoading, logout };

  // On n'affiche l'application que lorsque l'on sait si l'user est connecté ou pas
  // pour éviter les "flickers" (passage de l'état "déconnecté" à "connecté")
  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser facilement le contexte
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé à l'intérieur d\'un AuthProvider");
  }
  return context;
};