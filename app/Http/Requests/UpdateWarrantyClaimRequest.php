<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateWarrantyClaimRequest extends FormRequest
{
    public function authorize(): bool
    {
        $order = $this->route('serviceRequest');

        return $this->user()?->role === 'admin'
            || ($this->user()?->role === 'vendor' && $order->vendor_id === $this->user()->vendor?->id);
    }

    public function rules(): array
    {
        return ['response' => ['required', 'string', 'max:5000'], 'status' => ['required', Rule::in(['in_progress', 'resolved'])]];
    }
}
