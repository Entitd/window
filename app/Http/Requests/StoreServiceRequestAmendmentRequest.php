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
            'city' => ['required', 'string', 'max:255'],
            'district' => ['nullable', 'string', 'max:255'],
            'installation_date' => ['nullable', 'date'],
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
