import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/apiClient';
import { Button } from '@/components/ui/button';

// Définissons les types pour la clarté
interface Photo {
  id: number;
  path: string;
  label: string | null;
}

interface Criminal {
  id: number;
  full_name: string;
  alias: string | null;
  security_level: string;
  status: string;
  photos: Photo[];
  creator: { id: number; name: string };
  created_at: string;
}

const AdminDashboard = () => {
  const [criminals, setCriminals] = useState<Criminal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCriminals = async () => {
      try {
        setLoading(true);
        // L'API renvoie un objet de pagination, nous récupérons les données
        const response = await apiClient<{ data: Criminal[] }>('/criminals');
        setCriminals(response.data);
      } catch (err: any) {
        setError('Impossible de charger les données. ' + (err.message || ''));
      } finally {
        setLoading(false);
      }
    };
    fetchCriminals();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette fiche ?')) {
      try {
        await apiClient(`/criminals/${id}`, { method: 'DELETE' });
        // Met à jour la liste en filtrant l'élément supprimé
        setCriminals(criminals.filter(c => c.id !== id));
      } catch (err: any) {
        alert('Erreur lors de la suppression : ' + err.message);
      }
    }
  };
  
  // L'URL de base pour nos images
  const storageUrl = 'http://localhost:8000/storage/';

  if (loading) return <div>Chargement du tableau de bord...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="justify-between sm:flex sm:items-center">
        <h1 className="text-2xl font-bold leading-6 text-white">Gestion des Criminels</h1>
        <Link to="/admin/criminals/new">
          <Button className="mt-4 sm:mt-0">Ajouter une fiche</Button>
        </Link>
      </div>

      <div className="flow-root mt-8">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0">Nom / Alias</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Niveau Sécurité</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Statut</th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {criminals.map((criminal) => (
                  <tr key={criminal.id}>
                    <td className="py-4 pl-4 pr-3 text-sm whitespace-nowrap sm:pl-0">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 h-11 w-11">
                                <img className="object-cover rounded-full h-11 w-11" src={criminal.photos[0] ? `${storageUrl}${criminal.photos[0].path}` : 'https://via.placeholder.com/44'} alt="" />
                            </div>
                            <div className="ml-4">
                                <div className="font-medium text-white">{criminal.full_name}</div>
                                <div className="mt-1 text-gray-400">{criminal.alias}</div>
                            </div>
                        </div>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-300 whitespace-nowrap">{criminal.security_level}</td>
                    <td className="px-3 py-4 text-sm text-gray-300 whitespace-nowrap">{criminal.status}</td>
                    <td className="relative py-4 pl-3 pr-4 text-sm font-medium text-right whitespace-nowrap sm:pr-0">
                      <Link to={`/admin/criminals/edit/${criminal.id}`} className="text-cyan-400 hover:text-cyan-300">Modifier</Link>
                      <button onClick={() => handleDelete(criminal.id)} className="ml-4 text-red-500 hover:text-red-400">Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;