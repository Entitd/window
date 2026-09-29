<?php

namespace App\Services;

use App\Models\Service;
use App\Models\ServiceRequest;
use App\Models\ServiceRequestWarranty;
use App\Models\Vendor;
use App\Models\VendorService;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class WarrantyIssuer
{
    /** @return array{months: int|null, description: string|null, company_name: string, contact_phone: string|null, contact_email: string|null} */
    public function snapshot(VendorService $offering): array
    {
        $vendor = $offering->vendor;

        return [
            'months' => $offering->warranty_months,
            'description' => $vendor->warranty_description,
            'company_name' => $vendor->company_name,
            'contact_phone' => $vendor->phone,
            'contact_email' => $vendor->email,
        ];
    }

    /** @param Collection<int, VendorService> $offerings
     * @return array<string, mixed>
     */
    public function snapshotMany(Collection $offerings): array
    {
        $terms = $this->snapshot($offerings->first());
        if ($offerings->count() === 1) {
            return $terms;
        }
        $services = $offerings->map(fn (VendorService $offering) => [
            'name' => $offering->service_name, 'months' => $offering->warranty_months,
        ])->values()->all();
        $terms['services'] = $services;
        $terms['months'] = $offerings->min('warranty_months');
        $terms['description'] = blank($terms['description']) ? null : $terms['description']."\nОбщий срок гарантии на все работы — ".$terms['months']." мес. Сроки по отдельным работам:\n".
            collect($services)->map(fn ($service) => $service['name'].': '.$service['months'].' мес.')->implode("\n");

        return $terms;
    }

    /** @return array<string, mixed>|null */
    public function snapshotFor(?Vendor $vendor, Service $service): ?array
    {
        $offering = $vendor?->services()->where(function ($query) use ($service): void {
            $query->where('service_id', $service->id)
                ->orWhere(fn ($legacy) => $legacy->whereNull('service_id')->where('service_name', $service->name));
        })->first();

        return $offering ? $this->snapshot($offering) : null;
    }

    public function issue(ServiceRequest $serviceRequest, Vendor $vendor): ServiceRequestWarranty
    {
        $terms = $serviceRequest->warranty_terms ?? [];
        if (empty($terms['months'])) {
            $terms['months'] = $this->snapshotFor($vendor, $serviceRequest->service)['months'] ?? null;
        }
        if (blank($terms['description'] ?? null)) {
            $terms['description'] = $vendor->warranty_description;
        }
        if (empty($terms['months']) || blank($terms['description'])) {
            throw ValidationException::withMessages([
                'warranty' => 'Для выдачи гарантии заполните недостающие условия в профиле компании и срок у услуги. Уже зафиксированные условия заказа останутся прежними.',
            ]);
        }
        if (isset($terms['services']) && ! str_contains($terms['description'], 'Сроки по отдельным работам:')) {
            $terms['description'] .= "\nСроки по отдельным работам:\n".collect($terms['services'])
                ->map(fn ($service) => $service['name'].': '.$service['months'].' мес.')->implode("\n");
        }
        $terms += [
            'company_name' => $vendor->company_name,
            'contact_phone' => $vendor->phone,
            'contact_email' => $vendor->email,
        ];
        $serviceRequest->update(['warranty_terms' => $terms]);
        $warrantyMonths = (int) $terms['months'];

        $startsAt = today();

        return ServiceRequestWarranty::firstOrCreate(
            ['service_request_id' => $serviceRequest->id],
            [
                'vendor_id' => $vendor->id,
                'company_name' => $terms['company_name'],
                'contact_phone' => $terms['contact_phone'] ?? null,
                'contact_email' => $terms['contact_email'] ?? null,
                'starts_at' => $startsAt,
                'expires_at' => $startsAt->copy()->addMonthsNoOverflow($warrantyMonths),
                'description' => $terms['description'],
            ],
        );
    }
}
