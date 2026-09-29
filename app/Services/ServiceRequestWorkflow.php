<?php

namespace App\Services;

use App\Models\ServiceRequest;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ServiceRequestWorkflow
{
    public function __construct(private WarrantyIssuer $warranties) {}

    /** @param array<int, string> $allowedStatuses */
    public function transition(
        ServiceRequest $serviceRequest,
        User $actor,
        array $allowedStatuses,
        string $nextStatus,
        string $label,
        string $note,
        ?Vendor $warrantyVendor = null,
    ): void {
        DB::transaction(function () use ($serviceRequest, $actor, $allowedStatuses, $nextStatus, $label, $note, $warrantyVendor): void {
            $serviceRequest = ServiceRequest::query()->lockForUpdate()->findOrFail($serviceRequest->id);
            if (! in_array($serviceRequest->status, $allowedStatuses, true)) {
                throw ValidationException::withMessages(['request' => 'Для текущего статуса заявки это действие недоступно.']);
            }
            if (in_array($nextStatus, ['in_progress', 'completed'], true)
                && $serviceRequest->amendments()->where('status', 'pending')->exists()) {
                throw ValidationException::withMessages(['request' => 'Сначала подтвердите или отклоните все предложенные правки.']);
            }

            $fromStatus = $serviceRequest->status;
            $serviceRequest->update(['status' => $nextStatus]);
            $serviceRequest->statusHistories()->create([
                'actor_id' => $actor->id,
                'actor_role' => 'vendor',
                'from_status' => $fromStatus,
                'to_status' => $nextStatus,
                'label' => $label,
                'note' => $note,
            ]);
            if ($nextStatus === 'completed' && $warrantyVendor) {
                $this->warranties->issue($serviceRequest, $warrantyVendor);
            }
        });
    }
}
