<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceRequestAmendment extends Model
{
    protected $fillable = [
        'service_request_id',
        'proposed_by_user_id',
        'proposed_by_role',
        'changes',
        'status',
        'client_accepted',
        'client_decided_at',
        'vendor_accepted',
        'vendor_decided_at',
        'decided_by_user_id',
        'decided_at',
    ];

    protected function casts(): array
    {
        return [
            'changes' => 'array',
            'client_accepted' => 'boolean',
            'client_decided_at' => 'datetime',
            'vendor_accepted' => 'boolean',
            'vendor_decided_at' => 'datetime',
            'decided_at' => 'datetime',
        ];
    }

    public function serviceRequest(): BelongsTo
    {
        return $this->belongsTo(ServiceRequest::class);
    }

    public function proposer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'proposed_by_user_id');
    }

    public function decider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'decided_by_user_id');
    }
}
