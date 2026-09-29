<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRequestPhotosRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('uploadPhotos', $this->route('serviceRequest'));
    }

    public function rules(): array
    {
        return [
            'photos' => ['required', 'array', 'min:1', 'max:5'],
            'photos.*' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'extensions:jpg,jpeg,png,webp', 'max:5120', 'dimensions:max_width=12000,max_height=12000'],
        ];
    }
}
