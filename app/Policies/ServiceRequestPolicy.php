<?php

namespace App\Policies;

use App\Models\ServiceRequest;
use App\Models\User;

class ServiceRequestPolicy
{
    public function view(User $user, ServiceRequest $serviceRequest): bool
    {
        return $user->role === 'admin'
            || ($user->role === 'client' && $serviceRequest->client_id === $user->id)
            || ($user->role === 'vendor' && $serviceRequest->vendor_id === $user->vendor?->id);
    }

    public function recover(User $user, ServiceRequest $serviceRequest): bool
    {
        return $user->role === 'admin' || ($user->role === 'client' && $serviceRequest->client_id === $user->id);
    }

    public function uploadPhotos(User $user, ServiceRequest $serviceRequest): bool
    {
        return $user->role === 'client' && $serviceRequest->client_id === $user->id
            && in_array($serviceRequest->status, ['new', 'awaiting_confirmation', 'confirmed'], true);
    }
}
