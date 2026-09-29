<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
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
        'replacement_request_id',
        'assistance_requested_at',
        'assistance_note',
        'client_id',
        'vendor_id',
        'service_id',
        'calculation_id',
        'city',
        'address',
        'contact_name',
        'contact_phone',
        'arrival_from',
        'arrival_until',
        'district',
        'installation_date',
        'window_width',
        'window_height',
        'additional_services',
        'comment',
        'estimated_price',
        'final_price',
        'work_scope',
        'warranty_terms',
        'status',
    ];

    protected $casts = [
        'installation_date' => 'date',
        'assistance_requested_at' => 'datetime',
        'window_width' => 'integer',
        'window_height' => 'integer',
        'additional_services' => 'array',
        'estimated_price' => 'decimal:2',
        'final_price' => 'decimal:2',
        'warranty_terms' => 'array',
    ];

    public function needsRecovery(): bool
    {
        return $this->replacement_request_id === null && ($this->status === 'rejected'
            || ($this->status === 'new' && ($this->vendor_id === null || $this->created_at->lte(now()->subHours(48)))));
    }

    public function scopeNeedsAttention(Builder $query): void
    {
        $query->where(function ($query) {
            $query->where(function ($unresolved) {
                $unresolved->whereNull('replacement_request_id')->where(function ($pending) {
                    $pending->where('status', 'rejected')
                        ->orWhere(fn ($new) => $new->where('status', 'new')->where(fn ($waiting) => $waiting->whereNull('vendor_id')->orWhere('created_at', '<=', now()->subHours(48))))
                        ->orWhereNotNull('assistance_requested_at');
                });
            })->orWhereHas('warrantyClaims', fn ($claims) => $claims->where('support_requested', true)->where('status', '!=', 'resolved'));
        });
    }

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

    public function photos(): HasMany
    {
        return $this->hasMany(RequestPhoto::class);
    }

    public function warrantyClaims(): HasMany
    {
        return $this->hasMany(WarrantyClaim::class)->latest('id');
    }

    public function warranty(): HasOne
    {
        return $this->hasOne(ServiceRequestWarranty::class);
    }
}
