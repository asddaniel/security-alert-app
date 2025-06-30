<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Criminal;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller
{
    /**
     * Enregistre un nouveau signalement pour un criminel.
     * Cette route sera publique.
     */
    public function store(Request $request, Criminal $criminal)
    {
        $validatedData = $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'message' => 'nullable|string|max:2000',
        ]);

        $report = new Report($validatedData);
        $report->criminal_id = $criminal->id;
        $report->ip_address = $request->ip();

        // Si l'utilisateur qui fait le signalement est connecté, on l'associe.
        if (Auth::check()) {
            $report->user_id = Auth::id();
        }

        $report->save();

        // On pourrait déclencher une notification aux admins ici.

        return response()->json([
            'message' => 'Votre signalement a bien été enregistré. Merci pour votre contribution.'
        ], 201);
    }

    /**
     * Liste les signalements. Protégé pour les admins.
     */
    public function index(Request $request)
    {
        // On peut filtrer par criminel ou par statut
        $query = Report::with('criminal:id,full_name', 'user:id,name')->latest();

        if ($request->has('criminal_id')) {
            $query->where('criminal_id', $request->criminal_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $reports = $query->paginate(15);

        return response()->json($reports);
    }
}
