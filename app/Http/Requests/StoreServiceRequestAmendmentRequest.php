<?php

namespace App\Http\Requests;

use App\Models\ServiceRequest;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreServiceRequestAmendmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $serviceRequest = $this->route('serviceRequest');
        $user = $this->user();

        if (! $serviceRequest instanceof ServiceRequest || ! $user) {
            return false;
        }

        if ($user->role === 'client') {
            return $serviceRequest->client_id === $user->id;
        }

        return $user->role === 'vendor'
            && $serviceRequest->vendor_id === $user->vendor?->id;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'final_price' => [$this->user()->role === 'vendor' ? 'nullable' : 'prohibited', 'required_with:work_scope', 'numeric', 'decimal:0,2', 'min:0', 'max:99999999.99'],
            'work_scope' => [$this->user()->role === 'vendor' ? 'nullable' : 'prohibited', 'required_with:final_price', 'string', 'max:5000'],
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
        ];
    }

    /**
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $serviceRequest = $this->route('serviceRequest');

                if (
                    $serviceRequest instanceof ServiceRequest
                    && $serviceRequest->items()->exists()
                    && (! $this->has('city') || ! $this->has('window_height'))
                ) {
                    $validator->errors()->add(
                        'request',
                        'Параметры и тариф этой заявки зафиксированы. Для другого расчёта создайте новую заявку из каталога.',
                    );
                }
            },
        ];
    }
}
