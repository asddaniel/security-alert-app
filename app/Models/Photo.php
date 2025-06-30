<?php
// app/Models/Photo.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Photo extends Model
{
    use HasFactory;

    protected $fillable = [
        'criminal_id',
        'path',
        'label',
    ];

    /**
     * Le criminel auquel cette photo appartient.
     */
    public function criminal(): BelongsTo
    {
        return $this->belongsTo(Criminal::class);
    }
}