<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class SurvivalAlertTriggered extends Notification implements ShouldQueue
{
    use Queueable;

    protected User $triggeredByUser;
    protected string $customMessage;
    protected ?array $location;

    /**
     * @param User $triggeredByUser L'utilisateur qui a déclenché l'alerte.
     * @param string $customMessage Le message personnalisé de l'alerte.
     * @param array|null $location Coordonnées géographiques ['latitude' => float, 'longitude' => float].
     */
    public function __construct(User $triggeredByUser, string $customMessage, ?array $location)
    {
        $this->triggeredByUser = $triggeredByUser;
        $this->customMessage = $customMessage;
        $this->location = $location;
    }

    public function via(object $notifiable): array
    {
        // Pour l'instant, uniquement par e-mail.
        // On pourrait ajouter 'vonage' pour les SMS, 'slack', etc.
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        Log::alert($this->triggeredByUser);
        $googleMapsUrl = $this->location
            ? "http://maps.google.com/maps?q={$this->location['latitude']},{$this->location['longitude']}"
            : null;

        return (new MailMessage)
                    ->error() // Utilise un template rouge pour signaler l'urgence
                    ->subject("🚨 ALERTE DE SURVIE URGENTE : " . $this->triggeredByUser->name)
                    ->greeting('Alerte de Survie Déclenchée !')
                    ->line("L'utilisateur **{$this->triggeredByUser->name}** a déclenché une alerte de survie et vous a désigné comme contact d'urgence.")
                    ->line("Message de l'utilisateur :")
                    ->line("> *{$this->customMessage}*")
                    ->when($googleMapsUrl, function ($mail, $url) {
                        $mail->line("La dernière position connue a été enregistrée.")
                             ->action('Voir sur la carte', $url);
                    })
                    ->line("Veuillez prendre les mesures appropriées immédiatement.")
                    ->line("Ceci est un message automatisé envoyé par la plateforme SecurityAlert.");
    }

    // toVonage, toTelegram etc. pourraient être ajoutés ici.
}
