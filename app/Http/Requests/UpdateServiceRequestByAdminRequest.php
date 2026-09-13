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
            'district' => ['nullable', 'string', 'max:255'],
            'installation_date' => ['nullable', 'date'],
            'window_width' => ['required', 'integer', 'min:0'],
            'window_height' => ['required', 'integer', 'min:0'],
            'additional_services' => ['nullable', 'string', 'max:1000'],
            'comment' => ['nullable', 'string', 'max:2000'],
            'admin_note' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
