// src/pages/admin/CriminalForm.tsx
import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../api/apiClient';

// En supposant que vos composants UI viennent d'une bibliothèque comme ShadCN/UI
// Si ce n'est pas le cas, remplacez-les par vos propres composants ou des balises HTML standard.
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Helper pour l'URL de base de l'API (à mettre dans un fichier .env.local)
// VITE_API_BASE_URL=http://localhost:8000
const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8000';

interface ExistingPhoto {
    id: number;
    path: string;
    label: string | null;
}

const ImagePreview = ({ file, onRemove }: { file: File, onRemove: () => void }) => (
    <div className="relative">
        <img src={URL.createObjectURL(file)} alt={file.name} className="object-cover w-24 h-24 rounded-md" />
        <button type="button" onClick={onRemove} className="absolute top-0 right-0 flex items-center justify-center w-6 h-6 text-xs text-white bg-red-600 rounded-full">X</button>
    </div>
);

const CriminalForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState({
        full_name: '',
        alias: '',
        date_of_birth: '',
        description: '',
        crimes_committed: '',
        security_level: 'medium',
        status: 'at_large',
        last_known_location: '',
        photos: [] as ExistingPhoto[],
    });

    const [newPhotos, setNewPhotos] = useState<File[]>([]);
    const [newPhotoLabels, setNewPhotoLabels] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, any>>({});

    useEffect(() => {
        if (isEditing && id) {
            setIsLoading(true);
            apiClient(`/criminals/${id}`)
                .then(data => {
                    const { created_at, updated_at, ...criminalData } = data as any;
                    setFormData({
                        ...criminalData,
                        date_of_birth: criminalData.date_of_birth ? criminalData.date_of_birth.split('T')[0] : '',
                    });
                })
                .catch(err => setErrors({ form: 'Impossible de charger les données. ' + err.message }))
                .finally(() => setIsLoading(false));
        }
    }, [id, isEditing]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: 'security_level' | 'status') => (value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setNewPhotos(prev => [...prev, ...files]);
            setNewPhotoLabels(prev => [...prev, ...Array(files.length).fill('')]);
        }
    };

    const removeNewPhoto = (index: number) => {
        setNewPhotos(prev => prev.filter((_, i) => i !== index));
        setNewPhotoLabels(prev => prev.filter((_, i) => i !== index));
    };

    const handleLabelChange = (index: number, value: string) => {
        setNewPhotoLabels(prev => prev.map((label, i) => (i === index ? value : label)));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        try {
            if (isEditing) {
                const { photos, ...updateData } = formData;
                await apiClient(`/criminals/${id}`, { method: 'PUT', body: updateData });
            } else {
                const data = new FormData();
                const { photos, ...textData } = formData;
                Object.entries(textData).forEach(([key, value]) => {
                    if (value) data.append(key, value as string);
                });
                newPhotos.forEach((photo, index) => {
                    data.append(`photos[${index}][file]`, photo);
                    if (newPhotoLabels[index]) data.append(`photos[${index}][label]`, newPhotoLabels[index]);
                });
                await uploadWithFormData('/criminals', data);
            }
            navigate('/admin/dashboard');
        } catch (err: any) {
            if (err.response && err.response.data && err.response.data.errors) {
                setErrors(err.response.data.errors);
            } else {
                setErrors({ form: err.message || 'Une erreur est survenue.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const uploadWithFormData = async (endpoint: string, data: FormData) => {
        const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
            method: 'POST',
            body: data,
            credentials: 'include',
            headers: { 'Accept': 'application/json' },
        });
        const responseData = await response.json();
        if (!response.ok) {
            const error: any = new Error(responseData.message || 'Erreur serveur');
            error.response = { data: responseData };
            throw error;
        }
        return responseData;
    };

    if (isLoading && isEditing) return <div>Chargement de la fiche...</div>;

    return (
        <form onSubmit={handleSubmit} className="p-4 space-y-8 text-white bg-gray-800 rounded-lg md:p-8">
            <h1 className="text-3xl font-bold">{isEditing ? 'Modifier la fiche' : 'Ajouter une nouvelle fiche'}</h1>
            {errors.form && <p className="p-3 text-red-300 bg-red-900 rounded-md">{errors.form}</p>}

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                    <Input label="Nom complet" name="full_name" value={formData.full_name} onChange={handleChange} error={errors.full_name} required />
                </div>
                <div className="sm:col-span-3">
                    <Input label="Aliase" name="alias" value={formData.alias} onChange={handleChange} error={errors.alias} />
                </div>

                <div className="sm:col-span-3">
                    <Input type="date" label="Date de naissance" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} error={errors.date_of_birth} />
                </div>
                <div className="sm:col-span-3">
                    <Input label="Dernière localisation connue" name="last_known_location" value={formData.last_known_location} onChange={handleChange} error={errors.last_known_location} />
                </div>

                <div className="sm:col-span-full">
                    <Textarea label="Description" name="description" value={formData.description} onChange={handleChange} error={errors.description} required  />
                </div>

                <div className="sm:col-span-full">
                    <Textarea label="Crimes commis" name="crimes_committed" value={formData.crimes_committed} onChange={handleChange} error={errors.crimes_committed} required  />
                </div>

                <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-300">Niveau de sécurité</label>
                    <Select name="security_level" value={formData.security_level} onValueChange={handleSelectChange('security_level')}>
                        <SelectTrigger className="mt-1 bg-gray-700 border-gray-600">
                            <SelectValue placeholder="Sélectionner un niveau" />
                        </SelectTrigger>
                        <SelectContent className="text-white bg-gray-700 border-gray-600">
                            <SelectItem value="low">Bas</SelectItem>
                            <SelectItem value="medium">Moyen</SelectItem>
                            <SelectItem value="high">Élevé</SelectItem>
                            <SelectItem value="critical">Critique</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.security_level && <p className="mt-2 text-sm text-red-500">{errors.security_level}</p>}
                </div>

                <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-300">Statut</label>
                    <Select name="status" value={formData.status} onValueChange={handleSelectChange('status')}>
                        <SelectTrigger className="mt-1 bg-gray-700 border-gray-600">
                            <SelectValue placeholder="Sélectionner un statut" />
                        </SelectTrigger>
                        <SelectContent className="text-white bg-gray-700 border-gray-600">
                            <SelectItem value="at_large">En fuite</SelectItem>
                            <SelectItem value="captured">Capturé</SelectItem>
                            <SelectItem value="deceased">Décédé</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.status && <p className="mt-2 text-sm text-red-500">{errors.status}</p>}
                </div>
            </div>

            {isEditing && formData.photos.length > 0 && (
                <div>
                    <h2 className="text-lg font-medium text-gray-300">Photos actuelles</h2>
                    <p className="text-sm text-gray-400">La modification des photos n'est pas supportée sur cet écran.</p>
                    <div className="flex flex-wrap gap-4 mt-4">
                        {formData.photos.map(photo => (
                            <div key={photo.id}>
                                <img src={`${API_BASE_URL}/storage/${photo.path}`} alt={photo.label || 'Photo'} className="object-cover w-24 h-24 rounded-md" />
                                <p className="w-24 mt-1 text-xs text-center text-gray-300 truncate">{photo.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!isEditing && (
                <div>
                    <label className="block text-sm font-medium text-gray-300">Photos (max 5)</label>
                    <div className="flex items-center justify-center px-6 py-10 mt-2 border border-gray-500 border-dashed rounded-lg">
                        <div className="text-center">
                            <input type="file" name="photos" onChange={handlePhotoChange} multiple accept="image/png, image/jpeg, image/webp" className="sr-only" id="photo-upload" />
                            <label htmlFor="photo-upload" className="font-semibold cursor-pointer text-cyan-500 hover:text-cyan-400">
                                <span>Uploader des fichiers</span>
                            </label>
                            <p className="text-xs leading-5 text-gray-400">PNG, JPG, WEBP jusqu'à 2Mo</p>
                        </div>
                    </div>
                    {errors.photos && <p className="mt-2 text-sm text-red-500">{Array.isArray(errors.photos) ? errors.photos[0] : errors.photos}</p>}
                    <div className="flex flex-wrap gap-4 mt-4">
                        {newPhotos.map((file, index) => (
                            <div key={index}>
                                <ImagePreview file={file} onRemove={() => removeNewPhoto(index)} />
                                <Input label="Label (optionnel)" name={`label-${index}`} value={newPhotoLabels[index]} onChange={e => handleLabelChange(index, e.target.value)} className="w-24 mt-2" />
                                {errors[`photos.${index}.file`] && <p className="mt-1 text-xs text-red-500">{errors[`photos.${index}.file`]}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="pt-5">
                <div className="flex justify-end gap-x-3">
                    <Button type="button" onClick={() => navigate('/admin/dashboard')} >Annuler</Button>
                    <Button type="submit" disabled={isLoading}>{isLoading ? 'Enregistrement...' : (isEditing ? 'Enregistrer les modifications' : 'Créer la fiche')}</Button>
                </div>
            </div>
        </form>
    );
};

export default CriminalForm;
