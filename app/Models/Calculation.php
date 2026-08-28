<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Calculation extends Model
{
    protected $fillable = [
        'user_id',
        'city',
        'district',
        'installation_date',
        'window_width',
        'window_height',
        'service_type',
        'additional_services',
        'comment',
        'estimated_price',
    ];

    protected function casts(): array
    {
        return [
            'installation_date' => 'date',
            'window_width' => 'decimal:2',
            'window_height' => 'decimal:2',
            'additional_services' => 'array',
            'estimated_price' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
