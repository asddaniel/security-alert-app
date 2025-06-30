<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SurvivalAlert extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'emergency_contacts',
        'message',
        'status',
        'last_triggered_at',
    ];

    protected $casts = [
        // 'emergency_contacts' sera automatiquement encodé/décodé en JSON
        'emergency_contacts' => 'array',
        'last_triggered_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
