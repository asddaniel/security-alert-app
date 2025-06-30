// src/pages/RegisterPage.tsx
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/apiClient';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/input';
import { Button } from '@/components/ui/button';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const { setUser } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        try {
            // await apiClient('/sanctum/csrf-cookie');
            const data:any = await apiClient('/register', {
                method: 'POST',
                body: {
                    name,
                    email,
                    password,
                    password_confirmation: passwordConfirmation,
                },
            });
            setUser(data.user);
            navigate('/');
        } catch (err: any) {
            // Laravel renvoie les erreurs de validation dans un format spécifique
            if (err.errors) {
                console.log(err);
                setErrors(err.errors);
            } else {
                setErrors({ general: err.message || 'Une erreur est survenue.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col justify-center min-h-screen py-12 bg-gray-900 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-3xl font-bold tracking-tight text-center text-cyan-400">
                    Créer un nouveau compte
                </h2>
            </div>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="px-4 py-8 bg-gray-800 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <Input
                            label="Nom complet"
                            name="name"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            error={errors.name}
                        />
                        <Input
                            label="Adresse Email"
                            name="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            error={errors.email}
                        />
                        <Input
                            label="Mot de passe"
                            name="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={errors.password}
                        />
                        <Input
                            label="Confirmer le mot de passe"
                            name="password_confirmation"
                            type="password"
                            required
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                        />
                        {errors.general && <p className="text-sm text-red-500">{errors.general}</p>}
                        <Button type="submit" isLoading={isLoading}>
                            S'inscrire
                        </Button>
                    </form>
                    <p className="mt-6 text-sm text-center text-gray-400">
                        Déjà membre ?{' '}
                        <Link to="/login" className="font-medium text-cyan-500 hover:text-cyan-400">
                            Connectez-vous
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
