<?php
// database/migrations/xxxx_xx_xx_xxxxxx_create_criminals_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('criminals', function (Blueprint $table) {
            $table->id();
            $table->string('full_name');
            $table->string('alias')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->text('description'); // Description générale
            $table->text('crimes_committed'); // Description des crimes
            $table->enum('security_level', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->string('last_known_location')->nullable();
            $table->enum('status', ['at_large', 'captured', 'deceased'])->default('at_large'); // Statut du criminel
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade'); // L'admin qui a créé la fiche
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('criminals');
    }
};