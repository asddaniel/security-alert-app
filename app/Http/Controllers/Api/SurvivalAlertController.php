<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SurvivalAlert;
use App\Notifications\SurvivalAlertTriggered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Log;

class SurvivalAlertController extends Controller
{
    /**
     * Récupère ou crée la configuration de l'alerte pour l'utilisateur authentifié.
     */
    public function show(Request $request)
    {
        // 'firstOrCreate' est parfait ici. Si l'alerte n'existe pas, elle est créée avec des valeurs par défaut.
        $alert = SurvivalAlert::firstOrCreate(
            ['user_id' => $request->user()->id],
            [
                'message' => "J'ai besoin d'aide d'urgence. C'est ma dernière position connue.",
                'emergency_contacts' => [], // L'utilisateur devra les ajouter
            ]
        );
        return response()->json($alert);
    }

    /**
     * Met à jour la configuration de l'alerte.
     */
 public function update(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:1000',
            'emergency_contacts' => 'present|array', // 'present' valide même si le tableau est vide
            'emergency_contacts.*.name' => 'required|string|max:255',
            // Chaque contact doit avoir au moins un email ou un téléphone
            'emergency_contacts.*.email' => 'nullable|email|required_without:emergency_contacts.*.phone',
            // Valide un format de téléphone international simple (ex: +33612345678)
            'emergency_contacts.*.phone' => 'nullable|string|required_without:emergency_contacts.*.email|regex:/^\+[1-9]\d{1,14}$/',
        ], [
            'emergency_contacts.*.phone.regex' => 'Le format du téléphone est invalide. Utilisez le format international (ex: +33612345678).'
        ]);

        $alert = SurvivalAlert::updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        return response()->json($alert);
    }

    /**
     * Déclenche l'alerte de survie.
     */
    public function trigger(Request $request)
    {
        Log::alert($request->all());
        $user = $request->user();
        Log::alert($user);
        Log::alert("ici l'utilisateur");
        if(!$user){
            return response()->json([
                "unhauthenticated"
            ], 403);
        }
        $alert = $user->survivalAlert;
        log::alert($alert);
        Log::alert("ici le message ");
        if (!$alert || empty($alert->emergency_contacts)) {
            return response()->json(['message' => 'Votre alerte de survie n\'est pas configurée ou n\'a aucun contact d\'urgence.'], 422);
        }

        $validated = $request->validate([
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        $location = isset($validated['latitude']) ? $validated : null;
        Log::alert($alert->emergency_contacts);
        Log::alert("le contact d'urgence ici");
        // On envoie la notification à chaque contact
        // On utilise l'envoi de notification "On-Demand" car les contacts ne sont pas des utilisateurs de notre système
        foreach ($alert->emergency_contacts as $contact) {
            Notification::route('mail', $contact['email'])
                        ->notify(new SurvivalAlertTriggered($user, $alert->message, $location));

         Notification::send($user, new SurvivalAlertTriggered($user, $alert->message, $location));
         
        }

        // Mettre à jour le statut de l'alerte
        $alert->status = 'triggered';
        $alert->last_triggered_at = now();
        $alert->save();

        return response()->json(['message' => 'Alerte de survie déclenchée. Les contacts d\'urgence ont été notifiés.']);
    }
}
