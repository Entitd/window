<?php

namespace App\Http\Controllers;

use App\Http\Requests\FilterServiceRequestsRequest;
use App\Http\Requests\StoreServiceRequestAmendmentRequest;
use App\Models\ChatMessage;
use App\Models\ServiceRequest;
use App\Models\ServiceRequestAmendment;
use App\Models\Vendor;
use App\Services\ServiceRequestAmendmentService;
use App\Services\WarrantyIssuer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class VendorRequestController extends Controller
{
    public function __construct(
        private ServiceRequestAmendmentService $amendments,
        private WarrantyIssuer $warranties,
    ) {}

    public function index(FilterServiceRequestsRequest $request): Response
    {
        $vendor = $this->vendorFor($request);

        $requests = ServiceRequest::query()
            ->with([
                'client:id,name,phone,email',
                'service:id,name',
                'items.values',
                'chat.messages.sender:id,name,email',
                'amendments.proposer',
            ])
            ->where('vendor_id', $vendor->id)
            ->when($request->selectedStatus(), fn ($query, string $status) => $query->where('status', $status))
            ->latest()
            ->get()
            ->map(fn (ServiceRequest $serviceRequest) => $this->serializeRequest($serviceRequest))
            ->values();

        return Inertia::render('vendor/requests', [
            'requests' => $requests,
            'selectedStatus' => $request->selectedStatus(),
        ]);
    }

    public function accept(Request $request, ServiceRequest $serviceRequest): RedirectResponse
    {
        $this->requestForVendor($request, $serviceRequest);

        return $this->transition(
            request: $request,
            serviceRequest: $serviceRequest,
            allowedStatuses: ['new'],
            nextStatus: 'confirmed',
            label: 'Заявка принята',
            note: 'Компания приняла заявку в работу.',
        );
    }

    public function reject(Request $request, ServiceRequest $serviceRequest): RedirectResponse
    {
        $this->requestForVendor($request, $serviceRequest);

        return $this->transition(
            request: $request,
            serviceRequest: $serviceRequest,
            allowedStatuses: ['new', 'confirmed'],
            nextStatus: 'rejected',
            label: 'Заявка отклонена',
            note: 'Компания отклонила заявку.',
        );
    }

    public function start(Request $request, ServiceRequest $serviceRequest): RedirectResponse
    {
        $this->requestForVendor($request, $serviceRequest);

        return $this->transition(
            request: $request,
            serviceRequest: $serviceRequest,
            allowedStatuses: ['confirmed'],
            nextStatus: 'in_progress',
            label: 'Заявка взята в работу',
            note: 'Компания начала выполнение или согласование деталей.',
        );
    }

    public function complete(Request $request, ServiceRequest $serviceRequest): RedirectResponse
    {
        $vendor = $this->requestForVendor($request, $serviceRequest);

        return $this->transition(
            request: $request,
            serviceRequest: $serviceRequest,
            allowedStatuses: ['in_progress'],
            nextStatus: 'completed',
            label: 'Заявка завершена',
            note: 'Компания отметила заявку как завершенную.',
            warrantyVendor: $vendor,
        );
    }

    public function update(StoreServiceRequestAmendmentRequest $request, ServiceRequest $serviceRequest): RedirectResponse
    {
        $this->amendments->propose($serviceRequest, $request->user(), $request->validated());

        return back();
    }

    public function acceptAmendment(
        Request $request,
        ServiceRequest $serviceRequest,
        ServiceRequestAmendment $amendment,
    ): RedirectResponse {
        $this->amendments->decide($serviceRequest, $amendment, $request->user(), true);

        return back();
    }

    public function rejectAmendment(
        Request $request,
        ServiceRequest $serviceRequest,
        ServiceRequestAmendment $amendment,
    ): RedirectResponse {
        $this->amendments->decide($serviceRequest, $amendment, $request->user(), false);

        return back();
    }

    private function vendorFor(Request $request): Vendor
    {
        abort_unless($request->user()?->role === 'vendor', 403);

        return $request->user()->vendor()->firstOrFail();
    }

    private function requestForVendor(Request $request, ServiceRequest $serviceRequest): Vendor
    {
        $vendor = $this->vendorFor($request);

        abort_unless($serviceRequest->vendor_id === $vendor->id, 403);

        return $vendor;
    }

    /**
     * @param  array<int, string>  $allowedStatuses
     */
    private function transition(
        Request $request,
        ServiceRequest $serviceRequest,
        array $allowedStatuses,
        string $nextStatus,
        string $label,
        string $note,
        ?Vendor $warrantyVendor = null,
    ): RedirectResponse {
        if (! in_array($serviceRequest->status, $allowedStatuses, true)) {
            return back()->withErrors([
                'request' => 'Для текущего статуса заявки это действие недоступно.',
            ]);
        }

        DB::transaction(function () use ($label, $nextStatus, $note, $request, $serviceRequest, $warrantyVendor): void {
            $fromStatus = $serviceRequest->status;
            $serviceRequest->update(['status' => $nextStatus]);
            $serviceRequest->statusHistories()->create([
                'actor_id' => $request->user()->id,
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

        return back();
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeRequest(ServiceRequest $serviceRequest): array
    {
        return [
            'id' => (string) $serviceRequest->id,
            'createdAt' => $serviceRequest->created_at?->format('d.m.Y H:i') ?? '',
            'district' => $serviceRequest->district ?? 'Не указан',
            'city' => $serviceRequest->city,
            'installationDate' => $serviceRequest->installation_date
                ? $serviceRequest->installation_date->format('d.m.Y')
                : 'Не выбрана',
            'installationDateValue' => $serviceRequest->installation_date?->format('Y-m-d'),
            'width' => $serviceRequest->window_width,
            'height' => $serviceRequest->window_height,
            'service' => $serviceRequest->items->first()?->service_name ?? $serviceRequest->service?->name ?? 'Услуга',
            'items' => $serviceRequest->items,
            'dimensionUnit' => $serviceRequest->items->isNotEmpty() ? 'мм' : 'см',
            'extras' => $serviceRequest->additional_services ?? [],
            'comment' => $serviceRequest->comment ?? 'Комментарий не указан',
            'districtValue' => $serviceRequest->district,
            'commentValue' => $serviceRequest->comment,
            'estimatedPrice' => $serviceRequest->estimated_price
                ? number_format((float) $serviceRequest->estimated_price, 0, ',', ' ').' ₽'
                : 'После уточнения',
            'status' => $serviceRequest->status,
            'clientName' => $serviceRequest->client?->name ?? 'Клиент',
            'clientPhone' => $serviceRequest->client?->phone,
            'clientEmail' => $serviceRequest->client?->email,
            'pendingAmendment' => $this->serializePendingAmendment($serviceRequest),
            'chat' => $serviceRequest->chat
                ? [
                    'id' => (string) $serviceRequest->chat->id,
                    'messages' => $serviceRequest->chat->messages
                        ->map(fn (ChatMessage $message) => [
                            'id' => (string) $message->id,
                            'author' => $message->sender_id === $serviceRequest->client_id
                                ? 'client'
                                : 'vendor',
                            'text' => $message->content ?? '',
                            'sentAt' => $message->created_at?->format('d.m.Y H:i') ?? '',
                            'isRead' => $message->is_read,
                        ])
                        ->values(),
                ]
                : null,
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function serializePendingAmendment(ServiceRequest $serviceRequest): ?array
    {
        $amendment = $serviceRequest->amendments->firstWhere('status', 'pending');

        if (! $amendment) {
            return null;
        }

        return [
            'id' => (string) $amendment->id,
            'proposedByRole' => $amendment->proposed_by_role,
            'proposedByName' => $amendment->proposer?->name ?? 'Другая сторона',
            'clientAccepted' => $amendment->client_accepted,
            'vendorAccepted' => $amendment->vendor_accepted,
            'changes' => $this->serializeAmendmentChanges($amendment->changes ?? []),
        ];
    }

    /**
     * @param  array<string, mixed>  $changes
     * @return array<int, array{label: string, value: string}>
     */
    private function serializeAmendmentChanges(array $changes): array
    {
        $labels = [
            'city' => 'Город',
            'district' => 'Район',
            'installation_date' => 'Дата работ',
            'window_width' => 'Ширина, см',
            'window_height' => 'Высота, см',
            'additional_services' => 'Дополнительные работы',
            'comment' => 'Комментарий',
        ];

        return collect($changes)
            ->map(fn (mixed $value, string $field) => [
                'label' => $labels[$field],
                'value' => match ($field) {
                    'additional_services' => implode(', ', $value),
                    'installation_date' => $value ? Carbon::parse($value)->format('d.m.Y') : 'Не выбрана',
                    default => filled($value) ? (string) $value : 'Не указан',
                },
            ])
            ->values()
            ->all();
    }
}
