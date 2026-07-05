<?php

namespace App\Http\Controllers;

use App\Models\ServiceRequest;
use App\Models\Vendor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VendorRequestController extends Controller
{
    public function index(Request $request): Response
    {
        $vendor = $this->vendorFor($request);

        $requests = ServiceRequest::query()
            ->with(['client:id,name,phone,email', 'service:id,name'])
            ->where('vendor_id', $vendor->id)
            ->latest()
            ->get()
            ->map(fn (ServiceRequest $serviceRequest) => $this->serializeRequest($serviceRequest))
            ->values();

        return Inertia::render('vendor/requests', [
            'requests' => $requests,
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
        $this->requestForVendor($request, $serviceRequest);

        return $this->transition(
            request: $request,
            serviceRequest: $serviceRequest,
            allowedStatuses: ['in_progress'],
            nextStatus: 'completed',
            label: 'Заявка завершена',
            note: 'Компания отметила заявку как завершенную.',
        );
    }

    private function vendorFor(Request $request): Vendor
    {
        abort_unless($request->user()?->role === 'vendor', 403);

        return $request->user()->vendor()->firstOrFail();
    }

    private function requestForVendor(Request $request, ServiceRequest $serviceRequest): void
    {
        $vendor = $this->vendorFor($request);

        abort_unless($serviceRequest->vendor_id === $vendor->id, 403);
    }

    /**
     * @param array<int, string> $allowedStatuses
     */
    private function transition(
        Request $request,
        ServiceRequest $serviceRequest,
        array $allowedStatuses,
        string $nextStatus,
        string $label,
        string $note,
    ): RedirectResponse {
        if (! in_array($serviceRequest->status, $allowedStatuses, true)) {
            return back()->withErrors([
                'request' => 'Для текущего статуса заявки это действие недоступно.',
            ]);
        }

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
            'width' => $serviceRequest->window_width,
            'height' => $serviceRequest->window_height,
            'service' => $serviceRequest->service?->name ?? 'Услуга',
            'extras' => $serviceRequest->additional_services ?? [],
            'comment' => $serviceRequest->comment ?? 'Комментарий не указан',
            'estimatedPrice' => $serviceRequest->estimated_price
                ? number_format((float) $serviceRequest->estimated_price, 0, ',', ' ').' ₽'
                : 'После уточнения',
            'status' => $serviceRequest->status,
            'clientName' => $serviceRequest->client?->name ?? 'Клиент',
            'clientPhone' => $serviceRequest->client?->phone,
            'clientEmail' => $serviceRequest->client?->email,
        ];
    }
}
