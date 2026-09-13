<?php

namespace App\Http\Controllers;

use App\Http\Requests\FilterServiceRequestsRequest;
use App\Http\Requests\StoreServiceRequestAmendmentRequest;
use App\Models\Service;
use App\Models\ServiceRequest;
use App\Models\ServiceRequestAmendment;
use App\Services\ServiceRequestAmendmentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ClientRequestController extends Controller
{
    public function __construct(private ServiceRequestAmendmentService $amendments) {}

    public function index(FilterServiceRequestsRequest $request): Response
    {
        $requests = ServiceRequest::with(['service', 'vendor', 'warranty', 'statusHistories', 'review', 'items.values', 'amendments.proposer'])
            ->where('client_id', $request->user()->id)
            ->when($request->selectedStatus(), fn ($query, string $status) => $query->where('status', $status))
            ->latest()
            ->get()
            ->map(fn (ServiceRequest $serviceRequest) => $this->serializeRequest($serviceRequest))
            ->values();

        return Inertia::render('client/dashboard', [
            'requests' => $requests,
            'selectedStatus' => $request->selectedStatus(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'vendor_id' => [
                'nullable',
                Rule::exists('vendors', 'id')->where('status', 'approved'),
            ],
            'service_id' => ['nullable', 'exists:services,id'],
            'service_key' => [
                'required_without:service_id',
                'string',
                Rule::in(array_keys($this->serviceNamesByKey())),
            ],
            'city' => ['required', 'string', 'max:255'],
            'district' => ['nullable', 'string', 'max:255'],
            'installation_date' => ['nullable', 'date'],
            'window_width' => ['required', 'integer', 'min:1'],
            'window_height' => ['required', 'integer', 'min:1'],
            'additional_services' => ['nullable', 'array'],
            'comment' => ['nullable', 'string', 'max:2000'],
        ]);

        $service = $this->resolveService($validated);
        if ($service->category_id !== null) {
            return redirect()->route('catalog.index', ['service_id' => $service->id]);
        }
        $this->ensureSelectedVendorMatchesRequest(
            $validated['vendor_id'] ?? null,
            $service->name,
            $validated['district'] ?? null,
        );
        $estimatedPrice = $this->estimatePrice(
            $validated['vendor_id'] ?? null,
            $service->name,
        );
        unset($validated['service_key']);

        $serviceRequest = ServiceRequest::create([
            ...$validated,
            'service_id' => $service->id,
            'client_id' => $request->user()->id,
            'status' => 'new',
            'estimated_price' => $estimatedPrice,
        ]);

        if ($serviceRequest->vendor_id !== null) {
            $serviceRequest->chat()->create([
                'client_id' => $serviceRequest->client_id,
                'vendor_id' => $serviceRequest->vendor_id,
            ]);
        }

        $this->recordStatusHistory(
            serviceRequest: $serviceRequest,
            actorId: $request->user()->id,
            actorRole: 'client',
            fromStatus: null,
            toStatus: 'new',
            label: 'Заявка создана',
            note: 'Клиент создал заявку через форму подбора.',
        );

        return redirect()->route('client.requests.show', $serviceRequest->id);
    }

    public function show(Request $request, string $requestId): Response
    {
        $serviceRequest = ServiceRequest::with(['service', 'vendor', 'warranty', 'statusHistories', 'review', 'items.values', 'amendments.proposer'])
            ->where('client_id', $request->user()->id)
            ->findOrFail($requestId);

        return Inertia::render('client/request-show', [
            'requestId' => (string) $serviceRequest->id,
            'request' => $this->serializeRequest($serviceRequest),
        ]);
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

    public function repeat(Request $request, ServiceRequest $serviceRequest): RedirectResponse
    {
        abort_unless($serviceRequest->client_id === $request->user()->id, 403);

        if ($serviceRequest->items()->exists()) {
            return redirect()->route('catalog.index', ['service_id' => $serviceRequest->service_id]);
        }

        $serviceRequest->loadMissing(['service', 'vendor']);

        $vendorId = $serviceRequest->vendor?->status === 'approved'
            ? $serviceRequest->vendor_id
            : null;

        $repeatedRequest = ServiceRequest::create([
            'client_id' => $request->user()->id,
            'vendor_id' => $vendorId,
            'service_id' => $serviceRequest->service_id,
            'calculation_id' => $serviceRequest->calculation_id,
            'city' => $serviceRequest->city,
            'district' => $serviceRequest->district,
            'installation_date' => $serviceRequest->installation_date,
            'window_width' => $serviceRequest->window_width,
            'window_height' => $serviceRequest->window_height,
            'additional_services' => $serviceRequest->additional_services ?? [],
            'comment' => $serviceRequest->comment,
            'estimated_price' => $vendorId && $serviceRequest->service
                ? $this->estimatePrice($vendorId, $serviceRequest->service->name)
                : null,
            'status' => 'new',
        ]);

        $this->recordStatusHistory(
            serviceRequest: $repeatedRequest,
            actorId: $request->user()->id,
            actorRole: 'client',
            fromStatus: null,
            toStatus: 'new',
            label: 'Заявка повторена',
            note: "Клиент создал эту заявку на основе {$serviceRequest->id}.",
        );

        return redirect()->route('client.requests.show', $repeatedRequest->id);
    }

    public function cancel(Request $request, ServiceRequest $serviceRequest): RedirectResponse
    {
        abort_unless($serviceRequest->client_id === $request->user()->id, 403);

        if (! in_array($serviceRequest->status, ['new', 'awaiting_confirmation', 'confirmed'], true)) {
            return back()->withErrors([
                'request' => 'Эту заявку уже нельзя отменить.',
            ]);
        }

        $fromStatus = $serviceRequest->status;
        $serviceRequest->cancel();
        $this->recordStatusHistory(
            serviceRequest: $serviceRequest,
            actorId: $request->user()->id,
            actorRole: 'client',
            fromStatus: $fromStatus,
            toStatus: 'cancelled',
            label: 'Заявка отменена',
            note: 'Клиент отменил заявку в личном кабинете.',
        );

        return back();
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeRequest(ServiceRequest $serviceRequest): array
    {
        return [
            'id' => (string) $serviceRequest->id,
            'status' => $serviceRequest->status,
            'service' => $serviceRequest->items->first()?->service_name ?? $serviceRequest->service?->name ?? 'Услуга',
            'items' => $serviceRequest->items,
            'dimensionUnit' => $serviceRequest->items->isNotEmpty() ? 'мм' : 'см',
            'city' => $serviceRequest->city,
            'district' => $serviceRequest->district ?? 'Не указан',
            'address' => $serviceRequest->district ?? 'Адрес уточняется',
            'width' => $serviceRequest->window_width,
            'height' => $serviceRequest->window_height,
            'installationDate' => $serviceRequest->installation_date
                ? $serviceRequest->installation_date->format('d.m.Y')
                : 'Не выбрана',
            'installationDateValue' => $serviceRequest->installation_date?->format('Y-m-d'),
            'districtValue' => $serviceRequest->district,
            'estimatedPrice' => $serviceRequest->estimated_price
                ? number_format((float) $serviceRequest->estimated_price, 0, ',', ' ').' ₽'
                : 'После уточнения',
            'createdAt' => $serviceRequest->created_at?->format('d.m.Y H:i'),
            'company' => $serviceRequest->vendor?->company_name,
            'extras' => $serviceRequest->additional_services ?? [],
            'comment' => $serviceRequest->comment ?? 'Комментарий не указан',
            'commentValue' => $serviceRequest->comment,
            'pendingAmendment' => $this->serializePendingAmendment($serviceRequest),
            'warranty' => $serviceRequest->warranty
                ? [
                    'companyName' => $serviceRequest->warranty->company_name,
                    'contactPhone' => $serviceRequest->warranty->contact_phone,
                    'contactEmail' => $serviceRequest->warranty->contact_email,
                    'startsAt' => $serviceRequest->warranty->starts_at->format('d.m.Y'),
                    'expiresAt' => $serviceRequest->warranty->expires_at->format('d.m.Y'),
                    'description' => $serviceRequest->warranty->description,
                ]
                : null,
            'review' => $serviceRequest->review
                ? [
                    'id' => (string) $serviceRequest->review->id,
                    'stars' => $serviceRequest->review->stars,
                    'comment' => $serviceRequest->review->comment,
                    'tags' => $serviceRequest->review->tags ?? [],
                    'isPublic' => $serviceRequest->review->is_public,
                    'status' => $serviceRequest->review->status,
                    'createdAt' => $serviceRequest->review->created_at?->format('d.m.Y H:i'),
                ]
                : null,
            'history' => $serviceRequest->statusHistories->isNotEmpty()
                ? $serviceRequest->statusHistories->map(fn ($history) => [
                    'label' => $history->label,
                    'timestamp' => $history->created_at?->format('d.m.Y H:i'),
                    'note' => $history->note ?? '',
                ])->values()
                : [
                    [
                        'label' => 'Заявка создана',
                        'timestamp' => $serviceRequest->created_at?->format('d.m.Y H:i'),
                        'note' => 'Клиент создал заявку через форму подбора.',
                    ],
                ],
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

    /**
     * @param  array<string, mixed>  $validated
     */
    private function resolveService(array $validated): Service
    {
        if (isset($validated['service_id'])) {
            return Service::findOrFail($validated['service_id']);
        }

        $serviceName = $this->serviceNamesByKey()[$validated['service_key']];

        return Service::firstOrCreate(
            ['name' => $serviceName],
            [
                'description' => null,
                'is_active' => true,
            ],
        );
    }

    /**
     * @return array<string, string>
     */
    private function serviceNamesByKey(): array
    {
        return [
            'glass_replacement' => 'Замена стеклопакета',
            'window_installation' => 'Установка окна',
            'balcony_block' => 'Балконный блок',
            'measurement' => 'Замер',
            'repair' => 'Ремонт и регулировка',
        ];
    }

    private function estimatePrice(?int $vendorId, string $serviceName): ?string
    {
        if (! $vendorId) {
            return null;
        }

        $price = DB::table('vendor_services')
            ->where('vendor_id', $vendorId)
            ->where('service_name', $serviceName)
            ->where('is_active', true)
            ->value('min_price');

        return $price === null ? null : (string) $price;
    }

    private function ensureSelectedVendorMatchesRequest(
        ?int $vendorId,
        string $serviceName,
        ?string $district,
    ): void {
        if (! $vendorId) {
            return;
        }

        $hasActiveService = DB::table('vendor_services')
            ->where('vendor_id', $vendorId)
            ->where('service_name', $serviceName)
            ->where('is_active', true)
            ->exists();

        if (! $hasActiveService) {
            throw ValidationException::withMessages([
                'vendor_id' => 'Выбранная компания не оказывает эту активную услугу.',
            ]);
        }

        if (! $district) {
            return;
        }

        $districtName = trim((string) preg_replace('/\s*район\s*/iu', '', $district));
        $worksInDistrict = DB::table('vendor_districts')
            ->join('districts', 'districts.id', '=', 'vendor_districts.district_id')
            ->where('vendor_districts.vendor_id', $vendorId)
            ->where('districts.name', 'like', "%{$districtName}%")
            ->exists();

        if (! $worksInDistrict) {
            throw ValidationException::withMessages([
                'vendor_id' => 'Выбранная компания не работает в указанном районе.',
            ]);
        }
    }

    private function recordStatusHistory(
        ServiceRequest $serviceRequest,
        int $actorId,
        string $actorRole,
        ?string $fromStatus,
        string $toStatus,
        string $label,
        string $note,
    ): void {
        $serviceRequest->statusHistories()->create([
            'actor_id' => $actorId,
            'actor_role' => $actorRole,
            'from_status' => $fromStatus,
            'to_status' => $toStatus,
            'label' => $label,
            'note' => $note,
        ]);
    }
}
