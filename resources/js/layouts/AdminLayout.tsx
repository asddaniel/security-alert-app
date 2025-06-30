import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from './MainLayout';

const AdminLayout = () => {
    const { user } = useAuth();

    // Si l'utilisateur n'est pas un admin, on le redirige.
    if (!user || user.role !== 'admin') {
        // Redirige vers la page d'accueil, qui elle-même redirigera vers /login si besoin.
        return <Navigate to="/" replace />;
    }

    // On utilise MainLayout pour garder la barre de navigation, mais on pourrait avoir un layout totalement différent.
    return (<MainLayout {...{} as any}>
            <Outlet />
        </MainLayout>
    );
};

export default AdminLayout;