<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RequestItem extends Model
{
    use HasFactory;

    protected $fillable = ['request_id', 'service_id', 'service_option_id', 'service_name', 'option_name', 'pricing_type', 'quantity', 'width_mm', 'height_mm', 'unit_price', 'total_price'];

    protected function casts(): array
    {
        return ['unit_price' => 'decimal:2', 'total_price' => 'decimal:2'];
    }

    public function request(): BelongsTo
    {
        return $this->belongsTo(ServiceRequest::class, 'request_id');
    }

    public function values(): HasMany
    {
        return $this->hasMany(RequestItemValue::class);
    }
}
