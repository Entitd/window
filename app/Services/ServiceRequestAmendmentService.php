<?php

namespace App\Services;

use App\Models\ServiceRequest;
use App\Models\ServiceRequestAmendment;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ServiceRequestAmendmentService
{
    /** @var array<int, string> */
    private const EditableFields = [
        'city',
        'district',
        'installation_date',
        'window_width',
        'window_height',
        'additional_services',
        'comment',
    ];

    /** @var array<int, string> */
    private const AmendableStatuses = ['new', 'awaiting_confirmation', 'confirmed'];

    /**
     * @param  array<string, mixed>  $data
     */
    public function propose(ServiceRequest $serviceRequest, User $proposer, array $data): ServiceRequestAmendment
    {
        return DB::transaction(function () use ($serviceRequest, $proposer, $data): ServiceRequestAmendment {
            $serviceRequest = ServiceRequest::query()->lockForUpdate()->findOrFail($serviceRequest->id);

            $this->ensureMayAmend($serviceRequest);
            $role = $this->roleFor($serviceRequest, $proposer);
            $changes = $this->changesFor($serviceRequest, $data);

            if ($serviceRequest->items()->exists() && array_intersect(array_keys($changes), ['window_width', 'window_height']) !== []) {
                throw ValidationException::withMessages([
                    'request' => 'Размеры и тариф этой заявки зафиксированы. Можно согласовать дату, адрес, дополнительные работы или комментарий.',
                ]);
            }

            if ($serviceRequest->amendments()->where('status', 'pending')->exists()) {
                throw ValidationException::withMessages([
                    'request' => 'По этой заявке уже ожидаются правки другой стороны.',
                ]);
            }

            if ($changes === []) {
                throw ValidationException::withMessages([
                    'request' => 'Укажите хотя бы одно изменение в заявке.',
                ]);
            }

            $amendment = $serviceRequest->amendments()->create([
                'proposed_by_user_id' => $proposer->id,
                'proposed_by_role' => $role,
                'changes' => $changes,
                'status' => 'pending',
                'client_accepted' => $role === 'client' ? true : null,
                'client_decided_at' => $role === 'client' ? now() : null,
                'vendor_accepted' => $role === 'vendor' ? true : null,
                'vendor_decided_at' => $role === 'vendor' ? now() : null,
            ]);

            $note = match ($role) {
                'client' => 'Клиент ожидает подтверждения правок от компании.',
                'vendor' => 'Компания ожидает подтверждения правок от клиента.',
                default => 'Администратор ожидает подтверждения правок от клиента и компании.',
            };

            if ($role === 'admin' && filled($data['admin_note'] ?? null)) {
                $note .= ' Причина: '.$data['admin_note'];
            }

            $serviceRequest->statusHistories()->create([
                'actor_id' => $proposer->id,
                'actor_role' => $role,
                'from_status' => $serviceRequest->status,
                'to_status' => $serviceRequest->status,
                'label' => 'Предложены правки к заявке',
                'note' => $note,
            ]);

            return $amendment;
        });
    }

    public function decide(
        ServiceRequest $serviceRequest,
        ServiceRequestAmendment $amendment,
        User $decider,
        bool $accept,
    ): void {
        DB::transaction(function () use ($serviceRequest, $amendment, $decider, $accept): void {
            $serviceRequest = ServiceRequest::query()->lockForUpdate()->findOrFail($serviceRequest->id);
            $amendment = ServiceRequestAmendment::query()->lockForUpdate()->findOrFail($amendment->id);

            if ($amendment->service_request_id !== $serviceRequest->id) {
                abort(404);
            }

            $role = $this->roleFor($serviceRequest, $decider);

            if ($role === 'admin') {
                abort(403);
            }

            if ($amendment->status !== 'pending') {
                throw ValidationException::withMessages([
                    'request' => 'Эти правки уже были обработаны.',
                ]);
            }

            $decisionField = $role.'_accepted';
            $decidedAtField = $role.'_decided_at';

            if ($amendment->{$decisionField} !== null) {
                abort(403);
            }

            $this->ensureMayAmend($serviceRequest);

            $amendment->update([
                $decisionField => $accept,
                $decidedAtField => now(),
                'decided_by_user_id' => $decider->id,
                'decided_at' => now(),
            ]);

            if (! $accept) {
                $amendment->update(['status' => 'rejected']);
            } elseif ($amendment->fresh()->client_accepted && $amendment->fresh()->vendor_accepted) {
                $serviceRequest->update(Arr::only($amendment->changes, self::EditableFields));
                $amendment->update(['status' => 'accepted']);
            }

            $status = $amendment->fresh()->status;

            $serviceRequest->statusHistories()->create([
                'actor_id' => $decider->id,
                'actor_role' => $role,
                'from_status' => $serviceRequest->status,
                'to_status' => $serviceRequest->status,
                'label' => ! $accept
                    ? 'Правки отклонены'
                    : ($status === 'accepted' ? 'Правки подтверждены' : 'Правки частично подтверждены'),
                'note' => ! $accept
                    ? 'Изменения в заявке остались без применения.'
                    : ($status === 'accepted'
                        ? 'Изменения в заявке применены после подтверждения обеих сторон.'
                        : 'Ожидается подтверждение второй стороны.'),
            ]);
        });
    }

    private function ensureMayAmend(ServiceRequest $serviceRequest): void
    {
        if (! in_array($serviceRequest->status, self::AmendableStatuses, true)) {
            throw ValidationException::withMessages([
                'request' => 'Эту заявку уже нельзя изменить.',
            ]);
        }

        if (! $serviceRequest->vendor_id) {
            throw ValidationException::withMessages([
                'request' => 'Правки можно согласовать только после выбора компании.',
            ]);
        }
    }

    private function roleFor(ServiceRequest $serviceRequest, User $user): string
    {
        if ($user->role === 'admin') {
            return 'admin';
        }

        if ($user->role === 'client' && $serviceRequest->client_id === $user->id) {
            return 'client';
        }

        if ($user->role === 'vendor' && $serviceRequest->vendor_id === $user->vendor?->id) {
            return 'vendor';
        }

        abort(403);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function changesFor(ServiceRequest $serviceRequest, array $data): array
    {
        $additionalServices = collect(explode(',', (string) ($data['additional_services'] ?? '')))
            ->map(fn (string $item) => trim($item))
            ->filter()
            ->values()
            ->all();

        $proposed = [
            'city' => $data['city'],
            'district' => filled($data['district'] ?? null) ? $data['district'] : null,
            'installation_date' => filled($data['installation_date'] ?? null) ? $data['installation_date'] : null,
            'window_width' => (int) $data['window_width'],
            'window_height' => (int) $data['window_height'],
            'additional_services' => $additionalServices,
            'comment' => filled($data['comment'] ?? null) ? $data['comment'] : null,
        ];

        return collect($proposed)
            ->filter(fn (mixed $value, string $field) => $this->normalizedValue($serviceRequest, $field) !== $value)
            ->all();
    }

    private function normalizedValue(ServiceRequest $serviceRequest, string $field): mixed
    {
        return match ($field) {
            'installation_date' => $serviceRequest->installation_date?->toDateString(),
            'additional_services' => $serviceRequest->additional_services ?? [],
            default => $serviceRequest->getAttribute($field),
        };
    }
}
