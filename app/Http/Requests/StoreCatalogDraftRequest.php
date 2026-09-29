<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCatalogDraftRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() === null;
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'rate_id' => ['required_without:items', 'nullable', 'integer', 'exists:vendor_service_rates,id'],
            'items' => ['sometimes', 'required', 'array', 'list', 'min:1', 'max:10'],
            'items.*' => ['required', 'array:rate_id,quantity,width_mm,height_mm,parameters'],
            'items.*.rate_id' => ['required', 'integer', 'distinct', 'exists:vendor_service_rates,id'],
            'items.*.quantity' => ['required', 'integer', 'between:1,1000'],
            'items.*.width_mm' => ['nullable', 'integer', 'between:1,100000'],
            'items.*.height_mm' => ['nullable', 'integer', 'between:1,100000'],
            'items.*.parameters' => ['present', 'array', 'max:100'],
            'items.*.parameters.*' => ['nullable', 'string', 'max:2000'],
            'quantity' => ['nullable', 'integer', 'between:1,1000'],
            'width_mm' => ['nullable', 'integer', 'between:1,100000'],
            'height_mm' => ['nullable', 'integer', 'between:1,100000'],
            'city' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'contact_name' => ['nullable', 'string', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:40'],
            'arrival_from' => ['nullable', 'required_with:arrival_until', 'date_format:H:i'],
            'arrival_until' => ['nullable', 'required_with:arrival_from', 'date_format:H:i', 'after:arrival_from'],
            'district' => ['nullable', 'string', 'max:255'],
            'installation_date' => ['required_with:arrival_from,arrival_until', 'nullable', 'date'],
            'comment' => ['nullable', 'string', 'max:2000'],
            'parameters' => [$this->has('items') ? 'sometimes' : 'present', 'array', 'max:100'],
            'parameters.*' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
