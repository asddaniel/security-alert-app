
import { useState, useEffect, FormEvent } from 'react';
import { apiClient } from '../api/apiClient';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { XCircleIcon, PlusCircleIcon } from '@heroicons/react/20/solid';
import toast from 'react-hot-toast';

interface Contact {
  name: string;
  email: string;
}

interface SurvivalAlertConfig {
  message: string;
  emergency_contacts: Contact[];
}

const ProfilePage = () => {
  const [config, setConfig] = useState<SurvivalAlertConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    apiClient<SurvivalAlertConfig>('/survival-alert')
      .then(setConfig)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleContactChange = (index: number, field: 'name' | 'email', value: string) => {
    if (!config) return;
    const updatedContacts = [...config.emergency_contacts];
    updatedContacts[index][field] = value;
    setConfig({ ...config, emergency_contacts: updatedContacts });
  };

  const addContact = () => {
    if (!config) return;
    setConfig({
      ...config,
      emergency_contacts: [...config.emergency_contacts, { name: '', email: '' }],
    });
  };

  const removeContact = (index: number) => {
    if (!config) return;
    setConfig({
      ...config,
      emergency_contacts: config.emergency_contacts.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setIsSaving(true);
    const toastId = toast.loading("Enregistrement de la configuration...");
    setSaveSuccess(false);
    try {
      await apiClient('/survival-alert', {
        method: 'PUT',
        body: config,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Une erreur est survenue.");
      toast.error("une erreur est survenue");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !config) return <div>Chargement de votre profil...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="mb-6 text-3xl font-bold text-white">Mon Profil & Alerte de Survie</h1>

      <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg">
        <div>
          <h2 className="text-xl font-semibold text-cyan-400">Message d'Urgence</h2>
          <p className="mt-1 mb-4 text-sm text-gray-400">Ce message sera envoyé à vos contacts d'urgence lorsque vous déclencherez l'alerte.</p>
          <textarea
            value={config.message}
            onChange={(e) => setConfig({ ...config, message: e.target.value })}
            rows={4}
            className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-cyan-500 sm:text-sm"
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-cyan-400">Contacts d'Urgence</h2>
          <p className="mt-1 mb-4 text-sm text-gray-400">Les personnes à notifier en cas d'urgence.</p>
          <div className="space-y-4">
            {config.emergency_contacts.map((contact, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-md bg-gray-700/50">
                <Input
                  label={`Nom Contact ${index + 1}`}
                  value={contact.name}
                  onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                  className="flex-1"
                  required
                />
                <Input
                  label={`Email Contact ${index + 1}`}
                  type="email"
                  value={contact.email}
                  onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                  className="flex-1"
                  required
                />
                <button type="button" onClick={() => removeContact(index)} className="mt-6 text-red-500 hover:text-red-400">
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>
            ))}
          </div>
          <Button type="button" onClick={addContact} className="w-auto mt-4 bg-gray-600 hover:bg-gray-500">
            Ajouter un contact
          </Button>
        </div>

        <div className="flex items-center justify-end gap-4">
          {saveSuccess && <p className="text-sm text-green-400">Configuration enregistrée !</p>}
          <Button type="submit" isLoading={isSaving}>
            Enregistrer la Configuration
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
