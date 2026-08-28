<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatMessage extends Model
{
    protected $fillable = [
        'chat_id',
        'sender_id',
        'content',
        'content_type',
        'is_read'
    ];
    
    public const CONTENT_TYPE_TEXT = 'text';

    protected $attributes = [
        'content_type' => self::CONTENT_TYPE_TEXT,
        'is_read' => false,
    ];

    protected function casts(): array
    {
        return [
            'is_read' => 'boolean',
        ];
    }

    public function chat(): BelongsTo
    {
        return $this->belongsTo(Chat::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
