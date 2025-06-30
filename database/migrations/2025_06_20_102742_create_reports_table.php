<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('criminal_id')->constrained()->onDelete('cascade');
            // Un signalement peut être fait par un utilisateur connecté ou un visiteur anonyme
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');

            // On stocke la latitude et la longitude
            $table->decimal('latitude', 10, 8); // Précision suffisante pour la plupart des usages
            $table->decimal('longitude', 11, 8);

            $table->text('message')->nullable(); // Message optionnel de l'utilisateur
            $table->string('ip_address')->nullable(); // On peut stocker l'IP pour des raisons de sécurité

            // Les admins pourront valider ou rejeter un signalement
            $table->enum('status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null'); // L'admin qui a traité le signalement
            $table->timestamp('reviewed_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
