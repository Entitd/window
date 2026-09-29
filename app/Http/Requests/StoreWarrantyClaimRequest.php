<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreWarrantyClaimRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'client'
            && $this->route('serviceRequest')->client_id === $this->user()->id;
    }

    public function rules(): array
    {
        return ['description' => ['required', 'string', 'min:10', 'max:5000'], 'support_requested' => ['sometimes', 'boolean']];
    }
}
