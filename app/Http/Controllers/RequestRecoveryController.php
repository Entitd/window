<?php

namespace App\Http\Controllers;

use App\Http\Requests\RecoverServiceRequest;
use App\Http\Requests\UpdateRequestAssistanceRequest;
use App\Models\ServiceRequest;
use App\Services\RequestRecovery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class RequestRecoveryController extends Controller
{
    public function show(ServiceRequest $serviceRequest, RequestRecovery $recovery): Response
    {
        Gate::authorize('recover', $serviceRequest);
        $recovery->ensureRecoverable($serviceRequest);

        return Inertia::render('client/request-recovery', ['orderId' => (string) $serviceRequest->id, 'choices' => $recovery->choices($serviceRequest)]);
    }

    public function store(RecoverServiceRequest $request, ServiceRequest $serviceRequest, RequestRecovery $recovery): RedirectResponse
    {
        $replacement = $recovery->recover($serviceRequest, $request->user(), $request->integer('offering_id'));

        return $request->user()->role === 'admin'
            ? redirect()->route('admin.requests')
            : redirect()->route('client.requests.show', $replacement);
    }

    public function assistance(Request $request, ServiceRequest $serviceRequest, RequestRecovery $recovery): RedirectResponse
    {
        Gate::authorize('recover', $serviceRequest);
        $recovery->requestAssistance($serviceRequest);

        return back();
    }

    public function note(UpdateRequestAssistanceRequest $request, ServiceRequest $serviceRequest, RequestRecovery $recovery): RedirectResponse
    {
        $recovery->note($serviceRequest, $request->validated('note'));

        return back();
    }
}
