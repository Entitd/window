<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendorServiceRate extends Model
{
    use HasFactory;

    protected $fillable = ['vendor_service_id', 'service_option_id', 'price', 'is_default'];

    protected function casts(): array
    {
        return ['price' => 'decimal:2', 'is_default' => 'boolean'];
    }

    public function vendorService(): BelongsTo
    {
        return $this->belongsTo(VendorService::class);
    }

    public function option(): BelongsTo
    {
        return $this->belongsTo(ServiceOption::class, 'service_option_id');
    }
}
