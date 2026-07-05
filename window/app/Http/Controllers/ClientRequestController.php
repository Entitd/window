<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\ServiceRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ClientRequestController extends Controller
{
    public function index(Request $request): Response
    {
        $requests = ServiceRequest::with(['service', 'vendor', 'statusHistories'])
            ->where('client_id', $request->user()->id)
            ->latest()
            ->get()
            ->map(fn (ServiceRequest $serviceRequest) => $this->serializeRequest($serviceRequest))
            ->values();

        return Inertia::render('client/dashboard', [
            'requests' => $requests,
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
        $serviceRequest = ServiceRequest::with(['service', 'vendor', 'statusHistories'])
            ->where('client_id', $request->user()->id)
            ->findOrFail($requestId);

        return Inertia::render('client/request-show', [
            'requestId' => (string) $serviceRequest->id,
            'request' => $this->serializeRequest($serviceRequest),
        ]);
    }

    public function update(Request $request, ServiceRequest $serviceRequest): RedirectResponse
    {
        abort_unless($serviceRequest->client_id === $request->user()->id, 403);

        if (! in_array($serviceRequest->status, ['new', 'awaiting_confirmation'], true)) {
            return back()->withErrors([
                'request' => 'Эту заявку уже нельзя изменить.',
            ]);
        }

        $validated = $request->validate([
            'city' => ['required', 'string', 'max:255'],
            'district' => ['nullable', 'string', 'max:255'],
            'installation_date' => ['nullable', 'date'],
            'window_width' => ['required', 'integer', 'min:1'],
            'window_height' => ['required', 'integer', 'min:1'],
            'additional_services' => ['nullable', 'string', 'max:1000'],
            'comment' => ['nullable', 'string', 'max:2000'],
        ]);

        $additionalServices = collect(explode(',', $validated['additional_services'] ?? ''))
            ->map(fn (string $item) => trim($item))
            ->filter()
            ->values()
            ->all();

        $serviceRequest->update([
            'city' => $validated['city'],
            'district' => $validated['district'] ?: null,
            'installation_date' => $validated['installation_date'] ?: null,
            'window_width' => $validated['window_width'],
            'window_height' => $validated['window_height'],
            'additional_services' => $additionalServices,
            'comment' => $validated['comment'] ?: null,
        ]);

        $this->recordStatusHistory(
            serviceRequest: $serviceRequest,
            actorId: $request->user()->id,
            actorRole: 'client',
            fromStatus: $serviceRequest->status,
            toStatus: $serviceRequest->status,
            label: 'Заявка изменена',
            note: 'Клиент обновил параметры заявки.',
        );

        return back();
    }

    public function repeat(Request $request, ServiceRequest $serviceRequest): RedirectResponse
    {
        abort_unless($serviceRequest->client_id === $request->user()->id, 403);

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
            'service' => $serviceRequest->service?->name ?? 'Услуга',
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
     * @param array<string, mixed> $validated
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
