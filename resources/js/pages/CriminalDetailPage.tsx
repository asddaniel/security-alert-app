import { useEffect, useState, FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../api/apiClient';
import { Button } from '../components/ui/button';
import toast from 'react-hot-toast';
import { MapPinIcon, ShieldExclamationIcon, UserIcon, CalendarIcon } from '@heroicons/react/24/outline';

// --- INTERFACES (Types de données) ---
interface Photo {
  id: number;
  path: string;
  label: string | null;
}

interface CriminalDetails {
  id: number;
  full_name: string;
  alias: string | null;
  date_of_birth: string;
  description: string;
  crimes_committed: string;
  security_level: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  last_known_location: string | null;
  photos: Photo[];
  creator: { name: string };
}

const storageUrl = 'http://localhost:8000/storage/';

// === DÉFINITION DU COMPOSANT MANQUANT "DetailItem" ===
const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | null | undefined }) => (
    <div className="flex items-start">
        <Icon className="flex-shrink-0 w-6 h-6 mt-1 text-cyan-400" aria-hidden="true" />
        <div className="ml-4">
            <dt className="text-sm font-medium text-gray-400">{label}</dt>
            <dd className="mt-1 text-white capitalize text-md">{value || 'Non spécifié'}</dd>
        </div>
    </div>
);
// === FIN DE LA DÉFINITION ===

const CriminalDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const [criminal, setCriminal] = useState<CriminalDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchCriminal = async () => {
            try {
                const data = await apiClient<CriminalDetails>(`/criminals/${id}`);
                setCriminal(data);
            } catch (error) {
                toast.error("Profil introuvable ou erreur de chargement.");
            } finally {
                setLoading(false);
            }
        };
        fetchCriminal();
    }, [id]);

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            toast.error("La géolocalisation n'est pas supportée par votre navigateur.");
            return;
        }
        toast.promise(
            new Promise<string>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
                        resolve("Position acquise !");
                    },
                    () => reject(new Error("Impossible d'obtenir la position. Veuillez autoriser l'accès.")),
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                );
            }),
            {
                loading: 'Acquisition de la position...',
                success: (msg) => <b>{msg}</b>,
                error: (err) => <b>{err.message}</b>,
            }
        );
    };

    const handleReportSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!location) {
            toast.error("Veuillez fournir une position avant de soumettre.");
            return;
        }
        setIsSubmitting(true);
        const toastId = toast.loading("Envoi du signalement...");

        try {
            const response = await apiClient<{message: string}>(`/criminals/${id}/report`, {
                method: 'POST',
                body: { latitude: location.lat, longitude: location.lng, message },
            });
            toast.success(response.message, { id: toastId, duration: 4000 });
            setMessage('');
            setLocation(null);
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de l'envoi.", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-white">Chargement du dossier...</div>;
    if (!criminal) return <div className="p-10 text-center text-red-500">Dossier non trouvé.</div>;

    const levelStyles = {
        low: { text: 'text-green-400', border: 'border-green-400' },
        medium: { text: 'text-yellow-400', border: 'border-yellow-400' },
        high: { text: 'text-orange-400', border: 'border-orange-400' },
        critical: { text: 'text-red-500', border: 'border-red-500' },
    };
    const currentLevelStyle = levelStyles[criminal.security_level];

    return (
        <div className="px-8 space-y-12">
            {/* --- EN-TÊTE DU PROFIL --- */}
            <header className="flex flex-col items-center gap-8 md:flex-row">
                <div className="flex-shrink-0 w-48 h-48 md:w-56 md:h-56">
                    <img
                        src={criminal.photos[0] ? `${storageUrl}${criminal.photos[0].path}` : 'https://avatar.iran.liara.run/public/boy?username=' + criminal.full_name}
                        alt={`Mugshot de ${criminal.full_name}`}
                        className="object-cover w-full h-full border-4 border-gray-700 rounded-full shadow-2xl"
                    />
                </div>
                <div className="text-center md:text-left">
                    <p className={`font-bold text-lg ${currentLevelStyle.text}`}>Niveau de Menace : {criminal.security_level.toUpperCase()}</p>
                    <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">{criminal.full_name}</h1>
                    {criminal.alias && <p className="mt-1 text-2xl text-gray-400">Alias "{criminal.alias}"</p>}
                </div>
            </header>

            {/* --- GRILLE D'INFORMATIONS --- */}
            <div className="p-8 bg-gray-800 border border-gray-900 rounded-lg shadow-xl">
                <h2 className="pb-4 mb-6 text-2xl font-semibold border-b text-cyan-400 border-cyan-400/20">Fiche d'Identité</h2>
                <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
                    <DetailItem icon={ShieldExclamationIcon} label="Statut Actuel" value={criminal.status} />
                    <DetailItem icon={UserIcon} label="Nom Complet" value={criminal.full_name} />
                    <DetailItem icon={CalendarIcon} label="Date de Naissance" value={criminal.date_of_birth} />
                    <DetailItem icon={MapPinIcon} label="Dernière Position Connue" value={criminal.last_known_location} />
                </dl>
            </div>

            {/* --- DESCRIPTION ET CRIMES --- */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="p-8 bg-gray-800 border border-gray-900 rounded-lg shadow-xl">
                    <h3 className="mb-4 text-xl font-semibold text-white">Caractéristiques Physiques et Comportementales</h3>
                    <div className="leading-relaxed prose text-gray-300 whitespace-pre-wrap prose-invert prose-p:my-1">{criminal.description}</div>
                </div>
                <div className="p-8 bg-gray-800 border border-gray-800 rounded-lg shadow-xl">
                    <h3 className="mb-4 text-xl font-semibold text-white">Chefs d'Accusation</h3>
                    <div className="leading-relaxed prose text-gray-300 whitespace-pre-wrap prose-invert prose-p:my-1">{criminal.crimes_committed}</div>
                </div>
            </div>

            {/* --- GALERIE PHOTO --- */}
            {criminal.photos.length > 1 && (
                <div className="p-8 bg-gray-800 border border-gray-700 rounded-lg shadow-xl">
                     <h2 className="pb-4 mb-6 text-2xl font-semibold border-b text-cyan-400 border-cyan-400/20">Galerie de Photos</h2>
                     <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                        {criminal.photos.map(photo => (
                            <div key={photo.id} className="cursor-pointer group">
                                <img src={`${storageUrl}${photo.path}`} alt={photo.label || 'Photo additionnelle'} className="object-cover w-full h-48 transition-opacity rounded-md group-hover:opacity-80" />
                                {photo.label && <p className="mt-2 text-sm text-center text-gray-400">{photo.label}</p>}
                            </div>
                        ))}
                     </div>
                </div>
            )}

            {/* --- FORMULAIRE DE SIGNALEMENT --- */}
            <div className="p-8 border rounded-lg shadow-2xl bg-gradient-to-br from-blue-900 to-gray-900 border-cyan-500/30">
                <h2 className="mb-2 text-2xl font-bold text-cyan-300">Signaler une Position</h2>
                <p className="max-w-2xl mb-6 text-gray-400">Votre contribution peut être décisive. Si vous apercevez cet individu, ne prenez aucun risque. Éloignez-vous et transmettez-nous sa position de manière anonyme et sécurisée.</p>
                <form onSubmit={handleReportSubmit} className="space-y-6">
                    <div className="flex flex-col items-center gap-4 sm:flex-row">
                        <Button type="button" onClick={handleGetLocation} className="w-full sm:w-auto">
                            <MapPinIcon className="w-5 h-5 mr-2" /> Obtenir ma Position
                        </Button>
                        {location && <p className="text-sm text-green-300">Position acquise ! Prêt à envoyer.</p>}
                    </div>
                    <div>
                        <textarea
                            id="message"
                            name="message"
                            rows={4}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Ajoutez des détails pertinents (vêtements, direction, etc.)... (optionnel)"
                            className="block w-full rounded-md border-0 bg-gray-800/60 py-2.5 px-3 text-white placeholder-gray-500 ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-cyan-500 sm:text-sm"
                        />
                    </div>
                    <div className="text-right">
                        <Button type="submit" isLoading={isSubmitting} disabled={!location || isSubmitting} className="w-full sm:w-auto">
                            Envoyer le Signalement
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CriminalDetailPage;
