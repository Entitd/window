<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequestItemValue extends Model
{
    use HasFactory;

    protected $fillable = ['request_item_id', 'service_parameter_id', 'name', 'type', 'unit', 'text_value', 'number_value', 'boolean_value'];

    protected function casts(): array
    {
        return ['number_value' => 'decimal:4', 'boolean_value' => 'boolean'];
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(RequestItem::class, 'request_item_id');
    }

    public function parameter(): BelongsTo
    {
        return $this->belongsTo(ServiceParameter::class, 'service_parameter_id');
    }
}
