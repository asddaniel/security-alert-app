// src/pages/HomePage.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/apiClient';

// On réutilise les types déjà définis dans AdminDashboard. On pourrait les centraliser.
interface Photo { id: number; path: string; label: string | null; }
interface Criminal {
  id: number;
  full_name: string;
  security_level: string;
  status: string;
  photos: Photo[];
}

const storageUrl = location.origin+'/storage/';

// Composant pour la carte d'un criminel
const CriminalCard = ({ criminal }: { criminal: Criminal }) => {
  const levelColor = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    critical: 'bg-red-600',
  };

  return (
    <Link to={`/criminal/${criminal.id}`} className="relative block overflow-hidden transition-shadow duration-300 bg-gray-800 rounded-lg shadow-lg group hover:shadow-cyan-500/50">
      <img
        src={criminal.photos[0] ? `${storageUrl}${criminal.photos[0].path}` : 'https://via.placeholder.com/400'}
        alt={`Photo de ${criminal.full_name}`}
        className="object-cover w-full h-64 transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
      <div className="absolute bottom-0 left-0 p-4">
        <h3 className="text-xl font-bold text-white">{criminal.full_name}</h3>
        <div className="flex items-center gap-2 mt-2">
          <span className={`inline-block h-3 w-3 rounded-full ${levelColor[criminal.security_level as keyof typeof levelColor]}`}></span>
          <p className="text-sm text-gray-300 capitalize">{criminal.security_level} Security Level</p>
        </div>
      </div>
    </Link>
  );
};


const HomePage = () => {
  const [criminals, setCriminals] = useState<Criminal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient<{ data: Criminal[] }>('/criminals')
      .then(response => setCriminals(response.data))
      .catch(error => console.error("Erreur de chargement des criminels:", error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">Les Plus Recherchés</h1>
        <p className="mt-6 text-lg leading-8 text-gray-300">
          Aidez-nous à rendre nos communautés plus sûres. Voici les individus actuellement recherchés.
        </p>
      </div>

      {loading ? (
        <p className="text-center">Chargement des profils...</p>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {criminals.map(criminal => (
            <CriminalCard key={criminal.id} criminal={criminal} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
