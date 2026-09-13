<?php

namespace App\Models;

use Database\Factories\ServiceRequestWarrantyFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceRequestWarranty extends Model
{
    /** @use HasFactory<ServiceRequestWarrantyFactory> */
    use HasFactory;

    protected $fillable = [
        'service_request_id',
        'vendor_id',
        'company_name',
        'contact_phone',
        'contact_email',
        'starts_at',
        'expires_at',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'date',
            'expires_at' => 'date',
        ];
    }

    public function serviceRequest(): BelongsTo
    {
        return $this->belongsTo(ServiceRequest::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }
}
