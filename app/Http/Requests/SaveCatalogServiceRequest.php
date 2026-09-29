<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class SaveCatalogServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        $service = $this->route('service');

        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('services')->ignore($service?->id)],
            'description' => ['nullable', 'string', 'max:2000'],
            'category_id' => ['required', 'integer', 'exists:service_categories,id'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:100000'],
            'is_active' => ['required', 'boolean'],
            'options' => ['required', 'array', 'min:1', 'max:20'],
            'options.*' => ['array:id,name,input_type,pricing_type,is_active'],
            'options.*.id' => ['nullable', 'integer', 'distinct', Rule::exists('service_options', 'id')->where('service_id', $service?->id ?? 0)],
            'options.*.name' => ['required', 'string', 'max:255'],
            'options.*.input_type' => ['required', Rule::in(['selection', 'dimensions'])],
            'options.*.pricing_type' => ['required', Rule::in(['fixed', 'unit', 'sqm', 'quote'])],
            'options.*.is_active' => ['required', 'boolean'],
            'parameters' => ['present', 'array', 'max:50'],
            'parameters.*' => ['array:id,key,name,type,unit,is_required,min_value,max_value,choices,is_active'],
            'parameters.*.id' => ['nullable', 'integer', 'distinct', Rule::exists('service_parameters', 'id')->where('service_id', $service?->id ?? 0)],
            'parameters.*.key' => ['required', 'string', 'regex:/^[a-z][a-z0-9_]{0,79}$/', 'distinct', Rule::notIn(['width', 'height', 'quantity'])],
            'parameters.*.name' => ['required', 'string', 'max:255'],
            'parameters.*.type' => ['required', Rule::in(['number', 'text', 'boolean', 'select'])],
            'parameters.*.unit' => ['nullable', 'string', 'max:30'],
            'parameters.*.is_required' => ['required', 'boolean'],
            'parameters.*.is_active' => ['required', 'boolean'],
            'parameters.*.min_value' => ['nullable', 'numeric', 'between:-9999999999,9999999999'],
            'parameters.*.max_value' => ['nullable', 'numeric', 'between:-9999999999,9999999999'],
            'parameters.*.choices' => ['present', 'array', 'max:100'],
            'parameters.*.choices.*' => ['required', 'string', 'max:255'],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }
            $service = $this->route('service');
            $oldOptions = $service?->options()->withCount('rates')->get()->keyBy('id');
            foreach ($this->input('options', []) as $i => $option) {
                if ($option['pricing_type'] === 'sqm' && $option['input_type'] !== 'dimensions') {
                    $validator->errors()->add("options.$i.input_type", 'Для расчёта за м² нужны ширина и высота.');
                }
                $old = $oldOptions?->get($option['id'] ?? null);
                if ($old && $old->rates_count && ($old->input_type !== $option['input_type'] || $old->pricing_type !== $option['pricing_type'])) {
                    $validator->errors()->add("options.$i.pricing_type", 'Вариант уже выбран вендором. Архивируйте его и добавьте новый.');
                }
            }
            if ($this->boolean('is_active') && ! collect($this->input('options'))->contains(fn ($o) => (bool) $o['is_active'])) {
                $validator->errors()->add('options', 'Для активной услуги нужен хотя бы один активный вариант.');
            }
            $oldParameters = $service?->parameters()->get();
            foreach ($this->input('parameters', []) as $i => $parameter) {
                if ($parameter['type'] === 'select' && count($parameter['choices']) === 0) {
                    $validator->errors()->add("parameters.$i.choices", 'Укажите варианты выбора.');
                }
                if (count(array_unique($parameter['choices'])) !== count($parameter['choices'])) {
                    $validator->errors()->add("parameters.$i.choices", 'Варианты выбора не должны повторяться.');
                }
                if (isset($parameter['min_value'], $parameter['max_value']) && $parameter['min_value'] > $parameter['max_value']) {
                    $validator->errors()->add("parameters.$i.max_value", 'Максимум должен быть не меньше минимума.');
                }
                $old = $oldParameters?->firstWhere('id', $parameter['id'] ?? null);
                if ($old && ($old->key !== $parameter['key'] || $old->type !== $parameter['type'])) {
                    $validator->errors()->add("parameters.$i.type", 'Ключ и тип сохранённого параметра неизменяемы. Добавьте новый параметр.');
                }
                if ($oldParameters?->contains(fn ($p) => $p->key === $parameter['key'] && $p->id !== (int) ($parameter['id'] ?? 0))) {
                    $validator->errors()->add("parameters.$i.key", 'Этот ключ уже используется, в том числе архивным параметром.');
                }
            }
        }];
    }
}
