<?php

namespace App\Services;

use App\Models\ServiceRequest;
use App\Models\User;
use App\Models\WarrantyClaim;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class WarrantyClaimService
{
    /** @param array{description: string, support_requested?: bool} $data */
    public function create(ServiceRequest $order, array $data): void
    {
        DB::transaction(function () use ($order, $data): void {
            $order = ServiceRequest::query()->lockForUpdate()->findOrFail($order->id);
            if ($order->status !== 'completed' || ! $order->warranty()->exists()) {
                throw ValidationException::withMessages(['description' => 'Обращение доступно после выполнения заказа и выдачи гарантии.']);
            }
            if ($order->warrantyClaims()->where('status', '!=', 'resolved')->exists()) {
                throw ValidationException::withMessages(['description' => 'По заказу уже есть открытое обращение. При необходимости запросите поддержку.']);
            }
            $order->warrantyClaims()->create([...$data, 'status' => 'open']);
        });
    }

    /** @param array{response: string, status: string} $data */
    public function respond(WarrantyClaim $claim, User $user, array $data): void
    {
        $claim->update([...$data, 'responded_by' => $user->id, 'responded_at' => now()]);
    }

    public function escalate(WarrantyClaim $claim, User $user): void
    {
        abort_unless($user->role === 'client' && $claim->serviceRequest->client_id === $user->id, 403);
        $claim->update(['support_requested' => true, 'status' => 'open']);
    }
}
