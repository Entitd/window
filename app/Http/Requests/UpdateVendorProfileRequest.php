<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVendorProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'vendor';
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $vendorId = $this->user()?->vendor?->id;

        return [
            'company_name' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'phone' => [
                'required',
                'string',
                'max:50',
                Rule::unique('users', 'phone')->ignore($this->user()?->id),
                Rule::unique('vendors', 'phone')->ignore($vendorId),
            ],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($this->user()?->id),
                Rule::unique('vendors', 'email')->ignore($vendorId),
            ],
            'districts' => ['required', 'string', 'max:500'],
            'description' => ['required', 'string', 'max:2000'],
        ];
    }
}
