<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VendorService extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_id',
        'service_id',
        'service_name',
        'description',
        'min_price',
        'price_type',
        'is_active',
    ];

    protected $casts = [
        'min_price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function catalogService(): BelongsTo
    {
        return $this->belongsTo(Service::class, 'service_id');
    }

    public function rates(): HasMany
    {
        return $this->hasMany(VendorServiceRate::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }
}
