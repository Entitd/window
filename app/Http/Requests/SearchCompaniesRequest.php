<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SearchCompaniesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        $rules = [
            'items' => ['sometimes', 'required', 'array', 'list', 'min:1', 'max:10'],
            'items.*' => ['required', 'array:service_id,option_id,quantity,width,height'],
            'items.*.service_id' => ['required', 'integer', 'distinct'],
            'items.*.quantity' => ['required', 'integer', 'between:1,1000'],
            'items.*.width' => ['nullable', 'numeric', 'between:0.1,10000', 'decimal:0,1'],
            'items.*.height' => ['nullable', 'numeric', 'between:0.1,10000', 'decimal:0,1'],
            'service_id' => ['nullable', 'required_with:option_id', 'integer'],
            'option_id' => ['nullable', 'integer', Rule::exists('service_options', 'id')->where('service_id', $this->integer('service_id'))->where('is_active', true)],
            'width' => ['nullable', 'numeric', 'between:0.1,10000', 'decimal:0,1'],
            'height' => ['nullable', 'numeric', 'between:0.1,10000', 'decimal:0,1'],
            'quantity' => ['nullable', 'integer', 'between:1,1000'],
            'city' => ['nullable', 'string', 'max:255'],
            'installationDate' => ['nullable', 'date'],
            'comment' => ['nullable', 'string', 'max:2000'],
        ];
        foreach (array_slice(is_array($this->input('items')) ? $this->input('items') : [], 0, 10) as $index => $item) {
            $serviceId = is_array($item) && is_numeric($item['service_id'] ?? null) ? (int) $item['service_id'] : 0;
            $rules["items.{$index}.option_id"] = ['nullable', 'integer', Rule::exists('service_options', 'id')->where('service_id', $serviceId)->where('is_active', true)];
        }

        return $rules;
    }

    public function dimensionInMillimetres(string $field): ?int
    {
        return $this->filled($field) ? (int) round((float) $this->validated($field) * 10) : null;
    }
}
