import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { useAuth } from './contexts/AuthContext';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import CriminalForm from './pages/admin/CriminalForm';
import CriminalDetailPage from './pages/CriminalDetailPage';
import ProfilePage from './pages/ProfilePage';
import { Toaster } from 'react-hot-toast';
import { useIsAuthenticated, useAuthUser } from './stores/useAuthStore';

function App() {
   const isAuthenticated = useIsAuthenticated();
  const user = useAuthUser(); // On peut aussi récupérer l'utilisateur si on a besoin du rôle

  return (
      <>
    <Toaster
        position="top-right"
        toastOptions={{
          // Style par défaut
          style: {
            background: '#182133', // un fond sombre
            color: '#E5E7EB', // texte gris clair
            border: '1px solid #374151',
          },
          // Style pour les toasts de succès
          success: {
            iconTheme: {
              primary: '#10B981', // Vert
              secondary: '#182133',
            },
          },
          // Style pour les toasts d'erreur
          error: {
            iconTheme: {
              primary: '#EF4444', // Rouge
              secondary: '#182133',
            },
          },
        }}
      />
      <Routes>
      {/* Routes Publiques/Utilisateurs */}
      <Route
        path="/"
        element={user ? <MainLayout /> : <Navigate to="/login" />}
      >
        <Route index element={<HomePage />} />
 <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
      <Route path="/criminal/:id" element={<CriminalDetailPage />} />
      </Route>


      {/* Routes Admin */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="criminals/new" element={<CriminalForm />} />
        <Route path="criminals/edit/:id" element={<CriminalForm />} />
      </Route>

      {/* Routes Auth */}
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />

      <Route path="*" element={<h1>404 - Page non trouvée</h1>} />
    </Routes>
    </>
  );
}

export default App;
