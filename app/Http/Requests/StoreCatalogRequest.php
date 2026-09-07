<?php

namespace App\Http\Requests;

use App\Models\VendorService;
use App\Models\VendorServiceRate;
use App\Services\ServiceCatalog;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCatalogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'client';
    }

    public function rules(ServiceCatalog $catalog): array
    {
        $rate = is_numeric($this->input('rate_id'))
            ? VendorServiceRate::with(['option', 'vendorService.catalogService.parameters'])->find($this->input('rate_id'))
            : null;
        $available = $catalog->availableServiceIds();
        $rules = [
            'rate_id' => ['required', 'integer', Rule::exists('vendor_service_rates', 'id')->whereIn('vendor_service_id', VendorService::whereIn('service_id', $available)->where('is_active', true)->whereHas('vendor', fn ($q) => $q->where('status', 'approved'))->select('id'))],
            'quantity' => ['required', 'integer', 'between:1,1000'],
            'width_mm' => [$rate?->option->input_type === 'dimensions' ? 'required' : 'prohibited', 'nullable', 'integer', 'between:1,100000'],
            'height_mm' => [$rate?->option->input_type === 'dimensions' ? 'required' : 'prohibited', 'nullable', 'integer', 'between:1,100000'],
            'city' => ['required', 'string', 'max:255'],
            'district' => ['nullable', 'string', 'max:255'],
            'installation_date' => ['nullable', 'date', 'after_or_equal:today'],
            'comment' => ['nullable', 'string', 'max:2000'],
            'parameters' => ['present', 'array'],
        ];
        $parameters = $rate?->vendorService->catalogService?->parameters->where('is_active', true) ?? collect();
        $rules['parameters'][] = function (string $attribute, mixed $value, \Closure $fail) use ($parameters): void {
            if (is_array($value) && array_diff(array_keys($value), $parameters->pluck('key')->all())) {
                $fail('Передан неизвестный параметр услуги.');
            }
        };
        foreach ($parameters as $parameter) {
            $field = 'parameters.'.$parameter->key;
            $rules[$field] = [$parameter->is_required ? 'required' : 'nullable'];
            $rules[$field][] = match ($parameter->type) {
                'number' => 'numeric',
                'boolean' => 'boolean',
                default => 'string',
            };
            if ($parameter->type === 'number') {
                $rules[$field][] = 'decimal:0,4';
                $rules[$field][] = 'min:'.($parameter->min_value ?? -9999999999);
                $rules[$field][] = 'max:'.($parameter->max_value ?? 9999999999);
            } elseif ($parameter->type === 'select') {
                $rules[$field][] = Rule::in($parameter->choices);
            } elseif ($parameter->type === 'text') {
                $rules[$field][] = 'max:2000';
            }
        }

        return $rules;
    }
}
