<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLegacyServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'client';
    }

    public function rules(): array
    {
        return [
            'vendor_id' => [
                'nullable',
                Rule::exists('vendors', 'id')->where('status', 'approved'),
            ],
            'service_id' => ['nullable', 'exists:services,id'],
            'service_key' => [
                'required_without:service_id',
                'string',
                Rule::in(['glass_replacement', 'window_installation', 'balcony_block', 'measurement', 'repair']),
            ],
            'city' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'contact_name' => ['nullable', 'string', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:40'],
            'arrival_from' => ['nullable', 'required_with:arrival_until', 'date_format:H:i'],
            'arrival_until' => ['nullable', 'required_with:arrival_from', 'date_format:H:i', 'after:arrival_from'],
            'district' => ['nullable', 'string', 'max:255'],
            'installation_date' => ['required_with:arrival_from,arrival_until', 'nullable', 'date'],
            'window_width' => ['required', 'integer', 'min:1'],
            'window_height' => ['required', 'integer', 'min:1'],
            'additional_services' => ['nullable', 'array'],
            'comment' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
