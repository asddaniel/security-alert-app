<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Criminal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class CriminalController extends Controller
{
    /**
     * Affiche la liste des criminels.
     */
    public function index()
    {
        // On charge les relations 'photos' et 'creator' pour éviter les N+1 queries
        $criminals = Criminal::with('photos', 'creator:id,name')->latest()->paginate(10);
        return response()->json($criminals);
    }

    /**
     * Enregistre un nouveau criminel.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'full_name' => 'required|string|max:255',
            'alias' => 'nullable|string|max:255',
            'date_of_birth' => 'nullable|date',
            'description' => 'required|string',
            'crimes_committed' => 'required|string',
            'security_level' => ['required', Rule::in(['low', 'medium', 'high', 'critical'])],
            'last_known_location' => 'nullable|string|max:255',
            'status' => ['required', Rule::in(['at_large', 'captured', 'deceased'])],
            'photos' => 'nullable|array|max:5', // Limite à 5 photos par upload
            'photos.*.file' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048', // 2MB max par photo
            'photos.*.label' => 'nullable|string|max:255',
        ]);

        $criminal = new Criminal($validatedData);
        $criminal->created_by = $request->user()->id;
        $criminal->save();

        if ($request->has('photos')) {
            foreach ($request->photos as $photoData) {
                // Le fichier est uploadé dans 'storage/app/public/criminals'
                $path = $photoData['file']->store('criminals', 'public');
                $criminal->photos()->create([
                    'path' => $path,
                    'label' => $photoData['label'] ?? null,
                ]);
            }
        }

        return response()->json($criminal->load('photos'), 201);
    }

    /**
     * Affiche un criminel spécifique.
     */
    public function show(Criminal $criminal)
    {
        return response()->json($criminal->load('photos', 'creator:id,name'));
    }

    /**
     * Met à jour un criminel. (La mise à jour des photos sera gérée séparément pour la simplicité)
     */
    public function update(Request $request, Criminal $criminal)
    {
        $validatedData = $request->validate([
            'full_name' => 'required|string|max:255',
            'alias' => 'nullable|string|max:255',
            'date_of_birth' => 'nullable|date',
            'description' => 'required|string',
            'crimes_committed' => 'required|string',
            'security_level' => ['required', Rule::in(['low', 'medium', 'high', 'critical'])],
            'last_known_location' => 'nullable|string|max:255',
            'status' => ['required', Rule::in(['at_large', 'captured', 'deceased'])],
        ]);

        $criminal->update($validatedData);

        // TODO: Ajouter la logique pour ajouter/supprimer des photos existantes.
        // On le fera dans une étape ultérieure pour ne pas complexifier.

        return response()->json($criminal->load('photos'));
    }

    /**
     * Supprime un criminel.
     */
    public function destroy(Criminal $criminal)
    {
        // Supprimer les photos associées du stockage
        foreach ($criminal->photos as $photo) {
            Storage::disk('public')->delete($photo->path);
        }

        $criminal->delete();

        return response()->noContent();
    }
}