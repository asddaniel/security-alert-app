<?php
// database/migrations/xxxx_xx_xx_xxxxxx_create_survival_alerts_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('survival_alerts', function (Blueprint $table) {
            $table->id();
            // Chaque utilisateur ne peut avoir qu'une seule configuration d'alerte
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');

            // Les contacts d'urgence (e-mails, numéros de téléphone)
            // On utilise JSON pour stocker une liste flexible de contacts
            $table->json('emergency_contacts')->nullable();

            // Le message personnalisé à envoyer
            $table->text('message')->nullable();

            // Statut de l'alerte (active, inactive, déclenchée)
            $table->enum('status', ['inactive', 'active', 'triggered'])->default('inactive');
            $table->timestamp('last_triggered_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('survival_alerts');
    }
};
