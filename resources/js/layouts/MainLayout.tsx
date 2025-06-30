
import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { NavLink, Outlet } from 'react-router-dom';
import { apiClient } from '@/api/apiClient';
import toast from 'react-hot-toast';
import { showConfirmationToast } from '@/lib/confirmationToast';
import { useAuthStore, useAuthActions, useAuthUser } from '@/stores/useAuthStore';


const PanicButton = () => {
    const [isTriggering, setIsTriggering] = useState(false);

    const triggerAlert = () => {

        // if (!window.confirm("Êtes-vous absolument sûr de vouloir déclencher votre alerte de survie ? Cette action est irréversible et notifiera immédiatement vos contacts d'urgence.")) {
        //     return;
        // }

        setIsTriggering(true);
        // Essayer d'obtenir la géolocalisation
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };
                sendTriggerRequest(location);
            },
            () => {
                // Si la géolocalisation échoue, on envoie sans
                toast.error("Impossible d'obtenir la position. L'alerte sera envoyée sans coordonnées.");
                sendTriggerRequest();
            }
        );
    };

    const sendTriggerRequest = async (location: {latitude: number, longitude: number} | null = null) => {
        try {
            const response:any = await apiClient('/survival-alert/trigger', {
                method: 'POST',
                body: location || {}
            });
            toast.success(response.message);
        } catch (error: any) {
            toast.error("Erreur lors du déclenchement: " + (error.message || 'Veuillez vérifier votre configuration.'));
        } finally {
            setIsTriggering(false);
        }
    };
        return (
        <button
            onClick={triggerAlert}
            disabled={isTriggering}
            className="fixed z-50 flex flex-col items-center justify-center w-20 h-20 text-white transition-transform bg-red-600 rounded-full shadow-2xl bottom-6 right-6 animate-pulse hover:animate-none hover:scale-110 focus:outline-none focus:ring-4 focus:ring-red-400 disabled:opacity-70 disabled:cursor-not-allowed"
        >
            <span className="text-sm font-bold">PANIC</span>
            <span className="text-xs">{isTriggering ? 'Envoi...' : 'SOS'}</span>
        </button>
    );
};







export default function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
const user = useAuthUser();
const { logout: storeLogout } = useAuthActions(); // Renommer pour éviter conflit de nom
const handleLogout = async () => {
    // Il est bon de notifier le backend que le token est révoqué
    try {
        await apiClient('/logout', { method: 'POST' });
        toast.success("Vous avez été déconnecté.");
    } catch (error) {
        console.error("Erreur lors de la déconnexion serveur :", error);
    } finally {
        // Dans tous les cas, on nettoie le store et le localStorage
        storeLogout();
    }
};
  const navigation = [
    { name: 'Accueil', href: '/' },
    // On ajoute dynamiquement le lien admin s'il y a lieu
    ...(user && user.role === 'admin' ? [{ name: 'Dashboard Admin', href: '/admin/dashboard' }] : []),
  ];
   const userNavigation = [
    { name: 'Mon Profil', href: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* ===== HEADER ===== */}
      <header className="absolute inset-x-0 top-0 z-50 bg-gray-900/50 backdrop-blur-sm">
        <nav className="flex items-center justify-between p-6 mx-auto max-w-7xl lg:px-8" aria-label="Global">
          {/* Logo */}
          <div className="flex lg:flex-1">
            <NavLink to="/" className="-m-1.5 p-1.5">
              <span className="sr-only">Security Alert</span>
              {/* Vous pouvez mettre un logo SVG ici */}
              <h1 className="text-xl font-bold text-cyan-400">SecurityAlert</h1>
            </NavLink>
          </div>

          {/* Bouton du menu mobile (visible uniquement sur mobile) */}
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-400 hover:text-white"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Ouvrir le menu principal</span>
              <Bars3Icon className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>

          {/* Navigation Desktop (visible uniquement sur desktop) */}
          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `text-sm font-semibold leading-6 transition-colors duration-200 ${
                    isActive ? 'text-cyan-400' : 'text-gray-300 hover:text-white'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>

          {/* Section Utilisateur (login/logout) */}
          <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:gap-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-300">Bonjour, {user.name}</span>
                <NavLink to="/profile" className={({ isActive }) => `...`}>Mon Profil</NavLink>
                <button
                  onClick={handleLogout}
                  className="rounded-md bg-red-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                className="text-sm font-semibold leading-6 text-white hover:text-cyan-400"
              >
                Connexion <span aria-hidden="true">→</span>
              </NavLink>
            )}
          </div>
        </nav>

        {/* ===== MENU MOBILE (géré par Headless UI) ===== */}
        <Transition show={mobileMenuOpen} as={'div'}>
          <Dialog as="div" className="lg:hidden" onClose={setMobileMenuOpen}>
            <Transition.Child
                as={'div'}
                enter="ease-in-out duration-500"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-500"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div className="fixed inset-0 z-50 transition-opacity bg-gray-900 bg-opacity-75" />
            </Transition.Child>

            <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full px-6 py-6 overflow-y-auto bg-gray-900 sm:max-w-sm sm:ring-1 sm:ring-white/10">
              {/* Header du menu mobile */}
              <div className="flex items-center justify-between">
                <NavLink to="/" className="-m-1.5 p-1.5" onClick={() => setMobileMenuOpen(false)}>
                  <h1 className="text-xl font-bold text-cyan-400">SecurityAlert</h1>
                </NavLink>
                <button
                  type="button"
                  className="-m-2.5 rounded-md p-2.5 text-gray-400 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sr-only">Fermer le menu</span>
                  <XMarkIcon className="w-6 h-6" aria-hidden="true" />
                </button>
              </div>

              {/* Contenu du menu mobile */}
              <div className="flow-root mt-6">
                <div className="-my-6 divide-y divide-gray-500/25">
                  <div className="py-6 space-y-2">
                    {navigation.map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 transition-colors duration-200 ${
                            isActive
                              ? 'bg-gray-800 text-cyan-400'
                              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                          }`
                        }
                      >
                        {item.name}
                      </NavLink>
                    ))}
                  </div>
                  <div className="py-6">
                    {user ? (
                    <>

<NavLink to="/profile">Mon Profil</NavLink>

                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="-mx-3 block w-full text-left rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-300 hover:bg-gray-800 hover:text-white"
                      >
                        Déconnexion
                      </button>
                    </>
                    ) : (
                      <NavLink
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-300 hover:bg-gray-800 hover:text-white"
                      >
                        Connexion
                      </NavLink>
                    )}
                  </div>
                </div>
              </div>
            </Dialog.Panel>
          </Dialog>
        </Transition>
      </header>

      {/* ===== CONTENU DE LA PAGE ===== */}
      <main className="relative pt-24 isolate sm:pt-32">
        {/* Un petit effet visuel pour un design plus moderne */}
        <div
          className="absolute inset-x-0 overflow-hidden -top-40 -z-10 transform-gpu blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#007CF0] to-[#00DFD8] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
            {user && <PanicButton />} {/* On affiche le bouton si l'user est connecté */}
        <div className="px-6 mx-auto max-w-7xl lg:px-8">
            <Outlet />
        </div>
      </main>
    </div>
  );
}
