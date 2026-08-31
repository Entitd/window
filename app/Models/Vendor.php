<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vendor extends Model
{
    protected $fillable = [
        'user_id',
        'company_name',
        'description',
        'city',
        'phone',
        'email',
        'logo',
        'status',
        'moderation_note',
        'moderated_at',
        'moderated_by',
    ];
    
    protected function casts(): array
    {
        return [
            'moderated_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function districts(): BelongsToMany
    {
        return $this->belongsToMany(District::class, 'vendor_districts');
    }

    public function serviceRequests(): HasMany
    {
        return $this->hasMany(ServiceRequest::class);
    }

    public function services(): HasMany
    {
        return $this->hasMany(VendorService::class);
    }

    public function moderator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'moderated_by');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'vendor_id');
    }

}
