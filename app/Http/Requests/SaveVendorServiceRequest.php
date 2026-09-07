<?php

namespace App\Http\Requests;

use App\Models\Service;
use App\Services\ServiceCatalog;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class SaveVendorServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        $offering = $this->route('service');

        return $this->user()?->role === 'vendor'
            && (! $offering || $offering->vendor_id === $this->user()->vendor?->id);
    }

    public function rules(ServiceCatalog $catalog): array
    {
        return [
            'service_id' => ['required', 'integer', Rule::exists('services', 'id')->where('is_active', true)->whereIn('category_id', $catalog->activeCategoryIds()), Rule::unique('vendor_services')->where('vendor_id', $this->user()->vendor?->id)->ignore($this->route('service')?->id)],
            'description' => ['nullable', 'string', 'max:2000'],
            'is_active' => ['required', 'boolean'],
            'rates' => ['required', 'array', 'min:1', 'max:20'],
            'rates.*' => ['array:service_option_id,price,is_default'],
            'rates.*.service_option_id' => ['required', 'integer', 'distinct', Rule::exists('service_options', 'id')->where('service_id', $this->input('service_id'))->where('is_active', true)],
            'rates.*.price' => ['nullable', 'numeric', 'min:0', 'max:9999999', 'decimal:0,2'],
            'rates.*.is_default' => ['required', 'boolean'],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }
            $service = Service::with('options')->findOrFail($this->input('service_id'));
            if (collect($this->input('rates'))->filter(fn ($r) => (bool) $r['is_default'])->count() !== 1) {
                $validator->errors()->add('rates', 'Выберите ровно один вариант по умолчанию.');
            }
            foreach ($this->input('rates') as $i => $rate) {
                $option = $service->options->firstWhere('id', (int) $rate['service_option_id']);
                if ($option->pricing_type !== 'quote' && ! isset($rate['price'])) {
                    $validator->errors()->add("rates.$i.price", 'Укажите тариф.');
                }
            }
        }];
    }
}
