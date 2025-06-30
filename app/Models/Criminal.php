<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Criminal extends Model
{
    use HasFactory;

    protected $fillable = [
        'full_name',
        'alias',
        'date_of_birth',
        'description',
        'crimes_committed',
        'security_level',
        'last_known_location',
        'status',
        'created_by',
    ];

    /**
     * L'admin qui a créé cette fiche.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Les photos associées à ce criminel.
     */
    public function photos(): HasMany
    {
        return $this->hasMany(Photo::class);
    }
      public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }
}