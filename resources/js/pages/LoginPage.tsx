
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/apiClient';
//import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import toast from 'react-hot-toast';
import { useAuthActions } from '@/stores/useAuthStore';


const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuthActions(); // Obtenir l'action de connexion
    const navigate = useNavigate();

     const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Le cookie CSRF n'est plus nécessaire pour l'authentification par token
            const data = await apiClient<{ user: any, token: string }>('/login', {
                method: 'POST',
                body: { email, password },
            });

            // On appelle l'action de notre store pour mettre à jour l'état global
            login(data.user, data.token);

            toast.success(`Bienvenue, ${data.user.name} !`);
            navigate('/'); // Redirige vers la page d'accueil
        } catch (err: any) {
            toast.error(err.message || 'Échec de la connexion.');
        } finally {
            setIsLoading(false);
        }
    }

  return (
    <div className="flex flex-col justify-center min-h-screen py-12 bg-gray-900 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-3xl font-bold tracking-tight text-center text-cyan-400">
          Connectez-vous à votre compte
        </h2>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="px-4 py-8 bg-gray-800 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Adresse Email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Mot de passe"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" isLoading={isLoading}>
              Connexion
            </Button>
          </form>
          <p className="mt-6 text-sm text-center text-gray-400">
            Pas encore membre ?{' '}
            <Link to="/register" className="font-medium text-cyan-500 hover:text-cyan-400">
              Inscrivez-vous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
