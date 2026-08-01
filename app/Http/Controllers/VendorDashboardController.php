<?php

namespace App\Http\Controllers;

use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class VendorDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->role === 'vendor', 403);

        $vendor = $request->user()
            ->vendor()
            ->with('districts:id,name')
            ->firstOrFail();

        $vendorRequests = ServiceRequest::query()
            ->with(['client:id,name,phone,email', 'service:id,name'])
            ->where('vendor_id', $vendor->id)
            ->latest()
            ->get()
            ->map(fn (ServiceRequest $serviceRequest) => $this->serializeRequest($serviceRequest))
            ->values();

        return Inertia::render('vendor/dashboard', [
            'vendorProfile' => [
                'companyName' => $vendor->company_name,
                'description' => $vendor->description ?? '',
                'phone' => $vendor->phone,
                'email' => $vendor->email,
                'city' => $vendor->city,
                'districts' => $vendor->districts->pluck('name')->values(),
                'moderationStatus' => $vendor->status,
                'moderationNote' => $vendor->moderation_note
                    ?? match ($vendor->status) {
                        'approved' => 'Профиль подтвержден, карточка может показываться клиентам.',
                        'rejected' => 'Профиль отклонен. Проверьте комментарий администратора.',
                        default => 'Профиль отправлен на модерацию и пока не показывается клиентам.',
                    },
                'logo' => $vendor->logo ?? Str::substr($vendor->company_name, 0, 2),
                'gallery' => [],
            ],
            'vendorServices' => $vendor->services()
                ->latest()
                ->get()
                ->map(fn ($service) => [
                    'id' => (string) $service->id,
                    'name' => $service->service_name,
                    'basePrice' => 'от '.number_format((float) $service->min_price, 0, ',', ' ').' ₽',
                    'pricingType' => $service->price_type,
                    'description' => $service->description ?? '',
                    'isActive' => $service->is_active,
                ])
                ->values(),
            'vendorRequests' => $vendorRequests,
        ]);
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
