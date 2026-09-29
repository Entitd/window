<?php

namespace App\Http\Controllers;

use App\Http\Requests\FilterServiceRequestsRequest;
use App\Http\Requests\UpdateServiceRequestByAdminRequest;
use App\Models\ServiceRequest;
use App\Services\ServiceRequestAmendmentService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AdminRequestController extends Controller
{
    public function __construct(private ServiceRequestAmendmentService $amendments) {}

    public function index(FilterServiceRequestsRequest $request): Response
    {
        $this->authorizeAdmin($request);

        $requests = ServiceRequest::query()
            ->with([
                'client:id,name,email,phone',
                'vendor.user:id,name,email,phone',
                'service:id,name',
                'items',
                'photos', 'warrantyClaims.responder', 'amendments.proposer',
            ])
            ->when($request->selectedStatus(), fn ($query, string $status) => $query->where('status', $status))
            ->when($request->boolean('needs_attention'), fn ($query) => $query->needsAttention())
            ->latest()
            ->get()
            ->map(fn (ServiceRequest $serviceRequest) => $this->serializeRequest($serviceRequest))
            ->values();

        return Inertia::render('admin/requests', [
            'requests' => $requests,
            'needsAttention' => $request->boolean('needs_attention'),
            'selectedStatus' => $request->selectedStatus(),
        ]);
    }

    public function update(
        UpdateServiceRequestByAdminRequest $request,
        ServiceRequest $serviceRequest,
    ): RedirectResponse {
        $this->amendments->propose($serviceRequest, $request->user(), $request->validated());

        return back();
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeRequest(ServiceRequest $serviceRequest): array
    {
        $pendingAmendment = $serviceRequest->amendments->firstWhere('status', 'pending');

        return [
            'needsRecovery' => $serviceRequest->needsRecovery(),
            'replacementRequestId' => $serviceRequest->replacement_request_id,
            'assistanceRequested' => $serviceRequest->assistance_requested_at !== null,
            'assistanceNote' => $serviceRequest->assistance_note,
            'photos' => $serviceRequest->photos->map(fn ($photo) => ['id' => $photo->id])->values(),
            'warrantyClaims' => $serviceRequest->warrantyClaims->map(fn ($claim) => [
                'id' => $claim->id, 'description' => $claim->description, 'status' => $claim->status,
                'supportRequested' => $claim->support_requested, 'response' => $claim->response,
                'responder' => $claim->responder?->role === 'admin' ? 'Поддержка сервиса' : 'Компания',
                'createdAt' => $claim->created_at->format('d.m.Y H:i'),
            ])->values(),
            'id' => (string) $serviceRequest->id,
            'createdAt' => $serviceRequest->created_at?->format('d.m.Y H:i') ?? '',
            'status' => $serviceRequest->status,
            'service' => $serviceRequest->items->isNotEmpty() ? $serviceRequest->items->pluck('service_name')->unique()->join(', ') : ($serviceRequest->service?->name ?? 'Услуга'),
            'clientName' => $serviceRequest->client?->name ?? 'Клиент',
            'clientPhone' => $serviceRequest->client?->phone,
            'clientEmail' => $serviceRequest->client?->email,
            'vendorName' => $serviceRequest->vendor?->company_name,
            'vendorContactName' => $serviceRequest->vendor?->user?->name,
            'city' => $serviceRequest->city,
            'final_price' => $serviceRequest->final_price,
            'work_scope' => $serviceRequest->work_scope,
            'address' => $serviceRequest->address,
            'contact_name' => $serviceRequest->contact_name,
            'contact_phone' => $serviceRequest->contact_phone,
            'arrival_from' => $serviceRequest->arrival_from,
            'arrival_until' => $serviceRequest->arrival_until,
            'district' => $serviceRequest->district,
            'installationDate' => $serviceRequest->installation_date?->format('d.m.Y') ?? 'Не выбрана',
            'installationDateValue' => $serviceRequest->installation_date?->format('Y-m-d'),
            'width' => $serviceRequest->window_width,
            'height' => $serviceRequest->window_height,
            'itemsCount' => $serviceRequest->items->count(),
            'extras' => $serviceRequest->additional_services ?? [],
            'comment' => $serviceRequest->comment,
            'estimatedPrice' => $serviceRequest->estimated_price
                ? number_format((float) $serviceRequest->estimated_price, 0, ',', ' ').' ₽'
                : 'После уточнения',
            'pendingAmendment' => $pendingAmendment
                ? [
                    'proposedByRole' => $pendingAmendment->proposed_by_role,
                    'proposedByName' => $pendingAmendment->proposer?->name ?? 'Другая сторона',
                    'clientAccepted' => $pendingAmendment->client_accepted,
                    'vendorAccepted' => $pendingAmendment->vendor_accepted,
                ]
                : null,
        ];
    }

    private function authorizeAdmin(FilterServiceRequestsRequest $request): void
    {
        abort_unless($request->user()?->role === 'admin', 403);
    }
}
