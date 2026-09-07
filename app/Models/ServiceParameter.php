<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceParameter extends Model
{
    use HasFactory;

    protected $fillable = ['service_id', 'key', 'name', 'type', 'unit', 'is_required', 'min_value', 'max_value', 'choices', 'is_active'];

    protected function casts(): array
    {
        return ['is_required' => 'boolean', 'is_active' => 'boolean', 'choices' => 'array', 'min_value' => 'float', 'max_value' => 'float'];
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}
