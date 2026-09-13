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
                'amendments.proposer',
            ])
            ->when($request->selectedStatus(), fn ($query, string $status) => $query->where('status', $status))
            ->latest()
            ->get()
            ->map(fn (ServiceRequest $serviceRequest) => $this->serializeRequest($serviceRequest))
            ->values();

        return Inertia::render('admin/requests', [
            'requests' => $requests,
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
            'id' => (string) $serviceRequest->id,
            'createdAt' => $serviceRequest->created_at?->format('d.m.Y H:i') ?? '',
            'status' => $serviceRequest->status,
            'service' => $serviceRequest->items->first()?->service_name ?? $serviceRequest->service?->name ?? 'Услуга',
            'clientName' => $serviceRequest->client?->name ?? 'Клиент',
            'clientPhone' => $serviceRequest->client?->phone,
            'clientEmail' => $serviceRequest->client?->email,
            'vendorName' => $serviceRequest->vendor?->company_name,
            'vendorContactName' => $serviceRequest->vendor?->user?->name,
            'city' => $serviceRequest->city,
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
