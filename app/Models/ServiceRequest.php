<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * Concrete client request for a window service.
 */
class ServiceRequest extends Model
{
    use HasFactory;

    protected $table = 'requests';

    protected $fillable = [
        'client_id',
        'vendor_id',
        'service_id',
        'calculation_id',
        'city',
        'district',
        'installation_date',
        'window_width',
        'window_height',
        'additional_services',
        'comment',
        'estimated_price',
        'status',
    ];

    protected $casts = [
        'installation_date' => 'date',
        'window_width' => 'integer',
        'window_height' => 'integer',
        'additional_services' => 'array',
        'estimated_price' => 'decimal:2',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(RequestItem::class, 'request_id');
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function calculation(): BelongsTo
    {
        return $this->belongsTo(Calculation::class);
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(ServiceRequestStatusHistory::class)
            ->orderBy('created_at')
            ->orderBy('id');
    }

    public function amendments(): HasMany
    {
        return $this->hasMany(ServiceRequestAmendment::class)
            ->latest('id');
    }

    public function chat(): HasOne
    {
        return $this->hasOne(Chat::class, 'request_id');
    }

    public function cancel(): void
    {
        $this->update(['status' => 'cancelled']);
    }

    public function markInProgress(): void
    {
        $this->update(['status' => 'in_progress']);
    }

    public function complete(): void
    {
        $this->update(['status' => 'completed']);
    }

    public function review(): HasOne
    {
        return $this->hasOne(Review::class, 'request_id');
    }

    public function warranty(): HasOne
    {
        return $this->hasOne(ServiceRequestWarranty::class);
    }
}
