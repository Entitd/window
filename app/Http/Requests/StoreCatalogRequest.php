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
        $lines = $this->has('items') ? $this->input('items') : [$this->only(['rate_id'])];
        $rates = VendorServiceRate::with(['option', 'vendorService.catalogService.parameters'])
            ->whereIn('id', collect(is_array($lines) ? $lines : [])->pluck('rate_id')->filter(fn ($id) => is_numeric($id))->all())->get()->keyBy('id');
        $available = $catalog->availableServiceIds();
        $rules = [
            'city' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'contact_name' => ['nullable', 'string', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:40'],
            'arrival_from' => ['nullable', 'required_with:arrival_until', 'date_format:H:i'],
            'arrival_until' => ['nullable', 'required_with:arrival_from', 'date_format:H:i', 'after:arrival_from'],
            'district' => ['nullable', 'string', 'max:255'],
            'installation_date' => ['required_with:arrival_from,arrival_until', 'nullable', 'date', 'after_or_equal:today'],
            'comment' => ['nullable', 'string', 'max:2000'],
        ];
        if ($this->has('items')) {
            $rules['items'] = ['required', 'array', 'list', 'min:1', 'max:10'];
            $rules['items.*'] = ['required', 'array:rate_id,quantity,width_mm,height_mm,parameters'];
            $rules['items.*.rate_id'] = [...$this->itemRules(null, $available, 'items.*.')['items.*.rate_id'], 'distinct'];
            foreach (array_slice(is_array($lines) ? $lines : [], 0, 10) as $index => $line) {
                $rateId = is_array($line) ? ($line['rate_id'] ?? null) : null;
                $itemRules = $this->itemRules(is_numeric($rateId) ? $rates->get($rateId) : null, $available, "items.{$index}.");
                unset($itemRules["items.{$index}.rate_id"]);
                $rules += $itemRules;
            }
        } else {
            $rules += $this->itemRules($rates->first(), $available);
        }

        return $rules;
    }

    /** @return array<string, array<int, mixed>> */
    private function itemRules(?VendorServiceRate $rate, array $available, string $prefix = ''): array
    {
        $rules = [
            $prefix.'rate_id' => ['required', 'integer', Rule::exists('vendor_service_rates', 'id')->whereIn('vendor_service_id', VendorService::whereIn('service_id', $available)->where('is_active', true)->whereHas('vendor', fn ($q) => $q->where('status', 'approved'))->select('id'))],
            $prefix.'quantity' => ['required', 'integer', 'between:1,1000'],
            $prefix.'width_mm' => [$rate?->option->input_type === 'dimensions' ? 'required_with:'.$prefix.'height_mm' : 'prohibited', 'nullable', 'integer', 'between:1,100000'],
            $prefix.'height_mm' => [$rate?->option->input_type === 'dimensions' ? 'required_with:'.$prefix.'width_mm' : 'prohibited', 'nullable', 'integer', 'between:1,100000'],
            $prefix.'parameters' => ['present', 'array'],
        ];
        $parameters = $rate?->vendorService->catalogService?->parameters->where('is_active', true) ?? collect();
        $rules[$prefix.'parameters'][] = function (string $attribute, mixed $value, \Closure $fail) use ($parameters): void {
            if (is_array($value) && array_diff(array_keys($value), $parameters->pluck('key')->all())) {
                $fail('Передан неизвестный параметр услуги.');
            }
        };
        foreach ($parameters as $parameter) {
            $field = $prefix.'parameters.'.$parameter->key;
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
