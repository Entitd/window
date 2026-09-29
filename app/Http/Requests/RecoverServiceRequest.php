<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RecoverServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('recover', $this->route('serviceRequest'));
    }

    public function rules(): array
    {
        return ['offering_id' => ['required', 'integer', 'exists:vendor_services,id']];
    }
}
