<?php

namespace App\Http\Requests;

use App\Models\ServiceRequest;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        $serviceRequest = $this->route('serviceRequest');

        return $serviceRequest instanceof ServiceRequest
            && $this->user()?->role === 'client'
            && $serviceRequest->client_id === $this->user()->id;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'stars' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['required', 'string', 'min:10', 'max:2000'],
            'tags' => ['nullable', 'array', 'max:4'],
            'tags.*' => ['string', 'max:40'],
            'is_public' => ['required', 'boolean'],
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

                if (! $serviceRequest instanceof ServiceRequest) {
                    return;
                }

                if ($serviceRequest->status !== 'completed') {
                    $validator->errors()->add(
                        'request',
                        'Отзыв можно оставить только после завершения заявки.',
                    );
                }

                if (! $serviceRequest->vendor_id) {
                    $validator->errors()->add(
                        'request',
                        'У заявки нет выбранной компании для отзыва.',
                    );
                }

                if ($serviceRequest->review()->exists()) {
                    $validator->errors()->add(
                        'request',
                        'По этой заявке отзыв уже оставлен.',
                    );
                }
            },
        ];
    }
}
