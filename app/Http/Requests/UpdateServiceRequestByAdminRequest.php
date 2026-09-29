<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateServiceRequestByAdminRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'city' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'contact_name' => ['nullable', 'string', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:40'],
            'arrival_from' => ['nullable', 'required_with:arrival_until', 'date_format:H:i'],
            'arrival_until' => ['nullable', 'required_with:arrival_from', 'date_format:H:i', 'after:arrival_from'],
            'district' => ['nullable', 'string', 'max:255'],
            'installation_date' => ['required_with:arrival_from,arrival_until', 'nullable', 'date'],
            'window_width' => ['required', 'integer', 'min:0'],
            'window_height' => ['required', 'integer', 'min:0'],
            'additional_services' => ['nullable', 'string', 'max:1000'],
            'comment' => ['nullable', 'string', 'max:2000'],
            'admin_note' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
