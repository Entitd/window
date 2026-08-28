<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class District extends Model
{
    protected $fillable = [
        'city_id',
        'name',
        'is_active'
    ];
    
    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function vendors(): BelongsToMany
    {
        return $this->belongsToMany(Vendor::class, 'vendor_districts');
    }
}
