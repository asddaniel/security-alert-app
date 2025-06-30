import { useAuthStore } from "@/stores/useAuthStore";

// Définition des types pour nos options de requête
interface RequestOptions extends RequestInit {
    body?: any;
}

// L'URL de base de notre API Laravel
const API_BASE_URL = location.origin+"/api" //  (import.meta as any).env.VITE_BACKEND_URL  //'http://localhost:8000/api';

// Notre fonction apiClient qui remplace l'instance Axios
export const apiClient = async <T>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<T> => {
    const { method = 'GET', headers: customHeaders, body, ...restOptions } = options;
    const token = useAuthStore.getState().token; // On récupère le token depuis le store
    // Configuration des en-têtes par défaut
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...customHeaders,
    };

     if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Configuration de la requête
    const config: RequestInit = {
        method,
        headers,
        // Important pour que Sanctum fonctionne avec les cookies
        credentials: 'include',
        ...restOptions,
    };

    // Si un corps de requête est fourni, on le stringify
    if (body) {
        config.body = JSON.stringify(body);
    }

  // Exécution de la requête
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Gestion des erreurs HTTP
    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch {
            errorData = { message: `Une erreur HTTP est survenue: ${response.statusText}` };
        }

        // On "throw" l'objet d'erreur entier pour accéder aux détails (comme 'errors' de Laravel)
        throw errorData;
    }

    // On retourne la réponse au format JSON
    return response.json() as Promise<T>;
};
